import { expect, test } from 'vitest';
import { DebugOrderItem, Randomiser } from "./randomiser";
import Player from '../../classes/player';
import GameData from '../../strings/_gameData';

function testDebugOrder(debugOrders: DebugOrderItem[]): Player[] {
  const players = Array.from(Array(8), (_, i) => new Player(String(i), "Player " + i));
  const [chars, roles] =  GameData.getFullFilteredValues([GameData.scenarios[0]]);
  const randomiser = new Randomiser(players, chars, roles, true, debugOrders);
  const result = randomiser.assignPlayers();
  return result;
}

test("warden with space and without prisoner", () => {

  const debugOrders = [
    {index: 0, role: "Traitor", char: "Persevering"},
    {index: 1, role: "Test Subject", char: "Alert"},
    {index: 2, role: "Technician", char: "Diligent"},
    {index: 3, role: "Cook", char: "Eccentric"},
    {index: 4, role: "Bodyguard", char: "Empathetic"},
    {index: 5, role: "Clairvoyant", char: "Enamoured"},
    {index: 6, role: "Warden", char: "Forthright"},
  ]
  
  expect(testDebugOrder(debugOrders).filter(player => GameData.roles[player.role].name === "Prisoner").length).toEqual(1);

})

test("warden without space and with prisoner", () => {

  const debugOrders = [
    {index: 0, role: "Traitor", char: "Persevering"},
    {index: 1, role: "Prisoner", char: "Alert"},
    {index: 2, role: "Technician", char: "Diligent"},
    {index: 3, role: "Cook", char: "Eccentric"},
    {index: 4, role: "Bodyguard", char: "Empathetic"},
    {index: 5, role: "Clairvoyant", char: "Enamoured"},
    {index: 6, role: "Therapist", char: "Forthright"},
    {index: 7, role: "Warden", char: "Intuitive"},
  ]
  
  expect(testDebugOrder(debugOrders).filter(player => GameData.roles[player.role].name === "Prisoner").length).toEqual(1);

})

test("warden without space and without prisoner", () => {

  const debugOrders = [
    {index: 0, role: "Traitor", char: "Persevering"},
    {index: 1, role: "Test Subject", char: "Alert"},
    {index: 2, role: "Technician", char: "Diligent"},
    {index: 3, role: "Cook", char: "Eccentric"},
    {index: 4, role: "Bodyguard", char: "Empathetic"},
    {index: 5, role: "Clairvoyant", char: "Enamoured"},
    {index: 6, role: "Therapist", char: "Forthright"},
    {index: 7, role: "Warden", char: "Intuitive"},
  ]
  
  expect(testDebugOrder(debugOrders).filter(player => GameData.roles[player.role].name === "Prisoner").length).toEqual(1);

})

test("warden with space and with prisoner", () => {

  const debugOrders = [
    {index: 0, role: "Traitor", char: "Persevering"},
    {index: 1, role: "Prisoner", char: "Alert"},
    {index: 2, role: "Technician", char: "Diligent"},
    {index: 3, role: "Cook", char: "Eccentric"},
    {index: 4, role: "Bodyguard", char: "Empathetic"},
    {index: 5, role: "Clairvoyant", char: "Enamoured"},
    {index: 6, role: "Warden", char: "Forthright"},
  ]
  
  expect(testDebugOrder(debugOrders).filter(player => GameData.roles[player.role].name === "Prisoner").length).toEqual(1);

})