import { OperatingPlayer, Randomiser, SetupCommandParams } from "../randomiser";

export default function add(aPlayer: OperatingPlayer, params: SetupCommandParams, randomiser: Randomiser) {

  const takenSetsTarget = `${params.targetName}s`;
  const playerAttribute = params.targetName;

  if (takenSetsTarget !== "chars" && takenSetsTarget !== "roles") {
    throw new Error(`add target not set properly, found ${takenSetsTarget} for taken set`);
  }

  if (playerAttribute !== "char" && playerAttribute !== "role") {
    throw new Error(`add target not set properly, found ${playerAttribute} for player attribute`);
  }

  // delete initially randomised target from the taken targets
  randomiser.takenSets[takenSetsTarget].delete(aPlayer.playerObj[playerAttribute]);

  // take into account taken targets if there are multiple possible targets
  if (params.possibleTargets.length > 1) {
    aPlayer.playerObj[playerAttribute] = randomiser.getRandomIndex(params.targetArray, randomiser.takenSets[takenSetsTarget], params.possibleTargets);
  } else if (params.possibleTargets.length === 1 && params.command !== "AddInvariant") {
    // else if there is only one possible target and no invariant it must be specific so choose it anyway
    aPlayer.playerObj[playerAttribute] = params.targetArray.findIndex(target => target.id === params.possibleTargets[0].id);
    randomiser.takenSets[takenSetsTarget].add(aPlayer.playerObj[playerAttribute]);
  } else if (params.possibleTargets.length === 1 && params.command === "AddInvariant") {
    const targetId = params.targetArray.findIndex(target => target.id === params.possibleTargets[0].id);
    const targetIsAlreadyInUse = randomiser.takenSets[takenSetsTarget].has(targetId);
    if (targetIsAlreadyInUse) {
      const filteredSet = params.targetName === "char" ? null : randomiser.roleArray.filter(role => role.type === "Agent");
      aPlayer.playerObj[playerAttribute] = randomiser.getRandomIndex(params.targetArray, randomiser.takenSets[takenSetsTarget], filteredSet);
    } else {
      aPlayer.playerObj[playerAttribute] = targetId;
      randomiser.takenSets[takenSetsTarget].add(targetId);
    }
  }

}