export default class Char { 

  /**
   * Characteristic object for a player
   * Char == Characteristic
   * @param {number} id 
   * @param {string} name 
   * @param {string} description 
   * @param {string} ability 
   * @param {string} orderType 
   * @param {Array<string>} attributes 
   * @param {Array<string>} additional 
   * @param {Array<Array<string>>} setup 
   * @param {Array<Reminder>} reminders
   */
  constructor(
    id,
    name,
    description = "",
    ability = "",
    orderType = "",
    attributes = [],
    additional = [],
    setup = [],
    reminders = [],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.ability = ability;
    this.orderType = orderType
    this.attributes = attributes;
    this.additional = additional;
    this.setup = setup;
    this.reminders = reminders;
  }

}

