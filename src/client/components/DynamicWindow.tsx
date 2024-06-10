import {Card, Box, Fade} from '@mui/material';

interface DynamicWindowProps {
  display: number;
  children: React.ReactNode;
}

function DynamicWindow({children, display}: DynamicWindowProps) {

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
        margin: "5px"
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

