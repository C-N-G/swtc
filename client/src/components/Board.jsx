import {useState} from "react";
import {Card, Stack} from '@mui/material';
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

function Board({players, setPlayers, playerNum, display, setDisplay}) {

  const [selected, setSelected] = useState(undefined);

  let topNum = BOARD_CONFIG[playerNum][0];
  let sideNum = BOARD_CONFIG[playerNum][1];
  let botNum = BOARD_CONFIG[playerNum][2];

  const createIndicator = (player, index, vertical) => {
    return (<PlayerIndicator key={index} 
    id={player.id} 
    name={player.name} 
    label={player.label} 
    handleClick={handlePlayerIndicatorClick}
    vertical={vertical} />)
  }

  const top = players.slice(0, topNum).map((player, index) => (
    createIndicator(player, index, false)
  ));

  const leftside = players.slice(topNum, topNum + sideNum).map((player, index) => (
    createIndicator(player, index, true)
  ));

  const rightside = players.slice(topNum + sideNum, topNum + (sideNum*2)).map((player, index) => (
    createIndicator(player, index, true)
  ));

  const bot = players.slice(topNum + (sideNum*2), topNum + (sideNum*2) + botNum).map((player, index) => (
    createIndicator(player, index, false)
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

    if (display === 1 && targetId === selected) {
      setDisplay(0);
    } else {
      setDisplay(1);
      setSelected(targetId)
    }

  }

  const voteWindow = (
    <Vote nominatedPlayer={players[1]} 
      accusingPlayer={players[0]} 
      handleChange={handlePlayerDataChange}/>
    )

  const playerdetails = (
    <PlayerDetails { ...players[selected]} 
      handleChange={handlePlayerDataChange}/>
  )

  function displayDynamicContent() {

    if (display === 2) {
      return voteWindow;
    } else if (selected != undefined) {
      return playerdetails;
    } else {
      return false;
    }

  }

  return (
    <Card sx={{
      aspectRatio: "1/1",
      background: 'lightblue',
    }}>
      <Stack direction="row" justifyContent="space-between">
        {top}
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Stack width="20%" direction="column" justifyContent="space-evenly">
          {leftside}
        </Stack>
        <DynamicWindow width="60%" display={display}>
          {displayDynamicContent()}
        </DynamicWindow>
        <Stack width="20%" direction="column" justifyContent="space-evenly">
          {rightside}
        </Stack>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        {bot}
      </Stack>
    </Card>
  );
}

export default Board
