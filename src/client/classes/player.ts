import { nightOrder } from "../components/NightOrderIndicator";

export default class Player {

  /**
   * Player
   * @param id - unique user identifier
   * @param name - user name
   * @param pronouns - user pronouns
   * @param type - type of user. 0 = narrator, 1 = player
   * @param label - quick label of targetted player
   * @param notes - notes of targetted player
   * @param char - player characteristic
   * @param role - player role
   * @param state - player state. 0 = dead, 1 = alive
   * @param team - player team
   * @param rChar - real player characteristic that is networked by the narrator
   * @param rRole - real player role that is networked by the narrator
   * @param rState - real player state that is networked by the narrator
   * @param rTeam - real player team that is networked by the narrator
   * @param VotePower - the Voting power for this player
   * @param reminders - visual reminder ids tied to this player
   * @param nightOrders - the night order numbers for this players chars and roles
   */
  constructor(
    public readonly id: string, 
    public name: string,
    public pronouns: string = "",
    public type = 1,
    public label = "",
    public notes = "",
    public char = 0,
    public role = 0,
    public state = 1,
    public team = 0,
    public rChar = 0,
    public rRole = 0,
    public rState = 1,
    public rTeam = 0,
    public rVotePower = 1,
    public reminders: number[] = [],
    public nightOrders: nightOrder[] = [],
  ) {
    
  }

}
