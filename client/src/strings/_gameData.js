import loader from "../helpers/gameDataLoader.js";

const modules = import.meta.glob(["./*.json", "./modules/*/*.json"], {eager: true});

const GameData = {
  chars: [],
  roles: [],
  states: [],
  statuses: [],
  teams: [],
  modules: {},
  reminders: [],

  filterByModule(moduleArray, type, full) {

    const enabledSet = new Set(
      moduleArray.map(mod => {
        return this.modules.find(ele => ele.name === mod)[type]
      }).flat()
    )

    const return_data = this[type] // hack - leave unknown out of the filtering
    .filter(ele => enabledSet.has(ele.name) || ele.name === "Unknown")

    // full will include all the role and char data, instead of just the name
    return full ? return_data : return_data.map(role => role.name);
    
  },

  filterRemindersByModule(charArray, roleArray) {

    const reminderArray = [];

    charArray.concat(roleArray).forEach(ele => {
      if (ele.reminders?.length > 0) {
        reminderArray.push(...ele.reminders);
      }
    })

    return reminderArray;

  },

  getFilteredValues(moduleArray, full = false) {

    const charArray = this.filterByModule(moduleArray, "chars", full);
    const roleArray = this.filterByModule(moduleArray, "roles", full);
    const reminderArray = this.filterRemindersByModule(charArray, roleArray);

    return [charArray, roleArray, reminderArray]

  },

  hackValue(input) {
    return typeof input === "undefined" ? "Unknown" : input; 
  }

}

loader(GameData, modules);

console.log(GameData);

export default GameData;