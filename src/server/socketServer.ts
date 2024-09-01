import SessionManager from "./sessionManager.ts";
import config from "../appConfig.ts";
import { DisconnectReason, Namespace, Socket } from "socket.io";
import { Phase } from "../client/helpers/storeTypes.ts";
import Player from "../client/classes/player.ts";
import { CallbackFn, ClientToServerEvents, PlayerVoteData, ServerToClientEvents, SessionData, TimerData } from "./serverTypes.ts";
import Scenario from "../client/classes/scenario.ts";


const sessionManager = new SessionManager();

export default function swtcSocketServer(
  server: Namespace<ClientToServerEvents, ServerToClientEvents, [], []>, 
  socket: Socket<ClientToServerEvents, ServerToClientEvents, [], []>
) {

  console.log("new socket connection, id:", socket.id);

  let connectedSessionId: string | null = null;
  let playerName: string | undefined;
  let playerId = socket.id;

  function log(msg: string, data?: unknown) {
    const messageId = `${playerId}:${playerName ? playerName : "Unknown"}`;
    const messageContent = `- ${msg}`;
    const messageData = data ? `- ${JSON.stringify(data)}` : "";
    console.log(messageId, messageContent, messageData);
  }

  // function onResumeTest(sessionId, name, callback) {
  function onResumeTest(sessionId: string, name: string, callback: CallbackFn) {

    log("testing resume");

    if (!sessionManager.sessionExists(sessionId)) {
      return callback({status: "error", error: "no session found"});
    }

    const session = sessionManager.getSession(sessionId);
    const nameTaken = session.players.some(player => player.name === name);
    const playerIsDisconnecting = Object.hasOwn(session.disconnectTimers, name);

    if (!nameTaken) {
      return callback({status: "error", error: "name not in session"});
    }

    if (nameTaken && !playerIsDisconnecting) {
      return callback({status: "error", error: "name taken"});
    } else if (playerIsDisconnecting) {
      callback({status: "ok"});
      log(`can resume session ${sessionId}`);
    }

  }

  function onJoin(sessionId: string, name: string, callback: CallbackFn): void {

    log("joining");

    if (connectedSessionId !== null) {
      return callback({status: "error", error: "already in session"});
    }

    if (!sessionManager.sessionExists(sessionId)) {
      return callback({status: "error", error: "no session found"});
    }

    const session = sessionManager.getSession(sessionId);
    const nameTaken = session.players.some(player => player.name === name);
    const playerIsDisconnecting = Object.hasOwn(session.disconnectTimers, name);

    if (nameTaken && !playerIsDisconnecting) {
      return callback({status: "error", error: "name taken"});
    } else if (playerIsDisconnecting) { // join by resuming

      clearTimeout(session.disconnectTimers[name]);
      delete session.disconnectTimers[name];

      // get disconncted player
      const player = session.players.find(player => player.name === name);
      if (player === undefined) return callback({status: "error", error: "could not find player"});
      // update player id on the server
      playerId = player.id;
      // sync session to resuming player
      socket.join(sessionId);
      socket.emit("sync", session.getData(), playerId);

      playerName = name;
      connectedSessionId = sessionId;
      callback({status: "ok"});
      log(`resumed session ${sessionId}`);
      return;

    }

    // nomral join
    const player = sessionManager.joinSession(sessionId, playerId, name);
    playerName = name;
    socket.join(sessionId);
    connectedSessionId = sessionId;
    socket.to(sessionId).emit("joined", player);
    socket.emit("sync", session.getData(), player.id);
    callback({status: "ok"});
    log(`joined session ${sessionId}`);

  }

  function onHost(name: string): void {

    log("hosting session");

    if (connectedSessionId !== null) return;

    const session = sessionManager.createSession();
    if (session.id === null) return;
    connectedSessionId = session.id;
    const player = sessionManager.joinSession(session.id, playerId, name);
    playerName = name;
    socket.join(session.id);
    socket.emit("sync", session.getData(), player.id);
    log(`hosted session with id ${session.id}`);


  }

  function onPhase(data: Phase): void {

    log("updating phase state")

    if (connectedSessionId === null) return;
    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.setPhase(data);
    server.to(connectedSessionId).emit("phase");
    log("updated phase state successfully", data);

  }

  function onAttribute(data: {targetId: string, targetProperty: string, targetValue: string | number}): void {

    log("updating attribute state");

    // TODO ONLY SEND UPDATES TO THE SPECIFIC PLAYER THAT IS BEING UPDATED
    if (connectedSessionId === null) return;
    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.updatePlayer(data.targetId, data.targetProperty, data.targetValue);
    server.to(connectedSessionId).emit("attribute", data);
    log("updated attribute state successfully", data);

  }

  function onVote(data: PlayerVoteData): void {

    log("updating vote state");

    if (connectedSessionId === null) return;
    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    Object.keys(data).map(property => {
      if (property === "voting") session.setVoting(data[property]!);
      if (property === "accusingPlayer") session.setAcuPlayer(data[property]!);
      if (property === "nominatedPlayer") session.setNomPlayer(data[property]!);
      if (property === "list") session.addVote(data[property]);
    })
    server.to(connectedSessionId).emit("vote", data);
    log("updated vote state successfully", data);

  }

  function onScenario(data: Scenario[]): void {


    log("updating scenario state");

    if (connectedSessionId === null) return;
    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.setScenarios(data);
    server.to(connectedSessionId).emit("scenario", data);
    log("updated scenario state successfully", data);

  }

  function onTimer(data: TimerData, callback: CallbackFn) {

    log("updating timer from client");

    if (connectedSessionId === null) return;
    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return callback({status: "error", error: "no session found"});

    session.setTimers(data);

    socket.to(connectedSessionId).emit("timer", data);

    log("updated timer successfully");
    callback({status: "ok"});

  }

  function onSync(data: {players: Player[], scenarios: Scenario[]}, callback: CallbackFn) {

    log("syncing client state to server");

    if (connectedSessionId === null) return;
    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return callback({status: "error", error: "no session found"});

    const returnData = {} as SessionData;

    if (data.players) {
      session.setPlayers(data.players);
      returnData.players = data.players;
    }

    if (data.scenarios) {
      session.setScenarios(data.scenarios);
      returnData.scenarios = data.scenarios;
    }

    socket.to(connectedSessionId).emit("sync", returnData); // won't send to sender
    log("synced state successfully");
    callback({status: "ok"});

  }

  function onDisconnect(reason: DisconnectReason, details: {message: string, description: string, context: string}) {

    // https://socket.io/docs/v4/troubleshooting-connection-issues/#usage-of-the-socketid-attribute
    // https://socket.io/docs/v4/client-options/#auth

    log("disconnected from server");

    // the reason of the disconnection, for example "transport error"
    console.log("disconnect reason", reason);


    if (details) {
      // the low-level reason of the disconnection, for example "xhr post error"
      console.log("disconnect message", details.message);

      // some additional description, for example the status code of the HTTP response
      console.log("disconnect description", details.description);

      // some additional context, for example the XMLHttpRequest object
      console.log("disconnect context", details.context);
    }

    if (connectedSessionId !== null) {

      if (!sessionManager.sessionExists(connectedSessionId)) {
        console.log("disconnect could not find session");
        return;
      }

      const session = sessionManager.getSession(connectedSessionId);
      const player = session.players.find(player => player.id === playerId);

      if (player === undefined) {
        console.log("disconnect could not find player");
        return;
      }

      if (Object.hasOwn(session.disconnectTimers, player.name)) {
        clearTimeout(session.disconnectTimers[player.name]);
      }

      // start dc timer
      session.disconnectTimers[player.name] = setTimeout(() => {

        if (connectedSessionId === null) {
          console.log("disconnect could not find connectedSessionId");
          return;
        }

        // remove player after timer
        sessionManager.leaveSession(connectedSessionId, playerId);
        if (sessionManager.sessionExists(connectedSessionId)) {
          server.to(connectedSessionId).emit("left", playerId);
        }
        delete session.disconnectTimers[player.name];
        log(`removed from session ${connectedSessionId}`);

      }, config.dc_timeout_seconds*1000);

      log(`disconnected from session ${connectedSessionId}`);

    }

  }

  function onLeave() {

    log("leaving session");

    if (connectedSessionId === null) return;
    if (!sessionManager.sessionExists(connectedSessionId)) return;

    // leave the players current session and room
    sessionManager.leaveSession(connectedSessionId, playerId);
    socket.leave(connectedSessionId);

    // tell the players in the left session player has left
    server.to(connectedSessionId).emit("left", playerId);
    log(`left session ${connectedSessionId}`);
    connectedSessionId = null;
    playerName = undefined;

    // reset player session
    const blankSession = sessionManager.createSession();
    socket.emit("sync", {...blankSession.getData(), id: null}, null);
    if (blankSession.id === null) return;
    sessionManager.removeSession(blankSession.id);


  }

  socket.on("join", onJoin);
  socket.on("host", onHost);
  socket.on("phase", onPhase);
  socket.on("attribute", onAttribute);
  socket.on("vote", onVote);
  socket.on("scenario", onScenario);
  socket.on("sync", onSync);
  socket.on("disconnect", onDisconnect);
  socket.on("leave", onLeave);
  socket.on("timer", onTimer);
  socket.on("resume", onResumeTest);

}

