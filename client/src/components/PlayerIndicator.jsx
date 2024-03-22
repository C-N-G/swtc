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
  height: "calc(100% - 10px)",
  margin: "5px",
  px: "4px",
  flexDirection: "column",
  justifyContent: "flex-start",
  overflow: "inherit",
  background: team === 2 ? "rgb(180, 30, 10)" : team === 1 ? "rgb(25, 118, 210)" : "rgb(128, 128, 128)",
  backgroundImage: rState === 0 ? "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.5), rgba(0,0,0,1))" : "",
  ":hover": {
    background: team === 2 ? "rgb(150, 25, 5)" : team === 1 ? "rgb(21, 101, 192)" : "rgb(96, 96, 96)",
    backgroundImage: rState === 0 ? "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.5), rgba(0,0,0,1))" : "",
  },
  textTransform: "none",
})

const BUTTON_CONTAINER_STYLE = (vertical) => ({
  width: vertical ? "100%" : "20%",
  aspectRatio: "1/1",
  flexDirection: "column",
  justifyContent: "flex-start",
  display: "flex",
  position: "relative",
  // overflow: "clip", 
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

function RegularPlayerIndicator({player, handleClick, vertical}) {

  return (
    <Box sx={BUTTON_CONTAINER_STYLE(vertical)}>
      <Button variant="contained" onClick={() => {handleClick(player.id)}} sx={BUTTON_STYLE(player.team, player.rState)}>
        <Typography>{player.name}</Typography>
        <Box sx={BUTTON_TEXT_CONTAINER_STYLE}>
          <Typography 
            variant="subtitle" 
            sx={{
              wordBreak: "break-word",
              overflow: "inherit",
            }}>
              {player.label}
          </Typography>
        </Box>
      </Button>
    </Box>
  );

}

function NarratorPlayerIndicator({player, handleClick, vertical, chars, roles}) {

  const {isOver, setNodeRef} = useDroppable({
    id: "droppable-|-" + player.id
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
        top: "2px",
        left: "2px",
        zIndex: 1
      }}>
        {player.reminders.map(reminderId => {
          return (
            <Draggable key={String(player.id) + String(reminderId)} draggableId={String(player.id) + "-|-" + String(reminderId)}>
              <Reminder reminder={GameData.reminders.find(reminder => reminder.id === reminderId)} />
            </Draggable>
          )
        })}
      </Stack>
      <Stack spacing={{xs: 0.4}} sx={{
        position: "absolute",
        top: "2px",
        right: "2px",
        zIndex: 1
      }}>
        {player.nightOrders.map(nightOrder => (<Reminder key={nightOrder} reminder={{colour: "white", content: nightOrder}}/>))}
      </Stack>
      <Button 
        variant="contained" 
        onClick={() => {handleClick(player.id)}} 
        sx={BUTTON_STYLE(player.team, player.rState)}
        ref={setNodeRef}
        style={style}
      >
        <Typography>{player.name}</Typography>
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
                {GameData.states[player.rState]}{player.state !== player.rState ? "*" : ""}
                {player.state !== player.rState ? captionBuilder(GameData.states[player.state]) : ""}
              </Box>
              <br />
              <Box component={"span"} sx={{position: "relative"}}>
                {GameData.hackValue(roles[player.rRole]?.name)}{player.role !== player.rRole ? "*" : ""}
                {player.role !== player.rRole ? captionBuilder(GameData.hackValue(roles[player.role]?.name)) : ""}
              </Box>
              <br />
              <Box component={"span"} sx={{position: "relative"}}>
                {GameData.hackValue(chars[player.rChar]?.name)}{player.char !== player.rChar ? "*" : ""}
                {player.char !== player.rChar ? captionBuilder(GameData.hackValue(chars[player.char]?.name)) : ""}
              </Box>
              <br />
              <Box component={"span"} sx={{position: "relative"}}>
                {GameData.teams[player.rTeam]}{player.team !== player.rTeam? "*" : ""}
                {player.team !== player.rTeam ? captionBuilder(GameData.teams[player.team]) : ""}
                
              </Box>
          </Typography>
        </Box>
      </Button>
    </Box>
  );

}