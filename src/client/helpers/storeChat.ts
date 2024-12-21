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
  currentPrivateChatId: "",

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
    const narrator = state.players.find(player => player.type === 0);
    const player = state.getUser();
    const newData: {[id: string]: ChatGroup} = chatData as {[id: string]: ChatGroup};
    console.log("syncing chats")
    if (player && narrator && player.type === 1) {
      console.log("syncing chats player and narrator exist")
      console.log("checking chats", Object.keys(chatData))
      const chatIdToSet = `${player.name.toLowerCase()}-${narrator.name.toLowerCase()}`;
      if (Object.keys(chatData).includes(chatIdToSet)){
        console.log("syncing chats chatId exists too")
        return {
          chats: {...state.chats, ...newData},
          currentPrivateChatId: chatIdToSet,
        };
      }
    }
    return {chats: {...state.chats, ...newData}};
  }),

  setCurrentPrivateChat: (chatId) => set(() => {
    return {currentPrivateChatId: chatId};
  }),

})