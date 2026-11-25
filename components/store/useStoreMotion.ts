"use client";

import { useEffect, type RefObject } from "react";

const targets = [
  "main :is(h1, h2, h3):has(> [data-motion-line])",
  "[data-reveal]",
  ".sales-hero-copy > :is(.cinematic-eyebrow, h1, p, .sales-hero-actions)",
  ".solutions-hero-copy > :is(.cinematic-eyebrow, h1, p, a)",
  ".category-introduction > :is(.eyebrow, h2, p)",
  ".shop-heading > :is(h1, p)",
  ".shop-categories",
  ".shop-toolbar",
  ".shop-results-heading",
  ".page-heading > :is(.eyebrow, h1, p)",
  ".checkout-page-heading h1",
  ".checkout-page-heading p",
  ".checkout-panel-heading",
  ".checkout-summary-heading",
  ".checkout-panel > :is(.form-grid, .field-label, .checkout-pickup, .check-field)",
  ".checkout-summary-items",
  ".checkout-summary-assurance",
  ".cart-summary",
  ".cart-list > *",
  ".pdp-buying-panel > :is(h1, .pdp-intro, .pdp-price)",
  ".pdp-gallery-stage .pdp-photo-open > img",
  ".pdp-section > :is(h2, .pdp-section-heading, .pdp-related-heading)",
  ".pdp-feature-grid > article",
  ".shop-product-grid > article",
  ".category-product-grid > article",
  ".product-related-grid > article",
  ".shop-empty",
  ".solutions-introduction > :is(.eyebrow, h2, p)",
  ".solutions-perspectives-heading",
  ".perspective-editorial-card",
  ".about-perspective-copy",
  ".about-principles-heading",
  ".about-collection-heading",
  ".about-category",
  ".contact-route",
  ".contact-enquiry-introduction",
  ".contact-confirmed-channels",
  ".contact-private-order",
  ".element-topline",
  ".element-editorial > :is(h2, p, .element-tabs)",
  ".element-panel",
  ".energy-introduction > h2",
  ".introduction-bottom",
  ".introduction-footnote",
  ".home-products-heading",
  ".living-path",
  ".journey-heading",
  ".chapter-action",
  ".footer-invitation h2",
  ".footer-invitation-actions",
  ".footer-brand-block",
  ".footer-directory-column",
  ".footer-legal-row",
  "main section :is(h2, h3, p, figure, article, details)",
  "main .faq-list > *",
].join(",");

type Motion = "glide" | "fade" | "lift";
const motionSequence: Motion[] = ["glide", "fade", "lift"];
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => value * value * (3 - 2 * value);

export function useStoreMotion(root: RefObject<HTMLDivElement>, pathname: string) {
  useEffect(() => {
    const surface = root.current;
    if (!surface || pathname.startsWith("/admin") ||
        !("IntersectionObserver" in window)) return;

    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const visible = new Set<HTMLElement>();
    const styled = new Map<HTMLElement, { y: number; scale: number; opacity: number; enter: number }>();
    const sections = new WeakMap<Element, Motion>();
    const timing = new WeakMap<Element, { motion: Motion; beat: number; hero: boolean }>();
    let frame = 0;
    let hasScrolled = false;
    let previousFrame = 0;
    let inViewBefore = new WeakSet<HTMLElement>();
    const interior = pathname !== "/";

    const reset = (target: HTMLElement) => {
      target.removeAttribute("data-scroll-motion");
      target.style.removeProperty("--store-scroll-x");
      target.style.removeProperty("--store-scroll-y");
      target.style.removeProperty("--store-scroll-scale");
      target.style.removeProperty("--store-scroll-opacity");
      target.style.removeProperty("--store-scroll-reveal");
      styled.delete(target);
    };
    const render = (timestamp: number) => {
      frame = 0;
      const elapsed = previousFrame ? Math.min(32, timestamp - previousFrame) : 16;
      previousFrame = timestamp;
      let easingInProgress = false;
      const height = window.innerHeight;
      const scroll = window.scrollY;
      const remainingScroll = document.documentElement.scrollHeight - height - scroll;
      const heroScale = 1 + clamp(scroll / height) * 0.11;
      const enteringDistance = Math.min(height * 0.39, 350);
      const exitingDistance = Math.min(height * 0.21, 185);
      const compact = height < 720 || window.innerWidth < 700;

      // Read positions before writing styles. Subtract only our own offset.
      const positions = Array.from(visible, (target) => {
        if (target.matches(":focus-within"))
          return { target, x: 0, y: 0, scale: 1, opacity: 1, baseOpacity: 1, enter: 0 };
        const bounds = target.getBoundingClientRect();
        const previous = styled.get(target);
        const { motion, beat, hero } = timing.get(target) ?? { motion: "lift", beat: 0, hero: false };
        const offset = previous?.y ?? 0;
        const scaleInset = (bounds.height / (previous?.scale ?? 1) - bounds.height) / 2;
        const top = bounds.top - offset - scaleInset;
        const bottom = bounds.bottom - offset + scaleInset;
        const distance = hero ? enteringDistance : Math.min(height * 0.42, 400);
        const threshold = hero ? height : height * (0.71 - beat * 0.025);
        const byPosition = ease(clamp((threshold - top) / distance));
        // Leave the end of the page readable when there is no room to scroll it higher.
        const byPageEnd = top < height && !hero ? ease(clamp(1 - remainingScroll / 160)) : 0;
        const desired = 1 - Math.max(byPosition, byPageEnd);
        let enter = desired;
        if (!hero) {
          const starting = previous?.enter ?? (!inViewBefore.has(target) && top > height * 0.25 ? 1 : desired);
          inViewBefore.add(target);
          const change = desired - starting;
          const step = elapsed / 760;
          if (Math.abs(change) > step) {
            enter = starting + Math.sign(change) * step;
            easingInProgress = true;
          }
        }
        const exit = ease(clamp((exitingDistance - bottom) / exitingDistance));
        const sway = beat % 2 ? 1 : -1;
        return {
          target,
          x: motion === "glide" ? enter * sway * (compact ? 10 : 32) : 0,
          y: enter * (motion === "fade" ? 18 : compact ? 38 : 65) - exit * (compact ? 14 : 24),
          scale: motion === "lift" ? 1 - enter * 0.055 : 1,
          opacity: 1 - Math.max(enter * (motion === "fade" ? 0.76 : 0.46), exit * 0.23),
          baseOpacity: previous?.opacity ?? (enter || exit ? Number(getComputedStyle(target).opacity) : 1),
          enter,
        };
      });

      surface.style.setProperty("--store-hero-scale", heroScale.toFixed(4));
      for (const { target, x, y, scale, opacity, baseOpacity, enter } of positions) {
        if (y === 0 && opacity === 1) {
          if (styled.has(target)) reset(target);
          continue;
        }
        const roundedY = Math.round(y * 10) / 10;
        const roundedScale = Number(scale.toFixed(4));
        target.style.setProperty("--store-scroll-x", `${x.toFixed(1)}px`);
        target.style.setProperty("--store-scroll-y", `${roundedY}px`);
        target.style.setProperty("--store-scroll-scale", String(roundedScale));
        target.style.setProperty("--store-scroll-opacity", (baseOpacity * opacity).toFixed(3));
        if (interior) target.style.setProperty("--store-scroll-reveal", (1 - enter).toFixed(4));
        target.setAttribute("data-scroll-motion", "");
        styled.set(target, { y: roundedY, scale: roundedScale, opacity: baseOpacity, enter });
      }
      if (easingInProgress) frame = requestAnimationFrame(render);
    };
    const schedule = () => {
      if (hasScrolled && !frame) frame = requestAnimationFrame(render);
    };
    const onScroll = () => {
      if (!hasScrolled && window.scrollY !== 0) {
        hasScrolled = true;
        surface.setAttribute("data-store-scrolled", "");
      }
      schedule();
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!(entry.target instanceof HTMLElement)) continue;
        if (entry.isIntersecting && surface.contains(entry.target)) visible.add(entry.target);
        else {
          visible.delete(entry.target);
          inViewBefore.delete(entry.target);
          if (styled.has(entry.target)) reset(entry.target);
        }
      }
      schedule();
    }, { rootMargin: "120px 0px", threshold: 0 });

    const observe = (element: Element) => {
      const parentTarget = element.parentElement?.closest(targets);
      const surroundsHeading = (target: Element) =>
        !target.matches("h1,h2,h3") && !!target.querySelector("[data-motion-line]");
      if (element.closest(".sr-only") || surroundsHeading(element) ||
          (parentTarget && !surroundsHeading(parentTarget))) return;
      const section = element.closest("section");
      const motion = section ? sections.get(section) ?? "lift" : "glide";
      const siblings = element.parentElement?.children;
      const beat = siblings ? Array.prototype.indexOf.call(siblings, element) % 4 : 0;
      timing.set(element, { motion, beat, hero: Boolean(element.closest(".cinematic-hero")) });
      observer.observe(element);
    };
    const visit = (element: Element, action: (target: Element) => void) => {
      if (element.matches(targets)) action(element);
      element.querySelectorAll(targets).forEach(action);
    };
    const remove = (element: Element) => {
      observer.unobserve(element);
      if (element instanceof HTMLElement) {
        visible.delete(element);
        if (styled.has(element)) reset(element);
      }
    };
    const mutations = new MutationObserver((changes) => {
      for (const change of changes) {
        change.addedNodes.forEach((node) => {
          if (node instanceof Element && surface.contains(node)) visit(node, observe);
        });
        change.removedNodes.forEach((node) => {
          if (node instanceof Element && !surface.contains(node)) visit(node, remove);
        });
      }
    });
    const stop = () => {
      mutations.disconnect();
      observer.disconnect();
      cancelAnimationFrame(frame);
      frame = 0;
      previousFrame = 0;
      visible.clear();
      inViewBefore = new WeakSet();
      styled.forEach((_, target) => reset(target));
      surface.style.removeProperty("--store-hero-scale");
      surface.removeAttribute("data-store-scrolled");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      surface.removeEventListener("focusin", schedule);
      surface.removeEventListener("focusout", schedule);
    };
    const configure = () => {
      stop();
      if (preference.matches) return;
      hasScrolled = false;
      surface.querySelectorAll("section").forEach((section, index) => {
        sections.set(section, motionSequence.find((motion) => motion === section.dataset.storeMotion)
          ?? motionSequence[index % motionSequence.length]);
      });
      visit(surface, observe);
      mutations.observe(surface, { childList: true, subtree: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", schedule);
      surface.addEventListener("focusin", schedule);
      surface.addEventListener("focusout", schedule);
      onScroll();
    };

    configure();
    preference.addEventListener("change", configure);
    return () => {
      stop();
      preference.removeEventListener("change", configure);
    };
  }, [root, pathname]);
}
