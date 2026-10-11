import { expect, test } from "vitest";
import { createHomePageModel } from "../../src/domain/home/model";
import { homeContent } from "../../src/site/home";

const identity = {
  subtitle: "a small diary",
  displayName: "Author",
  avatar: "/images/avatar.jpg",
  githubUrl: "https://github.com/example",
};
test("home model keeps site content serializable for the island", () => {
  const model = createHomePageModel(
    identity,
    homeContent,
    new Date("2026-07-04T00:00:00Z"),
  );

  expect(model.flowerImage).toBe("/images/flower.jpg");
  expect(model.renderedAt).toBe("2026-07-04T00:00:00.000Z");
  expect(JSON.parse(JSON.stringify(model))).toEqual(model);
});

test("required home content fails instead of disappearing silently", () => {
  expect(() =>
    createHomePageModel(
      identity,
      { ...homeContent, fallingWords: [] },
      new Date(),
    ),
  ).toThrow("Falling tags need at least one word");
});
