# Communications Policy

## Verified-Payment Receipt Exception (2026-10-25)

The owner approves exactly one automatic payment-confirmation receipt after verified
checkout. This supersedes the older blanket receipt prohibition below, not the
manual policy for preparation/shipping/tracking/delivery/support/marketing. Payment
receipt wording must not imply fulfillment approval, shipment, refund or inbox delivery.

The existing template center owns an explicit saved active ORDER_CONFIRMATION
template selection and separate settings Save/Cancel with revision protection.
Modes are DISABLED (default), DRY_RUN (no send), and LIVE. Live additionally requires
`CHECKOUT_RECEIPT_SEND_ENABLED` to be exactly true and a configured non-mock provider.
This Boolean is an operator gate, not automatic DNS/domain-verification proof.
The operator must verify the sending domain and obtain approved-inbox/budget consent
before live QA/activation. No paid plan or email send is authorized by source publication.

The order/stock transaction nests a unique EmailDelivery receipt intent with frozen
server-verified item/price/address/template copy. The 15-second bounded worker claims
QUEUED -> PENDING atomically across instances, sends at most one provider attempt,
and never blindly retries PENDING/FAILED. No historical-order backfill. Off pauses
queued jobs; enabling Live may release previously queued live receipts. Dry records
are never converted to live. SENT means provider acceptance, not inbox delivery;
MOCKED means none sent. Inspect provider activity before any deliberate manual resend.
Processed SENT/MOCKED/FAILED jobs discard the extra frozen body; uncertain PENDING
retains it for review. Receipt/audit retention and disposal need business approval.

Resend remains the existing provider. Its current [free transactional plan](https://resend.com/pricing)
offers 3,000/month with a 100/day shared allowance; security and manual messages also
consume it. Real-customer sends need an [owned verified domain](https://resend.com/docs/dashboard/domains/introduction).
Keep provider credentials/sender/reply address server-side. Do not enable paid overages,
purchase a domain, use a personal Gmail password as SMTP or invent delivery guarantees.
PNG derivatives of the existing monogram/Lucide icons use public HTTPS URLs; inline
table styles and text fallback remain readable with remote images blocked. No mail
client depends on Tailwind, SVG, webfonts or JavaScript. Existing saved copy is not
overwritten by changing suggestions. [Checkpoint](work-checkpoints/2026-10-25-checkout-receipt-email.md)
records actual migration/test/deployment status and remaining activation gates.

Email sending must be conservative because provider limits, deliverability, and customer trust matter.

## Manual-First Email Philosophy

Automatically allowed emails:

- Email verification.
- Password reset.
- Welcome email when intentionally enabled.
- Essential security/account messages.

Do not automatically send:

- Order confirmations outside the narrowly approved verified-checkout receipt path, new-order admin notices and failed-payment notices.
- Order status updates.
- Processing updates.
- Shipping updates.
- Tracking updates.
- Delivered updates.
- Support replies.
- Apologies.
- Promo emails.
- Review requests.
- Issue resolutions.
- General marketing.

These require explicit admin action unless the user later changes this policy.

The 2026-10-10 checkout/email phase removed automatic order/payment/tracking triggers and adds a provider-level operational-event guard. Better Auth verification/reset and intentionally enabled welcome/security messages remain unchanged. Status Save and tracking Save do not send mail. The later verified-checkout receipt exception above is the only new automatic order path.

## Implemented Order Email Workflow

`/admin/email-templates` now provides five rich order-message suggestions, editable saved copies, archive/revision protection, a sandboxed fictional sample preview and explicit Save/Cancel. Plain-text fields use only supported customer-name/order-reference/order-status placeholders. Layout, receipt snapshots and safe tracking come from the server.

Existing Orders detail -> Customer email updates provides saved-template selection, actual recipient/order preview, review confirmation and explicit dry/live action. Default is dry run; sample or unsaved templates cannot send. The server rechecks status/tracking/recipient, admin actor and a 15-minute preview fingerprint before delivery. Identical sends are protected by unique delivery reservation and provider idempotency. Customer notification preferences still apply. Old unpreviewed resend returns 410.

MOCKED means no email; SENT means provider acceptance, not confirmed inbox delivery. FAILED/pending actions require activity/provider review, not repeated blind Send clicks. Explicit failure reconciliation/retry, email-client rendering certification, bulk marketing, promo audience and support/review template workflows remain future work. See [checkout/order email architecture](architecture/checkout-and-order-email.md).

Order-message HTML and text place campaign giving after the receipt total as a separate thank-you. Giving is business-funded, never another charge or proof of beneficiary payout. Beneficiary names come from saved attribution through the canonical presentation helper; values are escaped before HTML output.

## Account-First Communication

Prefer:

- In-account order updates.
- Issue replies.
- Resolution messages.
- Customer-visible case history.

Email should be an optional secondary delivery channel for most operational messages.

## Send Controls

Require:

- Template selection.
- Recipient validation.
- Preview.
- Explicit send action.
- Duplicate-send prevention.
- Rate limiting.
- Permission checks.
- Audit logging.
- Provider-disabled or dry-run behavior.
- Delivery status.
- Safe retry behavior.

## Automatic Email Safeguards

Customer recovery now exposes only `passwordResetAvailable` through GET `/api/customer-auth/readiness`, with no-store caching. The same provider readiness guard rejects native POST `/api/customer-auth/request-password-reset` before account lookup/token creation when delivery is disabled or mocked. Existing customer-auth rate limiting remains. No new env variables are required; existing server-only provider configuration controls readiness.

The reset callback accepts only SENT or an identical previously SENT delivery. Better Auth deliberately masks callback failures behind the same account-independent request response, so the UI says request received/attempted send and gives fallback guidance, never guarantees delivery. Provider acceptance is not inbox delivery. Actual security-email delivery/link QA requires an approved inbox/budget; automated checks intercept requests or use mock delivery only. Operational-email manual-send policy is unchanged.

Even essential automatic emails must:

- Be idempotent when applicable.
- Avoid duplicate sends.
- Never expose tokens in logs or API responses.
- Use short-lived verification/reset tokens.
- Fail safely.
- Provide customer-safe UI feedback.
- Respect rate limits.
- Not claim delivery when provider is disabled.

## Templates

Templates should use validated placeholders such as:

- Customer name.
- Order reference.
- Order status.
- Tracking number.
- Tracking URL.
- Carrier.
- Delivery estimate.
- Promo code.
- Support case number.
- Support reply.
- Action URL.

Unknown or missing placeholders must not render as raw template syntax in customer emails.

## Resend Rules

Preserve existing Resend requirements:

- Server-side only.
- Provider abstraction.
- No keys in client code.
- No secrets in docs or logs.
- Disabled/dry-run mode.
- Test email budget.
- Approved test inbox only.
- No bulk tests.
- Delivery logging when supported.

Live Resend verification requires explicit user approval. Use only the approved inbox, keep the pass under the approved email budget, record each email type sent, and never expose token or provider secret values.

## Shippo Rules

Preserve Shippo requirements:

- Server-side only.
- Test mode unless explicitly approved otherwise.
- No automatic label purchasing.
- No production shipment creation.
- Rate and tracking provider abstraction.
- Idempotent webhook behavior.
- Signature or shared-secret verification when webhooks exist.
- No secret exposure.

Checkout shipping must remain server-owned: the client may select a rate, but server preview, PaymentIntent creation, and order creation must verify the selected amount.

## Excluded Channels

Do not implement Twilio, SMS workflows, SMS preferences, SMS env vars, SMS provider files, or Apple Messages for Business unless the user explicitly requests them later.

## Implemented Run 1 Notes

As of the 2026-06-17 product experience pass:

- Profile saves no longer queue an automatic profile-update email.
- Customer order issue creation does not send email automatically.
- Admin issue status saves, internal notes, and customer-visible account replies do not send email automatically.
- Admin can mark email follow-up requested on an order issue message; support-case email preview/send remains future work. The separate order-email template flow above is now implemented.
- In-account order issue history is the current customer-visible communication channel for support cases.

## Security Email And Provider Privacy Follow-Up (2026-10-11)

Verification/reset dedupe keys are action-specific one-way URL digests: identical requests dedupe, new action links are not permanently suppressed. Persist only hasActionUrl metadata, never the reset/verification URL or token. All native JSON auth endpoints are sanitized. Password-reset expiry/reuse and session revocation are tested with the actual engine in isolated fixtures; no real email was sent.
Admin-triggered verification/reset callbacks now return to the absolute configured frontend origin, not relative backend account routes. Provider-free fixtures verify this wiring. Live links from a temporary local server using Railway DB must remain mocked until public auth origin/signing compatibility and approved email QA are reviewed.

Provider failures store a generic status/reconciliation message and log only safe structured event/code/status, not raw provider response text. Mocked failure tests ensure recipient/action-proof/secret text does not enter logs or delivery errors. Existing persisted historical provider errors were not rewritten.

Manual order email preview/send remains mandatory, actor-bound to the actual ADMIN user ID. Status/tracking saves do not send email. FAILED/pending activity still requires provider reconciliation before retries; no new automatic resend policy was introduced.

Shippo requests now have a 15-second timeout and generic customer-safe failure messages. The acknowledgement-only webhook requires a configured shared secret and fails closed when absent. It is NOT a verified Shippo signature/event-matching/fulfillment implementation; no labels/shipments were purchased. See [audit](audits/2026-10-11-production-audit.md).
