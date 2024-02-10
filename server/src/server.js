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

  if (req.url.endsWith("html")) {
    res.setHeader('Content-Type', 'text/html');
  } else if (req.url.endsWith("js")) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith("css")) {
    res.setHeader('Content-Type', 'text/css');
  }

  let target

  if (req.url === "/" || req.url === "/swtc") {
    target = "index.html";
    res.setHeader('Content-Type', 'text/html');
  } else {
    target = req.url;
  }

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

const options = process.env.NODE_ENV === "production" ? {} : {
  cors: {
    origin: "http://localhost:5173"
  } 
}

// create websocket server
const io = new Server(httpserver, options);

const sessionManager = new SessionManager();

io.on("connection", (socket) => {
  console.log("new socket connection");

  let connectedSessionId = null;
  const playerId = socket.id;

  socket.on("join", (sessionId, name) => {

    if (connectedSessionId !== null) {
      return;
    }

    if (sessionManager.sessionExists(sessionId)) {
      connectedSessionId = sessionId;
      const session = sessionManager.getSession(sessionId);
      if (!session) return;
      const userId = sessionManager.joinSession(sessionId, playerId, name);
      socket.join(sessionId);
      socket.to(sessionId).emit("sync", session.getData());
      socket.emit("sync", session.getData(), userId);
      console.log("user joined session", sessionId, "with name", name);
    }

  })

  socket.on("host", (name) => {

    if (connectedSessionId !== null) {
      return;
    }

    const session = sessionManager.createSession();
    connectedSessionId = session.id;
    const userId = sessionManager.joinSession(session.id, playerId, name);
    socket.join(session.id);
    socket.emit("sync", session.getData(), userId);
    console.log("user hosted session", session.id, "with name", name);


  })

  socket.on("phase", (data) => {

    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.setPhase(data);
    io.to(connectedSessionId).emit("phase", data);
    console.log("phase updated with", data);

  })

  socket.on("attribute", (data) => {

    // TODO ONLY SEND UPDATES TO THE SPECIFIC PLAYER THAT IS BEING UPDATED
    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.updatePlayer(data.targetId, data.targetProperty, data.targetValue);
    io.to(connectedSessionId).emit("attribute", data);
    console.log("player updated with", data);

  })

  socket.on("vote", (data) => {

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
    io.to(connectedSessionId).emit("vote", data);
    console.log("vote updated with", data);

  })

  socket.on("module", (data) => {

    console.log("module change data", data);

    const session = sessionManager.getSession(connectedSessionId);
    if (!session) return;
    session.setModules(data);
    io.to(connectedSessionId).emit("module", data);
    console.log("updated modules with", data);

  })

  socket.on("sync", (data, callback) => {

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

    if (connectedSessionId !== null) {
      sessionManager.leaveSession(connectedSessionId, playerId);
      console.log("player", playerId, "disconnected from session", connectedSessionId);
    }

    if (sessionManager.sessionExists(connectedSessionId)) {
      const session = sessionManager.getSession(connectedSessionId);
      io.to(connectedSessionId).emit("sync", session.getData());
    }

  })

  socket.on("leave", () => {

    sessionManager.leaveSession(connectedSessionId, playerId);
    socket.leave(connectedSessionId);
    console.log("player", playerId, "left session", connectedSessionId);
    connectedSessionId = null;
    const blankSession = sessionManager.createSession();
    socket.emit("sync", {...blankSession.getData(), id: null}, null);
    sessionManager.removeSession(blankSession);

    // RESET STATE TO DEFAULTS WHEN LEAVING

  })

});


httpserver.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
}); 




