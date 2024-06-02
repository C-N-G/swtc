import { StateCreator } from "zustand";
import { SessionSlice } from "./types.ts";


export const createSessionSlice: StateCreator<
  SessionSlice,
  [],
  [],
  SessionSlice
> = (set) => ({
  session: {
    id: null,
    sync: false,
    modules: [],
  },

  resetSession: () => set(() => ({
    session: {
      id: null,
      sync: null,
      modules: []
    }
  })),

  setModules: (newModules, newSync) => set(state => ({
    session: {
      ...state.session,
      modules: newModules,
      sync: newSync !== undefined ? newSync : state.session.sync
    }
  })),

  syncSession: (newSession) => set(state => ({
      session: {
        ...state.session,
        id: (newSession.id || newSession.id === null) ? newSession.id : state.session.id,
        modules: newSession.modules ? newSession.modules : state.session.modules
      }
  })),

  syncOff: () => set(state => ({session: { ...state.session, sync: false}})),
  syncOn: () => set(state => ({session: { ...state.session, sync: true}})),
  

})