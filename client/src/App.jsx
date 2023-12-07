import {useState, createContext} from 'react';
// eslint-disable-next-line no-unused-vars
import { createTheme } from '@mui/material/styles';
import {Box, Container, Grid, Button} from '@mui/material';
import {InputLabel, MenuItem, FormControl, Select} from '@mui/material'; //debug menu
import Board from './components/Board.jsx';
import Phase from "./components/Phase.jsx";
import Options from "./components/Options.jsx";
import Character from "./components/Character.jsx";
import './App.css'

export const UserContext = createContext({});

const PLAYER = {
  id: 54321,
  name: "Player " + 54321,
  state: 1,
  label: "",
  role: "",
  characteristic: "",
  status: "",
  notes: ""
}

function App() {

  const [playerNum, setPlayerNum] = useState(8);
  const [showVote, setShowVote] = useState(true);
  const [user, setUser] = useState(PLAYER);

  return (
    <UserContext.Provider value={{user, setUser}}>
    <Container sx={{maxWidth: "1440px"}}>
      <Grid container>
        <Grid item xs>
          <Phase />
        </Grid>
        <Grid item xs>
          <Options />
        </Grid>
        <Grid item xs>
          <Board playerNum={playerNum} showVote={showVote} />
        </Grid>
        <Grid item xs>
          <Character />
          <Box sx={{
            background: "lightcyan", 
            minHeight: "25vh",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            flexDirection: "column",
            gap: "10px"
          }}>
            CHAT W.I.P & temporary debug menu
            <div>
              <DebugMenu playerNum={playerNum} setPlayerNum={setPlayerNum} setShowVote={setShowVote}/>
            </div>
          </Box>
        </Grid>
      </Grid>
      
    </Container>
    </UserContext.Provider>
  );
}

export default App

function DebugMenu({playerNum, setPlayerNum, setShowVote}) {
  
  return (
    <Box sx={{ width: 75 }}>
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
      <Button variant="contained" onClick={() => {setShowVote((prev) => !prev)}} >
        show vote menu
      </Button>
    </Box>
  );
}