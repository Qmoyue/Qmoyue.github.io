# Visual Reference Analysis

This document records the actual visual reading of `picture/1.png` through `picture/10.png`. It is the concrete visual baseline for the blog implementation.

## Overall Visual Language

The reference set is a soft anime scrapbook/blog interface. It combines pale manga/anime image backgrounds, frosted glass cards, warm off-white page surfaces, pastel pink and light blue accents, and floating sakura petals. The UI feels personal, cute, airy, and natural. It is not minimalist, not corporate, not cyber, and not a generic technical portfolio.

Shared traits observed across the references:

- Backgrounds are image-led, usually anime or manga imagery with a milky white or blue-gray overlay.
- Text uses deep desaturated navy/blue-gray, not black.
- Cards use translucent warm white or pale gray surfaces with thin blue-gray borders.
- Corners are rounded, but mostly controlled and elegant rather than fully pill-shaped everywhere.
- Shadows are soft and low-opacity.
- Sakura petals float above every major page, becoming a consistent site texture.
- Small decorative UI pieces resemble tape strips, badges, rounded chips, stamps, and cute mascot icons.
- Large headings are heavy, rounded, and friendly, with generous spacing.
- Secondary text is gray-blue and calm.
- Pink is mainly used for petals, chips, decorative dots, tape, and highlights.
- Blue is soft and misty, used in backgrounds, borders, and subtle accent chips.
- The palette is warm-light overall even when a background image is cool-toned.

## Image-by-Image Observations

### 1.png: Home First Screen Composition

Observed design:

- Full-screen manga collage background, mostly grayscale, washed out by a soft white overlay.
- Center has a large anime character portrait blended into the background.
- Main title is huge, translucent, glossy, and softly multicolored, reading as an identity logo.
- A compact terminal strip sits below the title with rounded corners, frosted surface, small colored window dots, mascot icon, and typewriter-like command text.
- The upper right has a rounded announcement pill with icon and mascot. This must be omitted in our implementation.
- Pink sakura petals drift across the entire screen.
- Right side has a very thin vertical scroll rail with a small rounded indicator near the bottom.
- Bottom edge has soft pastel UI decorations and a small rounded play-like control.

Implementation lessons:

- Home Scene 1 should feel like an anime diary cover, not a portfolio hero.
- Use a manga/anime background with a pale overlay and petals.
- Keep the identity block slightly above center.
- Replace the reference title/announcement composition with our avatar plus warm terminal identity block.
- Avoid dark terminal styling; use a translucent light terminal or soft slate terminal only if heavily warmed and softened.

### 2.png: Avatar Plus Terminal Block

Observed design:

- Background continues the manga collage style.
- Left side has a circular avatar with a thick white ring, soft shadow, and a cute flower ornament rising above it.
- Right side has a large frosted terminal card with a dark blue-gray translucent fill, rounded corners, subtle border, and window-dot controls.
- Terminal content uses monospaced text, pink prompt, white/gray path text, and rounded social buttons.
- GitHub and Bilibili buttons are pill buttons with icons and frosted backgrounds.
- The avatar and terminal align as a single identity unit centered horizontally and vertically.

Implementation lessons:

- Our first-screen avatar/terminal unit should borrow this left-avatar/right-terminal relationship.
- Avatar needs a decorative ring, shadow, and possibly a small cute ornament.
- GitHub link should be a rounded icon+text button inside the terminal.
- Terminal can be slate-tinted, but must remain translucent, soft, and pastel-aware.

### 3.png: Home Second Screen Top And Falling Interests

Observed design:

- Full-screen anime background with a blue-gray overlay and visible character art.
- Huge white rounded title in the upper left/center: playful, bold, and soft.
- Small subtitle uses monospaced text with slash-separated descriptors.
- A time/weather card sits upper right with frosted glass, large clock text, date, weather, and a yellow pill label.
- Multiple colored interest chips fall from above and scatter diagonally across the lower half.
- Chips are pastel yellow, pink, mint, lavender, and blue, with rounded-pill shapes and rotated angles.
- Mascot icons are mixed into falling objects.
- There is a central quote/signature card with translucent gray surface.
- A small left-side speech panel appears like a playful note.

Implementation lessons:

- Home Scene 2 should be more dynamic and layered than normal content pages.
- The `moyue's blog` title should be large, rounded, bright, and expressive.
- Clock card should use glass styling and a badge/pill accent.
- Interest falling objects should use varied pastel colors, rotations, shadows, and occasional `doro.png`/candy items.
- The falling effect should overlap the module area slightly, then disappear.

### 4.png: Home Second Screen Footer Area

Observed design:

- The falling interest chips continue into the footer region.
- Footer is centered and text-heavy but still soft, using blue-gray text and small emoji-like markers.
- Background stays fixed behind the footer, with a broad translucent horizontal band.
- Decorative petal motion continues.
- Bottom line uses tiny monospaced status text: `sakura: falling / pig: on duty / tea: warm`.

Implementation lessons:

- Footer can be integrated into Home Scene 2 rather than feeling like a separate corporate footer.
- Use a soft translucent band and centered personal status lines.
- Small monospaced status text can reinforce the cute terminal/blog identity.

### 5.png: Expanded Navigation

Observed design:

- Navigation is a floating, rounded horizontal capsule near the top.
- The nav surface is frosted warm-white with blue-gray border and shadow.
- Items contain circular icon backgrounds, bold uppercase labels, and smaller lowercase subtitles.
- Active/hover item has a subtle pink highlight under/behind it.
- The entire menu feels like a game/anime UI panel, not a default dropdown.
- A smaller pastel handle/tab sits beneath the nav, suggesting a collapsed trigger.

Implementation lessons:

- Our closed state should show only a compact dropdown icon/handle.
- Hover/focus should reveal a floating nav capsule inspired by this image.
- Use icon circle + primary text + small subtitle for each item.
- Our required items are Home, Blog, Project, Friends, Me. We should not include Game unless later requested.
- Avoid a plain vertical select menu.

### 6.png: Blog Intro And Search

Observed design:

- Page background is warm paper/off-white with slight pink/blue gradient haze and sakura petals.
- Blog intro is a large bordered card with translucent warm fill.
- Small section marker uses pink dot plus uppercase label.
- Big `Blog` heading uses dark navy and rounded heavy type.
- Description text is medium-large gray-blue Chinese text.
- Search area is another wide bordered card below.
- Search component has left icon block with pink circular search icon and label; right side has a simple rounded input.
- Cards have very thin blue-gray borders and soft shadows.

Implementation lessons:

- Blog page should start with a generous intro card and separate search card.
- Use pink dot labels and uppercase micro-labels.
- Search should be calm and broad, not a compact technical input.

### 7.png: Blog Timeline Cards

Observed design:

- Left side timeline shows date, `updated`, vertical line, and ring marker.
- Each post card is a very wide horizontal translucent panel.
- Left side of card has a photo-frame cover, like a polaroid with tape at the top and small bottom decoration.
- Right side has metadata row, large title, description, tag chips, and word count at lower right.
- Tags are pink chips with rounded corners and gray-purple text.
- The card is spacious, soft, and readable.

Implementation lessons:

- Our blog cards should use a timeline on the left and large horizontal note cards on the right.
- Cover image should look like taped photo paper, not just a rectangle image.
- Metadata and word count should be visible but subdued.
- Entire card should be clickable with a clear hover lift or glow.

### 8.png: Article Header And TOC

Observed design:

- Article page uses a two-column layout: main article card on the left, sticky TOC card on the right.
- Main article card has warm background, thin border, and generous internal padding.
- Back link appears at top left.
- Metadata row sits above the title.
- Title is very large, dark navy, and wraps across lines.
- Tags are pink chips under the summary.
- TOC card uses uppercase `ON THIS PAGE`, then list items with pink petal/dot markers and `#` suffix styling.

Implementation lessons:

- Article detail should not be plain Markdown. It needs a framed article surface and TOC surface.
- TOC should be sticky on desktop and styled as a soft side card.
- Headings and TOC markers should use decorative left bars or pink dots.

### 9.png: Article Body Details

Observed design:

- Article headings use a vertical gradient pill/bar at the left, then large dark navy text and a pale hash mark.
- Body text is spacious and gray-blue.
- Bullets are simple but large and readable.
- The right TOC stays visible and continues the warm card style.
- Sakura petals overlay article content without destroying readability.

Implementation lessons:

- Markdown typography needs custom heading styling.
- Heading anchors should feel decorative, not documentation-like.
- Body text line-height must be generous.
- Petal overlay should be subtle and pointer-events none.

### 10.png: Me/Profile Page

Observed design:

- Layout is a profile board with left sidebar cards and large right content cards.
- Left top card contains a large circular avatar with white ring and soft shadow, plus a small circular sparkle badge.
- Left lower card has `PROFILE README`, huge Chinese display name, romanized subtitle, and self-introduction.
- Main top card has `README.MD` label with pink dot, huge heading, paragraph text, and a right-side circular badge saying `anime x code`.
- Lower main card is `TECH LINE`, with icon, Chinese heading, and a row of tech cards.
- Tech cards are soft rectangular blocks with small colored icon squares, title, and description.
- Decorative tape pieces appear near card corners.
- Petals float above all content.

Implementation lessons:

- Me page should be a soft personal board, not a resume page.
- Use left sidebar for avatar and intro, right side for README and tech/interests.
- Use tape accents, dot labels, circular badges, and card grids.
- Tech stack cards should have icon squares and short human descriptions.

## Concrete Design Decisions For Our Blog

### Palette

Use this target palette family:

- Warm paper: `#fff8f1`, `#fffaf5`, `#fdf5ee`
- Soft pink: `#f6a9c7`, `#ffd8e7`, `#f7c3d6`
- Soft blue: `#cfe8f3`, `#dceef6`, `#9ebbd2`
- Blue-gray text: `#2f405d`, `#526579`, `#748294`
- Gentle yellow: `#fff0a9`, `#ffe58a`
- Mint accent: `#ccf2de`
- Lavender accent only as small chip color, never as dominant gradient

### Surfaces

- Main cards: translucent warm white, 70%-88% opacity.
- Borders: thin blue-gray lines, around `rgba(95, 119, 140, 0.28)`.
- Shadows: soft, wide, low opacity, warm pink or gray-blue.
- Blur: use `backdrop-filter: blur(...)` where supported.
- Overlay: image backgrounds need milky overlays to keep text readable.

### Typography

- Headings: heavy, rounded, dark blue-gray.
- Micro labels: uppercase English or small Chinese labels with pink dot markers.
- Body: gray-blue, generous line height.
- Terminal/status: monospace, but softened with pastel colors.

### Decoration

- Sakura petals are a global visual texture.
- Tape strips can decorate photo frames and large cards.
- Small badges/chips should use pink, yellow, mint, blue, and restrained lavender.
- `doro.png` can appear as scroll indicator and falling/mascot decoration.
- Avoid generic SVG blobs, dark gradients, or abstract tech decorations.

## Page-Specific Style Targets

### Home Scene 1

- Similar visual density to `1.png`.
- Use `mygo1.jpg` or `flower.jpg` as background, with a manga/anime diary atmosphere.
- Identity unit follows `2.png`: circular avatar left, warm terminal/profile card right.
- Main block should sit slightly above vertical center.
- No announcement pill.
- Terminal should include GitHub button and optional small status lines.

### Home Scene 2

- Use `muzimi.png` as fixed background.
- Create a large `moyue's blog` title, subtitle/status line, clock card, profile/signature card, and interest/falling zone.
- Falling chips should imitate the playful physics-like scatter in `3.png` and `4.png`.
- Footer should blend into this scene with centered personal status lines.

### Navigation

- Closed state: small pastel handle/icon.
- Open state: horizontal frosted capsule like `5.png`.
- Each item: circular icon, uppercase route name, small subtitle.
- Required routes: HOME/front page, BLOG/notes, PROJECT/projects, FRIENDS/links, ME/profile.

### Blog Listing

- Intro and search should match the scale and calm layout of `6.png`.
- Timeline/post cards should match the composition of `7.png`.
- Photo cover should be a taped polaroid-style frame.
- Tags should be pink chips.

### Article Detail

- Two-column card layout like `8.png`.
- Custom article headings like `9.png`: left accent bar, strong heading, pale hash.
- Sticky right TOC with soft card and pink markers.

### Project Page

- Use the blog card language, but without timeline/search.
- Project cards should be long warm panels with icon/cover, title, description, tags, and GitHub target.

### Friends Page

- Use warm list cards similar to blog cards.
- Avatar on left, name/description on right, full card clickable.
- Keep the style cute and personal, like friend cards in a scrapbook.

### Me Page

- Follow `10.png` closely in layout language.
- Left column: avatar card and profile intro.
- Right column: README card, interests card, tech stack card.
- Use tape accents, circular badges, dot labels, and tech cards.

## Non-Negotiable Visual Rejection Rules

Reject and revise if any page:

- looks like a cold developer portfolio,
- relies on blue-purple gradients,
- uses black terminal/hacker styling as the dominant identity,
- removes the anime/image-led atmosphere,
- has cards that look like generic SaaS/dashboard panels,
- lacks sakura/pastel/decorative texture,
- makes the layout too sparse or too rigid,
- copies the reference site one-to-one instead of adapting it.

### 2026-07-02 Visual Correction Notes

Additional rejection rules from the latest review:

- Do not use a gray, cold, hard glass-panel look.
- Do not let the page feel like a technical dashboard with anime images pasted behind it.
- Avoid muddy gray-blue overlays that make the warm anime background feel dirty.
- Prefer warm white paper, low-saturation cherry pink, soft sky blue, and a little mint green.
- Components should feel like soft scrapbook cards or dreamy pastel widgets, not rigid SaaS panels.
- Sakura petals must be visible across the full screen, varied in size and drift, and pale enough not to block reading.
- The right scroll thumb image should sit outside the rail like the reference, not squeezed inside the track.
