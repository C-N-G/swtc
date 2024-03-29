import Player from "../client/classes/player.js";

export default class Session {

    constructor(sessionId) {

        this.id = sessionId;
        this.players = [];
        this.votes = [];
        this.isVoting = false;
        this.accusingPlayer = null;
        this.nominatedPlayer = null;
        this.phase = {cycle: "Night", round: 1};
        this.modules = [];

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
            modules: this.modules
        }

    }


    
}