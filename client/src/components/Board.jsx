import {useState} from "react";
import {Card, Stack, Typography, Box, Modal, FormControl, Select, InputLabel, MenuItem, Button} from "@mui/material";
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
  [3,1,4], // 9
  [4,1,4], // 10
  [4,1,5], // 11
  [4,2,4], // 12
  [4,2,5], // 13
  [5,2,5], // 14
  [4,3,5], // 15
  [5,3,5], // 16
]

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 250,
  bgcolor: "white",
  borderRadius: "4px",
  boxShadow: 24,
  py: 2,
  px: 4,
};

function Board({players, setPlayers, playerNum, display, setDisplay, voting, setVoting}) {

  const [selected, setSelected] = useState(null);
  const [nominatedPlayer, setNominatedPlayer] = useState(null);
  const [accusingPlayer, setAccusingPlayer]= useState(null);
  const [vote, setVote] = useState({0: {}, 1: {}});
  const [votes, setVotes] = useState([]);
  const [open, setOpen] = useState(false); 

  let topNum = BOARD_CONFIG[playerNum][0];
  let sideNum = BOARD_CONFIG[playerNum][1];
  let botNum = BOARD_CONFIG[playerNum][2];

  function createIndicator(player, index, vertical) {

    return (<PlayerIndicator key={index} 
    {...player}
    handleClick={handlePlayerIndicatorClick}
    vertical={vertical} />)

  }

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
      setSelected(null);
      if (voting) {
        setDisplay(2);
      }
    } else {
      setDisplay(1);
      setSelected(targetId)
    }

  }

  function handleDismissalClick(nominatedPlayerId) {
    setNominatedPlayer(nominatedPlayerId);
    setAccusingPlayer(null);
    setOpen(true);
  }

  function handlePlayerSelect(event) {
    setAccusingPlayer(event.target.value);
  }

  function handleBeginClick() {
    setOpen(false);
    setVoting(true);
    setDisplay(2);
  }

  function handleFinishClick() {
    setVoting(false);
    setNominatedPlayer(null);
    setAccusingPlayer(null);
    setVotes([]);
    setDisplay(0);
  }

  const top = players
  .slice(0, topNum)
  .map((player, index) => (
    createIndicator(player, index, false)
  ));

  const rightside = players
  .slice(topNum, topNum + sideNum)
  .map((player, index) => (
    createIndicator(player, index, true)
  ));

  const bot = players
  .slice(topNum + sideNum, topNum + sideNum + botNum)
  .reverse()
  .map((player, index) => (
    createIndicator(player, index, false)
  ));

  const leftside = players
  .slice(topNum + sideNum + botNum, topNum + (sideNum*2) + botNum)
  .reverse()
  .map((player, index) => (
    createIndicator(player, index, true)
  ));

  const selectablePlayers = players.filter(player => player.id !== nominatedPlayer).map((player, index) => {
    return (<MenuItem key={index} value={player.id}>{player.name}</MenuItem>)
  })

  const voteWindow = (
    <Vote nominatedPlayer={players[nominatedPlayer]} 
      accusingPlayer={players[accusingPlayer]} 
      vote={vote}
      setVote={setVote}
      votes={votes}
      setVotes={setVotes}
      handleChange={handlePlayerDataChange}
      handleFinishClick={handleFinishClick}/>
    )

  const playerdetails = (
    <PlayerDetails { ...players[selected]} 
      handleDismissalClick={handleDismissalClick}
      handleChange={handlePlayerDataChange}/>
  )

  function displayDynamicContent() {

    if (selected !== null && display === 1) {
      return playerdetails;
    } else if (voting && display === 2) {
      return voteWindow;
    } else {
      return false;
    }

  }

  return (
    <Card sx={{
      aspectRatio: "1/1",
      background: "lightblue",
    }}>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="nominating-player-modal-title"
        aria-describedby="nominating-player-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="nominating-player-modal-title" variant="h6" component="h2">
            Player Select
          </Typography>
          <Typography id="nominating-player-modal-description" sx={{ my: 2 }}>
            Please select the player who nominated this player
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="nominating-player-select-label">Player</InputLabel>
            <Select
              labelId="nominating-player-select-label"
              id="nominating-player-select"
              label="Player"
              value={accusingPlayer ? accusingPlayer : ""}
              onChange={handlePlayerSelect}
            >
              {selectablePlayers}
            </Select>
          </FormControl>
          <Button variant="contained" fullWidth sx={{my: 2}} onClick={handleBeginClick}>
            Begin
          </Button>
        </Box>
      </Modal>
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
