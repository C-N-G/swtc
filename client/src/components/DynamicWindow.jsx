// import { forwardRef } from "react";
import {Box, Fade} from '@mui/material';

function DynamicWindow({children, display}) {

  return (
    <Box sx={{
      width: "50vh", 
      height: "50vh", 
      textAlign: "center",
      background: "lightpink",
      display: "flex"
      }}>
      <Fade in={display}>
        <Box sx={{display: "flex", flexGrow: 1}}>
          {children}
        </Box>
      </Fade>
    </Box>
  );
}

export default DynamicWindow

