import Char from "../../classes/char.ts";
import Player from "../../classes/player.ts";
import Role from "../../classes/role.ts";
import GameData from "../../strings/_gameData.ts";
import add from "./setupCommands/add.ts";
import addInvariant from "./setupCommands/addInvariant.ts";
import addStrict from "./setupCommands/addStrict.ts";
import convert from "./setupCommands/convert.ts";
import neighbour from "./setupCommands/neighbour.ts";
import showAs from "./setupCommands/showAs.ts";

export interface OperatingPlayer {
  index: number;
  playerObj: Player;
  strict: boolean;
  keepSame: boolean
}

export interface DebugOrderItem {
  index: number;
  role: string;
  char?: string;
}

export interface SetupCommandParams {
  command: string;
  type: string;
  target: string;
  possibleTargets: (Char | Role)[];
  targetName: string;
  targetShownName: string;
  targetArray: (Char | Role)[];
}

interface SetupCommand {
  name: string;
  target: string;
  type?: string;
  quantity?: number;
  neighbour?: string;
}

/**
Selects random roles and characteristics for a given set of players
Runs any setup commands found in the roles or characteristics selected

NOTES:
The neighbour mechanic will currently conduct some rudimentary collision avoidance 
should either of the neighbour slots be taken, as it will swap any neighbour who is 
not part of a neighbour group to a free slot if there is a free slot available. This 
means that if a role who places a neighbour is chosen next to another role who also 
places neighbours or next to a placed neighbour, then that neighbour will not get placed.

There are two ways to improve this system, firstly to reorganise all the players 
to maximise free space for new groups, and secondly to not allow a role that places 
neighbours to be chosen if there is not enough free space to place the neighbours.

SETUP COMMANDS:
- Add [#] [type] [target] [neighbour] - assigns one or more unassigned 
players the target char or role during setup
- AddInvariant [#] [type] [target] [neighbour] - assigns one or more unassigned or assigned players the target char or role
only if it hasn't already been assigned to someone, will make sure not to incrased detrimental or antagonist count when using this command
- AddStrict [#] [type] [target] [neighbour] - assigns one or more unassigned players 
the following char or role during setup, and prevents that char or roles setup commands from running
- Convert [#] [target] [neighbour] - assigns one or more unassigned agent players to the target team
- Neighbour [type] [target] - assigns this player a position on the board which neighbours the target
- ShowAs [type] [target] - assigns this player’s shown char or role to the target

[#] can be 1 or higher. if the [neighbour] is specified then [#] must be 1 or 2.

[type] can be either “Role” or “Char”.

[target] can be a role name, role type, role team, 
role attribute, char name, or char attribute.

[neighbour] specifies if the command should select neighbours to target.

if the [target] is a name, the randomiser will choose that target even if they 
have already been chosen for another player. if the [target] is anything else, 
it will take into account what has already been chosen so as to not choose duplicates.

The ShowAs and Neighbour commands support omitting the [target] parameter, 
which will make the randomiser select anything matching the specified type.

A player will be classified as dependant if any of the follow occurs:
- they have setup commands that modifies other players
- they were created or modified by a setup command from another player
Dependant players will modified after they are randomised

 * @param playerArray 
 * @param charArray 
 * @param roleArray 
 * @returns list of players with randomised attributes 
 */
export default function randomise(playerArray: Player[], charArray: Char[], roleArray: Role[]): Player[] {

  const debug = playerArray[0].id === "54321" ? true : false; // debug logging value

  const randomiser = new Randomiser(playerArray, charArray, roleArray, debug);

  return randomiser.assignPlayers();

}

export class Randomiser {

  debug: boolean;
  debugOrder: DebugOrderItem[] | undefined;
  playerArray: Player[];
  charArray: Char[];
  roleArray: Role[];
  commandQueue: SetupCommand[];
  finalCommandQueue: SetupCommand[];
  takenSets: {chars: Set<number>, roles: Set<number>};
  neighbourGroups: {masters: string[], minions: { [minion: string]: string }};
  dependantIds: Set<string>; // ids of players that cannot be updated later by the randomiser
  randomIndexes: number[];
  randomisedPlayers: Player[];
  targetAntags: number;
  targetDetrimentals: number;

  /**
   * Randomiser class used for setting up players
   * @param playerArray 
   * @param charArray 
   * @param roleArray 
   * @param debug 
   */
  constructor(playerArray: Player[], charArray: Char[], roleArray: Role[], debug: boolean, debugOrder?: DebugOrderItem[]) {

    this.debug = debug;
    this.debugOrder = debugOrder;

    this.playerArray = playerArray;
    this.charArray = charArray;
    this.roleArray = roleArray;

    this.commandQueue = [];
    this.finalCommandQueue = [];
    this.takenSets = { "chars": new Set(), "roles": new Set() };
    this.neighbourGroups = {masters: [], minions: {}};
    this.dependantIds = new Set();
    this.targetAntags = 1;

    // remove any narrators from indexes to place
    this.randomIndexes = this.toShuffled(playerArray.map((_, index) => index).filter(playerIndex => playerArray[playerIndex].type !== 0));

    // deep copy the player array so incomplete randomisation attemps to not return half finished
    this.randomisedPlayers = JSON.parse(JSON.stringify(playerArray));

    const playerAmount = playerArray.filter(player => player.type !== 0).length;
    const formula = Math.floor((0.5 * playerAmount) - 2);
    this.targetDetrimentals = formula > 0 ? formula : 0;
    if (debug) console.debug("detrimentals", this.targetDetrimentals);

  }

  /**
   * loops through all players and assigns their charactieristics, roles, and teams
   * @returns array of randomised players
   */
  assignPlayers(): Player[] {

    this.resetPlayers();

    const aPlayer: OperatingPlayer = {} as OperatingPlayer;

    // loop through players to randomise
    while (this.randomIndexes.length > 0) {

      //priority setup command > antag > detrimentals > agents

      aPlayer.index = this.getNextPosition() as number;
      aPlayer.playerObj = this.randomisedPlayers[aPlayer.index];
      aPlayer.strict = false;
      aPlayer.keepSame = false;

      if (aPlayer.index === null) continue; // if the player cannot be placed due to neighbour problems then skip this loop

      // process any running setup commands
      this.updatePlayer(aPlayer);

      if (this.debug) console.debug(
        "adding player with role", 
        this.roleArray[aPlayer.playerObj.role].name, 
        "at index", 
        aPlayer.index, 
        "who is", 
        this.charArray[aPlayer.playerObj.char].name
      );

      if (this.debugOrder && this.debugOrder.length > 0) {
        this.debugOrder.shift();
      }

      // add commands if the role has any
      this.addSetupCommandsFromPlayer(aPlayer);

      // return randomised player
      this.randomisedPlayers[aPlayer.index] = aPlayer.playerObj;

    }

    if (this.commandQueue.length > 0 || this.finalCommandQueue.length > 0) this.processFinalCommands();
    
    if (this.debug) {
      console.debug("groups", this.neighbourGroups);
      console.debug("roles", this.randomisedPlayers.map(player => GameData.roles[player.role].name));
    }

    return this.randomisedPlayers;

  }

  /**
   * runs the update logic for a given player
   * @param aPlayer 
   */
  updatePlayer(aPlayer: OperatingPlayer): void {

    if (this.commandQueue.length > 0) {

      const setupCommand = this.commandQueue[0];
  
      this.runSetupCommand(aPlayer, setupCommand);
  
      // handle command quantity
      if (setupCommand.quantity && setupCommand.quantity > 1) {
        setupCommand.quantity--;
      } else {
        this.commandQueue.shift();
      }

    } else { // else randomise player

      aPlayer.strict = false;

      // randomise player
      aPlayer.playerObj.char = aPlayer.playerObj.rChar = this.getRandomIndex(this.charArray, this.takenSets.chars);
      aPlayer.playerObj.role = aPlayer.playerObj.rRole = this.getRandomIndex(this.roleArray, this.takenSets.roles, this.getTargetRoles());
      const playerRoleTeam = this.roleArray[aPlayer.playerObj.role].team;
      aPlayer.playerObj.team = aPlayer.playerObj.rTeam = GameData.teams.indexOf(playerRoleTeam);

    }

  }

  /**
   * gets a specific list of roles to pick from when assigning a player
   * @returns an array of roles to choose from
   */
  getTargetRoles(): Role[] {

    let targetRoles
    if (this.targetAntags > 0) {
      targetRoles = this.roleArray.filter(role => role.type === "Antagonist");
      this.targetAntags--;
    } else if (this.targetDetrimentals > 0) {
      targetRoles = this.roleArray.filter(role => role.type === "Detrimental");
      this.targetDetrimentals--;
    } else {
      targetRoles = this.roleArray.filter(role => role.type === "Agent");
    }
    return targetRoles;

  }

  /**
   * Gets a random index from a list and marks it as taken
   * @param indexArray
   * @param takenIndexSet 
   * @param filteredIndexArray 
   * @returns a random index
   */
  getRandomIndex(indexArray: (Char | Role)[], takenIndexSet: Set<number>, filteredIndexArray?: (Char | Role)[] | null): number {

    const EveryFilteredIndexTaken = filteredIndexArray ? filteredIndexArray
      .map(ele => indexArray.findIndex(ele1 => ele.name === ele1.name))
      .every(ele => takenIndexSet.has(ele)) : false;

    let index: number | undefined; 
    let randomIndex: number;
    while (typeof index === "undefined") {

      // use debug values if found
      if (typeof this.debugOrder !== "undefined" && typeof this.debugOrder[0] !== "undefined") {
        const isChar = indexArray[0] instanceof Char;
        const isRole = indexArray[0] instanceof Role;
        let targetProperty: keyof DebugOrderItem;
        if (isRole) targetProperty = "role";
        else if (isChar) targetProperty = "char";
        else throw new Error("undefined property found in debug order");
        randomIndex = indexArray.findIndex(role => role.name === this.debugOrder![0][targetProperty]);
        if (randomIndex === -1) throw new Error(`could not find target item from debug order: ${this.debugOrder![0][targetProperty]} ${indexArray.map(ele => ele.name)}`);
      } else if (filteredIndexArray) { // generate a random index
        randomIndex = Math.floor(Math.random() * filteredIndexArray.length);
        randomIndex = indexArray.findIndex(role => role.name === filteredIndexArray[randomIndex].name);
      } else { // skip out the first value which is unknow
        randomIndex = Math.floor(Math.random() * (indexArray.length - 1) + 1);
      }

      // assign index if it hasn't been taken
      if (takenIndexSet.has(randomIndex) === false) {
        takenIndexSet.add(randomIndex);
        index = randomIndex;
      }

      // prevent infinte loop
      if (takenIndexSet.size === indexArray.length || EveryFilteredIndexTaken) {
        if (this.debug) console.debug(Array.from(takenIndexSet).map(index => indexArray[index].name), filteredIndexArray)
        throw new Error("not enough options to uniquely randomise")
      }

    }
    return index;

  }

  /**
   * Shuffles a given array out of place
   * @param inputArray 
   * @returns a shuffled version of the input array
   */
  toShuffled(inputArray: number[]): number[] {

    const array = [...inputArray];
    let currentIndex = array.length,  randomIndex;
    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;

  }

  /**
   * Adds setup commands from a given role to commandArrays
   * @param aPlayer 
   */
  addSetupCommandsFromPlayer(aPlayer: OperatingPlayer): void {

    const immediateCommandQueue: SetupCommand[] = [];
    const char = this.charArray[aPlayer.playerObj.char].setup;
    const role = this.roleArray[aPlayer.playerObj.role].setup;

    // return if no setup commands
    if (char.length === 0 && role.length === 0) return;

    char.concat(role).forEach(cmd => {

      // ignore if it is just text description and no command
      if (cmd.length < 2) return;

      const commandArray = cmd[1].split(" ");
      const commandLacksQuantity = Number.isNaN(Number(commandArray[1]));
      const commandHasNeighbour = commandArray.includes("Neighbour");
      const newSetupCommand: SetupCommand = { 
        name: commandArray[0],
        target: "",
      };

      switch (newSetupCommand.name) {
        case "Add":
        case "AddInvariant":
        case "AddStrict":
          newSetupCommand.quantity = Number(commandArray[1]);
          newSetupCommand.type = commandArray[2];
          newSetupCommand.target = commandArray[3];
          if (commandHasNeighbour) {
            newSetupCommand.neighbour = `${commandArray[4]}_${aPlayer.playerObj.id}`;
            this.neighbourGroups.masters.push(aPlayer.playerObj.id);
          }
          break;
        case "Convert":
          newSetupCommand.quantity = Number(commandArray[1]);
          newSetupCommand.target = commandArray[2];
          if (commandHasNeighbour) {
            newSetupCommand.neighbour = `${commandArray[3]}_${aPlayer.playerObj.id}`;
            this.neighbourGroups.masters.push(aPlayer.playerObj.id);
          }
          break;

        case "Neighbour":
        case "ShowAs":
          newSetupCommand.type = commandArray[1];
          newSetupCommand.target = commandArray[2];
          break;
      
        default:
          throw new Error("could not parse setup command name");
      }

      if (newSetupCommand.type !== undefined) {
        newSetupCommand.type = newSetupCommand.type.replace("_", " ");// support underscores in target names
      }
      newSetupCommand.target = newSetupCommand.target.replace("_", " ");

      // add this player id to dependant ids if it has a dependant command
      if (this.isDependantCommand(newSetupCommand)) {
        this.dependantIds.add(aPlayer.playerObj.id);
      }

      // if the command doesn't have a quantity then run it immediately
      if (commandLacksQuantity) {

        immediateCommandQueue.push(newSetupCommand);

      } // push commands that should only run at the end to the final command queue
      else if (!aPlayer.strict && ["AddInvariant", "Neighbour"].includes(newSetupCommand.name)) { 
        
        this.finalCommandQueue.push(newSetupCommand);

      } // do not add commands if the command was strict
      else if (!aPlayer.strict) { 
        
        this.commandQueue.push(newSetupCommand);

      }

    })

    immediateCommandQueue.forEach(sendCommand => {
      aPlayer.keepSame = true;
      this.runSetupCommand(aPlayer, sendCommand);
    })

  }

  /**
   * Applies a setup commnad to a given player
   * @param Player 
   * @param setupCommand 
   */
  runSetupCommand(aPlayer: OperatingPlayer, setupCommand: SetupCommand): void {

    const [command, type, target] = [setupCommand.name, setupCommand.type, setupCommand.target];

    // add this player id to the dependantIds if the command operating on it is a dependant command
    if (this.isDependantCommand(setupCommand)) {
      this.dependantIds.add(aPlayer.playerObj.id);
    }

    // randomise player initially
    if (!aPlayer.keepSame) {
      aPlayer.playerObj.char = this.getRandomIndex(this.charArray, this.takenSets.chars);
      const agentRoles = this.roleArray.filter(role => role.type === "Agent");
      aPlayer.playerObj.role = this.getRandomIndex(this.roleArray, this.takenSets.roles, agentRoles);
    }

    // get all possible targets
    let possibleTargets: (Char | Role)[];
    let targetName: string; 
    let targetShownName: string; 
    let targetArray: (Char | Role)[];
    if (type === "Char") {
      // if no target given then use anything
      possibleTargets = this.getPossibleTargets("char", target, command);
      targetName = "char";
      targetShownName = "rChar";
      targetArray = this.charArray;
    } else if (type === "Role") {
      possibleTargets = this.getPossibleTargets("role", target, command, aPlayer);
      targetName = "role";
      targetShownName = "rRole";
      targetArray = this.roleArray;
    } else if (command === "Convert"){
      targetName = "";
      targetShownName = ""
      possibleTargets = [];
      targetArray = [];
    } else {
      throw new Error(`unknown setup command target type: ${type}`);
    }

    const setupCommandParams: SetupCommandParams = {
      command: command,
      type: type ? type : "",
      target: target,
      possibleTargets: possibleTargets,
      targetName: targetName,
      targetShownName: targetShownName,
      targetArray: targetArray
    }

    if (this.debug) console.debug("running setup command", command, type, target);

    // if command is Add or AddStrict
    if (command === "Add") add(aPlayer, setupCommandParams, this);
    else if (command === "AddStrict") addStrict(aPlayer, setupCommandParams, this);
    else if (command === "AddInvariant") addInvariant(aPlayer, setupCommandParams, this);

    aPlayer.strict = command === "AddStrict" ? true : false;

    if (command === "Convert") convert(aPlayer, setupCommandParams);
    else aPlayer.playerObj.team = GameData.teams.indexOf(this.roleArray[aPlayer.playerObj.role].team);

    if (!aPlayer.keepSame) {
      aPlayer.playerObj.rChar = aPlayer.playerObj.char;
      aPlayer.playerObj.rRole = aPlayer.playerObj.role;
      aPlayer.playerObj.rTeam = aPlayer.playerObj.team;
    }

    if (command === "ShowAs") showAs(aPlayer, setupCommandParams, this);

    if (command === "Neighbour") neighbour(aPlayer, setupCommandParams, this);

  }

  /**
   * moves a player from their current index to a new index
   * does not change the player itself but instead moves their char/role/team to the player at the new index
   * @param newIndex 
   * @param aPlayer 
   */
  movePlayerToIndex(newIndex: number, aPlayer: OperatingPlayer): void {

    if (this.debug) console.debug(
      "moving player from", 
      this.randomisedPlayers[aPlayer.index].name, 
      "to", 
      this.randomisedPlayers[newIndex].name)

    this.randomisedPlayers[newIndex].char = aPlayer.playerObj.char;
    this.randomisedPlayers[newIndex].rChar = aPlayer.playerObj.rChar;
    this.randomisedPlayers[newIndex].role = aPlayer.playerObj.role;
    this.randomisedPlayers[newIndex].rRole = aPlayer.playerObj.rRole;
    this.randomisedPlayers[newIndex].team = aPlayer.playerObj.team;
    this.randomisedPlayers[newIndex].rTeam = aPlayer.playerObj.rTeam;

    this.randomisedPlayers[aPlayer.index].char = 0;
    this.randomisedPlayers[aPlayer.index].rChar = 0;
    this.randomisedPlayers[aPlayer.index].role = 0;
    this.randomisedPlayers[aPlayer.index].rRole = 0;
    this.randomisedPlayers[aPlayer.index].team = 0;
    this.randomisedPlayers[aPlayer.index].rTeam = 0;

    // update dependant id if the player had one
    if (this.dependantIds.has(this.randomisedPlayers[aPlayer.index].id)) {
      this.dependantIds.delete(this.randomisedPlayers[aPlayer.index].id);
      this.dependantIds.add(this.randomisedPlayers[newIndex].id);
    }

    this.randomIndexes.push(aPlayer.index);
    aPlayer.index = newIndex;
    aPlayer.playerObj = this.randomisedPlayers[newIndex];
    this.randomIndexes = this.randomIndexes.filter(index => index !== newIndex);

  }

  /**
   * resets the char/role/team of all the players to create a blank slate to work on
   * if they're not reset then the Neighbour setup command can get confused by the previous state
   */
  resetPlayers(): void {

    this.randomisedPlayers = this.randomisedPlayers.map(player => {
      player.char = 0;
      player.rChar = 0;
      player.role = 0;
      player.rRole = 0;
      player.team = 0;
      player.rTeam = 0;
      return player;
    });

  }

  /**
   * Finds the neighbour indexes for a given index
   * Views the array as circular, and takes into account skipping narrator type players
   * @param anIndex 
   * @returns left and right neighbour indexes
   */
  findNeighbourIndexes(anIndex: number): number[] {

    const indexArray = this.randomisedPlayers.map((_, index) => index);

    // take into account skipping narrators
    let left = anIndex-1, right = anIndex+1;
    while ((typeof this.randomisedPlayers[left] === "undefined" || this.randomisedPlayers[left].type === 0)
      || (typeof this.randomisedPlayers[right] === "undefined" || this.randomisedPlayers[right].type === 0)
    ) {
      if (left < 0) left = indexArray.length-1;
      if (right >= indexArray.length) right = 0;
      if (this.randomisedPlayers[left].type === 0) left--;
      if (this.randomisedPlayers[right].type === 0) right++;
    }
    const neighbourIndexes = [left, right];

    return neighbourIndexes;

  }

  /**
   * tries to find or create a free neighbouring position for a given position
   * if no free positions are available will try and swap players to open positions to create a free position
   * @param anIndex - the position to find a free neighbour for
   * @returns the index of the free position
   */
  getFreeNeighbourIndex(anIndex: number): number | null {

    let returnIndex;
    const [leftIndex, rightIndex] = this.findNeighbourIndexes(anIndex);

    // if left is free
    if (this.randomIndexes.includes(leftIndex)) {
      if (this.debug) console.debug("left neighbour free");
      returnIndex = leftIndex;
    } 
    
    // if right is free
    else if (this.randomIndexes.includes(rightIndex)) {
      if (this.debug) console.debug("right neighbour free");
      returnIndex = rightIndex;
    } 
    
    // if left is not part of a group
    else if (!this.neighbourGroups.masters.includes(this.randomisedPlayers[leftIndex].id) 
      && !Object.hasOwn(this.neighbourGroups.minions, this.randomisedPlayers[leftIndex].id)
    ) {
      if (this.debug) console.debug("swapping left neighbour");
      returnIndex = leftIndex;
      this.createFreeSpace(returnIndex);
    } 
    
    // if right is not part of a group
    else if (!this.neighbourGroups.masters.includes(this.randomisedPlayers[rightIndex].id) 
      && !Object.hasOwn(this.neighbourGroups.minions, this.randomisedPlayers[rightIndex].id)
    ) {
      if (this.debug) console.debug("swapping right neighbour");
      returnIndex = rightIndex;
      this.createFreeSpace(returnIndex);
    }

    // else they are both taken and part of a group
    else {
      // could reorganise all players to create space, or move the master player to create space
      returnIndex = null; // skip this attempt at player creation
      this.commandQueue.shift(); // admit defeat
      if (this.debug) console.debug(
        "cannot place neighbour of player", 
        this.randomisedPlayers[anIndex].name, 
        "and commands left to process:", 
        JSON.stringify(this.commandQueue)
      );
    }

    return returnIndex;

  }

  /**
   * Finds a position to place the next player
   * Will take into account any neighbour setup commands currently in the queue
   * @returns an index position for the next player
   */
  getNextPosition(): number | null {

    let returnIndex: number | null | undefined;

    // use debug values if found
    if (this.debugOrder !== undefined && this.debugOrder[0] !== undefined) {
      returnIndex = this.debugOrder[0].index;
      const deleteIndex = this.randomIndexes.findIndex(ele => ele === returnIndex);
      this.randomIndexes.splice(deleteIndex, 1);
      return returnIndex;
    }

    // if no neighbour property then just return a random index
    if (this.commandQueue.length === 0 
      || typeof this.commandQueue[0].neighbour === "undefined"
      || !this.commandQueue[0].neighbour.startsWith("Neighbour")
      ) {
      returnIndex = this.randomIndexes.shift();
      if (returnIndex === undefined) throw new Error("got undefined index from random indexes");
      if (this.debug) console.debug("found new player index early.", this.randomIndexes.length, "indexes left", this.randomIndexes);
      return returnIndex;
    }

    const masterId = this.commandQueue[0].neighbour.split("_")[1];
    const masterIndex = this.randomisedPlayers.findIndex(player => player.id === masterId);

    returnIndex = this.getFreeNeighbourIndex(masterIndex);

    // add to groups and remove index if it gets placed
    if (returnIndex !== null) {
      const deleteIndex = this.randomIndexes.indexOf(returnIndex);
      this.randomIndexes.splice(deleteIndex, 1);
      const minionId = this.randomisedPlayers[returnIndex].id
      this.neighbourGroups.minions[minionId] = masterId;
    }

    if (this.debug) console.debug("found new player index.", this.randomIndexes.length, "indexes left", this.randomIndexes);

    return returnIndex;

  }

  /**
   * Swaps a players attributes from a given index to an unprocessed index
   * @param desiredIndex  
   */
  createFreeSpace(desiredIndex: number): void {

    if (this.randomIndexes.length < 1) {
      throw new Error("not enough free spaces for neighbours");
    }

    const newIndex = this.randomIndexes.shift();

    if (newIndex === undefined) throw new Error("got undefined index from random index array");

    // assume the player at the desired index has already been randomised
    this.randomisedPlayers[newIndex].char = this.randomisedPlayers[desiredIndex].char
    this.randomisedPlayers[newIndex].rChar = this.randomisedPlayers[desiredIndex].rChar
    this.randomisedPlayers[newIndex].role = this.randomisedPlayers[desiredIndex].role
    this.randomisedPlayers[newIndex].rRole = this.randomisedPlayers[desiredIndex].rRole
    this.randomisedPlayers[newIndex].team = this.randomisedPlayers[desiredIndex].team
    this.randomisedPlayers[newIndex].rTeam = this.randomisedPlayers[desiredIndex].rTeam

    this.randomIndexes.push(desiredIndex);

    // update dependant id if the player had one
    if (this.dependantIds.has(this.randomisedPlayers[desiredIndex].id)) {
      this.dependantIds.delete(this.randomisedPlayers[desiredIndex].id);
      this.dependantIds.add(this.randomisedPlayers[newIndex].id);
    }

    if (this.debug) console.debug("swapped player at index", desiredIndex, "to index", newIndex);

  }

  /**
   * checks if setup command is classified as dependant
   * @param setupCommand 
   * @returns bool value indicating if the command is dependant
   */
  isDependantCommand(setupCommand: SetupCommand): boolean {
    const dependantCommands = ["Add", "AddStrict", "AddInvariant", "Convert"];
    return dependantCommands.includes(setupCommand.name);
  }

  /**
   * handles running setup commands after all players have been randomised
   */
  processFinalCommands() {

    // match commands to non dependant players

    const commands: SetupCommand[] = [];

    // handle command quantity
    this.commandQueue.concat(this.finalCommandQueue).forEach(setupCommand => {
      if (setupCommand.quantity && setupCommand.quantity > 1) {
        for (let i = 0; i < setupCommand.quantity; i++) {
          commands.push(setupCommand);
        }
      } else {
        commands.push(setupCommand);
      }
    })
  

    commands.forEach(setupCommand => {

      const targetIsARole = setupCommand.type && setupCommand.type === "Role";
      const possibleTargets = this.getPossibleTargets(targetIsARole ? "role" : "char", setupCommand.target, setupCommand.name);
      if (targetIsARole) {
        const targetIsDetrimental = (possibleTargets[0] as Role).type === "Detrimental";
        const targetType = targetIsDetrimental ? "Detrimental" : "Agent";

        // for detrimental targets
        const targetPlayers = this.randomisedPlayers.filter(player => GameData.roles[player.role].type === targetType);
        const independantTargetPlayers = targetPlayers.filter(player => this.dependantIds.has(player.id) === false);
        if (independantTargetPlayers.length === 0) throw new Error("could not run final setup commands, no independant players available");
        const playerIndex = this.randomisedPlayers.findIndex(player => player.id === independantTargetPlayers[0].id);
        const aPlayer: OperatingPlayer = {
          index: playerIndex,
          playerObj: this.randomisedPlayers[playerIndex],
          strict: true, // if it runs a command at the end of the queue then always run it strict
          keepSame: true, // since the player has already been randomised keep it that way initially
        }

        this.runSetupCommand(aPlayer, setupCommand);

        if (this.debug) console.debug(
          "adding player with role", 
          this.roleArray[aPlayer.playerObj.role].name, 
          "at index", 
          aPlayer.index, 
          "who is", 
          this.charArray[aPlayer.playerObj.char].name
        );

      }


      

    })

    this.commandQueue = [];

  }

  /**
   * finds all possible targets that match to the given input target
   * @param type 
   * @param target 
   * @param command 
   * @param aPlayer 
   * @returns array of roles or chars which match to the target
   */
  getPossibleTargets(type: "char" | "role", target: string, command: string, aPlayer?: OperatingPlayer): (Char | Role)[] {

    let possibleTargets: (Char | Role)[] = [];

    if (type === "char") {
      // if no target given then use anything
      possibleTargets = target === undefined ? this.charArray : this.charArray.filter(char => 
        char.name === target // target name
        || char.attributes.includes(target) // target attributes
      )
    } else if (type === "role") {
      possibleTargets = target === undefined ? this.roleArray : this.roleArray.filter(role => {
        let searchAppears = false;
        if (aPlayer) {
          // check if role has an appears which matches this team
          const appearsForThisTeam = this.roleArray[aPlayer.playerObj.role].team === role.appears.for;
          // check if the appears matches the target
          const roleAppearsMatchesTarget = role.appears.asType === target || role.appears.asTeam === target;
          // only check appears if command is neighbour
          searchAppears = command === "Neighbour" && appearsForThisTeam ? roleAppearsMatchesTarget : false;
        }
        return role.name === target // target name
        || role.type === target // target type
        || role.team === target //target team
        || role.attributes.includes(target) // target attribute
        || searchAppears // target 
      })
    }

    return possibleTargets;

  }

  // function reorganisePlayers() {

  // }

}