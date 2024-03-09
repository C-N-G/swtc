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

const BUTTON_STYLE = (team, rState) => ({
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
  textTransform: "none",
  px: 0.5,
})

const BUTTON_CONTAINER_STYLE = (vertical) => ({
  width: vertical ? "100%" : "20%",
  aspectRatio: "1/1",
  flexDirection: "column",
  justifyContent: "flex-start",
  display: "flex",
  overflow: "clip", 
})

const BUTTON_TEXT_CONTAINER_STYLE = {
  display: "flex", 
  justifyContent: "flex-start", 
  flexDirection: "column",
  flexGrow: 1,
  overflow: "inherit",
  width: "100%",
  whiteSpace: "break-spaces"
}

function RegularPlayerIndicator({id, name, team, label, handleClick, vertical, rState}) {

  return (
    <Box sx={BUTTON_CONTAINER_STYLE(vertical)}>
      <Button variant="contained" onClick={() => {handleClick(id)}} sx={BUTTON_STYLE(team, rState)}>
        <Typography>{name}</Typography>
        <Box sx={BUTTON_TEXT_CONTAINER_STYLE}>
          <Typography 
            variant="subtitle" 
            sx={{
              wordBreak: "break-word",
              overflow: "inherit",
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

  function captionBuilder(text) {
    return(
      <Typography variant="caption" sx={{
        position: "absolute",
        top: "110%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        wordBreak: "keep-all",
        fontSize: "9px"
        }}
      >
        ({text})
      </Typography>
    )
  }

  return (
    <Box sx={BUTTON_CONTAINER_STYLE(vertical)}>
      <Stack spacing={{xs: 0.4}} sx={{
        position: "absolute",
        zIndex: 1
      }}>
        {reminders.map(reminderId => {
          return (
            <Draggable key={String(id) + String(reminderId)} draggableId={String(id) + "-|-" + String(reminderId)}>
            <Reminder reminder={GameData.reminders.find(reminder => reminder.id === reminderId)} />
            </Draggable>
          )
        })}
      </Stack>
      <Button 
        variant="contained" 
        onClick={() => {handleClick(id)}} 
        sx={BUTTON_STYLE(team, rState)}
        ref={setNodeRef}
        style={style}
      >
        <Typography>{name}</Typography>
        <Box sx={BUTTON_TEXT_CONTAINER_STYLE}>
          <Typography 
            variant="subtitle" 
            sx={{
              wordBreak: "break-word",
              overflow: "inherit",
              width: "inherit",
              pb: 1
            }}>
              <Box component={"span"} sx={{position: "relative"}}>
                {GameData.states[rState]}{state !== rState ? "*" : ""}
                {state !== rState ? captionBuilder(GameData.states[state]) : ""}
              </Box>
              <br />
              <Box component={"span"} sx={{position: "relative"}}>
                {GameData.hackValue(roles[rRole])}{role !== rRole ? "*" : ""}
                {role !== rRole ? captionBuilder(GameData.hackValue(roles[role])) : ""}
              </Box>
              <br />
              <Box component={"span"} sx={{position: "relative"}}>
                {GameData.hackValue(chars[rChar])}{char !== rChar ? "*" : ""}
                {char !== rChar ? captionBuilder(GameData.hackValue(chars[char])) : ""}
              </Box>
              <br />
              <Box component={"span"} sx={{position: "relative"}}>
                {GameData.teams[rTeam]}{team !== rTeam? "*" : ""}
                {team !== rTeam ? captionBuilder(GameData.teams[team]) : ""}
                
              </Box>
          </Typography>
        </Box>
      </Button>
    </Box>
  );

}