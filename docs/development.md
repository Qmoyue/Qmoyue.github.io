# Certain Cloud Blog Development Plan

## 1. Development Constraints

- Framework: Astro.
- Interactivity: native JavaScript only.
- Styling: native CSS only.
- No React/Vue/Svelte unless a later requirement explicitly changes this.
- No Tailwind in the first implementation pass.
- Dev server command must use background mode:

```bash
astro dev --background
```

Manage it with:

```bash
astro dev status
astro dev logs
astro dev stop
```

## 2. Current Repository State

Current project is a minimal Astro site.

Important existing files:

```text
astro.config.mjs
package.json
src/layouts/Layout.astro
src/pages/index.astro
src/pages/about.astro
src/components/Welcome.astro
picture/
```

The current `src/pages/index.astro` and `src/layouts/Layout.astro` are starter-level files and can be replaced during implementation.

Important note: `git status` currently shows user changes/untracked files:

```text
M src/pages/index.astro
?? picture/
?? src/pages/about.astro
```

We should not delete or revert these unless explicitly requested. Implementation should work with the current state.

## 3. Visual Reference Contract

The reference images in `picture/` are part of the design contract:

- `1.png`: Home Scene 1 layout inspiration. Remove announcement area, move text/identity area upward, and redesign it as the requested avatar plus text/terminal block.
- `2.png`: Home Scene 1 color and atmosphere inspiration.
- `3.png`, `4.png`: Home Scene 2 modular block inspiration.
- `5.png`: Dropdown nav inspiration.
- `6.png`, `7.png`, `8.png`, `9.png`: Blog page inspiration.
- `10.png`: Me page inspiration.

Do not copy these screens one-to-one. The goal is a differentiated implementation in the same style family:

- fresh and natural
- warm pastel pink-blue
- cute but readable
- light anime-blog feeling
- soft cards and decorative details
- no cold minimalism
- no corporate portfolio look
- no blue-purple gradient theme

## 4. Recommended Implementation Sequence

### Phase 1: Foundation

1. Create `public/images/`.
2. Copy selected images from `picture/` into `public/images/`.
3. Keep reference images `1.png` through `10.png` as local design references, not production assets.
4. Create shared CSS:
   - `src/styles/tokens.css`
   - `src/styles/global.css`
   - `src/styles/effects.css`
5. Replace starter layout with `BaseLayout.astro`.
6. Add shared navigation and scroll rail components.

Acceptance criteria:

- All pages can use the same layout.
- Top dropdown nav works on hover and keyboard focus.
- Right scroll rail is visible and visually matches the pastel theme.
- The base theme already resembles the reference-image family before page-specific polish.

### Phase 2: Home Page

1. Build the two-scene home page.
2. Implement Scene 1 inspired by `1.png` and `2.png`.
3. Remove any announcement-style block from the composition.
4. Place the identity block slightly above center.
5. Implement avatar-to-terminal entrance.
6. Add terminal content and GitHub link placeholder.
7. Implement Space key, wheel down, and scroll rail transition to Scene 2.
8. Add Scene 2 fixed background, title module, clock, avatar/signature card inspired by `3.png` and `4.png`.
9. Add Scene 2 falling interest items.
10. Add footer.

Acceptance criteria:

- Home loads directly into Scene 1.
- Scene transition is smooth and does not stop halfway.
- Scene 2 background stays fixed while the view is on Scene 2.
- Falling items only appear on Scene 2 and disappear automatically.
- Scene 1 reads as a soft anime blog entrance, not a terminal portfolio landing page.
- Scene 2 reads as a cute modular personal dashboard, not a data dashboard.

### Phase 3: Data And Content

1. Create `src/data/site.ts`.
2. Create `src/data/projects.ts`.
3. Create `src/data/friends.ts`.
4. Create `src/data/interests.ts`.
5. Create `src/data/techStack.ts`.
6. Create `src/content.config.ts`.
7. Add starter Markdown posts under `src/content/blog/`.

Acceptance criteria:

- Blog cards render from content collection entries.
- Projects, friends, interests, and tech stack render from typed data files.
- Home falling-interest effect reads from the same interest data used by the `me` page.

### Phase 4: Blog Pages

1. Create `/blog/` page.
2. Add blog intro card using `6.png` through `9.png` as visual references.
3. Add search component with native JS filtering.
4. Add timeline list and note cards.
5. Give note cards photo-like cover areas and warm tactile surfaces.
6. Create `/blog/[slug]/` dynamic page.
7. Add article layout and right-side TOC.

Acceptance criteria:

- Search matches title, description, and tags.
- Note cards link to valid article detail pages.
- Article page renders Markdown content.
- TOC links jump to article headings.
- Blog pages stay visually close to the provided references and do not become a plain documentation layout.

### Phase 5: Project, Friends, Me

1. Create `/project/`.
2. Create long horizontal project cards linking to GitHub.
3. Create `/friends/`.
4. Create friend cards with avatar and description.
5. Create `/me/`.
6. Add profile, README, interests, and tech stack blocks inspired by `10.png`.

Acceptance criteria:

- Project cards open the correct GitHub URLs.
- Friend cards are fully clickable.
- Me page data is reusable and feeds the home Scene 2 falling effect.
- Me page feels like a warm personal board rather than a resume grid.

### Phase 6: Polish And Verification

1. Tune responsive layout for desktop, tablet, and mobile.
2. Add reduced-motion fallbacks.
3. Verify image loading paths.
4. Run build.
5. Start background dev server and inspect.

Commands:

```bash
npm run build
npm run astro -- dev --background
npm run astro -- dev status
```

If direct `astro` command is available in the shell, use:

```bash
astro dev --background
```

## 5. Planned File Structure

```text
public/
  images/
    avatar.jpg
    doro.png
    mygo1.jpg
    flower.jpg
    muzimi.png

src/
  content.config.ts
  content/
    blog/
      hello-blog.md
  data/
    site.ts
    projects.ts
    friends.ts
    interests.ts
    techStack.ts
  layouts/
    BaseLayout.astro
    ArticleLayout.astro
  components/
    navigation/
      DropdownNav.astro
      ScrollRail.astro
    effects/
      SakuraLayer.astro
      FallingItems.astro
    home/
      HeroIntro.astro
      TerminalCard.astro
      HomeDashboard.astro
      ClockCard.astro
      ProfileSignatureCard.astro
    blog/
      BlogIntroCard.astro
      BlogSearch.astro
      TimelineList.astro
      NoteCard.astro
      ArticleToc.astro
    project/
      ProjectCard.astro
    friends/
      FriendCard.astro
    me/
      ProfileCard.astro
      ReadmeCard.astro
      InterestTags.astro
      TechStackCard.astro
    shared/
      SiteFooter.astro
  pages/
    index.astro
    blog/
      index.astro
      [slug].astro
    project/
      index.astro
    friends/
      index.astro
    me/
      index.astro
  scripts/
    home-snap.js
    scroll-rail.js
    sakura.js
    falling-items.js
    blog-search.js
    article-toc.js
    clock.js
  styles/
    tokens.css
    global.css
    layout.css
    components.css
    effects.css
    article.css
```

## 6. CSS Token Draft

Use CSS custom properties for theme consistency:

```css
:root {
  --color-bg: #fff8fb;
  --color-surface: rgba(255, 253, 250, 0.82);
  --color-surface-strong: #fffdf9;
  --color-pink: #f8a8c5;
  --color-pink-soft: #ffd9e7;
  --color-blue: #a9dff2;
  --color-blue-soft: #dcf4fb;
  --color-peach: #ffd0b8;
  --color-yellow: #fff0a8;
  --color-paper: #fffaf4;
  --color-stamp: #f29ab8;
  --color-leaf: #bfd7b5;
  --color-text: #4f3f49;
  --color-muted: #8a7580;
  --color-line: rgba(255, 168, 197, 0.42);
  --shadow-soft: 0 18px 50px rgba(236, 132, 168, 0.18);
  --shadow-card: 0 14px 36px rgba(157, 118, 132, 0.16);
  --radius-card: 24px;
}
```

Gradient rule:

- Allowed: pink-to-warm-white, peach-to-pink, blue-soft-to-warm-white.
- Avoid: purple-blue gradients, dark navy gradients, hard neon gradients.
- Large gradients should be rare. Prefer image backgrounds, warm translucent panels, paper surfaces, and subtle overlays.

## 7. Native JavaScript Responsibilities

Keep JS small and page-scoped.

`home-snap.js`:

- manages Scene 1 and Scene 2 active state.
- listens to Space and wheel.
- exposes buttons/rail control hooks.
- respects `prefers-reduced-motion`.

`scroll-rail.js`:

- updates CSS variable for progress.
- handles click/drag on the rail.
- supports special home two-panel behavior.

`sakura.js`:

- creates lightweight petal elements.
- uses CSS animations.
- disables or reduces amount when `prefers-reduced-motion` is enabled.

`falling-items.js`:

- only starts on Home Scene 2.
- randomly selects interest words, doro icon, and candy items.
- removes elements after animation end or timeout.

`blog-search.js`:

- reads `data-search` strings from cards.
- toggles hidden state.
- updates empty state.

`article-toc.js`:

- optional enhancement for active heading state.
- basic anchor navigation should work without JS.

`clock.js`:

- updates local time display every second or minute depending on design.

## 8. Visual Interaction Details

Top dropdown nav:

- closed width: icon button only.
- open state: vertical menu or compact floating list.
- trigger: hover, focus-within.
- active route: use warm pink highlight and small decorative mark.
- visual target: same family as `picture/5.png`, with soft floating surface and cute icon/text rows.

Right scroll rail:

- fixed right side, vertically centered.
- track uses pale blue/white.
- filled progress uses warm pink/peach.
- indicator image: `doro.png`.
- image should stay crisp at small size.

Home terminal:

- panel background: translucent warm white.
- border: pink low-opacity.
- text: warm brown/rose.
- prompt markers can use `>` or `$`.
- GitHub icon can be inline SVG or simple CSS icon in first pass.
- avoid black terminal panels and green monospace hacker styling.

Blog cards:

- photo area should look like a small instant photo or soft album card.
- tags use pastel chips.
- word count uses subtle bottom-right text.
- card atmosphere should match `picture/6.png` through `picture/9.png`: warm, personal, readable, and lightly decorative.

Article layout:

- max readable width for article.
- right TOC sticky on desktop.
- TOC collapses above or below article on mobile.

## 9. Reference-Based Visual QA

After implementation, inspect pages against the reference set:

- Home Scene 1: compare with `1.png` and `2.png`.
- Home Scene 2: compare with `3.png` and `4.png`.
- Dropdown nav: compare with `5.png`.
- Blog list/detail: compare with `6.png`, `7.png`, `8.png`, `9.png`.
- Me page: compare with `10.png`.

Reject and revise if:

- the page looks too minimal or empty,
- the page feels like a cold developer portfolio,
- the palette becomes blue-purple,
- cards look like corporate dashboard widgets,
- image backgrounds are hidden by overly heavy overlays,
- decorative details are too sparse to carry the cute natural blog feeling.

## 10. Data Placeholders Needed From User

Before final implementation quality pass, collect:

- GitHub profile URL.
- GitHub project URLs.
- Site name and exact romanization.
- Signature sentence.
- Self-introduction.
- README text for Me page.
- Interest list.
- Tech stack list.
- Friend links and descriptions.
- Blog post seed content.

We can still build the first version with placeholders and replace them later.

## 11. Build And Test Checklist

Run:

```bash
npm run build
```

Manual checks:

- `/` loads Scene 1.
- Space key moves home to Scene 2.
- Wheel down moves home to Scene 2.
- Scroll rail moves home between scenes.
- Dropdown nav opens by hover and keyboard focus.
- `/blog/` search filters cards.
- `/blog/[slug]/` TOC links work.
- `/project/` cards link out.
- `/friends/` cards link out.
- `/me/` renders avatar, intro, README, interests, tech stack.
- No dominant blue-purple gradient appears.
- Visual style remains close to `picture/1.png` through `picture/10.png`.
- Mobile text does not overflow.
- Reduced-motion setting disables heavy falling effects.

## 12. Astro Documentation Notes

Implementation should follow the official Astro docs consulted for this plan:

- Routing: static pages and dynamic `[slug]` pages.
- Components: Astro components as reusable HTML-first building blocks.
- Content collections: local Markdown blog posts with schema validation.
- Styling: local stylesheet imports and component/global CSS structure.

## 13. Visual Baseline Addendum

Implementation must use `docs/visual-reference-analysis.md` as the visual baseline before coding or revising UI.


## 14. Requirement Priority And Development Log

The user's original page/module requirements are the first priority. The 10 reference images are the style baseline and layout inspiration, not a replacement for the requested modules.

Before implementing a feature:

1. Read the relevant section in `docs/architecture.md`.
2. Read `docs/visual-reference-analysis.md` for style constraints.
3. Preserve the requested module/function structure unless the user explicitly changes it.

After implementing a feature:

1. Run the smallest meaningful test for that feature.
2. Run `npm run build` when the change affects routing, content collections, imports, or shared layout behavior.
3. Perform a manual route check when the change affects UI or native JS interaction.
4. Add an entry to `docs/development-log.md` with changed files, test performed, result, and follow-up risk.

Testing expectations by feature type:

- Layout/shared CSS: build check plus visual route check.
- Navigation: hover/focus/manual route check plus build check.
- Home scene transition: manual Space/wheel/scroll-rail check plus reduced-motion check.
- Blog content collection: build check plus generated article route check.
- Blog search: manual keyword filtering check.
- Article TOC: manual heading navigation check.
- Project/friends cards: manual link target check.
- Me page: visual check against requested module layout and `10.png` style family.

Temporary Markdown test articles are allowed during development. They should cover multiple headings, tags, descriptions, cover images, and enough body text to test word count and TOC behavior.

## 14. Content And Performance Addendum

Before implementing blog content, cover images, or interactive widgets, follow `docs/content-performance-plan.md`.

