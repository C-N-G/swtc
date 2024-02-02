const modules = import.meta.glob(["./strings/*.json", "./strings/modules/*/*.json"], {eager: true})

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

function loader(load_obj) {

  function import_json(file_path, load_origin, load_target) {

    const property = file_path.split("/").pop().slice(0, -5);

    // if the file is inside a module then also add just its property names to modules
    if (file_path.includes("modules")) {

      const module_name = file_path.split("/")[3];
      const property_names = load_origin[file_path].default.map((ele) => ele.name);

      if (!Object.hasOwn(load_target.modules, module_name)) {
        load_target.modules[module_name] = {};
      }

      load_target.modules[module_name][property] = property_names;

    }

    // add file contents to correct property array in game data
    load_target[property] = load_target[property].concat(load_origin[file_path].default);

  }

  function convert_modules_to_array(load_target) {

    load_target.modules = Object.keys(load_target.modules).map((mod) => {
      return {
        name: mod,
        chars: load_target.modules[mod].chars,
        roles: load_target.modules[mod].roles
      }
    })

  }

  function sort_game_data(load_target) {

    function sort_name(a, b) {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      // hack - unknown should always be first in the sorting
      if ((nameA === "UNKNOWN") != (nameB === "UNKNOWN")) {
        return nameA === "UNKNOWN" ? -1 : 1;
      }
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    }

    function sort_module(a, b) {
      const modA = Number(a.name.split("_")[0]);
      const modB = Number(b.name.split("_")[0]);
      if (modA < modB) return -1;
      if (modA > modB) return 1;
      return 0;
    }

    load_target.chars.sort(sort_name);
    load_target.roles.sort(sort_name);
    load_target.modules.sort(sort_module);

  }

  function remove_module_prefix(load_target) {

    load_target.modules = load_target.modules.map((mod) => {
      return {
        ...mod,
        name: mod.name.split("_")[1]
      }
    })

  }

  Object.keys(modules).forEach((path) => import_json(path, modules, load_obj))

  convert_modules_to_array(load_obj);

  sort_game_data(load_obj);

  remove_module_prefix(load_obj);

  return load_obj;
}

GameData = loader(GameData);

console.log(GameData);

export default GameData;