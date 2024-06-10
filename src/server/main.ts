import http from "node:http";
import process from "node:process";
import {Namespace, Server} from "socket.io";
import config from "../appConfig.ts";
import swtcHttpServer from "./httpServer.ts";
import swtcSocketServer from "./socketServer.ts";
import { ClientToServerEvents, ServerToClientEvents } from "./serverTypes.ts";

const httpserver = http.createServer(swtcHttpServer);

// create websocket server
const options = process.env.NODE_ENV === "production" ? {path: config.socket_addr} : {
  cors: {origin: config.dev_addr},
  path: config.socket_addr
}
const io = new Server<ClientToServerEvents, ServerToClientEvents, [], []>(httpserver, options);
const swtcNamespace: Namespace<ClientToServerEvents, ServerToClientEvents, [], []> = io.of("/swtc");
swtcNamespace.on("connection", (socket) => swtcSocketServer(swtcNamespace, socket));


httpserver.listen(config.port, config.addr, () => {
  console.log(`Server running at http://${config.addr}:${config.port}/swtc`);
}); 




