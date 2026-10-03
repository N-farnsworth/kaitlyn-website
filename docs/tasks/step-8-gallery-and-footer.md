# Step 8 — Gallery section + shared Footer

Three parts, done in order. Part A is a small refactor that B and C rely on.

- **Part A:** share the hero's torn-edge sizing (code given, follow exactly)
- **Part B:** the footer (code given, follow exactly)
- **Part C:** the gallery section (spec + approved prototype, you write the code)

## 0. Check the current state first (report before changing anything)

- `components/home/Hero.tsx` computes `anchorVw` and sets `--focus-y` / `--edge-anchor` inline.
- `components/home/Hero.module.css` defines `--hero-overhang`, `--hero-height`, `--hero-edge` inside `.hero`, plus a `@media (max-aspect-ratio: 9 / 8)` override of `--hero-edge`.
- `components/Footer.tsx` is still the old simple footer (just a © line), or the new footer from the chat if the developer already pasted it. Either way, Part B replaces it.
- `components/home/About.module.css`: `.about` has `position: relative; z-index: 1;`.
- `app/globals.css` defines `--about-edge` in `:root`.
- `public/images/footer.jpg` exists (it ships with this task).

If anything differs, stop and tell the developer.

---

## Part A — Share the hero edge sizing

The hero, the footer (its matching "other half"), and the gallery (which needs room for the footer's edge) all need the same edge size. Move it to one place.

### A1. New file `lib/heroEdge.ts`

```ts
import type { CSSProperties } from "react";
import { hero } from "@/data/home";

// The hero's torn edge is sized so its high right end lines up with a point in
// the hero photo (edgeAnchorY). These two values feed the `.hero-edge` class in
// globals.css. Anything that needs the same edge size uses both.
const { width, height, focus, edgeAnchorY } = hero.image;
const anchorVw = ((edgeAnchorY - (focus.y / 100) * height) / width) * 100;

export const heroEdgeVars = {
  "--focus-y": focus.y / 100,
  "--edge-anchor": `${anchorVw.toFixed(3)}vw`,
} as CSSProperties;
```

### A2. `app/globals.css` — add at the end of the file

```css
/* ============ Hero edge size (shared) ============ */
/* Used by the hero, the footer (its torn "other half") and the gallery.
   Needs the inline variables from lib/heroEdge.ts on the same element. */
.hero-edge {
  --hero-overhang: clamp(1.5rem, 3vw, 3rem);
  --hero-height: calc(100svh + var(--hero-overhang));
  --hero-edge: max(
    4rem,
    calc((1 - var(--focus-y)) * var(--hero-height) - var(--edge-anchor))
  );
}

/* Tall, narrow screens (phones): the photo crops differently, so use the
   mockup's slant instead. Revisited in the mobile pass. */
@media (max-aspect-ratio: 9 / 8) {
  .hero-edge {
    --hero-edge: clamp(4.5rem, 10.7vw, 11rem);
  }
}
```

### A3. `components/home/Hero.module.css`

- Delete the three variable lines `--hero-overhang`, `--hero-height`, `--hero-edge` (and their comments) from `.hero`. Keep everything else in `.hero`.
- Delete the whole `@media (max-aspect-ratio: 9 / 8) { .hero { --hero-edge: … } }` block.

### A4. `components/home/Hero.tsx`

- Remove the `width, height, focus, edgeAnchorY` destructure and the `anchorVw` line, but keep using `hero.image.focus` for `objectPosition`.
- Import `heroEdgeVars` from `@/lib/heroEdge`.
- The style becomes `{ ...heroEdgeVars, clipPath: bottomEdgeClipPath(heroEdge, "--hero-edge") }`.
- The section's className becomes `` `${styles.hero} hero-edge` ``.
- Keep `objectPosition` working: replace the `focus.x`/`focus.y` references with `hero.image.focus.x`/`hero.image.focus.y`.

**Check:** the hero must look exactly as before (the edge's right end still level with the lamp's brass arm).

---

## Part B — The footer (follow exactly)

### B1. New file `data/contact.ts`

```ts
export const footer = {
  heading: "Reach Out",
  links: [
    { label: "Email", href: "mailto:kaitlynquinn05@gmail.com", icon: "email" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/kaitlyn-quinn-63882b3b0/", icon: "linkedin", external: true },
    { label: "Résumé", href: "/resume", icon: "resume" },
  ],
  name: "Kaitlyn Jayne",
  image: {
    // The bottom half of the hero photo, as if the photo was torn apart
    src: "/images/footer.jpg",
  },
} as const;
```

### B2. `lib/edges.ts` — add at the end

```ts
// The same kind of clip, but cutting a section's TOP along the edge.
// Used by the footer so its top fits the hero's bottom like two torn halves.
export function topEdgeClipPath(points: readonly EdgePoint[], sizeVar: string): string {
  const curve = smooth(points).map(
    ([x, d]) => `${(x * 100).toFixed(2)}% calc((1 - ${d.toFixed(4)}) * var(${sizeVar}))`
  );
  return `polygon(${curve.join(", ")}, 100% 100%, 0% 100%)`;
}
```

### B3. Replace all of `components/Footer.tsx`

```tsx
import Image from "next/image";
import Link from "next/link";
import { footer } from "@/data/contact";
import { heroEdge, topEdgeClipPath } from "@/lib/edges";
import { heroEdgeVars } from "@/lib/heroEdge";
import styles from "./Footer.module.css";

// Same edge size and shape as the hero's bottom, so the two halves fit
const footerStyle = {
  ...heroEdgeVars,
  clipPath: topEdgeClipPath(heroEdge, "--hero-edge"),
};

const icons = {
  email: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V16M8 7.75v.01M11.5 16v-5.5M11.5 13c0-1.5 1-2.5 2.25-2.5S16 11.5 16 13v3" />
    </svg>
  ),
  resume: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5Z" />
      <path d="M14 3v4.5h4.5M9 12h6M9 15.5h6" />
    </svg>
  ),
};

export default function Footer() {
  return (
    <footer className={`${styles.footer} hero-edge`} style={footerStyle}>
      <div className={styles.media}>
        <Image src={footer.image.src} alt="" fill sizes="100vw" className={styles.image} />
      </div>
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.inner}>
        <h2 className={styles.heading}>{footer.heading}</h2>
        <ul className={styles.links}>
          {footer.links.map((link) => {
            const content = (
              <>
                <span className={styles.icon}>{icons[link.icon]}</span>
                {link.label}
              </>
            );
            return (
              <li key={link.label}>
                {link.href.startsWith("/") ? (
                  <Link href={link.href} className={styles.link}>
                    {content}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={styles.link}
                    {...("external" in link && link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {content}
                    {"external" in link && link.external && (
                      <span className={styles.srOnly}> (opens in a new tab)</span>
                    )}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <p className={styles.legal}>
        © {new Date().getFullYear()} {footer.name}
      </p>
    </footer>
  );
}
```

### B4. New file `components/Footer.module.css` (replace it if it exists)

```css
.footer {
  position: relative;
  z-index: 3;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  /* Tuck up under whatever section is above, so the torn edge sits on it */
  margin-top: calc(-1 * var(--hero-edge));
  min-height: calc(var(--hero-edge) + clamp(22rem, 50svh, 34rem));
  padding: calc(var(--hero-edge) + var(--space-xl)) var(--gutter) var(--space-md);
  color: var(--color-on-photo);
}

.media {
  position: absolute;
  inset: 0;
  z-index: -2;
}

/* Show the top of the photo first: that's the torn side */
.image {
  object-fit: cover;
  object-position: 50% 0%;
}

.overlay {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    to bottom,
    rgba(30, 22, 19, 0.25) 0%,
    rgba(30, 22, 19, 0.55) 45%,
    rgba(30, 22, 19, 0.8) 100%
  );
}

.inner {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-lg);
}

.heading {
  font-size: clamp(3rem, 2rem + 4vw, 6rem);
  font-weight: 300;
  line-height: 0.95;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(1.25rem, 3vw, 2.5rem);
  list-style: none;
}

.link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid transparent;
  font-size: var(--text-xs);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition: border-color 0.3s ease;
}

.link:hover {
  border-color: currentColor;
}

.icon {
  display: inline-flex;
  width: 1.15rem;
  height: 1.15rem;
}

.icon svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.legal {
  margin-top: var(--space-xl);
  padding-top: var(--space-sm);
  border-top: 1px solid color-mix(in srgb, currentColor 25%, transparent);
  font-size: var(--text-xs);
  opacity: 0.8;
}

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

`app/layout.tsx` already renders `<Footer />` on every page; no change needed there.

---

## Part C — The Gallery section (you write this)

**Reference:** `docs/prototypes/gallery-booth-preview.html` is the approved design. Match its look and behavior, with the changes listed below. Open it and read its CSS and script before writing anything.

### C1. Content: add to the bottom of `data/home.ts` (use as written)

```ts
export type GalleryPhoto = {
  /** Leave out src to show a placeholder tile */
  src?: string;
  alt: string;
};

export type GalleryStrip = {
  title: string;
  direction: "left" | "right";
  /** Drift speed in CSS pixels per second */
  speed: number;
  photos: GalleryPhoto[];
};

const placeholders = (count: number): GalleryPhoto[] =>
  Array.from({ length: count }, () => ({ alt: "Placeholder" }));

export const gallerySection: {
  heading: string;
  intro: string;
  link: { label: string; href: string };
  strips: GalleryStrip[];
} = {
  heading: "The Gallery",
  intro:
    "A curated collection of previous designs, visuals, imagery, and some behind-the-scenes moments that shapes my creative perspective.",
  link: { label: "Explore the gallery", href: "/portfolio/gallery" },
  // Placeholder titles and tiles until her photos arrive (6+ per strip, ideally 10–15)
  strips: [
    { title: "campaigns", direction: "left", speed: 34, photos: placeholders(10) },
    { title: "behind the scenes", direction: "right", speed: 28, photos: placeholders(10) },
  ],
};
```

Keep the intro text exactly as written (her wording, including "shapes").

### C2. Files to create

- `components/home/Gallery.tsx` (server component): the section, header, and pause control wiring.
- `components/home/BoothStrip.tsx` (`"use client"`): one moving strip.
- A small client piece for the shared Pause button and paused state (or make `Gallery.tsx` a thin client wrapper; your call, keep server/client split sensible).
- CSS Modules for each.
- Add `<Gallery />` to `app/page.tsx` after `<About />`.

### C3. Section layout

- **Header row** like the prototype: "The Gallery" heading (Cormorant, same size as the Editorials heading, `id="gallery-title"`, section `aria-labelledby`); her intro; on the right, the link styled like About's "More about me" link (small caps, underline, arrow `→` that nudges on hover) going to `/portfolio/gallery`, and under it the **Pause motion** button (pill, mushroom border, `aria-pressed`, label switches to "Play motion"). No label/eyebrow above the heading.
- **Tuck under About's edge:** `margin-top: calc(-1 * var(--about-edge))`, top padding includes `var(--about-edge)`. `position: relative; z-index: 0` so About (z-index 1) stays on top.
- **Leave room for the footer's torn edge:** put the `hero-edge` class and `heroEdgeVars` on the section, and give it `padding-bottom: calc(var(--hero-edge) + var(--space-xl))`, so the footer (which tucks up by `--hero-edge`) never covers the strips.
- Background `var(--color-bg)`. No clip-path on the gallery itself; the footer's torn edge is the boundary.

### C4. The strips (match the prototype)

- Two paper strips stacked, `width: min(94%, 82rem)`, centered; strip 1 `rotate(-1.4deg)`, strip 2 `rotate(0.9deg) translateX(1.5%)`. Copy the prototype's paper background and box-shadows, the 10px padding, 7px gap, frame size `clamp(140px, 15vw, 220px)` at `aspect-ratio: 5 / 4`.
- **Title at the end of each strip** in Reenie Beanie (`var(--font-hand)`), like the prototype's `.title`. It's the strip's `<figcaption>` (strip = `<figure>`).
- **Placeholder tile** (when `src` is missing): background `var(--color-accent)`; the word "Placeholder" centered in `var(--color-on-photo)`, Inter, `var(--text-xs)`, `letter-spacing: 0.16em`, uppercase.
- **Real photo** (when `src` is set): `next/image` with `fill`, `sizes="220px"`, `object-fit: cover`, same hover as the prototype (opacity .9 → 1, slight scale).
- **Not clickable:** frames are plain elements (no buttons, links, or lightbox).
- **Accessibility:** the first copy of each photo uses its `alt`; repeated copies are `aria-hidden="true"` with `alt=""`.

### C5. Motion (match the prototype's script)

- `requestAnimationFrame` loop. `direction: "left"` drifts left. Speed from data.
- `factor` eases toward 0 when the strip is hovered or focused, while dragging, or while paused, and toward 1 otherwise (about 220ms, like the prototype).
- Seamless loop: wrap the position by one set's width, measured from the DOM (the offset of the first item of the second copy). **Render enough copies to cover at least twice the strip's visible width plus one extra** (minimum 3), so any photo count loops correctly. Re-measure on resize.
- **Drag** with pointer events, gliding after release (velocity decays ~0.94 per 16ms), `touch-action: pan-y`. Dragging must not trigger anything else.
- **Wheel:** only respond when `|deltaX| > |deltaY|` (sideways trackpad / shift+wheel). Never hijack normal vertical scrolling.
- Only animate while the strip is on screen (IntersectionObserver). Stop the loop on unmount.
- **Reduced motion:** start paused (no auto-drift); dragging still works.
- Remember the layout gotcha: `min-width: 0` on the strip and viewport, and `grid-template-columns: minmax(0, 1fr)` on the strips' grid.

### C6. Smaller screens

Keep it simple for now (the mobile pass comes later): header stacks into one column under ~860px; strips go full width under ~600px; the title column narrows (prototype values).

---

## Finish

Run `npm run lint` and `npm run build` and fix only errors caused by this task. Then report the files changed, anything that didn't match expectations, and a suggested commit message:
`Add gallery booth strips and torn-photo footer`. Don't commit.

## What the developer will check in the browser

1. The hero looks exactly as before (Part A didn't change it).
2. Below About: "The Gallery", her intro, the link and Pause button, then two tilted paper strips of oxblood "PLACEHOLDER" tiles drifting in opposite directions, each with a handwritten title at the end.
3. Hover stops a strip; dragging moves it; the Pause button stops both; normal page scrolling still works over the strips.
4. Below the gallery: the footer with the bottom half of the photo, its top edge the same torn curve as the hero's bottom; "Reach Out"; Email, LinkedIn (new tab), Résumé (→ /resume) with icons; the © line.
5. The footer's torn edge doesn't cover the strips.
6. `/about` and `/resume` also show the footer.
