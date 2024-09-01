import { Dialog, DialogTitle, DialogContent, FormGroup, DialogActions, Button, Checkbox, FormControlLabel, TextField, Grid, Typography, Divider } from '@mui/material';
import { OpenCharacterDialog as OpenDialog } from '../helpers/enumTypes.ts';
import GameData from '../strings/_gameData.ts';
import Scenario from '../classes/scenario.ts';
import { useState } from 'react';
import Role from '../classes/role.ts';
import hash from '../helpers/hash.ts';

interface ScenarioCreationDialogProps {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
  scenario?: Scenario; 
}

function ScenarioCreationDialog({openDialog, setOpenDialog, scenario}: ScenarioCreationDialogProps) {

  const [newScenario, setNewScenario] = useState<Scenario>(scenario ? scenario : new Scenario("", "", "", [], []))
  const [roleNums, setRoleNums] = useState({agent: 0, detrimental: 0, antagonist: 0})
  
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

  async function handleSave(destination: "file" | "browser") {

    const scenarioWithNames = {
      ...newScenario,
      chars: [...newScenario.chars].map(index => GameData.chars[index].name).sort(),
      roles: [...newScenario.roles].map(index => GameData.roles[index].name).sort(),
    }

    const idHash = await hash(JSON.stringify(scenarioWithNames));

    GameData.scenarios.push(new Scenario(
      idHash, 
      newScenario.name, 
      newScenario.flavour,
      newScenario.chars.sort(),
      newScenario.roles.sort()
    ))

    if (destination === "file") {
      downloadJSON(scenarioWithNames, scenarioWithNames.name);
    } else if (destination === "browser") {
      console.log(GameData.scenarios)
    }

    setOpenDialog(OpenDialog.Scenario);

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

  return (
    <Dialog open={openDialog === OpenDialog.CreateScenario} onClose={() => setOpenDialog(OpenDialog.None)} >
      <DialogTitle>Create New Scenario</DialogTitle>
      <DialogContent>
        <FormGroup>
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
          <Grid container spacing={2} sx={{justifyContent: "center"}}>
            <Grid item sx={{textAlign: "center"}}>
              <Typography variant="h5">Characteristics ({newScenario.chars.length}/18)</Typography>
              <Divider />
              {createList("char")}
            </Grid>
            <Grid item sx={{textAlign: "center"}}>
              <Typography variant="h5">Agent Roles ({roleNums.agent}/12)</Typography>
              <Divider />
              {createList("role", "agent")}
            </Grid>
            <Grid item sx={{textAlign: "center"}}>
              <Typography variant="h5">Detrimental Roles ({roleNums.detrimental}/8)</Typography>
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
        <Button variant="outlined" onClick={() => setOpenDialog(OpenDialog.None)}>Load From JSON</Button>
        <Button variant="outlined" disabled={newScenario.name.length === 0} onClick={() => handleSave("file")}>Save to File</Button>
        <Button variant="outlined" disabled={newScenario.name.length === 0} onClick={() => handleSave("browser")}>Save to Browser</Button>
        <Button variant="outlined" onClick={() => setOpenDialog(OpenDialog.None)}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ScenarioCreationDialog;