import { StateCreator } from "zustand";

interface UserIdSlice {
  userId: string | null;
  setUserId: (newUserId: string) => void;
  toggleDebugUser: () => void;
}

export const createUserIdSlice: StateCreator<
  UserIdSlice,
  [],
  [],
  UserIdSlice
> = (set) => ({
  userId: null,

  setUserId: (newUserId) => set(() => ({userId: newUserId})),

  toggleDebugUser: () => set(state => ({userId: state.userId === "54321" ? "0" : "54321"})),
})