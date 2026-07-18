import { StateCreator } from "zustand";
import { CombinedSlice, DisplaySlice } from "./storeTypes.ts";


export const createDisplaySlice: StateCreator<
  CombinedSlice,
  [],
  [],
  DisplaySlice
> = (set) => ({
  display: 0,
  selected: null,

  displayNone: () => set(() => ({display: 0, selected: null})),

  displayDetails: () => set(() => ({display: 1})),
  
  displayVote: () => set(() => ({display: 2, selected: null})),

  selectPlayer: (playerId) => set(() => ({display: 1, selected: playerId}))
})