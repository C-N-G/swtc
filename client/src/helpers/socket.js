import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === "production" ? undefined : "http://127.0.0.1:3001";
const URL = process.env.NODE_ENV === "production" ? window.location.host + "/swtc" : "http://127.0.0.1:3001/swtc";

console.log("connectiong websocket to", URL);

export const socket = io(URL, {path: "/swtc/socket.io"});