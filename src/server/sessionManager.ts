import Player from "../client/classes/player.ts";
import Session from "./session.ts";


export default class SessionManager {

    constructor(
      public sessions: {[sessionId: string] : Session} = {}
    ) {

    }

    createSession(): Session {

        const session = new Session(this.createId());

        if (session.id === null) throw new Error("error creating session, found null id");

        this.sessions[session.id] = session;
      
        return session;

    }

    removeSession(sessionId: string): void {

        if (this.sessionExists(sessionId)) {
            delete this.sessions[sessionId];
        }

    }

    joinSession(sessionId: string, playerId: string, playerName: string, playerPronouns?: string): Player {

        const session = this.sessions[sessionId];
        return session.addPlayer(playerId, playerName, playerPronouns);

    }

    leaveSession(sessionId: string, playerId: string): void {

        const session = this.sessions[sessionId];
        session.removePlayer(playerId);

        if (session.isEmpty()) {
            console.log("removing empty session", sessionId);
            this.removeSession(sessionId);
        }

    }

    getSession(id: string): Session {

        return this.sessions[id];

    }

    sessionExists(id: string): boolean {

        return Object.hasOwn(this.sessions, id);

    }

    createId(length = 7): string {

        const array = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
      
        const output = [];
      
        for (let i = 0; i < length; i++) {
            output.push(array[Math.floor(Math.random() * array.length)]);
        }
      
        return output.join("");
      
    }

}