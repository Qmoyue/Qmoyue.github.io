import { preview } from "astro";

// Playwright owns this foreground server so an interactive CLI preview can run
// alongside it without sharing the CLI's preview lock.
const url = new URL(process.argv[2]);
const server = await preview({
  server: { host: url.hostname, port: Number(url.port) },
  vite: { preview: { strictPort: true } },
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => server.stop());
}
