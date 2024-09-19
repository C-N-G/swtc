import GameData from "../../../strings/_gameData";
import { OperatingPlayer, SetupCommandParams } from "../randomiser";

export default function convert(aPlayer: OperatingPlayer, params: SetupCommandParams) {

  aPlayer.playerObj.team = GameData.teams.indexOf(params.target);

}