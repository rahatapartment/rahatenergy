import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function SolutionsClosing() {
  return (
    <section
      className="solutions-closing"
      aria-labelledby="solutions-closing-title"
    >
      <div className="solutions-closing-topline">
        <span className="eyebrow">YOUR NEXT CHAPTER</span>
        <span>CONTEXT BEFORE COMMITMENT.</span>
      </div>
      <div className="solutions-closing-composition">
        <div>
          <span className="eyebrow">
            A QUESTION. A PROJECT. A CLEARER PICTURE.
          </span>
          <h2 id="solutions-closing-title">
            Let’s give your
            <br />
            <em>possibilities a place.</em>
          </h2>
          <p>
            Tell us about your space, your priorities and what you have in mind.
          </p>
        </div>
        <Link href="/request-quote" className="solutions-closing-action">
          <ArrowUpRight size={33} strokeWidth={1} />
          <span>
            Begin your
            <br />
            conversation.
          </span>
        </Link>
      </div>
      <p className="solutions-scope-note">
        Confirm equipment, specifications, pricing, project scope and any
        delivery or installation arrangements in writing before committing.
      </p>
    </section>
  );
}
