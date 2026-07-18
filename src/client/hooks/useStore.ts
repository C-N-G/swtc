import { create } from 'zustand';
import { createPlayerSlice } from '../stores/storePlayer.ts';
import { createUserIdSlice } from '../stores/storeUserId.ts';
import { createPurgedOrdersSlice } from '../stores/storePurgedOrders.ts';
import { createPhaseSlice } from '../stores/storePhase.ts';
import { createDisplaySlice } from '../stores/storeDisplay.ts';
import { createVotesSlice } from '../stores/storeVotes.ts';
import { createSessionSlice } from '../stores/storeSession.ts';
import { createTimersSlice } from '../stores/storeTimers.ts';
import { createNightOrderSlice } from '../stores/storeNightOrders.ts';
import { CombinedSlice } from '../stores/storeTypes.ts';
import { createChatSlice } from '../stores/storeChat.ts';
import { createAudioPlayerSlice } from '../stores/storeAudioPlayer.ts';

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
    ...createAudioPlayerSlice(...a),
}));

export default useStore;
