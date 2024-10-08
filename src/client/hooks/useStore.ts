import {create} from "zustand";
import { createPlayerSlice } from "../helpers/storePlayer.ts";
import { createUserIdSlice } from "../helpers/storeUserId.ts";
import { createPurgedOrdersSlice } from "../helpers/storePurgedOrders.ts";
import { createPhaseSlice } from "../helpers/storePhase.ts";
import { createDisplaySlice } from "../helpers/storeDisplay.ts";
import { createVotesSlice } from "../helpers/storeVotes.ts";
import { createSessionSlice } from "../helpers/storeSession.ts";
import { createTimersSlice } from "../helpers/storeTimers.ts";
import { createNightOrderSlice } from "../helpers/storeNightOrders.ts";
import { CombinedSlice } from "../helpers/storeTypes.ts";
import { createChatSlice } from "../helpers/storeChat.ts";

const useStore = create<CombinedSlice>()((...a) => ({

  ...createPlayerSlice(...a),
  ...createUserIdSlice(...a),
  ...createPurgedOrdersSlice(...a),
  ...createPhaseSlice(...a),
  ...createDisplaySlice(...a),
  ...createVotesSlice(...a),
  ...createSessionSlice(...a),
  ...createTimersSlice(...a),
  ...createNightOrderSlice(...a),
  ...createChatSlice(...a),

}))

export default useStore;