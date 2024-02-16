import {useState} from "react";
import {Button, Menu, MenuItem, Box, Card, Typography, TextField, Dialog, 
  DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {socket} from "../helpers/socket.js";

function Options({session}) {

  const defaultInputs = {
    hostName: {value: "", error: false}, 
    joinName: {value: "", error: false}, 
    joinId: {value: "", error: false}
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(0);
  const [inputs, setInputs] = useState(defaultInputs);

  const open = Boolean(anchorEl);
  
  function handleClose() {
    setAnchorEl(null);
    setOpenModal(0);
    setInputs(defaultInputs);
  }

  function handleHost() {

    const name = inputs.hostName.value;
    if (name.length >= 3 && name.length <= 16) {
      socket.emit("host", name);
      handleClose();
    } else {
      setInputs(prev => { 
        return {...prev, hostName: {...prev.hostName, error: true}} 
      })
    }

  }

  function handleJoin() {

    const name = inputs.joinName.value;
    const id = inputs.joinId.value;
    
    const nameValidated = name.length >= 3 && name.length <= 16;
    const idValidated = id.length === 7;
    
    setInputs(prev => { 
      return {...prev, 
        joinName: {...prev.joinName, error: !nameValidated},
        joinId: {...prev.joinId, error: !idValidated}} 
    })
    
    if (nameValidated && idValidated) {
      socket.emit("join", id, name);
      handleClose();
    }


  }

  function handleLeave() {

    socket.emit("leave");
    handleClose();

  }

  function textFieldBuilder(id, label, input, errorText, handleFunc, focus) {

    return <TextField
      autoFocus={focus}
      margin="dense"
      id={id}
      label={label}
      type="text"
      fullWidth
      variant="standard"
      error={inputs[input].error}
      value={inputs[input].value}
      onChange={(e) => {setInputs(prev => {return {...prev, [input]: {...prev[input], value: e.target.value}}})}}
      onKeyDown={(e) => e.key === "Enter" ? handleFunc() : "" }
      helperText={inputs[input].error ? errorText : ""}
    />

  }

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
      <Box>
        <Button
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          size="large"
          variant="contained"
          endIcon={<MenuIcon />}
          onClick={(event) => {setAnchorEl(event.currentTarget)}}
        >
          Options
        </Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          {session.id ? "" : <MenuItem onClick={() => {setOpenModal(1)}}>Host Session</MenuItem>}
          {session.id ? "" : <MenuItem onClick={() => {setOpenModal(2)}}>Join Session</MenuItem>}
          {session.id ? <MenuItem onClick={handleLeave}>Leave Session</MenuItem> : ""}
        </Menu>

        <Dialog disableRestoreFocus open={openModal === 1} onClose={handleClose}>
          <DialogTitle>Host Session</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To host a session, please enter your name below.
            </DialogContentText>
            {textFieldBuilder("host-name", "Name", "hostName", "Must be between 3 to 16 characters", handleHost, true)}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleHost}>Host</Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </Dialog>        
        
        <Dialog disableRestoreFocus open={openModal === 2} onClose={handleClose}>
          <DialogTitle>Join Session</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To join a session, plase enter your display name.
              And the ID of the session you wish to connect to.
            </DialogContentText>
            {textFieldBuilder("join-name", "Name", "joinName", "Must be between 3 to 16 characters", handleJoin, true)}
            {textFieldBuilder("join-id", "Session ID", "joinId", "Must be 7 characters long", handleJoin, false)}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleJoin}>Join</Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Card>
  );
}

export default Options
