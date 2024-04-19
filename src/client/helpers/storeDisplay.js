export const createDisplaySlice = (set) => ({
  display: 0,
  selected: null,

  displayNone: () => set(() => ({display: 0, selected: null})),

  displayDetails: () => set(() => ({display: 1})),
  
  displayVote: () => set(() => ({display: 2, selected: null})),

  selectPlayer: (playerId) => set(() => {
    return {display: 1, selected: playerId};
  })
})