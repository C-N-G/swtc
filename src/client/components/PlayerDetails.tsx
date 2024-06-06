import {useContext, useState} from "react";
import {Box, Typography, Button, Grid, TextField, Autocomplete, Stack, Chip, 
  Select, MenuItem, InputLabel, FormControl, FormControlLabel, Switch} from '@mui/material';
import {UserContext} from "../App.js";
import GameData from "../strings/_gameData.js"
import Reminder from "./Reminder.js";
import useStore from "../hooks/useStore.js";

function PlayerDetails(props) {

  const user = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    if (user?.type === 0) {
      return <NarratorDetails {...props}/>
    } else if (user?.type === 1) {
      return <RegularPlayerDetails {...props} />
    } else {
      return false
    }

  }

  return getUserTypeCheckedComponent();

}

export default PlayerDetails



function RegularPlayerDetails({player, handleViewPlayerClick, chars, roles}) {

  const handlePlayerDataChange = useStore(state => state.changePlayerAttribute);

  function selectBuilder(playerId, type, list, value) {
    return <Autocomplete
      disablePortal
      disableClearable
      id={`player-${type.toLowerCase()}-input`}
      size="small"
      options={list}
      renderInput={(params) => <TextField {...params} label={type} />}
      value={GameData.hackValue(list[value])} // hack - this is for when the modules change and the current value no longer exists
      onChange={(_, newValue) => handlePlayerDataChange(playerId, type.toLowerCase(), list.indexOf(newValue))}
    />
  }


  return (
    <Grid container>
      <Grid item xs={5}>
        <Stack>
          <Box position={"relative"}>
          <Typography variant="h5" sx={{marginTop: "1rem"}}>
            {player.name}
          </Typography>
          <Typography variant="caption" sx={{
              position: "absolute",
              top: "98%",
              left: "50%",
              transform: "translate(-50%, -50%)"
              }}
          >
            ({GameData.states[player.rState]})
          </Typography>
          </Box>
          <TextField sx={{margin: "1rem"}}
            id="player-label-input"
            label="Quick Label"
            multiline
            rows={4}
            size="small"
            value={player.label}
            onChange={(event) => {
              if (event.target.value.length > 100) return;
              else return handlePlayerDataChange(player.id, "label", event.target.value);
            }}
          />
          <Button variant="outlined" sx={{marginLeft: "1rem", marginRight: "1rem"}}>Talk (W.I.P)</Button>
        </Stack>
      </Grid>
      <Grid item xs={7}>
        <Stack spacing={2} sx={{mx: "1rem", mb: "0", mt: "1.3rem"}}>
          {selectBuilder(player.id, "Role", roles, player.role)}
          {selectBuilder(player.id, "Char", chars, player.char)}
          {selectBuilder(player.id, "Team", GameData.teams, player.team)}
          <Button variant="outlined" onClick={handleViewPlayerClick}>View Player</Button>
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{maxWidth: "100%", mx: "1rem"}}>
          <TextField 
              id="player-notes"
              label="Player Notes"
              multiline
              rows={6}
              fullWidth
              value={player.notes}
              onChange={(event) => {
                if (event.target.value.length > 5000) return;
                else return handlePlayerDataChange(player.id, "notes", event.target.value);
              }}
            />
        </Box>
      </Grid>
    </Grid>
  );

}



function NarratorDetails({player, handleDismissalClick, chars, roles}) {

  const [showTrueState, setShowTrueState] = useState(false);

  const handleChange = useStore(state => state.changePlayerAttribute);

  const leftVal = "Shown";
  const rightVal = "True"

  function selectBuilder(playerId, type, real, list, value, handleChange) {
    return <Autocomplete
      disablePortal
      disableClearable
      id={`narrator-${real ? leftVal : rightVal}-${type.toLowerCase()}-input`}
      size="small"
      options={list}
      renderInput={(params) => <TextField {...params} label={`${real ? leftVal : rightVal} ${type}`} />}
      value={list[value] ? list[value] : list[0]} // hack - this is for when the modules change and the current value no longer exists
      onChange={(_, newValue) => handleChange(playerId, `${real ? "r" : ""}${real ? type : type.toLowerCase()}`, list.indexOf(newValue))}
    />
  }

  const shownInputs = [
    selectBuilder(player.id, "State", true, GameData.states, player.rState, handleChange),
    selectBuilder(player.id, "Role", true, roles, player.rRole, handleChange),
    selectBuilder(player.id, "Char", true, chars, player.rChar, handleChange),
    selectBuilder(player.id, "Team", true, GameData.teams, player.rTeam, handleChange)
  ]

  const trueInputs = [
    selectBuilder(player.id, "State", false, GameData.states, player.state, handleChange),
    selectBuilder(player.id, "Role", false, roles, player.role, handleChange),
    selectBuilder(player.id, "Char", false, chars, player.char, handleChange),
    selectBuilder(player.id, "Team", false, GameData.teams, player.team, handleChange)
  ]

  return (
    <Grid container alignContent="flex-start" sx={{m: 1}} rowSpacing={1}>
      <Grid item xs={6}>
        <Typography variant="h5" >{player.name}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Button variant="outlined" onClick={() => {handleDismissalClick(player.id)}}>Start Dismissal</Button>
      </Grid>
      <Grid item xs={6}>
        <Stack spacing={2} sx={{m: 1}}>
          {!showTrueState ? shownInputs[0] : trueInputs[0]}
          {!showTrueState ? shownInputs[1] : trueInputs[1]}
          {!showTrueState ? shownInputs[2] : trueInputs[2]}
        </Stack>
      </Grid>
      <Grid item xs={6}>
        <Stack spacing={2} sx={{m: 1}}>
          {!showTrueState ? shownInputs[3] : trueInputs[3]}
          <FormControl fullWidth>
            <InputLabel id="narrator-rVotePower-input-label">Vote Power</InputLabel>
            <Select
              labelId="narrator-rVotePower-input-label"
              size="small"
              id="narrator-rVotePower-input"
              value={player.rVotePower}
              label="Vote Power"
              onChange={(_, newValue) => handleChange(player.id, "rVotePower", newValue.props.value)}
            >
              <MenuItem value={0}>0 vote power</MenuItem>
              <MenuItem value={1}>1 vote power</MenuItem>
              <MenuItem value={2}>2 vote power</MenuItem>
              <MenuItem value={3}>3 vote power</MenuItem>
              <MenuItem value={4}>4 vote power</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel control={<Switch checked={showTrueState} onChange={() => setShowTrueState(state => !state)}/>} label="True State" />
        </Stack>
      </Grid>
      {player.reminders.map(reminderId => {
        return (
          <Chip 
            sx={{borderRadius: 1, m: 0.3}}
            size="small"
            variant="contained"
            key={String(player.id) + String(reminderId)} 
            icon={<Reminder reminder={GameData.reminders.find(reminder => reminder.id === reminderId)} />} 
            label={GameData.reminders.find(reminder => reminder.id === reminderId).description}/>
        )
      })}
    </Grid>
  );

}
