import Char, { CharData } from "../classes/char.ts";
import Reminder from "../classes/reminder.ts";
import Role, { RoleData } from "../classes/role.ts";
import JSON5 from "json5";
import Scenario, { ScenarioData } from "../classes/scenario.ts";


type NightOrder = {id: string, description: string};
type ReminderData = [string, string, string];

export interface GameDataStore {
  chars: Char[];
  roles: Role[];
  nightOrder: NightOrder[];
  states: string[];
  teams: string[];
  scenarios: Scenario[];
  reminders: Reminder[];
  filterByScenario(scenarioArray: Scenario[], type: "chars" | "roles", full: boolean): (Char | Role | string)[];
  getFilteredReminders(charArray: Char[], roleArray: Role[]): Reminder[];
  getFilteredValues(scenarioArray: Scenario[]): [chars: string[], roles: string[]];
  getFullFilteredValues(scenarioArray: Scenario[]): [chars: Char[], roles: Role[]];
  hackValue(input: string): string;
}

export type RawImportData = { [file: string]: string }

export default function gameDataLoader(load_obj: GameDataStore, files: RawImportData) {

  function import_json(file_path: string, load_origin: RawImportData, load_target: GameDataStore) {

    // use the file name as the target property to add data to
    let property: keyof GameDataStore;

    if (file_path.split("/").length <= 2) {
      property = file_path.split("/")[1].slice(0, -6) as keyof GameDataStore
    } else {
      property = file_path.split("/")[1] as keyof GameDataStore;
    }

    // parse the json5 data into an object
    const fileData = JSON5.parse(load_origin[file_path]);

    const eleId = load_target[property].length;
    let reminders: Reminder[] = [];

    // handle stripping reminders from object and adding to reminder array
    if (typeof fileData !== "string" && !("id" in fileData) && "reminders" in fileData) {
      // link the reminder refernces to the new object
      reminders = fileData.reminders.map((reminder: ReminderData) => {
        const reminderId = load_target.reminders.length;
        const newReminder = new Reminder(reminderId, null, reminder[0], reminder[1], reminder[2]);
        load_target.reminders.push(newReminder);
        return newReminder;
      })
    }

    if (property === "chars") {
      const charData = fileData as CharData;
      load_target.chars.push(new Char(
        eleId,
        charData.name,
        charData.flavour,
        charData.ability,
        charData.orderType,
        charData.attributes,
        charData.additional,
        charData.setup,
        reminders,
      ));
    } else if (property === "roles") {
      const roleData = fileData as RoleData;
      load_target.roles.push(new Role(
        eleId,
        roleData.name,
        roleData.type,
        roleData.flavour,
        roleData.ability,
        roleData.orderType,
        roleData.attributes,
        roleData.additional,
        roleData.setup,
        reminders,
        roleData.appears,
      ));
    } else if (property === "nightOrder") {
      console.log(property, fileData);
      load_target.nightOrder.push(...fileData as NightOrder[]);
    } else if (property === "states"){
      load_target.states.push(...fileData as string[]);
    } else if (property === "teams"){
      load_target.teams.push(...fileData as string[]);
    } else if (property === "scenarios") {
      load_target.scenarios.push(import_scenario(fileData as ScenarioData, load_target));
    }
    

    // link the reminders to the new object reference
    if (typeof fileData !== "string" 
        && "reminders" in fileData 
        && reminders.length > 0 
        && (property === "chars" || property === "roles")
        ) {
      reminders.forEach(reminder => {
        reminder.origin = load_target[property][load_target[property].length - 1]
      })
    }


  }

  function import_scenario(scenario: ScenarioData, load_target: GameDataStore): Scenario {
    
    const convertedChars = scenario.chars.map(char => {
      const foundChar = load_target.chars.find(searchChar => searchChar.name === char);
      return foundChar?.id;
    }).filter(char => char !== undefined);
    
    const convertedRoles = scenario.roles.map(role => {
      const foundRole = load_target.roles.find(searchRole => searchRole.name === role);
      return foundRole?.id;
    }).filter(role => role !== undefined);

    return new Scenario(
      load_target.scenarios.length,
      scenario.name,
      scenario.flavour,
      convertedChars as number[],
      convertedRoles as number[],
    )

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

    function sort_Scenario(a: Scenario, b: Scenario) {
      const scenarioA = Number(a.name.split("_")[0]);
      const scenarioB = Number(b.name.split("_")[0]);
      if (scenarioA < scenarioB) return -1;
      if (scenarioA > scenarioB) return 1;
      return 0;
    }

    load_target.chars.sort(sort_name);
    load_target.roles.sort(sort_name);
    if (load_target.scenarios.length > 1) load_target.scenarios.sort(sort_Scenario);

  }

  // function remove_module_prefix(load_target: GameDataStore) {

  //   if (Array.isArray(load_target.modules)) {
  //     load_target.modules =  load_target.modules.map((mod) => {
  //       return {
  //         ...mod,
  //         name: mod.name.split("_")[1]
  //       }
  //     })
  //   }

  // }


  Object.keys(files).forEach((path) => import_json(path, files, load_obj));

  sort_game_data(load_obj);

  // remove_module_prefix(load_obj);

}