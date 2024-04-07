import { test, expect } from "./sessionSetup.ts";

test("progressing phase", async ({session}) => {

  const narrator = session.narrator;
  const player1 = session.player1;

  await expect(narrator.getByText(/day 1/i)).toBeVisible();
  await expect(player1.getByText(/day 1/i)).toBeVisible();

  await narrator.getByRole("button", {name: /progress phase/i}).click();

  await expect(narrator.getByText(/night 1/i)).toBeVisible();
  await expect(player1.getByText(/night 1/i)).toBeVisible();

  await narrator.getByRole("button", {name: /progress phase/i}).click();

  await expect(narrator.getByText(/day 2/i)).toBeVisible();
  await expect(player1.getByText(/day 2/i)).toBeVisible();

});

test("scenario dialog", async ({narrator}) => {

  await narrator.getByRole("button", {name: /show scenario/i}).click();
  await expect(narrator.getByText(/current scenario/i)).toBeVisible();

  await narrator.getByRole("tab", {name: /night order/i}).click();
  await expect(narrator.getByText(/ability type/i)).toBeVisible();

  await narrator.getByRole("button", {name: /close/i}).click();
  await expect(narrator.getByText(/current scenario/i)).toBeHidden();

})

test("night order dialog", async ({narrator}) => {

  await narrator.getByRole("button", {name: /progress phase/i}).click();

  await narrator.getByRole("button", {name: /night order list/i}).click();
  await expect(narrator.getByRole("button", {name: /close/i})).toBeVisible();

  await narrator.getByRole("button", {name: /close/i}).click();
  await expect(narrator.getByRole("button", {name: /close/i})).toBeHidden();

})