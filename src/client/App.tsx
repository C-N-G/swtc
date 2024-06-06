import {createContext, useEffect} from "react";
// eslint-disable-next-line no-unused-vars
import { createTheme } from "@mui/material/styles";
import {Box, Button, Container, Grid} from "@mui/material";
import {DndContext} from "@dnd-kit/core";
import Board from "./components/Board.tsx";
import Phase from "./components/Phase.js";
import Options from "./components/Options.js";
import Character from "./components/Character.js";
import Chat from "./components/Chat.js";
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

  const setVoting = useStore(state => state.setVoting);
  const resetUserVotes = useStore(state => state.resetUserVotes);
  const addVoteToList = useStore(state => state.addVoteToList);
  const setAccuser = useStore(state => state.setAccuser);
  const setNominated = useStore(state => state.setNominated);
  const setVotes = useStore(state => state.setVotes);

  const setTimer = useStore(state => state.setTimer);
  const startTimer = useStore(state => state.startTimer);
  const stopTimer = useStore(state => state.stopTimer);

  const user = useStore(state => state.getUser()); // the users player object
  

  useEffect(() => {

    const resumeCallback = (error, res) => {

      if (error) return console.log("ResumeTest Error: server timeout");
      if (res.status === "error") {
        console.log("ResumeTest:", res.error);
        if (res.error === "no session found") localStorage.removeItem("lastSession");
        else if (res.error === "name not in session") localStorage.removeItem("lastSession");
        // else if (res.error === "name taken") 
      }

      if (res.status === "ok") {
        const lastSession = JSON.parse(localStorage.getItem("lastSession"));
        setPlayers(lastSession.players);
        socket.timeout(5000).emit("join", lastSession.sessionId, lastSession.playerName, joinCallback);
      }

    };

    const joinCallback = (error, res) => {

      if (error || res.error) setPlayers([]);

      if (error) return console.log("Resume Error: server timeout");
      if (res.status === "error") return console.log("Resume Error:", res.error);

    };

    const socketEvents = {

      connect() {

        if (localStorage.getItem("lastSession") === null) return;

        const lastSession = JSON.parse(localStorage.getItem("lastSession"));

        socket.timeout(20000).emit("resume", lastSession.sessionId, lastSession.playerName, resumeCallback);

      },

      disconnect() {
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

        if (data.onlyPlayer && user.type === 0) {
          return;
        }

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

      timer(data) {

        if (data.action === "set") {
          setTimer(data.name, data.duration);
        } else if (data.action === "start") {
          startTimer(data.name);
        } else if (data.action === "stop") {
          stopTimer(data.name);
        }
        
      },

      sync(session, userId) {

        if (userId !== undefined) setUserId(userId);
        syncSession(session);
        if (session.players !== undefined) syncPlayers(session);
        if (session.phase !== undefined) nextPhase(session.phase);
        if (session.votes !== undefined) setVotes(session.votes);
        if (session.timers !== undefined) for (const timerData in session.timers) socketEvents.timer(session.timers[timerData]);

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
    setVoting, resetUserVotes, addVoteToList, setAccuser, setNominated, setVotes, 
    startTimer, stopTimer, setTimer, user]);

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