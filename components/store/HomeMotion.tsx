"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Progressive enhancement: content remains visible without scripting or motion. */
export function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const configure = () => {
      observer?.disconnect();
      element.classList.remove("reveal-ready");
      if (preference.matches || !("IntersectionObserver" in window)) return;
      const targets = element.querySelectorAll<HTMLElement>("[data-reveal]");
      targets.forEach((target) => {
        if (target.getBoundingClientRect().top < innerHeight)
          target.classList.add("is-revealed");
      });
      observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer?.unobserve(entry.target);
            }
          }),
        { threshold: 0.08, rootMargin: "0px 0px -35px 0px" },
      );
      targets.forEach((target) => observer?.observe(target));
      element.classList.add("reveal-ready");
    };
    configure();
    preference.addEventListener("change", configure);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", configure);
      element.classList.remove("reveal-ready");
    };
  }, []);
  return (
    <div className="home-editorial" ref={root}>
      {children}
    </div>
  );
}
