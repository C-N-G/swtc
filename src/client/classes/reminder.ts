import Char from "./char";
import Role from "./role";

export type ReminderData = [content: string, colour: string, flavour: string]; 

export default class Reminder {

  constructor(
    public readonly id: number,
    public origin: Char | Role | null,
    public content: string,
    public colour: string,
    public flavour: string,
  ) {

  }

}