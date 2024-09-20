import {Box, Button, Card, List, ListItem, ListItemText, Stack, Tab, Tabs, TextField, Typography} from '@mui/material';
import useStore from '../hooks/useStore';
import Player from '../classes/player.ts';
import GameData from '../strings/_gameData.ts';
import { useEffect, useRef, useState } from 'react';


enum OpenChatTab {
  Chat,
  Log,
  Debug,
}


function Chat() {

  const [openTab, setOpenTab] = useState<OpenChatTab>(OpenChatTab.Chat);

  function handleTabChange(_: unknown, newValue: number) {
    setOpenTab(newValue);
  }
  
  const TABS_TYLE = {
    minHeight: "15px",
    maxHeight: "30px",
  }

  const TAB_STYLE = {
    padding: "5px",
    minHeight: "15px",
    fontSize: '0.9rem',
  }

  return (
    <Card sx={{
      background: "var(--sl-color-gray-5)", 
      borderLeft: "2px solid var(--sl-color-accent)",
      boxSizing: "border-box",
      width: "100%",
      height: "28%",
      flexGrow: 1,
      display: 'flex',
      fontSize: '1.3rem',
      flexDirection: "column",
      mt: 2
    }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs sx={TABS_TYLE} value={openTab} onChange={handleTabChange} variant={"fullWidth"}>
          <Tab sx={TAB_STYLE} label="Chat" />
          <Tab sx={TAB_STYLE} label="Log" />
          <Tab sx={TAB_STYLE} label="Debug" />
        </Tabs>
      </Box>
      <ChatCommunicationWindow openTab={openTab} />
      <ChatDebugWindow openTab={openTab}/>
    </Card>
  );
}

export default Chat

function ChatCommunicationWindow({openTab}: {openTab: OpenChatTab}) {

  interface ChatMessage {
    id: string;
    value: string;
    author: string;
    timeStamp: Date;
    status: string;
  }

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [messageValue, setMessageValue] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  function handleSend() {
    const messageExists = messageValue.length > 0;
    const newChatMessage = {
      id: "test",
      value: messageValue,
      author: "test",
      timeStamp: new Date(),
      status: "test",
    }
    if (messageExists) setChatHistory(prev => ([...prev, newChatMessage]));
    setMessageValue("");
  }

  function formatTime(date: Date) {
    const hours = date.getHours() <= 9 ? `0${date.getHours()}` : date.getHours();
    const minutes = date.getMinutes() <= 9 ? `0${date.getMinutes()}` : date.getMinutes();
    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTo(0, chatRef.current.scrollHeight);
  }, [chatHistory])

  // TODO stop chat messages overflow in the x dimension

  return <Box hidden={openTab !== OpenChatTab.Chat} sx={{flexGrow: "1", position: "relative"}}>
    <Box ref={chatRef} sx={{overflowY: "scroll", maxHeight: "152px", height: "152px"}}>
      <List dense={true} sx={{p: "0"}}>
        {chatHistory.map(msg => {
          return <ListItem sx={{p: "0", m: "0"}}>
            <ListItemText sx={{p: "0", m: "0", px: "6px"}}>
              <Stack direction={"row"} justifyContent={"space-between"}>
                <Typography>{msg.author}: {msg.value}</Typography>
                <Typography>{formatTime(msg.timeStamp)}</Typography>
              </Stack>
            </ListItemText>
          </ListItem>
        })}
      </List>
    </Box>
    <TextField 
      sx={{
        position: "absolute",
        bottom: "0",
        borderTop: "2px solid var(--sl-color-accent)",
      }}
      variant="standard"
      size="small"
      margin="none"
      fullWidth
      value={messageValue}
      onChange={(e) => setMessageValue(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" ? handleSend() : false}
    />
  </Box>
}

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

  return <Box sx={{
    display: openTab !== OpenChatTab.Debug ? "none" : "flex",
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: "column",
    mt: "10px",
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
          <Button size="small" variant="contained" onClick={() => pushPlayer()}>
            +1
          </Button>
          <Button size="small" variant="contained" onClick={() => popPlayer()}>
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
