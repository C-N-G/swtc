import {createContext, useEffect} from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {Container, Grid} from "@mui/material";
import {DndContext, DragEndEvent} from "@dnd-kit/core";
import Board from "./components/Board.tsx";
import Phase from "./components/Phase.tsx";
import Options from "./components/Options.tsx";
import Character from "./components/Character.tsx";
import Chat from "./components/Chat.tsx";
import Player from "./classes/player.ts";
import { socket } from "./helpers/socket.ts";

import useStore from "./hooks/useStore.ts";
import "./App.css"
import { ChatActionData, PlayerAttributeData, PlayerVoteData, SessionData, SocketCallbackResponse, TimerData } from "../server/serverTypes.ts";
import Scenario from "./classes/scenario.ts";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      light: '#fa5757',
      main: '#a61c1c',
      dark: '#5e0808',
      contrastText: '#fff',
    },
  },
  components: {
    // Name of the component
    MuiButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          // fontSize: '1rem',
        },
      },
    },
  },
});

export const UserContext = createContext<Player | null>(null);



function App() {

  const handlePlayerDataChange = useStore(state => state.changePlayerAttribute);
  const setPlayers = useStore(state => state.setPlayers);
  const syncPlayers = useStore(state => state.syncPlayers);
  const addPlayer = useStore(state => state.addPlayer);
  const removePlayer = useStore(state => state.removePlayer);
  const getPlayer = useStore(state => state.getPlayer);

  const addPlayerReminders = useStore(state => state.addPlayerReminders);
  const handleDragEnd = (event: DragEndEvent) => addPlayerReminders(event);

  const setUserId = useStore(state => state.setUserId);

  const displayVote = useStore(state => state.displayVote);
  const nextPhase = useStore(state => state.nextPhase);

  const resetSession = useStore(state => state.resetSession);
  const setScenarios = useStore(state => state.setScenarios);
  const syncSession = useStore(state => state.syncSession);

  const setVoting = useStore(state => state.setVoting);
  const resetUserVotes = useStore(state => state.resetUserVotes);
  const addVoteToList = useStore(state => state.addVoteToList);
  const setAccuser = useStore(state => state.setAccuser);
  const setNominated = useStore(state => state.setNominated);
  const setVotes = useStore(state => state.setVotes);

  const setTimer = useStore(state => state.setTimer);
  const startTimer = useStore(state => state.startTimer);
  const stopTimer = useStore(state => state.stopTimer);

  const addChatMessage = useStore(state => state.addChatMessage);
  const createNewChat = useStore(state => state.createNewChat);
  const removeChat = useStore(state => state.removeChat);
  const addMemberToChat = useStore(state => state.addMemberToChat);
  const removeMemberFromChat = useStore(state => state.removeMemberFromChat);
  const syncChats = useStore(state => state.syncChats);
  const addLogMessage = useStore(state => state.addLogMessage);

  const user = useStore(state => state.getUser()); // the users player object


  useEffect(() => {

    const resumeCallback = (error: Error, res: SocketCallbackResponse) => {

      if (error) {
        console.log("ResumeTest Error: server timeout");
        return;
      }

      if (res.status === "error") {
        console.log("ResumeTest:", res.error);
        if (res.error === "no session found") localStorage.removeItem("lastSession");
        else if (res.error === "name not in session") localStorage.removeItem("lastSession");
        // else if (res.error === "name taken") 
      }

      if (res.status === "ok") {
        const seesionItem = localStorage.getItem("lastSession");
        if (seesionItem === null) {
          console.log("error getting session item, could not find session");
          return;
        }
        const lastSession = JSON.parse(seesionItem);
        setPlayers(lastSession.players);
        socket.timeout(5000).emit("join", lastSession.sessionId, lastSession.playerName, lastSession.playerPronouns, joinCallback);
      }

    };

    const joinCallback = (error: Error, res: SocketCallbackResponse) => {

      if (error || res.error) setPlayers([]);

      if (error) return console.log("Resume Error: server timeout");
      if (res.status === "error") return console.log("Resume Error:", res.error);

    };

    function onConnect() {

      const url = window.location.href.slice(-12);
      const hasIdInUrl = url.startsWith("swtc/");
      if (hasIdInUrl) {
        return;
      }

      if (localStorage.getItem("lastSession") === null) {
        return;
      }

      const seesionItem = localStorage.getItem("lastSession");
      if (seesionItem === null) {
        console.log("error getting session item, could not find session");
        return;
      }
      const lastSession = JSON.parse(seesionItem);

      socket.timeout(20000).emit("resume", lastSession.sessionId, lastSession.playerName, resumeCallback);

    }

    function onDisconnect() {
      resetSession();
      setPlayers([])
      setUserId(null);
    }

    function onPhase() {
      nextPhase();
    }

    function onAttribute(data: PlayerAttributeData) {
      handlePlayerDataChange(data.targetId, data.targetProperty, data.targetValue, true);
      if (data.targetProperty === "rState" && data.targetValue === 0) {
        const player = getPlayer(data.targetId);
        addLogMessage(`${player?.name} was found dead`);
      }
    }

    function onScenario(data: Scenario[]) {
      setScenarios(data);
    }

    function onVote(data: PlayerVoteData) {

      if (data.onlyPlayer && user!.type === 0) {
        return;
      }

      if (Object.hasOwn(data, "voting") && data.voting !== undefined) {
        setVoting(data.voting);
        if (data.voting === true) displayVote();
        else resetUserVotes();
      }
      
      if (Object.hasOwn(data, "list")){
        addVoteToList(data.list);
      }
      
      if (Object.hasOwn(data, "accusingPlayer") && data.accusingPlayer !== undefined){
        setAccuser(data.accusingPlayer);
      }
      
      if (Object.hasOwn(data, "nominatedPlayer") && data.nominatedPlayer !== undefined){
        setNominated(data.nominatedPlayer);
      }

      if (data.voting && data.accusingPlayer && data.nominatedPlayer) {
        const accuser = getPlayer(data.accusingPlayer);
        const nominated = getPlayer(data.nominatedPlayer);
        addLogMessage(`${accuser?.name} has nominated ${nominated?.name} for dismissal`);
      }

      if (data.voting === false) {
        addLogMessage(`Dismissal has ended`);
      }
      
    }

    function onTimer(data: TimerData) {

      if (data.action === "set") {
        if (data.duration === undefined) throw new Error("error setting timer, duration is undefined");
        setTimer(data.name, data.duration);
      } else if (data.action === "start") {
        startTimer(data.name);
      } else if (data.action === "stop") {
        stopTimer(data.name);
      }
      
    }

    function onChat(data: ChatActionData) {
      switch (data.action) {
        case "addChatMessage":
          if (data.message) addChatMessage(data.message, data.chatId);
          else throw new Error("error adding empty message");
          break;
        case "createNewChat":
          if (data.members && data.members.length >= 2) createNewChat(data.chatId, data.members);
          else throw new Error("error creating chat with not enough members ")
          break;
        case "removeChat":
          removeChat(data.chatId);
          break;
        case "addMemberToChat":
          if (data.memberId) addMemberToChat(data.chatId, data.memberId);
          break;
        case "removeMemberFromChat":
          if (data.memberId) removeMemberFromChat(data.chatId, data.memberId)
          break;
        default:
          break;
      }
      
    }

    function onSync(session: SessionData, userId: string | null | undefined) {

      if (userId !== undefined) {
        setUserId(userId);
        const index = window.location.href.indexOf("swtc") + 4;
        const newUrl = window.location.href.slice(0, index) + "/";
        history.pushState(null, "swtc game", newUrl);
      }
      syncSession(session);
      if (session.players !== undefined) syncPlayers(session);
      if (session.phase !== undefined) nextPhase(session.phase);
      if (session.votes !== undefined) setVotes(session.votes);
      if (session.timers !== undefined) for (const timerData in session.timers) onTimer(session.timers[timerData]);
      if (session.chats !== undefined) syncChats(session.chats);

    }

    function onJoined(player: Player) {
      addPlayer(player);
      addLogMessage(`${player.name} joined`);
    }

    function onLeft(playerId: string, playerName: string) {
      removePlayer(playerId);
      addLogMessage(`${playerName} left`);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("phase", onPhase);
    socket.on("attribute", onAttribute);
    socket.on("scenario", onScenario);
    socket.on("vote", onVote);
    socket.on("timer", onTimer);
    socket.on("chat", onChat);
    socket.on("sync", onSync);
    socket.on("joined", onJoined);
    socket.on("left", onLeft);

    return () => {

      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("phase", onPhase);
      socket.off("attribute", onAttribute);
      socket.off("scenario", onScenario);
      socket.off("vote", onVote);
      socket.off("timer", onTimer);
      socket.off("chat", onChat);
      socket.off("sync", onSync);
      socket.off("joined", onJoined);
      socket.off("left", onLeft);

    };
  }, [handlePlayerDataChange, setPlayers, syncPlayers, addPlayer, removePlayer, 
    nextPhase, setUserId, displayVote, resetSession, setScenarios, syncSession, 
    setVoting, resetUserVotes, addVoteToList, setAccuser, setNominated, setVotes, 
    startTimer, stopTimer, setTimer, addChatMessage, user, createNewChat, 
    removeChat, addMemberToChat, removeMemberFromChat, syncChats, addLogMessage, 
    getPlayer]);

  return (
    <ThemeProvider theme={darkTheme}>
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
          <Chat />
        </Grid>
      </Grid>
      
    </Container>
    </UserContext.Provider>
    </DndContext>
    </ThemeProvider>
  );
}

export default App