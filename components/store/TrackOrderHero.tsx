"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { usePinnedScene } from "./usePinnedScene";
export function TrackOrderHero() {
  const stage = usePinnedScene();
  return (
    <div
      className="hero-stage solutions-hero-stage tracking-hero-stage"
      ref={stage}
    >
      <section
        className="cinematic-hero solutions-cinematic-hero tracking-cinematic-hero"
        aria-labelledby="tracking-title"
      >
        <div className="cinematic-scene solutions-scene tracking-hero-scene">
          <Image
            src="/images/accessories.webp"
            alt="Illustrative energy components; not an order or shipment photograph"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="solutions-atmosphere tracking-atmosphere" />
        <div className="solutions-coordinate" aria-hidden="true">
          <span /> YOUR DETAILS. YOUR PERSPECTIVE.
        </div>
        <div className="solutions-hero-layout">
          <div className="solutions-hero-copy">
            <span className="cinematic-eyebrow">
              <span /> PRIVATE ORDER ACCESS
            </span>
            <h1 id="tracking-title">
              Your order.
              <br />
              <em>A clearer view.</em>
            </h1>
            <p>
              Access verified payment, fulfilment and delivery updates with your
              order reference and private access code.
            </p>
            <a href="#order-access" className="solutions-hero-enter">
              <span>Access your order</span>
              <span>
                <ArrowDown size={19} strokeWidth={1.3} />
              </span>
            </a>
          </div>
        </div>
        <div className="solutions-hero-rail">
          <a href="#order-access" className="solutions-scroll">
            <span className="scroll-track">
              <ArrowDown size={15} />
            </span>
            <span>YOUR NEXT STEP</span>
          </a>
          <Link href="/faq" className="solutions-all-perspectives">
            Help & answers <ArrowUpRight size={16} />
          </Link>
          <span className="solutions-hero-disclosure">
            Illustrative category photography · A CONSIDERED CONNECTION
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
