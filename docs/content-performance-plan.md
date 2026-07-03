# Content, Images, And Performance Plan

## 1. Goal

The blog should stay easy to publish and fast to browse.

Publishing target:

- Write a Markdown article in one fixed folder.
- Optionally drop more cover images into one fixed image folder.
- Commit and push with git.
- No manual page registration.
- No runtime database or CMS required.

Performance target:

- Keep Astro's static HTML advantage.
- Use image optimization for visible blog card covers where possible.
- Avoid loading every candidate cover image in the browser.
- Use JavaScript only for local interaction, not for rendering the whole site.

## 2. Official Astro Guidance Applied

This plan follows the Astro docs checked for this decision:

- Content collections are a good fit because a blog is a set of related, structurally similar entries stored in local Markdown files.
- Astro recommends keeping local images in `src/` when possible so they can be transformed, optimized, and bundled. Images in `public/` are served as-is with no processing.
- Astro's `<Image />` and `<Picture />` components can optimize images and infer dimensions to reduce layout shift.
- Astro processes and bundles local scripts in `src/`, deduplicates component scripts, and can inline small scripts.
- Astro islands/partial hydration means the page should remain server-rendered HTML, with only dynamic regions hydrated or enhanced on the client.

## 3. Authoring Workflow

Articles live here:

```text
src/content/blog/
  my-first-note.md
  another-note.md
```

Blog cover source images live here:

```text
src/assets/blog-covers/
  cover-01.jpg
  cover-02.png
  cover-03.webp
```

The user workflow is:

1. Add or edit Markdown files under `src/content/blog/`.
2. Add optional cover images under `src/assets/blog-covers/`.
3. Commit and push.
4. The build process generates the blog list and article pages automatically.

No page file should be created for each article manually.

## 4. Blog Frontmatter

Recommended Markdown frontmatter:

```yaml
---
title: 使用 Astro 做一个轻快的个人博客
description: 记录一次博客搭建和设计取舍。
pubDate: 2026-07-01
updatedDate: 2026-07-01
tags: [Astro, 前端, 博客]
cover: auto
coverAlt: 一张柔和的二次元风格封面图
draft: false
---
```

Field behavior:

- `title`: required.
- `description`: required for listing and SEO.
- `pubDate`: required.
- `updatedDate`: optional.
- `tags`: default to empty array.
- `cover`: optional. Use `auto` or omit it to select from `src/assets/blog-covers/` automatically. Later, a specific cover filename can override this.
- `coverAlt`: optional but recommended when using a specific cover.
- `draft`: when true, exclude from production listing and route generation.

## 5. Cover Image Strategy

The user asked for note photos to be randomly selected from `src/assets/blog-covers/`, with future images adapting automatically.

Use deterministic build-time randomness instead of runtime randomness:

- At build time, collect supported images from `src/assets/blog-covers/`.
- Sort filenames for stable behavior.
- For every post without an explicit cover, hash the post slug.
- Use `hash(slug) % coverCount` to select one cover.
- The same article keeps the same cover between page loads.
- Adding more images can rebalance future builds, but the browser never loads the whole image pool.

Why deterministic pseudo-random selection:

- It gives visual variety without layout flicker.
- It avoids client-side image scanning.
- It keeps HTML static and cacheable.
- It lets each card render exactly one optimized image.

## 6. Source And Optimized Asset Pipeline

Blog cover images now live directly inside `src/assets/blog-covers/`, so Astro can import and optimize them without relying on the temporary `picture/` directory.

Canonical folders:

```text
src/assets/blog-covers/
  canonical cover image pool used by Astro image imports and maintained by the user
```

Optional helper:

```text
scripts/prepare-blog-covers.mjs
```

This helper only reports the number of images in `src/assets/blog-covers/`. The normal build does not need to copy from `picture/`, so deleting `picture/` later will not break the site.

## 7. Cover Helper Module

Planned helper:

```text
src/lib/blogCovers.ts
```

Responsibilities:

- Use `import.meta.glob` to import cover assets from `src/assets/blog-covers/`.
- Return a list of image metadata sorted by filename.
- Provide `getCoverForPost(slug, explicitCover?)`.
- If no images exist, return a small default fallback cover using existing site imagery.

Selection rules:

1. If frontmatter `cover` is a concrete filename and it exists, use it.
2. If `cover` is `auto` or missing, use deterministic slug hashing.
3. If no cover assets exist, fall back to a default image such as `/images/flower.jpg` or a CSS placeholder.

## 8. Blog Card Rendering

The blog list should render one cover image per card.

Recommended implementation:

- Use Astro `<Image />` or `<Picture />` for cover images from `src/assets/blog-covers/`.
- Render fixed card image dimensions to prevent layout shift.
- Use `loading="lazy"` for cards below the first viewport.
- Use `decoding="async"`.
- Use `object-fit: cover` inside the polaroid-style frame.
- Keep display size modest: card cover around 260-320px wide on desktop, smaller on mobile.
- Avoid using the original full-size image as a CSS background for every card.

Visual style:

- The cover is placed inside a taped photo/polaroid frame like the reference images.
- The frame can add a pink tape strip at the top and a small pastel mark at the bottom.
- The image itself should not dominate the full card; it acts as a scrapbook photo.

## 9. Article Images

For images inside Markdown articles:

Recommended easy mode:

- Use Markdown image syntax with files stored near the post or in a shared content image folder.
- Example:

```markdown
![截图说明](./my-image.png)
```

If we want optimized Markdown images, keep article-local images inside `src/content/blog/<post-folder>/` or `src/assets/` rather than `public/`.

Recommended folder style for richer posts:

```text
src/content/blog/my-post/
  index.md
  image-01.png
  image-02.jpg
```

This keeps post text and post-specific images together and is convenient for git publishing.

## 10. Astro Islands And JavaScript Budget

This site should use Astro's island idea as a performance discipline:

Default rendering:

- Pages render as static HTML from Astro.
- Blog lists, article content, projects, friends, and me cards are server-rendered/static.
- CSS handles the visual design as much as possible.

Client-enhanced regions only:

- Dropdown navigation open/close and focus behavior.
- Right-side scroll rail progress and dragging.
- Home Scene 1 -> Scene 2 transition controls.
- Sakura petals and Scene 2 falling interest chips.
- Blog search filtering.
- Article TOC active-heading highlight.
- Clock display.

Rules:

- Do not render the whole blog as a SPA.
- Do not hydrate blog cards individually.
- Do not use client JavaScript to fetch posts for the first render.
- Do not load large animation libraries for petals or chips.
- Use native JS modules under `src/scripts/`, imported only by pages/components that need them.
- Respect `prefers-reduced-motion` and disable or reduce falling effects.
- Keep each script small and isolated.

Because this project currently avoids React/Vue/Svelte, most interactivity will be Astro HTML plus native scripts rather than framework islands. If a UI framework is introduced later, it must be limited to isolated widgets with careful hydration directives such as visible/idle loading, not site-wide hydration.

## 11. Page-Level Performance Rules

Home:

- Preload or eagerly load only the first scene's critical background/avatar assets.
- Lazy-start falling interest animation only when Scene 2 is active.
- Cap the number of simultaneous petals/chips.
- Use CSS transforms and opacity for animation, not layout-changing properties.

Blog list:

- Render all post metadata at build time.
- Load one cover per post card.
- Lazy-load below-fold images.
- Search filters existing DOM cards; it should not refetch content.

Article detail:

- Render Markdown at build time.
- Generate TOC from headings at build time if practical.
- JS only enhances active heading state.
- Avoid large client-side syntax highlighters unless required later.

Project/Friends/Me:

- Static cards with normal links.
- No JS unless needed for small decorative effects.

## 12. Future Image Growth

When more images are added to `src/assets/blog-covers/`:

- The prebuild script picks them up automatically.
- The generated cover list expands automatically.
- New posts can use the expanded pool without changing code.
- Old posts may select a different automatic cover if the pool changes. If a post needs a permanent cover, set `cover: filename.jpg` in frontmatter.

For very large image pools later:

- Add a thumbnail generation step using Astro/Sharp or a dedicated script.
- Consider limiting automatic cover candidates by subfolder or filename prefix.
- Consider adding `coverGroup` frontmatter for topic-specific pools.

## 13. Implementation Acceptance Criteria

- A new Markdown file under `src/content/blog/` appears in `/blog/` after build.
- A new image under `src/assets/blog-covers/` becomes eligible as an auto cover after build.
- Blog cards do not load every image in `src/assets/blog-covers/`.
- Blog cover images have stable dimensions and do not cause layout shift.
- Runtime JS is limited to the specified interactive widgets.
- The site keeps the visual style from `docs/visual-reference-analysis.md` while remaining fast.
