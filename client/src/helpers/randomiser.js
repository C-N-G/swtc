import GameData from "../strings/_gameData.js";

export default function randomiser(playerArray, charArray, roleArray) {

  function getRandomId(idArray, takenIdsSet, destArray, filteredIdArray) {

    let id, randomNum;
    while (typeof id === "undefined") {

      if (filteredIdArray) {
        randomNum = Math.floor(Math.random() * filteredIdArray.length);
        randomNum = roleArray.findIndex(role => role.name === filteredIdArray[randomNum].name);
      } else {
        // skip out the first value which is unknown
        randomNum = Math.floor(Math.random() * (idArray.length - 1) + 1);
      }

      if (takenIdsSet.has(randomNum) === false) {
        takenIdsSet.add(randomNum);
        id = randomNum;
      }

      if (destArray.length > idArray.length) {
        id = randomNum;
      }

    }
    return id

  }

  function updatePlayerFromCommand(player, commandsArray) {

    const commandArray = commandsArray[0];
    const commandQuantity = commandArray[1];

    // console.log("running cmd", commandArray);

    const [aChar, aRole, aTeam] = runSetupCommand(commandArray)

    // console.log("player update", player.name, aChar, aRole, aTeam);

    if (aChar) {
      charsTaken.delete(player.char); 
      player.char = aChar;
    }

    if (aRole) {
      rolesTaken.delete(player.role); // remove role as taken so other players can use it
      player.role = aRole;
    }

    if (aTeam) player.team = aTeam;

    // handle command quantity
    if (commandQuantity > 1) {
      commandArray[1]--;
    } else {
      commandsArray.shift();
    }

    return [player, commandsArray];

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

  function addSetupCommand(roleId, commandsArray) {

    roleArray[roleId]["setup"].forEach(cmd => {

      // ignore if it is just text description and no command
      if (cmd.length < 2) return;

      const commandArray = cmd[1].split(" ");
      commandsArray.push(commandArray);

    })

    return commandsArray;

  }

  /**
   * edge case: two neighbour roles both adding neighbours.
   * edge case: neighbour overwrites detrimental.
   * edge case: command target has already been picked.
   * edge case: command target type has already been picked.
   * edge case: add 1 subversive where it picks a subversive that has its own setup commeands.
   */
  function runSetupCommand(cmd) {

    const [command, target, neighbour] = [cmd[0], cmd[2], cmd[3]];
    let charId, roleId, teamId;
    charId = roleId = teamId = null;

    if (command.includes("Add")) {

      roleId = roleArray.findIndex(role => {
        return role.name === target 
        || role.team === target 
        || role.types.includes(target)
      })

      if (command !== "AddStrict" &&
      roleArray[roleId]["setup"].length > 0 ) {
        runningCommands = addSetupCommand(roleId, runningCommands);
      }

    }

    if (command === "Convert") teamId = GameData.teams.indexOf(target);
    else teamId = GameData.teams.indexOf(roleArray[roleId].team);

    return [charId, roleId, teamId]

  }

  // delcare vars
  const charsTaken = new Set();
  const rolesTaken = new Set();
  let targetAntags = 1;
  let targetDetrimentals = 2;
  let runningCommands = [];
  let usedCommand;

  let randomIndexes = playerArray.map((_, index) => index);
  randomIndexes = shuffle(randomIndexes);

  let randomisedPlayers = [...playerArray];

  // loop through players to randomise
  while (randomIndexes.length > 0) {

    const playerId = randomIndexes.shift();
    let player = playerArray[playerId];
    usedCommand = false;

    // if narrator then ignore
    if (player.type === 0) {
      continue;
    }

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

    // update and return randomised player
    player.char = getRandomId(charArray, charsTaken, playerArray);
    player.role = getRandomId(roleArray, rolesTaken, playerArray, targetRoles);
    player.team = GameData.teams.indexOf(roleArray[player.role].team);

    // process any running setup commands
    if (runningCommands.length > 0) {

      [player, runningCommands] = updatePlayerFromCommand(player, runningCommands);
      usedCommand = true;

    }

    player.rChar = player.char;
    player.rRole = player.role;
    player.rTeam = player.team;

    // return randomised player
    randomisedPlayers[playerId] = player;

    // check for role setup commands
    if (roleArray[player.role]["setup"].length < 1) {
      continue;
    }

    // add commands if role was not ammended from previous command
    if (!usedCommand) {
      runningCommands = addSetupCommand(player.role, runningCommands);
    }

  }

  return randomisedPlayers;
      
}