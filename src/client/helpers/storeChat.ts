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

  addChatMessage: (msg, id) => set(state => {
    let chatToSend: keyof CombinedSlice;
    if (id.toLowerCase() === "chat") chatToSend = "chat";
    else if (id.toLowerCase() === "log") chatToSend = "log";
    else chatToSend = "chat";
    return {[chatToSend]: [...state[chatToSend], msg]}
  }),
})