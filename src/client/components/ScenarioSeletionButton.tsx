import { Button, Checkbox, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { OpenCharacterDialog as OpenDialog } from '../helpers/enumTypes.ts';
import useStore from '../hooks/useStore.ts';
import GameData from "../strings/_gameData.ts";
import { useEffect, useState } from "react";
import Scenario, { ScenarioData } from "../classes/scenario.ts";
import ScenarioSelectionDialog from "./ScenarioSelectionDialog";
import ScenarioCreationDialog from "./ScenarioCreationDialog.tsx";
import DeleteIcon from '@mui/icons-material/Delete';
import ScenarioLoadingDialog from "./ScenarioLoadingDialog.tsx";

interface ScenarioSelectionButtonProps {
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
  storeOldData: () => void;
  openDialog: OpenDialog
}

function ScenarioSelectionButton({setOpenDialog, storeOldData, openDialog}: ScenarioSelectionButtonProps) {

  const scenarios = useStore(state => state.session.scenarios);
  const setScenarios = useStore(state => state.setScenarios);
  const [newScenario, setNewScenario] = useState<Scenario>(new Scenario("", "", "", [], []));

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

    GameData.scenarios = GameData.scenarios.filter(scenario => scenario.id !== scenarioId);
    setScenarios([...scenarios.filter(scenario => scenario.id !== scenarioId)]);
    const savedScenarioJson = localStorage.getItem("savedScenarios");
    if (savedScenarioJson !== null) {
      const savedScenarios = JSON.parse(savedScenarioJson);
      delete savedScenarios[scenarioId];
      localStorage.setItem("savedScenarios", JSON.stringify(savedScenarios));
    }
    setNewScenario(new Scenario("", "", "", [], []));

  }

  useEffect(() => {
    const savedScenarioJson = localStorage.getItem("savedScenarios");
    if (savedScenarioJson === null) return;
    const savedScenarios: {[scenarioId: string]: ScenarioData} = JSON.parse(savedScenarioJson);
    console.log("Loading Saved Scenarios: ", savedScenarios);

    Object.keys(savedScenarios).forEach(scenarioId => {

      if (GameData.scenarios.some(scenario => scenario.id === scenarioId)) return;

      const charsFound = savedScenarios[scenarioId].chars.every(charName => {
        return GameData.chars.some(char => char.name === charName);
      })
      const rolesFound = savedScenarios[scenarioId].roles.every(roleName => {
        return GameData.roles.some(role => role.name === roleName);
      })

      let updateScenario = false;
      const scenariosToPush: Scenario[] = [];
      if (charsFound && rolesFound) {
        const data = new Scenario(
          scenarioId,
          savedScenarios[scenarioId].name,
          savedScenarios[scenarioId].flavour,
          savedScenarios[scenarioId].chars.map(charName => GameData.chars.find(char => char.name === charName)!.id),
          savedScenarios[scenarioId].roles.map(roleName => GameData.roles.find(role => role.name === roleName)!.id),
        );
        scenariosToPush.push(data);
      } else {
        console.log(`deleting scenario "${savedScenarios[scenarioId].name}" due to data mismatch`);
        console.log(savedScenarios[scenarioId]);
        delete savedScenarios[scenarioId];
        updateScenario = true;
      }

      if (updateScenario) {
        localStorage.setItem("savedScenarios", JSON.stringify(savedScenarios));
      }

      if (scenariosToPush.length > 0) {
        GameData.scenarios.push(...scenariosToPush);
      }

    })
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // this only needs to run once and doesn't matter when it loads so it doesn't need the dependencies

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
    <ScenarioLoadingDialog
      openDialog={openDialog}
      setOpenDialog={setOpenDialog}
      setNewScenario={setNewScenario}
    />
  </>)
}

export default ScenarioSelectionButton;