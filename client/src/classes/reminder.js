export default class Reminder {

  /**
   * Reminder object for a role
   * @param {number} id 
   * @param {Char | Role} originId - reference to the object which this reminder belongs to
   * @param {string} content - shorthand reminder content, either a single alphanumeric character or icon
   * @param {string} colour - a html colour code
   * @param {string} description - longer form description of what the reminder is 
   */
  constructor(
    id,
    origin,
    content,
    colour,
    description,
  ) {
    this.id = id;
    this.origin = origin;
    this.content = content;
    this.colour = colour;
    this.description = description;
  }

}