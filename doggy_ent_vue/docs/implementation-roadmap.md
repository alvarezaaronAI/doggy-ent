# Implementation Roadmap

## 2026-10-27 Hosted Test Cards Available

Owner follow-up enables sandbox-only creation on the existing testing API while
live charging remains source-locked. Actual card fields and verified admin Allowed
(sandbox) status pass; no purchase is submitted. Local defaults and email remain
off. Test orders still affect the testing DB. This supersedes paused hosted status
below, not purchase/device/durable-recovery/financial launch acceptance. See the
[current checkpoint](work-checkpoints/2026-10-26-payment-environment-safety.md).

## 2026-10-27 Paused Sandbox Rollout Complete

Existing Railway and both Vercel sites now run the reviewed payment-environment
guards and truthful read-only admin context. Server/public sandbox configuration
is saved and verified; creation stays paused and live charging source-locked.
No new resource, migration or transaction. [Final evidence](work-checkpoints/2026-10-26-payment-environment-safety.md)
supersedes the local-only/pending-key status below. Next remains durable attempt/
quote, signed webhook recovery/idempotency, atomic attribution and financial/status
safety, then scoped sandbox purchase/device tests before explicit live acceptance.

## 2026-10-26 Payment Environment Safeguards

Default-off new payment creation, explicit key/account/mode checks, public
publishable-key handshake and protected read-only admin context are implemented
locally. Live charging remains code-locked, not enabled by tests or env flags.
Dedicated local API/local DB startup and ignored private overrides preserve the
older credentials; the new public key is supplied, matching server key pending.
No shared resource, migration, provider write, actual charge/email or deployment.
Next: private sandbox-key verification, durable checkout/webhook/attribution and
financial/status contracts, then approved sandbox/device and hosted acceptance.
See [active checkpoint](work-checkpoints/2026-10-26-payment-environment-safety.md)
and [configuration/launch contract](architecture/payment-environments.md).

## 2026-10-26 Payment Readiness Preparation

Local offline test harness and regressions cover actual adapter/controller,
same-mounted coordination, card/wallet amount/decline handling and admin receipt
privacy. Small admin improvements add payment-ID lookup, known automatic-receipt
activity, correct template navigation and honest operational-count wording. No
schema, provider resource/key, live payment/refund/email, rollout or launch approval.

Next: durable owned checkout quote/attempt, creation idempotency, signed event
processing/shared recovery, atomic agreed promo/giving, financial reconciliation
and server-enforced/stale-safe admin statuses. Separate approval precedes shared
DB migration or sandbox/provider writes. The [acceptance matrix](prelaunch/payment-readiness.md)
and [checkpoint](work-checkpoints/2026-10-26-stripe-checkout-readiness.md) distinguish
passed offline checks from feature-blocked and connected/device/business gates.

## 2026-10-25 Verified-Payment Receipt

Owner approves one automatic payment confirmation only. Disabled-by-default saved
template settings, atomic receipt intent in paid order/stock, bounded claim-once
worker, private payload minimization, truthful customer states and monogram/Lucide
email visuals are implemented. Manual shipping/other order sends remain separate.
Approved additive migration follows private decoded backups and preservation checks:
local/Railway27matching/nonepending, configuration absent/off. [Checkpoint](work-checkpoints/2026-10-25-checkout-receipt-email.md)
tracks verification/publication. Owned sending domain, provider readiness, approved
test inbox/budget and actual email-client acceptance precede activation. No paid
plan or live mail is enabled. Payment webhook recovery and atomic promo/campaign
attribution remain separate launch work, not solved by email.

## 2026-10-25 Recovery Pages And Storage UX (Local Preview)

Branded unmatched-route recovery, distinct missing/transient campaign states, private-detail-safe copy and temporary error metadata are implemented locally. Floating storage acknowledgment is retired in favour of the footer information link; no tracker, timed acceptance or pretend consent controls. Stripe's shared pure loader defers initialization to real payment-control mounts without changing payment submission. No server/schema/DB work or publication. [Checkpoint](work-checkpoints/2026-10-25-error-pages-storage.md) tracks tests/browser review and remaining owner/provider/legal/device acceptance; this proposal does not supersede the live release until explicitly advanced.

## 2026-10-25 Account Organization And Saved Treats

Connected grouped navigation/shared monogram, compact overview pack card, pet-photo rejection dismissal/privacy focus recovery and persistent owned Wishlist. Minimal additive links/date table is approved/applied locally and Railway after full private backups with26 matching completed migrations, old records preserved. No active rewards, behavioural tracker, automatic marketing, provider/payment or security-key change. [Current checkpoint](work-checkpoints/2026-10-24-account-wishlist.md) records tests/browser checks and source-publication status; do not infer deployment from migration. Next: matching reviewed release and owner/device acceptance, then existing privacy/retention/commerce/security launch work. Saved-interest analytics remains a later protected read model.

## 2026-10-23 Optional Pet Weight

Connected Size guidance, optional current weight with lb/kg conversion and saved-card weight are implemented on the preserved auth/Pets task. Canonical grams/unit/server measurement date use a separately approved additive migration, applied locally/Railway after backup/preflight with old records preserved and 25 matching migrations. Both builds, 238 client/331 server tests, isolated real persistence/constraints/rollback and eighteen four-width browser scenarios pass. No real customer weight was changed or inferred. [Current checkpoint](work-checkpoints/2026-10-23-pet-weight.md). Next remains owner/device/privacy acceptance and review of the combined uncommitted release; database readiness is not source deployment.

## 2026-10-23 Connected Photo-Led Pets

Owner-approved photo-led cards and inline editor are integrated: canonical breed/mix, visual stage/size, optional multiple purposes, confirmed immutable month/day, private normalized photo upload/read/removal, archive/restore and separate privacy deletion. Existing pets/legacy purposes and minimal lifecycle history remain. Both builds and 225 client/314 server tests pass; isolated browser QA and real loopback persistence/ownership/rollback/concurrency/cascade evidence are in the [checkpoint](work-checkpoints/2026-10-23-connected-photo-led-pets.md).

After separate explicit approval and fresh decoded full backups, additive migration is applied locally and Railway: 24 matching complete migrations, none pending and old records preserved. Actual signed-in local Railway-target page loads the existing pet and survives refresh without changing it. No reward, automatic fraud decision, provider send, commit/push/merge or website deployment. Next: owner connected-screen acceptance, retention/rights/disposal decisions, remaining real-device/accessibility and combined-source release gates, then matching managed publication. This supersedes the richer-fields-preview-only status below, not launch acceptance.

## 2026-10-23 Pet History And Account Palette

Implemented locally: atomic, owner-scoped Pet add/edit/remove facts in the existing CustomerAccountEvent, preserving server dates, profile tenure and changed field names without private pet snapshots. Existing Pet timestamps are reused; no new model/migration, risk score, reward or shared-data write. The disconnected photo-led card now matches actual account emerald/gray tokens; richer fields remain preview-only. Both builds, 248 server/212 client tests and four-width preview QA pass. See [checkpoint](work-checkpoints/2026-10-23-pet-activity-and-account-theme.md).

Next: approve the preview's connected field/lifecycle scope, define audit retention/disposal/access and privacy handling, then verify real isolated-database atomicity/concurrency and combined-source/device acceptance before authorized publication. Do not treat audit facts as fraud proof or activate incentives from this slice.

## 2026-10-21 Customer Entry And Optional Pets

Implemented locally: centered brand auth shell, reviewed signup, safe checkout return, provider-aware private-link recovery, input helpers/soft red and green validation feedback, and separate protected Pets navigation with optional owned CRUD. Better Auth owns credentials and roles; no OAuth or tracking/incentive system is added. Approved additive Pet migration is already applied to local/Railway after backup/preflight (23 migrations); no further schema change in the form-polish follow-up. Source publication remains pending. [Checkpoint](work-checkpoints/2026-10-20-customer-auth-experience.md) records tests, files, backup and remaining device/provider/privacy gates. Next: visual/real-device acceptance and verified publication, then consent/retention and commerce reliability before social sign-in or automated personalization.

## 2026-10-20 Prelaunch Foundation And Next Sequence

Project agents, Git preflight, PR/CI conventions and an unreleased 0.1.0 baseline are prepared. Existing `dev-main` remains integration and `main` production source. New policy/help routes are drafts pending approval. No OAuth, customer tracking/profile schema, migration or deployment is added. The [prelaunch plan](prelaunch/README.md) orders commerce reliability, privacy decisions, customer auth UX, progressive profiling, reviews and finally Google/Apple convenience. See [data strategy](prelaunch/customer-data-strategy.md), [policy/storage inventory](prelaunch/policy-and-storage-inventory.md) and [checkpoint](work-checkpoints/2026-10-20-prelaunch-foundation.md). Setup is not hosted CI or launch acceptance.

## 2026-10-17 Approved Boutique Page Integration

Storybook Brand and Impact First Campaign are integrated locally, alongside the accepted Modern Boutique Home follow-up. Safe editable portrait presentation extends existing JSON storage without a schema migration; shared public/editor/pop-out components retain business rules. Both builds and full suites pass (145 client, 139 server). Next: owner/editor/real-device acceptance, then a separately approved matching backend-first/frontend rollout. No new deployment/publication or payment/provider action occurred. See [checkpoint](work-checkpoints/2026-10-17-storybook-impact-first.md); original launch gates remain.

## 2026-10-15 Approved Storefront Rollout

The approved polished preview is now integrated and deployed to the existing Railway backend and Vercel storefront. This supersedes older preview-only and pending-deployment notes below. Home/Campaign/Brand share the actual header/footer and presentation contract; Website UI edits static presentation without changing commerce facts. Product-owned galleries support four optional images through protected image-only saves. The eight approved testing products are permanently non-purchasable. Local and Railway migration histories both have 22 completed entries.

Completed verification includes client/server builds, 115 client tests, 136 server tests, 173 server syntax checks, real local admin draft/reload/restore and image-only saves against Railway, public page/media/API/CORS checks, and live desktop gallery/cart/navigation checks. Exact rollout IDs, command results and limits are in the [handoff](../PROJECT_HANDOFF.md#2026-10-15-approved-design-integration-and-deployment).

Next: owner acceptance on real mobile/Safari and keyboard/screen-reader behavior, replacement or retirement of generated/fictional testing content, combined source review, then the existing checkout recovery/idempotency/concurrency launch gates. Direct CLI deployments do not commit source: a subsequent Git-triggered deployment could overwrite this release until the reviewed changes are committed/pushed by the owner. No commit/push is performed in this phase. Real customer review submission/moderation, arbitrary page layouts and scheduled seasonal publishing remain future work.

## 2026-10-10 Checkout And Order Email Status

Implemented locally: Receipt First checkout, in-place reviewed signup/sign-in, shared bordered/giving/promo item cards, published-campaign pop-out using the real renderer, Stripe Express Checkout wallet support with admin switches, Soft Essentials confirmation and shared Website commerce editor. Verified pricing/receipt flaws were repaired: DB-owned variant prices/SKUs, email-bound payment proof, owned/scoped guest receipt reads and atomic stock/order writes.

Email Template Center and actual-order preview/review/manual send are now implemented, superseding earlier future-only notes below. Five suggestions, saved copies, revision/archive, rich server-controlled rendering, recipient/status/tracking gates, default dry run, explicit live opt-in, stale-preview rejection and delivery deduplication. Automatic operational/order/payment/tracking sends are removed; essential account/security email remains. Support/review/promo/bulk templates and safe provider failure reconciliation remain future work.

Next gate: review combined local edits/migration/security contract, full desktop/mobile/Safari/accessibility, published campaign content, approved signup and Stripe card/wallet/promo+campaign QA. Then explicitly approved Railway migration and coordinated frontend/backend deployment. Legacy checkout clients lack the new payment proof, so in-flight checkout rollout must be planned. No real payment/email/label or Railway action occurred in this phase; one local template and one MOCKED delivery were created by deliberate QA. See [architecture](architecture/checkout-and-order-email.md) and [handoff](../PROJECT_HANDOFF.md).

## 2026-10-09 Visual Storefront Editing Status

Implemented local source: actual product-card canvas, protected Website tool, shared homepage preview, typed content controls, safe links, seasonal backgrounds, section hide/order/add, private draft and explicit revision-safe publication. Existing storefront/cart/commerce/admin/auth remain connected. See [editor guide](architecture/storefront-editor.md).

Media follow-up: protected raster upload/search/folder/metadata library, bounded PostgreSQL metadata/blob persistence, stable host-independent images, contextual labels/unsaved cues, and visible seasonal/palette choices. Local additive media migration is applied; Railway content/media migration/deployment still requires explicit approval. Next: visual/device/content approval, dependency advisory triage (including existing critical/high reports), database backup review and approved coordinated backend/frontend deployment. Object storage/CDN, usage/cleanup/version tools and scheduling are separate later phases. See [media library](architecture/media-library.md).

New additive content and media tables are applied only locally. Railway migration/deployment needs explicit approval; existing server startup includes migration deploy. Next: controlled real-browser editor QA, approved real/seasonal assets, review combined source/generated snapshots, then authorized migration/server/frontend deployment and checkout/session regression QA. Scheduled publication, older revision history, arbitrary block functions and broader brand/page editing are future additions, not part of this pass.

## 2026-10-09 Calm Giving Status

The approved fluid storefront, deterministic variant display/selection, emerald giving cards, public campaign page, and shared visual campaign editor are connected. All original homepage content areas remain; unsupported reviews, nutrition values, notification actions, social links, and free-shipping claims were removed or labeled honestly.

Campaign migration `20261009000000_campaign_public_page` is applied on local and Railway databases. Railway application was explicitly authorized by the user; preflight verified it was the only pending migration, with no failed migrations or checksum drift. All eighteen repository migrations now match Railway. Older notes saying support/Better Auth migrations are unconfirmed are historical, superseded by this check.

Next gate: review the combined dirty tree, deploy server/client code through the normal approved process, enable only reviewed campaign pages, then run real-admin/Safari and guest/signed-in checkout QA with approved test data. Database migration does not deploy code. No commit/push, email, label, or payment was performed. Dependency security remediation, business-approved imagery/reviews, provider QA, pagination, reconciled reports, and manual email-template work remain separate phases.

## 2026-10-08 Calm Workspace UI Status

The approved admin workspace UI is connected across all eleven existing tools. Shared navigation/identity/data routing, focused catalog/promo/campaign editors, order/customer detail, issue histories, delivery/shipment views, and truthful operational reports are in place. Existing custom admin auth and server contracts are preserved.

Next gate: controlled real-admin/Safari and local-versus-Railway DB QA, plus review/deployment of any earlier pending support migration. Email Template Center, approved template previews/manual sends, promo audiences, reconciled reporting, and customer support/activity expansion remain separate future phases. A dependency advisory remediation pass is also recommended before launch.

Each run must continue existing work, inspect uncommitted changes, preserve prior completed phases, and avoid undoing unrelated edits. Do not commit or push unless explicitly asked.

## Run 1: Product Philosophy, Customer Account Redesign, Checkout UX, Supporting Database Changes

Goals:

- Install the product philosophy into the actual customer UI.
- Account navigation hub.
- Account overview cleanup.
- Featured-product empty states.
- Maximum two recent orders.
- Profile redesign.
- Stored-information cards.
- Default shipping address editing.
- Email verification UX.
- Remove customer email activity.
- Remove preferred communication controls.
- Orders split-view redesign.
- Month grouping and older-month accordions.
- Conditional order detail sections.
- Product images.
- Selected shipping method visibility.
- Remove customer timeline.
- Need Help flow.
- Seven-day delivery dispute eligibility.
- OrderIssue schema/API foundations.
- Signed-in checkout prefilling.
- Apple Pay/Google Pay disabled with Fall 2026 messaging.
- Shippo carrier-rate root-cause investigation.
- Fallback rate UX.
- Server-owned shipping verification.
- Tailwind-first UI.
- Subtle animations.
- Responsive states.
- Tests.
- Documentation.

Status after 2026-06-17 pass:

- Completed: account overview cleanup, max two recent orders, profile stored-information cleanup, default shipping address foundation, orders split-view/month grouping, customer-safe order detail cleanup, Need Help/order issue foundation, seven-day eligibility, signed-in checkout address prefilling, support/internal issue Prisma foundations, admin issue routes/pages, tests, and documentation updates.
- Partial: Shippo carrier-rate root-cause investigation was not expanded beyond preserving existing fallback behavior; provider-specific internal issue capture remains future work.
- Partial: Admin dashboard was extended with Order Issues/Internal Issues links and metrics but not fully reorganized into all suggested operational sections.
- Not implemented: Email Template Center, promo email workflow, and explicit template-backed Send customer update actions. These remain Run 2/Run 3 work.

## Run 2: Admin Redesign, Order Issues, Internal Issues, Email Template Center

Goals:

- Admin information architecture.
- Grouped navigation.
- Minimal color coding.
- Dashboard cleanup.
- Urgent metrics.
- Order Issues tool.
- Customer-visible and internal replies.
- Status, priority, assignment, resolution.
- Internal Issues tool.
- Safe internal error capture.
- Deduplication/fingerprinting.
- Email Template Center.
- Template CRUD.
- Preview.
- Archive.
- Delivery activity separation.
- Promo email action.
- Recipient preview.
- Explicit send confirmation.
- Manual-first communication controls.
- Admin order update save/send separation.
- Tests.
- Animations.
- Security.
- Documentation.

## Run 3: Final Integration, Shippo/Email Workflows, Polish, QA, Docs

Goals:

- Complete missing end-to-end connections.
- Shippo rate troubleshooting and verification.
- Shippo tracking refresh.
- Manual tracking fallback.
- Order/customer/admin shipping visibility.
- Email template integration.
- Admin-triggered order emails.
- In-account issue communication.
- Delivery logging.
- Duplicate-send protection.
- Error handling.
- Rate limiting.
- Security audit.
- Ownership audit.
- Admin auth audit.
- Mobile polish.
- Animation polish.
- Accessibility.
- Automated tests.
- Full manual QA.
- Architecture docs.
- `PROJECT_HANDOFF.md`.
- Final launch-readiness report.

## Recommended Prompt For Run 1

```text
Read AGENTS.md, PROJECT_HANDOFF.md, docs/product-philosophy.md, docs/ux-ui-standards.md, docs/customer-experience.md, docs/communications.md, docs/operations-and-issues.md, docs/implementation-roadmap.md, docs/verification-and-qa.md, and relevant docs/architecture files first.

Start Run 1 from docs/implementation-roadmap.md.

Do not start a broad refactor. Do not commit or push. Preserve guest checkout, Better Auth customer accounts, existing admin dashboard behavior, checkout payment correctness, server-owned totals, and current architecture patterns.

First run git status, git diff --stat, and git diff --name-status. Audit current account, profile, orders, checkout, shipping, and support-related files. Preserve existing uncommitted work.

Implement the customer-facing Run 1 scope end-to-end:
- account navigation hub
- account overview cleanup with max two recent orders
- useful empty states with featured products where appropriate
- profile redesign with stored-information card, verified email state, resend verification UX, no customer email activity, and no preferred communication controls
- default shipping address foundation/editing when supported safely
- orders split-view or mobile-friendly drill-in pattern with month grouping
- conditional order detail sections with product images and selected shipping method visibility
- removal of customer-facing internal timeline
- Need Help/order issue foundation with seven-day delivery eligibility and customer-safe case direction
- signed-in checkout prefilling without silently overwriting saved profile data
- Apple Pay/Google Pay disabled or future-only messaging such as Coming Fall 2026
- Shippo carrier-rate root-cause investigation and customer-safe fallback rate UX
- server-owned shipping verification preserved across preview, PaymentIntent, and order creation
- Tailwind-first polish, subtle motion, responsive states, accessibility, and tests

Do not send automatic order/tracking/support/review/promo emails. Keep manual-first communication policy intact.

Run required verification, update PROJECT_HANDOFF.md and relevant docs, and provide files changed, commands/results, remaining risks, manual QA, and whether the tree is safe for commit review.
```

## Production Audit Gates (2026-10-11)

This supersedes the earlier future-only admin-auth direction: the user explicitly approved Better Auth admin migration. It is implemented locally behind compatible endpoints with deliberate provisioning and no dashboard rebuild. Accept browser login/logout/persistence before any separately approved Railway provisioning/deployment. MFA/fine-grained roles remain future work.

The next launch-critical phase is durable CheckoutAttempt/payment idempotency, verified Stripe webhook recovery and atomic inventory/promo/campaign attribution, with post-payment reconciliation/refunds. The current browser-only finalization and separate usage commits are not launch-certified. No SQL for this next phase was added. Validate tax/shipping destinations, resolve Prisma tooling advisories, confirm backups/restore/monitoring and perform approved sandbox/device QA before real-customer launch. Dead files, cosmetic cleanup and new loyalty features have lower priority. See [audit and scorecard](audits/2026-10-11-production-audit.md).

## Approved Design Acceptance (2026-10-15)

The polished three-page mock is the current visual authority, not the prior flat storefront. Complete source/data reconciliation and direct deployment are tracked in [the checkpoint](work-checkpoints/2026-10-15-approved-ui-reconciliation.md). Next: owner compares Home/Campaign/Brand and Website UI against that exact mock on real desktop/mobile/Safari. Then replace fictional content with reviewed content and deliberately introduce approved sellable products; do not remove test guards as a styling change. Production payment recovery, atomic attribution, provider/tax/shipping validation and restore/monitoring remain higher-risk launch work. No commit/push is performed by this design phase.
