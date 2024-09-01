import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List } from '@mui/material';
import { OpenCharacterDialog as OpenDialog } from '../helpers/enumTypes.ts';

interface ScenarioSelectionDialogProps {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
  allScenarios: React.ReactNode[];
}

function ScenarioSelectionDialog({openDialog, setOpenDialog, allScenarios}: ScenarioSelectionDialogProps) {

  return (
    <Dialog open={openDialog === OpenDialog.Scenario} onClose={() => setOpenDialog(OpenDialog.None)} >
      <DialogTitle>Select Scenarios</DialogTitle>
      <DialogContent>
        <List>
          {allScenarios}
        </List>
      </DialogContent>
      <DialogActions sx={{justifyContent: "space-between"}}>
        <Button variant="outlined" onClick={() => setOpenDialog(OpenDialog.CreateScenario)}>Create (W.I.P)</Button>
        <Button variant="outlined" onClick={() => setOpenDialog(OpenDialog.None)}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ScenarioSelectionDialog;