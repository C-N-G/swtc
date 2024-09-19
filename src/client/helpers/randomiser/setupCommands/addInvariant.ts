import { OperatingPlayer, Randomiser, SetupCommandParams } from "../randomiser";

export default function addInvariant(aPlayer: OperatingPlayer, params: SetupCommandParams, randomiser: Randomiser) {

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

  const targetId = params.targetArray.findIndex(target => target.id === params.possibleTargets[0].id);
  const targetIsAlreadyInUse = randomiser.takenSets[takenSetsTarget].has(targetId);
  if (targetIsAlreadyInUse) { // if target is already in use then just give it a random agent role or characteristic
    const filteredSet = params.targetName === "char" ? null : randomiser.roleArray.filter(role => role.type === "Agent");
    aPlayer.playerObj[playerAttribute] = randomiser.getRandomIndex(params.targetArray, randomiser.takenSets[takenSetsTarget], filteredSet);
  } else {
    aPlayer.playerObj[playerAttribute] = targetId;
    randomiser.takenSets[takenSetsTarget].add(targetId);
  }

}