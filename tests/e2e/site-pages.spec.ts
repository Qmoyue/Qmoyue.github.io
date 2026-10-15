import { expect, test } from "@playwright/test";
import { site } from "../../src/site/config";
import { profile } from "../../src/site/profile";
import { projects } from "../../src/site/projects";

test("profile, projects and footer publish the configured content", async ({
  page,
}) => {
  await page.goto("/me/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    profile.headline,
  );
  await expect(
    page.getByText(profile.introduction, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(profile.bio, { exact: true })).toBeVisible();
  for (const interest of profile.interests) {
    await expect(page.getByText(interest, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "技术栈" })).toBeVisible();
  await expect(
    page.getByText(profile.emptyTechMessage, { exact: true }),
  ).toBeVisible();

  await page.goto("/project/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Project");
  for (const project of projects) {
    const link = page.getByRole("link").filter({
      has: page.getByRole("heading", { name: project.name, exact: true }),
    });
    await expect(link).toHaveAttribute("href", project.url);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toContainText(project.description);
    for (const tag of project.tags) await expect(link).toContainText(`#${tag}`);
  }
  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText(`${site.displayName} / ${site.name}`);
  await expect(footer).toContainText(site.footer.line);
  await expect(footer).toContainText(site.footer.status);
});
