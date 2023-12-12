import {useContext} from "react";
import {Card, Button, Typography}from '@mui/material';
import {UserContext} from "../App.jsx";

function Phase({phase, setPhase}) {

  const user = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    if (user.type === 0) {
      return <StoryTellerPhase phase={phase} setPhase={setPhase}/>
    } else if (user.type === 1) {
      return <PlayerPhase phase={phase} />
    } else {
      return false
    }

  }

  return getUserTypeCheckedComponent();
}

export default Phase



function PlayerPhase({phase}) {
  
  return (
    <Card sx={{
      background: "lightgreen", 
      height: "10vh", 
      flexGrow: 1,
      display: "flex", 
      justifyContent: "center",
      alignItems: "center",
    }}>
      <Typography variant="h4">Current Phase: {phase.cycle} {phase.round}</Typography>
    </Card>
  )

}



function StoryTellerPhase({phase, setPhase}) {

  function hanldeClick() {

    setPhase((prev) => {

      let newCycle;
      let newRound;

      if (prev.cycle === "Night") {
        newCycle = "Day";
        newRound = prev.round;
      } else if (prev.cycle === "Day") {
        newCycle = "Night";
        newRound = prev.round + 1;
      }

      return {cycle: newCycle, round: newRound}

    })

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
      <Typography variant="h4">Current Phase: {phase.cycle} {phase.round}</Typography>
      <Button 
        size="small" 
        onClick={() => hanldeClick()}
        variant="contained"
        sx={{m: 1}}
      >
        Progress Phase
      </Button>
    </Card>
  )

}
