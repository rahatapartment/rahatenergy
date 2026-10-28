"use client";

import { useEffect, useRef } from "react";

/** Native sticky positioning handles the pin; this only decorates the scene. */
export function usePinnedScene() {
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous = -1;
    const update = () => {
      frame = 0;
      const progress = motion.matches
        ? 0
        : Math.min(
            1,
            Math.max(0, -element.getBoundingClientRect().top / innerHeight),
          );
      if (progress !== previous) {
        element.style.setProperty("--scene-progress", String(progress));
        previous = progress;
      }
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", scroll);
    motion.addEventListener("change", scroll);
    return () => {
      removeEventListener("scroll", scroll);
      removeEventListener("resize", scroll);
      motion.removeEventListener("change", scroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return stage;
}
