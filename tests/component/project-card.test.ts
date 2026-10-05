import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import ProjectCard from "../../src/components/project/ProjectCard.astro";

test("project card renders a supplied external project with a safe new-tab link", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ProjectCard, {
    props: {
      project: {
        name: "Example Notes",
        description: "An open-source note site",
        tags: ["Astro", "Vue"],
        status: "OPEN SOURCE",
        url: "https://example.com/notes",
      },
    },
  });

  expect(html).toContain("Example Notes");
  expect(html).toContain("An open-source note site");
  expect(html).toContain("#Astro");
  expect(html).toContain("#Vue");
  expect(html).toContain('href="https://example.com/notes"');
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).not.toContain("Moyue");
});

test("project card keeps a local project link in the same tab", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ProjectCard, {
    props: {
      project: {
        name: "Local Project",
        description: "Documentation",
        tags: [],
        status: "ACTIVE",
        url: "/project/local/",
      },
    },
  });

  expect(html).toContain('href="/project/local/"');
  expect(html).not.toContain('target="_blank"');
});
