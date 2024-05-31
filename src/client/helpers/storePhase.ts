// Option 1 - first day: 0, day grouping: (N,D), first phase: N, first progress: S
// PHASE:  [(N,  D),(N,  D),(N,  D)]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 2 - first day: 0, day grouping: (N,D), first phase: N, first progress: F
// PHASE:      [(N,  D),(N,  D),(N,  D)]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 3 - first day: 0, day grouping: (N,D), first phase: D, first progress: S
// PHASE:   [D),(N,  D),(N,  D),(N]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 4 - first day: 0, day grouping: (N,D), first phase: D, first progress: F
// PHASE:       [D),(N,  D),(N,  D),(N]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 5 - first day: 0, day grouping: (D,N), first phase: N, first progress: S
// PHASE:   [N),(D,  N),(D,  N),(D]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 6 - first day: 0, day grouping: (D,N), first phase: N, first progress: F
// PHASE:       [N),(D,  N),(D,  N),(D]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 7 - first day: 0, day grouping: (D,N), first phase: D, first progress: S
// PHASE:  [(D,  N),(D,  N),(D,  N)]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 8 - first day: 0, day grouping: (D,N), first phase: D, first progress: F
// PHASE:      [(D,  N),(D,  N),(D,  N)]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 9 - first day: 1, day grouping: (N,D), first phase: N, first progress: S
// PHASE:          [(N,  D),(N,  D),(N,  D)]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 10 - first day: 1, day grouping: (N,D), first phase: N, first progress: F
// PHASE:              [(N,  D),(N,  D),(N,  D)]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 11 - first day: 1, day grouping: (N,D), first phase: D, first progress: S
// PHASE:           [D),(N,  D),(N,  D),(N]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 12 - first day: 1, day grouping: (N,D), first phase: D, first progress: F
// PHASE:               [D),(N,  D),(N,  D),(N]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 13 - first day: 1, day grouping: (D,N), first phase: N, first progress: S
// PHASE:           [N),(D,  N),(D,  N),(D]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 14 - first day: 1, day grouping: (D,N), first phase: N, first progress: F
// PHASE:               [N),(D,  N),(D,  N),(D]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 15 - first day: 1, day grouping: (D,N), first phase: D, first progress: S
// PHASE:          [(D,  N),(D,  N),(D,  N)]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Option 16 - first day: 1, day grouping: (D,N), first phase: D, first progress: F
// PHASE:              [(D,  N),(D,  N),(D,  N)]
//   DAY:   [0,  0,  1,  1,  2,  2,  3,  3,  4,  4]

// Parameters
// 1000 first day:         0 or 1      
// 0100 day grouping:  (N,D) or (D,N)  - Night+Day or Day+Night
// 0010 first phase:       N or D      - Night or Day
// 0001 first progress:    S or F      - Slow or Fast

//1:  0000    5:  0100    9:  1000    13: 1100 
//2:  0001    6:  0101    10: 1001    14: 1101 
//3:  0010    7:  0110    11: 1011    15: 1110 
//4:  0011    8:  0111    12: 1010    16: 1111 

// isaac wants 13 = go night 1 to day 1  - disjointed
// currently is 9 = go night 1 to day 1  - wrong day grouping 
// option 1       = go night 0 to day 0  - starts on night 0
// option 4       = go day 0 to night 1  - wrong day grouping
// option 6       = go night 0 to day 1  - starts on night 0
// option 7       = go day 0 to night 0  - includes night 0
// option 9       = go night 1 to day 1  - wrong day grouping
// option 12      = go day 1 to night 2  - wrong day grouping
// option 14      = go night 1 to day 2  - means going from 1 to 2 immediately
// option 15      = go day 1 to night 1  - means starting on day

// disjointed = 16, 13, 11, 10, 8, 5, 3, 2
// synced     = 15, 14, 12, 9, 7, 6, 4, 1

// isaac believes disjointed > wrong day grouping
// mac believes wrong day grouping > disjointed
import { StateCreator } from "zustand";

type Phase = {
  cycle: "Day" | "Night",
  round: number
}

interface PhaseSlice {
  phase: Phase,
  nextPhase: (newPhase: Phase) => void
}

export const createPhaseSlice: StateCreator<
  PhaseSlice,
  [],
  [],
  PhaseSlice
> = (set, get) => ({
  phase: {
    cycle: "Day",
    round: 1,
  },

  nextPhase: (newPhase) => set(state => {
    if (newPhase) return {phase: newPhase};
    let newCycle, newRound;
    if (state.phase.cycle === "Night") {
      newCycle = "Day";
      newRound = state.phase.round + 1;
      get().calculateVoteHistory(newRound);
    } else if (state.phase.cycle === "Day") {
      newCycle = "Night";
      newRound = state.phase.round;
    }
    return {phase: {cycle: newCycle, round: newRound}};
  }),
})