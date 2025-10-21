import GameData from "../../../strings/_gameData";
import { OperatingPlayer, Randomiser, SetupCommandParams } from "../randomiser";

export default function showAs(aPlayer: OperatingPlayer, params: SetupCommandParams, randomiser: Randomiser) {

  const takenSetsTarget = `${params.targetName}s`;
  const playerAttribute = params.targetShownName;

  if (takenSetsTarget !== "chars" && takenSetsTarget !== "roles") {
    throw new Error(`showas target not set properly, found ${takenSetsTarget} for taken set`);
  }

  if (playerAttribute !== "rChar" && playerAttribute !== "rRole") {
    throw new Error(`showas target not set properly, found ${playerAttribute} for player attribute`);
  }

  // take into account taken roles if there are multiple possible roles
  if (params.possibleTargets.length > 1) {
    aPlayer.playerObj[playerAttribute] = randomiser.getRandomIndex(params.targetArray, randomiser.takenSets[takenSetsTarget], params.possibleTargets);
  } else {
    // else if there is only one possible role the target must be specific so choose it anyway
    aPlayer.playerObj[playerAttribute] = params.targetArray.findIndex(target => target.id === params.possibleTargets[0].id);
    randomiser.takenSets[takenSetsTarget].add(aPlayer.playerObj[playerAttribute]);
  }

  // change player team to the role they appear as
  aPlayer.playerObj.rTeam = GameData.teams.indexOf(randomiser.roleArray[aPlayer.playerObj.rRole].team);

}