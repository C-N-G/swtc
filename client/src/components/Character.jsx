import { useContext, useState } from 'react'
import {Card, Typography, Grid, Paper, Checkbox, FormGroup, FormControlLabel, Dialog, DialogActions, DialogContent, DialogTitle, Button}from '@mui/material';
import {UserContext} from "../App.jsx";
import {STATES, ROLES, CHARS, STATUSES} from "../data.js";
import GameData from "../GameData.js"

function Character(props) {

  const user = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    if (user?.type === 0) {
      return <StoryTellerCharacter {...props} />
    } else if (user?.type === 1) {
      return <PlayerCharacter user={user} {...props} />
    } else {
      return false
    }

  }

  return (
    <Card sx={{
      background: "darkseagreen", 
      width: "100%",
      height: "70%",
      display: "flex", 
      textAlign: "center", 
      flexDirection: "column",
      boxSizing: "border-box",
      p: 2,
    }}>
      {getUserTypeCheckedComponent()}
    </Card>
  );
}

export default Character


function PlayerCharacter({user}) {

  return (<>
      <Grid container justifyContent="left" mb={2} spacing={2}>
      <Grid item xs={6}>
        <Paper elevation={2} sx={{backgroundColor: "lightgreen"}}>
          <Typography variant="h6">State: {STATES[user.rState]}</Typography> 
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Paper elevation={2} sx={{backgroundColor: "lightgreen"}}>
          <Typography variant="h6">Status: {STATUSES[user.rStatus]}</Typography> 
        </Paper>
      </Grid>
      <Grid item xs textAlign="right">
        <Typography>Role</Typography> 
        <Typography>Characteristic</Typography> 
        <Typography>Team</Typography> 
      </Grid>
      <Grid item xs textAlign="left">
        <Typography fontWeight={600}>{ROLES[user.rRole]}</Typography> 
        <Typography fontWeight={600}>{CHARS[user.rChar]}</Typography> 
        <Typography fontWeight={600}>{user.team === 0 ? "Loyalist" : "Subversive"}</Typography> 
      </Grid>
    </Grid>
    <iframe src="https://drive.google.com/file/d/1BSgDm_VNXi-e2_0v5L5Xd781-kFyde7k/preview" style={{flexGrow: 1}} allow="autoplay"></iframe>
  </>)

}



function StoryTellerCharacter({session, modules, setModules}) {

  const [modSelOpen, setModSelOpen] = useState(false);

  function handleModuleSelection(e) {

    const checked = e.target.checked;
    const targetMod = e.target.value;
    if (checked === true) {
      setModules(prev => [...prev, targetMod]);
    }

    if (checked === false) {
      setModules(prev => prev.filter((mod) => mod !== targetMod));
    }



  }

  const allMods = GameData.modules.map(mod => {
    const title = `${mod.Name} - ${mod.roles.length} roles - ${mod.chars.length} chars`;
    const checkbox = <Checkbox 
      checked={modules.includes(mod.Name)} 
      onChange={handleModuleSelection} 
      value={mod.Name} />
    return <FormControlLabel key={mod.Name} control={checkbox} label={title} />
  })

  return (<>
    <Typography variant="h6">Session Id: {session}</Typography>
    <Button variant="contained" onClick={() => setModSelOpen(true)}>
      Select Modules
    </Button>
    <Dialog open={modSelOpen} onClose={() => setModSelOpen(false)} >
      <DialogTitle>Select Modules</DialogTitle>
      <DialogContent>
        <FormGroup>
          {allMods}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => setModSelOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  </>)

}
