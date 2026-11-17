# Calm brand refinement — 29 October 2026

The supplied `public/images/logo.webp` replaces the PNG in shared storefront/admin branding and icon metadata. Its square dimensions are declared correctly, while the compact display sizes remain unchanged. The original supplied asset is not recoloured or cropped.

## Confirmed palette

| Role | Hex |
| --- | --- |
| Emerald | `#00A86B` |
| Lime | `#A8D545` |
| Metallic gold | `#D5B374` |
| Champagne yellow | `#FFF08A` |
| Black | `#000000` |

Large bright-green surfaces are replaced by derived muted pine (`#1C4A3B`), darker supporting shades and black. Emerald and lime are retained as small accents rather than large luminous fills. Gold provides quieter outlines and highlights. Primary buttons use muted pine with light labels; selected admin navigation uses a restrained dark tint and lime only on its icon. Paper reading surfaces remain for legibility.

`app/brand-calm.css` is the final identity layer, following the homepage and category styles so the calm direction applies consistently. Earlier hardcoded green surfaces and Tailwind palette values were aligned. This direction supersedes the earlier palette reports.

No database, catalogue, payment or API changes. No deployment performed. The live site requires a new deployment to receive these changes.

## Validation

TypeScript, lint and isolation verification passed. Thirty-two browser checks covered sixteen storefront/category/admin routes at desktop and mobile widths. All shared logos loaded from WebP; no obsolete placeholder mark, horizontal overflow or automated WCAG A/AA violations were found in the final tested states. Three additional states passed: populated mobile cart, expanded storefront navigation and expanded operations navigation.

Evidence: `brand-calm-browser-qa.json`, `brand-calm-state-qa.json` and screenshots. Automated checks cover tested states and are not certification. Existing compact logo sizing and the mobile pinned-reveal correction were preserved.

The production build passed. No deployment was performed.
