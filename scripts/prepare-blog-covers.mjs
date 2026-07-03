import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const coverDir = path.join(root, "src", "assets", "blog-covers");
const supported = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const entries = await readdir(coverDir, { withFileTypes: true }).catch(() => []);
const covers = entries.filter((entry) => entry.isFile() && supported.has(path.extname(entry.name).toLowerCase()));

console.log(`Blog cover pool ready: ${covers.length} image(s) in src/assets/blog-covers.`);
