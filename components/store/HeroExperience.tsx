"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  MoveHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePinnedScene } from "./usePinnedScene";
const slides = [
  {
    category: "Solar panels",
    slug: "solar-panels",
    image: "hero",
    title: "Start with sunlight.",
    accent: "Shop solar panels.",
    copy: "Discover solar panels for your next energy setup. Compare the collection and confirm the right model for your space.",
  },
  {
    category: "Solar inverters",
    slug: "solar-inverters",
    image: "inverters",
    title: "Make the connection.",
    accent: "Shop inverters.",
    copy: "Explore the equipment that connects your solar and storage plans. Confirm sizing and compatibility before you choose.",
  },
  {
    category: "Battery storage",
    slug: "battery-storage",
    image: "batteries",
    title: "Beyond the daylight.",
    accent: "Shop battery storage.",
    copy: "Bring storage into your energy plans. Explore battery options and request confirmed capacity and compatibility details.",
  },
  {
    category: "Solar lighting",
    slug: "solar-lighting",
    image: "lighting",
    title: "Light up your space.",
    accent: "Shop solar lighting.",
    copy: "Discover solar lighting for outdoor spaces. Find a starting point, then confirm the equipment and placement you need.",
  },
  {
    category: "Energy accessories",
    slug: "energy-accessories",
    image: "accessories",
    title: "Every detail matters.",
    accent: "Shop the essentials.",
    copy: "Explore mounting, cabling and control components. Complete your shortlist with accessories suited to your proposed system.",
  },
];
export function HeroExperience() {
  const stage = usePinnedScene();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const touch = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(m.matches);
    update();
    m.addEventListener("change", update);
    const el = stage.current;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    if (el) observer.observe(el);
    const visibility = () =>
      setVisible(
        document.visibilityState === "visible" &&
          !!el &&
          el.getBoundingClientRect().bottom > 0,
      );
    document.addEventListener("visibilitychange", visibility);
    return () => {
      m.removeEventListener("change", update);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [stage]);
  useEffect(() => {
    if (paused || interacting || reduced || !visible) return;
    const timer = setInterval(
      () => setSelected((n) => (n + 1) % slides.length),
      7000,
    );
    return () => clearInterval(timer);
  }, [paused, interacting, reduced, visible]);
  function choose(index: number) {
    setSelected((index + slides.length) % slides.length);
    setPaused(true);
  }
  const slide = slides[selected];
  return (
    <div className="hero-stage sales-hero-stage" ref={stage}>
      <section
        className="cinematic-hero sales-hero"
        aria-labelledby="hero-title"
        aria-roledescription="carousel"
        aria-label="Shop Rahat Energy categories"
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node))
            setInteracting(false);
        }}
        onTouchStart={(e) => {
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const dx = e.changedTouches[0].clientX - touch.current.x,
            dy = e.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4)
            choose(selected + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}
      >
        <div className="cinematic-scene sales-hero-scene" key={slide.image}>
          <Image
            src={`/images/${slide.image}.webp`}
            alt={
              slide.image === "hero"
                ? "Illustrative solar-powered home; not a completed Rahat Energy project"
                : `Illustrative ${slide.category.toLowerCase()} equipment; exact models require confirmation`
            }
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="cinematic-atmosphere sales-hero-atmosphere" />
        <div className="hero-coordinate" aria-hidden="true">
          <span className="coordinate-line" />
          YOUR SOLAR ENERGY STORE.
        </div>
        <div className="cinematic-copy sales-hero-copy">
          <span className="cinematic-eyebrow">
            <span />
            BUY SOLAR & ENERGY EQUIPMENT
          </span>
          <h1 id="hero-title">
            {slide.title}
            <br />
            <em>{slide.accent}</em>
          </h1>
          <p>{slide.copy}</p>
          <div className="sales-hero-actions">
            <Link
              className="cinematic-discover"
              href={`/categories/${slide.slug}`}
            >
              <span>Shop {slide.category.toLowerCase()}</span>
              <span className="circle-arrow">
                <ArrowUpRight size={20} strokeWidth={1.4} />
              </span>
            </Link>
            <Link className="sales-all-products" href="/shop">
              Shop all products <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <div className="sales-slide-controls">
          <div
            className="sales-slide-position"
            aria-live={paused ? "polite" : "off"}
          >
            <span>0{selected + 1}</span>
            <span>/ 05</span>
            <strong>{slide.category}</strong>
          </div>
          <div
            className="sales-slide-dots"
            role="group"
            aria-label="Choose a category slide"
          >
            {slides.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                aria-label={`Show ${s.category}`}
                aria-pressed={i === selected}
                onClick={() => choose(i)}
              >
                <span />
              </button>
            ))}
          </div>
          <div className="sales-slide-buttons">
            <button
              type="button"
              aria-label="Previous category slide"
              onClick={() => choose(selected - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next category slide"
              onClick={() => choose(selected + 1)}
            >
              <ChevronRight size={18} />
            </button>
            {!reduced && (
              <button
                type="button"
                aria-label={
                  paused
                    ? "Play category slideshow"
                    : "Pause category slideshow"
                }
                onClick={() => setPaused(!paused)}
              >
                {paused ? <Play size={15} /> : <Pause size={15} />}
              </button>
            )}
          </div>
          <span className="sales-swipe-hint">
            <MoveHorizontal size={17} />
            Swipe to explore
          </span>
        </div>
        <div className="hero-bottom-rail sales-bottom-rail">
          <a href="#energy-introduction" className="scroll-invitation">
            <span className="scroll-track">
              <ArrowDown size={16} />
            </span>
            <span>DISCOVER YOUR ENERGY STORE</span>
          </a>
          <Link href="#frequently-bought" className="hero-collection-link">
            <span>FIVE CATEGORIES. ONE PLACE TO SHOP.</span>
            <span>
              Explore the energy essentials <ArrowUpRight size={16} />
            </span>
          </Link>
          <span className="hero-image-disclosure">
            Illustrative category photography
          </span>
        </div>
      </section>
    </div>
  );
}
