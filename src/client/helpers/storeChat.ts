import { StateCreator } from "zustand";
import { CombinedSlice, ChatSlice, ChatGroup } from "./storeTypes.ts";

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
    if (Object.keys(state.chats).includes(chatId.toLowerCase())) chatToSend = chatId;
    else chatToSend = "global";
    msg.timeStamp = new Date(msg.timeStamp);
    return {chats: {...state.chats, [chatToSend]: {...state.chats[chatToSend], messages: [...state.chats[chatToSend].messages, msg]}}}
  }),

  createNewChat: (chatId, members) => set(state => {
    const newChat: ChatGroup = {
      id: chatId,
      messages: [],
      members: members ?? [],
    };
    if (Object.keys(state.chats).includes(chatId.toLowerCase()) === true) {
      throw new Error("could not create new chat as it already exists");
    }
    return{chats: {...state.chats, [chatId]: newChat}};
  }),

  removeChat: (chatId) => set(state => {
    if (Object.keys(state.chats).includes(chatId.toLowerCase()) === false) {
      throw new Error("could not find chat to delete");
    }
    delete state.chats[chatId];
    return{chats: {...state.chats}};
  }),

  addMemberToChat: (chatId, memberId) => set(state => {
    if (Object.keys(state.chats).includes(chatId.toLowerCase()) === false) {
      throw new Error("could not find chat to add member to");
    }
    if (state.chats[chatId].members.includes(memberId) === true) {
      throw new Error("could not add member to chat as they are already in it");
    }
    return {chats: {...state.chats, [chatId]: {...state.chats[chatId], members: [...state.chats[chatId].members, memberId]}}}
  }),

  removeMemberFromChat: (chatId, memberId) => set(state => {
    if (Object.keys(state.chats).includes(chatId.toLowerCase()) === false) {
      throw new Error("could not find chat to remove member from");
    }
    if (state.chats[chatId].members.includes(memberId) === false) {
      throw new Error("could not remove member from chat as they are not in it");
    }
    const newMembers = state.chats[chatId].members.filter(member => member !== memberId);
    return {chats: {...state.chats, [chatId]: {...state.chats[chatId], members: newMembers}}}
  }),

  syncChats: (chatData) => set(state => {
    for (const key in chatData) {
      (chatData[key] as ChatGroup).messages = [];
    }
    const newData: {[id: string]: ChatGroup} = chatData as {[id: string]: ChatGroup};
    return {chats: {...state.chats, ...newData}};
  }),

})