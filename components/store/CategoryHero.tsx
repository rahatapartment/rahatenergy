"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { usePinnedScene } from "./usePinnedScene";
import { imageFor } from "@/lib/catalogue";
const headlines: Record<string, string> = {
  "solar-panels": "Start with sunlight.",
  "solar-inverters": "Connect your possibilities.",
  "battery-storage": "Beyond the daylight.",
  "solar-lighting": "See your space differently.",
  "energy-accessories": "Connect the details.",
};
export function CategoryHero({
  slug,
  category,
  intro,
  count,
}: {
  slug: string;
  category: string;
  intro: string;
  count: number;
}) {
  const stage = usePinnedScene();
  return (
    <div
      className="hero-stage solutions-hero-stage category-hero-stage"
      ref={stage}
    >
      <section
        className="cinematic-hero solutions-cinematic-hero category-cinematic-hero"
        aria-labelledby="category-title"
      >
        <div className="cinematic-scene solutions-scene category-hero-scene">
          <Image
            src={imageFor(category)}
            alt={`Illustrative ${category.toLowerCase()} equipment; not exact manufacturer models`}
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="solutions-atmosphere" />
        <div className="solutions-coordinate" aria-hidden="true">
          <span />
          YOUR ENERGY. YOUR COLLECTION.
        </div>
        <div className="solutions-hero-layout">
          <div className="solutions-hero-copy">
            <span className="cinematic-eyebrow">
              <span />
              SHOP RAHAT ENERGY
            </span>
            <h1 id="category-title">
              {category}.<br />
              <em>{headlines[slug]}</em>
            </h1>
            <p>{intro}</p>
            <a href="#category-products" className="solutions-hero-enter">
              <span>Shop this category</span>
              <span>
                <ArrowDown size={19} strokeWidth={1.3} />
              </span>
            </a>
          </div>
        </div>
        <div className="solutions-hero-rail">
          <a href="#category-collection" className="solutions-scroll">
            <span className="scroll-track">
              <ArrowDown size={15} />
            </span>
            <span>{String(count).padStart(2, "0")} PRODUCTS TO EXPLORE</span>
          </a>
          <Link href="/shop" className="solutions-all-perspectives">
            Shop all products <ArrowUpRight size={16} />
          </Link>
          <span className="solutions-hero-disclosure">
            Illustrative category photography
          </span>
        </div>
        <div className="solutions-horizon" aria-hidden="true">
          <span />
          <i />
          <span />
        </div>
      </section>
    </div>
  );
}
