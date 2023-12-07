// import { useMemo, useState } from "react";
import {Box, Typography, Button, Grid, TextField, Autocomplete, Stack, Divider} from '@mui/material';
// import {styled} from '@mui/material/styles';
const STATE = {
  0: "Dead",
  1: "Alive"
}

function PlayerDetails({
  id, name, label, state, role, 
  characteristic, status, notes, handleChange }) {

  return (
    <Grid container>
      <Grid item xs={5}>
        <Stack>
          <Typography variant="h5" sx={{marginTop: "1rem"}}>{name}</Typography>
          <TextField sx={{margin: "1rem"}}
            id="label-input"
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
            <Typography variant="h5">{STATE[state]}</Typography>
          </Box>
          <Autocomplete
            disablePortal
            id="role-input"
            size="small"
            options={[{label: "Role 1", id: 0}, {label: "Vampire", id: 1}]}
            renderInput={(params) => <TextField {...params} label="Role"/>}
            value={role}
            onChange={(event, newValue) => handleChange(id, "role", newValue)}
            isOptionEqualToValue={(option, value) => value.id === option.id || value === ""}
          />
          <Autocomplete
            disablePortal
            id="characteristic-input"
            options={[{label: "Characteristic 1", id: 0}, {label: "Drunkard", id: 1}]}
            size="small"
            renderInput={(params) => <TextField {...params} label="Characteristic" />}
            value={characteristic}
            onChange={(event, newValue) => handleChange(id, "characteristic", newValue)}
            isOptionEqualToValue={(option, value) => value.id === option.id || value === ""}
          />
          <Autocomplete
            disablePortal
            id="status-input"
            options={[{label: "Status 1", id: 0}, {label: "Malfunctioning", id: 1}]}
            size="small"
            renderInput={(params) => <TextField {...params} label="Status" />}
            value={status}
            onChange={(event, newValue) => handleChange(id, "status", newValue)}
            isOptionEqualToValue={(option, value) => value.id === option.id || value === ""}
          />
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{maxWidth: "100%", margin: "1rem"}}>
          <TextField 
              id="player-notes"
              label="Player Notes"
              multiline
              rows={7}
              fullWidth
              value={notes}
              onChange={(event) => handleChange(id, "notes", event.target.value)}
            />
        </Box>
      </Grid>
    </Grid>
  );
}

export default PlayerDetails
