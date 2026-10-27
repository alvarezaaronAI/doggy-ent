# Payment Environments And Launch Controls

## Current Scope (2026-10-27, Hosted Sandbox Testing Enabled)

Reviewed main1738cc7 is verified on the existing Railway API and both Vercel
sites. Saved server/public settings use the expected Chase and Evie Sandbox;
actual staff verification matches that account. The owner's follow-up enables
hosted sandbox creation only; local private defaults remain paused and live
creation remains code-locked. Public configuration, mode rejection, secure card
loading and protected staff context are verified, not an actual sandbox purchase. No new
hosting resource, database, migration or provider transaction is introduced. See
the [final checkpoint](../work-checkpoints/2026-10-26-payment-environment-safety.md).

One checkout implementation serves separately configured environments. Assistant
Stripe access includes a live account and a separate sandbox, but never configures
website keys by itself. Current work adds isolation safeguards and read-only admin
context, not durable checkout/webhook recovery or real-payment launch acceptance.

The owner delegates the testing-target choice. Start with local API/local DB and
the connected sandbox: no new hosting cost and no shared test orders. Before real
customers, provision an explicitly approved isolated hosted test API/database and
point preview storefront/admin deployments only at that target. Never connect a
sandbox frontend to a live backend or assume Vercel Preview isolates Railway data.
No separate hosted resource or database mutation is performed by this source
implementation. The later owner-authorized configuration stage updates the existing
Railway server settings and Vercel storefront public key. The later single-flag
enablement allows manual test-card checkout, never real-money sales. The existing
testing database still receives any order/stock changes when a test purchase is
completed. Receipt settings stay off and test-product purchase guards stay intact.

## Configuration Names

No server keys belong in docs, source, logs, screenshots or chat. Dedicated local
runtime overrides are Git-ignored and owner-only; their server key starts empty.
No env example or credential file is tracked. Configure credentials privately in
their exact environment/hosting target.

| Target | Variable | Meaning |
| --- | --- | --- |
| API, new | PAYMENT_MODE | Explicit sandbox or live; anything else is unconfigured |
| API, new | PAYMENTS_ENABLED | Exact true/false; absent defaults off; controls new intent creation only |
| API, new | STRIPE_EXPECTED_ACCOUNT_ID | Intended account identity, confirmed against Stripe, not a dashboard-link setting |
| API, existing | STRIPE_SECRET_KEY | Matching server-only Stripe credential; prefer restricted access with required payment and own-account read permissions |
| Storefront, existing | VITE_STRIPE_PUBLISHABLE_KEY | Public key for the same account/environment; never a server credential |
| Storefront, existing | VITE_API_BASE_URL | API for this deployment's environment; existing VITE_API_URL compatibility alias remains |
| API, future | STRIPE_WEBHOOK_SECRET | Separate signing secret for the supported signed-event endpoint; no handler uses it yet |

Local commands (two terminals from the application directory):

```sh
npm --prefix server run dev:stripe-sandbox
npm --prefix client run dev:stripe-sandbox
```

The private runtime files are server/.env.stripe-sandbox.local and
client/.env.stripe-sandbox.local. They override only payment settings, leaving the
older local/Railway credentials untouched. The local API uses3010 and its frontend
uses127.0.0.1:5175, with matching auth/return origins and explicit local DB validation.
They do not replace ordinary development on3000/5173. Production NODE_ENV cannot
silently turn this command into a deployed-data target. Email is mocked and the
automatic live-receipt gate is false in this startup mode. Do not add DB/auth values
to these private payment overrides or start shared-data tests through this command.

Owner-supplied matching sandbox settings are now in both private local overrides
and their existing hosting targets. The server key is server-only; Vercel receives
only the public key. Own-account verification confirms the new server identity and
public-asset inspection matches the supplied sandbox public key. The older local
server credential is a different test account and is not reused. Actual paired
payment acceptance is still pending: prefix/account checks alone do not prove it.

Mode is deployment configuration, not a customer input that selects credentials.
The frontend sends only its derived mode with intent creation. Server config owns
the account and credentials and rejects omitted/mismatched modes before pricing.
Matching key prefixes alone do not prove an account pair: actual same-account
sandbox checkout remains an acceptance requirement. Never send a secret key or
the public key itself in the checkout body.

## Server Enforcement

Missing/malformed configuration fails closed without preventing the rest of the
application from starting. Stripe construction is lazy, uses an8second timeout and
no SDK network retries. Own-account verification is coalesced across simultaneous
reads, cached for at most30seconds on success or5seconds on failure, and scoped to
the exact credential, mode and expected account. Failed reads never reuse earlier
verified evidence. Restricted credentials without own-account read access fail
verification; do not silently fall back to a different credential or account.

Every new intent requires explicit enabled configuration, matching frontend/server
mode, matching retrieved Stripe account and confirmed charge capability. Returned
and retrieved intents must contain the matching livemode Boolean. These checks are
not a durable attempt identity, frozen quote, creation idempotency or financial
ledger; those source blockers remain in the [payment plan](../prelaunch/payment-readiness.md).

Live creation is additionally code-locked by LIVE_PAYMENTS_SUPPORTED=false. No
environment flag or UI action bypasses it. Removing that lock requires a reviewed
implementation with durable quote/attempts, signed events, replay/recovery, atomic
attribution and agreed admin financial/status safety, then sandbox/device/business
acceptance and explicit owner launch approval. Tests passing alone never activates
real charging.

Pausing creation does not disable retrieval/verification of already-paid intents.
Keep the matching deployment credentials available for existing payments. Do not
switch a live backend to sandbox credentials as rollback. Future signed-event
processing must continue while new payments are paused; no handler exists yet.

## Public And Staff Contracts

- GET /api/checkout/payment-configuration is no-store/rate-limited and returns only
  mode, Boolean availability and safe customer copy. Incomplete/paused/live-locked
  configuration performs no Stripe read. Valid sandbox reads share the bounded
  verification cache. No expected/actual account, credential or provider payload
  is public. A failed read is unavailable, never implicitly enabled.
- Card/wallet lazy SDK initialization first requires this public response and a
  matching valid publishable-key mode. POST creation rechecks authoritatively; an
  earlier mounted form or remembered availability does not bypass a later pause.
  Presentation previews stay inert; absent keys load no SDK or configuration API.
- GET /api/admin/payments/environment requires the existing gateway and persisted
  ADMIN/ACTIVE session. Its explicit safe projection supplies configured mode,
  credential mode, expected/actual account ID, verification/check time, charge
  capability and blockers. No raw account/business/bank/PII/key/provider response.
- The protected Vercel gateway forwards only GET/HEAD for this exact new path.
  It adds no charge/refund/mode-toggle or generic payments proxy.
- Shared admin context shows the mode and verification separately, with expandable
  details and deliberate refresh. Unavailable/stale data is not a ready badge.
  Account verification is not certification of live checkout, wallets or payouts.

Historical orders do not gain inferred modes or verified refund amounts from this
badge. Existing dashboard-link preferences remain convenience links only. Durable
payment records and reporting separation need their own additive migration and
ownership/retention/backup approval; no schema is changed by this slice.

## Ordered Configuration And Launch

1. Finish this source slice, automated checks, independent review and isolated UI
   acceptance. Record the exact source and unverified provider/hosting gates.
2. Privately configure the new names and matching sandbox credentials on the local
   test target. Confirm local API -> loopback DB before any sandbox purchase. Keep
   mail mocked/off and permanent test-product guards intact. Use a deliberately
   approved sellable local fixture, not real customers/shared data.
3. Implement reliable checkout/event/financial contracts against isolated fixtures.
   Obtain separate backup/preflight/migration approval before shared DB changes.
4. Configure the supported signed sandbox endpoint only after it exists; test
   guest/member/card/wallet/decline/3DS/retry/lost-connection/event/race/refund and
   receipt behavior. Verify exact wallet domains and actual devices.
5. Prepare approved isolated hosted test targets. Preview credentials/API/DB must
   never inherit live configuration. Production remains separate and new payments
   paused. Review business activation/support details, tax/shipping, real stock,
   backups/restore, monitoring, privacy/policies and receipt sender/inbox approval.
6. With explicit launch approval, stage matching production live configuration and
   supported signed-event secret, deploy the accepted release, verify with new
   creation paused, then deliberately enable it. Do not migrate sandbox Stripe
   objects/orders into financial production evidence. Real charges require their
   own owner-approved acceptance, not automated test execution.
7. Rollback pauses new payments while preserving existing payment/order/event
   processing and manual operations. Investigate exceptions without charging again
   or automatically refunding/shipping/emailing customers.

References: [Stripe sandboxes](https://docs.stripe.com/sandboxes),
[go-live checklist](https://docs.stripe.com/get-started/checklist/go-live),
[server-side payment status](https://docs.stripe.com/payments/payment-intents/verifying-status),
[API credential management](https://docs.stripe.com/keys).
