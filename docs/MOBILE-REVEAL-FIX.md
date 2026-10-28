# Mobile hero reveal correction — 28 October 2026

## Cause and change

The deployed homepage at `https://rahatenergy-xi.vercel.app/` contained the short-screen fallback from `app/home-sales.css`. Below 700px viewport height, it changed the hero to relative positioning, fixed the stage to 700px and removed the overlapping second-section margin. This disabled the pinned curved reveal, including on phones whose available height is reduced by Safari's browser chrome.

Removed that fallback. Short viewports now retain a sticky 100svh hero, 200svh stage and the overlapping paper surface. More compact typography, spacing and controls keep shopping actions reachable. Very short screens omit secondary links instead of disabling the reveal. The shared reduced-motion behavior remains intact; decorative movement stays disabled when requested.

Only the homepage presentation changed. No commerce, database, API or payment behavior changed. No production deployment was performed; Vercel requires deployment of the updated source.

## Validation

Production build, TypeScript and lint passed. Tests were run against `next start`, not the development server. Chrome mobile emulation passed 45 slide/viewport combinations covering all five slides at nine viewport sizes, including 320×568, 375×667, 390×700 and 844×390. Tests confirmed sticky positioning, hero staying pinned while the second section advances, no content/control overlap and no document overflow. Scroll decoration, reduced-motion state and automated contrast checks passed.

Evidence: `mobile-reveal-production-qa.json`, `mobile-reveal-motion-qa.json` and screenshots. Browser emulation does not replace physical iPhone Safari testing.

WebKit verification also passed the same 45 production slide/viewport combinations, plus scroll decoration, reduced-motion and automated contrast checks. Evidence: `mobile-reveal-webkit-production-qa.json`, `mobile-reveal-webkit-motion-qa.json` and WebKit screenshots. This tests Safari's engine locally, not a physical iPhone or an updated Vercel deployment.
