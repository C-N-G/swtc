// create http server to serve spa

const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const { Server } = require("socket.io");

const hostname = "127.0.0.1";
const port = 3001;
const basePath = path.join(__dirname, "..", "client", "dist");

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

  if (req.url === "/") {
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

function getRoom() {
  return "room1";
}

function createId(length = 7) {

  const array = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";

  let output = [];

  for (let i = 0; i < length; i++) {
    output.push(array[Math.floor(Math.random()*array.length)]);
  }

  return output.join("");

}

function createNewGameSession() {

  const session = {};

  session.id = createId();
  session.players = [];
  session.votes = [];
  session.voting = false;
  gameSessions[session.id] = session;

  return session.id;

}

const gameSessions = {};
const userIdToRoomId = {};

io.on("connection", (socket) => {
  console.log("new socket connection");
  // console.log(socket.id)
  // socket.emit("foo", {foo: "data"});
  // socket.join("room1");

  socket.on("join", (aRoomId) => {
    console.log(aRoomId);
    userIdToRoomId[socket.id] = aRoomId;
    socket.join(aRoomId);
    console.log(userIdToRoomId);
  })

  socket.on("phase", (data) => {
    console.log(data);
    io.to(userIdToRoomId[socket.id]).emit("phase", data);
  })

  socket.on("attribute", (data) => {
    console.log(data);
    // this only needs to be sent to the player who is being updated
    io.to(userIdToRoomId[socket.id]).emit("attribute", data);
  })

  socket.on("vote", (data) => {
    console.log(data);
    io.to(userIdToRoomId[socket.id]).emit("vote", data);
  })

  socket.on("disconnect", () => {
    delete userIdToRoomId[socket.id];
  })
});


httpserver.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
}); 




