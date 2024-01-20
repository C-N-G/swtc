import default_roles from "../strings/roles.json";
import default_chars from "../strings/chars.json";
import default_states from "../strings/states.json";
import default_statuses from "../strings/statuses.json";

import module_sv_roles from "../strings/modules/1_Standard Procedure/roles.json";
import module_sv_chars from "../strings/modules/1_Standard Procedure/chars.json";

import module_p_roles from "../strings/modules/2_Placeholder Module/roles.json";
import module_p_chars from "../strings/modules/2_Placeholder Module/chars.json";

// const modules = import.meta.glob(["../strings/*.json", "../strings/modules/*/*.json"], {eager: true})

// const modules = import.meta.glob("../strings/modules/*/*.json", {eager: true})

function useLoader() {

  // hard coded import methods

  const GameData = {
    roles: [
      ...default_roles, 
      ...module_sv_roles,
      ...module_p_roles,
    ],
    chars: [
      ...default_chars, 
      ...module_sv_chars,
      ...module_p_chars,
    ],
    states: [...default_states],
    statuses: [...default_statuses],
    modules: {
      "Standard Procedure": {
        roles: module_sv_roles.map(role => role.Name),
        chars: module_sv_chars.map(role => role.Name),
      },
      "Placeholder Module": {
        roles: module_p_roles.map(role => role.Name),
        chars: module_p_chars.map(role => role.Name),
      }
    }
  }


  // dynamic import method

  // function import_json(file_path, load_origin, load_target) {

  //   let properties = ["roles", "chars", "states", "statuses"];

  //   properties.forEach((property) => {
  //     if (file_path.endsWith(property + ".json")) {
  //       load_target[property] = load_target[property].concat(load_origin[file_path].default);

  //       const module_name = file_path.split("/")[3].split("_")[1];
  //       const property_names = load_origin[file_path].default.map((ele) => ele.Name);

  //       // this is a problem in that states and statuses are being added to the game object even though they are empty
  //       // need to have some kind of sorting system
  //       if (!Object.hasOwn(load_target.modules, module_name)) {
  //         load_target.modules[module_name] = {};
  //       }
  //       load_target.modules[module_name][property] = property_names;
  //     }
  //   })

  // }

  // const GameData = {
  // roles: [],
  // chars: [],
  // states: [],
  // statuses: [],
  // modules: {}
  // }

  // Object.keys(modules).forEach((path) => {

  //   import_json(path, modules, GameData);


  //   // modules[path]
  // })



  // console.log(modules["../strings/chars.json"].default)
  

  console.log(GameData);

  return GameData;
}

export default useLoader;