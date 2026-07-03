import { expect, test } from "@playwright/test";

test.describe("visual smoke", () => {
  test("home guitar overlaps avatar, opens speech bubble, and terminal rows keep even rhythm", async ({ page }) => {
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
        document.querySelectorAll(".terminal-path, .terminal-screen > .terminal-line:nth-child(2), .terminal-output, .terminal-links"),
      ).map((element) => {
        const box = element.getBoundingClientRect();
        return box.top + box.height / 2;
      });

      return {
        subtitle: document.querySelector(".home-hero-brand p")?.textContent?.trim() ?? "",
        favicon: document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.getAttribute("href") ?? "",
        navDoroCount: document.querySelectorAll(".nav-trigger-doro").length,
        githubHref: document.querySelector<HTMLAnchorElement>(".github-pill")?.href ?? "",
        avatar: rect(".hero-avatar > img"),
        guitar: rect(".avatar-guitar"),
        rows,
      };
    });

    expect(metrics.subtitle).toBe("personal blog / telepathic waves");
    expect(metrics.favicon).toBe("/images/doro.png");
    expect(metrics.navDoroCount).toBe(0);
    expect(metrics.githubHref).toBe("https://github.com/Qmoyue/Qmoyue.github.io");
    expect(metrics.guitar.left).toBeLessThan(metrics.avatar.right);
    expect(metrics.guitar.right).toBeGreaterThan(metrics.avatar.right - 8);
    expect(metrics.guitar.bottom).toBeGreaterThan(metrics.avatar.bottom - 8);

    const gaps = metrics.rows.slice(1).map((top, index) => top - metrics.rows[index]);
    const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    for (const gap of gaps) {
      expect(Math.abs(gap - averageGap)).toBeLessThan(18);
    }

    await page.locator("[data-avatar-guitar]").click();
    await expect(page.locator("[data-avatar-speech]")).toHaveClass(/is-speaking/);
    await expect(page.locator("[data-avatar-speech]")).toHaveText("Bobobobocchi desu!");
    await expect(page.locator(".avatar-note")).toHaveCount(0);
  });
  test("home second screen follows latest-post bento layout", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("home:set-panel", { detail: "second" })));
    await page.waitForTimeout(500);

    const metrics = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing ${selector}`);
        const box = element.getBoundingClientRect();
        return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, height: box.height, width: box.width };
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
        flower: document.querySelector(".home-flower-banner img")?.getAttribute("src"),
        cardCount: document.querySelectorAll(".home-second-dashboard > .home-bento-card").length,
        latestHref: document.querySelector(".home-latest-card")?.getAttribute("href") ?? "",
        removedCount: document.querySelectorAll(".home-side-card, .home-action-row, .home-feature-widget, .home-music-widget").length,
        calendarDays: document.querySelectorAll(".home-calendar-days span:not(.is-blank)").length,
        clockText: document.querySelector("[data-clock-time]")?.textContent ?? "",
        quoteText: Array.from(document.querySelectorAll(".home-quote-widget p")).map((node) => node.textContent?.trim()),
        profileLines: Array.from(document.querySelectorAll(".home-profile-widget p span")).map((node) => node.textContent?.trim()),
      };
    });

    expect(metrics.flower).toBe("/images/flower.jpg");
    expect(metrics.cardCount).toBe(6);
    expect(metrics.latestHref).toMatch(/^\/blog\//);
    expect(metrics.removedCount).toBe(0);
    expect(metrics.calendarDays).toBeGreaterThanOrEqual(28);
    expect(metrics.clockText).toMatch(/^\d{2}:\d{2}$/);
    expect(metrics.profileLines).toEqual(["I'm Moyue", "Nice to meet you!"]);
    expect(metrics.quoteText).toEqual(["「梦是现实的延续，", "现实是梦的终结。」"]);
    expect(metrics.dashboard.height).toBeLessThan(610);
    expect(metrics.latest.right).toBeLessThan(metrics.profile.left);
    expect(metrics.latest.width).toBeGreaterThan(400);
    expect(metrics.latest.height).toBeGreaterThan(500);
    expect(metrics.profileAvatar.width).toBeGreaterThanOrEqual(112);
    expect(metrics.latestImg.top).toBeGreaterThanOrEqual(metrics.latestImage.top - 1);
    expect(metrics.latestImg.bottom).toBeLessThanOrEqual(metrics.latestImage.bottom + 1);
    expect(metrics.latestImg.height).toBeGreaterThan(metrics.latestImage.height - 2);
    expect(metrics.latestCopy.top).toBeGreaterThan(metrics.latestImage.top + metrics.latestImage.height * 0.45);
    expect(metrics.banner.bottom).toBeLessThan(metrics.profile.top);
    expect(metrics.clock.left).toBeGreaterThan(metrics.profile.right);
    expect(metrics.calendar.left).toBeGreaterThan(metrics.profile.right);
    expect(Math.abs(metrics.clock.left - metrics.calendar.left)).toBeLessThan(2);
    expect(Math.abs(metrics.calendar.width - metrics.calendar.height)).toBeLessThan(2);
    expect(metrics.quote.top).toBeGreaterThan(metrics.profile.bottom);
    expect(metrics.quote.left).toBeGreaterThan(metrics.latest.right);
  });

  test("falling tags use optimized physics and fade from the bottom", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("home:set-panel", { detail: "second" })));
    await page.waitForTimeout(2600);

    const active = await page.evaluate(() => {
      const stage = document.querySelector(".falling-stage");
      const items = Array.from(document.querySelectorAll<HTMLElement>(".falling-item"));
      return {
        stageClass: stage?.className ?? "",
        count: items.length,
        cssFloatingCount: document.querySelectorAll(".is-css-falling").length,
        transformed: items.filter((item) => item.style.transform.includes("translate3d")).length,
        minTop: Math.min(...items.map((item) => item.getBoundingClientRect().top)),
        doroCount: document.querySelectorAll(".falling-item.is-doro").length,
        texts: items.map((item) => item.textContent ?? ""),
      };
    });

    expect(active.stageClass).toContain("is-physics-running");
    expect(active.cssFloatingCount).toBe(0);
    expect(active.count).toBeGreaterThanOrEqual(8);
    expect(active.count).toBeLessThanOrEqual(10);
    expect(active.doroCount).toBe(0);
    expect(active.texts.some((text) => text.includes("你指尖跃动的电光"))).toBe(false);
    expect(active.transformed).toBe(active.count);
    expect(active.minTop).toBeLessThan(900);

    await page.waitForTimeout(3600);

    const fading = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll<HTMLElement>(".falling-item"));
      const faded = items.filter((item) => item.classList.contains("is-physics-fading"));
      const visible = items.filter((item) => !item.classList.contains("is-physics-fading"));
      const averageTop = (list: HTMLElement[]) => list.reduce((sum, item) => sum + item.getBoundingClientRect().top, 0) / Math.max(1, list.length);
      return {
        fadedCount: faded.length,
        fadedTop: averageTop(faded),
        visibleTop: averageTop(visible),
      };
    });

    expect(fading.fadedCount).toBeGreaterThan(0);
    expect(fading.fadedTop).toBeGreaterThan(fading.visibleTop);
  });

  test("blog search commits only on Enter", async ({ page }) => {
    await page.goto("/blog/");

    await expect(page.locator("[data-blog-search]")).toHaveAttribute("placeholder", "请输入关键词喵~");
    const placeholderStyle = await page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>("[data-blog-search]");
      if (!input) throw new Error("Missing search input");
      const style = getComputedStyle(input, "::placeholder");
      return { color: style.color, family: style.fontFamily };
    });
    expect(placeholderStyle.color).toBe("rgb(215, 111, 157)");
    expect(placeholderStyle.family).toMatch(/Script|Xingkai|KaiTi|行楷|cursive/i);

    const total = await page.locator("[data-note-card]").count();
    await page.locator("[data-blog-search]").fill("CTF");

    const beforeEnter = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-note-card]"));
      return {
        visible: cards.filter((card) => !card.hidden).length,
        countText: document.querySelector("[data-search-count]")?.textContent ?? "",
      };
    });

    expect(beforeEnter.visible).toBe(total);
    expect(beforeEnter.countText).toContain("按 Enter 搜索");

    await page.locator("[data-blog-search]").press("Enter");

    const afterEnter = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-note-card]"));
      const visibleCards = cards.filter((card) => !card.hidden);
      return {
        visible: visibleCards.length,
        hidden: cards.length - visibleCards.length,
        countText: document.querySelector("[data-search-count]")?.textContent ?? "",
        allMatch: visibleCards.every((card) => (card.dataset.search ?? "").toLowerCase().includes("ctf")),
      };
    });

    expect(afterEnter.visible).toBeGreaterThan(0);
    expect(afterEnter.hidden).toBeGreaterThan(0);
    expect(afterEnter.countText).toMatch(/找到 \d+ \/ \d+ 篇文章/);
    expect(afterEnter.allMatch).toBe(true);
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
  test("blog cards use distributed covers and photo-style markers", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/blog/");

    const details = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-note-card]"));
      const images = cards
        .map((card) => {
          const image = card.querySelector<HTMLImageElement>(".photo-frame img");
          return image?.getAttribute("src") || image?.currentSrc || "";
        })
        .filter(Boolean);
      const dot = document.querySelector<HTMLElement>(".timeline-date i");
      const dotStyle = dot ? getComputedStyle(dot) : null;
      const frame = document.querySelector<HTMLElement>(".photo-frame");
      const frameStyle = frame ? getComputedStyle(frame) : null;
      const tape = document.querySelector<HTMLElement>(".photo-tape");
      const tapeBox = tape?.getBoundingClientRect();
      const image = document.querySelector<HTMLImageElement>(".photo-frame img");
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
    expect(details.uniqueCovers).toBeGreaterThanOrEqual(Math.min(details.total, 14));
    expect(details.dotBorder).toBe("0px");
    expect(details.dotBackground).toContain("gradient");
    expect(details.dotBackground).not.toContain("radial-gradient");
    expect(details.dotShadow).not.toBe("none");
    expect(details.framePaddingTop).toBeGreaterThanOrEqual(18);
    expect(details.frameShadow).not.toBe("none");
    expect(details.tapeHeight).toBeGreaterThan(30);
    expect(details.imageFit).toBe("cover");
  });

  test("article pages keep code blocks and toc readable without intro cover", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/blog/web/");

    const metrics = await page.evaluate(() => {
      const pre = document.querySelector<HTMLElement>(".article-content pre");
      const code = pre?.querySelector<HTMLElement>("code");
      const toc = document.querySelector<HTMLElement>(".article-toc");
      const cover = document.querySelector(".article-cover-frame");
      if (!pre || !code || !toc) throw new Error("Missing article readability target");

      const preStyle = getComputedStyle(pre);
      const codeStyle = getComputedStyle(code);
      const tocStyle = getComputedStyle(toc);
      const tocBox = toc.getBoundingClientRect();

      return {
        preBackground: preStyle.backgroundColor,
        preColor: preStyle.color,
        preOverflowX: preStyle.overflowX,
        preZ: Number(preStyle.zIndex),
        codeBackground: codeStyle.backgroundColor,
        codeWhiteSpace: codeStyle.whiteSpace,
        tocOverflowY: tocStyle.overflowY,
        tocMaxHeight: parseFloat(tocStyle.maxHeight),
        tocHeight: tocBox.height,
        viewportHeight: window.innerHeight,
        coverCount: cover ? 1 : 0,
      };
    });

    expect(metrics.preBackground).toBe("rgb(32, 38, 44)");
    expect(metrics.preColor).toBe("rgb(219, 231, 239)");
    expect(metrics.preOverflowX).toBe("auto");
    expect(metrics.preZ).toBeGreaterThan(28);
    expect(metrics.codeBackground).toBe("rgba(0, 0, 0, 0)");
    expect(metrics.codeWhiteSpace).toBe("pre");
    expect(metrics.tocOverflowY).toBe("auto");
    expect(metrics.tocMaxHeight).toBeLessThan(metrics.viewportHeight);
    expect(metrics.tocHeight).toBeLessThan(metrics.viewportHeight);
    expect(metrics.coverCount).toBe(0);
  });

  test("profile, project, and friend content follows requested data", async ({ page }) => {
    await page.goto("/me/");
    await expect(page.locator(".readme-card h1")).toHaveText("Hi,I'm Moyue.");
    await expect(page.locator(".readme-card > p").nth(1)).toContainText("欢迎来到我的博客");
    await expect(page.locator(".readme-badge")).toHaveCount(0);
    await expect(page.locator(".profile-avatar-card .tape")).toHaveCount(0);
    await expect(page.locator(".profile-script-name")).toHaveText("𝓜𝓸𝔂𝓾𝓮");
    await expect(page.locator(".profile-intro-card")).toContainText("二次元宅/蒟蒻CTFer，只会点vibeslop，努力成为大手子ing");
    await expect(page.locator(".tech-card h2")).toHaveText("技术栈");
    await expect(page.locator(".tech-item")).toHaveCount(0);
    await expect(page.locator(".tech-empty-script")).toHaveText("[该用户很懒，什么也没有留下(T^T)]");

    await page.goto("/project/");
    await expect(page.locator(".project-card")).toHaveCount(0);

    await page.goto("/friends/");
    const names = await page.locator(".friend-card h2").allTextContents();
    expect(names).toEqual(["Nick Chen", "yuoooka", "wuye", "jsnow", "snowcat", "duxing", "Maxton‘s Blog"]);
    await expect(page.locator(".friend-card > div > p:not(.section-label)")).toHaveCount(0);
  });
  test("site footer uses the integrated anime background on regular pages", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/blog/");

    const footer = await page.evaluate(() => {
      const element = document.querySelector(".site-footer");
      if (!element) throw new Error("Missing .site-footer");
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const before = getComputedStyle(element, "::before");
      return {
        top: box.top,
        width: box.width,
        height: box.height,
        backgroundImage: style.backgroundImage,
        borderRadius: style.borderRadius,
        beforeImage: before.backgroundImage,
      };
    });

    expect(footer.width).toBeGreaterThan(1800);
    expect(footer.height).toBeGreaterThanOrEqual(260);
    expect(footer.height).toBeLessThanOrEqual(360);
    expect(footer.borderRadius).toBe("0px");
    expect(footer.backgroundImage).toContain("muzimi");
    expect(footer.beforeImage).toContain("repeating-linear-gradient");
  });

  test("decorative card dots are label-owned instead of global card-owned", async ({ page }) => {
    await page.goto("/blog/");

    const styles = await page.evaluate(() => {
      const pseudo = (selector: string, target: "::before") => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing ${selector}`);
        const style = getComputedStyle(element, target);
        return { display: style.display, content: style.content };
      };

      return {
        pageIntroBefore: pseudo(".page-intro", "::before"),
        pageIntroLabelBefore: pseudo(".page-intro .section-label", "::before"),
        searchBefore: pseudo(".blog-search-card", "::before"),
        searchLabelBefore: pseudo(".blog-search-card .section-label", "::before"),
      };
    });

    expect(styles.pageIntroBefore.display).toBe("none");
    expect(styles.searchBefore.display).toBe("none");
    expect(styles.pageIntroLabelBefore.display).not.toBe("none");
    expect(styles.searchLabelBefore.display).not.toBe("none");
  });
});







