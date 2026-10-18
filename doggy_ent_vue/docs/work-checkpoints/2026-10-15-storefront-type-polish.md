# Storefront Typography And Section Polish

## Scope And Recovery

The owner accepted the shorter/wider product cards and requested more cohesive section titles/copy across pages. Keep ProductCard geometry/content/styles and commerce behavior unchanged. Refine shared Home/Campaign/Brand section typography, remove hard blue-edged heading bars, soften the patterned backdrop and retain moderate existing item radii. Round the collection filter toolbar as a functional tool, not another floating section card. Preserve all content, seasonal controls and shared public/editor renderers.

Local iteration only. No deployment, DB write, migration, env change, dependency, commit or push. Existing dirty work was inventoried with git status/diff stat/name-status and must not be reverted. Prior preview remains on port 5174 with local API 3101 and Railway DB catalog reads; do not restart or reconfigure normal user services 5173/3000.

## Plan

1. Centralize section introduction typography in the existing shared storefront stylesheet; keep story-card styling focused on individual items.
2. Align Home and Campaign/Brand reading text, heading weights and spacing. Omit empty eyebrow elements; preserve labels and content.
3. Run client build/tests, inspect all three pages and narrow layouts with the browser, verify product proportions/variant selection remain unchanged.
4. Record actual commands/results, screenshots, file list and remaining manual acceptance here and in PROJECT_HANDOFF.md. Update focused UX docs. No live publish.

## Completed

- Shared section titles: 26 px, weight 650, line-height 1.3, normal letter spacing and bounded wrapping. Introduction text: 16 px, line-height 1.65, maximum 64ch. No new heading panels or blue side borders.
- Shared `story-heading` styles moved into the existing `styles/storefront.css`; individual story item/photo styling stays in StorefrontStoryCard. Removed conflicting Home heading sizes. Review intro and Brand closing use the same section typography.
- Softer monogram opacity .045 instead of .11. Original artwork/brand colors remain. Functional collection filter toolbar gets white background, border and 8 px corners; existing product and story item rounding/shadows remain.
- Story item headings/body, Campaign programme text, Brand journey text and preparation/review copy have clearer consistent size/weight/line-height. ProductCard source/styles/geometry and functional behavior unchanged.
- Empty eyebrow markup is omitted in Next Drops, care and review headers; added one SSR case and toolbar assertion.

## Files Changed

Ten client files:

- `client/src/domains/storefront/styles/storefront.css`
- `client/src/domains/storefront/styles/home.css`
- `client/src/domains/storefront/components/StorefrontStoryCard.vue`
- `client/src/domains/storefront/components/BrandPageContent.vue`
- `client/src/domains/storefront/Home/sections/ProductCollectionSection.vue`
- `client/src/domains/storefront/Home/sections/NextDropsSection.vue`
- `client/src/domains/storefront/Home/sections/ProcessSection.vue`
- `client/src/domains/storefront/Home/sections/ReviewsPreviewSection.vue`
- `client/src/domains/campaigns/styles/campaignPage.css`
- `client/tests/tier2/storefront/storefront-sections.test.js`

Seven docs: this checkpoint, PROJECT_HANDOFF.md, docs/ux-ui-standards.md, docs/customer-experience.md, docs/architecture/storefront-editor.md, docs/architecture/file-map.md and docs/verification-and-qa.md. Preserve all prior dirty files; they were not newly authored here.

## Verification Results

| Command / Check | Result |
| --- | --- |
| Starting git status/diff stat/name-status | Exit 0; prior local work preserved. |
| Client `npm run build` | Exit 0; Vite 8.3.4, 2,296 modules. |
| Client `npm test` | Exit 0; 124 tests/25 files, 11/107/6 by tier. |
| `git diff --check` | Exit 0 before final documentation closeout; rerun at finish. |
| Env/lint inventory | Exit 0; zero changed/untracked env files, zero .env.example files; client has no lint script. |
| Product geometry | Same 1,112 px collection content width as prior iteration: first-row cards remain approximately 360 x 644 px. ProductCard files were not edited. |
| Variant/Quick View | Card 18 oz -> $39.99; Quick View retains 18 oz/$39.99 and test purchase disabled. Reset card to 6 oz afterward. No checkout/provider request. |
| Shared typography | Seven Home, five Campaign, six Brand headings (including closing) have computed 26 px/650 type. No empty Home eyebrow elements. |
| Browser layouts | Actual CSS 388 on all three pages: no page or heading overflow. Desktop 895/1910 inspected. Viewport override reset, temporary QA tab closed. |
| Console | No application error entries observed; existing local HTTP Stripe advisory is not payment verification. |
| Server / Prisma | No code/schema changes; no server suite/generation/migration required. No data writes. |

Local review tab stays open at `http://localhost:5174/#ingredients`. Existing detached API/Vite processes on 3101/5174 were reused without env edits/restarts; original 3000/5173 services untouched. No required test/build command is running.

## Proof And Next Steps

Artifact root: `/Users/nazxylix/.codex/visualizations/2026/06/01/019e859b-b6f3-78e0-b7ab-540ffb37b24b`. Screenshots: `section-polish-preview.jpg` (current compact desktop Home), `section-polish-home.jpg`, `section-polish-campaign.jpg`, `section-polish-brand.jpg` (wide desktop examples). No new images generated or uploaded.

This is a local visual proposal. Owner acceptance, real-device Safari/touch/screen reader, long edited copy and narrow authenticated editor canvas are still manual. Shared renderer reuse is confirmed from source, not a fresh authenticated editor session. Existing hidden legacy sections, test-only catalog and launch/payment/auth risks remain unchanged. No deployment, DB/content publication, env/dependency change, commit or push. Ready for focused commit review, not launch certification. Final doc/link/fence/secret-pattern and whitespace results follow at closeout.

## Closeout

Final documentation checker exit 0: 16 Markdown files, 236 balanced fence lines, 211 existing local links and 22 bounded secret-pattern file scans with zero findings. Final `git diff --check` exit 0. Env inventory reports zero changed/untracked env files and zero .env.example. All build/test commands completed successfully; only the previously retained detached local preview services remain running. No remote operation was initiated.
