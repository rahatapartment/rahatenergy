"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { faqs } from "@/lib/content";

const topics = [
  { id: "getting-started", label: "Getting started", questions: [0, 4, 10] },
  { id: "products", label: "Products & pricing", questions: [1, 2] },
  { id: "orders", label: "Orders & payments", questions: [3, 9, 11] },
  { id: "delivery", label: "Delivery & aftercare", questions: [5, 6, 7, 8] },
];
const nextSteps = [
  { href: "/solutions", label: "Explore energy solutions" },
  { href: "/shop", label: "Explore the collection" },
  { href: "/shop", label: "Build your shortlist" },
  { href: "/how-to-order", label: "Understand the ordering journey" },
  { href: "/request-quote", label: "Prepare a project enquiry" },
  { href: "/request-quote", label: "Discuss your requirements" },
  { href: "/policies/delivery", label: "Read draft delivery guidance" },
  { href: "/policies/delivery", label: "Read collection guidance" },
  {
    href: "/policies/returns",
    label: "Read draft returns & warranty guidance",
  },
  { href: "/cart", label: "View your shortlist" },
  { href: "/request-quote", label: "Explore the enquiry form" },
  { href: "/track-order", label: "Access your order" },
];
const answers = faqs.map((faq, index) => ({
  ...faq,
  index,
  topic: topics.find((topic) => topic.questions.includes(index)) || topics[0],
  next: nextSteps[index] || { href: "/contact", label: "Find your next step" },
}));
function MatchPreview({ answer, query }: { answer: string; query: string }) {
  const needle = query.trim();
  const found = answer.toLowerCase().indexOf(needle.toLowerCase());
  if (found < 0) return null;
  const start = Math.max(0, found - 35);
  const end = Math.min(answer.length, found + needle.length + 85);
  return (
    <span className="help-match-preview">
      {start > 0 ? "…" : ""}
      {answer.slice(start, found)}
      <mark>{answer.slice(found, found + needle.length)}</mark>
      {answer.slice(found + needle.length, end)}
      {end < answer.length ? "…" : ""}
    </span>
  );
}
export function HelpExplorer() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const filtered = answers.filter(
    (answer) =>
      (topic === "all" || answer.topic.id === topic) &&
      `${answer.question} ${answer.answer} ${answer.topic.label}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const allOpen =
    filtered.length > 0 &&
    filtered.every((answer) => expanded.has(answer.index));
  const active = Boolean(query.trim()) || topic !== "all";
  function reset() {
    setQuery("");
    setTopic("all");
    setExpanded(new Set());
  }
  function toggleAll() {
    setExpanded((previous) => {
      const next = new Set(previous);
      filtered.forEach((answer) => {
        if (allOpen) next.delete(answer.index);
        else next.add(answer.index);
      });
      return next;
    });
  }
  return (
    <div className="help-explorer">
      <div className="help-search-row">
        <div className="help-search-field">
          <Search size={20} strokeWidth={1.3} />
          <label htmlFor="help-search" className="sr-only">
            Search help questions
          </label>
          <input
            id="help-search"
            type="search"
            placeholder="Try a question, product detail or order topic"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("");
            }}
          />
          {query && (
            <button aria-label="Clear help search" onClick={() => setQuery("")}>
              <X size={17} />
            </button>
          )}
        </div>
        <p>
          Find a useful answer.
          <br />
          <span>Then take a clear next step.</span>
        </p>
      </div>
      <div
        className="help-topic-controls"
        role="group"
        aria-label="Help topics"
      >
        {[{ id: "all", label: "All questions" }, ...topics].map((item) => (
          <button
            key={item.id}
            aria-pressed={topic === item.id}
            aria-controls="help-answer-list"
            onClick={() => setTopic(item.id)}
          >
            <span>{item.label}</span>
            <small>
              {String(
                item.id === "all"
                  ? answers.length
                  : answers.filter((answer) => answer.topic.id === item.id)
                      .length,
              ).padStart(2, "0")}
            </small>
          </button>
        ))}
      </div>
      <div className="help-discovery-layout">
        <aside className="help-resources" aria-label="Helpful routes">
          <span className="eyebrow">USEFUL DIRECTIONS</span>
          {[
            ["01", "Ordering guidance", "/how-to-order"],
            ["02", "Private order access", "/track-order"],
            ["03", "Project enquiries", "/request-quote"],
          ].map(([number, label, href]) => (
            <Link href={href} key={href}>
              <span>{number}</span>
              <span>{label}</span>
              <ArrowUpRight size={16} />
            </Link>
          ))}
          <div className="help-resource-note">
            <span className="help-resource-mark" aria-hidden="true">
              R / E
            </span>
            <h3>
              A clearer
              <br />
              <em>starting point.</em>
            </h3>
            <p>
              Still deciding what your space needs? Explore the home, business
              and project perspectives.
            </p>
            <Link href="/solutions">
              Find your perspective <ArrowUpRight size={16} />
            </Link>
          </div>
          <nav className="help-policy-links" aria-label="Draft policy guidance">
            <span>POLICIES IN PREVIEW</span>
            <Link href="/policies/delivery">
              Delivery & collection <ArrowUpRight size={13} />
            </Link>
            <Link href="/policies/returns">
              Returns & warranty <ArrowUpRight size={13} />
            </Link>
            <Link href="/policies/privacy">
              Privacy <ArrowUpRight size={13} />
            </Link>
            <p>Draft policies await business approval.</p>
          </nav>
        </aside>
        <section
          className="help-answer-results"
          aria-label="Frequently asked questions"
        >
          <div className="help-results-toolbar">
            <p role="status" aria-live="polite">
              <strong>{String(filtered.length).padStart(2, "0")}</strong>{" "}
              {filtered.length === 1 ? "answer" : "answers"} to explore
            </p>
            <div>
              {active && <button onClick={reset}>Reset filters</button>}
              <button
                disabled={!filtered.length}
                onClick={toggleAll}
                aria-expanded={allOpen}
                aria-controls="help-answer-list"
              >
                {allOpen ? "Collapse answers" : "Expand answers"}
                <span aria-hidden="true">{allOpen ? "−" : "+"}</span>
              </button>
            </div>
          </div>
          <div id="help-answer-list">
            {filtered.length ? (
              filtered.map((answer) => (
                <details
                  className="help-answer"
                  key={answer.index}
                  open={expanded.has(answer.index)}
                  onToggle={(event) => {
                    const isOpen = event.currentTarget.open;
                    setExpanded((previous) => {
                      if (previous.has(answer.index) === isOpen)
                        return previous;
                      const next = new Set(previous);
                      if (isOpen) next.add(answer.index);
                      else next.delete(answer.index);
                      return next;
                    });
                  }}
                >
                  <summary>
                    <span className="help-answer-number">
                      {String(answer.index + 1).padStart(2, "0")}
                    </span>
                    <span className="help-question-copy">
                      <small>{answer.topic.label}</small>
                      <span>{answer.question}</span>
                      {query.trim() && (
                        <MatchPreview answer={answer.answer} query={query} />
                      )}
                    </span>
                    <span className="help-disclosure-icon" aria-hidden="true" />
                  </summary>
                  <div className="help-answer-body">
                    {answer.answer.split(/\n\s*\n/).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                    <Link href={answer.next.href}>
                      {answer.next.label}
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </details>
              ))
            ) : (
              <div className="help-empty">
                <span className="eyebrow">ANOTHER WAY TO LOOK AT IT</span>
                <h3>No answers found.</h3>
                <p>
                  Try a shorter phrase or choose a different topic. Contact also
                  brings together enquiry routes and private order access.
                </p>
                <button onClick={reset}>
                  Reset search <ArrowUpRight size={17} />
                </button>
                <Link href="/contact">
                  Explore contact & support <ArrowUpRight size={16} />
                </Link>
              </div>
            )}
          </div>
          <div className="help-results-note">
            <span>CLARITY BEFORE COMMITMENT.</span>
            <p>
              Exact equipment, prices, delivery arrangements and approved
              business terms require confirmation.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
