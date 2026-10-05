/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["tests/{unit,component,contracts}/**/*.test.ts"],
  },
});
