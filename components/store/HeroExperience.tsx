"use client";
import Image from "@/components/WebImage";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
} from "lucide-react";
import { useRef, useState } from "react";
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
    copy: "Browse everyday accessories from Rahat Energy.",
  },
];

type SlideSelection = {
  selected: number;
  previous: number | null;
  pending: number | null;
  changed: boolean;
};

function showSlide(current: SlideSelection, index: number): SlideSelection {
  return {
    selected: index,
    previous: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? null
      : current.selected,
    pending: null,
    changed: true,
  };
}

export function HeroExperience() {
  const [selection, setSelection] = useState<SlideSelection>({
    selected: 0,
    previous: null,
    pending: null,
    changed: false,
  });
  const { selected, previous, pending, changed } = selection;
  const touch = useRef<{ x: number; y: number } | null>(null);
  function choose(index: number, relative = false) {
    setSelection((current) => {
      const target = relative ? (current.pending ?? current.selected) + index : index;
      const next = (target + slides.length) % slides.length;
      if (next === current.selected) return { ...current, pending: null };
      if (next === current.previous) return showSlide(current, next);
      return { ...current, pending: next };
    });
  }
  const slide = slides[selected];
  return (
    <div className="hero-stage sales-hero-stage">
      <section
        className="cinematic-hero sales-hero"
        aria-labelledby="hero-title"
        aria-roledescription="carousel"
        aria-label="Shop Rahat Energy categories"
        onTouchStart={(e) => {
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const dx = e.changedTouches[0].clientX - touch.current.x,
            dy = e.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4)
            choose(dx < 0 ? 1 : -1, true);
          touch.current = null;
        }}
      >
        <div className="cinematic-scene sales-hero-scene">
          {[previous, selected, pending].map((index) => {
            if (index === null) return null;
            const image = slides[index];
            const isSelected = index === selected;
            return (
              <div
                key={image.image}
                className={`sales-hero-image${isSelected && previous !== null ? " sales-hero-image-enter" : ""}`}
                data-pending={index === pending || undefined}
                aria-hidden={!isSelected || undefined}
                onAnimationEnd={(event) => {
                  if (event.target !== event.currentTarget || event.animationName !== "store-slide-image-in") return;
                  setSelection((current) => current.selected === index
                    ? { ...current, previous: null }
                    : current);
                }}
              >
                <Image
                  src={`/images/${image.image}.webp`}
                  alt={isSelected
                    ? image.image === "hero"
                      ? "Illustrative solar-powered home; not a completed Rahat Energy project"
                      : `Illustrative ${image.category.toLowerCase()} equipment; exact models require confirmation`
                    : ""}
                  fill
                  priority={index === 0}
                  loading="eager"
                  sizes="100vw"
                  onLoad={() => {
                    setSelection((current) => current.pending === index
                      ? showSlide(current, index)
                      : current);
                  }}
                  onError={() => {
                    setSelection((current) => current.pending === index
                      ? { ...current, pending: null }
                      : current);
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="cinematic-atmosphere sales-hero-atmosphere" />
        <div className="hero-coordinate" aria-hidden="true">
          <span className="coordinate-line" />
          YOUR SOLAR ENERGY STORE.
        </div>
        <div className="cinematic-copy sales-hero-copy" data-slide-changed={changed || undefined}>
          <span className="cinematic-eyebrow">
            <span />
            BUY SOLAR & ENERGY EQUIPMENT
          </span>
          <h1 id="hero-title" key={`title-${slide.slug}`}>
            <span className="sales-hero-line">{slide.title}</span>
            <em className="sales-hero-line">{slide.accent}</em>
          </h1>
          <p key={`copy-${slide.slug}`}>{slide.copy}</p>
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
            aria-live="polite"
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
              onClick={() => choose(-1, true)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next category slide"
              onClick={() => choose(1, true)}
            >
              <ChevronRight size={18} />
            </button>
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
        </div>
      </section>
    </div>
  );
}
