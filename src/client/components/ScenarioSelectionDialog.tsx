import { Dialog, DialogTitle, DialogContent, FormGroup, DialogActions, Button } from '@mui/material';
import { OpenCharacterDialog as OpenDialog } from '../helpers/enumTypes.ts';

interface ScenarioSelectionDialogProps {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
  allMods: React.ReactNode[];
}

function ScenarioSelectionDialog({openDialog, setOpenDialog, allMods}: ScenarioSelectionDialogProps) {

  return (
    <Dialog open={openDialog === OpenDialog.Scenario} onClose={() => setOpenDialog(OpenDialog.None)} >
      <DialogTitle>Select Scenarios</DialogTitle>
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

export default ScenarioSelectionDialog;