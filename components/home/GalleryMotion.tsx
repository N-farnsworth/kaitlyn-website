"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";
import styles from "./Gallery.module.css";

// Shared "paused" state for the gallery strips and the Pause button.
// People who ask their OS for less motion start paused; the button overrides it.

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

type GalleryMotion = { paused: boolean; togglePaused: () => void };

const GalleryMotionContext = createContext<GalleryMotion>({ paused: false, togglePaused: () => {} });

export function GalleryMotionProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false // the server can't know, so it renders the moving version
  );
  // null until the button is pressed, then whatever the person chose
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? prefersReducedMotion;

  return (
    <GalleryMotionContext.Provider value={{ paused, togglePaused: () => setUserPaused(!paused) }}>
      {children}
    </GalleryMotionContext.Provider>
  );
}

export function useGalleryPaused() {
  return useContext(GalleryMotionContext).paused;
}

export function PauseButton() {
  const { paused, togglePaused } = useContext(GalleryMotionContext);
  return (
    <button type="button" className={styles.pause} aria-pressed={paused} onClick={togglePaused}>
      {paused ? "Play motion" : "Pause motion"}
    </button>
  );
}
