# Contact page cinematic redesign

Completed locally on 27 October 2026 in the independent Rahat Energy workspace.

## Completed experience

The Contact page now has a full-screen pinned equipment scene, transparent fixed navigation, and a curved light surface that rises into the second section. The existing green, silver and soft-black identity continues through numbered contact routes, a spacious embedded enquiry form, a private order-access panel, FAQ disclosures and a green closing invitation.

The page offers clear routes for project enquiries, product discovery and existing orders. The embedded form reuses the existing quotation workflow, including product selection, multiline requirements, consent and server-side submission behavior. Readiness remains visible: unavailable services keep the submit action disabled and do not simulate successful requests.

No business phone, email, address, opening hours, map location, support response time or service commitment was invented. Direct details are explicitly awaiting confirmation. The private-order link uses the existing reference/access-code workflow.

## Files

- `app/contact/page.tsx`: full page, existing service-status lookup, embedded form and routing.
- `components/store/ContactHero.tsx`: dedicated opening using the existing pinned-scene hook and responsive hero foundations.
- `app/contact-editorial.css`: scoped layouts, form presentation, responsive states and reduced-motion behavior.
- `components/store/QuoteForm.tsx`: optional unavailable-message prop; existing validation, payload and submission behavior retained.
- `components/store/Chrome.tsx`: cinematic navigation for the Contact route.
- `app/layout.tsx`: stylesheet registration.
- `docs/UI-UX-CREATIVE-DIRECTION.md`: current Contact direction.

Existing local assets and fonts were reused. No dependencies, database schema, operational data, authentication or payment logic changed. No database provisioning or production deployment occurred.

## Validation

- Optimized production build passed, including route compilation and Prisma client generation.
- TypeScript and ESLint passed without warnings.
- Isolation passed: all 145 recorded parent source files remain unchanged.
- Twenty-four browser checks covered eight viewport sizes and three scroll positions. All returned HTTP 200, decoded the images and found no document overflow, visible hero/control overlap or automated WCAG A/AA violations. The hero remained pinned during its intended phase and navigation remained fixed.
- Ten interaction checks passed: hero anchor; embedded-form routing/readiness; product selection, consent and paragraph preservation; product/private-order/help destinations; absence of unverified contact links; native FAQs; mobile menu contrast and focus restoration; readable mobile fields and return-to-form action; reduced motion; preserved quotation-page defaults.
- Form checks used temporary browser data only. No enquiry was submitted or stored.

Evidence: `contact-editorial-browser-qa.json`, `contact-editorial-interactions.json`, six `contact-editorial-{1440,390}-{0,0.55,1.1}.png` screenshots and two full-page screenshots.

Automated accessibility checks do not constitute a full accessibility certification. Approved contact details and independent service activation remain business inputs; this update does not claim that enquiry persistence or live commerce is operational.
