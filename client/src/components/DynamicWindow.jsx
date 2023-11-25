// import { forwardRef } from "react";
import {Box, Fade} from '@mui/material';

function DynamicWindow({children, display}) {

  return (
    <Box sx={{
      width: "50vh", 
      height: "50vh", 
      textAlign: "center",
      background: "lightpink"
      }}>
      <Fade in={display}>
        <div>
          {children}
        </div>
      </Fade>
    </Box>
  );
}

export default DynamicWindow

