import {Card, Typography}from '@mui/material';

function Phase({phase}) {

  return (
    <Card sx={{
      background: "lightgreen", 
      height: "10vh", 
      flexGrow: 1,
      display: "flex", 
      justifyContent: "center",
      alignItems: "center",
    }}>
      <Typography variant="h4">Current Phase: {phase === 0 ? "Day" : "Night"}</Typography>
    </Card>
  );
}

export default Phase
