import { test, expect } from "./sessionSetup.ts";
import { type Page } from "@playwright/test";

test.describe.serial("running complete dismissal vote", () => {

  let narrator: Page;
  let player1: Page;
  let player2: Page;
  test.beforeAll(async ({session}) => {
    narrator = session.narrator;
    player1 = session.player1;
    player2 = session.player2;
  })

  test("starting dismissal", async () => {

    await narrator.getByText(/player1/i).click();
    await expect(narrator.getByRole("button", {name: /start dismissal/i})).toBeVisible();
    await narrator.getByRole("button", {name: /start dismissal/i}).click();
    await narrator.locator("#nominating-player-select").click();
    await narrator.getByRole("option", {name: /player2/i}).click();
    await narrator.getByRole("button", {name: /begin/i}).click();

    await expect(player1.getByText(/nominated by: player2/i)).toBeVisible();
    await expect(player2.getByText(/nominated by: player2/i)).toBeVisible();
    await expect(narrator.getByText(/0 voted/i)).toBeVisible();

  });

  test("player voting", async () => {

    await expect(player1.getByRole("button", {name: /vote for/i})).toBeDisabled();
    await expect(player2.getByRole("button", {name: /vote for/i})).toBeDisabled();

    await narrator.getByRole("button", {name: /start 15/i}).click();

    await expect(player1.getByRole("button", {name: /vote for/i})).toBeEnabled();
    await expect(player2.getByRole("button", {name: /vote for/i})).toBeEnabled();

    await expect(narrator.getByText(/2 abstained/i)).toBeVisible();

    await player1.getByRole("button", {name: /vote for/i}).click();
    await expect(narrator.getByText(/1 voted/i)).toBeVisible();
    await expect(narrator.getByText(/1 abstained/i)).toBeVisible();

    await player2.getByRole("button", {name: /vote for/i}).click();

    await expect(narrator.getByText(/2 voted/i)).toBeVisible();
    await expect(narrator.getByText(/0 abstained/i)).toBeVisible();
    
  });

  test("ending dismissal", async () => {

    await narrator.getByRole("button", {name: /finish/i}).click();
    await expect(player1.getByText(/nominated by: player2/i)).toBeHidden();
    await expect(player2.getByText(/nominated by: player2/i)).toBeHidden();

  });

})

test.describe.serial("testing vote power changes", () => {

  let narrator: Page;
  let player1: Page;
  let player2: Page;
  test.beforeAll(async ({session}) => {
    narrator = session.narrator;
    player1 = session.player1;
    player2 = session.player2;
  })

  test("changing vote power", async () => {

    await narrator.getByRole("button", {name: /player1/i}).click();
    await narrator.locator("#narrator-rVotePower-input").click();
    await narrator.getByRole("option", {name: /2 vote power/i}).click();
    await narrator.getByRole("button", {name: /player1/i}).click();
    await narrator.getByRole("button", {name: /Sync/i}).click();

  });

  test("vote power reflecting during dismissal", async () => {

    await narrator.getByRole("button", {name: /player1/i}).click();
    await expect(narrator.getByRole("button", {name: /start dismissal/i})).toBeVisible();
    await narrator.getByRole("button", {name: /start dismissal/i}).click();
    await narrator.locator("#nominating-player-select").click();
    await narrator.getByRole("option", {name: /player2/i}).click();
    await narrator.getByRole("button", {name: /begin/i}).click();

    await narrator.getByRole("button", {name: /start 15/i}).click();
    await player1.getByRole("button", {name: /vote for/i}).click();
    await expect(narrator.getByText(/2 voted/i)).toBeVisible();
    await expect(narrator.getByText(/1 abstained/i)).toBeVisible();

    await narrator.getByRole("button", {name: /finish/i}).click();

  });

})