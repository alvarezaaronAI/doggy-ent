# Payment Preparation And Acceptance

Updated 2026-10-26. This is a staged implementation/test plan, not certification that
payments, refunds, wallets, tax or mail are ready for real customers. See the
[current checkpoint](../work-checkpoints/2026-10-26-stripe-checkout-readiness.md)
for actual local results and remaining publication/device/provider evidence.

Follow-up: both assistant Stripe contexts are now connected (live plus a separate
sandbox). Local [environment safeguards](../architecture/payment-environments.md)
add strict default-off creation, account/mode checks, public key-mode handshake,
protected admin indicator and a hard live-creation lock. This does not resolve the
durable-recovery/financial blockers below. The older local key is a different test
account; the new sandbox public key is privately supplied, server key still pending.
No shared environment/key/provider change or deployment is implied. See the newer
[safety checkpoint](../work-checkpoints/2026-10-26-payment-environment-safety.md).

## Run The Offline Checks

From the application directory:

```sh
npm run payments:test
npm run test:payment-safety
```

The first command runs a fixed selection of actual payment/checkout, promo/giving,
stock, receipt/provider, customer-projection and admin regressions. It uses existing
local Vitest binaries: no installation, dev-server start, migration, provider setup
or shared database. The second checks the runner itself. Existing client/server
test scripts also discover the new regressions; CI includes the native safety tests.

The runner allowlists benign inherited environment names, supplies synthetic auth/
public-client fixtures, omits inherited DB/provider/deployment credentials and
preloads a fetch/HTTP/HTTPS/TCP/TLS/DNS guard in each test worker. Mocked provider
calls still run normally; accidentally using a standard network entry point fails.
Missing dependencies/selected paths, failed or terminated workers and arbitrary
CLI arguments fail closed. There is no live mode. This is a trusted-test safeguard,
not an OS sandbox: do not add untrusted subprocesses, read private env files or
override the network guard to make a test pass. Vite can still read its usual public
configuration during compilation; no production credentials belong in it.

## Existing Versus Missing

| Area | Present | Still needed before real-payment acceptance |
| --- | --- | --- |
| Pricing | Server resolves DB variants, quantity and trusted totals | Freeze an owned, versioned checkout quote before confirmation |
| Payment verification | Stripe succeeded/exact received cents/currency checks | Durable attempt identity, account/mode correlation and verified event recovery |
| Retry | Duplicate-click guard and remembered same-mounted payment | Creation idempotency; safe ambiguous-result, reload/redirect/tab-close recovery |
| Order and inventory | Unique PaymentIntent and transactional stock/order/receipt intent | Reservation/expiry policy and paid-but-unfulfillable review without another charge |
| Discounts/giving | Server validation and per-order uniqueness | Atomic order attribution and concurrent last-use enforcement/reconciliation |
| Guest receipts | Scoped expiring proof, no reference-only PII lookup | Verified expired/lost-proof recovery without exposing other orders |
| Wallets | Express Checkout, independent admin switches and card fallback | Correct account/domain configuration and actual supported-device sandbox payments |
| Payment email | Saved template, atomic intent, default-off and manual fulfillment policy | Verified sender/domain, approved inbox/budget, provider acceptance/inbox QA and duplicate-receipt review |
| Payment reporting | Stored order/intent reference and operational totals | Separate verified financial state, partial/full refund amounts, dispute/events and reconciliation |
| Tax/shipping | Server-owned estimated tax, rate lookup/static fallback | Approved destinations, package/rate coverage and actual tax approach; Stripe Tax remains a placeholder |

## Stripe Setup When Connected

Connecting the assistant plugin does not configure the website's Stripe keys or
webhooks. Plugin access may not expose every dashboard setting; check its supported
tools before requesting additional access. These provider checks remain unverified.

1. Confirm the correct business account and an isolated Stripe sandbox. Record only
   safe account/environment labels in operational notes, never API keys.
2. Confirm server `STRIPE_SECRET_KEY` and client `VITE_STRIPE_PUBLISHABLE_KEY` belong
   to that same account/sandbox. Restrict server access to required operations where
   practical. Keys stay in the provider/hosting dashboards; no values in Git/chat.
3. Implement signed event intake first, then register its exact HTTPS Railway
   endpoint and selected supported event types/version. `STRIPE_WEBHOOK_SECRET` is
   a proposed server-only requirement, not configured or used by current source.
   A signing secret is distinct from an API key. Do not create a destination pointing
   at a route that does not exist or enable unsupported payment methods.
4. Check exact payment-method domains for the storefront hosts actually used for
   checkout, including the future official domain when added. Admin does not take
   customer payments. A dashboard link's test/live choice is not verified key mode.
5. Review account readiness, statement descriptor, public support details, compatible
   card/wallet settings, risk rules, refunds/disputes operations and team access.
   Do not weaken authentication or enable paid products automatically.
6. Review Stripe's built-in receipt settings alongside the application's default-off
   receipt queue so the customer does not unexpectedly receive duplicate messages.
   Keep all provider mail off during automated checks; obtain an approved inbox and
   small budget before a deliberate send test.
7. Confirm the selected application DB is an approved test target too. A Stripe
   sandbox does not stop the shop from writing real DB orders or sending live email.
   Existing permanently blocked test products must remain unpurchasable; use only
   explicitly approved isolated sellable fixtures for end-to-end checkout.

## Admin Workbench Plan

Keep the existing grouped navigation. Do not add a top-level tab for every payment
state or present dummy dashboards as connected operational tools.

### Orders: Immediate Local Improvements

Implemented locally in this preparation pass:

- Search existing stored orders by full/partial Stripe PaymentIntent ID, ignoring
  case/outer spaces, alongside existing reference/customer/status filters.
- Use "Marked paid" for the current workflow bucket, not a claim of reconciled
  Stripe transactions. Reports explain the limitation.
- Identify a known automatic payment receipt in order/global email activity and
  explain queued/pending/provider-accepted/test/failed states before another manual
  confirmation. Unknown/legacy origin is not invented as Manual or Automatic.
- Notifications links to the actual Email templates editor, not an obsolete future
  template placeholder. Sending still requires the existing saved preview/review.

These changes do not introduce payment/refund actions, automatic retry or a financial
ledger. Search cannot find an orphan Stripe payment that has no stored order.

### Orders: Backend-Dependent Launch Work

- **Financial summary:** verified charged/refunded/remaining amounts and currency;
  provider account/mode, last verification time and safe Stripe link. Keep this
  distinct from fulfillment status and estimated order value.
- **Needs payment review:** saved attempts paid without an order, amount mismatch,
  stock/quote conflict and failed/unknown finalization. No "charge again" action.
  Let staff inspect actual evidence and deliberately retry idempotent finalization
  only after that service and audit protection exist.
- **Financial timeline:** verified events, outcome, correlation and reconciliation
  status. Failed/duplicate/out-of-order events must not corrupt the order or expose
  raw payloads, secrets, client secrets or card data.
- **Status safety:** manual fulfillment edits must not manufacture payment/refund
  evidence. Add server-enforced transitions and expected-revision conflict handling
  so a stale operator cannot reopen a cancelled order. Merely disabling a UI option
  is not sufficient. This remains a current source blocker, not fixed in this pass.
- **Refunds/disputes:** start with read-only verified state and a correct dashboard
  path. A later financial action needs explicit amount/reason/recipient review,
  permission checks, idempotency, audit and provider reconciliation. No simulated
  "refunded" success and no automatic refund from cancellation.

### Operations And Communications

- **Email templates / Notifications:** keep receipt mode/template settings and
  manual fulfillment sends separate. Add deliberate reconciliation for uncertain
  sends before any retry tool; provider acceptance is not confirmed delivery.
- **Internal issues:** link payment exceptions to the relevant attempt/order and
  safe event references. No raw provider payload or automatic case closure.
- **Reports:** retain operational order value now. Later add date-range verified
  gross payments/refunds/net amounts, currency boundaries and recorded reconciliation
  freshness. Do not treat this as payout settlement/accounting certification.
- **Payment setup:** a future read-only setup section may show non-secret key mode,
  event/domain/account checks and last verification times backed by actual data.
  Never show a green ready status from an env variable's presence alone, expose
  secrets in the editor, or create a production "Run test charge" shortcut.

## Acceptance Matrix

Offline coverage below uses mocks of external boundaries and actual app functions/
Vue components. It does not certify Stripe, real PostgreSQL concurrency, Safari,
accessibility or live delivery. No unimplemented feature is represented as a passed
test, empty placeholder test or skipped green launch gate.

| ID | Scenario | Required outcome | Evidence class |
| --- | --- | --- | --- |
| O01 | Browser-supplied item price/SKU/total | Trusted DB variant and server amount win | Existing offline regression |
| O02 | Draft/test product, invalid size/quantity, aggregate stock | Reject before payment | Existing offline regression |
| O03 | Missing contact/address or invalid email | No preview/provider intent | Expanded offline regression |
| O04 | Invalid/email-ineligible/expired/used promo | No discounted payment initiation | Existing offline boundaries; real race remains below |
| O05 | Amount rounding and currency | Correct integer cents/currency | New actual-adapter offline regression |
| O06 | Processing/action/uncaptured/cancelled/unknown Stripe state | No successful order from non-succeeded result | New actual-adapter/component offline regression |
| O07 | Underpaid/overpaid/missing received funds/wrong currency | Reject finalization | New actual-adapter offline regression |
| O08 | Missing intent/provider/auth failure | Safe public error; no private provider data | Expanded controller/adapter offline regression |
| O09 | Proof wrong email/intent/purpose, forged or expired | No unauthorized finalization/receipt | Existing plus expanded expiry/binding regressions |
| O10 | Double click during confirmation/order Save | One confirmation and one active order request | New actual-coordinator offline regression |
| O11 | Known card decline or wallet cancellation | No order, safe retryable feedback | New actual-coordinator/component offline regression |
| O12 | Payment succeeded; order request fails repeatedly | Reuse payment in the same mounted flow, no new charge | New actual-coordinator offline regression |
| O13 | Wallet/card displayed amount differs from server | Do not confirm; review refreshed total | New actual-component offline regression |
| O14 | Wallet disabled/unavailable/validation fails | Preserve card fallback; no unintended confirmation | Existing plus new component offline regression |
| O15 | Unique order/conditional stock/nested receipt | No duplicate order or extra stock decrement | Existing offline transaction contracts, not a real DB race |
| O16 | Automatic receipt worker/provider failure/gate off | Correct dry/queued/pending/failed semantics; no blind retry | Existing provider-mocked regressions |
| O17 | Admin receipt projections and customer reads | Safe origin Boolean only; no private frozen body/proof/IDs | New admin projections plus existing customer privacy regressions |
| O18 | Staff searches payment ID and uses template shortcut | Existing order is findable; real editor destination | New actual-composable/rendered-page regressions |
| O19 | Staff sees prior queued/accepted automatic receipt | Visible caution before manual mail; no retry control | New actual Vue render regressions |
| S01 | Sandbox card success as guest/member | One verified payment/order/receipt intent; correct ownership | Pending connected sandbox and controlled DB fixture approval |
| S02 | Sandbox decline/3DS complete/cancel/timeout | Truthful outcomes; no duplicate charge | Pending sandbox/device acceptance |
| S03 | Connection lost during confirmation/refresh/tab closure | Recover same durable attempt without another payment | Blocked by missing durable recovery |
| S04 | Signed event duplicate, late or out-of-order | Idempotent finalization with durable normalized events | Blocked by missing webhook/event processing |
| S05 | Invalid/missing signature or wrong account/mode | Reject before processing; no data leakage | Blocked by webhook/account-correlation implementation |
| S06 | Last-stock race/payment after quote expiry/catalog edit | One stock claim; paid exception remains recoverable | Blocked by reservation/recovery policy; real isolated DB race required |
| S07 | Last promo/per-customer race and attribution write failure | Agreed discount/giving recorded once consistently | Blocked by atomic attribution/reservation implementation |
| S08 | Guest lost/expired receipt proof and foreign account | Verified recovery for owner only, no reference-only PII | Privacy denial exists; recovery UX still missing |
| S09 | Apple Pay/Google Pay actual supported devices/domain | One amount/confirmation; fallback remains | Pending account/domain and real-device sandbox QA |
| S10 | Dashboard partial/full refund and dispute updates | Correct verified financial state without fulfillment spoofing | Blocked by financial ledger/reconciliation; sandbox-only later |
| S11 | Two admin editors save conflicting status | Stale Save returns409; retained draft/no extra history | Blocked by browser expected-revision/transitions contract |
| S12 | Receipt provider accepted/error/unknown acceptance | One approved-inbox receipt; truthful UI and reconciliation | Pending verified sender/domain, inbox/budget and provider QA |
| S13 | Tax, destinations, package weights and fallback prices | Agreed charges and accurate disclosures | Business decision plus scoped provider acceptance |

## Delivery Sequence

1. Finish/review this local preparation slice. It does not require the Stripe plugin,
   a new API key, provider resource, DB migration or live checkout.
2. Design the minimal durable attempt/quote/event/financial records, safe ownership,
   retention and state transitions; implement against isolated mocks/DB fixtures.
   Seek fresh shared-DB backup/preflight/migration approval before Railway changes.
3. Implement shared idempotent finalization, atomic attribution and payment-exception
   visibility. Add concurrency/rollback/event/reload acceptance tests that currently
   cannot pass truthfully.
4. Connect the plugin and verify its exact account/sandbox/tools; configure only the
   reviewed supported setup after approval. Do not wait for a plugin to fix missing
   application reliability or assume it will implement those features for us.
5. Execute S01-S13 with explicit controlled sandbox/provider/fixture approvals, then
   review matching source/CI/rollout and real-device/legal/business launch gates.
   No automatic fulfillment or marketing activation is part of this sequence.

References: [Stripe sandbox testing](https://docs.stripe.com/testing),
[API keys and separate webhook secrets](https://docs.stripe.com/keys),
[verified events](https://docs.stripe.com/webhooks),
[payment-method domains](https://docs.stripe.com/payments/payment-methods/pmd-registration),
[existing checkout/receipt design](../architecture/checkout-and-order-email.md).
