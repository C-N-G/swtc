import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import { OpenCharacterDialog as OpenDialog } from '../helpers/enumTypes.ts';
import { ScenarioData } from '../classes/scenario.ts';
import { useState } from 'react';
import GameData from '../strings/_gameData.ts';

interface ScenarioLoadingDialogProps {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
}

function ScenarioLoadingDialog({openDialog, setOpenDialog}: ScenarioLoadingDialogProps) {

  const [inputJSON, setInputJson] = useState<string>();
  const [inputError, setInputError] = useState<string>();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const value = e.target.value;
    setInputJson(value);
  }

  function validateJSON(input: string) {

    let convertedJSON: ScenarioData;
    let isValid = true;

    // validate that it is valid json
    try {
      convertedJSON = JSON.parse(input);
    } catch(error: unknown) {
      isValid = false;
    }

    if (!isValid || convertedJSON! === undefined) return "error: could not parse json from string";

    // validate all the fields are correct
    const fields = Object.keys(convertedJSON);

    if (fields.length !== 4 || 
      !fields.includes("name") ||
      !fields.includes("flavour") ||
      !fields.includes("chars") ||
      !fields.includes("roles")
    ) {
      isValid = false;
    }

    if (!isValid) return "error: parsed json does not have the correct properties";

    // validate the length values are within limit
    if (convertedJSON.name.length > 32 ||
      convertedJSON.flavour.length > 200 ||
      convertedJSON.chars.length > 30 ||
      convertedJSON.roles.length > 30
    ) {
      isValid = false;
    }

    if (!isValid) return "error: parsed json is too long";

    // validate that each role are char matches to something in the GameData 
    // and that there are no duplicates in the roles or chars given
    const completedItems: string[] = [];
    const misMatchedItems: string[] = [];

    convertedJSON.chars.forEach(char => {
      const foundChar = GameData.chars.find(ele => ele.name.toLowerCase() === char.toLowerCase());
      if (foundChar === undefined || completedItems.includes(char)) {
        isValid = false;
        misMatchedItems.push(char);
      }
      else completedItems.push(char);
    })

    convertedJSON.roles.forEach(role => {
      const foundRole = GameData.roles.find(ele => ele.name.toLowerCase() === role.toLowerCase());
      if (foundRole === undefined || completedItems.includes(role)) {
        isValid = false;
        misMatchedItems.push(role);
      }
      else completedItems.push(role);
    })

    if (!isValid) return `error: ${misMatchedItems.length} items found in roles or characteristics were invalid`;

    return "valid json found";

  }

  function loadJSON() {
    
    if (inputJSON === undefined) return;
      
    const validationFeedback = validateJSON(inputJSON);

    if (validationFeedback.startsWith("error")) return setInputError(validationFeedback);
    else if (validationFeedback !== "valid json found") return setInputError("unknown json validation error");

    const json = JSON.parse(inputJSON);
    // set new scenario to this value and open scenario creator

  }

  return (
    <Dialog open={openDialog === OpenDialog.LoadScenario} onClose={() => setOpenDialog(OpenDialog.None)} >
      <DialogTitle>Load Scenario JSON</DialogTitle>
      <DialogContent>
        <Typography>
          Please paste in the JSON data from any previously saved scenario files you want to load into the application and then press load!
        </Typography>
        <TextField
              margin="dense"
              size="small"
              id="load-scenario-json-input"
              label="JSON"
              type="text"
              multiline
              rows={10}
              fullWidth
              variant="outlined"
              value={inputJSON}
              onChange={handleChange}
              error={inputError !== undefined}
              helperText={inputError}
            />
        </DialogContent>
      <DialogActions sx={{justifyContent: "space-between"}}>
        <Button variant="outlined" onClick={() => loadJSON()}>Load</Button>
        <Button variant="outlined" onClick={() => setOpenDialog(OpenDialog.Scenario)}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ScenarioLoadingDialog;