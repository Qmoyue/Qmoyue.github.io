import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4321";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  webServer: {
    command: "pnpm run build && pnpm run preview --host 127.0.0.1 --port 4321",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ASTRO_TELEMETRY_DISABLED: "1",
      ASTRO_PREVIEW_BACKGROUND: "0",
    },
  },
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
