import { StateCreator } from "zustand";
import { CombinedSlice, ChatSlice, ChatGroup } from "./storeTypes.ts";
import { OpenChatTab } from "./enumTypes.ts";
import { isNarrator } from "./util.ts";

export const createChatSlice: StateCreator<
  CombinedSlice,
  [],
  [],
  ChatSlice
> = (set, get) => ({
  chats: {
    "global": {
      id: "global",
      messages: [],
      members: [],
      unread: false,
    },
    "log": {
      id: "log",
      messages: [],
      members: [],
      unread: false,
    }
  },
  currentPrivateChatId: "",
  openChatTab: OpenChatTab.Global,

  addChatMessage: (msg, chatId) => set(state => {
    chatId = chatId.toLowerCase();
    if (!Object.keys(state.chats).includes(chatId)) return {};
    const chatToSend: keyof ChatSlice["chats"] = chatId;
    msg.timeStamp = new Date(msg.timeStamp);
    const isGlobalOpenAndTarget = chatToSend === "global" && state.openChatTab === OpenChatTab.Global;
    const isLogOpenAndTarget = chatToSend === "log" && state.openChatTab === OpenChatTab.Log;
    const isPrivate = chatToSend !== "global" && chatToSend !== "log";
    const isPlayerPrivateOpenAndTarget = 
      isPrivate &&
      !isNarrator(state.getUser()) && 
      state.openChatTab === OpenChatTab.Private;
    const isNarratorPrivateOpenAndTarget =
      isPrivate &&
      isNarrator(state.getUser()) && 
      state.openChatTab === OpenChatTab.Private;
      state.currentPrivateChatId === chatId;
    const isRead = 
      isGlobalOpenAndTarget || 
      isLogOpenAndTarget || 
      isPlayerPrivateOpenAndTarget || 
      isNarratorPrivateOpenAndTarget;
    return {chats: {
      ...state.chats, [chatToSend]: {
        ...state.chats[chatToSend], 
        messages: [...state.chats[chatToSend].messages, msg],
        unread: !isRead
      }
    }}
  }),

  createNewChat: (chatId, members) => set(state => {
    chatId = chatId.toLowerCase();
    const newChat: ChatGroup = {
      id: chatId,
      messages: [],
      members: members ?? [],
      unread: false,
    };
    if (Object.keys(state.chats).includes(chatId) === true) {
      throw new Error("could not create new chat as it already exists");
    }
    return{chats: {...state.chats, [chatId]: newChat}};
  }),

  removeChat: (chatId) => set(state => {
    chatId = chatId.toLowerCase();
    if (Object.keys(state.chats).includes(chatId) === false) {
      throw new Error("could not find chat to delete");
    }
    delete state.chats[chatId];
    return{chats: {...state.chats}};
  }),

  addMemberToChat: (chatId, memberId) => set(state => {
    chatId = chatId.toLowerCase();
    if (Object.keys(state.chats).includes(chatId) === false) {
      throw new Error("could not find chat to add member to");
    }
    if (state.chats[chatId].members.includes(memberId) === true) {
      throw new Error("could not add member to chat as they are already in it");
    }
    return {chats: {...state.chats, [chatId]: {...state.chats[chatId], members: [...state.chats[chatId].members, memberId]}}}
  }),

  removeMemberFromChat: (chatId, memberId) => set(state => {
    chatId = chatId.toLowerCase();
    if (Object.keys(state.chats).includes(chatId) === false) {
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
    if (player && narrator && player.type === 1) {
      const chatIdToSet = `${player.name.toLowerCase()}_${narrator.name.toLowerCase()}`;
      if (Object.keys(chatData).includes(chatIdToSet)){
        return {
          chats: {...state.chats, ...newData},
          currentPrivateChatId: chatIdToSet,
        };
      }
    }
    return {chats: {...state.chats, ...newData}};
  }),

  setCurrentPrivateChat: (chatId) => set(state => {
    chatId = chatId.toLowerCase();
    const chatIdExists = Object.hasOwn(state.chats, chatId);
    if (chatIdExists) {
      return {currentPrivateChatId: chatId};
    } else {
      return {};
    }
  }),

  setChatAsRead: (chatId) => set(state => {
    chatId = chatId.toLowerCase();
    if (!Object.keys(state.chats).includes(chatId)) return {}
    const chatToUpdate: keyof ChatSlice["chats"] = chatId;
    return {chats: {
      ...state.chats,
      [chatToUpdate]: {
        ...state.chats[chatToUpdate],
        unread: false
      }
    }}
  }),

  setOpenChatTab: (tab: OpenChatTab) => set(() => {
    return {openChatTab: tab};
  }),

  getPrivateNarratorChatId: (playerId: string) => {
    const player = get().players.find(player => player.id === playerId);
    const narrator = get().players.find(player => player.id === get().userId);
    return `${player?.name.toLowerCase()}_${narrator?.name.toLowerCase()}`;
  }

})