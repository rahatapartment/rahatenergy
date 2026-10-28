"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { usePinnedScene } from "./usePinnedScene";

export function AboutHero() {
  const stage = usePinnedScene();
  return (
    <div
      className="hero-stage solutions-hero-stage about-hero-stage"
      ref={stage}
    >
      <section
        className="cinematic-hero solutions-cinematic-hero about-cinematic-hero"
        aria-labelledby="about-title"
      >
        <div className="cinematic-scene solutions-scene about-hero-scene">
          <Image
            src="/images/panels.webp"
            alt="Illustrative solar equipment in an architectural setting; not an exact product or completed Rahat Energy project"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="solutions-atmosphere about-atmosphere" />
        <div className="solutions-coordinate" aria-hidden="true">
          <span /> A CONSIDERED APPROACH.
        </div>
        <div className="solutions-hero-layout">
          <div className="solutions-hero-copy">
            <span className="cinematic-eyebrow">
              <span /> MEET RAHAT ENERGY
            </span>
            <h1 id="about-title">
              Our perspective.
              <br />
              <em>Your possibilities.</em>
            </h1>
            <p>
              A clearer starting point for solar, storage and the energy choices
              that shape your space.
            </p>
            <a href="#about-story" className="solutions-hero-enter">
              <span>Discover our approach</span>
              <span>
                <ArrowDown size={19} strokeWidth={1.3} />
              </span>
            </a>
          </div>
        </div>
        <div className="solutions-hero-rail">
          <a className="solutions-scroll" href="#about-story">
            <span className="scroll-track">
              <ArrowDown size={15} />
            </span>
            <span>SCROLL TO OUR PERSPECTIVE</span>
          </a>
          <Link className="solutions-all-perspectives" href="/solutions">
            Explore energy solutions <ArrowUpRight size={16} />
          </Link>
          <span className="solutions-hero-disclosure">
            Illustrative category photography · SOLAR, STORAGE & POSSIBILITY
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
