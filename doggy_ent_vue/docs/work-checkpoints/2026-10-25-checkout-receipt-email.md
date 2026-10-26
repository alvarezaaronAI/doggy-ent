# Checkout Payment Receipt Email

## Owner Scope And Safety

2026-10-25: owner approves exactly one automatic payment-confirmation receipt after
verified payment, using an editable saved template. Preparation, shipping, delivery,
support, marketing and other operational emails remain manual. Owner also approves
an additive Railway queue/template-selection migration after fresh private backup
and read-only preflight. This does not authorize a live email test, a paid plan,
provider/domain/secret changes or a payment transaction.

## Current State

- Fresh Git audit completed; clean task branch `feat/order-confirmation-email` from
  synchronized dev-main `70b4327`. Production baseline is main `30bc5ba`.
- Read existing checkout/order/template/provider/repository and relevant guides.
- Existing Resend adapter and manual preview/send flow are retained. No live send
  or shared business-record write occurred. The explicitly approved additive schema
  migration is applied as recorded below; do not repeat it.
- Resend Free is recommended; its currently published allowance is 3,000/month,
  100/day. Owned verified sending domain is still a prerequisite for customer mail.
  Do not confuse a Vercel hosting URL with an owned sending domain.
- Visual-renderer worker owns orderEmail mapper, suggested templates and its new
  design tests only. Main owns queue, configuration, persistence, UI and rollout.

## Implementation Plan

1. Add disabled-by-default receipt configuration and a frozen, private receipt
   payload on the existing EmailDelivery store. Queue creation must be atomic with
   the paid order/stock transaction; use server-verified saved item/total facts.
2. Add bounded background dispatch with atomic claiming and permanent application
   deduplication. Provider uncertainty must not trigger blind retries or a second
   charge. Missing/disabled provider must never be presented as delivery success.
3. Add saved-template selection and explicit configuration Save/Cancel in the
   existing template center. Refresh monogram/receipt design, responsive layout,
   text fallback and truthful customer receipt state.
4. Test queue/replays/concurrency/failure/manual-policy/security and editor/receipt
   states with isolated fixtures only. Run applicable full builds/tests.
5. After tests, back up and preflight the exact Railway target before the separately
   approved additive migration. Keep automatic sending disabled. Verify matching
   schema/checksums and preserved old records. Record exact evidence here.
6. Publish only ready scoped source under the managed workflow. Provider activation
   and a live approved-inbox test remain a separate owner handoff.

## Resume Instructions

Implementation and the approved migration are now complete; final source publication
and provider activation remain distinct. Inspect actual Git diff before continuing.
Do not trust a generated preview as provider delivery.
Never output credentials, receipt payloads with real PII, provider responses, reset
tokens or database URLs. Preserve the existing protected Vercel admin gateway.

## Verification And Remaining Work

Implementation checkpoint: queue/settings schema, atomically nested receipt, bounded
claim-once dispatcher, manual-policy boundary, saved-template controls and truthful
customer states are in source. Five rich templates share the refreshed monogram/
PNG-Lucide/table/text layout. First full client run: 357 tests (11/340/6), build
2,354 modules. Server build/generation and first full suites pass; final count will
be rerun after integration. Focused Stripe-failure/replay checks also pass. Worker
reported 50 visual-renderer tests and 24 fictional browser cases with/without images.

Earlier implementation-stage pending items are superseded by the verified milestone
below. Final managed publication/deployment verification remains. Private guarded helpers are
under `/Users/nazxylix/.codex/backups/doggy-ent/2026-10-25-checkout-receipt/`;
they contain no inline credentials and never print connection values. Do not invoke
`migrate` until all prior checks and fresh decoded backup pass.

Existing
browser-only payment finalization/webhook recovery and other prelaunch commerce
gates are not solved by adding email; document these separately and honestly.

## Verified Implementation And Database Milestone

- Main final full suites: client357 (11/340/6), server492 (28/458/6). Server build/
  Prisma6.16.2, client combined2,354 modules, storefront-only2,212 and admin2,257
  builds pass. Admin build initially refused missing public origin as designed;
  rerun with the actual public VITE_STOREFRONT_ORIGIN passed. Gateway6 unchanged pass.
- Independent commerce review found preparation failure could silently lose the
  receipt. Fixed by propagating preparation before order commit; regression proves
  no commit on failure, same-payment retry commits once, generic order calls/replays
  do not queue again. No further concrete blocker was reported.
- Disposable loopback actual Postgres:27migrations, guest/member persistence,
  permanent dedupe/stock once, CAS concurrent claim once, receipt-failure transaction
  rollback, dry dispatch/no external HTTP, private-body cleanup, stale settings and
  SQL check validation. Fixture database removed.
- Main CUA isolated memory-only actual editor checks: monogram/Lucide PNGs and real
  renderer, automatic test-mode/template Save, no live choice, unsaved heading preview,
  Cancel restoration and phone/wide canvas. Fixed explicit select labels after exact
  label automation revealed nested option text. Screenshot receipt-editor.png in the
  private folder contains fictional data only. Fixture server is task-owned5192;
  stop it before ending the turn; preserve normal user5173/3000 servers.
- Fresh full private backups: local364,735 bytes, Railway2,803,238 bytes; both decoded
  with pg_restore, archive SHA/freshness/identity/SQL checks before apply. Migration
  applied once to both. Initial postflight needed a Postgres18 NOT NULL-constraint
  filter correction, not a second migration. Repeated postflight passes27complete
  matching/nonepending, old Product/Variant/Order/Item/User/Pet/Photo/Event/Wishlist/
  Template/Delivery projections preserved, PK/FK/CHECK validated, settings absent/off
  and zero automatic shared email rows. No shared fixtures, live email or config change.

Next: finish docs/link/fence/secret/syntax/helper checks, final artifact/baseline review,
then managed task PR -> dev-main -> release main if all gates pass. Before Railway
rollout rerun the NEW receipt helper railway preflight (old wishlist helper expects26).
Verify exact source on both Vercel projects/Railway, public PNG200, protected admin
template sample/read/live-lock and no provider/queue activation. Record evidence,
then synchronize main/dev-main and save final checkpoint. Do not rotate keys or set
CHECKOUT_RECEIPT_SEND_ENABLED. Live approved-inbox delivery is not authorized.

## 2026-10-26 Resumed Release Checks

Fresh Git fetch confirms unchanged primary upstreams and the same task-owned53-file
scope. Full text/syntax/docs scan:29JS/MJS syntax checks,12Markdown documents,
10changed local links, balanced fences and zero configured-secret matches. Git/helper
fixtures21pass, schema validation passes and security preflight remains read-only
with no hard failure (pre-existing coupled local provisioning/Stripe locations
remain review notes, not a rotation performed here). Final admin rebuild2,257modules
and server generation pass. Normal user servers are preserved.

Railway read-only preflight reconfirms27matching/nonepending. Connected service
variable-name inventory is redacted and contains no Resend sender/key or new live
receipt switch; configuration remains off. Admin project identity/root/protection
and Railway repo/main/root/startup are rechecked. Public client directory has no
local Vercel link, so use the explicit existing doggy-ent target for inspection;
do not auto-link or create another project. No provider settings changed.

Next active stage: review/stage the scoped source and docs, publish task PR, require
current-head Quality and review gates, merge into dev-main, inspect complete release
diff including three prior admin evidence docs, then gated main PR and actual
Railway/two-Vercel source/artifact verification. No live send/domain purchase/paid
upgrade or email activation. Final release evidence should be a docs-only dev-main
follow-up rather than recursively redeploying merely to record artifact IDs.
