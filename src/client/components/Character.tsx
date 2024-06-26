import {useContext, useState, useMemo} from 'react'
import {Card, Typography, Grid, Paper, Checkbox, FormControlLabel, Button, Box, CircularProgress, Switch, 
        IconButton, Autocomplete, TextField}from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {UserContext} from "../App.tsx";
import GameData from "../strings/_gameData.ts";
import {socket} from "../helpers/socket.ts";
import Reminder from './Reminder.tsx';
import Draggable from './Draggable.tsx';
import useStore from '../hooks/useStore.ts';
import convertTime from "../helpers/convertTime.ts";
import Player from '../classes/player.ts';
import {default as ReminderType} from '../classes/reminder.ts';
import { OpenCharacterDialog as OpenDialog } from '../helpers/enumTypes.ts';
import ModuleSelectionDialog from './ModuleSelectionDialog.tsx';
import VoteHistoryDialog from './VoteHistoryDialog.tsx';


type CharacterProps = PlayerCharacterProps & NarratorCharacterProps;

function Character(props: CharacterProps) {

  const contextUser = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    const theUser = props.user === undefined && contextUser !== null ? contextUser: props.user;

    if (contextUser?.type === 0) {
      return <NarratorCharacter {...props} user={theUser}/>
    } else if (contextUser?.type === 1) {
      return <PlayerCharacter {...props} user={theUser} />
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



interface PlayerCharacterProps {
  useLocal?: boolean;
  user?: Player;
}

function PlayerCharacter({user, useLocal = false}: PlayerCharacterProps) {

  if (user === undefined) throw new Error("error rendering character window, user is undefined");

  const modules = useStore(state => state.session.modules);
  const [chars, roles] = useMemo(() => GameData.getFullFilteredValues(modules), [modules]);

  let fullChar, fullRole, team;
  if (useLocal) { // use local player state instead of real state
    fullChar = chars[user.char] ? chars[user.char] : GameData.chars[0];
    fullRole = roles[user.role] ? roles[user.role] : GameData.roles[0];
    team = GameData.teams[user.team];
  } else {
    fullChar = chars[user.rChar] ? chars[user.rChar] : GameData.chars[0];
    fullRole = roles[user.rRole] ? roles[user.rRole] : GameData.roles[0];
    team = GameData.teams[user.rTeam];
  }

  return (<>
    <Grid container justifyContent="left" spacing={2} sx={{overflow: "auto"}}>
      <Grid item xs={6}>
        <Paper elevation={2} sx={{backgroundColor: "lightgreen"}}>
          <Typography variant="h6" px={3} ><Box component="span" fontWeight={"Bold"}>State: </Box>{GameData.states[user.rState]}</Typography> 
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Paper elevation={2} sx={{backgroundColor: "lightgreen"}}>
          <Typography variant="h6" px={3}>{user?.name}</Typography> 
        </Paper>
      </Grid>
      <Grid item xs={6} textAlign="right">
        <Typography fontWeight={"Bold"}>Role</Typography>
        <Typography fontWeight={"Bold"}>Team</Typography>
      </Grid>
      <Grid item xs={6} textAlign="left">
        <Typography>{fullRole["name"]}</Typography>
        <Typography>{team}</Typography> 
      </Grid>
      {fullRole["name"] !== "Unknown" && <>
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
        {fullRole["setup"].length > 0 &&
        <Grid item xs={12}>
          <Typography variant="body2" fontWeight={"Bold"}>{fullRole["setup"].length > 0 ? "Role Setup" : ""}</Typography>
          {fullRole["setup"].map((ele, index) => <Typography variant="body2" key={fullRole["name"] + "setup" + index}>{index+1}: {ele[0]}</Typography>)}
        </Grid>}
      </>}
      <Grid item xs={6} textAlign="right">
        <Typography fontWeight={"Bold"}>Characteristic</Typography> 
      </Grid>
      <Grid item xs={6} textAlign="left">
        <Typography>{fullChar["name"]}</Typography> 
      </Grid>
      {fullChar["name"] !== "Unknown" &&
      <Grid item xs={12}>
        <Typography variant="body2" gutterBottom>{"“" + fullChar["description"]  + "”"}</Typography>
        <Typography variant="body2"><Box component="span" fontWeight={"Bold"}>{fullChar["ability"] ? "Ability: " : ""}</Box>{fullChar["ability"]}</Typography>
        {fullChar["additional"].map((ele, index) => <Typography variant="body2" key={fullChar["name"] + index}>{ele}</Typography>)}
      </Grid>}
    </Grid>
    {/* <iframe src="https://drive.google.com/file/d/1BSgDm_VNXi-e2_0v5L5Xd781-kFyde7k/preview" style={{flexGrow: 1}} allow="autoplay"></iframe> */}
  </>)

}





interface OldSessionState {
  players: Player[];
  modules: string[];
}

interface NarratorCharacterProps {
  user?: Player;
}

function NarratorCharacter({user}: NarratorCharacterProps) {

  if (user === undefined) throw new Error("error rendering character window, user is undefined");

  const [openDialog, setOpenDialog] = useState<OpenDialog>(OpenDialog.None);
  const [selectedReminder, setSelectedReminder] = useState<ReminderType | null>(null);
  const [sync, setSync] = useState({progress: false, error: false});
  const [cohesion, setCohesion] = useState(10);
  const [oldSessionState, setOldSessionState] = useState<OldSessionState>({players: [], modules: []});
  const randomisePlayers = useStore(state => state.randomisePlayers);
  const players = useStore(state => state.players);
  const setPlayers = useStore(state => state.setPlayers);

  const modules = useStore(state => state.session.modules);
  const sessionId = useStore(state => state.session.id);
  const sessionSync = useStore(state => state.session.sync);
  const [chars, roles] = useMemo(() => GameData.getFullFilteredValues(modules), [modules]);
  const reminders = useMemo(() => GameData.getFilteredReminders(chars, roles), [chars, roles]);
  const syncOff = useStore(state => state.syncOff);
  const syncOn = useStore(state => state.syncOn);
  const setModules = useStore(state => state.setModules);

  const phaseTimer = useStore(state => state.timers.phaseTimer);
  const startTimer = useStore(state => state.startTimer);
  const stopTimer = useStore(state => state.stopTimer);
  const resetTimer = useStore(state => state.resetTimer);
  

  function storeOldData() {
    if (sessionSync) {
      setOldSessionState({players: JSON.parse(JSON.stringify(players)), modules: [...modules]});
    }
  }

  function handleModuleSelection(e: React.ChangeEvent<HTMLInputElement>) {

    storeOldData();

    const checked = e.target.checked;
    const targetMod = e.target.value;

    let data: string[] = [];

    if (checked === true) {
      data = [...modules, targetMod];
    }

    if (checked === false) {
      data = modules.filter((mod) => mod !== targetMod);
    }

    setModules(data, false);

  }

  function handleRandomise() {

    storeOldData()

    syncOff();

    randomisePlayers(chars, roles);

      
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

    const syncData = {"players": sanitisedPlayers, "modules": modules};

    socket.timeout(5000).emit("sync", syncData, (error, response) => {

      setSync({...sync, progress: false})

      if (error || response.error) {
        setSync({progress: false, error: true});
        setTimeout(() => {setSync({...sync, error: false})}, 3000);
        if (error) console.log("Sync Error: server timeout");
        if (response.error) console.log("Sync Error:", response.error);
      }

      if (response.status === "ok") {
        syncOn();
        const localPlayer = players.find(player => player.id === user!.id);
        if (!localPlayer) throw new Error("error saving local snapshot after syncing, could not find local player");
        localStorage.setItem("lastSession", JSON.stringify({
          players: players,
          sessionId: sessionId,
          playerName: localPlayer.name
        }));
      }

    })


  }

  function handleUndo() {

    setPlayers(oldSessionState.players);

    setModules(oldSessionState.modules, true);

    setOldSessionState({players: [], modules: []});

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
      Session ID: {sessionId}
      {/* this doesn't work without https */}
      <IconButton onClick={() => {navigator.clipboard.writeText(sessionId!)}}>
        <ContentCopyIcon />
      </IconButton>
    </Typography>
    <Button variant="contained" sx={{my: 1}} onClick={() => setOpenDialog(OpenDialog.Module)}>
      Select Modules ({modules.length})
    </Button>
    <Button variant="contained" sx={{my: 1}} onClick={handleRandomise}>
      Randomise Players
    </Button>
    <Box sx={{display: "flex", alignItems: "center"}}>
      <Switch 
        color={sync.error ? "error" : "primary"} 
        checked={typeof sessionSync === "boolean" ? sessionSync : undefined}
        onChange={() => {
          storeOldData();
          syncOff();
        }}
        disabled={sessionSync ? false : true}
        inputProps={{"aria-label": "autoSync control"}}/>
      <Button 
        variant={sync.progress ? "outlined" : "contained"} 
        color={sync.error ? "error" : "primary"} 
        sx={{my: 1, flexGrow: 1}} 
        onClick={syncWithServer}
      >
        {sync.progress ? <CircularProgress size={24} /> : sync.error ? "Error Syncing" : "Sync"}
      </Button>
      {sessionSync === false ? <Button 
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
        groupBy={(option) => option.origin!.name}
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
    <Button variant="contained" sx={{my: 1}} onClick={() => setOpenDialog(OpenDialog.VoteHistory)}>
      Vote History
    </Button>
    <Box sx={{display: "flex", alignItems: "stretch", justifyContent: "space-between", my: 1}}>
      {phaseTimer.state === "stopped" ? 
      <Button sx={{minWidth: "25%"}} variant="contained" onClick={() => startTimer("phaseTimer")}>
        Start
      </Button>
      : 
      <Button sx={{minWidth: "25%"}} variant="contained" onClick={() => stopTimer("phaseTimer")}>
        Stop
      </Button>
      }
      <Button variant="contained" sx={{mx: 1}} onClick={() => resetTimer("phaseTimer")}>
        Reset
      </Button>
      <Paper elevation={2} sx={{
        display: "flex", 
        flexGrow: 1, 
        justifyContent: "center", 
        alignItems: "center",
        backgroundColor: "rgb(25, 118, 210)",
      }}>
        <Typography color={"white"}>Timer: {convertTime(phaseTimer.time)}</Typography>
      </Paper>
    </Box>
      
    <ModuleSelectionDialog 
      openDialog={openDialog}
      setOpenDialog={setOpenDialog}
      allMods={allMods}
    />
      
    <VoteHistoryDialog 
      openDialog={openDialog}
      setOpenDialog={setOpenDialog}
    />

  </>)

}












