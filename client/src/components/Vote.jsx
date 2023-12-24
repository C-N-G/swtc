import {useContext} from "react";
import {Button, Typography, TextField, Stack, Grid, Card, List, ListItem, ListItemText} from '@mui/material';
import {UserContext} from "../App.jsx";
import {socket} from "../socket";

function Vote(props) {

  const user = useContext(UserContext);

  function handleVote(player, aVote) {

    // disallow voting if user has already voted
    if (props.userVote[0] !== props.userVote[1]) {
      return;
    }

    const large = {
      "backgroundColor": "#2f8bf3",
      "transform": "scale(1.15)"
    }

    props.setUserVote((prev) => ({...prev, [aVote]: large}));

    const data = {id: player.id, vote: aVote, name: player.name};

    socket.emit("vote", {list: data});
    
  }



  const getUserTypeCheckedComponent = () => {

    if (user.type === 0) {
      return <StoryTellerVote {...props}/>
    } else if (user.type === 1) {
      return <PlayerVote {...props} handleVote={handleVote} user={user}/>
    } else {
      return false
    }

  }

  return getUserTypeCheckedComponent();


}

export default Vote



function PlayerVote({nominatedPlayer, accusingPlayer, handleChange, userVote, handleVote, user}) {

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
        onChange={(event) => handleChange(nominatedPlayer.id, "notes", event.target.value)}
      />
      <Stack direction="row" justifyContent="space-between">
        <Button 
          disabled={userVote[0] !== userVote[1]} 
          sx={{...userVote[1], transition: "transform 0.25s"}} 
          variant="contained" 
          onClick={() => {handleVote(user, 1)}}
        >
          vote for
        </Button>
        <Button 
          disabled={userVote[0] !== userVote[1]} 
          sx={{...userVote[0], transition: "transform 0.25s"}} 
          variant="contained" 
          onClick={() => {handleVote(user, 0)}}
          >
            vote against
          </Button>
      </Stack>
    </Stack>
  );
}



function StoryTellerVote({nominatedPlayer, accusingPlayer, votes, handleFinishClick}) {

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
