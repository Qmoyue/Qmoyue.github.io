import { expect, test } from "vitest";
import { createHomePageModel } from "../../src/domain/home/model";
import { homeContent } from "../../src/site/home";
import { homeBlocks } from "../../src/presets/moyue/homeBlocks";

const identity = {
  subtitle: "a small diary",
  displayName: "Author",
  avatar: "/images/avatar.jpg",
  githubUrl: "https://github.com/example",
};
const post = {
  href: "/blog/first/",
  title: "First note",
  description: "A note",
  coverAlt: "Notebook cover",
  pubDate: new Date("2026-07-03T00:00:00Z"),
  tags: ["journal", "astro", "vue"],
  words: 1200,
};

test("home model keeps article and site content serializable for the island", () => {
  const model = createHomePageModel(
    identity,
    homeContent,
    post,
    "/optimized-cover.webp",
    new Date("2026-07-04T00:00:00Z"),
  );

  expect(model.latest.href).toBe(post.href);
  expect(model.latest.coverSrc).toBe("/optimized-cover.webp");
  expect(model.latest.tags).toEqual(["journal", "astro"]);
  expect(model.renderedAt).toBe("2026-07-04T00:00:00.000Z");
  expect(JSON.parse(JSON.stringify(model))).toEqual(model);
});

test("required home content fails instead of disappearing silently", () => {
  expect(() =>
    createHomePageModel(
      identity,
      homeContent,
      undefined,
      "/cover.webp",
      new Date(),
    ),
  ).toThrow("needs a published post");
  expect(() =>
    createHomePageModel(identity, homeContent, post, "", new Date()),
  ).toThrow("needs a cover URL");
});

test("Moyue home manifest assigns each block a unique semantic area", () => {
  expect(homeBlocks.map((block) => block.area)).toEqual([
    "latest",
    "flower",
    "profile",
    "clock",
    "calendar",
    "quote",
  ]);
  expect(new Set(homeBlocks.map((block) => block.id)).size).toBe(
    homeBlocks.length,
  );
  expect(homeBlocks.every((block) => block.component)).toBe(true);
});
