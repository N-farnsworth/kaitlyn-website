"use client";

import { useEffect, useRef, useState } from "react";
import { drawInk, fitCanvas, inkText, writeInk, type Ink } from "@/lib/handwriting";
import { useInViewOnce } from "@/lib/useInViewOnce";
import styles from "./HandwrittenList.module.css";

// Pacing approved in the preview
const PEN_SPEED = 0.2;   // CSS pixels of stroke per millisecond
const LINE_PAUSE = 300;  // ms between lines
const START_DELAY = 150; // ms before the first line
const PEN_SIZE = 0.11;   // pen tip radius, as a fraction of the font size

type Line = {
  view: HTMLCanvasElement; // what's on screen
  ink: Ink;                // the finished line and its pen path
};

type Props = { items: string[]; className?: string; label?: string };

function buildLines(list: HTMLUListElement, canvases: Array<HTMLCanvasElement | null>): Line[] {
  const style = getComputedStyle(list);
  const fontPx = parseFloat(style.fontSize);
  const font = `${style.fontSize} ${style.fontFamily}`;
  const lines: Line[] = [];

  Array.from(list.children).forEach((li, i) => {
    const view = canvases[i];
    if (!view || !(li instanceof HTMLElement)) return;

    // Canvas a little bigger than the line, so loops and tails aren't cut off.
    // The ink sits exactly where the real (invisible) text sits.
    const pad = Math.ceil(fontPx * 0.35);
    const ink = inkText({
      lines: [li.textContent ?? ""],
      font,
      color: style.color,
      lineHeight: li.offsetHeight,
      pad,
      width: li.offsetWidth,
    });
    fitCanvas(view, ink);
    Object.assign(view.style, { left: `${-pad}px`, top: `${-pad}px` });
    lines.push({ view, ink });
  });

  return lines;
}

// Writes the lines one after another, with a pause between them
function animate(lines: Line[], fontPx: number): () => void {
  let stop = () => {};
  const write = (index: number, delay: number) => {
    const line = lines[index];
    if (!line) return;
    stop = writeInk(line.view, line.ink, {
      speed: PEN_SPEED,
      tip: PEN_SIZE * fontPx,
      delay,
      onDone: () => write(index + 1, LINE_PAUSE),
    });
  };
  write(0, START_DELAY);
  return () => stop();
}

const drawAll = (lines: Line[]) => lines.forEach((line) => drawInk(line.view, line.ink));

export default function HandwrittenList({ items, className, label }: Props) {
  const [listRef, inView] = useInViewOnce<HTMLUListElement>(0.4);
  const canvases = useRef<Array<HTMLCanvasElement | null>>([]);
  const lines = useRef<Line[]>([]);
  const started = useRef(false);
  const stop = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);

  // Prepare the pen paths once the font has loaded, and again after a resize
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let cancelled = false;
    let timer = 0;

    const prepare = async () => {
      const style = getComputedStyle(list);
      await document.fonts.load(`${style.fontSize} ${style.fontFamily}`).catch(() => undefined);
      if (cancelled) return;
      stop.current?.();
      lines.current = buildLines(list, canvases.current);
      // Already played (or resized mid-animation): just show it finished
      if (started.current) drawAll(lines.current);
      setReady(true);
    };

    prepare();
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(prepare, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [items, listRef]);

  // Write it out the first time the list comes into view
  useEffect(() => {
    const list = listRef.current;
    if (!ready || !inView || started.current || !list) return;
    started.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      drawAll(lines.current);
      return;
    }
    stop.current = animate(lines.current, parseFloat(getComputedStyle(list).fontSize));
  }, [ready, inView, listRef]);

  // Stop the animation if the page changes mid-way
  useEffect(() => () => stop.current?.(), []);

  return (
    <ul ref={listRef} className={`${styles.list} ${className ?? ""}`} aria-label={label}>
      {items.map((item, i) => (
        <li key={item} className={styles.item}>
          <span className={styles.text}>{item}</span>
          <canvas
            ref={(el) => {
              canvases.current[i] = el;
            }}
            className={styles.canvas}
            aria-hidden="true"
          />
        </li>
      ))}
    </ul>
  );
}
