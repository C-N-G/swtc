import { StateCreator } from "zustand";

interface DisplaySlice {
  display: number,
  selected: string | null,
  displayNone: () => void,
  displayDetails: () => void,
  displayVote: () => void,
  selectPlayer: (playerId: string) => void
}

export const createDisplaySlice: StateCreator<
  DisplaySlice,
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