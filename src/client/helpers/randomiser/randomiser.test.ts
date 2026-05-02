import { expect, test } from 'vitest';
import { DebugOrderItem, Randomiser } from "./randomiser";
import Player from '../../classes/player';
import GameData from '../../strings/_gameData';

const SCENARIO = { // based on scenario load order
  PossessionsAndObsessions: 0,
  StandardProcedure: 2
}

const GetFilteredGameData = (targetScenario = SCENARIO.StandardProcedure)  => {
  return GameData.getFullFilteredValues([GameData.scenarios[targetScenario]])
}

function testDebugOrder(debugOrders: DebugOrderItem[], scenario: number): Player[] {
  const players = Array.from(Array(8), (_, i) => new Player(String(i), "Player " + i));
  const [chars, roles] =  GetFilteredGameData(scenario);
  const randomiser = new Randomiser(players, chars, roles, true, debugOrders);
  const result = randomiser.assignPlayers();
  return result;
}

function checkPrisoner(result: Player[], scenario: number) {
  const [, roles] =  GetFilteredGameData(scenario);
  const prisoners = result.filter(player => roles[player.role].name === "Prisoner").length;
  const detrimentals = result.filter(player => roles[player.role].type === "Detrimental").length;
  expect(prisoners).toEqual(1);
  expect(detrimentals).toEqual(2);
}

test("warden with space and without prisoner", () => {

  const testingScenario = SCENARIO.StandardProcedure;

  const debugOrders = [
    {index: 0, role: "Traitor", char: "Persevering"},
    {index: 1, role: "Test Subject", char: "Alert"},
    {index: 2, role: "Technician", char: "Diligent"},
    {index: 3, role: "Coordinator", char: "Eccentric"},
    {index: 4, role: "Bodyguard", char: "Empathetic"},
    {index: 5, role: "Clairvoyant", char: "Enamoured"},
    {index: 6, role: "Warden", char: "Forthright"},
  ]

  const result = testDebugOrder(debugOrders, testingScenario);
  checkPrisoner(result, testingScenario);

})

test("warden without space and with prisoner", () => {

  const testingScenario = SCENARIO.StandardProcedure;

  const debugOrders = [
    {index: 0, role: "Traitor", char: "Persevering"},
    {index: 1, role: "Prisoner", char: "Alert"},
    {index: 2, role: "Technician", char: "Diligent"},
    {index: 3, role: "Coordinator", char: "Eccentric"},
    {index: 4, role: "Bodyguard", char: "Empathetic"},
    {index: 5, role: "Clairvoyant", char: "Enamoured"},
    {index: 6, role: "Therapist", char: "Forthright"},
    {index: 7, role: "Warden", char: "Intuitive"},
  ]
  
  const result = testDebugOrder(debugOrders, testingScenario);
  checkPrisoner(result, testingScenario);

})

test("warden without space and with prisoner and different spacing", () => {

  const testingScenario = SCENARIO.StandardProcedure;

  const debugOrders = [
    {index: 0, role: "Traitor", char: "Persevering"},
    {index: 1, role: "Technician", char: "Diligent"},
    {index: 2, role: "Prisoner", char: "Alert"},
    {index: 3, role: "Coordinator", char: "Eccentric"},
    {index: 4, role: "Bodyguard", char: "Empathetic"},
    {index: 5, role: "Clairvoyant", char: "Enamoured"},
    {index: 6, role: "Therapist", char: "Forthright"},
    {index: 7, role: "Warden", char: "Intuitive"},
  ]
  
  const result = testDebugOrder(debugOrders, testingScenario);
  checkPrisoner(result, testingScenario);

})

test("warden without space and without prisoner", () => {

  const testingScenario = SCENARIO.StandardProcedure;

  const debugOrders = [
    {index: 0, role: "Traitor", char: "Persevering"},
    {index: 1, role: "Test Subject", char: "Alert"},
    {index: 2, role: "Technician", char: "Diligent"},
    {index: 3, role: "Coordinator", char: "Eccentric"},
    {index: 4, role: "Bodyguard", char: "Empathetic"},
    {index: 5, role: "Clairvoyant", char: "Enamoured"},
    {index: 6, role: "Therapist", char: "Forthright"},
    {index: 7, role: "Warden", char: "Intuitive"},
  ]
  
  const result = testDebugOrder(debugOrders, testingScenario);
  checkPrisoner(result, testingScenario);

})

test("warden with space and with prisoner", () => {

  const testingScenario = SCENARIO.StandardProcedure;

  const debugOrders = [
    {index: 0, role: "Traitor", char: "Persevering"},
    {index: 1, role: "Prisoner", char: "Alert"},
    {index: 2, role: "Technician", char: "Diligent"},
    {index: 3, role: "Coordinator", char: "Eccentric"},
    {index: 4, role: "Bodyguard", char: "Empathetic"},
    {index: 5, role: "Clairvoyant", char: "Enamoured"},
    {index: 6, role: "Warden", char: "Forthright"},
  ]
  
  const result = testDebugOrder(debugOrders, testingScenario);
  checkPrisoner(result, testingScenario);

})

test("accomplice neighbouring ", () => {

  const testingScenario = SCENARIO.StandardProcedure;

  const debugOrders = [
    {index: 0, role: "Traitor", char: "Persevering"},
    {index: 1, role: "Technician", char: "Diligent"},
    {index: 2, role: "Accomplice", char: "Alert"},
  ]
  
  const result = testDebugOrder(debugOrders, testingScenario);
  const index7Role = GameData.roles[result[7].role].name;

  expect(index7Role).toEqual("Accomplice");

})

function checkShowAsInPlay(result: Player[], scenario: number) {
  const [, roles] =  GetFilteredGameData(scenario);
   const PlayersWithRolesThatHaveInPlayTarget = result.filter(player => {
    return roles[player.role].setup?.some(setupCommand => setupCommand[0].includes("InPlay") || setupCommand[1]?.includes("InPlay"))
   })

   expect(PlayersWithRolesThatHaveInPlayTarget.length).toBeGreaterThan(0)
   PlayersWithRolesThatHaveInPlayTarget.forEach(playerWithInPlayRole => {
    const otherPlayers = result.filter(player => player.id !== playerWithInPlayRole.id);
    const thisPlayerShownRole = playerWithInPlayRole.rRole;
    const anoterPlayerHasSameRole = otherPlayers.some(player => player.role === thisPlayerShownRole);
    expect(anoterPlayerHasSameRole).toBeTruthy();
   })
}

test("showAs InPlay", () => {

  const testingScenario = SCENARIO.PossessionsAndObsessions;

  const debugOrders = [
    {index: 0, role: "Necromancer", char: "Adaptable"},
    {index: 1, role: "Doppelganger", char: "Alert"},
    {index: 2, role: "Technician", char: "Approachable"},
    {index: 3, role: "Medic", char: "Critical"},
    {index: 4, role: "Coordinator", char: "Cunning"},
    {index: 5, role: "Clairvoyant", char: "Diligent"},
    {index: 6, role: "Postcog", char: "Empathetic"},
    {index: 7, role: "Precog", char: "Methodical"},
  ]

  const result = testDebugOrder(debugOrders, testingScenario);
  checkShowAsInPlay(result, testingScenario);

})