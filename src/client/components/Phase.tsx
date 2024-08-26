import {useContext, useMemo, useState} from "react";
import {Card, Button, Typography, ButtonGroup, Stack, Grid, Box}from '@mui/material';
import {UserContext} from "../App.tsx";
import {socket} from "../helpers/socket.ts";
import GameData from "../strings/_gameData.ts";
import useStore from "../hooks/useStore.ts";
import { OpenPhaseDialog as OpenDialog } from "../helpers/enumTypes.ts";
import ScenarioDialog from "./ScenarioDialog.tsx";
import NightOrderDialog from "./NightOrderDialog.tsx";



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
    background: "var(--sl-color-gray-5)", 
    borderBottom: "2px solid var(--sl-color-accent)",
    height: "10vh", 
    flexGrow: 1,
    display: "flex", 
    justifyContent: "space-evenly",
    alignItems: "center",
    boxSizing: "border-box",
  }}>
    {getUserTypeCheckedComponent()}
  </Card>
  )
}

const PHASE_ANIMATION = (cycle: string) => ({
  borderRadius: "50px",
  color: cycle === "Night" ? "white" : "black",
  background: cycle === "Night" ? "black" : "white",
  border: `solid 10px ${cycle === "Night" ? "black": "white"}`,
  boxShadow: `0 0 30px 50px ${cycle === "Night" ? "black" : "white"}`,
  transition: "color 0.5s, background 0.5s, box-shadow, 0.5s",
})

// firefox does not render border radius and box shadow properly so this is a workaround
const FAKE_BORDER = (cycle: string) => ({
  background: cycle === "Night" ? "black" : "white",
  transition: "background 0.5s",
})

export default Phase


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
        <Box sx={FAKE_BORDER(phase.cycle)}>
          <Stack alignItems="center" spacing={-1} sx={PHASE_ANIMATION(phase.cycle)}>
            <Typography variant="h5">Current Phase</Typography>
            <Typography variant="h3">{phase.cycle} {phase.round}</Typography>
          </Stack>
        </Box>
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




function NarratorPhase() {

  const modules = useStore(state => state.session.modules);
  const [chars, roles] = useMemo(() => GameData.getFullFilteredValues(modules), [modules]);
  const [openDialog, setOpenDialog] = useState(OpenDialog.None);
  const phase = useStore(state => state.phase);
  const nextPhase = useStore(state => state.nextPhase);
  const addPlayerNightIndicators = useStore(state => state.addPlayerNightIndicators);
  const players = useStore(state => state.players);
  const purgedOrders = useStore(state => state.purgedOrders);
  const voting = useStore(state => state.votes.voting);
  const displayVote = useStore(state => state.displayVote);
  const removeAllCompletedOrders = useStore(state => state.removeAllCompletedOrders);


  function handleClick() {

      let newCycle;
      let newRound;

      if (phase.cycle === "Night") {
        newCycle = "Day";
        newRound = phase.round;
      } else if (phase.cycle === "Day") {
        newCycle = "Night";
        newRound = phase.round + 1;
      } else throw new Error("error changing phase, phase could not be calculated");

      addPlayerNightIndicators(newCycle, chars, roles, purgedOrders);

      if (players[0].id === "54321") {
        nextPhase({cycle: newCycle, round: newRound});
      } else {
        socket.emit("phase", {cycle: newCycle, round: newRound});
      }

      removeAllCompletedOrders();


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
          <Box sx={FAKE_BORDER(phase.cycle)}>
            <Stack alignItems="center" spacing={-1} sx={PHASE_ANIMATION(phase.cycle)}>
              <Typography variant="h5">Current Phase</Typography>
              <Typography variant="h3">{phase.cycle} {phase.round}</Typography>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={4} container justifyContent="center">
          <ButtonGroup size="small" orientation="vertical">
            <Button onClick={() => handleClick()}>&gt; Progress Phase &gt;</Button>
            <Button disabled={phase.cycle !== "Night"} onClick={() => setOpenDialog(OpenDialog.NightOrder)}>Night Order List</Button>
          </ButtonGroup>
        </Grid>
      </Grid>

      <NightOrderDialog 
        openDialog={openDialog} handleClose={handleClose}
        chars={chars} roles={roles} />

      <ScenarioDialog
        openDialog={openDialog}
        handleClose={handleClose}
        chars={chars}
        roles={roles} />
    </>
  )

}








