// import { uesState } from "react";
import {Card, Box, Fade} from '@mui/material';


function DynamicWindow({children, display}) {

  // const [lastDisplay, setLastDisplay] = useState()

  return (
    <Box sx={{
      aspectRatio: "1/1",
      width: "60%", 
      display: "flex"
    }}>
      <Card sx={{
        textAlign: "center",
        background: "lightpink",
        display: "flex",
        flexGrow: 1,
        m: 0.8
        }}>
        <Fade 
        // onEntered={() => {console.log("started")}}
        // onExited={() => {console.log("stopped")}}
        in={display === 0 ? false : true}>
          <Box sx={{display: "flex", flexGrow: 1}}>
            {children}
          </Box>
        </Fade>
      </Card>
    </Box>
  );
}

export default DynamicWindow

