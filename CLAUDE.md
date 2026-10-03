@AGENTS.md

# Kaitlyn Jayne — portfolio website

Personal portfolio for Kaitlyn, a marketing student at Texas A&M (Class of 2027).
Audience: recruiters and hiring managers (linked from LinkedIn, her resume, job applications).
It is also a class assignment whose only requirement is that the site works.

- **Kaitlyn is the client** and makes all design decisions.
- **The developer** (a computer engineering student; this is his first website) builds it.
- Planning and design decisions happen in a separate Claude.ai chat. Tasks arrive here as files in `docs/tasks/`.
- Later, Kaitlyn will edit content herself through a headless CMS.

## How to work (important)

1. **Baby steps.** Do exactly one task at a time. Never start the next step on your own.
2. **Plan before code.** Before editing anything, check the repo's current state, say what you will change and why, and wait for approval.
3. **Follow task files exactly.** When a task gives code, use it as written. When a task gives a spec instead, match the spec and the referenced prototype. If the repo doesn't match what the task expects, stop and report it instead of improvising.
4. **Ask when unsure.** Design questions go to Kaitlyn via the developer; don't invent design choices.
5. **Don't install packages** unless the task says to.
6. **Don't commit.** When a task is done, run `npm run lint` and `npm run build`, list the files you changed, and suggest a commit message. The developer checks the site in the browser and commits himself.
7. Explain things in plain language; the developer is learning.

## Stack

- Next.js 16 (App Router), React 19, TypeScript. `app/` is at the project root (no `src/`). Import alias `@/` = project root.
- Styling: plain CSS. Global design tokens in `app/globals.css`, component styles in CSS Modules. **No Tailwind.**
- Fonts via `next/font/google` in `app/layout.tsx`: Cormorant Garamond (`--font-display`), Inter (`--font-body`), Reenie Beanie (`--font-hand`, handwritten notes).
- Not installed yet: GSAP + ScrollTrigger (planned for the peel effect), Motion. Hosting on Vercel. CMS later.

## Conventions

- **Content lives in `data/*.ts`**, never hard-coded in components (so a CMS can replace it later).
- Page sections live in `components/<page>/` (e.g. `components/home/Hero.tsx` + `Hero.module.css`). Shared pieces in `components/`. Helpers and hooks in `lib/`.
- Images in `public/images/...`, rendered with `next/image`. Every meaningful image needs alt text; decorative ones get `alt=""`. Strip location metadata from phone photos before adding them.
- Use the token variables from `globals.css`. Components use the purpose tokens (`--color-accent`), not the raw palette names (`--oxblood`).
- Respect `prefers-reduced-motion` (a global rule exists in `globals.css`; JS animations must check it too).
- Text over photos needs a dark overlay for contrast.
- Interactive pieces are small client components (`"use client"`); sections stay server components where possible.
- `lib/useInViewOnce.ts` is the shared "play once when it comes into view" hook.
- **Layout gotcha:** flex/grid children holding a long sliding row need `min-width: 0` (and grids `minmax(0, 1fr)` columns), or they grow to the row's width and get pushed off screen.

## Design decisions (locked)

**Palette** (`globals.css`)
| Token | Hex | Use |
|---|---|---|
| `--ivory` → `--color-bg`, `--color-on-photo` | #F7F2EC | main background, text on dark photos |
| `--taupe` → `--color-surface` | #D8CEC4 | softer sections, secondary elements |
| `--mushroom` → `--color-border` | #A9988B | borders, dividers, squiggles: **never text** (contrast 2.5:1) |
| `--espresso` → `--color-text` | #3A2E2A | all text |
| `--oxblood` → `--color-accent` | #7E4B4B | buttons, hovers, small accents only |

**Name on the site:** Kaitlyn Jayne, monogram **KJ** (her email/LinkedIn use "Quinn"; leave as is unless told otherwise).

**Nav** (`components/Nav.tsx`, `data/navigation.ts`): KJ monogram; Home · About · Resume · Portfolio ▾. The dropdown is built from `data/editorials.ts` plus Gallery. The nav sits over each page's hero and scrolls away (not sticky). Text is espresso by default; pages in `darkHeroPaths` get ivory text. Phone menu comes later (full-screen ivory overlay, large serif links, Portfolio expands in place).

**Editorials:** Koll, Malek, Admiral Catering, Finding Our Way (slugs `koll`, `malek`, `admiral-catering`, `finding-our-way`).

**Contact info** lives only in the footer. No contact page.

## Pages

```
app/page.tsx                    Home
app/about/page.tsx              About
app/resume/page.tsx             Resume (+ PDF download)
app/portfolio/page.tsx          Portfolio landing (not designed yet)
app/portfolio/gallery/page.tsx  Gallery
app/portfolio/[slug]/page.tsx   Editorial template
```

Mockups are in `docs/mockups/`. They're AI-generated and not final; the mockups' "Kaitlyn Quinn / KQ" text is wrong for the site (use Kaitlyn Jayne / KJ).

## Home page

Sections, in order: **Hero → Editorials → About → Gallery**, then the shared **Footer** (from `layout.tsx`).

- Each section's bottom edge is a curve traced from the mockup, stored in `lib/edges.ts` and applied with `clip-path`. Each next section tucks up under the previous one's edge (negative top margin), with a lower `z-index` so the edge stays on top.
- The **hero** is a bit taller than the screen. Its edge's high right end lines up with the lamp's brass arm in her photo (`edgeAnchorY` in `data/home.ts`). On load, an ivory wedge shows bottom-right as the scroll cue.
- The **Editorials** heading squiggle and the Editorials→About seam squiggle draw themselves once when first seen (`components/Squiggle.tsx`).
- The **About** handwritten list writes itself with a pen effect once when first seen (`components/HandwrittenList.tsx`, `lib/handwriting.ts`).
- The **Gallery**: two sideways photo-booth paper strips that drift in opposite directions (approved prototype: `docs/prototypes/gallery-booth-preview.html`).
- The **Footer** is the bottom half of the hero photo. Its top edge is the same torn curve as the hero's bottom, as if the photo was pulled apart (approved prototype: `docs/prototypes/torn-footer-preview.html`).

### The peel effect (planned, not built yet)

When a section's peel corner reaches the bottom of the screen, the page pins and the section peels away diagonally like a sticker, revealing the next section. Corners alternate: Hero bottom-left, Editorials bottom-right, About bottom-left. The Gallery doesn't peel. About one screen of scrolling per peel. The page bends as it lifts, and its back shows a crumpled ivory paper texture. Scrolling up reverses it. Reference: `docs/prototypes/peel-prototype.html`. It will be built as a `<PeelSection>` wrapper around each section, after a planning step.

## Progress

- [x] Skeleton, design tokens, fonts, nav
- [x] Home: Hero, Editorials (+ squiggles), About (+ handwritten list)
- [ ] Home: Gallery + shared Footer → `docs/tasks/step-8-gallery-and-footer.md`
- [ ] Next: the peel effect, then the mobile pass, then the other pages
