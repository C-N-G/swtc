import loader from "../helpers/gameDataLoader";

const modules = import.meta.glob(["./*.json", "./modules/*/*.json"], {eager: true});

let GameData = {
  chars: [],
  roles: [],
  states: [],
  statuses: [],
  teams: [],
  modules: {},

  filterByModule(array, type, full) {

    const enabledSet = new Set(
      array.map(mod => {
        return this.modules.find(ele => ele.name === mod)[type]
      }).flat()
    )


    const return_data = this[type] // hack - leave unknown out of the filtering
    .filter(ele => enabledSet.has(ele.name) || ele.name === "Unknown")

    // full will include all the role and char data, instead of just the name
    return full ? return_data : return_data.map(role => role.name);
    
  },

  getFilteredValues(array, full = false) {

    return [this.filterByModule(array, "chars", full), this.filterByModule(array, "roles", full)]

  },

  hackValue(input) {
    return typeof input === "undefined" ? "Unknown" : input; 
  }

}

GameData = loader(GameData, modules);

console.log(GameData);

export default GameData;