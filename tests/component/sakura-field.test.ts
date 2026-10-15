import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import SakuraField from "../../src/components/effects/SakuraField.astro";

test("sakura field rejects an invalid count at build time", async () => {
  const container = await AstroContainer.create();
  await expect(
    container.renderToString(SakuraField, { props: { count: -1 } }),
  ).rejects.toThrow("Sakura count must be a non-negative integer");
});
