import {Card, Button, Typography}from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';

function Options() {

  return (
    <Card sx={{
      background: "lightcoral", 
      height: "10vh", 
      display: "flex", 
      justifyContent: "space-around", 
      alignItems: "center",
      boxSizing: "border-box",
      p: 2,
    }}>
      <Typography variant="h6">Secrets Within the Compound</Typography>
      <Button variant="contained" endIcon={<MenuIcon />}>
        Menu
      </Button>
    </Card>
  );
}

export default Options
