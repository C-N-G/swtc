import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === "production" ? undefined : "http://127.0.0.1:3001";
const URL = process.env.NODE_ENV === "production" ? window.location.host + "/swtc" : "http://127.0.0.1:3001/swtc";

console.log("connectiong websocket to", URL);

export const socket = io(URL, {path: "/swtc/socket.io"});

export function socketFunctionBuilder(dispatch) {

  return {

    connect() {
      dispatch({
        type: "connectionChanged",
        connected: true
      }); 
    },

    disconnect() {
      dispatch({
        type: "connectionChanged",
        connected: false
      }); 
    },

    phase(data) {
      dispatch({
        type: "phaseChanged",
        newPhase: data
      })
    },

    attribute(data) {
      dispatch({
        type: "attributeChanged",
        targetId: data.targetId,
        targetProperty: data.targetProperty,
        targetValue: data.targetValue
      })
    },

    module(data) {
      dispatch({
        type: "modulesChanged",
        newModules: data
      })
    },

    vote(data) {
      dispatch({
        type: "votesChanged",
        newVote: data
      })
    },

    sync(session, userId) {
      dispatch({
        type: "sessionSynchronised",
        newSession: session,
        newUserId: userId
      })
    }

  }

}
