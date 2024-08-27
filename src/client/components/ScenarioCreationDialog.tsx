import { Dialog, DialogTitle, DialogContent, FormGroup, DialogActions, Button, Checkbox, FormControlLabel, TextField, Grid, Typography, Divider } from '@mui/material';
import { OpenCharacterDialog as OpenDialog } from '../helpers/enumTypes.ts';
import GameData from '../strings/_gameData.ts';
import Scenario from '../classes/scenario.ts';
import { useState } from 'react';
import Role from '../classes/role.ts';

interface ScenarioCreationDialogProps {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
  scenario?: Scenario; 
}

function ScenarioCreationDialog({openDialog, setOpenDialog, scenario}: ScenarioCreationDialogProps) {

  const [newScenario, setNewScenario] = useState<Scenario>(scenario ? scenario : new Scenario(0, "", "", [], []))
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

  function handleSave() {
    console.log(newScenario)
  }

  function maxChar(newInput: string, curInput: string, max: number) {
    return newInput.length < max ? newInput : curInput; 
  }

  // const allChars = GameData.chars.filter(char => char.name !== "Unknown").map(char => {
  //   const title = char.name;
  //   const checkbox = <Checkbox 
  //     size="small"
  //     checked={newScenario.chars.includes(char.id)} 
  //     onChange={() => handleCheckbox(char.id, "chars")} 
  //     value={char.id} 
  //     />
  //   return <FormControlLabel sx={{color: newScenario.chars.includes(char.id) ? "#a61c1c" : "inherit"}} key={char.name} control={checkbox} label={title} />
  // })

  // const allRoles = GameData.roles.filter(role => role.name !== "Unknown").map(role => {
  //   const title = role.name;
  //   const checkbox = <Checkbox 
  //     size="small"
  //     checked={newScenario.roles.includes(role.id)} 
  //     onChange={() => handleCheckbox(role.id, "roles")} 
  //     value={role.id} 
  //     />
  //   return <FormControlLabel sx={{color: newScenario.roles.includes(role.id) ? "#a61c1c" : "inherit"}} key={role.name} control={checkbox} label={title} />
  // })

  const createList = (type: "char" | "role", roleType?: "agent" | "detrimental" | "antagonist") => {
    const plural = type === "char" ? "chars" : "roles";
    return GameData[plural]
    .filter(item => {
      if (item.name === "Unknown") return false;
      if (type === "char") return true;
      if (type === "role" && roleType !== undefined && (item as Role).type.toLowerCase() === roleType) return true;
      else return false;
      return item.name !== "Unknown" && (type === "role" && roleType !== undefined) ? (item as Role).type.toLowerCase() === roleType : true
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
              <Typography variant="h5">Characteristics ({newScenario.chars.length}/20)</Typography>
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
        <Button variant="outlined" onClick={() => handleSave()}>Save</Button>
        <Button variant="outlined" onClick={() => setOpenDialog(OpenDialog.None)}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ScenarioCreationDialog;