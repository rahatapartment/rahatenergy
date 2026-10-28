"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { usePinnedScene } from "./usePinnedScene";

export function ContactHero() {
  const stage = usePinnedScene();
  return (
    <div
      className="hero-stage solutions-hero-stage contact-hero-stage"
      ref={stage}
    >
      <section
        className="cinematic-hero solutions-cinematic-hero contact-cinematic-hero"
        aria-labelledby="contact-title"
      >
        <div className="cinematic-scene solutions-scene contact-hero-scene">
          <Image
            src="/images/accessories.webp"
            alt="Illustrative solar connections and control equipment; not exact manufacturer models"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="solutions-atmosphere contact-atmosphere" />
        <div className="solutions-coordinate" aria-hidden="true">
          <span /> A CONVERSATION WORTH STARTING.
        </div>
        <div className="solutions-hero-layout">
          <div className="solutions-hero-copy">
            <span className="cinematic-eyebrow">
              <span /> CONTACT & SUPPORT
            </span>
            <h1 id="contact-title">
              A good connection.
              <br />
              <em>A clearer beginning.</em>
            </h1>
            <p>
              A project question. A product choice. An existing order.
              <br />
              Find a useful way forward.
            </p>
            <a href="#contact-start" className="solutions-hero-enter">
              <span>Find your starting point</span>
              <span>
                <ArrowDown size={19} strokeWidth={1.3} />
              </span>
            </a>
          </div>
        </div>
        <div className="solutions-hero-rail">
          <a href="#contact-start" className="solutions-scroll">
            <span className="scroll-track">
              <ArrowDown size={15} />
            </span>
            <span>SCROLL INTO CONVERSATION</span>
          </a>
          <a href="#contact-enquiry" className="solutions-all-perspectives">
            Start a project enquiry <ArrowUpRight size={16} />
          </a>
          <span className="solutions-hero-disclosure">
            Illustrative category photography · THE DETAILS THAT CONNECT
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
