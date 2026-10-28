# Official logo and palette — 28 October 2026

The supplied `public/images/logo.png` is now used by the shared Brand component in storefront navigation, footer, administrator navigation and sign-in. The original logo is preserved without recolouring, cropping or distortion. Next Image provides responsive delivery. Browser and Apple icon metadata reference the same supplied image.

## Approved palette

| Role | Colour |
| --- | --- |
| Primary emerald | `#009B4D` |
| Metallic gold | `#D4AF37` |
| Electric lime | `#A3E635` |
| Supporting deep green | `#006B3C` |
| Champagne highlight | `#FFF2A6` |

Emerald primary actions use dark text for contrast; deep-green surfaces support light text. Lime highlights selected navigation and key accents. Gold is used in fine rules, outlines and highlights; champagne provides softer editorial highlights on green. Paper and neutral text surfaces remain for reading comfort.

`app/brand-identity.css` is the final shared identity layer. Existing editorial and operations styles have their former green/charcoal surface values aligned to deep green. Tailwind palette names and typography now match the confirmed identity. The old constructed lightning/wordmark component is removed.

No catalogue identities, API contracts, database values, payment configuration or deployment settings changed. Earlier reports record provisional branding and are superseded by this approved palette.

## Validation

TypeScript, lint and isolation checks passed. Twenty-eight browser checks covered fourteen storefront and operations routes at desktop and mobile sizes, with reduced motion enabled to measure settled colours. All supplied logos loaded; no placeholder brand icons, horizontal overflow or automated WCAG A/AA violations were found. Three additional states passed: populated mobile cart, expanded storefront navigation and expanded operations navigation.

Evidence: `brand-identity-browser-qa.json`, `brand-identity-state-qa.json` and accompanying screenshots. Automated checks cover tested states and are not accessibility certification. Initial review findings on footer and action-label contrast were corrected before the final run.

Production build passed. No production deployment was performed.
