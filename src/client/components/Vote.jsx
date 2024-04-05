import {useContext} from "react";
import {Button, Typography, TextField, Stack, Grid, Card, List, ListItem, ListItemText} from '@mui/material';
import {UserContext} from "../App.jsx";
import {socket} from "../helpers/socket";
import useStore from "../hooks/useStore.js";

function Vote(props) {

  const user = useContext(UserContext);


  const getUserTypeCheckedComponent = () => {

    if (user.type === 0) {
      return <NarratorVote {...props}/>
    } else if (user.type === 1) {
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

  console.log(voteTimer);

  function handleVote(player, aVote) {

    // disallow voting if user has already voted
    // if (userVote[0] !== userVote[1]) {
    //   return;
    // }

    setUserVote(aVote);

    const data = {id: player.id, vote: aVote, name: player.name};

    socket.emit("vote", {list: data});
    
  }

  const nominatedName = nominatedPlayer?.name ? nominatedPlayer.name : "Unknown";
  const accusingName = accusingPlayer?.name ? accusingPlayer.name : "Unknown";

  return (
    <Stack sx={{flexGrow: 1, m: 4, position: "relative"}} justifyContent="space-between">
      <Typography  sx={{position: "absolute", left: "-5%", top: "-5%"}}>
        {"Vote Timer:"} {voteTimer.time}
      </Typography>
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
      <Stack direction="row" justifyContent="space-between">
        <Button 
          disabled={voteTimer.state === "stopped" || playerIsDead} 
          sx={{...userVote[1], transition: "transform 0.25s"}} 
          variant="contained" 
          onClick={() => {handleVote(user, 1)}}
        >
          Vote For
        </Button>
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

  const forVotes = list.filter(aVote => aVote.vote === 1).map((aVote, index) => {
    return (
      <ListItem sx={{py: 0}} key={index}>
        <ListItemText primary={aVote.name}/>
      </ListItem>
    )
  })

  const againstVotes = list.filter(aVote => aVote.vote === 0).map((aVote, index) => {
    return (
      <ListItem sx={{py: 0}} key={index}>
        <ListItemText primary={aVote.name}/>
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
        <Typography>{forVotes.length} Voted</Typography>
        <Card sx={{flexGrow: "1", backgroundColor: "springgreen"}}>
          <List sx={{
            overflow: "auto",
            maxHeight: "100%",
            p: 0
          }}>
            {forVotes}
          </List>
        </Card>
      </Grid>
      <Grid item xs={6} height="80%" sx={{display: "flex", flexDirection: "column", p: 1}}>
        <Typography>{againstVotes.length} Abstained</Typography>
        <Card sx={{flexGrow: "1", backgroundColor: "indianred"}}>
          <List sx={{
            overflow: "auto",
            maxHeight: "100%",
            p: 0
          }}>
            {againstVotes}
          </List>
        </Card>
      </Grid>
    </Grid>
  );
}

