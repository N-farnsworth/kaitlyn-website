import Image from "next/image";
import { hero } from "@/data/home";
import { heroEdge, bottomEdgeClipPath } from "@/lib/edges";
import { heroEdgeVars } from "@/lib/heroEdge";
import styles from "./Hero.module.css";

const heroStyle = { ...heroEdgeVars, clipPath: bottomEdgeClipPath(heroEdge, "--hero-edge") };

export default function Hero() {
  return (
    <section className={`${styles.hero} hero-edge`} style={heroStyle} aria-labelledby="hero-title">
      <div className={styles.media}>
        <Image
          src={hero.image.src}
          alt={hero.image.alt}
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className={styles.image}
          style={{ objectPosition: `${hero.image.focus.x}% ${hero.image.focus.y}%` }}
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