import {useState, useRef} from "react";
import {Button, Menu, MenuItem, Box, Card, Typography, TextField, Dialog, 
  DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {socket} from "../socket.js";

function Options({session}) {

  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(0);
  const hostName = useRef("");
  const joinName = useRef("");
  const joinId = useRef("");
  const open = Boolean(anchorEl);
  
  function handleClose() {
    setAnchorEl(null);
    setOpenModal(0);
  };

  function handleHost() {

    const name = hostName.current.value;
    if (name.length > 0) {
      socket.emit("host", name);
      handleClose();
    }

  }

  function handleJoin() {

    const id = joinId.current.value;
    const name = joinName.current.value;
    if (name.length > 0) {
      socket.emit("join", id, name);
      handleClose();
    }

  }

  function handleLeave() {

    socket.emit("leave");
    handleClose();

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
          {session ? "" : <MenuItem onClick={() => {setOpenModal(1)}}>Host Session</MenuItem>}
          {session ? "" : <MenuItem onClick={() => {setOpenModal(2)}}>Join Session</MenuItem>}
          {session ? <MenuItem onClick={handleLeave}>Leave Session</MenuItem> : ""}
        </Menu>

        <Dialog disableRestoreFocus open={openModal === 1} onClose={handleClose}>
          <DialogTitle>Host Session</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To host a session, please enter your name below.
            </DialogContentText>
            <TextField
              inputRef={hostName}
              autoFocus
              margin="dense"
              id="host-name"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
            />
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
            <TextField
              inputRef={joinName}
              autoFocus
              margin="dense"
              id="join-name"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
            />
            <TextField
              inputRef={joinId}
              margin="dense"
              id="join-id"
              label="Session ID"
              type="text"
              fullWidth
              variant="standard"
            />
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
