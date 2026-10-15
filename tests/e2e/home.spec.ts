import { expect, test } from "@playwright/test";
import { site, navItems } from "../../src/site/config";
import { homeContent } from "../../src/site/home";

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

  await expect(page.locator("[data-terminal-output]")).toHaveText(
    /^flag\{[a-z0-9_]+\}$/,
    { timeout: 10_000 },
  );

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

test("falling tags stop on exit, restart on return and clear naturally", async ({
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
  await expect(tags).toHaveCount(0, { timeout: 12_000 });
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

test("home content and destinations remain in static HTML without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: site.displayName, level: 1 }),
    ).toBeAttached();
    const links = page.getByRole("navigation", { name: "快捷入口" });
    for (const item of navItems.filter((item) => item.href !== "/")) {
      await expect(
        links.getByRole("link", { name: item.label, exact: true }),
      ).toHaveAttribute("href", item.href);
    }
    await expect(page.locator(".home-portrait img")).toHaveAttribute(
      "src",
      homeContent.flowerImage,
    );
    await expect(page.locator(".home-quote-widget")).toContainText(
      homeContent.quote.join(""),
    );
    await expect(page.locator("[data-clock-time]")).toHaveText(/^\d{2}:\d{2}$/);
    await expect(
      page.locator("[data-calendar-days] [aria-current=date]"),
    ).toHaveCount(1);
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
    await expect
      .poll(() =>
        page.evaluate(() => {
          const now = new Date();
          const expected = {
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
          return (
            document.querySelector("[data-clock-time]")?.textContent ===
              expected.time &&
            document.querySelector("[data-calendar-today]")?.textContent ===
              expected.today
          );
        }),
      )
      .toBe(true);
  } finally {
    await context.close();
  }
});

test("avatar artwork loads and repeated activation renews its speech", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".home-hero-brand p")).toHaveText(site.subtitle);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    site.doro,
  );
  await expect(page.locator(".github-pill")).toHaveAttribute(
    "href",
    site.githubUrl,
  );
  await expect(page.locator(".hero-avatar-portrait")).toHaveAttribute(
    "src",
    site.avatar,
  );
  await expect(page.locator(".hero-avatar-frame")).toHaveAttribute(
    "src",
    homeContent.avatarFrameImage,
  );
  for (const image of await page.locator(".hero-avatar-artwork img").all()) {
    await expect
      .poll(() =>
        image.evaluate((element: HTMLImageElement) => element.naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  const avatar = page.locator(".hero-avatar");
  const speech = page.locator("[data-avatar-speech]");
  await avatar.click();
  await expect(speech).toHaveClass(/is-speaking/);
  await expect(speech).toHaveText(homeContent.avatarSpeech);
  // Cross the first activation's expiry while the renewed bubble is still open.
  await page.waitForTimeout(900);
  await avatar.click();
  await page.waitForTimeout(1000);
  await expect(speech).toHaveClass(/is-speaking/);
  await expect(speech).not.toHaveClass(/is-speaking/);
});

test("desktop module layout keeps its portrait and working destinations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Space");
  await expect(page.getByRole("region", { name: "首页模块" })).toBeInViewport();
  const positions = await page.evaluate(() => {
    const box = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Missing ${selector}`);
      return element.getBoundingClientRect();
    };
    return {
      portrait: box(".home-portrait"),
      quote: box(".home-quote-widget"),
      profile: box(".home-profile-widget"),
      clock: box(".home-clock-widget"),
      calendar: box(".home-calendar-widget"),
    };
  });
  expect(positions.portrait.width).toBeLessThan(positions.portrait.height);
  expect(positions.portrait.right).toBeLessThan(positions.profile.left);
  expect(positions.quote.bottom).toBeLessThan(positions.profile.top);
  expect(positions.clock.left).toBeGreaterThan(positions.profile.right);
  expect(positions.calendar.left).toBeGreaterThan(positions.profile.right);
  await page
    .getByRole("navigation", { name: "快捷入口" })
    .getByRole("link", { name: "BLOG" })
    .click();
  await expect(page).toHaveURL(/\/blog\/$/);
});
