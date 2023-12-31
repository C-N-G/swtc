import {useContext} from "react";
import {Box, Button, Typography} from '@mui/material';
import {UserContext} from "../App.jsx";
import {STATES, ROLES, CHARS, STATUSES} from "../data.js";

function PlayerIndicator(props) {

  const user = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    if (user.type === 0) {
      return <StorytellerPlayerIndicator {...props}/>
    } else if (user.type === 1) {
      return <RegularPlayerIndicator {...props} />
    } else {
      return false
    }

  }

  return getUserTypeCheckedComponent();

}

export default PlayerIndicator



function RegularPlayerIndicator({id, name, label, handleClick, vertical, rState}) {

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
        overflow: "inherit",
        backgroundImage: rState === 0 ? "linear-gradient(180deg, rgba(255,0,0,0), rgba(255,0,0,0.2), rgba(255,0,0,0.7))" : "" 
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



function StorytellerPlayerIndicator({
  id, name, state, role, char, status, 
  rState, rRole, rChar, rStatus, handleClick, vertical}) {

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
              {STATES[rState]}{state !== rState ? "*" : ""}
              <br />
              {ROLES[rRole]}{role !== rRole ? "*" : ""}
              <br />
              {CHARS[rChar]}{char !== rChar ? "*" : ""}
              <br />
              {STATUSES[rStatus]}{status !== rStatus ? "*" : ""}
          </Typography>
        </Box>
      </Button>
    </Box>
  );

}
