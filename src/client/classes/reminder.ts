import Char from "./char";
import Role from "./role";

export default class Reminder {

  constructor(
    public readonly id: string,
    public origin: Char | Role | null,
    public content: string,
    public colour: string,
    public description: string,
  ) {

  }

}