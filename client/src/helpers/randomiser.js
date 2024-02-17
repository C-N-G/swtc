import GameData from "../strings/_gameData.js";

export default function randomiser(playerArray, charArray, roleArray) {

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
        throw Error("not enough options to uniquely randomise")
      }

    }
    return id

  }

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

    return [player, commandsArray, isStrict];

  }

  function shuffle(inputArray) {

    let array = [...inputArray];
    let currentIndex = array.length,  randomIndex;
    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;

  }

  function addSetupCommand(roleId, commandsArray, isStrict, player, neighbourGroups) {

    let immediateCommandsArray = [];

    roleArray[roleId]["setup"].forEach(cmd => {

      // ignore if it is just text description and no command
      if (cmd.length < 2) return;

      const commandArray = cmd[1].split(" ");

      // if the command doesn't have a quantity then run it immediately
      if (Number.isNaN(Number(commandArray[1]))) {
        immediateCommandsArray.push(commandArray);
      } else if (!isStrict) { // do not add commands if the command was strict
        if (commandArray[3] === "Neighbour") {
          commandArray[3] = `${commandArray[3]}_${player.id}`;
          neighbourGroups.masters.push(player.id);
        }
        commandsArray.push(commandArray);
      }
      

    })

    return [commandsArray, immediateCommandsArray, neighbourGroups];

  }

  /**
   * edge case: two neighbour roles both adding neighbours.
   * edge case: neighbour overwrites detrimental.
   * edge case: command target has already been picked.
   * edge case: command target type has already been picked.
   * edge case: add 1 subversive where it picks a subversive that has its own setup commeands.
   */
  function runSetupCommand(player, cmd, allChars, allRoles, takenObj, keepSame = false) {

    const [command, target] = [cmd[0], cmd[1].replace("_", " ")];

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

    console.log("running command", command, target);

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

  function getNextPlayer(playerArray, randomIndexes, runningCommands, neighbourGroups) {

    let playerIndex;

    if (runningCommands.length > 0 
      && typeof runningCommands[0][3] !== "undefined"
      && runningCommands[0][3].startsWith("Neighbour")
      ) {

      let masterId = parseInt(runningCommands[0][3].split("_")[1]);
      let masterIndex = playerArray.findIndex(player => player.id === masterId);
      let neighbourIds = findNeighbourIds(masterIndex, playerArray);
    
      // if left is free
      if (randomIndexes.includes(neighbourIds[0])) {
        console.log("left neighbour free");
        playerIndex = neighbourIds[0];
      } 
      
      // if right is free
      else if (randomIndexes.includes(neighbourIds[1])) {
        console.log("right neighbour free");
        playerIndex = neighbourIds[1];
      } 
      
      // if left is not part of a group
      else if (!neighbourGroups.masters.includes(playerArray[neighbourIds[0]].id) 
        && !Object.hasOwn(neighbourGroups.minions, playerArray[neighbourIds[0]].id)
      ) {
        console.log("left neighbour swapped");
        playerIndex = neighbourIds[0];
        [randomIndexes, playerArray] = createFreeSpace(randomIndexes, playerIndex, playerArray);
      } 
      
      // if right is not part of a group
      else if (!neighbourGroups.masters.includes(playerArray[neighbourIds[1]].id) 
        && !Object.hasOwn(neighbourGroups.minions, playerArray[neighbourIds[1]].id)
      ) {
        console.log("right neighbour swapped");
        playerIndex = neighbourIds[1];
        [randomIndexes, playerArray] = createFreeSpace(randomIndexes, playerIndex, playerArray);
      }

      // else they are both taken and part of a group
      else {
        // could reorganise all players to create space, or move the master player to create space
        playerIndex = randomIndexes.shift();
        console.log("before shifting", JSON.stringify(runningCommands))
        runningCommands.shift(); // admit defeat
        console.log("cannot place neighbour of index", masterIndex, "commands left to process:", JSON.stringify(runningCommands));
        // BUG here command queue is still running even when a place cannot be found
        // should only run a setup command if the neighbour proprty can be verified?
        /**
found new player index. 8 indexes left (8) [5, 2, 3, 6, 8, 1, 7, 0]
randomiser.js?t=1708140095483:364 adding player with role Serial Killer at index 4 who is Diligent
randomiser.js?t=1708140095483:264 found new player index. 7 indexes left (7) [2, 3, 6, 8, 1, 7, 0]
randomiser.js?t=1708140095483:126 running command Add Subversive
randomiser.js?t=1708140095483:364 adding player with role Mayhem Killer at index 5 who is Humble
randomiser.js?t=1708140095483:264 found new player index. 6 indexes left (6) [3, 6, 8, 1, 7, 0]
randomiser.js?t=1708140095483:126 running command Add Close Killer
randomiser.js?t=1708140095483:364 adding player with role Close Killer at index 2 who is Empathic
randomiser.js?t=1708140095483:264 found new player index. 5 indexes left (5) [6, 8, 1, 7, 0]
randomiser.js?t=1708140095483:126 running command Add Close Killer
randomiser.js?t=1708140095483:364 adding player with role Close Killer at index 3 who is Temperate
randomiser.js?t=1708140095483:210 left neighbour free
randomiser.js?t=1708140095483:264 found new player index. 4 indexes left (4) [6, 8, 7, 0]
randomiser.js?t=1708140095483:126 running command AddStrict Maniac Killer
randomiser.js?t=1708140095483:364 adding player with role Maniac Killer at index 1 who is Patient
randomiser.js?t=1708140095483:126 running command ShowAs Agent
randomiser.js?t=1708140095483:242 before shifting [["AddStrict",1,"Maniac_Killer","Neighbour_1"],["AddStrict","2","Maniac_Killer","Neighbour_2"]]
randomiser.js?t=1708140095483:244 cannot place neighbour of index 2 commands left to process: [["AddStrict","2","Maniac_Killer","Neighbour_2"]]
randomiser.js?t=1708140095483:264 found new player index. 3 indexes left (3) [8, 7, 0]
randomiser.js?t=1708140095483:126 running command AddStrict Maniac Killer
randomiser.js?t=1708140095483:364 adding player with role Maniac Killer at index 6 who is Clairvoyant
randomiser.js?t=1708140095483:126 running command ShowAs Agent
randomiser.js?t=1708140095483:233 right neighbour swapped
randomiser.js?t=1708140095483:293 swapped player at index 4 to index 8 with role Serial Killer
randomiser.js?t=1708140095483:264 found new player index. 2 indexes left (2) [7, 0]
randomiser.js?t=1708140095483:126 running command AddStrict Maniac Killer
randomiser.js?t=1708140095483:364 adding player with role Maniac Killer at index 4 who is Lustful
randomiser.js?t=1708140095483:126 running command ShowAs Agent
randomiser.js?t=1708140095483:264 found new player index. 1 indexes left [0]
randomiser.js?t=1708140095483:364 adding player with role Underachiever at index 7 who is Charitable
randomiser.js?t=1708140095483:264 found new player index. 0 indexes left []
randomiser.js?t=1708140095483:389 groups {masters: Array(2), minions: {…}}
         */
      }

      if (randomIndexes.includes(playerIndex)) {
        randomIndexes = randomIndexes.filter(index => index !== playerIndex);
      }

      // add to groups regardless of if it actually got placed as a neighbour or not
      neighbourGroups.minions[playerArray[playerIndex].id] = masterId;

    } else {
      playerIndex = randomIndexes.shift();
    }

    // if there are not 3 empty spaces available then do not choose a role with a neighbour setup command
    // is next setup command has a neighbour command
    // find where to place neighbour and place them
    // if neighbour spot is taken then move that player to an open spot
    // if there is no open spot do not run the setup command

    console.log("found new player index.", randomIndexes.length, "indexes left", randomIndexes);

    return [playerIndex, playerArray, runningCommands, randomIndexes, neighbourGroups];

  }

  function createFreeSpace(randomIndexes, desiredIndex, playerArray) {

    if (randomIndexes.length < 2) {
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

    console.log("swapped player at index", desiredIndex, "to index", newIndex, "with role", roleArray[playerArray[newIndex].role].name);

    return [randomIndexes, playerArray];

  }

  // delcare vars
  const taken = {
    "chars": new Set(),
    "roles": new Set()
  }
  let targetAntags = 1;
  let targetDetrimentals = 2;
  let runningCommands = [];
  let neighbourGroups = {masters: [], minions: {}};

  let randomIndexes = playerArray.map((_, index) => index);
  randomIndexes = shuffle(randomIndexes);

  let randomisedPlayers = [...playerArray];

  // loop through players to randomise
  while (randomIndexes.length > 0) {

    //priority setup command > antag > detrimentals > agents
    //priority setup command > antag > detrimentals > agents

    // const playerIndex = randomIndexes.shift();
    let playerIndex;
    [playerIndex, randomisedPlayers, runningCommands, 
      randomIndexes, neighbourGroups] 
      = getNextPlayer(randomisedPlayers, randomIndexes, 
        runningCommands, neighbourGroups);
    let player = playerArray[playerIndex];
    let isStrict; // strict flag from run command

    // if narrator then ignore
    if (player.type === 0) {
      continue;
    }

    // process any running setup commands
    if (runningCommands.length > 0) {

      [player, runningCommands, isStrict] = updatePlayerFromCommand(
        player, runningCommands, charArray, roleArray, taken
      );

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

    console.log("adding player with role", roleArray[player.role].name, "at index", playerIndex, "who is", charArray[player.char].name);
    
    // add commands if the role has any
    if (roleArray[player.role]["setup"].length > 0) {

      let immediateCommands;

      [runningCommands, immediateCommands, neighbourGroups] = addSetupCommand(player.role, runningCommands, isStrict, player, neighbourGroups);

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

  console.log("groups", neighbourGroups);

  return randomisedPlayers;
      
}