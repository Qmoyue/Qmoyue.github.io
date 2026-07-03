# Certain Cloud Blog Architecture

## 1. Product Direction

This project is an Astro static blog built with Astro components, native JavaScript, and CSS. The goal is a fresh, bright, anime-inspired personal blog with a warm pink-blue pastel tone.

The visual direction must avoid cold tech-dashboard styling, heavy engineering aesthetics, and blue-purple gradient themes. The site should feel soft, lively, playful, natural, and personal.

## 2. Core Design Rules

- Palette: warm pastel pink, soft sky blue, warm white, cherry blossom pink, light peach, gentle yellow accents, and small natural green accents.
- Forbidden: dominant blue-purple gradients, dark cyber styling, neon dashboard styling, cold minimalism, corporate portfolio styling, and rigid admin-panel layouts.
- Texture: light glass, paper-like soft panels, subtle shadows, low-contrast borders, cherry blossom falling effect.
- Corners: medium soft radius for cards and panels, not excessive pill-only UI.
- Motion: smooth but restrained; transitions should feel light and responsive.
- Typography: clean Chinese-friendly sans-serif for body text, optional cute display font for small headings if later selected.
- Images: use the local `picture/` assets as primary visual identity.
- Decorative density: the UI should be airy but not empty; use petals, tiny icons, chips, image frames, stamps, warm dividers, and small floating details.

## 3. Reference Image Direction

The files `picture/1.png` through `picture/10.png` are visual references for the target style. They are not templates to copy exactly. The implementation should extract the mood, layout vocabulary, color softness, card treatment, and interaction feel while keeping the site visually distinct.

Reference mapping:

- `picture/1.png`: Home Scene 1 structure reference. Use a similar first-screen composition, but remove the announcement block. Raise the central text/identity area slightly and replace that area with the requested avatar plus text/terminal block.
- `picture/2.png`: Color and atmosphere reference for Home Scene 1. Learn the soft warm-pastel anime palette and background treatment.
- `picture/3.png` and `picture/4.png`: Home Scene 2 module-grid references. Use them as guidance for the second page's modular blocks, title/time area, profile/signature card, and playful decorative density.
- `picture/5.png`: Dropdown navigation reference. The real nav should stay icon-only in its closed state and expand into icon plus text items on hover/focus.
- `picture/6.png`, `picture/7.png`, `picture/8.png`, `picture/9.png`: Blog list/detail page references. Blog pages should follow this family of soft card layouts, warm paper surfaces, photo-like covers, rounded panels, subtle dividers, and readable content blocks.
- `picture/10.png`: Me page reference. Follow the same warm profile-dashboard feeling while preserving the requested layout: avatar/self-intro on the left, README on the right, interests and tech stack below.

The sampled average colors of these references are mostly warm off-white, soft gray, muted pastel, and natural low-saturation tones. This reinforces the rule that the site must stay fresh and bright, not cold, minimal, or heavily saturated.

Hard visual constraints:

- The final style must remain close to the reference family: fresh, natural, cute, anime-blog, warm pastel pink-blue.
- The design may differ in composition and details, but it must not drift into cold minimalism, SaaS dashboard style, cyber/neon style, or generic developer portfolio style.
- Use image backgrounds, soft panels, tiny decorative elements, and warm shadows to keep the page alive.
- Cards should feel like scrapbook/profile/blog widgets rather than corporate cards.
- White space should be airy but not empty; add gentle decorative density through petals, small icons, chips, photo frames, stamps, and warm dividers.

## 4. Asset Map

Source images currently live in `picture/`.

- `picture/avatar.jpg`: primary avatar.
- `picture/doro.png`: custom icon for the right-side scroll indicator and optional falling decoration.
- `picture/mygo1.jpg`: first home screen background candidate.
- `picture/flower.jpg`: alternate first home screen background candidate.
- `picture/muzimi.png`: second home screen fixed background.
- `picture/1.png` through `picture/10.png`: style references only; do not ship them as page content unless the user later requests it.

Implementation note: Astro can import local images from `src/`, but this project currently stores images in `picture/`. During implementation we should either:

- move/copy final assets into `public/images/` for simple URL usage, or
- move assets into `src/assets/` and use Astro image imports where optimization is useful.

For this design, `public/images/` is the simpler first pass because native CSS backgrounds and JS effects need direct paths.

## 5. Astro Routing

Astro file-based routing maps files in `src/pages/` to public routes. We will use static routes for the main sections and a dynamic route for blog articles.

Planned routes:

- `/`: Home page with two full-screen panels and footer.
- `/blog/`: Blog listing page with intro card, search component, timeline, and note cards.
- `/blog/[slug]/`: Blog article detail page.
- `/project/`: Project listing page.
- `/friends/`: Friends listing page.
- `/me/`: Personal profile page.

Astro supports dynamic route parameters through bracketed filenames such as `[slug].astro`, which fits blog article pages generated from content entries.

## 6. Content Architecture

Use Astro content collections for structured content. Blog posts are relatively static and benefit from build-time rendering, type checking, and metadata validation.

Planned content folders:

```text
src/
  content.config.ts
  content/
    blog/
      first-post.md
```

Blog frontmatter shape:

```ts
{
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  tags: string[];
  cover?: string;
  draft?: boolean;
}
```

Data files for non-article sections:

```text
src/data/
  site.ts
  projects.ts
  friends.ts
  interests.ts
  techStack.ts
```

This keeps highly structured lists easy to edit without needing a CMS.

## 7. Layout Architecture

Astro components render to HTML by default and add no client JavaScript unless we include scripts. This project should keep most UI in Astro and CSS, then use small native JS modules only for interaction and animation.

Planned layout files:

```text
src/layouts/
  BaseLayout.astro
  ArticleLayout.astro
```

`BaseLayout.astro` responsibilities:

- shared document shell
- metadata
- global CSS import
- top dropdown navigation
- right scroll rail
- optional cherry blossom layer
- slot for page content

`ArticleLayout.astro` responsibilities:

- article page shell
- left article content area
- right heading index
- article typography styles

## 8. Component Architecture

Shared components:

```text
src/components/
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
    Icon.astro
    SiteFooter.astro
```

Native JS modules:

```text
src/scripts/
  home-snap.js
  scroll-rail.js
  sakura.js
  falling-items.js
  blog-search.js
  article-toc.js
  clock.js
```

CSS modules or grouped styles:

```text
src/styles/
  global.css
  tokens.css
  layout.css
  components.css
  effects.css
  article.css
```

Astro supports local CSS imports in component frontmatter, and imported styles are bundled and optimized. We should keep global design tokens global, while page-specific styles stay near their Astro components when practical.

## 9. Navigation

Top navigation:

- Normal state: only a dropdown icon is visible.
- Hover/focus state: dropdown expands like the `5.png` reference and shows icon plus text entries.
- Items: `home`, `blog`, `project`, `friends`, `me`.
- Must be keyboard accessible: focus on trigger opens the menu; links are normal anchors.
- The dropdown should use a soft floating panel, light blur, warm border, pastel highlight, and cute icon treatment.
- It should not look like a default browser dropdown or a stark admin menu.

Route mapping:

- home -> `/`
- blog -> `/blog/`
- project -> `/project/`
- friends -> `/friends/`
- me -> `/me/`

## 10. Right Scroll Rail

The right scroll rail is always visible.

Behavior:

- Indicator uses `doro.png`.
- Filled portion uses a distinct warm pink/peach tone.
- Unfilled portion uses a pale blue/white tone.
- On home page, dragging/clicking rail moves between section 1 and section 2 with no midpoint stop.
- On long listing/article pages, rail reflects normal document scroll progress.

Implementation:

- fixed-position component in `BaseLayout`.
- JS listens to `scroll` and updates CSS custom property `--scroll-progress`.
- For home page, section snapping logic maps progress to panel 1 or panel 2.

## 11. Home Page Architecture

Home has two full-screen scenes and a footer.

Scene 1:

- Background: `mygo1.jpg` or `flower.jpg`.
- Overall layout learns from `1.png`, while color atmosphere learns from `2.png`.
- No today-announcement block.
- Main identity/text block is placed slightly above the visual center.
- Center identity block is redesigned as an avatar plus text block, then transitions into the avatar-left plus terminal-card layout described earlier.
- Entrance animation: avatar starts centered, then shifts left.
- After avatar shift: terminal-like panel appears next to the avatar.
- Terminal content: personal greeting, short identity lines, current route hint, and GitHub icon link.
- GitHub icon link opens the user GitHub profile. The actual URL is pending.
- The terminal should not look black/cyber. It should be a warm, translucent, cute terminal with pastel prompt colors.

Scene 1 navigation:

- Press Space -> smooth transition to Scene 2.
- Mouse wheel down -> smooth transition to Scene 2.
- Right scroll rail -> direct transition to Scene 2.
- No stopping between Scene 1 and Scene 2.

Scene 2:

- Fixed background: `muzimi.png`.
- Overall module feeling learns from `3.png` and `4.png`, but content follows this project's own requirements.
- Upper-left text module: `moyue's blog`.
- Clock component to the right of title area.
- Below: component blocks including avatar and one-line signature.
- Falling interest effect only exists on Scene 2.
- Falling items include interests from the `me` module, selected corpus text, `doro.png`, and candy-like CSS items.
- Falling items auto-disappear after a short duration.

Footer:

- Standard personal blog footer.
- Include copyright, site name, route links, optional built-with text.

## 12. Blog Listing Architecture

Page entry:

- Intro component with title `blog`.
- Intro text explains the notes area in a personal tone.
- The intro and list style should learn from `6.png` through `9.png`: warm paper background, soft rounded cards, photo-like cover blocks, playful but readable hierarchy.

Search:

- Search component below intro.
- Left label: search note text.
- Right input: keyword matching by title, description, and tags.
- Native JS filters rendered note cards.

Timeline:

- Left side: date axis.
- Each time point connects to one note card.
- Right side note card:
  - left photo-like cover area
  - right title, description, tags
  - bottom-right word count
  - click navigates to `/blog/[slug]/`
- The timeline should feel hand-kept and personal, not like a rigid changelog.
- Blog cards should use warm shadows, low-contrast outlines, pastel chips, and slightly tactile image frames.

Article page:

- Left: rendered article.
- Right: heading index.
- TOC links scroll to matching heading.
- Active heading can be highlighted later with IntersectionObserver.
- Article detail must remain part of the same visual family as the listing: warm content surface, soft right index, clear typography, and no cold documentation-site look.

## 13. Project Page Architecture

The project page uses the same top intro style as blog but has no search component.

Content:

- Several long horizontal project cards.
- Each card maps to one GitHub project.
- Clicking the card opens the GitHub project URL.
- Fields: project name, description, tags/tech, status, GitHub URL.

## 14. Friends Page Architecture

The friends page uses the same top intro style as blog but has no search component.

Content:

- Vertical list of friend link cards.
- Each card:
  - left avatar
  - right name and description
  - full card clickable
- Clicking avatar or description navigates to the friend URL.

## 15. Me Page Architecture

Layout:

- Overall visual reference: `picture/10.png`.
- Left top: avatar card.
- Below avatar card: self-introduction.
- Right of avatar card: README card with free-form text.
- Below: interest tag card.
- Further below: tech stack card.
- The page should look like a personal profile board with soft blocks and small decorative details, not like a resume dashboard.

Data source:

- profile info in `src/data/site.ts`
- interests in `src/data/interests.ts`
- tech stack in `src/data/techStack.ts`

The home Scene 2 falling-interest effect should reuse the same interest data so the site stays consistent.

## 16. Accessibility And UX

- All clickable visual cards must be anchors or buttons with accessible labels.
- Dropdown nav must support hover and keyboard focus.
- Motion should respect `prefers-reduced-motion`.
- Search input must have an accessible label.
- Images need useful `alt` text.
- Article headings need IDs for TOC anchors.
- Color contrast must remain readable on image backgrounds through overlays and panels.

## 17. Visual QA Rules

Before considering the design acceptable:

- Compare `/` Scene 1 against `1.png` and `2.png` for general mood: first-screen anime blog entry, warm light palette, raised identity block, no announcement area.
- Compare `/` Scene 2 against `3.png` and `4.png` for modular dashboard feeling, but keep the requested content and falling-interest behavior.
- Compare navigation against `5.png` for dropdown feeling.
- Compare `/blog/` and article pages against `6.png` through `9.png` for soft blog-card style.
- Compare `/me/` against `10.png` for warm profile-board feeling.
- Reject any pass that reads as cold, minimal, blue-purple, corporate, or generic engineering portfolio.

## 18. Open Questions

- GitHub profile URL.
- Exact site owner display name: `moyue`, `Moyue`, or another spelling.
- Home terminal copy.
- One-line signature.
- Me page self-introduction and README text.
- Interest corpus and the extra phrases used for falling items.
- Project list and GitHub repository URLs.
- Friend link list, avatar URLs, and descriptions.
- Preferred first home background: `mygo1.jpg` or `flower.jpg`.

## 19. References Consulted

- Astro routing guide: file-based routes and dynamic route filenames.
- Astro components guide: `.astro` components render HTML by default and can use standard scripts for interaction.
- Astro content collections guide: build-time collections are suitable for static blog content with schemas.
- Astro styling guide: local CSS imports are bundled and optimized.

## 20. Visual Reference Analysis Addendum

See `docs/visual-reference-analysis.md` for the detailed image-by-image observations that must guide implementation.


## 21. Requirement Priority

Development priority is:

1. The user's original module and feature requirements are the primary source of truth.
2. The 10 reference images define the visual style family and may inform layout, spacing, color, decoration, and interaction treatment.
3. If a reference image conflicts with the original requested module structure, keep the requested module structure and adapt only the visual language from the reference.
4. Do not copy the reference site one-to-one. Build a differentiated blog that stays in the same fresh, natural, cute, warm pastel anime-blog family.

Concrete examples:

- Home Scene 1 may learn from `1.png` and `2.png`, but it must use the requested avatar plus text/terminal block and omit the announcement block.
- Home Scene 2 may learn from `3.png` and `4.png`, but it must keep the requested title, clock, profile/signature modules, fixed background, and falling-interest behavior.
- Blog, project, friends, and me pages should keep the user's requested module structure first, then apply the reference visual language.

## 22. Test Content Policy

During development, temporary Markdown posts may be created under `src/content/blog/` to verify:

- blog listing rendering,
- timeline sorting,
- search by title, description, and tags,
- cover image display,
- word count display,
- article detail routing,
- heading anchors,
- right-side article index behavior.

Test posts should be clearly marked as seed/demo content in frontmatter or file naming so they can be replaced later.

## 21. Content And Performance Addendum

See `docs/content-performance-plan.md` for the blog publishing workflow, automatic cover image strategy, and Astro island/performance rules.

