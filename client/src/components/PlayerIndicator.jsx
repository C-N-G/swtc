// import { useState } from 'react'
import {styled} from '@mui/material/styles';
import {Box, Button, Typography} from '@mui/material';

function PlayerIndicator({id, name, label, handleClick}) {

  const StyledButton = styled(Button)({
    width: "15vh",
    height: "15vh",
    flexDirection: "column",
    justifyContent: "flex-start"
  });

  return (
    <StyledButton variant="contained" onClick={() => {handleClick(id)}}>
      <Typography>{name}</Typography>
      <Box sx={{
        display: "flex", 
        justifyContent: "center", 
        flexDirection: "column",
        flexGrow: 1,
        overflow: "clip", 
      }}>
        <Typography 
          variant="subtitle" 
          sx={{
            wordBreak: "break-word",
            overflow: "clip", 
            textTransform: "none",
          }}>
            {label}
        </Typography>
      </Box>
    </StyledButton>
  );
}

export default PlayerIndicator
