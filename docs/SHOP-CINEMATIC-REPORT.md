# Shop cinematic hero and curved catalogue reveal

Implemented locally on 26 October 2026. This replaces the earlier split shop banner.

## Experience

The shop now opens with a full-viewport architectural storage image. Navigation is fixed transparently over the scene, with dark glass on scroll and a light surface over the catalogue. The scene remains pinned while a broad, curved paper surface rises over it.

The shop has its own green/silver visual signature: a fine horizon contour beneath the hero, a second inset contour on the catalogue surface, an R / E crest and a centered editorial catalogue introduction. Native scrolling controls the reveal; no scroll hijacking is used.

“Enter the collection” leads to the curved introduction. A separate product shortcut and the collection index lead directly to browsing/search. Short screens use a compact composition; optional secondary decoration is reduced so controls do not overlap. All visible primary controls retain usable touch areas.

Reduced-motion preferences remove scene scaling, copy fading and decorative animation. The photography remains clearly illustrative and is not presented as an exact manufacturer/model photograph.

## Implementation

- `components/store/ShopHero.tsx`: dedicated full-screen shop composition and navigation links.
- `components/store/usePinnedScene.ts`: shared, cleaned-up motion lifecycle for the homepage and shop.
- `components/store/HeroExperience.tsx`: uses the shared hook while preserving the homepage composition.
- `components/store/Chrome.tsx`: cinematic overlay navigation on the homepage and shop; ordinary interior navigation on product details.
- `app/shop/page.tsx`: curved catalogue surface and centered editorial introduction.
- `app/page.tsx`: explicit navigation-surface marker.
- `app/shop-editorial.css`: scene, contours, reveal and compact layouts; 59 obsolete split-banner style rules removed.
- `app/cinematic.css`: readable mobile-menu branding when opened over a light content surface.

Existing product definitions, prices, inventory, filtering, sort/view controls, cart, checkout, quotations, payments and authentication contracts are preserved. No database activation or deployment occurred.

## Validation

- Optimized production build passed, including route generation and Prisma client generation.
- TypeScript and ESLint passed without warnings.
- Apartment isolation passed: all 145 recorded parent files remain unchanged.
- Fifteen responsive scroll checks cover five viewport sizes and three scroll positions. The hero stayed pinned during its intended phase, navigation stayed fixed at the viewport top, all fifteen products remained available, images loaded and no horizontal overflow or automated WCAG A/AA violations were detected.
- Seven hero/navigation checks passed: full-screen pinning; primary collection anchor; direct working product search shortcut; accessible shop menu over the catalogue; homepage motion/menu compatibility; product-detail interior navigation; reduced-motion behavior.
- All ten existing shop interaction checks also passed, covering search, filters, sorting, view modes, deep links and persistent cart behavior.
- Additional short-screen checks cover 320×650, 375×667, 844×390, 1280×720 and 1024×600 to keep hero text separated from the lower rail. Compact landscape layouts omit the optional lower rail.

Evidence: `shop-cinematic-browser-qa.json`, `shop-cinematic-interactions.json`, six `shop-cinematic-{1440,390}-{0,0.55,1.1}.png` screenshots and the existing `shop-luxury-interactions.json`.

Automated accessibility checks are not a full accessibility certification. The independent database remains deferred, product identities and photography remain provisional, and no live commercial activation is claimed.
