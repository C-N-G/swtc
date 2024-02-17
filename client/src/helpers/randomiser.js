import GameData from "../strings/_gameData.js";

/**
 * @typedef {Object} Player
 * @property {number} id
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
 * @property {Array<string>} types
 * @property {string} description
 * @property {string} ability
 * @property {Array<string>} attributes
 * @property {Array<string>} additional
 * @property {Array<Array<string>>} setup
 */

/**
 * @typedef {Object} Role
 * @property {string} name
 * @property {string} team
 * @property {Array<string>} types
 * @property {string} description
 * @property {string} ability
 * @property {Array<string>} attributes
 * @property {Array<string>} additional
 * @property {Array<Array<string>>} setup
 */

/**
 * Selects random roles and characteristics for a given set of players
 * Runs any setup commands found in the roles or characteristics selected
 * @param {Array<Player>} playerArray 
 * @param {Array<Char>} charArray 
 * @param {Array<Role>} roleArray 
 * @returns {Array<Player>} list of players with randomised attributes 
 */
export default function randomiser(playerArray, charArray, roleArray) {

  /**
   * Gets a random id from a list and marks it as taken
   * @param {Array<Char|Role>} idArray
   * @param {Set<number>} takenIdsSet 
   * @param {Array<Char|Role>=} filteredIdArray 
   * @returns {number} a random id
   */
  function getRandomId(idArray, takenIdsSet, filteredIdArray) {

    const EveryFilteredIdTaken = filteredIdArray ? filteredIdArray
      .map(ele => idArray.findIndex(ele1 => ele.name === ele1.name))
      .every(ele => takenIdsSet.has(ele)) : false;

    let id, randomNum;
    while (typeof id === "undefined") {

      // generate a random id
      if (filteredIdArray) {
        randomNum = Math.floor(Math.random() * filteredIdArray.length);
        randomNum = roleArray.findIndex(role => role.name === filteredIdArray[randomNum].name);
      } else {
        // skip out the first value which is unknown
        randomNum = Math.floor(Math.random() * (idArray.length - 1) + 1);
      }

      // assign id if it hasn't been taken
      if (takenIdsSet.has(randomNum) === false) {
        takenIdsSet.add(randomNum);
        id = randomNum;
      }

      // prevent infinte loop
      if (takenIdsSet.size === idArray.length || EveryFilteredIdTaken) {
        if (debug) console.log(Array.from(takenIdsSet).map(id => roleArray[id].name), filteredIdArray)
        throw Error("not enough options to uniquely randomise")
      }

    }
    return id

  }

  /**
   * Updates the selected player using the first command in the command queue
   * @param {Player} player 
   * @param {Array<string>} commandsArray 
   * @param {Array<Char>} allChars 
   * @param {Array<Role>} allRoles 
   * @param {{chars: Set<char>, roles: Set<Role>}} takenObj 
   * @returns {Array<Player|boolean>} updated player object and strict flag
   */
  function updatePlayerFromCommand(player, commandsArray, allChars, allRoles, takenObj) {

    const commandArray = commandsArray[0];
    const commandQuantity = commandArray[1];
    const sendCommand = [commandArray[0], commandArray[2]];

    let isStrict;
    [player, isStrict] = runSetupCommand(player, sendCommand, allChars, allRoles, takenObj);

    // handle command quantity
    if (commandQuantity > 1) {
      commandArray[1]--;
    } else {
      commandsArray.shift();
    }

    return [player, isStrict];

  }

  /**
   * Shuffles a given array out of place
   * @param {Array<number>} inputArray 
   * @returns {Array<number>}
   */
  function toShuffled(inputArray) {

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
   * @param {number} roleId 
   * @param {Array<string>} commandsArray 
   * @param {boolean} isStrict 
   * @param {Player} player 
   * @param {{masters: Array<number>, minions: Object<number, number>}} neighbourGroups 
   * @returns {Array<string>} command list to run immediately
   */
  function addSetupCommand(roleId, commandsArray, isStrict, player, neighbourGroups) {

    let immediateCommandsArray = [];

    roleArray[roleId]["setup"].forEach(cmd => {

      // ignore if it is just text description and no command
      if (cmd.length < 2) return;

      const commandArray = cmd[1].split(" ");

      // if the command doesn't have a quantity then run it immediately
      if (Number.isNaN(Number(commandArray[1]))) {
        commandArray[1] = commandArray[1].replace("_", " "); // support underscores in target names
        immediateCommandsArray.push(commandArray);
      } else if (!isStrict) { // do not add commands if the command was strict
        if (commandArray[3] === "Neighbour") {
          commandArray[3] = `${commandArray[3]}_${player.id}`;
          neighbourGroups.masters.push(player.id);
        }
        commandArray[2] = commandArray[2].replace("_", " "); // support underscores in target names
        commandsArray.push(commandArray);
      }
      

    })

    return immediateCommandsArray

  }

  /**
   * Applies a setup commnad to a given player
   * @param {Player} player 
   * @param {Array<string>} cmd 
   * @param {Array<Char>} allChars 
   * @param {Array<Role>} allRoles 
   * @param {{chars: Set<Char>, roles: Set<Role>}} takenObj 
   * @param {boolean} keepSame
   * @returns {Array<Player|boolean>} updated player object and strict flag
   */
  function runSetupCommand(player, cmd, allChars, allRoles, takenObj, keepSame = false) {

    const [command, target] = [cmd[0], cmd[1]];

    // randomise player initially
    if (!keepSame) {
      player.char = getRandomId(allChars, takenObj.chars);
      const agentRoles = allRoles.filter(role => role.types.includes("Agent"))
      player.role = getRandomId(allRoles, takenObj.roles, agentRoles);
    }

    // get all possible roles from the target
    let possibleRoles = allRoles.filter(role => 
      role.name === target 
      || role.team === target 
      || role.types.includes(target) 
    )

    if (debug) console.log("running setup command", command, target);

    // if command is Add or AddStrict
    if (command.includes("Add")) {

      // delete initially ranomdise role from the taken roles
      takenObj.roles.delete(player.role);

      // take into account taken roles if there are multiple possible roles
      if (possibleRoles.length > 1) {
        player.role = getRandomId(allRoles, takenObj.roles, possibleRoles);
      } else {
        // else if there is only one possible role the target must be specific so choose it anyway
        player.role = allRoles.findIndex(role => role.name === possibleRoles[0].name);
        takenObj.roles.add(player.role);
      }

    }

    let isStrict = command === "AddStrict" ? true : false

    if (command === "Convert") player.team = GameData.teams.indexOf(target);
    else player.team = GameData.teams.indexOf(roleArray[player.role].team);

    player.rChar = player.char;
    player.rRole = player.role;
    player.rTeam = player.team;

    if (command === "ShowAs") {

      // take into account taken roles if there are multiple possible roles
      if (possibleRoles.length > 1) {
        player.rRole = getRandomId(allRoles, takenObj.roles, possibleRoles);
      } else {
        // else if there is only one possible role the target must be specific so choose it anyway
        player.rRole = allRoles.findIndex(role => role.name === possibleRoles[0].name);
        takenObj.roles.add(player.rRole);
      }

      // change player team to the role they appear as
      player.rTeam = GameData.teams.indexOf(roleArray[player.rRole].team);

    }

    return [player, isStrict]

  }

  /**
   * Finds the neighbour indexes for a given index
   * Views the array as circular, and takes into account skipping narrator type players
   * @param {number} idIndex 
   * @param {Array<Player>} playerArray 
   * @returns {Array<number>} left and right neighbour indexes
   */
  function findNeighbourIds(idIndex, playerArray) {

    let neighbourIds;
    let idArray = playerArray.map((_, index) => index);
  
    // take into account skipping narrators
    let left = idIndex-1, right = idIndex+1;
    while ((typeof playerArray[left] === "undefined" || playerArray[left].type === 0)
      || (typeof playerArray[right] === "undefined" || playerArray[right].type === 0)
    ) {
      if (left < 0) left = idArray.length-1;
      if (right >= idArray.length) right = 0;
      if (playerArray[left].type === 0) left--;
      if (playerArray[right].type === 0) right++;
    }
    neighbourIds = [left, right];
  
    return neighbourIds;
  
  }

  /**
   * Finds a position to place the next player
   * Will take into account any neighbour setup commands currently in the queue
   * @param {Array<Player>} playerArray 
   * @param {Array<number>} randomIndexes 
   * @param {Array<string>} runningCommands 
   * @param {{masters: Array<number>, minions: Object<number, number>}} neighbourGroups 
   * @returns {number} an index position for the next player
   */
  function getNextPlayer(playerArray, randomIndexes, runningCommands, neighbourGroups) {

    let playerIndex;

    // if no neighbour property then just return a random index
    if (runningCommands.length === 0 
      || typeof runningCommands[0][3] === "undefined"
      || !runningCommands[0][3].startsWith("Neighbour")
      ) {
      playerIndex = randomIndexes.shift();
      if (debug) console.log("found new player index early.", randomIndexes.length, "indexes left", randomIndexes);
      return playerIndex;
    }

    let masterId = parseInt(runningCommands[0][3].split("_")[1]);
    let masterIndex = playerArray.findIndex(player => player.id === masterId);
    let neighbourIds = findNeighbourIds(masterIndex, playerArray);
  
    // if left is free
    if (randomIndexes.includes(neighbourIds[0])) {
      if (debug) console.log("left neighbour free");
      playerIndex = neighbourIds[0];
    } 
    
    // if right is free
    else if (randomIndexes.includes(neighbourIds[1])) {
      if (debug) console.log("right neighbour free");
      playerIndex = neighbourIds[1];
    } 
    
    // if left is not part of a group
    else if (!neighbourGroups.masters.includes(playerArray[neighbourIds[0]].id) 
      && !Object.hasOwn(neighbourGroups.minions, playerArray[neighbourIds[0]].id)
    ) {
      if (debug) console.log("swapping left neighbour");
      playerIndex = neighbourIds[0];
      createFreeSpace(randomIndexes, playerIndex, playerArray);
    } 
    
    // if right is not part of a group
    else if (!neighbourGroups.masters.includes(playerArray[neighbourIds[1]].id) 
      && !Object.hasOwn(neighbourGroups.minions, playerArray[neighbourIds[1]].id)
    ) {
      if (debug) console.log("swapping right neighbour");
      playerIndex = neighbourIds[1];
      createFreeSpace(randomIndexes, playerIndex, playerArray);
    }

    // else they are both taken and part of a group
    else {
      // could reorganise all players to create space, or move the master player to create space
      playerIndex = null; // skip this attempt at player creation
      runningCommands.shift(); // admit defeat
      if (debug) console.log("cannot place neighbour of index", masterIndex, "and commands left to process:", JSON.stringify(runningCommands));
      return playerIndex;
    }

    // add to groups and remove index if it gets placed
    if (randomIndexes.includes(playerIndex)) {
      const deleteIndex = randomIndexes.indexOf(playerIndex);
      randomIndexes.splice(deleteIndex, 1);
      neighbourGroups.minions[playerArray[playerIndex].id] = masterId;
    }

    if (debug) console.log("found new player index.", randomIndexes.length, "indexes left", randomIndexes);

    return playerIndex

  }

  /**
   * Swaps a players attributes from a given index to an unprocessed index
   * @param {Array<number>} randomIndexes 
   * @param {number} desiredIndex 
   * @param {Array<Player>} playerArray 
   */
  function createFreeSpace(randomIndexes, desiredIndex, playerArray) {

    if (randomIndexes.length < 1) {
      throw Error("not enough free spaces for neighbours");
    }

    let newIndex = randomIndexes.shift();

    // assume the player at the desired index has already been randomised
    playerArray[newIndex].char = playerArray[desiredIndex].char
    playerArray[newIndex].rChar = playerArray[desiredIndex].rChar
    playerArray[newIndex].role = playerArray[desiredIndex].role
    playerArray[newIndex].rRole = playerArray[desiredIndex].rRole
    playerArray[newIndex].team = playerArray[desiredIndex].team
    playerArray[newIndex].rTeam = playerArray[desiredIndex].rTeam

    randomIndexes.push(desiredIndex);

    if (debug) console.log("swapped player at index", desiredIndex, "to index", newIndex, "with role", roleArray[playerArray[newIndex].role].name);

  }

  const debug = playerArray[0].id === 54321 ? true : false;

  // delcare vars
  const taken = {
    "chars": new Set(),
    "roles": new Set()
  }
  const playerAmount = playerArray.filter(player => player.type !== 0).length;
  const formula = Math.floor((0.5 * playerAmount) - 2);
  let targetAntags = 1;
  let targetDetrimentals = formula > 0 ? formula : 0;
  console.log("detrimentals", targetDetrimentals)
  const runningCommands = [];
  const neighbourGroups = {masters: [], minions: {}};

  // remove any narrators from indexes to place
  const randomIndexes = toShuffled(playerArray.map((_, index) => index).filter(playerIndex => playerArray[playerIndex].type !== 0));

  const randomisedPlayers = [...playerArray];

  // loop through players to randomise
  while (randomIndexes.length > 0) {

    //priority setup command > antag > detrimentals > agents
    //priority setup command > antag > detrimentals > agents

    let playerIndex = getNextPlayer(randomisedPlayers, randomIndexes, runningCommands, neighbourGroups);
    if (playerIndex === null) continue; // if the player cannot be placed due to neighbour problems then skip this loop

    let player = playerArray[playerIndex];
    let isStrict; // strict flag from run command

    // process any running setup commands
    if (runningCommands.length > 0) {

      [player, isStrict] = updatePlayerFromCommand(
        player, runningCommands, charArray, roleArray, taken);

    } else { // else randomise player

      isStrict = false;

      // get role list to pick from
      let targetRoles
      if (targetAntags > 0) {
        targetRoles = roleArray.filter(role => role.types.includes("Antagonist"));
        targetAntags--;
      } else if (targetDetrimentals > 0) {
        targetRoles = roleArray.filter(role => role.types.includes("Detrimental"));
        targetDetrimentals--;
      } else {
        targetRoles = roleArray.filter(role => role.types.includes("Agent"));
      }

      // randomise player
      player.char = player.rChar = getRandomId(charArray, taken.chars);
      player.role = player.rRole = getRandomId(roleArray, taken.roles, targetRoles);
      player.team = player.rTeam = GameData.teams.indexOf(roleArray[player.role].team);

    }

    if (debug) console.log("adding player with role", roleArray[player.role].name, "at index", playerIndex, "who is", charArray[player.char].name);
    
    // add commands if the role has any
    if (roleArray[player.role]["setup"].length > 0) {

      let immediateCommands = addSetupCommand(player.role, runningCommands, isStrict, player, neighbourGroups);

      // run any commands that modify its own role
      if (immediateCommands.length > 0) {
        immediateCommands.forEach(command => {
          runSetupCommand(player, command, charArray, roleArray, taken, true);
        })
        // rest array
        immediateCommands.length = 0;
      }

    }

    // return randomised player
    randomisedPlayers[playerIndex] = player;

  }

  if (debug) console.log("groups", neighbourGroups);

  return randomisedPlayers;
      
}