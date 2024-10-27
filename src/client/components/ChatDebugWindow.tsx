import { Box, Button } from '@mui/material';
import Player from '../classes/player.ts';
import GameData from '../strings/_gameData.ts';
import { OpenChatTab } from "../helpers/enumTypes.ts";
import useStore from "../hooks/useStore.ts";
import ChatMessage from '../classes/chatMessage.ts';

const PLAYER = new Player(String(54321), "Player " + 54321, "", 0);

const somePlayers = [PLAYER];
for (let i = 0; i < 8; i++) {
  const player = new Player(String(i), "Player " + i, i % 2 === 1 ? "test/testing" : "");
  somePlayers.push(player);
}

function ChatDebugWindow({openTab}: {openTab: OpenChatTab}) {

  const sessionId = useStore(state => state.session.id);
  const toggleDebugUser = useStore(state => state.toggleDebugUser);
  const userId = useStore(state => state.userId);
  const pushPlayer = useStore(state => state.pushPlayer);
  const popPlayer = useStore(state => state.popPlayer);
  const setUserId = useStore(state => state.setUserId);
  const setPlayers = useStore(state => state.setPlayers);
  const setScenarios = useStore(state => state.setScenarios);

  const addChatMessage = useStore(state => state.addChatMessage);

  return <Box sx={{
    display: openTab !== OpenChatTab.Debug ? "none" : "flex",
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: "column",
    mt: "10px",
    gap: "10px",
    }}>
    {sessionId ? "" : <>
      <Button variant="contained" onClick={() => {
        setUserId("54321");
        setPlayers([...somePlayers]);
        setScenarios([GameData.scenarios[0]]);
      }}>
        Add Dummy Players
      </Button>
      {userId === "54321" || userId === "0" ? <>
        <Box>
          <Button size="small" variant="contained" onClick={() => {
            pushPlayer()
            addChatMessage(new ChatMessage("Player Added", "System", "sent"), "log")
            }}>
            +1
          </Button>
          <Button size="small" variant="contained" onClick={() => {
            popPlayer()
            addChatMessage(new ChatMessage("Player Removed", "System", "sent"), "log")
            }}>
            -1
          </Button>
        </Box>
        <Button size="small" variant="contained" onClick={() => toggleDebugUser()}>
          Change Player Type
        </Button>
      </> : ""}
    </>}
  </Box>
}

export default ChatDebugWindow;