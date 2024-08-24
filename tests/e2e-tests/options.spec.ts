import { test, expect } from "./sessionSetup.ts";

test("session resuming with local data", async ({session}) => {

  const narrator = session.narrator;
  const player1 = session.player1;
  const player2 = session.player2;

  await expect(player1.getByText(/day 1/i)).toBeVisible();
  await player1.getByRole('button', { name: /player1/i }).click();
  await player1.getByLabel('Player Notes').fill('test1');

  await player1.reload();
  await expect(player1.getByText(/day 1/i)).toBeVisible({timeout: 15000});
  await player1.getByRole('button', { name: /player1/i }).click();
  await expect(player1.getByText(/test1/i)).toBeVisible();
  await player1.getByLabel('Player Notes').fill('test2');

  await player1.reload();
  await expect(player1.getByText(/day 1/i)).toBeVisible();
  await player1.getByRole('button', { name: /player1/i }).click();
  await expect(player1.getByText(/test2/i)).toBeVisible();

  await expect(player2.getByText(/day 1/i)).toBeVisible();
  await player2.getByRole('button', { name: /player1/i }).click();
  await player2.getByLabel('Player Notes').fill('test3');

  await player2.reload();

  await expect(player2.getByText(/day 1/i)).toBeVisible();
  await player2.getByRole('button', { name: /player1/i }).click();
  await expect(player2.getByText(/test3/i)).toBeVisible();

  await expect(player1.getByText(/test2/i)).toBeVisible();

});


test("session resuming while voting", async ({session}) => {

  const narrator = session.narrator;
  const player1 = session.player1;
  const player2 = session.player2;

  await narrator.getByText(/player1/i).click();
  await expect(narrator.getByRole("button", {name: /start dismissal/i})).toBeVisible();
  await narrator.getByRole("button", {name: /start dismissal/i}).click();
  await narrator.locator("#nominating-player-select").click();
  await narrator.getByRole("option", {name: /player2/i}).click();
  await narrator.getByRole("button", {name: /begin/i}).click();

  await expect(player1.getByText(/nominated by: player2/i)).toBeVisible();
  await expect(player2.getByText(/nominated by: player2/i)).toBeVisible();
  await expect(narrator.getByText(/0 voted/i)).toBeVisible();

  await expect(player1.getByRole('button', { name: /show vote \(15\)/i })).toBeVisible();

  await player1.reload();

  await expect(player1.getByRole('button', { name: /show vote \(15\)/i })).toBeVisible();

});
