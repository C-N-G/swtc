import * as React from 'react';
import {Box, Container, Grid, Button, Stack, Typography} from '@mui/material';
import { styled } from '@mui/material/styles';
import {InputLabel, MenuItem, FormControl, Select} from '@mui/material';
// import './App.css'

function App() {

  const PlayerIndicator = styled(Button)({
    width: "14vh",
    height: "14vh",
  });

  const player_config = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [3,1,3],
    [3,1,4],
    [4,1,4],
    [4,1,5],
    [4,2,4],
    [4,2,5],
    [5,2,5],
    [4,3,5],
    [5,3,5]
  ]

  // const offset = -8;

  // let players = offset + 8;

  const [players, setPlayers] = React.useState(8);

  const handleChange = (event) => {
    setPlayers(event.target.value);
  };

  return (
    <Container sx={{maxWidth: "1440px"}}>
      <Grid container>
        <Grid item xs={9}>
          <Box sx={{background: "lightgreen"}}>Phase indicator</Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{background: "lightcoral", minHeight: "10vh"}}>options menu</Box>
        </Grid>
        <Grid item xs={9}>
          <Box sx={{width: "75vh", height: "75vh", background: "lightblue"}}>
            <Stack direction="row" justifyContent="space-between">
              {Array.from(Array(player_config[players][0])).map((_, index) => (
                <PlayerIndicator variant="contained" key={index}>player</PlayerIndicator>
              ))}
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="column" justifyContent="space-evenly">
                {Array.from(Array(player_config[players][1])).map((_, index) => (
                  <PlayerIndicator variant="contained" key={index}>player</PlayerIndicator>
                ))}
              </Stack>
              <Box sx={{
                width: "47vh", 
                height: "47vh", 
                textAlign: "center",
                background: "lightpink"
                }}>
                <Typography>
                    Main area
                </Typography>
                <Box sx={{ maxWidth: 100 }}>
                  <FormControl fullWidth>
                    <InputLabel id="player-select-label">Players</InputLabel>
                    <Select
                      labelId="player-select-label"
                      id="player-select"
                      value={players}
                      label="Players"
                      onChange={handleChange}
                    >
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
                </Box>
              </Box>
              <Stack direction="column" justifyContent="space-evenly">
                {Array.from(Array(player_config[players][1])).map((_, index) => (
                  <PlayerIndicator variant="contained" key={index}>player</PlayerIndicator>
                ))}
              </Stack>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              {Array.from(Array(player_config[players][2])).map((_, index) => (
                <PlayerIndicator variant="contained" key={index}>player</PlayerIndicator>
              ))}
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{background: "darkseagreen", minHeight: "60vh"}}>character widget</Box>
          <Box sx={{background: "lightcyan", minHeight: "25vh"}}>chat widget</Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App
