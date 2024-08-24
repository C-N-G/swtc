import Player from "../classes/player.ts";
import GameData from "../strings/_gameData.ts";
import NightOrders from "./nightOrders.ts";
import randomise from "./randomiser.ts";
import { socket } from "./socket.ts";
import { StateCreator } from "zustand";
import { CombinedSlice, PlayerSlice } from "./storeTypes.ts";




export const createPlayerSlice: StateCreator<
  CombinedSlice,
  [],
  [],
  PlayerSlice
> = (set, get) => ({
  players: [],

  setPlayers: (newPlayers) => set(() => ({players: newPlayers})),

  changePlayerAttribute: (targetId, targetProperty, targetValue, fromServer = false) => set(state => {

    if (["rRole", "rChar", "rState", "rTeam", "rVotePower"].includes(targetProperty) && fromServer === false && state.session.sync === true) {
      socket.emit("attribute", {targetId: targetId, targetProperty: targetProperty, targetValue: targetValue});
      return {players: state.players};
    }

    const newPlayers = state.players.map((player) => {
      if (player.id === targetId) {
        return {...player, [targetProperty]: targetValue};
      } else {
        return player;
      }
    })

    if (fromServer === false) {
      const foundPlayer = newPlayers.find(player => player.id === get().userId);
      if (!foundPlayer) throw new Error("local player not found while saving session locally");
      localStorage.setItem("lastSession", JSON.stringify({
        players: newPlayers,
        sessionId: get().session.id,
        playerName: foundPlayer.name
      }));
    }

    return {players: newPlayers};

  }),

  addPlayerReminders: (event) => set(state => {

    const reminderId = Number(String(event.active.id).split("-|-")[1]);
    const originId = String(event.active.id).split("-|-")[0];
    const originIsPlayer = originId !== "new";
    const hasTarget = event.over !== null;
    const maxReminders = 5;
    let removeOrigin = false;
    let placeReminder = true;
    let playerId: string;

    if (!hasTarget && !originIsPlayer) return {players: state.players};

    if (originIsPlayer) removeOrigin = true;

    if (!hasTarget && originIsPlayer) {
      placeReminder = false;
      playerId = originId;
    } else if (hasTarget) {
      playerId = String(event.over!.id).split("-|-")[1];
    }

    const newPlayers = state.players.map(player => {
      if (placeReminder && player.id === playerId) {

        // don't add reminder if the player already has that reminder
        if (player.reminders.some(aReminderId => aReminderId === reminderId)) return player;
        // don't add reminder if the player has the max reminders
        if (player.reminders.length >= maxReminders) return player;

        const reminder = GameData.reminders.find(reminder => reminder.id === reminderId);
        if (!reminder) throw new Error("could not find reminder for associated drop element");
        player.reminders.push(reminder.id);
      } else if (removeOrigin && player.id === originId) {
        player.reminders = player.reminders.filter(id => id !== reminderId);
      }
      return {...player};
    })
    return {players: newPlayers};
  }),

  syncPlayers: (session) => set(state => {
    const newPlayers = state.players
    // if syncing a session with no players then just remove them all
    if (session.players.length === 0) return {players: []};
    const clientPlayerIds = new Set(newPlayers.map(player => player.id));

    // loop through all the players sent from the server
    session.players.forEach((player, index) => {
      const clientHasPlayer = clientPlayerIds.has(player.id);
      // if the client does not have player then put them at their index
      if (!clientHasPlayer) {
        newPlayers[index] = player;

      // if the client does have the player then take their synced values
      } else if (clientHasPlayer) {
        newPlayers[index] = Object.assign({}, newPlayers[index]); // change reference value so react will push an update
        newPlayers[index].rChar = player.rChar;
        newPlayers[index].rRole = player.rRole;
        newPlayers[index].rTeam = player.rTeam;
        newPlayers[index].rState = player.rState;
        newPlayers[index].rVotePower = player.rVotePower;
      }

      if (state.userId === player.id) {
        newPlayers[index].char = player.rChar;
        newPlayers[index].role = player.rRole
        newPlayers[index].team = player.rTeam;
      }

    })

    const foundPlayer = newPlayers.find(player => player.id === state.userId);
    if (!foundPlayer) throw new Error("local player not found while saving session locally");
    localStorage.setItem("lastSession", JSON.stringify({
      players: newPlayers,
      sessionId: state.session.id,
      playerName: foundPlayer.name
    }));

    return {players: newPlayers};

  }),

  randomisePlayers: (chars, roles) => set(state => {

    let newPlayers = state.players;

    try {
      newPlayers = randomise(newPlayers, chars, roles);
    } catch (error) {
      console.error("randomiser error: ", error);
      return {players: state.players};
    }

    if (state.phase.cycle === "Night") {
      const ordering =  NightOrders.calculateOrder(newPlayers, chars, roles);
      newPlayers = NightOrders.addOrderIndicators(ordering, newPlayers, state.purgedOrders);
    }

    return {players: newPlayers};

  }),

  addPlayerNightIndicators: (cycle, chars, roles, purgedOrders, ordering) => set(state => {
    let newPlayers = state.players;
    const newCycle = cycle ? cycle : state.phase.cycle;
    if (newCycle === "Night") {
      ordering = ordering ? ordering : NightOrders.calculateOrder(newPlayers, chars, roles);
      newPlayers = NightOrders.addOrderIndicators(ordering, newPlayers, purgedOrders);
    } else if (newCycle === "Day") {
      newPlayers = newPlayers.map(player => {
        player.nightOrders = [];
        return {...player};
      });
    }
    return {players: newPlayers};
  }),

  addPlayer: (player) => set(state => ({players: [...state.players, player]})),

  removePlayer: (playerId) => set(state => ({players: state.players.filter(player => player.id !== playerId)})),

  pushPlayer: () => set(state => {
    const newPlayers = state.players;
    const index = newPlayers.filter(player => player.type !== 0).length;
    const player = new Player(String(index), "Player " + index);
    if (index >= 16) return {players: newPlayers};
    newPlayers.push(player);
    return {player: newPlayers};
  }),

  popPlayer: () => set(state => {
    const newPlayers = state.players;
    if (newPlayers.length === 0) return {players: newPlayers};
    newPlayers.pop();
    return {player: newPlayers};
  }),

  getUser: () => {
    const players = get().players;
    const userId = get().userId;
    const player = players.find(player => player.id === userId);
    // if (player === undefined) throw new Error("getUser error cold not find matching player");
    return player === undefined ? null : player;
  },

  getDrawPlayers: () => {
    const players = get().players;
    return players.filter(player => player.type === 1);
  },
})