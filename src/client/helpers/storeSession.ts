import { StateCreator } from "zustand";
import { CombinedSlice, SessionSlice } from "./storeTypes.ts";


export const createSessionSlice: StateCreator<
  CombinedSlice,
  [],
  [],
  SessionSlice
> = (set) => ({
  session: {
    id: null,
    sync: false,
    scenarios: [],
  },

  resetSession: () => set(() => ({
    session: {
      id: null,
      sync: null,
      scenarios: []
    }
  })),

  setScenarios: (newScenarios, newSync) => set(state => ({
    session: {
      ...state.session,
      scenarios: newScenarios,
      sync: newSync !== undefined ? newSync : state.session.sync
    }
  })),

  syncSession: (newSession) => set(state => ({
      session: {
        ...state.session,
        id: (newSession.id || newSession.id === null) ? newSession.id : state.session.id,
        scenarios: newSession.scenarios ? newSession.scenarios : state.session.scenarios
      }
  })),

  syncOff: () => set(state => ({session: { ...state.session, sync: false}})),
  syncOn: () => set(state => ({session: { ...state.session, sync: true}})),
  

})