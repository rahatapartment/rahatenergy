"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { usePinnedScene } from "./usePinnedScene";

/** Native sticky positioning pins the scene; the next section scrolls over it. */
export function HeroExperience() {
  const stage = usePinnedScene();

  return (
    <div className="hero-stage" ref={stage}>
      <section className="cinematic-hero" aria-labelledby="hero-title">
        <div className="cinematic-scene">
          <Image
            src="/images/hero.webp"
            alt="Illustrative architectural scene of a solar-powered home at golden hour; not a completed Rahat Energy project"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="cinematic-atmosphere" />
        <div className="hero-coordinate" aria-hidden="true">
          <span className="coordinate-line" /> SUNLIGHT. REIMAGINED.
        </div>
        <div className="cinematic-copy">
          <span className="cinematic-eyebrow">
            <span /> ENERGY, BEAUTIFULLY ENGINEERED
          </span>
          <h1 id="hero-title">
            Let life flow.
            <br />
            <em>Beautifully powered.</em>
          </h1>
          <p>
            For the moments that make a home.
            <br />
            And the energy to make them possible.
          </p>
          <Link className="cinematic-discover" href="/solutions">
            <span>Discover your possibilities</span>
            <span className="circle-arrow">
              <ArrowUpRight size={20} strokeWidth={1.3} />
            </span>
          </Link>
        </div>
        <div className="hero-bottom-rail">
          <a href="#energy-introduction" className="scroll-invitation">
            <span className="scroll-track">
              <ArrowDown size={16} />
            </span>
            <span>SCROLL TO EXPLORE</span>
          </a>
          <Link href="/shop" className="hero-collection-link">
            <span>THE ENERGY COLLECTION</span>
            <span>
              Solar. Storage. A new perspective. <ArrowUpRight size={16} />
            </span>
          </Link>
          <span className="hero-image-disclosure">
            Illustrative architectural imagery
          </span>
        </div>
      </section>
    </div>
  );
}
