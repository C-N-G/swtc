import { StateCreator } from "zustand";
import { CombinedSlice, ChatSlice, ChatGroup } from "./storeTypes.ts";
import { OpenChatTab } from "./enumTypes.ts";
import { isNarrator } from "./util.ts";

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
    let chatToSend: keyof ChatSlice["chats"];
    if (Object.keys(state.chats).includes(chatId)) chatToSend = chatId;
    else chatToSend = "global";
    msg.timeStamp = new Date(msg.timeStamp);
    const makeUnread = 
      chatToSend === "global" && state.openChatTab === OpenChatTab.Global ||
      chatToSend === "log" && state.openChatTab === OpenChatTab.Log ||
      chatToSend !== "global" && chatToSend !== "log" && !isNarrator(state.getUser()) && state.openChatTab === OpenChatTab.Private
    return {chats: {
      ...state.chats, [chatToSend]: {
        ...state.chats[chatToSend], 
        messages: [...state.chats[chatToSend].messages, msg],
        unread: !makeUnread
      }
    }}
  }),

  createNewChat: (chatId, members) => set(state => {
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
    if (Object.keys(state.chats).includes(chatId) === false) {
      throw new Error("could not find chat to delete");
    }
    delete state.chats[chatId];
    return{chats: {...state.chats}};
  }),

  addMemberToChat: (chatId, memberId) => set(state => {
    if (Object.keys(state.chats).includes(chatId) === false) {
      throw new Error("could not find chat to add member to");
    }
    if (state.chats[chatId].members.includes(memberId) === true) {
      throw new Error("could not add member to chat as they are already in it");
    }
    return {chats: {...state.chats, [chatId]: {...state.chats[chatId], members: [...state.chats[chatId].members, memberId]}}}
  }),

  removeMemberFromChat: (chatId, memberId) => set(state => {
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
      const chatIdToSet = `${player.id}_${narrator.id}`;
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
    const chatIdExists = Object.hasOwn(state.chats, chatId);
    if (chatIdExists) {
      return {currentPrivateChatId: chatId};
    } else {
      return {};
    }
  }),

  setChatAsRead: (chatId) => set(state => {
    let chatToUpdate: keyof ChatSlice["chats"];
    if (Object.keys(state.chats).includes(chatId)) chatToUpdate = chatId;
    else throw new Error(`could not find chat to update: ${chatId}`);
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
  })

})