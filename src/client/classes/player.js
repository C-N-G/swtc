export default class Player {

  /**
   * Player object
   * @param {number} id - unique user identifier
   * @param {string} name - user name
   * @param {number} type - type of user. 0 = narrator, 1 = player
   * @param {string} label - quick label of targetted player
   * @param {string} notes - notes of targetted player
   * @param {number} char - player characteristic
   * @param {number} role - player role
   * @param {number} state - player state. 0 = dead, 1 = alive
   * @param {number} team - player team
   * @param {number} rChar - real player characteristic that is networked by the narrator
   * @param {number} rRole - real player role that is networked by the narrator
   * @param {number} rState - real player state that is networked by the narrator
   * @param {number} rTeam - real player team that is networked by the narrator
   * @param {number} rVotePower - the Voting power for this player
   * @param {Array<Reminder>} reminders - visual reminders tied to this player
   * @param {Array<Reminder>} nightOrders - the night orders for this players chars and roles
   */
  constructor(
    id,
    name,
    type = 1,
    label = "",
    notes = "",
    char = 0,
    role = 0,
    state = 1,
    team = 0,
    rChar = 0,
    rRole = 0,
    rState = 1,
    rTeam = 0,
    rVotePower = 1,
    reminders = [],
    nightOrders = [],
  ) {

    this.id = String(id);
    this.name = name;
    this.type = type;
    this.label = label;
    this.notes = notes;
    this.char = char;
    this.role = role;
    this.state = state;
    this.team = team;
    this.rChar = rChar;
    this.rRole = rRole;
    this.rState = rState;
    this.rTeam = rTeam;
    this.rVotePower = rVotePower
    this.reminders = reminders;
    this.nightOrders = nightOrders;
    
  }

}
