import {useContext} from "react";
import {Box, Typography, Button, Grid, TextField, Autocomplete, Stack} from '@mui/material';
import {UserContext} from "../App.jsx";
import GameData from "../strings/_gameData.js"
import { useSessionDispatch } from "./SessionContext.jsx";

function PlayerDetails(props) {

  const user = useContext(UserContext);
  const dispatch = useSessionDispatch();

  function handleChange(targetId, targetProperty, targetValue) {
    dispatch({
      type: "attributeChanged",
      targetId: targetId,
      targetProperty: targetProperty,
      targetValue: targetValue
    })
  }

  const getUserTypeCheckedComponent = () => {

    if (user.type === 0) {
      return <NarratorDetails {...props} handleChange={handleChange} />
    } else if (user.type === 1) {
      return <RegularPlayerDetails {...props} handleChange={handleChange} />
    } else {
      return false
    }

  }

  return getUserTypeCheckedComponent();

}

export default PlayerDetails



function RegularPlayerDetails({
  chars, roles, team, handleChange,
  id, name, rState, label, role, 
  char, status, notes }) {

  function selectBuilder(playerId, type, list, value) {
    return <Autocomplete
      disablePortal
      disableClearable
      id={`player-${type.toLowerCase()}-input`}
      size="small"
      options={list}
      renderInput={(params) => <TextField {...params} label={type} />}
      value={GameData.hackValue(list[value])} // hack - this is for when the modules change and the current value no longer exists
      onChange={(_, newValue) => handleChange(playerId, type.toLowerCase(), list.indexOf(newValue))}
    />
  }


  return (
    <Grid container>
      <Grid item xs={5}>
        <Stack>
          <Box position={"relative"}>
          <Typography variant="h5" sx={{marginTop: "1rem"}}>
            {name}
          </Typography>
          <Typography variant="caption" sx={{
              position: "absolute",
              top: "98%",
              left: "50%",
              transform: "translate(-50%, -50%)"
              }}
          >
            ({GameData.states[rState]})
          </Typography>
          </Box>
          <TextField sx={{margin: "1rem"}}
            id="player-label-input"
            label="Quick Label"
            multiline
            rows={4}
            size="small"
            value={label}
            onChange={(event) => handleChange(id, "label", event.target.value)}
          />
          <Button variant="outlined" sx={{marginLeft: "1rem", marginRight: "1rem"}}>Talk (W.I.P)</Button>
        </Stack>
      </Grid>
      <Grid item xs={7}>
        <Stack spacing={2} sx={{margin: "1rem"}}>
          {selectBuilder(id, "Role", roles, role)}
          {selectBuilder(id, "Char", chars, char)}
          {selectBuilder(id, "Status", GameData.statuses, status)}
          {selectBuilder(id, "Team", GameData.teams, team)}
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
              value={notes}
              onChange={(event) => handleChange(id, "notes", event.target.value)}
            />
        </Box>
      </Grid>
    </Grid>
  );

}



function NarratorDetails({
  id, name, handleChange, handleDismissalClick, chars, roles,
  state, role, char, status, team,
  rState, rRole, rChar, rStatus, rTeam }) {

  const leftVal = "Shown";
  const rightVal = "True"

  function selectBuilder(playerId, type, real, list, value) {
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


  return (
    <Grid container alignContent="flex-start" sx={{m: 1}} rowSpacing={1}>
      <Grid item xs={6}>
        <Typography variant="h5" >{name}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Button variant="outlined" onClick={() => {handleDismissalClick(id)}}>Start Dismissal</Button>
      </Grid>
      <Grid item xs={6}>
        <Stack spacing={2} sx={{m: 1}}>
          {selectBuilder(id, "State", true, GameData.states, rState)}
          {selectBuilder(id, "Role", true, roles, rRole)}
          {selectBuilder(id, "Char", true, chars, rChar)}
          {selectBuilder(id, "Status", true, GameData.statuses, rStatus)}
          {selectBuilder(id, "Team", true, GameData.teams, rTeam)}
        </Stack>
      </Grid>
      <Grid item xs={6}>
        <Stack spacing={2} sx={{m: 1}}>
          {selectBuilder(id, "State", false, GameData.states, state)}
          {selectBuilder(id, "Role", false, roles, role)}
          {selectBuilder(id, "Char", false, chars, char)}
          {selectBuilder(id, "Status", false, GameData.statuses, status)}
          {selectBuilder(id, "Team", false, GameData.teams, team)}
        </Stack>
      </Grid>
    </Grid>
  );

}