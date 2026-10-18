# Selected Modern Boutique Home Sections

## Scope And Safety

The owner approved only the Modern Boutique versions of Made With Care, Ingredient Promise and The Pair Behind the Name from the disconnected `modern-boutique-storefront.html` comparison. Keep the hero, featured item, accepted compact product cards, giving, Next Drops, header/footer, Campaign/Brand pages and all commerce behavior unchanged. Keep the current detailed review content, but enlarge its cards and contain extra reviews in a responsive carousel.

Local source only: no deployment, database write/publication, schema, environment, dependency, commit or push. Existing dirty work was inventoried with `git status --short --branch`, `git diff --stat` and `git diff --name-status`; preserve it. Reuse the existing preview on port 5174 and API on 3101. Do not restart/reconfigure normal user services.

## Implementation Plan

1. Replace the three selected layouts using managed copy/images and product-owned ingredient/care data. Keep safe links, image descriptions and template disclosures. Public and Website UI reuse these components.
2. Replace the small review grid with two larger desktop cards/one narrow card and native horizontal scroll snapping. Preserve rating/title/body/customer/date/product/variant/photo/fictional labels and the future-review notice.
3. Isolate carousel state/timing/measurements in a focused composable. Autoplay only with overflow and a visible section; pause for hover/focus, hidden tabs, reduced motion, explicit Pause and editor mode. Keep Previous/Next, manual scrolling and cleanup.
4. Add SSR/lifecycle regressions, run all client tests/build, inspect actual local desktop/mobile and editor boundaries, update docs/handoff with exact results and remaining QA.

## Completed Implementation

- Made With Care uses the mock's photo/copy split, yellow photo label, clear ordered process steps and understated story action. Existing managed title/introduction/process items/photo/alt remain connected; the fallback preparation image stays honestly illustrative.
- Ingredient Promise is a pale brand-yellow reading band with blue heading and four compact icon-led points, not two nested story cards. Actual product ingredients/storage and test disclosures remain. The real Quick View event and safe collection/help links still work; no nutrition/certification claim was invented.
- The Pair Behind the Name is a full-width photo/story composition with the existing managed paragraphs, title, caption, image description and real Brand route. Empty image selection falls back to the existing illustrated woodland Labrador pair. Ingredient/brand are no longer squeezed into paired half-width outer columns.
- Reviews preserve all seven existing ratings/titles/bodies/names/dates/product names/sizes/photos and fictional labels. Two larger cards fit wide layouts; one fits narrow layouts. Extra entries remain in a native scroll-snap track. The future-review notice remains below the track, not mixed into the testimonial rotation.
- New `useReviewCarousel` owns measurements, visible range, Previous/Next/wrap, explicit Pause/Play, eight-second overflow-only autoplay, focus/hover/visibility/reduced-motion gates and observer/listener/timer cleanup. Manual navigation or dragging pauses until explicitly restarted. Content arriving after mount reattaches observers. Website UI reuses the same renderers with autoplay disabled.
- Other Home sections, product cards and their proportions, giving, header/footer, Brand/Campaign pages, cart/auth/checkout and all server/data contracts are unchanged by this pass. No new dependency or image generation was needed.

## Exact Files In This Pass

Modified client files:

- `client/src/domains/storefront/Home/sections/ProcessSection.vue`
- `client/src/domains/storefront/Home/sections/IngredientsAnalysisSection.vue`
- `client/src/domains/storefront/Home/sections/AboutBrandSection.vue`
- `client/src/domains/storefront/Home/sections/ReviewsPreviewSection.vue`
- `client/src/domains/storefront/Home/HomePageContent.vue`
- `client/src/domains/storefront/styles/home.css`

Created client files:

- `client/src/domains/storefront/composables/useReviewCarousel.js`
- `client/tests/tier2/storefront/boutique-sections.test.js`
- `client/tests/tier2/storefront/review-carousel.test.js`

Documentation: this new checkpoint plus PROJECT_HANDOFF.md, docs/ux-ui-standards.md, docs/customer-experience.md, docs/architecture/storefront-editor.md, docs/architecture/file-map.md and docs/verification-and-qa.md. Earlier dirty files are retained, not newly authored in this pass.

## Verification Results

| Command / Check | Result |
| --- | --- |
| Initial git status/diff stat/name-status | Exit 0; prior dirty work preserved. |
| Targeted `npx vitest run tests/tier2/storefront/boutique-sections.test.js tests/tier2/storefront/review-carousel.test.js` | Exit 0; 13 tests in 2 files pass. |
| Client `npm run build` | Exit 0; Vite 8.3.4, 2,297 modules. |
| Client `npm test` | Exit 0; 137 tests in 27 files (11 tier1, 120 tier2, 6 tier3). |
| `git diff --check` | Passed before final documentation edits; rerun at closeout. |
| Actual local browser | All nine sections/eight products/seven existing reviews present. Review Next changes the scroll position/range and pauses rotation. Ingredient detail opens the real Quick View at 6 oz/$14.99; closed afterward, no cart/purchase action. |
| Responsive DOM checks | Actual CSS widths 2149, 846, 582 and 388: no horizontal page overflow. At wide 1,112 px review track, each card is approximately 544 px; narrow 352 px track has one 352 px card. The three selected layouts stack below their breakpoint. No out-of-bounds selected-section descendants at 388 px. Review controls remain approximately 44 x 44 px. |
| Images/console | Selected care/brand/review images loaded; no application error console entries on the final read. |
| Editor boundary | SSR verifies actual shared renderer receives autoplay=false. No authenticated Save/Publish or database mutation was performed. |
| Server / Prisma | No server/schema changes; no server build, migration or generation required. |

The viewport override does not reliably equal the requested browser width. Narrow override screenshots returned a blank capture despite valid DOM geometry; they are not evidence of a successfully painted phone view. Normal restored-viewport screenshots show the actual rendered page. Real Safari/iPhone/touch/reduced-motion OS/screen-reader verification remains manual.

## Proof And Remaining Acceptance

Artifact root: `/Users/nazxylix/.codex/visualizations/2026/06/01/019e859b-b6f3-78e0-b7ab-540ffb37b24b`.

- `boutique-home-care-reviews.jpg`: actual local Made With Care and larger detailed reviews.
- `boutique-home-ingredients-brand.jpg`: actual local Ingredient Promise and pair teaser, with unchanged footer below.

Manual QA: compare these three selected layouts with Modern Boutique; read long edited copy, custom backgrounds and replacement images; swipe/keyboard the review track, try Previous/Next/Pause/Play and OS reduced motion; inspect the narrow Website UI canvas and confirm preview never rotates or writes before explicit Save/Publish. Keep fake reviews/test product facts labelled. No new payment/session/provider certification is implied.

Local review remains at `http://localhost:5174/#ingredients`. Existing preview/API listeners are reused; no new server was started or stopped. No required build/test command remains running. Focused edits are ready for commit review in the existing dirty tree, not deployed or launch-certified.

## Recovery

Inspect current source and this checkpoint after interruption. Implementation and client verification above are complete; finish any pending closeout/documentation checks below before claiming final completion. Do not replay historical Railway publication/archive/provisioning helpers. The current live deployment is unchanged.

## Closeout

Documentation check passed: seven Markdown files, 228 balanced fence lines, 133 existing local links and no failures. `node --check` on the new composable and `git diff --check` passed. Bounded secret-pattern scan of the sixteen touched files returned zero findings; no changed environment files and no client/server `.env.example` exist. This is not an exhaustive secret/security audit. The unusable narrow screenshot was removed; normal proof captures remain. Viewport override reset and temporary product popup closed; the user's local tab and pre-existing services remain. No required build/test process is still running. No deployment, DB publication, provider send, payment, commit or push occurred.
