import Player from "../client/classes/player.js";

export default class Session {

    constructor(sessionId) {

        this.id = sessionId;
        this.players = [];
        this.votes = [];
        this.isVoting = false;
        this.accusingPlayer = null;
        this.nominatedPlayer = null;
        this.phase = {cycle: "Day", round: 1};
        this.modules = [];
        this.timers = {};
        this.disconnectTimers = {};

    }

    addPlayer(playerId, name) {

        let player;

        if (this.players.length === 0) { // if its the first player then make them the narrator
            player = new Player(playerId, name, 0);
        } else {
            player = new Player(playerId, name);
        }

        this.players.push(player);

        return player;

    }

    removePlayer(playerId) {

        this.players = this.players.filter(player => player.id !== playerId);

    }

    updatePlayer(playerId, property, value) {

        this.players = this.players.map(player => {
            if (player.id === playerId) {
                return {...player, [property]: value};
            } else {
                return player;
            }
        });

    }

    setPlayers(players) {

      this.players = players;
      
    }

    addVote(voteObj) {

        if (voteObj.length === 0) {
            this.votes = []
        } else {
            const existingVote = this.votes.find(vote => vote.id === voteObj.id)
            if (existingVote) {
              const removeIndex = this.votes.indexOf(existingVote);
              this.votes.splice(removeIndex, 1);
            }
            this.votes.push(voteObj);
        }

    }

    setVoting(value) {

        this.isVoting = value;

    }

    setAcuPlayer(playerId) {

        this.accusingPlayer = playerId;

    }

    setNomPlayer(playerId) {

        this.nominatedPlayer = playerId;

    }

    clearVotes() {

        this.votes = [];
        this.isVoting = false;
        this.accusingPlayer = null;
        this.nominatedPlayer = false;

    }

    setPhase(newPhase) {

        this.phase = newPhase;

    }

    isEmpty() {

        return this.players.length === 0;

    }

    setModules(newModules) {

      this.modules = newModules;

    }

    setTimers(newTimer) {

      if (newTimer.action === "set" || newTimer.action === "start") {
        this.timers = {...this.timers, newTimer};
      } else if (newTimer.action === "stop") {
        this.timers = {...Object.values(this.timers).filter(timer => timer.name !== newTimer.name)};
      }

    }

    getData() {

        return {
            id: this.id,
            players: this.players,
            votes: {
                list: this.votes, 
                accusingPlayer: this.accusingPlayer, 
                nominatedPlayer: this.nominatedPlayer, 
                voting: this.isVoting },
            phase: this.phase,
            modules: this.modules,
            timers: this.timers
        }

    }


    
}