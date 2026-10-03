"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Squiggle.module.css";

type SquiggleProps = {
  d: string;
  viewBox: string;
  className?: string;
  /** Draw the line like a pen stroke the first time it's on screen */
  draw?: boolean;
  /** Use "none" to let the line stretch to fit its box */
  preserveAspectRatio?: string;
};

export default function Squiggle({ d, viewBox, className, draw = false, preserveAspectRatio }: SquiggleProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(!draw);

  useEffect(() => {
    if (!draw || drawn) return;
    const el = ref.current;
    if (!el) return;

    // Watch for the line coming on screen, draw it once, then stop watching
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [draw, drawn]);

  return (
    <svg
      ref={ref}
      className={`${styles.squiggle} ${className ?? ""}`}
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={d}
        pathLength={1}
        className={draw ? styles.drawable : styles.still}
        data-drawn={drawn}
      />
    </svg>
  );
}