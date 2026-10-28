"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { usePinnedScene } from "./usePinnedScene";
export function CartHero() {
  const stage = usePinnedScene();
  return (
    <div
      className="hero-stage solutions-hero-stage cart-hero-stage"
      ref={stage}
    >
      <section
        className="cinematic-hero solutions-cinematic-hero cart-cinematic-hero"
        aria-labelledby="cart-title"
      >
        <div className="cinematic-scene solutions-scene cart-hero-scene">
          <Image
            src="/images/batteries.webp"
            alt="Illustrative battery storage equipment; not exact manufacturer models"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="solutions-atmosphere cart-atmosphere" />
        <div className="solutions-coordinate" aria-hidden="true">
          <span /> A LITTLE CLOSER TO POSSIBILITY.
        </div>
        <div className="solutions-hero-layout">
          <div className="solutions-hero-copy">
            <span className="cinematic-eyebrow">
              <span /> YOUR ENERGY EDIT
            </span>
            <h1 id="cart-title">
              Considered choices.
              <br />
              <em>New possibilities.</em>
            </h1>
            <p>
              Keep your choices together. Refine the details, then take your
              next step towards a more considered energy setup.
            </p>
            <a href="#cart-edit" className="solutions-hero-enter">
              <span>Review your edit</span>
              <span>
                <ArrowDown size={19} strokeWidth={1.3} />
              </span>
            </a>
          </div>
        </div>
        <div className="solutions-hero-rail">
          <a href="#cart-edit" className="solutions-scroll">
            <span className="scroll-track">
              <ArrowDown size={15} />
            </span>
            <span>EXPLORE YOUR EDIT</span>
          </a>
          <Link href="/shop" className="solutions-all-perspectives">
            Continue exploring <ArrowUpRight size={16} />
          </Link>
          <span className="solutions-hero-disclosure">
            Illustrative category photography · YOUR NEXT POSSIBILITY
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
