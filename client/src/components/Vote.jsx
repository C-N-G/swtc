import {useContext} from "react";
import {Button, Typography, TextField, Stack, Grid, Card, List, ListItem, ListItemText} from '@mui/material';
import {UserContext} from "../App.jsx";
import {socket} from "../helpers/socket";

function Vote(props) {

  const user = useContext(UserContext);

  function handleVote(player, aVote) {

    // disallow voting if user has already voted
    if (props.votes.userVote[0] !== props.votes.userVote[1]) {
      return;
    }

    const large = {
      "backgroundColor": "#2f8bf3",
      "transform": "scale(1.15)"
    }

    props.setVotes(prev => ({
      ...prev,
      userVote: prev.userVote.map((_, index) => {
        return index === aVote ? large : null;
      })
    }));

    const data = {id: player.id, vote: aVote, name: player.name};

    socket.emit("vote", {list: data});
    
  }



  const getUserTypeCheckedComponent = () => {

    if (user.type === 0) {
      return <NarratorVote {...props}/>
    } else if (user.type === 1) {
      return <PlayerVote {...props} handleVote={handleVote} user={user}/>
    } else {
      return false
    }

  }

  return getUserTypeCheckedComponent();


}

export default Vote



function PlayerVote({nominatedPlayer, accusingPlayer, votes, handlePlayerDataChange, handleVote, user}) {

  return (
    <Stack sx={{flexGrow: 1, m: 4}} justifyContent="space-between">
      <Typography variant="h4">{nominatedPlayer.name}</Typography>
      <Typography>Nominated by: {accusingPlayer.name}</Typography>
      <TextField 
        id="player-notes"
        label="Player Notes"
        multiline
        rows={7}
        fullWidth
        value={nominatedPlayer.notes}
        onChange={(event) => handlePlayerDataChange(nominatedPlayer.id, "notes", event.target.value)}
      />
      <Stack direction="row" justifyContent="space-between">
        <Button 
          disabled={votes.userVote[0] !== votes.userVote[1]} 
          sx={{...votes.userVote[1], transition: "transform 0.25s"}} 
          variant="contained" 
          onClick={() => {handleVote(user, 1)}}
        >
          vote for
        </Button>
        <Button 
          disabled={votes.userVote[0] !== votes.userVote[1]} 
          sx={{...votes.userVote[0], transition: "transform 0.25s"}} 
          variant="contained" 
          onClick={() => {handleVote(user, 0)}}
          >
            vote against
          </Button>
      </Stack>
    </Stack>
  );
}



function NarratorVote({nominatedPlayer, accusingPlayer, votes, handleFinishClick}) {

  const forVotes = votes.list?.filter(aVote => aVote.vote === 1).map((aVote, index) => {
    return (
      <ListItem key={index}>
        <ListItemText primary={aVote.name}/>
      </ListItem>
    )
  })

  const againstVotes = votes.list?.filter(aVote => aVote.vote === 0).map((aVote, index) => {
    return (
      <ListItem key={index}>
        <ListItemText primary={aVote.name}/>
      </ListItem>
    )
  })

  return (
    <Grid container sx={{flexGrow: 1, m: 1, position: "relative"}}>
      <Button variant="contained" onClick={handleFinishClick} sx={{
        position: "absolute",
        right: "0%"
      }}>
        Finish
      </Button>
      <Grid item xs={12} height="12%">
        <Typography variant="h4">{nominatedPlayer.name}</Typography>
      </Grid>
      <Grid item xs={12} height="8%">
        <Typography>Nominated by: {accusingPlayer.name}</Typography>
      </Grid>
      <Grid item xs={6} height="80%" sx={{display: "flex", flexDirection: "column", p: 1}}>
        <Typography>{forVotes.length} Voted For</Typography>
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
        <Typography>{againstVotes.length} Voted Against</Typography>
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
