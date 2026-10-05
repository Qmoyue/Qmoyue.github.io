import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const outputDir = resolve("tests/visual/baseline");

const viewports = [
  {
    name: "desktop",
    width: 1440,
    height: 900,
    avatarAt: 3450,
    terminalAt: 4800,
  },
  { name: "mobile", width: 390, height: 844, avatarAt: 3100, terminalAt: 4000 },
] as const;

function baseURLFor(testInfo: TestInfo): string {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL)
    throw new Error("Playwright baseURL is required for visual capture");
  return baseURL;
}

async function waitUntilPageTime(page: Page, targetMs: number): Promise<void> {
  const elapsedMs = await page.evaluate(() => performance.now());
  await page.waitForTimeout(Math.max(0, targetMs - elapsedMs));
}

for (const viewport of viewports) {
  test(`${viewport.name} real-motion entrance and second panel`, async ({
    browser,
  }, testInfo) => {
    await mkdir(outputDir, { recursive: true });
    const context = await browser.newContext({
      baseURL: baseURLFor(testInfo),
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
      recordVideo: {
        dir: testInfo.outputDir,
        size: { width: viewport.width, height: viewport.height },
      },
    });
    const page = await context.newPage();
    const video = page.video();
    if (!video) throw new Error("Playwright did not start entrance recording");

    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const stages = [
        { name: "brand", atMs: 800 },
        { name: "avatar", atMs: viewport.avatarAt },
        { name: "terminal", atMs: viewport.terminalAt },
        { name: "terminal-content", atMs: 5700 },
        { name: "cue", atMs: 6400 },
        { name: "settled", atMs: 7800 },
      ];

      for (const stage of stages) {
        await waitUntilPageTime(page, stage.atMs);
        await page.screenshot({
          path: resolve(outputDir, `${viewport.name}-${stage.name}.jpg`),
          type: "jpeg",
          quality: 90,
        });
      }

      await page.keyboard.press("Space");
      await expect
        .poll(() => page.locator("[data-falling-stage] .falling-item").count())
        .toBeGreaterThanOrEqual(8);
      await expect
        .poll(() =>
          page.locator("[data-falling-stage] .falling-item").evaluateAll(
            (chips) =>
              chips.filter((chip) => {
                const box = chip.getBoundingClientRect();
                return (
                  box.bottom > 0 &&
                  box.top < window.innerHeight &&
                  Number(getComputedStyle(chip).opacity) > 0.5
                );
              }).length,
          ),
        )
        .toBeGreaterThanOrEqual(3);
      await page.screenshot({
        path: resolve(outputDir, `${viewport.name}-second-panel.jpg`),
        type: "jpeg",
        quality: 90,
      });
    } finally {
      await context.close();
    }

    await video.saveAs(resolve(outputDir, `${viewport.name}-entrance.webm`));
  });

  test(`${viewport.name} without JavaScript`, async ({ browser }, testInfo) => {
    await mkdir(outputDir, { recursive: true });
    const context = await browser.newContext({
      baseURL: baseURLFor(testInfo),
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      javaScriptEnabled: false,
      reducedMotion: "no-preference",
    });

    try {
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(7800);
      await page.screenshot({
        path: resolve(outputDir, `${viewport.name}-no-js.jpg`),
        type: "jpeg",
        quality: 90,
      });
    } finally {
      await context.close();
    }
  });

  test(`${viewport.name} reduced motion`, async ({ browser }, testInfo) => {
    await mkdir(outputDir, { recursive: true });
    const context = await browser.newContext({
      baseURL: baseURLFor(testInfo),
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });

    try {
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.locator("[data-terminal-output]")).toHaveText(
        "flag{welcome_to_moyues_blog}",
      );
      await page.screenshot({
        path: resolve(outputDir, `${viewport.name}-reduced-motion.jpg`),
        type: "jpeg",
        quality: 90,
      });
    } finally {
      await context.close();
    }
  });
}
