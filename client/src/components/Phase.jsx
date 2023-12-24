import {useContext} from "react";
import {Card, Button, Typography}from '@mui/material';
import {UserContext} from "../App.jsx";
import {socket} from "../socket.js";

function Phase({phase, setPhase}) {

  const user = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    if (user?.type === 0) {
      return <StoryTellerPhase phase={phase} setPhase={setPhase}/>
    } else if (user?.type === 1) {
      return <PlayerPhase phase={phase} />
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



function StoryTellerPhase({phase, setPhase}) {

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

      socket.emit("phase", {cycle: newCycle, round: newRound});


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
    </>
  )

}
