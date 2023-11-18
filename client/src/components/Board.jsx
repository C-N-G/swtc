import {useState} from 'react';
import {Box, Stack} from '@mui/material';
import PlayerIndicator from "./PlayerIndicator.jsx";
import DynamicWindow from "./DynamicWindow.jsx";

function Board() {

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

  const [players, setPlayers] = useState(8);

  const handleChange = (event) => {
    setPlayers(event.target.value);
  };

  return (
    <Box sx={{width: '80vh', height: '80vh', background: 'lightblue'}}>
      <Stack direction="row" justifyContent="space-between">
        {Array.from(Array(player_config[players][0])).map((_, index) => (
          <PlayerIndicator key={index} />
        ))}
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="column" justifyContent="space-evenly">
          {Array.from(Array(player_config[players][1])).map((_, index) => (
            <PlayerIndicator key={index} />
          ))}
        </Stack>
        <DynamicWindow 
          handleChange={handleChange} 
          players={players}
        />
        <Stack direction="column" justifyContent="space-evenly">
          {Array.from(Array(player_config[players][1])).map((_, index) => (
            <PlayerIndicator key={index} />
          ))}
        </Stack>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        {Array.from(Array(player_config[players][2])).map((_, index) => (
          <PlayerIndicator key={index} />
        ))}
      </Stack>
    </Box>
  );
}

export default Board
