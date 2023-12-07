import {useState, useContext} from "react";
import {Button, Typography, TextField, Stack} from '@mui/material';
import {UserContext} from "../App.jsx";

function Vote({nominatedPlayer, accusingPlayer, handleChange}) {

  const [vote, setVote] = useState({0: {}, 1: {}});
  const user = useContext(UserContext);

  function handleVote(playerId, aVote) {

    setVote(() => {
      let state = {0: {}, 1: {}};
      state[aVote] = {
        "backgroundColor": "#2f8bf3",
        "transform": "scale(1.15)"
      }
      return state;
    });

    // send vote to server
    
  }

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
        <Button sx={{...vote[1], transition: "transform 0.25s"}} variant="contained" onClick={() => {handleVote(user.id, 1)}}>vote for</Button>
        <Button sx={{...vote[0], transition: "transform 0.25s"}} variant="contained" onClick={() => {handleVote(user.id, 0)}}>vote against</Button>
      </Stack>
    </Stack>
  );
}

export default Vote
