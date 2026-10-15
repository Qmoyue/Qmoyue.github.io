import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4321";
const previewCommand = `node scripts/preview-test-site.mjs ${baseURL}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  workers: process.env.CI ? 1 : undefined,
  expect: {
    timeout: 5_000,
  },
  webServer: {
    command:
      process.env.PLAYWRIGHT_USE_BUILT_SITE === "1"
        ? previewCommand
        : `pnpm run build && ${previewCommand}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ASTRO_TELEMETRY_DISABLED: "1",
    },
  },
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
