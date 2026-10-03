"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { GalleryStrip } from "@/data/home";
import { useGalleryPaused } from "./GalleryMotion";
import styles from "./BoothStrip.module.css";

// ---- Tuning knobs (same as the prototype) ----
const MIN_COPIES = 3;
const EASE_MS = 220; // how quickly the drift stops and starts again
const GLIDE_DECAY = 0.94; // how much glide is left after each 16ms
const DRAG_THRESHOLD = 4; // px of movement before a press counts as a drag

// One paper strip of photos drifting sideways. The photos are repeated a few
// times so the row can loop forever: once it has moved one full set, it jumps
// back by exactly that much, which looks seamless.
export default function BoothStrip({ strip }: { strip: GalleryStrip }) {
  const paused = useGalleryPaused();
  const [copies, setCopies] = useState(MIN_COPIES);
  const [dragging, setDragging] = useState(false);

  const figureRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const { direction, speed, photos } = strip;

  useEffect(() => {
    const figure = figureRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!figure || !viewport || !track || photos.length === 0) return;

    const drift = direction === "left" ? 1 : -1;
    const state = {
      pos: 0, // how far the row has moved left, in px
      vel: 0, // glide speed after a drag, in px per ms
      factor: 1, // 0 = stopped, 1 = full drift speed
      hover: false,
      drag: null as null | { last: number; t: number; moved: number },
      setWidth: 1, // width of one set of photos
      visible: false,
    };

    // ---------- measuring ----------
    // The width of one set is the distance from the first photo to the first
    // photo of the second copy. Then make sure there are enough copies to fill
    // the strip twice over, plus one spare.
    const measure = () => {
      const first = track.children[0] as HTMLElement | undefined;
      const next = track.children[photos.length] as HTMLElement | undefined;
      if (!first || !next) return;
      state.setWidth = next.offsetLeft - first.offsetLeft || 1;
      setCopies(Math.max(MIN_COPIES, Math.ceil((2 * viewport.clientWidth) / state.setWidth) + 1));
    };
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewport);

    // ---------- animation loop ----------
    let frame = 0;
    let last = 0;
    let started = false;

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;

      const target = pausedRef.current || state.hover || state.drag ? 0 : 1;
      state.factor += (target - state.factor) * Math.min(1, dt / EASE_MS);

      if (!state.drag) {
        state.pos += drift * speed * (dt / 1000) * state.factor;
        if (Math.abs(state.vel) > 0.001) {
          state.pos += state.vel * dt; // glide after a drag
          state.vel *= Math.pow(GLIDE_DECAY, dt / 16);
        }
      }

      const w = state.setWidth;
      state.pos = ((state.pos % w) + w) % w;
      track.style.transform = `translate3d(${-state.pos}px, 0, 0)`;

      // Only keep going while the strip is on screen (or being dragged)
      frame = state.visible || state.drag ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (frame) return;
      if (!started) {
        // People who prefer less motion start paused, so don't drift at all
        state.factor = pausedRef.current ? 0 : 1;
        started = true;
      }
      frame = requestAnimationFrame((now) => {
        last = now;
        tick(now);
      });
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting;
      if (state.visible) start();
    });
    intersectionObserver.observe(figure);

    // ---------- hover and focus pause the strip ----------
    const hoverOn = () => (state.hover = true);
    const hoverOff = () => (state.hover = false);
    figure.addEventListener("pointerenter", hoverOn);
    figure.addEventListener("pointerleave", hoverOff);
    figure.addEventListener("focusin", hoverOn);
    figure.addEventListener("focusout", hoverOff);

    // ---------- dragging ----------
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      state.drag = { last: e.clientX, t: performance.now(), moved: 0 };
      state.vel = 0;
      start();
    };
    const onPointerMove = (e: PointerEvent) => {
      const drag = state.drag;
      if (!drag) return;
      const dx = e.clientX - drag.last;
      const now = performance.now();
      drag.last = e.clientX;
      drag.moved += Math.abs(dx);
      if (drag.moved > DRAG_THRESHOLD && !viewport.hasPointerCapture(e.pointerId)) {
        setDragging(true);
        try {
          viewport.setPointerCapture(e.pointerId);
        } catch {
          // The pointer may already be gone; the drag still works without capture
        }
      }
      state.pos -= dx;
      state.vel = -dx / Math.max(1, now - drag.t);
      drag.t = now;
    };
    const onPointerEnd = () => {
      if (!state.drag) return;
      state.drag = null;
      setDragging(false);
    };
    viewport.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);

    // ---------- sideways trackpad / shift+wheel ----------
    // Only sideways scrolling moves the strip, so normal page scrolling still works
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      state.pos += e.deltaX;
      state.vel = 0;
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      figure.removeEventListener("pointerenter", hoverOn);
      figure.removeEventListener("pointerleave", hoverOff);
      figure.removeEventListener("focusin", hoverOn);
      figure.removeEventListener("focusout", hoverOff);
      viewport.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
      viewport.removeEventListener("wheel", onWheel);
    };
  }, [direction, speed, photos]);

  return (
    <figure ref={figureRef} className={styles.strip}>
      <div ref={viewportRef} className={`${styles.viewport} ${dragging ? styles.dragging : ""}`}>
        <div ref={trackRef} className={styles.track}>
          {Array.from({ length: copies }, (_, copy) =>
            photos.map((photo, i) => (
              // Only the first copy is read out by screen readers
              <div key={`${copy}-${i}`} className={styles.frame} aria-hidden={copy > 0 || undefined}>
                {photo.src ? (
                  <Image
                    src={photo.src}
                    alt={copy === 0 ? photo.alt : ""}
                    fill
                    sizes="220px"
                    draggable={false}
                    className={styles.image}
                  />
                ) : (
                  <span className={styles.placeholder}>Placeholder</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <figcaption className={styles.title}>{strip.title}</figcaption>
    </figure>
  );
}
