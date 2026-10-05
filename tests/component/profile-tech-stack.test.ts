import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import ProfileTechStack from "../../src/components/profile/ProfileTechStack.astro";

test("profile tech stack exposes a real empty state", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ProfileTechStack, {
    props: { items: [], emptyMessage: "No tools listed yet" },
  });

  expect(html).toContain("No tools listed yet");
  expect(html).not.toContain("Moyue");
});

test("profile tech stack renders supplied typed items instead of its empty state", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ProfileTechStack, {
    props: {
      items: [
        {
          name: "TypeScript",
          description: "Typed UI",
          icon: "TS",
          tone: "mint",
        },
      ],
      emptyMessage: "No tools listed yet",
    },
  });

  expect(html).toContain("TypeScript");
  expect(html).toContain("Typed UI");
  expect(html).not.toContain("No tools listed yet");
});
