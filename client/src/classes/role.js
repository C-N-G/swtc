export default class Role {

  /**
   * Role object for a player
   * @param {number} id 
   * @param {string} name 
   * @param {string} team 
   * @param {Array<string>} types 
   * @param {string} description 
   * @param {string} ability 
   * @param {Array<string>} attributes 
   * @param {Array<string>} additional 
   * @param {Array<Array<string>>} setup 
   */
  constructor(
    id,               
    name,             
    team = "", 
    types = [],
    description = "",
    ability = "",
    attributes = [],
    additional = [],
    setup = [],
    reminders = [],
  ) {
    this.id = id;
    this.name = name;
    this.team = team;
    this.types = types;
    this.description = description;
    this.ability = ability;
    this.attributes = attributes;
    this.additional = additional;
    this.setup = setup;
    this.reminders = reminders;
  }

}

