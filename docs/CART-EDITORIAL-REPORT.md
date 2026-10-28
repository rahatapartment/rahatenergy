# Cart editorial redesign — 27 October 2026

## Experience

The Cart page at `/cart` follows the established Energy visual direction: a pinned illustrative storage scene, transparent fixed navigation and curved paper reveal. The hero provides a direct review action. The main workspace includes editorial product cards, a desktop sticky summary, an empty-cart invitation, ordering guidance and a solutions route.

Product cards show category photography, availability, unit price, quantity controls, removal and line totals. The summary distinguishes unknown prices from zero and never displays a partial subtotal as a complete estimate. Delivery and final operational details remain subject to confirmation. Existing checkout and quote routes are preserved; no payment is initiated by reviewing checkout.

The existing browser storage key and 1–99 quantity limits remain. Quantity updates now retain product order, preventing a card from moving while its controls are being used. Loading, storage notices and quantity/removal announcements remain available.

## Files

Created `components/store/CartHero.tsx` and `app/cart-editorial.css`. Updated `app/cart/page.tsx`, `components/store/CartView.tsx`, `components/store/CartProvider.tsx`, `components/store/Chrome.tsx`, `app/layout.tsx` and `docs/UI-UX-CREATIVE-DIRECTION.md`.

## Scope

No database, API, catalogue, checkout or payment configuration changes. No Supabase provisioning or deployment. Product images remain illustrative and product details provisional. Database-backed prices and stock are not claimed operational.

## Validation

TypeScript and lint passed. Twelve browser checks across six viewport sizes passed without horizontal overflow or automated WCAG A/AA violations in tested states. Seven interaction checks covered multiple saved products, quantity limits, persistence, removal, checkout routing, empty-state accessibility and reduced motion. Existing commerce tests passed (10/10). Isolation verification confirmed 145 unchanged parent source files and fifteen provisional products.

Evidence: `cart-editorial-browser-qa.json`, `cart-editorial-interactions.json` and accompanying desktop/mobile screenshots. Automated accessibility checks cover tested states and are not certification.

The production build passed. The independent development preview was restored on port 3001 after the build.
