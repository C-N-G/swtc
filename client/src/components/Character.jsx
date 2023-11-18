// import { useState } from 'react'
import {Box, Typography}from '@mui/material';

function Character() {

  return (
    <Box sx={{background: "darkseagreen", minHeight: "55vh", display: "flex", textAlign: "center", flexDirection: "column"}}>
      <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <Box sx={{textAlign: "left"}}>
          <Typography>Role</Typography> 
          <Typography>Characteristic</Typography> 
          <Typography>Team</Typography> 
        </Box>
        <Box sx={{textAlign: "right"}}>
          <Typography sx={{fontSize: "1.5rem"}}>State</Typography> 
          <Typography sx={{fontSize: "1.5rem"}}>Status</Typography> 
        </Box>
      </Box>
      <iframe src="https://drive.google.com/file/d/1BSgDm_VNXi-e2_0v5L5Xd781-kFyde7k/preview" style={{flexGrow: 1, margin: "1rem"}} allow="autoplay"></iframe>
    </Box>
  );
}

export default Character
