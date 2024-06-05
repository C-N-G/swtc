import Reminder from "./reminder";

export interface RoleData {
  name: string;
  type: string;
  description: string;
  ability: string;
  orderType: string;
  attributes: Array<string>;
  additional: Array<string>;
  setup: Array<Array<string>>;
  reminders: Array<Reminder>;
  appears: {asType: string, asTeam: string, for: string};
}

export default class Role implements RoleData {

  constructor(
    public readonly id: string,
    public name: string,
    public type = "",
    public description = "",
    public ability = "",
    public orderType = "",
    public attributes: Array<string> = [],
    public additional: Array<string> = [],
    public setup: Array<Array<string>> = [],
    public reminders: Array<Reminder> = [],
    public appears = {asType: "", asTeam: "", for: ""},
  ) {
    
  }

}
