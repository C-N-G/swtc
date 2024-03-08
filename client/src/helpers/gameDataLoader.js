import Char from "../classes/char";
import Reminder from "../classes/reminder";
import Role from "../classes/role";

export default function gameDataLoader(load_obj, modules) {

  function import_json(file_path, load_origin, load_target) {

    const property = file_path.split("/").pop().slice(0, -5);

    // if the file is inside a module then also add just its property names to modules
    if (file_path.includes("modules")) {

      const module_name = file_path.split("/")[2];
      const property_names = load_origin[file_path].default.map((ele) => ele.name);

      if (!Object.hasOwn(load_target.modules, module_name)) {
        load_target.modules[module_name] = {};
      }

      load_target.modules[module_name][property] = property_names;

    }

    // add file contents to correct property array in game data
    load_origin[file_path].default.forEach(eleObj => {

      let newEle;
      let eleId = load_target[property].length;

      // handle stripping reminders from object and adding to reminder array
      if (eleObj.reminders) {
        // link the reminder refernces to the new object
        eleObj.reminders = eleObj.reminders.map(reminder => {
          let reminderId = load_target.reminders.length;
          let newReminder = new Reminder(reminderId, null, ...reminder);
          load_target.reminders.push(newReminder);
          return newReminder;
        })
      }

      switch (property) {
        case "chars":
          newEle = new Char(
            eleId,
            eleObj.name,
            eleObj.description,
            eleObj.ability,
            eleObj.attributes,
            eleObj.additional,
            eleObj.setup,
            eleObj.reminders,
          );
          break;
        
        case "roles":
          newEle = new Role(
            eleId,
            eleObj.name,
            eleObj.type,
            eleObj.description,
            eleObj.ability,
            eleObj.attributes,
            eleObj.additional,
            eleObj.setup,
            eleObj.reminders,
          );
          break;
        
        default:
          load_target[property].push(eleObj);
      }

      if (newEle) load_target[property].push(newEle);

      // link the reminders to the new object reference
      if (newEle?.reminders?.length > 0) {
        eleObj.reminders.forEach(reminder => {
          reminder.origin = newEle;
        })
      }

    })

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

  // sort modules by file path length so unknowns will be loaded first
  Object.keys(modules).sort((a,b) => a.length - b.length).forEach((path) => import_json(path, modules, load_obj))

  convert_modules_to_array(load_obj);

  sort_game_data(load_obj);

  remove_module_prefix(load_obj);

}