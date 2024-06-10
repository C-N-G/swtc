import {useContext} from "react";
import {Button, Typography, TextField, Stack, Grid, Card, List, ListItem, ListItemText, Paper} from '@mui/material';
import {UserContext} from "../App.jsx";
import {socket} from "../helpers/socket";
import useStore from "../hooks/useStore.js";

function Vote(props) {

  const user = useContext(UserContext);


  const getUserTypeCheckedComponent = () => {

    if (user?.type === 0) {
      return <NarratorVote {...props}/>
    } else if (user?.type === 1) {
      return <PlayerVote {...props} user={user}/>
    } else {
      return false
    }

  }

  return getUserTypeCheckedComponent();


}

export default Vote



function PlayerVote({nominatedPlayer, accusingPlayer, user}) {

  const handlePlayerDataChange = useStore(state => state.changePlayerAttribute);
  const userVote = useStore(state => state.votes.userVote);
  const setUserVote = useStore(state => state.setUserVote);
  const voteTimer = useStore(state => state.timers.voteTimer);

  const playerIsDead = user.rState === 0

  function handleVote(player, aVote) {

    // disallow voting if user has already voted
    // if (userVote[0] !== userVote[1]) {
    //   return;
    // }

    setUserVote(aVote);

    const data = {id: player.id, vote: aVote, name: player.name, power: player.rVotePower};

    socket.emit("vote", {list: data});
    
  }

  const nominatedName = nominatedPlayer?.name ? nominatedPlayer.name : "Unknown";
  const accusingName = accusingPlayer?.name ? accusingPlayer.name : "Unknown";

  return (
    <Stack sx={{flexGrow: 1, m: 4}} justifyContent="space-between">
      <Typography variant="h4">{nominatedName}</Typography>
      <Typography>Nominated by: {accusingName}</Typography>
      <TextField 
        id="player-notes"
        label="Player Notes"
        multiline
        rows={7}
        fullWidth
        value={nominatedPlayer?.notes}
        onChange={(event) => handlePlayerDataChange(nominatedPlayer?.id, "notes", event.target.value)}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button 
          disabled={voteTimer.state === "stopped" || playerIsDead} 
          sx={{...userVote[1], transition: "transform 0.25s"}} 
          variant="contained" 
          onClick={() => {handleVote(user, 1)}}
        >
          Vote For
        </Button>
        <Paper sx={{
          background: voteTimer.state === "stopped" ? "rgb(200,100,100)" : "rgb(100,200,100)", 
          p:1,
          minWidth: "3rem"
        }}>
          <Typography variant="h5">{voteTimer.time}</Typography>
        </Paper>
        <Button 
          disabled={voteTimer.state === "stopped" || playerIsDead} 
          sx={{...userVote[0], transition: "transform 0.25s"}} 
          variant="contained" 
          onClick={() => {handleVote(user, 0)}}
        >
          Abstain
        </Button>
      </Stack>
    </Stack>
  );
}



function NarratorVote({nominatedPlayer, accusingPlayer, handleVoteFinishClick, time, beginTimer}) {

  function handleVoteStartClick() {
    beginTimer();
    socket.timeout(5000).emit("timer", {name: "voteTimer", action: "start"}, (error, response) => {
      if (error) console.log("Timer Error: server timeout");
      if (response?.error) console.log("Timer Error:", response.error);
    });
  }

  const list = useStore(state => state.votes.list);

  const voters = list.filter(aVote => aVote.vote === 1);
  const voterTotal = voters.reduce((acc, cur) => acc + cur.power, 0)
  const voterList = voters.map((aVote, index) => {
    return (
      <ListItem sx={{py: 0}} key={index}>
        <ListItemText primary={`${aVote.name} ${aVote.power !== 1 ? "x" + String(aVote.power) : ""}`}/>
      </ListItem>
    )
  })

  const abstainers = list.filter(aVote => aVote.vote === 0);
  const abstainerTotal = abstainers.reduce((acc, cur) => acc + cur.power, 0)
  const abstainerList = abstainers.map((aVote, index) => {
    return (
      <ListItem sx={{py: 0}} key={index}>
        <ListItemText primary={`${aVote.name} ${aVote.power !== 1 ? "x" + String(aVote.power) : ""}`}/>
      </ListItem>
    )
  })

  const nominatedName = nominatedPlayer?.name ? nominatedPlayer.name : "Unknown";
  const accusingName = accusingPlayer?.name ? accusingPlayer.name : "Unknown";

  return (
    <Grid container sx={{flexGrow: 1, m: 1, position: "relative"}}>
      <Button variant="contained" onClick={handleVoteFinishClick} sx={{
        position: "absolute",
        right: "0%"
      }}>
        Finish
      </Button>
      <Button variant="contained" onClick={handleVoteStartClick} sx={{
        position: "absolute",
        left: "0%"
      }}>
        {"Start"} {time}
      </Button>
      <Grid item xs={12} height="12%">
        <Typography variant="h4">{nominatedName}</Typography>
      </Grid>
      <Grid item xs={12} height="8%">
        <Typography>Nominated by: {accusingName}</Typography>
      </Grid>
      <Grid item xs={6} height="80%" sx={{display: "flex", flexDirection: "column", p: 1}}>
        <Typography>{voterTotal} Voted</Typography>
        <Card sx={{flexGrow: "1", backgroundColor: "springgreen"}}>
          <List sx={{
            overflow: "auto",
            maxHeight: "100%",
            p: 0
          }}>
            {voterList}
          </List>
        </Card>
      </Grid>
      <Grid item xs={6} height="80%" sx={{display: "flex", flexDirection: "column", p: 1}}>
        <Typography>{abstainerTotal} Abstained</Typography>
        <Card sx={{flexGrow: "1", backgroundColor: "indianred"}}>
          <List sx={{
            overflow: "auto",
            maxHeight: "100%",
            p: 0
          }}>
            {abstainerList}
          </List>
        </Card>
      </Grid>
    </Grid>
  );
}
