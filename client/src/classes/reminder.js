export default class Reminder {

  /**
   * Reminder object for a role
   * @param {number} id 
   * @param {number} originId - the id of the role or characteristic tied to this reminder
   * @param {string} content - shorthand reminder content, either a single alphanumeric character or icon
   * @param {string} colour - a html colour code
   * @param {string} description - longer form description of what the reminder is 
   */
  constructor(
    id,
    originId,
    content,
    colour,
    description,
  ) {
    this.id = id;
    this.originId = originId;
    this.content = content;
    this.colour = colour;
    this.description = description;
  }

}