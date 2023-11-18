// import { useState } from 'react'
import {Box, Button, Typography}from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';

function Options() {

  return (
    <Box sx={{background: "lightcoral", minHeight: "10vh", display: "flex", justifyContent: "space-around", alignItems: "center"}}>
      <Typography sx={{fontSize: "1.3rem"}}>Secrets Within the Compound</Typography>
      <Button variant="contained" endIcon={<MenuIcon />}>
        Menu
      </Button>
    </Box>
  );
}

export default Options
