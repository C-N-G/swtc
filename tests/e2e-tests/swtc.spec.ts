// @ts-check
import { test, expect, type Page, type Locator } from "@playwright/test";

test.describe.configure({mode: "serial"});
// https://playwright.dev/docs/test-retries#reuse-single-page-between-tests
let narrator: Page;
let player1: Page;
let player2: Page;
let sessionID: string;

test.beforeAll("session setup", async ({browser}) => {

  narrator = await browser.newPage();
  await narrator.goto("http://127.0.0.1:3001/swtc");
  player1 = await browser.newPage();
  await player1.goto("http://127.0.0.1:3001/swtc");
  player2 = await browser.newPage();
  await player2.goto("http://127.0.0.1:3001/swtc");
  
})

test.beforeAll("hosting a session", async () => {

  await narrator.getByRole("button", {name: "Options"}).click();
  await expect(narrator.getByText("Host Session")).toBeVisible();
  await narrator.getByText("Host Session").click();
  await narrator.locator("#host-name").fill("narrator1");
  await narrator.getByRole("button", {name: "Host"}).click();
  sessionID = (await narrator.getByText(/Session ID:/i).innerText()).split(" ")[2];
  expect(sessionID).toHaveLength(7);

})

test.beforeAll("joining a session", async () => {

  await player1.getByRole("button", {name: "Options"}).click();
  await expect(player1.getByText("Host Session")).toBeVisible();
  await player1.getByText("Join Session").click();
  await player1.locator("#join-name").fill("player1");
  await player1.locator("#join-id").fill(sessionID);
  await player1.getByRole("button", {name: "Join"}).click();
  await expect(player1.getByText(/Current Phase/i)).toBeVisible();

  await player2.getByRole("button", {name: "Options"}).click();
  await expect(player2.getByText("Host Session")).toBeVisible();
  await player2.getByText("Join Session").click();
  await player2.locator("#join-name").fill("player2");
  await player2.locator("#join-id").fill(sessionID);
  await player2.getByRole("button", {name: "Join"}).click();
  await expect(player2.getByText(/Current Phase/i)).toBeVisible();

})

test.afterAll(async () => {

  await narrator.close();
  await player1.close();
  await player2.close();

});


test.describe("narrator tools", () => {

  test("module selection", async () => {

    await narrator.getByRole("button", {name: /Select Modules/i}).click()
    let modNum: number = 0;
    for (const module of await narrator.getByLabel(/chars/i).all()) {
      await module.click();
      modNum++;
    }
    await narrator.getByRole("button", {name: /Close/i}).click()
    await expect(narrator.getByRole("button", {name: /Select Modules/i})).toContainText(String(modNum));

  });

  test("sync button", async () => {

    await narrator.getByRole("button", {name: /Sync/i}).click();
    await expect(narrator.getByLabel(/autoSync control/i)).toBeChecked();

  });

  test("changing attribute", async () => {

    await narrator.getByText("player1").click();
    await narrator.locator("#narrator-Shown-state-input").click();
    await narrator.locator("#narrator-Shown-state-input").press("ArrowUp");
    await narrator.locator("#narrator-Shown-state-input").press("Enter");
    await narrator.getByRole("button", {name: /player1/i}).click();
    await expect(player1.getByText(/State:/i)).toContainText(/Dead/i);

  });

});

test.describe("dismissal voting", () => {

  test("dismissal starting", async () => {

    await narrator.getByText("player1").click();
    await expect(narrator.getByRole("button", {name: "Start Dismissal"})).toBeVisible();
    await narrator.getByRole("button", {name: "Start Dismissal"}).click();
    await narrator.locator("#nominating-player-select").click();
    await narrator.getByRole("option", {name: "player2"}).click();
    await narrator.getByRole("button", {name: "Begin"}).click();

    await expect(player1.getByText(/Nominated by: player2/i)).toBeVisible();
    await expect(player2.getByText(/Nominated by: player2/i)).toBeVisible();
    await expect(narrator.getByText(/0 Voted For/i)).toBeVisible();

  });

  test("player voting", async () => {

    await player1.getByRole("button", {name: /Vote For/i}).click();
    await expect(player1.getByRole("button", {name: /Vote For/i})).toBeDisabled();
    await expect(narrator.getByText(/1 Voted For/i)).toBeVisible();

    await player2.getByRole("button", {name: /Vote For/i}).click();
    await expect(player2.getByRole("button", {name: /Vote For/i})).toBeDisabled();
    await expect(narrator.getByText(/2 Voted For/i)).toBeVisible();
    
  });

  test("dismissal ending", async () => {

    await narrator.getByRole("button", {name: /Finish/i}).click();
    await expect(player1.getByText(/Nominated by: player2/i)).toBeHidden();
    await expect(player2.getByText(/Nominated by: player2/i)).toBeHidden();

  });

})
