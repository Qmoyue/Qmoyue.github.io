import { expect, test } from "@playwright/test";

test("home identity clears the expanded navigation and stacks vertically", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "打开导航" }).click();

  const nav = page.locator(".top-nav .nav-panel");
  await expect(nav).toBeVisible();
  const navBox = await nav.boundingBox();
  const avatarBox = await page
    .locator(".home-identity-stage .hero-avatar")
    .boundingBox();
  const terminalBox = await page.locator(".terminal-ubuntu").boundingBox();
  if (!navBox || !avatarBox || !terminalBox) {
    throw new Error("The home identity layout is incomplete");
  }

  expect(avatarBox.y).toBeGreaterThan(navBox.y + navBox.height);
  expect(terminalBox.y).toBeGreaterThan(avatarBox.y + avatarBox.height);
  expect(
    Math.abs(
      avatarBox.x + avatarBox.width / 2 - terminalBox.x - terminalBox.width / 2,
    ),
  ).toBeLessThan(2);
});

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
  const thumb = await page
    .locator("[data-scroll-rail] .scroll-rail-thumb")
    .boundingBox();
  if (!thumb) throw new Error("Doro is missing from the home progress rail");
  await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
  await page.mouse.down();
  await expect(page.locator("[data-scroll-rail] .scroll-rail-thumb")).toHaveCSS(
    "animation-name",
    "doro-run",
  );
  await page.mouse.move(box.x + box.width / 2, box.y + 8);
  const positionWhileDragging = await page.evaluate(() => ({
    top: window.scrollY,
    height: window.innerHeight,
  }));
  expect(positionWhileDragging.top).toBeLessThan(
    positionWhileDragging.height * 0.2,
  );
  await page.mouse.up();
  await expect(page.locator("[data-scroll-rail] .scroll-rail-thumb")).toHaveCSS(
    "animation-name",
    "none",
  );
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
  await expect(page.locator(".terminal-prompt")).toHaveText("moyue@Qmoyue:~$");
  await expect(page.locator("[data-terminal-output]")).toHaveText(
    /^flag\{[a-z0-9_]+\}$/,
  );
  await expect(page.locator("[data-terminal-output]")).not.toHaveText(
    "flag{welcome_to_moyues_blog}",
  );
  await page.keyboard.press("Space");
  await expect(page.getByRole("region", { name: "首页模块" })).toBeInViewport();
  await expect(page.locator("[data-falling-stage] .falling-item")).toHaveCount(
    0,
  );
});

test("home blog link remains in static HTML without JavaScript", async ({
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
      page
        .getByRole("navigation", { name: "快捷入口" })
        .getByRole("link", { name: "BLOG" }),
    ).toHaveAttribute("href", "/blog/");
  } finally {
    await context.close();
  }
});

test("enabling reduced motion during the opening settles its playback", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator("[data-home-root]")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-terminal-command]")).toHaveText("cat /flag");
  await expect(page.locator("[data-terminal-output]")).toHaveText(
    /^flag\{[a-z0-9_]+\}$/,
  );
  await page.getByRole("slider", { name: "页面滚动进度" }).press("End");
  await expect(page.getByRole("region", { name: "首页模块" })).toBeInViewport();
  await expect(page.locator("[data-falling-stage] .falling-item")).toHaveCount(
    0,
  );
});

test("home clock and calendar agree when the visitor uses another time zone", async ({
  browser,
}) => {
  const context = await browser.newContext({
    timezoneId: "America/Los_Angeles",
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const expected = await page.evaluate(() => {
      const now = new Date();
      return {
        time: new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Shanghai",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).format(now),
        today: new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Shanghai",
          month: "2-digit",
          day: "2-digit",
        })
          .format(now)
          .replace("/", "."),
      };
    });
    await expect(page.locator("[data-clock-time]")).toHaveText(expected.time);
    await expect(page.locator("[data-calendar-today]")).toHaveText(
      expected.today,
    );
  } finally {
    await context.close();
  }
});
