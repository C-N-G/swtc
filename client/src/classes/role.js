export default class Role {

  /**
   * Role object for a player
   * @param {number} id 
   * @param {string} name 
   * @param {string} type
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
    type = "",
    description = "",
    ability = "",
    orderType = "",
    attributes = [],
    additional = [],
    setup = [],
    reminders = [],
    appears = {asType: "", asTeam: "", for: ""},
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.description = description;
    this.ability = ability;
    this.orderType = orderType;
    this.attributes = attributes;
    this.additional = additional;
    this.setup = setup;
    this.reminders = reminders;
    this.appears = appears;
  }

}

