import { expect, test } from "vitest";
import {
  defineBlogConfig,
  defineThemePreset,
} from "../../src/framework/contracts/config";

test("site config rejects missing identity instead of rendering it", () => {
  expect(() =>
    defineBlogConfig({
      site: { name: " ", displayName: "Example", description: "A blog" },
      navigation: [{ href: "/", label: "Home" }],
      preset: { id: "example" },
    }),
  ).toThrow("Site name is required");
});

test("navigation must link to a local route", () => {
  expect(() =>
    defineBlogConfig({
      site: { name: "Example", displayName: "Example", description: "A blog" },
      navigation: [{ href: "https://example.com", label: "Home" }],
      preset: { id: "example" },
    }),
  ).toThrow("Navigation items need a local href and label");
});

test("theme preset needs an id for its CSS scope", () => {
  expect(() => defineThemePreset({ id: "" })).toThrow(
    "Theme preset id is required",
  );
});
