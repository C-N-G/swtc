import Session from "./session.js";

export default class SessionManager {

    constructor() {

        this.sessions = {};

    }

    createSession() {

        const session = new Session(this.createId());

        this.sessions[session.id] = session;
      
        return session;

    }

    removeSession(sessionId) {

        if (this.sessionExists(sessionId)) {
            delete this.sessions[sessionId];
        }

    }

    joinSession(sessionId, playerId, playerName) {
        
        const session = this.sessions[sessionId];
        return session.addPlayer(playerId, playerName);

    }

    leaveSession(sessionId, playerId) {

        const session = this.sessions[sessionId];
        session.removePlayer(playerId);

        if (session.isEmpty()) {
            this.removeSession(sessionId);
        }

    }

    getSession(id) {

        return this.sessions[id];

    }

    sessionExists(id) {

        return Object.hasOwn(this.sessions, id);

    }

    createId(length = 7) {

        const array = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
      
        let output = [];
      
        for (let i = 0; i < length; i++) {
            output.push(array[Math.floor(Math.random()*array.length)]);
        }
      
        return output.join("");
      
    }

}