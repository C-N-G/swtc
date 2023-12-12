import {useState, createContext} from 'react';
// eslint-disable-next-line no-unused-vars
import { createTheme } from '@mui/material/styles';
import {Container, Grid, Button} from '@mui/material';
import {InputLabel, MenuItem, FormControl, Select} from '@mui/material'; //debug menu
import Board from './components/Board.jsx';
import Phase from "./components/Phase.jsx";
import Options from "./components/Options.jsx";
import Character from "./components/Character.jsx";
import Chat from "./components/Chat.jsx";
import Player from "./classes/player.js";
import './App.css'

export const UserContext = createContext({});

const PLAYER = new Player(54321, "Player " + 54321, 1, "Hunter", "Gluttonous", "Normal").data;

const somePlayers = [];
for (let i = 0; i < 16; i++) {
  let player = new Player(i, "Player " + i);
  somePlayers.push(player.data);
}

function App() {

  const [playerNum, setPlayerNum] = useState(8);
  const [players, setPlayers] = useState(somePlayers);
  const [user, setUser] = useState(PLAYER);
  const [phase, setPhase] = useState({cycle: "Night", round: 1});
  const [display, setDisplay] = useState(false);
  const [voting, setVoting] = useState(false);

  return (
    <UserContext.Provider value={user}>
    <Container sx={{maxWidth: "1440px"}}>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Phase phase={phase} setPhase={setPhase}/>
        </Grid>
        <Grid item xs={4}>
          <Options />
        </Grid>
        <Grid item xs={8}>
          <Board players={players} 
            setPlayers={setPlayers} 
            playerNum={playerNum} 
            display={display}
            setDisplay={setDisplay}
            voting={voting}
            setVoting={setVoting} />
        </Grid>
        <Grid item xs={4}>
          <Character />
          <Chat>
            CHAT W.I.P & temporary debug menu
            <div>
              <DebugMenu playerNum={playerNum} 
                setPlayerNum={setPlayerNum} 
                setDisplay={setDisplay}
                setUser={setUser} />
            </div>
          </Chat>
        </Grid>
      </Grid>
      
    </Container>
    </UserContext.Provider>
  );
}

export default App

function DebugMenu({playerNum, setPlayerNum, setDisplay, setUser}) {

  const STORYTELLER = new Player(54321, "Player " + 54321, 1, "Hunter", "Gluttonous", "Normal").data

  function handleChange() {

    setUser((prev) => {
      if (prev.type === 1) {
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