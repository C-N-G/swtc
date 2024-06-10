import {Fragment, useContext, useMemo, useState} from "react";
import {Card, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, List, 
  ListItemButton, Collapse, ListItemText, ButtonGroup, Stack, Grid, ListItem, Divider, Checkbox, Tab, Tabs, Box}from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {UserContext} from "../App.tsx";
import {socket} from "../helpers/socket.ts";
import GameData from "../strings/_gameData.ts";
import NightOrders, { OrderItem } from "../helpers/nightOrders.ts";
import useStore from "../hooks/useStore.ts";
import Char from "../classes/char.ts";
import Role from "../classes/role.ts";



function Phase() {

  const user = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    if (user?.type === 0) {
      return <NarratorPhase />
    } else if (user?.type === 1) {
      return <PlayerPhase />
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



enum OpenDialog {
  None,
  Scenario,
  NightOrder,
}

function PlayerPhase() {

  const modules = useStore(state => state.session.modules);
  const [openDialog, setOpenDialog] = useState<OpenDialog>(OpenDialog.None);
  const [chars, roles] = useMemo(() => GameData.getFullFilteredValues(modules), [modules]);
  const handleClose = () => setOpenDialog(OpenDialog.None);
  const phase = useStore(state => state.phase);
  const voting = useStore(state => state.votes.voting);
  const voteTimer = useStore(state => state.timers.voteTimer);
  const displayVote = useStore(state => state.displayVote);
  
  return (<>
    <Grid container alignItems="center">
      <Grid item xs={4} container justifyContent="center">
        <ButtonGroup size="small" orientation="vertical">
          <Button onClick={() => setOpenDialog(OpenDialog.Scenario)}>Show Scenario</Button>
          {voting ? <Button onClick={() => displayVote()}>Show Vote ({voteTimer.time})</Button> : ""}
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



type StateArray = boolean[];

function NarratorPhase() {

  const modules = useStore(state => state.session.modules);
  const [chars, roles] = useMemo(() => GameData.getFullFilteredValues(modules), [modules]);
  const [checkedState, setCheckedState] = useState<StateArray>(Array(32).fill(false));
  const [openDialog, setOpenDialog] = useState(OpenDialog.None);
  const phase = useStore(state => state.phase);
  const nextPhase = useStore(state => state.nextPhase);
  const addPlayerNightIndicators = useStore(state => state.addPlayerNightIndicators);
  const players = useStore(state => state.players);
  const purgedOrders = useStore(state => state.purgedOrders);
  const voting = useStore(state => state.votes.voting);
  const displayVote = useStore(state => state.displayVote);


  function handleClick() {

      let newCycle;
      let newRound;

      if (phase.cycle === "Night") {
        newCycle = "Day";
        newRound = phase.round + 1;
      } else if (phase.cycle === "Day") {
        newCycle = "Night";
        newRound = phase.round;
      } else throw new Error("error changing phase, phase could not be calculated");

      addPlayerNightIndicators(newCycle, chars, roles, purgedOrders);

      if (players[0].id === "54321") {
        nextPhase({cycle: newCycle, round: newRound});
      } else {
        socket.emit("phase", {cycle: newCycle, round: newRound});
      }

      setCheckedState(state => state.fill(false));


  }

  function handleClose() {
    setOpenDialog(OpenDialog.None);
  }

  return (
    <>
      <Grid container alignItems="center">
        <Grid item xs={4} container justifyContent="center">
          <ButtonGroup size="small" orientation="vertical">
            <Button onClick={() => setOpenDialog(OpenDialog.Scenario)}>Show Scenario</Button>
            {voting ? <Button onClick={() => displayVote()}>Show Vote</Button> : ""}
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
            <Button onClick={() => handleClick()}>&gt; Progress Phase &gt;</Button>
            <Button disabled={phase.cycle !== "Night"} onClick={() => setOpenDialog(OpenDialog.Scenario)}>Night Order List</Button>
          </ButtonGroup>
        </Grid>
      </Grid>

      <NightOrderDialog 
        openDialog={openDialog} handleClose={handleClose}
        chars={chars} roles={roles}
        checkedState={checkedState} setCheckedState={setCheckedState} />

      <ScenarioDialog
        openDialog={openDialog}
        handleClose={handleClose}
        chars={chars}
        roles={roles} />
    </>
  )

}



interface NightOrderDialogProps {
  openDialog: OpenDialog;
  handleClose: () => void;
  chars: Char[];
  roles: Role[];
  checkedState: boolean[];
  setCheckedState: React.Dispatch<React.SetStateAction<StateArray>>;
}

function NightOrderDialog({openDialog, handleClose, chars, roles, checkedState, setCheckedState}: NightOrderDialogProps) {

  const players = useStore(state => state.players);
  const ordering = useMemo(() => NightOrders.calculateOrder(players, chars, roles), [players, chars, roles]);
  const [openState, setOpenState] = useState<StateArray>(Array(32).fill(false));
  const addPurgedOrder = useStore(state => state.addPurgedOrder);
  const removePurgedOrders = useStore(state => state.removePurgedOrders);
  const purgedOrders = useStore(state => state.purgedOrders);
  

  function handleOpenClick(index: number) {
    setOpenState(state => {
      const newState = !state[index];
      state = state.fill(false);
      state[index] = newState;
      return [...state];
    })
  }

  function handleCheckClick(index: number) {
    setCheckedState(state => {
      state[index] = !state[index]
      return [...state];
    })
  }

  function handlePurgeClick(index: number, event: React.MouseEvent<HTMLSpanElement, MouseEvent>) {

    addPurgedOrder(event, index, ordering, chars, roles);

    if (openState[index] === true) {
      setOpenState(state => state.fill(false));
    }
    
  }

  function handleResetClick() {
    removePurgedOrders(chars, roles, ordering);
    setCheckedState(state => state.fill(false));
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
    } else throw Error("error rendering night orders, night order type not found");

    const removed = purgedOrders.includes(JSON.stringify(ordering[index])) ? true : false;

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
    <Dialog open={openDialog === OpenDialog.NightOrder} onClose={handleClose} fullWidth>
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



interface ScenarioDialogProps {
  openDialog: OpenDialog;
  handleClose: () => void;
  chars: Char[];
  roles: Role[];
}

function ScenarioDialog({openDialog, handleClose, chars, roles}: ScenarioDialogProps) {

  const fullOrdering = useMemo(() => NightOrders.calculateFullOrder(chars, roles), [chars, roles]);
  const [openTab, setOpenTab] = useState(0);

  function handleChange(_: unknown, newValue: number) {
    setOpenTab(newValue);
  }

  const listMaker = (ele: Char | Role, index: number) => {
    const attributes = ele.attributes.length > 0 ? `[${ele.attributes.join(", ")}]` : "";
    const name = <Typography component="span" fontWeight="bold">{ele.name}</Typography>
    const primary = <Typography>{name} {attributes}</Typography>
    return (
      <ListItem disablePadding key={index}>
        <ListItemText primary={primary} secondary={ele.ability}/>
      </ListItem>
    )
  }

  const nightOrderList = useMemo(() => {
    const returnList: React.ReactNode[] = [];

    let tempList: React.ReactNode[] = []; 
    let lastEle: OrderItem;
    fullOrdering.forEach((ele, index) => {

      function print(text: string, keyIndex: number) {
        returnList.push(
          <Fragment key={keyIndex + "heading"}>
            <Grid item xs={6}><Typography fontWeight="bold">{text}</Typography></Grid>
            <Grid item xs={6}>{tempList}</Grid>
          </Fragment>
        )
      }

      const different = index === 0 ? false : lastEle.order !== ele.order;

      if (different) {
        print(GameData.nightOrder[lastEle.order].description, index);
        tempList = [];
      }

      tempList.push(<Typography key={index}>{index+1} - {ele.name}</Typography>);

      if (index === fullOrdering.length-1) {
        print(GameData.nightOrder[ele.order].description, index+1);
      }

      lastEle = ele;

    })

    return (
      <Grid container spacing={4}>
        <Grid item xs={6} sx={{textAlign: "center"}}>
          <Typography variant="h5" fontWeight="bold">Ability Type</Typography>
        </Grid>
        <Grid item xs={6} sx={{textAlign: "center"}}>
        <Typography variant="h5" fontWeight="bold">Char/Role</Typography>
        </Grid>
        {returnList}
      </Grid>
    )

  }, [fullOrdering])

  const filter = (ele: Char | Role) => ele.name !== "Unknown";
  const agentFilter = (ele: Role) => ele.type === "Agent";
  const detriFilter = (ele: Role) => ele.type === "Detrimental";
  const antagFilter = (ele: Role) => ele.type === "Antagonist";

  const tabStyle = {
    borderBottom: 1, 
    borderColor: "divider", 
    mb:2, 
    position: "sticky",
    top: 0,
    zIndex: 1,
    background: "white"
  }

  const charList = chars ? chars.filter(filter).map(listMaker) : [];
  const usableRoles = roles.filter(filter);
  const agentRoleList = usableRoles ? usableRoles.filter(agentFilter).map(listMaker) : [];
  const detriRoleList = usableRoles ? usableRoles.filter(detriFilter).map(listMaker) : [];
  const antagRoleList = usableRoles ? usableRoles.filter(antagFilter).map(listMaker) : [];

  return (
    <Dialog open={openDialog === OpenDialog.Scenario} onClose={handleClose} fullWidth>
      <DialogTitle>Current Scenario</DialogTitle>
      <DialogContent>
        <Box sx={tabStyle}>
          <Tabs value={openTab} onChange={handleChange} variant="fullWidth" >
            <Tab label="Active Elements" />
            <Tab label="Night Order" />
          </Tabs>
        </Box>
        <Box hidden={openTab !== 0}>
          <Typography variant="h4">Roles: {usableRoles.length}</Typography>
          <Typography variant="h5">Agents: {agentRoleList.length}</Typography>
          <List>{agentRoleList}</List>
          <Typography variant="h5">Detrimentals: {detriRoleList.length}</Typography>
          <List>{detriRoleList}</List>
          <Typography variant="h5">Antagonists: {antagRoleList.length}</Typography>
          <List>{antagRoleList}</List>
          <Divider sx={{my: 4}} />
          <Typography variant="h4">Characteristics: {charList.length}</Typography>
          <List>{charList}</List>
        </Box>
        <Box hidden={openTab !== 1}>
          {nightOrderList}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )

}
