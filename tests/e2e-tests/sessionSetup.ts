import { test as base, expect, type Page } from "@playwright/test";

type Session = {
  session: {
    narrator: Page,
    player1: Page,
    player2: Page,
  },
  narrator: Page
}

export const test = base.extend<Session>({
  session: async ({ browser }, use) => {

    // setting up the pages
    const narrator = await browser.newPage();
    await narrator.goto("http://127.0.0.1:3001/swtc");
    const player1 = await browser.newPage();
    await player1.goto("http://127.0.0.1:3001/swtc");
    const player2 = await browser.newPage();
    await player2.goto("http://127.0.0.1:3001/swtc");

    // hosting a session
    await narrator.getByRole("button", {name: /options/i}).click();
    await narrator.getByText(/host session/i).click();
    await narrator.locator("#host-name").fill("narrator1");
    await narrator.getByRole("button", {name: /host/i}).click();
    const sessionID = (await narrator.getByText(/session id:/i).innerText()).split(" ")[2];
    expect(sessionID).toHaveLength(7);

    // player 1 joining session
    await player1.getByRole("button", {name: /options/i}).click();
    await expect(player1.getByText(/host session/i)).toBeVisible();
    await player1.getByText(/join session/i).click();
    await player1.locator("#join-name").fill("player1");
    await player1.locator("#join-id").fill(sessionID);
    await player1.getByRole("button", {name: /join/i}).click();
    await expect(player1.getByText(/current phase/i)).toBeVisible();

    // player 2 joining session
    await player2.getByRole("button", {name: /options/i}).click();
    await expect(player2.getByText(/host session/i)).toBeVisible();
    await player2.getByText(/join session/i).click();
    await player2.locator("#join-name").fill("player2");
    await player2.locator("#join-id").fill(sessionID);
    await player2.getByRole("button", {name: /join/i}).click();
    await expect(player2.getByText(/current phase/i)).toBeVisible();
    
    // use the pages in the test
    await use({
      narrator,
      player1,
      player2
    });

  },

  narrator: async ({ browser }, use) => {

    // setting up the pages
    const narrator = await browser.newPage();
    await narrator.goto("http://127.0.0.1:3001/swtc");

    // hosting a session
    await narrator.getByRole("button", {name: /options/i}).click();
    await narrator.getByText(/host session/i).click();
    await narrator.locator("#host-name").fill("narrator1");
    await narrator.getByRole("button", {name: /host/i}).click();
    const sessionID = (await narrator.getByText(/session id:/i).innerText()).split(" ")[2];
    expect(sessionID).toHaveLength(7);

    // use the pages in the test
    await use(narrator);

  }
});

export { expect } from '@playwright/test';
