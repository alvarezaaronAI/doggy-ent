# Customer Session Repair And Deep QA: 2026-11-01

## Current Request And Authority

Owner reports mobile sign-in cannot retain a session and asks to fix it, with deep
testing of login, account creation and related flows. Screenshot shows accepted-
sign-in/session-unconfirmed feedback, not a demonstrated invalid password. Keep
the approved visual UI, Better Auth, guest checkout, bag and checkout-return paths.
Do not reset owner credentials, expose tokens, send real mail or place payments.
No shared migration, account mutation or provider configuration is authorized.
Managed source publication follows the existing scoped review/check/deploy rules.

Fresh Git audit is clean/synchronized: dev-main8c9c92f and maince6370c, only three
final evidence docs on integration. Task branch is
fix/customer-first-party-sessions from dev-main8c9c92f.

## Confirmed Source And Working Diagnosis

The deployed storefront sends customer auth/session/account calls directly to
the different Railway domain. The existing SameSite=None/Secure/HttpOnly,
host-only cookies do not bypass Safari third-party-cookie blocking. The protected
admin already uses a same-origin Vercel gateway and is not part of this defect.
The screenshot is consistent with that known deployment limitation; actual
request/log/browser proof is still pending, so do not blame a credential or CORS
without evidence.

Investigate a tightly scoped first-party customer API path on the storefront,
using existing Vercel reverse-proxy patterns and trusted fixed upstream config.
Keep backend ownership/role/origin checks and no-store responses. Never expose
admin routes, staff gateway secret/cookies, caller-selected upstreams or arbitrary
headers. Align native auth client, owned APIs/private photo and session-aware
checkout requests so an account does not appear signed in while checkout is not.
Local development must keep its startup-selected local API/DB behavior.

## Verification Plan / Resume

1. Read relevant auth/customer/communications/hosting docs and current helpers.
2. Confirm the deployed failure path with read-only evidence; build focused
   reproduction/tests for same-origin transport and cookie/origin boundaries.
3. Implement the minimal gateway/client transport fix without changing passwords,
   schema, cookie security or the approved UI.
4. Expand isolated real-engine signup/sign-in/session/logout/reset/verification
   and client validation/review/duplicate/return/bag tests. No real provider sends;
   disposable fixtures only. Do not create shared test customers without approval.
5. Run full relevant builds/tests, independent security review, docs/secret checks;
   deploy through guarded task/integration/release gates if ready. Verify public
   and protected sites, API boundaries and actual customer session retention.
6. Owner iPhone/Safari retest remains necessary unless directly verified in that
   browser; do not weaken browser privacy settings to make a test pass.

No implementation or deployment has occurred at this initial checkpoint. Recovery
activation remains off, live payments source-locked, existing Sandbox creation
enabled. No agent or test fixture may change those controls.

## Source Milestone / Active Work

Parent adds client/proxy.js + runtime/customerGateway.js with the existing Vercel
rewrite pattern, fixed HTTPS upstream from existing public VITE_API_BASE_URL or
compatibility alias, explicit customer-auth/account/checkout method/path policy,
same-origin write evidence and safe cookie/header minimization. No staff routes,
staff gateway secret, hosting cookies or caller-selected destination. Client
native auth and customer-owned/private-photo/checkout paths use the first-party
route only in hosted storefront builds; public catalog/media and local/admin
transport stay as before. No environment variable or cookie-security change.

Parent adds actual gateway/transport regressions:72cases plus existing session/
entry/recovery tests pass; first complete client813(11/796/6) passes before the
small logout/photo follow-ups below. Raw encoded dot-segment test was corrected
for Request's standard URL normalization: raw policy rejects, canonical paths can
only reach allowed customer routes, never staff paths.

Existing admin SDK @vercel/functions3.10.3 is added to client with its existing
@vercel/cli-config zod4.6.7 override. The override removes the new transitive high
advisory chain;2existing moderate Vitest/mocker dev advisories remain. No audit
fix --force or unrelated dependency/toolchain upgrade.

Deep source review also finds customer sign-out clears UI identity in finally on
failed server revocation. Parent changes it to clear only after success, retain a
generic retry error and test failure->retry. Vercel middleware has a documented4MB
body bound; preserve the existing5MB photo picker by preparing only large photos
to a bounded3MB/1600px JPEG before private upload. Existing small uploads pass
through, no existing pet photo/data is altered. Focused87client cases pass after
these changes; full final builds/tests remain to run.

Read-only Railway HTTP logs show repeated customer POST sign-in200 (and preflight
204), supporting accepted credentials rather than CORS/password rejection; no
headers, IPs, customer rows or tokens are captured here. Exact affected session
body/device cookie proof is still pending. Better Auth cookie docs explicitly
document Safari cross-domain session loss and reverse-proxy/shared-parent remedies.

Active agents (shared workspace, no Git/provider/shared-data operations):
- Ampere01a19842-e3c1-7d30-9c5e-600aec6259f8: only isolated real-engine auth tests
  in server/tests/tier2/admin/customer-auth-security.test.js; currently editing.
- Halley01a19846-7ffe-77e3-b61b-aabd90d8721b: read-only gateway/security review.

Next: review/integrate agent results, final full client/server/gateway tests/builds,
actual preview/first-party cookie session acceptance without live sends/shared
fixture signup, docs/privacy notes and independent re-review. Then checked managed
publication/deployment if ready, fresh no-pending-migration preflight and exact
artifact/access/session checks. No commit/push/deployment/configuration has occurred
yet. No task server has been started. Keep current branch and all owned edits.

## Deep QA Findings And Corrections

Ampere expands real-engine fixtures6->27 and reproduces an independent session
renewal defect: redeclaring native Session.token as an additional field with
returned:false hides it from engine renewal after default24-hour updateAge,
causing401while still unexpired. Parent removes only that incorrect option; the
existing response-redaction hook still strips all public tokens/passwords. All33
focused customer/admin native cases pass afterward, full server901(62/833/6) and
server build/Prisma6.16.2 pass. No schema/credential/session lifetime change or DB
mutation. Customer test fixtures now prohibit all real fetch/email calls.

Halley's gateway review finds Referer could unnecessarily forward sensitive
same-origin page queries upstream. Parent drops Referer entirely and extends
header-minimization regression. Review also requests actual native-client
first-party resolution and response/cookie lifecycle acceptance beyond rewrite
instructions; those checks are being added, platform/browser proof remains needed.
Latest pre-review full client818(11/801/6), all3client builds and admin gateway6
pass. Do not claim release readiness until final review/actual transport checks.

Parent additionally preserves the existing guest X-Order-Receipt header through
the gateway, alongside X-Checkout-Recovery; no generic bearer/admin forwarding.
Offline checkout regressions492server/382client pass. Actual native-client
first-party resolution test passes. Ohm01a1984e-84ca-7f31-88bf-27e4d34cdbae owns only
/tmp/doggy-ent-customer-auth-2026-11-01.mjs, a temporary loopback/memory browser
fixture; parent will inspect/build/run it, no shared DB/email/provider access.

Read-only Vercel names/config inventory confirms production VITE_APP_SURFACE is
storefront and existing sensitive-typed VITE_API_URL targets production/preview.
Value is omitted by connector, and no private-key decryption was requested.
Gateway keeps the documented bare-host-to-HTTPS and compatibility-alias behavior,
still rejecting credentials/path/query/non-HTTPS/self-origin. Explicit public
vercel.json build:storefront/dist-storefront also makes preview use the intended
isolated surface without relying on production-only environment hints. No dashboard
env mutation. Final tests/review must include this small configuration refinement.

## Latest Integrated Checks / Browser Fixture

Full final source currently passes821client(11/804/6),902server(62/834/6),
admin-gateway6, guarded offline492server/382client and runner-safety9. All3client
builds and server/Prisma6.16.2 build pass (rebuild after any further source edits).
Read-only shared migration history29matching/nonepending. Ampere's production-
domain in-process gateway/native lifecycle test passes; privacy/renewal finding
closed. Halley re-review closes referrer finding and sees no new concrete safety
regression. Both are closed, their writes fully integrated. No actual browser/
hosting-cookie acceptance or release is implied by those passes.

Ohm's temporary fixture is inspected: real memory Better Auth, actual Vue static
SPA, loopback5198only, sanitized generated secret, inert Prisma, blocked fetch/
outbound sockets/CSP, no email/reset/payment/account writes beyond memory auth.
Actual source is built into /tmp/doggy-ent-auth-qa-dist with all API origins fixed
to http://127.0.0.1:5198 and no Stripe key. Parent starts the disposable fixture
only for browser validation; all accounts die on stop. Ohm is closed. Track the
task-owned PTY session in tool state and stop it before finishing. Original user
servers remain untouched. Next is actual UI QA then preview/source publication;
no commit/push/provider/dashboard/DB mutation has occurred.

## Actual Browser Acceptance / Publication Preparation

The disposable actual Vue/native-memory browser passes: empty field summary and
aria-invalid markers, mismatched password feedback, show/hide password, private
review step, confirmed signup, reload-persisted account, sign-out and correct/
incorrect sign-in, duplicate-signup safe feedback, pets/wishlist empty states,
signed-out protected-tab redirect and sign-in return to checkout with the same
fictional bag item and account email. Recovery-disabled feedback and missing-token
reset page pass without sending mail. Native isolated tests prove duplicate
attempts do not overwrite credentials. No customer row or order was created on
Railway; checkout fixture deliberately blocks all financial operations.

Temporary loopback5198process12076 is stopped and the QA tab closed; ephemeral
accounts are gone. Privacy-safe blank sign-in screenshot is stored outside Git at
/tmp/doggy-ent-auth-signin-2026-11-01.jpg. No user server/tab/data was cleared.
Final storefront/combined builds pass. Initial admin rerun correctly fails without
its required VITE_STOREFRONT_ORIGIN; corrected public-origin command passes. No
env file is edited. Full source counts remain821client/902server/6gateway.

Next: final source/docs/content secret review, scoped commit/PR and current-head
Quality gates. Preview origins are not automatically trusted by Railway; do not
add wildcard origins or weaken hosting protection to test login. Check hosting
anonymous/private/deny-default transport first, then stable-domain native session
cookie acceptance after guarded rollout. Actual owner iPhone Safari and real
recovery-email delivery remain separate device/provider acceptance. Existing
recovery/payments/email controls remain unchanged. No release has occurred yet.

## Checked Publication Milestone

Task source67ce5792429550a23c18b1f6e23624235e77a147 is pushed. PR77 exact-head
Quality41336497696 passes client/server and all steps; no reviews/conflicts and
expected-head guarded merge integrates atdf7631c088831e1165ec78f8b26a7b4fabf6747e.
PR78 releases that integration head to maince6370c; its independent exact-head
Quality41336695930 is running. Do not merge before both jobs pass. Full release
diff24paths is task source plus known prior admin-routing evidence docs only.

Vercel task previewdpl_9wrmvDAAq6ZWg2z1PRi7m4hAj4Po is READY at67ce579. Existing
CLI identity accesses it without disabling protection: isolated storefront/0admin
manifest, first-party get-session200null/private-no-store, ownedprofile401,
staffpath404 and hostile-origin sign-out404. Invalid fixture cookie is ignored
with no new cookie; this does not prove successful session-cookie acceptance.
No real preview signup/login or new trusted origin was added.

Read-only target recheck confirms both existing Vercel roots/main repo branch,
public all_except_custom_domains and staff all-URL authentication; Railway
artistic-gentleness/API main/server root/start command, no staged config, prior
deployment30aeede4SUCCESS. Fresh shared migration preflight29matching/nonepending.
No shared/env/provider mutation. CLI project inspection uses explicit existing
project/team; no new linking, token or share-link generation.

Parent now uses docs/customer-session-release based ondf7631c for post-release
evidence only. Do not merge that documentation branch before PR78 finishes;
do not repeatedly deploy merely to record final artifacts. Exact remaining work:
finish PR78 checks/guarded merge, verify all three stable artifacts/source and
runtime startup/access controls, then existing-owner stable-domain UI sign-in/
reload/logout (no real signup/mail/payment), document device/provider limitations,
integrate evidence docs and synchronize clean primary/task branches.

## Verified Stable Deployment / Final Acceptance

PR78 Quality41336695930 passes both jobs/all steps at exactdf7631c, with no reviews
or conflicts. Guarded merge releases main23a3ed1b84cce62009f55a954595ce1ed73abdd3.
All three main-triggered existing artifacts match that exact source:

- Railway8c865954-1527-4c4a-a64d-148d74618f58 SUCCESS; startup29migrations,
  nonepending/listening and0captured Error/uncaught/Unhandled/FATAL patterns.
- Stable shopdpl_GQhzNWeAEHd7k8aVDYsBE7qzSXfG and protected
  staffdpl_BXFnxrsgZYcQp77hqcc8dYX1FMxt READY, stable aliases verified by hostname.
- Public isolated manifest0admin, SPA/signup200, same-origin native session200,
  anonymous ownedprofile401, public staffpath404 and private-no-store. Public API
  health/products/campaigns200; protected staff unauthenticated302. Initial smoke
  used a nonexistent /api/admin/data-routing and got404; the documented direct
  /api/auth/data-target is checked separately, not treated as a routing regression.
- Same-origin payment configuration retains Sandboxenabled/recoveryoff. Native
  reset readiness is false; the existing unavailable state is honest. No provider
  activation, secret/env change, payment attempt/order/email/refund or shipment.
- Fresh read-only postflight29matching/nonepending, preserving34prior projections.

Actual live customer browser acceptance uses the owner's existing authorized
account only, no shared fixture signup. New storefront cookie initially requires
a normal sign-in (old unrelated-domain session is not copied). Login reaches owned
account, reload confirms persisted identity and the existing bag, logout succeeds,
then opening /account redirects to sign-in. Re-login restores owned access; pets
loads with2/2private images decoded, wishlist loads, checkout retains signed-in
contact and the original bag item with1/1summary image decoded, no horizontal
overflow and0captured console warnings/errors. No profile/pet/wishlist/product or
order write was made. Routine sign-in/revocation creates/removes ordinary session
rows only. User-owned original tab/storage is not cleared. Agent tab is temporary.

The bounded source repair and deep isolated/live-existing-account checks are
complete. Remaining acceptance: owner refresh/sign-in on actual iPhone Safari;
real reset-email delivery needs separate approved provider/domain/inbox work.
Native expiry/renewal/reset/copy-cookie/privacy are fixture-proven, not a claim of
waiting days on production or delivering real mail. No browser security setting
was weakened. Existing broader prelaunch/payment/recovery gates remain unchanged.
Finish docs-only evidence checks/PR into integration and synchronize clean primary
branches against their own upstreams; do not redeploy just for final evidence.
