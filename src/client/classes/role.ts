import Reminder from "./reminder";

export interface RoleData {
  name: string;
  type: string;
  description: string;
  ability: string;
  orderType: string;
  attributes: string[];
  additional: string[];
  setup: string[][];
  reminders: Reminder[];
  appears: {asType: string, asTeam: string, for: string};
}

export default class Role implements RoleData {

  constructor(
    public readonly id: number,
    public name: string,
    public type = "",
    public description = "",
    public ability = "",
    public orderType = "",
    public attributes: string[] = [],
    public additional: string[] = [],
    public setup: string[][] = [],
    public reminders: Reminder[] = [],
    public appears = {asType: "", asTeam: "", for: ""},
  ) {
    
  }

}
