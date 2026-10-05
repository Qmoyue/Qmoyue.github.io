import { expect, test } from "@playwright/test";

test("home panels respond to wheel, Space, and dragging the progress rail", async ({
  page,
}) => {
  await page.goto("/");
  const first = page.getByRole("region", { name: "首页介绍" });
  const second = page.getByRole("region", { name: "首页模块" });
  const rail = page.getByRole("slider", { name: "页面滚动进度" });

  await page.keyboard.press("Space");
  await expect(second).toBeInViewport();
  await expect(rail).toHaveAttribute("aria-valuenow", "100");

  const box = await rail.boundingBox();
  if (!box) throw new Error("The home progress rail is missing");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.9);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 8);
  await page.mouse.up();
  await expect(first).toBeInViewport();
  await expect(rail).toHaveAttribute("aria-valuenow", "0");

  await page.reload();
  await page.mouse.wheel(0, 700);
  await expect(second).toBeInViewport();
  await expect(rail).toHaveAttribute("aria-valuenow", "100");
});

test("falling tags stop on the first panel and can run again", async ({
  page,
}) => {
  await page.goto("/");
  const tags = page.locator("[data-falling-stage] .falling-item");
  await page.keyboard.press("Space");
  await expect.poll(() => tags.count()).toBeGreaterThanOrEqual(8);
  await expect
    .poll(() =>
      tags.evaluateAll(
        (chips) =>
          chips.filter((chip) => Number(getComputedStyle(chip).opacity) > 0.5)
            .length,
      ),
    )
    .toBeGreaterThanOrEqual(3);

  await page.getByRole("slider", { name: "页面滚动进度" }).press("Home");
  await expect(tags).toHaveCount(0);
  await page.getByRole("slider", { name: "页面滚动进度" }).press("End");
  await expect.poll(() => tags.count()).toBeGreaterThanOrEqual(8);
});

test("reduced motion shows terminal content and skips falling physics", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-terminal-output]")).toHaveText(
    "flag{welcome_to_moyues_blog}",
  );
  await page.keyboard.press("Space");
  await expect(page.getByRole("region", { name: "首页模块" })).toBeInViewport();
  await expect(page.locator("[data-falling-stage] .falling-item")).toHaveCount(
    0,
  );
});

test("home article remains in static HTML without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Moyue", level: 1 }),
    ).toBeAttached();
    await expect(
      page.getByRole("region", { name: "最新文章" }).getByRole("link"),
    ).toHaveAttribute("href", /\/blog\//);
  } finally {
    await context.close();
  }
});
