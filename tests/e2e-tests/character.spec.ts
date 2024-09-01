import { test, expect } from "./sessionSetup.ts";

test("scenario selection", async ({narrator}) => {

  await narrator.getByRole("button", {name: /select scenarios/i}).click()
  let secnarioNum: number = 0;
  for (const scenario of await narrator.getByLabel(/chars/i).all()) {
    await scenario.click();
    secnarioNum++;
  }
  await narrator.getByRole("button", {name: /close/i}).click()
  await expect(narrator.getByRole("button", {name: /select scenarios/i})).toContainText(String(secnarioNum));

});

test("sync button", async ({narrator}) => {

  await narrator.getByRole("button", {name: /sync/i}).click();
  await expect(narrator.getByLabel(/autosync control/i)).toBeChecked();

});

test("changing attribute", async ({session}) => {

  const narrator = session.narrator;
  const player1 = session.player1;

  await narrator.getByRole("button", {name: /sync/i}).click();

  await narrator.getByText(/player1/i).click();
  await narrator.locator("#narrator-Shown-state-input").click();
  await narrator.locator("#narrator-Shown-state-input").press("ArrowUp");
  await narrator.locator("#narrator-Shown-state-input").press("Enter");
  await narrator.getByRole("button", {name: /player1/i}).click();
  await expect(player1.getByRole("heading", {name: /state:/i})).toContainText(/dead/i);

  await narrator.getByText(/player1/i).click();
  await narrator.locator("#narrator-Shown-state-input").click();
  await narrator.locator("#narrator-Shown-state-input").press("ArrowDown");
  await narrator.locator("#narrator-Shown-state-input").press("Enter");
  await narrator.getByRole("button", {name: /player1/i}).click();
  await expect(player1.getByRole("heading", {name: /state:/i})).toContainText(/alive/i);

});

test("viewing vote history dialog", async ({narrator}) => {

  await narrator.getByRole("button", {name: /vote history/i}).click();
  await expect(narrator.getByText(/voting history/i)).toBeVisible();
  await expect(narrator.getByText(/most voted player/i).first()).toBeVisible();
  await expect(narrator.getByText(/most voted player/i).nth(1)).toBeHidden();

  await narrator.getByRole("tab", {name: /yesterday/i}).click();
  await expect(narrator.getByText(/most voted player/i).first()).toBeHidden();
  await expect(narrator.getByText(/most voted player/i).nth(1)).toBeVisible();

  await narrator.getByRole("button", {name: /close/i}).click();
  await expect(narrator.getByText(/voting history/i)).toBeHidden();

})