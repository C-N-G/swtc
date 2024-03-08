import {useContext} from "react";
import {Box, Button, Stack, Typography} from '@mui/material';
import {UserContext} from "../App.jsx";
import {useDroppable} from "@dnd-kit/core";
import GameData from "../strings/_gameData.js"
import Reminder from "./Reminder.jsx";
import Draggable from "./Draggable.jsx";

function PlayerIndicator(props) {

  const user = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    if (user.type === 0) {
      return <NarratorPlayerIndicator {...props}/>
    } else if (user.type === 1) {
      return <RegularPlayerIndicator {...props} />
    } else {
      return false
    }

  }

  return getUserTypeCheckedComponent();

}

export default PlayerIndicator



function RegularPlayerIndicator({id, name, team, label, handleClick, vertical, rState}) {

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
        background: team === 2 ? "rgb(180, 30, 10)" : "rgb(25, 118, 210)",
        backgroundImage: rState === 0 ? "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.5), rgba(0,0,0,1))" : "",
        ":hover": {
          background: team === 2 ? "rgb(150, 25, 5)" : "rgb(21, 101, 192)",
          backgroundImage: rState === 0 ? "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.5), rgba(0,0,0,1))" : "",
        }
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



function NarratorPlayerIndicator({
  chars, roles, team, rTeam, reminders,
  id, name, state, role, char, 
  rState, rRole, rChar, handleClick, vertical}) {

  const {isOver, setNodeRef} = useDroppable({
    id: "droppable-|-" + id
  });

  const style = {
    boxShadow: isOver ? "inset 0 0 20px rgba(0, 200, 0, 0.5)" : undefined,
    transform: isOver ? "translate3d(0px, -5px, 0)" : undefined,
    transition: "transform 0.2s",
  };

  return (
    <Box sx={{
      width: vertical ? "100%" : "20%",
      aspectRatio: "1/1",
      flexDirection: "column",
      justifyContent: "flex-start",
      display: "flex",
      overflow: "clip", 
    }}>
      <Stack spacing={{xs: 0.4}} sx={{
        position: "absolute",
        zIndex: 1
      }}>
        {reminders.map(reminder => {
          return (
            <Draggable key={String(id) + String(reminder.id)} draggableId={String(id) + "-|-" + String(reminder.id)}>
            <Reminder reminder={reminder} />
            </Draggable>
          )
        })}
      </Stack>
      <Button 
        variant="contained" 
        onClick={() => {handleClick(id)}} 
        sx={{
          flexGrow: 1, 
          flexDirection: "column",
          justifyContent: "flex-start",
          m: 0.8,
          overflow: "inherit",
          background: team === 2 ? "rgb(180, 30, 10)" : "rgb(25, 118, 210)",
          backgroundImage: rState === 0 ? "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.5), rgba(0,0,0,1))" : "",
          ":hover": {
            background: team === 2 ? "rgb(150, 25, 5)" : "rgb(21, 101, 192)",
            backgroundImage: rState === 0 ? "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.5), rgba(0,0,0,1))" : "",
          },
        }}
        ref={setNodeRef}
        style={style}
      >
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
              {GameData.states[rState]}{state !== rState ? "*" : ""}
              <br />
              {GameData.hackValue(roles[rRole])}{role !== rRole ? "*" : ""}
              <br />
              {GameData.hackValue(chars[rChar])}{char !== rChar ? "*" : ""}
              <br />
              {GameData.teams[rTeam]}{team !== rTeam ? "*" : ""}
          </Typography>
        </Box>
      </Button>
    </Box>
  );

}