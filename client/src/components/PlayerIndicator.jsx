// import { useState } from 'react'
import {styled} from '@mui/material/styles';
import {Button} from '@mui/material';

function PlayerIndicator() {

  const StyledButton = styled(Button)({
    width: "15vh",
    height: "15vh",
  });

  return (
    <StyledButton variant="contained">
      PLAYER TEST
    </StyledButton>
  );
}

export default PlayerIndicator
