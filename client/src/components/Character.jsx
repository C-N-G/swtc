import {useContext, useState, useMemo} from 'react'
import {Card, Typography, Grid, Paper, Checkbox, FormGroup, FormControlLabel, Dialog, 
        DialogActions, DialogContent, DialogTitle, Button, Box, CircularProgress, Switch, IconButton, Autocomplete, TextField}from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {UserContext} from "../App.jsx";
import GameData from "../strings/_gameData.js";
import {socket} from "../helpers/socket.js";
import randomise from '../helpers/randomiser.js';
import Reminder from './Reminder.jsx';
import Draggable from './Draggable.jsx';

function Character(props) {

  const user = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    if (user?.type === 0) {
      return <NarratorCharacter {...props} />
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


function PlayerCharacter({user, session}) {

  const [chars, roles] = useMemo(() => GameData.getFilteredValues(session.modules), [session.modules]);

  const fullRole = GameData.roles.find(ele => ele.name === GameData.hackValue(roles[user.rRole]));
  const fullChar = GameData.chars.find(ele => ele.name === GameData.hackValue(chars[user.rChar]));

  return (<>
    <Grid container justifyContent="left" spacing={2} sx={{overflow: "auto"}}>
      <Grid item xs={12}>
        <Paper elevation={2} sx={{backgroundColor: "lightgreen"}}>
          <Typography variant="h6" px={3} ><Box component="span" fontWeight={"Bold"}>State: </Box>{GameData.states[user.rState]}</Typography> 
        </Paper>
      </Grid>
      <Grid item xs={6} textAlign="right">
        <Typography fontWeight={"Bold"}>Role</Typography>
        <Typography fontWeight={"Bold"}>Team</Typography>
      </Grid>
      <Grid item xs={6} textAlign="left">
        <Typography>{GameData.hackValue(roles[user.rRole])}</Typography>
        <Typography>{GameData.teams[user.rTeam]}</Typography> 
      </Grid>
      {fullRole["name"] !== "Unknown" ? <>
      <Grid item xs={12}>
        <Typography variant="body2" gutterBottom>{"“" + fullRole["description"] + "”"}</Typography>
        <Typography variant="body2"><Box component="span" fontWeight={"Bold"}>{fullRole["ability"] ? "Ability: " : ""}</Box>{fullRole["ability"]}</Typography>
        {fullRole["additional"].map((ele, index) => <Typography variant="body2" key={fullRole["name"] + "additional" + index}>{ele}</Typography>)}
      </Grid>
      <Grid item xs={6} textAlign="right">
        <Typography fontWeight={"Bold"}>{fullRole["attributes"].length > 0 ? "Attributes" : ""}</Typography> 
      </Grid>
      <Grid item xs={6} textAlign="left">
        <Typography>{fullRole.attributes.join(", ")}</Typography> 
      </Grid>
      {fullRole["setup"].length > 0 ? 
      <Grid item xs={12}>
        <Typography variant="body2" fontWeight={"Bold"}>{fullRole["setup"].length > 0 ? "Role Setup" : ""}</Typography>
        {fullRole["setup"].map((ele, index) => <Typography variant="body2" key={fullRole["name"] + "setup" + index}>{index+1}: {ele[0]}</Typography>)}
      </Grid>
       : ""}
      </> : ""}
      <Grid item xs={6} textAlign="right">
        <Typography fontWeight={"Bold"}>Characteristic</Typography> 
      </Grid>
      <Grid item xs={6} textAlign="left">
        <Typography>{GameData.hackValue(chars[user.rChar])}</Typography> 
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" gutterBottom>{"“" + fullChar["description"]  + "”"}</Typography>
        <Typography variant="body2"><Box component="span" fontWeight={"Bold"}>{fullChar["ability"] ? "Ability: " : ""}</Box>{fullChar["ability"]}</Typography>
        {fullChar["additional"].map((ele, index) => <Typography variant="body2" key={fullChar["name"] + index}>{ele}</Typography>)}
      </Grid>
    </Grid>
    {/* <iframe src="https://drive.google.com/file/d/1BSgDm_VNXi-e2_0v5L5Xd781-kFyde7k/preview" style={{flexGrow: 1}} allow="autoplay"></iframe> */}
  </>)

}



function NarratorCharacter({session, setSession, players, setPlayers}) {

  const [modSelOpen, setModSelOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [sync, setSync] = useState({progress: false, error: false});
  const [cohesion, setCohesion] = useState(10);
  const [oldSessionState, setOldSesionstate] = useState({players: [], modules: []});

  const [chars, roles, reminders] = useMemo(() => GameData.getFilteredValues(session.modules, true), [session.modules]);

  function storeOldData() {
    if (session.sync) {
      setOldSesionstate({players: JSON.parse(JSON.stringify(players)), modules: [...session.modules]});
    }
  }

  function handleModuleSelection(e) {

    storeOldData();

    const checked = e.target.checked;
    const targetMod = e.target.value;

    let data;

    if (checked === true) {
      data = [...session.modules, targetMod];
    }

    if (checked === false) {
      data = session.modules.filter((mod) => mod !== targetMod);
    }

    setSession(prevSession => ({
      ...prevSession,
      sync: false,
      modules: data
    }))

  }

  function randomisePlayers() {

    storeOldData()

    setSession(prevSession => ({
      ...prevSession,
      sync: false,
    }))

    setPlayers(prevPlayers => { 
      try {
        return randomise(prevPlayers, chars, roles);
      } catch (error) {
        console.error("randomiser error: ", error);
        return prevPlayers;
      }
    });
      
  }

  function syncWithServer() {

    setSync({progress: true, error: false});

    // map will mutate the objects in an array if used the usual way, hence the ({...player})
    const sanitisedPlayers = players.map(({...player}) => {
      player.role = 0;
      player.char = 0;
      player.team = 0;
      player.state = 1;
      return player;
    });

    let syncData = {"players": sanitisedPlayers, "modules": session.modules};

    socket.timeout(5000).emit("sync", syncData, (error, response) => {

      setSync({...sync, progress: false})

      if (error || response.error) {
        setSync({progress: false, error: true});
        setTimeout(() => {setSync({...sync, error: false})}, 3000);
        if (error) console.log("Sync Error: server timeout");
        if (response.error) console.log("Sync Error:", response.error);
      }

      if (response.status === "ok") {
        setSession(prevSession => ({
          ...prevSession,
          sync: true,
        }))
      }

    })


  }

  function handleUndo() {

    setPlayers(oldSessionState.players);

    setSession(prevSession => ({
      ...prevSession, 
      sync: !prevSession.sync,
      modules: oldSessionState.modules
    }))

    setOldSesionstate({players: [], modules: []});

  }

  const allMods = GameData.modules.map(mod => {
    const title = `${mod.name} - ${mod.roles.length} roles - ${mod.chars.length} chars`;
    const checkbox = <Checkbox 
      checked={session.modules.includes(mod.name)} 
      onChange={handleModuleSelection} 
      value={mod.name} />
    return <FormControlLabel key={mod.name} control={checkbox} label={title} />
  })

  return (<>
    <Typography variant="h6">
      Session ID: {session.id}
      {/* this doesn't work without https */}
      <IconButton onClick={() => {navigator.clipboard.writeText(session.id)}}>
        <ContentCopyIcon />
      </IconButton>
    </Typography>
    <Button variant="contained" sx={{my: 1}} onClick={() => setModSelOpen(true)}>
      Select Modules ({session.modules.length})
    </Button>
    <Button variant="contained" sx={{my: 1}} onClick={randomisePlayers}>
      Randomise Players
    </Button>
    <Box sx={{display: "flex", alignItems: "center"}}>
      <Switch 
        color={sync.error ? "error" : "primary"} 
        checked={session.sync}
        onChange={() => {
          storeOldData();
          setSession(prevSession => ({...prevSession, sync: !prevSession.sync}))
        }}
        disabled={session.sync ? false : true}
        inputProps={{"aria-label": "autoSync control"}}/>
      <Button 
        variant={sync.progress ? "outlined" : "contained"} 
        color={sync.error ? "error" : "primary"} 
        sx={{my: 1, flexGrow: 1}} 
        onClick={syncWithServer}
      >
        {sync.progress ? <CircularProgress size={24} /> : sync.error ? "Error Syncing" : "Sync"}
      </Button>
      {session.sync === false ? <Button 
        variant="contained"
        sx={{ml: 1}}
        onClick={handleUndo}
      >
        Undo
      </Button> : ""}
    </Box>
    <Box sx={{display: "flex", alignItems: "stretch", my: 1}}>
    <Box 
      sx={{
        mr: 1,
        width: "3rem",
        border: "1px solid rgba(0, 0, 0, 0.25)",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ":hover": {borderColor: "rgba(0, 0, 0, 1)"}
        }}>
      {selectedReminder ? 
        <Box sx={{position: "absolute"}}>
          <Draggable draggableId={"new-|-" + selectedReminder.id}>
          <Reminder reminder={selectedReminder} />
          </Draggable>
        </Box>
      : ""}
      </Box>
      <Autocomplete
        disablePortal
        fullWidth
        id="narrator-reminder-input"
        options={reminders}
        groupBy={(option) => option.origin.name}
        value={selectedReminder}
        onChange={(_, newValue) => setSelectedReminder(newValue)}
        getOptionLabel={(option) => option.description}
        size="small"
        renderInput={(params) => <TextField {...params} label="Add Reminder" />}
      />
    </Box>
    <Box sx={{display: "flex", alignItems: "stretch", justifyContent: "space-between", my: 1}}>
      <Button variant="contained" onClick={() => {setCohesion(prev => prev + 1)}}><AddIcon /></Button>
      <Paper elevation={2} sx={{
        display: "flex", 
        flexGrow: 1, 
        justifyContent: "center", 
        alignItems: "center",
        backgroundColor: "rgb(25, 118, 210)",
        mx: 1
        }}>
        <Typography variant="h6" color={"white"}>Cohesion: {cohesion}</Typography>
      </Paper>
      <Button variant="contained" onClick={() => {setCohesion(prev => prev - 1)}}><RemoveIcon /></Button>
    </Box>

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
