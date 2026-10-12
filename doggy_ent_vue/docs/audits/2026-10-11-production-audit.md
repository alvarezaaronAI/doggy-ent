# Production Security And Commerce Audit

Reviewed: 2026-10-11. Branch: dev-main. Scope: the current Doggy Ent workspace and its Git history/path metadata. No commit, push, deployment, Railway migration, real payment, label purchase or live email was performed.

**Conclusion: the repository has substantially improved security controls, but is not cleared for real paying-customer launch.** Durable payment-to-order recovery and atomic promo/campaign integrity remain high-priority blockers. Admin authentication was migrated to Better Auth after explicit user approval, preserving the dashboard. Local provisioning and DB-session smoke checks passed; deployed provisioning and browser acceptance remain outstanding.

## Scope And Evidence

The initial working tree was clean. Subsequent edits belong to this audit. The initial inventory contained 567 tracked files. A later inventory included 584 first-party/config/document/asset files before the final documentation additions. Every directory was inventoried; 458 source/script JS/Vue modules were parsed for literal import graphs with no parse failures or unresolved literal imports. All 266 standalone source/script JavaScript files passed node --check. Tests, schema/migrations, configuration and production assets received separate checks.

Deep review concentrated on mounted routes, guards, auth engines, ownership queries, pricing/payment/order transactions, promo/campaign persistence, provider boundaries, upload normalization, public/private mappers and environment/deployment loading. Static inventory/import/unsafe-sink/secret scans cover the remaining client components and shared modules. This is not a human line-by-line review of every dependency, image pixel, historical blob or generated file. node_modules, caches, dist and generated Prisma files were reviewed as installed dependencies/build outputs rather than first-party source.

Historical filename scanning found server/.env in commits 58c7f912 and fa9936b. The historical blob was **zero bytes**, with no assignments or non-comment text; the later change removed it. An initial caution was corrected after this check. No credential leak is established by that empty file. Current env files are untracked/ignored. Pattern scans found no private-key, Stripe secret/webhook key or credential-bearing database URL matches in inspected first-party text or generated frontend assets. This is a bounded scan, not comprehensive secret-history certification.

The complete application access matrix and 105 installed native customer/Infrastructure HTTP paths are in [API Access Audit](2026-10-11-api-access.md). Controls were code-reviewed for every mounted application route; runtime checks exercise selected groups, not every live production operation.

## Initial Priorities

1. Trace authorization, copied-cookie logout and customer ownership.
2. Trace trusted pricing, Stripe verification, idempotency, inventory and promotion attribution.
3. Review migrations, startup/seed safety, uploads and public/private data.
4. Check dependency advisories, deployment/API routing and error/log privacy.
5. Add focused regression tests; run builds, syntax/import and local DB checks.
6. Update architecture/handoff and identify manual/provider/infrastructure gates.

The admin session migration was the only additional high-risk architectural change approved during the audit. Durable checkout recovery is documented below, not silently implemented.

## Section A Project Overview

Chase & Evie Co. is a dog-treat ecommerce application for shoppers and a small-business operator. It supports real catalog/variants, a persisted cart drawer, guest or Better Auth customer checkout, Stripe card/wallet integration, order receipts/history, campaign-funded giving, promos, admin catalog/campaign/promo/order/customer tools, content editing, public images and manually previewed operational email templates. Rewards, wishlist, full address book, product reviews, customer case replies, refunds, automated fulfillment and broader permissions are incomplete or placeholders, not shipped capabilities.

### Stack And Architecture

| Layer | Technology | Verified use |
| --- | --- | --- |
| Languages | JavaScript ESM, Vue SFC templates, CSS, SQL; TypeScript Prisma config | JS application; SQL migrations; not a fully typed application |
| Frontend | Vue 3.5.43, Vue Router 5.0.6 | Composition API, nested admin/account routes, protected route UX, reusable storefront/editor renderers |
| Build/style | Vite 8.3.4, plugin-vue 6.0.6, Tailwind 4.2.4 and Vite plugin | Static production bundle; scoped workspace CSS/tokens; no second styling framework |
| Icons/media | @lucide/vue 1.53.0, Font Awesome 6.5.0 CDN CSS, Sharp 0.35.5 | Icons; integrity-pinned external stylesheet; validated raster WebP/thumbnail processing |
| Browser payment | @stripe/stripe-js 9.5.0 | Stripe Elements and Express Checkout Element; no server secret in Vue |
| Backend | Express 5.2.1, cors 2.8.6, cookie-parser 1.4.7, express-rate-limit 8.5.2 | Domain API mounts, guards, exact-origin credentials, bounded JSON/raw bodies and per-IP limits |
| Auth | Better Auth 1.7.7, Prisma adapter, bcryptjs 3.0.3, better-call 1.3.6 | Separate customer/admin configs, native sessions/credentials, imported admin bcrypt compatibility; bounded native Node transport |
| Auth Infrastructure | @better-auth/infra 0.2.14 | Existing customer dash/dashClient integration; live dashboard permissions/connection not verified |
| Database | PostgreSQL, matched Prisma/client 6.16.2, pg 8.20.0 | 21 SQL migrations, typed ORM, indexes/relations/transactions; pg direct application use not established |
| Provider APIs | Stripe Node SDK 22.1.1, Resend HTTP API, Shippo HTTP API | Trusted payment create/retrieve; manual email and carrier abstractions; no new provider config |
| Environment | dotenv 17.4.2, Vite build-time public variables | Startup-selected local/remote DB and frontend API origin |
| Verification | Vitest 4.1.11, Vue SSR/fixtures, actual native auth engine memory adapter, guarded local Prisma/HTTP | Three test tiers; no existing lint/typecheck script |
| Tooling/hosting | npm lockfiles, Git, Vercel SPA config, Railway deployment conventions | Dashboard/root/HTTPS/proxy/backup settings not accessible in this audit |

Client structure: view -> composable/API -> mapper/validator/utils/components. Shared cart/search/auth state and public/editor renderers are retained. Server usually follows route -> controller -> service -> repository -> Prisma, with existing exceptions: product services access Prisma directly and promo routes contain controller-like handlers. No speculative restructuring was performed.

PostgreSQL stores product cents/stock/SKUs; Float order/promo/campaign money normalized at calculation boundaries; nullable Order.userId; unique Stripe PaymentIntent IDs; snapshot order items; status history; shipments/events; customer profiles/support/preferences; drafts/publications; media metadata/blobs; templates/deliveries; Better Auth users/accounts/sessions/verifications. Float money and JSON product/campaign references are future integrity improvements, not replaced in this pass.

Browser -> Vercel static Vue -> configured Railway Express -> Prisma/PostgreSQL. Stripe.js talks to Stripe; secret payment checks remain in Express. Resend/Shippo secrets remain server-side. Temporary admin workflow is local browser -> local API -> local DB or Railway DB. The frontend never directly connects to Postgres.

## Section B Security Findings

Severity describes the confirmed behavior, not an assumed active attack. A dependency advisory is not automatically an exploitable application endpoint.

| ID | Severity | Affected source | Confirmed issue and impact | Resolution and verification |
| --- | --- | --- | --- | --- |
| B01 | High | auth/services/auth.service.js, auth/routes, requireAdminAuth | Old signed admin session survived logout when copied; clearing a cookie was not revocation | **Fixed via approved Better Auth migration**: persistent sessions, role/status checks, isolated cookies, absolute 8h expiry, disabled signup, verified logout deletion. Native-engine and actual local Prisma/HTTP copied-cookie tests |
| B02 | Medium | adminAuth/customerAuth configs; auth/utils/authResponse.js | Native Better Auth signOut catches DB deletion failure and can otherwise return success | **Fixed** shared post-logout revocation verification. Fault-injected native engine tests for both surfaces return 500 without exposing DB detail |
| B03 | Medium | customerAuth.service.js | Response sanitization covered only signup/signin/get-session; additional native responses could expose session/provider tokens contrary to policy | **Fixed** sanitize every JSON auth response. Actual engine list-sessions test plus signup/get-session tests; HttpOnly Set-Cookie intentionally retained |
| B04 | Medium | account.validator.js, account.service.js | Profile input coerced unexpected objects/booleans/unbounded strings | **Fixed** typed/bounded profile/address/preferences validation; unit negative tests. Own user ID remains server-derived |
| B05 | Medium | checkout.controller.js, orders.mapper.js, support.mapper.js | Checkout finalization/replay could return an admin-shaped order; customer status notes/actors and internal support event metadata could escape projections | **Fixed** finalization uses customer mapper; internal status history omitted entirely; internal-note events and metadata filtered. Checkout receipt/security, customer order and audit privacy tests |
| B06 | Medium | products.service.js, products.routes.js, adminProducts.api.js | Public product reads included unpublished drafts/archived products; admin relied on same endpoint | **Fixed** public status/slug filtering; protected full catalog endpoint; preserve exactly-once client price normalization. Catalog/variant tests |
| B07 | Medium | products.service.js | Variant deletion preceded product replacement outside a transaction; failed save could erase stock/variants | **Fixed** one Prisma transaction, preserve inactive sizes; validated prices/sizes/inventory. Mock transaction tests prove wiring/error propagation, not real concurrent rollback certification |
| B08 | Medium | adminCustomers.repository.js | Customer lifecycle tools could target future ADMIN rows after migration | **Fixed** CUSTOMER-only where clauses; authenticated actor ID. Repository query tests. Existing protected routes retained |
| B09 | Medium | env.js, AdminDataTargetBadge.vue | Default LOCAL label could describe production remote data or failed target lookup; mode env priority could permit accidental target mismatch | **Fixed** loopback-only LOCAL, deliberate remote override for RAILWAY_DB, DEPLOYED production label, checking/unverified badge. Target guard tests and local preflight; no Railway startup exercised |
| B10 | High advisory | package locks/server dependencies | Baseline client 10 advisories (8 high/2 moderate), server 15 (1 critical/10 high/3 moderate/1 low) | **Partially fixed** compatible npm audit fix and removal of unreferenced approve/ls/scripts. Client 0; server 4 high remain in Prisma tooling. Both builds/tests and npm ls pass; no force downgrade |
| B11 | Medium | domain controllers, Prisma logs, error middleware, provider/checkout logs | Raw DB/provider exceptions, customer email context or action URLs could reach errors/logs/storage | **Fixed for inspected paths** generic unexpected errors, allowlisted structured code/status logs, no raw SQL logging, security-email metadata stores hasActionUrl only, provider errors now generic. Static scan and error privacy tests; deployed logs not inspected |
| B12 | Medium | shipping.validator.js, AdminOrderTrackingPanel.vue | Arbitrary stored tracking links could be rendered as admin anchors | **Fixed** new tracking links require HTTPS/no credentials; admin render reuses safe URL helper for legacy data. Negative URL tests. No arbitrary tracking URL is fetched server-side |
| B13 | Medium | shipping.controller.js | Shippo webhook acknowledged unauthenticated requests when secret unset | **Fixed fail-closed acknowledgement** 503 unset/401 wrong/timing-safe comparison. Still a non-mutating stub, NOT verified provider signature/event processing; fixture tests |
| B14 | Medium | app.js, boundedAuthHandler.js | Native customer auth preceded normal JSON parser without the app's body cap | **Fixed** proven native transport with 100 KB limit for declared and chunked bodies; actual ephemeral HTTP tests |
| B15 | Medium | config/env.js, app.js | Production implicitly allowed localhost; auth signing/base URL could rely on unsafe fallback | **Fixed** explicit production origins, dedicated >=32-character signing secret and HTTPS credential-free backend URL; no implicit dev origin. Production-config tests and local 403 origin test |
| B16 | Medium | orders.repository.js, shipping.service.js | Concurrent status changes could write misleading fromStatus history; tracking could regress refunded/cancelled/delivered states | **Fixed** compare-and-set transaction with 409; tracking allowlist. Repository contract tests, not a load/race benchmark |
| B17 | Low | orders.service.js | Timestamp-only order references could collide within a millisecond | **Fixed** random suffix plus existing unique constraint. Existing references unchanged; collision probability reduced, not mathematically zero |
| B18 | Medium | products.seed.js, databaseSafety.js | Destructive catalog seed callable without explicit local target gate | **Fixed** explicit local confirmation/loopback/not-production guard. Guard tests; seed never executed. A manually configured tunnel still requires operator review |
| B19 | Low | emailPayloads.mapper.js | Verification resend reused permanent per-user dedupe key, suppressing subsequent verification messages | **Fixed** action-specific one-way URL digest; no raw action URL in metadata. Reset reuse/expiry tests exercise auth engine; live resend/delivery remains manual |
| B20 | Low | client/vercel.json, client/index.html, vite.config.js | Static hosting lacked configured security headers; external CSS lacked integrity; Vite exposed broad hosts | **Fixed configuration** static headers, API-excluding SPA regex, verified CDN SHA512 SRI/CORS, loopback Vite exposure. Regex/build/SRI digest checks; deployed headers/root and browser icon load not verified |
| B21 | High | checkout.service.js, stripe.payment.js, payments/routes | Successful payment relies on browser POST finalization; no durable attempt/snapshot/webhook recovery or PI-create idempotency key | **Open launch blocker**. Closed tab/redirect/reload/network failure, expired proof or post-payment repricing/stock/rate changes can leave payment without order. Needs approved durable checkout + signed Stripe recovery/event ledger |
| B22 | High | checkout.service.js, promos.service.js, campaigns.repository.js | Promo/campaign usage is saved after order transaction; failures are caught. Per-email read/count checks race across concurrent discounted orders | **Open launch blocker**. Discounted orders can persist without valid usage; campaign metrics undercount. Needs atomic reservations/order-attribution plus recovery strategy; no partial schema patch applied |
| B23 | Medium | orders.mapper.js, orders status tools | REFUNDED status does not execute/verify a Stripe refund; paymentStatus is inferred from status/PI presence rather than provider ledger | **Open** operational/financial integrity issue. Do not use status dropdown as refund action; separate reconciled payment/refund ledger phase |
| B24 | Medium | tax.service.js, shipping configuration | Local tax estimates/fallback and Canada destination handling are not certified jurisdictional tax/rate logic; Stripe Tax option remains a local placeholder | **Open** business/tax/provider validation needed. Server ownership prevents browser price spoofing but does not establish legal tax correctness |
| B25 | Medium | native customer auth configuration, provisioning/roles | Verification optional before signup login allows registration enumeration; admin has no MFA; Infrastructure management is separately privileged | **Open** deliberate UX tradeoff plus further hardening. Login remains generic, role escalation blocked. MFA/provider access review before broader admin use |
| B26 | Medium | account/order/admin read repositories | Full histories/relations and some in-memory summaries are unpaginated; per-process limiter resets/is not shared across replicas | **Open capacity/availability risk**. Cursor pagination, bounded includes, SQL aggregation/shared rate store require measured follow-up |
| B27 | Low | product mapper + Prisma schema | UI fields notIncluded, guaranteedAnalysis/showGuaranteedAnalysis and per-variant lowStockThreshold are normalized but not persisted | **Open verified functionality gap**. No new columns added without approved product-data contract/migration. Do not claim those editor fields survive save |
| B28 | Medium | deployed headers/provider/DB/ops configuration | Backups/restore, provider reconciliation, proxy trust, monitoring/alerts, TLS/DB permissions and real-device wallets inaccessible | **Not verified**, not a proven vulnerability. Owner/infrastructure evidence and sandbox QA required before launch |
| B29 | Medium | adminCustomers.service.js, emailPayloads.mapper.js, config/env.js | Admin-triggered verification/reset used relative frontend return paths, redirecting recipients to backend account routes on split hosts | **Fixed** absolute validated frontend-origin return links and production frontend preflight, shared with email builders. No-send API fixture verifies both paths; live email links remain untested |

No first-party unsafe HTML/eval/raw SQL/shell execution/static-source serving was found in the scanned live source. ORM queries and explicit mutation field construction avoid obvious SQL/command injection and mass assignment. These negative scans do not rule out all XSS, IDOR, SSRF, CSRF, logic flaws or future routes.

External fetching uses fixed Stripe/Resend/Shippo origins with encoded carrier/tracking fields, not arbitrary user target hosts. Public uploaded raster paths are inert. Configured media/beneficiary/social HTTPS links are browser destinations; remote product images still involve third-party privacy and image availability. No customer upload/private object bucket exists.

## Section C File Management

### Structure And Responsibility Coverage

| Area | Responsibility and audit focus | Result |
| --- | --- | --- |
| client/src/app, App.vue, main.js | Router/layouts/bootstrap/header/footer, guards, shared API | Existing UX preserved; server guards remain authority |
| account (39 source files) | Customer auth/profile/order split view/support/placeholders | Ownership queries/response privacy reviewed; browser acceptance outstanding |
| admin (129 at inventory) | 13 tools, shared workspace/editors/internal record panels | Better Auth transport added; existing layouts retained |
| products (27) | Cards/quick view/selected variant/filters/mapping | Existing 6/18 oz source-of-truth tests pass |
| cart (6) | Shared persisted cart and accessible right drawer | Existing variant/dialog tests pass; not a checkout redesign |
| checkout (37) and payments (4) | Receipt-first UI, signup review, identity, server preview, Stripe | Existing tests retained; payment recovery blockers remain |
| campaigns (13) and promos (14) | Public campaign dialog/page, admin rules/previews | Public privacy and trusted-item preview reviewed |
| storefront (33) | Fluid home sections, brand page, publication cache/renderers | Generated/shared content contract checked |
| client shared/assets/public/styles | HTTP parser, reusable commerce surfaces, icons/images, scoped styles | No secret/source maps in built assets; SRI added |
| server app/config/db/shared | Mounts/CORS/parsers/guards/errors/env/seed/Prisma/capabilities/tax | Startup/auth/target/seed/log controls improved |
| auth/account/customers | Native engines, provisioning, ownership/profile/lifecycle | Customer and admin share existing tables, separate cookies |
| products/promos/campaigns | Catalog/rules/analytics/attribution | Product transaction repaired; attribution concurrency remains |
| checkout/payments/orders | Trusted pricing/payment verification/order transaction/history | Unique PI/atomic stock already present; durable recovery absent |
| emails/shipping | Manual templates, provider boundary, tracking/rates | No live sends/labels; webhook is acknowledgement-only |
| support | Customer cases/internal issues/messages/events | Internal projections repaired; actual admin actors recorded |
| storefront/media | CMS publications, images, normalization/cache/storage | Admin-only upload/library; public raster bytes intentional |
| server domains/admin | Legacy re-export routes/services | Not mounted separately; retain compatibility pending cleanup |
| shared/storefront | Canonical rules/projection/commerce/media/social modules | Six deployment snapshots match canonical source |
| server/prisma | 708-line schema, 21 SQL migrations/config | Local schema up to date; no migration applied |
| scripts/tests | Canonical sync, guarded provision/seed, Vitest tiers | Focused tests added; no invented lint/typecheck |
| root/docs/config/assets | Operating guide/handoff/architecture/QA, npm orchestrator/Git/editor config/template artwork | Current docs updated; generated asset is illustrative, not customer proof |

File storage: admin image bytes live in PostgreSQL MediaAssetData, metadata in MediaAsset. No upload/temp/log directory is publicly mounted. MIME/content/dimensions/pages are checked, original metadata stripped by Sharp, safe UUID/checksum paths used, WebP/thumb output cached. Limits: 8 MB inbound, 20 MP, 2 concurrent local processors, 256 MB library capacity with serializable reservation/retries. Existing tests cover malformed/type-mismatched/oversized/animated uploads and repository conflicts. This is public branding/catalog image storage, not private customer-file storage. No malware-scanning/private download feature is claimed.

Local filesystem/host permissions, managed DB encryption, public-domain cache behavior, object bucket policies and backup persistence are not certified. No object bucket is configured. The app does not execute uploaded files. Library deletion/garbage collection is not implemented; orphan uploads after canceled edits consume capacity. Per-process normalization caps do not limit multiple Railway replicas collectively.

### Redundancy And Unused Candidates

SHA256 inventory found 19 empty placeholders, including shared index files, empty promo service/input/validation modules, product tags and old order-success support/hero/status files. Exact duplicate content modules in client/server are intentional build snapshots of shared/storefront, not independent sources of truth. The two sync scripts are identical because each deployment root builds independently.

Literal import reachability found 24 nonempty client modules not reached from main.js, primarily old admin list/header/stats/card components, promo presentation and CheckoutHeader/Progress/MobileSummaryBar. This is a candidate list, not proof of safe deletion: tests, future composition or nonliteral loading must be checked. Server unreachable modules are mostly compatibility re-exports and deliberate CLI-only seed/provision helpers. None were deleted based on reachability alone.

Unused approve, ls and scripts packages were removed only after checking source/script references. pg and unused presentation modules remain review candidates. The unused decrementProductInventory helper remains legacy code; live checkout uses conditional stock updates inside orders.repository, not this helper.

Folder conventions mix PascalCase ProductCard/CartDrawer/Checkout with components, and checkout validation versus validators. Normalize only in a separately scoped cleanup, not as part of security repair. Large services remain: promos ~525 lines, support ~477, checkoutPage ~432, support repository ~430, orders repository ~402, checkout service ~399. Focus future extractions on business boundaries and testability; do not fragment them cosmetically.

## Section D Ecommerce Findings

### Already Correct And Preserved

- Catalog resolution ignores browser prices, SKU, name, image and line total; selected size/quantity is validated against current DB variants.
- 6 oz/18 oz selection and exactly-once cents conversion remain covered by client/server tests; drafts/inactive/unavailable/combined oversized quantities fail.
- Server owns subtotal, discounts, shipping, estimated tax, giving and final total. Giving is business-funded and separate from charge totals.
- Invalid promos are rejected before PaymentIntent creation. Email is normalized/required and client application clears/revalidates on changes.
- Stripe secret operations create/retrieve on server; order finalization checks succeeded status, amount_received and currency, plus signed email/PI-bound capability.
- Unique Order.stripePaymentIntentId and conflict recovery prevent duplicate order insertion for the same intent.
- Conditional stock decrement and order creation share a Prisma transaction. Made-to-order/preorder do not decrement limited stock. Stock failure/unique conflict roll back the transaction.
- Guest receipts need purpose/reference-bound short-lived capability or authenticated ownership; reference alone is not authorization.
- Customer history can include older guest orders only through verified-email matches; public signup cannot assign ADMIN.
- Manual email templates require an explicit saved-order preview, actor/staleness/status/tracking checks, confirmation and provider/database dedupe. Status/tracking/order creation does not automatically send operational mail.
- Admin/internal data remains guarded server-side; frontend route guards only provide navigation UX.

### Remaining Integrity Gates

Order idempotency does not mean charge idempotency or recovery. Every PaymentIntent-create request can create another intent; no durable attempt snapshot/reservation or Stripe webhook exists. A paid customer can close/redirect/reload before finalization, or finalization can fail due to current catalog/rate/promo changes. The short-lived proof and in-memory completed-payment state are not durable recovery.

Promotion eligibility is checked before payment but not reserved atomically through purchase. Attribution occurs after order commit and exceptions are logged/caught. A unique per-order usage avoids some duplicate attribution, but does not enforce concurrent per-email discounted purchases before money is taken. Campaign financial counters are not a payout ledger.

REFUNDED is an admin lifecycle label, not an executed Stripe refund. Tax is an estimate. Shippo webhook acknowledgement does not reconcile shipments. Rate/tracking tests do not certify live Shippo payloads or deliverability. The receipt says provider accepted/not sent truthfully; no inbox receipt was sent during audit.

### Recommended High-Risk Next Phase

Approve a focused durable checkout design before code:
1. Persist CheckoutAttempt with trusted immutable item/address/email/shipping/tax/promo/campaign snapshot and stable idempotency key.
2. Bind PaymentIntent metadata/amount/currency to that attempt; reuse it on network retries rather than issuing new intents.
3. Reserve/revalidate inventory and promo eligibility through an explicit expiry/concurrency policy.
4. Verify Stripe webhook signatures on raw bytes, store unique provider event IDs and finalize through one idempotent shared service.
5. Commit order, inventory, promo and campaign attribution atomically or use a durable outbox/reconciliation process that survives failures.
6. Support post-payment recovery and safe receipt access without another charge; reconcile refunds separately.
7. Test closed browser, required-auth redirects, duplicate/out-of-order webhooks, failed DB commits, repeated client requests, competing stock/promo claims and refund status.
8. No production traffic until owners approve tax/shipping jurisdiction rules and infrastructure restore/monitoring evidence.

This is a proposal, not implemented infrastructure or a migration to apply.

## Section E Changes Implemented

The full exact file manifest is in the latest [handoff](../../PROJECT_HANDOFF.md); Git diff is the review source. No application file was deleted. Package removals were approve, ls and scripts; better-call is a justified direct dependency for the bounded transport already used transitively by Better Auth. No DB model/schema/migration was added.

Main created modules:
- Auth admin engine, provisioning service/repository/CLI, shared response/revocation helper and bounded native handler.
- Account profile validator; shared safe API-error, database-reset guard and structured operational-log helpers.
- Seven new server regression files and one client auth/deployment regression file.
- This report and the endpoint access inventory.

Main modified areas:
- Compatible admin login/logout/session transport, guards, Vue login/API/target badge and legacy tracking links.
- Customer auth response/reset/inactive-user security, profile input validation, customer-only admin lifecycle queries and actual actor attribution.
- Customer order/support projections and checkout return shape.
- Product public/private reads, protected admin library/API mapping, transactional variant replacement and payload validation.
- Order references/status compare-and-set/tracking terminal guards.
- Provider timeouts/error privacy, promo/checkout operational logs, security-email dedupe/metadata, manual email actor proof.
- Dev/production configuration, Vercel static headers/fallback, external CSS integrity, explicit local seed guard.
- Dependency lock updates and current architecture/handoff/QA policies.

No cosmetic refactor, dashboard rebuild, auth UI redesign, checkout redesign or speculative performance rewrite. Main client chunk is 308.22 KB (85.04 KB gzip); image templates are 298.74 KB and 144.91 KB. Route eager imports and relation-heavy reads remain measured-optimization candidates. No Lighthouse/core-vitals/load benchmark was performed.

## Section F Verification

| Command/check | Exact final result | Scope |
| --- | --- | --- |
| Initial git status/diff --stat/diff --name-status | Clean at audit start | Existing repository state, not old checklist claims |
| client npm run build | Exit 0, Vite 8.3.4, 2263 modules, main 308.22 KB / gzip 85.04 KB | Production compile, not real device QA |
| server npm run build | Exit 0; canonical sync and Prisma Client 6.16.2 generated | Not a server bundler or exhaustive type checker |
| client npm test | Exit 0: 22 files, 109 tests (11 tier1 + 92 tier2 + 6 tier3) | Unit/SSR/fixtures |
| server npm test | Exit 0: 31 files, 125 tests (28 tier1 + 94 tier2 + 3 tier3) | Unit/contract, HTTP and actual isolated auth-engine tests |
| Total | 53 files / 234 passing tests | 36 new test cases in this audit; no live provider test |
| npx prisma migrate status | Exit 0, 21 migrations, local database up to date | Confirmed loopback DB; no Railway status query/migration |
| npm run admin:provision | Exit 0, read-only preflight passed | Local target |
| npm run admin:provision -- --apply | Exit 0, admin provisioned without customer/password overwrite | Authorized local User/credential/event creation |
| Guarded local Prisma/HTTP smoke | Exit 0 | Actual persisted admin session, protected catalog, logout deletion, copied-cookie 401, 20 anonymous gates, 3 private-file JSON 404s, bad-origin 403; test session removed |
| 266 JS source/script node --check | Exit 0, zero syntax failures | No TS script exists |
| Babel/Vue literal-import graph | 458 parsed, zero syntax failures or missing literal imports | Includes source/scripts, not every runtime dynamic/provider path |
| Six canonical deployment snapshot comparisons | Zero drift | No independently edited copies |
| npm ls --depth=0 in both apps | Exit 0, no missing/extraneous direct deps | Lockfile/install consistency, not clean npm ci proof |
| root npm audit --json | Exit 0, zero advisories | Root has no application deps |
| client npm audit --json | Exit 0, zero advisories | Installed/locked graph at audit time |
| server npm audit --json | Exit 1: 4 high, zero critical/moderate/low | prisma, @prisma/config, deepmerge-ts, effect |
| Markdown/local links/fences | Checked after documentation completion | Exact final evidence in handoff |
| Mermaid rendering | Exit 0: official cached CLI, 20 nonempty SVG diagrams | Six architecture files; exact evidence in handoff |
| git diff --check | Exit 0 after final cleanup | Whitespace patch quality |
| Secret/env/build scans | No scanned secret candidates; no source maps; API helper build chunk contains no localhost | Bounded pattern/history check; no values printed |
| Browser acceptance | NOT VERIFIED: CUA URL operation policy-blocked | No workaround; no screenshots, UI/device/login claims |

Intermediate failures were not ignored: one expected old ADMIN_ENV email-audit test changed to ADMIN; a new test syntax typo was fixed; initial untrusted-origin auth fixture exposed the need for explicit guard and was repaired. A local smoke setup attempted an unexported better-call/crypto subpath, failed before session creation, then passed using the package's exported serializeSignedCookie. No application code relies on that private import. All relevant failed tests were rerun successfully.

No lint/typecheck scripts exist; none invented. No coverage percentage, clean-install, production performance, live payment/webhook, Resend delivery, Shippo rates/labels, infrastructure dashboard or full browser accessibility certification is claimed.

Remaining Prisma advisories: [DeepmergeTS recursive graph exhaustion](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) and [Effect RPC concurrent context contamination](https://github.com/advisories/GHSA-38f7-945m-qr2g), propagated through Prisma config/CLI. npm recommends a major-range downgrade to 6.12.0, not an approved safe patch. No untrusted Effect RPC endpoint or user-controlled Prisma configuration was found. Still prioritize a tested matched CLI/client upgrade and repeat migration/build/security checks.

## Section G Remaining Risks And Manual Review

### Admin Rollout

No Railway admin was provisioned or deployed. Environment login is now a deliberately provisioned database credential, not a live env hash comparison. Existing signed sessions must reauthenticate. A customer email conflict must be resolved by the owner; the script deliberately refuses automatic promotion/overwrite.

Required variable names only: server DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NODE_ENV, PORT, CLIENT_URL/FRONTEND_URL; ADMIN_EMAIL/ADMIN_PASSWORD_HASH for deliberate initial provisioning; compatibility ADMIN_SESSION_SECRET/API_BASE_URL; existing BETTER_AUTH_API_KEY, STRIPE_SECRET_KEY and provider variables where features are configured. Client VITE_API_BASE_URL or compatibility VITE_API_URL, VITE_STRIPE_PUBLISHABLE_KEY; public display variables only. No VITE auth/provider/database secret.

See [auth rollout](../architecture/auth-roadmap.md) for startup modes and preflight commands. The production backend URL must be HTTPS; the dedicated signing secret must be strong and at least 32 characters. The normal local .env was not repurposed. Production start runs migrate deploy, so verify pending SQL/backup/target before any rollout. No new auth SQL exists, but older unrelated migrations may be pending remotely.

Safari cross-site cookie restrictions still apply on unrelated Vercel/Railway domains. Better Auth is not a cookie-policy bypass. Prefer an owned storefront domain plus API subdomain; validate exact origins and cookie behavior on actual devices before claiming stability.

### Manual QA Checklist

1. Local admin login -> original dashboard; reload/restart persistence; logout/relogin; copied old/expired cookies fail. CUSTOMER cannot enter admin, change role, see internal records or alter prices.
2. Inspect all 13 admin tools and existing signed-in identity/data target; confirm LOCAL, remote Railway DB mode and unknown/unreachable states before any write.
3. Product create/edit/cancel/save and failed-save stock retention; inactive 6/18 variants stay inactive; drafts remain private and still editable in admin. Explicitly review unsupported editor persistence fields.
4. Customer signup/signin/signout/profile and reset/verification with an approved test inbox/provider budget; no token leakage; non-owner order/case IDs return not found; deactivated account fails.
5. 6/18 oz card/quick view/cart drawer, guest/signup-review retaining checkout, signed-in prefill and mobile receipt-first UI remain correct.
6. Promo invalid/expired/minimum/email/one-per-email/email-change cases; promo plus campaign; server-owned amounts; no giving charge row. Concurrent redemption certification remains blocked.
7. Only after recovery design and approved sandbox setup: card/wallet/auth-required/reload/network failure, exactly one charge/order/stock decrement/usage/attribution; no second payment after success.
8. Guest receipt same-tab proof works; reference alone, other-owner and expired proof fail; no admin notes/actors/Stripe secrets visible.
9. Manual order status/tracking and actual actor/history; terminal-state preservation; REFUNDED is not a payment operation. No automatic operational mail.
10. Template sample/real-order preview, confirmation/dry run, stale/wrong-actor/wrong-recipient rejection and dedupe. Live sends need explicit approval; SENT is provider acceptance.
11. Image library auth, raster-only/limits, unchanged metadata/URLs, cross-root media display, non-private content, orphan/capacity behavior. No source/env/archive path accessible.
12. Inspect Vercel project root/header/fallback configuration and deployed API origin; direct admin/account/checkout routes work while /api never becomes index.html.
13. Infrastructure owner validates Railway DB least privilege/TLS/backups/PITR/restore, current migration status, proxy/IP trust, HTTPS, alerting, provider webhooks/reconciliation and rollback. No destructive reset or automatic shared migration.
14. Browser desktop/mobile/Safari, keyboard/focus/reduced motion and no console/provider-secret logs; audit could not perform browser acceptance due tool policy.

### Recommended Sequence

First manually accept local Better Auth admin, then separately approve remote provisioning/rollout with same-site domain plan. Prioritize durable payment recovery + promo/inventory/campaign atomicity before real-customer launch. Follow with Prisma advisory remediation, tax/shipping business validation, backup restore/monitoring evidence, MFA and measured pagination. Cosmetic/dead-file cleanup is lower priority.

## Section H Production Readiness Scorecard

PASS means inspected controls and stated local tests pass, not deployed certification.

| Category | Result | Reason |
| --- | --- | --- |
| Authentication | NEEDS IMPROVEMENT | Persistent/revocable native sessions verified; browser/deployed/MFA/verification policy open |
| Authorization | PASS | Server ADMIN/CUSTOMER/ACTIVE guards and scoped ownership; protected API tests; live Infra permissions still separate |
| Payment security | NEEDS IMPROVEMENT | Trusted server amount/status/currency verified in code/tests; no live provider/webhook recovery certification |
| Checkout integrity | FAIL | Paid-without-order recovery and promo/campaign concurrency/attribution blockers |
| Database security | NEEDS IMPROVEMENT | Local schema/index/transaction controls; Float/JSON/relationship gaps; remote permissions/TLS not verified |
| File management | PASS | Guarded raster uploads, inert public bytes, no exposed source/env; private customer files not supported |
| Frontend security | NEEDS IMPROVEMENT | Safe rendering/redirects/headers/SRI/build scans; no CSP rollout or full browser review |
| Backend security | NEEDS IMPROVEMENT | Guards/body caps/validation/error controls improved; rate-store/proxy/expanded endpoint validation follow-up |
| Admin security | NEEDS IMPROVEMENT | Approved persisted ADMIN migration/local smoke pass; remote provision/browser acceptance/MFA pending |
| Dependency security | NEEDS IMPROVEMENT | Client clean; 4 high Prisma tooling advisories remain |
| Performance | NEEDS IMPROVEMENT | Modest measured bundle but relation-heavy unpaginated reads; no realistic benchmark |
| Deployment security | NOT VERIFIED | Config inspected, dashboards/project root/TLS/proxy not inspected |
| Backups and recovery | NOT VERIFIED | No restore/PITR/backup evidence; no production action performed |
| Monitoring | NEEDS IMPROVEMENT | Sanitized issue capture/structured logs exist; centralized alerts/payment reconciliation not verified |

The tree is ready for focused commit review after the recorded checks, **not automatic deployment or launch**. Nothing was committed or pushed.

## Primary References

The installed source and tests are the implementation evidence. Design guidance was checked against official [Better Auth session management](https://better-auth.com/docs/concepts/session-management), [email/password](https://better-auth.com/docs/authentication/email-password), [security](https://better-auth.com/docs/reference/security), [Stripe PaymentIntent lifecycle](https://docs.stripe.com/payments/payment-intents) and [Stripe webhooks](https://docs.stripe.com/webhooks). Their recommended patterns are not evidence that absent project recovery/webhook infrastructure exists.
