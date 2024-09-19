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

function checkPrisoner(result: Player[]) {
  const prisoners = result.filter(player => GameData.roles[player.role].name === "Prisoner").length;
  const detrimentals = result.filter(player => GameData.roles[player.role].type === "Detrimental").length;
  expect(prisoners).toEqual(1);
  expect(detrimentals).toEqual(2);
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

  const result = testDebugOrder(debugOrders);
  checkPrisoner(result);

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
  
  const result = testDebugOrder(debugOrders);
  checkPrisoner(result);

})

test("warden without space and with prisoner and different spacing", () => {

  const debugOrders = [
    {index: 0, role: "Traitor", char: "Persevering"},
    {index: 1, role: "Technician", char: "Diligent"},
    {index: 2, role: "Prisoner", char: "Alert"},
    {index: 3, role: "Cook", char: "Eccentric"},
    {index: 4, role: "Bodyguard", char: "Empathetic"},
    {index: 5, role: "Clairvoyant", char: "Enamoured"},
    {index: 6, role: "Therapist", char: "Forthright"},
    {index: 7, role: "Warden", char: "Intuitive"},
  ]
  
  const result = testDebugOrder(debugOrders);
  checkPrisoner(result);

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
  
  const result = testDebugOrder(debugOrders);
  checkPrisoner(result);

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
  
  const result = testDebugOrder(debugOrders);
  checkPrisoner(result);

})

test("accomplice neighbouring ", () => {

  const debugOrders = [
    {index: 0, role: "Traitor", char: "Persevering"},
    {index: 1, role: "Technician", char: "Diligent"},
    {index: 2, role: "Accomplice", char: "Alert"},
  ]
  
  const result = testDebugOrder(debugOrders);
  const index7Role = GameData.roles[result[7].role].name;

  expect(index7Role).toEqual("Accomplice");

})