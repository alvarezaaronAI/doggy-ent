# Storefront Visual Editing

## Storybook And Impact First (2026-10-17, Local)

`BrandPageContent` is the approved Storybook composition; `BrandPortraitPanel` owns only transient selected-portrait state. `presentation.brand.portraits` stores exactly two allowlisted `{ name, tagline, text, image, alt }` records in existing StorefrontContent JSON. Canonical defaults merge into old drafts/publications. Validation bounds text and image destinations; nested projection strips extra fields; the storefront service includes portrait media in selected-database existence checks. No schema/migration or new env variable. Deploy matching server validation/projection before enabling client portrait saves.

`AdminPresentationFields` edits those records using existing protected media tooling. The Brand canvas leaves only local portrait selection interactive; its navigation stays inert. Other page previews retain prior inert wrappers. Save/Cancel/Publish and optimistic revision rules are unchanged.

`CampaignPageContent` composes Impact First with `CampaignGivingSummary` (actual fixed/percentage/status/dates/attributed-not-paid facts), test-only `CampaignExampleSections`, the real partner narrative and unchanged ProductCard controls. Website UI owns its contribution-panel surface/labels; Campaigns still owns story, beneficiary, schedule and rules. The public page, Catalog canvas and commerce pop-out reuse this renderer. `StorefrontPhoto` supplies shared media URL resolution, bounded ratios, captions and failure fallback. See [verification/recovery](../work-checkpoints/2026-10-17-storybook-impact-first.md).

Implemented locally: 2026-10-09. Approved integration: 2026-10-15. Consult the latest handoff for exact deployment results; older dated proposal sections below are historical.

## Approved Unified Workspace (2026-10-15)

Local 2026-10-16 follow-up: Home's ProcessSection, IngredientsAnalysisSection and AboutBrandSection now use the selected Modern Boutique layouts, with existing settings and product facts unchanged. Public and canvas render the same components/styles. HomePageContent passes autoplay=false to ReviewsPreviewSection in editable mode; previewing a larger review track never starts rotation or writes content. No presentation contract/schema/field was added. Selected section colors still yield to the existing explicit section background override. See the [checkpoint](../work-checkpoints/2026-10-16-boutique-home-sections.md).

The owner approved separate presentation persistence in the existing StorefrontContent record. Website UI now owns static wording, colors, density, announcement rotation and page templates. It must not change Product/Campaign business records. Business navigation stays expanded and grouped; page/component and section selectors live inside the main workspace, followed by the shared preview and contextual inspector. Signed-in identity and backend-derived data routing remain unchanged.

The categorized selector includes Home, Campaign, Chase & Evie, Header & footer, Product cards, Product pop-out, Checkout and Order confirmation. Home keeps hide/reorder/add controls. Campaign preview loads the real full public campaign, not just its summary; its partner/story/rules stay read-only here. Brand origin text and three suggested story chapters are static presentation. Product previews use real catalog facts and inert purchase actions.

Canonical `shared/storefront/pagePresentation.js` defines template labels/surfaces and brand defaults. Its generated client/server snapshots are included in both sync scripts. The existing projection and validator allowlist these fields; three announcement messages, rotate, monogram and compact-grid density are validated. Public reads still expose published content only. Draft/Publish/Cancel/revision conflict behavior is preserved.

`useAnnouncementRotation.js` rotates every 5.5 seconds with fade, Previous/Next/Pause and cleanup; hidden/reduced-motion states disable automatic rotation. Shared `SiteFooter.vue` remains the only footer for Home/Brand/Campaign/account. Existing icons are reused, not another styling framework.

Products -> image action opens `AdminProductImages.vue`, backed by `useAdminProductImages.js` and `PATCH /api/products/:id/images`. This protected endpoint accepts only main image, up to four ordered `{ image, alt }` entries and updatedAt. Existing media existence/URL validation and optimistic updatedAt comparison protect saves. The repository updates image columns only; it never deletes/recreates variants. Product prices/stock/status remain in ordinary Catalog management. Website UI cannot upload/save a product gallery through presentation publishing.

Migration `20261014000000_product_galleries` is additive and was applied locally and to the approved Railway testing target after backup/preflight. It adds galleryImages and isTestProduct, including JSON-array/max-four constraints. Test products are explicitly denied by the server checkout resolver and client availability helper regardless of stock or selling mode. See [database](database.md) and [handoff](../../PROJECT_HANDOFF.md).

Generated photos, fictional review examples and the test partner are testing content, not verified claims. Seven review examples appear only when the corresponding Website UI option is enabled and carry explicit fictional labels. Customer review submission/moderation is not implemented by this phase. Gallery/brand image placement and replacement guidance live in [asset guide](../../assets/brand/image-placement-guide.md).

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
| Meet the brand | Homepage teaser text/photo/caption/story action; the separate Brand page selector edits its static origin/story/chapter presentation through the shared renderer. |
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

Current approved integration: local and Railway migration status is up to date with 22 completed migrations; the owner explicitly approved backup/preflight, additive gallery migration and both service deployments. Exact evidence is in the latest handoff. Existing server `start` includes `prisma migrate deploy`; future pending migrations still require deliberate target/preflight/approval, not an incidental restart.

The original editor phase added no dependencies; the media follow-up adds server-side `sharp` for safe raster optimization and an additive media migration. No new environment variables, env files, provider sends, labels, or payments. Existing local client -> local backend -> selected DB modes and deployed API/auth variables stay unchanged. Current provider/CLI inspection confirms roots `doggy_ent_vue/client` on Vercel and `/doggy_ent_vue/server` on Railway. Generated runtime copies avoid requiring external-root imports.

## Review And QA

See [QA](../verification-and-qa.md) and the latest [handoff](../../PROJECT_HANDOFF.md) for executed checks and remaining manual work. Verify draft/publish, concurrent edits, hide/order/add/remove, mobile preview, long content/image failures, safe links, all product fields/variants, inert shopping, shared cart/search/auth, eligible giving, and one approved deployed guest/signed-in Stripe test checkout. Never publish QA content or write Railway without approval.

## Appearance-Only Proposal (2026-10-14)

The owner approved a mockup direction, not a replacement of the current working editor. The revised example keeps expanded business navigation separate from main-workspace page/section selection, canvas and contextual static editing. Product pop-out joins the page/component choices. All business record fields, Product-owned photos/descriptions/ingredients and Campaign-owned partner/story/programme/rule data are read-only in Website UI; template labels, visibility, colours, density and seasonal feel are the proposed editable surface.

The prototype has no API/database save or upload. Save/Cancel operate only on its sample state. The owner specifically requested static presentation without DB writes; actual static publication/persistence remains an architecture decision before implementation. The existing StorefrontContent draft/publish implementation above is unchanged and must not be represented as satisfying this new no-DB requirement. Do not connect a visual change to the full product replacement save or campaign business mutation.

Header/footer are rendered once across the three example pages. Additional fictional partner content shows potential Campaign-managed fields but does not add schema columns. The background/photography/page compositions remain preview-only. Separately approved, zero-stock Railway test products are described in the [latest handoff](../../PROJECT_HANDOFF.md#2026-10-14-refined-preview-and-approved-railway-test-catalog) and [image placement guide](../../assets/brand/image-placement-guide.md).

### Preview Refinement: Shared Header And Product Galleries

The next unapproved mockup preserves expanded business navigation but removes the duplicate strip of section buttons. Two categorized native selectors and the canvas handles select the page/section inside the workspace. Header & footer includes three announcement-message fields, visibility and a rotation toggle. Public examples rotate with a gentle fade every 5.5 seconds, expose Previous/Next/Pause, and stop automatic rotation in editing, hidden-page and reduced-motion states. This is proposed behavior, not current application functionality.

Product pop-out adds a larger selected-variant price and main image with a vertical desktop/horizontal mobile thumbnail rail. Catalog -> Products contains a separate sample image manager with four optional slots, local selection/remove/reorder and explicit sample Save/Cancel. Website UI only changes the pop-out template labels and appearance; it cannot mutate product photographs or business fields. Real upload is intentionally disabled in the mockup.

The current Prisma Product still has one `image` and no gallery field; the actual `ProductQuickViewGallery.vue` uses that image. A future gallery implementation needs an approved product/media contract, server-enforced maximum, ordered descriptions, image fallbacks and focused persistence. Do not use the existing full replacement product update for image-only saves: `products.service.js` currently deletes/recreates variants during that update. Preserve prices, variant identity, stock and order snapshots. No schema/API/source/deployment change was made in this refinement.

Home now demonstrates a photo-led preparation section and seven prominently labelled fictional reviews; Campaign uses programmes plus a giving sidebar; Brand uses a journey alongside everyday photographs. All share the same smaller footer/header. The mockup does not implement customer review submission or verified-purchase moderation. See [gallery assets](../../assets/brand/product-galleries/README.md) and the latest handoff for results and approval boundaries.

## Current Connected Implementation (2026-10-15)

This section supersedes the preview-only boundaries above. The owner explicitly approved existing StorefrontContent as separate presentation persistence, additive Product gallery migration, testing data and direct deployments. Product has main image plus zero-to-four gallery images and a permanent test flag; image-only optimistic updates do not replace variants. Website UI owns presentation labels/colors/section visibility, not product/campaign business data.

The exact polished compositions are shared public/editor renderers: `HomePageContent`, `BrandPageContent`, `CampaignPageContent`, `StorefrontHero`, `StorefrontStoryCard`, ProductCard and ProductQuickView. Category/protein/editor collection choices share `productVisibility.js`; archived/draft items never enter public collections. Main-workspace selectors/handles and right inspector own editing; business navigation contains no form controls. Hidden legacy sections remain labelled Hidden in editor only and do not render publicly. Canonical defaults use the new loading/failure layout too. Seven fictional reviews and test-campaign programmes are not real customer/partner functionality.

Publication revision 5 has nine visible Home sections. The guarded archive/publication operations preserved original order references and all unrelated business data. Exact deployment/status/QA and resumable next steps are in [the current checkpoint](../work-checkpoints/2026-10-15-approved-ui-reconciliation.md). Arbitrary HTML/code sections, real review submission, every fictional programme field, scheduled publication and real policies remain future content/features; do not describe placeholders as connected functionality.

### Responsive Density Follow-Up (Local Only)

`theme.columns` remains the same three/four-valued presentation setting, with no data migration or publication. The inspector now labels it **Maximum collection columns**: the shared product grid can render fewer columns to preserve a comfortable 300 px minimum card width, or fit the available width on a narrow screen. It is not a promise of exactly three/four columns at every desktop width. ProductCard spacing and shared heading reading bands are CSS/component changes reused by public and editor renderers; they add no API or business-data mutations. See the [density checkpoint](../work-checkpoints/2026-10-15-storefront-density.md).

The subsequent typography proposal keeps the accepted product dimensions but replaces the heading bars. `styles/storefront.css` now owns the shared `story-heading` type/spacing and collection filter toolbar; `StorefrontStoryCard.vue` owns individual reading/photo item styles, not global section-title rules. Home overrides no longer assign conflicting section title sizes. Public/editor rendering remains shared without a second typography implementation, new setting or persistence contract. See the [typography checkpoint](../work-checkpoints/2026-10-15-storefront-type-polish.md).
