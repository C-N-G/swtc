import {Box, Card, Tab, Tabs} from '@mui/material';
import { useContext } from 'react';
import { OpenChatTab } from '../helpers/enumTypes.ts';
import ChatDebugWindow from './ChatDebugWindow.tsx';
import ChatCommWindow from './ChatCommWindow.tsx';
import useStore from '../hooks/useStore.ts';
import { UserContext } from '../App.tsx';
import { isNarrator } from '../helpers/util.ts';

const TABS_TYLE = {
  minHeight: "15px",
  maxHeight: "30px",
}

const TAB_STYLE = {
  padding: "5px",
  minHeight: "15px",
  fontSize: '0.9rem',
}

const UNREAD_STYLE = {
  fontWeight: 700,
  background: "linear-gradient(var(--sl-color-accent) 10%, rgba(0,0,0,0) 50%);",
  borderRadius: "5px 5px 0 0",
}

function Chat() {

  const currentPrivateChatId = useStore(state => state.currentPrivateChatId);
  const session = useStore(state => state.session);
  const user = useContext(UserContext);
  const chats = useStore(state => state.chats);
  const setChatAsRead = useStore(state => state.setChatAsRead);
  const openChatTab = useStore(state => state.openChatTab);
  const setOpenChatTab = useStore(state => state.setOpenChatTab);
  const getOtherChatUser = useStore(state => state.getOtherChatUser);

  // add private talking channels for players to view and use
  // add button in top right of private chat window to select from list of possible group chats
  // add quick helpers for narrator to open specific group chats
  // make it so whoever the narrator selected last is the selected private chat
  /**
   * DONE when a player joins, a channel is made between them and the narrator
   * DONE make narrator text notifications appear next to player indicators
   * DONE players get that private chat set as their open current private chat
   * DONE for the narrator put the player name as the chat tab text
   * 
   * TODO add logging
   * TODO when a player leaves or dcs the channels are cleaned up
   * TODO make chat creation happen on message arrival for the narrator
   */

  function handleTabChange(_: unknown, newValue: number) {
    setOpenChatTab(newValue);
    let chatId;
    if (newValue === OpenChatTab.Global) chatId = "global";
    else if (newValue === OpenChatTab.Private) chatId = currentPrivateChatId;
    else if (newValue === OpenChatTab.Log) chatId = "log";

    if (chatId) {
      setChatAsRead(chatId);
    }
    
  }

  function getIsUnreadStyle(chatId: string) {
    const isUnread = chats[chatId]?.unread;
    return isUnread ? UNREAD_STYLE : {};
  }

  let privateLabel;
  if (isNarrator(user)) {
    if (!currentPrivateChatId) {
      privateLabel = "Player"
    } else {
      const otherChatUser = getOtherChatUser(currentPrivateChatId);
      privateLabel = otherChatUser.label || otherChatUser.name || "Unknown";
    }
  } else {
    privateLabel = "Narrator"
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
        <Tabs sx={TABS_TYLE} value={openChatTab} onChange={handleTabChange} variant={"fullWidth"}>
          <Tab sx={{...TAB_STYLE, ...getIsUnreadStyle("global")}} label="Global" />
          <Tab sx={{...TAB_STYLE, ...getIsUnreadStyle(currentPrivateChatId)}} label={privateLabel} />
          <Tab sx={{...TAB_STYLE, ...getIsUnreadStyle("log")}} label="Log" />
          {!session.id && <Tab sx={TAB_STYLE} label="Debug" />}
        </Tabs>
      </Box>
      <ChatCommWindow openTab={openChatTab} thisTabId={OpenChatTab.Global} enableInput={true} chatId="global" />
      <ChatCommWindow openTab={openChatTab} thisTabId={OpenChatTab.Private} enableInput={true} chatId={currentPrivateChatId} />
      <ChatCommWindow openTab={openChatTab} thisTabId={OpenChatTab.Log} enableInput={false} chatId="log" />
      <ChatDebugWindow openTab={openChatTab}/>
    </Card>
  );
}

export default Chat








