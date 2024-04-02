export const createDisplaySlice = (set) => ({
  display: 0,

  displayNone: () => set(() => ({display: 0})),

  displayDetails: () => set(() => ({display: 1})),
  
  displayVote: () => set(() => ({display: 2}))
})