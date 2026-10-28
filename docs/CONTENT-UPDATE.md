# Storefront content and landing pages

Updated the existing independent Rahat Energy application without changing the parent project, database schema or payment flows.

## Existing pages updated

Home now has a product-led introduction, links to category and solution landing pages, an ordering overview and FAQs. About explains the current product/enquiry experience without invented history or credentials. Contact routes visitors to projects, products, ordering guidance and existing-order information. Product details now have category-specific descriptions and preparation questions. The quote journey links to ordering guidance and the draft privacy notice.

Main navigation includes Solutions and Help. The footer includes ordering guidance, FAQs, order support and all four draft policy pages. Shared editorial components and centrally maintained content keep these pages consistent.

## Sixteen new page URLs

- `/solutions`: energy solutions overview.
- `/solutions/home`, `/solutions/business`, `/solutions/bulk-projects`: contextual landing pages, project prompts, planning steps and related product categories.
- `/categories/solar-panels`, `/categories/solar-inverters`, `/categories/battery-storage`, `/categories/solar-lighting`, `/categories/energy-accessories`: category introductions, three products each and useful selection questions.
- `/faq`: twelve expandable answers about the current experience.
- `/how-to-order`: browsing, shortlisting, enquiries and written confirmation.
- `/policies/delivery`, `/policies/returns`, `/policies/privacy`, `/policies/terms`: clearly marked business-approval drafts, with no invented delivery rates, warranty promises or returns windows.
- `/track-order`: honest tracking availability and order-support information; no simulated lookup.

## Main source changes

`lib/content.ts` owns category copy, solutions, FAQs and policy drafts. `components/store/Content.tsx` provides reusable introductions, enquiry calls to action and expandable FAQs. New App Router pages consume that content. Existing homepage, About, Contact, product details, enquiry pages, shared chrome and global responsive styles were updated.

## Content still awaiting approval

Existing visual identity and illustrations remain provisional. Actual contact details, product specifications, imagery, prices, operational stock, company background, installation scope, delivery arrangements and final policy terms still require business confirmation. No company performance claims, certifications, reviews or guarantees were added.

Payment and order placement remain disabled. No external database was provisioned or connected, and no production deployment was performed.

## Validation

- TypeScript and ESLint passed; all 12 existing commerce/API tests passed.
- Local Chrome checked 22 page routes and 44 internal links, including the new landing pages and all five category collections. Every category displayed its three products.
- FAQ expansion, unknown-page handling and mobile Solutions navigation passed.
- Eight representative pages were checked at 390px with no horizontal overflow.
- Automated WCAG A/AA checks covered eleven pages. Breadcrumb contrast was corrected on solution, category and product details; the targeted follow-up passed with zero violations.
- Browser checks observed no page errors. Results are recorded in `docs/content-qa.json`; screenshots are `docs/content-desktop-preview.png` and `docs/solutions-mobile-preview.png`.
- Isolation checks confirmed all 145 recorded parent source files remain unchanged.
