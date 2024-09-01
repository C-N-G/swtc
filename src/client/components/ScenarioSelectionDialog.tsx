import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List } from '@mui/material';
import { OpenCharacterDialog as OpenDialog } from '../helpers/enumTypes.ts';
import Scenario from '../classes/scenario.ts';

interface ScenarioSelectionDialogProps {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
  allScenarios: React.ReactNode[];
  setNewScenario: React.Dispatch<React.SetStateAction<Scenario>>
}

function ScenarioSelectionDialog({openDialog, setOpenDialog, allScenarios, setNewScenario}: ScenarioSelectionDialogProps) {

  function handleCreate() {
    setNewScenario(new Scenario("", "", "", [], []));
    setOpenDialog(OpenDialog.CreateScenario)
  }

  return (
    <Dialog open={openDialog === OpenDialog.Scenario} onClose={() => setOpenDialog(OpenDialog.None)} >
      <DialogTitle>Select Scenarios</DialogTitle>
      <DialogContent>
        <List>
          {allScenarios}
        </List>
      </DialogContent>
      <DialogActions sx={{justifyContent: "space-between"}}>
        <Button variant="outlined" onClick={handleCreate}>Create (W.I.P)</Button>
        <Button variant="outlined" onClick={() => setOpenDialog(OpenDialog.None)}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ScenarioSelectionDialog;