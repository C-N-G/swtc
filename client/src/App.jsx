// import * as React from 'react';
import {Box, Container, Grid} from '@mui/material';
import Board from './components/Board.jsx';
import Phase from "./components/Phase.jsx";
import Options from "./components/Options.jsx";
import Character from "./components/Character.jsx";
import './App.css'

function App() {

  return (
    <Container sx={{maxWidth: "1440px"}}>
      <Grid container>
        <Grid item xs>
          <Phase />
        </Grid>
        <Grid item xs>
          <Options />
        </Grid>
        <Grid item xs>
          <Board />
        </Grid>
        <Grid item xs>
          <Character />
          <Box sx={{
            background: "lightcyan", 
            minHeight: "25vh",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
            }}>
              CHAT W.I.P
            </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App
