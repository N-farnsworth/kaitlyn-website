import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { aboutSection } from "@/data/home";
import { aboutEdge, aboutPhotoEdge, bottomEdgeClipPath, rightEdgeClipPath } from "@/lib/edges";
import styles from "./About.module.css";
import HandwrittenList from "@/components/HandwrittenList";

const sectionStyle = { clipPath: bottomEdgeClipPath(aboutEdge, "--about-edge") };
// Passed as a variable so phones can turn the curve off in CSS
const photoStyle = { "--photo-clip": rightEdgeClipPath(aboutPhotoEdge) } as CSSProperties;

export default function About() {
  return (
    <section className={styles.about} style={sectionStyle} aria-labelledby="about-title">
      <div className={styles.photo} style={photoStyle}>
        <Image
          src={aboutSection.image.src}
          alt={aboutSection.image.alt}
          fill
          sizes="(max-width: 860px) 100vw, 55vw"
          className={styles.image}
          style={{ objectPosition: aboutSection.image.focus }}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.text}>
          <p className={styles.eyebrow}>{aboutSection.eyebrow}</p>
          <h2 id="about-title" className={styles.title}>
            {aboutSection.heading.map((line) => (
              <span key={line}>{line} </span>
            ))}
          </h2>
          <div className={styles.body}>
            {aboutSection.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link href={aboutSection.link.href} className={styles.link}>
            {aboutSection.link.label}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <HandwrittenList items={aboutSection.notes} className={styles.notes} label="A few favorite things" />
      </div>
    </section>
  );
}