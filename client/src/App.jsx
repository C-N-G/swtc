import {useState, createContext, useEffect} from "react";
// eslint-disable-next-line no-unused-vars
import { createTheme } from "@mui/material/styles";
import {Container, Grid} from "@mui/material";
import Board from "./components/Board.jsx";
import Phase from "./components/Phase.jsx";
import Options from "./components/Options.jsx";
import Character from "./components/Character.jsx";
import Chat from "./components/Chat.jsx";
import Player from "./classes/player.js";
import { socket } from "./socket";
import "./App.css"

export const UserContext = createContext({});

const PLAYER = new Player(54321, "Player " + 54321, 0).data;

const somePlayers = [PLAYER];
for (let i = 0; i < 8; i++) {
  let player = new Player(i, "Player " + i);
  somePlayers.push(player.data);
}

function App() {

  const [players, setPlayers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modules, setModules] = useState([]);
  // const [players, setPlayers] = useState(somePlayers);
  // const [userId, setUserId] = useState(54321);
  // const [modules, setModules] = useState(["Standard Procedure"]);

  const [phase, setPhase] = useState({cycle: "Night", round: 1});
  const [display, setDisplay] = useState(false);
  const [votes, setVotes] = useState({list: [], voting: false, accusingPlayer: null, nominatedPlayer: null});
  const [userVote, setUserVote] = useState({0: null, 1: null});
  const [session, setSession] = useState(null);
  
  const [isConnected, setIsConnected] = useState(socket.connected);

  const user = players.find(player => player.id === userId);
  const drawPlayers = players.filter(player => player.type === 1);

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

    function onModuleChange(data) {
      setModules(data);
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

      if (session.players) setPlayers(session.players);
      if (session.phase) setPhase(session.phase);
      if (session.votes) setVotes(session.votes);
      if (session.id) setSession(session.id);
      if (session.modules) setModules(session.modules);
      if (userId) setUserId(userId);

    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("phase", onPhaseChange);
    socket.on("attribute", onPlayerAttributeChange);
    socket.on("vote", onVoteStateChange);
    socket.on("sync", onSyncState);
    socket.on("module", onModuleChange);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("phase", onPhaseChange);
      socket.off("attribute", onPlayerAttributeChange);
      socket.off("vote", onVoteStateChange);
      socket.off("sync", onSyncState);
      socket.off("module", onModuleChange);
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
          <Board drawPlayers={drawPlayers} 
            display={display}
            setDisplay={setDisplay}
            votes={votes}
            setVotes={setVotes}
            userVote={userVote}
            setUserVote={setUserVote}
            handleChange={handlePlayerDataChange}
            modules={modules} />
        </Grid>
        <Grid item xs={4}>
          <Character 
            session={session}
            modules={modules}
            players={players}/>
          <Chat>
            CHAT W.I.P
          </Chat>
        </Grid>
      </Grid>
      
    </Container>
    </UserContext.Provider>
  );
}

export default App