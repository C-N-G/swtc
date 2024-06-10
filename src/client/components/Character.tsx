import {Fragment, useContext, useState, useMemo} from 'react'
import {Card, Typography, Grid, Paper, Checkbox, FormGroup, FormControlLabel, Dialog, 
        DialogActions, DialogContent, DialogTitle, Button, Box, CircularProgress, Switch, 
        IconButton, Autocomplete, TextField, List, ListItem, ListItemText, ListItemButton, Collapse, Tabs, Tab}from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
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
import { VoteHistoryItem } from '../helpers/storeTypes.ts';
import {default as ReminderType} from '../classes/reminder.ts';


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



enum OpenDialog {
  None,
  Module,
  VoteHistory,
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



interface ModuleSelectionDialogProps {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
  allMods: React.ReactNode[];
}

function ModuleSelectionDialog({openDialog, setOpenDialog, allMods}: ModuleSelectionDialogProps) {

  return (
    <Dialog open={openDialog === OpenDialog.Module} onClose={() => setOpenDialog(OpenDialog.None)} >
      <DialogTitle>Select Modules</DialogTitle>
      <DialogContent>
        <FormGroup>
          {allMods}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setOpenDialog(OpenDialog.None)}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}



type StateArray = boolean[];

interface VoteHistoryDialogProps {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
}

function VoteHistoryDialog({openDialog, setOpenDialog}: VoteHistoryDialogProps) {

  const [openState, setOpenState] = useState<StateArray>(Array(32).fill(false));
  const voteHistory = useStore(state => state.voteHistory)
  const round = useStore(state => state.phase.round);
  const [openTab, setOpenTab] = useState(0);

  const tabStyle = {
    borderBottom: 1, 
    borderColor: "divider", 
    mb:2, 
    position: "sticky",
    top: 0,
    zIndex: 1,
    background: "white"
  }

  function handleChange(_: React.SyntheticEvent<Element, Event>, newValue: number) {
    setOpenTab(newValue);
  }

  function handleOpenClick(index: number) {
    setOpenState(state => {
      const newState = !state[index];
      state = state.fill(false);
      state[index] = newState;
      return [...state];
    })
  }

  const todaysVoteHistory = voteHistory.filter(item => item.day === round);
  const yesterdaysVoteHistory = voteHistory.filter(item => item.day === round-1);

  return (
    <Dialog open={openDialog === OpenDialog.VoteHistory} onClose={() => setOpenDialog(OpenDialog.None)} fullWidth >
      <DialogTitle>Voting History</DialogTitle>
      <DialogContent>
        <Box sx={tabStyle}>
          <Tabs value={openTab} onChange={handleChange} variant="fullWidth" >
            <Tab label="Today" />
            <Tab label="Yesterday" />
          </Tabs>
        </Box>
        <Box hidden={openTab !== 0}>
          <VoteHistoryDay 
            historyArray={todaysVoteHistory}
            handleOpenClick={handleOpenClick}
            openState={openState}
          />
        </Box>
        <Box hidden={openTab !== 1}>
          <VoteHistoryDay 
            historyArray={yesterdaysVoteHistory}
            handleOpenClick={handleOpenClick}
            openState={openState}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setOpenDialog(OpenDialog.None)}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}



interface VoteHistoryDayProps {
  historyArray: VoteHistoryItem[];
  handleOpenClick: (index: number) => void;
  openState: StateArray;
}

function VoteHistoryDay({historyArray, handleOpenClick, openState}: VoteHistoryDayProps) {

  const todaysPlayersThatVoted = new Set();
  const todaysMostVotedPlayer: {votes: number, name: string | null} = {votes: 0, name: null};

  const todaysVoteHistory = historyArray.map((item, index) => {

    if (item.voterTotal > todaysMostVotedPlayer.votes) {
      todaysMostVotedPlayer.votes = item.voterTotal;
      todaysMostVotedPlayer.name = item.nominated;
    } else if (item.voterTotal === todaysMostVotedPlayer.votes) {
      todaysMostVotedPlayer.name = null;
    }
  
    const voterList = item.votes.map((aVote, index) => {
      const voted = aVote.vote === 1;
      if (voted) todaysPlayersThatVoted.add(aVote.name);
      const showPower = aVote.power !== 1
      return (
        <Typography key={index} component={"span"} sx={{
          backgroundColor: voted ? "springgreen" : "indianred",
          p: 0.5,
          borderRadius: 1,
          mr: "0.5rem"
        }}>
          {`${aVote.name} ${showPower ? "x" + String(aVote.power) : ""}`}
        </Typography>
      )
    })

    return (
      <Fragment key={index}>
        <ListItem disablePadding >
          <ListItemButton onClick={() => handleOpenClick(index)}>
            {openState[index] ? <ExpandLess /> : <ExpandMore />}
            <ListItemText primary={`#${index+1}. (${item.accuser}) nominated (${item.nominated}) - ${item.voterTotal} vs ${item.abstainerTotal}`} />
          </ListItemButton>
        </ListItem>
        <Collapse in={openState[index]} timeout="auto" unmountOnExit>
          <Typography>{voterList}</Typography>
        </Collapse>
      </Fragment>
    )
  })

  const hasMostVotedPlayer = todaysMostVotedPlayer.name !== null;

  const totalPotentialVoters = historyArray[0]?.votes.length;
  const passedThreshold = todaysMostVotedPlayer !== null ? todaysMostVotedPlayer.votes > Math.ceil(totalPotentialVoters/2) : false;
  const threshold = `${todaysMostVotedPlayer.votes}/${Math.ceil(totalPotentialVoters/2)}`;

  if (!hasMostVotedPlayer) todaysMostVotedPlayer.name = "Inconclusive";
  else todaysMostVotedPlayer.name = "(" + todaysMostVotedPlayer.name + ")";


  return (<>
    <Typography >Most Voted Player: {todaysMostVotedPlayer.name}</Typography>
    {hasMostVotedPlayer ? <Typography >Has enough votes for dismissal? {passedThreshold ? `Yes ${threshold}` : "no"}</Typography> : ""}
    <Typography >Players that have Voted: {Array.from(todaysPlayersThatVoted).join(", ")}</Typography>
    <List>
      {todaysVoteHistory}
    </List>
  </>)
}