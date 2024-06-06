import GameData from "../strings/_gameData.js";

/**
 * @typedef {Object} Player
 * @property {string} id
 * @property {string} name
 * @property {number} type
 * @property {number} char
 * @property {number} role
 * @property {number} team
 * @property {number} rChar
 * @property {number} rRole
 * @property {number} rTeam
 */

/**
 * @typedef {Object} Char
 * @property {string} name
 * @property {string} type
 * @property {string} description
 * @property {string} ability
 * @property {Array<string>} attributes
 * @property {Array<string>} additional
 * @property {Array<Array<string>>} setup
 */

/**
 * @typedef {Object} Role
 * @property {string} name
 * @property {string} type
 * @property {string} description
 * @property {string} ability
 * @property {Array<string>} attributes
 * @property {Array<string>} additional
 * @property {Array<Array<string>>} setup
 */

/**
 * @typedef {Object} aPlayer
 * @property {number} index 
 * @property {Player} playerObj 
 * @property {boolean} strict 
 * @property {boolean} keepSame 
 */

/**
 * setup commands:
 * 
 * Add [#] [type] [target] [neighbour]
 * AddStrict [#] [type] [target] [neighbour]
 * Convert [#] [target] [neighbour]
 * ShowAs [type] [target]
 * Neighbour [type] [target]
 */

/**
 * Selects random roles and characteristics for a given set of players
 * Runs any setup commands found in the roles or characteristics selected
 * @param {Array<Player>} playerArray 
 * @param {Array<Char>} charArray 
 * @param {Array<Role>} roleArray 
 * @returns {Array<Player>} list of players with randomised attributes 
 */
export default function randomise(playerArray, charArray, roleArray) {

  let debug = playerArray[0].id === "54321" ? true : false; // debug logging value

  const randomiser = new Randomiser(playerArray, charArray, roleArray, debug)

  return randomiser.assignPlayers();


}

export class Randomiser {

  TYPE_TO_TEAM = {
    "Agent": "Loyalist",
    "Detrimental": "Loyalist",
    "Antagonist": "Subversive"
  }

  /**
   * Randomiser class used for setting up players
   * @param {Array<Player>} playerArray 
   * @param {Array<Char>} charArray 
   * @param {Array<Role>} roleArray 
   * @param {boolean} debug 
   */
  constructor(playerArray, charArray, roleArray, debug) {

    this.debug = debug;

    this.playerArray = playerArray;
    this.charArray = charArray;
    this.roleArray = roleArray;

    this.commandQueue = [];
    /** @type {{chars: Set<Char>, roles: Set<Role>}} */
    this.takenSets = { "chars": new Set(), "roles": new Set() };
    /** @type {{masters: Array<number>, minions: Object<number, number>}} */
    this.neighbourGroups = {masters: [], minions: {}};
    this.targetAntags = 1;

    // remove any narrators from indexes to place
    /** @type {Array<number>} */
    this.randomIndexes = this.toShuffled(playerArray.map((_, index) => index).filter(playerIndex => playerArray[playerIndex].type !== 0));

    // deep copy the player array so incomplete randomisation attemps to not return half finished
    /** @type {Array<Player>} */
    this.randomisedPlayers = JSON.parse(JSON.stringify(playerArray));

    const playerAmount = playerArray.filter(player => player.type !== 0).length;
    const formula = Math.floor((0.5 * playerAmount) - 2);
    this.targetDetrimentals = formula > 0 ? formula : 0;
    if (debug) console.debug("detrimentals", this.targetDetrimentals);

  }

  /**
   * loops through all players and assigns their charactieristics, roles, and teams
   * @returns {Array<Player>} - array of randomised players
   */
  assignPlayers() {

    this.resetPlayers();

    let aPlayer = {};

    // loop through players to randomise
    while (this.randomIndexes.length > 0) {

      //priority setup command > antag > detrimentals > agents

      aPlayer.index = this.getNextPosition();
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

      // add commands if the role has any
      this.addSetupCommandsFromPlayer(aPlayer);

      // return randomised player
      this.randomisedPlayers[aPlayer.index] = aPlayer.playerObj;

    }

    if (this.debug) console.debug("groups", this.neighbourGroups);

    return this.randomisedPlayers;

  }

  /**
   * runs the update logic for a given player
   * @param {aPlayer} aPlayer 
   */
  updatePlayer(aPlayer) {

    if (this.commandQueue.length > 0) {

      const commandArray = this.commandQueue[0];
      const commandName = commandArray[0];
      const commandQuantity = commandArray[1];
      const commandType = commandArray[2];
      const commandTarget = commandName === "Convert" ? commandArray[2] : commandArray[3];
      const sendCommand = [commandName, commandType, commandTarget];
  
      this.runSetupCommand(aPlayer, sendCommand);
  
      // handle command quantity
      if (commandQuantity > 1) {
        commandArray[1]--;
      } else {
        this.commandQueue.shift();
      }

    } else { // else randomise player

      aPlayer.strict = false;

      // randomise player
      aPlayer.playerObj.char = aPlayer.playerObj.rChar = this.getRandomIndex(this.charArray, this.takenSets.chars);
      aPlayer.playerObj.role = aPlayer.playerObj.rRole = this.getRandomIndex(this.roleArray, this.takenSets.roles, this.getTargetRoles());
      let playerRoleType = this.roleArray[aPlayer.playerObj.role].type
      aPlayer.playerObj.team = aPlayer.playerObj.rTeam = GameData.teams.indexOf(this.TYPE_TO_TEAM[playerRoleType]);

    }

  }

  /**
   * gets a specific list of roles to pick from when assigning a player
   * @returns an array of roles to choose from
   */
  getTargetRoles() {

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
   * @param {Array<Char|Role>} indexArray
   * @param {Set<number>} takenIndexSet 
   * @param {Array<Char|Role>=} filteredIndexArray 
   * @returns {number} a random index
   */
  getRandomIndex(indexArray, takenIndexSet, filteredIndexArray) {

    const EveryFilteredIndexTaken = filteredIndexArray ? filteredIndexArray
      .map(ele => indexArray.findIndex(ele1 => ele.name === ele1.name))
      .every(ele => takenIndexSet.has(ele)) : false;

    let index, randomIndex;
    while (typeof index === "undefined") {

      // generate a random index
      if (filteredIndexArray) {
        randomIndex = Math.floor(Math.random() * filteredIndexArray.length);
        randomIndex = indexArray.findIndex(role => role.name === filteredIndexArray[randomIndex].name);
      } else {
        // skip out the first value which is unknown
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
        throw Error("not enough options to uniquely randomise")
      }

    }
    return index;

  }

  /**
   * Shuffles a given array out of place
   * @param {Array<number>} inputArray 
   * @returns {Array<number>}
   */
  toShuffled(inputArray) {

    let array = [...inputArray];
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
   * @param {aPlayer} aPlayer 
   * @returns {Array<string>} command list to run immediately
   */
  addSetupCommandsFromPlayer(aPlayer) {

    let immediateCommandQueue = [];
    let char = this.charArray[aPlayer.playerObj.char].setup;
    let role = this.roleArray[aPlayer.playerObj.role].setup;

    // return if no setup commands
    if (char.length === 0 && role.length === 0) return;

    char.concat(role).forEach(cmd => {

      // ignore if it is just text description and no command
      if (cmd.length < 2) return;

      const commandArray = cmd[1].split(" ");
      if (commandArray[2] !== undefined) {
        commandArray[2] = commandArray[2].replace("_", " ");// support underscores in target names
      }

      // if the command doesn't have a quantity then run it immediately
      if (Number.isNaN(Number(commandArray[1]))) {

        immediateCommandQueue.push(commandArray);

      } else if (!aPlayer.strict) { // do not add commands if the command was strict

        if (commandArray[4] === "Neighbour") {
          commandArray[4] = `${commandArray[4]}_${aPlayer.playerObj.id}`;
          this.neighbourGroups.masters.push(aPlayer.playerObj.id);
        }
        this.commandQueue.push(commandArray);

      }
      

    })

    immediateCommandQueue.forEach(sendCommand => {
      aPlayer.keepSame = true;
      this.runSetupCommand(aPlayer, sendCommand);
    })

  }

  /**
   * Applies a setup commnad to a given player
   * @param {aPlayer} aPlayer 
   * @param {Array<string>} sendCommand 
   */
  runSetupCommand(aPlayer, sendCommand) {

    const [command, type, target] = [sendCommand[0], sendCommand[1], sendCommand[2]];

    // randomise player initially
    if (!aPlayer.keepSame) {
      aPlayer.playerObj.char = this.getRandomIndex(this.charArray, this.takenSets.chars);
      const agentRoles = this.roleArray.filter(role => role.type === "Agent")
      aPlayer.playerObj.role = this.getRandomIndex(this.roleArray, this.takenSets.roles, agentRoles);
    }

    // get all possible targets
    let possibleTargets, targetName, targetShownName, targetArray;
    if (type === "Char") {
      // if no target given then use anything
      possibleTargets = target === undefined ? this.charArray : this.charArray.filter(char => 
        char.name === target 
        || char.attributes.includes(target)
      )
      targetName = "char";
      targetShownName = "rChar";
      targetArray = this.charArray;
    } else if (type === "Role") {
      possibleTargets = target === undefined ? this.roleArray : this.roleArray.filter(role => {
        const searchAppears = (
          command === "Neighbour" &&
          this.TYPE_TO_TEAM[this.roleArray[aPlayer.playerObj.role].type] === role.appears.for) ? (
            role.appears.asType === target || role.appears.asTeam === target
        ) : false
        return role.name === target 
        || role.type === target 
        || this.TYPE_TO_TEAM[role.type] === target 
        || role.attributes.includes(target)
        || searchAppears
      })
      targetName = "role";
      targetShownName = "rRole";
      targetArray = this.roleArray;
    } else if (command !== "Convert"){
      throw new Error(`unknown setup command target type: ${type}`);
    }

    if (this.debug) console.debug("running setup command", command, type, target);

    // if command is Add or AddStrict
    if (command.includes("Add")) {

      // delete initially randomised target from the taken targets
      this.takenSets[`${targetName}s`].delete(aPlayer.playerObj[targetName]);

      // take into account taken targets if there are multiple possible targets
      if (possibleTargets.length > 1) {
        aPlayer.playerObj[targetName] = this.getRandomIndex(targetArray, this.takenSets[`${targetName}s`], possibleTargets);
      } else {
        // else if there is only one possible target it must be specific so choose it anyway
        aPlayer.playerObj[targetName] = targetArray.findIndex(target => target.id === possibleTargets[0].id);
        this.takenSets[`${targetName}s`].add(aPlayer.playerObj[targetName]);
      }

    } 

    aPlayer.strict = command === "AddStrict" ? true : false;

    if (command === "Convert") aPlayer.playerObj.team = GameData.teams.indexOf(target);
    else aPlayer.playerObj.team = GameData.teams.indexOf(this.TYPE_TO_TEAM[this.roleArray[aPlayer.playerObj.role].type]);

    if (!aPlayer.keepSame) {
      aPlayer.playerObj.rChar = aPlayer.playerObj.char;
      aPlayer.playerObj.rRole = aPlayer.playerObj.role;
      aPlayer.playerObj.rTeam = aPlayer.playerObj.team;
    }

    if (command === "ShowAs") {

      // take into account taken roles if there are multiple possible roles
      if (possibleTargets.length > 1) {
        aPlayer.playerObj[targetShownName] = this.getRandomIndex(targetArray, this.takenSets[`${targetName}s`], possibleTargets);
      } else {
        // else if there is only one possible role the target must be specific so choose it anyway
        aPlayer.playerObj[targetShownName] = targetArray.findIndex(target => target.id === possibleTargets[0].id);
        this.takenSets[`${targetName}s`].add(aPlayer.playerObj[targetShownName]);
      }

      // change player team to the role they appear as
      aPlayer.playerObj.rTeam = GameData.teams.indexOf(this.TYPE_TO_TEAM[this.roleArray[aPlayer.playerObj.rRole].type]);

    } 

    if (command === "Neighbour") {

      // find targets
      const playerIndexes = [];
      possibleTargets.forEach(target => {
      this.randomisedPlayers.forEach((player, index) => {
        if (targetArray[player[targetName]]?.id === target.id) playerIndexes.push(index);
      })})

      if (playerIndexes.length === 0) {
        throw new Error("Could not find the target to neighbour");
      }

      // does the player already neighbour a target?
      const [leftIndex, rightIndex] = this.findNeighbourIndexes(aPlayer.index);
      if (playerIndexes.some(index => index === leftIndex || index === rightIndex)) return;

      // try and move the player to neighbour the target
      let newIndex;
      for (const index of playerIndexes) {
        newIndex = this.getFreeNeighbourIndex(index);
        if (newIndex === null) continue;
        this.movePlayerToIndex(newIndex, aPlayer);
        break;
      }

      if (newIndex === null) {
        throw new Error("Could not place player next to target neighbour during setup command");
      }
      
    }

  }

  /**
   * moves a player from their current index to a new index
   * does not change the player itself but instead moves their char/role/team to the player at the new index
   * @param {number} newIndex 
   * @param {aPlayer} aPlayer 
   */
  movePlayerToIndex(newIndex, aPlayer) {

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

    this.randomIndexes.push(aPlayer.index);
    aPlayer.index = newIndex;
    aPlayer.playerObj = this.randomisedPlayers[newIndex];
    this.randomIndexes = this.randomIndexes.filter(index => index !== newIndex);

  }

  /**
   * resets the char/role/team of all the players to create a blank slate to work on
   * if they're not reset then the Neighbour setup command can get confused by the previous state
   */
  resetPlayers() {

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
   * @param {number} anIndex 
   * @returns {Array<number>} left and right neighbour indexes
   */
  findNeighbourIndexes(anIndex) {

    let neighbourIndexes;
    let indexArray = this.randomisedPlayers.map((_, index) => index);

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
    neighbourIndexes = [left, right];

    return neighbourIndexes;

  }

  /**
   * tries to find or create a free neighbouring position for a given position
   * if no free positions are available will try and swap players to open positions to create a free position
   * @param {number} anIndex - the position to find a free neighbour for
   * @returns {number} - the index of the free position
   */
  getFreeNeighbourIndex(anIndex) {

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
   * @returns {number} an index position for the next player
   */
  getNextPosition() {

    let returnIndex;

    // if no neighbour property then just return a random index
    if (this.commandQueue.length === 0 
      || typeof this.commandQueue[0][4] === "undefined"
      || !this.commandQueue[0][4].startsWith("Neighbour")
      ) {
        returnIndex = this.randomIndexes.shift();
      if (this.debug) console.debug("found new player index early.", this.randomIndexes.length, "indexes left", this.randomIndexes);
      return returnIndex;
    }

    const masterId = this.commandQueue[0][4].split("_")[1];
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
   * @param {number} desiredIndex  
   */
  createFreeSpace(desiredIndex) {

    if (this.randomIndexes.length < 1) {
      throw Error("not enough free spaces for neighbours");
    }

    let newIndex = this.randomIndexes.shift();

    // assume the player at the desired index has already been randomised
    this.randomisedPlayers[newIndex].char = this.randomisedPlayers[desiredIndex].char
    this.randomisedPlayers[newIndex].rChar = this.randomisedPlayers[desiredIndex].rChar
    this.randomisedPlayers[newIndex].role = this.randomisedPlayers[desiredIndex].role
    this.randomisedPlayers[newIndex].rRole = this.randomisedPlayers[desiredIndex].rRole
    this.randomisedPlayers[newIndex].team = this.randomisedPlayers[desiredIndex].team
    this.randomisedPlayers[newIndex].rTeam = this.randomisedPlayers[desiredIndex].rTeam

    this.randomIndexes.push(desiredIndex);

    if (this.debug) console.debug("swapped player at index", desiredIndex, "to index", newIndex);

  }

  // function reorganisePlayers() {

  // }

}