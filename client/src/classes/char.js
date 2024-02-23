export default class Char { 

  /**
   * Characteristic object for a player
   * Char == Characteristic
   * @param {number} id 
   * @param {string} name 
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
    types = [],
    description = "",
    ability = "",
    attributes = [],
    additional = [],
    setup = [],
  ) {
    this.id = id;
    this.name = name;
    this.types = types;
    this.description = description;
    this.ability = ability;
    this.attributes = attributes;
    this.additional = additional;
    this.setup = setup;
  }

}

[
  {
    "name": "Unknown",
    "types": [],
    "description": "",
    "ability": "",
    "attributes": [],
    "additional": [],
    "setup": []
  }
]

