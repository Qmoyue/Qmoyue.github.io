import { expect, test } from "vitest";
import { createHomePageModel } from "../../src/domain/home/model";
import { homeContent } from "../../src/site/home";
import { site, navItems } from "../../src/site/config";
test("home model keeps site content serializable for the island", () => {
  const model = createHomePageModel(
    site,
    homeContent,
    new Date("2026-07-04T00:00:00Z"),
    navItems,
  );

  expect(model.flowerImage).toBe(homeContent.flowerImage);
  expect(model.renderedAt).toBe("2026-07-04T00:00:00.000Z");
  expect(JSON.parse(JSON.stringify(model))).toEqual(model);
  expect(model.identity).not.toHaveProperty("footer");
  expect(model.links).toEqual(navItems);
});

test("required home content fails instead of disappearing silently", () => {
  expect(() =>
    createHomePageModel(
      site,
      { ...homeContent, fallingWords: [] },
      new Date(),
      navItems,
    ),
  ).toThrow("Falling tags need at least one word");
});
