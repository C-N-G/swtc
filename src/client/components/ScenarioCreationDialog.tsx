import { Dialog, DialogTitle, DialogContent, FormGroup, DialogActions, Button, Checkbox, FormControlLabel, TextField, Grid, Typography, Divider } from '@mui/material';
import { OpenCharacterDialog as OpenDialog } from '../helpers/enumTypes.ts';
import GameData from '../strings/_gameData.ts';
import Scenario from '../classes/scenario.ts';
import { useState } from 'react';
import Role from '../classes/role.ts';
import hash from '../helpers/hash.ts';
import useStore from '../hooks/useStore.ts';

interface ScenarioCreationDialogProps {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
  newScenario: Scenario; 
  setNewScenario: React.Dispatch<React.SetStateAction<Scenario>>;
}

function ScenarioCreationDialog({openDialog, setOpenDialog, newScenario, setNewScenario}: ScenarioCreationDialogProps) {

  const isNewScenario = newScenario.id === "";
  const dialogName = isNewScenario ? "Create New Scenario" : `Edit Saved Scenario`;

  const scenarios = useStore(state => state.session.scenarios);
  const setScenarios = useStore(state => state.setScenarios);
  const [roleNums, setRoleNums] = useState({agent: 0, detrimental: 0, antagonist: 0})
  const [playerCount, setPlayerCount] = useState("16");
  const playerFormula = Math.floor((0.5 * Number(playerCount)) - 2);
  
  function handleCheckbox(id: number, type: "chars" | "roles", roleType?: "agent" | "detrimental" | "antagonist") {

    let enabledArr = type === "chars" ? newScenario.chars : newScenario.roles

    if (enabledArr.includes(id)) {
      enabledArr = enabledArr.filter(e => e !== id);
      roleType && setRoleNums(prev => ({...prev, [roleType]: prev[roleType] - 1}));
    } else {
      enabledArr.push(id);
      roleType && setRoleNums(prev => ({...prev, [roleType]: prev[roleType] + 1}));
    }

    setNewScenario(scenario => ({...scenario, [type]: enabledArr}));

  }


  function downloadJSON(object: object, fileName: string) {

    const data = JSON.stringify(object, null, 2);
    const link = document.createElement("a");
    link.href = "data:text/json;charset=utf-8;" + "," + encodeURIComponent(data);
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }

  async function handleSave(destination: "file" | "save") {

    const scenarioWithNames = {
      ...newScenario,
      chars: [...newScenario.chars].map(index => GameData.chars[index].name).sort(),
      roles: [...newScenario.roles].map(index => GameData.roles[index].name).sort(),
    }

    const scenarioWithoutId = {
      name: scenarioWithNames.name,
      flavour: scenarioWithNames.flavour,
      chars: scenarioWithNames.chars,
      roles: scenarioWithNames.roles,
    }

    const idHash = await hash(JSON.stringify(scenarioWithNames));

    // just download the json file
    if (destination === "file") return downloadJSON(scenarioWithoutId, scenarioWithoutId.name);

    const savedScenarioJson = localStorage.getItem("savedScenarios");
    let savedScenarios;

    if (savedScenarioJson === null) {
      savedScenarios = {};
    } else {
      savedScenarios = JSON.parse(savedScenarioJson);
    }

    if (!isNewScenario) {
      GameData.scenarios = GameData.scenarios.filter(scenario => scenario.id !== newScenario.id);
      setScenarios([...scenarios.filter(scenario => scenario.id !== newScenario.id)]);
      delete savedScenarios[newScenario.id];
    }

    // save to scenarios now
    GameData.scenarios.push(new Scenario(
      idHash, 
      newScenario.name, 
      newScenario.flavour,
      newScenario.chars.sort(),
      newScenario.roles.sort()
    ));

    // also save to local storage
    savedScenarios[idHash] = scenarioWithoutId;
    console.log("saving scenarios to local storage", savedScenarios)

    localStorage.setItem("savedScenarios", JSON.stringify(savedScenarios));

    handleClose();

  }

  function maxChar(newInput: string, curInput: string, max: number) {
    return newInput.length < max ? newInput : curInput; 
  }

  const createList = (type: "char" | "role", roleType?: "agent" | "detrimental" | "antagonist") => {
    const plural = type === "char" ? "chars" : "roles";
    return GameData[plural]
    .filter(item => {
      if (item.name === "Unknown") return false;
      if (type === "char") return true;
      if (type === "role" && roleType !== undefined && (item as Role).type.toLowerCase() === roleType) return true;
      else return false;
    })
    .map(item => {
      const title = item.name;
      const checkbox = <Checkbox 
        size="small"
        checked={newScenario[plural].includes(item.id)} 
        onChange={() => handleCheckbox(item.id, plural, roleType ? roleType : undefined)} 
        value={item.id} 
        />
      return <FormControlLabel sx={{color: newScenario[plural].includes(item.id) ? "#a61c1c" : "inherit"}} key={item.name} control={checkbox} label={title} />
    })
  }
  
  function handlePlayerCount(playerCount: string) {
    let playerCountNum = Number(playerCount);
    if (playerCountNum <= 0) playerCountNum = 0;
    else if (playerCountNum > 16) playerCountNum = 16;
    setPlayerCount(String(playerCountNum));
  }

  function handleClose() {
    setNewScenario(new Scenario("", "", "", [], []));
    setRoleNums({agent: 0, detrimental: 0, antagonist: 0});
    setPlayerCount("16");
    setOpenDialog(OpenDialog.Scenario);
  }

  const canSave = newScenario.name.length > 0 &&
    newScenario.chars.length >= (Number(playerCount)+2) &&
    roleNums.agent >= (playerFormula + 6) &&
    roleNums.detrimental >= (playerFormula + 2) &&
    roleNums.antagonist >= 1;

  return (
    <Dialog open={openDialog === OpenDialog.CreateScenario} onClose={handleClose}>
      <DialogTitle>{dialogName}</DialogTitle>
      <DialogContent>
        <FormGroup>
          <Grid container spacing={2}>
            <Grid item xs={10} >
              <TextField 
                margin="dense"
                size="small"
                id="new-scenario-name-input"
                label="Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newScenario.name}
                onChange={(e) => {setNewScenario(scenario => ({...scenario, name:  maxChar(e.target.value, scenario.name, 32)}))}}
              />
            </Grid>
            <Grid item xs={2} >
              <TextField
                margin="dense"
                size="small"
                id="new-scenario-player-count-input"
                label="Players"
                type="number"
                fullWidth
                variant="outlined"
                value={playerCount}
                onChange={(e) => {handlePlayerCount(e.target.value)}}
              />
            </Grid>
            <Grid item xs={12} >
              <TextField
                margin="dense"
                size="small"
                id="new-scenario-flavour-input"
                label="Flavour"
                type="text"
                multiline
                maxRows={3}
                fullWidth
                variant="outlined"
                value={newScenario.flavour}
                onChange={(e) => {setNewScenario(scenario => ({...scenario, flavour:  maxChar(e.target.value, scenario.flavour, 200)}))}}
              />
            </Grid>
            
          </Grid>


          <Grid container spacing={2} sx={{justifyContent: "center"}}>
            <Grid item sx={{textAlign: "center"}}>
              <Typography variant="h5">Characteristics ({newScenario.chars.length}/{Number(playerCount)+2})</Typography>
              <Divider />
              {createList("char")}
            </Grid>
            <Grid item sx={{textAlign: "center"}}>
              <Typography variant="h5">Agent Roles ({roleNums.agent}/{playerFormula + 6})</Typography>
              <Divider />
              {createList("role", "agent")}
            </Grid>
            <Grid item sx={{textAlign: "center"}}>
              <Typography variant="h5">Detrimental Roles ({roleNums.detrimental}/{playerFormula + 2})</Typography>
              <Divider />
              {createList("role", "detrimental")}
            </Grid>
            <Grid item sx={{textAlign: "center"}}>
              <Typography variant="h5">Antagonist Roles ({roleNums.antagonist}/1)</Typography>
              <Divider />
              {createList("role", "antagonist")}
            </Grid>
          </Grid>
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" disabled={!canSave} onClick={() => handleSave("file")}>Download JSON</Button>
        <Button variant="outlined" disabled={!canSave} onClick={() => handleSave("save")}>Save</Button>
        <Button variant="outlined" onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ScenarioCreationDialog;