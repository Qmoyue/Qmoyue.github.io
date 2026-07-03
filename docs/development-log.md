# Development Log

This log tracks implementation progress, tests, and visual checks for the Certain Cloud blog.

## Rules

- Record every meaningful feature after implementation.
- Each feature entry must include changed files, test command or manual check, result, and any follow-up risk.
- Do not mark a feature complete until it has been tested at the appropriate level.
- Visual features must be checked against `docs/visual-reference-analysis.md` and the original user requirements.
- Temporary test Markdown posts are allowed for verifying blog rendering, search, article routing, word count, tags, and TOC behavior.

## Entry Format

```text
## YYYY-MM-DD HH:mm - Feature name

Changed:
- path/to/file

Tested:
- command or manual route check

Result:
- pass/fail and notes

Follow-up:
- remaining issue or none
```

## Log

No implementation features have been completed yet after this log was created.

## 2026-07-01 15:53 - Astro blog implementation pass

Changed:
- `src/content.config.ts`: uses `article/` as the Markdown blog source.
- `scripts/prepare-blog-covers.mjs`: syncs `picture/blog/` into Astro-optimized generated assets.
- `src/lib/blogCovers.ts`, `src/lib/posts.ts`, `src/lib/reading.ts`, `src/lib/dates.ts`: cover selection, legacy article compatibility, word count, and dates.
- `src/layouts/BaseLayout.astro`, `src/styles/global.css`, navigation/effect/shared components: static-first pastel anime UI shell.
- `src/pages/index.astro`, `src/pages/blog/`, `src/pages/project/`, `src/pages/friends/`, `src/pages/me/`, `src/pages/about.astro`: main site routes.

Tested:
- `npm run prepare:blog-covers`
- `npm run build`
- `npm run astro -- dev --background`
- `npm run astro -- dev status`
- HTTP checks for `/`, `/blog/`, `/blog/react2shell/`, `/project/`, `/friends/`, `/me/`
- `npm run astro -- dev logs`

Result:
- Pass. Build generated 26 static pages from the existing `article/` Markdown files.
- Blog cover sync found 18 candidate images from `picture/blog/`.
- Build optimized only the cover images actually used by rendered blog cards, preserving Astro's fast static-first model.
- Background dev server is running at `http://localhost:4321`.

Follow-up:
- Replace placeholder GitHub/project/friend URLs and profile copy with final user-provided data.
- Optional later: add Playwright screenshot regression once a browser test dependency is installed.

## 2026-07-01 22:10 - Navigation, palette, petals, and content asset correction

Changed:
- `src/styles/global.css`: removed the stray closed-nav lower bar, attached the expanded nav handle to the nav panel, softened the palette toward light blue/pink with mint accents, and made petals lighter.
- `src/components/effects/SakuraLayer.astro`: increased full-screen petal count.
- `src/assets/blog-covers/`: canonical random note cover pool copied from the temporary `picture/blog/` source.
- `src/lib/blogCovers.ts`: imports covers directly from `src/assets/blog-covers/`.
- `src/content/blog/`: normalized 20 Markdown articles from the temporary `article/` folder with title, description, pubDate, updatedDate, tags, cover, coverAlt, and draft fields.
- `src/content.config.ts`: reads blog content from `src/content/blog/`.
- `package.json`: `build` no longer depends on `picture/` cover sync.

Tested:
- `node scripts/normalize-articles.mjs`
- frontmatter spot checks for `src/content/blog/react2shell.md` and `src/content/blog/web.md`

Result:
- Pass so far. `picture/` and `article/` are no longer required as runtime/build sources after the canonical copies exist.

Follow-up:
- Run full build and restart background dev server after this correction pass.

## 2026-07-01 22:23 - Correction pass verification

Changed:
- `docs/development-log.md`: recorded final verification for the correction pass.

Tested:
- `npm run build`
- `npm run astro -- dev --background`
- `npm run astro -- dev status`
- HTTP checks for `/`, `/blog/`, and `/blog/react2shell/`
- Runtime source search for temporary `picture/` and `article/` dependencies

Result:
- Pass. The site builds from `src/content/blog/` and `src/assets/blog-covers/`; the background dev server runs at `http://localhost:4321`.
- Runtime/build code no longer depends on the temporary `picture/` or `article/` folders.

Follow-up:
- Replace placeholder personal links, project URLs, and friend links when final data is available.

## 2026-07-02 13:25 - Pastel visual correction, sakura, scroll rail, and metadata search

Changed:
- `src/styles/global.css`: added the warm scrapbook pastel visual baseline, full-screen sakura animation rules, external doro scroll thumb styling, drag-running animation, softer cards, and search count styling.
- `src/components/effects/SakuraLayer.astro`: generates stable per-petal position, size, drift, speed, opacity, and spin variables at build time.
- `src/scripts/scroll-rail.js`: tracks drag state and toggles the scroll rail running animation class.
- `scripts/refine-post-metadata.mjs`, `src/content/blog/`: normalized descriptions and tags for CTF WP, vulnerability summaries, React/CVE, SQL, database, Java, and related articles.
- `src/lib/posts.ts`, `src/scripts/blog-search.js`, `src/pages/blog/index.astro`: improved runtime tag fallback, search index text, search normalization, and result count.
- `docs/visual-reference-analysis.md`, `AGENTS.md`: recorded the new visual rejection rules and clarified that `picture/` is not a runtime dependency.

Tested:
- `npm run refine:metadata`
- `npm run build`
- HTTP checks for `/`, `/blog/`, and `/blog/react2shell/`
- `npm run astro -- dev status`
- Headless Chrome screenshots to `.preview/home-v2-final.png` and `.preview/blog-v2-final.png`
- Runtime/source searches for invalid sakura CSS modulo expressions and `笔记` frontmatter tag residue

Result:
- Pass. Build generated 26 static pages and the dev server is running at `http://localhost:4321`.
- Sakura petals now render from real generated CSS variables instead of invalid CSS modulo expressions.
- The scroll thumb image is positioned outside the rail and receives a running animation while dragging.
- Article frontmatter no longer uses the generic `笔记` tag, and search covers title, description, tags, slug, and body excerpt.

Follow-up:
- Shiki still warns when Markdown code fences use uppercase `HTML`; normalize those fences to lowercase `html` later if syntax highlighting polish is needed.

## 2026-07-02 18:52 - Home first screen guitar and transition polish

Changed:
- `src/pages/index.astro`: restored the home first-screen structure, switched the GitHub pill to `/images/github-mark.svg`, and attached the transparent guitar cutout to the avatar.
- `public/images/github-mark.svg`: added a white GitHub mark without bitmap edge artifacts.
- `public/images/guitar-cutout.png`: generated a transparent cutout from the temporary `picture/` guitar source, so runtime no longer depends on `picture/`.
- `src/styles/global.css`: adjusted the black GitHub pill, transparent guitar placement, guitar swing/strum animation, note position, and first-screen transition polish.
- `src/scripts/home-snap.js`: unified space, wheel, and scroll-rail panel switching through a locked smooth transition path.

Tested:
- `npm run build`
- HTTP checks for `/` and `/blog/`
- `npm run astro -- dev status`
- Headless Chrome screenshot to `.preview/home-first-v6-guitar-github.png`

Result:
- Pass. Build generated 26 static pages. Home runtime assets now use `public/images/github-mark.svg` and `public/images/guitar-cutout.png`.

## 2026-07-02 20:40 - Dev tooling and card marker cleanup

Changed:
- `package.json`, `package-lock.json`: added development dependencies for Astro checking, TypeScript, Prettier, Astro Prettier support, Node types, and Playwright.
- `playwright.config.ts`, `tests/e2e/visual-smoke.spec.ts`: added a lightweight visual smoke suite for the home guitar/terminal rhythm and card marker ownership.
- `src/styles/global.css`: disabled global `glass-card`/`soft-card` pseudo-dot markers so ordinary reused cards stay clean; kept decorative dots on `.section-label` labels only.
- `src/styles/global.css`: moved the home guitar decoration inward so it overlaps the avatar lower-right corner more naturally.

Tested:
- `npm run build`
- `npm run test:e2e`
- `npm.cmd audit --json`
- `npm run astro -- dev status`
- Playwright runtime checks for home guitar bounds, terminal row rhythm, and blog/friends card pseudo-element styles

Result:
- Pass. Build generated 26 static pages. Playwright visual smoke tests passed: 2/2.
- `npm audit --json` reports 0 vulnerabilities after installing dev tooling.
- Background dev server is running at `http://localhost:4321`.

Known issue:
- `npm run check` currently fails during Astro content sync with `require is not defined` from `picomatch` under the current Astro 7.0.4 / Vite 8.1.2 / Node 24.16.0 toolchain. This is a tooling sync issue; `astro build` passes.

## 2026-07-02 21:50 - Home second bento dashboard and reusable footer pass

Changed:
- `src/pages/index.astro`: rebuilt the home second panel around a bento dashboard: latest article column, `flower.jpg` mood banner, profile intro card, live clock card, calendar card, and shared footer.
- `src/styles/global.css`: added the warm pink-blue bento visual layer, compact second-screen grid, article image cards, calendar styling, and reusable footer card styling.
- `src/scripts/clock.js`: extended the clock island to render the monthly calendar with current-day highlighting.
- `tests/e2e/visual-smoke.spec.ts`: added a second-screen smoke test for `flower.jpg`, latest cards, calendar days, dashboard height, and footer visibility.

Tested:
- `npm run build`
- `npm run test:e2e`
- `npm run astro -- dev status`
- Playwright screenshot/metrics saved to `.preview/home-second-bento-v2.png`

Result:
- Pass. Build generated 26 static pages with no CSS warnings.
- Playwright visual smoke tests passed: 3/3.
- At 1920x1080, the second-screen dashboard is 692px tall and the reusable footer remains visible within the viewport.
- The second-screen top display image loads from `/images/flower.jpg`, so runtime does not depend on `picture/flower.jpg`.

## 2026-07-03 18:42 - Home second latest-post bento and CSS falling tags

Changed:
- `src/pages/index.astro`: restored the latest article card on the home second screen and kept only the requested bento modules: latest post, top image, compact avatar greeting, clock, calendar, and quote.
- `src/styles/global.css`: rebuilt the second-screen layout around a looser bento composition, enlarged the calendar, restyled the no-seconds clock, lengthened the quote card, and replaced physics-tag styles with CSS keyframes.
- `src/scripts/clock.js`: changed the home clock display from `HH:MM:SS` to `HH:MM`.
- `src/scripts/falling-items.js`: removed Matter.js usage and implemented lightweight top-drop tag animation with CSS variables and bottom-first fade timing.
- `package.json`, `package-lock.json`: removed `matter-js` from project dependencies.
- `tests/e2e/visual-smoke.spec.ts`: updated second-screen checks and added CSS-only falling-tag assertions.

Tested:
- `npm run build`
- `npm run test:e2e`
- `npm run astro -- dev status`

Result:
- Pass. Build generated 26 static pages with no CSS warnings.
- Playwright passed 4/4 tests, including latest-post placement, no-seconds clock text, and CSS-only falling tag animation with bottom-first fade timing.
- Background dev server is running at `http://127.0.0.1:4321`.

Follow-up:
- Historical note: the CSS-only pass temporarily removed `matter-js`; the dependency was restored in the 19:55 pass after the falling tags requirement changed back to collision-based physics.

## 2026-07-03 19:55 - Home second reference layout and optimized physics tags

Changed:
- `src/pages/index.astro`: adjusted the home second panel to follow the reference layout more closely: latest article in the left navigation position, top image above the profile card, quote below the profile card, and clock/calendar on the right.
- `src/styles/global.css`: made the latest article image fill its card with the article information overlaid near the lower area, reduced the avatar card, kept the quote text to the requested original two lines, added more whitespace, and tuned the enlarged calendar and no-seconds clock.
- `src/scripts/falling-items.js`: restored a capped, lightweight Matter.js falling-tag implementation with body collisions, staggered top spawning, bottom-first fading, and cleanup to reduce animation work after the effect finishes.
- `package.json`, `package-lock.json`: restored `matter-js` because the requested tag effect now needs real physical collision behavior.
- `tests/e2e/visual-smoke.spec.ts`: updated the second-screen and falling-tag checks for the restored physical implementation.

Tested:
- `npm run build`
- `npm run test:e2e`
- `npm run astro -- dev status`
- Playwright layout metrics at 2048x1152 saved to `.preview/home-second-current.png`

Result:
- Pass. Build generated 26 static pages with no CSS warnings.
- Playwright passed 4/4 tests.
- The avatar text, latest article overlay, clock, calendar, and quote all fit within their cards in the 2048x1152 layout metrics.
- Background dev server is running at `http://127.0.0.1:4321`.
## 2026-07-03 20:17 - Home second refinement: article, clock/calendar, and falling corpus

Changed:
- `src/pages/index.astro`: switched latest-post cover dimensions to the source image metadata so portrait covers can render with their real aspect ratio, and removed the unused falling doro source marker.
- `src/styles/global.css`: enlarged and slightly repositioned the latest article card, constrained the cover image to show fully inside the card, aligned the clock and calendar left edges, made the calendar square, and enlarged the profile avatar.
- `src/data/interests.ts`: removed the long `你指尖跃动的电光...` falling label from the corpus.
- `src/scripts/falling-items.js`: removed doro image body generation from the physics effect and capped the effect to text labels only.
- `tests/e2e/visual-smoke.spec.ts`: added assertions for full cover containment, larger avatar, aligned clock/calendar, square calendar, no doro falling body, and no removed corpus label.

Tested:
- `npm run build`
- `npm run test:e2e`
- `npm run astro -- dev status`
- Playwright layout metrics saved to `.preview/home-second-refine-v11.png`

Result:
- Pass. Build generated 26 static pages with no CSS warnings.
- Playwright passed 4/4 tests.
- At 2048x1152, the latest cover renders fully within its card, the clock/calendar left edges align exactly, the calendar is 390x390, and the falling effect contains 10 text labels with 0 doro items.
## 2026-07-03 20:20 - Home profile avatar density tweak

Changed:
- `src/styles/global.css`: enlarged the home second profile avatar from 94px to 118px on desktop, adjusted tablet/mobile avatar size to 104px, and tightened the profile card padding/gap so the card feels less empty.
- `tests/e2e/visual-smoke.spec.ts`: raised the profile avatar layout assertion to cover the larger avatar size.

Tested:
- `npm run build`
- `npm run test:e2e`

Result:
- Pass. Build generated 26 static pages with no CSS warnings.
- Playwright passed 4/4 tests.

## 2026-07-03 20:27 - Global footer style unification

Changed:
- `src/styles/global.css`: added a final global footer override so every route uses the same integrated anime-background footer treatment as the home footer, including `muzimi.png`, soft overlay bands, no rounded white card, and compact height.
- `tests/e2e/visual-smoke.spec.ts`: added a regular-page footer smoke test to ensure `/blog/` uses the integrated background footer rather than the plain white footer style.

Tested:
- `npm run build`
- `npm run test:e2e`
- Playwright footer metrics saved to `.preview/blog-footer-global-v12.png`

Result:
- Pass. Build generated 26 static pages with no CSS warnings.
- Playwright passed 5/5 tests.
- `/blog/` footer is full-width, 270px tall at 2048px viewport width, uses `muzimi.png`, and has zero border radius.
## 2026-07-03 21:31 - Blog list/search and article readability pass

Changed:
- `src/pages/blog/index.astro`, `src/components/blog/NoteCard.astro`, `src/lib/blogCovers.ts`: wired blog cards to a deterministic cover allocator that distributes every available cover once before repeating, and made the list card cover area use a photo-like frame.
- `src/scripts/blog-search.js`: kept search results unchanged while typing and committed filtering only when Enter is pressed.
- `src/pages/blog/[...id].astro`, `src/styles/global.css`: added article photo covers, improved code block contrast/readability, and made the article TOC independently scrollable when it exceeds the viewport.
- `src/pages/blog/index.astro`, `src/pages/project/index.astro`, `src/pages/friends/index.astro`: replaced long intro copy with script-style `my-blog`, `my-projects`, and `my-friends`; changed the blog search placeholder to `请输入关键词喵~` with a decorative placeholder style.
- `src/pages/index.astro`: restored the accidentally corrupted home entry file so the project can build and existing home regressions remain valid.
- `tests/e2e/visual-smoke.spec.ts`: added regression checks for Enter-only search, script intro labels, cover distribution/photo styling, article code readability, and TOC scrolling.

Tested:
- `npm run build`
- `npm run astro -- dev status`
- `npm run test:e2e`

Result:
- Pass. Build generated 26 static pages.
- Playwright passed 9/9 tests.
- Background dev server is running at `http://localhost:4321`.
## 2026-07-03 23:10 - Profile/project/friends content cleanup and home repair

Changed:
- `src/pages/blog/[...id].astro`: removed the article intro cover image so articles start with metadata/title/tags and body content only.
- `src/data/projects.ts`, `src/data/techStack.ts`: cleared the placeholder project and tech-stack examples.
- `src/data/friends.ts`, `src/components/friends/FriendCard.astro`: replaced friend links with the requested seven external sites and left descriptions blank.
- `src/pages/me/index.astro`, `src/styles/global.css`: removed the avatar tape overlay and README badge, rewrote the profile/readme copy, changed the profile name to a decorative Moyue mark, and added the requested empty tech-stack message.
- `src/pages/index.astro`, `src/styles/global.css`: restored the home avatar/terminal layout after the button reset issue, switched the GitHub icon from PNG to `github-mark.svg`, and removed the white-edged icon treatment.
- `src/styles/global.css`: changed section/timeline/article marker dots to a plain small pink-blue gradient orb without the large white highlight or outer target ring.
- `tests/e2e/visual-smoke.spec.ts`: updated article-cover expectations and added content checks for profile, empty project list, friend data, and the simpler dot style.

Tested:
- `npm run build`
- `npm run test:e2e`

Result:
- Pass. Build generated 26 static pages.
- Playwright passed 10/10 tests.
## 2026-07-04 00:27 - Home subtitle and guitar speech bubble

Changed:
- `src/data/site.ts`: changed the home first-screen eyebrow text to `personal blog / telepathic waves`.
- `src/pages/index.astro`, `src/scripts/avatar-guitar.js`, `src/styles/global.css`: replaced the guitar click note burst with a manga-style shy speech bubble that says `Bobobobocchi desu!`, while keeping the light guitar strum feedback.
- `tests/e2e/visual-smoke.spec.ts`: added regression checks for the new subtitle, speech bubble, and absence of generated note elements; aligned the friend-data check with the current user-edited `snowcat` data.
- `src/data/friends.ts`: preserved the user-edited friend avatar sources and `snowcat` entry after verification exposed the test expectation mismatch.

Tested:
- `npm run build`
- `npm run test:e2e`

Result:
- Pass. Build generated 26 static pages.
- Playwright passed 10/10 tests.
## 2026-07-04 01:36 - Content workflow cleanup and GitHub Pages deploy prep

Changed:
- `.gitignore`: ignored Astro build/cache output, tests, local env files, editor files, and the now-deleted visual reference directory.
- `README.md`: added Chinese documentation for writing posts, cover-image behavior, local development, tests, and GitHub Pages deployment.
- `.github/workflows/deploy.yml`: added GitHub Actions deployment for Pages from the `main` branch.
- `astro.config.mjs`: set the production site URL for `https://qmoyue.github.io`.
- `public/.nojekyll`: added for GitHub Pages static asset publishing.
- Project cleanup: removed temporary output folders, old starter files/assets, old article source folder, unused images/scripts, and the local `picture/` reference directory.
- `src/layouts/BaseLayout.astro`: uses the doro image as the browser favicon while keeping the page navigation trigger unchanged.

Tested:
- `npm run build`
- `npm run test:e2e`
- `npm run astro -- dev status`
- Source checks for runtime `picture/` dependencies and favicon/nav regression.

Result:
- Pass. Build generated 26 static pages from `src/content/blog/` and `src/assets/blog-covers/` after `picture/` was deleted.
- Playwright passed 10/10 tests.
- Background dev server is running at `http://localhost:4321`.

Follow-up:
- None for the current cleanup. For stable cover choice across future cover-library changes, pin important posts with an explicit `cover: filename.webp`.

## 2026-07-04 01:42 - README simplification

Changed:
- `README.md`: simplified the document to a short project introduction, local commands, and directory structure only.

Tested:
- `rg -n "GitHub Pages|Actions|deploy|部署|workflow" README.md`

Result:
- Pass. README no longer contains GitHub Pages, Actions, workflow, or deployment instructions.

Follow-up:
- None.

## 2026-07-04 01:48 - GitHub repository link update

Changed:
- `src/data/site.ts`: changed the home GitHub button target to `https://github.com/Qmoyue/Qmoyue.github.io`.
- `tests/e2e/visual-smoke.spec.ts`: added a regression assertion for the GitHub button URL.

Tested:
- `npm run test:e2e`

Result:
- Pass. Playwright passed 10/10 tests, including the GitHub link assertion.

Follow-up:
- None.
