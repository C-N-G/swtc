const modules = import.meta.glob(["../strings/*.json", "../strings/modules/*/*.json"], {eager: true})

// this might be a computationally expensive function

function useLoader() {

  function import_json(file_path, load_origin, load_target) {

    const property = file_path.split("/").pop().slice(0, -5);

    if (file_path.includes("modules")) {

      const module_name = file_path.split("/")[3];
      const property_names = load_origin[file_path].default.map((ele) => ele.Name);

      if (!Object.hasOwn(load_target.modules, module_name)) {
        load_target.modules[module_name] = {};
      }

      load_target.modules[module_name][property] = property_names;

    }

    load_target[property] = load_target[property].concat(load_origin[file_path].default);

  }

  function convert_modules_to_array(load_target) {

    load_target.modules = Object.keys(load_target.modules).map((mod) => {
      return {
        Name: mod,
        chars: load_target.modules[mod].chars,
        roles: load_target.modules[mod].roles
      }
    })

  }

  function sort_game_data(load_target) {

    function sort_name(a, b) {
      const nameA = a.Name.toUpperCase();
      const nameB = b.Name.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    }

    function sort_module(a, b) {
      const modA = Number(a.Name.split("_")[0]);
      const modB = Number(b.Name.split("_")[0]);
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
        Name: mod.Name.split("_")[1]
      }
    })

  }

  const GameData = {
  chars: [],
  roles: [],
  states: [],
  statuses: [],
  modules: {}
  }

  Object.keys(modules).forEach((path) => import_json(path, modules, GameData))

  convert_modules_to_array(GameData);

  sort_game_data(GameData);

  remove_module_prefix(GameData);

  console.log(GameData);

  return GameData;
}

export default useLoader;