export default class Player {

  #id;        // unique user identifier 
  #name;      // user name
  #type;      // type of user. 0 = teller, 1 = player
  #role;      // player role
  #char;      // player characteristic
  #status;    // player status
  #label;     // quick label of targetted player
  #notes;     // notes of targetted player
  #team;      // player team. 0 = loyalist, 1 = subversives
  #state;     // player state. 0 = dead, 1 = alive
  #rRole;     // real player role shown to storyteller
  #rChar;     // real player characteristic shown to storyteller
  #rStatus;   // real player status shown to storyteller
  #rState;    // real player state shown to storyteller

  constructor(
    id, 
    name, 
    type = 1, 
    role = 0, 
    char = 0, 
    status = 0, 
    label = "", 
    notes = "", 
    state = 1,
    team = 0,
    rRole = 0,
    rChar = 0,
    rStatus = 0,
    rState = 1,
  ) {

    this.#id = id;
    this.#name = name;
    this.#type = type;
    this.#role = role;
    this.#char = char;
    this.#status = status;
    this.#label = label;
    this.#notes = notes;
    this.#state = state;
    this.#team = team;
    this.#rRole = rRole;
    this.#rChar = rChar;
    this.#rStatus = rStatus;
    this.#rState = rState;

  }

  get data() {
    return {
      id: this.#id,
      name: this.#name,
      type: this.#type,
      role: this.#role,
      char: this.#char,
      status: this.#status,
      label: this.#label,
      notes: this.#notes,
      state: this.#state,
      team: this.#team,
      rRole: this.#rRole,
      rChar: this.#rChar,
      rStatus: this.#rStatus,
      rState: this.#rState
    }
  }
  
}
