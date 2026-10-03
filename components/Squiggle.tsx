"use client";

import { useInViewOnce } from "@/lib/useInViewOnce";
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
  const [ref, inView] = useInViewOnce<SVGSVGElement>(0.6);
  const drawn = !draw || inView;

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