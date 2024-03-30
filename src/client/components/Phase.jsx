import {Fragment, useContext, useMemo, useState} from "react";
import {Card, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, List, 
  ListItemButton, Collapse, ListItemText, ButtonGroup, Stack, Grid, ListItem, Divider, Checkbox}from '@mui/material';
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
    justifyContent: "space-evenly",
    alignItems: "center",
  }}>
    {getUserTypeCheckedComponent()}
  </Card>
  )
}

export default Phase



function PlayerPhase({phase, session}) {

  const [openDialog, setOpenDialog] = useState(null);
  const [chars, roles] = useMemo(() => GameData.getFilteredValues(session.modules, true), [session.modules]);
  const handleClose = () => setOpenDialog(null);
  
  return (<>
    <Grid container alignItems="center">
      <Grid item xs={4} container justifyContent="center">
        <ButtonGroup size="small" orientation="vertical">
          <Button onClick={() => setOpenDialog("scenario")}>Show Scenario</Button>
        </ButtonGroup>
      </Grid>
      <Grid item xs={4} container justifyContent="center">
        <Stack alignItems="center" spacing={-1}>
          <Typography variant="h5">Current Phase</Typography>
          <Typography variant="h3">{phase.cycle} {phase.round}</Typography>
        </Stack>
      </Grid>
      <Grid item xs={4} container justifyContent="center">
      </Grid>
    </Grid>

    <ScenarioDialog
      openDialog={openDialog}
      handleClose={handleClose}
      chars={chars}
      roles={roles} />
  </>)

}



function NarratorPhase({phase, setPhase, players, setPlayers, session, purgedOrders, setPurgedOrders}) {

  const [chars, roles] = useMemo(() => GameData.getFilteredValues(session.modules, true), [session.modules]);
  const [checkedState, setCheckedState] = useState(Array(32).fill(false));
  const [openDialog, setOpenDialog] = useState(null);

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

      setCheckedState(state => state.fill(false));


  }

  function handleClose() {
    setOpenDialog(null);
  }

  return (
    <>
      <Grid container alignItems="center">
        <Grid item xs={4} container justifyContent="center">
          <ButtonGroup size="small" orientation="vertical">
            <Button onClick={() => setOpenDialog("scenario")}>Show Scenario</Button>
          </ButtonGroup>
        </Grid>
        <Grid item xs={4} container justifyContent="center">
          <Stack alignItems="center" spacing={-1}>
            <Typography variant="h5">Current Phase</Typography>
            <Typography variant="h3">{phase.cycle} {phase.round}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={4} container justifyContent="center">
          <ButtonGroup size="small" orientation="vertical">
            <Button onClick={() => hanldeClick()}>&gt; Progress Phase &gt;</Button>
            <Button disabled={phase.cycle !== "Night"} onClick={() => setOpenDialog("nightOrder")}>Night Order List</Button>
          </ButtonGroup>
        </Grid>
      </Grid>

      <NightOrderDialog 
        openDialog={openDialog} handleClose={handleClose}
        players={players} setPlayers={setPlayers}
        chars={chars} roles={roles}
        purgedOrders={purgedOrders} setPurgedOrders={setPurgedOrders} 
        checkedState={checkedState} setCheckedState={setCheckedState} />

      <ScenarioDialog
        openDialog={openDialog}
        handleClose={handleClose}
        chars={chars}
        roles={roles} />
    </>
  )

}

function NightOrderDialog({openDialog, handleClose, players, setPlayers, 
  chars, roles, purgedOrders, setPurgedOrders, checkedState, setCheckedState}) {

  const ordering = useMemo(() => NightOrders.calculateOrder(players, chars, roles), [players, chars, roles]);
  const [openState, setOpenState] = useState(Array(32).fill(false));

  function handleOpenClick(index) {
    setOpenState(state => {
      const newState = !state[index];
      state = state.fill(false);
      state[index] = newState;
      return [...state];
    })
  }

  function handleCheckClick(index) {
    setCheckedState(state => {
      state[index] = !state[index]
      return [...state];
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

    if (openState[index] === true) {
      setOpenState(state => state.fill(false));
    }
    
  }

  function handleResetClick() {
    setPurgedOrders([]);
    setCheckedState(state => state.fill(false));
    setPlayers(prevPlayers => NightOrders.addOrderIndicators(ordering, prevPlayers));
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

    const button = (
      <Button
        component={"span"} 
        variant="text" 
        size="small" 
        sx={{mr: 1}}
        onClick={(event) => handlePurgeClick(index, event)}
      >
        {removed ? "undo" : "remove"}
      </Button>
    )

    return (
      <Fragment key={"orderListKey" + index + nightOrder.name}>
        <ListItem secondaryAction={button} disablePadding >
          <Checkbox 
            checked={checkedState[index] || removed}
            onChange={() => handleCheckClick(index)}
            disabled={removed}/>
          <ListItemButton disabled={removed} onClick={() => handleOpenClick(index)}>
            {openState[index] ? <ExpandLess /> : <ExpandMore />}
            <ListItemText primary={name} sx={removed ? {textDecoration: "line-through", color: "rgb(255, 0, 0)"} : {}}/>
          </ListItemButton>
        </ListItem>
        <Collapse in={openState[index]} timeout="auto" unmountOnExit>
          <Typography component={"span"}>{attrLong} Ability: {attribute.ability}</Typography>
        </Collapse>
      </Fragment>
    )
  })

  return (
    <Dialog open={openDialog === "nightOrder"} onClose={handleClose} fullWidth>
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

function ScenarioDialog({openDialog, handleClose, chars, roles}) {

  const listMaker = (ele, index) => {
    return (
      <ListItem disablePadding key={index}>
        <ListItemText primary={ele.name} secondary={ele.ability}/>
      </ListItem>
    )
  }

  const filter = (ele) => ele.name !== "Unknown";

  const charList = chars ? chars.filter(filter).map(listMaker) : [];
  const roleList = roles ? roles.filter(filter).map(listMaker) : [];

  return (
    <Dialog open={openDialog === "scenario"} onClose={handleClose} fullWidth>
      <DialogTitle>Current Scenario</DialogTitle>
      <DialogContent>
        <Typography variant="h5">Roles: {roleList.length}</Typography>
        <List>{roleList}</List>
        <Divider sx={{my: 4}} />
        <Typography variant="h5">Characteristics: {charList.length}</Typography>
        <List>{charList}</List>
      </DialogContent>
      <DialogActions>
        <Button onClose={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )

}
