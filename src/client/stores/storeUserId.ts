import { StateCreator } from "zustand";
import { CombinedSlice, UserIdSlice } from "./storeTypes.ts";

export const createUserIdSlice: StateCreator<
  CombinedSlice,
  [],
  [],
  UserIdSlice
> = (set) => ({
  userId: null,

  setUserId: (newUserId) => set(() => ({userId: newUserId})),

  toggleDebugUser: () => set(state => ({userId: state.userId === "54321" ? "0" : "54321"})),
})