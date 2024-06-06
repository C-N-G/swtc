import Char from "../classes/char.js";
import Reminder from "../classes/reminder.js";
import Role from "../classes/role.js";
import loader, { GameDataStore, ImportInterface } from "../helpers/gameDataLoader.js";

const modules = import.meta.glob(["./*.json", "./modules/*/*.json"], {eager: true}) as ImportInterface;

const GameData: GameDataStore = {
  chars: [],
  roles: [],
  nightOrder: [],
  states: [],
  teams: [],
  modules: [],
  reminders: [],

  filterByModule(moduleArray, type, full) {

    const enabledSet = new Set(
      moduleArray.map(mod => {
        const moduleFound = this.modules.find(ele => ele.name === mod);
        if (moduleFound) return moduleFound[type];
        else throw new Error("filtering failed no matching module found");
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

  getFilteredValues(moduleArray, full = false) {

    const charArray = this.filterByModule(moduleArray, "chars", full) as Char[] | string[];
    const roleArray = this.filterByModule(moduleArray, "roles", full) as Role[] | string[]
    return [charArray, roleArray];

  },

  hackValue(input) {
    return typeof input === "undefined" ? "Unknown" : input; 
  }

}

loader(GameData, modules);

console.log("GameData loaded", GameData);

export default GameData;