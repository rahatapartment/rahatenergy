"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { usePinnedScene } from "./usePinnedScene";

const scenes = {
  overview: {
    eyebrow: "ENERGY, IN YOUR ELEMENT",
    title: "Your world.",
    emphasis: "In its element.",
    image: "hero",
    label: "A WORLD OF POSSIBILITIES",
    alt: "Illustrative solar-powered architecture; not a completed Rahat Energy installation",
  },
  home: {
    eyebrow: "A PERSPECTIVE FOR YOUR HOME",
    title: "Your everyday.",
    emphasis: "Beautifully considered.",
    image: "hero",
    label: "HOMES & EVERYDAY LIVING",
    alt: "Illustrative solar-powered home; not a completed Rahat Energy installation",
  },
  business: {
    eyebrow: "A PERSPECTIVE FOR YOUR BUSINESS",
    title: "For what",
    emphasis: "you’re building.",
    image: "inverters",
    label: "WORKSPACES & BUSINESS PROJECTS",
    alt: "Illustrative inverter equipment in an architectural setting; exact equipment and service scope require confirmation",
  },
  "bulk-projects": {
    eyebrow: "A PERSPECTIVE FOR LARGER PROJECTS",
    title: "A bigger idea.",
    emphasis: "A clearer beginning.",
    image: "panels",
    label: "BULK & PROJECT ENQUIRIES",
    alt: "Illustrative solar panel equipment; not a verified project or exact product model",
  },
} as const;
export type SolutionPerspective = keyof typeof scenes;
export function SolutionsHero({
  perspective = "overview",
  description,
}: {
  perspective?: SolutionPerspective;
  description?: string;
}) {
  const stage = usePinnedScene();
  const scene = scenes[perspective];
  return (
    <div className="hero-stage solutions-hero-stage" ref={stage}>
      <section
        className={`cinematic-hero solutions-cinematic-hero scene-${perspective}`}
        aria-labelledby="solutions-title"
      >
        <div className="cinematic-scene solutions-scene">
          <Image
            src={`/images/${scene.image}.webp`}
            alt={scene.alt}
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="solutions-atmosphere" />
        <div className="solutions-coordinate" aria-hidden="true">
          <span /> START WITH WHAT MATTERS.
        </div>
        <div className="solutions-hero-layout">
          <div className="solutions-hero-copy">
            <span className="cinematic-eyebrow">
              <span />
              {scene.eyebrow}
            </span>
            <h1 id="solutions-title">
              {scene.title}
              <br />
              <em>{scene.emphasis}</em>
            </h1>
            <p>
              {description ||
                "Considered energy conversations for the way you live, the work you do and the projects you imagine."}
            </p>
            <a className="solutions-hero-enter" href="#solution-content">
              <span>
                {perspective === "overview"
                  ? "Find your perspective"
                  : "Explore your starting point"}
              </span>
              <span>
                <ArrowDown size={19} strokeWidth={1.3} />
              </span>
            </a>
          </div>
        </div>
        <div className="solutions-hero-rail">
          <a href="#solution-content" className="solutions-scroll">
            <span className="scroll-track">
              <ArrowDown size={15} />
            </span>
            <span>SCROLL INTO POSSIBILITY</span>
          </a>
          {perspective === "overview" ? (
            <nav
              aria-label="Solution shortcuts"
              className="solutions-hero-shortcuts"
            >
              <Link href="/solutions/home">
                Home <ArrowUpRight size={14} />
              </Link>
              <Link href="/solutions/business">
                Business <ArrowUpRight size={14} />
              </Link>
              <Link href="/solutions/bulk-projects">
                Projects <ArrowUpRight size={14} />
              </Link>
            </nav>
          ) : (
            <Link href="/solutions" className="solutions-all-perspectives">
              All perspectives <ArrowUpRight size={16} />
            </Link>
          )}
          <span className="solutions-hero-disclosure">
            Illustrative imagery · {scene.label}
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
