"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { solutionContent } from "@/lib/content";

export function SolutionPlanner() {
  const [selected, setSelected] = useState(0);
  const group = useId();
  const current = solutionContent[selected];
  return (
    <section className="solution-planner" aria-labelledby="planner-title">
      <div className="planner-introduction">
        <span className="eyebrow">03 / A LITTLE CONTEXT GOES A LONG WAY</span>
        <h2 id="planner-title">
          Start with
          <br />
          <em>your world.</em>
        </h2>
        <p>
          You do not need a system specification to begin. Choose a perspective
          and explore the questions worth bringing.
        </p>
        <fieldset className="planner-options">
          <legend>What are you planning?</legend>
          {solutionContent.map((solution, index) => (
            <label
              key={solution.slug}
              className={
                selected === index
                  ? "planner-option selected"
                  : "planner-option"
              }
            >
              <input
                type="radio"
                name={group}
                checked={selected === index}
                onChange={() => setSelected(index)}
              />
              <span>0{index + 1}</span>
              <span>{["A home", "A business", "A larger project"][index]}</span>
              <ArrowUpRight size={18} strokeWidth={1.2} />
            </label>
          ))}
        </fieldset>
      </div>
      <div
        className="planner-perspective"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="planner-topline">
          <span>YOUR STARTING POINT</span>
          <span>0{selected + 1} / 03</span>
        </div>
        <h3>{current.label}</h3>
        <p>{current.intro}</p>
        <ol>
          {current.prompts.map((prompt, index) => (
            <li key={prompt}>
              <span>0{index + 1}</span>
              <p>{prompt}</p>
            </li>
          ))}
        </ol>
        <Link href={`/solutions/${current.slug}`}>
          Explore this perspective <ArrowUpRight size={20} />
        </Link>
        <span className="planner-footnote">
          Questions to prepare your enquiry. Equipment suitability is confirmed
          separately.
        </span>
      </div>
    </section>
  );
}
