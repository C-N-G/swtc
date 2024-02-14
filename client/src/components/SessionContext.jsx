import {createContext, useContext, useEffect, useMemo, useReducer} from "react";
import { socket, socketFunctionBuilder } from "../helpers/socket";

const SessionContext = createContext(null);

const SessionDispatchContext = createContext(null);

export function SessionProvider({children}) {
  const [session, dispatch] = useReducer(
    sessionReducer,
    initialSession
  );

  // CAN THIS IMPORT THE STATE FROM SOMEWHER? SO THAT IT CAN BE GIVEN TO OTHER COMPONENTS

  // import socket with use effect
  useSocketConnections(dispatch)

  // use effect will import functions
  // 

  const user = session.players.find(player => player.id === session.userId); // the users player object
  const drawPlayers = session.players.filter(player => player.type === 1); // the players to draw on the board e.g. not the narrators


  return (
    <SessionContext.Provider value={session}>
      <SessionDispatchContext.Provider value={dispatch}>
        {children}
      </SessionDispatchContext.Provider>
    </SessionContext.Provider>
  );
}

function useSocketConnections(dispatch) {

  const socketFunctions = useMemo(() => socketFunctionBuilder(dispatch), [dispatch])
  
  useEffect(() => {

    console.log("running effect")

    for (const func in socketFunctions) {
      socket.on(func, socketFunctions[func])
    }

    return () => {
      for (const func in socketFunctions) {
        socket.off(func, socketFunctions[func])
      }
    };
  }, [socketFunctions]);

}


export function useSession() {
  return useContext(SessionContext);
}

export function useSessionDispatch() {
  return useContext(SessionDispatchContext);
}

function sessionReducer(session, action) {
  switch (action.type) {
    case "connectionChanged": {
      return {...session, isConnected: action.connected}
    }
    case "attributeChanged": {

      if (["rRole", "rChar", "rState", "rStatus", "rTeam"].includes(action.targetProperty) && action.fromServer === false && session.autoSync === true) {
        return socket.emit("attribute", {targetId: action.targetId, targetProperty: action.targetProperty, targetValue: action.targetValue});
      }
  
      return {
        ...session, 
        players: session.players.map((player) => {
          if (player.id === action.targetId) {
            return {...player, [action.targetProperty]: action.targetValue};
          } else {
            return player;
          }})
        }

    }
    case "phaseChanged": {
      return {
        ...session, 
        phase: action.newPhase
      }
    }
    case "modulesChanged": {
      return {
        ...session, 
        modules: action.newModules
      }
    }
    case "votesChanged": {

      let updateVoting, updateDisplay, updateUserVote, 
      updateVotes, updateVotesList, 
      updateAccusingPlayer, updateNominatedPlayer;

      if (Object.hasOwn(action.newVote, "voting")) {
        updateVoting = action.newVote.voting;
        if (action.newVote.voting === true) updateDisplay = 2;
        else updateUserVote = {0: null, 1: null};
      }
      
      if (Object.hasOwn(action.newVote, "list")){
        if (Array.isArray(action.newVote.list)) {
          updateVotesList = action.newVote.list;
          updateUserVote = {0: null, 1: null};
        } else {
          updateVotes = [...session.votes.list, action.newVote.list];
        }
      }
      
      if (Object.hasOwn(action.newVote, "accusingPlayer")){
        updateAccusingPlayer = action.newVote.accusingPlayer;
      }
      
      if (Object.hasOwn(action.newVote, "nominatedPlayer")){
        updateNominatedPlayer = action.newVote.nominatedPlayer
      }

      return {
        ...session,
        display: updateDisplay ? updateDisplay : session.display,
        votes: {
          list: updateVotesList ? updateVotesList : updateVotes ? updateVotes : session.votes.list,
          voting: updateVoting ? updateVoting : session.votes.voting,
          accusingPlayer: updateAccusingPlayer ? updateAccusingPlayer : session.votes.accusingPlayer,
          nominatedPlayer: updateNominatedPlayer ? updateNominatedPlayer : session.votes.nominatedPlayer
        },
        userVote: {
          userVote: updateUserVote ? updateUserVote : session.userVote
        }

      }

    }
    case "sessionSynchronised": {

      return {
        ...session,
        players: action.newSession.players ? action.newSession.players : session.players,
        phase: action.newSession.phase ? action.newSession.phase : session.phase,
        votes: action.newSession.votes ? action.newSession.votes : session.votes,
        sessionId: action.newSession.id || action.newSession.id === null ? action.newSession.id : session.sessionId,
        modules: action.newSession.modules ? action.newSession.modules : session.modules,
        userId: action.newUserId ? action.newUserId : session.userId
      }

    }
    case "displayChanged": {
      return {
        ...session,
        display: action.display
      }
    }
    default:
      throw Error('Unknown action: ' + action.type);
  }
}

const initialSession = {
  isConnected: false,
  sessionId: null,
  userId: null,
  display: false,
  players: [],
  phase: {cycle: "Night", round: 1},
  votes: {list: [], voting: false, accusingPlayer: null, nominatedPlayer: null},
  userVote: {0: null, 1: null},
  modules: [],
  autoSync: false,
}