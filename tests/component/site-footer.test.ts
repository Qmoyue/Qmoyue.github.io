import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import SiteFooter from "../../src/components/shared/SiteFooter.astro";

test("site footer renders supplied site identity without Moyue defaults", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(SiteFooter, {
    props: {
      displayName: "Example",
      siteName: "Example Notes",
      line: "Example footer line",
      status: "notes: ready",
      backgroundImage: "/images/flower.jpg",
    },
  });

  expect(html).toContain("Example / Example Notes");
  expect(html).toContain("Example footer line");
  expect(html).toContain("notes: ready");
  expect(html).toContain("/images/flower.jpg");
  expect(html).not.toContain("Moyue");
});
