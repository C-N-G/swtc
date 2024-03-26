import http from "node:http";
import process from "node:process";
import {Server} from "socket.io";
import config from "../appConfig.js";
import swtcHttpServer from "./httpServer.js";
import swtcSocketServer from "./socketServer.js";

const httpserver = http.createServer(swtcHttpServer);

// create websocket server
const options = process.env.NODE_ENV === "production" ? {path: config.socket_addr} : {
  cors: {origin: config.dev_addr},
  path: config.socket_addr
}
const io = new Server(httpserver, options);
const swtcNamespace = io.of("/swtc")
const onConnection = (socket) => {swtcSocketServer(swtcNamespace, socket)};
swtcNamespace.on("connection", onConnection);


httpserver.listen(config.port, config.addr, () => {
  console.log(`Server running at http://${config.addr}:${config.port}/swtc`);
}); 




