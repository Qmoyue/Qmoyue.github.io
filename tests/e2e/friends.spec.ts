import { expect, test } from "@playwright/test";

test("Friends introduction fits narrow and wide screens before the carousel appears", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/friends/");

    const intro = page.locator(".friends-intro");
    await expect(intro.getByRole("heading", { name: "Friends" })).toHaveText(
      "Friends",
    );
    await expect(intro.getByText("my-friends")).toHaveText("my-friends");

    for (const text of [intro.locator("h1"), intro.locator("p span")]) {
      const box = await text.boundingBox();
      if (!box) throw new Error("Friends introduction text is missing");
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }

    await expect
      .poll(() =>
        intro.evaluate((element) => Number(getComputedStyle(element).opacity)),
      )
      .toBeLessThan(0.05);
    await expect(
      page.getByRole("region", { name: "友链轮播" }).getByRole("heading", {
        name: "Nick Chen",
      }),
    ).toBeVisible();
  }
});

test("friend portraits load and carousel controls reach each friend", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/friends/");

  await expect(page.getByRole("slider", { name: "页面滚动进度" })).toHaveCount(
    0,
  );

  const carousel = page.getByRole("region", { name: "友链轮播" });
  const nick = carousel.getByRole("link", { name: /访问 Nick Chen 的博客/ });
  await expect(nick).toHaveAttribute("href", "https://www.nickchen.top/");
  await expect(nick).toHaveAttribute("target", "_blank");
  await expect(nick).toHaveAttribute("rel", "noopener noreferrer");
  await expect
    .poll(() =>
      nick
        .locator(".portrait-face img")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);

  await carousel.getByRole("button", { name: "查看下一位友链：wuye" }).click();
  await expect(carousel.getByRole("heading", { name: "wuye" })).toBeVisible();
  await carousel.getByRole("button", { name: "下一位：jsnow" }).click();
  await carousel.getByRole("button", { name: "下一位：yuoooka" }).click();
  await expect(
    carousel.getByRole("heading", { name: "yuoooka" }),
  ).toBeVisible();
  await expect(carousel.locator(".friend-signature")).toHaveCount(0);
  await expect(carousel.getByText("博客暂时无法访问")).toHaveCount(0);
  await expect(
    carousel.getByRole("link", { name: /访问 yuoooka 的博客/ }),
  ).toHaveCount(0);

  await carousel.getByRole("button", { name: "上一位：jsnow" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(carousel.getByRole("heading", { name: "jsnow" })).toBeVisible();
});

test("hover bubble stays on screen and arrows sit outside side portraits", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/friends/");
    const carousel = page.getByRole("region", { name: "友链轮播" });
    await carousel.getByRole("link", { name: /访问 Nick Chen 的博客/ }).hover();

    const bubble = carousel.getByText("看看别的师傅都做了什么吧~");
    await expect
      .poll(() =>
        bubble.evaluate((element) => Number(getComputedStyle(element).opacity)),
      )
      .toBeGreaterThan(0.95);
    const bubbleBox = await bubble.boundingBox();
    if (!bubbleBox) throw new Error("Friend bubble is missing");
    expect(bubbleBox.x).toBeGreaterThanOrEqual(0);
    expect(bubbleBox.y).toBeGreaterThanOrEqual(0);
    expect(bubbleBox.x + bubbleBox.width).toBeLessThanOrEqual(viewport.width);
    expect(bubbleBox.y + bubbleBox.height).toBeLessThanOrEqual(viewport.height);

    const previousArrow = await carousel
      .getByRole("button", { name: /上一位：/ })
      .boundingBox();
    const nextArrow = await carousel
      .getByRole("button", { name: /下一位：/ })
      .boundingBox();
    if (!previousArrow || !nextArrow)
      throw new Error("Friend carousel arrows are missing");
    expect(previousArrow.x).toBeGreaterThanOrEqual(0);
    expect(nextArrow.x + nextArrow.width).toBeLessThanOrEqual(viewport.width);

    if (viewport.width > 650) {
      const previousPortrait = await carousel
        .getByRole("button", { name: /查看上一位友链：/ })
        .boundingBox();
      const nextPortrait = await carousel
        .getByRole("button", { name: /查看下一位友链：/ })
        .boundingBox();
      if (!previousPortrait || !nextPortrait)
        throw new Error("Side friend portraits are missing");
      expect(previousArrow.x + previousArrow.width).toBeLessThan(
        previousPortrait.x,
      );
      expect(nextArrow.x).toBeGreaterThan(nextPortrait.x + nextPortrait.width);
    }
  }
});
