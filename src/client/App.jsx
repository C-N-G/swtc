import {createContext, useEffect} from "react";
// eslint-disable-next-line no-unused-vars
import { createTheme } from "@mui/material/styles";
import {Box, Button, Container, Grid} from "@mui/material";
import {DndContext} from "@dnd-kit/core";
import Board from "./components/Board.jsx";
import Phase from "./components/Phase.jsx";
import Options from "./components/Options.jsx";
import Character from "./components/Character.jsx";
import Chat from "./components/Chat.jsx";
import Player from "./classes/player.js";
import { socket } from "./helpers/socket.js";
import GameData from "./strings/_gameData.js";
import useStore from "./hooks/useStore.js";
import "./App.css"


export const UserContext = createContext({});

const PLAYER = new Player(54321, "Player " + 54321, 0);

const somePlayers = [PLAYER];
for (let i = 0; i < 8; i++) {
  let player = new Player(i, "Player " + i);
  somePlayers.push(player);
}

function App() {

  const handlePlayerDataChange = useStore(state => state.changePlayerAttribute);
  const setPlayers = useStore(state => state.setPlayers);
  const syncPlayers = useStore(state => state.syncPlayers);
  const addPlayer = useStore(state => state.addPlayer);
  const removePlayer = useStore(state => state.removePlayer);
  const pushPlayer = useStore(state => state.pushPlayer);
  const popPlayer = useStore(state => state.popPlayer);
  const addPlayerReminders = useStore(state => state.addPlayerReminders);
  const handleDragEnd = (event) => addPlayerReminders(event);

  const userId = useStore(state => state.userId);
  const setUserId = useStore(state => state.setUserId);
  const toggleDebugUser = useStore(state => state.toggleDebugUser);

  const displayVote = useStore(state => state.displayVote);
  const nextPhase = useStore(state => state.nextPhase);

  const resetSession = useStore(state => state.resetSession);
  const setModules = useStore(state => state.setModules);
  const syncSession = useStore(state => state.syncSession);
  const sessionId = useStore(state => state.session.id);

  // const [votes, setVotes] = useState({
  //   list: [], 
  //   voting: false, 
  //   accusingPlayer: null, 
  //   nominatedPlayer: null,
  //   userVote: [null, null]
  // });
  const setVoting = useStore(state => state.setVoting);
  const resetUserVotes = useStore(state => state.resetUserVotes);
  const addVoteToList = useStore(state => state.addVoteToList);
  const setAccuser = useStore(state => state.setAccuser);
  const setNominated = useStore(state => state.setNominated);
  const setVotes = useStore(state => state.setVotes);

  
  // const [isConnected, setIsConnected] = useState(socket.connected);

  const user = useStore(state => state.getUser()); // the users player object



  

  useEffect(() => {

    const socketEvents = {

      connect() {
        // setIsConnected(true);
      },

      disconnect() {
        // setIsConnected(false);
        resetSession();
        setPlayers([])
        setUserId(null);
      },

      phase() {
        nextPhase();
      },

      attribute(data) {
        handlePlayerDataChange(data.targetId, data.targetProperty, data.targetValue, true);
      },

      module(data) {
        setModules(data);
      },

      vote(data) {
        if (Object.hasOwn(data, "voting")) {
          setVoting(data.voting);
          if (data.voting === true) displayVote();
          else resetUserVotes();
        }
        
        if (Object.hasOwn(data, "list")){
          addVoteToList(data.list);
        }
        
        if (Object.hasOwn(data, "accusingPlayer")){
          setAccuser(data.accusingPlayer);
        }
        
        if (Object.hasOwn(data, "nominatedPlayer")){
          setNominated(data.nominatedPlayer);
        }
        
      },

      sync(session, userId) {

        if (session.players) syncPlayers(session);
        if (session.phase) nextPhase();
        if (session.votes) setVotes(session.votes);
        syncSession(session);
        if (userId) setUserId(userId);

      },

      joined(player) {
        addPlayer(player);
      },

      left(playerId) {
        removePlayer(playerId);
      }

    }

    for (const event in socketEvents) {
      socket.on(event, socketEvents[event])
    }

    return () => {
      for (const event in socketEvents) {
        socket.off(event, socketEvents[event])
      }
    };
  }, [handlePlayerDataChange, setPlayers, syncPlayers, addPlayer, removePlayer, 
    nextPhase, setUserId, displayVote, resetSession, setModules, syncSession, 
    setVoting, resetUserVotes, addVoteToList, setAccuser, setNominated, setVotes]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
    <UserContext.Provider value={user}>
    <Container sx={{maxWidth: "1440px"}}>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Phase />
        </Grid>
        <Grid item xs={4}>
          <Options />
        </Grid>
        <Grid item xs={8}>
          <Board />
        </Grid>
        <Grid item xs={4}>
          <Character />
          <Chat>
            CHAT W.I.P
            {sessionId ? "" : <>
              <Button variant="contained" onClick={() => {
                setUserId("54321");
                setPlayers([...somePlayers]);
                setModules([GameData.modules[2].name]);
              }}>
                Add Dummy Players
              </Button>
              {userId === "54321" || userId === "0" ? <>
                <Box>
                  <Button size="small" variant="contained" onClick={() => pushPlayer()}>
                    +1
                  </Button>
                  <Button size="small" variant="contained" onClick={() => popPlayer()}>
                    -1
                  </Button>
                </Box>
                <Button size="small" variant="contained" onClick={() => toggleDebugUser()}>
                  Change Player Type
                </Button>
              </> : ""}
            </>}

          </Chat>
        </Grid>
      </Grid>
      
    </Container>
    </UserContext.Provider>
    </DndContext>
  );
}

export default App