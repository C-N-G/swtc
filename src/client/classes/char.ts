import Reminder, { ReminderData } from "./reminder";

export interface CharData {
  name: string;
  description: string;
  ability: string;
  orderType: string;
  attributes: string[];
  additional: string[];
  setup: string[][];
  reminders: ReminderData[];
}

export default class Char { 

  constructor(
    public readonly id: number,
    public name: string,
    public description = "",
    public ability = "",
    public orderType = "",
    public attributes: string[] = [],
    public additional: string[] = [],
    public setup: string[][] = [],
    public reminders: Reminder[] = [],
  ) {

  }

}

