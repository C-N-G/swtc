import Player from "../client/classes/player.ts";
import Scenario from "../client/classes/scenario.ts";
import { Phase, PlayerVoteItem } from "../client/helpers/storeTypes.ts";
import { ChatServerData, SessionData, TimerData } from "./serverTypes.ts";


export default class Session {

    constructor(
        public readonly id: string | null,
        public players: Player[] = [],
        private votes: PlayerVoteItem[] = [],
        private isVoting = false,
        private accusingPlayer: string | null = null,
        private nominatedPlayer: string | null = null,
        private phase: Phase = {cycle: "Night", round: 1},
        private scenarios: Scenario[] = [],
        private timers: {[id: string]: TimerData} = {},
        private chats: {[id: string]: ChatServerData} = {},
        public disconnectTimers: {[id: string]: NodeJS.Timeout} = {}
    ) {

    }

    addPlayer(playerId: string, name: string, pronouns?: string): Player {

        let player;
        const userPronouns = pronouns ? pronouns : "";

        if (this.players.length === 0) { // if its the first player then make them the narrator
            player = new Player(playerId, name, userPronouns, 0);
        } else {
            player = new Player(playerId, name, userPronouns);
        }

        this.players.push(player);

        return player;

    }

    removePlayer(playerId: string): void {

        this.players = this.players.filter(player => player.id !== playerId);

    }

    updatePlayer(playerId: string, property: string, value: string | number): void {

        this.players = this.players.map(player => {
            if (player.id === playerId) {
                return {...player, [property]: value};
            } else {
                return player;
            }
        });

    }

    setPlayers(players: Player[]): void {

      this.players = players;
      
    }

    addVote(voteObj: PlayerVoteItem | PlayerVoteItem[]): void {

        if (Array.isArray(voteObj)) {
            this.votes = voteObj;
        } else {
            const existingVote = this.votes.find(vote => vote.id === voteObj.id)
            if (existingVote) {
              const removeIndex = this.votes.indexOf(existingVote);
              this.votes.splice(removeIndex, 1);
            }
            this.votes.push(voteObj);
        }

    }

    setVoting(value: boolean): void {

        this.isVoting = value;

    }

    setAcuPlayer(playerId: string): void {

        this.accusingPlayer = playerId;

    }

    setNomPlayer(playerId: string): void {

        this.nominatedPlayer = playerId;

    }

    clearVotes(): void {

        this.votes = [];
        this.isVoting = false;
        this.accusingPlayer = null;
        this.nominatedPlayer = null;

    }

    setPhase(newPhase: Phase): void {

        this.phase = newPhase;

    }

    isEmpty(): boolean {

        return this.players.length === 0;

    }

    setScenarios(newScenarios: Scenario[]): void {

      this.scenarios = newScenarios;

    }

    setTimers(newTimer: TimerData): void {

      if (newTimer.action === "set" || newTimer.action === "start") {
        this.timers[newTimer.name] = newTimer;
      } else if (newTimer.action === "stop") {
        delete this.timers[newTimer.name];
      }

    }

    getChatMembers(id: string): string[] {

      return this.chats[id].members;

    }

    createNewChat(id: string): void {

      this.chats[id] = {
        id: id,
        members: [],
      };

    }

    removeChat(id: string): void {

      delete this.chats[id];

    }

    addMemberToChat(chatId: string, memberId: string): void {

      this.chats[chatId].members.push(memberId);

    }

    removeMemberFromChat(chatId: string, memberId: string): void{

      this.chats[chatId].members = this.chats[chatId].members.filter(m => m !== memberId);

    }

    getData(): SessionData {

        return {
            id: this.id,
            players: this.players,
            votes: {
                list: this.votes, 
                accusingPlayer: this.accusingPlayer, 
                nominatedPlayer: this.nominatedPlayer, 
                voting: this.isVoting },
            phase: this.phase,
            scenarios: this.scenarios,
            timers: this.timers,
            chats: this.chats,
        }

    }


    
}