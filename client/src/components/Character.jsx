import { useContext } from 'react'
import {Card, Typography, Grid, Paper}from '@mui/material';
import {UserContext} from "../App.jsx";

function Character() {

  const user = useContext(UserContext);

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
      <Grid container justifyContent="left" mb={2} spacing={2}>
        <Grid item xs={6}>
          <Paper elevation={2} sx={{backgroundColor: "lightgreen"}}>
            <Typography variant="h6">State: {user.state === 1 ? "Alive" : "Dead"}</Typography> 
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={2} sx={{backgroundColor: "lightgreen"}}>
            <Typography variant="h6">Status: {user.status}</Typography> 
          </Paper>
        </Grid>
        <Grid item xs textAlign="right">
          <Typography>Role</Typography> 
          <Typography>Characteristic</Typography> 
          <Typography>Team</Typography> 
        </Grid>
        <Grid item xs textAlign="left">
          <Typography fontWeight={600}>{user.role}</Typography> 
          <Typography fontWeight={600}>{user.char}</Typography> 
          <Typography fontWeight={600}>{user.team === 0 ? "Loyalist" : "Subversive"}</Typography> 
        </Grid>
      </Grid>
      <iframe src="https://drive.google.com/file/d/1BSgDm_VNXi-e2_0v5L5Xd781-kFyde7k/preview" style={{flexGrow: 1}} allow="autoplay"></iframe>
    </Card>
  );
}

export default Character
