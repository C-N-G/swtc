export type Session = {
  id: string | null;
  sync: boolean | null;
  modules: Array<string>;
}



export interface SessionSlice {
  session: Session;
  resetSession: () => void;
  setModules: (newModules: Array<string>, newSync: boolean) => void;
  syncSession: (newSession: Session) => void;
  syncOff: () => void;
  syncOn: () => void;
}