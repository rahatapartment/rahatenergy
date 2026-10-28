# Cinematic hero and navigation refinement

> Historical implementation report. The current green/silver/soft-black palette and completed landing page are documented in [LANDING-PAGE-EDITORIAL-REPORT.md](LANDING-PAGE-EDITORIAL-REPORT.md).

Implemented locally on 26 October 2026.

## Changes

- A full-viewport solar architectural scene remains pinned during the first scroll sequence.
- Transparent fixed homepage navigation overlays the image, with centered desktop branding, search, cart and an outlined quotation action.
- Navigation gains a dark glass surface when scrolling over imagery and changes to warm light over the introduction. Surface/text changes avoid temporary low-contrast intermediate states.
- A broad, curved warm-neutral surface rises over the hero. The second section uses editorial typography, structured paragraphs, an energy introduction and clear links onward.
- The hero includes restrained champagne details, an accessible scroll invitation, category discovery and visible illustrative-image disclosure.
- Mobile navigation is a full-screen panel with keyboard containment, Escape/focus restoration, locked background scrolling and inert covered content. Resizing to desktop releases the menu and scroll lock.
- Reduced-motion support removes scene transforms, copy fade and decorative animation. Scrolling remains native.
- Supporting homepage headings use the new local editorial font while commerce interfaces retain Manrope.

The visual reference was [Sobha Realty](https://sobharealty.com/), inspected in Chrome at the top and during the curved section reveal. This implementation uses Rahat Energy's own local illustrative assets and content.

## Files

- Created: `components/store/HeroExperience.tsx`, `app/cinematic.css`, `public/fonts/cormorant-garamond.ttf`, `public/fonts/Cormorant-OFL.txt`.
- Updated: `components/store/Chrome.tsx`, `app/page.tsx`, `app/layout.tsx`, `docs/UI-UX-CREATIVE-DIRECTION.md`.
- Evidence: `docs/cinematic-browser-qa.json`, `docs/cinematic-interactions.json`, `docs/cinematic-{1440,390}-{0,0.55,1.05}.png`, `docs/cinematic-mobile-menu.png`.

## Validation

- TypeScript and ESLint passed without warnings.
- Optimized production build passed, including route generation and Prisma client generation.
- Five viewport sizes: 1440×1000, 1024×768, 768×1024, 390×844 and 320×650; three scroll positions each. All fifteen checks had no horizontal overflow or detected WCAG A/AA violations. Header top stayed at zero, and hero top remained zero through the pinned phase.
- Eight browser interaction checks passed: accessible mobile menu and scroll lock; Escape/focus restoration; focus containment and route closure; catalogue filtering and persisted cart; interior-page menu accessibility; scroll invitation; reduced-motion support; desktop resize cleanup.
- Apartment isolation check passed: all 145 recorded parent files unchanged.

Automated accessibility checks do not constitute a full accessibility certification. Existing illustrative-image disclosures, provisional product information and service readiness gates remain in place. No database, production data, payment or authentication logic was changed. Nothing was deployed.
