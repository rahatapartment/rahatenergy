# Shopping-led homepage refinements — 28 October 2026

## Changes

Reduced the official logo sizes across storefront, footer, admin and sign-in. The homepage now opens with five category slides and explicit shopping actions. Each slide has its own illustrative equipment scene, category copy and category destination; a persistent all-products route provides a direct path to the shop.

The hero supports manual selectors, previous/next buttons and horizontal touch gestures. Automatic rotation uses a seven-second interval, pauses during interaction and when outside view, and offers explicit play/pause controls. Reduced motion disables automatic rotation and scene transitions. Short screens use natural hero scrolling rather than trapping controls beneath the second section.

The category experience uses compact icon-led controls, an appropriately sized image and responsive horizontal tab scrolling. Touch gestures switch the image panel, while existing keyboard tab navigation is retained. Visible swipe guidance accompanies the controls.

The former three-product curated edit now shows exactly one controlled product from each of the five categories. It uses a five-column desktop collection and a snap-scrolling product rail on smaller screens. Products retain existing cart behavior, provisional-price handling and availability information. No verified sales ranking exists, so these are labelled curated highlights rather than falsely claiming purchase popularity.

Circular arrow-only controls use centered flex layout with zero internal padding and no inherited icon margins. The larger circular enquiry actions now center both the arrow and text group, including mobile.

## Files

Updated `components/store/HeroExperience.tsx`, `components/store/CategoryExperience.tsx`, `app/page.tsx` and `app/layout.tsx`. Added `app/home-sales.css`. No database, product identities, payment or API changes.

## Validation

TypeScript, lint and isolation verification passed. Thirty slide-layout checks (five slides across six viewport sizes) passed without horizontal overflow or copy/control overlap. Hero circular arrow centre offsets were below two pixels in all measured states. Six page-level automated WCAG A/AA checks passed, with reduced motion enabled for settled-state measurement.

Five interaction groups passed: slide navigation; hero/panel touch gestures; keyboard category navigation; one featured product per category; and actual timed automatic slide advancement with explicit pause/play controls. Reduced-motion preferences disable automatic rotation. Evidence: `home-sales-browser-qa.json`, `home-sales-interactions.json` and desktop/mobile screenshots. Automated checks cover tested states and are not accessibility certification.

The production build passed. No production deployment was performed.
