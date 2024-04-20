import SessionManager from "./sessionManager.js";
import config from "../appConfig.js";

const sessionManager = new SessionManager();

export default function swtcSocketServer(server, socket) {

  console.log("new socket connection, id:", socket.id);

  let connectedSessionId = null;
  let playerName;
  let playerId = socket.id;

  function log(msg, data) {
    const messageId = `${playerId}:${playerName ? playerName : "UnKnown"}`;
    const messageContent = `- ${msg}`;
    const messageData = data ? `- ${JSON.stringify(data)}` : "";
    console.log(messageId, messageContent, messageData);
  }

  function onResumeTest(sessionId, name, callback) {

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

  function onJoin(sessionId, name, callback) {

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

  function onHost(name) {

    log("hosting session");

    if (connectedSessionId !== null) {
      return;
    }

    const session = sessionManager.createSession();
    connectedSessionId = session.id;
    const player = sessionManager.joinSession(session.id, playerId, name);
    playerName = name;
    socket.join(session.id);
    socket.emit("sync", session.getData(), player.id);
    log(`hosted session with id ${session.id}`);


  }

  function onPhase(data) {

    log("updating phase state")

    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.setPhase(data);
    server.to(connectedSessionId).emit("phase", data);
    log("updated phase state successfully", data);

  }

  function onAttribute(data) {

    log("updating attribute state");

    // TODO ONLY SEND UPDATES TO THE SPECIFIC PLAYER THAT IS BEING UPDATED
    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.updatePlayer(data.targetId, data.targetProperty, data.targetValue);
    server.to(connectedSessionId).emit("attribute", data);
    log("updated attribute state successfully", data);

  }

  function onVote(data) {

    log("updating vote state");

    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    Object.keys(data).map(property => {
      if (property === "voting") session.setVoting(data[property]);
      if (property === "accusingPlayer") session.setAcuPlayer(data[property]);
      if (property === "nominatedPlayer") session.setNomPlayer(data[property]);
      if (property === "list") session.addVote(data[property]);
    })
    server.to(connectedSessionId).emit("vote", data);
    log("updated vote state successfully", data);

  }

  function onModule(data) {


    log("updating module state");

    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.setModules(data);
    server.to(connectedSessionId).emit("module", data);
    log("updated module state successfully", data);

  }

  function onTimer(data, callback) {

    log("updating timer from client");

    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return callback({status: "error", error: "no session found"});

    socket.to(connectedSessionId).emit("timer", data);

    log("updated timer successfully");
    callback({status: "ok"});

  }

  function onSync(data, callback) {

    log("syncing client state to server");

    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return callback({status: "error", error: "no session found"});

    let returnData = {}

    if (data.players) {
      session.setPlayers(data.players);
      returnData.players = data.players;
    }

    if (data.modules) {
      session.setModules(data.modules);
      returnData.modules= data.modules;
    }

    socket.to(connectedSessionId).emit("sync", returnData); // won't send to sender
    log("synced state successfully");
    callback({status: "ok"});

  }

  function onDisconnect(reason, details) {

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

      if (!sessionManager.sessionExists(connectedSessionId)) return;

      const session = sessionManager.getSession(connectedSessionId);
      const player = session.players.find(player => player.id === playerId);

      if (Object.hasOwn(session.disconnectTimers, player.name)) {
        clearTimeout(session.disconnectTimers[player.name]);
      }

      // start dc timer
      session.disconnectTimers[player.name] = setTimeout(() => {

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
    sessionManager.removeSession(blankSession);


  }

  socket.on("join", onJoin);
  socket.on("host", onHost);
  socket.on("phase", onPhase);
  socket.on("attribute", onAttribute);
  socket.on("vote", onVote);
  socket.on("module", onModule);
  socket.on("sync", onSync);
  socket.on("disconnect", onDisconnect);
  socket.on("leave", onLeave);
  socket.on("timer", onTimer);
  socket.on("resume", onResumeTest);

}