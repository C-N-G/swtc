import { StateCreator } from "zustand";
import { CombinedSlice, PurgedOrdersSlice } from "./storeTypes.ts";

export const createPurgedOrdersSlice: StateCreator<
  CombinedSlice,
  [],
  [],
  PurgedOrdersSlice
> = (set) => ({
  purgedOrders: [],

  addPurgedOrder: (event, index, ordering, chars, roles) => set(state => {
    const action = event.currentTarget.innerText;
    const purgeString = JSON.stringify(ordering[index]);
    const purgedOrders = state.purgedOrders;
    let newPurgedOrders;
    if (action === "REMOVE") {
      newPurgedOrders = [...purgedOrders, purgeString];
    } else if (action === "UNDO") {
      newPurgedOrders = purgedOrders.filter(s => s !== purgeString)
    }

    if (typeof newPurgedOrders === "undefined") throw new Error("error adding purged order, order not defined");

    state.addPlayerNightIndicators(false, chars, roles, newPurgedOrders);

    return {purgedOrders: newPurgedOrders};
    
  }),

  removePurgedOrders: (chars, roles, ordering) => set(state => {
    const newPurgedOrders: string[] = [];

    state.addPlayerNightIndicators(false, chars, roles, newPurgedOrders, ordering);

    return {purgedOrders: newPurgedOrders};
  }),
})