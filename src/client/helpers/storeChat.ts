import { StateCreator } from "zustand";
import { CombinedSlice, ChatSlice } from "./storeTypes.ts";

export const createChatSlice: StateCreator<
  CombinedSlice,
  [],
  [],
  ChatSlice
> = (set) => ({
  chat: [],
  log: [],

  addChatMessage: (msg, chatId) => set(state => {
    let chatToSend: keyof ChatSlice;
    if (chatId.toLowerCase() === "chat") chatToSend = "chat";
    else if (chatId.toLowerCase() === "log") chatToSend = "log";
    else chatToSend = "chat";
    msg.timeStamp = new Date(msg.timeStamp);
    return {[chatToSend]: [...state[chatToSend], msg]}
  }),
})