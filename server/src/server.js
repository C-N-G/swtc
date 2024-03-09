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
  console.log("new socket connection");

  let connectedSessionId = null;
  let playerName;
  const playerId = socket.id;

  socket.on("join", (sessionId, name) => {

    console.log("user joining with id", playerId);

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
      console.log("user joined session", sessionId, "with name", name);
    }

  })

  socket.on("host", (name) => {

    console.log("user hosting with id", playerId);

    if (connectedSessionId !== null) {
      return;
    }

    const session = sessionManager.createSession();
    connectedSessionId = session.id;
    const player = sessionManager.joinSession(session.id, playerId, name);
    socket.join(session.id);
    socket.emit("sync", session.getData(), player.id);
    console.log("user hosted session", session.id, "with name", name);


  })

  socket.on("phase", (data) => {

    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.setPhase(data);
    swtcNamespace.to(connectedSessionId).emit("phase", data);
    console.log("phase updated with", data);

  })

  socket.on("attribute", (data) => {

    console.log("updating attribute state from player", playerName);

    // TODO ONLY SEND UPDATES TO THE SPECIFIC PLAYER THAT IS BEING UPDATED
    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.updatePlayer(data.targetId, data.targetProperty, data.targetValue);
    swtcNamespace.to(connectedSessionId).emit("attribute", data);
    console.log("player updated with", data);

  })

  socket.on("vote", (data) => {

    console.log("updating vote state from player", playerName);

    console.log("data", data);
    console.log("data", connectedSessionId);


    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    console.log("session", session)
    Object.keys(data).map(property => {
      if (property === "voting") session.setVoting(data[property]);
      if (property === "accusingPlayer") session.setAcuPlayer(data[property]);
      if (property === "nominatedPlayer") session.setNomPlayer(data[property]);
      if (property === "list") session.addVote(data[property]);
    })
    swtcNamespace.to(connectedSessionId).emit("vote", data);
    console.log("vote updated with", data);

  })

  socket.on("module", (data) => {

    console.log("updating module state from player", playerName);

    console.log("module change data", data);

    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.setModules(data);
    swtcNamespace.to(connectedSessionId).emit("module", data);
    console.log("updated modules with", data);

  })

  socket.on("sync", (data, callback) => {

    console.log("syncing seeiong from player", playerName);

    console.log("syncing session data from client", Object.keys(data));

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
    console.log("synced session with clients", Object.keys(returnData));
    callback({status: "ok"})

  })

  socket.on("disconnect", () => {

    console.log(playerName, "has disconnected");

    if (connectedSessionId !== null) {
      if (!sessionManager.sessionExists(connectedSessionId)) return;
      sessionManager.leaveSession(connectedSessionId, playerId);
      console.log("player", playerId, "disconnected from session", connectedSessionId);
    }

    if (sessionManager.sessionExists(connectedSessionId)) {
      const session = sessionManager.getSession(connectedSessionId);
      swtcNamespace.to(connectedSessionId).emit("left", playerId);
    }

  })

  socket.on("leave", () => {

    console.log(playerName, "has left");

    if (!sessionManager.sessionExists(connectedSessionId)) return;

    // leave the players current session and room
    sessionManager.leaveSession(connectedSessionId, playerId);
    socket.leave(connectedSessionId);

    // tell the players in the left session player has left
    swtcNamespace.to(connectedSessionId).emit("left", playerId);
    console.log("player", playerId, "left session", connectedSessionId);
    connectedSessionId = null;

    // reset player session
    const blankSession = sessionManager.createSession();
    socket.emit("sync", {...blankSession.getData(), id: null}, null);
    sessionManager.removeSession(blankSession);


  })

});


httpserver.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/swtc`);
}); 




