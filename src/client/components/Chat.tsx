import {Box, Card, Tab, Tabs} from '@mui/material';
import { useState } from 'react';
import { OpenChatTab } from '../helpers/enumTypes.ts';
import ChatDebugWindow from './ChatDebugWindow.tsx';
import ChatCommWindow from './ChatCommWindow.tsx';
import useStore from '../hooks/useStore.ts';

function Chat() {

  const [openTab, setOpenTab] = useState<OpenChatTab>(OpenChatTab.Global);
  const currentPrivateChatId = useStore(state => state.currentPrivateChatId);

  // add private talking channels for players to view and use
  // add button in top right of private chat window to select from list of possible group chats
  // add quick helpers for narrator to open specific group chats
  /**
   * DONE when a player joins, a channel is made between them and the narrator
   * TODO when a player leaves or dcs the channels are cleaned up
   * DONE players get that private chat set as their open current private chat
   * TODO there should be a selector in the private chat to be able to select different chat channels you are a part of
   * TODO narrator needs a button in the player details view which will set that chat to their private chat
   */

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
          <Tab sx={TAB_STYLE} label="Global" />
          <Tab sx={TAB_STYLE} label="Private" />
          <Tab sx={TAB_STYLE} label="Log" />
          <Tab sx={TAB_STYLE} label="Debug" />
        </Tabs>
      </Box>
      <ChatCommWindow openTab={openTab} thisTabId={OpenChatTab.Global} enableInput={true} chatId="global" />
      <ChatCommWindow openTab={openTab} thisTabId={OpenChatTab.Private} enableInput={true} chatId={currentPrivateChatId} />
      <ChatCommWindow openTab={openTab} thisTabId={OpenChatTab.Log} enableInput={false} chatId="log" />
      <ChatDebugWindow openTab={openTab}/>
    </Card>
  );
}

export default Chat








