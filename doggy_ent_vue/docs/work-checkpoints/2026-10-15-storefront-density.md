# Storefront Density And Readability

## Scope

Focused follow-up to the approved polished UI: shorter/wider product cards without removing information/actions, and readable section headings/copy over the patterned page. Preserve shared public/editor renderers, six brand/giving colors, selected variants, auth/cart/checkout and test safeguards. No business-data write, migration, commit or push. This iteration will be shown locally; no new deployment is implied.

## Plan And Recovery

1. Adjust shared ProductCard spacing/photo proportions and responsive grid; preserve complete photos and all important fields.
2. Reuse `story-heading` as a solid integrated reading band, with no nested floating section cards. Apply consistently to Home/Campaign/Brand/editor headings; preserve existing page composition.
3. Run client build/tests and local browser checks using actual Railway-backed read-only catalog requests through the local API. No provider/payment/business writes.
4. Record measured before/after geometry, screenshots, remaining manual QA and exact preview URL. Update handoff and focused UX docs; leave changes for review.

Starting tree is already dirty from the prior accepted integration; do not revert it. Prior live release remains Vercel `dpl_2E6UaeyT6QHFq589zMts7WWzygvN`, Railway `7714b914-cd87-4e7c-ab84-264abdd3637b`. Normal local database content differs intentionally from the Railway testing catalog.

## Implemented

- Shared product grid: 300 px minimum when space permits; responsive fit below that; configured three/four columns are maxima. Auto-fill retains tracks when filtering rather than stretching a lone item across the page.
- ProductCard: shallower 3:2 contain photo, tighter information/action gaps, retained complete title/tags/description/facts/sizes/price/status/actions and giving strip. No variant/cart/pricing logic changed.
- Shared `story-heading`: solid white, blue left edge, readable introduction copy and controlled title spacing. Collection filters moved into the same header surface. Next Drops, care and reviews now use that heading surface; existing Giving/Ingredients/Brand and Campaign/Brand chapters reuse it.
- Inspector density copy describes responsive maximum columns without changing saved settings or business data.
- One additional SSR regression test checks custom collection title/copy/filters inside the header and loading state outside it.

## Files Changed In This Follow-Up

Client (eleven):

- `client/src/domains/admin/components/AdminWebsiteFields.vue`
- `client/src/domains/products/ProductCard/ProductCard.vue`
- `client/src/domains/products/ProductCard/ProductCardInfo.vue`
- `client/src/domains/storefront/Home/sections/ProductCollectionSection.vue`
- `client/src/domains/storefront/Home/sections/NextDropsSection.vue`
- `client/src/domains/storefront/Home/sections/ProcessSection.vue`
- `client/src/domains/storefront/Home/sections/ReviewsPreviewSection.vue`
- `client/src/domains/storefront/components/StorefrontStoryCard.vue`
- `client/src/domains/storefront/styles/home.css`
- `client/src/domains/storefront/styles/storefront.css`
- `client/tests/tier2/storefront/storefront-sections.test.js`

Docs (six): this checkpoint, `PROJECT_HANDOFF.md`, `docs/ux-ui-standards.md`, `docs/customer-experience.md`, `docs/verification-and-qa.md`, `docs/architecture/storefront-editor.md`. Other existing dirty files belong to prior work; do not revert or claim them as new changes here.

## Verification

| Check | Result |
| --- | --- |
| Starting git status/diff stat/name-status | Exit 0; existing work preserved. |
| Client `npm run build` | Exit 0; Vite 8.3.4, 2,296 modules. |
| Client `npm test` | Final exit 0; 123 tests/25 files, 11/106/6 by tier. Initial new assertion had a default-title capitalization mismatch; explicit fixture copy fixed it, full suite rerun. |
| Server/Prisma | No files changed; no build, generation, migration or DB write required. |
| Desktop geometry | Same 1,112 px inner collection width: released first-row cards 266 x 719 px; local 360 x 644 px. Content-dependent, not fixed card heights. Complete images loaded. |
| Size and popup | Card 18 oz -> $39.99; popup opens with 18 oz. Popup 6 oz -> $14.99. Existing test-item purchase disabled. No checkout/payment request. |
| Filtering | Chicken filter produces one matching card; restoring All works. |
| Reading surfaces | Seven Home, five Campaign and five Brand heading bands have computed opaque white backgrounds; no failed image or desktop page overflow. |
| Responsive | Settled CSS widths 388/582/1910 fit without horizontal overflow. Narrow card has no content overflow. Requested viewport values differ from actual browser CSS dimensions; not real-device certification. |
| Console | No application error entries. Expected Stripe.js local HTTP/HTTPS advisory; not a live payment test. |

No lint script exists; none added. No env file or secret copied, no .env.example created, no provider send, no commit/push or deployment. Documentation/link/fence and final whitespace checks are the final closeout step; record their actual results below.

## Preview And Recovery

Local preview: `http://localhost:5174/#shop`. Task-owned API listens on 3101 using the existing ignored Railway DB override through `integration-dev-server.mjs` in the artifact directory; imports the app directly, no startup fixture writes/migrations. Vite uses process-only local API settings and the existing `RAILWAY_DB` target label. Do not replace normal `server/.env`. Original user listeners 5173/3000 remain untouched.

Artifact root: `/Users/nazxylix/.codex/visualizations/2026/06/01/019e859b-b6f3-78e0-b7ab-540ffb37b24b`. Screenshot: `storefront-density-desktop.jpg`. Local preview tab is retained. API/Vite processes are deliberately left available for visual review; no test/build command remains running. No new live release exists for this iteration.

Next: owner visual review; real-device Safari/phone and long-copy/narrow-editor checks. A fresh authenticated editor publish test and any deployment require deliberate approval; do not automatically publish this local follow-up. All public products remain test-only/unpurchasable, so do not claim payment acceptance. Original launch gates in the prior checkpoint remain open. Focused changes are suitable for commit review, not blanket launch certification.

## Final Closeout

Documentation checker exit 0: 15 Markdown files, 236 balanced fence lines, 206 existing local links, 21 bounded secret-pattern scans and zero findings. `git diff --check` passes. Env inventory exit 0: no changed/untracked env files, no .env.example. The first inventory wrapper treated ripgrep's normal no-match exit 1 as an error; the corrected wrapper explicitly handles that result and passed. No environment content was printed.

Task-owned interactive API/Vite sessions were stopped cleanly with SIGTERM (exit 143), then restarted as detached local preview processes so no verification command is pending. Artifact-only launcher: `start-density-preview.mjs`; API PID 16586, Vite PID 16587 at closeout. Private local logs: `density-api.log`, `density-vite.log` in the artifact root, not Git. Before reusing the launcher, check ports and do not start duplicates. After restart, frontend `/`, API `/api/products` and `/api/storefront/content` each returned HTTP 200 with the expected HTML/JSON content type; browser refreshed and showed the same eight cards. Preview remains available on 5174 through local API 3101. No previous user process was stopped or reconfigured.
