import {Box, Card, Tab, Tabs} from '@mui/material';
import { useState } from 'react';
import { OpenChatTab } from '../helpers/enumTypes.ts';
import ChatDebugWindow from './ChatDebugWindow.tsx';
import ChatCommunicationWindow from './ChatCommunicationWindow.tsx';
import ChatLogWindow from './ChatLogWindow.tsx';

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
      <ChatLogWindow openTab={openTab}/>
      <ChatDebugWindow openTab={openTab}/>
    </Card>
  );
}

export default Chat








