import {useState, createContext, useEffect, useCallback} from "react";
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
import "./App.css"

export const UserContext = createContext({});

const PLAYER = new Player(54321, "Player " + 54321, 0);

const somePlayers = [PLAYER];
for (let i = 0; i < 8; i++) {
  let player = new Player(i, "Player " + i);
  somePlayers.push(player);
}

function App() {

  const [players, setPlayers] = useState([]);
  const [userId, setUserId] = useState(null);

  const [phase, setPhase] = useState({cycle: "Night", round: 1});
  const [display, setDisplay] = useState(0);
  const [votes, setVotes] = useState({
    list: [], 
    voting: false, 
    accusingPlayer: null, 
    nominatedPlayer: null,
    userVote: [null, null]
  });
  const [session, setSession] = useState({
    id: null,
    sync: false,
    modules: []

  });
  
  const [isConnected, setIsConnected] = useState(socket.connected);

  const user = players.find(player => player.id === userId); // the users player object
  const drawPlayers = players.filter(player => player.type === 1); // the players to draw on the board e.g. not the narrators

  function handleDragEnd(event) {

    const reminderId = Number(event.active.id.split("_")[1]);
    const originId = Number(event.active.id.split("_")[0]);
    const originIsPlayer = !Number.isNaN(originId);
    const hasTarget = event.over !== null;
    const maxReminders = 5;
    let removeOrigin = false;
    let placeReminder = true;
    let playerId;

    if (!hasTarget && !originIsPlayer) return;

    if (originIsPlayer) removeOrigin = true;

    if (!hasTarget && originIsPlayer) {
      placeReminder = false;
      playerId = originId;
    } else if (hasTarget) {
      playerId = Number(event.over.id.split("_")[1]);
    }

    setPlayers(prev => prev.map(player => {
      if (placeReminder && player.id === playerId) {

        // don't add reminder if the player already has that reminder
        if (player.reminders.some(reminder => reminder.id === reminderId)) return player;
        // don't add reminder if the player has the max reminders
        if (player.reminders.length >= maxReminders) return player;

        const reminder = GameData.reminders.find(reminder => reminder.id === reminderId);
        player.reminders.push(reminder);
      } else if (removeOrigin && player.id === originId) {
        player.reminders = player.reminders.filter(reminder => reminder.id !== reminderId);
      }
      return player;
    }))

  }

  const handlePlayerDataChange = useCallback((targetId, targetProperty, targetValue, fromServer = false) => {

    if (["rRole", "rChar", "rState", "rStatus", "rTeam"].includes(targetProperty) && fromServer === false && session.sync === true) {
      return socket.emit("attribute", {targetId: targetId, targetProperty: targetProperty, targetValue: targetValue});
    }

    setPlayers((prev) => prev.map((player) => {
      if (player.id === targetId) {
        return {...player, [targetProperty]: targetValue};
      } else {
        return player;
      }
    }))

  }, [session])

  useEffect(() => {

    const socketEvents = {

      connect() {
        setIsConnected(true);
      },

      disconnect() {
        setIsConnected(false);
      },

      phase(data) {
        setPhase(data);
      },

      attribute(data) {
        handlePlayerDataChange(data.targetId, data.targetProperty, data.targetValue, true);
      },

      module(data) {
        setSession(session => ({
          ...session,
          modules: data
        }))
      },

      vote(data) {
        if (Object.hasOwn(data, "voting")) {
          setVotes(prev => ({...prev, voting: data.voting}));
          if (data.voting === true) setDisplay(2);
          else setVotes(prev => ({...prev, userVote: [null, null]}));
        }
        
        if (Object.hasOwn(data, "list")){
          if (Array.isArray(data.list)) {
            setVotes(prev => ({...prev, list: data.list, userVote: [null, null]}));
          } else {
            setVotes(prev => ({...prev, list: [...prev.list, data.list]}));
          }
        }
        
        if (Object.hasOwn(data, "accusingPlayer")){
          setVotes(prev => ({...prev, accusingPlayer: data.accusingPlayer}));
        }
        
        if (Object.hasOwn(data, "nominatedPlayer")){
          setVotes(prev => ({...prev, nominatedPlayer: data.nominatedPlayer}));
        }
        
      },

      sync(session, userId) {

        if (session.players) setPlayers(session.players);
        if (session.phase) setPhase(session.phase);
        if (session.votes) setVotes(prev => ({...prev, ...session.votes}));
        if (session.id || session.id === null) setSession(prevSession => ({...prevSession, id: session.id}));
        if (session.modules) setSession(prevSession => ({...prevSession, modules: session.modules}));
        if (userId) setUserId(userId);

      },

    }

    for (const event in socketEvents) {
      socket.on(event, socketEvents[event])
    }

    return () => {
      for (const event in socketEvents) {
        socket.off(event, socketEvents[event])
      }
    };
  }, [handlePlayerDataChange]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
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
          <Board 
            drawPlayers={drawPlayers} 
            display={display} setDisplay={setDisplay}
            votes={votes} setVotes={setVotes} 
            handlePlayerDataChange={handlePlayerDataChange}
            session={session} />
        </Grid>
        <Grid item xs={4}>
          <Character 
            session={session} setSession={setSession}
            players={players} setPlayers={setPlayers} />
          <Chat>
            CHAT W.I.P
            {session.id ? "" : <>
              <Button variant="contained" onClick={() => {
                setUserId(54321);
                setPlayers([...somePlayers]);
                setSession(prevSession => ({
                  ...prevSession,
                  modules: [GameData.modules[0].name]
                }));
              }}>
                Add Dummy Players
              </Button>
              {userId === 54321 ? <>
                <Box>
                  <Button size="small" variant="contained" onClick={() => {
                    setPlayers(players => {
                      const i = players.filter(player => player.type !== 0).length
                      const player = new Player(i, "Player " + i);
                      if (i >= 16) return players;
                      players.push(player);
                      return [...players];
                    });
                  }}>
                    +1
                  </Button>
                  <Button size="small" variant="contained" onClick={() => {
                     setPlayers(players => {
                      if (players.length === 0) return players;
                      players.pop();
                      return [...players];
                    });
                  }}>
                    -1
                  </Button>
                </Box>
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