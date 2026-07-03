## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Project Design Direction

This repository is being developed as a high-visual-quality anime-style personal blog using Astro, native JavaScript, and CSS.

Core style requirements:

- Use a fresh, bright, natural, cute anime-blog style.
- Use warm pastel pink-blue tones, warm white, light peach, cherry blossom pink, soft sky blue, and gentle natural accents.
- Do not use dominant blue-purple gradients.
- Do not make the site look cold, minimal, corporate, cyber, dashboard-like, gray-glass-panel-like, or like a generic developer portfolio.
- Prefer image backgrounds, warm translucent panels, paper-like cards, subtle shadows, low-contrast borders, small decorative details, and soft motion.
- Keep the site visually close to the reference family in `picture/1.png` through `picture/10.png`, while avoiding direct one-to-one copying.

Reference image usage:

- `picture/1.png`: Home first-screen layout direction. Remove the announcement area and turn the main text area into the requested avatar plus text/terminal identity block.
- `picture/2.png`: Home first-screen color and atmosphere direction.
- `picture/3.png` and `picture/4.png`: Home second-screen modular block direction.
- `picture/5.png`: Dropdown navigation direction.
- `picture/6.png`, `picture/7.png`, `picture/8.png`, and `picture/9.png`: Blog listing and article page direction.
- `picture/10.png`: Me/profile page direction.

When implementing UI, check `docs/architecture.md` and `docs/development.md` first. Those documents define the current route, component, data, animation, and visual QA plan.

## Implementation Constraints

- Use Astro components for page and component structure.
- Use native JavaScript for interactions.
- Use native CSS for styling.
- Do not introduce React, Vue, Svelte, Tailwind, or another UI framework unless explicitly requested later.
- Treat `picture/` as development reference/source material only. Runtime assets must live in `public/images/`, and blog cover candidates must live in `src/assets/blog-covers/`, so `picture/` can be deleted later without breaking the site.
- Preserve accessibility: keyboard-friendly navigation, readable contrast, image alt text, labels for inputs, and reduced-motion support.

## Visual Baseline

Before implementing or revising UI, read `docs/visual-reference-analysis.md` and preserve its visual rejection rules.


## Requirement Priority And Testing

The user's original page/module requirements are the first priority. The 10 reference images are used to lock the visual style and provide layout inspiration, but they do not override the requested module structure.

Temporary Markdown posts may be created for testing blog rendering, search, article routes, word counts, tags, and table-of-contents behavior.

During implementation:

- Keep `docs/development-log.md` updated after every completed feature.
- Test each feature after implementing it before moving to the next feature.
- Record the test result in the development log.
- For UI changes, check both the original requirement and `docs/visual-reference-analysis.md`.

## Content And Performance Baseline

For blog publishing, cover images, and interactive UI, follow `docs/content-performance-plan.md`: static-first Astro pages, deterministic build-time blog covers from `src/assets/blog-covers/`, and small page-scoped native JS only.


