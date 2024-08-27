import Char from "../classes/char.js";
import Reminder from "../classes/reminder.js";
import Role from "../classes/role.js";
import loader, { GameDataStore, RawImportData } from "../helpers/gameDataLoader.js";

const modules = import.meta.glob(["./*.json5", "./*/*.json5"], {
  query: "?raw",
  import: "default",
  eager: true,
}) as RawImportData;

const GameData: GameDataStore = {
  chars: [],
  roles: [],
  nightOrder: [],
  states: [],
  teams: [],
  scenarios: [],
  reminders: [],

  filterByScenario(scenarioArray, type, full) {

    const enabledSet = new Set(
      scenarioArray.map(scenario => {
        const scenarioFound = this.scenarios.find(ele => ele.name === scenario);
        if (scenarioFound) return scenarioFound[type];
        else throw new Error("filtering failed no matching scenario found");
      }).flat()
    )

    const return_data = this[type] // hack - leave unknown out of the filtering
    .filter(ele => enabledSet.has(ele.id) || ele.name === "Unknown")

    // full will include all the role and char data, instead of just the name
    return full ? return_data : return_data.map(role => role.name);
    
  },

  getFilteredReminders(charArray, roleArray) {

    const reminderArray: Reminder[] = [];

    charArray.concat(roleArray).forEach(ele => {
      if (ele.reminders?.length > 0) {
        reminderArray.push(...ele.reminders);
      }
    })

    return reminderArray;

  },

  getFilteredValues(scenarioArray) {

    const charArray = this.filterByScenario(scenarioArray, "chars", false) as string[];
    const roleArray = this.filterByScenario(scenarioArray, "roles", false) as string[];
    return [charArray, roleArray];

  },

  getFullFilteredValues(scenarioArray) {

    const charArray = this.filterByScenario(scenarioArray, "chars", true) as Char[];
    const roleArray = this.filterByScenario(scenarioArray, "roles", true) as Role[];
    return [charArray, roleArray];

  },

  hackValue(input) {
    return typeof input === "undefined" ? "Unknown" : input; 
  }

}

loader(GameData, modules);

console.log("GameData loaded", GameData);

export default GameData;