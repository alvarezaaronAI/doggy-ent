# Payment Recovery: 2026-10-31

## Current Scope And Authority

Owner asks to implement and deploy the recommended payment-recovery and duplicate-
charge protection phase, preserving the approved checkout UI. Managed source
publication follows the existing checked task -> dev-main -> main workflow. Live
charging remains code-locked; no real payment, refund, email or fulfillment action.
Owner now approves the additive Railway migration only after a fresh private backup
and preflight. Owner chooses to configure Stripe later: prepare/deploy the handler
but do NOT create an endpoint, read/write its signing secret or activate recovery.
`CHECKOUT_RECOVERY_ENABLED` must remain off for this release. Do not infer provider
activation from source-deployment or database-migration approval.

Fresh Git audit: clean synchronized dev-main ab23e13 and main 7f7a2a0; their runtime
trees match with three final-evidence docs only on integration. Task branch is
feat/payment-recovery. Existing Railway/Vercel targets and test-product guards stay.

## Confirmed Gaps And Plan

- Intent creation currently has no stable Stripe idempotency key or persisted
  attempt/quote. Finalization is browser-driven and re-resolves mutable catalog,
  promo and shipping state. No signed Stripe payment webhook exists.
- Existing unique PaymentIntent/order plus atomic stock/order/receipt guard remains
  valuable. Promo/campaign attribution currently commits afterward and failures
  are swallowed; parent/commerce review is designing the scoped atomic boundary.
- Add an additive saved checkout-attempt identity, opaque hashed recovery proof,
  immutable server quote/contact/delivery snapshot, verified provider account/mode,
  unique PaymentIntent/order linkage and bounded retry/lease/review states. Never
  persist card data, client secrets or raw provider event payloads.
- Stable provider idempotency must survive ambiguous creation and process restart,
  but must never be reused past Stripe's retention window to create another intent.
  Frozen paid checkouts are not repriced after payment. Unknown/paid-but-unfulfillable
  results remain durable review cases, never an invitation to pay again.
- Verify the raw webhook body/signature before accepting a minimized event inbox.
  Deduplicate events and reconcile from canonical Stripe status, not event order.
  Browser resume and signed-event processing share one idempotent finalizer, with
  recovery continuing when new creation is paused. Add a bounded recovery worker.
- Preserve the existing customer checkout cards and receipt privacy. Client stores
  only minimal attempt identity/proof needed to resume; no private checkout snapshot
  or Stripe client secret in URLs/logs. Explicitly cover reload/tab closure and
  changed-cart/expired-quote behavior without accidental second payment.
- Minimum protected staff visibility must expose stuck/review cases without new
  automatic refund/fulfillment/send actions. Broader financial ledger/refund UI and
  real-device/Tax/receipt/business launch acceptance remain separate phases.

## Ownership

- Parent: architecture/schema, server orchestration, integration, shared DB/provider
  approval/preflight/rollout, all Git mutations and checkpoint updates.
- Raman (commerce_guardian,01a19302-98b7-7612-a304-73993568cb53): read-only order/
  stock/receipt/promo/campaign transaction integration review; no edits/operations.
- Carver (customer_experience,01a19302-98f6-7942-87bd-acc162b09847): initial read-only
  client coordinator/recovery integration proposal; awaits API contract before edits.

## Next Steps / Unverified

### Source Milestone

Parent has added additive `CheckoutAttempt`/minimal `StripePaymentEvent` models,
nullable historical order attribution, raw signed-event route before JSON parsing,
hashed recovery capability, frozen quote preparation, stable Stripe idempotency,
CAS leases, canonical reconciliation/cancellation, worker and protected read-only
admin recovery cases. `CHECKOUT_RECOVERY_ENABLED` is default off, requires the
server-only `STRIPE_WEBHOOK_SECRET` when enabled, and never unlocks live creation.
These are source changes, not tested/deployed behavior yet. Prisma6.16.2 generation
passes; no database migration/endpoint/provider configuration has been applied.

Raman now owns transaction helper/finalizer/order mapper/focused tests and guarded
disposable loopback-Postgres acceptance script. Carver owns client checkout/payment
recovery, minimal 7-day local recovery handle, existing card wiring and client tests.
Parent owns all other files including admin review, schema and orchestration. Both
work in the same branch and must preserve other edits. DB and webhook approval
questions were answered: migration approved after backup/checks; provider setup is
deferred to the owner. Do not publish before the backed-up migration/preflight,
and do not enable recovery in this rollout.

Contract: browser persists UUIDv4 and random64hex capability before POSTing existing
`create-payment-intent`. Only SHA256 proof/hash and trusted server snapshot persist
on the server. Repeat requests require the same canonical input/proof. Authenticated
capability status/finalize/cancel endpoints use `X-Checkout-Recovery`, no URLs or
persisted Stripe client secret. GET never creates/confirms a payment. New creation
replay uses one provider key for at most12h, never after Stripe retention;30-minute
unpaid quotes are canceled/rechecked, not silently replaced. Webhook inbox stores
only IDs/type/mode/account and canonical recovery completes from the frozen snapshot.
Review cases cannot issue refunds/emails/shipments. Seven-day capability expiry is
an access limit, not a claim of approved personal-data retention or automatic purge.

### Railway Migration Milestone

Fresh read-only service inspection confirms artistic-gentleness/production's
existing doggy-ent API, main branch/server root/start migration command and no
staged changes. Recovery flag and signing-secret variables are absent, so the new
feature stays off without a provider/configuration mutation. Owner approves only
the backed-up additive DB operation and defers Stripe setup.

Fresh full private custom backup:2,808,281bytes, SHA256/freshness/target/history
receipt verified, full archive decoded, directory0700/files0600. Private helper/
receipts live under ~/.codex/backups/doggy-ent/2026-10-31-payment-recovery; no secrets
or customer rows are in Git. Initial history28matching/only expected migration
pending and34prior table projections are checked. Guard initially rejected safe
ON DELETE FK syntax before touching DB; refined to reject destructive statement
starts, then preflight passed.

Approved migration applied:29complete matching migrations, nonepending,11validated
PK/FK/CHECK constraints,34prior business/account/order/email projections preserved,
both new recovery tables empty. No old order backfill, shared test fixture,
provider endpoint/secret/flag/payment/email or local-primary migration. Real
disposable loopback fixture separately passed same-attempt last-stock races,
different-attempt stock/total/per-email promo contention, three actual inserted-write
trigger rollbacks and safe retry, historical attribution after mutation/deletion,
and lost-commit replay; fixture DB removed. Source review/client acceptance still
in progress; migration success is not feature activation or deployment.

### Source Acceptance And Resume Point

Final local suites:client734(11/717/6),server880(62/812/6),gateway6;
network-blocked payment runner492server/382client,runner-safety9/security-helper10.
Combined/storefront/admin/server builds and Prisma6.16.2 pass. Actual isolated
Postgres acceptance now has12successful stages, including real lease CAS/stale
ownership/expiry and permanent inbox dedupe with processed-state preservation;
all fixture databases removed. No actual Stripe transaction was submitted.

Independent transaction/service review found conflicting event routing and fractional
percent comparison issues; parent fixes quarantine PI/hash conflicts without an
attempt relation, reuse canonical promo normalization and preserve zero caps.
Follow-up network-blocked review58/58passes and reports no remaining findings in
those fixes. Independent bounded security review reports no schema/controller/
webhook/gateway blocker. Its optional enabled-HTTP test follow-up hit agent credits
before editing; parent added four loopback controller tests plus off-mode inertness.
No test weakens the standard offline network guard; HTTP listeners live separately
under tier2/transport. Parent/full suite reruns pass after these additions.

Client includes frozen summary/giving/promo/item count, safe receipt reopening,
canonical completed-state check before explicit Start a new order, and selected
saveInfo handling from the frozen customer. Web Locks are required to start durable
confirmation; missing/busy locks block payment, not read/reconcile/receipt recovery.
No localStorage-lock fallback claims cross-tab atomicity. Browser acceptance of
enabled new recovery/3DS/wallets still remains before activation.
Parent's final privacy correction applies remembered-details opt-out for the
matching recovered bag, without touching unrelated bag/form storage. Its actual
page regression passes and final complete client/build/guarded suites are rerun.

Actual local ordinary checkout renders existing cards/monogram/routing with no
overflow at observed967px, zero captured warn/error and recovery controls absent
while off. This read-only check used an empty local bag and existing account
prefill, not an enabled-recovery/mobile/payment certificate. No task server was
started; user's original3000/5173servers remain. Temporary local browser tab3
should be closed at cleanup. Current public APIs still200/Sandboxenabled with no
recovery field. Fresh Railway postflight29matching/nonepending reconfirmed.

Next: close task agents, review/scan the exact source diff, commit/push scoped
feat/payment-recovery, open task PR to dev-main and await current-head client/server
Quality. Merge guarded, inspect whole release diff/targets/no-pending migration,
release checked dev-main PR to main, verify all3exact-source deployments and
public/staff/access/off-mode endpoints, then clean/sync main/dev-main. Record PR/
artifact/check evidence here; do not mistake provider-ready source for activation.

## Owner's Later Sandbox Setup

Do not execute this configuration in this release. In Chase and Evie Sandbox,
create an event endpoint for the deployed HTTPS `/api/payments/stripe/webhook`
on the existing Railway API, selecting only the four PaymentIntent event types
documented in architecture. Store the signing secret only as Railway's
`STRIPE_WEBHOOK_SECRET`, never in Vue/Vercel public variables or chat. Keep
`CHECKOUT_RECOVERY_ENABLED` off until a coordinated backed-up/correct-account
cutover and signed event/replay/browser acceptance are arranged. New creation may
be paused during cutover without disabling paid recovery. No live account/tax/
email/fulfillment changes are authorized. Current lack of autonomous no-PI create
replay is intentional: user POST reuses the same key within12h; matching events
can bind after an ambiguous DB save. Worker never creates a speculative replacement.

Stock/promo reservations, complete financial ledger/status/refund safety,
retention/disposal/support identity decisions, actual devices/providers and1.0
launch approval remain open. Seven-day access expiry does not purge stored PII.
No raw event/card/clientSecret/private customer export belongs in notes or Git.
