import default_roles from "../strings/roles.json";
import default_chars from "../strings/chars.json";
import default_states from "../strings/states.json";
import default_statuses from "../strings/statuses.json";

import module_sv_roles from "../strings/modules/1_Standard Procedure/roles.json";
import module_sv_chars from "../strings/modules/1_Standard Procedure/chars.json";

import module_p_roles from "../strings/modules/2_Placeholder Module/roles.json";
import module_p_chars from "../strings/modules/2_Placeholder Module/chars.json";

function useLoader() {

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

  console.log(GameData);

  return GameData;
}

export default useLoader;