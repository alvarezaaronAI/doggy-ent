# Storefront Visual Editing

Implemented locally: 2026-10-09. This guide describes working source, not a deployed release.

## Website Workspace

Open `/admin/website` from Website under Store & Marketing. Existing signed-in identity, navigation, and backend-derived data routing remain visible. Section navigation is on the left, the miniature actual homepage in the middle, and selected fields on the right. Select from the list or a pencil control. The inspector stacks above the canvas on small screens. Wide/phone controls adapt the embedded canvas; this is a shared renderer, not a pixel-identical browser/device emulator.

| Area | Editable Content |
| --- | --- |
| Announcement | Visibility, message, optional destination. |
| Header | Brand text, search placeholder, ordered navigation labels and links. Account/cart behavior stays shared. |
| Hero | Headline, supporting copy, photo/description, badges, shopping/ingredient/story actions, supporting links. Empty photo/copy/primary action retain existing catalog/template fallbacks. |
| Brand promises | Link labels/destinations. |
| Featured product | Select a real active product or use the catalog feature. Prices/sizes/content/availability remain product-owned. |
| Collections | Headings/copy, selected active products, visibility/order/background. None selected means all matching active products. Existing search/filter/sort results still apply. |
| Next Drops | Heading/copy/shop action. Upcoming cards remain catalog-owned and unavailable for purchase. |
| Happy Pups | Heading/copy/caption and optional uploaded or hosted gallery images/descriptions. Empty gallery retains templates; this is not verified-review management. |
| Made with care | Heading/copy and process items. |
| Ingredient promise | Section heading/copy/action; actual ingredients/storage/analysis come from Products. |
| Meet the brand | Homepage teaser text/photo/caption/story action. The full `/meet-chase-evie` story remains separately code-owned. |
| Shopping help | Heading and question/answer items. |
| Footer | Visibility, brand/introduction/bottom text, background, navigation and safe platform-specific social links. |
| Seasonal appearance | Everyday/Autumn/Winter accents and optional uploaded or hosted decorative background image, such as approved pumpkin artwork. |
| Checkout | Receipt First heading/introduction; Apple Pay and Google Pay switches. Existing form/totals/customer/payment data stay live and protected. |
| Order confirmation | Soft Essentials heading/introduction, oat/white/emerald background, next-step/help wording and safe help destination. Real order, receipt email and payment state cannot be edited. |

Each block supports hide/show and explicit up/down ordering. Add sale/announcement banners, image-and-story blocks, product collections, and galleries, up to 24 blocks. Original singleton blocks and the main collection cannot be deleted; hide them instead. Added blocks can be removed from the draft.

Checkout/confirmation use Page to edit, not reorderable homepage blocks. Their canvas uses the actual checkout sections and confirmation renderer with clearly fictional data/inert Stripe fields. No provider or payment is initialized by preview actions. Existing publications merge safe commerce defaults without falsely showing dirty/unpublished content. See [checkout/order email](checkout-and-order-email.md) for shared cards, wallet requirements and coordinated deployment.

Background choices preserve the approved white/oat/emerald palette. Image fields accept protected admin uploads/reusable library selections or external HTTPS images. See [media library](media-library.md) for storage, limits and deployment. Navigation/action/social destinations stay links, not upload fields. Seasonal presets are restrained accents; a generated Halloween template is available in `assets/seasonal/`. Holiday scheduling, arbitrary layout/CSS/HTML/JavaScript, and new checkout functions are not implemented. A sale banner communicates an offer; actual discounts still require a valid promo configuration.

The inspector labels name the actual content location: Hero introduction, Brand story introduction, Sale details, Question/Answer, care step, photo caption, accessibility description, and action destination. Supporting links no longer expose an unused body-text field. Unsaved selections show **Edited · not saved** in navigation/canvas feedback; saving clears these markers without claiming publication. The appearance strip shows selected palette/artwork. Explicit section palettes/images override original section CSS; global seasonal artwork repeats behind readable tinted bands rather than stretching across the entire page. Hero photography remains separately controlled, so ineffective hero section-background controls are not shown.

## Save And Publish

1. Confirm data routing before editing. Target is selected when the backend starts, never in this editor.
2. Edit the draft. Shopping/account/external links in the canvas are inert. Product editor size controls change only its local preview.
3. **Save draft** persists without changing the public website. **Cancel changes** discards only unsaved edits after confirmation.
4. **Publish website** validates and confirms, then atomically saves the draft and a public snapshot. It changes the website for customers whose backend uses that database.
5. **Use published version** copies the current publication into the draft. Save/Publish remain explicit; there is no older-version archive yet.

Failed saves retain drafts. Revision comparison rejects stale edits with HTTP 409 rather than overwriting another editor. Reload/route leave/before-unload protect unsaved work. Public reads do not create/seed records. Existing tabs reload content on a subsequent load after the 60-second cache interval; there is no real-time broadcast.

Hidden-section anchor links are omitted in the header/footer and shared content links. Search targets the visible main collection or first visible additional collection; search is absent when none is visible. Cart/account controls cannot be replaced by arbitrary content.

## Product Card Workspace

Open Products, then create/edit. `AdminProductCanvas.vue` renders the actual `ProductCard.vue` or `ComingSoonCard.vue`, using the existing form mapper and variant helpers. Pencil controls select Details & image, Variants & stock, or Tags & product information. Publishing stays a selectable inspector section.

All existing fields remain: category/protein/cut/description/photo, tags, ingredients/texture/storage/freshness/not-included/best-for data, guaranteed analysis, separate 6 oz/18 oz prices/quantities/SKUs/thresholds, selling mode/status/featured state. Save uses the existing product API/validator and updates the selected database immediately, independently of website publication. Draft status prevents shopper visibility. Product/variant/checkout rules are unchanged.

## Data And Security

| Endpoint | Access | Responsibility |
| --- | --- | --- |
| `GET /api/storefront/content` | Public | Only allowlisted published presentation; no draft/revision/private data. `Cache-Control: no-store`. |
| `GET /api/admin/storefront` | Admin | Draft/publication, revision and timestamps. |
| `PUT /api/admin/storefront/draft` | Admin | Validate/project/save `{ revision, content }`. |
| `PUT /api/admin/storefront/publish` | Admin | Validate/project/atomically publish `{ revision, content }`. |

Server routes require `requireAdminAuth`. Validation covers version, byte size, section count/type/unique anchors, typed fields, image descriptions, links/social platforms, singleton counts, and at least one visible section. Only plain text and safe internal/HTTPS links are supported. API/admin destinations, protocol-relative/data/credential-bearing URLs, and encoded protected paths are rejected. The sole image-only local-path exception is exact `/api/media/<uuid>`; services confirm that asset exists in the selected database before saving. Thumbnails/protected APIs cannot be used as content/action destinations. Explicit projection separates public content from editor metadata.

`StorefrontContent` stores singleton `home`: JSON `draft`, nullable JSON `published`, integer `revision`, nullable `publishedAt`, and created/updated timestamps. No product/order/customer fields or relations change. Additive migration: `20261009010000_storefront_content`.

## Source Of Truth And Deployment

- Canonical catalog/defaults, validator, public projection, and social-link rules: `shared/storefront/`.
- Committed generated snapshots: `client/src/domains/storefront/content/` and `server/src/domains/storefront/content/`. Do not edit independently. Each build runs `scripts/sync-storefront-content.js`; full checkouts regenerate from canonical source, isolated deployment roots use committed snapshots. Review both copies alongside canonical edits.
- Public/editor rendering: `HomePageContent.vue` and original section components. `HomeView.vue` retains real catalog/cart/filter/campaign orchestration; no mock shopping engine is added.
- Public state/API: `useStorefrontContent.js`, `storefrontContent.api.js`. Failed/invalid reads retain last known good/default content so shopping is not blocked; monitoring repeated failures remains recommended.
- Admin state/API: `useAdminWebsite.js`, `adminWebsite.api.js`; focused canvas/field/link/item components keep views and HTTP separate.
- Server: route -> controller -> service -> repository -> Prisma in `server/src/domains/storefront/`.

Local migration is applied and schema status is up to date. No Railway migration/deployment occurred. Obtain explicit approval and review the additive migration before Railway. Existing server `start` includes `prisma migrate deploy`, so deploying this backend may apply the table migration and must be treated as that authorized step. Do not deploy accidentally during an unrelated restart.

The original editor phase added no dependencies; the media follow-up adds server-side `sharp` for safe raster optimization and an additive media migration. No new environment variables, env files, provider sends, labels, or payments. Existing local client -> local backend -> selected DB modes and deployed API/auth variables stay unchanged. Actual Vercel/Railway root settings were not inspected in their dashboards; generated runtime copies avoid requiring external-root imports.

## Review And QA

See [QA](../verification-and-qa.md) and the latest [handoff](../../PROJECT_HANDOFF.md) for executed checks and remaining manual work. Verify draft/publish, concurrent edits, hide/order/add/remove, mobile preview, long content/image failures, safe links, all product fields/variants, inert shopping, shared cart/search/auth, eligible giving, and one approved deployed guest/signed-in Stripe test checkout. Never publish QA content or write Railway without approval.
