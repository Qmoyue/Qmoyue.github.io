import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import ProjectCard from "../../src/components/project/ProjectCard.astro";
import { projects } from "../../src/site/projects";

test("project card keeps a local project link in the same tab", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ProjectCard, {
    props: {
      project: {
        ...projects[0],
        url: "/project/",
      },
    },
  });

  expect(html).toContain('href="/project/"');
  expect(html).not.toContain('target="_blank"');
});
