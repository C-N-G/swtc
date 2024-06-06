import Char, { CharData } from "../classes/char.ts";
import Reminder from "../classes/reminder.ts";
import Role, { RoleData } from "../classes/role.ts";

interface Module {
  name: string;
  chars: number[];
  roles: number[];
}

interface GameDataStore {
  chars: Char[];
  roles: Role[];
  nightOrder: Array<{id: string, description: string}>;
  states: string[];
  teams: string[];
  modules: Module[];
  reminders: Reminder[];
}

interface ImportInterface {
  [file: string]: { default: Array<CharData | RoleData | string> };
}

export default function gameDataLoader(load_obj: GameDataStore, modules: ImportInterface) {

  function import_json(file_path: string, load_origin: ImportInterface, load_target: GameDataStore) {

    const property = file_path!.split("/")!.pop()!.slice(0, -5) as keyof GameDataStore;

    // add file contents to correct property array in game data
    load_origin[file_path].default.forEach(eleObj => {

      const eleId = load_target[property].length;

      // handle stripping reminders from object and adding to reminder array
      if (typeof eleObj !== "string") {
        // link the reminder refernces to the new object
        eleObj.reminders = eleObj.reminders.map(reminder => {
          const reminderId = load_target.reminders.length;
          const newReminder = new Reminder(reminderId, null, reminder.content, reminder.colour, reminder.description);
          load_target.reminders.push(newReminder);
          return newReminder;
        })
      }


      if (typeof eleObj === "string" && (property === "states" || property === "teams")) {
        load_target[property].push(eleObj);
      } else if (typeof eleObj === "object" && property === "chars") {
          load_target[property].push(new Char(
          eleId,
          eleObj.name,
          eleObj.description,
          eleObj.ability,
          eleObj.orderType,
          eleObj.attributes,
          eleObj.additional,
          eleObj.setup,
          eleObj.reminders,
        ));
      } else if (typeof eleObj === "object" && property === "roles" && "type" in eleObj) {
        load_target[property].push(new Role(
          eleId,
          eleObj.name,
          eleObj.type,
          eleObj.description,
          eleObj.ability,
          eleObj.orderType,
          eleObj.attributes,
          eleObj.additional,
          eleObj.setup,
          eleObj.reminders,
          eleObj.appears,
        ));
      }

      // link the reminders to the new object reference
      if (typeof eleObj !== "string" 
          && "reminders" in eleObj 
          && eleObj.reminders.length > 0 
          && (property === "chars" || property === "roles")
          ) {
        eleObj.reminders.forEach(reminder => {
          reminder.origin = load_target[property][load_target[property].length - 1]
        })
      }

      // if the file is inside a module then also add its id to the modules property
      if (file_path.includes("modules") && (property === "chars" || property === "roles")) {

        const module_name = file_path.split("/")[2]
        let moduleFound = load_target.modules.find(mod => mod.name === module_name);

        if (!moduleFound) {
          moduleFound = {name: module_name, chars: [], roles: []};
          load_target.modules.push(moduleFound);
        }

        moduleFound[property].push(eleId);

      }

    })

  }

  function sort_game_data(load_target: GameDataStore) {

    type SortType = Role | Char;

    function sort_name(a: SortType, b: SortType) {
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

    function sort_module(a: Module, b: Module) {
      const modA = Number(a.name.split("_")[0]);
      const modB = Number(b.name.split("_")[0]);
      if (modA < modB) return -1;
      if (modA > modB) return 1;
      return 0;
    }

    load_target.chars.sort(sort_name);
    load_target.roles.sort(sort_name);
    if (Array.isArray(load_target.modules)) load_target.modules.sort(sort_module);

  }

  function remove_module_prefix(load_target: GameDataStore) {

    if (Array.isArray(load_target.modules)) {
      load_target.modules =  load_target.modules.map((mod) => {
        return {
          ...mod,
          name: mod.name.split("_")[1]
        }
      })
    }

  }

  // sort modules by file path length so unknowns will be loaded first
  Object.keys(modules).sort((a,b) => a.length - b.length).forEach((path) => import_json(path, modules, load_obj));

  sort_game_data(load_obj);

  remove_module_prefix(load_obj);

}