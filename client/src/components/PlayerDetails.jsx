import {useContext} from "react";
import {Box, Typography, Button, Grid, TextField, Autocomplete, Stack, Divider} from '@mui/material';
import {UserContext} from "../App.jsx";
import {STATES, ROLES, CHARS, STATUSES} from "../data.js";

function PlayerDetails(props) {

  const user = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    if (user.type === 0) {
      return <StoryTellerDetails {...props}/>
    } else if (user.type === 1) {
      return <RegularPlayerDetails {...props} />
    } else {
      return false
    }

  }

  return getUserTypeCheckedComponent();

}

export default PlayerDetails



function RegularPlayerDetails({
  id, name, rState, label, role, 
  char, status, notes, handleChange }) {


  return (
    <Grid container>
      <Grid item xs={5}>
        <Stack>
          <Typography variant="h5" sx={{marginTop: "1rem"}}>{name}</Typography>
          <TextField sx={{margin: "1rem"}}
            id="player-label-input"
            label="Quick Label"
            multiline
            rows={4}
            size="small"
            value={label}
            onChange={(event) => handleChange(id, "label", event.target.value)}
          />
          <Button variant="outlined" sx={{marginLeft: "1rem", marginRight: "1rem"}}>Talk</Button>
        </Stack>
      </Grid>
      <Grid item xs={7}>
        <Stack spacing={2} sx={{margin: "1rem"}}>
          <Box sx={{display: "flex", justifyContent: "center", gap: "0.5rem"}}>
            <Typography variant="h5">State</Typography>
            <Divider orientation="vertical" flexItem />
            <Typography variant="h5">{STATES[rState]}</Typography>
          </Box>
          <Autocomplete
            disablePortal
            disableClearable
            id="player-role-input"
            size="small"
            options={ROLES}
            renderInput={(params) => <TextField {...params} label="Role"/>}
            value={ROLES[role]}
            onChange={(_, newValue) => handleChange(id, "role", ROLES.indexOf(newValue))}
          />
          <Autocomplete
            disablePortal
            disableClearable
            id="player-char-input"
            options={CHARS}
            size="small"
            renderInput={(params) => <TextField {...params} label="Characteristic" />}
            value={CHARS[char]}
            onChange={(_, newValue) => handleChange(id, "char", CHARS.indexOf(newValue))}
          />
          <Autocomplete
            disablePortal
            disableClearable
            id="player-status-input"
            options={STATUSES}
            size="small"
            renderInput={(params) => <TextField {...params} label="Status" />}
            value={STATUSES[status]}
            onChange={(_, newValue) => handleChange(id, "status", STATUSES.indexOf(newValue))}
          />
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



function StoryTellerDetails({
  id, name, state, role, char, status, 
  rState, rRole, rChar, rStatus, handleChange, handleDismissalClick }) {


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
          <Autocomplete
            disablePortal
            disableClearable
            id="storyteller-real-state-input"
            size="small"
            options={STATES}
            renderInput={(params) => <TextField {...params} label="Real State"/>}
            value={STATES[rState]}
            onChange={(_, newValue) => handleChange(id, "rState", STATES.indexOf(newValue))}
          />
          <Autocomplete
            disablePortal
            disableClearable
            id="storyteller-real-role-input"
            size="small"
            options={ROLES}
            renderInput={(params) => <TextField {...params} label="Real Role"/>}
            value={ROLES[rRole]}
            onChange={(_, newValue) => handleChange(id, "rRole", ROLES.indexOf(newValue))}
          />
          <Autocomplete
            disablePortal
            disableClearable
            id="storyteller-real-char-input"
            options={CHARS}
            size="small"
            renderInput={(params) => <TextField {...params} label="Real Characteristic"/>}
            value={CHARS[rChar]}
            onChange={(_, newValue) => handleChange(id, "rChar", CHARS.indexOf(newValue))}
          />
          <Autocomplete
            disablePortal
            disableClearable
            id="storyteller-real-status-input"
            options={STATUSES}
            size="small"
            renderInput={(params) => <TextField {...params} label="Real Status" />}
            value={STATUSES[rStatus]}
            onChange={(_, newValue) => handleChange(id, "rStatus", STATUSES.indexOf(newValue))}
          />
        </Stack>
      </Grid>
      <Grid item xs={6}>
        <Stack spacing={2} sx={{m: 1}}>
          <Autocomplete
            disablePortal
            disableClearable
            id="storyteller-secret-state-input"
            size="small"
            options={STATES}
            renderInput={(params) => <TextField {...params} label="Secret State"/>}
            value={STATES[state]}
            onChange={(_, newValue) => handleChange(id, "state", STATES.indexOf(newValue))}
            isOptionEqualToValue={(option, value) => value.id === option.id || value === ""}
          />
          <Autocomplete
            disablePortal
            disableClearable
            id="storyteller-secret-role-input"
            size="small"
            options={ROLES}
            renderInput={(params) => <TextField {...params} label="Secret Role"/>}
            value={ROLES[role]}
            onChange={(_, newValue) => handleChange(id, "role", ROLES.indexOf(newValue))}
            isOptionEqualToValue={(option, value) => value.id === option.id || value === ""}
          />
          <Autocomplete
            disablePortal
            disableClearable
            id="storyteller-secret-char-input"
            options={CHARS}
            size="small"
            renderInput={(params) => <TextField {...params} label="Secret Characteristic"/>}
            value={CHARS[char]}
            onChange={(_, newValue) => handleChange(id, "char", CHARS.indexOf(newValue))}
            isOptionEqualToValue={(option, value) => value.id === option.id || value === ""}
          />
          <Autocomplete
            disablePortal
            disableClearable
            id="storyteller-secret-status-input"
            options={STATUSES}
            size="small"
            renderInput={(params) => <TextField {...params} label="Secret Status" />}
            value={STATUSES[status]}
            onChange={(_, newValue) => handleChange(id, "status", STATUSES.indexOf(newValue))}
          />
        </Stack>
      </Grid>
    </Grid>
  );

}