import { expect, test } from 'vitest';
import { Randomiser } from "./randomiser";

test("creating the randomiser class", () => {
  const randomiser = new Randomiser([], [], [], false);
  
  expect(randomiser).toBeDefined();
})