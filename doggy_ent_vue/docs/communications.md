# Communications Policy

Email sending must be conservative because provider limits, deliverability, and customer trust matter.

## Manual-First Email Philosophy

Automatically allowed emails:

- Email verification.
- Password reset.
- Welcome email when intentionally enabled.
- Essential security/account messages.

Do not automatically send:

- Order confirmations/receipts, new-order admin notices and failed-payment notices.
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

The 2026-10-10 checkout/email phase removed automatic order/payment/tracking triggers and adds a provider-level operational-event guard. Better Auth verification/reset and intentionally enabled welcome/security messages remain unchanged. Order creation, status Save and tracking Save do not send mail.

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
