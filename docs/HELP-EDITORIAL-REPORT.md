# Help editorial redesign — 27 October 2026

The Help page (`/faq`) now follows the established cinematic Energy direction, with a pinned illustrative lighting scene, transparent fixed navigation and curved second-section reveal.

## Completed

- Responsive editorial introduction and spacious searchable answer library.
- All twelve existing FAQ answers preserved, grouped into four topics.
- Case-insensitive question and answer search, matching excerpts, result count, clear/reset controls and an actionable empty state.
- Native keyboard-accessible answer disclosures and filtered expand/collapse controls.
- Contextual links to products, quotations, ordering guidance, policies and private order access.
- Dark editorial journey and green closing invitation.
- Reduced-motion behavior and accessible mobile navigation retained.

## Files

Created `components/store/HelpHero.tsx`, `components/store/HelpExplorer.tsx` and `app/help-editorial.css`. Updated `app/faq/page.tsx`, `app/layout.tsx`, `components/store/Chrome.tsx` and `docs/UI-UX-CREATIVE-DIRECTION.md`.

## Validation

TypeScript, lint and isolation verification passed. Browser evidence is recorded in `help-editorial-browser-qa.json`, `help-editorial-interactions.json` and accompanying desktop/mobile screenshots. Automated accessibility checks are evidence for the tested states, not accessibility certification.

## Boundaries

No database, API, payment or catalogue definitions changed. No Supabase provisioning or deployment. Illustrative imagery and the existing provisional pricing, product, delivery and policy qualifications remain. No unverified contact information, company claims or support guarantees were added.

Production build passed. All 24 viewport/scroll checks passed across eight viewport sizes, with no overflow, broken images, hero overlap or automated WCAG A/AA violations in tested states. All ten interaction checks passed, including search, topic filters, empty-state recovery, keyboard disclosures, route availability, mobile navigation and reduced motion. Isolation verification reconfirmed 145 unchanged parent source files and fifteen provisional products.
