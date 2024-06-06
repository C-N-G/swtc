import {useState} from "react";
import {Button, Menu, MenuItem, Box, Card, Typography, TextField, Dialog, 
  DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {socket} from "../helpers/socket.js";
import useStore from "../hooks/useStore.js";

function textFieldBuilder(id, label, input, handleFunc, focus, setInputs, inputs) {

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
    helperText={inputs[input].error ? inputs[input].errorText : ""}
  />

}

const dialog = Object.freeze({
  hide: 0,
  host: 1,
  join: 2
})

function Options() {

  const sessionId = useStore(state => state.session.id);

  const defaultInputs = {
    hostName: {value: "", error: false, errorText: ""}, 
    joinName: {value: "", error: false, errorText: ""}, 
    joinId: {value: "", error: false, errorText: ""}
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(dialog.hide);
  const [inputs, setInputs] = useState(defaultInputs);

  const open = Boolean(anchorEl);
  
  function handleClose() {
    setAnchorEl(null);
    setOpenDialog(dialog.hide);
    setInputs(defaultInputs);
  }

  function handleHost() {

    const name = inputs.hostName.value;
    if (name.length >= 3 && name.length <= 16) {
      socket.emit("host", name);
      handleClose();
    } else {
      setInputs(prev => { 
        return {...prev, hostName: {...prev.hostName, error: true, errorText: "Must be between 3 to 16 characters"}} 
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
        joinName: {...prev.joinName, error: !nameValidated, errorText: "Must be between 3 to 16 characters"},
        joinId: {...prev.joinId, error: !idValidated, errorText: "Must be 7 characters long"}} 
    })
    
    if (nameValidated && idValidated) {

      socket.timeout(5000).emit("join", id, name, (error, response) => {
        
        // TODO need to add local state loading during manual resuming

        if (error) {
          console.log("Join Error: server timeout");
          setInputs(prev => ({...prev, joinId: {...prev.joinId, error: true, errorText: "Server timeout"}}));
          return;
        }

        if (response.status === "error") {

          console.log("Join Error:", response.error);

          switch (response.error) {
            case "already in session":
              break;

            case "no session found":
              setInputs(prev => ({...prev, joinId: {...prev.joinId, error: true, errorText: "Session not found"}}));
              break;

            case "name taken":
              setInputs(prev => ({...prev, joinName: {...prev.joinName, error: true, errorText: "Name already taken"}}));
              break;

            default:
              break;
          }

        } else if (response.status === "ok") {
          handleClose();
        }

      });

    }


  }

  function handleLeave() {

    localStorage.removeItem("lastSession");
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
          {sessionId ? "" : <MenuItem onClick={() => {setOpenDialog(dialog.host)}}>Host Session</MenuItem>}
          {sessionId ? "" : <MenuItem onClick={() => {setOpenDialog(dialog.join)}}>Join Session</MenuItem>}
          {sessionId ? <MenuItem onClick={handleLeave}>Leave Session</MenuItem> : ""}
          <MenuItem 
            component={"a"}
            href="https://drive.google.com/file/d/1BSgDm_VNXi-e2_0v5L5Xd781-kFyde7k/preview" 
            target="_blank"
          >
            Rulebook
          </MenuItem>
        </Menu>
        <HostDialog 
          openDialog={openDialog}
          handleClose={handleClose}
          handleHost={handleHost}
          setInputs={setInputs}
          inputs={inputs}
        />
        <JoinDialog 
          openDialog={openDialog}
          handleClose={handleClose}
          handleJoin={handleJoin}
          setInputs={setInputs}
          inputs={inputs}
        />
      </Box>
    </Card>
  );
}

export default Options

function HostDialog({openDialog, handleClose, handleHost, setInputs, inputs}) {

  return (
    <Dialog disableRestoreFocus open={openDialog === dialog.host} onClose={handleClose}>
      <DialogTitle>Host Session</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To host a session, please enter your name below.
        </DialogContentText>
        {textFieldBuilder("host-name", "Name", "hostName", handleHost, true, setInputs, inputs)}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleHost}>Host</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>  
  )

}

function JoinDialog({openDialog, handleClose, handleJoin, setInputs, inputs}) {

  return (
    <Dialog disableRestoreFocus open={openDialog === dialog.join} onClose={handleClose}>
      <DialogTitle>Join Session</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To join a session, plase enter your display name.
          And the ID of the session you wish to connect to.
        </DialogContentText>
        {textFieldBuilder("join-name", "Name", "joinName", handleJoin, true, setInputs, inputs)}
        {textFieldBuilder("join-id", "Session ID", "joinId", handleJoin, false, setInputs, inputs)}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleJoin}>Join</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )

}