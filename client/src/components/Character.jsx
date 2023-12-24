import { useContext } from 'react'
import {Card, Typography, Grid, Paper}from '@mui/material';
import {UserContext} from "../App.jsx";
import {STATES, ROLES, CHARS, STATUSES} from "../data.js";

function Character(props) {

  const user = useContext(UserContext);

  const getUserTypeCheckedComponent = () => {

    if (user?.type === 0) {
      return <StoryTellerCharacter {...props} />
    } else if (user?.type === 1) {
      return <PlayerCharacter user={user} {...props} />
    } else {
      return false
    }

  }

  return (
    <Card sx={{
      background: "darkseagreen", 
      width: "100%",
      height: "70%",
      display: "flex", 
      textAlign: "center", 
      flexDirection: "column",
      boxSizing: "border-box",
      p: 2,
    }}>
      {getUserTypeCheckedComponent()}
    </Card>
  );
}

export default Character


function PlayerCharacter({user}) {

  return (<>
      <Grid container justifyContent="left" mb={2} spacing={2}>
      <Grid item xs={6}>
        <Paper elevation={2} sx={{backgroundColor: "lightgreen"}}>
          <Typography variant="h6">State: {STATES[user.rState]}</Typography> 
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Paper elevation={2} sx={{backgroundColor: "lightgreen"}}>
          <Typography variant="h6">Status: {STATUSES[user.rStatus]}</Typography> 
        </Paper>
      </Grid>
      <Grid item xs textAlign="right">
        <Typography>Role</Typography> 
        <Typography>Characteristic</Typography> 
        <Typography>Team</Typography> 
      </Grid>
      <Grid item xs textAlign="left">
        <Typography fontWeight={600}>{ROLES[user.rRole]}</Typography> 
        <Typography fontWeight={600}>{CHARS[user.rChar]}</Typography> 
        <Typography fontWeight={600}>{user.team === 0 ? "Loyalist" : "Subversive"}</Typography> 
      </Grid>
    </Grid>
    <iframe src="https://drive.google.com/file/d/1BSgDm_VNXi-e2_0v5L5Xd781-kFyde7k/preview" style={{flexGrow: 1}} allow="autoplay"></iframe>
  </>)

}


function StoryTellerCharacter({session}) {

  return (<>
    <Typography variant="h6">Session Id: {session}</Typography>
  </>)

}
