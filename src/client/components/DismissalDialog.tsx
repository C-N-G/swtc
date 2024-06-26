import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, Select, SelectChangeEvent } from "@mui/material";
import { OpenBoardDialog as OpenDialog } from "../helpers/enumTypes.ts";
import useStore from "../hooks/useStore.ts";

interface DismissalDialog {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
  handlePlayerSelect: (event: SelectChangeEvent<string>) => void;
  selectablePlayers: React.ReactNode[];
  handleBeginClick: () => void;
}

function DismissalDialog({openDialog, setOpenDialog, 
  handlePlayerSelect, selectablePlayers, handleBeginClick}: DismissalDialog) {

    const accusingPlayerId = useStore(state => state.votes.accusingPlayer);

  return (
    <Dialog open={openDialog === OpenDialog.Dismiss} onClose={() => setOpenDialog(OpenDialog.None)}>
      <DialogTitle>Player Select</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please select the player who nominated this player
        </DialogContentText>
        <FormControl fullWidth> 
          <InputLabel id="nominating-player-select-label">Player</InputLabel>
          <Select
            labelId="nominating-player-select-label" 
            id="nominating-player-select"
            label="Player"
            value={accusingPlayerId ? accusingPlayerId : ""}
            onChange={handlePlayerSelect} 
          >
            {selectablePlayers}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button 
          disabled={accusingPlayerId === null} 
          onClick={handleBeginClick}
        >
          Begin
        </Button>
        <Button onClick={() => setOpenDialog(OpenDialog.None)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}

export default DismissalDialog;