export default class Player {

  #id;        // unique user identifier 
  #name;      // user name
  #type;      // type of user. 0 = narrator, 1 = player
  #label;     // quick label of targetted player
  #notes;     // notes of targetted player
  #char;      // player characteristic
  #role;      // player role
  #status;    // player status
  #state;     // player state. 0 = dead, 1 = alive
  #team;      // player team
  #rChar;     // real player characteristic shown to narrator
  #rRole;     // real player role shown to narrator
  #rStatus;   // real player status shown to narrator
  #rState;    // real player state shown to narrator
  #rTeam;     // real player team shown to narrator

  constructor(
    id, 
    name, 
    type = 1, 
    label = "", 
    notes = "", 
    char = 0, 
    role = 0, 
    status = 0, 
    state = 1,
    team = 0,
    rChar = 0,
    rRole = 0,
    rStatus = 0,
    rState = 1,
    rTeam = 0
  ) {

    this.#id = id;
    this.#name = name;
    this.#type = type;
    this.#label = label;
    this.#notes = notes;
    this.#char = char;
    this.#role = role;
    this.#status = status;
    this.#state = state;
    this.#team = team;
    this.#rChar = rChar;
    this.#rRole = rRole;
    this.#rStatus = rStatus;
    this.#rState = rState;
    this.#rTeam = rTeam;

  }

  get data() {
    return {
      id: this.#id,
      name: this.#name,
      type: this.#type,
      label: this.#label,
      notes: this.#notes,
      char: this.#char,
      role: this.#role,
      status: this.#status,
      state: this.#state,
      team: this.#team,
      rChar: this.#rChar,
      rRole: this.#rRole,
      rStatus: this.#rStatus,
      rState: this.#rState,
      rTeam: this.#rTeam
    }
  }
  
}
