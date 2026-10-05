// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import { satteri } from "@astrojs/markdown-satteri";
import { keyboardTables } from "./scripts/lib/hast-keyboard-tables.mjs";
import { keyboardCode } from "./scripts/lib/keyboard-code.mjs";

export default defineConfig({
  site: "https://qmoyue.github.io",
  integrations: [
    vue(),
    expressiveCode({
      plugins: [keyboardCode],
      themes: ["github-dark"],
      styleOverrides: {
        borderRadius: "18px",
        codeBackground: "#20262c",
        codeForeground: "#dbe7ef",
        codeFontSize: "0.94rem",
        codeLineHeight: "1.7",
        codePaddingBlock: "26px",
        codePaddingInline: "28px",
      },
    }),
  ],
  markdown: {
    syntaxHighlight: false,
    processor: satteri({ hastPlugins: [keyboardTables] }),
  },
  vite: { plugins: [tailwindcss()] },
});
