import { OperatingPlayer, Randomiser, SetupCommandParams } from "../randomiser";

export default function neighbour(aPlayer: OperatingPlayer, params: SetupCommandParams, randomiser: Randomiser) {

  const playerAttribute = params.targetName;

  if (playerAttribute !== "char" && playerAttribute !== "role") {
    throw new Error(`neighbour target not set properly, found ${playerAttribute} for player attribute`);
  }

  // find targets
  const playerIndexes: number[] = [];
  params.possibleTargets.forEach(target => {
  randomiser.randomisedPlayers.forEach((player, index) => {
    if (params.targetArray[player[playerAttribute]]?.id === target.id) playerIndexes.push(index);
  })})

  if (playerIndexes.length === 0) {
    throw new Error("Could not find the target to neighbour");
  }

  // does the player already neighbour a target?
  const [leftIndex, rightIndex] = randomiser.findNeighbourIndexes(aPlayer.index);
  if (playerIndexes.some(index => index === leftIndex || index === rightIndex)) return;

  // try and move the player to neighbour the target
  let newIndex;
  for (const index of playerIndexes) {
    newIndex = randomiser.getFreeNeighbourIndex(index);
    if (newIndex === null) continue;
    randomiser.movePlayerToIndex(newIndex, aPlayer);
    break;
  }

  if (newIndex === null) {
    throw new Error("Could not place player next to target neighbour during setup command");
  }

}