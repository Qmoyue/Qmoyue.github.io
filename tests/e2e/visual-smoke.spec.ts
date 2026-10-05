import { expect, test } from "@playwright/test";

test.describe("visual smoke", () => {
  test("home guitar overlaps avatar, opens speech bubble, and terminal rows keep even rhythm", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const metrics = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing ${selector}`);
        const box = element.getBoundingClientRect();
        return {
          left: box.left,
          top: box.top,
          right: box.right,
          bottom: box.bottom,
          width: box.width,
          height: box.height,
        };
      };

      const rows = Array.from(
        document.querySelectorAll(
          ".terminal-path, .terminal-screen > .terminal-line:nth-child(2), .terminal-output, .terminal-links",
        ),
      ).map((element) => {
        const box = element.getBoundingClientRect();
        return box.top + box.height / 2;
      });

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
        avatar: rect(".hero-avatar > img"),
        guitar: rect(".avatar-guitar"),
        rows,
      };
    });

    expect(metrics.subtitle).toBe("personal blog / telepathic waves");
    expect(metrics.favicon).toBe("/images/doro.png");
    expect(metrics.navDoroCount).toBe(0);
    expect(metrics.githubHref).toBe(
      "https://github.com/Qmoyue/Qmoyue.github.io",
    );
    expect(metrics.guitar.left).toBeLessThan(metrics.avatar.right);
    expect(metrics.guitar.right).toBeGreaterThan(metrics.avatar.right - 8);
    expect(metrics.guitar.bottom).toBeGreaterThan(metrics.avatar.bottom - 8);

    const gaps = metrics.rows
      .slice(1)
      .map((top, index) => top - metrics.rows[index]);
    const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    for (const gap of gaps) {
      expect(Math.abs(gap - averageGap)).toBeLessThan(18);
    }

    await page.locator("[data-avatar-guitar]").click();
    await expect(page.locator("[data-avatar-speech]")).toHaveClass(
      /is-speaking/,
    );
    await expect(page.locator("[data-avatar-speech]")).toHaveText(
      "Bobobobocchi desu!",
    );
    await expect(page.locator(".avatar-note")).toHaveCount(0);
  });
  test("home second screen follows latest-post bento layout", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.keyboard.press("Space");
    await expect(
      page.getByRole("region", { name: "首页模块" }),
    ).toBeInViewport();

    const metrics = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing ${selector}`);
        const box = element.getBoundingClientRect();
        return {
          left: box.left,
          top: box.top,
          right: box.right,
          bottom: box.bottom,
          height: box.height,
          width: box.width,
        };
      };

      return {
        dashboard: rect(".home-second-dashboard"),
        latest: rect(".home-latest-panel"),
        latestImage: rect(".home-latest-image"),
        latestImg: rect(".home-latest-image img"),
        latestCopy: rect(".home-latest-copy"),
        banner: rect(".home-flower-banner"),
        profile: rect(".home-profile-widget"),
        profileAvatar: rect(".home-profile-widget > img"),
        clock: rect(".home-clock-widget"),
        calendar: rect(".home-calendar-widget"),
        quote: rect(".home-quote-widget"),
        flower: document
          .querySelector(".home-flower-banner img")
          ?.getAttribute("src"),
        cardCount: document.querySelectorAll(
          ".home-second-dashboard > .home-bento-card",
        ).length,
        latestHref:
          document.querySelector(".home-latest-card")?.getAttribute("href") ??
          "",
        removedCount: document.querySelectorAll(
          ".home-side-card, .home-action-row, .home-feature-widget, .home-music-widget",
        ).length,
        calendarDays: document.querySelectorAll(
          ".home-calendar-days span:not(.is-blank)",
        ).length,
        clockText:
          document.querySelector("[data-clock-time]")?.textContent ?? "",
        quoteText: Array.from(
          document.querySelectorAll(".home-quote-widget p"),
        ).map((node) => node.textContent?.trim()),
        profileLines: Array.from(
          document.querySelectorAll(".home-profile-widget p span"),
        ).map((node) => node.textContent?.trim()),
      };
    });

    expect(metrics.flower).toBe("/images/flower.jpg");
    expect(metrics.cardCount).toBe(6);
    expect(metrics.latestHref).toMatch(/^\/blog\//);
    expect(metrics.removedCount).toBe(0);
    expect(metrics.calendarDays).toBeGreaterThanOrEqual(28);
    expect(metrics.clockText).toMatch(/^\d{2}:\d{2}$/);
    expect(metrics.profileLines).toEqual(["I'm Moyue", "Nice to meet you!"]);
    expect(metrics.quoteText).toEqual([
      "「梦是现实的延续，",
      "现实是梦的终结。」",
    ]);
    expect(metrics.dashboard.height).toBeLessThan(610);
    expect(metrics.latest.right).toBeLessThan(metrics.profile.left);
    expect(metrics.latest.width).toBeGreaterThan(400);
    expect(metrics.latest.height).toBeGreaterThan(500);
    expect(metrics.profileAvatar.width).toBeGreaterThanOrEqual(112);
    expect(metrics.latestImg.top).toBeGreaterThanOrEqual(
      metrics.latestImage.top - 1,
    );
    expect(metrics.latestImg.bottom).toBeLessThanOrEqual(
      metrics.latestImage.bottom + 1,
    );
    expect(metrics.latestImg.height).toBeGreaterThan(
      metrics.latestImage.height - 2,
    );
    expect(metrics.latestCopy.top).toBeGreaterThan(
      metrics.latestImage.top + metrics.latestImage.height * 0.45,
    );
    expect(metrics.banner.bottom).toBeLessThan(metrics.profile.top);
    expect(metrics.clock.left).toBeGreaterThan(metrics.profile.right);
    expect(metrics.calendar.left).toBeGreaterThan(metrics.profile.right);
    expect(Math.abs(metrics.clock.left - metrics.calendar.left)).toBeLessThan(
      2,
    );
    expect(
      Math.abs(metrics.calendar.width - metrics.calendar.height),
    ).toBeLessThan(2);
    expect(metrics.quote.top).toBeGreaterThan(metrics.profile.bottom);
    expect(metrics.quote.left).toBeGreaterThan(metrics.latest.right);
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

  test("section intros use script labels", async ({ page }) => {
    const targets = [
      ["/blog/", "my-blog"],
      ["/project/", "my-projects"],
      ["/friends/", "my-friends"],
    ] as const;

    for (const [url, label] of targets) {
      await page.goto(url);
      const intro = page.locator(".page-script-lead span");
      await expect(intro).toHaveText(label);
      const style = await intro.evaluate((element) => {
        const computed = getComputedStyle(element);
        return {
          color: computed.color,
          backgroundImage: computed.backgroundImage,
          fontFamily: computed.fontFamily,
        };
      });
      expect(style.color).toBe("rgba(0, 0, 0, 0)");
      expect(style.backgroundImage).toContain("gradient");
      expect(style.fontFamily).toMatch(/Script|Brush|cursive/i);
    }
  });
  test("blog cards use distributed covers and photo-style markers", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/blog/");

    const details = await page.evaluate(() => {
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>("[data-note-card]"),
      );
      const images = cards
        .map((card) => {
          const image =
            card.querySelector<HTMLImageElement>(".photo-frame img");
          return image?.getAttribute("src") || image?.currentSrc || "";
        })
        .filter(Boolean);
      const dot = document.querySelector<HTMLElement>(".timeline-date i");
      const dotStyle = dot ? getComputedStyle(dot) : null;
      const frame = document.querySelector<HTMLElement>(".photo-frame");
      const frameStyle = frame ? getComputedStyle(frame) : null;
      const tape = document.querySelector<HTMLElement>(".photo-tape");
      const tapeBox = tape?.getBoundingClientRect();
      const image =
        document.querySelector<HTMLImageElement>(".photo-frame img");
      const imageStyle = image ? getComputedStyle(image) : null;

      return {
        total: cards.length,
        uniqueCovers: new Set(images).size,
        dotBorder: dotStyle?.borderWidth ?? "",
        dotBackground: dotStyle?.backgroundImage ?? "",
        dotShadow: dotStyle?.boxShadow ?? "",
        framePaddingTop: frameStyle ? parseFloat(frameStyle.paddingTop) : 0,
        frameShadow: frameStyle?.boxShadow ?? "",
        tapeHeight: tapeBox?.height ?? 0,
        imageFit: imageStyle?.objectFit ?? "",
      };
    });

    expect(details.total).toBeGreaterThan(10);
    expect(details.uniqueCovers).toBeGreaterThanOrEqual(
      Math.min(details.total, 14),
    );
    expect(details.dotBorder).toBe("0px");
    expect(details.dotBackground).toContain("gradient");
    expect(details.dotBackground).not.toContain("radial-gradient");
    expect(details.dotShadow).not.toBe("none");
    expect(details.framePaddingTop).toBeGreaterThanOrEqual(18);
    expect(details.frameShadow).not.toBe("none");
    expect(details.tapeHeight).toBeGreaterThan(30);
    expect(details.imageFit).toBe("cover");
  });

  test("article page renders its real section links without an intro cover", async ({
    page,
  }) => {
    await page.goto("/blog/web/");
    const toc = page.getByRole("navigation", { name: "文章目录" });
    await expect(toc.getByRole("link", { name: /Path/ })).toBeVisible();
    await expect(page.locator(".article-cover-frame")).toHaveCount(0);
  });

  test("profile, project, and friend content follows requested data", async ({
    page,
  }) => {
    await page.goto("/me/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Hi,I'm Moyue.",
    );
    await expect(
      page.getByText("欢迎来到我的博客", { exact: false }),
    ).toBeVisible();
    await expect(page.getByText("𝓜𝓸𝔂𝓾𝓮")).toBeVisible();
    await expect(
      page.getByText("二次元宅/蒟蒻CTFer，只会点vibeslop，努力成为大手子ing"),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "技术栈" })).toBeVisible();
    await expect(
      page.getByText("[该用户很懒，什么也没有留下(T^T)]"),
    ).toBeVisible();

    await page.goto("/project/");
    await expect(page.getByText("当前没有公开项目")).toBeAttached();

    await page.goto("/friends/");
    const list = page.getByRole("region", { name: "友链列表" });
    const names = await list
      .getByRole("heading", { level: 2 })
      .allTextContents();
    expect(names).toEqual([
      "Nick Chen",
      "yuoooka",
      "wuye",
      "jsnow",
      "snowcat",
      "duxing",
      "Maxton‘s Blog",
    ]);
    await expect(list.getByRole("link", { name: /Nick Chen/ })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });
  test("site footer exposes the configured attribution", async ({ page }) => {
    await page.goto("/blog/");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toContainText("Moyue / moyue's blog");
    await expect(footer).toContainText("学习笔记、漏洞研究，还有一点点电波。");
  });
});
