"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { usePinnedScene } from "./usePinnedScene";
export function HelpHero() {
  const stage = usePinnedScene();
  return (
    <div
      className="hero-stage solutions-hero-stage help-hero-stage"
      ref={stage}
    >
      <section
        className="cinematic-hero solutions-cinematic-hero help-cinematic-hero"
        aria-labelledby="help-title"
      >
        <div className="cinematic-scene solutions-scene help-hero-scene">
          <Image
            src="/images/lighting.webp"
            alt="Illustrative solar lighting equipment; not exact manufacturer models"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="solutions-atmosphere help-atmosphere" />
        <div className="solutions-coordinate" aria-hidden="true">
          <span /> A LITTLE MORE UNDERSTANDING.
        </div>
        <div className="solutions-hero-layout">
          <div className="solutions-hero-copy">
            <span className="cinematic-eyebrow">
              <span /> HELP & ANSWERS
            </span>
            <h1 id="help-title">
              Good questions.
              <br />
              <em>Clearer possibilities.</em>
            </h1>
            <p>
              Find your way through products, quotations, ordering and the
              details that need confirming.
            </p>
            <a href="#help-centre" className="solutions-hero-enter">
              <span>Find an answer</span>
              <span>
                <ArrowDown size={19} strokeWidth={1.3} />
              </span>
            </a>
          </div>
        </div>
        <div className="solutions-hero-rail">
          <a href="#help-centre" className="solutions-scroll">
            <span className="scroll-track">
              <ArrowDown size={15} />
            </span>
            <span>SCROLL INTO CLARITY</span>
          </a>
          <Link href="/track-order" className="solutions-all-perspectives">
            Access an existing order <ArrowUpRight size={16} />
          </Link>
          <span className="solutions-hero-disclosure">
            Illustrative category photography · A CLEARER PERSPECTIVE
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
