import { expect, test } from "vitest";
import { isActivePath } from "../../src/lib/navigation";

test("navigation matches routes and their descendants at a path boundary", () => {
  expect(isActivePath("/", "/")).toBe(true);
  expect(isActivePath("/blog/", "/")).toBe(false);
  expect(isActivePath("/blog", "/blog/")).toBe(true);
  expect(isActivePath("/blog/web/", "/blog/")).toBe(true);
  expect(isActivePath("/blogger/", "/blog/")).toBe(false);
});
