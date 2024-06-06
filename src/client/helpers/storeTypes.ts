import { DragEndEvent } from "@dnd-kit/core";
import Player from "../classes/player.ts";
import Char from "../classes/char.ts";
import Role from "../classes/role.ts";
import { PlayerOrderItem } from "./nightOrders.ts";

export interface SessionData {
  id: string | null;
  sync: boolean | null;
  modules: Array<string>;
}

export interface SessionSlice {
  session: SessionData;
  resetSession: () => void;
  setModules: (newModules: Array<string>, newSync: boolean) => void;
  syncSession: (newSession: SessionData) => void;
  syncOff: () => void;
  syncOn: () => void;
}

export interface UserIdSlice {
  userId: string | null;
  setUserId: (newUserId: string) => void;
  toggleDebugUser: () => void;
}

export interface DisplaySlice {
  display: number;
  selected: string | null;
  displayNone: () => void;
  displayDetails: () => void;
  displayVote: () => void;
  selectPlayer: (playerId: string) => void;
}

export interface Phase {
  cycle: "Day" | "Night";
  round: number;
}

export interface PhaseSlice {
  phase: Phase;
  nextPhase: (newPhase?: Phase) => void;
}

export interface SyncingSession {
  id: string;
  players: Player[];
  // votes: {
  //     list: this.votes, 
  //     accusingPlayer: this.accusingPlayer, 
  //     nominatedPlayer: this.nominatedPlayer, 
  //     voting: this.isVoting },
  // phase: this.phase,
  // modules: this.modules,
  // timers: this.timers
}

export interface PlayerSlice {
  players: Player[];
  setPlayers: (newPlayers: Player[]) => void;
  changePlayerAttribute: (targetId: string, targetProperty: string, targetValue: string, fromServer?: boolean) => void;
  addPlayerReminders: (event: DragEndEvent) => void;
  syncPlayers: (session: SyncingSession) => void;
  randomisePlayers: (chars: Char[], roles: Role[]) => void;
  addPlayerNightIndicators: (cycle: string, chars: Char[], roles: Role[], purgedOrders: string[], ordering: PlayerOrderItem[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  pushPlayer: () => void;
  popPlayer: () => void;
  getUser: () => void;
  getDrawPlayers: () => void;
}

export type CombinedSlice = 
  SessionSlice 
  & UserIdSlice
  & DisplaySlice
  & PhaseSlice
  & PlayerSlice;