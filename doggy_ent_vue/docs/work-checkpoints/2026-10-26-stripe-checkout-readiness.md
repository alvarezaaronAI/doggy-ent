# Stripe Checkout Readiness: 2026-10-26

## Test Preparation Follow-Up: Complete Locally

Owner requests expanded payment tests and an admin-readiness gap assessment while
the Stripe plugin is being set up. Continue on test/stripe-checkout-readiness,
renamed from the unpublished docs branch without dropping its notes. Fresh fetch
confirms both primary branches still match their upstreams; existing dirty work
is only the preceding audit/handoff. Scope: offline provider-mocked regressions,
repeatable test commands, sandbox acceptance matrix and admin recommendations.
No shared migration/data change, provider resources/keys, actual transaction/email,
deployment or financial workflow activation. Do not treat missing recovery/ledger
features as implemented simply because their acceptance cases are documented.

Implementation milestone: actual mocked adapter adds57 cases; controller adds17;
promo eligibility adds11; actual checkout coordinator adds15; card/wallet adds19. Minimal
admin follow-up adds Stripe-ID order search, real template-center shortcut, truthful
automatic-receipt warnings/badges and operational-count wording. Admin projections
add only the strict Boolean automatic marker, never private frozen email data.
No financial status/reconciliation feature or payment recovery is implemented.

New payments:test command uses local Vitest binaries, a credential allowlist and
standard network-entry-point guard in workers. Nine native safety fixtures pass.
Final guarded suites pass227server/96client;9native safety checks pass. Full suites
pass601server (56/539/6) and424client (11/407/6), plus30combined Git/security/payment
helpers. Total added cases:94server/60client/9helper. Server build/Prisma6.16.2 and
combined/admin/storefront client builds pass. Guard is a trusted-test safeguard,
not an OS security boundary. CI's added safety step is parsed locally; no hosted run.

Actual fictional browser checks pass: unmatched/matched Stripe-ID search (including
case/outer spaces), queued receipt caution/Automatic receipt badge, Notifications
history/legend and its existing Email templates destination. Inspected screenshot;
observed881px page/content has no horizontal overflow and captured console errors
are empty. Not exact desktop/mobile emulation or real Safari/keyboard certification.
Private screenshots: ~/.codex/backups/doggy-ent/2026-10-26-payment-readiness/
receipt-preview.png and notifications-preview.png (fictional data only).

Fixture limitations: initial admin-only Vite default proxy reached ordinary3000
for anonymous read checks; it was stopped and corrected to the memory-only API
before acceptance. No sign-in/credentials/write. The template editor's automatic
sample-preview POST is intentionally rejected405 by this read-only fixture; one
such request is counted, not a business mutation. Template preview/send is not
certified by this browser check. Do not interpret its mock admin as a real auth test.

Temporary API5193/terminal56308 and corrected Vite5194/terminal26999 are stopped
(exit130), no remaining listeners, and the task tab is closed. Initial Vite terminal
43339 was stopped before replacement. Owner's ordinary servers remain untouched.
Read-only independent commerce review finds no scoped blocker in the preparation
diff; known source/payment/financial-status/stale-save launch blockers remain open.

Next: review the [full acceptance/admin matrix](../prelaunch/payment-readiness.md),
then implement the minimal durable attempt/quote/event/financial contracts before
requesting shared migration or sandbox/provider-write approval. Nothing is committed,
pushed, merged or deployed. No schema/shared data/provider setting/key/send/charge
change. This is a completed preparation slice, not a completed payment integration.

### Changed File Groups And Commands

- Root package.json: payments:test/test:payment-safety; scripts/payment-tests.mjs,
  payment-test-network-guard.mjs and payment-tests.test.mjs. Git-root Quality workflow
  adds only the native safety test step under existing read-only permissions.
- Server: two protected admin delivery mappers expose the existing strict Boolean;
  controller/promo tests expanded, new payments adapter/projection regressions.
- Client: Orders composable/actual view/shared filters, Reports, Notifications,
  order email composer/activity; four new payment/admin regression files.
- Docs: this checkpoint/handoff, prelaunch payment matrix/index, admin experience,
  communications, checkout architecture, roadmap and QA notes.

Verified commands: npm run payments:test; npm run test:payment-safety;
node --test scripts/git-preflight.test.mjs scripts/security-preflight.test.mjs
scripts/payment-tests.test.mjs; client/server npm test; server/client npm run build;
client build:admin with public synthetic storefront origin; client build:storefront.
Quality YAML parses and retains contents:read. Final whitespace/local-link/fence/
synthetic-secret checks pass:9documents/29local links, balanced fences, valid package
JSON,14changed JS/MJS syntax checks and no secret-like additions in the checked
application diff/new files. The first ad hoc enumerator mistook an untracked file
for a tracked one; corrected enumeration reruns successfully without staging files.
31files total include30application files plus the two-line root Quality change.
No migration/start or provider command ran. Production UI and payment behavior are
unchanged. The complete local slice is ready for commit review, not payment launch.

## Original Audit Scope And Baseline

Owner agrees to a Stripe/checkout review to identify what to add or fix. This is
an assessment, not approval to activate payments, create provider resources, send
email, apply a migration or deploy a repair. No runtime files are changed.

Fresh status/diff/preflight with fetch confirms clean dev-main at
517e5ed965ac36f7e85832a508a741e6ffa10a26, matching origin/dev-main; local main
2066f6b45287722bac0e40b233e38b130531643e matches origin/main. Integration contains
the prior documentation-only evidence; differing merge history is not local drift.
Notes are on docs/stripe-checkout-readiness. Nothing is committed/pushed/merged.

Stripe plugin discovery reports installed=false. Its prior suggestion is not a
connection. No Stripe dashboard, account/API key, payment/customer data, event
destination or wallet-domain configuration was inspected. Do not label the account
as sandbox/live, connected or launch-ready from source/test evidence alone.

## Existing Foundations To Preserve

- Actual [catalog resolution](../../server/src/domains/checkout/services/checkoutCatalog.service.js)
  rejects unsellable/test products and uses DB-owned selected-variant price/SKU.
- [Payment creation](../../server/src/domains/payments/controllers/payment.controller.js)
  uses server preview totals and rejects an invalid promo before contacting Stripe.
- [Stripe verification](../../server/src/domains/payments/services/stripe.payment.js)
  requires succeeded, exact received amount and USD currency before a new paid order.
- Unique Order.stripePaymentIntentId and [order transaction](../../server/src/domains/orders/repositories/orders.repository.js)
  prevent a duplicate order/decrement for the same intent; limited stock is checked
  conditionally and receipt intent is nested in the same transaction.
- [Same-mounted-checkout coordinator](../../client/src/domains/checkout/composables/useCheckout.js)
  guards repeat clicks and reuses its remembered completed payment after an order
  request failure. This protection is not persistent across reload/navigation.
- Guest access uses email/payment-bound checkout proof and a short-lived scoped
  receipt capability; signed-in reads require ownership. No public reference-only
  receipt access should be restored.
- Card UI and Express Checkout wallets already exist, with admin presentation
  switches, unavailable-device fallback and displayed/server amount comparison.
  Source presence is not a successful provider/device payment.
- Saved receipt-template/atomic queue/manual shipping email policy stays intact.
  Sending was previously verified off; current provider settings were not re-read.

## Confirmed Source Findings

### P1: Payment Completion Still Depends On The Browser

[useCheckout.js](../../client/src/domains/checkout/composables/useCheckout.js),
lines 24-45 and 70-85, stores payment completion in Vue refs then calls order POST.
[app.js](../../server/src/app.js) and the payment routes have no Stripe webhook
handler, signature verification or persistent payment-event consumer. There is no
independent recovery path for a payment completed just before tab closure, redirect,
refresh or lost browser response. A paid customer can therefore lack a saved order
and the order-linked receipt queue. No real charge was used to reproduce this.

Required repair: persist a bounded checkout attempt before confirmation, correlate
Stripe to it, and finalize via one idempotent service callable from browser recovery
and verified Stripe events. Keep fulfillment/shipping manual. Verify raw-body
signatures, persist/deduplicate events and recover processing safely; never trust an
unsigned event or an exposed PaymentIntent ID as customer authorization.

### P1: No Durable Payment-Creation Identity Or Frozen Checkout

[stripe.payment.js](../../server/src/domains/payments/services/stripe.payment.js),
lines 10-20, creates each intent without a Stripe idempotency key or checkout
metadata. Client checkoutAttemptId is only in memory, not forwarded by
[useCheckoutPage.js](../../client/src/domains/checkout/composables/useCheckoutPage.js)
or the payment API helper. A creation retry can make another intent; a new intent
alone is not a second charge, but an ambiguous confirmation must be resolved before
offering another independently chargeable attempt.

[createCheckout](../../server/src/domains/checkout/services/checkout.service.js),
lines 229-244, resolves current catalog/prices/promos/rates again after payment.
Proof binds payment ID/email, not a stored cart/quote. Stock, price, promo expiry or
rate changes can prevent finalization even when payment succeeded. There is no
server-owned frozen attempt to recover, and the client resubmits its current fields.

Required repair: bind one versioned trusted quote/owner/contact/destination/selected
rate to an attempt; use stable creation idempotency and payment-status recovery.
Define reservation/expiry and paid-but-unfulfillable review behavior. A stock
conflict must not erase evidence of money received or invite another payment.
Do not persist client secrets or put PII/proofs into Stripe metadata or logs.

### P1: Promo/Campaign Attribution Is Outside The Paid-Order Transaction

[checkout.service.js](../../server/src/domains/checkout/services/checkout.service.js),
lines 324-389, commits order/stock first, then separately records promo/campaign
usage and catches failures. The initial existing-payment return at lines 224-227
does not repair missing attribution. A discounted paid order can remain without its
redemption, and contribution attribution can disappear from later receipts/reports.

Promo usage itself has a transaction and order uniqueness, but count-then-insert
customer limits use the default transaction isolation, not a serialized reservation
shared with payment/order commitment. Concurrency/last-eligible-use needs explicit
coverage; pre-payment validation alone is not a reservation.

Required repair: atomically persist agreed order/discount/giving attribution and
enforce bounded concurrent eligibility, with an explicit durable reconciliation
path. Do not broaden this into automatic beneficiary payouts or marketing emails.

### P1: Refund Reporting Is Not A Verified Financial Record

[mapCustomerOrder](../../server/src/domains/orders/mappers/orders.mapper.js), line
251, reports REFUNDED from the editable order status and otherwise PAID from the
presence of a PaymentIntent ID. Current source has no Stripe refund/dispute event
sync or amount-aware payment ledger. A manual fulfillment status is not proof of a
Stripe refund, and a dashboard-side financial change is not reflected reliably.

Required repair: separate fulfillment state from verified payment/refund state;
record provider financial events and amounts, keep dashboard/manual reconciliation
available, and never create an actual refund merely to test reporting.

### Launch Decision: Tax/Shipping Remain Uncertified

[tax.service.js](../../server/src/shared/services/tax.service.js) uses fixed estimated
state rates; TAX_PROVIDER=stripe still calls the local estimate. It does not activate
Stripe Tax. [Shipping resolution](../../server/src/domains/checkout/services/checkout.service.js)
refetches rates and can fall back to static prices. Supported destinations, package
weights/dimensions, rates, tax obligations and customer wording need business review
and scoped provider checks. Do not claim automatic tax/address verification from
these placeholders or turn on a paid service without approval.

## Original Audit Verification

Existing focused tests ran with inherited DATABASE_URL, STRIPE_SECRET_KEY,
RESEND_API_KEY and shipping keys unset. Their provider/persistence boundaries are
mocked. No shared DB, provider request, real charge/refund/email or migration was
used. These checks cover current safeguards, not fixes for the missing paths above.

Server command (from server/):

```sh
env -u DATABASE_URL -u STRIPE_SECRET_KEY -u RESEND_API_KEY -u SHIPPO_API_KEY -u SHIPPO_API_TOKEN npx vitest run tests/tier1/payments tests/tier1/checkout tests/tier1/promos tests/tier1/campaigns tests/tier2/checkout tests/tier2/emails/checkout-receipt.test.js tests/tier2/emails/receipt-checkout-boundary.test.js
```

Result: 9 files / 50 tests passed.

Client command (from client/):

```sh
env -u DATABASE_URL -u STRIPE_SECRET_KEY -u RESEND_API_KEY npx vitest run tests/tier1/checkout tests/tier1/promos tests/tier2/checkout tests/tier2/storefront/stripe-loading.test.js
```

Result: 7 files / 36 tests passed. No builds needed for documentation-only changes.
This audit includes no new browser/payment/device or deployment verification.
Documentation checks pass: git diff --check, balanced fences, 15 local links across
the checkpoint/new handoff section, and no secret-like values in that checked scope.
Only those two documentation files are changed; they are ready for review, not
committed or published. Runtime/deployed source remains unchanged.

## Next Steps In Order

1. Owner completes Stripe plugin authorization. Recheck the actual connection and
   supported read tools; do not request pasted API keys. Confirm the exact business
   account and sandbox before reading provider configuration. If the plugin lacks
   endpoint/domain inspection, use an approved dashboard/CLI route without silently
   broadening permissions. No write operations are authorized by connection alone.
2. Implement durable checkout identity/quote, creation idempotency, signed-event
   ingestion and shared finalization/recovery. Review any additive schema before
   seeking separate shared-DB backup/preflight/migration approval.
3. Make paid order/stock/receipt/promo/giving consistent under duplicate events,
   races, partial failures and retries; add financial event reconciliation and
   truthful refund reporting. Preserve owner UI, guest access and manual fulfillment.
4. Verify Stripe sandbox/key pairing, enabled compatible methods, registered HTTPS
   wallet domains, account readiness and event destinations. Review Stripe receipt
   settings to avoid unplanned duplicate mail alongside the app receipt queue.
   These are pending dashboard checks, not confirmed configuration defects.
5. With explicit sandbox-write approval and controlled fixtures, exercise guest/
   member card success, decline, 3DS, duplicate click/event, network loss/reload/tab
   closure, last-stock/last-promo races, expired quote, wallet fallback and actual
   supported Apple Pay/Google Pay devices. Assert one payment/order/stock/usage/
   receipt intent. Keep email off unless an inbox/budget is separately approved.
6. Approve actual catalog/destinations/rates/tax/policy/provider decisions and
   matching rollout only after repairs/tests/review. This assessment is not 1.0
   launch acceptance or authorization to enable live payments.

## Official References Reviewed

- [Payment status and server webhook completion](https://docs.stripe.com/payments/payment-intents/verifying-status)
  explains why browser-only completion is insufficient.
- [PaymentIntent lifecycle and idempotency](https://docs.stripe.com/payments/payment-intents)
  covers stable intent reuse and creation idempotency.
- [Webhook verification](https://docs.stripe.com/webhooks) covers signatures,
  unmodified request bodies and duplicate-safe processing.
- [Express Checkout integration](https://docs.stripe.com/elements/express-checkout-element/accept-a-payment)
  remains a provider/device acceptance item, not evidence of this account's setup.

No secrets, customer records, provider tokens or credential values are retained in
these notes. Resume here, not by repeating earlier account/template/rotation work.
