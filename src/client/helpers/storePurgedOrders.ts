export const createPurgedOrdersSlice = (set) => ({
  purgedOrders: [],

  addPurgedOrder: (event, index, ordering, chars, roles) => set(state => {
    const action = event.target.innerText
    const purgeString = JSON.stringify(ordering[index]);
    const purgedOrders = state.purgedOrders;
    let newPurgedOrders;
    if (action === "REMOVE") {
      newPurgedOrders = [...purgedOrders, purgeString];
    } else if (action === "UNDO") {
      newPurgedOrders = purgedOrders.filter(s => s !== purgeString)
    }

    state.addPlayerNightIndicators(false, chars, roles, newPurgedOrders);

    return {purgedOrders: newPurgedOrders};
    
  }),

  removePurgedOrders: (chars, roles, ordering) => set(state => {
    const newPurgedOrders = [];

    state.addPlayerNightIndicators(false, chars, roles, newPurgedOrders, ordering);

    return {purgedOrders: newPurgedOrders};
  }),
})