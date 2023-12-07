import {useState} from "react";
import {Box, Stack} from '@mui/material';
import PlayerIndicator from "./PlayerIndicator.jsx";
import DynamicWindow from "./DynamicWindow.jsx";
import PlayerDetails from "./PlayerDetails.jsx";
import Vote from "./Vote.jsx";

const BOARD_CONFIG = [
  [0,0,0], // top, sides, bottom - player count
  [1,0,0], // 1
  [2,0,0], // 2
  [2,0,1], // 3
  [2,0,2], // 4
  [2,0,3], // 5
  [2,1,2], // 6
  [2,1,3], // 7
  [3,1,3], // 8
  [3,1,4],
  [4,1,4],
  [4,1,5],
  [4,2,4],
  [4,2,5],
  [5,2,5],
  [4,3,5],
  [5,3,5], // 16
]

const somePlayers = [];

for (let i = 0; i < 16; i++) {
  somePlayers.push({
    id: i,
    name: "Player " + i,
    state: 1,
    label: "",
    role: "",
    characteristic: "",
    status: "",
    notes: ""
  });
}

function Board({playerNum, showVote}) {


  const [players, setPlayers] = useState(somePlayers);
  const [selected, setSelected] = useState(undefined);
  const [display, setDisplay] = useState(false);

  let topNum = BOARD_CONFIG[playerNum][0];
  let sideNum = BOARD_CONFIG[playerNum][1];
  let botNum = BOARD_CONFIG[playerNum][2];

  const top = players.slice(0, topNum).map((player, index) => (
    <PlayerIndicator key={index} id={player.id} name={player.name} label={player.label} handleClick={handlePlayerIndicatorClick} /> 
  ));

  const leftside = players.slice(topNum, topNum + sideNum).map((player, index) => (
    <PlayerIndicator key={index} id={player.id} name={player.name} label={player.label} handleClick={handlePlayerIndicatorClick} /> 
  ));

  const rightside = players.slice(topNum + sideNum, topNum + (sideNum*2)).map((player, index) => (
    <PlayerIndicator key={index} id={player.id} name={player.name} label={player.label} handleClick={handlePlayerIndicatorClick} /> 
  ));

  const bot = players.slice(topNum + (sideNum*2), topNum + (sideNum*2) + botNum).map((player, index) => (
    <PlayerIndicator key={index} id={player.id} name={player.name} label={player.label} handleClick={handlePlayerIndicatorClick} /> 
  ));


  function handlePlayerDataChange(targetId, targetProperty, targetValue) {

    setPlayers(players.map((player) => {
      if (player.id === targetId) {
        return {...player, [targetProperty]: targetValue};
      } else {
        return player;
      }
    }))

  }

  function handlePlayerIndicatorClick(targetId) {

    if (targetId === selected) {
      setDisplay((prev) => !prev);
    } else {
      setDisplay(true);
      setSelected(targetId)
    }

  }

  function displayDynamicContent() {

    if (showVote) {
      return (<Vote />)
    } else if (selected != undefined) {
      return (<PlayerDetails { ...players[selected]} handleChange={handlePlayerDataChange}/>)
    } else {
      return false;
    }

  }

  return (
    <Box sx={{width: '80vh', height: '80vh', background: 'lightblue'}}>
      <Stack direction="row" justifyContent="space-between">
        {top}
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="column" justifyContent="space-evenly">
          {leftside}
        </Stack>
        <DynamicWindow display={display}>
          {displayDynamicContent()}
        </DynamicWindow>
        <Stack direction="column" justifyContent="space-evenly">
          {rightside}
        </Stack>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        {bot}
      </Stack>
    </Box>
  );
}

export default Board
