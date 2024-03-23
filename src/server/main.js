import http from "node:http";
import process from "node:process";
import {Server} from "socket.io";
import { fileURLToPath } from "node:url";
import path from "node:path";
import YAML from "js-yaml";
import fs from "node:fs";
import swtcHttpServer from "./httpServer.js";
import swtcSocketServer from "./socketServer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "..", "config.yml");
let config;
try {
  config = YAML.load(fs.readFileSync(configPath, "utf8"));
  console.log("config loaded");
} catch (e) {
  console.log(e);
}

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




