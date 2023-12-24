import {useState, createContext, useEffect} from "react";
// eslint-disable-next-line no-unused-vars
import { createTheme } from "@mui/material/styles";
import {Container, Grid, Button} from "@mui/material";
import {InputLabel, MenuItem, FormControl, Select} from "@mui/material"; //debug menu
import Board from "./components/Board.jsx";
import Phase from "./components/Phase.jsx";
import Options from "./components/Options.jsx";
import Character from "./components/Character.jsx";
import Chat from "./components/Chat.jsx";
import Player from "./classes/player.js";
import { socket } from "./socket";
import "./App.css"

export const UserContext = createContext({});

const PLAYER = new Player(54321, "Player " + 54321, 1, "Hunter", "Gluttonous", "Normal").data;

const somePlayers = [];
for (let i = 0; i < 16; i++) {
  let player = new Player(i, "Player " + i);
  somePlayers.push(player.data);
}

function App() {

  const [players, setPlayers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [phase, setPhase] = useState({cycle: "Night", round: 1});
  const [display, setDisplay] = useState(false);
  const [votes, setVotes] = useState({list: [], voting: false, accusingPlayer: null, nominatedPlayer: null});
  const [userVote, setUserVote] = useState({0: null, 1: null});
  const [session, setSession] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const user = players.find(player => player.id === userId);

  function handlePlayerDataChange(targetId, targetProperty, targetValue, fromServer = false) {

    if (["rRole", "rChar", "rState", "rStatus"].includes(targetProperty) && fromServer === false) {
      return socket.emit("attribute", {targetId: targetId, targetProperty: targetProperty, targetValue: targetValue});
    }

    setPlayers((prev) => prev.map((player) => {
      if (player.id === targetId) {
        return {...player, [targetProperty]: targetValue};
      } else {
        return player;
      }
    }))

  }

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      socket.emit("join", "Wg97Ev", socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onPhaseChange(data) {
      setPhase(data);
    }

    function onPlayerAttributeChange(data) {
      handlePlayerDataChange(data.targetId, data.targetProperty, data.targetValue, true);
    }

    function onVoteStateChange(data) {
      if (Object.hasOwn(data, "voting")) {
        setVotes((prev) => ({...prev, voting: data.voting}));
        if (data.voting === true) setDisplay(2);
      }
      
      if (Object.hasOwn(data, "list")){
        if (Array.isArray(data.list)) {
          setVotes((prev) => ({...prev, list: data.list, vote: {0: null, 1: null}}));
        } else {
          setVotes((prev) => ({...prev, list: [...prev.list, data.list]}));
        }
      }
      
      if (Object.hasOwn(data, "accusingPlayer")){
        setVotes((prev) => ({...prev, accusingPlayer: data.accusingPlayer}));
      }
      
      if (Object.hasOwn(data, "nominatedPlayer")){
        setVotes((prev) => ({...prev, nominatedPlayer: data.nominatedPlayer}));
      }
      
    }

    function onSyncState(session, userId) {

      setPlayers(session.players);
      setPhase(session.phase);
      setVotes(session.votes);
      setSession(session.id);
      if (userId) {
        setUserId(userId);
      }

    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("phase", onPhaseChange);
    socket.on("attribute", onPlayerAttributeChange);
    socket.on("vote", onVoteStateChange);
    socket.on("sync", onSyncState);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("phase", onPhaseChange);
      socket.off("attribute", onPlayerAttributeChange);
      socket.off("vote", onVoteStateChange);
      socket.off("sync", onSyncState);
    };
  }, []);

  return (
    <UserContext.Provider value={user}>
    <Container sx={{maxWidth: "1440px"}}>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Phase phase={phase} setPhase={setPhase}/>
        </Grid>
        <Grid item xs={4}>
          <Options session={session}/>
        </Grid>
        <Grid item xs={8}>
          <Board players={players} 
            display={display}
            setDisplay={setDisplay}
            votes={votes}
            setVotes={setVotes}
            userVote={userVote}
            setUserVote={setUserVote}
            handleChange={handlePlayerDataChange} />
        </Grid>
        <Grid item xs={4}>
          <Character session={session}/>
          <Chat>
            CHAT W.I.P
            {/* <div>
              <DebugMenu playerNum={playerNum} 
                setPlayerNum={setPlayerNum} 
                setDisplay={setDisplay}
                setUser={setUser} />
            </div> */}
          </Chat>
        </Grid>
      </Grid>
      
    </Container>
    </UserContext.Provider>
  );
}

export default App

function DebugMenu({playerNum, setPlayerNum, setDisplay, setUser}) {

  const STORYTELLER = new Player(54321, "Player " + 54321, 0, "Hunter", "Gluttonous", "Normal").data

  function handleChange() {

    setUser((prev) => {
      if (prev.type === 0) {
        return PLAYER;
      } else {
        return STORYTELLER;
      }
    })

  }
  
  return (
    <Grid container >
      <Grid item width={80}>
        <FormControl fullWidth>
          <InputLabel id="player-select-label">Players</InputLabel>
          <Select
            labelId="player-select-label"
            id="player-select"
            value={playerNum}
            label="Players"
            onChange={(event) => {setPlayerNum(event.target.value)}}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={6}>6</MenuItem>
            <MenuItem value={7}>7</MenuItem>
            <MenuItem value={8}>8</MenuItem>
            <MenuItem value={9}>9</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={11}>11</MenuItem>
            <MenuItem value={12}>12</MenuItem>
            <MenuItem value={13}>13</MenuItem>
            <MenuItem value={14}>14</MenuItem>
            <MenuItem value={15}>15</MenuItem>
            <MenuItem value={16}>16</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item width={80}>
        <Button size="small" variant="contained" onClick={() => {setDisplay(2)}} >
          show vote menu
        </Button>
      </Grid>
      <Grid item width={80}>
        <Button size="small" variant="contained" onClick={() => {handleChange()}} >
          toggle story teller
        </Button>
      </Grid>
    </Grid>
  );
}