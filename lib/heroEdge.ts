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
