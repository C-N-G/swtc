import { DisconnectReason } from "socket.io";
import Player from "../client/classes/player.ts";
import { Phase, PlayerVoteItem } from "../client/helpers/storeTypes.ts";
import Scenario from "../client/classes/scenario.ts";
import ChatMessage from "../client/classes/chatMessage.ts";

export interface TimerData {
  name: string;
  action: string;
  duration?: number;
}

export interface SessionData {
    id: string | null;
    players: Player[];
    votes: {
        list: PlayerVoteItem[];
        accusingPlayer: string | null; 
        nominatedPlayer: string | null;  
        voting: boolean;
    }
    phase: Phase;
    scenarios: Scenario[];
    timers: {[id: string]: TimerData};
}

export type CallbackFn = (res: SocketCallbackResponse) => void;

export type SocketCallbackResponse = {status: string, error?: string};

export interface PlayerAttributeData {
  targetId: string;
  targetProperty: string; 
  targetValue: string | number;
}

export interface PlayerVoteData {
  voting?: boolean;
  accusingPlayer?: string | null;
  nominatedPlayer?: string | null;
  list: PlayerVoteItem | PlayerVoteItem[];
  onlyPlayer?: boolean;
}

export interface ServerToClientEvents {
  sync: (session: SessionData, userId?: string | null) => void;
  joined: (player: Player) => void;
  phase: () => void;
  attribute: (data: PlayerAttributeData) => void;
  vote: (data: PlayerVoteData) => void;
  scenario: (data: Scenario[]) => void;
  chat: (msg: ChatMessage, chatId: string) => void;
  timer: (data: TimerData) => void;
  left: (playerId: string) => void;
}

export interface ClientToServerEvents {
  join: (sessiondId: string, name: string, pronouns: string | undefined, callback: CallbackFn) => void;
  host: (name: string) => void;
  phase: (data: Phase) => void;
  attribute: (data: PlayerAttributeData) => void;
  vote: (data: PlayerVoteData) => void;
  scenario: (data: Scenario[]) => void;
  chat: (msg: ChatMessage, chatId: string, callback: CallbackFn) => void;
  sync: (data: {players: Player[], scenarios: Scenario[]}, callback: CallbackFn) => void;
  disconnect: (reason: DisconnectReason, details: {message: string, description: string, context: string}) => void;
  leave: () => void;
  timer: (data: TimerData, callback: CallbackFn) => void;
  resume: (sessionId: string, name: string, callback: CallbackFn) => void;
}