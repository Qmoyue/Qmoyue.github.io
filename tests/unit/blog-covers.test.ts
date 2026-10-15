import { expect, test } from "vitest";
import { selectCoverFilename } from "../../src/domain/blog/covers";

test("explicit cover stays fixed and invalid cover fails", () => {
  const filenames = ["paper.jpg", "flower.jpg"];
  expect(selectCoverFilename("post-a", "paper.jpg", filenames)).toBe(
    "paper.jpg",
  );
  expect(() => selectCoverFilename("post-a", "missing.jpg", filenames)).toThrow(
    "Unknown blog cover",
  );
});

test("auto cover selects from the catalog and rejects an empty catalog", () => {
  const filenames = ["paper.jpg", "flower.jpg"];
  expect(filenames).toContain(selectCoverFilename("post-a", "auto", filenames));
  expect(() => selectCoverFilename("post-a", "auto", [])).toThrow(
    "Blog cover catalog is empty",
  );
});
