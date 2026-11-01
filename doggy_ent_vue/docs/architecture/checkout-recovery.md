# Checkout Recovery

## Rollout Status

2026-10-31 source is deployed on Railway and both Vercel sites at main2d395d5,
with recovery intentionally disabled. Existing Sandbox testing uses the legacy
flow until the owner's later coordinated provider setup/activation.
The [checkpoint](../work-checkpoints/2026-10-31-payment-recovery.md) records exact
approval, source, database, provider and deployment evidence. Owner approves the
fresh-backed-up additive Railway migration and defers Stripe setup. This release
keeps recovery off; do not create an endpoint or configure its secret. Live charging
remains source-locked; passing these tests does not certify launch.

## Saved Agreement And Retry Identity

The browser generates a UUIDv4 attempt and a random 256-bit capability before
payment preparation, and saves only that handle, its seven-day access expiry and
a bag fingerprint in browser storage. No address, card number, Stripe client secret
or full checkout snapshot is placed there by recovery. The saved capability is
sensitive on shared devices and is never a URL/query, log, account session or admin
credential. The server stores only its SHA256 hash and checks it in constant time.
This handle supports reload/tab-close recovery; receipt proofs remain separately
reference-scoped and short-lived. Clearing browser storage loses guest recovery;
it does not cancel/refund a payment or erase an order.

Server preparation re-resolves the real catalog and validates the customer's
information, delivery, promo and payment environment. It stores trusted product/
variant identities, integer-cent payment total, currency, account/mode, immutable
contact/delivery/quote/tax facts and frozen promo/giving attribution before Stripe
creation. Browser prices and discount/tax/donation values are not authoritative.
Repeated preparation requires the same capability and canonical input; even a
same-total address change cannot replace a saved payment agreement.

Stripe creation uses an attempt-derived idempotency key and bounded metadata
binding the attempt/input hash. An ambiguous creation retries exactly that request
for at most12hours, deliberately shorter than Stripe's24-hour key retention. It
never uses an old key to create a replacement payment after that window. The
30-minute quote expiry prevents further unpaid confirmation; canonical cancellation
must finish before a customer starts a new payment. Cancellation racing success
finalizes the original paid order. Unknown/processing/review outcomes never invite
a second payment. Provider client secrets are returned only for an authorized
confirmable attempt and are never persisted in application storage.

## API Boundaries

All recovery responses are no-store and use a safe allowlist, not the stored JSON.
Guest operations require `X-Checkout-Recovery`, not an attempt ID alone.

| Endpoint | Responsibility |
| --- | --- |
| POST /api/checkout/create-payment-intent | Prepare/reuse the saved agreement and its payment; body carries the new attempt ID/capability. |
| GET /api/checkout/attempts/:id | Authorize and reconcile canonical payment status; never creates or confirms a payment. |
| POST /api/checkout/attempts/:id/finalize | Reconcile and idempotently complete the saved payment without resubmitting mutable checkout data. |
| POST /api/checkout/attempts/:id/cancel | Cancel/recheck an unpaid intent; a successful race completes the original order instead. |
| POST /api/payments/stripe/webhook | Verify exact raw bytes/signature; save minimized relevant event IDs for asynchronous recovery. |
| GET /api/admin/payments/recovery | Gateway plus fresh ACTIVE ADMIN read-only review list; no charge/refund/send action. |

While the feature is off, existing legacy signed checkout proofs remain supported.
When enabled, old preparation requests without a durable identity fail before
creating a payment and require reload. Old paid-proof finalization remains for
in-flight legacy payments; legacy intents cannot be rebuilt from a webhook alone.

## Recovery And Atomic Completion

Raw webhook parsing precedes Express JSON parsing, with a100KB limit. Stripe's
signature timestamp tolerance and secret verify authenticity before any inbox
lookup/write. Wrong mode/account and invalid signatures fail. Accepted events are
limited to PaymentIntent succeeded, processing, payment_failed and canceled. The
inbox stores event/type/payment/account/mode/attempt routing facts only, never the
raw payload, card data, receipt email or client secret. Event ID uniqueness absorbs
delivery replay. Conflicting payment/input-hash routing is quarantined without an
attempt relation, so it cannot mark the legitimate payment as needing review.
Unmatched legacy events are ignored, not converted into orders.

The bounded worker scans at most20events and20attempts per15-second tick, avoids
local overlap, and uses expiring database compare-and-set leases across instances.
It retrieves the canonical intent and verifies account/mode, metadata, amount,
currency, received amount and tax calculation. Event order is not payment truth.
An event can recover a provider-created intent whose ID was not yet saved locally.
New-payment pause does not disable matching-account retrieval or paid recovery.

One Serializable transaction writes paid order/items, conditional stock deductions,
promo usage/counters, campaign usages/counters, optional saved receipt intent and
attempt completion. Replays read the completed order before stock work. Unique
payment/order and usage/receipt keys remain permanent guards. Serialization retries
are bounded; no provider calls run inside the transaction. Frozen attribution on
the order preserves receipt history after campaign/promo wording changes/deletion.

Stock and promo capacity are not reserved before payment in this phase. A paid
checkout that loses stock/capacity or has an invalid/missing frozen resource rolls
back all fulfillment/accounting effects and becomes a durable review case. Staff
must reconcile Stripe manually before a fulfillment/refund decision. This is not
an automatic refund system or a guarantee of entitlement under contention.

## Configuration And Safety

Only server configuration names: `CHECKOUT_RECOVERY_ENABLED` defaults false;
`STRIPE_WEBHOOK_SECRET` is the separate endpoint signing credential and is required
when enabled. Existing mode/account/key settings remain authoritative. Tax stays off,
automatic live receipts stay off, and preparation/shipping/marketing sends remain
manual. No new customer/provider secrets belong in Vercel client variables.

The additive migration adds recovery/event tables and nullable historical
attribution without rewriting old orders. Before Railway: explicit approval,
fresh private decoded backup, exact target/history/checksums and preservation
preflight. Startup runs migration deploy, so do not release pending migrations
casually. Configure the approved Sandbox endpoint only after the tested HTTPS
handler is deployed, then enable recovery after verification. Keep creation paused
during cutover if needed; retain the same account's credentials for old payments.
Do not roll back by switching payment modes or dropping tables.

Starting new durable confirmation requires the browser Web Locks API; unavailable
or busy locks block a new payment but not status/receipt recovery. Storage events
alone are not an atomic cross-tab lock. Actual browser/device acceptance is pending.

The seven-day capability is an access limit, not a storage-retention policy.
Abandoned snapshots contain necessary checkout personal data. Retention, disposal,
erasure and support verification need business/privacy decisions before1.0. No
startup purge, broad behavioral tracking or incentive/marketing consent is added.
Real Sandbox payment, duplicate delivery, device/3DS/wallet and inbox acceptance
remain separate from mocked provider and isolated-Postgres evidence.
