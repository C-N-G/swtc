import {useState, useMemo} from "react";
import {Card, Stack, MenuItem, SelectChangeEvent} from "@mui/material";
import PlayerIndicator from "./PlayerIndicator.tsx";
import DynamicWindow from "./DynamicWindow.tsx";
import PlayerDetails from "./PlayerDetails.tsx";
import Vote from "./Vote.tsx";
import {socket} from "../helpers/socket.ts";
import GameData from "../strings/_gameData.ts"
import useCountDown from "../hooks/useCountDown.ts";
import useStore from "../hooks/useStore.ts";
import Player from "../classes/player.ts";
import config from "../../appConfig.ts";
import { OpenBoardDialog as OpenDialog } from "../helpers/enumTypes.ts";
import ViewPlayerDialog from "./ViewPlayerDialog.tsx";
import DismissalDialog from "./DismissalDialog.tsx";

function Board() {

  const [openDialog, setOpenDialog] = useState<OpenDialog>(OpenDialog.None); 

  const drawPlayers = useStore(state => state.getDrawPlayers());
  const playerNum = drawPlayers.length;
  const topNum = config.board_config[playerNum][0];
  const sideNum = config.board_config[playerNum][1];
  const botNum = config.board_config[playerNum][2];
  const modules = useStore(state => state.session.modules);
  const [chars, roles] = useMemo(() => GameData.getFilteredValues(modules), [modules]);
  const [fullChars, fullRoles] = useMemo(() => GameData.getFullFilteredValues(modules), [modules]);

  const timerDuration = (Math.max(playerNum, 8)*2) - 1;
  const [time, beginTimer, resetTimer] = useCountDown(timerDuration, handleVoteTimerEnd);

  const display = useStore(state => state.display);
  const displayNone = useStore(state => state.displayNone);
  const displayDetails = useStore(state => state.displayDetails);
  const displayVote = useStore(state => state.displayVote);

  const selected = useStore(state => state.selected);
  const selectPlayer = useStore(state => state.selectPlayer);

  const voting = useStore(state => state.votes.voting);
  const accusingPlayerId = useStore(state => state.votes.accusingPlayer);
  const nominatedPlayerId = useStore(state => state.votes.nominatedPlayer);
  const setAccuser = useStore(state => state.setAccuser);
  const setNominated = useStore(state => state.setNominated);
  const addVotesToHistory = useStore(state => state.addVotesToHistory);

  function createIndicator(player: Player, index: number, vertical: boolean) {

    return <PlayerIndicator key={index} 
    display={display}
    selected={selected}
    player={player}
    handleClick={handlePlayerIndicatorClick}
    chars={fullChars}
    roles={fullRoles}
    vertical={vertical} />

  }

  function handlePlayerIndicatorClick(targetId: string) {

    if (display === 1 && targetId === selected) {
      if (voting) {
        displayVote();
      } else {
        displayNone()
      }
    } else {
      displayDetails();
      selectPlayer(targetId);
    }

  }

  function handleDismissalClick(nominatedPlayerId: string) {
    setNominated(nominatedPlayerId, null);
    setOpenDialog(OpenDialog.Dismiss);
  }

  function handlePlayerSelect(event: SelectChangeEvent<string>) {
    setAccuser(event.target.value);
  }

  function handleBeginClick() {

    if (!accusingPlayerId) {
      throw new Error("no player selected");
    }
    setOpenDialog(OpenDialog.None);
    // make all players abstain my default
    const votes = drawPlayers
    .filter(player => player.rState === 1)
    .map(player => ({id: player.id, vote: 0, name: player.name, power: player.rVotePower}))
    socket.emit("vote", {list: votes, nominatedPlayer: nominatedPlayerId, accusingPlayer: accusingPlayerId, voting: true})

    // set vote timer
    socket.timeout(5000).emit("timer", {name: "voteTimer", action: "set", duration: timerDuration}, (error, response) => {
      if (error) return console.log("Timer Error: server timeout");
      if (response?.error) return console.log("Timer Error:", response.error);
    });

  }

  function handleVoteFinishClick() {
    addVotesToHistory();
    socket.timeout(5000).emit("timer", {name: "voteTimer", action: "stop"}, (error, response) => {
      if (error) return console.log("Timer Error: server timeout");
      if (response?.error) return console.log("Timer Error:", response.error);
    });
    socket.emit("vote", {list: [], voting: false, accusingPlayer: null, nominatedPlayer: null});
    displayNone();
    resetTimer();
  }

  function handleVoteTimerEnd() {
    socket.timeout(5000).emit("timer", {name: "voteTimer", action: "stop"}, (error, response) => {
      if (error) return console.log("Timer Error: server timeout");
      if (response?.error) return console.log("Timer Error:", response.error);
    });
    socket.emit("vote", {list: [], voting: false, accusingPlayer: null, nominatedPlayer: null, onlyPlayer: true});
  }

  function handleViewPlayerClick() {
    setOpenDialog(OpenDialog.ViewPlayer);
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

  const selectablePlayers = drawPlayers.map((player, index) => {
    const nominated = player.id === nominatedPlayerId;
    const name = nominated ? `${player.name} < nominated player` : player.name;
    return (<MenuItem key={index} value={player.id}>{name}</MenuItem>);
  })

  const nominatedPlayer = drawPlayers.find(player => player.id === nominatedPlayerId);
  const accusingPlayer = drawPlayers.find(player => player.id === accusingPlayerId);
  const selectedPlayer = drawPlayers.find(player => player.id === selected);

  const voteWindow = nominatedPlayer && accusingPlayer ? (
    <Vote nominatedPlayer={nominatedPlayer} 
      accusingPlayer={accusingPlayer} 
      handleVoteFinishClick={handleVoteFinishClick}
      time={time} beginTimer={beginTimer}/>
    ) : null;

  const playerdetails = selectedPlayer ? (
    <PlayerDetails 
      player={selectedPlayer} 
      handleDismissalClick={handleDismissalClick}
      handleViewPlayerClick={handleViewPlayerClick}
      chars={chars}
      roles={roles}/>
  ) : null;

  const viewPlayerDialog = selectedPlayer ? (
    <ViewPlayerDialog 
      openDialog={openDialog} 
      setOpenDialog={setOpenDialog}
      player={selectedPlayer}
    />
  ) : null;

  function displayDynamicContent() {

    if (selected !== null && display === 1 && selectedPlayer) {
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
      background: "var(--sl-color-gray-5)", 
    }}>
      <DismissalDialog 
        openDialog={openDialog} 
        setOpenDialog={setOpenDialog} 
        handlePlayerSelect={handlePlayerSelect} 
        selectablePlayers={selectablePlayers} 
        handleBeginClick={handleBeginClick}
      />
      {viewPlayerDialog}
      <Stack sx={{minHeight: "20%"}} direction="row" justifyContent="space-between">
        {top}
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Stack width="20%" direction="column" justifyContent="space-evenly">
          {leftside}
        </Stack>
        <DynamicWindow display={display}>
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







