// import { useState } from 'react'
import {Box, InputLabel, Typography, MenuItem, FormControl, Select} from '@mui/material';

function DynamicWindow(props) {

  return (
    <Box sx={{
      width: "50vh", 
      height: "50vh", 
      textAlign: "center",
      background: "lightpink"
      }}>
      <Typography>
          Main area
      </Typography>
      <Box sx={{ maxWidth: 100 }}>
        <FormControl fullWidth>
          <InputLabel id="player-select-label">Players</InputLabel>
          <Select
            labelId="player-select-label"
            id="player-select"
            value={props.players}
            label="Players"
            onChange={props.handleChange}
          >
            <MenuItem value={8}>8</MenuItem>
            <MenuItem value={9}>9</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={11}>11</MenuItem>
            <MenuItem value={12}>12</MenuItem>
            <MenuItem value={13}>13</MenuItem>
            <MenuItem value={14}>14</MenuItem>
            <MenuItem value={15}>15</MenuItem>
            <MenuItem value={16}>16</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

export default DynamicWindow
