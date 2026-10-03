import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import Squiggle from "@/components/Squiggle";
import { editorials } from "@/data/editorials";
import { editorialsSection } from "@/data/home";
import { editorialsEdge, bottomEdgeClipPath } from "@/lib/edges";
import { editorialsHeadingSquiggle, editorialsSeamSquiggle } from "@/lib/squiggles";
import styles from "./Editorials.module.css";

const clipPath = bottomEdgeClipPath(editorialsEdge, "--editorials-edge");

// Slight tilt on each photo's top edge, like the mockup: [left side, right side]
const tilts = [
  ["7%", "0%"],
  ["3%", "0%"],
  ["0%", "3%"],
  ["8%", "0%"],
] as const;

export default function Editorials() {
  return (
    <div className={styles.wrap}>
      <section className={styles.editorials} style={{ clipPath }} aria-labelledby="editorials-title">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{editorialsSection.eyebrow}</p>
            <h2 id="editorials-title" className={styles.title}>
              {editorialsSection.heading}
              <Squiggle {...editorialsHeadingSquiggle} draw className={styles.headingSquiggle} />
            </h2>
          </div>
          <p className={styles.intro}>{editorialsSection.intro}</p>
        </div>

        <ol className={styles.grid}>
          {editorials.map((editorial, i) => {
            const [left, right] = tilts[i % tilts.length];
            const photoStyle = { "--tilt-left": left, "--tilt-right": right } as CSSProperties;
            const contain = editorial.cover.fit === "contain";

            return (
              <li key={editorial.slug}>
                <Link href={`/portfolio/${editorial.slug}`} className={styles.card}>
                  <span className={styles.number} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className={`${styles.photo} ${contain ? styles.contain : ""}`} style={photoStyle}>
                    <Image
                      src={editorial.cover.src}
                      alt={editorial.cover.alt}
                      fill
                      sizes="(max-width: 540px) 100vw, (max-width: 960px) 50vw, 25vw"
                      className={styles.image}
                      style={{ objectPosition: editorial.cover.focus ?? "50% 50%" }}
                    />
                  </div>
                  <h3 className={styles.cardTitle}>{editorial.title}</h3>
                  <p className={styles.summary}>{editorial.summary}</p>
                  <span className={styles.arrow} aria-hidden="true">→</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Sits on top of the seam, so it isn't cut off by the section's edge */}
      <Squiggle {...editorialsSeamSquiggle} preserveAspectRatio="none" className={styles.seamSquiggle} />
    </div>
  );
}