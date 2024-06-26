import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Player from "../classes/player.ts";
import { OpenBoardDialog as OpenDialog } from "../helpers/enumTypes.ts";
import Character from "./Character.tsx";

interface ViewPlayerDialog {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
  player: Player;
}

function ViewPlayerDialog({openDialog, setOpenDialog, player}: ViewPlayerDialog) {
  return (
    <Dialog open={openDialog === OpenDialog.ViewPlayer} onClose={() => setOpenDialog(OpenDialog.None)} maxWidth={"xs"}>
      <DialogTitle>View Player</DialogTitle>
      <DialogContent>
        <Character user={player} useLocal={true}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(OpenDialog.None)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewPlayerDialog;