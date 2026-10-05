import { expect, test } from "vitest";
import { makeFallingRandom } from "../../src/islands/home/useMatterWorld";

test("the falling-tag visual fixture repeats its spawn positions", () => {
  const first = makeFallingRandom(17);
  const second = makeFallingRandom(17);
  expect([first(), first(), first()]).toEqual([second(), second(), second()]);
});
