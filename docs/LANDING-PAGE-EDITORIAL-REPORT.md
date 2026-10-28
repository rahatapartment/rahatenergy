# Landing-page editorial completion and brand correction

Implemented locally on 26 October 2026. This is the current landing-page direction and supersedes earlier provisional gold/navy styling.

## Completed experience

The remainder of the landing page now follows the cinematic opening. An interactive charcoal category installation replaces the repeating category grid. A staggered product edit preserves working shortlisting actions. A full-width architectural section introduces three solution routes. A sticky editorial heading accompanies the numbered choosing guide. Native FAQ disclosures, a green closing scene with a circular enquiry action, and a large serif footer signature complete the page.

Green is the brand accent. Silver uses `#CCCCCC`, and 80% black is represented by `#333333`. The working green is `#1F6A48`; light paper and muted green variants provide readable contrast. The earlier champagne/gold UI colours have been replaced across the active design system, hero and navigation. Existing photographs retain natural light and materials.

No new dependencies, backend changes, database connections, operational data or production deployment were introduced.

## Files created or changed

- `app/page.tsx`: complete editorial section sequence, functional product cards and routing.
- `components/store/CategoryExperience.tsx`: five-tab category discovery, associated image/copy/link, keyboard support and responsive orientation.
- `components/store/HomeMotion.tsx`: optional section reveals with reduced-motion support and observer cleanup.
- `components/store/Chrome.tsx`: homepage footer signature.
- `app/home-editorial.css`: new compositions, states, responsive layouts, contrast and reduced-motion rules.
- `app/design-system.css`, `app/cinematic.css`: corrected shared brand colours.
- `app/layout.tsx`: editorial stylesheet registration.
- `docs/UI-UX-CREATIVE-DIRECTION.md`: authoritative current palette and creative direction.

## Validation

- Optimized production build passed, including all route generation and Prisma client generation.
- TypeScript passed.
- ESLint passed without warnings.
- Apartment isolation passed: all 145 recorded parent files remain unchanged.
- Homepage reviewed at 1440×1000, 1024×768, 768×1024, 390×844 and 320×650. All images loaded, every reveal became visible after scrolling, no horizontal document overflow occurred, and no automated WCAG A/AA violations were detected.
- Shop, quotation, contact and read-only admin preview checked at desktop and mobile widths after the shared palette change. No overflow or automated accessibility violations were detected.
- Eight new interaction checks passed: all category states and destinations; keyboard navigation; multi-product additions; solution/enquiry routing; FAQ disclosures; contained mobile category scrolling; reduced motion; persistence into the cart.

- Eight existing cinematic/menu interaction checks also passed after the palette update, giving sixteen passing interaction checks in total.

Automated checks do not replace a full manual accessibility audit. Product photography is illustrative, product identities remain provisional, and unconfigured service gates remain intact.

Evidence: `editorial-browser-qa.json`, `editorial-interactions.json`, `editorial-home-1440.png`, `editorial-home-390.png`. Existing hero/menu checks are recorded in `cinematic-interactions.json`.

## Remaining business inputs

Official product photographs and verified product/company/operational information are still needed for a commercial launch. The user has deferred database activation. No database or payment activation is claimed by this visual update.
