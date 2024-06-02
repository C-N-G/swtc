import {create} from "zustand";
import { createPlayerSlice } from "../helpers/storePlayer.ts";
import { createUserIdSlice } from "../helpers/storeUserId.js";
import { createPurgedOrdersSlice } from "../helpers/storePurgedOrders.js";
import { createPhaseSlice } from "../helpers/storePhase.ts";
import { createDisplaySlice } from "../helpers/storeDisplay.ts";
import { createVotesSlice } from "../helpers/storeVotes.ts";
import { createSessionSlice } from "../helpers/storeSession.js";
import { createTimersSlice } from "../helpers/storeTimers.js";

const useStore = create((...a) => ({

  ...createPlayerSlice(...a),
  ...createUserIdSlice(...a),
  ...createPurgedOrdersSlice(...a),
  ...createPhaseSlice(...a),
  ...createDisplaySlice(...a),
  ...createVotesSlice(...a),
  ...createSessionSlice(...a),
  ...createTimersSlice(...a),

}))

export default useStore;