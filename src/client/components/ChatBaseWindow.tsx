import {Box, List, ListItem, ListItemText, Stack, Typography} from '@mui/material';
import { memo, useEffect, useRef } from 'react';
import ChatMessage from '../classes/chatMessage';

const ChatBaseWindow = memo(function ChatBaseWindow({chatHistory}: {chatHistory: ChatMessage[]}) {
  
  const chatRef = useRef<HTMLDivElement>(null);

  // scrolls chat to the latest message when it is updated
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTo(0, chatRef.current.scrollHeight);
  }, [chatHistory])

  function formatTime(date: Date) {
    const hours = date.getHours() <= 9 ? `0${date.getHours()}` : date.getHours();
    const minutes = date.getMinutes() <= 9 ? `0${date.getMinutes()}` : date.getMinutes();
    return `${hours}:${minutes}`;
  }

  return  <Box ref={chatRef} sx={{
    overflowY: "scroll", 
    overflowX: "clip",
    wordBreak: "break-all",
    scrollbarWidth: "thin",
    scrollbarColor: "var(--sl-color-accent) var(--sl-color-gray-4)",
    height: "100%"
    }}>
    <List dense={true} sx={{p: "0", maxHeight: "300px"}}>
      {chatHistory.map(msg => {
        return <ListItem key={msg.id} sx={{p: "0", m: "0", py: "2px"}}>
          <ListItemText sx={{p: "0", m: "0", px: "6px"}}>
            <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} gap={2}>
              <Typography sx={{lineHeight: "1.1em", fontSize: "0.9rem"}}>
                <Typography component={"span"} sx={{
                  fontWeight: "600",
                  fontSize: "inherit",
                }}>
                  {msg.author}:
                </Typography> {msg.value}
              </Typography>
              <Typography sx={{minWidth: "10%", fontSize: "0.75rem"}}>
                {formatTime(msg.timeStamp)}
              </Typography>
            </Stack>
          </ListItemText>
        </ListItem>
      })}
    </List>
  </Box>
})

export default ChatBaseWindow