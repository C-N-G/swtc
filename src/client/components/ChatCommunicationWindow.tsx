import { Box, TextField } from "@mui/material";
import { useState } from "react";
import ChatMessage from "../classes/chatMessage";
import { OpenChatTab } from "../helpers/enumTypes";
import ChatBaseWindow from "./ChatBaseWindow";
import useStore from "../hooks/useStore";

function ChatCommunicationWindow({openTab}: {openTab: OpenChatTab}) {

  const [messageValue, setMessageValue] = useState("");
  const chatHistory = useStore(state => state.chat);
  const addChatMessage = useStore(state => state.addChatMessage);

  function handleSend() {
    const messageExists = messageValue.length > 0;
    const newChatMessage = new ChatMessage(
      messageValue,
      "test",
      "test",
    )
    if (messageExists) addChatMessage(newChatMessage, "chat");
    setMessageValue("");
  }

  return <Box sx={{
    flexGrow: "1", 
    position: "relative", 
    display: openTab !== OpenChatTab.Chat ? "none" : "flex", 
    flexDirection: "column",
    height: "calc(100% - 30px)"
  }}>
    <ChatBaseWindow chatHistory={chatHistory} />
    <TextField 
      sx={{borderTop: "2px solid var(--sl-color-accent)"}}
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

export default ChatCommunicationWindow;