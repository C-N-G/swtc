export default class Player {

  #id;
  #name;
  #role;
  #char;
  #status;
  #label;
  #notes;
  #team;
  #state;

  constructor(id, name, role= "", char = "", status = "", label = "", notes = "", state = 1, team = 0) {

    this.#id = id;
    this.#name = name;
    this.#role = role;
    this.#char = char;
    this.#status = status;
    this.#label = label;
    this.#notes = notes;
    this.#state = state;
    this.#team = team;

  }

  get data() {
    return {
      id: this.#id,
      name: this.#name,
      role: this.#role,
      char: this.#char,
      status: this.#status,
      label: this.#label,
      notes: this.#notes,
      state: this.#state,
      team: this.#team
    }
  }
  
}
