import {create} from "zustand";
import { createPlayerSlice } from "../helpers/storePlayer";
import { createUserIdSlice } from "../helpers/storeUserId";
import { createPurgedOrdersSlice } from "../helpers/storePurgedOrders";
import { createPhaseSlice } from "../helpers/storePhase";
import { createDisplaySlice } from "../helpers/storeDisplay";
import { createVotesSlice } from "../helpers/storeVotes";
import { createSessionSlice } from "../helpers/storeSession";

const useStore = create((...a) => ({

  ...createPlayerSlice(...a),
  ...createUserIdSlice(...a),
  ...createPurgedOrdersSlice(...a),
  ...createPhaseSlice(...a),
  ...createDisplaySlice(...a),
  ...createVotesSlice(...a),
  ...createSessionSlice(...a),

}))

export default useStore;