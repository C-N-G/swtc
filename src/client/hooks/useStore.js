import {create} from "zustand";
import { createPlayerSlice } from "../helpers/storePlayer.js";
import { createUserIdSlice } from "../helpers/storeUserId.js";
import { createPurgedOrdersSlice } from "../helpers/storePurgedOrders.js";
import { createPhaseSlice } from "../helpers/storePhase.js";
import { createDisplaySlice } from "../helpers/storeDisplay.js";
import { createVotesSlice } from "../helpers/storeVotes.js";
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