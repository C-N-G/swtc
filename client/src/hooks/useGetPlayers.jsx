import {useState} from "react";
import Player from "../classes/player.js";

const somePlayers = [];
for (let i = 0; i < 16; i++) {
  let player = new Player(i, "Player " + i);
  somePlayers.push(player.data);
}

function useGetPlayers() {

  const [players, setPlayers] = useState(somePlayers);

  return [players, setPlayers];

}

export default useGetPlayers;