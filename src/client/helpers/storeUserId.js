export const createUserIdSlice = (set) => ({
  userId: null,

  setUserId: (newUserId) => set(() => ({userId: newUserId})),

  toggleDebugUser: () => set(state => ({userId: state.userId === "54321" ? "0" : "54321"})),
})