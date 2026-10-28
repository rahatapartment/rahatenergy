"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { usePinnedScene } from "./usePinnedScene";

export function ShopHero({
  productCount,
  categoryCount,
}: {
  productCount: number;
  categoryCount: number;
}) {
  const stage = usePinnedScene();
  return (
    <div className="hero-stage shop-cinematic-stage" ref={stage}>
      <section
        className="cinematic-hero shop-cinematic-hero"
        aria-labelledby="collection-title"
      >
        <div className="cinematic-scene shop-scene-image">
          <Image
            src="/images/batteries.webp"
            alt="Illustrative architectural energy-storage scene; not an exact manufacturer or product model"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="shop-scene-atmosphere" />
        <div className="shop-scene-coordinate" aria-hidden="true">
          <span /> EQUIPMENT. IN CONTEXT.
        </div>
        <div className="shop-scene-copy">
          <span className="cinematic-eyebrow">
            <span /> THE RAHAT ENERGY COLLECTION
          </span>
          <h1 id="collection-title">
            The collection.
            <br />
            <em>A new perspective.</em>
          </h1>
          <p>
            Considered equipment. Connected possibilities.
            <br />
            Find the pieces that belong in your world.
          </p>
          <a href="#collection-catalogue" className="shop-scene-enter">
            <span>Enter the collection</span>
            <span>
              <ArrowDown size={20} strokeWidth={1.3} />
            </span>
          </a>
          <a className="shop-scene-shortcut" href="#product-search">
            Go straight to products <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="shop-scene-rail">
          <a href="#collection-catalogue" className="shop-scene-scroll">
            <span className="scroll-track">
              <ArrowDown size={16} />
            </span>
            <span>A NEW PERSPECTIVE AWAITS</span>
          </a>
          <a href="#product-search" className="shop-scene-index">
            <span>THE COMPLETE EDIT</span>
            <span>
              {String(productCount).padStart(2, "0")} pieces <i />{" "}
              {String(categoryCount).padStart(2, "0")} categories{" "}
              <ArrowUpRight size={17} strokeWidth={1.3} />
            </span>
          </a>
          <span className="shop-scene-disclosure">
            Illustrative category photography
          </span>
        </div>
        <div className="shop-horizon-rule" aria-hidden="true">
          <span />
          <i />
          <span />
        </div>
      </section>
    </div>
  );
}
