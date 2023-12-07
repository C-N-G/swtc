import {useState, useContext} from 'react'
import {Box, Button, Typography, TextField, Stack} from '@mui/material';
import {UserContext} from "../App.jsx";

let NOMINATED_PLAYER = {
  id: 123456,
  name: "Player " + 123456,
  state: 1,
  label: "",
  role: "",
  characteristic: "",
  status: "",
  notes: ""
}

function Vote() {

  const [player, setPlayer] = useState(NOMINATED_PLAYER);
  const [votes, setVotes] = useState({});
  const {
    user,
    setUser
  } = useContext(UserContext);

  function handleVote(playerId, vote) {
    console.log(playerId, vote)
    setVotes(() => {
      return {playerId: vote}
    })
    console.log(votes);
  }

  return (
    <Stack sx={{flexGrow: 1, m: 4}} justifyContent="space-between">
      <Typography variant="h4">{player.name}</Typography>
      <Typography>Nominated by: {user.name}</Typography>
      <TextField 
        id="player-notes"
        label="Player Notes"
        multiline
        rows={7}
        fullWidth
        // value={notes}
        // onChange={(event) => handleChange(id, "notes", event.target.value)}
      />
      <Stack direction="row" justifyContent="space-between">
        <Button variant="contained" onClick={() => {handleVote(user.id, 1)}}>vote for</Button>
        <Button variant="contained" onClick={() => {handleVote(user.id, 0)}}>vote against</Button>
      </Stack>
    </Stack>
  );
}

export default Vote
