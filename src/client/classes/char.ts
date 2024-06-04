import Reminder from "./reminder";

export default class Char { 

  constructor(
    public readonly id: string,
    public name: string,
    public description = "",
    public ability = "",
    public orderType = "",
    public attributes: Array<string> = [],
    public additional: Array<string> = [],
    public setup: Array<Array<string>> = [],
    public reminders: Array<Reminder> = [],
  ) {

  }

}

