import { Box, TextField } from "@mui/material";
import { useContext, useState } from "react";
import ChatMessage from "../classes/chatMessage";
import { OpenChatTab } from "../helpers/enumTypes";
import ChatBaseWindow from "./ChatBaseWindow";
import useStore from "../hooks/useStore";
import { UserContext } from "../App";
import config from "../../appConfig";
import { socket } from "../helpers/socket";

interface ChatTextWindowProps {
  openTab: OpenChatTab;
  thisTabId: OpenChatTab;
  enableInput: boolean;
  chatId: string;
}

function ChatCommWindow({openTab, thisTabId, enableInput, chatId}: ChatTextWindowProps) {

  const chats = useStore(state => state.chats);
  let doNotRender = false;
  if (Object.keys(chats).includes(chatId) === false) {
    chatId = "global"
    doNotRender = true;
  }

  const [messageValue, setMessageValue] = useState("");
  const chatHistory = useStore(state => state.chats[chatId].messages);
  // const addChatMessage = useStore(state => state.addChatMessage);
  const sessionId = useStore(state => state.session.id);
  const user = useContext(UserContext);

  function handleSend() {
    const messageExists = messageValue.length > 0;
    const messageIsShortEnough = messageValue.length <= config.max_chat_message_length;
    const newChatMessage = new ChatMessage(
      messageValue,
      user ? user.name : "unknown",
      "sent",
    )
    const data = {
      action: "addChatMessage",
      message: newChatMessage,
      chatId: chatId,
    }
    if (messageExists && messageIsShortEnough) {
      socket.timeout(5000).emit("chat", data, (error, response) => {
        if (error) return console.log("Chat Error: server timeout");
        if (response?.error) return console.log("Chat Error:", response.error);
      });
      // addChatMessage(newChatMessage, "chat");
    }
    setMessageValue("");
  }

  if (doNotRender) return;

  return <Box sx={{
    flexGrow: "1", 
    position: "relative", 
    display: openTab !== thisTabId ? "none" : "flex", 
    flexDirection: "column",
    height: "calc(100% - 30px)"
  }}>
    <ChatBaseWindow chatHistory={chatHistory} />
    {enableInput && <TextField 
      sx={{borderTop: "2px solid var(--sl-color-accent)"}}
      variant="standard"
      size="small"
      margin="none"
      fullWidth
      disabled={sessionId ? false : true}
      value={messageValue}
      onChange={(e) => setMessageValue(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" ? handleSend() : false}
    /> }
  </Box>
}

export default ChatCommWindow;