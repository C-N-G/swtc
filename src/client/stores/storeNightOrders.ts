import { StateCreator } from "zustand";
import { CombinedSlice, NightOrderSlice } from "./storeTypes.ts";

export const createNightOrderSlice: StateCreator<
  CombinedSlice,
  [],
  [],
  NightOrderSlice
> = (set) => ({
  completedOrders: new Set<string>(),

  addCompletedOrder: (id) => set(state => {
    state.completedOrders.add(id);
    return {completedOrders: new Set(state.completedOrders)};
  }),

  removeCompletedOrder: (id) => set(state => {
    state.completedOrders.delete(id);
    return {completedOrders: new Set(state.completedOrders)};
  }),

  removeAllCompletedOrders: () => set(() => {
    return {completedOrders: new Set()};
  })


  // TODO add purgedOrders to this store, possibly add nightorder helper functions here too

})