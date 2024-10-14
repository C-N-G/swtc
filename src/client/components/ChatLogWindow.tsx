import { Box } from "@mui/material";
import { OpenChatTab } from "../helpers/enumTypes";
import ChatBaseWindow from "./ChatBaseWindow";
import useStore from "../hooks/useStore";

function ChatLogWindow({openTab}: {openTab: OpenChatTab}) {
  
  const chatHistory = useStore(state => state.chats["log"].messages);

  return <Box sx={{
    flexGrow: "1", 
    position: "relative", 
    display: openTab !== OpenChatTab.Log ? "none" : "flex", 
    flexDirection: "column",
    height: "calc(100% - 30px)"
  }}>
    <ChatBaseWindow chatHistory={chatHistory} />
  </Box>

}

export default ChatLogWindow