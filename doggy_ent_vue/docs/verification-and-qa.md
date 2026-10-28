# Verification And QA

## Checkout Summary Correction (2026-10-27)

Broad unmerged749f435 checkout redesign is reversed to f1bf1ba; critical payment/
contact/shipping/delivery/admin-canvas files have no net difference. Only five
runtime files add summary metadata/presentation. Full client624(11/607/6), server
797(62/729/6), guarded420server/296client and admin/storefront/server builds pass.
Fourteen new summary cases and two promo metadata cases cover real gray rates,
zero/pending/mixed, percentage/cent rounding/fixed savings, before/after amounts,
escaping and unchanged server total. Final color-only client607 tier2 and combined
build pass; actual sample preview verifies blue tax/emerald savings/brown total,
gray pills,14.99 ->13.49/10% off, no breakdown and320px no-overflow. Fixture has
0payment attempts/0writes. This is not production Tax configuration. Final
new evidence and remaining preview/release steps are in the
[checkpoint](work-checkpoints/2026-10-27-checkout-summary-labels.md). No actual
Stripe/Tax calculation, charge/email or shared DB operation is implied by fixtures.

## US Tax Preparation (2026-10-27)

Current full suites pass server795(60/729/6), client610(11/593/6), gateway6 and
runner safety9. Coverage includes real adapter tax hooks, server-owned quote/proof,
frozen-tax finalization, US boundaries, integer discount allocation, provider/cache
failure, public projection, stale pricing and explicit refreshed-total card/wallet
retry. Full server HTTP fixtures require gateway plus persisted ACTIVE ADMIN for
tax readiness, prohibit writes and avoid provider/storage access while Tax is off.
The network-blocked payment runner excludes listener tests; don't weaken its guard.

After fresh decoded full private backups, only the approved nullable order column
is applied locally/Railway:28matching migrations/nonepending, all34prior business
table fingerprints preserved and old snapshots null. Local real Prisma/Postgres
fixture verifies snapshot round-trip/customer projection/legacy/rollback with no
persisted orders. Independent source and follow-up review close carrier-fallback
and stale-total retry findings. Provider Tax remains intentionally OFF; genuine
Stripe calculations/Tax transactions/device payments/receipt sends are NOT proven.
Final source/deployment checks are tracked in the
[tax checkpoint](work-checkpoints/2026-10-27-stripe-tax-readiness.md).

Final hosted evidence: PR62/63 exact-head Quality pass; main8df5883 on Railway
a51c7d27-1294-459b-83fc-afea51623243 SUCCESS and both stable Vercel aliases READY.
Live tax-off preview/public projection/US/mode/access/no-store/CORS checks pass.
Actual checkout/staff/legacy-order DOM verifies truthful disclosure and test-card
availability without any payment.19public assets contain no server-key pattern,
staff modules or development-routing component. No new orders/email;28matching
migrations/nonepending. Real device/Tax-enabled/provider/payment-launch gates stay
open. Final evidence is integration-only docs, not another production rollout.

## Manual Sandbox Checkout Enabled (2026-10-27)

Only the existing API creation flag is enabled at the owner's request. Redeploy
f9afcf4a-5190-4fc7-b4c8-82762c3cb2b4 SUCCESS reuses main1738cc7; no Vercel/source
release. Fresh read-only27-migration/checksum/account/receipt-off preflight and
clean startup pass. Public sandbox/enabled/no-store, live/missing mode409 without
payment identity, health200/directstaff403 and actual verified staff Allowed
(sandbox)/live-lock pass. Real customer checkout reload preserves bag/account and
loads Stripe's secure test card input; wallets are unavailable on this device.
Runner-safety9/9 passes. No payment is submitted and no wallet/device/successful
purchase certification is inferred. Owner test purchases can write orders/stock
in the testing DB; live launch and durable-recovery gates remain open. See the
[current checkpoint](work-checkpoints/2026-10-26-payment-environment-safety.md).

## Paused Sandbox Deployment (2026-10-27)

Exact main1738cc7 is RailwaySUCCESS/both stable VercelREADY after PR58/59 and
current-head client/server Quality/all steps. Fresh read-only preflight27matching/
0pending/0failed/checksum matches and old test last24h0; runtime startup applies
no migration and reports no error pattern. Public sandbox/false/no-store/exactCORS,
blocked start503, health/catalog/campaigns200, customer401, directstaff403 and
protected admin302 pass. Actual signed-in staff Refresh/expanded detail verifies
the intended account, paused creation and live lock; screenshot/DOM656width has no
overflow. Public18-asset walk finds matching sandbox public key and no long server
key/live key/admin module. Post-release new orders/email deliveries0, receipt
settings absent/off. Focused offline runner rerun289server/223client passes. No
charge/refund/mail, shared mutation or real-device/purchase certification. See
[artifact/evidence checkpoint](work-checkpoints/2026-10-26-payment-environment-safety.md).

## Payment Environment Safety (2026-10-26, Local)

Full server665 (60/599/6) and client551 (11/534/6) pass. Guarded payment selection
passes289server/223client; native runner9 and gateway6 pass. Server build generates
Prisma6.16.2; combined/admin/storefront builds pass (admin uses a synthetic public
storefront origin). No schema/migration or dependency upgrade. New cases cover
default-off/strict flags/key modes, real adapter account/livemode checks, live lock,
paused live/sandbox retrieval, cache expiry/failure/concurrent identity changes,
public projection, actual staff HTTP authorization/gateway restrictions, private
override startup and client configuration/SDK gates.

Isolated actual Vue admin context verifies configured/verified/paused status,
expanded IDs/blockers, sandbox/live-lock/unset/account-mismatch/unavailable and
stale/recheck states. Observed669px and873px layouts have no horizontal overflow;
final captured console errors are empty and fixture write count is0. Partial
fixture router produces expected unmatched-sidebar warnings, not app route QA.
Screenshots are private fictional evidence; temporary5194server/tab and fixture
file are removed. Ordinary user servers remain untouched. No narrow/Safari/wallet
or real-admin session certification is inferred.

Read-only local config inspection confirms the base DB is loopback and older
keys are test-mode. A single Stripe own-account read confirms the old server key
is not the newly connected sandbox; no private provider payload was printed.
Dedicated owner-only ignored overrides keep creation paused and the old keys
unchanged. New public key is supplied; matching private server key remains pending.
No provider setting/key creation, actual charge/refund/email, DB write or deployment.
See [checkpoint](work-checkpoints/2026-10-26-payment-environment-safety.md) and
[configuration/launch contract](architecture/payment-environments.md).

## Stripe Preparation And Admin Clarity (2026-10-26, Local)

Final full suites:601server (56/539/6) and424client (11/407/6) pass. Combined,
admin-only and storefront-only client builds plus server/Prisma6.16.2 generation
pass. Guarded payments:test selection passes227server/96client, with9native safety
tests (30combined Git/security/payment helpers). These add94server/60client/9helper
cases to the prior baseline. No real Stripe/Resend/DB call is implied by a mocked
provider result; no shared migration/provider configuration/send/charge occurred.

Actual fictional read-only browser verifies case/space-insensitive Stripe-ID search,
empty/matching counts, receipt queue caution and Automatic receipt marker, working
Notifications template link and existing editor route. Observed881px page/content
has no horizontal overflow; screenshot inspected. No captured console errors. The
fixture rejects its editor's automatic sample-preview POST with405 (no mutation),
so this is not a full email-editor preview/send check. Initial admin-only dev proxy
was pointed at ordinary3000; one anonymous auth/read path was corrected to the
memory-only fixture before acceptance. No credentials or business data changed.
Both temporary5193/5194servers and the test tab are stopped; owner servers remain.

Real narrow/iPhone/Safari/accessibility/wallet testing, provider configuration,
webhook/reload recovery, real transaction races, financial ledger/refund truth and
stale-browser status safety remain separate. See the [acceptance matrix](prelaunch/payment-readiness.md)
and [checkpoint](work-checkpoints/2026-10-26-stripe-checkout-readiness.md). New CI
safety-step configuration is local; no hosted run/publication/deployment here.

## Email Template Copy Repair (2026-10-26)

Client364/server507 tests and combined/admin/server builds pass. New repository,
service and actual composable cases cover stable identity, concurrent unique-key
collision, legacy/custom/archive preservation, list linkage, double-click guard,
no-op save, post-save edit and failed-request draft retention. An actual disposable
loopback database with27migrations verifies ten concurrent requests yield one row,
rename/revision persistence, archive preservation, legacy reuse and unchanged
receipt settings/zero sends; fixture removed. Memory-only actual Vue browser checks
verify Add, edit, Save changes, Already added reopen and refresh retain one saved
copy. Independent review's stale legacy link finding is fixed and re-reviewed;
canonical origin/create/update coverage also passes. PR55/56 Quality client/server
and every step pass. Exact main2066f6b is live on both stable Vercel hosts READY
and RailwaySUCCESS; startup27migrations/no pending/zero error patterns. Public
health/products/campaigns200/exact CORS, customer401/directstaff403 and public
zero-admin-module manifest pass. Live editor reuses the saved template on repeated
Already added clicks, enables Save changes after an edit, and restores original
copy on Cancel; zero captured browser errors. No additional template creation or
setting Save during final live checks.

Owner-requested cleanup follows fresh full private2806546byte decoded/checksummed
backup and exact-field inventory. Serializable guarded archive of four duplicate
active payment templates preserves the original and distinct preparation template,
all content, other template rows, receipt settings and delivery count. Two active
templates remain; no permanent deletion or schema migration. UI shows two My
templates/Archived5 (four duplicates plus prior diagnostic copy). Sending is off,
settings0/automatic deliveries0. No real provider/mail/device certification.
See [final repair evidence](work-checkpoints/2026-10-26-email-template-copy.md).

## Checkout Payment Receipt (2026-10-25)

Final client357 (11/340/6) and server497 (28/463/6) pass, including the sample-state
follow-up. Combined,
storefront-only and admin builds pass; isolated admin build requires the same
public `VITE_STOREFRONT_ORIGIN` as its hosted configuration. Server build generates
Prisma6.16.2. Six gateway tests pass unchanged. No live provider/payment was used.

Tests cover Stripe-failure-before-receipt, client price/receipt rejection, payment
replay, preparation failure/no commit/safe retry, atomic nested receipt write,
saved-template/mode/revision/admin validation, CAS claim, bounded/provider-filtered
work, timer overlap/cleanup, default-off/live-lock/dry separation, provider failure
redaction/unknown acceptance and customer payload omission. Fifty renderer cases
cover escaping/long copy/tables/text/giving/HTTPS assets/private fields. Worker
reported24fictional browser layouts including blocked images; main's isolated
actual editor verifies monogram/icons/sample receipt, separate test-setting Save,
unsaved-copy preview/Cancel, restored settings, named select labels and phone canvas.
These do not certify Gmail/Apple Mail/Outlook inbox rendering or delivery.

Actual disposable loopback Postgres27 migrations passes guest/member/replay,
permanent receipt uniqueness, stock once, nested-failure rollback, concurrent claim
once, dry dispatch/body cleanup and stale/constraint failures; fixture DB removed.
Approved local/Railway migration follows fresh full private decoded backups and
checksums:27matching/nonepending, new constraints validated, prior record projections
unchanged, settings absent/off and zero automatic shared delivery rows. A first
postflight probe incorrectly included Postgres18 NOT NULL constraints; restricting
the probe to PK/FK/CHECK validates the intended constraints without reapplying SQL.

Before live activation: owned verified sending domain and sender/reply config;
explicit approved inbox and small send budget; check provider quota/suppression,
one sandbox checkout/receipt and duplicate/replay behavior, actual clients/images
blocked, failure reconciliation, and full guest/member checkout/device acceptance.
Do not test with real customers or enable paid overages. Existing payment webhook
recovery, atomic promo/campaign usage, privacy retention and launch gates remain.
[Checkpoint](work-checkpoints/2026-10-25-checkout-receipt-email.md) records exact
publication/deployment status; migration/dry-run success is not successful mail.

Final production mainb1fc199 is verified on both Vercel hosts (READY/exact source)
and Railway (SUCCESS/exact source). Startup27migrations/no pending/listening and
zero receipt-worker/application-error patterns. Public PNG200/content types/source
hashes, read APIs/exact CORS, customer401/directstaff403, public0admin manifest and
protected anonymous302 pass. Existing real admin session reads refreshed templates,
payment sample without tracking and shipped sample with fictional tracking, then
returns to payment; monogram/icons render and captured browser errors0. No Save,
provider send or shared fixture. Settings0/automatic deliveries0 and unchanged prior
record projections reconfirmed. Source remains prelaunch, not inbox/payment/legal
certification. Fixture5192 stopped; ordinary user servers preserved.

## Separate Vercel Admin Gates (2026-10-25)

Completed source main30bc5ba is live on both Vercel projects (READY) and Railway
(SUCCESS). Public manifest has zero admin modules; admin manifest excludes customer
routing. Vercel all-URL protection, owner MFA/app login/read/editor/logout/relogin,
proxy session401, direct admin403, cross-origin/same-site proxy404, no credential/header
leak, public media/read/CORS/customer controls and12anonymous alias probes pass.
Client354/server413/gateway6/helper21 (794unique), builds, audit0 and current-head
PR45-48 Quality pass; startup/preflight26matching/nonepending. Same DB, normal auth
sessions only, no business-data/schema/provider transaction change. Actual Safari/
mobile, production upload saves and unrelated launch acceptance remain manual. See
[final checkpoint](work-checkpoints/2026-10-25-vercel-admin-separation.md).

Local routing/artifact, proxy/header/cookie, image-transport and backend-gateway tests
are distinct from live acceptance. Require All Deployments Vercel Authentication,
successful staff app sign-in/read/logout, direct Railway/legacy bypass denial,
gateway-only session denial, no credential in browser artifacts/responses, retained
public/customer behavior, exact source/deployment identity and no pending migration
before cutover. Preview must not inherit production gateway access. See
[hosting design](architecture/admin-hosting.md) and
[active checkpoint](work-checkpoints/2026-10-25-vercel-admin-separation.md).

## Recovery And Footer Storage Information (2026-10-25)

Production release #43 is verified on both existing providers for main4930ee4: VercelREADY/RailwaySUCCESS, startup/preflight26matching/none pending/zero error lines, public health/catalog/eight products/exact-origin CORS/anonymous wishlist guard, new image and live recovery/footer/monogram/metadata cleanup/bag focus checks pass. [Final evidence and residual risks](work-checkpoints/2026-10-25-error-pages-storage.md#final-production-verification) supersede older local-only notes below. Actual offline browser/service-worker shell and real-device/provider/legal acceptance are not claimed.

Latest continuation: full client suites pass 314 (11/297/6), client build passes 2,345 modules. Centered prominent 404, stable five-state recovery copy/actions, offline classification and safe order-help are covered, including private-diagnostic/second-payment omission. The monogram now fills App route space behind transparent public/account shells and extends to checkout/confirmation. Desktop browser checks at 1910 px pass public pages and all eight settled account tabs, footer gap 0 or subpixel rounding -1 px and no horizontal overflow. Fresh read-only Railway preflight: 26 complete matching migrations, none pending. Source follow-up review finds no concrete blocker. Scoped scan: 46 paths, nine Markdown documents/212 local references, 15 JS syntax checks, no configured-secret/credential-pattern findings. Server/schema/helper code is unchanged from the prior successful build/393/21 checks. Hosted source publication and exact-SHA deployment verification are next; this is not device/provider/launch acceptance.

Follow-up release gate: new 1200x900 illustrative Labrador recovery asset plus shared viewport/footer frame pass client build (2,345 modules), all 308 client tests (11/291/6), server build/393 tests and 21 helper checks. Added seven shell/frame contracts and five actual payment-setup lifecycle cases with mocked SDK/renderer: preview never loads, card/wallet mounts after resolution without intent/order submission, cleanup and late-unmount guards. An initial SSR fixture failure was the development-panel mock's browser dependency/module marker; corrected the fixture, not production behavior, and reran successfully. Actual normal local browser verifies new image decoded and footer ends exactly at viewport on short 404, then at document bottom on Home/Story/Cookies/account/sign-in/missing-campaign, no overflow at observed 858 px. Source/image independent follow-up review finds no code blocker; no real payment/provider acceptance is inferred. Owner explicitly asks to deploy after these checks; [checkpoint](work-checkpoints/2026-10-25-error-pages-storage.md) records guarded publication and actual hosting status.

Client build passes 2,344 modules; full client suites pass 296 (11/279/6). Actual application router tests preserve known/auth paths and send unknown URLs to the missing-page view. Shared recovery tests cover real image/actions/private-query omission and metadata recovery/unmount without changing existing robots tags. Campaign contract tests preserve JSON404/HTML502 status, distinguish not-found from transient failures, reject stale responses and recover on retry. Stripe's mocked pure loader does not initialize on import, shares a requested instance, handles missing configuration and retries a rejected initialization. No real payment or live SDK acceptance is inferred.

Local browser: missing-page focus/noindex, safe labels, footer information/navigation, normal Home metadata restoration, unchanged bag count, no floating storage notice or Stripe script/iframe on ordinary routes, no overflow at observed 858 px. Isolated read-only fixture: HTML503 -> safe unavailable page -> one Try again -> actual campaign renderer with error metadata removed, no diagnostic marker/overflow at observed 575 px. Fixtures stopped; normal dev servers/session untouched. Scoped independent review reports no code blocker. Server/schema/DB/providers/deployment unchanged. Exact scope, remaining device/legal/provider gates, static SPA200 caveat and current source status: [checkpoint](work-checkpoints/2026-10-25-error-pages-storage.md).

## Account Organization And Wishlist (2026-10-25)

Live visual follow-up adds a rendered-card overlay regression: final client count is 265 (11/248/6), client build still passes. All eight real local card overlays compute absolute outside flow, their inner error anchors remain relative, and top/right bounds stay inside the card without image spacing. This supersedes the earlier 264 count below. Deployment/browser evidence is recorded chronologically in the linked checkpoint.

Both builds pass (client 2,343 modules; Prisma 6.16.2). Full suites: 264 client (11/247/6), 393 server (28/359/6), plus 21 Git/security helper fixtures. Coverage includes 62 wishlist server cases, account ownership/strict input/no-store/idempotence/cap/transaction/schema contracts; stale and cross-account client responses, concurrent refresh/mutation acknowledgement, safe errors; actual compiled-template photo rejection/dismissal/retained-photo and privacy focus handlers; grouped nav/shared monogram; selected-variant bag increments during catalog loading/fresh zero stock and test purchase rejection. Policy pages now use the established variant helpers too: made-to-order/preorder increases survive JSON's Infinity-to-null storage conversion. The component fixture renderer is not real-device browser proof.

Real loopback PostgreSQL fixtures verify persistence, original date under duplicate concurrent saves, foreign-customer list/delete isolation, hidden-product rejection, concurrent 100-item cap and user/product cascades; all synthetic rows cleaned. Approved local/Railway migration follows full decoded private backups and confirms 26 matching complete migrations, none pending, validated relationships and prior records preserved. No shared fixture or real customer pet/wishlist save.

Isolated actual browser/API/DB on 127.0.0.1 uses a disposable fixture customer/product/pet and blocks external backend HTTP. Checks pass: save from real catalog, persisted wishlist after refresh, remove/empty/focus, 18 oz/$39.99 Quick View and disabled test purchase, oversized photo -> dismiss -> retained draft Save, privacy Keep details focus, all eight account destinations with monogram/no page overflow at observed 834 px width, overview pack card. No captured application errors. Screenshots inspected; this is not 320/390 or actual Safari/touch/screen-reader acceptance. Private evidence/cleanup/current release state: [checkpoint](work-checkpoints/2026-10-24-account-wishlist.md).

## Optional Pet Weight (2026-10-23)

Both builds/Prisma 6.16.2 generation pass; complete client suites 238 (11/221/6), server 331 (28/297/6). Canonical/generated unit rules, decimal parsing, empty/invalid input, bounds, exact-gram preservation through rounded lb/kg displays, paired input/strict DTO and server-owned measurement dates are covered. Guarded real loopback fixtures verify persistence, ownership, old-client omission, unit-only date/no-op preservation, actual update timestamp, clearing/optional values, six native DB check failures, real audit-failure rollback and User cascade. Temporary users are removed; no provider calls.

Eighteen isolated Chrome scenarios at 1440/768/390/320 pass, including four new weight save/reopen/repeated unit conversion/clear/error-tint/focus checks and the fourteen prior photo-led regressions. No page errors, unexpected API/write or failed network requests. Recorded console errors are only deliberate failed fixture responses (6) and intentionally blocked CDN integrity checks (22); external providers are stubbed/denied. Forty screenshots were captured; representative desktop/narrow editor/card/error views inspected. Corrected a lingering weight-error summary after input correction and verified the correction.

Owner-approved local/Railway migrations followed fresh full private custom backups, SHA/freshness/history/target checks and full archive decode. Both now have 25 matching complete migrations, none pending, validated weight constraint, all prior business/account/pet/photo/event record projections preserved and new fields initially null. Actual local Railway-target account loads existing pets and the optional field after regenerating/reloading the server; read-only editor close and refresh preserve the account. No real pet weight save, remote fixture, source commit/push/merge or website deployment. Manual Safari/touch/screen-reader, privacy/retention and combined-source release gates remain. Exact evidence and recovery: [checkpoint](work-checkpoints/2026-10-23-pet-weight.md).

## Connected Photo-Led Pets (2026-10-23)

Both builds pass (client 2338 modules; server Prisma Client 6.16.2 generation). Complete suites: 225 client tests (11/208/6), 314 server tests (28/280/6). Schema validation, scoped syntax and canonical/generated catalogue parity pass. Tests cover canonical IDs/mix, optional inputs, calendar pairing/immutable birthday, legacy/omitted richer-field compatibility, multi-purpose arrays, archive limits, raw bounded private photo content/ownership/headers, minimal audit events, transaction delegates/retries and safe non-JSON failure handling.

Independent isolated Chrome fixture QA at 1440/768/390/320 caught long nickname/editor overflow, archive keyboard focus loss and tablet monogram overflow. All were fixed; the subsequent 14 scenarios pass, including birthday re-confirmation after date change, private photo save/partial-failure retry without duplicate pet, photo removal, archive/restore, privacy confirmation, ten-profile cap including archives, loading/error/empty states, reduced motion and retained bag/session. No page errors, unmocked APIs or unexpected writes. Deliberate failed fixture responses and blocked CDN integrity checks are recorded separately, not certified clean provider networking. Screenshots are inspected; final visual-polish refresh is recorded in the [checkpoint](work-checkpoints/2026-10-23-connected-photo-led-pets.md).

Real guarded loopback checks pass persistence/ownership/immutable birthday/legacy preservation/archive, normalized private-photo HTTP with 401/404/413/415 and private/no-store/nosniff, five actual audit-failure rollbacks, removal/re-add chronology, concurrent cap including archives and User cascade including photos/events. Temporary users/rows removed; no provider call. With owner approval, full decoded private backups preceded local/Railway migration: 24 matching complete histories, no pending and old Product/Order/User/Pet values preserved. No remote fixtures. Actual signed-in local page targeting Railway loads the prior pet, opens direct Edit/Cancel without writes and survives refresh; captured refreshed errors zero.

Remaining: actual owner private-photo write acceptance, real Safari/touch/screen-reader/password manager, retention/disposal/access/privacy approval and review of the complete dirty auth/Pet release. Database migration is not website deployment; no commit/push/merge/deployment, payment, email or active incentive. Do not rerun shared fixtures or treat sample-browser state as real customer data.

## Pet Activity And Account Theme (2026-10-23)

Local checks pass: server build/Prisma 6.16.2 generation, 248 server tests, client build (2330 modules)/212 tests, and syntax checks for both changed Pet runtime modules. Activity mapping/repository/HTTP fixtures cover session-owned timestamps and actors, field-name-only metadata, foreign ownership, no-op edits, removal/re-add chronology, bounded Serializable retries and audit-failure rollback contracts. Distinct root/transaction delegates now catch writes outside the transaction, addressing the independent review's test gap. HTTP rollback is simulated; this is not proof of real PostgreSQL rollback/concurrency or account-erasure behavior.

The disconnected photo-led Pets preview passes checks at 1024/736/390/320 px with no overflow, page/console errors or application requests. Account palette values, direct Edit, simple birthday row, breed/mix choices, optional multiple purposes, photo selection, archive/restore and safe state restoration are covered. Desktop/mobile screenshots were visually inspected. The rich photo/breed/birthday/archive/multiple-purpose UI remains a concept, not new connected storage.

No schema/migration, shared DB write/status query, real provider send, commit/push or deployment occurred. Before rollout, verify actual transactional persistence/concurrency/cascades on an approved isolated target, approve audit retention/disposal/access and effective privacy wording, and complete the existing combined-source, Safari/touch/screen-reader and launch gates. See [checkpoint](work-checkpoints/2026-10-23-pet-activity-and-account-theme.md).

## Customer Form Refinement And Pets (2026-10-21)

Local checks pass: client build (2330 modules)/212 tests, server build/Prisma 6.16.2 generation/230 tests. Real installed-engine fixtures verify explicit 8..128 password bounds before storage, Unicode/single Full name preservation, private hashed credentials and correct/wrong password verification. No new migration or provider configuration in this follow-up; the earlier approved Pet migration/backup/status is recorded in the [checkpoint](work-checkpoints/2026-10-20-customer-auth-experience.md).

Isolated Chrome checks at 1440/390/320 cover twelve centered views, untouched/blur/submit errors, first-invalid-input focus and linked correction, red rejected-credential inputs, soft red/green computed input backgrounds, password visibility/matching, reviewed signup/checkout return/bag retention, protected Pets route/mobile navigation, fixture Pet CRUD and private reset-proof URL cleanup. No page errors or unmocked API writes; intercepted fixtures do not prove live provider delivery or real customer persistence. A real local persistence/API probe from the earlier milestone is separate evidence. Screenshots were visually inspected; browser automation initially exposed a missed submit click due to blur-error layout movement, fixed with reserved feedback space and successfully rerun.

Before release: review the combined task diff and matching CI/source, real Safari/phone/keyboard/screen-reader and actual password-manager behavior. Live security email requires an approved inbox/budget; no real email, payment or shared-data write occurred in this follow-up. Existing split-site cookie limitations, consent history/retention/deletion and launch gates remain. Do not treat green field tint as proof of email ownership or password strength.

## Prelaunch Foundation (2026-10-20)

Client build passes (2,314 modules); all 170 tests across 32 files pass, including 12 policy/storage/metadata cases. Server build generates Prisma 6.16.2; all 143 tests across 35 files pass. Seven isolated Git-helper fixtures cover clean unpublished branches, dirty paths, protected branches, divergence, detached/missing baseline, sensitive filenames and failed fresh audit. Actual preflight --fetch --check correctly exits 1 on this task's intentionally dirty work, not a false clean certificate. No env example files were added.

Local browser: all six draft pages render/navigate, no desktop overflow at actual 1,024 px, policy title/noindex metadata changes, signed-in header and existing two-item bag remain, and production-preview storage notice dismisses and stays dismissed after reload. No captured application errors; existing Stripe-over-HTTP warning remains. The requested 390 px viewport override still reported 1,024 px, including after reload: narrow/device behavior is not certified. Real phone/Safari/keyboard/screen-reader and hosted CI/custom-agent invocation remain manual. No signup, payment, email, DB write or deployment was tested. Full evidence/commands and policy/launch limits: [checkpoint](work-checkpoints/2026-10-20-prelaunch-foundation.md).

## Routing/Customer Session Repair (2026-10-18)

Read-only local/Railway inspection confirms the investigated customer exists with credential accounts and the new active product is returned by local/Railway APIs. Published main-shop eight-ID selection, not missing DB data, excluded it. Deployed login preflight 204/login 200/session 200/profile 401 and installed cookie defaults identify the customer session issue. Session response 200 alone is not auth proof.

Focused regressions cover main-shop inclusion/Featured order, explicit sorting/search, extra curation, private/upcoming guards; backend-confirmed/unknown/unreachable development targets; production diagnostic suppression and safe DB failures; real installed engine local/production cookie flags, retained origin checks, customer-only roles/token sanitation/revocation; null/failed/stale client session reads. Exact complete-suite/build/browser evidence: [checkpoint](work-checkpoints/2026-10-18-data-routing-and-customer-session.md).

Owner follow-up: actual local customer sign-in reached the protected `/account` workspace and survived a full page refresh; Sign out remained available, the backend-confirmed target remained RAILWAY_DB and captured browser errors were empty. No password/token/contact data was inspected, no logout was performed and no fresh account was created. This closes local form acceptance only, not deployed cross-site Chrome/Safari or extended expiry testing.

Manual: verify server dev:local + client dev:local reports LOCAL, then stop/restart server dev:railway with same client and confirm RAILWAY DB; refresh shop and verify newly created active products; check extra curated sections/filters and test-product rejection. On the matching deployed repair, verify Chrome sign-in/session/profile/logout/reload and Safari separately. No password reset, new account, Stripe payment, provider send or database mutation is authorized by diagnostics.

## Storybook And Impact First QA (2026-10-17)

Both builds pass (client Vite 2,305 modules; server Prisma Client 6.16.2 generation). Complete suites pass: 145 client tests/28 files and 139 server tests/34 files. Eight new client cases cover managed single-origin composition, escaped portraits, template/failure states, inert preview navigation, real fixed/percentage/inactive giving, eligible ordering/test guards and editor controls. Three server cases cover legacy portrait defaults, nested allowlists/bounds/URLs and media-library existence before saving. No actual database write or provider request.

Actual local desktop: portrait selection changes photo/story, real configured $2 rule precedes partner content, all three eligible cards load, 18 oz/$39.99 opens actual Quick View at that size/price, and the Home campaign pop-out reuses Impact First. Home retains nine sections/eight products/seven reviews. No failed selected-page images/captured application errors or desktop overflow. At actual CSS width 388 px, both page layouts stack with no heading/page horizontal overflow. Viewport overrides are not real-device certification.

Manual: sign in to Website UI (no active session during this pass), change both portraits/photos and surface colors, use local selector/Cancel, then deliberately verify draft Save/reload/Publish against the approved target. Check Catalog campaign handles, long copy, failed photos, active/paused/ended fixed/percentage campaigns, pop-out focus/scroll, real Safari/phone/reduced-motion/screen-reader, shared bag/auth/search and approved guest/signed-in checkout after reviewed rollout. Backend contract must deploy before the new client saves. No migration/new env variable needed. See [complete evidence and recovery](work-checkpoints/2026-10-17-storybook-impact-first.md).

## Selected Modern Boutique Home QA (2026-10-16)

Local client build passes (2,297 modules); all 137 tests/27 files pass (11/120/6). Thirteen focused SSR/lifecycle cases cover managed care/brand content, actual product ingredients/storage/Quick View, all seven detailed fictional reviews, retained gallery fallback, editor autoplay=false, overflow/visibility gating, eight-second advance, manual wrap/Pause, focus/hover/hidden tab/reduced motion, late-loaded tracks, resize and cleanup. No new lint script or server/Prisma run is required.

Actual local browser retains nine sections/eight products, loaded care/brand/review images and no application error entries. Manual review navigation/Pause and the ingredient action opening actual 6 oz/$14.99 Quick View work. Responsive DOM checks at actual widths 2149/846/582/388 show no horizontal page overflow; two 544 px cards fit a 1,112 px wide track and one 352 px card fits the narrow track. Selected-section descendants stay within the 388 px viewport. Viewport override screenshots were blank on narrow captures despite valid DOM; normal restored captures show the actual page. Do not claim real-phone painting/Safari/accessibility certification from those geometry checks.

Manual next checks: compare only the three approved layouts; check long edited text, replacement imagery and custom background overrides; swipe/keyboard/Previous/Next/Pause/Play, screen reader and OS reduced motion; inspect the narrow Website UI canvas and confirm inert/no-rotation behavior and explicit Save/Publish boundaries. All review examples remain fictional. No DB publication, deployment, provider send or payment occurred. See [proof and recovery](work-checkpoints/2026-10-16-boutique-home-sections.md).

## Approved Storefront Integration (2026-10-15)

The design is now connected application code, not only an HTML preview. Exact commands/results and release IDs are in the latest handoff. Client build and all 115 tests pass; server build/Prisma 6.16.2 generation and all 136 tests pass. Server syntax checks cover 173 JavaScript files. New regressions cover gallery validation/max-four, protected image PATCH, stale updates, presentation allowlists/legacy announcements, rotation lifecycle and test-product checkout rejection.

Browser checks exercised local admin -> local backend -> approved Railway DB, real gallery reorder/save/restore, static preview edit/Cancel, popup size/image retention, 6 oz/18 oz distinct cart rows and shared cart across Brand navigation. Temporary cart additions and gallery reordering were restored. No real payment or provider action occurred.

Final live rollout passed: Vercel Home/Brand/Campaign/admin-editor/checkout direct routes return 200; a nonexistent Vercel `/api` route stays 404 rather than receiving index.html. Railway public catalog/content/campaign reads return 200 with the exact storefront CORS origin and credential support; anonymous auth/me returns the expected 401. All 25 public testing-product image references and the uploaded campaign image respond 200. Live desktop Home/Brand/Campaign had no failed images or horizontal overflow; final public browser warning/error log read returned no entries. The Website UI reversible draft test persisted across reload, was restored without publishing, and now has draft equal to publication at revision 3. Migration/checksum reads confirm 22 completed and no pending migrations on Railway. Deployment IDs are in the handoff.

Manual release acceptance: inspect Home/Campaign/Brand on actual desktop/mobile/Safari; check all original sections, selected size prices, compact cards, five popup photographs, green eligible cards, pause/manual announcement controls, compact shared footer and monogram. In Website UI confirm draft/reload versus explicit publication and read-only business facts. In Products check zero through four gallery slots, upload/error/Cancel and stale-save handling. Test products must stay unavailable even if their stock or selling mode changes. Do not mistake fictional review/partner templates for real proof.

Browser viewport overrides did not consistently match the requested CSS viewport in this integration session. Historical mockup mobile evidence is not proof of current 320/390-pixel app behavior; actual narrow-device acceptance remains required. Full accessibility, reduced-motion OS settings, live Stripe guest/signed-in checkout and Safari cross-site auth are not certified by these unit/local checks.

## Receipt First And Manual Order Email QA (2026-10-10)

Latest exact commands/results live in [handoff](../PROJECT_HANDOFF.md). Existing test suites cover DB-resolved selected-size prices/SKUs, quantities/drafts/overselling, proof expiry/forgery/reference/owner binding, conditional stock transaction, reviewed signup/session retry, once-only wallet payment executor, server promo email invalidation, template escaping/revision/status/tracking/actor/stale/confirmation/recipient gates and provider no-send/dedup. This is not live Stripe/Resend or concurrency/load certification.

Actual guarded local HTTP checked temporary 10%/one-per-email/expired/invalid promo, normalized email, DB subtotal rather than spoofed values, campaign plus promo giving, and invalid-promo rejection before Stripe PaymentIntent creation. Only disposable promo/usage fixtures were removed. A real local rolled-back Prisma transaction checked limited versus made-to-order inventory/order writes without residual products/orders.

Actual local browser: existing customer sign-in stayed on checkout, retained the 6 oz bag and safe profile prefill; reviewed signup fields visible but no real new account; mobile-visible submit, actual owned Soft Essentials receipt, template save/reload/unsaved preview/cancel, real-order preparing preview and deliberate MOCKED dry run with live-send unchecked. No email/payment/label sent. Website commerce fields/toggles/confirmation copy/palette previewed and restored without Publish. These checks used the observed narrow in-app browser and wide/390px embedded previews; full actual desktop/mobile/Safari remains required.

Final cost-summary refinement: live checkout retained one 6 oz item at $14.99, shipping $5.99, estimated tax $1.99 and total $22.97. Giving $3.00 appears in a separate emerald/shadow card below the entire summary; no Donation generated row or plus/equal markers remain. Automated checkout/receipt/email tests prove that positive giving does not enter the billing rows, zero giving is hidden, names are deduplicated/escaped, publication metadata cannot change amounts/beneficiaries, private/unknown campaigns have no pop-out action, and promo subtraction still displays. An intermediate dev hot-reload complained about a not-yet-synchronized canonical export; completing both sync/builds and refreshing resolved it. This is not a production build failure.

Shipping tests cover labeled postal autofill, optional apartment persistence, Canada province input, complete/incomplete review, retained values and review/Edit focus. The live incomplete form correctly disables **Use this address**; no fake recipient or address was inserted to force browser review. Complete postal review/Edit is unit/SSR verified and remains a real-device manual check. The live secure action initially appeared enabled because an empty-string readiness was cast by a Boolean prop; explicit Boolean readiness fixes it. Regression tests check the actual coordinator plus yellow ready styling, disabled/processing states and inert shared admin sample. Final live incomplete checkout has both review and submit disabled; no payment was attempted.

Before deployment:

1. Check existing auth, admin tools/data routing, home variants/quick view and cart drawer. Add 6 oz and 18 oz; verify name/size/quantity/unit/line price and item borders. Restore only QA bag additions.
2. With a reviewed published campaign page, open the same campaign pop-out from catalog/bag/checkout/confirmation. Test Escape/backdrop/focus return/nested drawer and retained checkout. Current local contributing campaign has its public page disabled; end-to-end published-popup QA remains open, not a reason to silently publish it.
3. Guest: email before promo, normalized email, one-per-email/invalid/expired; email-change invalidation, promo+campaign totals/giving, mobile submit and unavailable-wallet fallback. Create account -> review -> edit/confirm -> session -> same bag/form. Real signup is a user-controlled check because essential account email may be enabled.
4. On HTTPS with registered Stripe domain and supported devices, independently disable/enable each admin wallet setting via draft/Publish. Run approved Stripe test card/Apple Pay/Google Pay payments, required authentication, rate/price refresh and post-payment network retry. Confirm one order/decrement/redemption/attribution and customer-owned account history. Never charge again when payment completed but finalization failed.
5. Anonymous receipt reference alone/another reference/expired proof must not reveal PII. Guest same-tab refresh with proof works; signed-in owner works; non-owner fails. Confirm no proof/client secret/PII logging or URL leakage. Document guest expired-link recovery limitation.
6. Templates: save/edit/reload/archive/reactivate, failed-save retention, concurrent revision 409, unknown placeholder rejection, long copy, actual received/preparing/shipped/delivered/cancelled status gates. Shipped must have tracking. Sample/unsaved/stale/wrong-actor preview cannot send.
7. Orders: Preview -> review checkbox -> default dry run -> MOCKED activity; repeated identical action must not send twice. Save status/tracking and verify no automatic email. Account verification/reset remains separate. Only after explicit approval/inbox/budget, enable live and send one approved email; check Resend and actual clients. SENT is acceptance, not proof of delivery. Review FAILED/pending provider state before any retry.
8. Confirm local migration status 21 and generated Prisma 6.16.2; review additive EmailTemplate SQL. Railway content/media/email migration requires explicit approval/target/backup/preflight. Coordinate matching frontend/backend and stale/in-flight checkouts because old clients lack the new payment proof. No casual Railway restart/deploy (`start` migrates).

9. Shipping: browser autofill/long fields, optional apartment, complete postal review/Edit/Tab focus, US and Canada labels, retained guest/signed-in edits, narrow screens and configured destination/rate coverage. No verified/deliverable badge; Stripe Address Element is not part of this release. Check ready yellow, incomplete disabled and processing secure action without accidental double submit. Check the same action inside the inert admin preview.

No automated test may send real customer email or buy a label. Existing critical/high dependency advisories, post-payment price/stock/rate changes, separate promo/campaign persistence/concurrent limits, receipt recovery, provider retry/reconciliation, full accessibility and real-device wallets remain open. See [architecture](architecture/checkout-and-order-email.md).

Use this guide for repair passes, launch-readiness work, provider verification, docs verification, migrations, and final reporting.

## Repair And Launch-Readiness Passes

When asked to fix anything broken, repair the project, audit issues, make sure everything works, or perform launch readiness cleanup, treat the task as a verified repair pass, not a cosmetic refactor.

Prioritize:

1. Production data safety.
2. Payment and checkout correctness.
3. Order creation correctness.
4. Admin authorization and protected routes.
5. Customer ownership checks.
6. Client/server/API mismatches.
7. Database/schema/repository mismatches.
8. Broken imports or build failures.
9. Environment/deployment mismatches.
10. Dead duplicate checkout/payment code.
11. Documentation accuracy.

Launch-critical risks:

- Stripe PaymentIntent amount must be based on trusted server-side pricing.
- Checkout preview, PaymentIntent creation, and order creation must use consistent server-owned totals.
- Shipping, tax, discount, donation, and final total cannot be client-spoofed.
- Order creation must be idempotent.
- Inventory must only be reduced after successful verified payment and only once.
- Promo and campaign usage must not be double-counted or client-spoofed.
- Admin endpoints must require admin auth.
- Customer-owned endpoints must enforce ownership.
- Production startup must never delete, reset, or reseed live data.
- Prisma schema fields must match repository/service code.

## Interrupted Work

If a previous run ended because of credits, rate limits, timeout, interruption, or an inconsistent checklist:

- Do not assume the prior summary is correct.
- Treat local edits as draft repair changes until verified.
- Run `git status`, `git diff --stat`, and `git diff --name-status`.
- Identify whether the prior pass completed every claimed step.
- Reconcile mismatches between checklist, final report, handoff, and actual files.

## Required Verification By Change Type

### Prisma Package Updates

Keep prisma and @prisma/client on the same exact reviewed version; updating only the runtime can break generation and every server import. Check npm ls, regenerate explicitly, run server build/tests and confirm the actual app imports. The existing tier3 suite includes [toolchain regression tests](../server/tests/tier3/utils/prisma-toolchain.test.js) for manifest/lock/installed/generated consistency and the real singleton import without a database query.

Use a target-confirmed read-only migration status check when appropriate, not npm start: startup runs migration deployment. The 2026-10-13 compatibility repair passed 128 server tests, 167 syntax checks, local 21-migration status and local read-only API/anonymous guard checks. No schema, data, auth credentials or provider actions changed. See the [repair checkpoint](../PROJECT_HANDOFF.md#2026-10-13-partial-prisma-upgrade-compatibility-repair). Prisma tooling advisories remain unresolved; do not claim a downgrade/alignment is a security upgrade or apply audit fix --force without reviewed compatibility work.

Client changes:

- Run `npm run build` in `client/`.
- Run available client tests.
- Run available lint only if a script exists.

Server changes:

- Run `npm run build` or targeted syntax/import checks in `server/`.
- Run available server tests.
- Run available lint only if a script exists.

Prisma changes:

- Run `npx prisma generate`.
- Run local migration/status checks appropriate to the change.
- Do not apply Railway/production migrations unless explicitly asked.

Docs-only changes:

- Do not run client/server builds unless code files changed.
- Verify Markdown links where practical.
- Verify code fences.
- Verify Mermaid fences if touched.
- Run Markdown lint only if the repository already has a configured command.
- Run `git diff --check`.

## Manual QA Checklist Areas

Choose checks specific to the touched area:

- Storefront product browsing.
- Product quick view.
- Product card add to cart.
- Featured product add to cart.
- Cart drawer updates.
- Checkout preview.
- Promo validation.
- Campaign donation preview.
- Stripe payment intent flow.
- Order creation.
- Order success page.
- Admin product create/edit/delete.
- Admin promo create/edit/test/analytics.
- Admin campaign create/edit/status display.
- Admin order dashboard and order detail.
- Admin customers, notifications, shipments, and reports when touched.
- Customer account sign-in/create/reset/profile/orders.
- Notification preference updates.
- Resend email dry-run or real send when explicitly requested.
- Shippo rate/tracking dry-run/provider-disabled behavior and admin/customer display when implemented.

Always document what was manually verified, what was only code-reviewed, and what remains unverified.

## Calm Workspace Admin QA

The 2026-10-08 connected admin UI was checked with fixture-intercepted browser APIs at 1440, 1024, 768, 390, and 320 px. This is not a live DB/provider or Safari verification.

- Check all eleven sidebar tabs, active route, one shared header, signed-in identity, read-only target badge, mobile open/close, and direct order/customer routes.
- Products: search by SKU/category/status, create/edit/cancel/save, separate 6 oz/18 oz prices/stock, all content/analysis fields, selling modes, and real threshold alerts.
- Promos: required tester email, lowercase/trim, input-change invalidation, create/edit/type/limits/schedule, cancel, analytics/redemptions/order links.
- Campaigns: beneficiary, product selection, donation rule, schedule, cancel/save, generated-impact/order links. Do not call attribution a payout.
- Orders: refunded status visibility, reference/customer search, next status staged without writes, Save/Cancel/history, tracking save/refresh, and separate explicit email action.
- Customers: linked and verified-email guest orders, account status, deactivate/reactivate confirmation, verification/reset requests and provider history.
- Order issues: selected case after filtering, explicit status/priority/resolution saves, retained draft on failure, internal notes versus account replies, no automatic email, real event history.
- Internal issues: safe context, severity/status/notes, Save/Cancel, retained draft on failure, event history.
- Shipments/Notifications/Reports: filters, failure/empty/loading states, mock-versus-real deliveries, provider status, truthful all-time totals, disabled/unconnected future tools.
- Verify temporary modes with the existing commands: fully local backend or Railway DB backend, paired with local client. Confirm the backend badge and network target before any real write.
- Recheck real guest/signed-in checkout, variant cart prices, promos/campaigns, order success, and customer ownership before deployment.

No automated check may send a real customer email, buy a label, or mutate Railway. Use approved test data and explicit provider approval for live QA. Full command results, known failures fixed, dependency audit findings, and migration caveats are in [PROJECT_HANDOFF.md](../PROJECT_HANDOFF.md).

## Calm Workspace Investigation QA

- Confirm actionable account/admin controls have resting gray borders/backgrounds, visible hover/focus, working disabled states, and no horizontal overflow at 320/390/768/1024/1440 px. Static stats/placeholders must not imply click behavior.
- Orders: verify Standard/Gold/Platinum/Diamond/Gem boundaries, labels, row accents, amount/badge colors; these are order-value tiers, not customer loyalty.
- Order detail: inspect saved timestamps/IDs/items/usage/shipment/history/delivery/support data. Save a permitted test status/tracking change and ensure the protected read refreshes the inspector. If GET fails after Save, do not retry the completed write blindly.
- Configure a Stripe payments base using an approved account; verify dynamic `pi_` IDs, test/live labeling, Save/Cancel/reload persistence, invalid-host rejection, missing ID behavior, and the correct Stripe account after opening the link. Do not use API keys/client secrets as link settings.
- Customers: same-name records must remain distinguishable by full email/ID. Search by ID, click a non-name cell, Tab/Enter the real link, and confirm the correct customer. Selecting email/ID text should not navigate.
- Confirm customer account pages never show internal record inspectors or Stripe IDs. Confirm unauthenticated/customer-only sessions receive 401 on admin detail endpoints. No credentials/token/raw provider metadata may be returned.
- Real database persistence, Safari/private-storage behavior, and authenticated Stripe dashboard navigation remain manual checks; browser fixtures do not establish those results.

## Calm Giving QA

Automated tests cover deterministic active variant ordering, zero-price handling, selected-size cart payloads, campaign payload/ISO precision, public field allowlisting, active windows/featured priority, stable slugs, invalid publication content/URLs/dates/rules, and unauthenticated public versus admin routes.

Fixture browser checks exercise home/campaign/editor at 1440/1280/1024/768/390/320 widths, all homepage areas, 6 oz/18 oz add-to-cart and quick view, stable featured content, non-clickable featured image/title, retained cart into a stubbed checkout preview, mobile navigation, account hover buffer, same public/editor typography/colors, explicit Save/Cancel, failed-save draft retention, unavailable/paused campaigns, and campaign hero images. Existing eleven-tab admin, seven-tab account, and internal-record regression harnesses also run with intercepted APIs. These are not live session/payment/provider tests.

Manual next checks:

1. Restart the chosen local backend mode, confirm the data-target badge and network origin, then use approved test data. Never switch DB target in the running UI.
2. Enable a reviewed campaign page with introduction, beneficiary, optional story/image/HTTPS link, and required image description. Save/reload every field and inspect the public route on actual desktop/mobile/Safari.
3. Check Draft/Archived privacy, disabled page with continued eligible giving, Active schedule boundaries, Paused/Ended wording, stable link after rename, and multiple matched campaigns. Confirm generated contribution is not described as paid out.
4. Check real product imagery/ingredients/storage, 6 oz/18 oz price/availability/cart/checkout, product filter choices, featured behavior, Next Drops, every retained section, keyboard focus and reduced motion. Approve actual brand/product assets and verified review content separately.
5. Run one approved Stripe test checkout as guest and signed-in, including promo plus eligible campaign. Verify server totals, a single order, once-only inventory/usage, success page, and account ownership. No live payment is required.
6. Deploy reviewed server then matching frontend, check direct `/campaigns/:slug` route on Vercel and public API on deployed Railway. Migration completion alone does not deploy application code.

Campaign schema migration was explicitly approved and applied to Railway in this phase, after preflight; automated browser/tests did not write Railway business records. No real emails, labels, or payments were performed. See the latest [handoff](../PROJECT_HANDOFF.md) section for commands and precise results.

## Homepage And Brand Follow-Up QA

Automated checks use the actual Vue section components in SSR tests plus isolated browser fixture APIs. They verify hero escaping/actions and actual featured-product content, upcoming loading/error/empty/product branches, safe social destinations, both cart variants, persisted cart/search across the brand route, stubbed checkout preview, all nine home anchors, footer links/placeholders, image-error fallbacks, mobile navigation, and header auth state. Existing campaign/editor/variant regression checks are rerun. No real email/payment/subscription/customer/DB mutation occurs.

Manual next checks:

1. Compare the approved photo-led hero with its neutral gray tint, footer, generous seasonal cards, and all retained home sections on actual desktop/mobile/Safari. The baseline preview was approved; real-device visual/content QA remains separate.
2. Click hero shopping/ingredient/story links, desktop/mobile Meet the Brand, footer story link, and upcoming Preview. Confirm targets match the actual featured product and notices do not offer purchase/subscription before launch.
3. Add 6 oz/18 oz, navigate home -> story -> shop -> checkout, and confirm selected prices/cart/preview remain correct. Recheck signed-in header and the actual Safari session separately.
4. Review the preserved short brand narrative; replace illustrative portraits with real approved photos and test image-failure states. Do not present template photos as actual Chase/Evie or customer proof.
5. Confirm approved Instagram destination/new-tab behavior. TikTok/YouTube placeholders must not jump to `#` or pretend to have real profiles. Optional public social variables need a new Vite build after changes.
6. After reviewed deployment, load `/meet-chase-evie` directly on Vercel and run one approved guest/signed-in Stripe test checkout with promo plus campaign. This UI follow-up requires no new migration or backend variables.

Exact commands/results and remaining deployment risks are in the latest [handoff](../PROJECT_HANDOFF.md). Standard Stripe local-HTTP development warnings are recorded separately from actual Vue/runtime errors.

### Approved Baseline And Cart Regression Checks

- Client SSR tests verify actual selected-size/unit/line prices, SKU and unique action labels, disabled inventory-limit increase, the separate `/checkout` link, labelled open dialog/inert closed drawer, and honestly identified gallery templates.
- Isolated dialog tests cover scroll locking/restoration, initial/opener focus, Tab in both directions, hidden-control exclusion, outside focus containment, Escape, removal focus recovery, and unmount cleanup. These are not full browser accessibility certification.
- Local browser QA should check all nine home anchors and actual 6 oz/18 oz prices/availability, featured Add to Cart, Quick View handoff, quantity/removal, close/backdrop/Continue Shopping, desktop 420 px and mobile full-width drawer, short-height landscape footer scrolling, retained bag across story/account routes, and short-screen hero content. Never clear a user's saved bag for QA; restore only temporary items/quantities added by the check.
- Recheck campaign-green cards with an eligible campaign, signed-in customer headers, Safari touch/keyboard behavior, screen readers/reduced motion, and approved guest/signed-in Stripe test checkout after reviewed deployment. Local UI checks and unit tests do not establish those live results. No provider sends, real payments, DB writes, or migrations are required by this styling pass.

## Visual Product And Website Editor QA

- Confirm Website is reachable as the twelfth tool and existing signed-in/data-routing controls remain. Check local vs Railway DB startup target before writes.
- Products: actual active/draft/upcoming card, edit handles, separate 6 oz/18 oz preview price/availability, every existing content/analysis/variant/publishing field, explicit Save/Cancel and retained failed-save draft. Preview cart/quick view must not perform purchases.
- Website: edit all original sections/header/announcement/footer/links; wide/phone preview; long text/image failure; hide/reorder; add/remove supported banner/story/collection/gallery; existing baseline/defaults still complete.
- Save draft/reload must persist without changing public content. Confirm Publish only after reviewing target/content; inspect the public page after publication. Restore published to draft, Save/Cancel, stale revision 409 and failed-save retention.
- Hidden anchors must disappear from navigation/actions. Search follows a visible collection, curated collections respect filters, and no collection means no dead search control. No raw HTML/script/protected/credential-bearing URL accepted.
- Check all existing home content, campaign green styling, real 6 oz/18 oz and Quick View cart prices, drawer on same route, account/header/footer state, promo/campaign/checkout server totals, and guest/signed-in checkout after deployment.
- Automated tests use mocked persistence/provider boundaries; a local rolled-back PostgreSQL transaction checks real revision/atomic-publish writes. Neither proves Railway or deployed sessions/payments. Check the latest handoff for which UI actions completed and any browser automation interruption.
- Review canonical/generated content parity and both isolated deployment roots. No new env variables or env example files. Migration `20261009010000_storefront_content` needs explicit Railway approval before normal backend deployment, which invokes migration deploy.

See [storefront-editor.md](architecture/storefront-editor.md) for editing boundaries and [handoff](../PROJECT_HANDOFF.md) for results. No real provider sends, payments, Railway mutations, destructive reset or reseed during automated QA.

## Image Library And Seasonal Editor QA

- Confirm backend target before any upload or Publish. Upload stores a public image immediately even when its page draft is canceled; no private/customer files.
- Validate auth rejection before image processing; accept JPEG/PNG/WebP only, declared/decoded match, no SVG/animated/compressed payloads, <=8 MiB /20 MP, optimized <=2 MiB. Verify safe JSON errors, busy/failed/empty states and retained page fields.
- Upload the same image twice: one normalized binary record/URL. Check name/alt/folder Save, library search/24-item paging, thumbnail/dimensions/size/storage, Use this image, Clear, Escape/Tab/focus restoration and mobile overflow.
- Save Draft/reload: media reference persists, public remains unchanged. Explicit Publish/local reload: chosen background appears. Preserve existing user-published sections. Verify a palette overrides original ID CSS and cancel restores it; hero photograph remains separate.
- Check asset renderers in home/hero/footer/gallery/campaign, product card/Quick View, cart, checkout, success and customer/admin order items against configured API origin; never persist local/deployment hosts. Existing HTTPS/templates and image-failure UI must still work.
- Check canonical/generated modules and isolated deployment roots. Local status is 20 migrations after media follow-up. Railway needs explicit preflight/migration/deployment approval; install Sharp Linux optional dependencies, generate/restart backend, then deploy matching frontend. No env examples/secrets.
- Unit/SSR/isolated HTTP tests do not prove production Safari/Linux/CDN/backup recovery, full accessibility, or real payment/provider workflows. Run approved guest/signed-in checkout with promo+campaign after reviewed deployment, not as an automatic image-upload test.

See [media library](architecture/media-library.md) and latest [handoff](../PROJECT_HANDOFF.md) for actual results and remaining manual checks.

## Provider Verification Rules

Do not stop after the first failed provider test.

For failed Resend, Shippo, Better Auth, checkout, notification, tracking, admin, customer account, or deployment verification:

1. Capture the exact error.
2. Identify root cause from code, logs, network responses, database state, provider response, env configuration, or deployment configuration.
3. Fix repository issues when possible.
4. Re-run verification.
5. Repeat until the feature works, an external provider limitation is confirmed, a deployment-only step is required, or user action is required.

Live provider testing rules:

- Requires explicit user approval.
- Do not print, copy, log, or document API key values.
- Check only whether env variable names are present/non-empty.
- Do not send bulk emails or repeated provider requests.
- Use only approved test inboxes.
- Keep Resend tests under the approved email budget.
- Do not purchase labels or create production shipments.

## Documentation Verification

For docs and architecture changes:

- Check every internal Markdown link added or changed.
- Check code fence balance.
- Check Mermaid fence syntax when Mermaid was touched.
- Search for outdated automatic-email language when communications policy changes.
- Search for old Twilio/SMS requirements.
- Search for duplicated product philosophy.
- Search for references to deleted or moved sections.
- Confirm no secret values were copied.

## Final Report Requirements

Final reports should include:

- Files created.
- Files modified.
- Major rules preserved or behavior changed.
- Commands run and exact results.
- What was verified.
- What remains uncertain or externally blocked.
- Manual QA checklist.
- Whether edits are safe for commit review.
- Next recommended phase or prompt when useful.

## Production Audit And Admin Auth QA (2026-10-11)

Exact final results and changed-file manifest live in [handoff](../PROJECT_HANDOFF.md) and the [production audit](audits/2026-10-11-production-audit.md). This pass includes actual Better Auth engine fixtures, local Prisma session/HTTP checks, production-config/body/role/privacy/catalog/transaction contract tests and updated package audits. These are not browser/provider/production certification.

Local admin provisioning is deliberate, not startup automation. Recheck original login -> all thirteen tools -> refresh -> logout -> copied-cookie rejection -> relogin, CUSTOMER denial and target labels. Browser automation was policy-blocked in this audit; desktop/mobile/Safari remain manual. Verify configured production origin/secret/base URL and same-site domain plan before separately approved remote rollout. Do not restore vulnerable signed-session code as rollback.

All architecture Mermaid fences were rendered with the cached official CLI, including supplemental diagram files; old automatic-email arrows were corrected to the manual-send policy. Markdown/fences/local path links and secret-pattern/build scans were rerun. No live provider request, charge, label, shared DB migration or customer-data write is permitted during automated QA.

Unresolved launch gates: closed-browser/redirect/failed-finalization payment recovery, concurrent promo claims and attribution, truthful refund/payment ledger, tax/shipping business validation, Prisma tooling advisories, approved wallet/provider QA, DB backups/restore and monitoring evidence.

## Approved Test Catalog And Appearance Preview (2026-10-14)

The owner explicitly approved additive testing products in the current Railway production environment, because the storefront is still a testing deployment, with `[TEST]` labels and no purchasing. This is not blanket authorization for automated shared-DB mutation, migration, seeding, provider sends or deployment. Eight new records/images cover all five ProductStatus values; inventory-limited zero-stock variants were rejected by the real server resolver, and the actual client helper disables every public variant. Existing catalog/content/customers/orders/promos/campaigns were preserved. A private pre-write backup decoded successfully; no restore drill was performed.

Manual acceptance: refresh deployed catalog/admin; confirm five public test records and three hidden Draft/Archived records, both sizes unavailable, all eight image paths render, existing seven products unchanged and no accidental featured selection. Never add inventory or use made-to-order/preorder for these fixtures. Retire public testing products before real-customer launch; review media references before deletion.

The revised appearance editor is a disconnected design preview, not retained application source. Verified desktop and 320/390 mock layouts, shared header/footer, static label editing/cancel, read-only Product/Campaign fields, expanded navigation, monogram and product pop-out. Full application integration, static publication without DB writes, real-device/Safari/screen-reader acceptance and future Campaign content persistence remain separate work. See the [checkpoint](../PROJECT_HANDOFF.md#2026-10-14-refined-preview-and-approved-railway-test-catalog) for exact commands, results and limitations.

### Subsequent Preview Polish And Optional Galleries

This review round changes no application source or DB data. Check the compact shared footer, fading announcement messages with pause/manual controls, simplified categorized editor selectors, photo-led Made with Care, seven clearly fictional reviews and distinct Home/Campaign/Brand compositions. No review may be represented as verified or published without real approved customer evidence.

In the Catalog Products example, try zero through four optional images, image choice/removal/reorder, Save/Cancel and switching products. The pop-out should omit empty slots, preserve selected size when changing images, show the correct selected price and restore focus on Escape. Desktop has a left rail; mobile has a wrapping horizontal rail. Upload and real persistence remain unconnected, not successful mock API operations. Gallery images must remain Product-owned, never editable as business records through Website UI.

Executed checks and file-size/asset/DOM/timer results are in [the latest checkpoint](../PROJECT_HANDOFF.md#2026-10-14-preview-polish-and-optional-product-galleries). Browser emulation is not real Safari/touch/screen-reader acceptance. Before implementing, approve the visual direction, decide static-publication persistence, review the product gallery contract and replace generated photos/reviews/partner facts before any real-customer publication.

## Full Approved Design Reconciliation (2026-10-15)

The prior preview-only and partial-release statements above are historical. Current source is connected and directly deployed after approval; exact release IDs/results live in [the resumable checkpoint](work-checkpoints/2026-10-15-approved-ui-reconciliation.md). Current automated baselines: client 122/25 files, server 136/34 files, both builds, 173 server syntax files and 14 canonical snapshot comparisons. Read-only Railway preflight: 22 complete migrations/checksums, no pending; seven archived legacy products/seven historical item references retained, eight test products/all sixteen variants rejected. Public image checks cover 40 distinct product/campaign URLs. No payment/provider action occurred.

Manual acceptance: hard-refresh all three pages; verify exactly nine visible Home sections, ordered eight compact test products and three giving cards; no old promise/help band, no old catalog images. Open Quick View, switch 6/18 oz/photos/tabs, close by Escape and verify focus. Open campaign pop-out; confirm configured contribution is not a bill charge. Test compact sign-in/bag/search and mobile menu. Inspect Brand/Campaign complete compositions, small shared footer and announcement Pause. In Website UI confirm same catalog, contextual static controls, no editing in business nav, hidden sections labelled and no business mutation on preview. Existing product gallery Save/Cancel/stale-save coverage remains; do not publish QA text automatically.

Browser checks at actual CSS widths 358/477/582 and wide desktop are useful but not proof of exact 320/390/device Safari, screen-reader or OS reduced-motion behavior. Review templates/fake reviews/fictional partner before real launch. All public catalog items are deliberately unpurchasable testing records; a fresh approved real/test sellable product is needed for end-to-end payment QA. Original launch gates remain open.

### Local Density And Heading Follow-Up

Current local-only client baseline is 123 passing tests in 25 files (11/106/6 by tier) and a successful Vite build. The additional SSR test keeps collection copy/filters together while preserving the separate loading state. Actual read-only browser checks cover wider/shorter cards, 6/18 oz prices and Quick View selection, filters, complete images, and shared Home/Campaign/Brand heading surfaces. Settled CSS widths 388/582/1910 have no horizontal overflow; viewport override dimensions are not exact device emulation. Local HTTP produces the expected Stripe.js HTTPS advisory, not an application error; no payment/provider request was submitted.

Before publishing, visually review the [local iteration](work-checkpoints/2026-10-15-storefront-density.md) on a real phone/Safari, long product titles/copy and a narrow Website UI canvas. Confirm the maximum-column setting adapts without hiding fields and giving remains distinct. No server/Prisma code changed, no server suite or migration ran, and no editor Save/Publish or business write occurred. Previous deployment/launch limitations remain open.

### Section Typography Follow-Up

The product proportions were accepted; section styling was refined again locally. Final client build passes; 124 tests/25 files pass (11/107/6). Added coverage omits empty eyebrow markup and preserves the collection toolbar/loading boundary. Browser checks confirm Home/Campaign/Brand section titles share 26 px/650-weight type and have no heading/page overflow at actual 388 px CSS width. Wide Home still has approximately 360 x 644 px first-row product cards. Card 18 oz/$39.99 still opens Quick View with 18 oz/$39.99; test purchase stays disabled. Desktop Home/Brand/Campaign were visually inspected; no application console errors observed. No server/schema/env/provider/deployment work occurred.

Owner approval of this typography direction, real-device Safari/touch/screen reader, long edited copy and narrow authenticated editor canvas remain manual. Existing test-only data and launch gates are unchanged. Exact files/screenshots/recovery are in [the typography checkpoint](work-checkpoints/2026-10-15-storefront-type-polish.md).
