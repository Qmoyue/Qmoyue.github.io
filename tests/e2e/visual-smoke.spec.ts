import { expect, test } from "@playwright/test";

test.describe("visual smoke", () => {
  test("home avatar and frame open speech bubble", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const metrics = await page.evaluate(() => {
      return {
        subtitle:
          document.querySelector(".home-hero-brand p")?.textContent?.trim() ??
          "",
        favicon:
          document
            .querySelector<HTMLLinkElement>('link[rel="icon"]')
            ?.getAttribute("href") ?? "",
        navDoroCount: document.querySelectorAll(".nav-trigger-doro").length,
        githubHref:
          document.querySelector<HTMLAnchorElement>(".github-pill")?.href ?? "",
      };
    });

    expect(metrics.subtitle).toBe("personal blog / telepathic waves");
    expect(metrics.favicon).toBe("/images/doro.png");
    expect(metrics.navDoroCount).toBe(0);
    expect(metrics.githubHref).toBe(
      "https://github.com/Qmoyue/Qmoyue.github.io",
    );
    await expect(page.locator(".hero-avatar-portrait")).toHaveAttribute(
      "src",
      "/images/avatar.jpg",
    );
    await expect(page.locator(".hero-avatar-frame")).toHaveAttribute(
      "src",
      "/images/avatar-frame-guitar.png",
    );
    for (const image of await page.locator(".hero-avatar-artwork img").all()) {
      await expect
        .poll(() =>
          image.evaluate((element: HTMLImageElement) => element.naturalWidth),
        )
        .toBeGreaterThan(0);
    }

    await page.locator(".hero-avatar").click();
    await expect(page.locator("[data-avatar-speech]")).toHaveClass(
      /is-speaking/,
    );
    await expect(page.locator("[data-avatar-speech]")).toHaveText(
      "Bobobobocchi desu!",
    );
    await page.waitForTimeout(900);
    await page.locator(".hero-avatar").click();
    await page.waitForTimeout(1000);
    await expect(page.locator("[data-avatar-speech]")).toHaveClass(
      /is-speaking/,
    );
    await expect(page.locator("[data-avatar-speech]")).not.toHaveClass(
      /is-speaking/,
      { timeout: 1200 },
    );
    await expect(page.locator(".avatar-note")).toHaveCount(0);
  });
  test("home second screen shows the portrait and four working destinations", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.keyboard.press("Space");
    await expect(
      page.getByRole("region", { name: "首页模块" }),
    ).toBeInViewport();

    const portrait = page.locator(".home-portrait img");
    await expect(portrait).toHaveAttribute("src", "/images/flower.jpg");
    await expect(portrait).toHaveAttribute("alt", "花园里捧着花的人像");
    const links = page.getByRole("navigation", { name: "快捷入口" });
    await expect(links.getByRole("link", { name: "BLOG" })).toHaveAttribute(
      "href",
      "/blog/",
    );
    await expect(links.getByRole("link", { name: "PROJECT" })).toHaveAttribute(
      "href",
      "/project/",
    );
    await expect(links.getByRole("link", { name: "FRIENDS" })).toHaveAttribute(
      "href",
      "/friends/",
    );
    await expect(links.getByRole("link", { name: "ME" })).toHaveAttribute(
      "href",
      "/me/",
    );

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
    await links.getByRole("link", { name: "BLOG" }).click();
    await expect(page).toHaveURL(/\/blog\/$/);
  });

  test("falling tags appear on the second panel and clear after their visit", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.keyboard.press("Space");
    await expect(
      page.getByRole("region", { name: "首页模块" }),
    ).toBeInViewport();
    const tags = page.locator("[data-falling-stage] .falling-item");
    await expect.poll(() => tags.count()).toBeGreaterThanOrEqual(8);
    expect(await tags.count()).toBeLessThanOrEqual(10);
    await expect(tags).toHaveCount(0, { timeout: 12_000 });
  });

  test("blog search commits only on Enter", async ({ page }) => {
    await page.goto("/blog/");

    const search = page.getByRole("searchbox", { name: "关键词" });
    await expect(search).toHaveAttribute("placeholder", "请输入关键词喵~");
    await expect(search).toBeEditable();
    const total = await page.locator("[data-note-card]").count();
    await search.fill("CTF");
    await expect(page.locator("[data-note-card]:visible")).toHaveCount(total);
    await expect(page.locator("[data-search-count]")).toContainText(
      "按 Enter 搜索",
    );

    await search.press("Enter");
    await expect(page.locator("[data-search-count]")).toContainText(
      /找到 \d+ \/ \d+ 篇文章/,
    );
    const matches = await page.locator("[data-note-card]:visible").count();
    expect(matches).toBeGreaterThan(0);
    expect(matches).toBeLessThan(total);

    await search.fill("a-term-that-is-not-in-any-article");
    await search.press("Enter");
    await expect(page.locator("[data-note-card]:visible")).toHaveCount(0);
    await expect(page.locator("[data-blog-empty]")).toBeVisible();

    await search.fill("");
    await search.press("Enter");
    await expect(page.locator("[data-note-card]:visible")).toHaveCount(total);
    await expect(page.locator("[data-blog-empty]")).toBeHidden();
  });

  test("archive articles remain available without JavaScript", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto("/blog/");
      await expect(
        page.getByRole("searchbox", { name: "关键词" }),
      ).toHaveAttribute("readonly", "");
      await expect(page.locator("[data-note-card]").first()).toBeVisible();
      await expect(page.locator("[data-note-card] a").first()).toHaveAttribute(
        "href",
        /\/blog\//,
      );
    } finally {
      await context.close();
    }
  });

  test("archive and project intros identify their pages", async ({ page }) => {
    const targets = [
      ["/blog/", "Blog", "my-blog"],
      ["/project/", "Project", "my-projects"],
    ] as const;

    for (const [url, title, label] of targets) {
      await page.goto(url);
      await expect(
        page.getByRole("heading", { level: 1, name: title }),
      ).toBeVisible();
      await expect(page.locator(".page-script-lead span")).toHaveText(label);
    }
  });
  test("blog cards display distinct covers pinned to wooden boards", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/blog/");

    const cards = page.locator("[data-note-card]");
    const images = await cards
      .locator(".note-cover img")
      .evaluateAll((items) =>
        items.map((item) => (item as HTMLImageElement).src),
      );
    expect(images.length).toBeGreaterThan(10);
    expect(new Set(images).size).toBeGreaterThanOrEqual(
      Math.min(images.length, 14),
    );

    const first = cards.first();
    await expect(first.locator(".note-pin")).toBeVisible();
    await expect(first.locator(".timeline-marker")).toBeVisible();
    const cover = first.locator(".note-cover img");
    await expect(cover).toBeVisible();
    const size = await cover.evaluate((image: HTMLImageElement) => ({
      natural: image.naturalWidth,
      rendered: image.getBoundingClientRect().width,
    }));
    expect(size.natural).toBeGreaterThanOrEqual(size.rendered * 1.5);
  });

  test("article page renders its real section links without an intro cover", async ({
    page,
  }) => {
    await page.goto("/blog/web/");
    const toc = page.getByRole("navigation", { name: "文章目录" });
    await expect(toc.getByRole("link", { name: /Path/ })).toBeVisible();
    await expect(page.locator(".article-cover-frame")).toHaveCount(0);
  });

  test("profile and project pages show the published content", async ({
    page,
  }) => {
    await page.goto("/me/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Hi,I'm Moyue.",
    );
    await expect(
      page.getByText("不知道写些什么好，那先空着吧（"),
    ).toBeVisible();
    await expect(page.getByText("TYPE-MOON")).toBeVisible();
    await expect(page.getByText("𝓜𝓸𝔂𝓾𝓮")).toBeVisible();
    await expect(
      page.getByText("二次元宅/蒟蒻CTFer，只会点vibeslop，努力成为大手子ing"),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "技术栈" })).toBeVisible();
    await expect(
      page.getByText("[该用户很懒，什么也没有留下(T^T)]"),
    ).toBeVisible();

    await page.goto("/project/");
    await expect(
      page.getByRole("link", { name: /JYFF Agent/ }),
    ).toHaveAttribute(
      "href",
      "https://github.com/JNSEC-OpenSource-Community/jyff-agent",
    );
  });
  test("site footer exposes the configured attribution", async ({ page }) => {
    await page.goto("/blog/");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toContainText("Moyue / moyue's blog");
    await expect(footer).toContainText("学习笔记 & 漏洞研究");
  });
});
