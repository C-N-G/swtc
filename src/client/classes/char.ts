import Reminder from "./reminder";

export interface CharData {
  name: string;
  description: string;
  ability: string;
  orderType: string;
  attributes: Array<string>;
  additional: Array<string>;
  setup: Array<Array<string>>;
  reminders: Array<Reminder>;
}

export default class Char implements CharData { 

  constructor(
    public readonly id: number,
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

