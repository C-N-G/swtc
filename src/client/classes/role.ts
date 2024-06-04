import Reminder from "./reminder";

export default class Role {

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
