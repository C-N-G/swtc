import http from "node:http";
import path from "node:path";
import { fileURLToPath } from 'url';
import fs from "node:fs";
import {Server} from "socket.io";
import SessionManager from "./sessionManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hostname = "127.0.0.1";
const port = 3001;
const basePath = path.join(__dirname, "..", "..", "client", "dist");

const httpserver = http.createServer((req, res) => {
  
  console.log(req.url);
  
  res.setHeader('Access-Control-Allow-Origin', '*');

  // set header for content type
  if (req.url.endsWith("html")) {
    res.setHeader('Content-Type', 'text/html');
  } else if (req.url.endsWith("js")) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith("css")) {
    res.setHeader('Content-Type', 'text/css');
  }

  // redirect url to work with nginx server
  if (req.url === "/swtc") {
    req.url = "/"
  } else if (req.url.startsWith("/swtc")) {
    req.url = req.url.slice(5)
  }

  let target;

  // redirect base path to app
  if (req.url === "/") {
    target = "index.html";
    res.setHeader('Content-Type', 'text/html');
  } else {
    target = req.url;
  }

  // try and read requested file
  try {
    const file = fs.readFileSync(path.join(basePath, target));
    res.statusCode = 200;
    res.write(file);
  } catch (error) {
    console.log(error);
    res.statusCode = 404;
    res.write("Error 404");
  }

  res.end();

});

const options = process.env.NODE_ENV === "production" ? {path: "/swtc/socket.io"} : {
  cors: {
    origin: "http://localhost:5173"
  },
  path: "/swtc/socket.io"
}

// create websocket server
const io = new Server(httpserver, options);

const sessionManager = new SessionManager();

const swtcNamespace = io.of("/swtc")

swtcNamespace.on("connection", (socket) => {
  console.log("new socket connection, id:", socket.id);

  let connectedSessionId = null;
  let playerName;
  const playerId = socket.id;

  function log(msg, data) {
    const messageId = `${playerId}:${playerName ? playerName : "UnKnown"}`;
    const messageContent = `- ${msg}`;
    const messageData = data ? `- ${JSON.stringify(data)}` : "";
    console.log(messageId, messageContent, messageData);
  }

  socket.on("join", (sessionId, name) => {

    log("joining");

    if (connectedSessionId !== null) {
      return;
    }

    if (sessionManager.sessionExists(sessionId)) {
      connectedSessionId = sessionId;
      const session = sessionManager.getSession(sessionId);
      if (!session) return;
      const player = sessionManager.joinSession(sessionId, playerId, name);
      playerName = name;
      socket.join(sessionId);
      socket.to(sessionId).emit("joined", player);
      socket.emit("sync", session.getData(), player.id);
      log(`joined session ${sessionId}`);
    }

  })

  socket.on("host", (name) => {

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


  })

  socket.on("phase", (data) => {
    log("updating phase state")

    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.setPhase(data);
    swtcNamespace.to(connectedSessionId).emit("phase", data);
    log("updated phase state successfully", data);

  })

  socket.on("attribute", (data) => {

    log("updating attribute state");

    // TODO ONLY SEND UPDATES TO THE SPECIFIC PLAYER THAT IS BEING UPDATED
    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.updatePlayer(data.targetId, data.targetProperty, data.targetValue);
    swtcNamespace.to(connectedSessionId).emit("attribute", data);
    log("updated attribute state successfully", data);

  })

  socket.on("vote", (data) => {

    log("updating vote state");

    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    Object.keys(data).map(property => {
      if (property === "voting") session.setVoting(data[property]);
      if (property === "accusingPlayer") session.setAcuPlayer(data[property]);
      if (property === "nominatedPlayer") session.setNomPlayer(data[property]);
      if (property === "list") session.addVote(data[property]);
    })
    swtcNamespace.to(connectedSessionId).emit("vote", data);
    log("updated vote state successfully", data);

  })

  socket.on("module", (data) => {

    log("updating module state");

    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.setModules(data);
    swtcNamespace.to(connectedSessionId).emit("module", data);
    log("updated module state successfully", data);

  })

  socket.on("sync", (data, callback) => {

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
    callback({status: "ok"})

  })

  socket.on("disconnect", (reason, details) => {

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
      sessionManager.leaveSession(connectedSessionId, playerId);
      log(`disconnected from session ${connectedSessionId}`);
    }

    if (sessionManager.sessionExists(connectedSessionId)) {
      const session = sessionManager.getSession(connectedSessionId);
      swtcNamespace.to(connectedSessionId).emit("left", playerId);
    }

  })

  socket.on("leave", () => {

    log("leaving session");

    if (!sessionManager.sessionExists(connectedSessionId)) return;

    // leave the players current session and room
    sessionManager.leaveSession(connectedSessionId, playerId);
    socket.leave(connectedSessionId);

    // tell the players in the left session player has left
    swtcNamespace.to(connectedSessionId).emit("left", playerId);
    log(`left session ${connectedSessionId}`);
    connectedSessionId = null;
    playerName = undefined;

    // reset player session
    const blankSession = sessionManager.createSession();
    socket.emit("sync", {...blankSession.getData(), id: null}, null);
    sessionManager.removeSession(blankSession);


  })

});


httpserver.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/swtc`);
}); 




