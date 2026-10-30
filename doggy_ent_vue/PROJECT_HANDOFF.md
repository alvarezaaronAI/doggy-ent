# Doggy Ent Project Handoff

## Current: Item Discount Group (Resumed 2026-10-30)

Owner requests indented promos grouped with their item subtotal, plus an accurate
explanation of tax/campaign handling. Focused presentation change only: light
item-pricing box when discounted, indented Discount on items and before/after
amounts, shipping/tax/total outside. Approved cards, colors, thumbnail/monogram and
server amounts remain unchanged. Tax activation and campaign calculation changes
are not part of this request. Focused61/full client659 checks and storefront/admin
builds pass, with independent review finding no issues. Actual preview confirms
percent/fixed savings in the group. Fresh hosted quote confirms tax provider none,
not_configured/zero; no payment submitted. Migration preflight28matching/nonepending
passes. Managed publication and exact-source deployment verification remain pending.
Follow the
[active checkpoint](docs/work-checkpoints/2026-10-28-checkout-discount-group.md)
for exact state and next steps before claiming deployment.

## Deployed: Routing And Summary Release (2026-10-27)

Owner accepts the corrected checkout preview and requests deployment after routing,
thumbnail, gold shipping accent and per-item subtle monogram checks. PR65 preview
hold is superseded by this bounded follow-up. Original checkout/payment layout
stays; no provider activation, secret/configuration change or migration. Local
fixture is intentionally DB-free, now explicitly labelled; hosted staff routing
gets authenticated connection/route evidence without exposing private DB details.
Implementation, operations and remaining verification/publication are tracked in
the [active checkpoint](docs/work-checkpoints/2026-10-27-routing-summary-release.md).

PR65 integrates at0dee993 after exact-head client/server Quality and independent
review; sleep-return freshness is fixed/re-reviewed. PR66 passes separate Quality
and releases main1199d5f48b7d09edc36966516c71878570bade23. Railway80d2fece is
SUCCESS and stable shopdpl_JBFSQ61wf2JZxqVqtdc8tyLK6p87/staff
dpl_3Jdo3LxQ4LJdcKSyDzXKR2krrxzT are READY at that exact source. Startup28migrations/
nonepending/0exception patterns. Live staff sign-in/routing confirms protected
gateway/RailwayAPI/PostgreSQL/Connected; checkout retains bag/account and shows
small image/monogram/gold shipping/blue tax/gray rate/brown total without destination
breakdown or public dev strip. Nineteen public assets have0private-key patterns/
staff modules/dev panels; public/auth/CORS/media checks pass. No order/payment/email
was submitted and no provider setting changed. Final docs-only evidence stays on
integration, not another production rollout. Existing8server dependency advisories
and real-device/payment/Tax/receipt launch acceptance remain separate.

## Current: Checkout Summary Labels Only (2026-10-27)

Owner rejects the broader checkout/payment redesign and supplies the original
layout as authority. PR65 is draft/unmerged; no production deployment occurred.
Correction f3661c2 is pushed and synced; it reverses superseded749f435 without
rewriting history. Payment,
contact/shipping/delivery cards, controls and unrelated behavior match f1bf1ba.
Only summary presentation plus two public promo metadata fields are replaced.

Tax/promo percentages use gray labels; tax text/amount is blue, promo/code/savings
emerald and total brand brown. No checkout destination disclosure or setup prose.
Discount shows actual item subtotal before/after. Rate comes from server detail;
mixed/legacy ratio is explicitly effective and real zero is0% applied, never a
fabricated state rate. Configured percent promo survives cent rounding; fixed
discount shows actual percent saved. Tax amounts/payment totals remain unchanged.

Full client624/server797 and guarded420/296 pass; final color-only client607 tier2
and combined build also pass. Actual fictional preview verifies gray pills,
blue tax/emerald savings/brown total, SAVE10 before14.99/after13.49, no destination
and320px no-overflow. Fixture has0attempts/0writes and remains a labelled local
preview at http://127.0.0.1:5197/checkout for owner review; not a live tax calculation. No DB/
provider/flag/registration/payment activation, real charge or email. Draft preview
uses fictional8.25%tax/SAVE10/SAVE5, not configured production collection. See the
[active checkpoint](docs/work-checkpoints/2026-10-27-checkout-summary-labels.md).

## Deployed: US Tax Preparation, Collection Off (2026-10-27)

Task feat/stripe-tax-readiness replaces hardcoded state/client guesses with an
external Stripe Tax adapter and explicit not-configured behavior, US-only server
validation and rate/jurisdiction UI. Owner has no real sales-tax registration;
real charging stays locked. Owner explicitly chooses preparation only: Stripe Tax
stays off, with no provider address/category/registration setup. Optional order
tax snapshot migration is approved only after private backup/checks.
Implementation and approved backup/migration are complete:28matching migrations,
no pending; all34prior business-table fingerprints preserved. PR62/63 pass separate
exact-head Quality and release main8df5883153d8f8a89d64efbb0d04fd8043eba8ff.
Railway a51c7d27-1294-459b-83fc-afea51623243 SUCCESS; both stable Vercel aliases
READY at that exact source. Live preview reports none/not_configured/zero/null
percentage, correct16.98total for the existing10.99plus5.99 example, no raw refs;
non-US/wrong-mode/access boundaries pass. Actual checkout preserves bag/account,
loads secure card fields, shows US-only selection/51states+placeholder and opens
tax disclosure; staff reports Sandbox/Allowed and Tax/Not collecting. Older staff
order explains no saved breakdown rather than inventing a historic rate. No new
orders/email since release, receipts off. Screenshot browser label is absent from
published DOM and production routing code; appears to be Safari tab-group UI.
Parent owns docs-only final evidence/sync; implementation/review agents closed. The
[active checkpoint](docs/work-checkpoints/2026-10-27-stripe-tax-readiness.md)
records the contract, ownership and precise next steps. Never commit the private
business-origin address or assume sandbox registration is a government permit.

## Sandbox Card Testing Enabled (2026-10-27)

Owner clarifies fake-card checkout must remain usable. Only hosted API
PAYMENTS_ENABLED changes to true; existing-build redeploy
f9afcf4a-5190-4fc7-b4c8-82762c3cb2b4 is SUCCESS at unchanged main1738cc7. Runtime
public configuration is sandbox/enabled; live/missing-mode requests409, health200,
direct staff403 and no-pending-migration startup pass. Actual admin reports verified
Sandbox/Allowed (sandbox), live still locked; reloaded customer checkout retains
bag/account and loads the secure test card field. No purchase was submitted, no
real funds/email, source change, migration or business-data mutation. Local private
defaults remain paused; no Vercel rebuild. Receipt settings remain off. Owner's
manual hosted test orders can still affect the testing DB's orders/stock. Full
purchase/device/recovery/financial launch acceptance remains open. See the
[current checkpoint](docs/work-checkpoints/2026-10-26-payment-environment-safety.md).
This supersedes older paused-runtime notes, not the live-payment lock.

## Payment Sandbox Release Verified (2026-10-27)

PR58/59 release main1738cc767ea9a78f6ad13372e6a4e98a39d098f9 after exact-head
Quality and full release review. Railway e6e49db0-9f30-49aa-b7f8-1b8b640a66fc is
SUCCESS and both stable Vercel artifacts are READY at that source. Actual signed-in
admin shows Configured Sandbox/Account verified/New payments paused, matching
expected and returned Chase and Evie Sandbox IDs and the live-charge lock. Public
configuration is sandbox/false/no-store; a valid-shaped start request gets503
before pricing/provider work. Health/catalog/campaigns200, exact CORS, customer401,
direct staff403 and anonymous admin protection pass. Public18-asset inspection
finds the matching sandbox public key, no server-key pattern/live key/admin module.
Fresh read-only preflight and startup show27matching/0pending/0failed migrations;
old test intents last24h0. New orders/email deliveries since release0; no receipt
settings enabled. Focused offline checks rerun289server/223client pass. No migration
applied, business-data mutation, charge/refund/email or new resource. The
[active checkpoint](docs/work-checkpoints/2026-10-26-payment-environment-safety.md)
contains exact artifacts, checks, recovery limits and remaining sandbox/device/
durable-recovery/financial launch gates. Payments stay paused, live charging is
code-locked; credential setup is not actual purchase acceptance. Prior key-empty
and release-hold entries below are historical, not current instructions. Final
evidence is documentation-only integration work, not another production release.

## Local Source Complete: Payment Environment Safety (2026-10-26)

Latest coordinated-release preparation: source commit fb01621 is pushed on
feat/payment-environment-safety; integration/release CI and full release review
are still pending. Main merge is explicitly HELD until the parent confirms fresh
status/preflight and releases the hold. This is not payment activation or1.0 launch.

Parent-reported provider milestone: owner explicitly authorizes the supplied
sandbox credential after the exposure warning. The private local credential is
verified against the expected Chase and Evie Sandbox account; creation stays
paused. Railway's four matching payment variables are saved with skipDeploys:true,
without a runtime restart. Vercel's existing public-key variable value is updated
for its same production/preview targets and existing type; no deployment yet.
An attempted in-place Sensitive-type conversion returned400 without mutation;
the successful correction changes only the value. No key values are recorded.
No live key, DB mutation or new resource is involved. Parent retains private
configuration/provider ownership and final deployed verification; Git steward
owns the single publication stream. See the active checkpoint for the release hold.

Hosted follow-up: owner expressly authorizes using the supplied sandbox credential
after the exposure warning. It is saved only in ignored mode600 local backend
settings and verified against the expected Chase and Evie Sandbox account; payments
remain paused. Shared read-only migration preflight27matches/nonepending/nonefailed.
Coordinated hosted source/config preparation follows; no live key is activated.
The earlier wait-for-private-replacement step below is superseded, not secret
handling rules. See the checkpoint's latest evidence before acting.

Earlier hosted follow-up: owner requests existing Railway/Vercel use Chase and Evie Sandbox;
renamed context and current hosting targets are verified read-only. Server key was
missing, then supplied in chat. That copy is not saved/deployed; request a privately
entered replacement after Stripe key rotation. No cloud variables, staged patch or
deployment changed. Current main does not enforce local new payment gates; next
requires coordinated source/config/preflight, not a frontend-only key switch. See
the checkpoint's latest follow-up before acting. Never copy credentials into notes.

Owner approves source preparation for sandbox/live isolation and a server-backed
admin Stripe indicator. Both assistant Stripe contexts are connected; website keys
are not yet verified. Task feat/payment-environment-safety preserves the prior
uncommitted payment test/admin preparation. Default-off creation, strict mode/account
checks, protected read-only context and public key-mode handshake are implemented.
Live creation stays code-locked pending durable attempt/webhook/recovery acceptance.
Server665/client551 tests, payment selection289/223, safety9/gateway6 and all builds
pass. Isolated actual admin UI checks pass; independent commerce review finds no
scoped blocker, and its extra cache/paused-live/timeout tests are added. Dedicated
local commands use3010/5175, loopback DB validation and mocked email. Ignored private
overrides are owner-only: supplied sandbox public key saved, server key still empty,
creation false. One read-only account check proves the older local key belongs to
a different test environment; it is not reused. No existing credential changed.
No shared data/schema/provider configuration, real payment/email, publication or
deployment. Hosted isolation/durable recovery/financial/device acceptance remains.
See the [active checkpoint](docs/work-checkpoints/2026-10-26-payment-environment-safety.md)
for implementation ownership, verification and remaining target/configuration gates.
The [customer worker checkpoint](docs/work-checkpoints/2026-10-26-customer-payment-configuration.md)
records the bounded handshake's additional isolated evidence.

## Current Preparation: Stripe And Admin Checks (2026-10-26)

Local preparation on test/stripe-checkout-readiness preserves the initial audit.
Adds an offline fixed-suite runner with inherited-credential isolation and worker
network guard, expanded adapter/controller/promo/card/wallet/coordinator tests and
safe admin receipt projections. Orders now searches Stripe IDs; actual Orders and
Reports say Marked paid, not reconciled transactions; automatic receipt activity
and pre-manual-send cautions are visible; Notifications links to the real editor.
No payment creation/recovery/refund/financial-status/fulfillment policy is changed.
The [acceptance matrix and admin backlog](docs/prelaunch/payment-readiness.md)
separate working source from durable-recovery/atomic-attribution/financial-ledger/
stale-status launch blockers and provider/device/business decisions. No DB/schema,
credential/provider setting, payment/email, publication or deployment. See the
[current checkpoint](docs/work-checkpoints/2026-10-26-stripe-checkout-readiness.md)
for exact final test/build/browser/review results and resume instructions.

## Initial Audit: Stripe Checkout Readiness (2026-10-26)

Read-only payment-flow review is complete; no runtime or provider change. Stripe
plugin discovery reports not installed, so account mode, webhook destinations,
wallet domains and provider activity are unverified. Existing trusted pricing,
payment verification, unique-payment order/atomic inventory and receipt privacy
are present. Main launch blockers remain browser-dependent finalization, no durable
checkout/payment-attempt snapshot or Stripe creation idempotency, separate
promo/campaign commits, and order-status-derived refund reporting. Tax is still an
estimate with a placeholder Stripe Tax path. Focused provider-mocked checks pass:
50 server/36 client. No charge, email, DB write/migration, configuration change,
source publication or deployment. Docs-only task is docs/stripe-checkout-readiness
from synchronized dev-main517e5ed. [Audit/checklist and exact next steps](docs/work-checkpoints/2026-10-26-stripe-checkout-readiness.md)
separate confirmed source findings from pending Stripe/dashboard/device acceptance.

## Current Repair: Email Template Copy (2026-10-26)

Completed and live at main2066f6b45287722bac0e40b233e38b130531643e on both
Vercel projects READY and Railway SUCCESS. Starter adoption reuses saved copies;
My templates/Starters/Archives and acknowledged-save state remove duplicate-create
and refresh-lock confusion. Client364/server507, builds, ten-request real-loopback
one-row fixture, independent review and current-head PR55/56 Quality pass.
Live Already added/edit/Cancel checks pass with zero captured browser errors.
Owner then explicitly requests duplicate cleanup: after a fresh decoded private
backup, four exact active payment duplicates are archived transactionally, original
and preparation templates preserved, two active remain. No permanent deletes,
schema/provider/receipt-settings change or email send; sending stays off.
See the [final checkpoint](docs/work-checkpoints/2026-10-26-email-template-copy.md).

## Latest Milestone: Payment Receipt Email (2026-10-26)

Reviewed main `b1fc1997c81dd4d133ae3f89133482a9f1d2b84f` is verified live on both
Vercel projects (READY) and Railway (SUCCESS). Atomic receipt queue, saved template/
mode controls, branded monogram/Lucide email and truthful receipt states are deployed.
Live admin payment/shipping sample checks pass; client357/server497/gateway6/helper21,
all builds and current-head PR50-53 checks pass. Approved additive migration is
27matching/nonepending after decoded backups, with old records preserved.

**Sending is OFF:** no saved automatic settings, automatic delivery rows or deployed
Resend sender/key/live switch. No real email, paid plan, domain purchase or provider
configuration change. Next requires an owned verified sending domain/provider setup,
explicit approved inbox/budget and live acceptance before enabling the selected saved
payment template. Shipping/other operational mail stays manual. Follow
[final evidence and activation gates](docs/work-checkpoints/2026-10-25-checkout-receipt-email.md).
Earlier milestones below are chronological history, not current remaining work.

Generated: 2026-06-05
Latest milestone: 2026-10-25 protected Vercel admin separation is completed and live at main30bc5bae4612285f2aa006e7ab28c0822ac62922. Shop https://doggy-ent.vercel.app is storefront-only (zero admin UI modules; old /admin/login renders public404). Staff https://doggy-ent-admin.vercel.app/admin/login is Vercel-authenticated on all deployments, uses server-only same-origin gateway plus persisted ADMIN/ACTIVE Better Auth. Both Vercel artifacts READY and Railway SUCCESS at the exact SHA; direct admin APIs403, protected gateway-only401, cross-origin requests404, current/historical alias probes12/12protected, public read/CORS/customer controls pass. Owner MFA and real app login/read/editor/logout/relogin passed. Client354/server413/gateway6/helper21, all builds/audit0 and current-head PR45-48 Quality/reviews pass; startup/preflight26matching/nonepending. Same DB; no business-data/schema/provider transaction or account-password change (normal auth sessions only). [Hosting design](docs/architecture/admin-hosting.md) and [final checkpoint](docs/work-checkpoints/2026-10-25-vercel-admin-separation.md) record exact artifacts, scope, recovery, manual Safari/device/upload/launch gaps and documentation-only branch close-out. Earlier staged/pending paragraphs below are chronological history, not current blockers.
Current task: 2026-10-25 owner supersedes Cloudflare preparation with Vercel-only separate admin/storefront hosting, still using RailwayAPI/DB. Explicit approval covers new protected doggy-ent-admin project, All Deployments Vercel Authentication and server-only gateway credential staged after tests. No domain purchase/Cloudflare/paid add-on/migration/business-data/provider send or account-password change. feat/separate-admin-application preserves combined/live access until new protected admin works. Local separate/combined builds and348client tests pass; optional backend gate and Vercel runtime gateway are next. [Resumable checkpoint](docs/work-checkpoints/2026-10-25-vercel-admin-separation.md) records exact scope, stages, ownership and remaining activation/verification gates. No source publication or live mutation at this milestone.
Deployed recovery update: 2026-10-25 task/release PRs #42/#43 are merged to main 4930ee4a0bd3f69b246c51b8365e03cd09d308a1, verified live on Vercel dpl_5DJqR4Mdmrzvtxrz7ooPWm8LNcy5 READY and Railway d720bc23-f74c-4192-ab8f-3e720616b8a2 SUCCESS. Centered prominent404, stable missing/campaign/temporary/offline/order-help copy, new illustrative Labrador image, shared monogram/open-space fill, normal-flow footer and footer-only storage information are live. Hosted Quality passed both jobs/all steps, final local314client/393server/21helpers and both builds; production health/catalog/eight products/CORS/anonymous ownership guard, image, recovery/metadata/footer and right-side bag checks pass. Startup/preflight26matching migrations, none pending, zero staged work/errors. [Final checkpoint](docs/work-checkpoints/2026-10-25-error-pages-storage.md#final-production-verification) records exact source/artifacts, file/command scope, remaining device/provider/legal/soft404 limits and documentation-only integration close-out. No DB change, provider action, further incident rotation or1.0launch acceptance. Earlier publication-in-progress notes below are historical.
Current continuation: 2026-10-25 owner keeps deployment authorization and requests centered, more obvious 404s, additional quirky recovery states and monogram across open page space. Previous recovery/footer/storage changes were staged but not committed/pushed/deployed. Preserved branch feat/error-pages-storage-ux now includes deterministic offline/order-help variants, safe contextual actions and shared route monogram; no DB/provider/credential changes. Local desktop checks confirm the new treatment and normal-flow footer. [Active checkpoint](docs/work-checkpoints/2026-10-25-error-pages-storage.md) is authoritative for pending final tests/review/publication and exact next steps.
Publication authorized/in progress: 2026-10-25 owner adds a new recovery image, requires footer-at-bottom on short/long pages and explicitly asks to deploy. Same preserved feat/error-pages-storage-ux now includes bundled generated two-Labrador trail image and a single dynamic-viewport App frame with flexible public/account shells, normal-flow footer and checkout/confirmation background stretching. Both builds, 308 client/393 server/21 helper tests and two scoped independent reviews pass. Actual footer/image checks pass across seven local public/account states with no gap/overflow; previous recovery/SDK tests remain. Fresh hosting identity/config and read-only Railway preflight confirm current main 8a2961d healthy, no staged work and 26 matching migrations/none pending. No DB change or provider send/payment/credential action. [Current checkpoint](docs/work-checkpoints/2026-10-25-error-pages-storage.md) records source, image prompt, verification and exact publication/deployment gates; prior preview-only notes are historical.
Verified local preview: 2026-10-25 quirky missing/error pages and less intrusive storage information on feat/error-pages-storage-ux from clean synchronized dev-main dae3a75. Connected catch-all/shared Labrador recovery, safe missing-versus-temporary campaign states/noindex restoration, footer-only information and deferred payment SDK. Client build/296 tests and scoped independent review pass; actual local 858 px and read-only fixture 575 px recovery/metadata/navigation/no-SDK checks pass, screenshot inspected, fixtures stopped. [Resume checkpoint](docs/work-checkpoints/2026-10-25-error-pages-storage.md) records exact files/commands, SPA200/noindex caveat and remaining owner/device/provider/legal review. No optional consent/tracker, server/schema/shared DB/provider/credential change, commit/push/deployment or effective-policy approval. Live deployment below is unchanged; owner preview/review is next.
Deployed account update: 2026-10-25 task/release PRs #37/#38 and focused visual follow-up #39/#40 are merged. Main 8a2961d4758e502e4b8e1602d37d2d3bca1dd943 is live on Vercel dpl_EhULUpTnBc2g8iUnpkKc7YsVbvSd READY and Railway 6b124c9b-adb9-4b3e-b4e2-304cd681665a SUCCESS. Hosted current-head Quality passed every job/step for both releases; final totals 265 client/393 server/21 helpers, both builds. Fresh startup/preflight: 26 matching migrations, none pending, listening and no startup error lines. Live health/catalog/eight products, exact-origin credentials CORS, seven SPA paths, anonymous wishlist guard and guest-save return pass. Live all-eight-card overlay bounds and Quick View 18 oz/$43.99/test-purchase-disabled check pass; no captured browser errors or real customer writes. [Final evidence/remaining acceptance](docs/work-checkpoints/2026-10-24-account-wishlist.md#final-production-verification) supersedes earlier in-progress notes. Final evidence is an integration-only documentation follow-up in [PR #41](https://github.com/alvarezaaronAI/doggy-ent/pull/41), not another production rollout. No extra rotation/provider/network action or 1.0 launch acceptance.
Verified local update: 2026-10-25 account navigation/monogram/pack summary, pet-photo/privacy focus fixes and owned Wishlist are complete on feat/account-wishlist-experience. Both builds, 264 client/393 server tests, 21 helper tests, real loopback DB persistence/concurrency/cascade checks and isolated actual browser checks pass. Independent review's account/policy bag edge cases are fixed with regressions; no remaining scoped source blocker. Approved additive migration is applied locally/Railway after decoded private backups: 26 matching migrations, none pending, prior records preserved. Fixtures cleaned; actual local Railway-target health/products/anonymous guard pass. [Checkpoint](docs/work-checkpoints/2026-10-24-account-wishlist.md) records exact evidence and pending managed source publication. No new rotation, provider send/payment, active reward or launch acceptance.
Current task: 2026-10-24 owner reports prior publication/merges complete and requests pet-photo recovery, grouped account navigation, shared monogram, persistent wishlist and a compact overview pack card. Fresh fetch confirms clean synchronized dev-main a406d05 and matching production tree; local main safely fast-forwarded to origin/main a16e758 before new feat/account-wishlist-experience. Owner explicitly approved additive wishlist Railway migration after fresh backup/preflight; no migration is yet executed in this milestone. UI and owned API/migration work is in progress. [Resume checkpoint](docs/work-checkpoints/2026-10-24-account-wishlist.md) supersedes the older publication task for next actions; existing incident-response stages remain separate.
Publication in progress: 2026-10-24 owner explicitly requests completing GitHub upload and deployment. This supersedes the earlier database-stage no-source-release instruction for reviewed source only. Current fix/railway-security-rotation inherits saved customer/auth/Pets feature 1bd53e2; release includes both that approved feature and security agent/runbooks/read-only helper, not a security-only hotfix. Fresh fetch, both builds, 238 client/331 server tests, 21 helper tests and scoped secret/docs checks pass; fresh Railway DB connection confirms 25 matching complete migrations, none pending. No additional rotation, migration, provider send or network change is authorized. [Release checkpoint](docs/work-checkpoints/2026-10-24-source-release.md) records exact progress, CI/merge/deployment gates and resume steps. Earlier uncommitted/no-release milestones remain chronological evidence, not final deployment status.
Database stage complete: 2026-10-24 owner-approved backup/rotation/confirmed-consumer/current-source restart checks pass. Fresh private full 2,800,092-byte backup decoded/checksummed; 25 matching completed migrations, none pending. Original DB password rejected; owner's final replacement accepted, same DB/role verified privately. Backend DATABASE_URL now managed Postgres reference; only local override DATABASE_URL atomically updated, other settings preserved, 0600/ignored/untracked and temporary credential removed. Local watcher reloaded without source edits: health 200/databaseConnected=true/products 200/eight products; production health/products 200/eight products. Latest backend d71d2c64 and DB a8fb0946 SUCCESS, zero pending, approved main 64ae486 unchanged and startup reports no pending migrations. No source/UI release, applied migration, business/session write, auth/provider-key/network change or send/payment. [Final checkpoint](docs/work-checkpoints/2026-10-24-railway-security-response.md#database-stage-final-verification) supersedes chronological BUILDING/outage/preparation notes. Other security stages and private audit/device QA remain; public TCP still deliberately present. Do not regenerate again or claim the whole incident is closed.
Owner execution guide: 2026-10-24 practical [key rotation guide](docs/security/owner-key-rotation-guide.md) added with dashboard steps, variable mapping, secure human handoffs and staged verification. Recommended assisted first scope: fresh private backup/preflight and Postgres rotation/consumer updates/current-build restart, allowing a brief outage, with no migration/source release/auth/network/provider sends. Guide creation made no live changes; execution awaits the first scoped decision. See the [incident checkpoint](docs/work-checkpoints/2026-10-24-railway-security-response.md#owner-execution-guide-follow-up).
Safety assessment follow-up: 2026-10-24 question-only recheck confirms same successful API/DB deployments, redacted credential-name inventory and one ACTIVE configured Postgres public TCP proxy; no external reachability test. Live rotation/revocation, network reduction and forensic/audit clearance remain pending. Security helper fixtures rerun 10/10; runbook adds conditional Railway GitHub/autodeploy, CLI/CI, bucket/registry checks. No production remediation was performed. See the [current incident checkpoint](docs/work-checkpoints/2026-10-24-railway-security-response.md#owner-safety-assessment-follow-up) before answering whether the incident is closed.
Current task: 2026-10-24 Railway incident response preparation. Owner-requested prerequisite completed: all customer/Pets work pushed on feat/customer-auth-experience at verified remote/local 1bd53e2e6a7a61659f47f349beb2a5c57bf81986, then clean new fix/railway-security-rotation created from it. main/dev-main unchanged; no release. Railway reconnect now works: correct artistic-gentleness/production doggy-ent + Postgres, redacted variable-name reads, no pending changes and successful API deployment main 64ae486 verified. Live auth uses ADMIN_SESSION_SECRET; local modes use BETTER_AUTH_SECRET. Eighth reusable security role, provider-aware runbook and read-only helper added locally: ten security/21 combined helper tests, syntax, eight TOMLs, package/CI parsing, five-document/116-link/fence/diff checks and independent bounded scenario review pass. No credentials rotated, fresh incident backup, session revocation or shared data/network/provider change. [Resume checkpoint](docs/work-checkpoints/2026-10-24-railway-security-response.md) records exact target, ledger, branch inheritance and next approval gates. Earlier pending-push notes below are historical.
Current handoff: 2026-10-23 owner requests complete feat/customer-auth-experience branch-only commit/push, then separate fix/railway-security-rotation work. Fresh builds and 238 client/331 server tests pass; scoped secret scan clean. No main/dev-main merge, deployment or secret rotation is authorized by this branch handoff. [Publication checkpoint](docs/work-checkpoints/2026-10-23-customer-auth-pets-publication.md) records scope, checks and exact steps; final remote SHA will be recorded on the successor security checkpoint. Earlier uncommitted descriptions below are historical after publication.
Latest follow-up: 2026-10-23 optional Pet weight/Size guidance is connected on preserved dirty feat/customer-auth-experience: approximate size hints, editable lb/kg with conversion, card display, canonical grams/preferred unit/server measurement date, old-client omission and no-op preservation, clearable optional values and no measurement snapshots in activity. Both builds, 238 client/331 server tests, real loopback persistence/constraint/rollback/cascade checks and eighteen four-width browser scenarios pass; screenshots inspected. Separately approved additive weight migration applied locally/Railway after fresh full decoded private backups: 25 matching complete migrations, none pending and prior records/photos preserved. Actual local Railway-target owner screen loads prior pet, exposes the optional field and survives refresh after server-client regeneration/reload; no real pet values changed. No commit/push/merge, website deployment, provider action or active incentive. [Resumable checkpoint](docs/work-checkpoints/2026-10-23-pet-weight.md) has exact files/commands/backups/release gates.
Latest integration: 2026-10-23 approved photo-led Pets is connected locally on existing dirty feat/customer-auth-experience: complete cards/direct inline Edit, canonical breed/mix, visual stage/size, multiple purposes, confirmed immutable month/day, private normalized raster photos, archive/restore and separate privacy removal. Both builds, 225 client/314 server tests and real loopback persistence/ownership/private-photo HTTP/rollback/concurrency/cascade checks pass; independent four-width browser findings fixed and rerun passes. Owner-approved additive migration applied locally and Railway after fresh full decoded private backups: 24 matching complete migrations, none pending, old records preserved. Actual signed-in local Railway-target screen loads prior pet and survives refresh with zero captured errors; no real pet data changed by browser QA. No active reward/fraud decision, provider send, commit/push/merge or website deployment. Remaining privacy/retention, real-device and combined-source release gates plus exact files/evidence/next steps: [resumable checkpoint](docs/work-checkpoints/2026-10-23-connected-photo-led-pets.md). Richer-fields-preview-only notes below are historical.
Latest local follow-up: 2026-10-23 pet activity/account theme on existing dirty feat/customer-auth-experience. Pet already has createdAt/updatedAt; local code reuses CustomerAccountEvent for atomic PET_CREATED/PET_UPDATED/PET_DELETED dates, profile duration and changed field names without private pet snapshots. Both builds/Prisma 6.16.2 generation, 248 server/212 client tests, runtime syntax and four-width preview QA pass; desktop/mobile screenshots inspected. Independent review's transaction-test gap is addressed. Rich-card preview matches actual account emerald/soft-gray tokens; the connected richer fields remain unimplemented. No schema/migration/shared DB write or status query, commit/push/deployment or automatic fraud/reward decision. Retention/privacy approval, real isolated-DB atomicity/concurrency/cascades and existing combined-source/device gates remain. [Resumable checkpoint](docs/work-checkpoints/2026-10-23-pet-activity-and-account-theme.md) has files, results and exact next steps; it supersedes older preview-only/no-audit notes only for this narrow backend activity slice.
Latest styling/icon convention: 2026-10-21 owner confirms Tailwind, Font Awesome and Lucide across the entire project. AGENTS.md and [shared UI standards](docs/ux-ui-standards.md#shared-styling-and-icons) record Tailwind-first styling, existing Font Awesome brand/social and consistent uses, Lucide interface controls, shared resources/accessibility and no broad replacement/new library. The interrupted pet-preview screenshot correction is complete: simple cake/date row below a shadowed Edit pet action, with supplied Lucide detail/action icons; no View profile restored. Four-width preview QA, screenshot inspection and syntax/size/docs/diff checks pass. [Current checkpoint](docs/work-checkpoints/2026-10-20-customer-auth-experience.md#2026-10-21-shared-resources-and-reference-card-polish). No app/schema/shared-data/publication/deployment change.
Latest preview/data-reference refinement: 2026-10-21 owner accepts the focused birthday/multiple-purpose direction. Photo-led cards restore a distinct birthday block, show optional multi-select treat purposes, and move Archive into pet options while keeping direct Edit. Purchase insights, product enjoyment feedback and later optional preferences are captured in the [reusable prioritized data backlog](docs/prelaunch/customer-data-strategy.md#card-refinement-and-reusable-data-backlog), not a new questionnaire or collection pipeline. Final four-width browser QA, inspected desktop/mobile screenshots and syntax/size/docs/diff checks pass; app Pet storage still has five fields and one scalar treatPurpose. No app/schema/shared-data/provider/publication change. [Current checkpoint](docs/work-checkpoints/2026-10-20-customer-auth-experience.md#2026-10-21-birthday-multiple-purposes-and-data-reference) records exact scope and remaining connected/device work.
Latest preview refinement: 2026-10-21 owner removes View profile and the intermediate pet-detail screen. The disconnected photo-led cards now show name/photo, breed/mix, life stage, size, favourite proteins, treat purpose and birthday together, with one primary Edit pet action. Save, Cancel and All pets return directly to the cards; archive/restore, separate privacy entry, birthday lock and one-future-offer-per-account notice remain. Final four-width browser checks, including long names/breed/protein values, pass with no overflow, page/console errors or application requests. Syntax/size/docs/diff checks pass; no application/Prisma/DB/provider/publication change. [Current checkpoint](docs/work-checkpoints/2026-10-20-customer-auth-experience.md#2026-10-21-complete-pet-cards-and-direct-editing) supersedes the old list/detail/edit navigation only. Prior uncommitted auth/Pet implementation remains intact.
Latest preview refinement: 2026-10-21 owner requests a broader breed catalogue, independent Mixed breed checkbox and friendlier picker/life-stage/size UI. The disconnected concept now has 58 illustrative named breeds with canonical IDs/aliases, a styled searchable choice panel and labeled visual radio tiles; breed + mix are independent and no unknown/purebred claims are inferred. Four-width preview QA, syntax/reference/docs/diff checks pass; wide/narrow screenshots inspected after icon-size/search-spacing fixes. No application/Prisma/DB/provider/publication change. [Current checkpoint](docs/work-checkpoints/2026-10-20-customer-auth-experience.md#2026-10-21-breed-catalogue-mix-checkbox-and-visual-choices) and [future data design](docs/prelaunch/customer-data-strategy.md#breed-data-quality-preview-only) supersede the smaller native-list concept below. Prior uncommitted auth/Pet implementation remains intact.
Current owner direction: 2026-10-21 photo-led Pets remains a disconnected preview. Latest refinement removes birthday-adjustment requests and annual birthday rewards; the existing notice states one future offer per account, not per pet or edit. Breed selection now demonstrates standardized suggestions/aliases, canonical in-memory IDs and typo rejection rather than free-text reporting. Birthday/photo/breed/archive fields and discounts are NOT implemented in the app. Updated four-width breed/no-adjustment/offer/local CRUD checks pass with no overflow, page/console errors or application requests; syntax/size/docs/diff checks pass. Current task remains uncommitted feat/customer-auth-experience; existing work is preserved. No branch switch, source publication, schema/shared-data write, provider action or deployment. [Latest checkpoint](docs/work-checkpoints/2026-10-20-customer-auth-experience.md#2026-10-21-one-time-offer-and-structured-breed-refinement) and [data/reward proposal](docs/prelaunch/customer-data-strategy.md#photo-led-pets-and-reward-safeguards-proposal-only) supersede older annual-reward/correction-request and informational-only resume instructions below.
Latest follow-up: 2026-10-21 auth form polish adds useful examples/hints, delayed field validation, soft red/green input states, first-error focus, stable feedback spacing, password guidance and a separate protected Pets tab. No additional customer fields/schema/migration beyond the approved five-field Pet slice below. Explicit native password limits remain 8/128; actual-engine private-hash/name/bounds tests added. Client 212/server 230 tests and both builds pass; isolated 1440/390/320 fixture-browser checks and inspected screenshots pass. Final combined docs/syntax/diff/release checks and device/provider acceptance remain; no source publication or website deployment. Latest owner asks what data was added, so respond informationally. Exact progress and next steps are in the linked checkpoint below.
In progress: 2026-10-21 customer auth experience on feat/customer-auth-experience: centered card/monogram, reviewed short signup, session-confirmed safe checkout return, private-proof/provider-aware recovery and optional owned Pet CRUD in Profile. Seventh customer_experience role added; original six preserved. Owner-delegated additive Pet migration applied locally and Railway after target/checksum preflight and private full decoded backups: 23 complete matching migrations, none pending. No remote business fixtures or real provider emails. Client 206/server 228 tests and both builds/Prisma 6.16.2 generation pass; isolated local HTTP and desktop/narrow fixture-browser checks pass, independent scoped review has no remaining blocker. Final privacy-draft copy/docs checks and publication are pending; no commit/push/merge/website deployment in this phase. Latest request asks for a breakdown, so do not resume publication merely from this note. [Resumable checkpoint](docs/work-checkpoints/2026-10-20-customer-auth-experience.md) records completed/unverified work, backup/QA evidence, changed groups and exact next steps; prior verified release remains below.
Managed-publication release: 2026-10-20 owner authorized ready scoped task PRs into dev-main, checked release PRs into main and safe local/upstream synchronization without repeated routine prompts. Inspection/preview/no-publication requests override this; shared-data/provider operations and 1.0 launch acceptance remain separate. All six agents remain. PR #31 integrated foundation; PR #32 integrated managed Git/release roles, type/topic naming without codex/ and primary-branch drift reporting. [Release PR #33](https://github.com/alvarezaaronAI/doggy-ent/pull/33) merged to main at 64ae486 after successful current-head Quality CI. Vercel production dpl_5DbXqgtDpv3CsHiUovGJqqjY7ZmC is READY and Railway 674047a9-0a96-4e96-86ce-0f623041d3b5 is SUCCESS for that same commit. Both local primary branches match their own GitHub upstreams; completed task renamed chore/prelaunch-foundation without history rewrite. 11 helper tests, syntax, six TOMLs, JSON, official skill validation, docs checks and independent QA pass; release CI runs both builds, 170 client/143 server tests and helper tests. Read-only DB preflight: 22 matching completed migrations, none pending/failed. Live privacy browser rendering, nine SPA route responses, public API and exact-origin CORS checks pass. No DB/schema/env/provider changes, manual deployment or release tag; VERSION remains 0.1.0 unreleased. Policies remain drafts and real-device/commerce/legal launch gates remain open. This documentation-only evidence follow-up is integrated separately without another production rollout. See [full evidence/checkpoint](docs/work-checkpoints/2026-10-20-managed-releases.md) and [bounded policy](docs/engineering/git-workflow.md#owner-authorized-managed-publication). Earlier pending/open-PR/no-merge notes below are historical milestones.
Publication follow-up: 2026-10-20 owner-authorized first GitHub push is published as source commit `1a29522`, branch `codex/chore/prelaunch-foundation`, [PR #31](https://github.com/alvarezaaronAI/doggy-ent/pull/31) into dev-main. All local checks and independent scoped QA pass. Hosted Quality run 1 passes both Ubuntu jobs (clean install/build/tests/helper tests); Vercel integration status is success. Publication evidence notes are a separate docs-only follow-up; final-head checks/synchronization are verified on the PR before close-out. See [publication checkpoint](docs/work-checkpoints/2026-10-20-first-agent-publication.md). Main, release tags and shared DB remain unchanged; no manual production deployment or merge. Version 0.1.0 stays unreleased, policies remain drafts and device/provider/launch gates remain. The foundation notes below describe the earlier no-publication milestone.
Latest phase: 2026-10-20 prelaunch foundation complete locally on `codex/chore/prelaunch-foundation`. Six callable project agent definitions, Git workflow skill/preflight/PR template/non-deploying CI, unreleased 0.1.0 baseline, six draft policy/help pages and essential-storage acknowledgment. [Checkpoint with files/commands/evidence/next steps](docs/work-checkpoints/2026-10-20-prelaunch-foundation.md), [agent guide](docs/engineering/agents-and-workflow.md), [prelaunch plan](docs/prelaunch/README.md), [customer-data strategy](docs/prelaunch/customer-data-strategy.md), [policy/storage inventory](docs/prelaunch/policy-and-storage-inventory.md). Client build/170 tests, server build/143 tests, seven Git fixtures, agent/skill/CI parsing and docs checks pass. Desktop/browser notice/bag/metadata checks pass; real mobile/Safari, custom-agent dispatch and hosted CI remain unverified. No schema/DB/env/auth/commerce change, commit/push/merge/deployment or real provider action. Fresh origin/main/dev-main trees match at the task baseline; deployment not inspected. All policies remain drafts pending business/legal approval. GitHub was installed/connected by the owner during the turn; read-only authenticated repository access is confirmed, no remote changes.
Latest update: 2026-10-18 - Focused routing/customer-session fixes are complete locally: backend-confirmed development panel, main-shop inclusion of new published products, production customer cookie policy, explicit session confirmation and stale-read protection. Duck remains visible in the real local browser. Owner customer sign-in reached /account and survived a full refresh through local server -> Railway DB; no captured browser errors. Both builds pass; 158 client/143 server tests, 176 syntax files, 14 generated copies and documentation checks pass. See [current checkpoint](docs/work-checkpoints/2026-10-18-data-routing-and-customer-session.md) and [routing guide](docs/architecture/development-data-routing.md). The repair is NOT deployed; deployed Chrome/Safari/device acceptance remains. Owner commit `8ebac7e` and newer main-triggered releases supersede the older staged frontend; do not promote it. No DB/env/schema/password change, commit or push.
Workspace: `/Users/nazxylix/Developer/vue-projects/doggy_ent/doggy_ent_vue`
Primary branches: `main` production source, `dev-main` integration. Final evidence task: `docs/account-wishlist-final-evidence`; return to synchronized `dev-main` after its checked merge. See current checkpoint and attached PRs for exact final refs. Integration-only documentation is intentionally included in the next website release.

This handoff is evidence-based from the repository. Anything not verified from code is called out as uncertainty. Earlier numbered sections and phase logs are historical snapshots; the latest dated evidence checkpoint supersedes their old auth, test-count, migration and email descriptions.

## 1. Business Overview

Doggy Ent is a Vue storefront and Express/Prisma API for selling small-batch dog treats under the storefront brand text "Chase & Evie Co." The product catalog includes jerky, training, bundle, and seasonal products. Customers can browse products, open quick views, add variants to a cart, enter checkout details, apply promo codes, pay through Stripe, and land on an order success page.

The admin area supports:

- Product catalog management.
- Promo code management, testing, and analytics.
- Donation campaign management for product-linked shelter campaigns.
- Order dashboard and order detail viewing.

The business logic currently centers on:

- Product statuses and inventory-aware selling modes.
- Two default product variants: `6 oz` and `18 oz`.
- Stripe card payment collection and server-side payment intent validation.
- Promo validation and usage tracking.
- Campaign donation preview and usage stats.
- Order creation with inventory decrement and rollback on create failure.

## 2. Client Architecture

Client root: `client/src/`

Framework and tooling:

- Vue 3 with `<script setup>`.
- Vue Router.
- Vite.
- Tailwind CSS through `@tailwindcss/vite`.
- Stripe.js through `@stripe/stripe-js`.

Path aliases are defined in `client/vite.config.js` and mirrored in `client/jsconfig.json`:

- `@app`
- `@shared`
- `@domains`
- `@storefront`
- `@products`
- `@cart`
- `@checkout`
- `@payments`
- `@admin`
- `@promos`
- `@campaigns`

The router lives at `client/src/app/router/index.js`.

Route inventory:

- `/`: storefront home, `HomeView.vue`.
- `/checkout`: checkout, `CheckoutView.vue`.
- `/order-success/:orderId`: success page, `OrderSuccessView.vue`.
- `/admin/login`: admin login.
- `/admin`: admin dashboard, protected by `router.beforeEach`.
- `/admin/products`: admin products, protected.
- `/admin/orders`: admin orders, protected.
- `/admin/orders/:orderId`: admin order detail, protected.
- `/admin/promos`: admin promos, protected.
- `/admin/campaigns`: admin campaigns, protected.

Admin navigation checks `/api/auth/me`; server guards remain the security authority. The current admin orders router applies `requireAdminAuth` to all routes. As of the approved 2026-10-11 migration, that guard verifies a persisted Better Auth session plus ADMIN/ACTIVE role/status. The old unguarded-orders finding is no longer current.

## 3. Server Architecture

Server root: `server/src/`

Framework and tooling:

- Express 5.
- Prisma Client with PostgreSQL.
- Stripe Node SDK.
- Cookie parser.
- CORS.
- `express-rate-limit`.
- `bcryptjs` for admin password hash verification.

Server entry:

- `server/src/server.js` loads `server/.env`, imports `app.js`, and listens on `process.env.PORT || 3000`.
- `server/src/app.js` configures CORS, JSON parsing, cookies, trust proxy, API mounts, and `errorMiddleware`.

API mounts in `server/src/app.js`:

- `/api/health`
- `/api/products`
- `/api/checkout`
- `/api/promos`
- `/api/admin/promos`
- `/api/admin/campaigns`
- `/api/campaigns`
- `/api/admin/orders`
- `/api/auth`

Server domain pattern after cleanup:

- `routes/`: Express route definitions.
- `controllers/`: request/response handlers where present.
- `services/`: business orchestration.
- `repositories/`: Prisma database access.
- `mappers/`: response or payload shaping.
- `validators/`: validation helpers.
- `constants/`: status and option values.
- `utils/`: pure domain helpers.

Shared server code:

- `server/src/shared/utils/money.js`: `normalizeCurrencyAmount`.
- `server/src/shared/utils/string.js`: slug, optional string, nullable number, email normalization.
- `server/src/shared/services/tax.service.js`: local tax estimate and future Stripe Tax hook.

## 4. Database Overview

Database provider: PostgreSQL through Prisma.

Schema file: `server/prisma/schema.prisma`

Prisma client:

- Runtime client: `@prisma/client`.
- Server Prisma singleton: `server/src/db/prisma.js`.
- Generated client output exists under `server/src/generated/prisma/`, but the schema generator currently uses default Prisma Client generation to `node_modules/@prisma/client`.

Models:

- `Product`
  - Catalog item.
  - Unique `slug`.
  - Product metadata fields: protein, cut, category, image, ingredients, texture, bestFor, freshness, storageFeeding, tags.
  - `status` enum: `DRAFT`, `ACTIVE`, `OUT_OF_STOCK`, `COMING_SOON`, `ARCHIVED`.
  - `sellingMode` enum: `MADE_TO_ORDER`, `INVENTORY_LIMITED`, `PREORDER`.
  - Relation: many `ProductVariant`.

- `ProductVariant`
  - Product size/price/inventory/SKU.
  - `price` is stored as integer cents.
  - `sku` is unique.
  - Cascade delete when product is deleted.

- `Order`
  - Customer, address, pricing, currency, Stripe payment intent ID, status.
  - `status` enum: `PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`.
  - Relation: many `OrderItem`.

- `OrderItem`
  - Snapshot of purchased product data.
  - Stores product name, image, size, SKU, quantity, unit price, and line total.

- `Promo`
  - Promo code and rules.
  - Unique `code`.
  - `type`: `GLOBAL`, `UNIQUE`, `REFERRAL`.
  - `status`: `DRAFT`, `ACTIVE`, `EXPIRED`, `DISABLED`, `ARCHIVED`.
  - `discountType`: `FIXED`, `PERCENT`.
  - Tracks usage count, generated revenue, and discount given.

- `PromoUsage`
  - Promo redemption record.
  - Unique `orderId`.
  - Tracks customer email, discount amount, subtotal amount, and `redeemedAt`.
  - Risk: `server/src/domains/promos/repositories/promos.repository.js` orders usage history by `createdAt`, but the Prisma model has `redeemedAt`, not `createdAt`.

- `Campaign`
  - Donation campaign linked to product IDs stored as JSON.
  - `status`: `DRAFT`, `ACTIVE`, `PAUSED`, `ENDED`, `ARCHIVED`.
  - `donationType`: `FIXED`, `PERCENT`.
  - Tracks generated donation, generated revenue, and order count.

Migrations are present under `server/prisma/migrations/`.

## 5. Stripe and Payment Flow

Client files:

- `client/src/domains/payments/services/stripe.js`
  - Loads Stripe using `VITE_STRIPE_PUBLISHABLE_KEY`.
- `client/src/domains/payments/services/payment.service.js`
  - Calls `POST /api/checkout/create-payment-intent`.
- `client/src/domains/payments/components/StripeElementsForm.vue`
  - Mounts Stripe card element.
  - Creates a PaymentIntent.
  - Calls `stripe.confirmCardPayment(clientSecret, ...)`.
  - Exposes `submitPayment()`.
- `client/src/domains/payments/components/StripeCheckoutForm.vue`
  - Currently appears to be a stub component with an empty `<div>`.

Server files:

- `server/src/domains/payments/routes/payment.routes.js`
- `server/src/domains/payments/controllers/payment.controller.js`
- `server/src/domains/payments/services/stripe.payment.js`

Flow:

1. Checkout form validates local UI requirements.
2. `StripeElementsForm.vue` calls `createPaymentIntent({ items, amount })`.
3. Server creates Stripe PaymentIntent with the submitted amount.
4. Client confirms card payment with Stripe.
5. Client calls `POST /api/checkout` with `stripePaymentIntentId`.
6. Server recomputes checkout preview totals.
7. Server checks `stripePaymentIntentAlreadyUsed`.
8. Server retrieves Stripe PaymentIntent and verifies:
   - status is `succeeded`
   - amount received equals trusted server total converted to cents
   - currency matches expected currency
9. Server creates order and decrements inventory.

Important payment risk:

- The PaymentIntent is created from the client-submitted amount before final server validation. If the client amount differs from server trusted pricing, the payment can succeed and then checkout can reject order creation with "Stripe payment amount mismatch detected." This needs a launch decision, likely creating PaymentIntents from server trusted preview totals instead of client totals, or using a server-owned checkout session/payment-intent flow.

## 6. Admin System Overview

Admin UI:

- `client/src/domains/admin/views/AdminLoginView.vue`
- `client/src/domains/admin/views/AdminDashboardView.vue`
- `client/src/domains/admin/views/AdminProductsView.vue`
- `client/src/domains/admin/views/AdminPromosView.vue`
- `client/src/domains/admin/views/AdminCampaignsView.vue`
- `client/src/domains/admin/views/AdminOrdersView.vue`
- `client/src/domains/admin/views/AdminOrderDetailView.vue`

Admin auth server:

- `server/src/domains/auth/routes/auth.routes.js`
- `server/src/domains/auth/services/auth.service.js`
- `server/src/app/middleware/auth/requireAdminAuth.js`

Auth behavior:

- Login endpoint compares submitted email/password to `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`.
- Password hash is checked with `bcrypt.compare`.
- Session ID is generated with `crypto.randomBytes(32)`.
- Session is stored as a signed, expiring admin cookie token after the 2026-06-05 stabilization pass. The old in-memory `Map` remains only as a fallback for older local session ids.
- Cookie name: `doggy_admin_session`.
- Session TTL: 8 hours.
- Cookie is `httpOnly`. After the 2026-06-05 admin auth stabilization pass, deployed cross-site admin cookies use `secure: true` and `sameSite: none`; local same-origin/proxy development uses `sameSite: lax`.

Admin auth uncertainty/risk:

- Sessions are not persisted in the database or Redis. They reset on server restart and will not work across multiple server instances.
- The UI protects admin routes, but API-level protection is inconsistent. Products, promos, and campaigns use `requireAdminAuth`; orders currently do not.

## 7. Completed Refactors

### Admin Cleanup

Recent committed evidence includes:

- Commit `4e5f648 Complete admin orders refactor`
- Commit `646a2b0 fixed admin, broken down to each component`
- Commit `d1432d4 refactoring, lego building each component`

Admin Products:

- `AdminProductsView.vue` is now an orchestration view.
- State/business logic moved into `client/src/domains/admin/composables/useAdminProducts.js`.
- API calls moved into `client/src/domains/admin/api/adminProducts.api.js`.
- Constants moved into `client/src/domains/admin/constants/adminProducts.constants.js`.
- Payload mapping moved into `client/src/domains/admin/mappers/adminProductForm.mapper.js`.
- Form validation moved into `client/src/domains/admin/validators/adminProductForm.validator.js`.
- Reusable UI moved into:
  - `AdminProductFormPanel.vue`
  - `AdminProductGuaranteedAnalysisFields.vue`
  - `AdminProductVariantEditor.vue`
  - `AdminProductStatusBadge.vue`
  - `AdminProductVariantCell.vue`
  - `AdminProductsTable.vue`

Admin Promos:

- `AdminPromosView.vue` is now an orchestration view.
- State/business logic moved into `client/src/domains/admin/composables/useAdminPromos.js`.
- Generic promo CRUD state remains in `client/src/domains/promos/composables/usePromos.js`.
- Promo API calls live in `client/src/domains/promos/api/promos.api.js`.
- Promo constants live in `client/src/domains/promos/constants/promo.constants.js` and admin grouping defaults live in `client/src/domains/admin/constants/adminPromos.constants.js`.
- Admin promo payload mapping lives in `client/src/domains/admin/mappers/adminPromoForm.mapper.js`.
- Reusable UI includes:
  - `AdminPromosHeader.vue`
  - `AdminPromosStats.vue`
  - `AdminPromosLibrary.vue`
  - `AdminPromoFormExtraFields.vue`
  - `PromoForm.vue`
  - `PromoCodeTester.vue`
  - `PromoAnalyticsModal.vue`

Admin Campaigns:

- `AdminCampaignsView.vue` is now an orchestration view.
- State/business logic moved into `client/src/domains/admin/composables/useAdminCampaigns.js`.
- API wrapper lives in `client/src/domains/admin/api/adminCampaigns.api.js`, delegating campaign CRUD to `client/src/domains/campaigns/api/campaigns.api.js`.
- Constants live in `client/src/domains/admin/constants/adminCampaigns.constants.js`.
- Payload mapping lives in `client/src/domains/admin/mappers/adminCampaignForm.mapper.js`.
- Reusable UI includes:
  - `AdminCampaignForm.vue`
  - `AdminCampaignScheduleFields.vue`
  - `AdminCampaignStatusBadge.vue`
  - `AdminCampaignsHeader.vue`
  - `AdminCampaignsStats.vue`
  - `AdminCampaignsLibrary.vue`
  - `AdminCampaignsTable.vue`

Admin Orders:

- `AdminOrdersView.vue` is now an orchestration view.
- State/business logic moved into `client/src/domains/admin/composables/useAdminOrders.js`.
- API calls moved into `client/src/domains/admin/api/adminOrders.api.js`.
- Constants and grouping rules moved into `client/src/domains/admin/constants/adminOrders.constants.js`.
- Formatting and timeline utility rules live in `client/src/domains/admin/utils/adminOrders.utils.js`.
- Reusable UI includes:
  - `AdminOrdersHeader.vue`
  - `AdminOrdersStats.vue`
  - `AdminOrdersFilters.vue`
  - `AdminOrdersQuickNav.vue`
  - `AdminOrdersGroup.vue`
  - `AdminOrderCard.vue`
  - `AdminOrderTimeline.vue`

Known admin cleanup leftovers:

- `client/src/domains/admin/components/AdminProductFormPanel.vue` is still large at 356 lines.
- `client/src/domains/admin/components/AdminHeader.vue` is an empty file.
- `AdminOrderDetailView.vue` still contains inline API calls and attempts `PATCH /api/admin/orders/:orderId/status`, but the server currently exposes only `GET /`, `GET /stats`, and `GET /:orderId` under admin orders.
- `client/src/domains/admin/api/adminOrders.api.js` only fetches list and stats; no fetch-by-id helper or status update helper exists.

### Server Structure Cleanup

Recent commit: `a7251ff Refactor server domain structure and shared helpers`

Completed:

- Added shared utilities:
  - `server/src/shared/utils/money.js`
  - `server/src/shared/utils/string.js`
- Wired generic JSON error middleware:
  - `server/src/app/middleware/error.middleware.js`
  - `server/src/app.js`
- Removed empty placeholder files and `.DS_Store` files from `server/src`.
- Consolidated old admin route implementations into compatibility re-exports:
  - `server/src/domains/admin/routes/promos.routes.js`
  - `server/src/domains/admin/routes/campaigns.routes.js`
  - `server/src/domains/admin/routes/orders.routes.js`
  - `server/src/domains/admin/services/campaigns.service.js`
  - `server/src/domains/admin/services/promos.service.js`
- Renamed promos repository folder from singular `repository` to plural `repositories`.
- Removed stale Fastify-style promo controller.

Products:

- Added server product constants, mappers, utils, validators.
- Product service now orchestrates Prisma and uses mapper helpers for mutation data and display price.
- Product controller now delegates payload validation to `products.validator.js`.

Checkout:

- Extracted checkout pricing utilities.
- Extracted checkout response mapper.
- Extracted checkout validators.
- Checkout service now coordinates promos, campaigns, tax, Stripe validation, and order creation.

Promos:

- Added promo constants, mappers, validators, repositories.
- Promo analytics mapping and mutation payload shaping are centralized.
- Promo lifecycle resolution activates scheduled promos and expires ended promos on promo reads/validation.

Campaigns:

- Added campaign constants, mappers, repositories, validators.
- Campaign service now orchestrates repository calls and mapper/utils.
- Campaign controller was converted to Express-style handlers.

Orders:

- Orders service now uses shared money normalization.
- Order mapper remains the source of response normalization for detailed order reads.

## 8. Data Ownership and Source-of-Truth Map

Product statuses:

- Database enum: `server/prisma/schema.prisma`, `ProductStatus`.
- Server constants: `server/src/domains/products/constants/products.constants.js`.
- Client admin constants: `client/src/domains/admin/constants/adminProducts.constants.js`.
- Client API normalization: `client/src/domains/products/api/products.api.js` converts Prisma enum values to lowercase hyphen values.

Selling modes:

- Database enum: `server/prisma/schema.prisma`, `SellingMode`.
- Client shared constants and behavior: `client/src/shared/constants/sellingMode.js`.
- Admin product options: `client/src/domains/admin/constants/adminProducts.constants.js`.
- Server mutation enum conversion: `server/src/domains/products/utils/products.utils.js`.

Variant sizes:

- Server constants: `server/src/domains/products/constants/products.constants.js`.
- Client admin constants: `client/src/domains/admin/constants/adminProducts.constants.js`.
- Product variant UI assumptions: `useProductVariants.js`, `ProductQuickView.vue`, `ProductSpotlightSection.vue`.

Price/currency formatting:

- Client display: `client/src/shared/utils/currency.js`.
- Server money rounding: `server/src/shared/utils/money.js`.
- Product prices in DB: integer cents in `ProductVariant.price`.
- Order/promo/campaign monetary totals in DB: floats.

Promo statuses and discount rules:

- Database enums: `PromoStatus`, `DiscountType`, `PromoType`.
- Server constants: `server/src/domains/promos/constants/promos.constants.js`.
- Server validation and discount calculation: `server/src/domains/promos/services/promos.service.js`.
- Client promo constants and client-side rules: `client/src/domains/promos/constants/promo.constants.js`, `client/src/domains/promos/utils/promo.rules.js`.

Campaign statuses and donation rules:

- Database enums: `CampaignStatus`, `CampaignDonationType`.
- Server constants and donation rules: `server/src/domains/campaigns/constants/campaigns.constants.js`, `server/src/domains/campaigns/utils/campaigns.utils.js`.
- Client admin constants: `client/src/domains/admin/constants/adminCampaigns.constants.js`.

Order statuses and timeline rules:

- Database enum: `OrderStatus`.
- Client admin constants/timeline: `client/src/domains/admin/constants/adminOrders.constants.js`.
- Client timeline utility styling: `client/src/domains/admin/utils/adminOrders.utils.js`.
- Server creates orders with status `PENDING` in `server/src/domains/orders/services/orders.service.js`.

Checkout pricing rules:

- Server authoritative pricing: `server/src/domains/checkout/utils/checkoutPricing.js`, `checkout.service.js`, and `shared/services/tax.service.js`.
- Client fallback/display calculation: `client/src/domains/checkout/utils/checkout.utils.js` and constants inside `CheckoutView.vue`.
- Risk: client fallback tax rate is `0.075`, while server tax service uses state-specific rates with default `0.08`.

Tax/shipping calculations:

- Shipping options live in `client/src/domains/checkout/views/CheckoutView.vue`.
- Server trusts submitted shipping price as part of `calculateShipping(shipping)`.
- Tax source is `server/src/shared/services/tax.service.js`; local estimates are hardcoded by state.

Stripe payment intent handling:

- Client publishable key: `client/src/domains/payments/services/stripe.js`.
- Payment intent creation call: `client/src/domains/payments/services/payment.service.js`.
- Server creation/retrieval/validation: `server/src/domains/payments/services/stripe.payment.js`.

Validation rules:

- Client admin product form: `client/src/domains/admin/validators/adminProductForm.validator.js`.
- Client promo form: `client/src/domains/promos/utils/promo.rules.js`.
- Server product payload: `server/src/domains/products/validators/products.validator.js`.
- Server promo type rules: `server/src/domains/promos/validators/promos.validator.js`.
- Server campaign name: `server/src/domains/campaigns/validators/campaigns.validator.js`.
- Server checkout required fields/payment preview: `server/src/domains/checkout/validators/checkout.validator.js`.

## 9. End-to-End Flow Maps

### Storefront Product Browsing

1. `HomeView.vue` calls `useProducts().loadProducts()` on mount.
2. `useProducts.js` calls `fetchProducts()` from `products.api.js`.
3. Client calls `GET /api/products`.
4. `server/src/domains/products/routes/products.routes.js` routes to `getAllProducts`.
5. `products.controller.js` calls `fetchAllProducts`.
6. `products.service.js` reads Prisma `Product` with variants.
7. `products.mapper.js` adds display `price` from first variant cents.
8. Client normalizes product status and selling mode to lowercase/hyphen values.
9. `HomeView.vue` filters products into storefront and coming-soon groups.

### Product Quick View

1. Product card emits `quick-view`.
2. `HomeView.vue` sets `selectedProduct` and opens `ProductQuickView.vue`.
3. `ProductQuickView.vue` uses `useProductVariants.js` and `shared/constants/sellingMode.js`.
4. User selects size and quantity.
5. `addProductToCart()` emits normalized product/variant/cart payload.

### Add to Cart

1. Product card, product spotlight, or quick view emits `add-to-cart`.
2. `HomeView.vue` calls `useCart().addToCart`.
3. `useCart.js` checks selected variant, selling mode, inventory availability, and quantity limits.
4. Cart is stored in `localStorage` under `doggy-ent-cart`.
5. `CartDrawer.vue` displays cart items and emits increase/decrease/remove actions back to `useCart`.

### Cart Drawer Updates

1. `CartDrawer.vue` receives cart state from `HomeView.vue`.
2. `CartItemCard.vue` emits quantity/remove actions.
3. `useCart.js` mutates cart and persists updates to `localStorage`.
4. `subtotal` and `itemCount` are computed in `useCart.js`.

### Checkout Preview

1. `CheckoutView.vue` loads cart from `localStorage`.
2. `useCheckoutPreview.js` schedules debounced previews when customer/cart/shipping/promo changes.
3. Client calls `POST /api/checkout/preview` through `checkout.api.js`.
4. Server `checkout.controller.js` calls `previewCheckout`.
5. `checkout.service.js` calculates subtotal and shipping, validates promo if present, previews campaign donations, calculates tax, and returns `pricing`, `promo`, and `campaigns`.
6. Checkout UI uses trusted server pricing when `checkoutPreviewResult.pricing` exists.

### Promo Validation

1. Checkout promo box calls `useCheckoutPromos().applyPromoCode()`.
2. Client calls `POST /api/promos/validate`.
3. `promos.routes.js` applies a rate limiter and calls `validatePromoCode`.
4. Promo service resolves lifecycle statuses, finds promo, checks active window/status/usage/customer/minimum subtotal, calculates discount, and returns valid/invalid result.

### Stripe and Payment Intent Flow

1. `CheckoutPaymentSection.vue` hosts `StripeElementsForm.vue`.
2. Stripe Elements form creates a payment intent with `POST /api/checkout/create-payment-intent`.
3. Server creates a Stripe PaymentIntent using `STRIPE_SECRET_KEY`.
4. Client confirms card payment.
5. Checkout composable sends completed `stripePaymentIntentId` to `POST /api/checkout`.
6. Server revalidates Stripe amount/currency/status before order creation.

### Order Creation

1. `POST /api/checkout` calls `createCheckout`.
2. Server recomputes preview.
3. Server validates required checkout fields and payment intent.
4. Server rejects reused Stripe payment intents.
5. Server calls `createNewOrder`.
6. Orders service normalizes line items and prices.
7. Products service decrements inventory by SKU.
8. Orders repository creates `Order` and nested `OrderItem` records.
9. If order create fails after decrement, orders service attempts inventory rollback.
10. If a promo was applied, checkout records promo usage after order creation.

### Order Success Page

1. Checkout success handler clears cart and promo state.
2. It navigates to `/order-success/:orderId`.
3. `OrderSuccessView.vue` displays the route param only.
4. Uncertainty: no code fetches full order details on the public success page.

### Admin Product Create/Edit/Delete

1. `AdminProductsView.vue` uses `useAdminProducts`.
2. Form state maps through `adminProductForm.mapper.js`.
3. Validation runs in `adminProductForm.validator.js`.
4. API calls go through `adminProducts.api.js` to `/api/products`.
5. Server product routes protect create/update/delete with `requireAdminAuth`.
6. Server validates payload, normalizes product, converts status/selling mode to Prisma enum style, writes product and variants.

### Admin Promo Create/Edit/Test/Analytics

1. `AdminPromosView.vue` uses `useAdminPromos`.
2. Promo form payload maps through `adminPromoForm.mapper.js` and promo rules normalize unique/referral/global constraints.
3. Create/update/delete/list/analytics call `client/src/domains/promos/api/promos.api.js`.
4. Server routes under `/api/admin/promos` require admin auth for CRUD and analytics.
5. Test promo calls public `/api/promos/validate`.
6. Analytics reads promo usage history and aggregate summary.
7. Risk: promo analytics repository currently orders by `createdAt` on `PromoUsage`, but schema field is `redeemedAt`.

### Admin Campaign Create/Edit/Status Display

1. `AdminCampaignsView.vue` uses `useAdminCampaigns`.
2. Campaign payload maps through `adminCampaignForm.mapper.js`.
3. Client calls `/api/admin/campaigns`.
4. Server campaigns routes require admin auth for list/get/create/update/delete.
5. Service normalizes input, generates slug, checks duplicate slug, and writes through repository.
6. Campaign status display uses `AdminCampaignStatusBadge.vue` and `adminCampaigns.utils.js`.

### Admin Order Dashboard and Order Detail

1. `AdminOrdersView.vue` uses `useAdminOrders`.
2. Client calls:
   - `GET /api/admin/orders`
   - `GET /api/admin/orders/stats`
3. Server orders controller reads orders/stats from repository.
4. Order cards link to `/admin/orders/:orderId`.
5. `AdminOrderDetailView.vue` fetches `GET /api/admin/orders/:orderId`.
6. Risk: detail view attempts `PATCH /api/admin/orders/:orderId/status`, but no server route exists for this patch endpoint.

## 10. API Endpoint Inventory

### Health

- Method/path: `GET /api/health`
- Handler: inline in `server/src/app.js`
- Response: `{ status: 'OK', message: 'Server is running' }`

### Products

- `GET /api/products`
  - Controller: `products.controller.js#getAllProducts`
  - Service: `products.service.js#fetchAllProducts`
  - DB: Prisma `Product.findMany({ include: { variants: true } })`
  - Response: array of products with variants and display `price`.
  - Client callers: `products.api.js`, `adminProducts.api.js`, `adminCampaigns.api.js`.

- `GET /api/products/:slug`
  - Controller: `getProductBySlug`
  - Service: `fetchProductBySlug`
  - DB: Prisma `Product.findUnique({ slug })`
  - Response: product object or 404 `{ message: 'Product not found.' }`
  - Client caller found: `products.api.js#fetchProductBySlug`; no route for product detail was found in router.

- `POST /api/products`
  - Auth: `requireAdminAuth`
  - Payload: product admin payload with name, shortDescription, category, status, image, variants.
  - Validator: `products.validator.js`
  - Response: created product.
  - Errors: 400 missing fields/variant prices; generic middleware for thrown errors.
  - Client caller: `adminProducts.api.js#createProduct`.

- `PUT /api/products/:id`
  - Auth: `requireAdminAuth`
  - Payload: same product payload.
  - Behavior: deletes existing variants and recreates variants.
  - Response: updated product or 404.
  - Client caller: `adminProducts.api.js#updateProduct`.

- `DELETE /api/products/:id`
  - Auth: `requireAdminAuth`
  - Behavior: deletes product; variants cascade.
  - Response: `{ message, deletedProduct }` or 404.
  - Client caller: `adminProducts.api.js#deleteProduct`.

### Checkout and Payments

- `POST /api/checkout/preview`
  - Controller: `checkout.controller.js#previewCheckoutController`
  - Service: `checkout.service.js#previewCheckout`
  - Payload: `{ cartItems, promoCode, customerEmail, customer, shipping }`
  - Response: `{ success: true, result: { pricing, promo, campaigns } }`
  - Errors: `{ success: false, message }`
  - Client caller: `checkout.api.js#submitCheckoutPreview`.

- `POST /api/checkout`
  - Controller: `createCheckoutController`
  - Service: `checkout.service.js#createCheckout`
  - Payload: `{ cartItems, promoCode, customerEmail, customer, shipping, stripePaymentIntentId }`
  - Response: `{ success: true, result: { pricing, promo, campaigns, order } }`
  - Errors: checkout validation, reused payment intent, Stripe mismatch, invalid promo, order/inventory errors.
  - Client caller: `checkout.api.js#submitCheckout`.

- `POST /api/checkout/create-payment-intent`
  - Controller: `payment.controller.js#createPaymentIntent`
  - Service: `stripe.payment.js#createStripePaymentIntent`
  - Payload: `{ items, amount }`
  - Response: `{ success: true, clientSecret, paymentIntentId }`
  - Errors: `{ success: false, message: 'Failed to create payment intent.' }`
  - Client caller: `payment.service.js#createPaymentIntent`.

### Promos

Mounted at both `/api/promos` and `/api/admin/promos`.

- `GET /api/admin/promos`
  - Auth: `requireAdminAuth`
  - Service: `getAllPromos`
  - DB: `Promo.findMany` excluding archived.
  - Response: array of promos.
  - Client caller: `promos.api.js#fetchPromos`.

- `GET /api/admin/promos/:promoId/analytics`
  - Auth: `requireAdminAuth`
  - Service: `getPromoAnalytics`
  - DB: promo usage history and aggregate summary.
  - Response: `{ promo, summary, usages }`
  - Client caller: `promos.api.js#fetchPromoAnalytics`.

- `GET /api/admin/promos/:promoId`
  - Auth: `requireAdminAuth`
  - Response: promo or 404.
  - Client caller: no direct client caller observed.

- `POST /api/admin/promos`
  - Auth: `requireAdminAuth`
  - Payload: promo fields: code, name, type, status, discountType, discountValue, minimumSubtotal, usage limits, assignment/referral fields, startsAt, endsAt.
  - Response: created promo.
  - Errors: duplicate promo 409; unique/referral validation 400.
  - Client caller: `promos.api.js#createPromo`.

- `PUT /api/admin/promos/:promoId`
  - Auth: `requireAdminAuth`
  - Response: updated promo.
  - Client caller: `promos.api.js#updatePromo`.

- `DELETE /api/admin/promos/:promoId`
  - Auth: `requireAdminAuth`
  - Behavior: soft archives promo.
  - Response: updated promo.
  - Client caller: `promos.api.js#deletePromo`.

- `POST /api/promos/validate`
  - Auth: public.
  - Rate limit: 30 per 15 minutes.
  - Payload: `{ code, customerEmail, cart: { items, subtotal } }`
  - Response valid: `{ valid: true, code, discountAmount, referralOwnerName, assignedCustomerEmail, message }`
  - Response invalid: route returns HTTP 400 with `{ valid: false, message, discountAmount: 0 }`
  - Client callers: `useCheckoutPromos.js`, `useAdminPromos.js` promo tester.

### Campaigns

Mounted at both `/api/campaigns` and `/api/admin/campaigns`.

- `GET /api/admin/campaigns`
  - Auth: `requireAdminAuth`
  - Response: `{ campaigns }`
  - Client caller: `campaigns.api.js#getCampaigns`.

- `POST /api/campaigns/preview`
  - Auth: public.
  - Payload: `{ cartItems }`
  - Response: `{ campaigns: preview[] }`
  - Client callers: `campaigns.api.js#previewCampaigns`, checkout preview flow.

- `GET /api/admin/campaigns/:campaignId`
  - Auth: `requireAdminAuth`
  - Response: `{ campaign }` or 404.
  - Client caller: no direct client caller observed.

- `POST /api/admin/campaigns`
  - Auth: `requireAdminAuth`
  - Payload: name, description, status, donationTarget, donationType, donationValue, productIds, startsAt, endsAt.
  - Response: `{ campaign }`
  - Client caller: `campaigns.api.js#createCampaign`.

- `PUT /api/admin/campaigns/:campaignId`
  - Auth: `requireAdminAuth`
  - Response: `{ campaign }`
  - Client caller: `campaigns.api.js#updateCampaign`.

- `DELETE /api/admin/campaigns/:campaignId`
  - Auth: `requireAdminAuth`
  - Response: 204 with empty body.
  - Client caller: `campaigns.api.js#deleteCampaign`.

- `POST /api/campaigns/record-usage`
  - Auth: public.
  - Payload: `{ campaigns: [{ campaignId, matchedSubtotal, ... }] }`
  - Response: `{ success: true, updatedCampaigns }`
  - Client caller: `CheckoutView.vue` success handler through `campaigns.api.js#recordCampaignUsage`.
  - Risk: this is client-triggered after order success and is not part of the checkout transaction.

### Orders

- `GET /api/admin/orders`
  - Auth: currently none in `orders.routes.js`.
  - Controller: `orders.controller.js#getAdminOrders`
  - Response: array of orders.
  - Client caller: `adminOrders.api.js#fetchAdminOrders`.

- `GET /api/admin/orders/stats`
  - Auth: currently none.
  - Controller: `getAdminOrderStats`
  - Response: `{ totalOrders, pendingOrders, shippedOrders, deliveredOrders, totalRevenue }`
  - Client caller: `adminOrders.api.js#fetchAdminOrderStats`.
  - Mismatch: client default stats expects `paidOrders`, `fulfilledOrders`, `totalDonationGenerated`, but server returns `shippedOrders`, `deliveredOrders`, and no donation total.

- `GET /api/admin/orders/:orderId`
  - Auth: currently none.
  - Controller: `getAdminOrderById`
  - Response: mapped order with items or 404.
  - Client caller: `AdminOrderDetailView.vue`.

Missing but client attempts:

- `PATCH /api/admin/orders/:orderId/status`
  - Client attempts in `AdminOrderDetailView.vue#updateStatus`.
  - No server route found.

### Auth

- `POST /api/auth/login`
  - Rate limit: 10 per 15 minutes.
  - Payload: `{ email, password }`
  - Response: `{ success: true, admin, expiresAt }`, plus cookie.
  - Errors: 400 missing fields, 401 invalid credentials, 500 missing env/other.
  - Client caller: `AdminLoginView.vue`.

- `POST /api/auth/logout`
  - Clears in-memory session and cookie.
  - Response: `{ success: true }`
  - Client caller: `AdminDashboardView.vue`.

- `GET /api/auth/me`
  - Reads session cookie.
  - Response authenticated: `{ success: true, authenticated: true, admin }`
  - Response unauthenticated: 401 `{ success: false, authenticated: false }`
  - Client callers: router guard, `AdminDashboardView.vue`.

## 11. Environment Variables and Deployment Notes

Client env variables observed:

- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL` is the preferred deployed backend origin variable after the 2026-06-05 post-repair verification pass. It should be set in Vercel to the live backend origin only, without a trailing `/api`.
- `VITE_API_URL` is still accepted as a backwards-compatible fallback by `client/src/shared/api/http.js`, but new deployment setup should use `VITE_API_BASE_URL`.

Server env variables referenced in code:

- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `FRONTEND_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `STRIPE_SECRET_KEY`
- `TAX_PROVIDER`

Server `.env` keys observed by name:

- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `STRIPE_SECRET_KEY`
- `DATABASE_URL`

Important env notes:

- `server/src/app.js` accepts both `CLIENT_URL` and `FRONTEND_URL` for CORS. Deployment should set at least one of those to the Vercel frontend origin.
- Local `.env` files are used only for local development. Do not commit `.env`, `.env.local`, `.env.production`, or files containing real secret values.

Public vs private:

- Public client: `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_API_BASE_URL`.
- Private server: `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `STRIPE_SECRET_KEY`.
- Operational/server: `PORT`, `NODE_ENV`, `CLIENT_URL`, `FRONTEND_URL`, `TAX_PROVIDER`.

Deployment evidence:

- `client/vercel.json` now exists for the Vite frontend project root and rewrites non-API paths to `/index.html` for SPA fallback.
- No Railway config, Cloudflare config, Dockerfile, or Procfile was found in the audited repo.
- `server/package.json` start script now runs: `prisma migrate deploy && node src/server.js`.
- Product seeding is explicit through `npm run seed:products`; production startup does not run product seed scripts.

## 12. Build, Test, and Verification Commands

Client scripts:

- `npm run dev`
- `npm run build`
- `npm run preview`

Server scripts:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run seed:products`
- `npm run prisma:studio`
- `npm run prisma:migrate`
- `npm run prisma:generate`

Root `package.json` is empty and has no scripts.

Verification performed during this handoff:

- `cd client && npm run build`: passed.
- `cd server && npm run build`: passed; Prisma Client generated.
- `node --check server/src/app.js`: passed.
- Runtime import check `import('./server/src/app.js')`: passed.

Missing scripts:

- No client lint script found.
- No server lint script found.
- No automated test scripts found.

## 13. Launch Readiness Assessment

Not launch-ready yet.

High-priority blockers or risks:

1. Admin orders API lacks server-side auth.
2. Admin order detail tries to PATCH order status, but server does not expose the route.
3. Stripe PaymentIntent is created from client-provided amount before server trusted validation.
4. Promo analytics likely breaks due `createdAt` vs `redeemedAt` mismatch on `PromoUsage`.
5. Campaign usage is recorded by a separate client-side call after checkout success, not transactionally with order creation.
6. Server start script reseeds and deletes products on every production start if used as-is.
7. CORS env mismatch: code uses `FRONTEND_URL`, `.env` has `CLIENT_URL`.
8. Admin auth sessions are in-memory only.
9. Order stats response does not match all client stat fields.
10. No automated tests are present for checkout, payment, inventory, promo, or admin flows.

Medium-priority risks:

- Checkout client fallback tax rate differs from server tax rates.
- `/api/campaigns` and `/api/admin/campaigns` mount the same router, so public/admin routes are mixed under both prefixes.
- `/api/promos` and `/api/admin/promos` mount the same router, so public validate exists under both prefixes.
- Product mutations delete/recreate all variants on update.
- Product quick-view/product spotlight includes navigation to `/products/:slug`, but no product route was found in `client/src/app/router/index.js`.
- `OrderSuccessView.vue` displays only route param and does not fetch order details.
- `AdminHeader.vue` and `StripeCheckoutForm.vue` appear unused/empty.
- Server Prisma logs include `query`, `error`, and `warn`, which may be noisy in production.

## 14. Known Risks and Manual QA Checklist

Manual QA required before launch:

- Storefront:
  - Load home page with API reachable.
  - Verify product feed, filters, sorting, featured product, coming soon products.
  - Open product quick view for active and coming soon products.
  - Add active inventory-limited product to cart.
  - Add made-to-order/preorder product and verify quantity behavior.
  - Verify out-of-stock variant cannot be purchased.
  - Verify cart persists after reload and can remove/update items.

- Checkout:
  - Empty cart redirect/error behavior.
  - Required field validation.
  - Shipping option changes update server preview.
  - Server trusted preview appears in summary.
  - Client fallback totals match or gracefully update to server totals.
  - Stripe success path creates order.
  - Stripe mismatch path is handled safely.
  - Duplicate payment intent cannot create duplicate order.
  - Inventory decrements after successful order.
  - Inventory rollback happens if order creation fails after decrement.
  - Order success route displays expected reference.

- Promos:
  - Create global promo.
  - Create unique promo with assigned email.
  - Create referral promo with owner name.
  - Validate active promo in checkout.
  - Validate expired/draft/minimum subtotal/usage limit failures.
  - Verify promo usage recorded once per order.
  - Verify analytics modal loads usage history and summary.

- Campaigns:
  - Create active campaign tied to product IDs.
  - Preview campaign donation in checkout.
  - Complete order with campaign product.
  - Verify campaign usage stats update.
  - Verify failed client-side record usage behavior is acceptable.

- Admin:
  - Login/logout.
  - Route guard redirects unauthenticated users.
  - API rejects unauthenticated product/promo/campaign writes.
  - Add/edit/delete product.
  - Add/edit/delete campaign.
  - Add/edit/delete promo.
  - Load orders dashboard.
  - Load order detail.
  - Update order status after server endpoint is implemented.

- Deployment:
  - Verify production CORS with correct frontend URL env.
  - Verify `server/package.json` start script does not reseed/destructively reset products in production.
  - Verify secure cookies over HTTPS.
  - Verify Stripe live/test keys match environment.
  - Verify Prisma migrations apply against production database.

## 15. Current Git State and Recent Commits

Observed before creating this handoff:

- Branch: `dev-main`
- Working tree status: `AGENTS.md` was modified before this handoff task. This handoff adds `PROJECT_HANDOFF.md`.
- Recent commits:
  - `a7251ff Refactor server domain structure and shared helpers`
  - `4e5f648 Complete admin orders refactor`
  - `646a2b0 fixed admin, broken down to each component`
  - `8db911d udpated files`
  - `d1432d4 refactoring, lego building each component`
  - `24eb852 adding seeds`
  - `9dccda1 Track Prisma migrations`
  - `7c22b30 updated products url`

Files changed in latest completed server cleanup phase are represented in commit `a7251ff`, including:

- `server/src/app.js`
- `server/src/app/middleware/error.middleware.js`
- `server/src/domains/products/*`
- `server/src/domains/checkout/*`
- `server/src/domains/promos/*`
- `server/src/domains/campaigns/*`
- `server/src/domains/orders/services/orders.service.js`
- `server/src/shared/utils/money.js`
- `server/src/shared/utils/string.js`
- `server/src/shared/services/tax.service.js`

Uncertainty:

- The content and reason for the current `AGENTS.md` modification were not changed by this handoff and should be reviewed separately.

## 16. Dependency and Integration Map

Client dependencies:

- Vue renders UI and state.
- Vue Router handles routes and admin guard.
- Stripe.js handles card collection and confirmation.
- Vite proxies `/api` to `http://localhost:3000` in dev.
- Tailwind plugin provides styling.

Server dependencies:

- Express serves REST endpoints.
- Prisma Client reads/writes PostgreSQL.
- Stripe Node SDK creates/retrieves/validates PaymentIntents.
- bcryptjs verifies admin password.
- cookie-parser reads admin session cookie.
- express-rate-limit protects auth login and promo validation.

Core integration path:

Client `fetch` -> Vite proxy or deployed API -> Express route -> controller -> service -> repository/Prisma -> PostgreSQL -> mapper -> JSON response -> client composable/view.

Stripe integration path:

Client Stripe Elements -> server PaymentIntent creation -> Stripe confirmation -> server Stripe retrieval/validation -> order creation.

## 17. Important File Index

### Root and Config

- `AGENTS.md`: project instructions for handoff/refactor documentation.
- `PROJECT_HANDOFF.md`: this document.
- `README.md`: default Vue/Vite starter README, not project-specific.
- `client/vite.config.js`: aliases and dev proxy.
- `client/jsconfig.json`: editor alias paths.
- `client/package.json`: client scripts and deps.
- `server/package.json`: server scripts and deps.
- `server/prisma/schema.prisma`: database schema.
- `server/prisma/migrations/`: migration history.

### Client Storefront

- `client/src/domains/storefront/Home/HomeView.vue`: storefront orchestrator for product load, filtering, quick view, cart.
- `client/src/domains/storefront/Home/sections/ProductSpotlightSection.vue`: featured product display and add-to-cart.
- `client/src/domains/products/api/products.api.js`: product fetch and client normalization.
- `client/src/domains/products/composables/useProducts.js`: product loading and product grouping.
- `client/src/domains/products/composables/useProductFilters.js`: storefront filters/sort.
- `client/src/domains/products/composables/useProductVariants.js`: selected size and variant helpers.
- `client/src/domains/products/ProductCard/ProductCard.vue`: product card shell.
- `client/src/domains/products/ProductQuickView/ProductQuickView.vue`: modal product details and add-to-cart.
- `client/src/shared/constants/sellingMode.js`: client selling mode/inventory purchase rules.
- `client/src/shared/utils/currency.js`: client currency formatter.

### Client Cart and Checkout

- `client/src/domains/cart/composables/useCart.js`: cart state, localStorage persistence, quantity changes.
- `client/src/domains/cart/CartDrawer/CartDrawer.vue`: cart drawer UI.
- `client/src/domains/checkout/views/CheckoutView.vue`: checkout page orchestration.
- `client/src/domains/checkout/api/checkout.api.js`: preview/final checkout requests.
- `client/src/domains/checkout/composables/useCheckout.js`: payment/order submission state machine.
- `client/src/domains/checkout/composables/useCheckoutPreview.js`: debounced server preview.
- `client/src/domains/checkout/composables/useCheckoutPromos.js`: checkout promo application state.
- `client/src/domains/checkout/utils/checkout.utils.js`: client fallback pricing calculations.
- `client/src/domains/checkout/views/OrderSuccessView.vue`: post-checkout success UI.
- `client/src/domains/payments/components/StripeElementsForm.vue`: active Stripe card form.
- `client/src/domains/payments/services/payment.service.js`: creates PaymentIntent.
- `client/src/domains/payments/services/stripe.js`: loads Stripe publishable key.

### Client Admin

- `client/src/domains/admin/views/AdminDashboardView.vue`: admin landing/navigation.
- `client/src/domains/admin/views/AdminLoginView.vue`: admin sign-in.
- `client/src/domains/admin/views/AdminProductsView.vue`: product admin orchestration.
- `client/src/domains/admin/views/AdminPromosView.vue`: promo admin orchestration.
- `client/src/domains/admin/views/AdminCampaignsView.vue`: campaign admin orchestration.
- `client/src/domains/admin/views/AdminOrdersView.vue`: orders dashboard orchestration.
- `client/src/domains/admin/views/AdminOrderDetailView.vue`: order detail view; still has inline fetch and missing server patch dependency.
- `client/src/domains/admin/composables/useAdminProducts.js`: admin product state/business logic.
- `client/src/domains/admin/composables/useAdminPromos.js`: admin promo state/business logic.
- `client/src/domains/admin/composables/useAdminCampaigns.js`: admin campaign state/business logic.
- `client/src/domains/admin/composables/useAdminOrders.js`: admin orders grouping/filtering.
- `client/src/domains/admin/constants/*.constants.js`: admin UI statuses/options/groups.
- `client/src/domains/admin/mappers/*.mapper.js`: admin form payload mapping.
- `client/src/domains/admin/validators/adminProductForm.validator.js`: admin product validation.
- `client/src/domains/promos/api/promos.api.js`: promo CRUD, analytics, validation.
- `client/src/domains/campaigns/api/campaigns.api.js`: campaign CRUD, preview, record usage.

### Server Core

- `server/src/server.js`: loads env and starts HTTP server.
- `server/src/app.js`: Express app, CORS, route mounts, error middleware.
- `server/src/db/prisma.js`: Prisma singleton.
- `server/src/app/middleware/auth/requireAdminAuth.js`: admin API guard.
- `server/src/app/middleware/error.middleware.js`: generic JSON error response.
- `server/src/shared/utils/money.js`: server money rounding.
- `server/src/shared/utils/string.js`: shared string normalization.
- `server/src/shared/services/tax.service.js`: tax calculation.

### Server Domains

- `server/src/domains/products/routes/products.routes.js`: product endpoints.
- `server/src/domains/products/controllers/products.controller.js`: product request handlers.
- `server/src/domains/products/services/products.service.js`: product DB orchestration and inventory decrement.
- `server/src/domains/products/mappers/products.mapper.js`: product normalization/mutation data.
- `server/src/domains/products/constants/products.constants.js`: product sizes/defaults/status labels.
- `server/src/domains/products/validators/products.validator.js`: product payload validation.

- `server/src/domains/checkout/routes/checkout.routes.js`: checkout preview/final endpoints.
- `server/src/domains/checkout/controllers/checkout.controller.js`: checkout response envelope.
- `server/src/domains/checkout/services/checkout.service.js`: trusted checkout orchestration.
- `server/src/domains/checkout/utils/checkoutPricing.js`: subtotal/shipping/discount/donation calculations.
- `server/src/domains/checkout/validators/checkout.validator.js`: checkout required fields and payment preview rules.

- `server/src/domains/payments/routes/payment.routes.js`: create PaymentIntent endpoint.
- `server/src/domains/payments/controllers/payment.controller.js`: PaymentIntent request handler.
- `server/src/domains/payments/services/stripe.payment.js`: Stripe SDK integration and validation.

- `server/src/domains/orders/routes/orders.routes.js`: admin order list/stats/detail routes.
- `server/src/domains/orders/controllers/orders.controller.js`: order response handlers.
- `server/src/domains/orders/services/orders.service.js`: order creation and inventory rollback.
- `server/src/domains/orders/repositories/orders.repository.js`: Prisma order queries and creation.
- `server/src/domains/orders/mappers/orders.mapper.js`: order response normalization.

- `server/src/domains/promos/routes/promos.routes.js`: promo CRUD/analytics/validation routes.
- `server/src/domains/promos/services/promos.service.js`: promo lifecycle, validation, discount, usage.
- `server/src/domains/promos/repositories/promos.repository.js`: Prisma promo and usage queries.
- `server/src/domains/promos/constants/promos.constants.js`: promo statuses/types/discount constants.
- `server/src/domains/promos/mappers/promos.mapper.js`: promo analytics and mutation payloads.
- `server/src/domains/promos/validators/promos.validator.js`: unique/referral rules.

- `server/src/domains/campaigns/routes/campaigns.routes.js`: campaign CRUD/preview/record routes.
- `server/src/domains/campaigns/controllers/campaigns.controller.js`: campaign response handlers.
- `server/src/domains/campaigns/services/campaigns.service.js`: campaign orchestration.
- `server/src/domains/campaigns/repositories/campaigns.repository.js`: Prisma campaign queries/mutations.
- `server/src/domains/campaigns/constants/campaigns.constants.js`: campaign status/donation constants.
- `server/src/domains/campaigns/mappers/campaigns.mapper.js`: campaign input and preview mapping.
- `server/src/domains/campaigns/utils/campaigns.utils.js`: campaign active/donation rules.
- `server/src/domains/campaigns/validators/campaigns.validator.js`: campaign name validation.

- `server/src/domains/auth/routes/auth.routes.js`: login/logout/me endpoints.
- `server/src/domains/auth/services/auth.service.js`: env credentials, bcrypt, in-memory sessions.

## 18. Remaining Work Before Launch

Recommended order:

1. Secure admin orders API with `requireAdminAuth`.
2. Decide and implement order status update endpoints or remove the status update UI.
3. Fix promo usage analytics `createdAt` vs `redeemedAt`.
4. Move Stripe PaymentIntent amount creation to server-trusted pricing.
5. Make campaign usage recording part of checkout/order transaction or add server-side retry/idempotency.
6. Replace production `start` script seeding behavior with a safe deploy command.
7. Resolve `CLIENT_URL` vs `FRONTEND_URL`.
8. Persist admin sessions outside memory or document single-instance limitation.
9. Align order stats response with admin UI expectations.
10. Add automated tests for checkout, promos, campaigns, products, orders, and auth.
11. Continue cleanup of oversized files:
    - `client/src/domains/admin/components/AdminProductFormPanel.vue`
    - `server/src/domains/promos/services/promos.service.js`
    - `client/src/domains/checkout/views/CheckoutView.vue`
12. Remove or implement empty/stub files:
    - `client/src/domains/admin/components/AdminHeader.vue`
    - `client/src/domains/payments/components/StripeCheckoutForm.vue`
13. Add a product detail route or remove `router.push('/products/:slug')` behavior.
14. Decide whether campaign/admin public route sharing should be split into separate public and admin routers.
15. Add project-specific README/deployment docs.

## 19. Uncertainty Log

- No `.vscode/AGENTS.md` file exists on disk, even though the IDE tab list referenced it.
- No deployment platform config was found. Deployment target is unknown from code.
- No automated tests were found, so behavior is inferred from source and build checks only.
- No product detail route exists in `client/src/app/router/index.js`; product APIs include fetch-by-slug and UI has navigation calls, but the route is not present.
- Email confirmation is described in `OrderSuccessView.vue`, but no email sending integration was found.
- Donation amount per order is not stored on `Order`; campaign stats are separate aggregate counters.
- `server/src/generated/prisma/` exists, but current Prisma generator config does not point there. Its lifecycle is unclear.

## 20. Repair and Launch-Readiness Pass - 2026-06-05

This section documents the full repair pass requested after the Admin Cleanup and Server Structure Cleanup phases. It supersedes earlier launch-readiness notes where the same issue is listed as fixed below.

### Scope Audited

Evidence checked from code:

- Root instructions: `AGENTS.md`.
- Current project knowledge: `PROJECT_HANDOFF.md`.
- Client checkout, payments, admin orders, campaigns, and promos domains.
- Server checkout, payments, orders, products inventory, promos, campaigns, auth, app startup, Prisma schema, and package scripts.
- Environment examples and deployment-sensitive startup behavior.

No cosmetic refactors were performed in this pass. Changes were limited to verified launch blockers or direct support for those fixes.

### Confirmed Launch Blockers Fixed

1. Client-supplied Stripe amount was trusted during PaymentIntent creation.
   - Previous behavior: `StripeElementsForm.vue` sent a client-calculated `amount` to `payment.service.js`, and `payment.controller.js` used that amount to create the PaymentIntent.
   - Fix: `payment.controller.js` now recomputes trusted checkout pricing through `previewCheckout()` and creates the PaymentIntent from the server total. `stripe.payment.js` converts trusted dollar totals to cents internally.

2. Checkout payment form exposed the wrong method name.
   - Previous behavior: `CheckoutPaymentSection.vue` exposed `confirmPayment`, while `useCheckout.js` calls `submitPayment()`.
   - Fix: `CheckoutPaymentSection.vue` now exposes `submitPayment()` and delegates to `StripeElementsForm.vue`.

3. Checkout shipping price was client-trusted.
   - Previous behavior: `checkoutPricing.js` accepted `shipping.price` from the request.
   - Fix: shipping is now derived from server constants in `server/src/domains/checkout/constants/checkout.constants.js`; client price input is ignored for pricing.

4. Admin orders endpoints were not server-protected.
   - Previous behavior: `/api/admin/orders` mounted order routes without `requireAdminAuth`.
   - Fix: `server/src/domains/orders/routes/orders.routes.js` now applies `router.use(requireAdminAuth)`.

5. Admin order detail status updates called a missing endpoint.
   - Previous behavior: `AdminOrderDetailView.vue` patched `/api/admin/orders/:id/status`, but no server route existed.
   - Fix: added order status constants, validator, repository update, service update, controller handler, and route. Client order detail now uses `adminOrders.api.js` helpers.

6. Order creation idempotency was incomplete.
   - Previous behavior: duplicate Stripe PaymentIntent IDs were checked in application code only, with no database uniqueness guarantee.
   - Fix: `Order.stripePaymentIntentId` is now `@unique`; a Prisma migration creates the unique index. Checkout and order creation now return the existing order for the same payment intent when the customer email matches, and order creation handles unique constraint races.

7. Campaign usage could be client-spoofed.
   - Previous behavior: checkout success called public campaign usage recording from the client.
   - Fix: campaign usage is recorded server-side from trusted checkout preview after order creation. The old `/api/campaigns/record-usage` route now requires admin authentication.

8. Promo analytics queried a Prisma field that does not exist.
   - Previous behavior: promo usage history ordered by `createdAt`, but `PromoUsage` has `redeemedAt`.
   - Fix: repository ordering now uses `redeemedAt`; mapper exposes both `redeemedAt` and compatibility `createdAt` values from `redeemedAt`.

9. Production startup could reseed and delete product data.
   - Previous behavior: `server/package.json` `start` ran the product seed script, and the seed deletes/recreates products.
   - Fix: production start now runs `prisma migrate deploy && node src/server.js`. Product seeding remains available only through the explicit `seed:products` script.

10. Environment documentation and CORS variable names were inconsistent.
    - Previous behavior: server code used `FRONTEND_URL`; existing env usage also referenced `CLIENT_URL`; no `.env.example` files existed.
    - Fix: CORS accepts both `FRONTEND_URL` and `CLIENT_URL`. A later post-repair pass removed the temporary `.env.example` files because this project documents deployment variable names in `PROJECT_HANDOFF.md` instead.

11. Admin order stats and filters did not match server data.
    - Previous behavior: client expected `paidOrders`, `fulfilledOrders`, `totalDonationGenerated`, and payment/fulfillment status fields that were not returned on order objects.
    - Fix: server stats now include client-compatible stat fields. Client order filters now use actual order statuses and no longer filter on nonexistent `paymentStatus` or `fulfillmentStatus`.

12. Dead duplicate checkout/payment component existed.
    - Previous behavior: `StripeCheckoutForm.vue` was an unused stub.
    - Fix: removed the unused stub component.

### Files Changed in This Repair Pass

Client:

- `client/src/domains/admin/api/adminOrders.api.js`: added order detail and order status update API helpers.
- `client/src/domains/admin/composables/useAdminOrders.js`: removed filtering against nonexistent order fields.
- `client/src/domains/admin/constants/adminOrders.constants.js`: aligned filter statuses with server order statuses.
- `client/src/domains/admin/views/AdminOrderDetailView.vue`: uses admin orders API helpers.
- `client/src/domains/campaigns/api/campaigns.api.js`: removed public campaign usage recording helper.
- `client/src/domains/checkout/Checkout/CheckoutPaymentSection.vue`: passes trusted pricing inputs to Stripe form and exposes `submitPayment()`.
- `client/src/domains/checkout/views/CheckoutView.vue`: passes customer, promo, and shipping method data into the payment form; removed client-side campaign usage recording.
- `client/src/domains/payments/components/StripeElementsForm.vue`: requests PaymentIntents with checkout inputs instead of a client-calculated amount.
- `client/src/domains/payments/components/StripeCheckoutForm.vue`: removed unused stub.
- `client/src/domains/payments/services/payment.service.js`: sends cart, promo, customer, and shipping data to PaymentIntent creation endpoint.

Server:

- `server/package.json`: removed destructive product seeding from production `start`.
- `server/prisma/schema.prisma`: made `Order.stripePaymentIntentId` unique.
- `server/prisma/migrations/20260605000000_unique_order_payment_intent/migration.sql`: adds the unique index for Stripe payment intent idempotency.
- `server/src/app.js`: accepts both `FRONTEND_URL` and `CLIENT_URL` for CORS.
- `server/src/domains/campaigns/routes/campaigns.routes.js`: protects campaign usage recording with admin auth.
- `server/src/domains/checkout/constants/checkout.constants.js`: new server-owned shipping options.
- `server/src/domains/checkout/services/checkout.service.js`: idempotent checkout handling, trusted campaign usage recording, and existing-order return for repeated payment intents.
- `server/src/domains/checkout/utils/checkoutPricing.js`: derives shipping price from server constants.
- `server/src/domains/orders/constants/orders.constants.js`: new source of truth for order statuses.
- `server/src/domains/orders/validators/orders.validator.js`: validates order status updates.
- `server/src/domains/orders/controllers/orders.controller.js`: added order status update controller.
- `server/src/domains/orders/repositories/orders.repository.js`: added status update and payment-intent lookup helpers; aligned order stats.
- `server/src/domains/orders/routes/orders.routes.js`: applies admin auth and exposes `PATCH /:orderId/status`.
- `server/src/domains/orders/services/orders.service.js`: idempotent order creation and status update orchestration.
- `server/src/domains/payments/controllers/payment.controller.js`: creates PaymentIntents from trusted server checkout preview totals.
- `server/src/domains/payments/services/stripe.payment.js`: normalizes trusted totals to Stripe cent amounts.
- `server/src/domains/promos/mappers/promos.mapper.js`: maps promo usage timestamps from `redeemedAt`.
- `server/src/domains/promos/repositories/promos.repository.js`: queries promo usage history by `redeemedAt`.

### Verification Performed

Passed:

- `cd server && npm run build`
  - Runs `prisma generate`.
- `cd client && npm run build`
  - Vite production build completed successfully.
- Server syntax checks:
  - `node --check server/src/app.js`
  - `node --check server/src/domains/checkout/services/checkout.service.js`
  - `node --check server/src/domains/payments/controllers/payment.controller.js`
  - `node --check server/src/domains/payments/services/stripe.payment.js`
  - `node --check server/src/domains/orders/controllers/orders.controller.js`
  - `node --check server/src/domains/orders/services/orders.service.js`
  - `node --check server/src/domains/orders/repositories/orders.repository.js`
  - `node --check server/src/domains/promos/repositories/promos.repository.js`
- Server import smoke check:
  - `node -e "import('./server/src/app.js').then(() => console.log('app import ok'))"`

Not available:

- No client lint script exists in `client/package.json`.
- No server lint script exists in `server/package.json`.
- No client or server test script exists in the package files inspected during this repair pass.

### Remaining Risks and Unverified Areas

- Promo usage is still recorded after order creation because the current schema requires `orderId` for the `PromoUsage` unique record. If promo usage persistence fails after a successful order, checkout avoids showing the customer a failure after payment/order creation, but promo counters can underreport. A full fix likely needs a transaction/reservation design.
- Promo usage limit checks can still race under concurrent checkout attempts because usage count validation and usage creation are not locked together before payment. Database uniqueness prevents duplicate usage for one order, but not all concurrent max-usage edge cases.
- Campaign usage is now server-side and no longer client-spoofable, but there is no per-order campaign usage table or unique campaign/order record. Aggregate campaign stats can underreport if the post-order campaign update fails.
- The new Stripe PaymentIntent unique migration can fail on a production database that already contains duplicate non-null `stripePaymentIntentId` values. Run a duplicate preflight query before production migration.
- Admin sessions are still in memory. This is a launch risk for multi-instance deployments, server restarts, and horizontal scaling.
- Most client API calls use relative `/api` paths and rely on same-origin deployment or Vite dev proxy. `VITE_API_URL` is documented but not consistently used across all domains.
- Product detail navigation appears to push `/products/:slug`, but no matching route was found in the router during handoff generation.
- Order success still uses the route order id display and does not fetch a full order confirmation from the server.
- No automated tests exist for checkout, Stripe, promos, campaigns, admin auth, or inventory rollback. Verification is build/syntax/import based plus source audit.
- Email confirmation copy exists in the UI, but no email provider integration was found.

### Manual QA Checklist Before Launch

- Admin auth:
  - Verify unauthenticated requests to `/api/admin/orders`, `/api/admin/promos`, and `/api/admin/campaigns` return unauthorized.
  - Verify admin login, `/api/auth/me`, logout, and protected route reload behavior.

- Checkout and Stripe:
  - Complete a successful Stripe test card checkout from cart to `/order-success/:orderId`.
  - Tamper with client subtotal/shipping/amount in dev tools and confirm the PaymentIntent still uses server pricing.
  - Re-submit the same succeeded `stripePaymentIntentId` and confirm the existing order is returned instead of creating a duplicate.
  - Attempt same payment intent with a different customer email and confirm it is rejected.
  - Verify failed, canceled, or unpaid PaymentIntents do not create orders or decrement inventory.

- Inventory:
  - Buy an inventory-limited product and confirm variant stock decreases once.
  - Attempt a checkout quantity above stock and confirm checkout fails before payment/order.
  - Confirm duplicate/retry submissions do not decrement inventory twice.

- Promos:
  - Apply valid fixed and percent promos and confirm discount totals match admin promo rules.
  - Try expired, disabled, archived, usage-exhausted, and minimum-order promos.
  - Confirm promo analytics show redemption timestamps and usage counts after checkout.
  - Repeat/retry a payment intent with a promo and confirm usage is not double-counted.

- Campaigns:
  - Checkout with a product in an active campaign and confirm donation/revenue/order counters update from the server.
  - Confirm public clients cannot call `/api/campaigns/record-usage` without auth.
  - Verify paused, draft, ended, and archived campaigns do not contribute donation totals.

- Admin orders:
  - Load the orders dashboard and verify stats/cards match real orders.
  - Filter by each status option.
  - Open order detail and update order status through every allowed status.

- Deployment:
  - Run Prisma duplicate preflight for `stripePaymentIntentId` before migration.
  - Verify `server/.env` has `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `STRIPE_SECRET_KEY`, and the correct frontend origin.
  - Verify `client/.env` has the intended `VITE_STRIPE_PUBLISHABLE_KEY`.
  - Confirm production `npm start` does not run seed scripts.

Suggested duplicate preflight query before applying the new production migration:

```sql
SELECT "stripePaymentIntentId", COUNT(*)
FROM "Order"
WHERE "stripePaymentIntentId" IS NOT NULL
GROUP BY "stripePaymentIntentId"
HAVING COUNT(*) > 1;
```

### Current Git State at Repair Handoff

Observed before the final handoff update:

- Branch: `dev-main`.
- `AGENTS.md` was already modified before this repair pass and was not intentionally changed by the repair pass.
- `PROJECT_HANDOFF.md` exists as an untracked handoff document and was updated by this repair pass.
- Repair pass application files listed above are modified or newly added and need review.

### Recommended Next Phase

The next safest phase is a focused QA and production hardening pass:

1. Run the manual QA checklist against a real local database and Stripe test keys.
2. Add automated tests for checkout pricing, PaymentIntent creation, idempotent order creation, promo validation/usage, campaign usage, and admin auth.
3. Decide whether to add persistent admin sessions before launch.
4. Decide whether promo and campaign usage should move into a stronger transactional or per-order usage model.

## 21. Post-Repair Verification and Deployment 404 Fix - 2026-06-05

This section reconciles the interrupted repair run and documents the follow-up deployment fixes.

### Interrupted Run Reconciliation

Observed at the start of this pass:

- `git status` showed only `AGENTS.md` modified.
- `git diff --stat` showed only `AGENTS.md`.
- `git diff --name-status` showed only `M doggy_ent_vue/AGENTS.md`.
- Despite that clean working tree, the high-risk repair code described in the previous report was present in `HEAD` and verified from source.

Conclusion:

- The previous UI checklist was incomplete, but the actual repository already contained the core repair-pass code in the high-risk server/client files.
- The old final report was partially stale because it described `client/.env.example` and `server/.env.example` as desired outputs. Current project policy says those files should not exist, so they were removed in this pass.

### Verified From Current Code

Already correct in the current repository:

- Stripe PaymentIntent creation no longer trusts a client-submitted amount. `server/src/domains/payments/controllers/payment.controller.js` calls `previewCheckout()` and uses trusted server pricing.
- Checkout preview, PaymentIntent creation, and order creation use the same server checkout pricing path.
- Shipping price cannot be spoofed by the client. `server/src/domains/checkout/utils/checkoutPricing.js` derives shipping from server-owned constants.
- `Order.stripePaymentIntentId` is unique in `server/prisma/schema.prisma`, and the local migration exists at `server/prisma/migrations/20260605000000_unique_order_payment_intent/migration.sql`.
- Local Prisma status reported the local database schema is up to date.
- Local `prisma generate` completed through `npm run build` in `server/`.
- Admin order routes apply `requireAdminAuth`.
- Admin order status update client and server endpoints match.
- Production server `npm start` does not run product seed scripts.
- Promo analytics uses `redeemedAt` rather than nonexistent `createdAt`.
- Campaign usage recording is server-side and the old public record usage route is auth-protected.

### Incomplete or Broken Before This Pass

Confirmed deployment blockers:

- Deployed checkout failed because the Vercel frontend called relative `/api/...` paths on `doggy-ent.vercel.app`. Locally this worked only because `client/vite.config.js` proxies `/api` to `http://localhost:3000`.
- Deployed direct `/admin` returned Vercel `404: NOT_FOUND` because the static Vite SPA did not have a Vercel fallback to `/index.html`.
- Production admin auth cookies used `SameSite=strict`, which blocks cross-site Vercel frontend to Railway backend cookie sessions even when the browser request uses `credentials: include`.
- API response parsing assumed JSON in several places, so Vercel HTML 404 pages could surface as confusing checkout/payment errors.
- `client/.env.example` and `server/.env.example` existed, but project policy says this repo should not keep `.env.example` files.

### Fixes Made in This Pass

Client deployment/API routing:

- Added `client/src/shared/api/http.js`.
  - `buildApiUrl(path)` uses `VITE_API_BASE_URL` when provided, falling back to `VITE_API_URL` for compatibility and then to relative `/api` paths for local Vite proxy development.
  - `fetchApi(path, options)` sends credentialed requests so admin auth can work across the deployed frontend/backend boundary.
  - `parseJsonResponse(response, fallbackMessage)` detects non-JSON responses, including Vercel HTML 404 pages, and raises a clear deployment/API routing error.

- Updated these client API/auth callers to use the shared helper:
  - `client/src/domains/products/api/products.api.js`
  - `client/src/domains/admin/api/adminProducts.api.js`
  - `client/src/domains/admin/api/adminCampaigns.api.js`
  - `client/src/domains/admin/api/adminOrders.api.js`
  - `client/src/domains/checkout/api/checkout.api.js`
  - `client/src/domains/payments/services/payment.service.js`
  - `client/src/domains/promos/api/promos.api.js`
  - `client/src/domains/campaigns/api/campaigns.api.js`
  - `client/src/domains/admin/views/AdminLoginView.vue`
  - `client/src/domains/admin/views/AdminDashboardView.vue`
  - `client/src/app/router/index.js`

Vercel SPA fallback:

- Added `client/vercel.json` at the Vite frontend project root:

```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

- The rewrite intentionally excludes `/api/...` so API mistakes are not silently routed to `index.html`.
- Based on the local repo, `client/` is the actual frontend/Vite project root. No root-level Vercel config or `.vercel/project.json` was found.

Server auth deployment:

- Updated `server/src/domains/auth/services/auth.service.js` so production admin session cookies use `SameSite=None` with `secure: true`. This supports a Vercel frontend calling a Railway backend with `credentials: include`.

Environment files:

- Removed `client/.env.example`.
- Removed `server/.env.example`.
- Required variables are documented here by name only; no secret values were copied from local `.env` files.

### Required Deployment Variables

Set in Vercel for the client:

- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for the intended Stripe environment.
- `VITE_API_BASE_URL`: live backend origin, for example the Railway service origin. Do not include a trailing `/api`; the client code appends `/api/...`.

Set in Railway for the server:

- `PORT`: server port, usually provided by Railway.
- `NODE_ENV`: use `production` for deployed production.
- `DATABASE_URL`: Railway Postgres connection string.
- `CLIENT_URL`: Vercel frontend origin for CORS.
- `FRONTEND_URL`: also accepted by server CORS; set this to the same frontend origin if using that naming convention.
- `ADMIN_EMAIL`: admin login email.
- `ADMIN_PASSWORD_HASH`: bcrypt hash for the admin password.
- `STRIPE_SECRET_KEY`: Stripe secret key for the intended Stripe environment.
- `TAX_PROVIDER`: optional; defaults to local tax calculation if unset.

No values should be committed to the repository.

### Railway Migration Status and Required Steps

Verified locally:

- `server/prisma/migrations/20260605000000_unique_order_payment_intent/migration.sql` exists.
- `server/prisma/schema.prisma` has `stripePaymentIntentId String? @unique`.
- Local `npx prisma migrate status` reported: `Database schema is up to date!`
- Local `npm run build` in `server/` completed `prisma generate`.

Not verified:

- Railway migration status is still unknown from this local pass.
- No Railway migration was applied automatically.

Required Railway preflight before deploying the unique constraint migration:

```sql
SELECT "stripePaymentIntentId", COUNT(*)
FROM "Order"
WHERE "stripePaymentIntentId" IS NOT NULL
GROUP BY "stripePaymentIntentId"
HAVING COUNT(*) > 1;
```

If the preflight returns no rows and the target database is confirmed to be the intended Railway database, deploy migrations from the server project:

```bash
cd server
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
```

Do not run `prisma migrate reset` on Railway or any shared database.

### Manual Redeploy Steps

1. Set Vercel `VITE_API_BASE_URL` to the live backend origin, without `/api`.
2. Set Vercel `VITE_STRIPE_PUBLISHABLE_KEY`.
3. Set Railway `CLIENT_URL` or `FRONTEND_URL` to the Vercel frontend origin.
4. Confirm Railway has `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `STRIPE_SECRET_KEY`, `NODE_ENV`, and `PORT`.
5. Verify Railway migration status and run the duplicate preflight before `npx prisma migrate deploy`.
6. Redeploy Railway after any server env or migration changes.
7. Redeploy Vercel after setting `VITE_API_BASE_URL`, because Vite bakes public env variables at build time.
8. Manually test:
   - `/`
   - `/checkout`
   - `/admin`
   - `/admin/login?redirect=/admin`
   - `/order-success/test-route-check`
   - checkout preview, promo validation, campaign preview, PaymentIntent creation, and final checkout.

### Verification Commands and Results

Passed:

```bash
git status
```

Result at start: only `AGENTS.md` was modified.

```bash
git diff --stat
```

Result at start: only `AGENTS.md`.

```bash
git diff --name-status
```

Result at start: only `M doggy_ent_vue/AGENTS.md`.

```bash
cd server
npx prisma migrate status
```

Result: `Database schema is up to date!` for the local `localhost:5432` database.

```bash
cd client
npm run build
```

Result: passed.

```bash
cd server
npm run build
```

Result: passed and generated Prisma Client.

```bash
cd server
node --check src/app.js
node --check src/domains/auth/services/auth.service.js
```

Result: passed.

```bash
node -e "import('./server/src/app.js').then(() => console.log('app import ok'))"
```

Result: `app import ok`.

```bash
cd client
VITE_API_BASE_URL=https://api.example.test npm run build
rg -o "https://api\\.example\\.test|localhost:3000|doggy-ent\\.vercel\\.app" dist
```

Result: build passed and the dist bundle contained the placeholder API origin. No `localhost:3000` or `doggy-ent.vercel.app` API origin was found.

Not available:

- No client lint script exists.
- No server lint script exists.
- No client or server test script exists.

### Remaining Risks

- Railway migration status must still be verified against the actual Railway database before production deploy.
- Cross-site admin cookies now use `SameSite=None; Secure`, but admin sessions are still stored in memory and will reset on server restart or fail across multiple server instances.
- Promo usage and campaign usage still have the aggregate/idempotency limitations described in section 20.
- Deployed checkout needs manual QA with real Vercel and Railway env variables after redeploy.
- The client still supports `VITE_API_URL` as a fallback for compatibility, but deployment docs should prefer `VITE_API_BASE_URL`.

### Current Working Tree Safety

The local edits from this pass are focused and safe for commit review after human inspection:

- They fix verified Vercel API 404 behavior, SPA direct-route 404 behavior, cross-origin admin cookie behavior, and stale env example files.
- They do not redesign UX.
- They do not apply Railway migrations.
- They do not expose local `.env` secret values.
- `AGENTS.md` remains modified from before this pass and should be reviewed as a separate instruction-file change.

## 22. Admin Auth Session Stabilization - 2026-06-05

This section documents the follow-up admin auth repair after checkout, Vercel routing, Stripe payments, order creation, and Railway persistence were verified working.

### Verified Deployed Symptom

Reported verified state:

- Vercel storefront loads.
- Vercel SPA routing works.
- Checkout works on Vercel.
- Stripe test payments succeed.
- Orders are created in Railway and appear in the Railway database.
- Order success page works.
- The unique Stripe payment intent migration is applied on Railway.
- `/admin` loads on Vercel.
- Admin login accepts the correct credentials.
- Local admin login works.

Broken deployed behavior:

- Vercel admin login showed a success message but did not reach a usable dashboard session.
- Browser/network showed `401` from Railway `/api/auth/me`.

### Root Cause

The credentials path was working, but the session validation path was fragile for Vercel to Railway deployment.

From source:

- `POST /api/auth/login` created a session id and stored it in a process-local `Map` in `server/src/domains/auth/services/auth.service.js`.
- `GET /api/auth/me` only authenticated if the browser sent `doggy_admin_session` and that id still existed in the same process-local `Map`.
- In Railway/deployed environments, a process restart or a different instance can lose that in-memory session even though login returned success.
- Cross-site cookie behavior was also tied to `NODE_ENV === 'production'`, so a deployed frontend origin with a mis-set or unexpected `NODE_ENV` could produce local-style cookies that are not usable for Vercel to Railway requests.
- The login view redirected to `/admin` after login success before proving `/api/auth/me` recognized the new session.

The observable result is exactly the reported pattern: credentials are accepted, then the next `/api/auth/me` request returns `401`.

### Fix

Server session stability:

- `server/src/domains/auth/services/auth.service.js` now issues a signed, expiring admin session token in the existing `doggy_admin_session` cookie.
- `/api/auth/me` can validate that signed token without relying on the process-local `Map`, so the session survives Railway process restarts and multi-instance routing for the token lifetime.
- The old in-memory lookup remains as a fallback for older local session ids during the transition.
- The signing key uses `ADMIN_SESSION_SECRET` when present, otherwise `ADMIN_PASSWORD_HASH`. `ADMIN_SESSION_SECRET` is recommended for Railway but not required for this fix to work.

Cookie attributes:

- Deployed cross-site cookies now use `SameSite=None` and `Secure` when either `NODE_ENV=production` or a non-local `FRONTEND_URL` / `CLIENT_URL` is configured.
- Local development with localhost frontend origins continues to use `SameSite=Lax` and non-secure cookies.
- Cookies remain `HttpOnly`, use path `/`, and keep the existing 8-hour TTL.

CORS:

- `server/src/app.js` now normalizes `FRONTEND_URL` and `CLIENT_URL` origins by trimming whitespace and trailing slashes.
- It also supports comma-separated origins for safer deployment configuration.
- CORS still uses explicit allowed origins and `credentials: true`; it does not use a wildcard origin.

Client login flow:

- `client/src/domains/admin/views/AdminLoginView.vue` now calls `/api/auth/me` immediately after successful login.
- The app redirects only after the server confirms the admin session is authenticated.
- The login page now respects the existing `redirect` query parameter, defaulting to `/admin`.

### Auth Flow Verification From Code

Expected deployed flow after redeploy:

1. Vercel login form posts to Railway `POST /api/auth/login` through the shared API helper.
2. Request includes credentials mode.
3. Railway validates `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`.
4. Railway returns `Set-Cookie: doggy_admin_session=...; HttpOnly; Secure; SameSite=None; Path=/`.
5. The login page immediately calls Railway `GET /api/auth/me`.
6. Browser sends the Railway cookie back to the Railway origin.
7. Server verifies the signed token and returns `{ authenticated: true }`.
8. Login page redirects to the query `redirect` path or `/admin`.
9. Router guard also calls `/api/auth/me`; the signed token validates again.
10. Admin dashboard loads.

### Required Environment Variables

Vercel:

- `VITE_API_URL`: currently present and supported by `client/src/shared/api/http.js`.
- `VITE_API_BASE_URL`: preferred long-term name for the Railway backend origin. If both are present, `VITE_API_BASE_URL` wins.
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key.

Railway:

- `NODE_ENV`: should be `production` for deployed production.
- `FRONTEND_URL`: currently present; must exactly represent the Vercel frontend origin. Trailing slash is now tolerated.
- `CLIENT_URL`: optional alias also supported by CORS and cookie deployment detection.
- `DATABASE_URL`: Railway Postgres connection string.
- `ADMIN_EMAIL`: admin credential email.
- `ADMIN_PASSWORD_HASH`: bcrypt hash for admin password and fallback session signing key.
- `ADMIN_SESSION_SECRET`: optional but recommended dedicated admin session signing secret.
- `STRIPE_SECRET_KEY`: Stripe secret key.
- `PORT`: usually provided by Railway.

No secret values should be committed or copied into docs.

### Verification Commands and Results

Passed:

```bash
cd server
node --input-type=module <deployed-style auth smoke script>
```

Result:

```json
{
  "loginStatus": 200,
  "loginSuccess": true,
  "hasHttpOnly": true,
  "hasSecure": true,
  "hasSameSiteNone": true,
  "hasPathRoot": true,
  "meStatus": 200,
  "meAuthenticated": true,
  "corsOrigin": "https://frontend.example.test",
  "corsCredentials": "true"
}
```

Passed:

```bash
cd server
node --input-type=module <local auth service smoke script>
```

Result:

```json
{
  "hasSessionToken": true,
  "tokenAuthenticates": true,
  "localSameSite": "lax",
  "localSecure": false
}
```

Passed:

```bash
cd client
npm run build
```

Result: Vite production build completed.

Passed:

```bash
cd server
npm run build
```

Result: Prisma Client generated.

Passed:

```bash
cd server
node --check src/app.js
node --check src/domains/auth/services/auth.service.js
node --check src/domains/auth/routes/auth.routes.js
node -e "import('./src/app.js').then(() => console.log('app import ok'))"
```

Result: syntax checks passed and app import printed `app import ok`.

Passed:

```bash
cd client
VITE_API_URL=https://api.example.test npm run build
rg -o "https://api\\.example\\.test|localhost:3000|localhost:5173|doggy-ent\\.vercel\\.app" dist
```

Result: build passed and the placeholder API origin was baked in when `VITE_API_URL` was supplied. The final normal build did not contain the placeholder origin, `localhost:3000`, or `doggy-ent.vercel.app`.

Not available:

- No client lint script exists.
- No server lint script exists.
- No client or server test script exists.

### Manual Redeploy Steps

1. Redeploy Railway with the updated server auth code.
2. Ensure Railway has `FRONTEND_URL` set to the Vercel frontend origin. `CLIENT_URL` may also be set but is not required if `FRONTEND_URL` is correct.
3. Optionally add Railway `ADMIN_SESSION_SECRET` as a dedicated signing secret.
4. Redeploy Vercel if the admin login client change or API env variables changed.
5. Confirm Vercel still has either `VITE_API_URL` or `VITE_API_BASE_URL` pointing to the Railway backend origin without a trailing `/api`.

### Manual QA Checklist

- Visit `/admin` directly on Vercel while logged out.
- Confirm redirect to `/admin/login?redirect=/admin`.
- Log in with admin credentials.
- Confirm the login request returns `Set-Cookie` for `doggy_admin_session` with `HttpOnly`, `Secure`, and `SameSite=None`.
- Confirm the immediate `/api/auth/me` request returns `200` and `{ authenticated: true }`.
- Confirm the app redirects to `/admin`.
- Refresh `/admin` and confirm the session remains valid.
- Open admin products, promos, campaigns, orders, and order detail pages.
- Log out and confirm `/api/auth/me` returns unauthenticated.
- Confirm checkout, Stripe payment, order creation, product browsing, promo validation, and campaign preview still work after redeploy.

### Remaining Risks

- This is still the custom admin auth system. Better Auth is the future Accounts + Loyalty phase, not part of this fix.
- Signed cookie sessions cannot be force-revoked globally without rotating `ADMIN_SESSION_SECRET` or `ADMIN_PASSWORD_HASH`; logout clears the browser cookie.
- Admin role modeling is still minimal and should be replaced by role/permission-aware auth during the future Better Auth migration.
- Deployed manual QA is still required because browser cookie policies and Railway/Vercel env values must be verified in the real deployment.

### Recommended Next Phase

After deployed admin auth is stable, run a narrow admin CRUD QA pass across products, promos, campaigns, orders, and order detail. Better Auth should wait until the later customer accounts and loyalty phase.

## 23. Superseded Temporary Local Admin Data Target Workflow - 2026-06-05

This section was intentionally replaced. It previously described a local frontend calling the Railway backend directly, which still causes cross-site admin cookie problems in Safari. Use section 24 instead: local client -> local backend -> selected database.

## 24. Corrected Temporary Local Backend Data Target Workflow - 2026-06-06

This section replaces the superseded section 23 workflow.

### Root Cause

The prior temporary Railway admin workflow used:

```text
local client/admin -> Railway backend -> Railway DB
```

That still makes the browser send admin auth cookies across sites from localhost to the Railway backend, which can fail in Safari. The corrected workflow keeps browser admin auth same-site/local by always sending admin CRUD requests to the local backend.

Correct temporary Railway DB workflow:

```text
local client/admin -> local backend -> Railway DB -> Vercel storefront sees changes
```

### Corrected Mode Table

| Mode | Client command | Server command | Browser API target | Server DB target | Badge |
| --- | --- | --- | --- | --- | --- |
| Fully local | `cd client && npm run dev:local` | `cd server && npm run dev:local` | local backend | local DB from `server/.env` | `LOCAL DATA TARGET` |
| Railway DB admin | `cd client && npm run dev:local` | `cd server && npm run dev:railway` | local backend | Railway DB from `server/.env.railway.local` | `RAILWAY DB TARGET` |

`client npm run dev:railway` remains a safe local-backend alias for compatibility, but the expected Railway DB admin workflow uses `client npm run dev:local` plus `server npm run dev:railway`.

### Scripts

Client scripts:

```json
{
  "dev:local": "VITE_ADMIN_DATA_TARGET=LOCAL VITE_API_BASE_URL=http://localhost:3000 VITE_API_URL=http://localhost:3000 vite --mode admin-local",
  "dev:railway": "VITE_ADMIN_DATA_TARGET=RAILWAY_DB VITE_API_BASE_URL=http://localhost:3000 VITE_API_URL=http://localhost:3000 vite --mode railway"
}
```

Both client scripts point browser requests to the local backend at `http://localhost:3000`.

Server scripts:

```json
{
  "dev:local": "DOGGY_SERVER_ENV_TARGET=LOCAL node --watch src/server.js",
  "dev:railway": "DOGGY_SERVER_ENV_TARGET=RAILWAY_DB DOGGY_SERVER_ENV_FILE=.env.railway.local node --watch src/server.js"
}
```

### Env Loading

Server env loading source of truth:

- `server/src/config/env.js`
- `server/src/server.js`

Behavior:

- Base env always loads from `server/.env`.
- Railway DB mode then loads `server/.env.railway.local` with override enabled.
- `server/.env` remains the normal local server -> local DB env and should not be overwritten or repurposed for Railway mode.
- `server/.env.railway.local` must contain `DATABASE_URL`; otherwise `npm run dev:railway` fails closed so it cannot accidentally use the local DB.

Required local-only server variable names for `server/.env.railway.local`:

```text
DATABASE_URL
FRONTEND_URL
ADMIN_EMAIL
ADMIN_PASSWORD_HASH
STRIPE_SECRET_KEY
ADMIN_SESSION_SECRET
```

`ADMIN_SESSION_SECRET` is optional but recommended.

Required client variable names are set by `npm run dev:local`; no Railway URL is needed in the browser for this corrected workflow.

### Gitignore / Secret Safety

`.gitignore` covers local-only env files:

```text
.env.local
.env.*.local
client/.env.railway.local
server/.env.railway.local
```

No `.env.example` files were created.

No real `DATABASE_URL`, admin hash, Stripe secret, Railway URL, or session secret should be documented or committed.

### Admin Badge

The dashboard badge is now server-informed:

- `client/src/domains/admin/components/AdminDataTargetBadge.vue` starts from the client startup fallback.
- It then calls local backend `GET /api/auth/data-target`.
- `server/src/domains/auth/routes/auth.routes.js` returns the authenticated server data target.
- `server/src/config/env.js` reports either `LOCAL DATA TARGET` or `RAILWAY DB TARGET`.

This means the badge reflects the local backend database target, not a browser-to-Railway API target.

### Verification Results

Initial required commands were run:

```bash
git status
git diff --stat
git diff --name-status
```

At the start of this pass, only `AGENTS.md` was modified.

Client script verification:

```bash
cd client
npm run dev:local -- --host 127.0.0.1 --port 5177 --strictPort
```

Result:

- Vite started in `admin-local` mode.
- Transformed client helper contained `VITE_ADMIN_DATA_TARGET=LOCAL`.
- Transformed client helper contained `http://localhost:3000`.
- It did not contain a placeholder Railway/backend origin.

```bash
cd client
npm run dev:railway -- --host 127.0.0.1 --port 5178 --strictPort
```

Result:

- Vite started in `railway` mode.
- Transformed client helper contained `VITE_ADMIN_DATA_TARGET=RAILWAY_DB`.
- Transformed client helper contained `http://localhost:3000`.
- It did not contain a placeholder Railway/backend origin.

Server env verification:

```bash
cd server
node --input-type=module <local env loader check>
```

Result:

```json
{
  "loadedTarget": "LOCAL",
  "reportedTarget": "LOCAL",
  "hasDatabaseUrl": true
}
```

```bash
cd server
node --input-type=module <railway env loader check>
```

Current result:

```json
{
  "railwayModeAccepted": false,
  "reason": "Railway DB mode requires DATABASE_URL in .env.railway.local so it cannot accidentally use the local database."
}
```

This is expected until `server/.env.railway.local` is populated with a Railway `DATABASE_URL`.

Placeholder override verification:

```bash
cd server
DOGGY_SERVER_ENV_TARGET=RAILWAY_DB DOGGY_SERVER_ENV_FILE=<temporary-placeholder-env> node --input-type=module <env loader check>
```

Result:

```json
{
  "loadedTarget": "RAILWAY_DB",
  "reportedTarget": "RAILWAY_DB",
  "hasDatabaseUrl": true,
  "isPlaceholderDatabase": true
}
```

Protected badge endpoint verification:

```bash
cd server
node --input-type=module <auth data-target smoke script>
```

Result:

```json
{
  "loginStatus": 200,
  "dataTargetStatus": 200,
  "dataTargetCode": "RAILWAY_DB",
  "dataTargetLabel": "RAILWAY DB TARGET"
}
```

Server script verification:

```bash
cd server
npm run dev:local
```

Result:

- Server started on port `3000`.

```bash
cd server
npm run dev:railway
```

Current result:

- Failed closed because `server/.env.railway.local` does not currently provide `DATABASE_URL`.
- This prevents accidental local DB writes while the server is labeled as Railway DB mode.

Build and syntax verification:

```bash
cd client
npm run build
```

Result: passed.

```bash
cd server
npm run build
```

Result: passed and generated Prisma Client.

```bash
cd server
node --check src/config/env.js
node --check src/server.js
node --check src/domains/auth/routes/auth.routes.js
node --check src/domains/auth/services/auth.service.js
node -e "import('./src/app.js').then(() => console.log('app import ok'))"
```

Result: passed.

### Manual Setup

Fully local:

```bash
cd server
npm run dev:local
```

```bash
cd client
npm run dev:local
```

Railway DB admin:

1. Populate local-only `server/.env.railway.local` with the required variable names listed above.
2. Start local backend in Railway DB mode:

```bash
cd server
npm run dev:railway
```

3. Start local client in local-backend mode:

```bash
cd client
npm run dev:local
```

### Manual QA Checklist

Fully local:

- Log in at local `/admin`.
- Confirm badge shows `LOCAL DATA TARGET`.
- Create or edit a harmless product/promo/campaign.
- Confirm it affects local DB only.

Railway DB admin:

- Log in at local `/admin`.
- Confirm browser network requests go to `http://localhost:3000/api/...`, not Railway backend.
- Confirm badge shows `RAILWAY DB TARGET`.
- Create or edit a small test product/promo/campaign.
- Confirm Railway DB changes are visible to the Vercel storefront.
- Confirm admin products, promos, campaigns, orders, and order detail still load.

### Remaining Risks

- `server/.env.railway.local` currently must be populated before Railway DB mode can start.
- This temporary workflow can modify Railway data from local admin; verify the badge before saving.
- This is still custom admin auth. Better Auth remains future Accounts + Loyalty work.
- Long-term preferred setup remains an owned domain plus API subdomain, then Better Auth for accounts, loyalty, roles, and permissions.

## 22. Storefront Interaction Repair And Architecture Docs Pass - 2026-06-06

### Scope

This pass focused on verified storefront interaction bugs, a narrow promo Railway DB admin repair, and full architecture/data-flow documentation. It did not redesign the storefront or admin UI, did not migrate auth to Better Auth, and did not commit or push.

### Initial Repository State Commands

Required commands were run before editing:

```bash
git status
git diff --stat
git diff --name-status
```

Observed state:

- Branch: `dev-main`.
- Existing uncommitted edits from prior local admin workflow work were present in `AGENTS.md`, `PROJECT_HANDOFF.md`, `client/package.json`, admin badge/API helper files, server auth/env files, and `server/src/config/`.
- This pass preserved those existing edits and added only focused storefront, promo, docs, and handoff changes.

### Bugs Fixed

Product card variant add-to-cart:

- Root cause: `client/src/domains/cart/composables/useCart.js` preferred `product.size` over the explicit `selectedSize` argument. Product card add-to-cart passes the selected card size separately, so a product object with a default/root size such as `18 oz` could override the user's selected `6 oz`.
- Fix: `useCart.addToCart(product, selectedSize)` now treats `selectedSize` as the source of truth before falling back to `product.size`.
- Fix: cart item price resolution now prefers the matched selected variant price before falling back to product-level price.
- Expected result: product-card `6 oz` adds `6 oz`; product-card `18 oz` adds `18 oz`; quick view remains correct because it already emits selected size.

Featured product click targets:

- Root cause: `client/src/domains/storefront/Home/sections/ProductSpotlightSection.vue` imported `useRouter`, defined `navigateToProduct()`, and attached click handlers/cursor styling to the featured image container and title.
- Fix: removed the router dependency, navigation function, click handlers, and clickable cursor/hover affordances from the featured image and title.
- Expected result: featured image/title are no longer clickable; size buttons and Add to Cart still work.

Promo Railway DB admin repair:

- Root cause: `server/src/domains/promos/repositories/promos.repository.js` sorted `Promo` rows by `redeemedAt`, but `redeemedAt` exists on `PromoUsage`, not `Promo`.
- Fix: promo list sorting now uses `Promo.updatedAt`.
- Root cause: promo admin date/time values could arrive as datetime-local strings such as `2026-06-05T11:00`; Prisma DateTime writes are safer when normalized.
- Fix: `server/src/domains/promos/services/promos.service.js` now normalizes optional `startsAt` and `endsAt` values to ISO strings and throws a `400` error for invalid date/time values.

### Architecture Docs Created

Created:

- `docs/architecture/README.md`: high-level system overview, mode table, source-of-truth locations, and doc index.
- `docs/architecture/data-flow.md`: end-to-end flows for product load, product card add-to-cart, quick view, featured product, checkout/payment, promos, campaigns, orders, Railway DB admin mode, and future Better Auth.
- `docs/architecture/file-map.md`: important file and folder inventory covering `client/src`, `server/src`, `server/prisma`, and root config/docs.
- `docs/architecture/database.md`: Prisma model ownership, relationships, migration notes, and data source modes.
- `docs/architecture/admin.md`: admin route architecture, auth, badge, temporary local/Railway DB workflow, env variable names, and QA checklist.
- `docs/architecture/auth-roadmap.md`: current custom admin auth, temporary local admin modes, same-site domain direction, and future Better Auth/customer accounts plan.

Mermaid diagrams included:

- Overall system architecture.
- Checkout/payment sequence.
- Local admin to local server to Railway DB.
- Future Better Auth/customer/admin account flow.

Existing older docs under `docs/architecture/diagram.md` and `docs/architecture/mockdiagram.md` were not removed or deeply audited during this pass.

### Verification Results

Client build:

```bash
cd client
npm run build
```

Result: passed. Vite built 152 modules and produced `dist/` assets.

Server build / Prisma generate:

```bash
cd server
npm run build
```

Result: passed. Prisma Client v6.16.2 generated successfully.

Server syntax checks:

```bash
cd server
node --check src/domains/promos/services/promos.service.js
node --check src/domains/promos/repositories/promos.repository.js
```

Result: passed.

Cart variant source-of-truth smoke:

```bash
cd client
node --input-type=module <cart variant source-of-truth smoke script>
```

Result: passed. The script verified:

- A product object with root `size: "18 oz"` plus selected card size `6 oz` adds `6 oz`.
- Product-card selected `18 oz` adds `18 oz`.
- Quick-view-style selected `6 oz` payload still adds `6 oz`.
- Cart price comes from the selected variant.

Docs Markdown/Mermaid checks:

```bash
node --input-type=module <architecture markdown fence check>
rg -n mermaid docs/architecture/README.md docs/architecture/data-flow.md docs/architecture/admin.md docs/architecture/auth-roadmap.md
```

Result: passed. All new architecture doc code fences are balanced, and Mermaid fences are present in the required docs.

Environment/secret hygiene:

```bash
find . -name '.env.example' -print
rg -n <secret-value-patterns> docs PROJECT_HANDOFF.md client/src server/src --glob '!server/src/generated/**'
```

Result:

- No `.env.example` files found.
- No secret-looking values found in deliverable docs/source. Only variable names and placeholder descriptions are documented.

Featured product source check:

```bash
rg -n "useRouter|navigateToProduct|@click=\"navigateToProduct\"|cursor-pointer.*featuredProduct|featuredProduct.*cursor-pointer" client/src/domains/storefront/Home/sections/ProductSpotlightSection.vue
```

Result: no matches, confirming the image/title navigation hook was removed.

Whitespace diff check:

```bash
git diff --check
```

Result: passed.

Lint scripts:

- No `lint` script is present in `client/package.json` or `server/package.json`; no lint command was invented.

### Remaining Risks And Unverified Areas

- Full browser manual QA is still required for product card `6 oz` and `18 oz`, quick view, featured Add to Cart, cart drawer display, and checkout preview because this pass used build plus a targeted source-of-truth smoke test rather than a live browser session.
- Promo create/edit against an actual Railway DB in local server Railway DB mode still needs manual QA with `server/.env.railway.local` populated; the repository fix addresses the verified schema/code mismatch and DateTime normalization.
- Checkout/payment flows built successfully but were not re-run end-to-end in Stripe during this pass.
- Better Auth remains future work. Current admin auth is still the custom session system.

### Manual QA Checklist

Storefront:

- Open storefront product grid.
- Select `6 oz` on a product card and click Add to Cart; confirm cart drawer shows `6 oz` and selected-variant price.
- Remove item.
- Select `18 oz` on the same product card and click Add to Cart; confirm cart drawer shows `18 oz` and selected-variant price.
- Repeat both checks from quick view.
- Confirm featured product image and title do not navigate or behave as clickable elements.
- Confirm featured size buttons still update price/stock label.
- Confirm featured Add to Cart still adds the selected variant.
- Continue to checkout and confirm preview totals match selected variants.

Railway DB admin promos:

- Start `cd server && npm run dev:railway` after configuring local-only `server/.env.railway.local`.
- Start `cd client && npm run dev:local`.
- Confirm admin badge says `RAILWAY DB TARGET`.
- Open admin promos.
- Create a promo with start/end date/time values.
- Edit the promo.
- Confirm no Prisma `redeemedAt` or invalid DateTime errors appear.
- Test promo validation through checkout preview if applicable.

### Next Recommended Step

Run the manual storefront and Railway DB admin QA checklist, then perform a final launch-readiness pass on checkout/payment in a real browser with Stripe test mode.

## 23. Order Completeness, Donation Traceability, Campaign Attribution, Success UX - 2026-06-06

### Scope

This pass fixed verified order/donation data gaps and improved the post-checkout success page. It did not rebuild checkout, redesign admin, migrate auth to Better Auth, commit, push, or expose secrets.

### Initial Commands

Required state checks were run before editing:

```bash
git status
git diff --stat
git diff --name-status
```

The working tree already contained uncommitted accepted work from prior admin/local workflow/storefront/docs passes. This pass preserved those edits.

### Root Causes Found

Admin order list donation showed `$0.00` because `AdminOrderCard.vue` hardcoded the donation display to `0`, and the server order response did not include an order-level donation amount.

Campaign/order attribution could not be answered from the old schema. `Campaign` only stored aggregate counters: `donationGenerated`, `revenueGenerated`, and `orderCount`. `Order` had no donation field, and there was no join/usage table between orders and campaigns. Existing aggregate counters were insufficient for “which orders contributed to which campaign,” especially after campaign product links change.

Admin order detail was too thin because it only rendered a small subset of the order response: raw id, status, items, subtotal, total, and basic customer fields.

The success page used the route parameter directly as the displayed reference and did not fetch order details. Checkout cleared the cart after success, so the `View Cart` button led to an empty or inappropriate post-checkout path.

### Schema Decision

A schema change was needed. The current schema could not safely persist order-to-campaign attribution.

Added model:

- `OrderCampaignUsage`

Fields:

- `orderId`
- `campaignId`
- `donationAmount`
- `eligibleSubtotal`
- `matchedProductIds`
- timestamps

Safety:

- `@@unique([orderId, campaignId])` prevents normal checkout retries from recording the same order/campaign contribution twice.
- Foreign keys cascade when an order or campaign is deleted.

Migration:

- `server/prisma/migrations/20260606000000_add_order_campaign_usage/migration.sql`

Local status:

- Applied locally with `npx prisma migrate dev`.
- `npx prisma migrate status` reported the local schema is up to date.

Railway status:

- Not applied automatically.
- Required Railway step: `cd server && npx prisma migrate deploy` after confirming the intended Railway database target.

Historical limitation:

- Existing orders created before this migration do not automatically gain attribution rows. They may have aggregate campaign stats without order-level traceability.

### Fixes Made

Server:

- `server/prisma/schema.prisma` now includes `OrderCampaignUsage` and relations from `Order` and `Campaign`.
- `server/src/domains/checkout/services/checkout.service.js` records campaign attribution after order creation using trusted checkout preview campaign rows.
- `server/src/domains/campaigns/repositories/campaigns.repository.js` records attribution and aggregate campaign stat increments in one transaction.
- `server/src/domains/campaigns/services/campaigns.service.js` supports order-aware campaign usage while preserving old aggregate-only fallback behavior.
- `server/src/domains/campaigns/mappers/campaigns.mapper.js` maps recent attributed orders for admin campaign responses.
- `server/src/domains/orders/repositories/orders.repository.js` includes campaign usages in order reads, computes order donation stats, reads promo usage for order detail/customer confirmation, and supports customer-safe lookup by reference.
- `server/src/domains/orders/mappers/orders.mapper.js` maps `donationAmount`, campaign attributions, promo usage, friendly customer reference, and customer-safe order responses.
- `server/src/domains/orders/services/orders.service.js` adds same-customer order summaries and customer-safe order lookup.
- `server/src/domains/checkout/controllers/checkout.controller.js` and `routes/checkout.routes.js` add `GET /api/checkout/orders/:reference`.

Client:

- `client/src/domains/admin/components/AdminOrderCard.vue` now shows friendly order reference and server-provided donation amount.
- `client/src/domains/admin/views/AdminOrderDetailView.vue` now shows full order detail: reference, internal id, items/variants/SKUs, customer, shipping, pricing, promo usage, donation/campaign attribution, Stripe PaymentIntent id for admin, status controls, timestamps, and same-customer orders.
- `client/src/domains/admin/components/AdminCampaignsTable.vue` shows recent attributed orders when campaign attribution data exists.
- `client/src/domains/checkout/api/checkout.api.js` adds `fetchCheckoutOrder(reference)`.
- `client/src/domains/checkout/views/CheckoutView.vue` redirects to the friendly order number when available.
- `client/src/domains/checkout/views/OrderSuccessView.vue` fetches customer-safe order details, shows items/pricing/donation/fulfillment/confirmation copy, and removes the stale `View Cart` button.

Docs:

- `docs/architecture/database.md` documents `OrderCampaignUsage`.
- `docs/architecture/data-flow.md` documents campaign attribution and order success flows.
- `docs/architecture/file-map.md` includes the new migration and repository responsibility.
- `docs/architecture/admin.md` documents enhanced order detail and campaign attribution behavior.

### Verification

Server build / Prisma generate:

```bash
cd server
npm run build
```

Result: passed. Prisma Client v6.16.2 generated successfully.

Server syntax checks:

```bash
cd server
node --check src/domains/campaigns/services/campaigns.service.js
node --check src/domains/campaigns/repositories/campaigns.repository.js
node --check src/domains/campaigns/mappers/campaigns.mapper.js
node --check src/domains/orders/repositories/orders.repository.js
node --check src/domains/orders/services/orders.service.js
node --check src/domains/orders/mappers/orders.mapper.js
node --check src/domains/checkout/controllers/checkout.controller.js
node --check src/domains/checkout/routes/checkout.routes.js
node --check src/domains/checkout/services/checkout.service.js
```

Result: passed.

Client build:

```bash
cd client
npm run build
```

Result: passed.

Order mapper smoke:

```bash
cd server
node --input-type=module <order mapper smoke script>
```

Result: passed. Verified admin mapping includes donation/campaign attribution and customer-safe mapping omits internal id and Stripe PaymentIntent id.

Migration verification:

```bash
cd server
npx prisma migrate status
```

Initial result: new migration pending locally.

```bash
cd server
npx prisma migrate dev
```

Result: applied `20260606000000_add_order_campaign_usage` locally and regenerated Prisma Client.

```bash
cd server
npx prisma migrate status
```

Final result: local database schema is up to date.

### Manual QA Still Required

- In Railway DB admin mode, run `npx prisma migrate deploy` on Railway after confirming the intended DB target.
- Complete a checkout that has a campaign donation.
- Confirm the new order redirects to `/order-success/<friendly order number>`.
- Confirm success page shows items, selected variants, subtotal, discount, shipping, tax, donation, and total.
- Confirm success page does not show raw internal order id or Stripe PaymentIntent id.
- Confirm `View Cart` is gone and Continue Shopping works.
- Confirm admin orders list shows the donation amount for the new order.
- Confirm admin order detail shows pricing, promo usage if applicable, campaign attribution, customer/shipping/payment/admin details, and similar customer orders.
- Confirm admin campaigns show recent attributed orders for the campaign.
- Confirm products, promos, campaigns, and orders still load in local client to local server to Railway DB mode after Railway migration deploy.

### Remaining Risks

- Historical orders before `OrderCampaignUsage` will not have order-level campaign attribution unless backfilled manually.
- Campaign aggregate counters may include old donations that cannot be tied to specific historical orders.
- Stripe end-to-end checkout was not rerun during this pass; builds and mapper checks passed, but browser payment QA remains required.
- Railway migration was intentionally not applied automatically.

### Safe For Commit Review

The local changes are build-verified and locally migration-verified, but the working tree contains multiple accepted uncommitted phases. Review should consider all existing local edits together before committing.

## 2026-06-07 Focused Checkout, Orders, And Documentation Verification Pass

This pass focused only on promo validation, promo/campaign calculation edge cases, admin order status workflow, future-proof order status history, touched-domain maintainability, and architecture documentation rendering. It did not redesign the storefront or admin UI, did not migrate to Better Auth, did not commit, and did not push.

### Starting Repository State

The pass began by reading `AGENTS.md` and this handoff, then running:

```bash
git status --short
git diff --stat
git diff --name-status
```

Observed state: the working tree already contained local edits from the active repair/refactor work, including `AGENTS.md` changes and drafted checkout/orders/promo/status-history edits. The `AGENTS.md` changes were pre-existing in this pass and were not reverted.

### Promo Validation Fixes

Root causes:

- The checkout promo composable allowed promo validation before a customer email existed.
- Client promo validation and checkout submission did not consistently lowercase email before sending it to the server.
- Server promo validation skipped per-customer usage enforcement when `customerEmail` was absent, which could bypass one-per-email style rules during validation.
- Changing the checkout email after applying a promo could leave the promo attached to a different email than the one that was validated.

Fixes:

- `client/src/domains/checkout/composables/useCheckoutPromos.js` now requires email before promo validation, normalizes customer email with trim/lowercase, sends the normalized email to `/api/promos/validate`, and clears the applied promo if email changes after validation.
- `client/src/domains/promos/api/promos.api.js` normalizes validation emails before sending API payloads.
- `client/src/domains/checkout/api/checkout.api.js` normalizes checkout customer email before checkout preview/final submission.
- `server/src/domains/promos/services/promos.service.js` now requires normalized email for promo validation, uses normalized email for assigned-email and per-customer usage checks, stores normalized email for usage records, and rechecks per-customer limits inside the promo usage transaction.
- `server/src/domains/checkout/services/checkout.service.js` passes normalized email into preview/final promo validation and promo usage recording.

Verified from code:

- Promo discounts and campaign donations remain separate server-owned checkout calculations.
- Checkout totals remain server-owned in `server/src/domains/checkout/services/checkout.service.js` and `server/src/domains/checkout/utils/checkoutPricing.js`.
- Promo usage is still recorded after the order is created, so customer-facing checkout does not fail after payment/order creation if promo usage persistence fails. This is intentional existing behavior but remains a future robustness risk.

### Admin Order Status Workflow And History

Root causes:

- Admin order detail previously used an instant-persist dropdown, so selecting a status immediately saved.
- There was no status history table or API response shape for future admin auditability.

Fixes:

- `client/src/domains/admin/components/AdminOrderStatusPanel.vue` was added. It shows current status, last updated timestamp, last status change, a staged next-status select, optional note, Save, Cancel, and status history.
- `client/src/domains/admin/views/AdminOrderDetailView.vue` now delegates status editing to `AdminOrderStatusPanel.vue`.
- `client/src/domains/admin/api/adminOrders.api.js` now sends `{ status, note }` for status updates.
- `server/prisma/schema.prisma` adds `OrderStatusHistory`.
- `server/prisma/migrations/20260607000000_add_order_status_history/migration.sql` adds the status history table and indexes.
- `server/src/domains/orders/repositories/orders.repository.js` includes status history on order reads and creates a history row transactionally when status changes.
- `server/src/domains/orders/services/orders.service.js` validates status, normalizes notes, and records temporary actor metadata as `changedByType: ADMIN_ENV` and `changedBy: ADMIN_ENV`.
- `server/src/domains/orders/controllers/orders.controller.js` accepts the note field.
- `server/src/domains/orders/mappers/orders.mapper.js` maps `statusHistory` and `lastStatusChange`.

Migration status:

- Local migration `20260607000000_add_order_status_history` was applied with `npx prisma migrate dev`.
- Local `npx prisma migrate status` reports the schema is up to date.
- Railway was not migrated automatically. Required Railway step after review: `cd server && npx prisma migrate deploy`.

### Documentation Fixes

Docs updated:

- `docs/architecture/README.md`
- `docs/architecture/data-flow.md`
- `docs/architecture/database.md`
- `docs/architecture/admin.md`
- `docs/architecture/file-map.md`
- `docs/architecture/diagram.md`

Rendering root cause:

- Mermaid CLI rendering did not find syntax-invalid Mermaid in the architecture docs. All blocks rendered successfully.
- The verified documentation problem was stale architecture content, especially `docs/architecture/diagram.md` referring to temporary in-memory product data. That file now reflects the current Prisma-backed architecture.

Mermaid verification command shape:

```bash
rm -rf /tmp/doggy-mermaid-check
mkdir -p /tmp/doggy-mermaid-check
node --input-type=module <extract mermaid blocks from docs/architecture/*.md>
npx -y @mermaid-js/mermaid-cli -i <each extracted .mmd> -o <svg> -b transparent
```

Result: passed. Fourteen Mermaid blocks rendered to non-empty SVG files in `/tmp/doggy-mermaid-check`.

### File Organization Audit

Domains audited in this pass:

- Products
- Promos
- Campaigns
- Checkout
- Orders

Findings:

- Client APIs remain separated from UI.
- Checkout promo behavior lives in a composable and API wrapper, not the view.
- Admin order status UI is now a component, while `AdminOrderDetailView.vue` remains the route orchestration layer.
- Server orders code still follows route -> controller -> service -> repository -> mapper.
- Server promos code remains the largest touched file at roughly 532 lines. It is still a domain service with cohesive promo lifecycle/validation/usage responsibilities, so no broad refactor was done in this focused pass.
- `server/src/domains/orders/repositories/orders.repository.js` is roughly 337 lines and now owns status-history database access in addition to order reads/writes. It remains repository-specific but should get automated tests before further extraction.

### Verification Commands And Results

Client build:

```bash
cd client
npm run build
```

Result: passed. Vite built 153 modules and generated production assets.

Server build / Prisma generate:

```bash
cd server
npm run build
```

Result: passed. Prisma Client v6.16.2 generated successfully.

Server syntax/import checks:

```bash
cd server
node --check src/domains/orders/repositories/orders.repository.js
node --check src/domains/orders/services/orders.service.js
node --check src/domains/orders/controllers/orders.controller.js
node --check src/domains/orders/mappers/orders.mapper.js
node --check src/domains/promos/services/promos.service.js
node --check src/domains/checkout/services/checkout.service.js
```

Result: passed.

Prisma migration status:

```bash
cd server
npx prisma migrate status
```

Result after local migration: database schema is up to date.

Whitespace/diff check:

```bash
git diff --check
```

Result: passed.

Environment/secrets policy checks:

```bash
find . -name '.env.example' -print
rg -n 'sk_live|rk_live|whsec_|postgres://|postgresql://|DATABASE_URL=|STRIPE_SECRET_KEY=|ADMIN_PASSWORD_HASH=' --glob '!node_modules/**' --glob '!client/dist/**' .
```

Result: no `.env.example` files found. Secret scan found only placeholder variable-name examples in `AGENTS.md`, not real secret values.

Lint/test script status:

- Client package has no `lint` or `test` scripts.
- Server package has no `lint` or `test` scripts.
- No scripts were invented.

### Remaining Risks

- Railway still needs `npx prisma migrate deploy` for `20260607000000_add_order_status_history` before deployed admin order status history can persist.
- Promo usage recording still happens after order creation; if usage persistence fails after a paid order, counters can underreport. A stronger future design would reserve/record promo usage within a more explicit checkout transaction model.
- Per-customer promo usage checks are now normalized and rechecked during usage recording, but high-concurrency max-usage edge cases still need automated tests.
- No automated tests exist for promo validation, promo + campaign coexistence, Stripe checkout, inventory decrement, or status history.
- Browser/manual QA is still required to confirm the visible admin Save/Cancel workflow and checkout promo behavior.

### Manual QA Checklist

Promo/checkout:

- Start local client/server.
- Enter a promo code before email and confirm validation refuses with an email-required message.
- Enter an email with uppercase/extra spaces, apply a one-per-email promo, and confirm validation succeeds/fails according to normalized email usage.
- Change the email after a promo is applied and confirm the promo clears and totals update.
- Apply a valid promo with a campaign-eligible cart item and confirm discount and donation both display.
- Complete Stripe test checkout and confirm server-owned totals, promo usage, campaign attribution, inventory, and order success page.

Admin orders:

- Open admin order detail.
- Select a different status and click Cancel; confirm no status change persists.
- Select a different status and click Save; confirm current status updates and status history gains a row.
- Add a note and confirm it appears in history only after a status change.
- Confirm last updated and last status change timestamps are visible.

Docs:

- Open `docs/architecture/README.md`, `data-flow.md`, `database.md`, `admin.md`, `file-map.md`, and `auth-roadmap.md` in a Markdown renderer that supports Mermaid.

Deployment:

- Apply Railway migrations with `cd server && npx prisma migrate deploy` after confirming target DB.
- Redeploy Railway and Vercel if needed.
- Confirm Vercel checkout, Stripe test payment, order creation, and admin order detail after migration.

### Current Git State Notes

Changed files from this focused pass include client checkout/promo/admin-order files, server checkout/promo/order files, Prisma schema/migration, and architecture docs. `AGENTS.md` is also modified in the working tree from prior accepted edits and should be reviewed with the full local diff.

### Next Recommended Phase

After manual QA and Railway migration review, add focused automated tests for checkout pricing, promo validation/usage limits, promo + campaign coexistence, order status history, and idempotent Stripe order creation. Better Auth remains future customer accounts/loyalty/admin-user work and was intentionally not started here.

## 2026-06-07 Promo Discount Repair, Campaign Analytics, And Tiered Tests

This pass followed the tiered automated testing requirement already present in `AGENTS.md`. No commit or push was performed. The pass did not redesign checkout or admin, did not call real Stripe/Railway/Vercel from tests, and did not expose secret values.

### Starting Git State

Commands run before application-code edits:

```bash
git status
git diff --stat
git diff --name-status
```

Observed state: only `AGENTS.md` was modified at the start of this pass. Earlier handoff sections described prior local edits, but the actual working tree at the start of this pass did not contain those app-code edits.

### Root Cause Investigation

Local database check for `CHASE20` showed:

- `code`: `CHASE20`
- `status`: `ACTIVE`
- `discountType`: `FIXED`
- `discountValue`: `20`
- `minimumSubtotal`: `30`

Local validation smoke for `CHASE20` with a `$100` subtotal returned a `$20` discount, so the current local DB row did not reproduce the reported `$0.00` bug.

The verified code-level failure class was percent promo value interpretation:

- Server promo math treated percent promos as `discountValue / 100`.
- That is correct when the stored value is `20`.
- If an existing/deployed promo stores `0.20` to mean 20%, the old calculation became `0.20 / 100 = 0.002`, or 0.2%.
- On small subtotals, that tiny discount can round/display as `$0.00` across checkout, promo tester, promo analytics, order detail, order success, and usage history because every downstream flow uses the calculated `discountAmount`.

### Fixes Made

Promo discount repair:

- `server/src/domains/promos/services/promos.service.js`
  - Added `normalizePromoDiscountValue`.
  - Percent promos now accept both canonical values such as `20` and legacy fractional values such as `0.20`.
  - Fixed-dollar promos still use dollar amounts and still cap at subtotal.

Shared money safety:

- `server/src/shared/utils/money.js`
  - `normalizeCurrencyAmount` now returns `0` for non-finite values instead of `NaN`.

Campaign analytics:

- No new schema was needed because `OrderCampaignUsage` already supports attribution and campaign responses already expose `orderAttributions`.
- Added `client/src/domains/admin/components/AdminCampaignAnalyticsModal.vue`.
- Wired an Analytics action through:
  - `client/src/domains/admin/components/AdminCampaignsTable.vue`
  - `client/src/domains/admin/components/AdminCampaignsLibrary.vue`
  - `client/src/domains/admin/composables/useAdminCampaigns.js`
  - `client/src/domains/admin/views/AdminCampaignsView.vue`

Campaign Analytics Modal displays:

- Campaign name.
- Orders count.
- Revenue generated.
- Donation generated.
- Average order value.
- Products included.
- Donation rule.
- Date range.
- Recent campaign orders / attribution table with order reference, customer email, subtotal, donation amount, order total, and created date.

### Tiered Test Infrastructure Added

Vitest was added to both client and server.

Root commands:

```bash
npm run test
npm run tiertest1
npm run tiertest2
npm run tiertest3
```

Client commands:

```bash
cd client
npm run test
npm run tiertest1
npm run tiertest2
npm run tiertest3
```

Server commands:

```bash
cd server
npm run test
npm run tiertest1
npm run tiertest2
npm run tiertest3
```

New test folders:

- `server/tests/tier1/promos`
- `server/tests/tier1/checkout`
- `server/tests/tier1/campaigns`
- `server/tests/tier1/payments`
- `server/tests/tier1/orders`
- `server/tests/tier2/admin`
- `server/tests/tier2/orders`
- `server/tests/tier3/utils`
- `client/tests/tier1/cart`
- `client/tests/tier1/checkout`
- `client/tests/tier1/promos`
- `client/tests/tier2/admin`
- `client/tests/tier3/utils`

Tier 1 coverage added:

- Promo percent discounts, including `20` and legacy `0.20`.
- Fixed promo discounts and subtotal caps.
- Minimum subtotal validation.
- Email-required promo validation.
- Normalized email usage limit checks.
- Promo + campaign coexistence at checkout pricing helper level.
- Campaign donation calculations and campaign-linked product matching.
- Stripe PaymentIntent amount uses server preview total.
- Selected variant cart pricing for 6 oz and 18 oz.
- Order status history creation/no-op behavior.

Tier 2 coverage added:

- Campaign analytics attribution mapping.
- Promo analytics discount total mapping.
- Customer-safe order lookup mapping.
- Admin promo payload mapping.
- Admin campaign payload mapping.

Tier 3 coverage added:

- Shared money/string helpers.
- Client campaign/promo formatting helpers.
- Client promo rule normalization.

### Verification Results

Tier 1:

```bash
npm run tiertest1
```

Result: passed.

- Server: 6 files, 20 tests.
- Client: 3 files, 7 tests.

Tier 2:

```bash
npm run tiertest2
```

Result: passed.

- Server: 2 files, 3 tests.
- Client: 1 file, 4 tests.

Tier 3:

```bash
npm run tiertest3
```

Initial result: failed because `normalizeCurrencyAmount('bad')` returned `NaN`. This was fixed in `server/src/shared/utils/money.js`.

Final result: passed.

- Server: 1 file, 3 tests.
- Client: 1 file, 3 tests.

Full suite:

```bash
npm run test
```

Result: passed. Total coverage from this pass: 12 test files and 33 tests.

Builds:

```bash
cd client
npm run build
```

Result: passed. Vite built 154 modules.

```bash
cd server
npm run build
```

Result: passed. Prisma Client v6.16.2 generated.

Syntax checks:

```bash
cd server
node --check src/domains/promos/services/promos.service.js
node --check src/domains/payments/controllers/payment.controller.js
node --check src/shared/utils/money.js
node --check tests/tier1/promos/promo-discounts.test.js
node --check tests/tier1/payments/payment-intent-total.test.js
```

Result: passed.

Promo smoke:

```bash
node --input-type=module <validate CHASE20 and legacy percent smoke>
```

Result:

- Local `CHASE20` with `$100` subtotal: valid, `$20` discount.
- Legacy percent value `0.20` with `$100` subtotal: `$20` discount after fix.

Environment/secrets check:

```bash
find . -name '.env.example' -print
rg -n 'sk_live|rk_live|whsec_|postgres://|postgresql://|DATABASE_URL=|STRIPE_SECRET_KEY=|ADMIN_PASSWORD_HASH=' --glob '!node_modules/**' --glob '!client/dist/**' .
```

Result:

- No `.env.example` files found.
- Matches were placeholder variable-name examples in `AGENTS.md` and this handoff command text, not real secret values.

### Remaining Risks And Coverage Gaps

- The exact deployed/Railway `CHASE20` row was not queried in this pass. The local row is fixed-dollar `$20`; the repaired code protects the likely deployed percent/fraction failure class.
- Automated tests do not perform real Stripe calls, real Railway DB calls, or real browser checkout.
- Promo usage recording still occurs after order creation in the current architecture; tests cover calculation and validation but not concurrent production race conditions.
- Campaign analytics uses the existing `orderAttributions` returned with campaign list data. It does not yet have pagination or a separate detail endpoint.
- No Playwright/browser tests were added.

### Manual QA Checklist

- In admin promos, verify `CHASE20` configuration on the target DB and confirm whether it is `FIXED 20`, `PERCENT 20`, or legacy `PERCENT 0.20`.
- Run the admin promo tester for `CHASE20` with subtotal above minimum and confirm non-zero discount.
- Apply `CHASE20` in checkout after entering email and confirm the checkout summary discount is non-zero.
- Complete Stripe test checkout with promo only and confirm order success, admin order detail, promo usage history, and promo analytics all show the same discount amount.
- Complete Stripe test checkout with LAIKA SHELTER campaign products plus promo and confirm discount and donation both remain visible.
- Open admin campaigns, click Analytics, and confirm attribution table displays recent campaign orders.

### Next Recommended Phase

Run manual browser QA against the actual Railway DB admin workflow and Vercel storefront. Then add narrower integration tests around repository/service transactions using a local test database or an explicit Prisma test database, still avoiding Railway and real Stripe.

---

## 2026-06-12 Better Auth And Customer Accounts Infrastructure Phase

### Objective

Implemented the first Better Auth customer account foundation while preserving:

- Guest checkout.
- Existing storefront UX.
- Existing custom admin dashboard auth and admin pages.
- Existing checkout, Stripe, order, promo, campaign, and admin CRUD behavior.

This phase intentionally did not migrate the admin dashboard from custom admin auth to Better Auth. Customer accounts now use Better Auth on `/api/customer-auth`; admin auth remains on `/api/auth`.

### Dependencies Added

- `better-auth` in `server/package.json`
- `better-auth` in `client/package.json`

No `.env.example` files were created. No secret values were documented.

### Database Models Added

Migration: `server/prisma/migrations/20260612000000_better_auth_customer_accounts/migration.sql`

Schema source of truth: `server/prisma/schema.prisma`

Added:

- `User`
- `Session`
- `Account`
- `Verification`
- `CustomerProfile`
- `CustomerAccountEvent`
- `CustomerSupportRequest`
- `ProductReview`
- `LoyaltyLedger`
- `CustomerNotificationPreference`
- `UserRole`
- `AccountStatus`

Modified:

- `Order.userId String?`
- `Order.user User?`
- indexes for `Order.userId` and `Order.customerEmail`

Local database status:

- `npx prisma migrate dev` applied `20260612000000_better_auth_customer_accounts` locally.
- `npx prisma generate` completed successfully.

Deployment status:

- Railway migration deployment was not performed in this phase.
- Before deploying the app with accounts enabled, run `cd server && npx prisma migrate deploy` against the intended Railway database after confirming the target environment.

### Better Auth Server Configuration

Important files:

- `server/src/domains/auth/services/customerAuth.service.js`
- `server/src/app/middleware/auth/requireCustomerAuth.js`
- `server/src/domains/auth/constants/authRoles.constants.js`
- `server/src/app.js`

Behavior:

- Better Auth is mounted at `/api/customer-auth/*splat` before `express.json()`, matching Better Auth Express requirements.
- Prisma adapter uses the shared Prisma client.
- Email/password auth is enabled.
- Customer sessions persist in the Better Auth `Session` table.
- Public signup role/status fields are configured with `input: false`; public signup should create `CUSTOMER` users only.
- Better Auth creates customer profile, notification preference, and account-created event records after signup.
- Email verification and password reset hooks build payloads through the email abstraction, but no real email provider is active by default.

Environment variable names introduced or used:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `API_BASE_URL`
- `EMAIL_PROVIDER`
- Existing origin allowlist variables: `FRONTEND_URL`, `CLIENT_URL`

### Customer Account API

Protected server routes:

- `GET /api/account`
- `GET /api/account/profile`
- `PUT /api/account/profile`
- `GET /api/account/orders`
- `GET /api/account/orders/:reference`

Important files:

- `server/src/domains/account/routes/account.routes.js`
- `server/src/domains/account/controllers/account.controller.js`
- `server/src/domains/account/services/account.service.js`
- `server/src/domains/account/repositories/account.repository.js`
- `server/src/domains/account/mappers/account.mapper.js`

Behavior:

- Routes require a valid Better Auth customer session.
- Profile updates write `CustomerProfile`.
- Account orders include direct `Order.userId` links.
- Verified-email guest-order matching is prepared and only enabled when `User.emailVerified` is true.
- Customer order detail returns customer-safe order information and placeholders for tracking, support, and reviews.

### Customer Account Client

Routes added:

- `/account/sign-in`
- `/account/create`
- `/account`
- `/account/profile`
- `/account/orders`
- `/account/orders/:reference`
- `/account/forgot-password`
- `/account/reset-password`

Important files:

- `client/src/domains/account/api/authClient.js`
- `client/src/domains/account/api/accountAuth.api.js`
- `client/src/domains/account/api/account.api.js`
- `client/src/domains/account/composables/useAccountAuth.js`
- `client/src/domains/account/composables/useAccountProfile.js`
- `client/src/domains/account/composables/useAccountOrders.js`
- `client/src/domains/account/validators/account.validators.js`
- `client/src/domains/account/components/AccountShell.vue`
- `client/src/domains/account/components/AccountNav.vue`
- `client/src/domains/account/components/AccountOrderCard.vue`
- `client/src/domains/account/components/AccountPlaceholderPanel.vue`
- `client/src/domains/account/views/AccountSignInView.vue`
- `client/src/domains/account/views/AccountCreateView.vue`
- `client/src/domains/account/views/AccountDashboardView.vue`
- `client/src/domains/account/views/AccountProfileView.vue`
- `client/src/domains/account/views/AccountOrdersView.vue`
- `client/src/domains/account/views/AccountOrderDetailView.vue`
- `client/src/domains/account/views/AccountForgotPasswordView.vue`
- `client/src/domains/account/views/AccountResetPasswordView.vue`

Other client changes:

- `client/src/app/router/index.js` now protects customer routes through `/api/account/profile`.
- `client/src/app/layouts/SiteHeader.vue` now links the account icon to `/account` or `/account/sign-in`.

### Order Linking

Important files:

- `server/src/domains/checkout/controllers/checkout.controller.js`
- `server/src/domains/checkout/services/checkout.service.js`
- `server/src/domains/orders/services/orders.service.js`
- `server/src/domains/orders/repositories/orders.repository.js`

Behavior:

- Guest checkout remains available and creates orders with `userId = null`.
- Logged-in checkout looks up the Better Auth customer session on the server and passes `customerUser.id` into order creation.
- The client never submits `userId`; checkout order linking remains server-owned.
- Existing guest orders remain valid.

### Admin Customer Dashboard

Routes added:

- `/admin/customers`
- `/admin/customers/:customerId`

Server API added:

- `GET /api/admin/customers`
- `GET /api/admin/customers/:customerId`
- `POST /api/admin/customers/:customerId/deactivate`
- `POST /api/admin/customers/:customerId/reactivate`
- `POST /api/admin/customers/:customerId/resend-verification`
- `POST /api/admin/customers/:customerId/password-reset`

Important files:

- `server/src/domains/customers/routes/adminCustomers.routes.js`
- `server/src/domains/customers/controllers/adminCustomers.controller.js`
- `server/src/domains/customers/services/adminCustomers.service.js`
- `server/src/domains/customers/repositories/adminCustomers.repository.js`
- `server/src/domains/customers/mappers/adminCustomers.mapper.js`
- `client/src/domains/admin/api/adminCustomers.api.js`
- `client/src/domains/admin/composables/useAdminCustomers.js`
- `client/src/domains/admin/components/AdminCustomerStatusBadge.vue`
- `client/src/domains/admin/components/AdminCustomersTable.vue`
- `client/src/domains/admin/components/AdminCustomerOrdersPanel.vue`
- `client/src/domains/admin/views/AdminCustomersView.vue`
- `client/src/domains/admin/views/AdminCustomerDetailView.vue`

Behavior:

- Customer list shows name, email, verified status, role, status, created date, order count, lifetime spend, and latest order date.
- Customer detail shows profile summary, linked orders, verified-email guest matches, and readiness sections for support, reviews, loyalty, referrals, and internal notes.
- Deactivate/reactivate updates `User.status` and records a `CustomerAccountEvent`.
- Verification/password reset actions call email readiness payload flow. They do not send real email unless a provider is configured.
- Admin customer routes are protected by existing `requireAdminAuth`.
- Password hashes, session tokens, and verification token values are not exposed in admin customer responses.

### Email, Lifecycle, Loyalty, Support, Review, Notification Readiness

Important files:

- `server/src/domains/emails/constants/emailEvents.constants.js`
- `server/src/domains/emails/mappers/emailPayloads.mapper.js`
- `server/src/domains/emails/services/emailProvider.service.js`
- `server/prisma/schema.prisma`

Prepared:

- Verification email payloads.
- Resend verification payloads.
- Password reset payloads.
- Welcome email payloads.
- Order confirmation/update/tracking/review request payload foundations.
- Account lifecycle event table.
- Account deactivation/reactivation readiness.
- Support request model.
- Product review model.
- Loyalty ledger model.
- Notification preference model.

Not implemented yet:

- Real email provider delivery.
- Customer-facing support tickets.
- Review submission/moderation UI.
- Loyalty earning/redemption rules.
- Referrals.
- Full account deletion workflow.
- Better Auth migration for admin users/permissions.

### Documentation Updated

Updated architecture docs:

- `docs/architecture/README.md`
- `docs/architecture/data-flow.md`
- `docs/architecture/file-map.md`
- `docs/architecture/database.md`
- `docs/architecture/admin.md`
- `docs/architecture/auth-roadmap.md`

Key documentation changes:

- Customer Better Auth is now documented as implemented, not merely future work.
- Custom admin auth remains documented as current.
- Customer account flow, admin customer management flow, and order linking flow are documented.
- New account/customer/email files and DB models are indexed.
- Railway migration requirements are documented without secret values.

### Verification Results

Commands run:

```bash
cd server
npx prisma generate
```

Result: passed.

```bash
cd server
find src/domains/account src/domains/customers src/domains/auth src/domains/emails src/app/middleware/auth -name '*.js' -print | xargs -n1 node --check
```

Result: passed.

```bash
cd client
npm run build
```

Result: passed. Vite built 221 modules.

```bash
cd server
npm run build
```

Result: passed. Prisma Client v6.16.2 generated.

```bash
cd server
npx prisma migrate status
```

Result before local migration: one pending migration, `20260612000000_better_auth_customer_accounts`.

```bash
cd server
npx prisma migrate dev
```

Result: applied `20260612000000_better_auth_customer_accounts` locally and regenerated Prisma Client.

```bash
cd server
node -e "import('./src/app.js').then(() => console.log('server app import ok'))"
```

Result: passed.

```bash
cd server
npm test
```

Result: passed. 9 test files, 26 tests.

```bash
cd client
npm test
```

Result: passed. 5 test files, 14 tests.

Local Better Auth smoke:

- Started local server on port `3099`.
- Created a temporary customer account through `/api/customer-auth/sign-up/email`.
- Verified `/api/customer-auth/get-session` returned an authenticated customer session.
- Verified `/api/account/profile` accepted the session cookie and returned a protected account profile.
- Added and verified a Better Auth after-hook sanitizer so sign-up, sign-in, and get-session JSON responses do not expose `token` fields while cookie sessions still work.
- Verified sign-in response sanitization and protected account profile access after sign-in.
- Removed the temporary smoke-test customer from the local database.
- Stopped the local smoke-test server.

Important note: an earlier local smoke command printed Better Auth response bodies before the sanitizer was added. Do not copy session token values from terminal history into documentation, commits, or issue trackers.

### Security Verification

Verified from code:

- Admin routes still use existing custom admin auth guard.
- Customer account routes use `requireCustomerAuth`.
- Public signup cannot provide `role` or `status` because Better Auth additional fields use `input: false`.
- Admin customer API responses are mapped and do not intentionally include `Account.password`, `Session.token`, or `Verification.value`.
- Better Auth customer sign-up, sign-in, and get-session JSON responses are sanitized by an after hook to remove `token` fields.
- Checkout does not trust a client-submitted `userId`; logged-in order linking uses server session lookup.

Unverified without deployed/browser QA:

- Same-site cookie behavior after deploying Better Auth customer auth to Railway/Vercel/custom domain.
- Email delivery provider behavior because no provider is configured.
- Full browser sign-up/sign-in/sign-out flows in Safari/Chrome.
- Logged-in real Stripe checkout on Vercel after Railway migration.

### Required Deployment Steps

Before deploying this phase:

1. Confirm Railway target database.
2. Deploy/apply migration:

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

3. Configure server/Railway variable names with real values in the dashboard:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `FRONTEND_URL`
- `CLIENT_URL` if used for origin allowlist
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `STRIPE_SECRET_KEY`
- `EMAIL_PROVIDER` only when a real email provider is implemented/configured

4. Configure client/Vercel variable names:

- `VITE_API_BASE_URL`
- `VITE_API_URL` if keeping the backwards-compatible alias
- `VITE_STRIPE_PUBLISHABLE_KEY`

5. Redeploy server, then redeploy client.

### Manual QA Checklist

Customer accounts:

- Visit `/account/sign-in`.
- Create a test customer account at `/account/create`.
- Confirm redirect to `/account`.
- Refresh `/account` and remain authenticated.
- Edit `/account/profile`.
- Sign out and confirm protected `/account` redirects to `/account/sign-in`.
- Request password reset and verify user-facing readiness messaging.

Checkout/order linking:

- Complete guest checkout and confirm order has no `userId`.
- Complete logged-in checkout and confirm order has `userId`.
- Confirm order success still loads.
- Confirm admin order list/detail still loads linked orders.

Admin customers:

- Log into existing admin.
- Open `/admin/customers`.
- Open a customer detail page.
- Confirm linked orders appear.
- Confirm verified-email guest matches appear only for verified customer emails.
- Test deactivate/reactivate on a safe local customer.
- Test verification/password reset readiness buttons without expecting real email delivery.

Regression checks:

- Product create/edit/delete.
- Promo create/edit/test/analytics.
- Campaign create/edit/status display.
- Admin order status save/cancel/history.
- Guest checkout with promo and campaign donation.
- Vercel storefront product browsing and add-to-cart.

### Remaining Risks

- Railway migration for Better Auth/customer tables is not applied by this handoff.
- Custom admin auth is still separate from Better Auth. Future Better Auth admin migration must preserve the current admin dashboard and add roles/permissions carefully.
- No automated browser/E2E tests exist for account flows.
- No real email provider is wired.
- Account deletion/export/audit workflows are foundation-only.
- Loyalty, referrals, support requests, review submission, and notification delivery are foundation-only.
- `AGENTS.md` had pre-existing local edits in the working tree before this phase; review separately before committing.

### Current Git State At Handoff

Current branch observed earlier in this handoff: `dev-main`.

Working tree includes modified and untracked files from this Better Auth phase plus the existing `AGENTS.md` local edit. Review before commit.

Latest `git diff --name-status` at documentation update time included:

- `M client/package.json`
- `M client/package-lock.json`
- `M client/src/app/layouts/SiteHeader.vue`
- `M client/src/app/router/index.js`
- `M client/src/domains/admin/views/AdminDashboardView.vue`
- `M docs/architecture/README.md`
- `M docs/architecture/admin.md`
- `M docs/architecture/auth-roadmap.md`
- `M docs/architecture/data-flow.md`
- `M docs/architecture/database.md`
- `M docs/architecture/file-map.md`
- `M server/package.json`
- `M server/package-lock.json`
- `M server/prisma/schema.prisma`
- `M server/src/app.js`
- `M server/src/domains/checkout/controllers/checkout.controller.js`
- `M server/src/domains/checkout/services/checkout.service.js`
- `M server/src/domains/orders/repositories/orders.repository.js`
- `M server/src/domains/orders/services/orders.service.js`
- new `client/src/domains/account/`
- new admin customer client files
- new `server/prisma/migrations/20260612000000_better_auth_customer_accounts/`
- new `server/src/domains/account/`
- new `server/src/domains/customers/`
- new `server/src/domains/emails/`
- new `server/src/domains/auth/services/customerAuth.service.js`
- new `server/src/app/middleware/auth/requireCustomerAuth.js`

### Next Recommended Phase

Deploy the migration to the intended Railway environment, redeploy server/client, and perform browser manual QA for customer accounts plus one guest checkout and one logged-in checkout. After that, add focused integration/E2E coverage for sign-up/sign-in/session persistence and logged-in order linking before starting the larger Better Auth admin-permissions migration.

---

## 2026-06-13 Customer Experience Refinement And Better Auth Infrastructure Pass

### Objective

Refined the customer account, header, checkout identity, order history/detail, and admin customer UX without rebuilding auth, checkout, or admin. Existing custom admin auth remains intact. Better Auth customer auth remains on `/api/customer-auth`.

### Better Auth Infrastructure Changes

Official docs used:

- Better Auth Infrastructure Getting Started.
- Better Auth Infrastructure Dashboard/dash plugin docs.

Packages added:

- `@better-auth/infra` in `server/package.json`
- `@better-auth/infra` in `client/package.json`

Server plugin:

- File: `server/src/domains/auth/services/customerAuth.service.js`
- Import: `dash` from `@better-auth/infra`
- Plugin: `dash({ apiKey: process.env.BETTER_AUTH_API_KEY })`

Client plugin:

- File: `client/src/domains/account/api/authClient.js`
- Import: `dashClient` from `@better-auth/infra/client`
- Plugin: `dashClient()`

Not enabled:

- Sentinel/security challenge plugins.
- Activity tracking schema field/migration.
- Any client-side API key exposure.

Required env variable names:

- Railway/server: `BETTER_AUTH_API_KEY`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, `FRONTEND_URL`, `CLIENT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `STRIPE_SECRET_KEY`
- Vercel/client: `VITE_API_BASE_URL`, `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`

The real `BETTER_AUTH_API_KEY` value must be created in the Better Auth Infrastructure dashboard and configured only in Railway/server environment variables. It must not be committed or exposed to Vercel.

### Customer Account UX Changes

Files changed:

- `client/src/domains/account/components/AccountShell.vue`
- `client/src/domains/account/views/AccountSignInView.vue`
- `client/src/domains/account/views/AccountCreateView.vue`
- `client/src/domains/account/views/AccountProfileView.vue`
- `client/src/domains/account/components/AccountOrderCard.vue`
- `client/src/domains/account/views/AccountOrderDetailView.vue`
- `client/src/app/layouts/SiteHeader.vue`
- `client/src/app/layouts/SiteFooter.vue`

Improvements:

- Account pages now reuse the storefront header and footer.
- Account shell uses Chase & Evie Co. storefront styling instead of a generic portal feel.
- Sign-in/create-account pages now explain ecommerce benefits: faster checkout, order history, future tracking, and future rewards.
- Sign-in/create-account forms keep using Better Auth APIs.
- Profile page now shows editable first name, last name, phone, marketing preference, account email display, email verification status, and future address readiness.
- Email change remains disabled because verification/security flow is not fully implemented.
- Footer links now point back to storefront anchors from account pages.

### Header And Account State

File changed:

- `client/src/app/layouts/SiteHeader.vue`

Behavior:

- Logged-out desktop/mobile header shows a visible Sign in entry.
- Logged-in desktop header shows initials and first name with a menu for Account overview, Orders, Checkout, and Sign out.
- Logged-in mobile header shows initials and Account.
- Header state is driven by the existing Better Auth customer session composable.

### Checkout Identity Changes

Files changed:

- `client/src/domains/checkout/views/CheckoutView.vue`
- `client/src/domains/checkout/Checkout/CheckoutContactSection.vue`

Behavior:

- Guest checkout now shows a clear “Checking out as guest” card with Sign in/Create account links.
- Guest checkout remains available and obvious.
- Signed-in checkout loads `/api/account/profile`, shows “Signed in as...”, and pre-fills safe blank fields from the account profile.
- Signed-in checkout hides the redundant save-info/marketing checkboxes and directs marketing preference management to the profile page.
- Checkout order linking remains server-owned; the client still does not send `userId`.

### Order History And Detail UX

Files changed:

- `server/src/domains/orders/mappers/orders.mapper.js`
- `server/src/domains/account/repositories/account.repository.js`
- `client/src/domains/account/components/AccountOrderCard.vue`
- `client/src/domains/account/views/AccountOrderDetailView.vue`

Behavior:

- Customer-safe order responses now include customer-owned contact and shipping snapshot fields, payment status derived from order status, promo usage, and status history.
- Account order cards show product preview, order reference, status, date, total, item count, and a detail cue.
- Order detail now shows order reference, status, payment status, placed date, customer contact, shipping info, items with variant/quantity/unit/line totals, subtotal, discount, promo code when present, shipping, tax, donation impact, total, tracking placeholder, support entry point, and review readiness.
- Account order routes still enforce ownership through `requireCustomerAuth` and repository filters before returning data.

### Admin Customer UX

No broad admin rebuild was performed.

The existing admin customer dashboard remains in place and benefits from the richer customer/order mapping where safe. Admin customer routes remain protected by `requireAdminAuth`; unauthenticated `/api/admin/customers` was verified to return `401`.

Sensitive data remains excluded from mapped admin customer responses:

- Password hashes.
- Session tokens.
- Verification token values.
- Stripe secrets or private payment data.

### Customer Journey Review

Reviewed journey:

- Guest browse.
- Add to cart.
- Checkout as guest or signed-in customer.
- Order confirmation.
- Account creation/sign-in.
- Order history/detail.
- Repeat purchase path back to shop/checkout.

Small fixes made:

- Header account state is now clear.
- Account pages reuse store header/footer and visual language.
- Guest/signed-in checkout identity is explicit.
- Checkout mobile summary prop wiring now passes `itemCount`, `mobileSummaryOpen`, and the toggle event explicitly after browser testing exposed Vue missing-prop warnings.
- Order history and detail are easier to scan.
- Account footer links no longer dead-end on account-local hash anchors.

Remaining larger recommendations:

- Add saved address management after email verification/security flow is complete.
- Add a reorder action after inventory/variant availability rules are designed.
- Add real support ticket submission.
- Add real review request/submission flow.
- Add loyalty/referral UX once earning/redemption rules are defined.
- Add E2E tests for signup, signin, signed-in checkout, and order history.

### Verification Results

Commands run:

```bash
cd client
npm run build
npm test
```

Result: passed. Vite built 225 modules. Client tests passed: 5 files, 14 tests.

```bash
cd server
node --check src/domains/auth/services/customerAuth.service.js
node --check src/domains/account/repositories/account.repository.js
node --check src/domains/orders/mappers/orders.mapper.js
npm run build
npm test
```

Result: passed. Prisma Client generated. Server tests passed: 9 files, 26 tests.

Local auth smoke:

- Started local server on `localhost:3000`.
- Created a temporary customer through Better Auth sign-up.
- Verified sign-up success.
- Verified sign-up and session responses do not expose JSON `token` fields.
- Verified `/api/account/profile` works while signed in.
- Verified sign-out succeeds.
- Verified `/api/account/profile` returns `401` after sign-out.
- Removed the temporary customer from local DB.

Browser/rendered UI checks:

- Guest homepage desktop header shows Sign in.
- Guest homepage mobile header shows Sign in and cart.
- Sign-in page includes storefront brand, benefits, guest checkout copy, and footer.
- Guest checkout shows “Checking out as guest” with Sign in/Create account.
- Created a temporary customer through the actual `/account/create` page.
- Verified redirect to `/account`.
- Verified logged-in desktop header shows initials/name.
- Verified logged-in mobile header shows Account state.
- Verified signed-in checkout shows signed-in card and does not show guest card.
- Verified from source and passing client build that `CheckoutMobileSummaryBar` receives the required summary props; earlier browser log buffers contained the pre-fix warnings.
- Removed the temporary UI smoke customer from local DB.

Admin protection check:

```bash
curl http://localhost:3000/api/admin/customers
```

Result: `401` with `Authentication required.`

No `.env.example` files were created.

### Remaining Risks

- The real Better Auth Infrastructure dashboard connection cannot be fully verified until `BETTER_AUTH_API_KEY` is configured in Railway and the server is redeployed.
- Railway migration for the Better Auth/customer tables still must be applied before deployed account flows are enabled.
- Browser checks were local only, not Vercel/Railway.
- Guest checkout and logged-in checkout were verified at the identity/UI/API level, but not through a real Stripe payment during this pass.
- No automated E2E coverage exists for account/header/checkout identity states.
- The client dev server and local server were used for verification and should not be left running after the pass.

### Next Recommended Phase

Configure `BETTER_AUTH_API_KEY` in Railway, deploy the server, deploy the client, then run deployed browser QA for customer signup/signin/session persistence, Better Auth Infrastructure dashboard visibility, guest checkout, logged-in Stripe checkout, account order history, and admin customers. After deployed QA passes, add Playwright E2E tests for the customer journey.

## 2026-06-13 Customer Accounts UX Refinement Pass

### Objective

Focused UX repair pass for customer accounts after Better Auth infrastructure work. This pass did not rebuild auth, checkout, admin, or storefront. It preserved the existing Vue domain structure and server route/controller/service/repository/Prisma pattern.

### Previous Phase Verification

Verified from repository state:

- Better Auth customer account files exist under `client/src/domains/account`, `server/src/domains/account`, and `server/src/domains/auth/services/customerAuth.service.js`.
- `@better-auth/infra` remains installed in both client and server packages.
- Server Better Auth uses `dash({ apiKey: process.env.BETTER_AUTH_API_KEY })`.
- Client Better Auth uses `dashClient()`.
- Customer auth remains mounted at `/api/customer-auth`.
- Custom admin auth remains mounted at `/api/auth`.

Incomplete or rough items confirmed from the previous pass:

- `AccountShell` rendered `SiteHeader` without binding cart/search state, causing account pages to show a detached cart count.
- Desktop account dropdown was hover-based and could close across the button/menu gap.
- Account dropdown still included redundant `Checkout`.
- Checkout guest sign-in/create-account links left checkout instead of preserving in-progress form state.
- Profile had basic editable fields but no preferred contact method or clear saved address/default shipping/default billing placeholders.
- Orders page displayed all fetched orders without search/filter/load-more scalability.

### Files Changed

Client:

- `client/src/app/layouts/SiteHeader.vue`
  - Replaced hover-only account menu with click/outside-click/Escape behavior.
  - Removed redundant Checkout menu item.
  - Added Profile menu item.
  - Updated main nav links to storefront-root anchors such as `/#shop` so account pages do not dead-end on local hashes.
- `client/src/domains/account/components/AccountShell.vue`
  - Binds `SiteHeader` to shared cart count/search state.
  - Adds the real `CartDrawer` on account pages using the same local cart storage.
- `client/src/domains/storefront/composables/useStorefrontSearch.js`
  - New tiny shared search-state composable for storefront/account header continuity.
- `client/src/domains/products/composables/useProductFilters.js`
  - Uses the shared storefront search ref.
- `client/src/domains/cart/composables/useCart.js`
  - Adds safe defaults so account shell can use stored cart/drawer behavior without product catalog context.
- `client/src/domains/checkout/Checkout/CheckoutContactSection.vue`
  - Guest Sign in/Create account actions now emit quick-auth events instead of navigating away.
- `client/src/domains/checkout/Checkout/CheckoutAuthModal.vue`
  - New lightweight checkout sign-in/create-account modal using existing Better Auth composable and validators.
- `client/src/domains/checkout/views/CheckoutView.vue`
  - Opens checkout auth modal and reloads signed-in profile after modal auth success without losing checkout progress.
- `client/src/domains/account/views/AccountSignInView.vue`
  - Preserves safe internal `redirect` query when linking to create account and after sign-in.
- `client/src/domains/account/views/AccountCreateView.vue`
  - Preserves safe internal `redirect` query when linking to sign-in and after account creation.
- `client/src/domains/account/views/AccountProfileView.vue`
  - Adds explicit marketing opt-in/opt-out controls, preferred contact method, and saved-address/default-shipping/default-billing future placeholders.
- `client/src/domains/account/validators/account.validators.js`
  - Validates preferred contact method values.
- `client/src/domains/account/views/AccountDashboardView.vue`
  - Adds welcome section, compact recent orders, View All Orders link, and future-phase loyalty/wishlist/review/tracking placeholders.
- `client/src/domains/account/views/AccountOrdersView.vue`
  - Adds order search, status filter, and Load More pagination.
- `client/src/domains/account/components/AccountOrderCard.vue`
  - Adds friendlier status labels/classes and clearer order metadata.
- `client/src/domains/account/views/AccountOrderDetailView.vue`
  - Adds a status timeline section using existing `statusHistory`.

Server/database:

- `server/prisma/schema.prisma`
  - Adds nullable `CustomerProfile.preferredContactMethod`.
- `server/prisma/migrations/20260613000000_add_customer_preferred_contact/migration.sql`
  - Adds the local/production migration for the preferred contact field.
- `server/src/domains/account/services/account.service.js`
  - Normalizes and saves preferred contact method through the existing account service.
- `server/src/domains/account/mappers/account.mapper.js`
  - Returns preferred contact method in customer-safe profile responses.

Docs:

- `docs/architecture/auth-roadmap.md`
  - Adds verified Better Auth Dashboard Base URL/Base Path guidance.

### UX Issues Fixed

- Account pages now share live storefront cart count and cart drawer behavior through the same `SiteHeader` and local cart storage.
- Account header search state uses a shared storefront search ref rather than a detached account-only ref.
- Desktop account dropdown no longer depends on fragile hover; it opens by click, closes on outside click/Escape/menu selection, and can be used without a hover gap.
- Checkout was removed from the account dropdown because the cart/checkout path already exists elsewhere.
- Profile now has real editable controls for first name, last name, phone, marketing opt-in/out, and preferred contact method.
- Saved addresses, default shipping address, default billing address, and preferred shipping profile are presented as intentional future-phase placeholders.
- Checkout guest auth now has an inline sign-in/create-account modal that preserves cart and entered checkout form state.
- Standalone sign-in/create-account pages preserve safe internal redirect targets such as `redirect=/checkout`.
- Account overview stays compact and shows only recent orders with a View All Orders path.
- Orders page now supports search, status filter, and load more.
- Order detail now has a timeline/status-history section.

### Better Auth Dashboard Configuration

Verified from code:

- Server Better Auth config: `server/src/domains/auth/services/customerAuth.service.js`
- Server base path: `basePath: '/api/customer-auth'`
- Express mount: `app.all('/api/customer-auth/*splat', toNodeHandler(customerAuth))`
- Client Better Auth config: `client/src/domains/account/api/authClient.js`
- Client base path: `/api/customer-auth`
- Custom admin auth remains separate at `/api/auth`.

Dashboard values:

- Project Name: use `Chase & Evie Co.` or `Doggy Ent`.
- Base URL: the public backend/server origin where Better Auth runs. For production, copy the Railway backend public domain from Railway service networking. Do not use the Vercel storefront URL unless the auth server is actually hosted there.
- Base Path: `/api/customer-auth`
- Required Railway/server variable: `BETTER_AUTH_API_KEY`
- Vercel/client env change: none for the API key.
- Verification endpoint: `<BackendBaseUrl>/api/customer-auth/get-session`

Local endpoint verification:

```bash
curl -i http://localhost:3000/api/customer-auth/get-session
```

Result: `200 OK` with unauthenticated `null`, proving the route exists locally.

Official docs referenced:

- Better Auth Infrastructure Getting Started.
- Better Auth Infrastructure Dashboard plugin docs.

### Migration Notes

Local:

- `npx prisma migrate status` initially reported pending `20260613000000_add_customer_preferred_contact`.
- `npx prisma migrate dev` applied it locally and regenerated Prisma Client.
- Final `npx prisma migrate status` reported the local database schema is up to date.

Railway:

- Do not apply automatically from Codex.
- Required after review/deploy planning: run Railway-safe `npx prisma migrate deploy` for the new migration.

### Verification Results

Commands run:

```bash
cd client
npm run build
npm test
```

Result: passed. Vite built 227 modules. Client tests passed: 5 files, 14 tests.

```bash
cd server
npm run build
npm test
npx prisma migrate status
npx prisma migrate dev
npx prisma migrate status
```

Result: server build passed and generated Prisma Client. Server tests passed: 9 files, 26 tests. Local migration applied. Final local migration status: database schema is up to date.

Targeted syntax checks:

```bash
node --check src/domains/account/services/account.service.js
node --check src/domains/account/mappers/account.mapper.js
node --check src/domains/account/repositories/account.repository.js
node --check src/domains/auth/services/customerAuth.service.js
```

Result: passed.

Browser/manual checks:

- Homepage rendered with header/cart/account controls.
- Added a real product to cart through storefront UI; header cart count updated to `1`.
- Account sign-in page showed the same cart count and account shell cart drawer opened with the same stored item.
- Checkout guest auth card opened inline Sign in/Create account modal without leaving `/checkout`.
- Created a temporary local customer through the checkout modal; checkout remained on `/checkout`, modal closed, guest card disappeared, and signed-in card appeared.
- Desktop signed-in account dropdown opened by click, contained Account overview, Orders, Profile, Sign out, and did not contain Checkout.
- Orders page rendered search, status filter, empty/list state, and Load More-ready structure.
- Profile page rendered marketing opt-in/out, preferred contact method, saved-address placeholders, and future-phase copy.
- Profile save persisted preferred contact method after killing stale local server watcher processes and restarting a single fresh server.
- Mobile viewport check verified account header state, cart count, account overview, and orders controls.
- Browser logs showed only the expected local Stripe warning about testing Stripe.js over HTTP; no new Vue/runtime errors were observed.
- Temporary local browser test customer was removed from the local DB.
- No `.env.example` files were created.

### Important Verification Note

During profile-save verification, an old `node --watch src/server.js` process was still serving port `3000` with a stale Prisma Client. Killing all old local server watcher/child processes and starting one fresh server fixed the false stale-client error. Reviewers should restart the local server after applying the migration and regenerating Prisma Client.

### Remaining Risks

- Railway still needs `20260613000000_add_customer_preferred_contact` applied with `npx prisma migrate deploy` after review.
- Deployed Vercel/Railway customer account QA was not run in this local pass.
- Checkout quick-auth was verified through local UI state and account session, but not through a full Stripe payment after sign-in.
- Search state is shared in-memory across storefront/account routes during the same SPA session; it is not yet URL-backed or persisted across reloads.
- No automated E2E tests cover the account dropdown, checkout quick-auth modal, or profile save.

### Next Recommended Phase

After code review, apply the new Prisma migration on Railway, redeploy server and client, then run deployed QA for account dropdown, checkout quick-auth, profile save, order history, and Better Auth Dashboard connection. After deployed QA passes, add Playwright E2E coverage for the customer account and checkout identity journey.

## 2026-06-14 Communication, Fulfillment, and Security Pass

### Objective

Focused infrastructure pass for transactional email, tracking/fulfillment visibility, and security hardening. This pass did not implement Twilio/SMS, did not replace Better Auth, did not rebuild checkout/admin/account UX, and did not commit or push.

### Communication Infrastructure

Resend email support was implemented behind the existing email domain:

- `server/src/domains/emails/services/emailProvider.service.js`
  - Sends through Resend when server env provides `RESEND_API_KEY` and `EMAIL_FROM` or `RESEND_FROM_EMAIL`.
  - Falls back to mock mode in tests, explicit mock/test modes, or when required provider env is missing.
  - Records delivery attempts in `EmailDelivery`.
  - Uses dedupe keys so normal retries do not resend one-time lifecycle/order emails.
  - Does not throw provider failures back into checkout/status workflows.
- `server/src/domains/emails/repositories/emailDelivery.repository.js`
  - Prisma access for email delivery records.
- `server/src/domains/emails/mappers/emailTemplates.mapper.js`
  - Builds HTML/text transactional templates from structured payloads.
- `server/src/domains/emails/mappers/emailPayloads.mapper.js`
  - Builds account, order, admin alert, support, password reset, verification, and profile-update payloads.
- `server/src/domains/emails/constants/emailEvents.constants.js`
  - Source of truth for email event names/status labels.

Email lifecycle hooks now verified from code:

- Account verification email: Better Auth `emailVerification.sendVerificationEmail`.
- Password reset email: Better Auth `emailAndPassword.sendResetPassword`.
- Welcome/account-created emails: Better Auth user create database hook.
- Profile updated email: account profile update service.
- Order confirmation email: checkout service after order creation and promo/campaign persistence.
- Admin new-order email: checkout service after order creation.
- Order shipped/delivered/cancelled/status update/refund emails: admin order status service.
- Admin refund/support notification: admin order status service for cancelled/refunded orders.
- Admin failed-payment notification: payment intent creation controller catch path.

Uncertainty:

- Password-changed email template/event is prepared, but a concrete Better Auth password-changed lifecycle hook was not verified from source in this pass.
- Client-side Stripe declines after PaymentIntent creation still require future Stripe webhook coverage if the business wants complete failed-payment notifications.

### Fulfillment and Shippo Tracking

Shipping/tracking support was added through a new server shipping domain:

- `server/src/domains/shipping/routes/shipping.routes.js`
  - `PUT /api/admin/orders/:orderId/tracking`
  - `POST /api/admin/orders/:orderId/tracking/refresh`
  - `POST /api/webhooks/shippo`
- `server/src/domains/shipping/controllers/shipping.controller.js`
  - Admin tracking update/refresh handlers and Shippo webhook receipt handler.
- `server/src/domains/shipping/services/shipping.service.js`
  - Validates tracking payloads.
  - Syncs current tracking status with Shippo when configured.
  - Stores tracking snapshots/events.
  - Updates order status to shipped/delivered when tracking status proves it.
  - Queues tracking/order lifecycle emails.
- `server/src/domains/shipping/services/shippo.service.js`
  - Calls Shippo tracking API when `SHIPPO_API_KEY` or `SHIPPO_API_TOKEN` is configured.
- `server/src/domains/shipping/repositories/shipping.repository.js`
  - Prisma access for shipment upserts and carrier events.
- `server/src/domains/shipping/mappers/shipping.mapper.js`
  - Maps Shippo tracking responses to app shipment shape.
- `server/src/domains/shipping/validators/shipping.validator.js`
  - Normalizes carrier/tracking/status fields and rejects invalid tracking payloads.

Order repository/mapping updates:

- `server/src/domains/orders/repositories/orders.repository.js`
  - Includes shipments/events on admin order lists, detail, customer order lookup, Stripe idempotency lookup, and status updates.
- `server/src/domains/account/repositories/account.repository.js`
  - Includes shipments/events on customer account order history/detail.
- `server/src/domains/orders/mappers/orders.mapper.js`
  - Admin order responses include shipment ids/source/internal fields.
  - Customer-safe order responses expose carrier, tracking number, URL, shipment status, dates, and event status/message/location/timestamps, but omit internal shipment/event ids and Stripe PaymentIntent ids.

Admin UI:

- `client/src/domains/admin/api/adminOrders.api.js`
  - Adds tracking update and refresh API calls.
- `client/src/domains/admin/components/AdminOrderTrackingPanel.vue`
  - Adds a focused tracking panel to admin order detail.
  - Allows carrier, tracking number, optional tracking URL, shipment status, and mark-shipped behavior.
- `client/src/domains/admin/views/AdminOrderDetailView.vue`
  - Renders the tracking panel and updates the local order after save/refresh.

Customer UI:

- `client/src/domains/account/components/AccountOrderCard.vue`
  - Shows concise tracking status when present.
- `client/src/domains/account/views/AccountOrderDetailView.vue`
  - Shows customer-safe tracking details and carrier events.
- `client/src/domains/checkout/views/OrderSuccessView.vue`
  - Shows tracking details if already attached to the order; otherwise keeps the existing fulfillment expectation.

Webhook note:

- `POST /api/webhooks/shippo` verifies optional `SHIPPO_WEBHOOK_SECRET` header values and acknowledges receipt.
- Automatic webhook payload matching/update is intentionally not enabled yet because this pass did not verify the exact deployed Shippo webhook payload shape against live data.

### Database Changes

New Prisma migration:

- `server/prisma/migrations/20260614000000_email_and_shipping_tracking/migration.sql`

New Prisma models:

- `OrderShipment`
  - Tracks order-level carrier/tracking number/status/URLs/dates/source/raw status.
  - Unique by `(orderId, trackingNumber)`.
- `OrderShipmentEvent`
  - Tracks carrier timeline events.
  - Unique by `(shipmentId, status, occurredAt)` to prevent duplicate events on refresh.
- `EmailDelivery`
  - Tracks transactional email event, recipient, subject, provider/status, dedupe key, order/user ids, metadata, and delivery error/provider id.

Local migration status:

```bash
cd server
npx prisma migrate dev --name email_and_shipping_tracking
npx prisma migrate status
```

Result: local migration applied and local database schema is up to date.

Railway migration status:

- Not applied automatically by Codex.
- Required after code review: run Railway-safe `npx prisma migrate deploy` on the Railway/server environment.

### Security Hardening

Files:

- `server/src/app/middleware/security/securityHeaders.middleware.js`
  - Adds `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and production HSTS.
- `server/src/app/middleware/security/rateLimit.middleware.js`
  - Adds checkout, payment, customer-auth, webhook rate limiters.
- `server/src/app.js`
  - Applies security headers globally.
  - Limits JSON payload size to `100kb`.
  - Applies customer-auth limiter before Better Auth handler.
  - Mounts shipping routes at `/api`.
- `server/src/domains/checkout/routes/checkout.routes.js`
  - Applies checkout limiter to preview and create checkout.
- `server/src/domains/payments/routes/payment.routes.js`
  - Applies payment limiter to PaymentIntent creation.
- `server/src/domains/shipping/routes/shipping.routes.js`
  - Applies webhook limiter.
- `server/src/app/middleware/error.middleware.js`
  - Keeps expected 4xx messages but returns a generic message for unexpected 5xx errors.

### Environment Variables

Server/Railway variables to configure by name only:

- `RESEND_API_KEY`: Resend API key for transactional email.
- `EMAIL_FROM`: preferred from address for Resend transactional email.
- `EMAIL_REPLY_TO`: optional reply-to address.
- `RESEND_FROM_EMAIL`: backward-compatible from-address alias supported by code.
- `RESEND_REPLY_TO_EMAIL`: backward-compatible reply-to alias supported by code.
- `ADMIN_NOTIFICATION_EMAIL`: optional admin alert recipient; falls back to `ADMIN_EMAIL`.
- `SUPPORT_EMAIL`: optional support recipient; falls back to `ADMIN_EMAIL`.
- `SHIPPO_API_KEY`: Shippo API key for tracking sync.
- `SHIPPO_API_TOKEN`: backward-compatible Shippo token alias supported by code.
- `SHIPPO_WEBHOOK_SECRET`: optional shared secret checked on Shippo webhook requests.
- Existing required server vars remain required: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_API_KEY`, `CLIENT_URL`, `FRONTEND_URL`, `NODE_ENV`, `PORT`.

Client/Vercel:

- No Resend or Shippo variables belong in client/Vercel public env.
- Existing public vars remain: `VITE_API_BASE_URL`, `VITE_API_URL` if still supported as alias, and Stripe publishable key.

No secret values were copied into this handoff.

### Verification Results

Commands run:

```bash
cd client
npm run build
npm run test
```

Result: client build passed. Client tests passed: 5 files, 14 tests.

```bash
cd server
node --check src/app.js
node --check src/domains/shipping/services/shipping.service.js
node --check src/domains/emails/services/emailProvider.service.js
node --check src/domains/orders/repositories/orders.repository.js
npm run build
npm run test
npx prisma migrate dev --name email_and_shipping_tracking
npx prisma migrate status
node -e "import('./src/app.js').then(() => console.log('app import ok'))"
npm run dev:local
curl -s -o /tmp/tracking_status.txt -w '%{http_code}' -X PUT http://localhost:3000/api/admin/orders/test-order/tracking -H 'Content-Type: application/json' -d '{"carrier":"usps","trackingNumber":"TRACK123"}'
curl -s -o /tmp/shippo_webhook_status.txt -w '%{http_code}' -X POST http://localhost:3000/api/webhooks/shippo -H 'Content-Type: application/json' -d '{}'
```

Results:

- Syntax checks passed.
- Server build passed and generated Prisma Client.
- Server tests passed: 10 files, 28 tests.
- Local migration applied successfully.
- Final local migration status: database schema is up to date.
- App import smoke check printed `app import ok`.
- Local unauthenticated admin tracking update returned `401`, proving the new admin tracking endpoint is not public.
- Local Shippo webhook receipt endpoint returned `200` when no `SHIPPO_WEBHOOK_SECRET` is configured.

One command mistake:

```bash
cd server
npm run tiertest1 -- --runInBand
```

Result: failed because Vitest does not support Jest's `--runInBand` option. The real project script `npm run tiertest1` was rerun and passed.

Secret/env checks:

```bash
find . -name '.env.example' -o -name '*.env.example'
rg -n "RESEND_API_KEY|SHIPPO_API_KEY|SHIPPO_API_TOKEN|EMAIL_FROM|RESEND_FROM_EMAIL|sk_|shippo_|re_[A-Za-z0-9]" --glob '!node_modules/**' --glob '!client/dist/**' .
```

Result: no `.env.example` files found. Search found only variable names/documentation/source references, not real provider secrets.

### Tests Added/Updated

- `server/tests/tier1/shipping/shipping-tracking.test.js`
  - Verifies tracking payload normalization.
  - Verifies Shippo response mapping.
- `server/tests/tier2/orders/customer-safe-order.test.js`
  - Verifies customer-safe order mapping exposes tracking data but omits internal shipment/event ids and Stripe PaymentIntent id.

### Manual QA Checklist

After code review and Railway migration/deploy:

- Configure server env names above in Railway, without putting keys in Vercel public env.
- Run Railway `npx prisma migrate deploy`.
- Redeploy server and client.
- Place a guest checkout order and confirm:
  - Order confirmation email is sent or mocked according to env.
  - Admin new-order email is sent.
  - Checkout still creates one order for one Stripe PaymentIntent.
- Place/log in as a customer and confirm:
  - Welcome/account-created emails queue on sign-up.
  - Password reset email queues from forgot-password flow.
  - Profile update email queues after profile save.
- In admin order detail:
  - Add valid carrier/tracking number.
  - Confirm the order status moves to shipped when requested.
  - Confirm tracking appears on admin order detail.
  - Confirm tracking appears on customer account order card/detail.
  - Confirm refresh uses Shippo when `SHIPPO_API_KEY` or `SHIPPO_API_TOKEN` is configured.
- Verify `/api/webhooks/shippo` rejects/accepts according to `SHIPPO_WEBHOOK_SECRET` configuration.
- Confirm no Resend/Shippo secrets appear in browser bundles or API responses.
- Confirm admin products/promos/campaigns/orders/customer pages still require auth.

### Remaining Risks

- Railway migration for `20260614000000_email_and_shipping_tracking` must be deployed before live email/tracking persistence can work.
- Shippo webhook automatic tracking updates are not enabled until a real deployed webhook payload is verified.
- Password-changed email is template-ready but not confirmed as a live Better Auth lifecycle trigger.
- Failed-payment admin notification currently covers server PaymentIntent creation failures; full Stripe failure/refund automation still needs Stripe webhooks.
- No browser E2E automation was added for admin tracking save/refresh or customer tracking display.
- Resend deliverability/domain verification must be completed outside the repo in Resend/DNS.

### Next Recommended Phase

After review, apply the Railway migration, configure Resend/Shippo env vars, redeploy, and run deployed QA for email delivery, tracking save/refresh, customer tracking visibility, and checkout/order idempotency. Then add Stripe webhooks for payment failure/refund events and Shippo webhook auto-processing once live webhook payloads are captured and verified.

## 2026-06-15 Reality Verification And Completion Pass

### Objective

The previous handoff claimed Resend, Shippo, notification persistence, admin tracking endpoints, security hardening, shipment models, `EmailDelivery`, and customer tracking UI. This pass verified those claims against source, classified incomplete areas, then built missing end-to-end links without committing or pushing.

### Reality Matrix

| Area | Status before this pass | Evidence before this pass | Work completed now |
| --- | --- | --- | --- |
| Welcome email | Partial | Better Auth user create hook queued welcome/account-created emails through `emailProvider.service.js`; `EmailDelivery` model existed. | Added customer/admin delivery history surfaces so sent/mocked/skipped state is visible. |
| Verification email | Partial | Better Auth `sendVerificationEmail` hook existed; admin customer action previously built a null-url payload. | Admin resend verification now calls Better Auth `sendVerificationEmail`, which generates a real verification URL. |
| Resend verification email | Falsely complete | Admin UI button existed, but server passed `url: null`. | Rewired to Better Auth API. |
| Forgot/password reset email | Partial | Customer forgot-password UI called Better Auth request reset; admin reset used null-url payload. | Admin reset now calls Better Auth `requestPasswordReset`, producing a real reset URL. |
| Profile update email | Partial | Account service queued profile update email. | Added customer notification history and preference controls. |
| Order confirmation email | Partial | Checkout service queued email after order creation. | Added admin order resend confirmation control and email delivery history. |
| Order status email | Partial | Status service queued status emails. | Added admin notification history visibility. |
| Tracking shipped email | Partial | Shipping service queued tracking/shipped email. | Added order resend tracking controls and visible delivery history. |
| Delivered email | Partial | Status/tracking service queued delivered email. | Added delivered resend control. |
| Review request email | Missing | Event/template existed, but no trigger/API/UI. | Added admin order review request send control, gated to delivered orders server-side. |
| Shippo provider integration | Complete backend, unverified live | `shippo.service.js` called Shippo Tracking API; tests covered mapper. | Verified env presence only, no label purchase; documented test-mode limitation. |
| Shipment persistence | Complete | `OrderShipment`, repository, service, mapper existed. | Preserved and surfaced in dashboard/order/customer docs. |
| Shipment event persistence | Complete | `OrderShipmentEvent` unique event rows existed. | Included in docs and dashboard tracking summary. |
| Tracking refresh | Complete | `POST /api/admin/orders/:id/tracking/refresh` existed. | Verified protected endpoint shape. |
| Tracking timeline | Partial | Admin/customer order detail showed events; dashboard did not summarize. | Added dashboard shipment activity summary. |
| Customer tracking visibility | Complete for order detail/card | Account order card/detail and success page displayed tracking. | Added shipping method visibility. |
| Admin tracking visibility | Complete for order detail | Admin tracking panel existed. | Added dashboard shipment summary. |
| Admin dashboard visibility | Partial | Only navigation cards existed. | Added metrics for orders, customers, revenue, notifications, shipments, delivered orders, and recent notification activity. |
| Admin notification visibility | Missing | `EmailDelivery` persisted but no admin route/UI. | Added `GET /api/admin/notifications`, dashboard panel, order panel, customer panel. |
| Notification resend controls | Partial | Customer verification/reset buttons existed; order resends missing. | Added order confirmation/tracking/delivered/review resend controls. |
| Customer notification preferences | Partial | Prisma model existed and profile had marketing opt-in only. | Added profile controls for order, tracking, review, loyalty/referral, marketing categories; provider records `SKIPPED` when preferences block eligible events. |
| Email status feedback | Missing | Email rows existed but were not surfaced. | Added customer profile recent email activity. |
| Checkout shipping methods | Partial | Client had fixed options and server recalculated price by method; order did not store method. | Added `GET /api/checkout/shipping-options`, server-provided labels/descriptions, and nullable `Order.shippingMethod`. |

### Files Created

- `client/src/domains/admin/api/adminNotifications.api.js`
- `client/src/domains/admin/components/AdminCustomerNotificationsPanel.vue`
- `client/src/domains/admin/components/AdminOrderNotificationsPanel.vue`
- `server/prisma/migrations/20260615000000_add_order_shipping_method/migration.sql`
- `server/src/domains/emails/controllers/emailDelivery.controller.js`
- `server/src/domains/emails/mappers/emailDelivery.mapper.js`
- `server/src/domains/emails/routes/adminEmailDelivery.routes.js`
- `server/src/domains/emails/services/emailDelivery.service.js`

### Files Modified

- `client/src/domains/account/api/account.api.js`
- `client/src/domains/account/views/AccountProfileView.vue`
- `client/src/domains/account/views/AccountOrderDetailView.vue`
- `client/src/domains/admin/views/AdminDashboardView.vue`
- `client/src/domains/admin/views/AdminCustomerDetailView.vue`
- `client/src/domains/admin/views/AdminOrderDetailView.vue`
- `client/src/domains/admin/api/adminOrders.api.js`
- `client/src/domains/checkout/api/checkout.api.js`
- `client/src/domains/checkout/views/CheckoutView.vue`
- `client/src/domains/checkout/views/OrderSuccessView.vue`
- `docs/architecture/admin.md`
- `docs/architecture/data-flow.md`
- `docs/architecture/diagram.md`
- `docs/architecture/mockdiagram.md`
- `server/prisma/schema.prisma`
- `server/src/app.js`
- `server/src/domains/account/controllers/account.controller.js`
- `server/src/domains/account/mappers/account.mapper.js`
- `server/src/domains/account/repositories/account.repository.js`
- `server/src/domains/account/routes/account.routes.js`
- `server/src/domains/account/services/account.service.js`
- `server/src/domains/checkout/constants/checkout.constants.js`
- `server/src/domains/checkout/controllers/checkout.controller.js`
- `server/src/domains/checkout/routes/checkout.routes.js`
- `server/src/domains/checkout/services/checkout.service.js`
- `server/src/domains/customers/mappers/adminCustomers.mapper.js`
- `server/src/domains/customers/services/adminCustomers.service.js`
- `server/src/domains/emails/repositories/emailDelivery.repository.js`
- `server/src/domains/emails/services/emailProvider.service.js`
- `server/src/domains/orders/controllers/orders.controller.js`
- `server/src/domains/orders/mappers/orders.mapper.js`
- `server/src/domains/orders/repositories/orders.repository.js`
- `server/src/domains/orders/routes/orders.routes.js`
- `server/src/domains/orders/services/orders.service.js`

### API Routes Added

- `GET /api/admin/notifications`
- `GET /api/account/notifications`
- `POST /api/admin/orders/:orderId/emails/resend`
- `GET /api/checkout/shipping-options`

Existing tracking routes verified/preserved:

- `PUT /api/admin/orders/:orderId/tracking`
- `POST /api/admin/orders/:orderId/tracking/refresh`
- `POST /api/webhooks/shippo`

### Prisma Changes

- Added nullable `Order.shippingMethod`.
- Added migration `20260615000000_add_order_shipping_method`.
- Local migration applied with `npx prisma migrate dev`.
- Final local `npx prisma migrate status`: database schema is up to date with 15 migrations.

### Provider Checks

Local env presence was checked without printing values:

- `RESEND_API_KEY`: present
- `EMAIL_FROM`: missing
- `EMAIL_REPLY_TO`: present
- `RESEND_FROM_EMAIL`: missing
- `RESEND_REPLY_TO_EMAIL`: missing
- `SHIPPO_API_KEY`: present
- `SHIPPO_API_TOKEN`: missing

Resend live email verification:

- Blocked. The app requires `EMAIL_FROM` or `RESEND_FROM_EMAIL` in addition to `RESEND_API_KEY`; neither from-address variable was present locally.
- Emails sent count: `0`.
- Apple Mail verification was not performed because no real emails were sent.

Shippo verification:

- Env presence confirmed for `SHIPPO_API_KEY`.
- No labels were purchased.
- No production shipment was created.
- Shippo documentation notes test mode does not create usable shipped labels and test tracking has limitations, so verification stayed to provider wiring, endpoint protection, normalization tests, and mapper tests.

### Verification Commands

```bash
git status --short
git diff --stat
git diff --name-status
node --check src/app.js
node --check src/domains/account/services/account.service.js
node --check src/domains/customers/services/adminCustomers.service.js
node --check src/domains/emails/services/emailProvider.service.js
node --check src/domains/orders/services/orders.service.js
node --check src/domains/checkout/controllers/checkout.controller.js
cd client && npm run build
cd server && npm run build
cd server && npx prisma migrate dev
cd client && npm run test
cd server && npm run test
cd server && npx prisma migrate status
node -e "import('./src/app.js').then(() => console.log('app import ok'))"
find . -name '.env.example' -o -name '*.env.example'
rg -n "sk_live|rk_live|whsec_|postgres://|postgresql://|RESEND_API_KEY=|SHIPPO_API_KEY=|SHIPPO_API_TOKEN=|EMAIL_FROM=|STRIPE_SECRET_KEY=|ADMIN_PASSWORD_HASH=" --glob '!node_modules/**' --glob '!client/dist/**' .
```

Results:

- Client build passed.
- Server build passed and generated Prisma Client.
- Client tests passed: 5 files, 14 tests.
- Server tests passed: 10 files, 28 tests.
- Server syntax checks passed.
- App import smoke check printed `app import ok`.
- No `.env.example` files found.
- Secret scan found only command text in this handoff, not committed secret values.

Local endpoint smoke checks:

- `GET /api/admin/notifications` unauthenticated: `401`.
- `PUT /api/admin/orders/test-order/tracking` unauthenticated: `401`.
- `GET /api/account/notifications` unauthenticated: `401`.
- `GET /api/checkout/shipping-options`: `200` with standard/priority server-owned methods.

Mermaid/doc checks:

- `mmdc` was not installed locally.
- Markdown fence balance check passed for `diagram.md`, `mockdiagram.md`, `data-flow.md`, and `admin.md`.

### Remaining Blockers

- Configure `EMAIL_FROM` or `RESEND_FROM_EMAIL` locally before live Resend testing.
- After setting the from address, perform the approved Resend tests to `alvarez.a.aaron@gmail.com`, max 10 emails, starting with forgot password.
- Railway must run `npx prisma migrate deploy` after review for `20260615000000_add_order_shipping_method` and any unapplied prior migrations.
- Shippo live tracking refresh still needs a real or predefined valid tracking test strategy; no label purchase should happen in Codex.
- Shippo webhook auto-processing remains intentionally receipt-only until real deployed payloads are verified.
- No browser E2E automation was added for admin notification panels or customer notification preferences.

### Safe-To-Review Status

Local code builds and tests pass. The implementation is safe for code review, but not ready for deployed launch until the Resend from-address env is configured, the Railway migration is deployed, and manual QA confirms live email delivery and admin/customer notification visibility.

## 2026-06-15 Admin Pages, Shippo Rate Shopping, And Email Verification Pass

This section supersedes the earlier same-day provider note that said `EMAIL_FROM` was missing. The current local `server/.env` variable-name audit found `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_FROM_EMAIL`, `EMAIL_REPLY_TO`, and `RESEND_REPLY_TO_EMAIL` present. Values were not printed or copied.

### Completed Code Changes

- Added dedicated admin pages:
  - `/admin/notifications` via `client/src/domains/admin/views/AdminNotificationsView.vue`.
  - `/admin/shipments` via `client/src/domains/admin/views/AdminShipmentsView.vue`.
  - `/admin/reports` via `client/src/domains/admin/views/AdminReportsView.vue`.
- Kept `/admin` compact by moving large notification/shipment blocks into the dedicated pages.
- Added client API `client/src/domains/admin/api/adminShipments.api.js`.
- Expanded notification API filtering in `client/src/domains/admin/api/adminNotifications.api.js`, `server/src/domains/emails/controllers/emailDelivery.controller.js`, `server/src/domains/emails/services/emailDelivery.service.js`, and `server/src/domains/emails/repositories/emailDelivery.repository.js`.
- Added protected `GET /api/admin/shipments` backed by the shipping route/controller/service/repository stack.
- Added checkout rate shopping endpoint `POST /api/checkout/shipping-rates`.
- Added Shippo rate mapping and rate-only shipment creation for checkout rate shopping. Checkout never buys labels.
- Preserved static Standard/Priority shipping fallback when Shippo config, sender address env, address data, or provider calls are unavailable.
- Updated checkout UI to request shipping rates after the address is present, display loading/fallback messages, and submit selected shipping `rateId`, carrier, service, provider, and method.
- Server checkout re-resolves the selected rate before PaymentIntent creation and order creation, so shipping price remains server-owned.
- Added nullable order fields:
  - `shippingCarrier`
  - `shippingService`
  - `shippingRateId`
  - `shippingRateProvider`
- Added migration `20260615001000_add_order_shipping_rate_fields`.
- Admin order detail, customer order detail, and order success now display carrier/service/rate source when present.
- Added tests for Shippo rate mapping, static shipping fallback metadata, and customer-safe shipping-rate fields.

### API Routes Added Or Updated

- `GET /api/admin/notifications?event=&status=&limit=`
- `GET /api/admin/shipments?status=&limit=`
- `POST /api/checkout/shipping-rates`

Protected route checks performed locally:

- `GET /api/admin/notifications` without admin session returned `401 Authentication required`.
- `GET /api/admin/shipments` without admin session returned `401 Authentication required`.
- `POST /api/webhooks/shippo` without the configured webhook secret returned `401 Invalid webhook secret`.

### Shippo Verification

Local env-name audit found `SHIPPO_API_KEY` present, but `SHIPPO_FROM_STREET1`, `SHIPPO_FROM_CITY`, `SHIPPO_FROM_STATE`, and `SHIPPO_FROM_ZIP` missing. Because sender address variables are required for rate shopping, `POST /api/checkout/shipping-rates` returned the static fallback with message `Carrier rates are unavailable. Store shipping rates are shown.`

No labels were purchased. No production shipment was created.

Required server variable names for live/test Shippo rate shopping:

- `SHIPPO_API_KEY` or `SHIPPO_API_TOKEN`
- `SHIPPO_FROM_NAME`
- `SHIPPO_FROM_STREET1`
- `SHIPPO_FROM_CITY`
- `SHIPPO_FROM_STATE`
- `SHIPPO_FROM_ZIP`
- `SHIPPO_FROM_COUNTRY`
- Optional: `SHIPPO_FROM_STREET2`, `SHIPPO_FROM_PHONE`, `SHIPPO_FROM_EMAIL`
- Optional parcel defaults: `SHIPPO_PARCEL_LENGTH`, `SHIPPO_PARCEL_WIDTH`, `SHIPPO_PARCEL_HEIGHT`, `SHIPPO_PARCEL_DISTANCE_UNIT`, `SHIPPO_PARCEL_WEIGHT`, `SHIPPO_PARCEL_MASS_UNIT`

### Resend Verification

Approved inbox used: `alvarez.a.aaron@gmail.com`.

Live emails sent in this pass: `6`, below the requested budget of `10`.

Recorded live `EmailDelivery` rows with provider `RESEND` and status `SENT`:

- `PASSWORD_RESET`: `Reset your Chase & Evie Co. password`.
- `ACCOUNT_VERIFICATION`: `Verify your Chase & Evie Co. email`.
- `ORDER_CONFIRMATION`: `Order DGE-1781505157834 confirmation`.
- `ORDER_SHIPPED`: `Order DGE-1781501526357 has shipped`.
- `TRACKING_UPDATE`: `Tracking update for order DGE-1781501526357`.
- `PROFILE_UPDATED`: `Your Chase & Evie Co. profile was updated`.

What was not fully end-to-end verified:

- Profile update was verified through the account service and email provider path, not browser/customer session API, because the test account password was not available.
- Order resend emails were verified through the order service/email provider path, not admin UI/API, because no plaintext admin password was available in code and secrets were not exposed.
- Review request was not sent because no approved-inbox local order was already `DELIVERED`; the service correctly gates review requests to delivered orders.
- Apple Mail inbox search was not automated from this workspace. The database and Resend provider acknowledgements show sent delivery records; inbox receipt still requires user confirmation.

### Shipping Spoofing Verification

Local smoke request sent `shipping.price: 999` with method `priority` to `POST /api/checkout/preview`. Server response used trusted `shippingAmount: 11.99`, proving client-submitted shipping price was ignored for totals.

### Verification Commands

```bash
git status --short --branch
git diff --stat
git diff --name-status
node --check src/domains/checkout/services/checkout.service.js
node --check src/domains/checkout/controllers/checkout.controller.js
node --check src/domains/shipping/services/shippo.service.js
node --check src/domains/shipping/services/shipping.service.js
node --check src/domains/shipping/controllers/shipping.controller.js
node --check src/domains/emails/services/emailDelivery.service.js
cd server && npx prisma generate
cd server && npx prisma migrate dev --name add_order_shipping_rate_fields
cd client && npm run build
cd client && npm run test
cd server && npm run build
cd server && npm run test
cd server && npx prisma migrate status
cd server && node -e "import('./src/app.js').then(()=>console.log('app import ok'))"
curl http://localhost:3000/api/checkout/shipping-rates
curl http://localhost:3000/api/checkout/preview
curl http://localhost:3000/api/admin/notifications
curl http://localhost:3000/api/admin/shipments
curl http://localhost:3000/api/webhooks/shippo
```

Results:

- Client build passed.
- Client tests passed: 5 files, 14 tests.
- Server build passed and generated Prisma Client.
- Server tests passed: 10 files, 30 tests.
- Prisma migrate status passed with 16 local migrations and database schema up to date.
- Server app import passed with `app import ok`; Better Auth emitted a warning that `BETTER_AUTH_SECRET` should be at least 32 characters.

### Remaining Risks

- Railway must run `npx prisma migrate deploy` for `20260615001000_add_order_shipping_rate_fields` after review.
- Shippo rate shopping needs sender address env variables before live/test carrier rates can be returned.
- Admin pages need browser manual QA after deploying/restarting because terminal smoke checks only verified route protection and API responses.
- Review request email remains unverified for the approved inbox until a delivered order exists.
- Better Auth secret length warning should be resolved in environment configuration with a stronger secret value.

## 2026-06-17 Documentation Operating Model Restructure

This docs-only pass reorganized the oversized project instructions into a concise operating hub plus focused durable documents. No application code was intentionally changed in this pass.

### New Documentation Structure

- `AGENTS.md`: concise permanent entry point, required reading order, core architecture/security/deployment/database/verification rules, and links to focused docs.
- `docs/product-philosophy.md`: premium product philosophy, progressive disclosure, customer/admin usefulness, and feature-design checklist.
- `docs/ux-ui-standards.md`: Tailwind-first styling, visual-system expectations, motion rules, and UI completeness requirements.
- `docs/customer-experience.md`: customer account, profile, orders, order-help, checkout, Apple Pay/Google Pay disabled-state, and shipping-rate UX requirements.
- `docs/admin-experience.md`: admin workspace philosophy, dashboard rules, Order Issues, Internal Issues, Email Template Center, promo email tooling, and save/send separation for order updates.
- `docs/communications.md`: manual-first email policy, account-first communications, send controls, template/provider rules, Resend/Shippo rules, and excluded SMS/Apple Messages channels.
- `docs/operations-and-issues.md`: suggested OrderIssue, OrderIssueMessage, OrderIssueEvent, InternalIssue, and InternalIssueEvent architecture and ownership/audit rules.
- `docs/implementation-roadmap.md`: three-run implementation roadmap and the exact recommended Run 1 prompt.
- `docs/verification-and-qa.md`: repair/launch-readiness priorities, interrupted-work verification, provider verification, docs checks, and final-report requirements.
- `docs/architecture/*`: remains the current architecture/file-flow/database/admin/auth reference set.

### Rules Moved

- Product and feature philosophy moved out of `AGENTS.md` into `docs/product-philosophy.md`.
- Tailwind, visual system, animation, responsive, state, and accessibility standards moved into `docs/ux-ui-standards.md`.
- Customer account/profile/order/checkout/order-help requirements moved into `docs/customer-experience.md`.
- Admin dashboard/tooling/email-template/order-update requirements moved into `docs/admin-experience.md`.
- Resend, Shippo, manual-send, provider, template, dry-run, approved-inbox, no-bulk, no-secret, no-SMS rules moved into `docs/communications.md`.
- Order issue and internal issue model direction moved into `docs/operations-and-issues.md`.
- Repair, verification, provider retry, docs validation, and final-report rules moved into `docs/verification-and-qa.md`.
- Three-run product/admin/final-integration plan moved into `docs/implementation-roadmap.md`.

### Important Policy Changes

- Manual-first email policy is now explicit: automatic emails are limited to essential account/security messages and intentionally retained order confirmation. Order updates, tracking, delivered, support replies, issue resolutions, review requests, apology, promo, and marketing emails require explicit admin action unless the user changes this policy later.
- In-account communication is the default direction for customer issues and order updates.
- Customer-facing email activity history and preferred communication method controls should be removed in the next customer UX implementation pass.
- Twilio/SMS and Apple Messages for Business remain excluded unless the user explicitly requests them.
- Apple Pay and Google Pay should remain disabled/future-only, with copy such as `Coming Fall 2026`, until a complete payment-sheet flow is intentionally built.
- Admin tracking/order status save flows should be separated from customer-send flows.

### Current Three-Run Roadmap

Run 1: Product philosophy, customer account redesign, checkout UX, and supporting database changes.

Run 2: Admin redesign, Order Issues, Internal Issues, and Email Template Center.

Run 3: Final integration, Shippo/email workflows, polish, animations, QA, docs, and launch-readiness report.

### Validation Notes

This pass should be validated with docs-only checks:

- Internal Markdown links for new docs.
- Markdown fence balance.
- Mermaid fence checks if Mermaid blocks are touched.
- Search for outdated automatic-email guidance.
- Search for old Twilio/SMS requirements.
- Search for duplicated product philosophy.
- Search for references to deleted/moved sections.
- Confirm no secret values were copied.
- `git diff --check`.

Client/server builds are not required for this docs-only phase.

### Recommended Run 1 Prompt

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

## 2026-06-17 Product Experience Run 1 / Order Issues Foundation

This pass implemented the first customer-facing product experience slice plus support-case foundations. It preserved guest checkout, Better Auth customer accounts, custom admin auth, checkout totals, Stripe behavior, and manual-first email policy.

### Implemented

- Customer account dashboard now caps recent orders at two and removes customer-facing lifetime spend.
- Dashboard now emphasizes useful state: order count, latest order status, email verification, and open order issue count.
- Profile page removes customer-facing email activity and preferred contact method controls.
- Profile page adds editable default shipping address using `CustomerProfile.defaultAddress`.
- Signed-in checkout prefills name, fixed account email, phone, marketing opt-in, and default shipping address only where checkout fields are empty.
- Customer orders page now uses a responsive split-view/order-list pattern with month grouping and in-page selected order detail.
- Customer order detail hides internal status history, hides zero discount/donation rows, shows product images when stored snapshots exist, and adds a protected Need Help flow.
- Need Help flow creates customer-visible order issue cases with category, affected-item context, description, friendly case number, and confirmation.
- Customer order issues enforce ownership through Better Auth customer account routes.
- Delivered-order issue eligibility uses server-side delivery data. If an order has a shipment `deliveredAt`, that timestamp is trusted. If no shipment timestamp exists but the order status is `DELIVERED`, the code falls back to the order `updatedAt`; this fallback is documented as a remaining precision limitation.
- Pre-delivery orders only expose delivery, tracking, billing, and general help categories.
- Admin dashboard links to new Order Issues and Internal Issues tools.
- Admin Order Issues supports search/filter, status/priority updates, resolution summary, internal notes, and customer-visible account replies.
- Saving an issue or note does not send email. A checkbox can mark email follow-up requested, but sending remains a separate future template action.
- Internal Issues model/API/admin page added for safe operational issue review. Unexpected Express 500s are recorded with sanitized route/source/summary context and a fingerprint.
- Support and internal issue endpoints follow route -> controller -> service -> repository -> Prisma.

### Prisma Models And Migration

Migration added locally and applied to the local database:

- `server/prisma/migrations/20260617000000_add_order_and_internal_issues/migration.sql`

Schema additions/changes:

- Extended `CustomerSupportRequest` with `caseNumber`, `category`, `priority`, `resolutionSummary`, `deliveryEligibilityEndsAt`, `resolvedAt`, and `closedAt`.
- Added `CustomerSupportMessage`.
- Added `CustomerSupportEvent`.
- Added `InternalIssue`.
- Added `InternalIssueEvent`.
- Added `Order.supportRequests` relation.

Railway/deployed database step remaining:

```bash
cd server
npx prisma migrate deploy
```

Run only after confirming the Railway `DATABASE_URL` target is correct. Do not use `prisma migrate reset`.

### API Endpoints Added

Customer, Better Auth protected:

- `GET /api/account/issues`
- `GET /api/account/issues/:caseNumber`
- `POST /api/account/orders/:reference/issues`

Admin, custom admin-auth protected:

- `GET /api/admin/order-issues`
- `PATCH /api/admin/order-issues/:caseNumber`
- `POST /api/admin/order-issues/:caseNumber/messages`
- `GET /api/admin/internal-issues`
- `PATCH /api/admin/internal-issues/:caseNumber`

### Automatic Email Events

No new automatic order, tracking, support, issue-resolution, apology, promo, review, or marketing emails were added.

Removed automatic profile-update email queueing from account profile saves. Essential account/security emails remain governed by Better Auth/email provider behavior.

### Verification Results

Commands run:

```bash
cd server && npx prisma format
cd server && npx prisma generate
cd client && npm run build
cd server && npm run test
cd client && npm run test
cd server && npm run build
cd server && npx prisma migrate status
cd server && npx prisma migrate dev --name add_order_and_internal_issues
cd server && npx prisma migrate status
git diff --check
```

Results:

- `npx prisma format`: passed.
- `npx prisma generate`: passed.
- Client build: passed.
- Server tests: passed, 11 files and 34 tests after adding order issue tests.
- Client tests: passed, 5 files and 14 tests.
- Server build: passed and regenerated Prisma Client.
- Initial `npx prisma migrate status`: failed only because the new migration was unapplied locally.
- `npx prisma migrate dev --name add_order_and_internal_issues`: applied the migration locally and regenerated Prisma Client.
- Final `npx prisma migrate status`: passed, local database schema is up to date.
- `git diff --check`: passed.

### Remaining Risks And Partial Work

- Browser manual QA is still required for the new customer order issue modal, profile address editor, orders split-view, admin Order Issues page, and admin Internal Issues page.
- Railway migration is not applied by this pass.
- Internal issue capture currently covers unexpected Express error middleware paths only; provider-specific dedupe capture for Shippo/Resend/checkout failures should be expanded in the next run.
- Email Template Center, promo email workflow, and explicit Send customer update actions remain future work.
- Admin dashboard was extended with issue links and metrics but not fully reorganized into the suggested operational sections.
- Order issue admin email follow-up is marked only; no template preview/send flow exists yet.
- Delivered eligibility precision depends on `OrderShipment.deliveredAt` when available. Older delivered orders without shipment timestamps fall back to `Order.updatedAt`.

### Manual QA Checklist

- Sign in as a customer and open `/account`.
- Confirm dashboard shows no lifetime spend and only two recent orders.
- Edit profile name, phone, marketing opt-in, and default shipping address.
- Confirm checkout prefills saved address only into empty fields and does not overwrite saved profile on checkout-only edits.
- Open `/account/orders`, use search/filter, expand older month groups, and select orders without a full page reload.
- Open an order detail, confirm product images/pricing rows render correctly and internal status history is absent.
- Submit a Need Help issue on an eligible order and confirm the case number appears.
- Confirm expired delivered-order issues are rejected after the seven-day window.
- Open `/admin/order-issues`, filter/search, update status/priority, add an internal note, and add a customer-visible reply.
- Confirm no email is sent automatically when saving issue changes.
- Open `/admin/internal-issues` and review filters/status/resolution notes.

### Safe For Commit Review

Yes, with the caveat that the new Prisma migration must be reviewed and deployed to Railway separately before deployed code requiring these tables is released.

## 2026-10-08 Approved Calm Essentials Account UI

### Scope And Repository State

Applied the user-approved complete account preview. All seven tabs are retained. The original month-grouped split Orders design is preserved rather than the later simplified draft.

Started with a dirty tree containing prior accepted customer/support/admin/server/schema edits; inspected status, diff statistics, and changed paths before editing. Preserved those unrelated edits. This pass changes client UI and documentation only: no auth replacement, checkout rebuild, admin rebuild, server changes, schema/migrations, provider sends, env files, commits, or pushes.

### Connected Features

- One protected parent AccountLayout with the existing storefront header/footer/search/cart and shared Better Auth state.
- Overview: two recent orders maximum, real order/latest status/open case stats, profile/address summary, shopping/account links.
- Orders: reference/product search, status filter, month groups, eight-row display window, Load more, persistent selection/filter/expanded-month state between tabs, explicit refresh, responsive selected-order details.
- Inline and standalone order details share one component: server totals, items/variant/quantity/unit and line price, shipping snapshots/method, safe carrier link, tracking updates, support eligibility/cases. Zero discount/donation rows remain hidden; donation impact is not an extra charge.
- Profile: focused personal-details and preference editors, marketing opt-in/out, read-only email/verification state, existing password reset entry.
- Addresses: current default shipping address editor using the existing profile API. Additional addresses/billing are future-phase sections.
- Order help: real case list, selected case, customer-visible replies/resolutions; eligible order requests use the existing protected API with server-owned categories/deadlines.
- Rewards and Wishlist: dedicated sidebar routes with clearly labeled future-phase content; no fake balances, favorites, review/reorder actions, or transactions.
- Dialogs: Save/Cancel, input focus, focus trap/restore, scroll lock, idle Escape/backdrop close, retained form/error on failed save.
- Sign-out from either header or sidebar leaves protected content and destroys the Orders cache.
- Verified tablet header overflow fixed by changing existing desktop/compact breakpoints only.

### Files Created

Under `client/src/domains/account/`:

- Components: `AccountLayout.vue`, `AccountDialog.vue`, `AccountStatusBadge.vue`, `AccountOrderDetails.vue`, `AccountOrderIssueDialog.vue`, `AccountProfileEditor.vue`, `AccountCaseDetail.vue`.
- Composables: `useAccountDashboard.js`, `useAccountOrderHistory.js`, `useAccountOrderIssue.js`, `useAccountProfileEditor.js`, `useAccountHelp.js`.
- Views: `AccountAddressesView.vue`, `AccountHelpView.vue`, `AccountFutureView.vue`.
- `constants/account.constants.js`, `mappers/accountProfile.mapper.js`, `utils/accountFormatting.js`, `utils/orderHistory.js`, `styles/account.css`.
- Tests: `client/tests/tier2/account/account-profile-mapper.test.js`, `client/tests/tier3/account/account-history.test.js`.

### Files Modified In This Pass

- `client/src/app/router/index.js`: protected nested account routes, including addresses/help/rewards/wishlist; existing route names and standalone order detail preserved.
- `client/src/app/layouts/SiteHeader.vue`: tablet-safe breakpoints only.
- Account `api/account.api.js`: existing single-case endpoint wrapper.
- Account components `AccountShell.vue`, `AccountNav.vue`, `AccountOrderCard.vue`.
- Account `composables/useAccountOrders.js`: isolated sequenced detail loading; removed unused duplicate list/submission logic.
- Account `validators/account.validators.js`: default address completeness check.
- Account views `AccountDashboardView.vue`, `AccountOrdersView.vue`, `AccountOrderDetailView.vue`, `AccountProfileView.vue`.
- This handoff and [customer experience](docs/customer-experience.md), [data flow](docs/architecture/data-flow.md), [file map](docs/architecture/file-map.md).

### Safety And Sources Of Truth

The existing profile PUT replaces fields, so each focused save sends the complete mapped profile/preferences/address and preserves untouched values. Fresh profile data is loaded when opening an editor. Concurrent editing in another browser can still conflict because the API has no version/patch contract.

The new view does not calculate checkout/order totals. APIs remain credentialed through the existing helper. Server ownership, verified-email matching, support category/eligibility/rate limits, and manual-first communications remain unchanged. Customer replies, a general message center, multiple addresses, separate billing address, rewards, referrals, wishlist, reviews, and reorder are not implemented by this UI pass.

Orders uses client display pagination; the server still returns the entire history. Cached state lasts only within the account layout and is keyed to shared customer identity. Refresh orders retrieves current list/detail snapshots. Existing server payment-status mapping is displayed as provided; this pass does not improve refund/payment reconciliation.

### Verification Commands And Results

- Initial `git status --short --branch`, `git diff --stat`, `git diff --name-status`: prior local changes identified and preserved.
- `cd client && npm run build`: initial default Node 22.15.0 attempt stalled before compilation and was stopped (exit 143). Rerun with the bundled Node 24.19.0 on PATH passed; final Vite 8.0.9 build transformed 257 modules with no build warnings.
- `cd client && npm test`: passed, 7 files / 21 tests (tier 1: 7, tier 2: 8, tier 3: 6). Seven new assertions/tests cover preservation, marketing opt-out, address validation, search/groups, quantity counting, invalid dates, and safe tracking URLs.
- `cd server && npm test`: regression suite passed, 11 files / 34 tests (28 + 3 + 3). No server build/generate/migration needed because this pass does not change server or Prisma files.
- Temporary Playwright harness `node /tmp/doggy-account-ui-qa.cjs` with bundled Playwright and headless Chrome: passed using intercepted fixture APIs, not real customer/database/provider writes. Browser screenshots inspected at 1440, 1280, 1024, 768, and 390 widths.
- `npm run dev -- --port 5174 --strictPort` with the bundled runtime provided a temporary QA server, stopped after verification. The user's existing frontend on port 5173 and backend were not stopped or reconfigured.
- Browser verified: all seven tabs; one header; 20-order load-more/search/status/empty states; selection persistence; slow-response protection; mobile list/detail/back; profile/address save/cancel/error retry; marketing opt-out; focus trap/Escape; support submission/case replies/internal-message exclusion; ineligible order support; direct detail route; sidebar/header sign-out/cache clearing; unauthenticated redirect/sign-in return; cart retained; no Vue/runtime errors or horizontal overflow. Expected fixture 500/401/404 responses exercised error handling.
- A formatting-induced Vue template error was caught and fixed before final checks. Verification harness selector/route-matching issues were corrected and the complete harness rerun successfully.
- Existing lint script: none; none added. No application dependency or lockfile changes. Prettier was used as a temporary formatter only.
- Documentation fence/relative-link check: passed for all four touched Markdown files with zero issues. Final `git diff --check`: passed.
- Targeted secret-pattern scan returned no matches; no `.env.example` files found. No env values were read, changed, or documented.

### Remaining Risks And Manual QA

1. Sign in with a real account; navigate every tab on desktop/mobile/Safari; verify cookies and refresh persistence.
2. Edit name/phone, cancel, save, reload; confirm header identity and that address/preferences remain unchanged.
3. Edit default address; verify only empty checkout fields are prefilled and existing orders retain their snapshots.
4. Opt out/in of marketing, reload, verify preferences. Saving must not send an email.
5. Use real order history (including more than eight orders), search/filter/load/refresh/select older orders; verify product images and monetary snapshots.
6. Submit one approved test support request on an eligible order; verify admin receives it, customer-visible reply/resolution appears, internal notes do not appear, and expired/foreign orders are rejected. No automatic provider email.
7. Verify guest and signed-in checkout, promo/campaign combinations, success page, and existing admin pages in the real environment. This pass did not rerun live Stripe payments or deploy.
8. Rewards/Wishlist and other future sections must remain honest placeholders without accidental writes.
9. Review the earlier support migration `20260617000000_add_order_and_internal_issues` and Railway status before deploying the combined dirty tree. This pass did not apply or inspect Railway migrations.

Safe for focused commit review after the documented checks, but not a claim that the combined prior server/migration edits are deployed or launch-verified. No commit/push performed. Next phase: real-account/Safari/checkout/support QA before expanding the address book or customer messaging.

## 2026-10-08 Approved Calm Workspace Admin UI

### Scope And Repository State

Applied the approved Calm Workspace across all eleven existing admin tabs, with connected existing APIs rather than demo records. Preserved custom admin auth, customer Better Auth, server authorization, startup data-target configuration, existing API contracts/mappers/validators, storefront/account/checkout, and all prior local edits.

Before editing, inspected AGENTS.md, this handoff, product/UX/admin/communications/operations/roadmap/architecture/QA docs and ran git status, diff statistics, and changed-path inventory. The tree already contained accepted account/support/server/schema work. This phase changes client UI, one icon dependency, focused tests, and documentation only. No server/schema/env changes, migrations, deployments, real provider actions, commits, or pushes.

### Connected Experience

- Shared AdminLayout: one header and grouped sidebar, eleven route links, mobile navigation, active-route state, skip link, View store/sign-out, signed-in identity, read-only Data routing with the existing backend-derived badge.
- Overview: three concise metrics, priority links for pending orders/issues/email/internal failures, three recent orders. Sources load independently; failures are unavailable, not invented zeroes.
- Products: status/category/SKU search, one responsive table, real variant prices/stock, create/edit/cancel/save/delete. Editor has Details, Variants & Stock, Storefront Content, and Publishing. Inventory attention is restricted to inventory-limited products and stored low-stock thresholds.
- Promos: searchable/type/status library, focused rules/limits/schedule editor, explicit Save/Cancel, code generation, tester, in-page analytics/redemptions and order links. Tester requires normalized customer email, clears stale results after changes, and displays the server-returned discount.
- Campaigns: searchable/status library, beneficiary/rule/product/schedule editor, explicit Save/Cancel/delete, and in-page impact/attributed-order links. Generated donations are not described as payouts.
- Orders: reference/customer/email/phone/city search and status table including refunded orders; focused detail with items, server-owned totals, contact/shipping, promo/campaign snapshots, staged status Save/Cancel/history, tracking save/refresh, and separate existing manual email actions.
- Customers: account/verification/role/order metrics, linked and verified-email matched guest orders, provider history, deliberate confirmed deactivate/reactivate/security-email requests with busy/error feedback. No passwords/sessions/tokens or new account permissions are exposed.
- Shipments: provider configuration state, status filters, tracking/carrier/history/order links, and failure/empty/loading states.
- Notifications: event/status delivery history, explicit mocked/sent/failure distinctions, future Template center tab. No editable templates or bulk sends are implemented.
- Reports: truthful all-time operational summaries. The existing totalRevenue API sums all stored orders, so the UI calls it Order value, not reconciled paid revenue. Date ranges/charts/exports remain future work.
- Order/Internal Issues: focused list/detail, staged Save/Cancel, busy/error feedback, failed-write draft retention, filtered-selection repair, and real event history. Internal notes are separate from customer-visible replies. Marking email follow-up does not send email.
- Future template/promo email/reconciled reports/customer notes/activity/reviews/loyalty sections are visibly unconnected. Existing working resend/tracking/customer actions remain available.

### Verified Issues Fixed

- Promo rule watcher previously returned a fresh watched array then replaced its own form object, causing recursive Vue updates. It now watches individual primitive sources. The new test suite exposed this; the complete suite was rerun cleanly.
- Admin promo tester previously described email as optional despite server email eligibility rules. It now requires/normalizes email and discards stale test/analytics responses.
- Older grouped Orders UI omitted REFUNDED records from every group. The new single filtered table includes all returned statuses.
- Several operational views failed silently or lacked error/busy states; their new composables preserve the last loaded data or unsaved draft and surface failures.
- Issue selection could remain pointed at a case excluded by new filters. Selection now matches the loaded list, and Cancel restores server values.
- Shared nested detail routes are keyed by path to prevent stale order/customer data when navigating between IDs.
- CSS initially lacked a Tailwind reference for @apply; build failure was fixed with @reference.
- Responsive button utilities were overridden by the shared unlayered button style; desktop/mobile navigation display is now explicit.
- Select fields now have explicit accessible names matching visible labels.
- A formatter removed semicolons from a multi-statement Vue schedule handler; compile failure was fixed by extracting the named clearPeriod handler, then rebuilding and rerunning the browser checks.

### Files Created

- `client/src/domains/admin/api/adminSession.api.js`
- `client/src/domains/admin/components/AdminCampaignImpact.vue`
- `client/src/domains/admin/components/AdminIcon.vue`
- `client/src/domains/admin/components/AdminIssueHistory.vue`
- `client/src/domains/admin/components/AdminLayout.vue`
- `client/src/domains/admin/components/AdminMetrics.vue`
- `client/src/domains/admin/components/AdminPageHeader.vue`
- `client/src/domains/admin/components/AdminProductContentFields.vue`
- `client/src/domains/admin/components/AdminProductVariantsEditor.vue`
- `client/src/domains/admin/components/AdminPromoAnalytics.vue`
- `client/src/domains/admin/components/AdminScheduleFields.vue`
- `client/src/domains/admin/composables/useAdminActivity.js`
- `client/src/domains/admin/composables/useAdminIssueWorkspace.js`
- `client/src/domains/admin/composables/useAdminOrderDetail.js`
- `client/src/domains/admin/composables/useAdminOrderIssues.js`
- `client/src/domains/admin/composables/useAdminOverview.js`
- `client/src/domains/admin/constants/adminNavigation.constants.js`
- `client/src/domains/admin/constants/adminSupport.constants.js`
- `client/src/domains/admin/utils/adminWorkspace.formatters.js`
- `client/tests/tier2/admin/admin-workspace.test.js`

### Files Modified In This Phase

The two issue views existed in the starting tree as untracked earlier work; they are modified here, not claimed as newly created by this phase.

- `client/src/assets/styles/admin.css`
- `client/src/domains/admin/components/AdminCampaignForm.vue`
- `client/src/domains/admin/components/AdminCampaignsLibrary.vue`
- `client/src/domains/admin/components/AdminCampaignsTable.vue`
- `client/src/domains/admin/components/AdminCustomerNotificationsPanel.vue`
- `client/src/domains/admin/components/AdminCustomerOrdersPanel.vue`
- `client/src/domains/admin/components/AdminCustomersTable.vue`
- `client/src/domains/admin/components/AdminHeader.vue`
- `client/src/domains/admin/components/AdminOrderNotificationsPanel.vue`
- `client/src/domains/admin/components/AdminOrderStatusPanel.vue`
- `client/src/domains/admin/components/AdminOrderTrackingPanel.vue`
- `client/src/domains/admin/components/AdminProductFormPanel.vue`
- `client/src/domains/admin/components/AdminProductVariantEditor.vue`
- `client/src/domains/admin/components/AdminProductsTable.vue`
- `client/src/domains/admin/components/AdminPromoFormExtraFields.vue`
- `client/src/domains/admin/components/AdminPromosLibrary.vue`
- `client/src/domains/admin/components/AdminSidebar.vue`
- `client/src/domains/admin/composables/useAdminCampaigns.js`
- `client/src/domains/admin/composables/useAdminOrders.js`
- `client/src/domains/admin/composables/useAdminProducts.js`
- `client/src/domains/admin/composables/useAdminPromos.js`
- `client/src/domains/admin/views/AdminCampaignsView.vue`
- `client/src/domains/admin/views/AdminCustomerDetailView.vue`
- `client/src/domains/admin/views/AdminCustomersView.vue`
- `client/src/domains/admin/views/AdminDashboardView.vue`
- `client/src/domains/admin/views/AdminNotificationsView.vue`
- `client/src/domains/admin/views/AdminOrderDetailView.vue`
- `client/src/domains/admin/views/AdminOrdersView.vue`
- `client/src/domains/admin/views/AdminProductsView.vue`
- `client/src/domains/admin/views/AdminPromosView.vue`
- `client/src/domains/admin/views/AdminReportsView.vue`
- `client/src/domains/admin/views/AdminShipmentsView.vue`
- `client/src/domains/promos/components/PromoCodeTester.vue`
- `client/src/domains/promos/components/PromoForm.vue`
- `client/src/domains/admin/views/AdminInternalIssuesView.vue`
- `client/src/domains/admin/views/AdminOrderIssuesView.vue`
- `client/src/app/router/index.js`
- `client/package.json`
- `client/package-lock.json`
- `PROJECT_HANDOFF.md`
- `docs/admin-experience.md`
- `docs/architecture/admin.md`
- `docs/architecture/file-map.md`
- `docs/verification-and-qa.md`
- `docs/implementation-roadmap.md`

### Architecture And Sources Of Truth

Admin navigation is centralized in adminNavigation.constants.js. AdminLayout owns shared identity/data routing, and adminSession.api.js wraps the existing credentialed auth endpoints. The login page and existing route guard remain unchanged; server-side requireAdminAuth remains the security boundary.

Existing product/promo/campaign APIs, mappers, and validators still serialize/validate saves. AdminScheduleFields only edits paired date/time fields; existing datetime/timezone behavior is preserved, not redesigned. Product variant fields use the original size keys and mapper contract.

State additions are focused: useAdminOverview aggregates existing protected reads; useAdminActivity handles delivery/shipment loading; useAdminOrderDetail owns record actions; useAdminIssueWorkspace shares issue selection/staging; useAdminOrderIssues owns reply drafts. Icons are centralized through @lucide/vue. Tailwind remains primary, and admin styling is scoped in admin.css.

No new endpoints, role changes, auth bearer fallback, schema models, migrations, runtime data-target switches, checkout pricing, or provider automation were introduced. The temporary workflow remains local client -> local server -> selected local/Railway database. Badge fallback behavior is unchanged: when its API fails, it falls back to startup client configuration; confirm the backend before a real write.

Some obsolete list/header/stat/group/modal components remain unused by the new route views. Remove those only after a dedicated import audit. Existing list endpoints still return broad/full data sets; client-side filtering is not server pagination.

See [admin experience](docs/admin-experience.md), [admin architecture](docs/architecture/admin.md), [file map](docs/architecture/file-map.md), [verification](docs/verification-and-qa.md), and [roadmap](docs/implementation-roadmap.md).

### Verification Commands And Results

- Initial git status --short --branch, git diff --stat, git diff --name-status: inspected and preserved prior edits; branch dev-main remains ahead by two pre-existing commits.
- npm install @lucide/vue: succeeded; package/lockfile add the icon dependency only. Deprecated lucide-vue-next was tried and removed; it is not in the final dependency list.
- cd client && npm run build: final Vite 8.0.9 production build passed, 2142 modules transformed, no build warnings. Initial Tailwind reference and post-format schedule expression errors were repaired before the final pass.
- cd client && npm test: final pass 8 files / 30 tests (tier 1: 7, tier 2: 17, tier 3: 6). Nine new tests cover navigation boundaries, SKU/category filtering, cancel without writes, email normalization, stale responses, activity failures, selection repair, and failed-save retry. Initial new-test run detected recursive watcher updates; fixed and rerun.
- cd server && npm test: unchanged-server regression suite passed, 11 files / 34 tests (28 + 3 + 3). No server build/generate/migration required by this client-only phase.
- npm exec --yes --package=prettier -- prettier --write --single-quote --no-semi [focused changed client files]: passed as temporary tooling only; no formatter or lint dependency/script added.
- npm audit --omit=dev --json in client: exit 1, 10 existing advisories (2 moderate, 8 high), also reported before the icon dependency. No automatic dependency upgrades/audit fix were attempted.
- npm run dev:local -- --port 5174 --strictPort: temporary QA server started successfully; stopped at completion. Existing frontend 5173/backend were not stopped or reconfigured.
- node /tmp/doggy-admin-workspace-qa.cjs using bundled Playwright/headless Chrome: passed. All eleven tabs at 1440/1024/768/390/320 widths; 16 intercepted fixture requests exercising saves/auth/validation, zero real database/provider writes.
- Browser checked product cancel/update with distinct prices and preserved fields, promo edit/schedule/email requirement/invalidation/analytics link, campaign selection/save/impact link, refunded orders, staged status cancel/save/history, detail ID navigation, tracking save, an explicitly clicked mocked email resend, customer deactivate/reactivate, support failed-save retry/internal note/account reply/filter selection, internal notes, load errors/retry, future sections, both backend target badge labels, mobile navigation, direct-route guard/login return/logout, reduced-motion/dark mode, and return to storefront without admin shell.
- Final browser run had zero Vue/runtime/console errors and zero horizontal overflow in the tested screens. Earlier harness selector issues and an intentionally blocked eager Stripe loader were corrected in the harness; Stripe.js is stubbed for this admin-only fixture QA, not changed in app code.
- Screenshots inspected for overview/products/promos/campaigns/issues/editor/order detail and mobile layouts. Product image in screenshots is a local fixture asset, not a claim about live catalog photography.
- Existing http://localhost:5173/admin returned HTTP 200. This confirms the development page is reachable, not a real authenticated DB verification.
- Documentation relative-link/fence checks, secret-pattern/environment-example checks, and final git diff --check: see final verification note below.

### Remaining Risks And Manual QA

1. Real admin login/session persistence/logout on Safari and the deployed environment remain unverified. Existing cross-site cookie limitations are unchanged; use local admin -> local server -> Railway DB for the temporary workflow.
2. Start fully local server/client, verify LOCAL DATA TARGET, and use an approved local test record for product/promo/campaign CRUD; confirm values persist after reload.
3. Start Railway DB server with the normal local client, verify RAILWAY DB TARGET and network origin before an explicitly approved test write; confirm Vercel storefront receives only intended changes.
4. Verify product content/analysis, size prices/stock/SKUs/thresholds, selling modes, promo unique/referral limits/date boundaries, campaign eligibility and combined checkout calculations with real test data.
5. Test order status Cancel/Save/history, tracking save/refresh/provider-disabled behavior, separate email action, issue resolution/account reply/internal note privacy, and customer account actions. Real emails require explicit approval and an approved inbox.
6. Recheck guest and signed-in checkout, cart variants, Stripe test payment, success page, promo/campaign coexistence, and customer ownership after deployment. No live payment was performed in this phase.
7. Review earlier support migration 20260617000000_add_order_and_internal_issues and confirm Railway migration status before deploying the combined dirty tree; no Railway migrations were inspected or applied here.
8. Schedule a focused dependency advisory remediation pass. Large catalog/order/customer histories still need server pagination; reporting still needs payment reconciliation and date-range endpoints.
9. Existing schedule timezone interpretation, badge fallback on API failure, data-refresh snapshots, and older unused UI components remain follow-up items.

Safe for focused commit review after the documented checks, not a claim that all prior server/schema changes are launch-ready or deployed. No commit or push performed. Recommended next phase: controlled real-admin/Safari and data-target QA, then approved email template/manual-send workflows and dependency security remediation.


## 2026-10-09 Calm Workspace Action Visibility And Admin Investigation

### Scope And Starting State

Read AGENTS.md, the current handoff, product/UX/customer/admin/communications/operations/roadmap/architecture/QA instructions. Initial git status was clean on dev-main; diff statistics and name-status were empty. This is a focused follow-up to the accepted Calm workspaces, not a dashboard, checkout, or auth rebuild.

Preserved storefront layout, cart/auth/search state, Better Auth customer ownership, custom admin authorization, existing catalog/promo/campaign/order actions, staged Save/Cancel, server-owned pricing and payment behavior, signed-in identity, and startup data routing. No commits/pushes, live DB/provider writes, email sends, migrations, environment file changes, new packages, or deployment actions.

### Implemented Changes

- Gray translucent surfaces and clearer borders for account/admin navigation, links, edit buttons, fields, disclosures, record choices, recent/linked-order links, and mobile account navigation. Primary/selected green and keyboard/disabled states remain. Read-only statistics/future content do not receive false button affordances.
- Whole customer rows navigate on ordinary clicks, while the real link remains accessible by Tab/Enter and supports native link behavior. Text selection does not trigger row navigation. Full email and full customer ID are visible, and customer search now includes ID, so same-name records remain distinguishable.
- Restored existing order-value thresholds: Standard below 100, Gold from 100, Platinum from 200, Diamond from 350, Gem from 500, using current USD order totals. Added row accents, amount colors, labeled tinted badges, and a matching detail badge. These are per-order value categories, not persisted customer loyalty tiers.
- Order sidebar exposes the saved PaymentIntent ID, order ID, linked customer account, currency, updated time, and expandable saved record fields. Server snapshot covers every Order scalar plus safe item/usage/status/shipment/event/delivery/support records.
- Customer sidebar exposes customer ID, updated time, phone, consent, and expandable User/profile/address/preferences/account-event/support/review/loyalty/delivery records. Related foundation records are read-only when present; no new loyalty/review/support management functionality is implied.
- Explicit existing order writes are followed by the protected detail GET. If refresh fails after a successful write, the saved result stays visible, the stale internal snapshot is removed, and the message distinguishes the failed read from the completed write.
- Existing order/customer admin routes still use requireAdminAuth. Inspection uses server allowlists, not arbitrary object/DB export. Authentication Account/Session/Verification rows, passwords, tokens, raw shipment provider payloads, arbitrary account/ledger/email metadata, dedupe keys, and email action URLs are excluded.

### Stripe Dashboard Setup

Admin order detail includes Stripe dashboard settings with Save/Cancel. Store only the public payments-list base from the intended Stripe account, without the final payment ID, credentials, query or fragment. The current order's valid stored pi_ identifier is appended automatically. The supplied account-specific URL/payment ID was not hardcoded or copied into source/docs.

Accepted configuration is HTTPS on dashboard.stripe.com, optionally account-scoped, with test or live payments paths. Other origins/paths and client-secret-shaped IDs are rejected. External links use noopener noreferrer. The UI shows Test dashboard or Live dashboard based on the selected base.

The non-secret setting persists per browser under doggy-admin-stripe-payments-url. Browser settings override the optional public Vite default, VITE_STRIPE_DASHBOARD_PAYMENTS_URL. Clearing the saved setting disables links in that browser. Storage failure surfaces an error instead of pretending persistence succeeded.

Environment/deployment requirements:

- Optional client/Vercel variable: VITE_STRIPE_DASHBOARD_PAYMENTS_URL, the public Stripe payments-list location. No API secret belongs in it. Use ignored local client config or Vercel; restart/rebuild/redeploy for build-time default changes.
- No new Railway variable is needed. Existing API, auth, Stripe, and DB variable requirements remain unchanged.
- Deploy the focused server changes through the normal reviewed Railway deployment to expose the new internalRecord fields, then redeploy the client on Vercel. No new Prisma migration is needed by this pass; do not automatically apply unrelated migrations.
- Temporary DB workflow stays local client -> local server -> chosen local/Railway DB. Stripe link settings are not a runtime data-target switch.

Limitations: the current Order table does not persist Stripe live/test mode or account scope. One configured base applies to that browser's order links; switching it to live does not turn historical test IDs into live payments. Verify account/mode when switching DB targets. Actual Stripe dashboard login/account access remains unverified.

### Files Created

- `client/src/domains/admin/components/AdminCustomerInternalPanel.vue`
- `client/src/domains/admin/components/AdminOrderInternalPanel.vue`
- `client/src/domains/admin/components/AdminOrderValueBadge.vue`
- `client/src/domains/admin/components/AdminRecordFields.vue`
- `client/src/domains/admin/components/AdminRecordInspector.vue`
- `client/src/domains/admin/components/AdminStripeDashboardSettings.vue`
- `client/src/domains/admin/composables/useAdminStripeDashboard.js`
- `client/src/domains/admin/utils/stripeDashboard.js`
- `client/tests/tier2/admin/admin-internal-records.test.js`
- `server/src/domains/customers/mappers/adminCustomerRecord.mapper.js`
- `server/src/domains/orders/mappers/adminOrderRecord.mapper.js`
- `server/src/shared/utils/recordFields.js`
- `server/tests/tier2/admin/internal-record-auth.test.js`
- `server/tests/tier2/admin/internal-records.test.js`

### Files Modified

- `PROJECT_HANDOFF.md`
- `client/src/assets/styles/admin.css`
- `client/src/domains/account/components/AccountOrderCard.vue`
- `client/src/domains/account/styles/account.css`
- `client/src/domains/admin/components/AdminCustomerOrdersPanel.vue`
- `client/src/domains/admin/components/AdminCustomersTable.vue`
- `client/src/domains/admin/composables/useAdminCustomers.js`
- `client/src/domains/admin/composables/useAdminOrderDetail.js`
- `client/src/domains/admin/utils/adminOrders.utils.js`
- `client/src/domains/admin/views/AdminCustomerDetailView.vue`
- `client/src/domains/admin/views/AdminCustomersView.vue`
- `client/src/domains/admin/views/AdminOrderDetailView.vue`
- `client/src/domains/admin/views/AdminOrdersView.vue`
- `docs/admin-experience.md`
- `docs/architecture/admin.md`
- `docs/architecture/file-map.md`
- `docs/customer-experience.md`
- `docs/ux-ui-standards.md`
- `docs/verification-and-qa.md`
- `server/src/domains/customers/mappers/adminCustomers.mapper.js`
- `server/src/domains/customers/services/adminCustomers.service.js`
- `server/src/domains/orders/repositories/orders.repository.js`
- `server/src/domains/orders/services/orders.service.js`

### Verification Commands And Results

- Initial git status --short --branch, git diff --stat, git diff --name-status: clean starting tree, no prior uncommitted work to revert.
- cd client && npm run build: final production build passed, Vite 8.0.9, 2150 modules transformed, no build warnings.
- cd client && npm test: default Node 22.15.0 attempt stalled before test execution and was stopped (exit 130). Rerun with the bundled Node 24 runtime on PATH passed: 9 files / 38 tests (7 + 25 + 6). Eight new tests cover validated links, public setting persistence, tier thresholds/contrast, unique customer lookup, and post-save record refresh/failure.
- cd server && npm run build: passed; generated Prisma Client 6.16.2 from the unchanged schema. No DB/migration command ran.
- cd server && npm test: passed, 13 files / 40 tests (28 + 9 + 3). Six new tests cover complete Order/User scalar coverage against Prisma DMMF, secret-canary omission, admin-only repository opt-in, and actual Express route middleware with simulated admin/customer sessions.
- node --check on all nine touched/new server JS/test files: passed. This checks syntax without starting the production app or exposing env values.
- Temporary Prettier formatting of focused new files and touched Vue/CSS files: passed; no dependency or lint script added. Existing lint scripts: none.
- Temporary npm run dev:local -- --port 5175 --strictPort: started for fixture-only QA; stopped at completion. Existing user frontend/backend processes were not stopped or reconfigured. Existing localhost:5173/admin returned HTTP 200, which confirms page availability, not live DB/session verification.
- node /tmp/doggy-admin-current-qa.cjs: existing eleven-tab admin regression harness passed at 1440/1024/768/390/320 widths, 16 intercepted fixture mutations, zero real writes. CRUD/status/tracking/email/customer/issue errors, mobile navigation, routing/auth redirect/logout, and storefront exit remained working.
- node /tmp/doggy-account-current-qa.cjs: existing seven-tab account harness passed. Cart/order state, 20-order search/load-more, detail races, profile/address Save/Cancel/failure retention, support visibility, dialogs/focus, mobile navigation, sign-out and auth return retained. Expected intercepted 500/401/404 responses exercised errors.
- node /tmp/doggy-calm-refinements-qa.cjs: focused browser harness passed at 1440/1024/768/390/320 widths. Verified tier colors, safe test/live URL edits, Save/Cancel/reload persistence, dynamic IDs, read-only fields, refreshed status record, full-row/non-name-cell and keyboard navigation, duplicate-name disambiguation, customer/internal UI separation, action backgrounds, and no horizontal overflow. One intercepted status mutation, zero real DB/provider writes.
- Final focused run had zero Vue/runtime/console errors or warnings. Stripe.js was stubbed with its expected version for admin/account fixture QA; no real payment was tested and no Stripe application code changed.
- Visually inspected desktop order tiers, order/customer inspector, customer list, and mobile account/admin screenshots. Screenshot names/emails/IDs/order amounts are fixtures, not real records.
- Browser QA caught and repaired a details toggle timing bug that could clear a quickly entered Stripe draft; reset now occurs on the explicit summary click. It also caught unlayered shared badge CSS overriding tier utility colors; a dedicated tier style restores distinct tints. Nested record disclosure and Stripe stub selectors were repaired in the harness and the full focused run repeated successfully.
- Badge foreground contrast was calculated against its tinted surface; Standard/Gold/Platinum shades were darkened and all five now meet the tested 4.5 minimum. This is not a claim of complete WCAG certification.
- Documentation link/fence and targeted source/doc secret-pattern checks: seven docs / thirty source-test files passed with zero issues. Three historical handoff secret-scan command examples were recognized as patterns, not real credentials. Mermaid content was not changed.
- No .env.example files found; no env values read, copied, edited, or documented. Final git diff --check passed.

### Remaining Risks And Manual QA

1. Sign in with a real admin and a real customer on desktop/mobile/Safari; inspect action visibility, disabled/focus states, and that shared cart/auth state remains intact.
2. On a permitted test order, inspect every record category, confirm the linked customer, save/cancel a status change, reload, and verify DB history/inspector consistency. Follow-up reads are current snapshots, not live polling.
3. Paste the approved Stripe payments-list base in the admin setting, save/reload, and open two different orders. Confirm the correct Stripe account and test/live mode; do not paste API keys or client secrets.
4. Test browser private-storage restrictions and a rejected URL. Changes are browser-local; different browsers/administrators may require their own setting.
5. Verify same-name customers by email/ID, whole-row click, keyboard link, and ID search. Review safe profile/preferences/events/support records against permitted DB data.
6. Inspect real guest/customer endpoints/network responses and ensure the new internalRecord never appears. Auth/session cryptography and deployed cookies were not retested by fixture sessions.
7. Real Railway DB reads/writes, Safari cookies, deployment, Stripe payment/dashboard access, checkout payments, inventory and real provider sends remain unverified here. Existing payment/checkout unit regressions pass; no live transaction was made.
8. Record inspection is intentionally not every database byte: raw provider/credential metadata is excluded, delivery history keeps the existing twenty-record limit, support message/event details remain in the dedicated issue tool, and linked orders retain existing panels. Large histories still need server pagination.
9. Previous dependency advisories and any pre-existing deployment/migration gaps remain separate launch work. No dependencies/schema/migrations changed in this pass.

Safe for focused commit review after the documented automated checks, not an assertion of production launch readiness. No commit/push performed. Next recommended step: controlled real-admin/Safari/Stripe-link and data-target QA, then dependency remediation and approved manual email-template work.

## 2026-10-09 Calm Giving Storefront And Campaign Editor

### Scope And Reconciliation

Implemented the user's approved Calm Giving direction, retaining every original homepage content area and the fundamental blue/yellow/brown/oat palette, with subtle emerald backgrounds for campaign-eligible products. The public campaign page is a readable story/contribution/shopping page, not an FAQ panel. The editor keeps existing admin navigation/identity/data routing on the left, the actual shared page renderer in the middle, and selected-section fields plus Save/Cancel on the right.

Initial git status/diff statistics/name-status were inspected. The tree already contained 23 modified and 14 new files from the accepted action-visibility/internal-record phase above; those edits were preserved. This is not an account/admin/checkout/auth rebuild or a broad refactor. No commit or push performed. No new dependency, package script, environment file, provider send, payment, shipment, runtime upload, or data-target switch was introduced.

The user's follow-up explicitly requested applying the update to Railway. The reviewed additive campaign migration was applied after a secret-safe target/checksum/pending-migration preflight. **Database changes are applied; server and Vercel application code are not deployed.** This section supersedes older uncertain migration notes: all eighteen repository migrations now match Railway, including the earlier support/Better Auth migrations. It does not establish deployed auth/provider/payment correctness.

### Storefront Fixes And Content

- Fluid full-width homepage sections: hero, featured product, collection, Next Drops, Happy Pups/social proof area, Made With Care, Ingredient Promise, Meet the Brand, and actual shopping help. Empty Next Drops remains visible honestly. Gray secondary controls/borders and stable product media/action sizes improve click visibility and responsive boundaries.
- Shared responsive header avoids cramped navigation/search/account/cart, retains existing Better Auth/cart/search state, supports mobile menu/Escape/route close, and keeps desktop account hover buffered. Browser QA caught hover opening followed by a click immediately closing the menu; a separate pinned-click state fixes that. Outside-click detection uses composed paths so clicking a replaced SVG menu icon does not close the menu accidentally.
- Raw database variant order caused 6 oz/18 oz display and default-price inconsistency. `productVariants.js` now sorts active variants deterministically without mutation. The client product mapper converts variant cents exactly once; card/featured price and cart size come from the same per-product selection. Invalid size changes are ignored; zero prices use nullish defaults. Price sorting uses starting variant price, so selecting a size does not move the card.
- Featured product comes from the unfiltered active catalog, not current search/sort results. Featured image/title remain non-clickable. Quick view initializes from the selected card size, maintains its own quantity/size, closes when adding, traps keyboard focus, supports Escape, and restores focus. Explicit image/Quick View controls replace whole-card keyboard/click bubbling.
- Category/protein filter options reflect active products. Product image error fallback is honest. Closed cart is inert and has the actual controlled ID. Blocked local storage does not crash in-memory shopping.
- Removed unsupported free-shipping threshold, invented nutrition analysis, fake verified-review quotes, fake social destinations, and active-looking Notify Me actions without a subscription service. Happy Pups gallery remains; verified customer stories/reviews are explicitly future work. Ingredient/storage display reads actual selected product content. Existing stock photography is retained, not represented as proof of actual customers/products/Chase and Evie.

### Campaign Page And Visual Editor

- New public route `/campaigns/:slug`, safe public summary/detail APIs, separate catalog/giving error recovery, and sequenced slug loads. Active campaign summaries match product IDs and prioritize featured campaigns. A legacy eligible campaign without an enabled page still gets a plain green badge; missing public page content does not disable existing giving.
- Public content leads with campaign introduction/optional image, beneficiary/link, optional escaped story paragraphs, giving rule/schedule/generated contribution, and eligible active treats. Fixed giving is labeled once per eligible order; percentage giving uses eligible product sales. There is no extra donation charge in checkout. Generated amounts are explicitly not confirmation of funds paid out.
- Enabled Active/Paused/Ended pages are readable; Draft/Archived are excluded. Paused/ended purchases remain available as ordinary purchases with a clear no-current-contribution notice. Active pages outside their schedule explain the window. Existing slug is stable after rename.
- `CampaignPageContent.vue` is the single public/editor renderer, with responsive scoped styles and immutable storefront brand aliases. This fixes inherited admin colors/heading sizes in the canvas. Editor-only handles select Introduction & image, Who it supports, The story, Giving & schedule, Eligible treats, or Publishing. Product/customer/external-link actions cannot run in the canvas.
- Focused inspector fields use the same draft shown on the canvas. Save is explicit, Cancel confirms discarded edits, saving disables fields/actions, and failed Save retains the draft. List-refresh errors after successful writes are distinguished from save failures. Existing campaign library/impact/order links remain intact.
- Client mappers hydrate forms, project the canvas, and serialize local date/time to ISO while preserving untouched timestamp precision. Validators are separate. Server create/update validation covers enums, dates, rule bounds, bounded content, publishing requirements, and HTTPS URLs without embedded credentials. Existing image/featured flags are preserved and now editable.
- Public responses are explicitly allowlisted and never return campaign revenue, internal order count, attribution rows, emails, arbitrary private fields, or admin records. Every management action remains behind custom server-side admin auth. Checkout pricing, campaign attribution/idempotency, Stripe, inventory, promos, customer ownership, and Better Auth were not rebuilt.

### Files Created

Paths below are relative to the repository; grouped braces enumerate files, not literal directory names.

- `client/src/domains/products/utils/productVariants.js`, `mappers/product.mapper.js`, `ProductCard/ProductCampaignBadge.vue`.
- `client/src/domains/storefront/styles/{storefront,siteHeader}.css`, `Home/sections/ShopHelpSection.vue`.
- `client/src/domains/campaigns/api/publicCampaigns.api.js`, `components/{CampaignPageContent,CampaignPageSection}.vue`, `composables/{useStorefrontCampaigns,useCampaignPage}.js`, `utils/campaignPresentation.js`, `styles/campaignPage.css`, `views/CampaignView.vue`.
- `client/src/domains/admin/components/AdminCampaignSectionFields.vue`, `constants/adminCampaignEditor.constants.js`, `validators/adminCampaign.validator.js`.
- `server/src/domains/campaigns/mappers/publicCampaign.mapper.js`.
- `server/prisma/migrations/20261009000000_campaign_public_page/migration.sql`.
- `client/tests/tier1/cart/product-variant-ordering.test.js`, `client/tests/tier2/admin/campaign-page-editor.test.js`, `server/tests/tier2/admin/{public-campaigns,public-campaign-repository}.test.js`.

### Files Modified In This Phase

- `client/src/app/layouts/{SiteHeader,SiteFooter,PromoStrip}.vue`, `client/src/app/router/index.js`, `client/src/assets/styles/main.css`.
- `client/src/domains/storefront/Home/HomeView.vue`, `Home/sections/{HeroSection,ProductSpotlightSection,ProcessSection,IngredientsAnalysisSection,ReviewsPreviewSection,AboutBrandSection}.vue`.
- `client/src/domains/products/ProductCard/{ProductCard,ProductCardImage,ProductCardInfo,ProductCardVariantSelector,ProductCardPriceStatus,ProductCardActions,ComingSoonCard}.vue`, `ProductFilters/ProductFilters.vue`, `ProductQuickView/{ProductQuickView,ProductQuickViewActions}.vue`, `api/products.api.js`, `composables/{useProducts,useProductVariants,useProductFilters}.js`.
- `client/src/domains/cart/CartDrawer/CartDrawer.vue`, `composables/useCart.js`.
- `client/src/domains/admin/components/AdminCampaignForm.vue`, `api/adminCampaigns.api.js`, `composables/useAdminCampaigns.js`, `constants/adminCampaigns.constants.js`, `mappers/adminCampaignForm.mapper.js`.
- `server/src/domains/campaigns/{constants/campaigns.constants.js,controllers/campaigns.controller.js,mappers/campaigns.mapper.js,repositories/campaigns.repository.js,routes/campaigns.routes.js,services/campaigns.service.js,validators/campaigns.validator.js}`, `server/prisma/schema.prisma`.
- `client/tests/tier2/admin/admin-payload-mappers.test.js` (existing expectation now reflects ISO serialization).
- `PROJECT_HANDOFF.md`, `docs/{customer-experience,admin-experience,ux-ui-standards,implementation-roadmap,verification-and-qa}.md`, `docs/architecture/{README,data-flow,database,admin,file-map}.md`.

File responsibilities and dependencies are recorded in the [file map](docs/architecture/file-map.md). The shared header is 231 lines, campaign renderer 283, campaign form 171, and section fields 198. Existing Quick View remains a focused 325-line modal. No new giant view/service or duplicate public/editor renderer was introduced; style files carry responsive rules rather than expanding component logic.

### Database And Railway Results

Campaign schema adds optional `story`, `beneficiaryUrl`, `imageAlt`, and Boolean `publicPageEnabled` default false. The migration is a single additive ALTER TABLE, without reset/delete/seed. Existing campaigns are not automatically published. There is no new donation goal, payout ledger, or review schema in this phase.

- Local target preflight: normal `server/.env`, LOCAL classification, loopback database, no Railway override. `prisma migrate deploy` applied only the new campaign migration. Final `prisma migrate status`: exit 0, eighteen migrations, database schema up to date.
- Railway target preflight: existing ignored `server/.env.railway.local` loaded through the established loader; target confirmed as RAILWAY_DB with a recognized Railway host. No URLs/credentials printed. Only the new campaign migration was pending; no failed migrations/checksum mismatches/partial new columns.
- Approved Railway `prisma migrate deploy`: exit 0. All four columns and successful migration record verified; campaign count unchanged, remaining pending migrations empty. Final read-only preflight also reports no failed migration/checksum drift. This changed schema/migration bookkeeping only, not campaign/product/order/customer business records.
- A local instance of the actual API against Railway DB returned public campaign summaries HTTP 200 (one campaign), without attribution records; unauthenticated protected campaign read returned 401. This verifies local code with Railway DB, not deployed Railway code or a real authenticated browser session.

No new environment variable is needed. Preserve existing deployment configuration: client `VITE_API_BASE_URL` (or compatibility `VITE_API_URL`) and `VITE_STRIPE_PUBLISHABLE_KEY`; server `DATABASE_URL`, `PORT`, `NODE_ENV`, `CLIENT_URL`/`FRONTEND_URL`, current admin/Better Auth/provider variable names documented above. Values remain in ignored local files/dashboards only. `server/.env` was not repurposed; Railway DB mode still uses its ignored override and a local browser API origin.

### Commands And Verification

- Required initial git status/diff-stat/name-status: inspected; prior edits preserved. Final `git diff --check`: passed.
- `cd client && npm run build` with bundled Node 24: exit 0, Vite 8.0.9, 2173 modules transformed, no warnings. One retry using the shell's Node 22 stalled before transformation and was terminated (exit 143); Node 24 completed successfully. Earlier temporary dev-server startup stalls were stopped; no source/runtime requirement was changed to hide them.
- `cd server && npm run build`: exit 0, generates Prisma Client 6.16.2. `npx prisma validate`: exit 0, schema valid. Server build is generation, not a separate compiled application bundle.
- `cd client && npm test` with bundled Node 24: exit 0, eleven files / 44 tests (tiers: 10, 28, 6).
- `cd server && npm test` with bundled Node 24: exit 0, fifteen files / 46 tests (tiers: 28, 15, 3).
- Existing lint scripts: none. Temporary focused Prettier formatting used `--single-quote --no-semi`; no dependency/script added. Router changes were kept narrowly scoped without unrelated formatting churn.
- `node --check` over all non-generated JavaScript sources: exit 0 for 96 server files and 89 client files. Server startup/import and client production build also resolve actual imports.
- Temporary production preview on 5175 and actual local API on 3001 were used for QA. Existing frontend on 5173 was not reconfigured. The expected user backend on 3000 was not listening; own 3001 startup/import and real read-only public 200/admin 401 succeeded. Restart the chosen backend mode before using the local app.
- `node /tmp/doggy-calm-giving-qa.cjs`: exit 0 with fixture APIs; widths 1440/1280/1024/768/390/320, no horizontal overflow/Vue errors/warnings. All homepage sections, selected 6 oz/18 oz prices/cart, Quick View, stable/non-clickable featured content, mobile menus, hover buffer, public unavailable/paused/image cases, same public/editor typography/color, explicit Save/Cancel, failed-save draft retention, and stable slug checked. Two intercepted saves (one intentional failure), one intercepted checkout preview, zero real business/provider writes.
- Existing admin/account/internal-record Playwright regression harnesses: all exit 0. Admin covers eleven tabs/five widths and sixteen intercepted fixture mutations; account covers seven tabs, 20-order history, detail races, profile/address/support/auth-return/cart state; internal investigation covers tiers/Stripe settings/safe records/same-name customers. Fixtures stub Stripe.js and sessions; they do not verify real payments/cookies/providers. The admin harness needed a stub for the newly added public campaign read before its final pass. Screenshots of home/campaign/editor desktop/mobile were inspected. Catalog screenshot photos are reference fixtures, not claims about live catalog photography.
- Early browser test retries used an old preview build or an HTTP image fixture rejected by the deliberate HTTPS validator. Rebuilt and corrected the fixture to HTTPS; the final run passed. Those fixture errors did not require weakening application URL validation.
- Docs relative-link/fence and targeted secret-pattern checks: eleven documents and 65 current-phase source/test/schema/migration files, zero issues. Historical secret-search examples were recognized as patterns, not credentials. Mermaid diagrams were not changed or rerendered in this phase. No `.env.example` files found, no env file changes or secret values documented.
- Existing frontend/backend became unavailable during the final checks. Fresh Node 24 `cd client && npm run dev:local -- --port 5173 --strictPort` and `cd server && npm run dev:local` both started successfully. Frontend HTTP 200, public campaign API 200, unauthenticated admin campaign API 401. These fully local review servers are intentionally left running; separate QA preview/3001 servers are stopped. Actual local read-only browser results are recorded in the completion note.

### Manual Redeploy And QA

1. Review the combined dirty tree, including accepted prior edits. No commit/push was made automatically. Deploy reviewed server code with Prisma generation through the normal Railway process, then deploy the matching Vercel client build. All current migrations are already applied; never reset/reseed.
2. Fully local: `cd server && npm run dev:local`, `cd client && npm run dev:local`. Railway DB admin: `cd server && npm run dev:railway`, same local client command. Confirm badge/backend network target before an approved write. Both temporary modes keep browser admin CRUD local.
3. In admin Campaigns, edit all six sections, use approved content/products, require image description for an image, enable public page deliberately, Save/reload. Compare `/campaigns/:slug` on actual desktop/mobile. Verify rename preserves the link, Cancel does not write, and failures retain edits.
4. Check Active schedule boundaries, public disabled with continued eligible giving, Draft/Archived privacy, Paused/Ended no-contribution message, green product badges, multiple matched campaigns, and generated-not-paid impact.
5. Check real 6 oz/18 oz selection/price/cart/checkout, Quick View focus/Escape, shared header/cart/auth, desktop hover, mobile menu, every original content section, reduced motion, actual image/ingredient accuracy, and direct Vercel campaign links.
6. Perform approved guest and signed-in Stripe test checkout with promo plus campaign. Verify trusted totals, once-only order/inventory/usage, order success/history/ownership, and all retained admin tools. No live payment, real email, or label is necessary for this QA.

### Remaining Risks And Next Phase

- Railway/Vercel code deployment is not done. Schema readiness alone will not show the new UI or public endpoint in deployment. The running review app is fully local, not Railway DB mode; restart the backend with `dev:railway` only when intentionally managing Railway data.
- Real Safari sessions, deployed cookies, authenticated campaign CRUD/persistence, actual Stripe payments, provider sends/tracking, and real production imagery/content still need controlled manual QA. Read-only Railway smoke does not substitute for these.
- Generated donation aggregates are not payout/refund-reconciliation proof; older aggregates may not have full order attribution. No goal/payout ledger was invented.
- Product admin analysis/notIncluded inputs are not persisted in the current Product schema. This pass avoids fabricated storefront analysis; persisting those product metadata fields is separate scoped work.
- Catalog/order/customer list pagination and previously reported dependency advisories remain launch work. No audit fix/automatic package upgrade occurred here.
- Public campaign URLs stay stable after rename; editing slugs/redirects, actual verified review submissions, customer notification subscriptions, and real social destinations remain future work.

Ready for focused commit review after the documented checks, not a production-launch certification. Recommended next phase: reviewed server/client deployment, approved real-data campaign/Safari/checkout QA, then dependency remediation and business content/media readiness. Communications/auth/account/loyalty policy is unchanged.

### Completion Verification

Actual local read-only browser check passed at 1440/390 px: catalog HTTP 200, three active product cards, correct size ordering, all nine homepage anchors, no horizontal overflow, no Vue/runtime errors, and zero real mutation requests. The first strict run classified Stripe's standard local-HTTP development warning as a failure; the final run records that exact expected warning separately rather than suppressing unrelated errors. Live integrations require HTTPS. No payment/auth credentials or provider response bodies were printed.

Final client build remains exit 0; tests remain 44 client / 46 server passed. Syntax checks pass for 89 client and 96 server JavaScript files; eleven docs / 65 current-phase source/test/schema/migration files pass link/fence/targeted secret checks. No `.env.example` files or env changes. Separate QA preview 5175/API 3001 stopped; intentionally retained fully local frontend 5173/backend 3000 are available for review. No commit/push/code deployment performed. Final diff whitespace check passed.

## 2026-10-09 Homepage, Story, Footer, And Upcoming Card Follow-Up

### Scope And Confirmed Causes

Continued the accepted dirty tree; did not revert admin/account/campaign/cart/variant/server work. Read the operating guide, handoff, relevant product/UX/customer/roadmap/architecture/QA documents, and inspected git status/diff-stat/name-status before edits.

- Home still contained all nine anchors. The approved Calm Giving pass had flattened visual boundaries/headings and reduced some content cues, which made sections appear missing. Full-width band separation and recognizable section titles are restored, not a speculative rewrite of data loading.
- Original hero used a 56%-wide white overlay with a visible seam and a fixed/max-height/overflow-hidden layout. The small baseline tested did not actually clip; cropping was a responsive risk, not a demonstrated checkout/content failure. The shared hero now grows with content and has image-failure handling.
- Meet the Brand originally had only a short home teaser; its button went back to shopping. Added a real public story route and connected all story destinations.
- User subsequently requested the older warm footer, richer seasonal card, and original hero presentation. Footer/card content/style are restored with working existing interactions. Homepage hero restores the product-focused heading/action/supporting hierarchy and light frosted treatment, but remains **unframed**, not an exact recreation of the requested rounded glass card. This difference was disclosed; final visual approval remains open.
- Prior minimal ComingSoonCard had removed actual category/tags/protein/cut and the unavailable notice. Those fields now render through the existing ProductCardInfo source. Old Notify Me incorrectly opened Preview; restored as disabled future-phase UI instead of claiming a subscription exists.

### Delivered Behavior

- All nine home anchors remain: hero, spotlight, shop, coming-soon, reviews, process, ingredients, about, faq. Larger headings, blue rules, and white/warm/light-blue bands distinguish them. Made With Care uses individual repeated step items; Next Drops uses an introduction plus responsive product area instead of stretching a few items across the entire page.
- Hero uses the actual featured product's stored description/tags/shop destination. It cannot claim Chicken Jerky when another product is featured. Primary goes to the featured section, with collection fallback; ingredient and story actions remain real. Unsupported human-grade certification, fast/free-shipping, 30-day promise, and unpersisted nutrition analysis are not restored from the screenshots. Supporting links describe actual guest checkout, care, and ingredient content.
- New `/meet-chase-evie` page: existing origin story, two explicitly illustrative pair portraits, shared brand values, and collection/ingredient actions. User approved templates for now. No personal biography, medical claim, age, or verified review was invented.
- Teaser, hero, shared desktop/mobile header, and footer all consume the same brand route constant. Header/cart/search/auth are reused. New page hydrates existing cart storage and loads products for variant/inventory-aware cart controls; it adds no account or brand backend API.
- Upcoming cards show real category/tags/name/description/protein/cut, clear Coming Soon text, functional image/Preview, and disabled Notify Me with future-phase explanation. Next Drops now separates loading, failed catalog/retry, and genuinely empty states. No automatic email/subscription/provider calls.
- Footer restores warm oat, yellow/blue paw mark, larger brand title, seven original navigation destinations, centered mobile socials, and separated copyright/tagline. Instagram uses the public profile supplied by the user. TikTok/YouTube appear disabled, not as active `#` dummy links. Year remains dynamic, not hardcoded to 2025.
- Social helper rejects non-HTTPS, credentials, unexpected host/port, missing or platform-root destinations. Optional public variables allow later profile configuration. Footer uses immutable storefront colors in account context.
- Existing selected 6 oz/18 oz, non-clickable featured image/title, campaign green accents, shared editor, trusted checkout totals, auth, and admin behavior remain intact. No server/schema/env/dependency/deployment files changed in this follow-up.

### Files Created

Paths are relative to the repository. Grouped braces enumerate files.

- `client/src/domains/storefront/constants/brandContent.js`.
- `client/src/domains/storefront/components/{StorefrontHero,BrandStoryContent}.vue`.
- `client/src/domains/storefront/views/BrandView.vue`.
- `client/src/domains/storefront/Home/sections/{BrandPromiseStrip,NextDropsSection}.vue`.
- `client/src/domains/storefront/styles/{home,brand}.css`.
- `client/src/domains/storefront/utils/socialLinks.js`.
- `client/tests/tier2/storefront/{storefront-sections,social-links}.test.js`.

### Files Modified In This Follow-Up

- `client/src/domains/storefront/Home/HomeView.vue`, `Home/sections/{HeroSection,AboutBrandSection,ProcessSection,IngredientsAnalysisSection,ReviewsPreviewSection}.vue`.
- `client/src/domains/products/ProductCard/ComingSoonCard.vue`.
- `client/src/app/layouts/{SiteHeader,SiteFooter}.vue`, `client/src/app/router/index.js`.
- `PROJECT_HANDOFF.md`, `docs/{customer-experience,ux-ui-standards,verification-and-qa}.md`, `docs/architecture/{README,data-flow,file-map}.md`.

BrandView is 76 lines; ComingSoonCard 84; StorefrontHero 182. Views compose existing state/helpers; story and section components are presentational. No duplicate header, API, account auth, public campaign renderer, or product variant selection implementation was created. See [file map](docs/architecture/file-map.md) and [data flow](docs/architecture/data-flow.md).

### Commands And Verification

- Initial and follow-up git status/diff-stat/name-status inspected. Existing changes preserved. `git diff --check` passed.
- `cd client && npm run build` with bundled Node 24: exit 0, Vite 8.0.9, 2183 modules, no warnings. Rebuilt after the final hero/footer/card revisions.
- `cd client && npm test` with bundled Node 24: final exit 0, thirteen files / 53 tests (tiers: 10, 37, 6). Nine new tests exercise actual Vue SSR sections, featured hero content, loading/error/empty/upcoming state, and safe social config. One intermediate run stalled before tier 3 started and was stopped (exit 130); the full unchanged suite then completed successfully. Do not treat that interruption as an additional passed test run.
- Existing lint script: none. Focused temporary Prettier formatting used existing single-quote/no-semicolon conventions, with no dependency/script added. Router formatting was not broadened.
- `node --check` over client JavaScript sources: exit 0, 91 files. Client build resolves Vue imports. Server/Prisma commands were not rerun because this follow-up changes no server/schema source; the prior phase's 46 server tests/build/migration results remain historical, not a new server verification claim.
- Temporary built-client preview used `127.0.0.1:5176`. An initial own preview bound 127.0.0.1:5175 while another process owned the wildcard port; stopped the own preview (exit 130) and moved QA to 5176. Did not terminate or reconfigure the unrelated listener.
- `node /tmp/doggy-home-brand-qa.cjs`: exit 0 against the built client with intercepted APIs. Widths/heights 1440x1000, 1024x768, 768x900, 390x844, 320x650, 800x600. No overflow/clipped hero content/Vue warnings/runtime errors. Retained sections, final hero colors/destination, footer social/disabled states, upcoming Preview, story links/direct reload, cart count/both variants/search persistence, signed-in header, mobile navigation, actual image loading/error fallbacks, and upcoming loading/error/empty branches passed. One intercepted checkout preview; zero real mutation requests. Screenshots inspected on desktop/mobile.
- `QA_BASE_URL=http://127.0.0.1:5176 node /tmp/doggy-calm-giving-qa.cjs`: exit 0 after final hero changes. Home/campaign/editor widths 1440/1280/1024/768/390/320, variant/Quick View/featured behavior, same public/editor styles, Save/Cancel/failure retention, giving badges, account hover, and stubbed checkout passed. Two intercepted saves and one intercepted preview; no real campaign/payment/provider writes.
- `QA_BASE_URL=http://127.0.0.1:5176 node /tmp/doggy-account-current-qa.cjs`: exit 0. Seven tabs, 20-order navigation, profile/address/support fixture actions, cart retention, auth-return/sign-out, desktop/mobile and error states passed. Console HTTP failures were intentionally intercepted failure/authorization fixtures, not new Vue/runtime errors. Does not verify real cookies or DB persistence.
- `node /tmp/doggy-calm-local-readonly-qa.cjs`: exit 0 with the actual fully local API/front end at 5173, widths 1440/390. Catalog HTTP 200, all home anchors, correct variant ordering, new brand route rendered, no overflow/runtime errors, zero real API mutations. Standard Stripe local-HTTP warnings were recorded separately. No real checkout payment/customer signup/admin write/email/label was performed.
- `node /tmp/doggy-calm-docs-check.cjs` with the 21 follow-up source/test files: exit 0, eleven documents checked, zero relative-link/fence/targeted secret-pattern issues. Mermaid diagrams were not changed/rerendered. `.env.example` inventory returned no files (expected rg exit 1); final diff whitespace check passed. Own 5176 QA preview stopped after verification; fully local review servers were not reconfigured.

### Configuration And Deployment

No required server/Railway variable changes and no migration in this follow-up. The prior explicitly authorized campaign migration remains applied locally and on Railway; this does not mean the prior server/client code has been deployed.

Optional public client/Vercel variables:

| Variable | Purpose |
| --- | --- |
| `VITE_INSTAGRAM_URL` | Override the user-approved public Instagram profile with a valid HTTPS Instagram profile URL. |
| `VITE_TIKTOK_URL` | Supply a real HTTPS TikTok profile URL to replace the disabled placeholder. |
| `VITE_YOUTUBE_URL` | Supply a real HTTPS YouTube profile/channel URL to replace the disabled placeholder. |

All are public profile configuration, not provider keys. No env file was created/modified, no `.env.example` created, no secret values copied or documented. These Vite settings require a rebuilt frontend. Existing API/Stripe/auth variable names and temporary local/Railway DB mode instructions remain unchanged. No commit/push/deployment was performed.

### Manual QA, Risks, And Next Step

1. Review the latest hero against the requested original card: content hierarchy/action styling are restored, but rounded inset framing is deliberately not an exact match. Obtain visual approval before treating that design request as fully complete.
2. Check all homepage sections, seasonal Preview/unavailable notices, story/footer destinations, keyboard focus, desktop/mobile/Safari, image failures, and reduced-motion behavior. Default photo assets are templates; approve real catalog/brand photographs and expanded story separately.
3. Verify 6 oz/18 oz on real products, shared cart/search/header state across home/story/account/checkout, signed-in and guest sessions, then one approved Stripe test checkout including promo plus campaign. Fixture/read-only QA is not deployed Safari/payment/provider proof.
4. Configure real TikTok/YouTube destinations later; keep placeholders disabled until then. Launch notifications and verified reviews remain future work, not working buttons or fabricated testimonials.
5. Review the combined dirty tree including prior server/schema/admin edits. Deploy reviewed prior server code and the matching current Vercel build through normal processes; test direct `/meet-chase-evie` after deploy. No new database migration is required for this follow-up.

Current focused client edits are ready for commit review after the recorded checks, not a production-launch certification. No automatic commit/push. Existing fully local review frontend 5173/backend 3000 remain available; separate own QA preview is stopped after verification. Recommended next step: final visual/content approval, then reviewed deployment and controlled real-session/checkout QA.

## 2026-10-09 Approved Storefront Baseline Implementation

### Scope And Approval

The user approved the interactive storefront baseline preview after clarifying that Add to Cart, not the payment checkout page, should slide out from the right. Applied that presentation to the existing Vue app and added the subsequently requested neutral gray hero readability tint. This section supersedes the earlier frosted-hero/visual-approval-open notes above. The hero remains an unframed photo-led layout; no rounded hero text card was added.

Continued the accepted dirty tree after reading the operating guide/handoff/relevant product, UX, customer, roadmap, architecture, and QA rules, and inspecting git status/diff-stat/name-status. Existing server/admin/account/campaign/schema changes belong to prior accepted work and were not reverted or edited in this pass. No commit, push, code deployment, migration, DB mutation, payment, provider send, or env-file change was performed.

### Delivered Changes And Confirmed Issues

- Preserved all nine home anchors and their actual content: hero, featured treat, collection, Next Drops, Happy Pups, care, ingredients, brand teaser, and shopping help. Shared header/footer/search/auth/cart and the public brand story route remain connected.
- Applied the approved bright template photo, unframed white hero copy, neutral gray photo tint, yellow primary action, readable secondary action/story/supporting links, warm/white bands, and restrained product/media/header/care shadows. Small-screen spacing grows safely with content and leaves a hint of following content even at the tested 320 x 568 viewport.
- Next Drops previously devoted one-third of desktop space to an introduction, squeezing the richer cards. It now uses a full-width introduction followed by two generous columns, then one column on small screens. Category/tags/description/protein/cut/notice/Preview remain. Notifications stay disabled future work.
- Bundled the approved illustrative JPEGs locally for hero/teaser/gallery, with explicit template/gallery labeling. Actual product photos/prices/variants/stock remain catalog-owned; the standalone preview's mock products/cart/calculations were not copied into the app. No fabricated testimonials or product/shipping guarantees were added.
- Kept the existing 420 px right-side drawer (mobile viewport width), but replaced lifting nested item cards with static separated rows, icon commands, clear quantity controls, selected size/unit/line price, existing stock/SKU context, and a warm summary. Only Secure Checkout navigates to `/checkout`; Add to Cart stays on the current route.
- The existing drawer lacked modal keyboard/scroll lifecycle. Added a focused composable for initial/contained/restored focus, Tab/Shift-Tab, Escape, scroll lock/restoration, and unmount cleanup. During actual browser QA, removing a row left focus on the body; fixed that confirmed issue by recovering focus after drawer updates and added a regression test.
- An additional 844 x 390 landscape check confirmed the fixed footer exceeded the drawer height, clipping Continue Shopping. Short-height layouts now scroll the whole drawer beneath a sticky header/close control. Retest confirmed both footer actions are reachable, with Continue Shopping ending at 374 px inside the 390 px viewport.
- Existing useCart selected-variant pricing/storage/inventory behavior, checkout totals/payment flow, backend APIs, auth, campaigns, admin, schema, package dependencies, and deployment configuration were not changed.

### Files Created In This Pass

- `client/src/assets/images/storefront-hero-template.jpg`
- `client/src/assets/images/storefront-seasonal-template.jpg` (illustrative gallery asset, not an override of the Seasonal Drop product image)
- `client/src/domains/cart/composables/useCartDrawerDialog.js`
- `client/tests/tier2/storefront/cart-drawer.test.js`
- `client/tests/tier2/storefront/cart-drawer-dialog.test.js`

### Existing Files Modified In This Pass

Some of these existed as untracked accepted files at the start; they were not newly created by this pass.

- `client/src/domains/cart/CartDrawer/{CartDrawer,CartItemCard,CartSummary,CartEmptyState}.vue`
- `client/src/domains/storefront/components/StorefrontHero.vue`
- `client/src/domains/storefront/constants/brandContent.js`
- `client/src/domains/storefront/Home/sections/{HeroSection,ProductSpotlightSection,ReviewsPreviewSection,AboutBrandSection}.vue`
- `client/src/domains/storefront/styles/{home,storefront,siteHeader}.css`
- `client/src/domains/products/ProductCard/{ProductCardActions,ComingSoonCard}.vue`
- `PROJECT_HANDOFF.md`, `docs/customer-experience.md`, `docs/ux-ui-standards.md`, `docs/verification-and-qa.md`, and `docs/architecture/{README,data-flow,file-map}.md`

### Commands And Verification

Build/test commands used bundled Node v24.19.0 on PATH; no package installation/upgrade occurred.

| Check | Result |
| --- | --- |
| `git status --short --branch`, `git diff --stat`, `git diff --name-status` | Inspected accepted dirty `dev-main` tree before editing: 69 tracked modified files plus untracked prior work |
| Client `npm run build` | Exit 0; Vite 8.0.9 transformed 2187 modules |
| Client `npm test` | Exit 0; 15 files / 63 tests passed (tier 1: 10, tier 2: 47, tier 3: 6) |
| New tests | Ten additional SSR/dialog regression tests; existing variant, promo, checkout totals, campaign/editor, admin, account, and formatting tiers still pass |
| `git diff --check` | Exit 0, no whitespace errors |
| `.env.example` inventory with `rg --files --hidden --no-ignore` excluding dependencies/Git/build output | No matches, expected exit 1; none created |
| `node --check` for `useCartDrawerDialog.js` and `brandContent.js` | Both exit 0; Vue imports/templates additionally resolved by Vite build |
| `node /tmp/doggy-calm-docs-check.cjs` with the 18 changed/new text source/test files in `CHECK_FILES` | Exit 0; eleven docs checked, no relative-link/fence/targeted secret-pattern issues |

Actual local in-app browser checks at 1440 x 900, 1024 x 768, 768 x 1024, 390 x 844, and 320 x 568 found all nine anchors, no horizontal overflow, contained card controls, header cart within bounds, and responsive upcoming columns. Inspected actual hero, seasonal cards, gallery, care, and ingredient layout/screenshots; bundled hero/gallery images render. Featured image/title remain non-clickable by DOM inspection.

Actual catalog/cart checks passed: Beef 6 oz adds its stored price; Chicken 18 oz adds its distinct stored price; Quick View adds both selected Chicken sizes; featured purchase still works; quantities/subtotals update; selected unavailable Beef 18 oz correctly shows Out of stock/Unavailable rather than allowing purchase. This is real availability, not a broken button. Drawer opens over the same route, is 420 px at desktop / 390 px at mobile, focuses Close cart, wraps Tab in both directions, restores focus/scroll on Escape/backdrop/Continue Shopping, and recovers focus after removal. Bag persists through the story page; account sign-in entry renders. Temporary QA quantities/rows were restored, retaining the pre-existing saved bag.

Console inspection found no Vue/runtime errors; only the existing Stripe.js local-HTTP warning (live integration requires HTTPS). No sign-in credentials, customer mutations, payment confirmation, checkout submission, or provider action was used. Secure Checkout's existing `/checkout` target is verified by SSR/source and DOM; payment/checkout preview was not exercised live in this UI pass. Server/Prisma checks were not rerun because no server/schema files changed here. No lint script exists; none was invented.

### Documentation And Remaining QA

Current behavior/source boundaries are updated in [customer experience](docs/customer-experience.md), [UX standards](docs/ux-ui-standards.md), [data flow](docs/architecture/data-flow.md), [file map](docs/architecture/file-map.md), [architecture index](docs/architecture/README.md), and [QA](docs/verification-and-qa.md). Existing Mermaid diagrams were not altered.

1. Review final visuals on real desktop/mobile/Safari, including touch scroll, screen-reader focus, reduced motion, long real content, and many cart rows. Browser screenshots/isolated lifecycle tests are not accessibility certification.
2. Replace illustrative imagery with approved real brand/customer photographs when ready, and review actual catalog copy/tags/photos. No verified-review/subscription capability is implied by the gallery or Notify Me.
3. Recheck eligible campaign-green cards and shared campaign/admin canvas after reviewed deployment. The current local catalog did not display an eligible campaign badge during this browser check; existing matching conditions and test tiers remain intact, but that live visual state was not proved here.
4. Verify signed-in headers/Safari sessions and one approved guest/signed-in Stripe test checkout including promo plus campaign, trusted preview totals, success/history, and once-only order/inventory/usage. Those deployment/payment behaviors were not re-certified by this styling pass.
5. Review the combined dirty tree before commit/deployment; prior server/schema/admin edits remain present. This focused client pass requires no new env variables or migration. No Railway/Vercel deployment was performed.

The focused changes are ready for commit review after recorded checks, not an automatic release or full launch certification. Recommended next phase: real-device/content approval, review the combined diff, then controlled deployment and checkout/session/campaign QA. Existing local frontend at 5173 and backend at 3000 were reused without changing startup modes or secrets.

## 2026-10-09 Website And Product Visual Editors

### Scope And Repository Reconciliation

The user requested an editable miniature storefront for product cards and a new Website admin tool controlling homepage content, footer/navigation, seasonal backgrounds, section visibility/order, and additional supported sections. Read the operating guide, handoff, relevant product/UX/customer/admin/operations/roadmap/architecture/QA documents; inspected status/diff-stat/name-status before editing and after interruptions. This phase began with a clean `dev-main` tree. Earlier phases above are historical, not a claim that their dirty trees still exist.

Preserved the approved storefront baseline, shared cart/search/customer state, all existing admin tools, signed-in identity/data routing, custom admin auth, Better Auth customers, guest checkout, server-owned calculations, product variant selection, campaigns, and right-side cart drawer. No commit/push, Railway/Vercel deployment, provider send, payment, env-file edit, dependency install, or `.env.example` creation.

### Delivered Behavior

- `/admin/website` adds a twelfth admin tool. Left: site/section navigation and visibility/order/add controls. Middle: actual shared homepage/header/footer with edit handles and wide/phone canvas. Right: selected fields. Responsive layout stacks without horizontal overflow at tested narrow widths. Customer actions are inert inside previews.
- Announcement, header navigation/search placeholder, footer copy/links/socials, hero copy/images/actions/badges, promises, selected featured product, curated collections, Next Drops copy, gallery, care steps, ingredient introduction, brand teaser, and shopping help are editable. All original content remains as defaults. The promise strip now has its own anchor, giving ten blocks without removing the nine original anchors.
- Hide/show and reorder blocks. Add typed product collections, galleries, sale banners, or image/story sections, up to 24 blocks. Original singleton blocks/main collection can be hidden but not deleted. Added blocks can be removed after confirmation. Header/footer/content links omit hidden-section anchors; search targets a visible collection or disappears when none is visible.
- Everyday/Autumn/Winter accents, original/white/warm-oat/Calm-Giving section backgrounds, and HTTPS decorative image URLs support seasonal presentation. There is no bundled pumpkin artwork, upload/media service, arbitrary HTML/CSS/JavaScript/function builder, schedule, or historic revision archive. Sale banners do not calculate discounts.
- **Save draft** changes only editor data. **Publish website** confirms and atomically saves a public snapshot. Failed saves retain the draft; revision conflicts return 409 instead of overwriting another editor. Cancel/reload/route leave protect unsaved changes. Public reads expose allowlisted published content only and do not create or seed records.
- Product forms now show the actual active/upcoming card with pencil controls and a focused Details/Variants/Content/Publishing inspector. Existing prices, quantities, SKU/thresholds, tags, ingredients/storage/analysis inputs, status/selling mode/feature controls, mapper, validation, Save and Cancel are preserved. Product Save updates catalog immediately, independently of Website publication. Existing unpersisted product metadata limitations noted earlier are not fixed by this UI phase.
- Actual prices, variants, stock, ingredient facts, campaign eligibility, promo rules, and totals remain commerce-domain owned. The full `/meet-chase-evie` page remains code-owned; its homepage teaser/action are editable. Existing template/gallery labels and disabled upcoming notifications/missing social destinations remain truthful.

### Architecture, Security, And Confirmed Fixes

See [visual editor architecture](docs/architecture/storefront-editor.md), [file map](docs/architecture/file-map.md), [admin](docs/architecture/admin.md), [database](docs/architecture/database.md), and [data flow](docs/architecture/data-flow.md).

- Canonical public-only rules/defaults/validation/projection/social checks live in `shared/storefront/`. Four generated modules in each app root are committed snapshots, not independent sources of truth. Each build synchronizes from canonical source in a full checkout, while isolated Vercel/Railway roots use the snapshots. Byte parity and isolated-root operation were checked. Actual platform dashboard root settings were not inspected.
- New storefront server domain follows route -> controller -> service -> repository -> Prisma. `GET /api/storefront/content` is public; `GET /api/admin/storefront`, `PUT /api/admin/storefront/draft`, and `PUT /api/admin/storefront/publish` require server admin auth. Public response is `content: null` before first publication and has no draft/revision/internal timestamps.
- Versioned/typed validation limits UTF-8 size, section/item counts, unique safe IDs, supported settings, text/images, singleton blocks, and visible content. Rejects credentials, unsafe protocols, API/admin destinations, encoded protected/dot-segment paths, control characters and unsupported social destinations. Text remains escaped; no script/template evaluation.
- Repository uses revision-matched `updateManyAndReturn`, returning the exact atomic write rather than a racing follow-up read; concurrent first creation also maps to conflict. Publication saves draft/publication/revision/timestamp together.
- Public content state retains default/last known good data on failed or invalid reads. A generation guard prevents an older request overwriting a new publication. There is a 60-second on-load client cache, not live push; public API uses `Cache-Control: no-store`. Repeated content API failure monitoring is still recommended.
- Review caught a configured header link using the wrong RouterLink prop; all configurable links now use the shared safe ContentLink. Curated collections retain actual catalog filtering/search/sort. A global seasonal image no longer overrides explicit block backgrounds.
- Live inspection caught admin heading styles recoloring the miniature storefront hero. Admin heading selectors now exclude `.storefront-ui` descendants, and the embedded storefront has an explicit base font size. Verified white hero/appropriate section sizes after the fix. Repeated hero badges use stable positional keys; brand-story URL input length now matches other URL fields.

### Database And Local QA State

Added `StorefrontContent`: singleton `id`, JSON `draft`, nullable JSON `published`, integer `revision`, nullable `publishedAt`, and created/updated timestamps. No existing commerce table or relation changed. Additive CREATE TABLE migration: `server/prisma/migrations/20261009010000_storefront_content/migration.sql`.

Preflight loaded normal local server configuration privately and asserted a loopback database host, no failed/incomplete migrations, and the one pending content migration. Guarded local `prisma migrate deploy` succeeded; subsequent status reports **19 migrations / schema up to date**. No reset/reseed or Railway command/query occurred.

Local UI QA saved a temporary holiday heading, proved reload persistence and that public content remained unchanged, then restored the baseline draft. Final local singleton is revision 2, published JSON null. No test holiday content is published. A temporary random-row PostgreSQL transaction proved exact revision-return/atomic publication and stale-write rejection, then intentionally rolled back. Product preview prices were restored without submitting Update Product. No product/customer/order records were modified.

**Railway gate:** this migration is not applied or verified there. Existing `server` start runs `prisma migrate deploy`; deploying/restarting the new backend can apply it. Obtain explicit approval, confirm the database/backup and additive SQL, check migration status, then deploy through the approved process. Prior campaign migration approval is not blanket approval for this content migration. Frontend-only deployment retains defaults on unavailable content, but the editor requires the matching server/table.

### Files Created

Paths are repository-relative; braces enumerate grouped files. Full responsibilities/dependencies are documented in the file map.

- `shared/storefront/{sectionCatalog,contentValidation,contentProjection,socialLinks}.js` and corresponding generated files in `client/src/domains/storefront/content/` and `server/src/domains/storefront/content/`.
- `client/scripts/sync-storefront-content.js`, `server/scripts/sync-storefront-content.js`.
- `client/src/domains/admin/api/adminWebsite.api.js`, `composables/useAdminWebsite.js`, `constants/adminWebsite.constants.js`, `views/AdminWebsiteView.vue`.
- `client/src/domains/admin/components/{AdminWebsiteCanvas,AdminWebsiteFields,AdminWebsiteItems,AdminWebsiteLinks,AdminProductCanvas,AdminProductDetailsFields}.vue`.
- `client/src/domains/storefront/api/storefrontContent.api.js`, `composables/useStorefrontContent.js`, `components/ContentLink.vue`, `utils/homeContent.js`, `Home/HomePageContent.vue`, `Home/sections/{ProductCollectionSection,ContentFeatureSection}.vue`.
- `server/src/domains/storefront/{routes/storefront.routes,controllers/storefront.controller,services/storefront.service,repositories/storefront.repository}.js` and the migration above.
- `client/tests/tier2/admin/website-editor.test.js`, `client/tests/tier2/storefront/{content-cache,content-renderer}.test.js`, `server/tests/tier2/admin/{storefront-content,storefront-repository}.test.js`.
- `docs/architecture/storefront-editor.md`.

### Files Modified

- Client `package.json`, `vite.config.js`, `jsconfig.json`; shared `app/layouts/{PromoStrip,SiteHeader,SiteFooter}.vue`, `app/router/index.js`, `assets/styles/admin.css`.
- Admin `components/{AdminIcon,AdminProductFormPanel}.vue`, `constants/adminNavigation.constants.js`, `views/AdminProductsView.vue`.
- Products `ProductCard/ProductCard.vue`; storefront `Home/HomeView.vue`, existing ten home section components, `styles/{siteHeader,storefront}.css`, `utils/socialLinks.js` compatibility re-export.
- Existing `client/tests/tier2/admin/admin-workspace.test.js` and `storefront/storefront-sections.test.js` expectations.
- Server `package.json`, `prisma/schema.prisma`, `src/app.js`.
- This handoff; `docs/{admin-experience,customer-experience,implementation-roadmap,verification-and-qa}.md` and `docs/architecture/{README,admin,data-flow,database,file-map}.md`.

### Commands And Verification

Build/test/syntax commands used bundled Node v24.19.0 on PATH. No lint script exists; none was invented.

| Command / Check | Exact Result |
| --- | --- |
| `git status --short`, `git diff --stat`, `git diff --name-status` | Inspected before edits/resume; no unrelated changes reverted. |
| Client `npm run build` | Exit 0; Vite 8.0.9, 2213 modules, including final preview CSS/link/badge fixes. |
| Client `npm test` | Exit 0; 18 files / 77 tests. Tiers 10 + 61 + 6. Fourteen new website/render/cache tests. |
| Server `npm run build` | Exit 0; canonical content sync and Prisma Client v6.16.2 generated. This is generation, not a server bundle. |
| Server `npm test` | Exit 0; 17 files / 55 tests. Tiers 28 + 24 + 3. Nine new content/service/route/repository tests. |
| `node --check` over client/server/shared/scripts/tests JavaScript | Exit 0; 247 files. Vue template/import resolution additionally covered by Vite. |
| Guarded local `prisma migrate deploy` | Exit 0; new additive migration applied locally only. |
| Guarded local `prisma migrate status` | Exit 0; 19 migrations, database schema up to date. |
| Canonical/generated parity; isolated-root sync scripts | Pass; all eight generated modules equal the canonical source plus the required generated-file header, and work without the external shared directory. Temporary isolated roots removed. |
| Local PostgreSQL rollback transaction | Pass; revision-return/atomic public snapshot and stale revision rejection, no residual QA row. |
| Markdown/relative links/code fences and targeted secret checks | Exit 0; eleven changed/new Markdown documents and 83 changed/new files checked; no broken links/fences, env-file changes, or secret-pattern findings. |
| `.env.example` inventory | No files, expected `rg` exit 1. |
| `git diff --check` | Exit 0; no whitespace errors. |

Two checker diagnostics were resolved without application changes: the first parity comparison omitted the intentional generated-file header; the corrected comparison passes. The first secret scan flagged three historical `rg` scan commands in this handoff as if their pattern text were database URLs; privately inspected them and exempted only those exact historical command lines. Final scan has zero findings. Existing Mermaid diagrams were not modified or rerendered in this phase.

Actual local in-app browser QA used the existing frontend 5173/backend 3000 and authorized local admin login. Verified Website navigation/canvas/inspector, saved draft reload, public unchanged while draft saved, live 409 retention, banner addition/reorder, hide/show and omitted hidden anchor links, footer fields, seasonal change/restore, and wide/390px canvas. Editor widths 1440/1280/390/320 had no horizontal overflow; small preview/inspector scrolling remained bounded. A native discard confirmation paused browser automation, the user cleared it, and product/website checks then resumed. The final Website draft is clean baseline, not unsaved QA content.

Actual product editor displayed the campaign-green Chicken card, correct 6 oz/18 oz prices, existing fields, and immediate unsaved price preview; values restored without saving. Actual public collection 18 oz added the correct bag at $39.99 and opened the right-side drawer; quick view 6 oz added the correct bag at $14.99. Removed only the added 18 oz test row and decremented only the test 6 oz quantity, retaining the original bag. All ten home blocks and real catalog/campaign/default shell rendered. No checkout/payment submission.

Publish service/protected routes and atomic writes are covered by tests/rolled-back real DB verification. **The native Publish confirmation/final public reload was not completed end to end in the browser; keep that manual QA item open.** Product DB-save CRUD, new customer login/signup, deployed Safari cookies, real provider actions and Stripe checkout were not re-certified. Existing test tiers pass; that does not equal deployed integration proof. One transient local API fetch failure during server hot restart recovered; standard Stripe local-HTTP warnings remain, requiring HTTPS for live integration.

### Configuration, Remaining Risks, And Next Step

No new env variables. Existing server database/auth/provider and public client API/Stripe variables stay documented by name only; local envs were neither modified nor copied. Optional legacy public social variables are used before publication; after publication the stored footer is authoritative. Generated content modules contain public defaults/rules only, never env data. Editor components remain focused (Website view 90 lines; state 80; product panel 72; server service 35), with no duplicate header, checkout engine, or arbitrary-code builder.

1. Review the local Website/product canvases and all preserved fields on real desktop/mobile/Safari, keyboard/screen reader/reduced motion, long copy, many sections, and unavailable images.
2. In fully local mode only, save a small draft, confirm public remains unchanged, explicitly Publish, reload public home/header/footer, and use the published-version restore flow. Check two editors conflict without data loss. Do not publish temporary QA text to Railway.
3. Approve real brand/product/gallery assets and seasonal artwork. Hosted images must be publicly accessible HTTPS; uploads, asset storage, scheduling, older revisions and expanded block types are later scoped work. Custom sections cannot add new business functions without implementation.
4. Review migration/source/generated snapshots. Obtain explicit Railway migration/deployment approval, deploy server then matching frontend, verify protected endpoints and publication against the intended DB. Check all existing direct routes and Safari auth. No deployment was performed here.
5. After deployment, run an approved guest/signed-in Stripe test checkout with selected variants, promo plus campaign, trusted preview totals, order/success/history and once-only inventory/usage. This phase did not change that logic or prove live payment/provider behavior.

The tree is ready for focused commit review after the checks, not a production-launch certification. No commit/push. Local review servers remain running in their existing startup mode. Recommended next phase: visual/content review and local publish QA, followed by explicitly approved Railway migration and coordinated deployment/controlled integration QA.

## 2026-10-10 Image Library Completion And Interrupted Server Repair

This section supersedes the earlier visual-editor phase's statements that uploads were future work, local status was 19 migrations, published content was null, and Publish QA was incomplete. Earlier sections retain their historical results. Continued the combined local edits; no broad refactor, commit/push, env-file modification, Railway command/query/migration/deployment, customer email, shipment/label, payment or destructive database action.

### Confirmed Server Failure And Repair

Actual `DOGGY_SERVER_ENV_TARGET=LOCAL node src/server.js` exited 1 with `MODULE_NOT_FOUND` for `@prisma/client/runtime/library.js`. Installed Prisma CLI and generated output were 6.16.2 while the runtime package had become 7.10.0. The v6-generated module requested a runtime file absent from v7. This was a dependency mismatch, not evidence of database damage or a missing media migration.

Pinned **both** `prisma` and `@prisma/client` to **6.16.2**, updated the lockfile with `npm install`, and explicitly generated via server `npm run build`. CLI, runtime and generated versions now match. The actual local development startup with the user's default Node 22.15.0 succeeds on port 3000; health, catalog, public content, image bytes and auth rejection were checked against this running process. Future Prisma upgrades must be coordinated rather than upgrading one package alone; regenerate/restart after changes. Install-script warnings alone do not establish generation success; the explicit generation and real startup do here.

The continued tree also contains separately introduced `approve`, `ls` and `scripts` dependencies. Those unrelated additions were preserved, not used to implement the media library and not silently removed. Review their necessity separately. This feature's additional runtime dependency is Sharp for validated/optimized image processing.

### Delivered Image And Editor Behavior

- Actual image fields in Website, Products and Campaigns retain URL entry and add Upload image, Choose library, preview thumbnail and Clear. Button/navigation/social/partner destination URLs remain links; uploading an image does not replace their destinations.
- Searchable/paginated library with logical folders, dimensions, size/capacity display, explicit name/accessibility-description/folder Save and Use this image. It warns that images are public and must not contain private/customer documents. Failed uploads/metadata saves retain page edits.
- Dedicated `MediaAsset` metadata and one-to-one `MediaAssetData` binary storage in PostgreSQL, atomic writes, SHA-256 deduplication and bounded 256 MiB library capacity. No ephemeral server filesystem or secret storage. No deletion/replacement action risks breaking historical order/product image references. Object storage/CDN, formal usage/cleanup and asset versioning remain future work.
- Protected admin upload/list/edit endpoints; public immutable optimized WebP and thumbnail endpoints. Limits: JPEG/PNG/WebP, 8 MiB input, 20 MP decoded, 2400 px edge, 2 MiB optimized output, 20 uploads/15 minutes, two concurrent transforms per process. SVG, animated, mismatched decoded types and compressed upload requests are rejected. Reencoding strips original metadata. JSON projections omit blobs, checksums and internal actor fields.
- Stored image references are canonical `/api/media/<uuid>`, not backend hostnames. The shared client resolver uses the configured API origin in home/hero/footer/gallery/campaign, product/Quick View/admin previews, cart, checkout, success and customer/admin order items. Existing HTTPS and bundled photos remain supported. Page/product/campaign writes check that selected asset IDs exist in the chosen database.
- Contextual labels replace generic "text" with Hero introduction, Brand story introduction, Sale details, Story paragraphs, Gallery introduction, questions/answers, care steps and photo captions. URL help distinguishes an action destination from a photograph. Hero photo remains independently editable; ineffective generic hero background controls are omitted.
- Canvas current-selection strip shows color swatch/artwork and Edited-not-saved state. Changed-section markers clear on Save without claiming Publish. Confirmed homepage ID-specific CSS was overriding selected background colors; scoped explicit-background rules now take precedence. Global seasonal artwork repeats at page width under a reading tint, while explicit section/footer selections override it. Original no-artwork presentation remains supported.

See [media architecture](docs/architecture/media-library.md), [editor architecture](docs/architecture/storefront-editor.md), [file map](docs/architecture/file-map.md), [database](docs/architecture/database.md), [admin](docs/architecture/admin.md), [data flow](docs/architecture/data-flow.md), and [QA](docs/verification-and-qa.md).

### Database, Artwork And Actual Local State

Added `MediaAsset` and `MediaAssetData` with additive migration `server/prisma/migrations/20261009020000_media_library/migration.sql`. Existing commerce schema and rows were not reset/reseeded. Earlier guarded preflight confirmed loopback LOCAL DB and clean migrations before applying only this additive migration locally. Resumed read-only status check confirms **20 migrations / schema up to date**. No migration was needed for the package repair.

Generated decorative template: [Halloween background](assets/seasonal/halloween-background-template.png), 1983 x 793. This is AI-created seasonal artwork, not an actual product/customer photo. Live admin upload stored an optimized 215,042-byte WebP and an 8,858-byte thumbnail. Library metadata was saved as "Halloween pumpkins · background template" with an explanatory description. Reupload reused the same record; guarded local DB read confirms one asset.

Actual browser Save Draft/reload preserved the image without changing public content. The user accepted the explicit local Publish confirmation; resumed DB read confirms revision 9 with the media background in both draft and published snapshots. Public reload resolves it through the local backend; actual screenshot shows pumpkins/leaves behind the ingredient section with readable copy. Previously user-published Autumn theme, hidden promise-strip selection, and other user catalog changes were preserved rather than reset to the earlier default state. Nine visible home anchors remain; the tenth promise block is hidden by the user's selection, not removed from the renderer.

An initial upload against the previous still-running process failed before its generated client was reloaded. Reload/retry succeeded and deduplication was checked; its automatically captured local internal issue was not deleted. The separate resumed v6/v7 startup crash above was reproduced and fixed. Do not conflate these diagnostics with an actual failed media-table migration.

### Files Created In The Media Follow-Up

- `assets/seasonal/halloween-background-template.png`; `shared/storefront/mediaRules.js` and its two generated app-root snapshots.
- `server/src/domains/media/routes/media.routes.js`, `controllers/media.controller.js`, `services/{media.service,mediaReferences.service}.js`, `repositories/media.repository.js`, `mappers/media.mapper.js`, `validators/media.validator.js`, `utils/normalizeImage.js`; additive migration above.
- `client/src/domains/admin/api/adminMedia.api.js`, `composables/useAdminMedia.js`, `validators/adminImage.validator.js`, `components/{AdminImageField,AdminMediaLibrary,AdminWebsiteAppearance}.vue`; `client/src/shared/utils/mediaImage.js`.
- `server/tests/tier2/admin/{media-images,media-repository,media-routes}.test.js`; `client/tests/tier2/admin/media-editor.test.js`; `docs/architecture/media-library.md`.

### Files Modified In The Media Follow-Up

- Server `package.json`, `package-lock.json`, `prisma/schema.prisma`, `src/app.js`, `scripts/sync-storefront-content.js`, storefront service, product/campaign services and campaign image validator.
- Shared `contentValidation.js` and both generated snapshots; client sync script.
- Admin Website fields/items/constants/canvas/composable, Product details fields, Campaign section fields/validator, Products table and Order detail image renderer.
- Shared HomePageContent/SiteFooter backgrounds; home Hero/Spotlight/Brand/Gallery/ContentFeature images; product image/Quick View; cart item; checkout summary/success; account order details; campaign shared page image renderer.
- Existing Website editor/content renderer tests; this handoff and focused admin/customer/roadmap/QA/architecture documents listed above. These files coexist with the preceding uncommitted Website/product editor changes; the full dirty tree is not a media-only diff.

### Commands And Results

Client/test/syntax checks use bundled Node 24.19.0 where specified; actual repair install, server build and startup also succeeded with default Node 22.15.0. No lint script exists; none was invented.

| Command / Check | Result |
| --- | --- |
| `git status --short --branch`, `git diff --stat`, `git diff --name-status` | Inspected on resume before repair; unrelated edits preserved. |
| Initial actual LOCAL startup | Exit 1, confirmed v6-generated/v7-runtime missing module. |
| Server `npm install` after pinning | Exit 0; removed one package, changed one, 226 audited. Existing 15 advisories: 1 low, 3 moderate, 10 high, 1 critical. No audit-force upgrades. |
| Server `npm run build` | Exit 0; canonical sync, explicit Prisma Client 6.16.2 generation. |
| Server `npm test` | Exit 0; 20 files / 69 tests (28 + 38 + 3). Includes 14 new media tests. |
| Client `npm run build` | Exit 0; Vite 8.0.9, 2222 modules. |
| Client `npm test` | Exit 0; 19 files / 83 tests (10 + 67 + 6). Six media/editor/render follow-up tests beyond the earlier 77. |
| `node --check` across source/scripts/tests/shared JavaScript | Exit 0; 269 files. Vue template/import resolution also covered by Vite. |
| Earlier guarded LOCAL media migration deploy/generate | Exit 0; additive table migration only. |
| Resumed guarded LOCAL `prisma migrate status` | Exit 0; 20 migrations, schema up to date; no Railway query. |
| CLI/runtime/generated version inspection | All 6.16.2. |
| Server/client `npm run dev:local` | Both running: backend 3000, frontend 5173. Backend verified LOCAL/loopback privately before writes. |
| Actual local HTTP checks | Health/catalog/public content 200; unauthenticated admin media/content 401; public WebP 200, 215,042 bytes, correct local CORS, nosniff and immutable headers. |
| Canonical/generated parity | Pass; five canonical modules / ten snapshots. Earlier isolated-root synchronization check also passed. |
| Markdown/link/fence and targeted secret-pattern checks | Exit 0; twelve changed/new Markdown documents and 124 changed/new files checked, no broken links/fences or secret-pattern findings; no changed/untracked env files. This is a targeted scan, not a comprehensive security audit. |
| `.env.example` inventory | None; expected `rg` exit 1. |
| `git diff --check` | Exit 0; no whitespace errors. |

Actual local browser checks also confirm 6 oz product card at $14.99, 18 oz card at $39.99, 6 oz Quick View, correct SKU/unit/line prices, right-side cart drawer, retained campaign attribution and original home sections. Only QA-added cart quantities were removed; original one-bag cart remains. No checkout/payment submitted. Local public image resolves and shows no horizontal overflow at the observed 578 px browser width; final real desktop/mobile/Safari and full keyboard/screen-reader checks remain separately required. The browser viewport override did not take effect in this resumed session, so requested 1440/390 dimensions are not falsely recorded as tested.

### Configuration, Deployment Gate And Remaining QA

No new env variables, copied secrets or env examples. Server uses existing `DATABASE_URL`, `NODE_ENV`, `PORT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `FRONTEND_URL`/`CLIENT_URL` plus existing auth/provider configuration. Client uses public `VITE_API_BASE_URL` or compatibility `VITE_API_URL` and `VITE_STRIPE_PUBLISHABLE_KEY`; modes retain local browser -> local backend in both DB targets. Normal `server/.env` was not edited or repurposed.

1. Review image upload/library and explanatory fields in Website, Products and Campaigns on real desktop/mobile/Safari. The authenticated local follow-up below verifies sign-in/reload, uploads, search/folders, metadata protection, Escape/opener focus, palette and section/footer image choices. Full keyboard/screen-reader, multi-page library, invalid/private/oversized file and failed-network QA remain separate; do not describe this as full accessibility certification.
2. Existing build/test results do not establish real Stripe, deployed sessions, customer authentication, Linux native Sharp installation or provider behavior. Run approved guest/signed-in checkout with selected variants, promo+campaign, once-only inventory/usage and customer ownership after reviewed deployment. Do not send emails/buy labels as an image test.
3. Storage is deliberately bounded. Review DB storage/backup cost and restore procedures; no private upload, asset cleanup, usage relation, object storage/CDN or historic replacement tools are implemented. Reupload approved assets in the intended database; local UUIDs do not reference Railway assets.
4. Obtain explicit Railway approval; verify target/backup/migration status and additive content/media SQL. Build/generate/install Sharp platform dependencies, apply through the approved deploy process, restart server, check protected upload/public images, then deploy matching frontend. Existing `start` invokes migration deploy, so do not deploy/restart casually. Content/media migrations remain unapplied/unverified on Railway in this phase.
5. Dependency advisory triage, including reported critical/high findings and unrelated package additions, remains a launch risk. No blanket `npm audit fix --force` or unrelated dependency cleanup was performed.

The repaired tree is suitable for focused commit review, not certified launch-ready. No commit/push. Recommended next phase: finish real-device authenticated editor QA, review assets/storage/dependencies, then explicitly approved coordinated deployment and controlled commerce/session regression QA.

### Authenticated Local Editor Follow-Up (2026-10-10)

With the user's explicit authorization, signed in through the existing local admin form using previously provided credentials; no credential values were written to files/docs, saved in a password manager or included in screenshots. Customer credentials were not used for this focused admin check. Actual login redirected to `/admin/website`; full browser reload stayed authenticated and the protected Website read completed without an alert. LOCAL DATA TARGET remained visible. The earlier request for manual sign-in is no longer an open verification item.

Verified in the actual local UI:

- Ingredient palette change to Calm Giving set its wrapper to `rgb(237, 246, 240)` and displayed Edited-not-saved markers. The section itself is transparent by design so the wrapper color is visible. Restoring Original section returned the draft to clean Published website state without Save/Publish.
- Authenticated library list/thumbnail/dimensions/capacity; unmatched search empty state, matching Halloween search, Products-folder exclusion and Website-folder match. Only one image exists, so multi-page navigation remains unproven in this browser check.
- Unsaved metadata disables Use this image and enables Save image details. Escape closes and returns focus to Choose library. Reopening retains the actual saved name, not the unsaved QA name. A Shift-Tab observation did not conclusively establish complete focus wrapping; keep full keyboard/browser-chrome/screen-reader QA open.
- Library selection applies the canonical image immediately to the central section preview, thumbnail and artwork indicator. Clear restores the unchanged form. Post-repair upload of the same generated PNG succeeds and reports reuse/no duplicate. No new blob or metadata record is created.
- Seasonal Clear removes the global artwork in the preview and displays the no-artwork/unsaved state. Choosing the original library image restores the exact saved background and clean state. Footer palette and artwork selections also update the actual miniature footer; every temporary selection was restored without Save/Publish.
- Product library selection updates the actual product-card canvas to the media image while the 6 oz /18 oz prices remain $14.99 / $39.99. Update Product was never submitted. Cancel triggered the existing native Discard unsaved product changes confirmation; browser control paused and the user accepted it. Resumed observation confirms the product form closed and the unchanged seven-product library returned.
- Campaign library selection updates the actual campaign hero canvas and inspector thumbnail to the canonical media image; the rendered hero completed loading from the configured local backend. The selected library description prefills Image description. Restored both the original photo URL and description through the form, then Cancel returned directly to the campaign list with no further discard prompt. Save campaign was never submitted; status, public-page visibility, donation rule and product eligibility were unchanged. Returned to Website with Published website displayed and Save draft/Publish disabled.

Read-only guarded LOCAL DB check after these interactions confirms Website revision **9**, draft equal to published, exactly **one** image asset, the original saved Chicken product photo, and the original campaign photo and image description. No Website/product/campaign write or provider/customer action occurred in this follow-up beyond the checksum-deduplicated upload request. Screenshot evidence was captured without credentials. These are additional real UI checks, not another application-code change. Updated only this handoff and the admin guide's stale URL-only campaign wording; docs-only verification applies, so the preceding passing builds/tests were not needlessly rerun.

Follow-up commands: required Git status/diff inventories inspected; local health request returned 200/OK; guarded DB read exited 0 with all unchanged-state assertions above; Markdown/link/fence and targeted secret-pattern checks passed for both modified documents; `git diff --check` exited 0. Native product-discard confirmation was not exposed by the supported dialog control and paused browser interaction. The user's acceptance resolved that interruption; product dismissal and campaign-canvas checks then completed. This was not another server failure. No saved product or campaign data was changed, no native prompt remains, and the clean Website editor is left open for review. Deployment, real-device accessibility/Safari, dependency advisories and the controlled commerce/provider QA listed above remain open; no Railway action, commit or push was performed.

## 2026-10-10 Receipt First, Soft Essentials And Manual Order Email

Continued the existing combined local tree after reading AGENTS/handoff and relevant product, UX, customer, admin, communications, operations, roadmap, architecture and QA guides. Git inventories were inspected before changes and on resume. Preserved prior Website/media/product/campaign/storefront edits and published Autumn content. No commit/push, env-file change, env example, Railway query/migration/deployment, real customer email, real/test charge, label/shipment purchase or destructive reset/reseed. This is implemented local source plus bounded local QA, **not launch/deployment certification**.

### Delivered Customer And Admin Experience

- **Receipt First checkout:** existing contact/shipping/delivery/payment/summary cards and shadows remain. Bag is open before the form on narrow containers and alongside it on wide containers. Readability/focus/borders are improved without rebuilding the checkout engine. Fixed the secure submit previously hidden below XL; it is now visible on mobile. Form/promo fields lock while processing or after completed payment, while retry remains available outside the disabled fieldset.
- **Checkout accounts:** sign-in/create stays in a dialog on checkout. Create adds first/last name, password confirmation and a separate review/edit/confirm step; normalized email and existing Better Auth validators/APIs remain authoritative. Confirm verifies an active session and safely prefills blank fields without losing the bag or existing checkout data. A failed signup-session retry does not recreate the account. Guest checkout stays available.
- **Actual wallets:** Stripe Express Checkout Element supports Apple Pay/Google Pay when Stripe/device/domain allows, with honest card fallback. Server-owned PaymentIntent total must equal the reviewed total before confirmation. Wallet success uses the existing payment/order coordinator; an order-network failure after success can reuse that payment rather than charge again. Website -> Checkout has independent published wallet switches; card remains available. No active-wallet transaction was performed in this phase.
- **Shared cards:** one bordered/shadowed surface and one normalized purchased-item card supply selected variant, quantity, unit/line price, SKU, actual image/fallback and attribution across bag/checkout/confirmation/account orders. Catalog cards reuse the surface. Campaign emerald wins when both giving/promo apply; promo stays labeled. Applied order promos are not guessed public product-specific discounts. No additional product/campaign columns were needed.
- **Campaign quick pop-out:** published campaign badges open a native dialog with the same actual `CampaignPageContent.vue` used by the public route/editor. It retains story/partner/giving/schedule/eligible products; browse actions return to shop rather than pretending to purchase inside an unconnected preview. Shared campaign reads coalesce; the cart focus trap defers to an open modal. Private/disabled campaign pages keep plain giving attribution.
- **Soft Essentials confirmation:** saved order/variant/totals/contact/delivery/tracking, restrained color/shadows, business-funded giving, guest/account history guidance and truthful receipt destination. It does not claim an email was sent unless the stored confirmation email was provider-accepted; that still is not inbox-delivery proof. Cancelled/refunded orders do not promise preparation.
- **Final receipt refinement:** removed duplicate Donation generated/Donation impact billing rows and the earlier detailed pre-total campaign amounts. Checkout now has Items subtotal/count, optional negative discount/code, Shipping, Estimated tax and one prominent Order total, with aligned tabular amounts. The user initially suggested arithmetic symbols but then requested the conventional industry-standard receipt look, so plus/equal markers are removed. Shared `CommerceGivingNote.vue` is now a separate soft-emerald/shadow card below the entire checkout summary and outside the confirmation financial panel, with a prominent amount, actual beneficiary/campaign and concise no-extra-cost/business-funded wording. Checkout contributions are estimated; receipts use saved attribution. Public campaign metadata joins by ID without replacing server amounts/beneficiaries; only published pages show the About campaign pop-out action. Private campaigns remain private. Zero giving is omitted. Email HTML/text use the same beneficiary rule and separate post-total thank-you. No financial calculation/schema change was required for this refinement.
- **Postal shipping review:** labeled autofill fields, optional apartment/unit expansion, Use this address -> compact postal-address block -> Edit with retained fields and focus restoration. Completeness is presentation-only; checkout validation remains authoritative and account addresses are not silently saved. Canada gets a province/territory input instead of the US state dropdown. Existing four US state choices are retained; destination/carrier coverage is not certified. Stripe Address Element was reviewed but not installed; no address is labeled verified/deliverable.
- **Secure action repairs:** the ready button had a blue `--brand-1` background with brown text. It now uses immutable storefront yellow/brown, a full-width lock action, visible disabled/processing states and reduced-motion spinner. Live inspection also found that the readiness expression returned an empty string for a missing field, which Vue cast to true for the Boolean component prop. Explicit `Boolean(...)` fixes the misleading enabled state; existing submit validation already rejected missing details. A regression test exercises the actual coordinator, and admin sample canvas uses the same inert button.
- **Consistent page editor:** existing Website workspace selects Homepage/Checkout/Order confirmation. Same navigation/shared actual UI/context inspector, draft Save/Publish/Cancel, section-specific changed markers and selection scrolling. Editable copy/background/help/wallets are separate from protected live financial/customer/payment data. Real checkout components render with fictional sample/inert Stripe fields; no payment/provider is initialized in preview. Old publications safely merge canonical commerce defaults without false dirty state.
- **Email Template Center:** protected thirteenth admin tool, five rich suggestions (received/preparing/shipped/delivered/cancelled), editable saved copies, archive/reactivation, optimistic revision, live fictional sample/wide/phone previews and explicit Save/Cancel. Validated plain-text placeholders inside server-controlled responsive HTML/text; no arbitrary HTML/code builder.
- **Orders manual email:** choose saved/suggested template -> actual saved order/recipient preview -> review checkbox -> default dry run or deliberately enable real Send. Server rechecks status/tracking, recipient, admin actor, template revision and order/render fingerprint. A sample/unsaved/stale/expired/wrong-actor preview cannot send. Rate limit, unique reservation, provider idempotency, audit and notification preferences remain. Result/activity refresh distinguishes MOCKED/SENT/FAILED/DUPLICATE/SKIPPED. No arbitrary recipient override.
- **No automatic operational emails:** removed checkout receipt/admin notices, failed-payment notices, order status and shipping/tracking triggers. Provider blocks operational events unless internal manual approval exists. Old blind resend endpoint returns 410. Essential Better Auth verification/reset and intentionally enabled welcome/security email stays intact. Bulk promo/support/review templates and failed-send reconciliation are not implemented here.

### Verified High-Risk Repairs

1. **Server pricing was not fully server-owned.** Preview calculated browser item prices; finalization trusted item names/SKUs/prices. Added catalog resolution against actual ACTIVE products/active selected-size variants, positive bounded integer quantities, combined stock checks, authoritative database cents/name/image/SKU. Checkout preview, PaymentIntent creation, finalization, public promo validation and campaign preview now share this boundary. Browser price/subtotal/SKU/line/donation/shipping amount spoofing was tested.
2. **Anonymous reference-only receipts exposed PII.** Receipt GET now requires owning Better Auth customer or a 24-hour reference-scoped proof from successful verified checkout; response is no-store. Client stores this only in memory/sessionStorage and sends `X-Order-Receipt`, not URL/localStorage. Another reference/forgery/expiry fails. Reference-only guest bookmarks intentionally no longer reveal order contact/shipping data; verified guest recovery is future work.
3. **Payment-ID replay could mint receipt access.** PaymentIntent creation returns an email/PaymentIntent-bound 24-hour checkout proof. Order POST checks it before finalization and still verifies Stripe. Bare PI ID/email is insufficient. Proofs are scoped resource capabilities, not admin/customer bearer-auth fallback. Existing stable server signing secrets are used; no real proof/token is logged/documented.
4. **Inventory/order writes were separate.** Conditional limited-stock decrement and Order/OrderItems now share one Prisma transaction; made-to-order/preorder do not decrement tracked stock. Unique PaymentIntent failure rolls back decrements. Verified newly created orders are PAID. Shipping carrier/service/rate/provider is forwarded into the saved order rather than dropped. Retry finds the persisted original order before spent stock/promo revalidation.
5. **Stale preview/payment UI:** scheduling a preview invalidates in-flight responses immediately; submission requires fresh trusted pricing before a new payment. Card and wallet compare reviewed versus server-created total, and completed payment retries do not pay again. Stripe load failures get readable fallback; sample payment fields do not load Stripe.

**Still not atomic across the entire purchase:** promo/campaign usage is recorded in separate post-order operations and failures are caught. Concurrent promo limits/usage persistence, changing catalog prices/stock/carrier rates after payment, guest recovery and payment reconciliation remain launch risks. No broad reservation/webhook/fulfillment redesign was attempted. Existing timestamp-based order references and historical payment-state assumptions also need future hardening.

### Persistence And Actual Local Changes

Added `EmailTemplate` only: cuid id, name, event, subject, heading, body, footer, archived, revision, created/updated timestamps and event/archive index. Migration `server/prisma/migrations/20261010000000_manual_email_templates/migration.sql` is additive. Wallet/confirmation settings live in existing `StorefrontContent` JSON. `EmailDelivery` retains delivery/audit; no real email is produced by template creation.

Privately verified normal local DATABASE_URL is loopback before migration/QA. Initial status showed 21 repository migrations with only the new template migration pending (expected exit 1). Guarded local `prisma migrate deploy` applied only it, exit 0. Final local status: **21 migrations/schema up to date**, exit 0. Prisma CLI/runtime/generated client remain **6.16.2**. No Railway status/query/action; earlier content/media and new email deployment still require approval.

Actual local UI saved one default **Order received** copy, reload proved persistence; temporary heading edits were canceled. Actual existing PROCESSING order preview then review/default dry run created one **MOCKED preparing email activity**. Live-send checkbox remained unchecked; no provider request/email. No order status, customer, product, campaign or Website publication was modified by that check. Website remains revision 9 with original draft/publication; the contributing campaign's public page remains disabled. Existing one 6 oz bag was retained.

### Files Created In This Phase

- `shared/storefront/commercePresentation.js` and client/server generated snapshots.
- Client shared `components/{CommerceCardSurface,CommerceItemCard,CommerceGivingNote,CommerceDialog}.vue`, `mappers/commerceItem.mapper.js`.
- Client checkout `Checkout/CheckoutLayout.vue`, `OrderSummary/CheckoutBagDisclosure.vue`, `OrderSuccess/OrderConfirmationContent.vue`, `composables/{useCheckoutPage,useCheckoutIdentity,useCheckoutShipping,useCheckoutAddressReview,useCheckoutAuth,useOrderConfirmation}.js`, `utils/receiptAccess.js`.
- Client payments `components/StripeWalletButtons.vue`; campaigns `components/CampaignQuickView.vue`, `composables/useCampaignQuickView.js`.
- Client admin `components/{AdminCommerceCanvas,AdminCommerceFields,AdminEmailPreview,AdminOrderEmailComposer}.vue`, `constants/commercePreview.constants.js`, `api/adminEmailTemplates.api.js`, `composables/useAdminEmailTemplates.js`, `views/AdminEmailTemplatesView.vue`.
- Server checkout `repositories/checkout.repository.js`, `services/checkoutCatalog.service.js`; shared `utils/signedCapability.js`.
- Server emails `constants/orderEmailTemplates.constants.js`, `controllers/emailTemplate.controller.js`, `routes/adminEmailTemplate.routes.js`, `services/emailTemplate.service.js`, `repositories/emailTemplate.repository.js`, `mappers/orderEmail.mapper.js`, `validators/emailTemplate.validator.js`; additive migration above.
- Client `tests/tier2/checkout/{commerce-presentation,shipping-address}.test.js`; server `tests/tier2/checkout/{checkout-security,order-inventory}.test.js`, `tests/tier2/admin/{manual-order-email,manual-email-provider}.test.js`.
- `docs/architecture/checkout-and-order-email.md`.

### Files Modified In This Phase

- Canonical `shared/storefront/{sectionCatalog,contentProjection,contentValidation}.js`, both generated snapshots, client/server sync scripts.
- Client `App.vue`, router, admin navigation, Website view/state, Order detail view/state/API/notification panel; Website components are prior untracked files extended here, not claimed newly invented by this phase.
- Client cart drawer/item/focus helper, product card/campaign badge, campaign page/loader/shared campaign state, account order details.
- Client checkout view/success view, contact/shipping/payment/submit/auth sections, order items/summary/totals/campaign-preview/promo box, preview/promo/payment coordinator/API; card Stripe component.
- Server schema/app, checkout controller/service, payment controller, public promo router, campaign controller, order repository/service/mapper/routes, shipping service, email provider.
- Existing client promo/admin-workspace/cart regression tests and server PaymentIntent fixtures.
- This handoff, `docs/{ux-ui-standards,customer-experience,admin-experience,communications,implementation-roadmap,verification-and-qa}.md`, `docs/architecture/{README,data-flow,database,file-map,admin,storefront-editor}.md`.

The full Git diff includes earlier unrelated approved edits/dependency repair/media work; do not treat every dirty file as new checkout/email work or revert it. Views stay thin; coordinator separates identity/shipping/auth, components/API are separate, server email validator/mapper/service/repository are distinct. Existing unused old checkout header/progress/mobile-summary components remain for a later focused dead-code review, not in the new rendering path.

### Commands And Verification

Default Node 22.15.0; no lint scripts exist, none invented. Commands/tests never sent real email or charged Stripe.

| Command / Check | Result |
| --- | --- |
| `git status --short --branch`, `git diff --stat`, `git diff --name-status` | Inspected before work/resume; unrelated edits preserved. |
| Client `npm run build` | Exit 0; Vite 8.0.9, 2255 modules; final rerun includes postal review, impact card, secure-action readiness and editor changes. |
| Client `npm test` | Exit 0; 21 files / 105 tests (11 + 88 + 6); final rerun passed. |
| Server `npm run build` | Exit 0; six canonical modules synced and explicit Prisma Client 6.16.2 generation. Not a server bundle. |
| Server `npm test` | Exit 0; 24 files / 93 tests (28 + 62 + 3). Twenty-four new checkout/inventory/manual-email tests beyond 69. Total client/server: 198 tests. |
| Guarded local `npx prisma migrate deploy` | Exit 0; only new EmailTemplate migration applied locally. |
| Guarded local `npx prisma migrate status` | Exit 0; 21 migrations, schema up to date. |
| Actual local HTTP/DB/UI | Checks described below, no real provider send/payment or Railway action. |
| `node --check` across source/scripts/tests/shared JavaScript | Exit 0; 300 files. |
| Canonical/generated parity | Exit 0; six modules / twelve app-root snapshots. |
| `.env.example` inventory | None; expected `rg` exit 1. |
| Actual unauthenticated template route checks | GET/create/update/preview/send all 401 before provider/persistence work. |
| Receipt-header CORS OPTIONS | 204; local origin, credentials and `X-Order-Receipt` allowed. |
| Mermaid CLI 11.15.0 cached tool on six architecture docs | Exit 0 for each; all 15 diagrams rendered to temporary SVGs (README 1, data-flow 11, admin 1, auth-roadmap 2; file-map/database have no charts). No repository dependency/SVG added. |
| Markdown local-link/fence checks | Exit 0; all 15 changed/new documents checked. |
| Targeted secret/env scan | Exit 0; 210 changed/new text files checked; zero targeted secret findings or changed env files. Historical documented `rg` pattern command lines excluded, no real values printed. |
| `git diff --check` | Exit 0; no whitespace errors. |

Resolved verification diagnostics: fixture assertions were updated for the thirteenth admin tool and mobile submit; PaymentIntent tests now provide valid required customer data rather than failing the new pre-payment validation. Shipping review tests initially used a non-SSR renderer for SSR-compiled Vue fixtures; replaced with actual composable unit tests plus proper Vue SSR field tests, all pass. Intermediate patch context failures made no partial file changes. Final whitespace/secret/docs/syntax/parity results are recorded above. Prior dependency advisories were not force-upgraded or silently dismissed.

Actual local promo HTTP QA created a disposable 10% promo with one-use-per-email and short expiry. Eleven checks passed: missing email rejection; trim/lowercase; DB subtotal/discount despite forged subtotal; server preview ignored forged item/total/SKU/shipping/donation amounts; real eligible campaign giving coexisted without extra total; synthetic redemption rejected a second normalized email use; expired/invalid checks; invalid promo prevented PaymentIntent creation; unauthenticated template API rejected; anonymous reference-only order rejected. Removed only disposable promo/usage fixture rows. No PaymentIntent/provider operation was created.

Actual rollback-only local Prisma transaction created fictional limited/made-to-order variants/orders, checked quantity 2 stock 3 -> 1 only for limited stock and PAID insertion, then deliberately rolled back. Post-check found no residual QA products/orders. Mock tests additionally prove guarded update/no insertion under insufficient stock and unique-error propagation; they do not prove high-load concurrency behavior.

Actual browser UI used existing local services 5173/3000 and authorized existing account/admin forms. Customer sign-in remained on checkout, retained the existing 6 oz item at $14.99 and safe address prefill; actual saved owned receipt showed its saved $22.97 total/account-history link. Reviewed signup UI was visible, but no new account was created (essential email can be enabled). Mobile secure submit and unavailable-wallet/card fallback rendered. Template save/reload, immediate unsaved preview/cancel, actual-order preview and deliberate no-send recording passed. Website checkout toggles/confirmation title/palette updated the shared preview, then restored clean without Save/Publish. Narrow observed browser and wide/390px embedded canvas were inspected; full desktop/mobile/Safari viewport/device/accessibility is not claimed. Temporary owned-order QA tab was closed; original checkout/editor tabs remain.

Current local contributing campaign has `publicPageEnabled = false`, so no pop-out action is shown for it. Shared renderer and publication gating pass automated tests; actual end-to-end published campaign popup remains manual QA. This gate was not bypassed or user content silently published. No actual card/Apple Pay/Google Pay payment, new signup, live Resend, Shippo purchase, deployed session or deployed provider behavior was certified.

Final actual checkout screenshot confirms the conventional receipt breakdown and separate emerald impact card: selected 6 oz item $14.99, shipping $5.99, estimated tax $1.99, unchanged total $22.97; $3.00 contribution is outside the bill and outside the summary container. Actual computed colors are yellow/brown for the ready action and emerald for the impact surface, with a restrained shadow. After Boolean readiness repair, the current incomplete form has both Use this address and secure submit disabled. No fake recipient/address was entered to force review; complete review/Edit/focus is unit/SSR verified, not claimed end-to-end browser verified. No payment/promo/customer/form was submitted for this visual check. Privacy-safe cropped proof is `/tmp/doggy-commerce-qa/checkout-impact-final.png`; temporary artwork is not committed. Intermediate hot-reload failed while the new canonical export had not yet been synchronized; final client/server builds synchronized it, and refreshed UI succeeded. This transient development diagnostic is recorded rather than treated as an outstanding build failure.

### Environment, Deployment And Next Gate

Names only; no values copied to source/docs. Existing client `VITE_API_BASE_URL` or compatibility `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`. Existing server `DATABASE_URL`, `NODE_ENV`, `PORT`, `CLIENT_URL`/`FRONTEND_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, optional `BETTER_AUTH_API_KEY`, `STRIPE_SECRET_KEY`. Email `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, optional `RESEND_REPLY_TO_EMAIL`; legacy `EMAIL_FROM`/`EMAIL_REPLY_TO` aliases and `EMAIL_PROVIDER`/`EMAIL_MODE` dry-run controls remain. Shipping provider variables unchanged. Wallet switches are published DB presentation, not provider keys. Stable signing secret across backend instances is required for checkout/receipt/email-preview proofs. No `.env.example` was added and normal local env was not repurposed.

**Deployment blocker:** old frontend finalization requests lack `checkoutProof`. Plan a coordinated matching server/frontend rollout and handle in-flight/stale checkout clients before accepting payments. Existing server `start` automatically applies migrations; explicitly approve Railway target/backup/pending content/media/email SQL and migration/deploy first. Do not assume local status is Railway status. Stripe wallet domains/HTTPS must be configured separately; publish wallet presentation only after that review. No Railway deploy was attempted.

Manual next steps:

1. Review checkout/confirmation/editor/templates on desktop/mobile/Safari, long copy/variants, keyboard/native dialogs/reduced motion/screen readers. Keep all earlier admin/account/storefront functionality and data-routing identity.
   Check postal autofill/apartment/province labels, complete review/Edit and focus/value retention without saving profile data, configured delivery regions/rates, incomplete disabled versus ready yellow/processing submit. Check impact below the entire bag even when collapsed; giving must never become a charge.
2. Use an approved signup flow to confirm review/edit/session and retained form/bag. Enable only a reviewed public campaign and test popup from bag/checkout/receipt with focus restoration and no state loss.
3. After matched deployment/domain review, run approved guest and signed-in Stripe **test** card/wallet flows with 6 oz/18 oz, invalid/one-per-email/expired promo, promo+campaign, server totals, once-only order/inventory/usage and post-payment network retry. Never pay again to recover an already successful payment.
4. Verify scoped guest receipt refresh, expiry/cleared storage/non-owner rejection and privacy. Guest emailed-link/recovery remains future work; saved reference alone does not grant access.
5. Email: suggested copy/save/archive/revision conflict, actual saved-status/tracking gate, stale preview rejection, default dry run and duplicate prevention. Save status/tracking must not send mail. Only with explicit inbox/budget approval send one real previewed message and inspect provider/client rendering; SENT is acceptance, not delivery. FAILED/pending sends need reconciliation, not blind retry.
6. Triage existing critical/high dependency advisories and earlier unrelated dependencies; strengthen promo/campaign atomicity/reservations, post-payment reconciliation, receipt recovery and provider failure retry before claiming launch readiness.

Recommended next phase: focused visual/device review and commerce/provider security QA, followed by explicitly approved coordinated migration/deployment; not a new broad refactor. [Architecture and flow](docs/architecture/checkout-and-order-email.md), [file map](docs/architecture/file-map.md), [communications policy](docs/communications.md), [QA](docs/verification-and-qa.md). The continued edits are safe for focused commit review after these local checks, not a launch or live-provider certification. No commit/push/deploy; local servers remain available.

## 2026-10-11 Production Audit And Approved Better Auth Admin Migration

### Authority And Scope

This is the current evidence checkpoint and supersedes older custom-admin, 152-test, 20-migration and automatic-email descriptions in this historical handoff. Initial tree was clean on dev-main. The user requested the comprehensive security/commerce/architecture audit and explicitly approved: repair copied-session logout and move admin to Better Auth. No commit/push/deploy, Railway migration/provisioning, secret rotation, live email, real payment or label purchase occurred.

Full deliverables:

- [Production audit, Sections A-H](docs/audits/2026-10-11-production-audit.md): architecture/coverage, 29 findings, file management, commerce, exact verification, manual QA, remaining risks and 14-category scorecard.
- [API access inventory](docs/audits/2026-10-11-api-access.md): all mounted app routes and 105 installed customer/Infra native paths with access/validation/response/limiter notes.
- [Current auth/provisioning/rollout](docs/architecture/auth-roadmap.md): separate Better Auth customer/admin configs, migration, local data modes, variables and manual deployment gates.

### Root Cause And Admin Repair

The old admin cookie contained a signed session that remained valid after logout; deleting a browser cookie did not revoke copies. The approved repair replaces the custom signed/Map implementation with Better Auth database sessions on existing User/Account/Session tables, behind compatible /api/auth/login, logout, me and data-target. Native /api/admin-auth exposes only sign-in/email, sign-out and get-session. No new Prisma model/migration.

- Persisted ADMIN/ACTIVE role/status required on every server-protected request; no public admin signup or bearer-token fallback.
- Separate doggy-admin cookie prefix; HttpOnly, path /, host-only; local SameSite=Lax and production Secure/SameSite=None for current split hosts.
- Absolute eight-hour admin expiry; refresh/cookie cache disabled. Old signed cookies rejected/cleared.
- Native logout deletion is checked after the engine: failed DB revocation does not report success. Same failure safeguard applied to customer logout.
- All native customer/admin JSON responses strip password/session/provider tokens, including list-sessions/change-password; transport cookies remain HttpOnly.
- Typed admin credential validation, safe admin-only return paths and /api/auth/me confirmation before redirect.
- Existing dashboard, thirteen tools, customer accounts, guest checkout, editor UX and signed-in/data-routing controls preserved.
- Deliberate provisioning imports an existing bcrypt hash only into a new ADMIN credential. Future new hashes use Better Auth scrypt. CUSTOMER conflicts/overwrite refused; no startup provisioning.
- Local npm run admin:provision preflight and -- --apply succeeded, creating only the authorized local admin/credential/provision event. Re-running does not rotate a stored credential.
- New protected order/tracking/customer/support histories use actual ADMIN actor ID; historical ADMIN_ENV unchanged. Customer lifecycle tools cannot target ADMIN rows.
- Better Auth customer Infra configuration stays on /api/customer-auth. Dashboard Base URL is the public backend origin represented by BETTER_AUTH_URL; Base Path /api/customer-auth. No second admin Infra integration, MFA or fine-grained role system was enabled.

Better Auth does not solve Safari third-party-cookie blocking between unrelated Vercel/Railway hosts. Owned domain plus same-site API subdomain remains recommended. Production remote admin provisioning and browser acceptance are not completed.

### Other Verified Repairs

- Customer-safe checkout finalization/replay; internal status history/notes/actors omitted entirely. Internal support-note events and private metadata excluded from customer projection.
- Public products hide DRAFT/ARCHIVED; protected /api/products/admin/library keeps full admin catalog with existing cents normalization.
- Transactional product variant replacement avoids partial deletion on failed save, preserves inactive sizes and validates prices/sizes/inventory/types.
- Bounded typed own-profile fields and preference/address validation.
- Order references gain random suffix; concurrent status save compare-and-set returns 409 with history in one transaction. Tracking cannot regress terminal/cancelled/refunded states.
- Native auth raw transport now capped at 100 KB for declared/chunked requests, using the existing framework's better-call Node adapter.
- Production auth fails closed on missing/short signing secret or non-HTTPS/credential-bearing backend URL. BETTER_AUTH_URL is origin-only: an auth path/query/fragment would override the installed engine's separate basePath configs and is rejected. Localhost is not automatically trusted in production.
- LOCAL startup refuses remote DB hosts; Railway DB mode requires a remote DATABASE_URL override. Startup command target takes precedence. Production badge says DEPLOYED DATA TARGET; failed lookup says TARGET UNVERIFIED, not LOCAL.
- Destructive product seed requires explicit confirmed LOCAL loopback development target; never executed during audit.
- Generic DB/provider errors, no Prisma raw query/error logging, sanitized exception capture and allowlisted structured operational/admin-write logs.
- Resend/Shippo errors no longer persist/log raw provider text; requests use bounded provider timeouts. Shippo webhook fails closed when secret absent, with timing-safe comparison. It remains acknowledgement-only, not fulfillment/event processing.
- Security email dedupe uses one-way action URL digest; no token/action URL persisted in metadata. Identical action dedupes; new verification links can be requested. Operational emails remain explicit preview/send.
- Admin-triggered customer verification/reset now uses absolute validated frontend return URLs instead of relative backend paths. Production startup checks that frontend origin; live email delivery/return remains untested. Temporary local-to-Railway-DB email should stay mocked unless public auth URL/signing configuration and an approved inbox/budget have been reviewed.
- Admin tracking links reuse safe render helper; new tracking URLs must be HTTPS without credentials.
- Vercel static security headers and SPA rewrite exclude /api and /api/...; Font Awesome CSS has published/matched SHA512 SRI and CORS. Vite binds only loopback/trusted dev host.
- Removed unused approve, ls, scripts packages; compatible audited lock updates; justified direct better-call transport dependency. Prisma/client remain matched 6.16.2.
- No broad reorganization/dead-file deletion, UI redesign, payment engine rewrite or new schema.

### Repository Audit Evidence

Initial inventory: 567 tracked files. Later first-party inventory: 584 before final docs additions. All folders inventoried; 458 source/script Vue/JS modules parsed with zero parse failures/missing literal imports; 266 standalone source/script JS files syntax checked; six generated deployment content snapshots match canonical shared/storefront.

19 empty placeholders, 24 nonempty client literal-import-unreachable candidates and server compatibility/CLI-only modules are documented, not blindly deleted. Products service directly uses Prisma and promo routes still have controller responsibilities; these established exceptions were preserved. Existing product editor notIncluded/guaranteedAnalysis/showGuaranteedAnalysis/lowStockThreshold fields still lack persisted schema columns; explicitly open functionality gap.

Secret-pattern/source/build checks found no matches in inspected current first-party text/built assets, no source maps and no localhost in the application API helper build chunk. Current .env files are untracked/ignored and no .env.example exists. Git history has a prior server/.env path, but the blob is zero bytes with no assignments; this does not establish a credential leak. No full all-blob secret-history guarantee is made. No secret values were printed/copied/documented or env files modified.

### Exact Commands And Results

| Command/check | Final result |
| --- | --- |
| Initial git status, git diff --stat, git diff --name-status | Clean tree at audit start; all subsequent changes left for review |
| client npm run build | Exit 0; Vite 8.3.4; 2263 modules; main JS 308.22 KB / 85.04 KB gzip |
| server npm run build | Exit 0; canonical sync + Prisma Client 6.16.2 generated; repeated after final server change |
| client npm test | Exit 0; 22 files, 109 tests: 11 tier1 + 92 tier2 + 6 tier3 |
| server npm test | Exit 0; 31 files, 125 tests: 28 tier1 + 94 tier2 + 3 tier3 |
| Combined | 53 files, 234 passing tests; 36 added test cases |
| npx prisma migrate status | Exit 0; confirmed local loopback DB; 21 migrations; schema up to date |
| npm run admin:provision | Exit 0; initial preflight/no writes; final repeat reports already provisioned/no changes |
| npm run admin:provision -- --apply | Exit 0; confirmed local ADMIN credential/event created; no customer/password overwrite |
| Guarded local Prisma + ephemeral HTTP smoke | Exit 0; real DB admin session/catalog read/logout deletion/copied-cookie 401; 20 anonymous protected read groups 401; 3 private-file JSON 404 probes; disallowed origin 403. Test session removed |
| Targeted actual auth-engine tests | Pass; admin/customer role isolation, token redaction, expiry, origin/legacy cookies, copied-cookie logout and injected DB revocation failure; customer reset reuse/expiry/session revocation |
| 266 node --check source/script modules | Exit 0; zero syntax failures |
| Babel/Vue literal import graph | 458 parsed; no parse failures/missing literal imports |
| Canonical content snapshots | Six modules, client/server copies: no drift |
| npm ls --depth=0, client/server | Exit 0; no missing/extraneous direct dependencies |
| client npm audit --json | Exit 0; zero advisories (baseline 10) |
| server npm audit --json | Exit 1; four HIGH remaining, no critical/moderate/low (baseline 15) |
| root npm audit --json | Exit 0; zero advisories; root has no app dependencies |
| npm uninstall approve ls scripts --ignore-scripts | Exit 0; ten packages removed |
| client npm audit fix --ignore-scripts | Exit 0; compatible fixes, no remaining advisories |
| server npm audit fix --ignore-scripts | Exit 1 due four remaining Prisma tooling advisories; no force/downgrade applied |
| npm install better-call@1.3.6 --save-exact --ignore-scripts | Exit 0; bounded auth adapter dependency justified |
| Published Font Awesome SRI versus fetched CSS SHA512 | Match; public text-only check, no private data |
| Markdown links/fences | 24 files; zero unclosed fences/missing local links |
| Cached official Mermaid CLI | Exit 0; 20 diagrams -> 20 nonempty temporary SVGs; no repo dependency/output added |
| git diff --check | Exit 0 |
| curl --fail --silent local /api/health | Exit 0; status OK on the existing local server |
| Browser acceptance | NOT VERIFIED: CUA URL access policy-blocked; no workaround/screenshot/browser-login claim |

Intermediate test/setup failures were repaired and rerun: old ADMIN_ENV email audit expectation updated to ADMIN; a new test syntax typo fixed; an origin fixture exposed missing native first-login guard and was fixed; local smoke setup's private package import failed before session creation, replaced with exported serializeSignedCookie. Final tests/builds passed. No lint/typecheck scripts exist; none added. No clean npm ci, live provider, load benchmark, full accessibility or browser/Safari certification.

### Dependency Residual Risk

Server npm audit lists prisma, @prisma/config, deepmerge-ts and effect as HIGH: recursive graph exhaustion and Effect RPC context contamination propagate via Prisma CLI/config. No untrusted Effect RPC endpoint/user-controlled Prisma configuration was found, so application exploitability is not assumed. npm's force proposal changes to Prisma 6.12.0; do not downgrade/major-upgrade casually. Plan a matched CLI/client upgrade with build/migration/regression checks.

### Environment And Manual Rollout

Variable names only:

- Server: DATABASE_URL; NODE_ENV; PORT; BETTER_AUTH_SECRET (preferred dedicated >=32-character secret); BETTER_AUTH_URL (HTTPS backend origin); CLIENT_URL and/or FRONTEND_URL (comma-separated exact frontend origins).
- Deliberate initial admin provisioning: ADMIN_EMAIL; ADMIN_PASSWORD_HASH (bcrypt cost at least 10). These no longer rotate a provisioned DB password on restart.
- Compatibility: ADMIN_SESSION_SECRET signing fallback; API_BASE_URL backend origin fallback.
- Existing provider/Infra features: STRIPE_SECRET_KEY; BETTER_AUTH_API_KEY; EMAIL_PROVIDER; RESEND_API_KEY; RESEND_FROM_EMAIL; RESEND_REPLY_TO_EMAIL; SHIPPO_API_KEY or SHIPPO_API_TOKEN; SHIPPO_WEBHOOK_SECRET; existing Shippo sender/parcel variable names in architecture/provider docs.
- Client/Vercel: VITE_API_BASE_URL or compatibility VITE_API_URL; VITE_STRIPE_PUBLISHABLE_KEY; public-only display/config variables. No VITE secret.
- Ignored local files: server/.env remains normal local DB; server/.env.railway.local supplies remote overrides; local client env files remain public config only. No .env.example created.

Temporary commands unchanged:
1. Fully local: server npm run dev:local; client npm run dev:local.
2. Railway DB admin: server npm run dev:railway; client npm run dev:local. Browser uses local API, not Railway backend.
3. CLI admin provisioning uses its own normal env loading; a running Railway-mode server does not change the CLI's target. Default CLI refuses remote hosts; --allow-remote is only for a separately approved reviewed rollout.

Before any separately approved Railway provisioning/deployment: confirm backup/target/schema status and admin-email conflict; provision without promotion/overwrite; deploy matching backend/frontend; expect old admin sessions to reauthenticate; test HTTPS/cookies/CORS and existing thirteen tools. server npm start runs prisma migrate deploy, not a read-only verification. No new auth migration, but any existing pending migration still needs owner approval. Vercel dashboard project root/headers/API base and Railway config were not inspected.

### Remaining Launch Gates And Manual QA

**Not ready for real paying customers.** Successful payment can be left without an order because finalization is browser-driven with no durable attempt/webhook recovery; prices/stock/rates/promos can change after payment. Promo/campaign usage commits separately and can race/fail after a discounted order persists. REFUNDED does not execute Stripe refunds, and tax/shipping jurisdiction/provider behavior remains uncertified.

Next approved phase: durable checkout snapshot/idempotency, raw-body signed Stripe webhook/event dedupe, atomic/reserved inventory/promo/campaign attribution and post-payment/refund reconciliation. Follow with Prisma remediation, backup/restore/monitoring proof, live-provider/device QA and MFA. Do not launch or charge again as a recovery workaround.

Manual next checks:
- Local admin login/reload/restart/logout/relogin, customer denial, no cookie-copy access, all thirteen tools/identity/target labels.
- Product public/draft privacy, failed-save stock retention, inactive 6/18 sizes, cart/quick-view/guest and signed-in checkout retained.
- Customer ownership/profile/disabled-account, signup/reset/verification with approved inbox and email budget; no token leaks.
- Email-before-promo, expiry/limits/email changes, campaign coexistence/server totals; concurrent purchase certification still blocked.
- Receipt proof/reference/non-owner/expiry privacy; no internal status history/support notes or Stripe secrets.
- Staged status/tracking, actual actors/terminal guards, no automatic email; explicit template preview/confirmation/dry-run/dedupe.
- Real desktop/mobile/Safari, wallet/required-auth redirect/network recovery under approved Stripe test setup only after durability repair.
- Vercel direct routes/static headers/API root, Railway target/migrations/provisioning/TLS/proxy, DB least privilege/backups/PITR/restore, operational alerts and provider reconciliation.

See the full report for the 14-category scorecard. Tree is safe for focused commit review with stated risks, not automatic deployment or launch. No application files removed, no env changed, no schema/migration added, nothing committed/pushed.

### Exact Files Created (21)

```text
client/src/domains/admin/validators/adminAuth.validator.js
client/tests/tier2/admin/admin-auth.test.js
docs/audits/2026-10-11-api-access.md
docs/audits/2026-10-11-production-audit.md
server/scripts/provision-admin.js
server/src/app/middleware/auth/boundedAuthHandler.js
server/src/domains/account/validators/account.validator.js
server/src/domains/auth/repositories/adminProvision.repository.js
server/src/domains/auth/services/adminAuth.service.js
server/src/domains/auth/services/adminProvision.service.js
server/src/domains/auth/utils/authResponse.js
server/src/shared/utils/apiError.js
server/src/shared/utils/databaseSafety.js
server/src/shared/utils/operationalLog.js
server/tests/tier2/admin/admin-provision.test.js
server/tests/tier2/admin/admin-session-service.test.js
server/tests/tier2/admin/audit-security.test.js
server/tests/tier2/admin/better-auth-admin.test.js
server/tests/tier2/admin/catalog-safety.test.js
server/tests/tier2/admin/customer-auth-security.test.js
server/tests/tier2/orders/audit-order-integrity.test.js
```

### Exact Files Modified (81)

```text
AGENTS.md
PROJECT_HANDOFF.md
README.md
client/index.html
client/package-lock.json
client/src/domains/admin/api/adminProducts.api.js
client/src/domains/admin/api/adminSession.api.js
client/src/domains/admin/components/AdminDataTargetBadge.vue
client/src/domains/admin/components/AdminOrderTrackingPanel.vue
client/src/domains/admin/views/AdminLoginView.vue
client/src/domains/checkout/composables/useCheckoutPage.js
client/src/domains/checkout/composables/useCheckoutPreview.js
client/src/domains/checkout/composables/useCheckoutShipping.js
client/src/domains/payments/services/payment.service.js
client/vercel.json
client/vite.config.js
docs/admin-experience.md
docs/architecture/README.md
docs/architecture/admin.md
docs/architecture/auth-roadmap.md
docs/architecture/data-flow.md
docs/architecture/database.md
docs/architecture/diagram.md
docs/architecture/file-map.md
docs/architecture/mockdiagram.md
docs/communications.md
docs/customer-experience.md
docs/implementation-roadmap.md
docs/operations-and-issues.md
docs/verification-and-qa.md
server/package-lock.json
server/package.json
server/src/app.js
server/src/app/middleware/auth/requireAdminAuth.js
server/src/app/middleware/auth/requireCustomerAuth.js
server/src/app/middleware/error.middleware.js
server/src/app/middleware/security/rateLimit.middleware.js
server/src/config/env.js
server/src/db/prisma.js
server/src/db/seeds/products.seed.js
server/src/domains/account/controllers/account.controller.js
server/src/domains/account/services/account.service.js
server/src/domains/auth/routes/auth.routes.js
server/src/domains/auth/services/auth.service.js
server/src/domains/auth/services/customerAuth.service.js
server/src/domains/campaigns/routes/campaigns.routes.js
server/src/domains/checkout/controllers/checkout.controller.js
server/src/domains/checkout/services/checkout.service.js
server/src/domains/customers/controllers/adminCustomers.controller.js
server/src/domains/customers/repositories/adminCustomers.repository.js
server/src/domains/customers/services/adminCustomers.service.js
server/src/domains/emails/controllers/emailDelivery.controller.js
server/src/domains/emails/controllers/emailTemplate.controller.js
server/src/domains/emails/mappers/emailPayloads.mapper.js
server/src/domains/emails/services/emailProvider.service.js
server/src/domains/emails/services/emailTemplate.service.js
server/src/domains/orders/controllers/orders.controller.js
server/src/domains/orders/mappers/orders.mapper.js
server/src/domains/orders/repositories/orders.repository.js
server/src/domains/orders/services/orders.service.js
server/src/domains/payments/controllers/payment.controller.js
server/src/domains/payments/services/stripe.payment.js
server/src/domains/products/controllers/products.controller.js
server/src/domains/products/mappers/products.mapper.js
server/src/domains/products/routes/products.routes.js
server/src/domains/products/services/products.service.js
server/src/domains/products/validators/products.validator.js
server/src/domains/promos/services/promos.service.js
server/src/domains/shipping/controllers/shipping.controller.js
server/src/domains/shipping/services/shipping.service.js
server/src/domains/shipping/services/shippo.service.js
server/src/domains/shipping/validators/shipping.validator.js
server/src/domains/support/controllers/support.controller.js
server/src/domains/support/mappers/support.mapper.js
server/src/domains/support/services/support.service.js
server/tests/tier2/admin/internal-record-auth.test.js
server/tests/tier2/admin/manual-email-provider.test.js
server/tests/tier2/admin/manual-order-email.test.js
server/tests/tier2/admin/media-routes.test.js
server/tests/tier2/admin/public-campaigns.test.js
server/tests/tier2/admin/storefront-content.test.js
```

## 2026-10-12 Railway Startup Incident: Read-Only Verification

This checkpoint supersedes earlier statements that Railway deployment/configuration had not been inspected. Earlier local build/test results remain historical, not newly executed checks. The user connected Railway after providing crash logs; connection alone did not authorize changing production configuration or deploying.

### Confirmed Production State

- Railway project: artistic-gentleness; environment: production; backend service: doggy-ent. The connected service's public domain matches the backend in the user's screenshot.
- Latest backend deployment: 73fe0611-e0cd-4ba4-9dc3-4a06af18674d, status CRASHED, created 2026-10-12T06:53:47.782Z. Metadata identifies main commit 50a706055b002b63e28ebea26410c72149740b51, merge of pull request 28. The preceding deployment was removed during rollout.
- Postgres latest deployment reports SUCCESS. This is service status, not a database integrity/backup certification.
- Backend root directory is /doggy_ent_vue/server, builder RAILPACK, start command npm run start. That script executes Prisma migration deploy before importing the application. It must never be used as a read-only diagnostic command.
- No staged environment changes were reported at inspection time.

### Root Cause And Required Configuration

Runtime logs repeatedly report: `A dedicated Better Auth signing secret is required in production.` The stack points to `getAuthSecret()` in [env.js](server/src/config/env.js), called when [adminAuth.service.js](server/src/domains/auth/services/adminAuth.service.js) initializes, before [server.js](server/src/server.js) starts listening.

The previous production security pass introduced fail-closed configuration validation. Its deployment reached Railway without the required configuration; this is an incomplete rollout, not evidence that CORS or Prisma needs to be weakened.

Required variable names and placeholder descriptions only:

| Variable | Required recovery configuration |
| --- | --- |
| BETTER_AUTH_SECRET | Dedicated strong random signing secret, at least 32 characters, backend only. Preserve an existing intended signing secret if available; deliberate rotation invalidates signed state. |
| BETTER_AUTH_URL | Public HTTPS backend origin only; no auth endpoint path, query, fragment or embedded credentials. |
| FRONTEND_URL and/or CLIENT_URL | Exact allowed frontend origins and a valid primary HTTPS storefront origin. FRONTEND_URL is present, but its value was deliberately not read. |

The fully rendered variable-name inventory contains neither BETTER_AUTH_SECRET nor its ADMIN_SESSION_SECRET fallback, and neither BETTER_AUTH_URL nor its API_BASE_URL fallback. No sealed variables were reported; values were withheld by the connected OAuth integration. BETTER_AUTH_API_KEY is present but is the Infrastructure dashboard key, not the signing secret.

The missing secret is the observed crash. The missing auth origin is a second source-confirmed startup blocker: after the secret is configured, `getAuthBaseURL()` would reject the missing origin. A controlled local process with no env file loaded reproduced both exact errors without reading or printing secrets.

The screenshot's 502/CORS failures are consistent with an unavailable backend: Railway's gateway response is not the Express application response and does not establish that the application's allowed-origin configuration is wrong. CORS/cookie behavior still needs testing after startup is restored.

### Migration Evidence And Limits

The uploaded logs report successful application of 20261009010000_storefront_content, 20261009020000_media_library and 20261010000000_manual_email_templates. Subsequent startup attempts, also verified through the connected deployment logs, report 21 migrations and no pending migrations. The application then crashes during auth initialization.

This is log evidence at the recorded deployment time, not a newly executed remote `prisma migrate status`, checksum review, SQL audit or proof of data integrity. No agent command applied migrations or touched business records during this investigation. Remote ADMIN provisioning is still unverified and must not be assumed from the successful local provisioning.

### Checks And Recovery Plan

- git status: exit 0, clean dev-main tree at investigation start; git diff --stat and git diff --name-status: exit 0, empty.
- Railway read-only list-projects/list-services/get-status/get-service-config/list-variables/list-deployments/get-logs: completed successfully; variable names only, no secret values.
- Controlled local production-config rejection check: exit 0; reproduced the missing signing secret and missing auth origin errors. No application server was started and no database connection was made by this check.
- Direct public health request with curl: exit 28 after 15 seconds, HTTP 000/no response received. This workstation probe did not obtain a 502 response; the crash status and exact cause are independently verified by Railway status/logs. The user's screenshot supplies the 502 evidence.
- Markdown/local-link check: exit 0; two changed docs, 116 balanced fenced blocks and 43 existing local link targets, zero errors. No Mermaid diagram content changed. git diff --check: exit 0.
- Changed files: this handoff and [auth rollout guide](docs/architecture/auth-roadmap.md) only. Application code, env files, schema and dependencies are unchanged. No client/server builds or test suites were rerun for these docs-only changes.

Manual recovery, requiring separate owner approval for remote writes/deployment:

1. Configure the two missing auth variables securely on the confirmed backend service/environment. Never paste a signing secret into chat, source or documentation. Review frontend-origin configuration separately; no existing value was inspected here.
2. Before a redeploy, verify the target/backup and that no new migration has become pending. The normal start command runs migrations; this investigation does not authorize applying new ones. Do not roll back to the vulnerable legacy signed-session implementation.
3. Deploy the reviewed backend, verify it listens on the configured port/public domain, then check the health, products, published content and public campaign endpoints from the storefront origin.
4. Verify guest/customer sessions, checkout preview and existing order access without making a live charge. Run any Stripe test transaction only under separately approved sandbox QA.
5. Verify the persisted remote ADMIN account exists through the deliberate provisioning preflight; apply provisioning only after explicit target-confirmed approval if needed. Test login, dashboard, logout and copied-cookie rejection. Safari cross-site restrictions remain a separate same-site-domain issue.

Remaining risks: the backend is not repaired or redeployed in this checkpoint; origin values, post-recovery cookie/CORS behavior, remote admin provisioning, current database contents/backups and production commerce are unverified. Durable payment recovery, atomic promo/campaign integrity and the other 2026-10-11 launch gates remain. No commit or push was performed. These documentation-only edits are suitable for focused commit review, not proof of launch readiness.

### Connected Vercel Follow-Up (2026-10-12)

The user also connected Vercel and requested completion of the inspection. Installation/connection does not prove access to every team or authorize deployment/configuration changes.

- Vercel list-projects locates doggy-ent, project prj_Ovdg6sfCJ4b4oPMKnWdyUO6VCQYW, under team_LZJto7TjluMwTBxGdbpkBl4j. list-teams returns no teams.
- Explicitly scoped get-project and environment-variable metadata requests return 403 forbidden for alvarezaaronais-projects. The variable request used decrypt=false; no deployed values were read. This is provider-access evidence, not a repository bug. No unchanged request was retried and no permissions were changed.
- The mapped CLI fallback is unavailable: command -v vercel exits 1. No CLI package was installed, no login/link action performed, and no environment file was pulled or overwritten.
- Deployed root directory, build settings, deployment commit/status and environment-variable names/scopes remain unverified. An authorized owner needs to grant/reconnect project-team access and complete normal provider authorization before those private checks can resume; do not assume reauthentication alone guarantees access.

Public unauthenticated HTTPS checks, without access tokens or deployment-protection bypasses:

| Request | Result |
| --- | --- |
| Storefront / | HTTP 200; HTML contains the Vue app entry; no detected Vercel protection page |
| Storefront /admin | HTTP 200; same SPA entry |
| Storefront /checkout | HTTP 200; same SPA entry |
| Storefront /api/health | HTTP 404; text/plain, not the SPA HTML entry |
| Main entry and imported shared HTTP helper | HTTP 200; JavaScript assets retrieved |

The shared HTTP helper is a separate built chunk, not the main entry. It contains the expected public Railway backend hostname, HTTPS normalization, credentials:include and non-JSON error handling. This is static public build evidence only, not a decrypted Vercel variable value or proof of authenticated runtime behavior. Source [http.js](client/src/shared/api/http.js) supports VITE_API_BASE_URL with VITE_API_URL compatibility fallback.

Repository [client/vercel.json](client/vercel.json) excludes /api from the index.html fallback. Public route results are consistent with that policy, but cannot establish the private Vercel root setting. The frontend is served and directs API configuration toward the crashed Railway backend; no additional frontend rewrite change is justified by these checks.

Public route/asset checks exit 0. Final Railway recheck still reports backend CRASHED/Postgres SUCCESS, with the two auth variables and both fallbacks absent. No checkout submission, login, payment, email, label, business-data write, variable edit, deployment or migration occurred. The two documentation files remain the only local edits. Final documentation verification exits 0: two files, 116 balanced fenced blocks, 45 valid local link targets, no errors; git diff --check also exits 0. Both platforms are connected, but Vercel private inspection remains externally permission-blocked and Railway recovery still requires separately approved configuration/redeployment.

### Local Railway Env File Clarification

The user identified server/.env.railway.local as the local secret/configuration file. A names-only inspection confirms it exists and defines ADMIN_EMAIL, ADMIN_PASSWORD_HASH, ADMIN_SESSION_SECRET, DATABASE_URL, FRONTEND_URL and STRIPE_SECRET_KEY. It does not define BETTER_AUTH_SECRET, BETTER_AUTH_URL or API_BASE_URL. Values, secret length/strength and origin correctness were not inspected. git check-ignore confirms the file is ignored; git ls-files confirms neither it nor server/.env is tracked.

server npm run dev:railway sets DOGGY_SERVER_ENV_FILE so the local process loads server/.env plus that override. Deployed npm start does not set that selector. The ignored local file is not included in Git-source deployment and is not automatically synchronized with Railway Variables. It is intentionally for local backend -> Railway DB use, not a deployable secret bundle. Do not commit/upload it or change production startup to depend on it.

Better Auth is present: npm ls better-auth @better-auth/infra --depth=0 exits 0, and both customer/admin configurations are mounted in app.js with Prisma-backed auth. Missing production configuration must not be mistaken for a missing library, or solved by weakening the production signing requirement.

Minimal owner recovery: securely configure either the preferred BETTER_AUTH_SECRET or the already-supported ADMIN_SESSION_SECRET fallback on the production backend; an existing intended strong random signing secret of at least 32 characters can be reused without exposing it in chat or rotating it unnecessarily. Also configure BETTER_AUTH_URL as the reviewed HTTPS backend origin, with no auth path. The local fallback's mere presence does not certify its strength. No secrets were read/copied, env files modified, remote variables synchronized or deployments triggered. After an approved redeploy, public API health and customer/admin auth still require verification.

### Startup Recovered; Admin Login 401 Follow-Up

The owner applied configuration and reported a successful deployment. Read-only verification confirms deployment 87e88dd1-75af-4090-91a1-ceae573e806b, created 2026-10-12T16:33:24.063Z, is SUCCESS; Postgres remains SUCCESS and no environment changes are pending. Runtime logs report 21 migrations, no pending migrations, and the listener running on port 8080. This supersedes the earlier CRASHED state without implying any agent-triggered deployment or migration.

Provider HTTP logs for the owner's attempt at 2026-10-12T16:35:23Z show OPTIONS /api/auth/login -> 204, then POST /api/auth/login -> 401. The screenshot also shows /api/auth/me -> 401; that is expected when no valid session exists, and alone does not identify cookie failure.

Read-only public probes from the actual storefront Origin:

- GET /api/health -> 200, Access-Control-Allow-Origin matches the storefront, Access-Control-Allow-Credentials is true.
- OPTIONS /api/auth/login with POST/content-type preflight -> 204, matching allowed origin, credentials true and POST allowed.
- Probe command exits 0. No credentials, cookies or tokens were sent. No new POST login attempt or test account was created by these checks.

Source evidence: Express CORS and Better Auth both use getTrustedAuthOrigins. Compatibility login calls Better Auth signInEmail and requires ADMIN/ACTIVE in the database. The route maps rejected credential/role checks and auth FORBIDDEN errors to 401, so status alone cannot establish an exact account failure. No ADMIN_AUTH_FAILED event appeared in the returned runtime log window; this does not prove absence of auth failures, since compatibility calls catch errors and expose a generic response.

The production ADMIN User and credential Account have not been inspected or provisioned by this investigation. The previous audit deliberately provisioned only local Postgres. Having ADMIN_EMAIL/ADMIN_PASSWORD_HASH in Railway Variables does not create an admin account and is no longer the live login authority; changing those values does not rotate an already provisioned database credential. Missing account, conflicting CUSTOMER identity, inactive status or credential mismatch are hypotheses requiring a separately authorized, target-confirmed preflight. Do not promote a customer or reset an existing admin credential automatically.

This evidence does not show a storefront CORS block for the login path. Safari's Vercel/Railway cross-site cookie restrictions remain a separate risk: investigate persistence after a successful login response, not by assuming that an initial login 401 proves cookie blocking. An owned storefront domain and same-site API subdomain still require HTTPS, exact origins, appropriate cookies and deliberate auth configuration; buying a domain alone does not repair a missing account or wrong credential.

Recommended next step: authorized read-only remote admin-account/credential/role/status preflight, then separately approved safe provisioning or credential remediation if required. Only after login succeeds should live /me/cookie persistence be tested on Safari/desktop/mobile. No application change, auth weakening, remote account write, migration, deployment, email or payment was performed. The two docs remain the only local edits. Final Markdown check exits 0: 116 balanced fenced blocks, 46 valid local link targets, zero errors; git diff --check exits 0. Existing commerce launch blockers remain unchanged.

### Owner Instructions For Account Creation And Infrastructure Dashboard

The owner requested step-by-step instructions rather than agent execution. Source-reviewed commands are now in [Owner-Run Railway Provisioning Steps](docs/architecture/auth-roadmap.md#owner-run-railway-provisioning-steps): the local CLI explicitly selects .env.railway.local and RAILWAY_DB, with --allow-remote, first without --apply and only then with --apply after a passed preflight and confirmed target/backup. NODE_ENV=development is scoped to the local CLI only; it starts no HTTP server and must not be set on the deployed Railway app. Never run the bare script expecting it to inherit the running dev server's target. Required names are DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD_HASH; no values were inspected or added to docs. The provided commands were not executed against Railway.

Already-provisioned output is a stop/diagnose branch, not permission to overwrite a password; it does not certify ACTIVE status or credential correctness. Failed preflight is also a stop branch. No reset, reseed, schema migration, role promotion, provider send or deployment is part of these instructions. A created account uses the password represented by the hash, not the signing secret.

Official Better Auth Infrastructure docs confirm the provider dashboard at better-auth.com/dashboard, project/API-key setup and the dash plugin. Existing customer auth wiring is present on /api/customer-auth; the separate admin configuration has no dash plugin. Base URL is the reviewed backend origin and Base Path is /api/customer-auth, but no provider dashboard sign-in, project/key binding or live connection was verified. This dashboard is separate from the store's admin account and does not replace deliberate provisioning. Only the existing two docs changed; builds/tests and remote provisioning remain unexecuted.

## 2026-10-13 Approved Railway Admin Provisioning And Verification

The owner subsequently requested that the agent perform the repair. This checkpoint supersedes the earlier unverified remote-account state and instruction-only steps. No migration or deployment was requested or performed.

### Confirmed Cause And Exact Database Change

The backend was already healthy after the owner's configuration/redeployment. The remaining login rejection was not a verified CORS failure: production PostgreSQL had no User for the configured ADMIN_EMAIL. The prior admin migration switched login authority from environment credentials to persisted Better Auth User/Account/Session records. Defining ADMIN_EMAIL and ADMIN_PASSWORD_HASH alone does not create those records.

Target: Railway project artistic-gentleness, production environment, Postgres service used by the doggy-ent backend. The DATABASE_URL host/port loaded from ignored server/.env.railway.local was checked in-process against the connected provider's TCP proxy. Normal server/.env was neither changed nor repurposed.

The existing [provisioning script](server/scripts/provision-admin.js), [service](server/src/domains/auth/services/adminProvision.service.js) and [repository](server/src/domains/auth/repositories/adminProvision.repository.js) were executed, not edited. One Prisma transaction added:

| Existing table | Added record |
| --- | --- |
| User | One new generated ID, normalized configured admin email, name Doggy Ent Admin, role ADMIN, status ACTIVE, emailVerified false; standard timestamps |
| Account | One credential linked to the new User, providerId credential, accountId equal to the User ID, password containing the existing configured bcrypt hash; standard timestamps |
| CustomerAccountEvent | One linked ADMIN_PROVISIONED event, changedByType SYSTEM, describing deliberate provisioning; standard generated fields |

No plaintext password was stored. The password stays the same because ADMIN_PASSWORD_HASH was imported unchanged into Account.password; [adminAuth.service.js](server/src/domains/auth/services/adminAuth.service.js) already verifies imported bcrypt credentials. No existing customer was promoted and no existing account/password was overwritten. A Session is created by Better Auth during successful login, not by the provisioning script. Changing the environment hash later does not rotate this database credential.

### Safety And Verification Evidence

- Read-only Prisma transaction: admin absent; two existing users; four orders; seven products. All 21 applied migration checksums match repository SQL, with zero failed or pending migrations. No migration command ran.
- Private pre-write full PostgreSQL custom-format backup: /Users/nazxylix/.codex/backups/doggy-ent/railway-before-admin-2026-10-13T18-51-37-225Z.dump, 91,956 bytes, permissions 0600 in a 0700 directory outside Git. PostgreSQL 18 pg_dump exited 0. pg_restore decoded the full archive to /dev/null with exit 0; this was not a database restore drill. The backup contains confidential database data and must not be committed, publicly attached or printed.
- Explicit local CLI selectors: NODE_ENV=development, DOGGY_SERVER_ENV_TARGET=RAILWAY_DB and DOGGY_SERVER_ENV_FILE=.env.railway.local. No HTTP server was started and deployed NODE_ENV was not changed.
- `npm run admin:provision -- --allow-remote`: exit 0, `Preflight passed; no writes.` Apply used the same existing script with --allow-remote/--apply, after rechecking the provider target and private backup fingerprint: exit 0, `Admin provisioned; no customer account or password was changed.`
- Post-write read-only check: ADMIN/ACTIVE, exactly one credential, stored/configured hash equality true without returning either hash, one provisioning event. Three total users, still two customers, four orders and seven products. Repeat no-write provisioning: exit 0, `Admin is already provisioned; no changes.`
- `npx vitest run tests/tier2/admin/admin-provision.test.js tests/tier2/admin/better-auth-admin.test.js tests/tier2/admin/admin-session-service.test.js`: exit 0, three test files and ten tests passed.
- Public probes with the storefront Origin: health/products 200 JSON with exact allowed origin and credentials enabled; anonymous /api/auth/me and /api/admin/orders 401 JSON as expected. Probe exit 0; no credentials or cookies printed.
- Railway HTTP logs at 2026-10-13T18:54:37Z show actual owner login: OPTIONS /api/auth/login 204, POST /api/auth/login 200, followed by /api/auth/me 200. The in-app browser displayed /admin, signed-in identity, DEPLOYED DATA TARGET and the loaded protected dashboard. The owner confirmed it was running.

Application source, packages, env files, Prisma schema and Railway/Vercel settings were unchanged. No commit, push, deploy, customer email, payment, shipment or label operation occurred. Client/server builds and the full test suites were not rerun because no application code changed. Local edits remain limited to PROJECT_HANDOFF.md and docs/architecture/auth-roadmap.md for focused commit review.

Final documentation checks: exit 0, two Markdown files, 118 balanced fenced blocks and 53 valid local link targets, zero errors. `git diff --check` exits 0; `git status --short` confirms only those two documentation files are modified. No Mermaid diagram was changed.

### Remaining QA And Next Step

- Manually test logout/relogin, full reload and session expiry without disrupting the current working session; copied-cookie revocation is covered by focused tests, not freshly exercised against production here.
- Test Safari and mobile independently. Successful in-app browser login does not certify every browser's cross-site cookie persistence; owned storefront/API subdomains remain recommended.
- Rotate credentials/secrets previously shared in chat/screenshots through a separately reviewed recovery process. Changing provisioning environment inputs is not a database password reset.
- The backup is readable but restore recovery has not been rehearsed. Live Better Auth Infrastructure project/key connection and private Vercel configuration access remain unverified.
- Keep the earlier durable payment recovery and atomic promo/campaign launch gates. Next phase: production auth acceptance and reviewed same-site domain configuration, then the outstanding commerce integrity work.

## 2026-10-13 Partial Prisma Upgrade Compatibility Repair

### Confirmed Cause And Scope

The owner reported server errors after updating Prisma. Initial git status was clean on dev-main; commit 35c61c0 upgraded @prisma/client from pinned 6.16.2 to ^7.10.0, while prisma remained 6.16.2. The schema/config and server singleton still use the existing Prisma 6 setup. `npm ls prisma @prisma/client --depth=0` confirmed those different installed versions.

Two failures were reproduced without database writes:

- `npx prisma generate`: exit 1, missing @prisma/client/runtime/query_engine_bg.postgresql.wasm-base64.js.
- Importing server/src/db/prisma.js: exit 1, missing @prisma/client/runtime/library.js. This fails before a database query and explains server initialization failure with this package combination.

`npx prisma validate` already passed, so no schema repair or migration was justified. [Prisma's official upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7) requires upgrading the CLI/client together and reviewing breaking runtime/adapter/configuration changes. A major upgrade was not implemented as an incidental crash repair.

### Files And Exact Fix

- [server/package.json](server/package.json): restored @prisma/client to exact 6.16.2, matching the CLI; preserved the owner's added allowScripts configuration and all unrelated dependencies/scripts.
- [server/package-lock.json](server/package-lock.json): synchronized that package change and removed the unused Prisma 7 runtime-utils dependency. `npm install --ignore-scripts --no-audit --no-fund` exited 0, removed one package and changed one package; generation was explicitly run afterward.
- Added [prisma-toolchain.test.js](server/tests/tier3/utils/prisma-toolchain.test.js): three regression tests check exact matching pins, manifest/lock/installed consistency, generated client version and successful server singleton import without a database query. Existing tier3 runner picks it up; no new script or lint configuration.
- Updated this handoff, [database architecture](docs/architecture/database.md) and [QA guide](docs/verification-and-qa.md) with the compatibility rule, evidence and remaining upgrade work.

The agent did not commit or push. During verification, the checkout advanced to owner-authored commit 92ad29f (prisma update patch), containing the dependency fix and new test; it was left intact. Documentation updates remain separate for review.

### Verification Results

| Check | Exact result |
| --- | --- |
| npm ls prisma @prisma/client --depth=0 | Exit 0; both 6.16.2 |
| npm run build in server | Exit 0; canonical content synchronized, Prisma Client 6.16.2 generated |
| npx prisma generate after repair | Exit 0; Client 6.16.2 generated |
| npm test in server | Exit 0; tier1 28, tier2 94, tier3 6: 128 tests across 32 files |
| node --check over server src/scripts/tests | Exit 0; 167 JavaScript files, zero failures |
| Guarded local prisma migrate status | Exit 0; 21 migrations, database schema up to date |
| Real local app import/listen/read-only HTTP | Exit 0; health/products/public campaigns/storefront content 200 JSON; anonymous me/admin orders 401 JSON |
| npm audit --omit=dev --json | npm exit 1; four high-severity findings, zero critical; no audit fix applied |
| Connected Railway status/log inspection | Backend/Postgres SUCCESS; no pending changes; filtered missing-module build/runtime results empty on the existing deployment |

The local checks explicitly selected LOCAL with no Railway override and verified the loopback database target before connecting. The temporary smoke server listened on an available loopback port and was closed; Prisma disconnected. No user dev server was stopped, no session/login was created, no provider send/payment/label occurred and no Railway database connection/write was made. Schema, migrations, normal server/.env and server/.env.railway.local were not edited. The source/config uses the existing environment loader; no secret values or response bodies were printed. No .env.example exists or was created.

Railway inspection still reports the previously successful deployment 87e88dd1-75af-4090-91a1-ceae573e806b. This is not evidence that the newly committed repair has deployed. No production startup command was run, because npm start includes prisma migrate deploy. No Railway migration/status SQL check was needed or performed for a schema-unchanged dependency repair; the earlier 21-migration remote checksum verification remains historical evidence. Client build/tests were not rerun because no client or shared source changed.

Documentation validation: exit 0, three files, 114 balanced fenced blocks, 71 existing local link targets and zero errors. git diff --check exits 0. No Mermaid diagram changed. Final local status contains only the three documentation updates after the owner's patch commit; they are suitable for focused review.

### Remaining Risks And Manual QA

Four high-severity audit entries remain: deepmerge-ts (recursive merge stack exhaustion), effect (concurrent RPC context isolation), and their dependency parents @prisma/config/prisma. These are findings in the installed CLI/configuration dependency graph, not proof that the public application exposes those vulnerable operations. This compatibility repair does not certify security or fix them. Plan a tested, matching Prisma upgrade with driver/config/connection-pool/TLS review; do not run npm audit fix --force or update only one Prisma package.

Restart the selected local backend with dev:local or dev:railway as appropriate, then manually verify admin sign-in, the data-target badge, catalog loading and checkout preview without submitting payment. Before deploying the repair, review the matching package/lock change and confirm the intended branch/service and pending migration safety separately. Do not reset/reseed data or reprovision the admin. Safari's cross-site cookie issue is unrelated and still needs the same-site domain work. The focused repair and tests are suitable for commit review; remaining security and commerce gates still block a launch-readiness claim.

## 2026-10-13 Website UI And Storefront Preview-Only Checkpoint

### Owner Direction And Scope

The owner asked to return to the earlier interactive example and approval loop, inspired by the supplied portfolio reference. This supersedes the interpretation that the latest request approved application implementation. All application source edits and new source/test files from that mistaken attempt were backed out with scoped patches; existing owner/previous-agent Prisma repair and documentation edits were preserved. Git status confirms no tracked client, server, shared or configuration changes from this pass. No rollback of database data was needed because none was written.

The preview is task-owned outside application source:
`/Users/nazxylix/.codex/visualizations/2026/06/01/019e859b-b6f3-78e0-b7ab-540ffb37b24b/website-ui-mosaic-preview.html`.
It is a self-contained design example, not a deployed site or live Vue editor. The unapproved implementation diff is retained separately in the same task folder as `unapproved-implementation.patch` for recovery only, not as an approved plan to apply wholesale.

### What The Mockup Shows

- Eight compact sample product cards using generated packaging concepts; stable 6 oz / 18 oz selection, yellow attribute tags, bordered surfaces and subtle shadows. Eligible sample cards have soft emerald giving surfaces. Fixtures were not inserted into either database.
- Distinct Home, Campaign and Chase & Evie pages. Home retains hero, featured treat, All Treats, giving spotlight, Next Drops, Happy Pups, Made With Care, ingredient promise, Meet Brand and footer. Campaign is story/impact-led rather than a FAQ wall. Brand uses origin-story and illustrative Labrador imagery, not fabricated real dog biographies.
- A unified Website UI editor example: compact grouped navigation on the left, selected section or full-page canvas in the middle, contextual fields on the right. Seven primary navigation entries expose business subsections without extending a flat tool list. Business CRUD remains conceptually separate from presentation editing.
- Explicit preview-only signed-in/data-routing context. Save/Cancel operate on in-memory sample drafts; Publish and real uploads are disabled. Sample Add to Bag feedback leaves the user's real cart untouched. This does not certify working product/campaign/brand persistence.
- Six primary brand colors: Blue `#2F57B7`, Yellow `#F2DE5C`, Kraft `#CDAA7E`, Cacao `#6A3C2B`, Oat `#F3E8D2`, Campaign Emerald `#17634C`; giving tint `#EDF6F0`. Emerald is reserved for giving contexts, not a replacement for the brand palette.

Generated review assets and provenance are in [assets/brand/README.md](assets/brand/README.md): Labrador pair/portrait templates, sample packaging contact sheet and original Labrador-head/paw monogram master/optimized copy. All are unapplied; the monogram is intentionally not used in the preview or live website. Seamless tiling has not been certified. Generated templates must not be represented as actual Chase/Evie photography or customer reviews.

### Verification After Source Restoration

| Check | Result |
| --- | --- |
| `git status`, `git diff --stat`, `git diff --name-status` | Existing three docs modified; only new `assets/brand/` untracked; no application source diff |
| `npm run build` in client | Exit 0; canonical content synchronized and Vite build completed |
| `npm test` in client | Exit 0; tier1 11, tier2 92, tier3 6: 109 tests |
| `npm run build` in server | Exit 0; canonical content synchronized and Prisma Client 6.16.2 generated |
| `npm test` in server | Exit 0; tier1 28, tier2 94, tier3 6: 128 tests |
| `node --check` over server src/scripts/tests | Exit 0; 167 JavaScript files, zero failures |
| Preview JavaScript / inline asset validation | Script parsed; embedded asset JSON parsed; under 1 MB; no fetch/XHR/WebSocket requests |
| Browser: Home / Campaign / Brand | Eight Home sample cards; three Campaign cards; distinct page content; observed images loaded and no horizontal overflow |
| Browser: contextual editing | Product introduction updates canvas; Cancel restores prior copy; Save keeps only preview draft; Publish disabled; test copy restored |
| Browser: navigation / variants | Opening Orders closes Catalog; mobile navigation expands; 18 oz feedback uses $39.99 and 6 oz uses $14.99 for the first sample card; real bag unchanged |
| Browser: narrow layouts | Tested 320 and 390 browser viewport overrides; renderer inner widths 288 and 358; no root horizontal overflow; responsive single-column layout; viewport restored |
| Preview console | No error or warning entries returned during checks |

No new lint script was introduced. No environment values were read/copied into this preview, no .env.example was created, and no DB migration, remote variable change, publication, payment, provider send or deployment occurred. These automated suites and mockup checks do not constitute fresh live checkout/auth acceptance tests.

### Existing Architecture Findings And Next Implementation Boundary

Source audit confirms that current Website UI, product and campaign editors do not yet share all editing chrome or save ownership. Website content has its own draft/publish flow; product/campaign saves update canonical records. The full Brand page is still code-owned even though its homepage teaser is editable. Current product auto-fit grid sizing can stretch a small catalog into overly wide cards.

Important verified risk for a future visual editor: [updateProductById](server/src/domains/products/services/products.service.js) currently deletes/recreates ProductVariant records on full product updates. A new wording/photo-only save must not invoke that full replacement path or change variant IDs, stock, pricing or SKU. A narrow presentation-only update is a proposed follow-up, not retained implementation from this pass. Campaign donation and promo rules must similarly remain server-owned business data.

Next step: obtain design approval on the three page compositions, compact card sizing and unified editor workflow, then implement in focused increments using existing Vue components and allowlisted content blocks. Do not import fixtures into live commerce or apply the recovery diff wholesale.

Manual design QA: review all four preview screens; click page/section selectors and canvas edit handles; try copy, visibility and density changes; compare Home/Campaign/Brand at desktop/mobile widths; confirm soft giving cards remain recognizable and sample actions are clearly not live. Implementation QA later must additionally verify real draft/publish behavior, variant identity preservation, cart/checkout, campaign calculations and server authorization.

The repository is suitable for documentation/assets commit review only for this new work; application source remains unchanged from the starting state. No commit or push was performed. Production auth/domain, Prisma tooling security and commerce integrity risks from earlier checkpoints remain outstanding.

Final documentation/preview validation: exit 0; four Markdown files, 228 balanced fence lines, 73 existing local link targets, zero errors; one executable preview script and one asset JSON block parsed, 419,806 bytes total. `git diff --check` exits 0. The .env.example inventory returned no matches. Temporary preview serving and reference tabs were cleaned up; the in-conversation preview remains available for approval.

## 2026-10-14 Refined Preview And Approved Railway Test Catalog

### Request Reconciliation

The owner approved the mockup direction and requested further examples, not another unreviewed application rewrite. A newer self-contained preview is saved as `website-ui-refined-preview.html` in the same task-owned visualization directory as the previous mockup. The old approved example is preserved. Client/server/shared source, auth, checkout, routes, schema and deployment configuration were not changed.

The owner first chose a separate Railway test environment. Read-only connected-provider inspection found only production in Doggy Ent's `artistic-gentleness` project. The owner then explicitly changed direction: use the current Railway/Vercel testing deployment, label all additions as test products, and make them non-purchasable. No new environment/service/cost, production-data clone or deployment was created. This separate approved catalog operation must not be confused with the disconnected visual editor.

### Revised Design Coverage

- Admin: all ten subsections stay visible under grouped navigation on desktop; all thirteen existing tools remain represented. The navigation contains no form fields. Page/component and section controls sit in the main workspace, followed by canvas and contextual appearance tools. Mobile has a single navigation disclosure.
- Ownership: product names/photos/descriptions/ingredients/variants/prices/stock are read-only in Website UI. Campaign/partner/story/programme/rule/product/date content is read-only there too. Static labels, section visibility, colours, shadows, density and seasonal styling are local preview changes. No API request, database save, upload or publication is possible in the preview. Existing application editors have not been migrated to this new boundary.
- Product pop-out: larger packaging/detail split, shared size/price selection, Ingredients & details, Serving & storage and Campaign impact views, clear close action, Escape, contained Tab cycling and backdrop close. An initial popup position/cropping issue was repaired by letting the overlay size to its content and scrolling its opening position into view. Website UI includes Product pop-out for static label/appearance editing; product-owned details stay locked.
- Home: existing hero/featured/compact eight-product collection retained. After Products, giving, Next Drops, preparation, ingredients, gallery and brand story have separate headings/boundaries with associated peer content cards, rather than mixing unrelated sections in the same mosaic. The original Labrador monogram is visible at 0.11 opacity in the preview background only.
- Shared header/footer: one renderer reused across Home/Campaign/Brand. The shop-focused footer groups Shop & discover, Here to help, and social profiles; the approved Instagram destination remains. Unconfigured policies/support destinations and TikTok/YouTube remain explicitly unconnected placeholders, not invented real policies or accounts. A removed Lucide Instagram brand icon caused preview warnings; replaced with supported Camera plus the visible Instagram label/link.
- Campaign: new black/yellow Labrador imagery, fictional Meadow Haven introduction, programmes, why-this-partner story, transparent business-funded giving explanation and eligible treats. No real partner, rescue case, financial outcome or payout is claimed. These extra content slots illustrate a future Campaign-owned content contract, not new persisted campaign fields.
- Brand: origin story, paired portrait slots, suggested journey chapters, everyday gallery and values. Captions identify generated templates and explain real-photo replacements. No dog biography, milestone, nutrition certification or verified review is invented.
- Seasonal examples: everyday, Halloween/Autumn and Christmas/Winter changes affect static wording/tinted non-giving card surfaces/borders without enabling a promo. Campaign eligibility remains an independent fixture property; emerald giving surfaces are not overwritten by holiday styling.

[Image placement guide](assets/brand/image-placement-guide.md) maps each photograph/pattern/packshot to page, section, purpose and replacement guidance, with generation prompts/provenance. [Artwork README](assets/brand/README.md) now distinguishes preview-only Labrador/background assets from the separately uploaded Railway test-product images.

### Exact Railway Additions And Safety

Target reverified through the connected Railway provider: project `artistic-gentleness`, production environment, existing Postgres service for doggy-ent. Ignored `server/.env.railway.local` loaded only by an explicitly selected local operation; the connection matched the reviewed provider TCP proxy/database. No env file, secret value, remote variable or auth credential was changed or copied into docs.

Read-only preflight: all 21 migration names/checksums/finished states match local SQL; no failed/pending migration and no migration command run. The configured persisted admin was ADMIN/ACTIVE. Initial counts: 7 products, 3 users, 4 orders, 1 promo, 1 campaign, 0 media assets. No prior `[TEST]` records conflicted.

A full private PostgreSQL 18 custom-format backup was made before any write, outside Git in the task backup directory, with 0700 directory / 0600 file permissions. `pg_dump` exit 0; 93,423 bytes. Full `pg_restore --file=/dev/null` archive decoding exit 0; no restore to a database was attempted. Restore recovery is still not rehearsed.

One serializable transaction added eight Product rows, sixteen ProductVariant rows, eight MediaAsset metadata rows and eight MediaAssetData image/thumbnail rows. Reused the current product validator/mapper and bounded Sharp image normalization, respected the 256 MiB library capacity, and fingerprint-checked preservation of all preexisting products/variants and StorefrontContent. No existing product or variant was deleted/replaced. User/order/promo/campaign counts remained unchanged. The transaction was additive, not a reseed.

Every new product name begins `[TEST]`, has TEST PRODUCT / NOT FOR SALE tags and explanatory placeholder descriptions/ingredients/care. Both sizes have zero stock, positive sample prices, inventory-limited selling, unique CE-QA-20261013-prefixed SKUs and featured false. The batch name reflects preparation on October 13; insertion completed October 14.

| New Test Product | Status |
| --- | --- |
| Chicken Breast Jerky | ACTIVE, zero inventory |
| Beef Jerky | OUT_OF_STOCK |
| Turkey Jerky | COMING_SOON |
| Salmon Bites | ACTIVE, zero inventory |
| Lamb Jerky | DRAFT |
| Training Bites | COMING_SOON |
| Pumpkin Bites | DRAFT |
| Weekend Bundle | ARCHIVED |

Final counts: 15 products, 3 users, 4 orders, 1 promo, 1 campaign, 8 media assets. Product/media IDs, exact statuses, cents prices, SKUs and safe image references are recorded in [fixture report](assets/brand/test-products/railway-fixture-report.json); [fixture plan](assets/brand/test-products/catalog-plan.json) contains no secrets. Public image paths are backend-relative `/api/media/<uuid>`, never a stored local/deployment origin. Media folder/name/alt text identify the test packaging and replacement purpose. No dummy campaign or customer was inserted.

### Commands And Verification

| Check | Exact Result |
| --- | --- |
| `git status`, `git diff --stat`, `git diff --name-status` | Existing dirty docs preserved; new assets/docs only; no application source diff |
| Connected Railway project/environment/service/domain reads | Correct existing project/production/Postgres/backend identified; no provisioning/deployment |
| Guarded test-catalog operation without apply | Exit 0; target/checksum/admin/collision preflight passed; no writes |
| Same guarded operation with `--apply` | Exit 0; private backup decoded, atomic additions complete, preservation checks pass |
| `resolveCheckoutItems` against every stored test size | All 16 attempts rejected with 400; no Stripe call, payment or order |
| Public deployed catalog/image probes | 200 catalog; 5 public test products, 3 Draft/Archived hidden; all 8 WebP image HEAD requests 200 |
| Actual client `normalizeProduct` + `isPurchasable` over public test products | Exit 0; all 10 returned variants disabled/non-purchasable |
| `npm test` in server | Exit 0; tier1 28, tier2 94, tier3 6: 128 tests across 32 files |
| `node --check` on guarded operation | Exit 0 |
| Preview executable script and inline assets | Parse; below 1 MB; no fetch/XHR/WebSocket calls |
| Browser: desktop navigation/ownership | 10 subsections visible; 0 nav edit fields; selectors inside workspace; Product/Campaign content locked |
| Browser: static editing | Pop-out introduction changes canvas; Cancel restores; winter surface changes while giving tint remains independent |
| Browser: shared pages | Home/Campaign/Brand images loaded, identical shared header/footer text, no horizontal overflow at 1248 inner width |
| Browser: mobile | 320/390 overrides, 288/358 inner widths; no Home/Campaign/Brand/editor overflow; navigation disclosure works; 334-wide popup fits at 390; Escape works; viewport restored |

No client/server build or Prisma generate was required/rerun in this preview/catalog pass because application source/schema did not change. Earlier build evidence is historical, not new certification. An asset-preparation import used the old Sharp path and was corrected to the installed package export. A client probe initially used a nonexistent mapper export, then was corrected to the actual normalizeProduct function; the corrected probe passes. A transient browser node-resolution timeout was recovered from a fresh state snapshot. No application defect or uncompleted command is inferred from these corrected tooling mistakes.

### Remaining Work And Commit Review

- Review the revised interactive design, then separately approve application implementation. The actual app still uses its existing UI and DB-backed website-content draft/publish workflow. The request for static appearance publishing without DB writes needs a deliberate persistence/publication decision; this preview does not silently substitute the old DB-saving editor.
- New Campaign partner/programme/story slots are illustrative only. Persisting them in Campaign management needs a focused content contract and, if justified, separately approved additive schema/migration work; no schema addition happened here.
- Non-purchasability is verified in current status/inventory rules, not enforced by a permanent `isTest` schema flag. Never add stock or switch these test records to made-to-order/preorder. Archive/retire public test records before a real-customer launch; do not delete referenced media blindly.
- Review real portraits, partner approvals, product photography/packaging/ingredients, business policies and support destinations before publication. Full screen-reader/real-device/Safari QA remains unverified; no real payment/provider action was needed or performed.
- Previously documented auth/domain, Prisma tooling advisories and payment/promo/campaign integrity launch gates remain unresolved. This design/test-data pass is not launch certification.

Manual next checks: refresh the Vercel testing storefront and Admin Products; confirm `[TEST]` names/tags, sold-out/unavailable actions, upcoming previews and hidden Draft/Archived records. Review all four design-preview screens, open a product popup, change 6 oz/18 oz, inspect the shared footer and subtle pattern, and try static labels/seasonal colours without expecting a real save. Do not place a payment or publish placeholder partner content.

Repository edits are suitable for documentation/generated-asset review only; application source remains unchanged. Railway test-data changes already occurred under explicit approval and must not be rerun blindly. No commit, push, deploy, migration, customer email, payment, label or shipment occurred.

Final checkpoint validation: exit 0; six Markdown files, 228 balanced fence lines and 102 existing local link targets; eight text/JSON files checked for secret-like values, zero findings; final preview 688,260 bytes with parsed script/asset JSON and no network APIs. `git diff --check` exits 0; no .env.example matches. A fresh browser preview returned zero warning/error entries after the supported-icon fix. Forward/reverse Tab stayed inside the popup; Escape closed it and restored focus to the correct Quick View opener, not the separate featured-product action. Temporary viewport/server/testing tabs were cleaned up; the in-conversation example remains available. No application source change or background operation remains from this pass.

## 2026-10-14 Preview Polish And Optional Product Galleries

### Scope And Approval Boundary

The owner requested another interactive preview round before application approval: smaller footer, fading top announcements, simpler Website UI section navigation, stronger Made with Care, seven sample reviews, distinct Home/Campaign/Brand compositions, prominent pop-out pricing and optional product galleries. This is a design proposal, not an applied redesign. The owner subsequently asked for a progress breakdown; this checkpoint reconciles that request with actual files and verification.

No client/server/shared/config/schema source, dependencies or environment files changed. No Railway write, upload, migration, deployment, commit, push, payment, provider send or real review creation occurred in this round. The previously approved eight non-purchasable Railway testing products and their main images were not rerun or changed. Existing application Website publication still uses its established DB-backed content workflow; deciding how to publish static appearance without DB writes remains open.

The new sibling preview is `website-ui-polished-preview.html` in the task-scoped visualization directory. Original mosaic/refined examples are preserved. The prototype has no fetch, XHR, WebSocket or API save. Its Save/Cancel and sample gallery operations are local memory only; it never claims real upload/publication success.

### Requested Changes And Actual State

| Request | Preview Result | Application State |
| --- | --- | --- |
| Smaller footer with similar shopping/help/social content | Compact three-column desktop/footer wrapping on mobile, smaller readable text, existing official Lucide icons | Not applied |
| Rotating top header | Three editable messages, 5.5-second gentle fade-out/in, Previous/Next/Pause, visibility and rotation controls under Header & footer | Not applied |
| Easier Website UI navigation | Expanded business nav preserved; duplicate section-button strip removed; two categorized native selectors plus canvas handles | Not applied |
| More eye-catching Made with Care | Preparation photo alongside concise icon-led process items and story action | Not applied; photo remains illustrative |
| Seven compact reviews | Rating/title/body/name/date/product/size/photo; every entry and section labelled fictional; future submission action explains its pending status | Real customer reviews are not implemented by this round |
| Less repetitive page layouts | Home uses care/reviews/paired closing sections, Campaign programmes plus giving sidebar, Brand journey alongside everyday imagery | Not applied; all existing mock content areas retained |
| Product pop-out pricing/gallery | Larger selected-size price, main image plus four optional thumbnails, vertical desktop/wrapping horizontal mobile rail | Actual gallery still uses single Product.image |
| Admin optional detail images | Catalog -> Products proposal: select sample product, choose/remove/reorder up to four optional images, explicit local Save/Cancel | Real upload/API/gallery persistence remains unconnected |

The compact shared product-card renderer, size choices, original six brand colours, campaign eligibility tint and subtle Labrador monogram are retained. The same header/footer functions serve all three mock pages. Website UI cannot edit Product/Campaign-owned content; the proposed image manager is deliberately in Products rather than static presentation controls. Tailwind remains the actual application's styling system; no new framework or icon dependency was installed for the mockup.

### Files And Asset Provenance

- Created 32 WebP detail templates in [product-galleries](assets/brand/product-galleries/README.md), four per sample product. The linked placement table lists every file; [manifest.json](assets/brand/product-galleries/manifest.json) records roles and explicit non-upload status.
- Created gallery README with generation prompt set, replacement guidance, image-role context and implementation boundaries.
- Updated [image placement guide](assets/brand/image-placement-guide.md), [editor architecture](docs/architecture/storefront-editor.md), [QA guide](docs/verification-and-qa.md) and this handoff. Prior dirty database/docs/assets work was preserved.
- Created task-local preview, asset-preparation and verification helpers outside application source. Built-in image generation produced eight related four-view sets, with targeted Chicken/Bundle breed corrections; existing Sharp made crops and optimized review copies. No API key was read or added.

These images are not approved packaging, actual manufacturing photography, real Chase/Evie portraits or customer proof. Before publication, replace/review them and partner/review content. No generated lifestyle image is presented as a verified customer submission.

### Commands And Verification

| Check | Result |
| --- | --- |
| `git status --short`, `git diff --stat`, `git diff --name-status` | Exit 0; prior dirty docs/assets preserved; no application-source changes |
| `node prepare-polished-assets.mjs` (task-local helper) | Exit 0; 32 saved crops, eight four-image galleries, optimized self-contained preview |
| `node check-polished-preview.mjs` (task-local helper) | Exit 0; 962,825 bytes, valid fragment/script/asset JSON, all 32 embedded 360x360 WebPs decode, no network APIs |
| Same helper's isolated timer checks | Normal state has one rotation interval; reduced-motion and hidden-page states have none |
| Bundled `render.py --serve --port 61919` | Preview served for browser checks; temporary process is stopped at completion |
| Browser: desktop Home/Campaign/Brand | 1248 inner width, images loaded, no horizontal overflow; footer approximately 184px tall on each page |
| Browser: intermediate width | 1024 viewport/992 inner width: Home/Campaign/Brand/Website UI have no horizontal overflow |
| Browser: mobile widths | 390/320 viewport with 358/288 inner width: all four screens fit; mobile image editor fits; 334-wide popup fits at 390 with horizontal thumbnails |
| Browser: all eight product galleries | Five thumbnails each (main plus four), images load, selected lifestyle image retained on size change, all eight 6 oz sample prices correct, no popup overflow |
| Browser: selected pricing | Chicken 6 oz $14.99 /18 oz $39.99; sample Add reports selected variant/price without altering actual bag |
| Browser: optional images | Zero optional images yields main-only gallery; Cancel restores four. Saved three-image state survives product switching; subsequent Cancel restores saved state; final sample reset to four |
| Browser: editor ownership/navigation | Zero edit fields in nav, zero duplicated section strips, categorized page/section groups; product image workspace remains separate |
| Browser: static editing/feedback | Announcement wording updates canvas; Cancel restores; footer gray surface updates visible footer and Cancel restores oat |
| Browser: announcement fade | New message and partial-opacity fade observed; manual navigation and Pause work; automatic rotation observed between checks |
| Browser: popup keyboard | Forward/reverse Tab remain in dialog; Escape closes and restores correct opener |
| Fresh browser console after icon repair | Zero warning/error entries |

A missing Lucide YouTube-brand name in an intermediate mock was replaced with a supported circle-play icon. A fresh preview initially restored the last editor screen from saved host choices, so an announcement locator was absent; inspecting the current UI and navigating Home resolved that lookup. A source-location query initially used nonexistent guessed paths, then was corrected from the actual file inventory. These were resolved preview/tooling issues, not application build failures.

No client/server build, application test suite or Prisma command was required/rerun because corresponding source/schema did not change. Prior test/build results are historical, not new launch certification. Real-device/Safari/screen-reader/reduced-motion browser acceptance remains manual; isolated timer checks do not prove OS/browser preference behavior on every device.

### Remaining Work And Next Review

1. Review this round's three pages, announcement motion, smaller footer, seven fictional reviews and product pop-out. Try Catalog -> Products sample gallery; uploads and real saves are intentionally disabled/unconnected.
2. Approve the design before application implementation. Resolve static appearance persistence/publication explicitly; the existing DB-backed editor must not silently substitute for the newer no-business-DB-write request.
3. Implement a focused Product-owned gallery contract after approval. Current Prisma Product has only `image`; `ProductQuickViewGallery.vue` displays it. Enforce at most four optional images server-side, preserve order/alt text/main-image fallback, reuse protected media storage and keep checkout/order snapshots unchanged.
4. Avoid full replacement product updates for image-only saves: existing `products.service.js` deletes/recreates variants during that update. Preserve variant IDs, prices, inventory and historical order links.
5. Customer review submission, moderation, ownership and verified-purchase rules remain a future connected feature. Never publish these seven fictional reviews as real proof.
6. Original payment recovery/promo concurrency, auth/domain, dependency tooling, backup/restore and provider launch gates remain unresolved by this preview pass.

Edits are suitable for documentation/generated-asset review only, not a claim of completed application rollout or launch readiness. No commit or push.

Final checks: task-local `check-preview-docs.mjs` exits 0 with seven Markdown files, 228 balanced fence lines, 144 existing local link targets and ten text/JSON files scanned with zero secret-pattern findings. `git diff --check` exits 0. `git diff --name-only -- client server shared` exits 0 with no paths. The `.env.example` inventory has no matches (the normal `rg` no-match exit 1). The preview checker was rerun successfully at 962,825 bytes. Temporary browser viewport overrides were reset during testing; final browser inventory shows only the user's existing admin-login tab, with no remaining preview tab. After the turn/runtime transition the temporary server session no longer existed; `lsof` confirms no listener on its port 61919. No required verification process remains running.

## 2026-10-15 Approved Design Integration And Deployment

This checkpoint supersedes the preview-only implementation boundaries above. The owner approved integration, separate presentation persistence in StorefrontContent, an additive gallery migration after backup/preflight, test-only Railway data, and direct deployment to both existing services after checks. No commit or push is authorized or performed.

### Integration Checkpoint

- Application implementation now includes compact product cards, five-view product galleries (main plus up to four optional images), rotating announcements, compact shared footer, photo-led care, seven explicitly fictional review examples, distinct Campaign/Brand compositions, subtle Labrador monogram, and unified categorized Website UI controls.
- Static copy/appearance uses the existing revisioned StorefrontContent draft/publish record. Product prices, variants, stock, campaign eligibility, contribution rules and checkout totals remain domain-owned. The gallery workspace belongs to Products, not Website UI, and uses an authenticated image-only optimistic update rather than replacing variants.
- Additive migration `20261014000000_product_galleries` adds Product.galleryImages and Product.isTestProduct with an array/max-four database constraint. Applied locally and on the explicitly approved Railway target after private full backups and migration/checksum preflight. Both have 22 completed migrations. Backups decoded successfully; no restore rehearsal was performed.
- Eight previously created test products are reused, not duplicated. Their 32 optional gallery images were added to the media library; media count changed from 8 to 40. All eight have a permanent test flag, zero inventory and inventory-limited selling. Server checkout rejects test products regardless of selling mode; original business records were preservation-checked.
- Client build passes; client tests total 115 (11/98/6). Server build/Prisma generation pass; server tests total 136 (28/102/6). A final uploaded-campaign-image mapper regression was fixed and tested. Earlier 135 counts predate that additional regression test.
- Actual local admin session, shared popup/gallery size retention, preview copy/Cancel, and reversible image-only reorder/save were exercised against the Railway DB through a local backend. Temporary gallery ordering was restored. No payment, email or shipment occurred.
- First Railway upload `09759eb8-7334-412b-b2fb-4122336e7cda` is SUCCESS. A follow-up upload includes the final campaign image-path repair. Vercel staged production `dpl_Hfn4NZPinqympWum9kWHiPZp4RMV` is READY but not yet promoted at this checkpoint. Final publication, live responsive checks and release results are recorded below when completed.

No environment file was changed or uploaded. Actual Vercel project root is `doggy_ent_vue/client`; its vercel.json explicitly selects Vite/build/dist and retains API-excluding SPA fallback and security headers. Existing public API compatibility variable VITE_API_URL is retained; VITE_API_BASE_URL is canonical. No new environment variable is required.

### Final Rollout And Request Completion

The approved design is now application code and is live, not merely a mockup. Railway final deployment `88450128-aa78-4bb0-97e7-9f1db8acd5fd` is SUCCESS. Vercel final deployment `dpl_9v5GE4g81Ly86keE7sCcRYRqkXp5` is READY and was successfully promoted to [the storefront](https://doggy-ent.vercel.app). CLI inspection of that alias resolves to the final deployment. Earlier staged IDs above are superseded. Railway startup reports 22 migrations, no pending migrations, and a running server; there is no crash in the returned startup log.

| Requested Area | Delivered |
| --- | --- |
| Admin navigation | Expanded grouped subsections; identity/data routing retained; no editing fields in business nav. |
| Website UI | Categorized page/component and section selectors, shared real preview, contextual static wording/appearance tools, draft/Cancel/Publish boundaries. |
| Home | Hero/featured/collection/Next Drops/care/reviews/ingredients/brand/help retained, compact cards, giving spotlight, subtle monogram, photo-led care and smaller shared footer. |
| Product pop-out | Prominent selected-size price, main photo plus four optional thumbnails, details/care views and existing campaign/cart behavior. |
| Product management | Protected image-only gallery editor with upload/library reuse, optional zero-to-four entries, ordering/alt text and stale-save protection without variant replacement. |
| Campaign | Distinct reading layout with partner story, giving explanation and eligible treats; actual campaign content remains Campaign-owned. |
| Brand | Shared storefront shell, suggested origin/portrait/story chapters and generated-template replacement guidance. |
| Announcements | Three editable messages, gentle rotation, Previous/Next/Pause and hidden/reduced-motion cleanup. |
| Testing content | Existing eight test products reused, 32 optional detail images, seven clearly fictional review examples and one explicitly fictional giving campaign. |

Separate presentation storage means the existing StorefrontContent record, as specifically approved; it does not mean no database persistence. Website UI saves/publishes only validated presentation JSON. Products/Campaigns remain the source of truth for business content, images, prices, stock, programme eligibility and contribution rules. Arbitrary executable page sections, scheduled publication and real customer review submission/moderation are not implemented.

### Final Database State And Safety

Read-only final Railway preflight: 22 applied migrations with matching local checksums, no pending/failed entries; Product 15, ProductVariant 30, User 3, Order 4, Promo 1, Campaign 2, MediaAsset 41. The eight flagged test products all retain four gallery images, two zero-inventory variants and unchanged main images. Original users/orders/promos/products/variants and the original June Donation campaign were preservation-checked. All sixteen test-size checkout resolutions were rejected; no Stripe call/order was needed.

New `[TEST] Meadow Haven Giving` at `/campaigns/test-meadow-haven-giving` is explicitly fictional, references only the eight test products, uses sample 5% business-funded giving and claims no actual charity relationship, donation or payout. It uses the existing Campaign content schema, not a new programme model. The uploaded image is the 41st media record. [Publication report](assets/brand/test-products/presentation-integration-report.json) records the initial revision 1; subsequent reversible draft QA advanced revision to 3. Final draft equals published, and the initial publishedAt remains unchanged: temporary wording was never published.

Full private backups before gallery operations: local 354,459 bytes and Railway 297,028 bytes; before presentation publication, Railway 2,521,791 bytes. Each dump and full archive decode exited 0. Files remain outside Git with private permissions. No restore rehearsal, destructive migration, reseed, real payment, email, label or shipment occurred.

### Commands And Final Verification

| Command / Check | Exact Result |
| --- | --- |
| `git status --short`, `git diff --stat`, `git diff --name-status` | Exit 0; existing dirty work preserved; no commit/push. |
| Client `npm run build` | Exit 0; Vite 8.3.4, 2,283 modules. Final hero focal-position correction included. |
| Client `npm test` | Exit 0; 115 tests across 24 files: tier1 11, tier2 98, tier3 6. |
| Server `npm run build` | Exit 0; canonical snapshot sync and Prisma Client 6.16.2 generation. |
| Server `npm test` | Exit 0; 136 tests across 34 files: tier1 28, tier2 102, tier3 6. |
| `node --check` over server src/scripts/tests | 173 JavaScript files, no failures. |
| Read-only local/Railway migration preflight | Both 22 completed, no pending; checksums match. Final Railway counts above. |
| Guarded approved migration/gallery/publication helpers | Exit 0; backup/preservation/fixture checks passed; not startup seeds. Do not rerun their apply modes blindly. |
| Railway CLI upload/status/startup log | Final deployment SUCCESS; no pending migrations; server listening. |
| Vercel staged build, promotion and alias inspection | Final deployment READY; promotion exit 0; public alias resolves to final ID. |
| Public HTTP/asset/CORS probes | Home/Brand/test campaign/admin-editor/checkout SPA routes 200; fake `/api` stays 404; backend public reads 200; unauthenticated auth/me 401; exact storefront CORS/credentials retained. 25 public fixture image references and campaign image 200. |
| Live browser | Home/Brand/Campaign rendered with loaded images/no desktop horizontal overflow; gallery/selected price/unavailable test action and shared shell checked; final warning/error log read returned zero entries. |
| Actual local admin against Railway DB | Login/persisted session, data target badge, static edit/Cancel and reversible draft save/reload/restore, gallery reorder/save/reopen/restore passed. |
| Real cart | Original Chicken 6 oz and 18 oz produced separate correct-size rows; state survived Brand navigation. Only temporary QA lines removed afterward. |

No lint script exists in either package; none was invented. Both generated storefront snapshots match canonical shared files. Final Markdown/local-link/fence/JSON/secret-pattern and whitespace checks are recorded in the completion result. Those checks are bounded pattern validation, not a claim of an exhaustive secret/security audit.

One QA interruption came from a temporary local server that had loaded an older presentation module before the final canonical sync. Its stale response failed the new allowlist, while the deployed response passed. Restarting only that task-owned server loaded the current contract; the actual draft save/reload/restore then passed. No allowlist was weakened. The final campaign mapper also needed an exact `/api/media/<uuid>` image-path exception; regression coverage now accepts legitimate uploaded media and rejects other unsafe relative paths. Wide hero/Brand photo framing was corrected before the final promotion.

### Remaining Risks And Manual Acceptance

1. Current responsive overrides did not reliably produce requested 320/390 CSS viewports. Actual narrow-device, Safari, full keyboard/screen-reader and OS reduced-motion acceptance remain open; historical mockup tests are not current-app mobile proof.
2. Generated portraits/packaging/preparation images, fictional reviews and the fictional partner are testing content. Replace/review or retire them before real-customer launch; no verified-purchase review system is implied.
3. Run an explicitly approved guest and signed-in Stripe test checkout, promo-plus-campaign, retry/recovery and wallet/device QA. This phase did not place payments or send providers. Earlier checkout reconciliation/concurrency/refund/tax/shipping launch gates remain open.
4. Safari cross-site cookie limitations and owned-domain/API-subdomain rollout remain; local frontend -> local backend -> Railway DB is still the temporary admin workflow. No bearer fallback/security weakening was added.
5. Existing Prisma tooling advisories, backup restore rehearsal and production monitoring still need their separate focused phases.
6. These services were deployed directly from a filtered local release, without committing or pushing. A later Git-triggered deployment can overwrite them until the owner reviews and commits the matching source. No env/dependency/build/cache/private backup files were uploaded.

Manual acceptance: review all three live pages and every homepage section; open product details/change sizes/photos; confirm test records cannot add; try the actual cart drawer with a normal product; inspect the small shared footer, giving page and rotating-header Pause. In admin, confirm data routing first, use Website UI for static wording/appearance and Products for optional images, then test draft versus deliberate publication and stale edits. Review real mobile/Safari before calling the visual phase accepted.

Full current file inventory (including retained prior-pass assets/docs): [integration file manifest](assets/brand/test-products/integration-file-manifest.json). Responsibility/replacement guides: [file map](docs/architecture/file-map.md), [editor](docs/architecture/storefront-editor.md), [image placements](assets/brand/image-placement-guide.md), [database](docs/architecture/database.md), [QA](docs/verification-and-qa.md). The tree is ready for focused commit review, not launch certification. No commit or push was performed.

Final closeout checks were rerun after documentation: both builds exit 0; all 115 client and 136 server tests pass; 173 server syntax checks and 14 generated snapshot comparisons pass. An initial byte-for-byte snapshot probe omitted the documented generated-file header and falsely reported mismatches; comparison against the sync script's actual header-plus-source contract passes without application edits. Earlier intermediate Vite HMR export warnings resolved after both canonical sync/builds and refresh; no such error appeared in the final live log read. Documentation validation exits 0: 12 Markdown files, 230 balanced fence lines, 186 existing local links, 17 text/JSON secret-pattern scans, zero findings. `git diff --check` exits 0. No changed/untracked environment file or client/server .env.example exists. Current review inventory is 62 modified and 116 untracked files (178 total, including prior-pass generated assets/docs).

Temporary QA tabs and only the task-owned 5174/3101 processes were closed/stopped deliberately (SIGTERM/143); listener check returned no matches. Original user 5173/3000 services were not stopped. The final public storefront tab remains open and the actual live Home/Campaign screenshots are saved in the task artifacts. No verification/deployment command remains running and no native confirmation remains pending.

## 2026-10-15 Full Approved UI Reconciliation: In Progress

The owner correctly reported that the previous deployment retained legacy layouts and products. The prior completion statement above is superseded for visual parity. The approved polished mock, not the old storefront or a partial integration, is authoritative. Progress and exact recovery steps are maintained in [the reconciliation checkpoint](docs/work-checkpoints/2026-10-15-approved-ui-reconciliation.md), including data preservation, current verification, pending deployment and unverified acceptance. Read that checkpoint before continuing; do not replay completed database operations.

### Final Reconciliation Result

The full polished composition is now deployed. The previous partial integration mixed new cards/galleries with old page composition, published copy and legacy products. Current source replaces those compositions, updates the separately approved presentation record and archives old products. A fresh-load fallback also briefly showed old hero/navigation; canonical defaults now use the new design. Actual admin QA found its ACTIVE-only filter hid three approved cards; catalog/filter/editor now share `productVisibility.js`.

| Approved Area | Current Implementation |
| --- | --- |
| Shared shell | Compact Shop/Giving/Our story navigation, quiet Sign in/bag controls, expandable real search, rotating announcement, shared smaller shop/help/social footer. Real auth/cart remain connected. |
| Home | Nine visible configured sections: brand-led hero, featured packaging, ordered eight compact products, giving photo/copy, compact Next Drops, care photo/individual steps, seven explicitly fictional reviews, ingredient/brand paired closing columns. Subtle monogram; no public legacy promise/help bands. |
| Campaign | Full partner story/photo, three test-only programme rows, why-partner content, giving sidebar, three eligible products in configured order. Same renderer in campaign pop-out and editor. |
| Brand | Complete origin, two portrait templates, journey, everyday moments, values and closing action. Same public/editor renderer. |
| Product pop-out | Main plus four optional photos, vertical desktop rail, prominent selected price, size/details/care and unavailable test protection. |
| Website UI | Existing grouped business nav with no edit fields; main-workspace categorized page/section selectors, shared canvas and contextual inspector. Same eight-product visibility as storefront. Product/campaign business values remain read-only here. |

The static appearance owner is StorefrontContent, as explicitly approved, not Product/Campaign business writes. Existing Product image-only gallery editing remains protected, optimistic and separate. Hidden historical sections remain available/labelled Hidden in admin rather than silently deleting editor capability. Not every suggested partner/programme paragraph is an editable business field; arbitrary executable sections, scheduled publishing and customer review submission/moderation remain unimplemented.

### Final Railway Data And Safety

- Final publication revision 5; draft equals published. Old promise/help hidden; Shopping help points to the existing account-help route. Test campaign introduction/story reflects the approved fictional Meadow Haven example and is explicitly labelled testing.
- Seven legacy products soft-archived, not permanently deleted. Seven historical order-item references remain valid. Legacy media is not rendered in the approved storefront but is retained where history/recovery may reference it. See [archive/publication report](assets/brand/test-products/design-reconciliation-report.json) for reversible IDs/previous state.
- Eight existing flagged testing products reused: Chicken, Beef, Turkey, Salmon, Lamb, Training, Pumpkin, Bundle. Four optional photos each, two zero-stock variants each. All sixteen variants rejected by the real checkout resolver without Stripe/provider requests. Beef is out-of-stock; Pumpkin/Bundle coming-soon; the others active. All remain unpurchasable regardless of status/selling-mode UI.
- Test campaign is fixed $2 per eligible order on Chicken/Salmon/Bundle only, with zero usage/payout. Original June campaign, original variants, users, orders, order items, promos and unrelated business data preservation-checked across both guarded writes.
- Final counts remain Product 15, ProductVariant 30, User 3, Order 4, Promo 1, Campaign 2, MediaAsset 41. Twenty-two migrations complete with matching checksums; none pending. No migration/reset/reseed in this correction.
- Before the two guarded data changes, full private backups of 2,706,857 and 2,707,158 bytes were created and fully decoded successfully. No restore rehearsal. Backups stay outside Git with private permissions. Apply helpers have revision/usage/concurrency gates and must not be replayed.

### Final Deployments

Railway `7714b914-cd87-4e7c-ab84-264abdd3637b` is SUCCESS. Startup logs report 22 migrations, no pending migrations and server running on port 8080. Vercel `dpl_2E6UaeyT6QHFq589zMts7WWzygvN` is READY and was promoted successfully; inspecting [the public alias](https://doggy-ent.vercel.app) resolves to it. Earlier IDs in this checkpoint are superseded. The final staged app HTML was verified with authenticated `vercel curl` before promotion. Existing Vercel root remains `doggy_ent_vue/client`; Railway root remains `/doggy_ent_vue/server`. No new env variable is required; existing API-origin/compatibility variables and auth/provider configuration are unchanged.

During deployment, an unlinked CLI invocation accidentally created an extra Vercel `release` project instead of using `doggy-ent`. The live project was not replaced by that invocation. The accidental project and its deployment were explicitly removed; a subsequent inspect returns project_not_found. Correct project/team/root were then verified before every consequential release. Linking generated a local env file outside the repository; it was deleted unread before source upload. Application env files were never changed or uploaded. Filtered releases excluded secrets, dependencies, build outputs, Git data and private backups. No commit/push.

### Commands And Verification

| Command / Check | Final Result |
| --- | --- |
| `git status --short`, `git diff --stat`, `git diff --name-status` | Exit 0 before edits; prior dirty work preserved. |
| Client `npm run build` | Exit 0; Vite 8.3.4, 2,296 modules. |
| Client `npm test` | Exit 0; 122 tests in 25 files: 11/105/6 by tier. |
| Server `npm run build` | Exit 0; canonical sync and Prisma Client 6.16.2 generation. |
| Server `npm test` | Exit 0; 136 tests in 34 files: 28/102/6 by tier. |
| `node --check` over server src/scripts/tests | 173 files, zero failures. |
| Canonical header-plus-source snapshot comparison | 14 comparisons, zero mismatches. |
| Built client text secret-pattern scan | 55 JS/CSS/HTML assets, zero findings; bounded pattern scan, not exhaustive security proof. |
| Read-only Railway preflight/catalog guard | 22 complete/checksum-matching migrations, no pending; 7 archived/7 historical references; 8 test products/16 rejected variants; revision 5 equal draft/published. |
| Public reads/CORS/assets/routing | Product/content/campaign 200; exact storefront CORS plus credentials; unauthenticated auth/me 401. Forty distinct product/campaign image URLs 200/image content. Home/Brand/Campaign/admin-editor/checkout SPA routes 200; fake `/api` stays 404, not index.html. |
| Deployment commands | Railway upload/SUCCESS; Vercel staged READY, authenticated app HTML, promotion and alias inspection all passed. |
| Actual public browser | Nine Home sections, ordered eight products/three emerald cards, full Campaign/Brand content, no failed images or horizontal overflow on wide desktop. Popup 18 oz/$39.99 retained through fifth photo; Escape restores opener. Giving opens shared pop-out. Real empty cart drawer opens; Turkey search yields one item and clears back to eight. Final warning/error log read zero entries. |
| Actual deployed admin | Login/session/Website UI passed; identity/data routing retained, eight preview cards, zero nav form fields. Brand/Campaign page selection keeps clean Save disabled. No editor Save/Publish/business edit performed in final acceptance. |
| Responsive local browser | Actual CSS widths 358/477/582 and wide 1910 checked without horizontal overflow; compact menu/search and cart open. Exact requested viewport overrides were not reproduced reliably. |

Intermediate failures were resolved before final deployment: a brittle SSR assertion omitted Vue's scoped attributes; tests expecting visible legacy promise/help were updated to the expressly approved hidden state. No validator or purchase guard was weakened. Latest complete suites above pass. Neither package has a lint script; none invented. No real payment, email, label, shipment or new customer signup was performed.

### Files And Future Recovery

Full [199-file dirty-tree manifest](assets/brand/test-products/integration-file-manifest.json) includes 77 modified and 122 untracked files, including retained earlier integration/generated assets; it is not a claim that all were created in this correction. New focused files include StorefrontStoryCard, complete BrandPageContent, NextDropCard, shared productVisibility, seven-case approved-design tests and the non-secret reconciliation report. Changes span Home sections/styles, Campaign renderer/styles, header/footer, Quick View, admin preview, canonical/generated presentation defaults and focused docs. [File map](docs/architecture/file-map.md) explains responsibilities.

AGENTS now requires durable milestone checkpoints for long/interrupted work. Credit cutoffs cannot be reliably predicted; save progress continuously rather than waiting for a final response. Read [the dated checkpoint](docs/work-checkpoints/2026-10-15-approved-ui-reconciliation.md) first on a future refresh. It records actual completion, deployment IDs, safe data state, artifacts, commands and honest unverified work without secrets.

### Remaining Acceptance And Risks

1. Owner visual review of all three live pages and Website UI against the exact polished mock is still required. Real-device Safari/iPhone, screen reader, full keyboard/focus and OS reduced-motion testing remain manual; emulation is not device certification.
2. All public products are intentionally test-only/unpurchasable. Reviews, partner/programmes and generated photos are explicitly fictional/templates. Replace them with reviewed real content and deliberately approved sellable records before real launch. Do not remove test protection as a cosmetic edit.
3. Browser auth succeeds in this test environment; existing Safari cross-site cookie/owned-domain work is not solved by the visual redesign. Existing checkout recovery/atomic attribution/tax/shipping/provider/restore/monitoring launch gates remain open. No end-to-end payment was claimed here.
4. Direct deployments can be overwritten by a later Git-triggered deployment until the owner reviews/commits matching source. No commit or push is performed. Current source is suitable for focused commit review, not launch certification.
5. Local normal DB content was not overwritten with Railway presentation/catalog. To inspect the same testing data locally, use the documented local frontend -> local backend -> Railway DB mode, not browser admin CRUD directly to Railway.

Next recommended phase: visual/device acceptance against this release, then a focused approved real-content/catalog setup and the existing payment-reliability launch gates. Do not restart a speculative redesign from the old site.

Final closeout: documentation checks pass (14 Markdown files, 236 balanced fence lines, 201 existing local links, 20 bounded secret-pattern scans/zero findings), `git diff --check` passes, and no changed/untracked environment or .env.example exists. Final public bundle and six 200/404 route probes match the promoted release. Actual refreshed editor has all eight cards; final Home has no failed images or warning/error console entries. Only task-owned reference/API/Vite listeners and reference/local/editor tabs were closed; original user services/tabs remain. The final public Home tab is left open. No required command/deployment remains pending. Screenshots: `reconciled-home-live.jpg`, `reconciled-campaign-live.jpg`, `reconciled-brand-live.jpg` in the dated task artifact root recorded in the checkpoint.

## 2026-10-15 Product Card Density And Heading Readability

The owner requested shorter/wider product cards and section title/copy backgrounds. This is a focused visual follow-up, not a new redesign or business-data change. Work and recovery steps are tracked in [the density checkpoint](docs/work-checkpoints/2026-10-15-storefront-density.md). The previous release remains live until separately published; local verification/results follow below.

- Implemented a responsive minimum-width grid, shallower uncropped 3:2 product photos, tighter internal gaps and readable product titles. Same 1,112 px collection content width: first-row cards changed from approximately 266 x 719 px to 360 x 644 px. Exact height remains content-dependent; no fields are truncated or removed.
- Added opaque white heading/copy bands with a restrained blue edge, including collection filters in the same reading area. Shared styles cover Home, Campaign, Brand and editor renderers. Kept existing item shadows, brand colors and emerald campaign treatment. Editor density labels now truthfully describe maximum columns, not guaranteed exact counts.
- Changed eleven client files (components/sections/styles plus one test) and six documentation files, enumerated in the checkpoint. No server, schema, API, env, dependency or business-data change in this follow-up.
- Client `npm run build`: exit 0, Vite 8.3.4, 2,296 modules. Client `npm test`: exit 0, 123 tests/25 files (11/106/6). The first new test failed on default title capitalization; the fixture now supplies explicit copy and the complete suite passed. No lint script exists. Server checks/Prisma generation were not required for client-only edits.
- Browser: actual Railway-backed catalog reads through the local API; all eight photos loaded. Card 18 oz shows $39.99 and opens Quick View with the same selection; Quick View 6 oz shows $14.99. Test purchasing stays disabled. Filter selection narrowed the collection correctly. All seven Home and five each Campaign/Brand heading bands are opaque white; no failed images or page overflow observed. Responsive CSS widths 388/582 and desktop 1910 fit without horizontal overflow. No application error console entries; Stripe.js gives its expected local-HTTP HTTPS advisory.
- Local preview: `http://localhost:5174/#shop`, through task-owned API port 3101 (Railway DB read-only catalog checks). Original services on 5173/3000 were not changed. Screenshot: `storefront-density-desktop.jpg` in the task artifact directory recorded in the checkpoint. No new deploy, commit, push, migration, publication, provider send or payment. Previous live releases remain unchanged.
- Remaining manual QA: owner visual acceptance, real Safari/phone, long product copy and narrow editor canvas/density choices. Shared renderer reuse is verified from source/tests, not a fresh live authenticated editor Save/Publish. Test-only catalog prevents end-to-end purchase QA. Current focused edits are ready for commit review within the existing dirty tree, not launch certification.

## 2026-10-15 Section Typography And Aesthetic Follow-Up

The owner accepted product card proportions but requested a more cohesive section heading/copy treatment across pages. This local-only follow-up is tracked in [the typography checkpoint](docs/work-checkpoints/2026-10-15-storefront-type-polish.md). Preserve the approved product cards, all content, shared storefront/editor behavior and business data. No new deployment is implied.

- Replaced hard blue-edged white heading bars with unframed introductions aligned with their content. Standardized section titles at 26 px/650, introductory text at 16 px with readable line length/spacing, and story item title/body hierarchy. Softer 4.5% monogram opacity preserves the artwork without competing as strongly with text. Collection filters have a compact white 8 px rounded toolbar; existing content item corners/shadows and all brand/giving colors remain.
- Shared section rules now live in `storefront.css`; Home's conflicting 24/30 px title overrides were removed. Review heading copy uses the same rules as other section introductions. Empty eyebrow elements are omitted. Brand closing text shares section typography. ProductCard files/size/pricing/purchase logic and hero/header/footer/account/checkout/admin layouts were not changed.
- Ten client files and seven documentation files changed in this follow-up, enumerated in the checkpoint. No new application component/API, schema, dependency, environment requirement or business-data write.
- Client `npm run build`: exit 0, Vite 8.3.4, 2,296 modules. Client `npm test`: exit 0, 124 tests in 25 files (11/107/6). `git diff --check`: passed. No lint script exists; none invented. No server build/Prisma generation required for client-only edits.
- Browser: seven Home, five Campaign and six Brand section headings have the same computed 26 px/650 type, including Brand closing. Wide Home first-row products remain approximately 360 x 644 px at the same content width. Card 18 oz/$39.99 opens Quick View with matching size/price; test purchase stays disabled. Home/Campaign/Brand fit at actual CSS width 388 without heading/page overflow; desktop widths 895/1910 checked. No application console error entries observed. No fresh authenticated editor publish, checkout payment or provider action was performed.
- Local preview remains `http://localhost:5174/#ingredients` (API 3101); no listener/env reconfiguration or restart in this follow-up. Screenshot `section-polish-preview.jpg` plus Home/Campaign/Brand desktop examples are in the artifact root recorded in the checkpoint. Previous live deployments remain unchanged. No commit/push.
- Remaining acceptance: owner visual direction, real Safari/phone/screen reader, long edited text and narrow Website UI canvas. Shared public/editor code is reused; a fresh authenticated visual editor session was not run. Focused source is ready for commit review in the existing dirty tree, not launch certification.

## 2026-10-16 Selected Modern Boutique Home Sections

The owner approved the Modern Boutique layouts for Made With Care, Ingredient Promise and The Pair Behind the Name only. Those layouts are implemented locally: photo/ordered process, pale yellow icon-led ingredient promise, and full-width photo/story teaser. Existing managed copy/images/links and Product-owned ingredients/storage remain connected. Other sections, accepted product proportions, shared header/footer, Campaign/Brand pages and business behavior stay unchanged.

- Reviews keep all seven existing detailed fictional entries, with larger two-across desktop/one-across narrow cards and a contained native scroll-snap track. Eight-second rotation only runs with overflow and a visible section; hover/focus/hidden tabs/reduced motion/editor mode stop it. Manual navigation/dragging pauses until explicitly restarted. Previous/Next/Pause/Play remain available as appropriate. The future-review notice sits below, not in the rotation.
- New focused composable `useReviewCarousel.js` owns timing/geometry/lifecycle. Six client files were modified, one composable and two test files created; [the checkpoint](docs/work-checkpoints/2026-10-16-boutique-home-sections.md) lists exact files, commands, screenshots and recovery instructions.
- Client `npm run build`: exit 0, Vite 8.3.4/2,297 modules. Client `npm test`: exit 0, 137 tests/27 files (11/120/6). Targeted 13 new SSR/lifecycle regressions pass. No lint script exists. Server/Prisma checks are not required for client-only edits.
- Actual local browser: nine sections/eight products/seven reviews retained; larger cards, working manual navigation/Pause and real ingredient Quick View at 6 oz/$14.99. No page overflow at actual CSS widths 2149/846/582/388; wide track 1,112 px/cards about 544 px, narrow track/card 352 px. Images loaded; final application error log empty. Shared editor autoplay=false verified with SSR, not a fresh authenticated editor session.
- Viewport overrides differed from requested dimensions and narrow captures were blank despite valid DOM geometry; normal restored captures render correctly. Real phone/Safari/touch/screen-reader, OS reduced motion, long edited copy and narrow Website UI acceptance remain manual. Fictional photos/reviews/test catalog and prior launch gates remain unchanged.
- Preview: `http://localhost:5174/#ingredients`, existing API 3101. No DB write/publication, deployment, environment/schema/dependency change, new image, provider action, commit or push. Focused edits are ready for review in the existing dirty tree, not launch certification. The previous live release is unchanged.

Closeout: documentation/fence/local-link checks passed (7 Markdown files, 228 fence lines, 133 local links); composable syntax and whitespace checks passed. Sixteen-file bounded secret-pattern scan found no matches, changed env count is zero, and no env examples exist. Normal local proof screenshots are linked from the checkpoint; narrow blank captures were discarded. Browser viewport restored, product pop-out closed, original local services/tab retained, and all required checks finished.

## 2026-10-17 Storybook Brand And Impact First Campaign

The owner approved Storybook and Impact First from the new boutique examples. Both are integrated locally. Brand has one managed origin, selectable portraits, numbered chapters, everyday photo/story, pale-yellow values and the real shopping invitation. Campaign shows its configured contribution immediately after the hero, partner narrative, test-only programme/why sections, giving steps and unchanged eligible ProductCards. Public pages, pop-out and admin reuse the same renderers. Accepted Home/header/footer/cart/auth/checkout remain unchanged.

- Website UI adds exactly two allowlisted portrait presentation records with names, introductions, stories, upload/library/URL images and descriptions. Old publications/drafts receive safe defaults; nested projection and selected-media existence checks protect saves. Local canvas portrait selection is enabled while navigation remains inert. No schema/migration or new env variable. Server contract must deploy before the new client saves; no publication or deployment was performed here.
- Focused components keep composition, local portrait state, contribution facts, test-only story examples and shared photo fallback separate. Exact new/modified files, operations, limitations and recovery are in [the checkpoint](docs/work-checkpoints/2026-10-17-storybook-impact-first.md).
- Client build exits 0 (Vite 8.3.4, 2,305 modules); all 145 tests/28 files pass. Server build exits 0 (canonical sync/Prisma Client 6.16.2); all 139 tests/34 files pass. Syntax checks cover 173 server JS files; six changed generated snapshots match. No lint script exists. Whitespace/docs/link/fence checks and bounded 32-file secret scan pass; no env files/examples changed.
- Actual local browser verifies portrait photo/name/story switching, the real $2 per eligible order, three loaded eligible cards, 18 oz/$39.99 Quick View handoff, and Impact First inside the real campaign pop-out. Home keeps nine sections/eight products/seven reviews. Desktop and actual 388 px DOM fit without horizontal overflow; no failed selected-page images or captured app error entries. Read-only public content returns two properly allowlisted portraits.
- Only the task-owned API 3101 was restarted to load current contracts; Vite 5174 and original user services remain. No DB write/publication, auth provisioning/login, provider send, payment, migration, commit or push. The existing live release remains unchanged.
- Remaining manual acceptance: actual authenticated Website UI portrait edits/Cancel/draft reload/publication, Catalog canvas, long copy/photo failures, real phone/Safari/keyboard/screen reader/reduced motion and post-deployment guest/signed-in checkout. Template photos/personality/milestones, fictional partner/reviews and intentionally unpurchasable test products remain; do not mistake this visual completion for launch certification. Focused changes are ready for commit review. Next: owner/editor/device approval and a deliberately approved matching backend-first/frontend rollout, then payment-reliability launch gates.
