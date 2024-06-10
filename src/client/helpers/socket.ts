import { io, Socket } from "socket.io-client";
import config from "../../appConfig.ts";
import { ClientToServerEvents, ServerToClientEvents } from "../../server/socketServer.ts";

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === "production" ? undefined : "http://127.0.0.1:3001";
const URL = process.env.NODE_ENV === "production" ? window.location.host + "/swtc" : config.dev_socket_addr;

console.log("connecting websocket to", URL);

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {path: config.socket_addr});