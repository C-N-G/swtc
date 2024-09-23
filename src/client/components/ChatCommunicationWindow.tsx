import { Box, TextField } from "@mui/material";
import { useState } from "react";
import ChatMessage from "../classes/chatMessage";
import { OpenChatTab } from "../helpers/enumTypes";
import ChatBaseWindow from "./ChatBaseWindow";

function ChatCommunicationWindow({openTab}: {openTab: OpenChatTab}) {

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [messageValue, setMessageValue] = useState("");

  function handleSend() {
    const messageExists = messageValue.length > 0;
    const newChatMessage = new ChatMessage(
      messageValue,
      "test",
      "test",
    )
    if (messageExists) setChatHistory(prev => ([...prev, newChatMessage]));
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