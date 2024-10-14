import { StateCreator } from "zustand";
import { CombinedSlice, ChatSlice } from "./storeTypes.ts";

export const createChatSlice: StateCreator<
  CombinedSlice,
  [],
  [],
  ChatSlice
> = (set) => ({
  chats: {
    "global": {
      id: "global",
      messages: [],
      members: [],
    },
    "log": {
      id: "log",
      messages: [],
      members: [],
    }
  },

  addChatMessage: (msg, chatId) => set(state => {
    let chatToSend: keyof ChatSlice["chats"];
    if (chatId.toLowerCase() === "global") chatToSend = "global";
    else if (chatId.toLowerCase() === "log") chatToSend = "log";
    else chatToSend = "global";
    msg.timeStamp = new Date(msg.timeStamp);
    return {chats: {...state.chats, [chatToSend]: {...state.chats[chatToSend], messages: [...state.chats[chatToSend].messages, msg]}}}
  }),
})