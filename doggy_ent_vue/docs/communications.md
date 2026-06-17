# Communications Policy

Email sending must be conservative because provider limits, deliverability, and customer trust matter.

## Manual-First Email Philosophy

Automatically allowed emails:

- Email verification.
- Password reset.
- Welcome email when intentionally enabled.
- Essential security/account messages.
- Order confirmation only if the current business decision explicitly retains it.

Do not automatically send:

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
