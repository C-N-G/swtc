// import { useState } from 'react'
import {styled} from '@mui/material/styles';
import {Button, Typography} from '@mui/material';

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
      <Typography variant='h7' sx={{wordBreak: "break-word", overflow: "clip"}}>{label}</Typography>
    </StyledButton>
  );
}

export default PlayerIndicator
