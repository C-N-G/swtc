import { OperatingPlayer, Randomiser, SetupCommandParams } from "../randomiser";
import add from "./add.ts";

export default function addStrict(aPlayer: OperatingPlayer, params: SetupCommandParams, randomiser: Randomiser) {

  add(aPlayer, params, randomiser);

}