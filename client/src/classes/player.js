export default class Player {

  constructor(
    id,             // unique user identifier 
    name,           // user name
    type = 1,       // type of user. 0 = narrator, 1 = player
    label = "",     // quick label of targetted player
    notes = "",     // notes of targetted player
    char = 0,       // player characteristic
    role = 0,       // player role
    status = 0,     // player status
    state = 1,      // player state. 0 = dead, 1 = alive
    team = 0,       // player team
    rChar = 0,      // real player characteristic shown to narrator
    rRole = 0,      // real player role shown to narrator
    rStatus = 0,    // real player status shown to narrator
    rState = 1,     // real player state shown to narrator
    rTeam = 0,      // real player team shown to narrator
    reminders = []  // visual reminders tied to this player
  ) {

    this.id = id;
    this.name = name;
    this.type = type;
    this.label = label;
    this.notes = notes;
    this.char = char;
    this.role = role;
    this.status = status;
    this.state = state;
    this.team = team;
    this.rChar = rChar;
    this.rRole = rRole;
    this.rStatus = rStatus;
    this.rState = rState;
    this.rTeam = rTeam;
    this.reminders = reminders;

  }

}
