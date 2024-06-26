import { Dialog, DialogTitle, DialogContent, FormGroup, DialogActions, Button } from '@mui/material';
import { OpenCharacterDialog as OpenDialog } from '../helpers/enumTypes.ts';

interface ModuleSelectionDialogProps {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
  allMods: React.ReactNode[];
}

function ModuleSelectionDialog({openDialog, setOpenDialog, allMods}: ModuleSelectionDialogProps) {

  return (
    <Dialog open={openDialog === OpenDialog.Module} onClose={() => setOpenDialog(OpenDialog.None)} >
      <DialogTitle>Select Modules</DialogTitle>
      <DialogContent>
        <FormGroup>
          {allMods}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setOpenDialog(OpenDialog.None)}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModuleSelectionDialog;