export const createPhaseSlice = (set) => ({
  phase: {
    cycle: "Night",
    round: 1,
  },

  nextPhase: (newPhase) => set(state => {
    if (newPhase) return {phase: newPhase};
    let newCycle, newRound;
    if (state.phase.cycle === "Night") {
      newCycle = "Day";
      newRound = state.phase.round;
    } else if (state.phase.cycle === "Day") {
      newCycle = "Night";
      newRound = state.phase.round + 1;
    }
    return {phase: {cycle: newCycle, round: newRound}};
  }),
})