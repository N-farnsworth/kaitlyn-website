"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import HandwrittenNote from "@/components/HandwrittenNote";
import type { Editorial } from "@/data/editorials";
import { doodles, numberCircle, titleUnderline } from "@/lib/squiggles";
import styles from "./EditorialCard.module.css";

type Props = {
  editorial: Editorial;
  index: number;
  /** Tilt of the photo's top edge: [left side, right side] */
  tilt: readonly [string, string];
};

// One editorial card. On hover or keyboard focus, a pen circles the number,
// underlines the title, writes a short note and draws a doodle.
export default function EditorialCard({ editorial, index, tilt }: Props) {
  const [active, setActive] = useState(false);
  const [writeMs, setWriteMs] = useState<number | null>(null);

  const [left, right] = tilt;
  const photoStyle = { "--tilt-left": left, "--tilt-right": right } as CSSProperties;
  const contain = editorial.cover.fit === "contain";
  // The doodle starts right after the note is written
  const cardStyle =
    writeMs === null ? undefined : ({ "--doodle-delay": `${(writeMs / 1000).toFixed(2)}s` } as CSSProperties);

  const on = () => setActive(true);
  const off = () => setActive(false);

  return (
    <Link
      href={`/portfolio/${editorial.slug}`}
      className={`${styles.card} ${active ? styles.on : ""}`}
      style={cardStyle}
      onPointerEnter={on}
      onPointerLeave={off}
      onFocus={on}
      onBlur={off}
    >
      <span className={styles.number} aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
        <svg className={`${styles.pen} ${styles.circle}`} viewBox={numberCircle.viewBox} aria-hidden="true">
          <path pathLength={1} d={numberCircle.d} />
        </svg>
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
      <div className={styles.titleWrap}>
        <h3 className={styles.cardTitle}>{editorial.title}</h3>
        <svg
          className={`${styles.pen} ${styles.underline}`}
          viewBox={titleUnderline.viewBox}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path pathLength={1} d={titleUnderline.d} />
        </svg>
      </div>
      <p className={styles.summary}>{editorial.summary}</p>
      <div className={styles.foot}>
        <span className={styles.arrow} aria-hidden="true">→</span>
        <span className={styles.note} aria-hidden="true">
          <HandwrittenNote text={editorial.note} active={active} onDuration={setWriteMs} />
          <svg className={`${styles.pen} ${styles.doodle}`} viewBox="0 0 40 40" aria-hidden="true">
            <path pathLength={1} d={doodles[editorial.doodle]} />
          </svg>
        </span>
      </div>
    </Link>
  );
}
