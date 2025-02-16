import Player from "../classes/player"

export const isNarrator = (player: Player | null): boolean => {
  return player?.type === 0;
}