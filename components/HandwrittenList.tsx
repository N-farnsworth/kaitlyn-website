"use client";

import { useEffect, useRef, useState } from "react";
import { penPath } from "@/lib/handwriting";
import { useInViewOnce } from "@/lib/useInViewOnce";
import styles from "./HandwrittenList.module.css";

// Pacing approved in the preview
const PEN_SPEED = 0.2;   // CSS pixels of stroke per millisecond
const LINE_PAUSE = 300;  // ms between lines
const START_DELAY = 150; // ms before the first line
const PEN_SIZE = 0.11;   // pen tip radius, as a fraction of the font size

type Line = {
  view: HTMLCanvasElement;   // what's on screen
  glyph: HTMLCanvasElement;  // the finished line
  reveal: HTMLCanvasElement; // where the pen has been so far
  path: Array<[number, number]>;
  drawn: number;
};

type Props = { items: string[]; className?: string; label?: string };

const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);

function drawFull(line: Line) {
  const ctx = line.view.getContext("2d")!;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, line.view.width, line.view.height);
  ctx.drawImage(line.glyph, 0, 0);
}

function buildLines(list: HTMLUListElement, canvases: Array<HTMLCanvasElement | null>): Line[] {
  const style = getComputedStyle(list);
  const fontPx = parseFloat(style.fontSize);
  const font = `${style.fontSize} ${style.fontFamily}`;
  const dpr = pixelRatio();
  const lines: Line[] = [];

  Array.from(list.children).forEach((li, i) => {
    const view = canvases[i];
    if (!view || !(li instanceof HTMLElement)) return;
    const text = li.textContent ?? "";

    // Canvas a little bigger than the line, so loops and tails aren't cut off
    const pad = Math.ceil(fontPx * 0.35);
    const cssW = li.offsetWidth + pad * 2;
    const cssH = li.offsetHeight + pad * 2;
    const w = Math.ceil(cssW * dpr);
    const h = Math.ceil(cssH * dpr);
    Object.assign(view.style, { left: `${-pad}px`, top: `${-pad}px`, width: `${cssW}px`, height: `${cssH}px` });
    view.width = w;
    view.height = h;

    // Draw the finished line exactly where the real (invisible) text sits
    const glyph = document.createElement("canvas");
    glyph.width = w;
    glyph.height = h;
    const g = glyph.getContext("2d")!;
    g.scale(dpr, dpr);
    g.font = font;
    g.fillStyle = style.color;
    const m = g.measureText(text);
    const ascent = m.fontBoundingBoxAscent ?? fontPx * 0.8;
    const descent = m.fontBoundingBoxDescent ?? fontPx * 0.25;
    g.fillText(text, pad, pad + (li.offsetHeight - (ascent + descent)) / 2 + ascent);

    // Work out the pen path from the drawn letters
    const pixels = g.getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) mask[p] = pixels[p * 4 + 3] > 90 ? 1 : 0;

    const reveal = document.createElement("canvas");
    reveal.width = w;
    reveal.height = h;
    lines.push({ view, glyph, reveal, path: penPath(mask, w, h), drawn: 0 });
  });

  return lines;
}

function animate(lines: Line[], fontPx: number): () => void {
  const dpr = pixelRatio();
  const speed = PEN_SPEED * dpr;
  const radius = PEN_SIZE * fontPx * dpr;
  let index = 0;
  let lineStart = performance.now() + START_DELAY;
  let frame = 0;

  for (const line of lines) {
    line.drawn = 0;
    line.reveal.getContext("2d")!.clearRect(0, 0, line.reveal.width, line.reveal.height);
    line.view.getContext("2d")!.clearRect(0, 0, line.view.width, line.view.height);
  }

  const step = (now: number) => {
    const line = lines[index];
    if (!line) return;
    const target = Math.min(line.path.length, Math.max(0, Math.floor((now - lineStart) * speed)));

    // Move the pen: stamp its tip along the path
    const r = line.reveal.getContext("2d")!;
    r.fillStyle = "#000";
    for (let i = line.drawn; i < target; i++) {
      const [x, y] = line.path[i];
      r.beginPath();
      r.arc(x, y, radius, 0, Math.PI * 2);
      r.fill();
    }
    line.drawn = target;

    // Show only the parts of the letters the pen has passed over
    const v = line.view.getContext("2d")!;
    v.globalCompositeOperation = "source-over";
    v.clearRect(0, 0, line.view.width, line.view.height);
    v.drawImage(line.reveal, 0, 0);
    v.globalCompositeOperation = "source-in";
    v.drawImage(line.glyph, 0, 0);

    if (target >= line.path.length) {
      drawFull(line); // end crisp and complete
      index++;
      lineStart = now + LINE_PAUSE;
    }
    frame = requestAnimationFrame(step);
  };

  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

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
      if (started.current) lines.current.forEach(drawFull);
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
      lines.current.forEach(drawFull);
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