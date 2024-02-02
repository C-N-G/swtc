import {useContext, useState, useMemo} from 'react'
import {Card, Typography, Grid, Paper, Checkbox, FormGroup, FormControlLabel, Dialog, 
        DialogActions, DialogContent, DialogTitle, Button, Box, CircularProgress, Switch}from '@mui/material';
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {UserContext} from "../App.jsx";
import GameData from "../GameData.js"
import {socket} from "../socket.js";

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


function PlayerCharacter({user, modules}) {

  const [chars, roles] = useMemo(() => GameData.getFilteredValues(modules), [modules]);

  const fullRole = GameData.roles.find(ele => ele.name === GameData.hackValue(roles[user.rRole]));
  const fullChar = GameData.chars.find(ele => ele.name === GameData.hackValue(chars[user.rChar]));

  return (<>
    <Grid container justifyContent="left" spacing={2}>
      <Grid item xs={6}>
        <Paper elevation={2} sx={{backgroundColor: "lightgreen"}}>
          <Typography variant="h6">State: {GameData.states[user.rState]}</Typography> 
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Paper elevation={2} sx={{backgroundColor: "lightgreen"}}>
          <Typography variant="h6">Status: {GameData.statuses[user.rStatus]}</Typography> 
        </Paper>
      </Grid>
    </Grid>
    <Grid container justifyContent="left" mt={1} spacing={2} sx={{overflow: "auto"}}>
      <Grid item xs textAlign="right">
        <Typography fontWeight={"Bold"}>Role</Typography>
        <Typography fontWeight={"Bold"}>Team</Typography>
      </Grid>
      <Grid item xs textAlign="left">
        <Typography>{GameData.hackValue(roles[user.rRole])}</Typography>
        <Typography>{GameData.teams[user.rTeam]}</Typography> 
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" gutterBottom>{fullRole.Description}</Typography>
        <Typography variant="body2"><Box component="span" fontWeight={"Bold"}>{fullRole.Ability ? "Mechanics: " : ""}</Box>{fullRole.Ability}</Typography>
        {fullRole["additional"].map((ele, index) => <Typography variant="body2" key={fullRole.name + index}>{ele}</Typography>)}
      </Grid>
      <Grid item xs textAlign="right">
        <Typography fontWeight={"Bold"}>Characteristic</Typography> 
      </Grid>
      <Grid item xs textAlign="left">
        <Typography>{GameData.hackValue(chars[user.rChar])}</Typography> 
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" gutterBottom>{fullChar.Description}</Typography>
        <Typography variant="body2"><Box component="span" fontWeight={"Bold"}>{fullChar.Ability ? "Mechanics: " : ""}</Box>{fullChar.Ability}</Typography>
        {fullChar["additional"].map((ele, index) => <Typography variant="body2" key={fullChar.name + index}>{ele}</Typography>)}
      </Grid>
    </Grid>
    {/* <iframe src="https://drive.google.com/file/d/1BSgDm_VNXi-e2_0v5L5Xd781-kFyde7k/preview" style={{flexGrow: 1}} allow="autoplay"></iframe> */}
  </>)

}



function NarratorCharacter({session, modules, setModules, players, setPlayers, autoSync, setAutoSync}) {

  const [modSelOpen, setModSelOpen] = useState(false);
  const [sync, setSync] = useState({progress: false, error: false});

  const [chars, roles] = useMemo(() => GameData.getFilteredValues(modules), [modules]);

  function handleModuleSelection(e) {

    setAutoSync(false);

    const checked = e.target.checked;
    const targetMod = e.target.value;

    let data;

    if (checked === true) {
      data = [...modules, targetMod];
    }

    if (checked === false) {
      data = modules.filter((mod) => mod !== targetMod);
    }

    setModules(data);

  }

  function randomisePlayers() {

    // URGENT TODO - currently when the randomiser button is used it will show everyones true role to the players
    // this needs to be fixed so it won't happen

    setAutoSync(false);
    
    const charsTaken = new Set();
    const rolesTaken = new Set();

    const randomisedPlayers = players.map(player => {

      let randomChar;
      while (typeof randomChar === "undefined") {
        let randomNum = Math.floor(Math.random() * (chars.length - 1) + 1)
        if (charsTaken.has(randomNum) === false) {
          charsTaken.add(randomNum);
          randomChar = randomNum;
        }
        if (players.length > chars.length) {
          randomChar = randomNum;
        }
      }
      player.char = randomChar;
      player.rChar = randomChar;

      let randomRole;
      while (typeof randomRole === "undefined") {
        let randomNum = Math.floor(Math.random() * (roles.length - 1) + 1)
        if (rolesTaken.has(randomNum) === false) {
          rolesTaken.add(randomNum);
          randomRole = randomNum;
        }
        if (players.length > roles.length) {
          randomRole = randomNum;
        }
      }
      player.role = randomRole;
      player.rRole = randomRole;

      return player
    })

    setPlayers(randomisedPlayers);
      
  }

  function syncWithServer() {

    setSync({progress: true, error: false});

    // map will mutate the objects in an array if used the usual way, hence the ({...player})
    const sanitisedPlayers = players.map(({...player}) => {
      player.role = 0;
      player.char = 0;
      return player;
    });

    let syncData = {"players": sanitisedPlayers, "modules": modules};

    socket.timeout(5000).emit("sync", syncData, (error, response) => {

      setSync({...sync, progress: false})

      if (error || response.error) {
        setSync({progress: false, error: true});
        setTimeout(() => {setSync({...sync, error: false})}, 3000);
        if (error) console.log("Sync Error: server timeout");
        if (response.error) console.log("Sync Error:", response.error);
      }

      if (response.status === "ok") {
        setAutoSync(true);
      }

    })


  }

  const allMods = GameData.modules.map(mod => {
    const title = `${mod.name} - ${mod.roles.length} roles - ${mod.chars.length} chars`;
    const checkbox = <Checkbox 
      checked={modules.includes(mod.name)} 
      onChange={handleModuleSelection} 
      value={mod.name} />
    return <FormControlLabel key={mod.name} control={checkbox} label={title} />
  })

  return (<>
    <Typography variant="h6">
      Session ID: {session}
      {/* this doesn't work without https */}
      {/* <IconButton onClick={() => {navigator.clipboard.writeText(session)}}>
        <ContentCopyIcon />
      </IconButton> */}
    </Typography>
    <Button variant="contained" sx={{my: 1}} onClick={() => setModSelOpen(true)}>
      Select Modules ({modules.length})
    </Button>
    <Button variant="contained" sx={{my: 1}} onClick={randomisePlayers}>
      Randomise Players
    </Button>
    <Box sx={{display: "flex", alignItems: "center"}}>
      <Switch 
        color={sync.error ? "error" : "primary"} 
        checked={autoSync}
        onChange={() => {setAutoSync(prev => !prev)}}
        disabled={autoSync ? false : true}
        inputProps={{"aria-label": "autoSync control"}}/>
      <Button 
        variant={sync.progress ? "outlined" : "contained"} 
        color={sync.error ? "error" : "primary"} 
        sx={{my: 1, flexGrow: 1}} 
        onClick={syncWithServer}
      >
        {sync.progress ? <CircularProgress size={24} /> : sync.error ? "Error Syncing" : "Sync"}
      </Button>
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
