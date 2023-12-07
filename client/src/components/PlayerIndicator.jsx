import {Box, Button, Typography} from '@mui/material';

function PlayerIndicator({id, name, label, handleClick, vertical}) {

  return (
    <Box sx={{
      width: vertical ? "100%" : "20%",
      aspectRatio: "1/1",
      flexDirection: "column",
      justifyContent: "flex-start",
      display: "flex",
      overflow: "clip", 
    }}>
      <Button variant="contained" onClick={() => {handleClick(id)}} sx={{
        flexGrow: 1, 
        flexDirection: "column",
        justifyContent: "flex-start",
        m: 0.8,
        overflow: "inherit" 
      }}>
        <Typography>{name}</Typography>
        <Box sx={{
          display: "flex", 
          justifyContent: "center", 
          flexDirection: "column",
          flexGrow: 1,
          overflow: "inherit" 
        }}>
          <Typography 
            variant="subtitle" 
            sx={{
              wordBreak: "break-word",
              overflow: "inherit",
              textTransform: "none",
            }}>
              {label}
          </Typography>
        </Box>
      </Button>
    </Box>
  );
}

export default PlayerIndicator
