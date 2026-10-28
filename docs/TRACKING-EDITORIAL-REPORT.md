# Private order access redesign — 27 October 2026

## Experience

`/track-order` now uses the established cinematic hero, fixed transparent navigation and curved paper reveal. An illustrative components scene leads to a spacious access form, privacy guidance, three status explanations and help for locating access details.

The form retains the existing POST contract, reference normalization, 43-character case-sensitive access code and server-controlled authenticated redirect. The code is masked by default, with an accessible visibility toggle. Field hints, native validation, pending state, duplicate-submit guard and error feedback support the lookup flow. Previous errors clear when a new attempt starts.

Payment, fulfilment and delivery descriptions explain the existing order page without presenting invented order data, shipment locations or progress. The test-mode notice remains explicit. Neither a cart nor an enquiry is described as a placed order.

## Files

Created `components/store/TrackOrderHero.tsx` and `app/tracking-editorial.css`. Updated `app/track-order/page.tsx`, `components/store/OrderActions.tsx` (OrderAccess presentation and form feedback), `components/store/Chrome.tsx`, `app/layout.tsx` and `docs/UI-UX-CREATIVE-DIRECTION.md`.

## Boundaries

The access API, token hashing, HTTP-only cookies, rate limiting, origin checks, verification logic and authenticated order page are unchanged. No database provisioned, credentials added or deployment performed. Real authenticated order retrieval remains dependent on the independent database; browser mocks test UI response handling only.

## Validation

TypeScript, lint and isolation checks passed (145 unchanged parent source files; fifteen provisional products). Twelve responsive browser checks across six viewport sizes passed without horizontal overflow, broken images or automated WCAG A/AA violations in tested states. Six interaction checks passed: native required fields, code visibility, normalized POST/pending/error handling, service failure recovery, success routing, mobile navigation and reduced motion. Response tests used mocks; successful authenticated retrieval against PostgreSQL has not been tested in this phase.

Evidence: `tracking-editorial-browser-qa.json`, `tracking-editorial-interactions.json` and desktop/mobile screenshots. Automated accessibility checks are evidence for tested states, not certification.

The production build passed. No production deployment was performed.
