"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { categories, imageFor } from "@/lib/catalogue";

const chapters = [
  {
    slug: "solar-panels",
    verb: "Capture.",
    title: "It begins with sunlight.",
    copy: "Explore the panels at the heart of a solar setup. Confirm the exact model, output and fit for your space before you choose.",
  },
  {
    slug: "solar-inverters",
    verb: "Connect.",
    title: "Bring the pieces together.",
    copy: "Discover inverters for your solar and storage plans. Start a conversation about system sizing and equipment compatibility.",
  },
  {
    slug: "battery-storage",
    verb: "Store.",
    title: "Think beyond the daylight.",
    copy: "Explore energy storage for the way you use power. Share your priorities and request a verified capacity and compatibility assessment.",
  },
  {
    slug: "solar-lighting",
    verb: "Illuminate.",
    title: "See your space differently.",
    copy: "Discover solar lighting for outdoor spaces. Discuss placement, lighting requirements and the exact equipment for your setting.",
  },
  {
    slug: "energy-accessories",
    verb: "Complete.",
    title: "The details connect everything.",
    copy: "Explore the mounting, cabling and control essentials. Confirm the components that belong with your proposed system.",
  },
];

export function CategoryExperience() {
  const [selected, setSelected] = useState(0);
  const [horizontal, setHorizontal] = useState(false);
  useEffect(() => {
    const media = matchMedia("(max-width: 800px)");
    const update = () => setHorizontal(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const chapter = chapters[selected];
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (["ArrowRight", "ArrowDown"].includes(event.key))
      next = (index + 1) % categories.length;
    else if (["ArrowLeft", "ArrowUp"].includes(event.key))
      next = (index + categories.length - 1) % categories.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = categories.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    buttons.current[next]?.focus();
  }
  return (
    <section className="element-experience" aria-labelledby="elements-title">
      <div className="element-topline">
        <span className="eyebrow">02 / THE ELEMENTS OF YOUR ENERGY</span>
        <span className="element-status">
          <i /> FIVE CONNECTED CATEGORIES
        </span>
      </div>
      <div className="element-layout">
        <div className="element-editorial">
          <h2 id="elements-title">
            Different elements.
            <br />
            <em>One bigger picture.</em>
          </h2>
          <p>Explore the pieces. Imagine how they fit your world.</p>
          <div
            className="element-tabs"
            role="tablist"
            aria-label="Explore energy categories"
            aria-orientation={horizontal ? "horizontal" : "vertical"}
          >
            {categories.map((category, index) => (
              <button
                role="tab"
                id={`element-tab-${index}`}
                aria-controls="element-panel"
                aria-selected={selected === index}
                tabIndex={selected === index ? 0 : -1}
                ref={(node) => {
                  buttons.current[index] = node;
                }}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => navigate(event, index)}
                key={category}
              >
                <span className="element-number">0{index + 1}</span>
                <span>{category}</span>
                <ArrowUpRight size={20} strokeWidth={1.3} />
              </button>
            ))}
          </div>
        </div>
        <div
          className="element-panel"
          role="tabpanel"
          id="element-panel"
          aria-labelledby={`element-tab-${selected}`}
          tabIndex={0}
        >
          <div className="element-image" key={chapter.slug}>
            <Image
              src={imageFor(categories[selected])}
              alt={`Illustrative ${categories[selected].toLowerCase()} photography; exact equipment requires confirmation`}
              fill
              sizes="(max-width: 800px) 88vw, 46vw"
            />
            <span className="element-verb" aria-hidden="true">
              {chapter.verb}
            </span>
            <span className="element-image-note">
              ILLUSTRATIVE CATEGORY PHOTOGRAPHY
            </span>
          </div>
          <div className="element-description">
            <div>
              <span className="eyebrow">
                0{selected + 1} / EXPLORE THE POSSIBILITIES
              </span>
              <h3>{chapter.title}</h3>
              <p>{chapter.copy}</p>
            </div>
            <Link
              href={`/categories/${chapter.slug}`}
              className="element-browse"
              aria-label={`Explore ${categories[selected]}`}
            >
              <ArrowUpRight size={27} strokeWidth={1.2} />
            </Link>
          </div>
        </div>
      </div>
      <div className="element-bottomline">
        <span>SELECT A CATEGORY TO DISCOVER MORE</span>
        <Link href="/shop">
          View the full collection <ArrowUpRight size={15} />
        </Link>
      </div>
    </section>
  );
}
