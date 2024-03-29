import {Fragment, useContext, useMemo, useState} from "react";
import {Card, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItemButton, Collapse, ListItemText}from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {UserContext} from "../App.jsx";
import {socket} from "../helpers/socket.js";
import GameData from "../strings/_gameData.js";
import NightOrders from "../helpers/nightOrders.js";

function Phase(props) {

  const user = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    if (user?.type === 0) {
      return <NarratorPhase {...props}/>
    } else if (user?.type === 1) {
      return <PlayerPhase {...props}/>
    } else {
      return false
    }

  }

  return (
  <Card sx={{
    background: "lightgreen", 
    height: "10vh", 
    flexGrow: 1,
    display: "flex", 
    justifyContent: "center",
    alignItems: "center",
  }}>
    {getUserTypeCheckedComponent()}
  </Card>
  )
}

export default Phase



function PlayerPhase({phase}) {
  
  return (
    <Typography variant="h4">Current Phase: {phase.cycle} {phase.round}</Typography>
  )

}



function NarratorPhase({phase, setPhase, players, setPlayers, session}) {

  const [chars, roles] = useMemo(() => GameData.getFilteredValues(session.modules, true), [session.modules]);
  const [openDialog, setOpenDialog] = useState(0);
  const [purgedOrders, setPurgedOrders] = useState([]);

  function hanldeClick() {

      let newCycle;
      let newRound;

      if (phase.cycle === "Night") {
        newCycle = "Day";
        newRound = phase.round;
      } else if (phase.cycle === "Day") {
        newCycle = "Night";
        newRound = phase.round + 1;
      }

      setPlayers(prevPlayers => {
        if (newCycle === "Night") {
          const ordering = NightOrders.calculateOrder(prevPlayers, chars, roles);
          return NightOrders.addOrderIndicators(ordering, prevPlayers, purgedOrders);
        } else if (newCycle === "Day") {
          return prevPlayers.map(player => {
            player.nightOrders = [];
            return player;
          });
        }
      })

      if (players[0].id === "54321") {
        setPhase({cycle: newCycle, round: newRound});
      } else {
        socket.emit("phase", {cycle: newCycle, round: newRound});
      }


  }

  function handleClose() {
    setOpenDialog(0);
  }

  return (
    <>
      <Typography variant="h4">Current Phase: {phase.cycle} {phase.round}</Typography>
      <Button 
        size="small" 
        onClick={() => hanldeClick()}
        variant="contained"
        sx={{m: 1}}
      >
        Progress Phase
      </Button>
      <Button 
        disabled={phase.cycle !== "Night"}
        size="small"
        variant="contained"
        onClick={() => setOpenDialog(1)}
      >
        Night Order List
      </Button>
      <NightOrderDialog 
        openDialog={openDialog}
        handleClose={handleClose}
        players={players}
        setPlayers={setPlayers}
        chars={chars}
        roles={roles}
        purgedOrders={purgedOrders}
        setPurgedOrders={setPurgedOrders}
      />
    </>
  )

}

function NightOrderDialog({openDialog, handleClose, players, setPlayers, chars, roles, purgedOrders, setPurgedOrders}) {

  const ordering = useMemo(() => NightOrders.calculateOrder(players, chars, roles), [players, chars, roles]);
  const [openState, setOpenState] = useState(ordering.map(() => false));

  function handleOpenClick(index) {
    setOpenState(state => {
      const newState = !state[index];
      state = state.map(() => false);
      state[index] = newState;
      return state;
    })
  }

  function handlePurgeClick(index, event) {
    const action = event.target.innerText
    const purgeString = JSON.stringify(ordering[index]);
    let newPurgedOrders;
    if (action === "REMOVE") {
      newPurgedOrders = [...purgedOrders, purgeString];
    } else if (action === "UNDO") {
      newPurgedOrders = purgedOrders.filter(s => s !== purgeString)
    }
    setPurgedOrders(newPurgedOrders);

    setPlayers(prevPlayers => {
      
      const ordering = NightOrders.calculateOrder(prevPlayers, chars, roles);
      return NightOrders.addOrderIndicators(ordering, prevPlayers, newPurgedOrders);

    })
    
  }

  function handleResetClick() {
    setPurgedOrders([]);
  }

  let placedIndex = 0;
  const playerList = ordering.map((nightOrder, index) => {

    let attrLong, attribute;
    if (nightOrder.type === "char") {
      attrLong = "Characteristic";
      attribute = chars[players[nightOrder.playerIndex].rChar];
    } else if(nightOrder.type === "role") {
      attrLong = "Role";
      attribute = roles[players[nightOrder.playerIndex].rRole];
    }

    const removed = purgedOrders.includes(JSON.stringify(ordering[[index]])) ? true : false;

    if (!removed) placedIndex++;

    const displayIndex = removed ? "?" : placedIndex;

    const name = `#${displayIndex} - ${players[nightOrder.playerIndex].name} - ${attribute.name}`;


    return (
      <Fragment key={"orderListKey" + index + nightOrder.name}>
        <ListItemButton onClick={() => handleOpenClick(index)}>
          <ListItemText primary={name} sx={removed ? {textDecoration: "line-through", color: "rgb(255, 200, 200)"} : {}}/>
          {openState[index] ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openState[index]} timeout="auto" unmountOnExit>
          <Button 
            component={"span"} 
            variant="outlined" 
            size="small" 
            sx={{mr: 1}}
            onClick={(event) => handlePurgeClick(index, event)}
          >
            {removed ? "undo" : "remove"}
          </Button>
          <Typography component={"span"}>{attrLong} Ability: {attribute.ability}</Typography>
        </Collapse>
      </Fragment>
    )
  })

  return (
    <Dialog open={openDialog === 1} onClose={handleClose} fullWidth>
      <DialogTitle>Night Order List</DialogTitle>
      <DialogContent>
        <List>
          {playerList}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleResetClick}>Reset</Button>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
