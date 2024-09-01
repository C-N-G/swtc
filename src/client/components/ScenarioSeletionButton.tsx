import { Button, Checkbox, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { OpenCharacterDialog as OpenDialog } from '../helpers/enumTypes.ts';
import useStore from '../hooks/useStore.ts';
import GameData from "../strings/_gameData.ts";
import { useState } from "react";
import Scenario from "../classes/scenario.ts";
import ScenarioSelectionDialog from "./ScenarioSelectionDialog";
import ScenarioCreationDialog from "./ScenarioCreationDialog.tsx";
import DeleteIcon from '@mui/icons-material/Delete';

interface ScenarioSelectionButtonProps {
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
  storeOldData: () => void;
  openDialog: OpenDialog
}

function ScenarioSelectionButton({setOpenDialog, storeOldData, openDialog}: ScenarioSelectionButtonProps) {

  const scenarios = useStore(state => state.session.scenarios);
  const setScenarios = useStore(state => state.setScenarios);
  const [newScenario, setNewScenario] = useState<Scenario>(new Scenario("", "", "", [], []))

  function handleScenarioSelection(scenarioId: string) {

    storeOldData();

    const checked = scenarios.some(ele => ele.id === scenarioId)

    let data: Scenario[] = [];

    if (checked === false) {
      data = [...scenarios, GameData.scenarios.find((scenario) => scenario.id === scenarioId)!];
    }

    if (checked === true) {
      data = scenarios.filter((scenario) => scenario.id !== scenarioId);
    }

    setScenarios(data, false);

  }

  function handleDelete(scenarioId: string) {
    console.log("deleting")
    GameData.scenarios = GameData.scenarios.filter(ele => ele.id !== scenarioId);
    setNewScenario(new Scenario("", "", "", [], []));
    console.log(GameData.scenarios)
  }

  const allScenarios = GameData.scenarios.map(scenario => {
    const title = `${scenario.name} - ${scenario.roles.length} roles - ${scenario.chars.length} chars`;
    const isCustom = scenario.id.length === 40;
    const listItem = <ListItem 
        key={scenario.name}
        disablePadding
      >
        <ListItemButton onClick={() => handleScenarioSelection(scenario.id)}>
          <ListItemIcon>
            <Checkbox 
              edge="start"
              checked={scenarios.some(ele => ele.id === scenario.id)} 
              value={scenario.id} 
            />
          </ListItemIcon>
          <ListItemText>
            {title}
          </ListItemText>
          
        </ListItemButton>
        {isCustom && 
          <Button 
            sx={{ml: 1}} 
            variant="outlined"
            onClick={() => {setNewScenario(GameData.scenarios.find(ele => ele.id === scenario.id)!); setOpenDialog(OpenDialog.CreateScenario)}}
          >
            Edit
          </Button>
        }
        {isCustom && 
          <IconButton 
            aria-label="delete"
            onClick={() => handleDelete(scenario.id)}
          >
            <DeleteIcon />
          </IconButton>
        }
      </ListItem>
    return listItem
  })

  return (<>
    <Button variant="contained" sx={{my: 1}} onClick={() => setOpenDialog(OpenDialog.Scenario)}>
      Select Scenarios ({scenarios.length})
    </Button>
    <ScenarioSelectionDialog 
      openDialog={openDialog}
      setOpenDialog={setOpenDialog}
      allScenarios={allScenarios}
      setNewScenario={setNewScenario}
    />
    <ScenarioCreationDialog
      openDialog={openDialog}
      setOpenDialog={setOpenDialog}
      newScenario={newScenario}
      setNewScenario={setNewScenario}
    />
  </>)
}

export default ScenarioSelectionButton;