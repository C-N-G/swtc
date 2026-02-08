import Role from "../../../classes/role";
import GameData from "../../../strings/_gameData";
import { OperatingPlayer, Randomiser, SetupCommandParams } from "../randomiser";

export default function addInvariant(aPlayer: OperatingPlayer, params: SetupCommandParams, randomiser: Randomiser) {

  const takenSetsTarget = `${params.targetName}s`;
  const playerAttribute = params.targetName;
  const playerRealAttribute = `r${params.targetName.slice(0, 1).toUpperCase()}${params.targetName.slice(1)}`;

  if (takenSetsTarget !== "chars" && takenSetsTarget !== "roles") {
    throw new Error(`add target not set properly, found ${takenSetsTarget} for taken set`);
  }

  if (playerAttribute !== "char" && playerAttribute !== "role") {
    throw new Error(`add target not set properly, found ${playerAttribute} for player attribute`);
  }

  if (playerRealAttribute !== "rChar" && playerRealAttribute !== "rRole") {
    throw new Error(`add target not set properly, found ${playerRealAttribute} for player attribute`);
  }

  // delete initially randomised target from the taken targets
  randomiser.takenSets[takenSetsTarget].delete(aPlayer.playerObj[playerAttribute]);

  const targetId = params.targetArray.findIndex(target => target.id === params.possibleTargets[0].id);
  const targetIsAlreadyInUse = randomiser.takenSets[takenSetsTarget].has(targetId);
  if (!targetIsAlreadyInUse) {
    aPlayer.playerObj[playerAttribute] = targetId;
    aPlayer.playerObj[playerRealAttribute] = targetId;
    if (playerAttribute === "role") {
      const team = (params.targetArray[targetId] as Role).team;
      aPlayer.playerObj["team"] = GameData.teams.indexOf(team);
    }
    randomiser.takenSets[takenSetsTarget].add(targetId);
  } 

}