export type SessionType = {
  id: string | null;
  sync: boolean | null;
  modules: Array<string>;
}

export type CharType = {
  id: string;
  name: string;
  description: string;
  ability: string;
  orderType: string;
  attributes: Array<string>;
  additional: Array<string>;
  setup: Array<Array<string>>;
  reminders: Array<ReminderType>;
}

export type RoleType = {
  id: string;
  name: string;
  type: string;
  description: string;
  ability: string;
  orderType: string;
  attributes: Array<string>;
  additional: Array<string>;
  setup: Array<Array<string>>;
  reminders: Array<ReminderType>;
}

export type ReminderType = {
    id: number;
    origin: RoleType | CharType;
    content: string;
    colour: string;
    description: string;
}

export type PlayerType = {
  id: string;
  name: string;
  type: number;
  label: string;
  notes: string;
  char: number;
  role: number;
  state: number;
  team: number;
  rChar: number;
  rRole: number;
  rState: number;
  rTeam: number;
  rVotePower: number;
  reminders: Array<ReminderType>;
  nightOrders: Array<ReminderType>;
}

export interface SessionSlice {
  session: SessionType;
  resetSession: () => void;
  setModules: (newModules: Array<string>, newSync: boolean) => void;
  syncSession: (newSession: SessionType) => void;
  syncOff: () => void;
  syncOn: () => void;
}