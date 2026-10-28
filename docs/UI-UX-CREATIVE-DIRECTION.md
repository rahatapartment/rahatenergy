# Rahat Energy — energy, beautifully engineered

## Confirmed brand direction

The user confirmed green, silver (80% white) and soft black (80% black). This supersedes the earlier provisional navy, champagne and amber proposals.

| Token | Working value | Purpose |
| --- | --- | --- |
| Green | `#1F6A48` | Brand accents, primary actions, editorial emphasis |
| Silver | `#CCCCCC` | Fine borders, reflective details, supporting tones |
| Soft black | `#333333` | Core typography, dark surfaces and navigation |
| Paper | `#F4F6F3` | Generous light surfaces and reading space |
| Light green | `#CCE4D4` | Accessible accents against dark backgrounds |

The two 80% descriptions are interpreted as opaque sRGB neutral values, rather than translucent overlays. The green hue is an implementation choice within the confirmed family; no exact green brand code was supplied. Tonal variants create depth while preserving readable contrast. Gold is no longer a UI accent. Naturally warm light in the illustrative architectural photography is part of the scene, rather than a brand colour.

## Creative concept

“Let life flow. Beautifully powered.” combines architectural calm with the precision of an energy equipment collection. The site moves between full photographic scenes, light editorial space and dark product installations. Each section has a different composition, while typography, alignment, fine rules and restrained green details connect the whole page.

Manrope provides readable interface typography. Locally hosted Cormorant Garamond creates expressive display headings and italic emphasis. Open font licences are included. Paragraphs have controlled line lengths; forms retain generous 16px inputs and spacious multiline writing areas.

## Landing-page sequence

1. **Pinned architectural opening.** A full-viewport solar scene, transparent fixed navigation and an accessible scroll invitation. A broad curved content surface rises naturally over the scene.
2. **Energy introduction.** A centered editorial headline, structured paragraphs and a clear route to the company's approach.
3. **Interactive elements.** A charcoal installation with five category tabs, a large product composition and category-specific descriptions. One panel changes at a time; nothing rotates automatically. Keyboard arrows, Home and End work alongside touch controls.
4. **The considered edit.** Three functional product cards follow a staggered desktop rhythm, with clear prices/availability and cart actions. Mobile uses a deliberate single-column composition.
5. **Energy in context.** Full-width architecture becomes the setting for home, business and project routes. The image is explicitly illustrative.
6. **A considered approach.** A sticky editorial margin accompanies a numbered sequence of useful decisions. On mobile the sequence flows normally.
7. **Answers.** A calm split layout uses native accessible disclosure elements for FAQs.
8. **The next chapter.** A green closing scene, fine concentric geometry and a circular enquiry action lead into an oversized editorial footer signature.

## Scroll and interaction

The hero uses native sticky positioning inside a two-viewport stage. The next surface overlaps the second viewport, avoiding scroll hijacking. Navigation changes contrast as it crosses from image to content. The mobile menu locks background scrolling, keeps keyboard focus within its controls, restores focus on Escape and makes covered content inert.

Section reveals are progressive enhancement through IntersectionObserver. Content is visible without scripting, and reduced-motion preferences remove decorative reveals, scene transforms and image entrance animation. Category navigation switches between vertical desktop and horizontal mobile semantics; mobile scrolling is contained within the tab list.

## Imagery and content governance

Local WebP photography represents product categories, not verified manufacturer models. The architectural scene is a concept, not a completed Rahat Energy installation. Category mapping remains in `lib/placeholder-images.ts`, with original prompts/provenance in `public/images/README.md`. Display treatments reduce saturation on equipment imagery without changing the source assets.

The fifteen product identities remain provisional. No prices, stock, technical specifications, certifications, testimonials, warranties or sales figures were invented. Database and service readiness gates remain authoritative. The redesign changes presentation and discovery interactions, not commerce, payment or authentication contracts.

## Implementation boundaries

`HeroExperience.tsx` controls the pinned hero. `Chrome.tsx` controls navigation and the shared footer. `CategoryExperience.tsx` controls category discovery. `HomeMotion.tsx` handles optional reveal enhancement. Homepage compositions live in `app/page.tsx` and `app/home-editorial.css`; the shared brand tokens and earlier cinematic layout remain in `app/design-system.css` and `app/cinematic.css`.

The initial cinematic transition drew inspiration from the spatial rhythm of https://sobharealty.com/, inspected in a browser. No reference-site imagery, video or proprietary assets were copied. The apartment project remains separate, and no production deployment is part of this work.

## Shop — the considered showroom

The shop extends the same green, silver and soft-black direction into a focused commerce experience. A full-screen pinned storage scene carries expressive typography beneath transparent fixed navigation. A curved paper surface with a fine inset contour rises over the image and introduces the catalogue. The catalogue returns to light paper, with a horizontal category index, generous photography and precise product information.

The default collection order interleaves the five existing categories to show the breadth of the range. It changes presentation order only, without adding a product-ranking claim or altering catalogue identities. Desktop visitors can choose a three-column grid or a two-column gallery. Mobile uses a deliberate single-column product composition, a contained category rail and expandable refinements.

Product cards retain real prices and availability when present, explicit unconfirmed states when absent, and the existing shortlist/cart behavior. Active filters are individually removable. Unknown prices remain unknown in both sort directions. A photographic green consultation section offers a clear route when a customer needs help choosing.

The implementation is scoped to `app/shop/page.tsx`, `components/store/Shop.tsx`, the optional collection presentation of `ProductCard.tsx`, and `app/shop-editorial.css`. The homepage and product-detail cards retain their existing default presentation.

The shop and homepage share `usePinnedScene.ts` for reduced-motion-aware scene enhancement. `ShopHero.tsx` provides the shop-specific composition, collection anchors and compact-screen treatments. Product detail pages retain their normal interior navigation.

## Product details — a closer perspective

Product pages use a deliberate editorial showroom rather than another promotional hero. A large photographic composition pairs with an expressive product title, clear price/availability, quantity selection and contextual actions. Mobile puts the product identity before the image, then introduces purchase information in a logical sequence.

The gallery offers a full composition and an explicit crop of the same illustrative category photograph. Its native dialog supports magnification, accessible controls, Escape/focus restoration and background scroll locking. The viewer uses a bounded grid so its controls remain available in short landscape viewports.

The information journey moves through a photographic category overview, structured specifications, four practical suitability questions and related alternatives from the same category. No compatibility recommendation is implied by the related collection. A slim section index supports direct navigation beneath the main header.

A shared mobile selection bar appears when the main controls are outside the viewport, using the same quantity and cart action. Unpriced products can be saved to a shortlist; Buy Now remains disabled until a price is confirmed. Existing stock constraints and server checkout validation remain authoritative. Missing models, technical details, warranty terms and delivery arrangements are labelled for confirmation rather than fabricated.

The implementation is scoped to `app/shop/[slug]/page.tsx`, `ProductGallery.tsx`, `ProductPurchase.tsx` and `app/product-editorial.css`. The shop and homepage retain their established hero experiences.

## Solutions — in your element

The solutions overview and all three perspectives now share the landing page's cinematic rhythm: full-viewport pinned photography, transparent fixed navigation and a broad curved paper surface rising over the scene. `SolutionsHero.tsx` reuses the existing reduced-motion-aware pinning hook, with a distinct headline, image and starting-point action for each perspective.

The overview moves from an editorial introduction to staggered photographic routes for home, business and larger projects. A native radio-based planning guide changes the questions shown for the chosen perspective. It provides context for an enquiry rather than calculating equipment sizes or presenting a preconfigured system.

Each detail page presents the existing three planning steps, four context questions and category routes in a more spacious editorial layout. Other-perspective links and a shared green closing invitation make the next action clear. Existing category explanations, enquiry behavior and written-confirmation requirements remain authoritative. No performance, service availability, installation or compatibility guarantees were invented.

`app/solutions-editorial.css` scopes these compositions and short-screen treatments. Navigation recognizes only the four valid solutions paths as cinematic pages; unrelated pages retain their existing treatment.

## About — our perspective, your possibilities

The About page now follows the same cinematic opening and curved second-section reveal as the landing page. A solar-equipment scene provides a distinct opening image while the shared pinned-scene hook and responsive hero layout preserve the established motion and navigation behavior.

The story is grounded in the existing storefront offering: solar, inverters, storage, lighting and supporting components. An architectural editorial section introduces the role of a customer's space and priorities. Three numbered principles describe the experience—clarity, context and conversation—without inventing company history, credentials, completed projects or service guarantees.

Five photographic category routes, a green enquiry invitation and the large editorial footer signature make the next step clear. Existing illustrative-image labels and the note about company information awaiting confirmation remain visible. `AboutHero.tsx` and `app/about-editorial.css` reuse the validated cinematic foundations; no commerce or service behavior changes.

## Contact — a good connection, a clearer beginning

The Contact page now uses the same pinned hero, transparent fixed navigation and curved second-section reveal. An illustrative equipment-connection scene gives this page a distinct visual identity within the established green, silver and soft-black palette.

The content prioritizes three useful routes: project enquiries, product discovery and private order access. The existing quotation form is embedded as a project enquiry workflow, with the same validation, consent and submission contract. It explicitly shows service availability and retains a disabled submit action when services are unconfigured. An optional presentation-only availability message lets Contact explain that state in customer-facing language while the original quotation page retains its defaults.

Verified telephone, email, address and opening hours have not been supplied, so none are invented or linked. A separate private-order panel, native FAQ disclosures and a closing return-to-form action provide clear next steps without claiming response times or support channels that have not been confirmed.

## Help — good questions, clearer possibilities

The Help page at `/faq` now shares the pinned photographic hero, fixed transparent navigation and curved paper reveal. Its lighting scene is labelled illustrative and uses the established green, silver and soft-black palette.

A searchable library preserves all twelve existing answers. Four topic filters, matching-text previews, native keyboard-accessible disclosures, result counts and an explicit empty state make answers easier to find. Expand and collapse actions apply to the current results. A responsive support rail and three editorial next steps connect product discovery, shortlisting, enquiries and private order access without inventing support channels or service guarantees.

`HelpHero.tsx`, `HelpExplorer.tsx` and `app/help-editorial.css` keep the composition reusable and scoped. Reduced-motion preferences disable decorative scaling and fading. Existing service availability, provisional catalogue information and policy qualifications remain authoritative.

## Cart — considered choices, new possibilities

The cart extends the cinematic opening and curved transition into an editorial shortlist. A direct review action leads to product cards with clear quantity controls, availability, unit prices and line totals. A pale-green desktop summary moves into the normal content flow on smaller screens. Its language distinguishes unconfirmed prices from a zero-value order and preserves the existing checkout and enquiry routes.

The empty state offers discovery and complete-system enquiries. Dark ordering guidance and a green solutions invitation explain the next steps without inventing stock reservations, delivery commitments or service availability. Browser persistence is retained, and quantity changes preserve card order so controls remain predictable.

## Private order access — your order, a clearer view

Track Order pairs the cinematic photographic opening and curved paper reveal with a spacious two-column access workspace. A pale-green form surface makes the two required details clear, with a masked code, visibility control, concise hints and explicit feedback. Privacy guidance explains that a reference alone is insufficient.

A dark editorial section separates payment, fulfilment and delivery perspectives without simulating progress. The green assistance section explains where access details come from and distinguishes carts and quote requests from orders. Existing test-mode qualifications and private access protections remain authoritative.

## Operations — a focused workspace

The admin area carries the Energy palette into a focused application layout. A grouped green sidebar, restrained editorial headings, clear access context and spacious paper surfaces separate navigation from operational work. Desktop uses persistent sidebar navigation; mobile uses an explicit disclosure with Escape support. The section finder filters navigation, while the product catalogue has its own search and category controls.

Metrics remain grounded in actual database records and show unavailable values when disconnected. Workflow routes and a truthful setup panel replace invented charts or activity. Tables, forms, operational notices, settings and read-only walkthroughs share a consistent design. The split sign-in screen includes password visibility and clear authentication feedback; server permissions and operational safeguards remain authoritative.

## Confirmed identity — 28 October 2026

The supplied `public/images/logo.png` replaces the provisional constructed brand mark across shared storefront and operations components. The confirmed palette supersedes earlier no-gold/provisional palette guidance: emerald `#009B4D`, metallic gold `#D4AF37`, electric lime `#A3E635`, deep green `#006B3C` and champagne `#FFF2A6`.

Use emerald for prominent action surfaces with readable dark labels, deep green for contrast and supporting surfaces, lime for selective electrical accents, and metallic/champagne gold for restrained outlines and highlights. Retain paper backgrounds and neutral reading text. Do not recolour or distort the supplied logo. Small green text on paper uses the deeper brand variant; gold and lime are not used as low-contrast paragraph text.
