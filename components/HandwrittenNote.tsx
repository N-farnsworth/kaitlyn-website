"use client";

import { useEffect, useRef, useState } from "react";
import { clearInk, drawInk, fitCanvas, inkDuration, inkText, writeInk, type Ink } from "@/lib/handwriting";
import styles from "./HandwrittenNote.module.css";

// Pacing approved in docs/prototypes/editorial-notes-preview.html
const PEN_SPEED = 0.55;  // CSS pixels of stroke per millisecond
const START_DELAY = 250; // ms before the pen starts
const PEN_SIZE = 0.11;   // pen tip radius, as a fraction of the font size
const PAD = 6;           // CSS px of room around the text
const INDENT = 0.5;      // each later line starts this much further in (in em)

type Props = {
  /** The note, with "|" for a line break */
  text: string;
  /** Write the note while true; clear it when false */
  active: boolean;
  /** Called with how long the writing takes (ms, including the start delay) */
  onDuration?: (ms: number) => void;
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function HandwrittenNote({ text, active, onDuration }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ink = useRef<Ink | null>(null);
  const fontPx = useRef(0);
  const activeRef = useRef(active);
  const stop = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Prepare the ink once the font has loaded, and again after a resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let timer = 0;

    const prepare = async () => {
      const style = getComputedStyle(canvas);
      const font = `${style.fontSize} ${style.fontFamily}`;
      await document.fonts.load(font).catch(() => undefined);
      if (cancelled) return;
      stop.current?.();
      const px = parseFloat(style.fontSize);
      fontPx.current = px;
      ink.current = inkText({
        lines: text.split("|"),
        font,
        color: style.color,
        lineHeight: px,
        pad: PAD,
        indent: px * INDENT,
      });
      fitCanvas(canvas, ink.current);
      onDuration?.(reducedMotion() ? 0 : START_DELAY + inkDuration(ink.current, PEN_SPEED));
      // Resized while showing: just show it finished
      if (activeRef.current) drawInk(canvas, ink.current);
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
  }, [text, onDuration]);

  // Write the note when it becomes active; clear it at once when it doesn't
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!ready || !canvas || !ink.current) return;
    stop.current?.();
    stop.current = null;
    if (!active) {
      clearInk(canvas);
    } else if (reducedMotion()) {
      drawInk(canvas, ink.current);
    } else {
      stop.current = writeInk(canvas, ink.current, {
        speed: PEN_SPEED,
        tip: PEN_SIZE * fontPx.current,
        delay: START_DELAY,
      });
    }
  }, [active, ready]);

  // Stop the animation if the page changes mid-way
  useEffect(() => () => stop.current?.(), []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
