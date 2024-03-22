import {useState, useMemo} from "react";
import {Card, Stack, Typography, Box, Modal, FormControl, Select, InputLabel, MenuItem, Button} from "@mui/material";
import PlayerIndicator from "./PlayerIndicator.jsx";
import DynamicWindow from "./DynamicWindow.jsx";
import PlayerDetails from "./PlayerDetails.jsx";
import Vote from "./Vote.jsx";
import {socket} from "../helpers/socket.js";
import GameData from "../strings/_gameData.js"
import useCountDown from "../hooks/useCountDown.js";

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

function Board({drawPlayers, display, setDisplay, votes, setVotes, handlePlayerDataChange, session}) {

  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false); 

  const playerNum = drawPlayers.length;
  const topNum = BOARD_CONFIG[playerNum][0];
  const sideNum = BOARD_CONFIG[playerNum][1];
  const botNum = BOARD_CONFIG[playerNum][2];
  const [chars, roles] = useMemo(() => GameData.getFilteredValues(session.modules), [session.modules]);

  const timerDuration = (Math.max(playerNum, 8)*2) - 1;
  const [time, beginTimer] = useCountDown(timerDuration, handleVoteTimerEnd);

  function createIndicator(player, index, vertical) {

    return (<PlayerIndicator key={index} 
    player={player}
    handleClick={handlePlayerIndicatorClick}
    chars={chars}
    roles={roles}
    vertical={vertical} />)

  }

  function handlePlayerIndicatorClick(targetId) {

    if (display === 1 && targetId === selected) {
      setSelected(null);
      if (votes.voting) {
        setDisplay(2);
      }
    } else {
      setDisplay(1);
      setSelected(targetId)
    }

  }

  function handleDismissalClick(nominatedPlayerId) {
    setVotes(prev => ({...prev, nominatedPlayer: nominatedPlayerId, accusingPlayer: null}));
    setOpen(true);
  }

  function handlePlayerSelect(event) {
    setVotes(prev => ({...prev, accusingPlayer: event.target.value}));
  }

  function handleBeginClick() {
    if (!votes.accusingPlayer) {
      throw new Error("no player selected");
    }
    setOpen(false);
    socket.emit("vote", {nominatedPlayer: votes.nominatedPlayer, accusingPlayer: votes.accusingPlayer, voting: true})
  }

  function handleVoteFinishClick() {
    socket.emit("vote", {list: [], voting: false, accusingPlayer: null, nominatedPlayer: null});
    setDisplay(0);
  }

  function handleVoteStartClick() {
    beginTimer();
  }

  function handleVoteTimerEnd() {
    console.log("done");
  }

  const top = drawPlayers
  .slice(0, topNum)
  .map((player, index) => (
    createIndicator(player, index, false)
  ));

  const rightside = drawPlayers
  .slice(topNum, topNum + sideNum)
  .map((player, index) => (
    createIndicator(player, index, true)
  ));

  const bot = drawPlayers
  .slice(topNum + sideNum, topNum + sideNum + botNum)
  .reverse()
  .map((player, index) => (
    createIndicator(player, index, false)
  ));

  const leftside = drawPlayers
  .slice(topNum + sideNum + botNum, topNum + (sideNum*2) + botNum)
  .reverse()
  .map((player, index) => (
    createIndicator(player, index, true)
  ));

  const selectablePlayers = drawPlayers.filter(player => player.id !== votes.nominatedPlayer).map((player, index) => {
    return (<MenuItem key={index} value={player.id}>{player.name}</MenuItem>)
  })

  const nominatedPlayer = drawPlayers.find(player => player.id === votes.nominatedPlayer);
  const accusingPlayer = drawPlayers.find(player => player.id === votes.accusingPlayer);
  const selectedPlayer = drawPlayers.find(player => player.id === selected);

  const voteWindow = (
    <Vote nominatedPlayer={nominatedPlayer} 
      accusingPlayer={accusingPlayer} 
      setVotes={setVotes}
      votes={votes}
      handlePlayerDataChange={handlePlayerDataChange}
      handleVoteFinishClick={handleVoteFinishClick}
      handleVoteStartClick={handleVoteStartClick}
      time={time}/>
    )

  const playerdetails = (
    <PlayerDetails 
      player={selectedPlayer} 
      handleDismissalClick={handleDismissalClick}
      handlePlayerDataChange={handlePlayerDataChange}
      chars={chars}
      roles={roles}/>
  )

  function displayDynamicContent() {

    if (selected !== null && display === 1 && selectedPlayer) {
      return playerdetails;
    } else if (votes.voting && display === 2) {
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
              value={votes.accusingPlayer ? votes.accusingPlayer : ""}
              onChange={handlePlayerSelect} 
            >
              {selectablePlayers}
            </Select>
          </FormControl>
          <Button disabled={votes.accusingPlayer === null} variant="contained" fullWidth sx={{my: 2}} onClick={handleBeginClick}>
            Begin
          </Button>
        </Box>
      </Modal>
      <Stack sx={{minHeight: "20%"}} direction="row" justifyContent="space-between">
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

