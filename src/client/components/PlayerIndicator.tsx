import {memo, useContext} from "react";
import {Box, Button, Stack, Typography} from '@mui/material';
import {UserContext} from "../App.tsx";
import {useDroppable} from "@dnd-kit/core";
import GameData from "../strings/_gameData.ts"
import Reminder from "./Reminder.tsx";
import Draggable from "./Draggable.tsx";
import Player from "../classes/player.ts";
import Char from "../classes/char.ts";
import Role from "../classes/role.ts";
import { DisplaySlice } from "../helpers/storeTypes.ts";
import NightOrderIndicator from "./NightOrderIndicator.tsx";



type PlayerIndicatorProps = RegularPlayerIndicatorProps & NarratorPlayerIndicator & { 
  display: number 
}

const PlayerIndicator = memo(function PlayerIndicator(props: PlayerIndicatorProps) {

  const user = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    if (user?.type === 0) {
      return <NarratorPlayerIndicator {...props}/>
    } else if (user?.type === 1) {
      return <RegularPlayerIndicator {...props} />
    } else {
      return false
    }

  }

  return getUserTypeCheckedComponent();

}, (oldProps, newProps) => {

  const result = oldProps.player === newProps.player
   && oldProps.display === newProps.display
   && oldProps.selected === newProps.selected
  
  return result;
})

export default PlayerIndicator



const BUTTON_STYLE = (team: number, rState: number, isSelected: boolean) => ({
  aspectRatio: "1/1",
  margin: "5px",
  px: "4px",
  flexDirection: "column",
  justifyContent: "flex-start",
  overflow: "clip",
  background: team === 2 ? "var(--sl-color-accent)" : team === 1 ? "var(--sl-color-loyalist-accent)" : "var(--sl-color-unknown-accent)",
  backgroundImage: rState === 0 ? "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.5), rgba(0,0,0,1))" : "",
  ":hover": {
    background: team === 2 ? "var(--sl-color-accent-low)" : team === 1 ? "var(--sl-color-loyalist-accent-low)" : "var(--sl-color-unknown-accent-low)",
    backgroundImage: rState === 0 ? "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.5), rgba(0,0,0,1))" : "",
    boxShadow: isSelected ? "inset 0 0 10px 7px rgba(0,0,0,0.8)" : "",
  },
  textTransform: "none",
  boxShadow: isSelected ? "inset 0 0 10px 7px rgba(0,0,0,0.8)" : "",
  maxHeight: "calc(100% - 10px)"
})

const BUTTON_CONTAINER_STYLE = (vertical: boolean) => ({
  width: vertical ? "100%" : "20%",
  maxHeight: vertical ? "33.33%" : "unset",
  aspectRatio: "1/1",
  flexDirection: "column",
  justifyContent: "flex-start",
  display: "flex",
  position: "relative",
  // overflow: "clip", do not use this as it will clip player reminders from showing when they are being moved between player indicators
})

const BUTTON_TEXT_CONTAINER_STYLE = {
  display: "flex", 
  justifyContent: "center", 
  flexDirection: "column",
  flexGrow: 1,
  overflow: "inherit",
  width: "100%",
  whiteSpace: "break-spaces"
}

interface RegularPlayerIndicatorProps {
  player: Player;
  handleClick: (playerId: string) => void;
  vertical: boolean;
  chars: Char[];
  roles: Role[];
  selected: DisplaySlice["selected"];
}

function RegularPlayerIndicator({player, handleClick, vertical, chars, roles, selected}: RegularPlayerIndicatorProps) {

  const thisPlayerSelected = selected === player.id;

  const getValue = (value: number | string, list: Char[] | Role[]) => {
    if (typeof value === "string") {
      return value;
    } 
    else if (typeof value === "number" && value === 0) {
      return "";
    }
    else if (typeof value === "number") {
      return GameData.hackValue(list[value].name);
    }
  }

  const getName = (name: string, nickname: string) => {
    if (nickname) {
      return nickname;
    } else {
      return name;
    }
  }

  return (
    <Box sx={BUTTON_CONTAINER_STYLE(vertical)}>
      <Button variant="contained" onClick={() => {handleClick(player.id)}} sx={BUTTON_STYLE(player.team, player.rState, thisPlayerSelected)}>
        <Box sx={{position: "relative", width: "100%"}}>
          <Typography>{getName(player.name, player.label)}</Typography>
          <Typography variant="caption" sx={{
            position: "absolute",
            top: "110%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            wordBreak: "keep-all",
            fontSize: "9px"
            }}
          >
            {player.label && `(${player.name})`}
          </Typography>
          <Typography variant="caption" sx={{
            position: "absolute",
            top: player.label ? "150%" : "110%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            wordBreak: "keep-all",
            fontSize: "9px"
            }}
          >
            {player.pronouns && `(${player.pronouns})`}
          </Typography>
        </Box>
        <Box sx={BUTTON_TEXT_CONTAINER_STYLE}>
          <Typography 
            variant="subtitle2"
            sx={{
              wordBreak: "normal",
              overflow: "inherit",
              lineHeight: 1.8,
              px: 0.5
            }}>
              <Box component={"span"} sx={{position: "relative"}}>
                {getValue(player.role, roles)}
              </Box>
              <br />
              <Box component={"span"} sx={{position: "relative"}}>
                {getValue(player.char, chars)}
              </Box>
          </Typography>
        </Box>
      </Button>
    </Box>
  );

}



interface NarratorPlayerIndicator {
  player: Player;
  handleClick: (playerId: string) => void;
  vertical: boolean;
  chars: Char[];
  roles: Role[];
  selected: DisplaySlice["selected"];
}

function NarratorPlayerIndicator({player, handleClick, vertical, chars, roles, selected}: NarratorPlayerIndicator) {

  const {isOver, setNodeRef} = useDroppable({
    id: "droppable-|-" + player.id
  });

  const style = {
    boxShadow: isOver ? "inset 0 0 20px rgba(0, 200, 0, 0.5)" : undefined,
    transform: isOver ? "translate3d(0px, -5px, 0)" : undefined,
    transition: "transform 0.2s",
  };

  const thisPlayerSelected = selected === player.id;

  function captionBuilder(text: string) {
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
              <Reminder reminder={GameData.reminders.find(reminder => reminder.id === reminderId)!} />
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
        {player.nightOrders.map(nightOrder => (<NightOrderIndicator key={nightOrder.id} nightOrder={nightOrder}/>))}
      </Stack>
      <Button 
        variant="contained" 
        onClick={() => {handleClick(player.id)}} 
        sx={BUTTON_STYLE(player.team, player.rState, thisPlayerSelected)}
        ref={setNodeRef}
        style={style}
      >
        <Typography>
          {player.name}
          <Typography variant="caption" sx={{
            position: "absolute",
            top: "21%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            wordBreak: "keep-all",
            fontSize: "9px"
            }}
          >
            {player.pronouns && `(${player.pronouns})`}
          </Typography>
        </Typography>
        <Box sx={BUTTON_TEXT_CONTAINER_STYLE}>
          <Typography 
            variant="subtitle2"
            sx={{
              wordBreak: "break-word",
              overflow: "inherit",
              width: "inherit",
              lineHeight: 1.8,
              pb: 0.5
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