// import { useState } from 'react'
import {Box, Typography}from '@mui/material';

function Phase() {

  return (
    <Box sx={{background: "lightgreen", height: "10vh", width: '80vh', display: "flex", justifyContent: "center", alignItems: "center"}}>
      <Typography sx={{fontSize: "2rem"}}>Current Phase: Day</Typography>
    </Box>
  );
}

export default Phase
