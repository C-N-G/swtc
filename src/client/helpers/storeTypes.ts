import { DragEndEvent } from "@dnd-kit/core";
import Player from "../classes/player.ts";
import Char from "../classes/char.ts";
import Role from "../classes/role.ts";
import { PlayerOrderItem } from "./nightOrders.ts";
import { MouseEvent } from "react";
import { SessionData } from "../../server/serverTypes.ts";

export interface CurrentSession {
  id: string | null;
  sync: boolean | null;
  modules: Array<string>;
}

export interface SessionSlice {
  session: CurrentSession;
  resetSession: () => void;
  setModules: (newModules: Array<string>, newSync?: boolean) => void;
  syncSession: (newSession: SessionData) => void;
  syncOff: () => void;
  syncOn: () => void;
}

export interface UserIdSlice {
  userId: string | null;
  setUserId: (newUserId: string | null) => void;
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
  cycle: string;
  round: number;
}

export interface PhaseSlice {
  phase: Phase;
  nextPhase: (newPhase?: Phase) => void;
}

export interface PlayerSlice {
  players: Player[];
  setPlayers: (newPlayers: Player[]) => void;
  changePlayerAttribute: (targetId: string, targetProperty: string, targetValue: string | number, fromServer?: boolean) => void;
  addPlayerReminders: (event: DragEndEvent) => void;
  syncPlayers: (session: SessionData) => void;
  randomisePlayers: (chars: Char[], roles: Role[]) => void;
  addPlayerNightIndicators: (cycle: string | boolean, chars: Char[], roles: Role[], purgedOrders: string[], ordering?: PlayerOrderItem[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  pushPlayer: () => void;
  popPlayer: () => void;
  getUser: () => Player;
  getDrawPlayers: () => Player[];
}

export interface PurgedOrdersSlice {
  purgedOrders: string[];
  addPurgedOrder: (event: MouseEvent<HTMLSpanElement>, index: number, ordering: PlayerOrderItem[], chars: Char[], roles: Role[]) => void;
  removePurgedOrders: (chars: Char[], roles: Role[], ordering: PlayerOrderItem[]) => void;
}

export interface ButtonEnlarger {
  "backgroundColor": string;
  "transform": string;
}

export interface PlayerVoteItem {
  id: string;
  vote: number;
  name: string; 
  power: number;
}

export type UserVote = boolean | ButtonEnlarger;

interface SyncVotes {
  list?: PlayerVoteItem[];
  voting?: boolean;
  accusingPlayer?: string | null;
  nominatedPlayer?: string | null;
  userVote?: [UserVote, UserVote];
}

export interface VoteHistoryItem {
  day: number;
  accuser: string;
  nominated: string;
  votes: PlayerVoteItem[];
  voterTotal: number;
  abstainerTotal: number;
}

export interface VotesSlice {
  votes: {
    list: PlayerVoteItem[];
    voting: boolean;
    accusingPlayer: string | null; //player id
    nominatedPlayer: string | null; //player id
    userVote: [UserVote, UserVote];
  }
  voteHistory: VoteHistoryItem[];
  setVoting: (newVoting: boolean) => void;
  resetUserVotes: () => void;
  addVoteToList: (newVote: PlayerVoteItem | PlayerVoteItem[]) => void;
  setAccuser: (accusingPlayerId: string) => void;
  setNominated: (nominatedPlayerId: string, accusingPlayerId?: string) => void;
  setVotes: (newVotes: SyncVotes) => void;
  setUserVote: (aVote: number) => void;
  addVotesToHistory: () => void;
  calculateVoteHistory: (round: number) => void;
}

interface Timer {
  time: number;
  duration: boolean | number;
  state: string;
  intervalId: NodeJS.Timeout | null;
  type: string;
}

export interface TimersSlice {
  timers: {
    [timerName: string]: Timer;
  }
  setTimer: (timer: string, aDuration: boolean | number) => void;
  startTimer: (timer: string, aDuration?: boolean | number, aTime?: number) => void;
  stopTimer: (timer: string) => void;
  resetTimer: (timer: string) => void;
}

export type CombinedSlice = 
  SessionSlice 
  & UserIdSlice
  & DisplaySlice
  & PhaseSlice
  & PlayerSlice
  & PurgedOrdersSlice
  & VotesSlice
  & TimersSlice;