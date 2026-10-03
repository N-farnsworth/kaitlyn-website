import type { CSSProperties } from "react";
import Image from "next/image";
import { hero } from "@/data/home";
import { heroEdge, bottomEdgeClipPath } from "@/lib/edges";
import styles from "./Hero.module.css";

const { width, height, focus, edgeAnchorY } = hero.image;

// How far the anchor point sits below the photo's crop line, expressed in vw.
// The CSS uses it to put the edge's right end level with that point.
const anchorVw = ((edgeAnchorY - (focus.y / 100) * height) / width) * 100;

const heroStyle = {
  clipPath: bottomEdgeClipPath(heroEdge, "--hero-edge"),
  "--focus-y": focus.y / 100,
  "--edge-anchor": `${anchorVw.toFixed(3)}vw`,
} as CSSProperties;

export default function Hero() {
  return (
    <section className={styles.hero} style={heroStyle} aria-labelledby="hero-title">
      <div className={styles.media}>
        <Image
          src={hero.image.src}
          alt={hero.image.alt}
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className={styles.image}
          style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
        />
      </div>
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <h1 id="hero-title" className={styles.name}>
          {hero.name.map((part) => (
            <span key={part}>{part} </span>
          ))}
        </h1>
        <p className={styles.tagline}>{hero.tagline}</p>
        <hr className={styles.rule} />
        <div className={styles.intro}>
          {hero.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}