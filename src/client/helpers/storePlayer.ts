import Player from "../classes/player";
import GameData from "../strings/_gameData";
import NightOrders from "./nightOrders";
import randomise from "./randomiser";
import { socket } from "./socket";
import { StateCreator } from "zustand";
import { DragEndEvent } from "@dnd-kit/core";

type Char = {
  id: string;
  name: string;
  description: string;
  ability: string;
  orderType: string;
  attributes: Array<string>;
  additional: Array<string>;
  setup: Array<Array<string>>;
  reminders: Array<Reminder>;
}

type Role = {
  id: string;
  name: string;
  type: string;
  description: string;
  ability: string;
  orderType: string;
  attributes: Array<string>;
  additional: Array<string>;
  setup: Array<Array<string>>;
  reminders: Array<Reminder>;
}

type Reminder = {
    id: number;
    origin: Role | Char;
    content: string;
    colour: string;
    description: string;
}

type Player = {
  id: string;
  name: string;
  type: number;
  label: string;
  notes: string;
  char: number;
  role: number;
  state: number;
  team: number;
  rChar: number;
  rRole: number;
  rState: number;
  rTeam: number;
  rVotePower: number;
  reminders: Array<Reminder>;
  nightOrders: Array<Reminder>;
}

type Session = {
  id: null | string;
  sync: boolean;
  modules: Array<string>;
}



interface PlayerSlice {
  players: Array<Player>;
  setPlayers: (newPlayers: Array<Player>) => void;
  changePlayerAttribute: (targetId: string, targetProperty: string, targetValue: string, fromServer?: boolean) => void;
  addPlayerReminders: (event: DragEndEvent) => void;
  syncPlayers: (session) => void;
  randomisePlayers: (chars, roles) => void;
  addPlayerNightIndicators: (cycle, chars, roles, purgedOrders, ordering) => void;
  addPlayer: (player) => void;
  removePlayer: (playerId) => void;
  pushPlayer: () => void;
  popPlayer: () => void;
  getUser: () => void;
  getDrawPlayers: () => void;

}

export const createPlayerSlice: StateCreator<
  PlayerSlice,
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
      localStorage.setItem("lastSession", JSON.stringify({
        players: newPlayers,
        sessionId: get().session.id,
        playerName: newPlayers.find(player => player.id === get().userId).name
      }));
    }

    return {players: newPlayers};

  }),

  addPlayerReminders: (event) => set(state => {

    const reminderId = event.active.id.split("-|-")[1];
    const originId = event.active.id.split("-|-")[0];
    const originIsPlayer = originId !== "new";
    const hasTarget = event.over !== null;
    const maxReminders = 5;
    let removeOrigin = false;
    let placeReminder = true;
    let playerId;

    if (!hasTarget && !originIsPlayer) return {players: state.players};

    if (originIsPlayer) removeOrigin = true;

    if (!hasTarget && originIsPlayer) {
      placeReminder = false;
      playerId = originId;
    } else if (hasTarget) {
      playerId = event.over.id.split("-|-")[1];
    }

    const newPlayers = state.players.map(player => {
      if (placeReminder && player.id === playerId) {

        // don't add reminder if the player already has that reminder
        if (player.reminders.some(aReminderId => aReminderId === reminderId)) return player;
        // don't add reminder if the player has the max reminders
        if (player.reminders.length >= maxReminders) return player;

        const reminder = GameData.reminders.find(reminder => reminder.id === reminderId);
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
      let clientHasPlayer = clientPlayerIds.has(player.id);
      // if the client does not have player then put them at their index
      if (!clientHasPlayer) {
        newPlayers[index] = player;

      // if the client does have the player then take their synced values
      } else if (clientHasPlayer) {
        // potential bug here
        newPlayers[index].rChar = player.rChar;
        newPlayers[index].rRole = player.rRole;
        newPlayers[index].rTeam = player.rTeam;
        newPlayers[index].rState = player.rState;
        newPlayers[index].rVotePower = player.rVotePower;
      }

    })

    localStorage.setItem("lastSession", JSON.stringify({
      players: newPlayers,
      sessionId: state.session.id,
      playerName: newPlayers.find(player => player.id === state.userId).name
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
    let newCycle = cycle ? cycle : state.phase.cycle;
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
    const i = newPlayers.filter(player => player.type !== 0).length
    const player = new Player(i, "Player " + i);
    if (i >= 16) return {players: newPlayers};
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
    return players.find(player => player.id === userId);
  },

  getDrawPlayers: () => {
    const players = get().players;
    return players.filter(player => player.type === 1);
  },
})