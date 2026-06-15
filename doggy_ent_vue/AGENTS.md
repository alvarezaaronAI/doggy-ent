# Doggy Ent Agent Playbook

This file is the permanent operating guide for Codex/agent work on the Doggy Ent commerce app. Keep it concise, durable, and action-oriented. Do not keep appending large one-off phase prompts here. Put detailed phase specs, QA checklists, and architecture docs under `docs/`, then summarize only the permanent rules here.

## 1. Required Starting Steps

Before any code change, the agent must:

1. Read this `AGENTS.md`.
2. Read `PROJECT_HANDOFF.md` if it exists.
3. Inspect the current repository state instead of trusting old assumptions.
4. Run `git status`, `git diff --stat`, and `git diff --name-status` when continuing previous work or verifying interrupted edits.
5. Separate confirmed issues from uncertain risks.
6. Avoid committing or pushing unless the user explicitly asks.

Before starting a new major phase, check whether `PROJECT_HANDOFF.md` and `docs/architecture/` need updates.

## 2. Documentation and Handoff Rules

The agent must maintain project knowledge transfer documentation.

Whenever a major phase is completed, such as Admin Cleanup, Server Cleanup, Checkout Cleanup, Products Cleanup, Debugging Pass, QA Pass, Accounts, Email, Tracking, or Security Hardening, update:

```text
PROJECT_HANDOFF.md
```

The handoff must document:

- Business overview.
- Client architecture.
- Server architecture.
- Database overview.
- Stripe/payment flow.
- Admin system overview.
- Completed refactors.
- Remaining work.
- Launch readiness assessment.
- Important file index.
- End-to-end flow maps.
- API endpoint inventory.
- Environment variables and deployment notes.
- Build/test/verification commands.
- Known risks and manual QA checklist.
- Current git state and recent commits.
- Dependency and integration map.
- Data ownership/source-of-truth map.

For important files and domains, document purpose, responsibilities, inputs/outputs, dependencies, and how the file participates in the application flow.

For API routes, document method, route path, handler/controller, service, repository/database file, request payload shape, response shape, error behavior, and client callers.

The handoff must call out uncertainty clearly. If something was not verified from code or commands, say so instead of guessing.

## 3. Architecture Rules

Follow the existing project architecture.

Server pattern:

```text
route → controller → service → repository → Prisma
```

Client pattern:

```text
view → composable/service/api → mapper/validator/utils/components
```

Rules:

- Do not rewrite the app from scratch.
- Do not perform broad speculative refactors.
- Do not remove working features.
- Keep views thin.
- Keep components focused.
- Keep API logic separated from UI.
- Keep mappers separated from validators.
- Keep shared utilities in shared folders only when reused across domains.
- Avoid oversized god files.
- Avoid micro-components for trivial logic.
- Preserve storefront, checkout, admin, and account UX unless a UI change is required to fix a verified bug.

When touching a previously refactored domain, audit the surrounding files for duplicated logic, oversized files, broken imports, and mismatched domain boundaries. Make only small corrective extractions when needed.

## 4. Environment and Secrets Policy

This project uses local `.env` files for local development and Railway/Vercel dashboard variables for deployed environments.

Rules:

- Do not create `.env.example` files unless the user explicitly asks.
- If a previous pass created `client/.env.example` or `server/.env.example`, remove those files unless the user explicitly says to keep them.
- Do not commit `.env`, `.env.local`, `.env.production`, or any file containing real secrets.
- Do not copy secret values into `PROJECT_HANDOFF.md`, `AGENTS.md`, docs, comments, logs, or examples.
- Document environment variable names only, with placeholder descriptions.
- Provider keys must be read server-side only.
- Never expose Stripe, Resend, Shippo, database, auth, session, reset-token, verification-token, or admin secrets to Vue/client code.

Important deployment variable names to document only:

Server/Railway:

- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `FRONTEND_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `STRIPE_SECRET_KEY`
- `DATABASE_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO_EMAIL`
- `SHIPPO_API_TOKEN`
- `SHIPPO_WEBHOOK_SECRET`

Client/Vercel:

- `VITE_API_BASE_URL`
- `VITE_API_URL` if still supported as a backward-compatible alias
- Stripe publishable key variable used by code
- Public-only display/config variables

## 5. Verified Repair / Launch-Blocker Pass

When asked to fix anything broken, repair the project, audit issues, make sure everything works, or perform launch readiness cleanup, treat it as a verified repair pass, not a cosmetic refactor.

Prioritize fixes in this order:

1. Production data safety.
2. Payment and checkout correctness.
3. Order creation correctness.
4. Admin authorization and protected routes.
5. Client/server/API mismatches.
6. Database/schema/repository mismatches.
7. Broken imports or build failures.
8. Environment/deployment mismatches.
9. Dead duplicate checkout/payment code.
10. Documentation accuracy.

Launch-critical risks to audit:

- Stripe PaymentIntent amount must be based on trusted server-side pricing, not client totals.
- Checkout preview, PaymentIntent creation, and order creation must use consistent server-owned totals.
- Shipping, tax, discount, donation, and final total cannot be client-spoofed.
- Order creation must be idempotent and must not create duplicate orders for the same successful payment.
- Inventory must only be reduced after successful verified payment and only once.
- Promo validation must reject invalid, expired, over-limit, or email-ineligible promos.
- Promo usage must not be double-counted under retries.
- Campaign donation totals and usage must be recorded server-side and not client-spoofed.
- Admin-only endpoints must require server-side admin authentication.
- Customer-owned endpoints must enforce ownership.
- Production startup must never delete, reset, or reseed live data.
- Prisma schema fields must match repository/service code.
- Checkout, payment, and order success flows must not rely on stale mock data.

Required verification after fixes:

- Run client build if available.
- Run server build/start/syntax checks if available.
- Run `npx prisma generate` if Prisma is used or schema/client usage changed.
- Run available lint scripts.
- Run available test scripts.
- If lint or test scripts are missing, document that clearly.
- Check for broken imports.
- Check client/server endpoint mismatches.
- Check checkout flow from cart → pricing preview → promo validation → Stripe payment intent → order creation → order success page.
- Check admin flows for products, promos, campaigns, orders, customers, and order detail when touched.
- If a command fails, fix it and rerun it, or document why it could not be fixed.

Required final report:

1. Issues found, grouped by severity.
2. Issues fixed.
3. Files changed.
4. Commands run and exact results.
5. Remaining risks or unverified areas.
6. Manual QA checklist.
7. Whether edits are safe for commit review.
8. Next safest phase.

The repair pass is not complete until code changes are verified and `PROJECT_HANDOFF.md` is updated.

## 6. Interrupted Session / Draft Edit Verification

When a previous Codex run ended because of credits, rate limits, timeout, interruption, or an inconsistent progress checklist, do not assume the prior summary is correct.

If local edits exist, treat them as draft repair changes until verified.

Before making new changes:

1. Read `AGENTS.md`.
2. Read `PROJECT_HANDOFF.md` if it exists.
3. Run `git status`.
4. Run `git diff --stat`.
5. Run `git diff --name-status`.
6. Identify whether the previous pass completed every claimed step.
7. Reconcile any mismatch between checklist, final report, and repository state.

High-risk files to verify first when present in local edits:

- `server/src/domains/checkout/services/checkout.service.js`
- `server/src/domains/payments/controllers/payment.controller.js`
- `server/src/domains/payments/services/stripe.payment.js`
- `server/src/domains/orders/services/orders.service.js`
- `server/src/domains/orders/repositories/orders.repository.js`
- `server/src/domains/orders/routes/orders.routes.js`
- `server/prisma/schema.prisma`
- `client/src/domains/checkout/views/CheckoutView.vue`
- `client/src/domains/payments/components/StripeElementsForm.vue`
- `client/src/domains/admin/api/adminOrders.api.js`
- `client/src/domains/admin/views/AdminOrderDetailView.vue`

Only edit files when a verified bug, incomplete repair, broken import, failed build, failed schema check, or unsafe edge case is found.

## 7. Deployment Rules: Vercel, Railway, SPA, API, Cookies

When deployed Vercel behavior differs from local behavior, verify deployment routing before changing business logic.

### API 404 / Backend Host

Known symptom: Browser requests go to `https://doggy-ent.vercel.app/api/...` and return 404 for endpoints such as:

- `/api/checkout/preview`
- `/api/campaigns/preview`
- `/api/promos/validate`
- `/api/checkout/create-payment-intent`

Required checks:

1. Is the frontend supposed to proxy `/api` through Vercel?
2. Is the backend on Railway or another host?
3. Which client env variable is actually consumed: `VITE_API_BASE_URL`, `VITE_API_URL`, or both?
4. Does Vercel define the required public client variable?
5. Does API error handling safely handle non-JSON responses such as Vercel 404 HTML?

Rules:

- Do not change Stripe card logic until API routing is verified.
- Do not assume `/api` works on Vercel unless a valid rewrite/proxy exists.
- Preferred strategy: local dev may default to `/api`; deployed builds should use `VITE_API_BASE_URL` to call the live backend origin.
- Do not hardcode Railway, Vercel, localhost, or production backend URLs in source code.
- Document the final deployment expectation in `PROJECT_HANDOFF.md`.

### Vercel SPA Fallback

When direct deployed routes such as `/admin`, `/admin/login`, `/checkout`, or `/orders/:id` return Vercel `404: NOT_FOUND`, treat it as a static SPA fallback issue.

Preferred Vercel rewrite when frontend is a static Vite SPA:

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

Rules:

- Do not change admin auth until SPA fallback is verified.
- Do not rewrite `/api/...` to `index.html` unless the API strategy explicitly supports that.
- Verify whether Vercel root is repository root or `client` directory before deciding where `vercel.json` belongs.

### Admin Auth Session Stabilization

When deployed admin login accepts credentials but `/api/auth/me` returns 401, stabilize the current custom admin auth before any Better Auth migration.

Audit:

- Login `Set-Cookie` behavior.
- Cookie attributes for cross-site Vercel → Railway usage, including `SameSite=None` and `Secure` in production.
- Whether cookies are `HttpOnly`.
- Server CORS credentials config.
- Exact allowed frontend origins from `CLIENT_URL`, `FRONTEND_URL`, or allowlists.
- Whether Vercel/Railway origins match exactly.
- Whether all auth/admin requests send credentials.
- Whether router guards wait for auth verification before redirecting.

Rules:

- Do not rebuild the admin dashboard.
- Do not weaken auth just to make login work.
- Do not introduce Better Auth for admin unless explicitly requested.
- The future Better Auth migration should preserve the admin dashboard and later use roles such as `ADMIN` and `CUSTOMER`.

## 8. Local Admin Data Target Modes

When deployed Vercel/Railway cross-site cookies make admin auth unreliable, use the temporary local admin workflow:

1. Fully local mode:
   - Local client/admin calls local server.
   - Local server writes to local database.
   - Flow: `localhost:5173 → localhost server → local DB`.

2. Railway-data local admin mode:
   - Local client/admin calls local backend.
   - Local backend connects to Railway database through local-only server env.
   - Flow: `localhost:5173 → localhost server → Railway DB → Vercel storefront`.

Rules:

- Do not prefer local frontend → Railway backend for admin CRUD because it can still trigger cross-site cookie issues.
- Choose the data target through startup scripts/env, not runtime UI buttons.
- The admin UI should show a visible data target badge such as `LOCAL DATA TARGET` or `LOCAL SERVER → RAILWAY DB`.
- Do not commit local Railway database URLs or secrets.
- Document exact commands and safe manual QA in `PROJECT_HANDOFF.md`.

Expected scripts to verify or maintain:

- Client local admin script such as `npm run dev:local`.
- Server local DB script such as `npm run dev:local`.
- Server Railway DB script such as `npm run dev:railway`.

## 9. Prisma and Railway Migration Safety

When a Prisma migration exists locally but may not be applied to Railway or another shared database, treat migration deployment as a verified database operation.

Rules:

- Do not use `prisma migrate reset` on Railway, production, staging, or any shared database.
- Do not use destructive migration commands unless the user explicitly asks and understands data loss.
- Do not apply Railway/production migrations automatically unless the user explicitly asks.
- For local development, `npx prisma migrate dev` is acceptable.
- For Railway/production-like deployment, use `npx prisma migrate deploy` only after preflight checks pass.

Required duplicate preflight query before applying a unique `stripePaymentIntentId` constraint to any deployed database:

```sql
SELECT "stripePaymentIntentId", COUNT(*)
FROM "Order"
WHERE "stripePaymentIntentId" IS NOT NULL
GROUP BY "stripePaymentIntentId"
HAVING COUNT(*) > 1;
```

Useful local verification:

```bash
cd server
npx prisma migrate status
npx prisma generate
```

Document whether migrations are applied locally, whether Railway is verified, and what deployment steps remain.

## 10. Checkout, Promos, Campaigns, Orders

Checkout and pricing are high-risk business logic.

Rules:

- Server owns subtotal, discount, shipping, tax, donation, and total.
- Client totals are display/input only and must not be trusted.
- Promo codes and campaign donations must be able to coexist unless a documented business rule says otherwise.
- Email-limited promos require customer email before validation.
- Customer email must be normalized with trim + lowercase on client payloads and server validation.
- If checkout email changes after a promo is applied, clear or revalidate the promo.
- Promo usage limits must be enforced server-side.
- Promo analytics must record and display the actual discount given.
- Campaign donation totals and order attribution must be persisted or clearly documented if unavailable.

Required QA when touching pricing:

- Checkout with promo only.
- Checkout with campaign only.
- Checkout with promo + campaign together.
- Verify subtotal, discount, donation, tax, shipping, and final total.
- Verify final order, order success page, admin order detail, and promo analytics agree.

### Promo Discount Bug Pattern

If a promo validates but shows `$0.00` discount, audit:

- Promo schema and stored values.
- Whether percent is stored as `20` or `0.2`.
- Fixed amount units: dollars vs cents.
- Minimum subtotal units.
- Promo validation service.
- Checkout preview service.
- Final order creation and promo usage recording.
- Admin promo analytics mapper/service/UI.

A valid non-zero promo must not show success with zero discount unless that is intentionally configured and clearly shown to admin/customer.

### Order Status History

Order status updates should be future-proof:

- Status changes should not save immediately from a dropdown.
- Admin selects a new status.
- Admin explicitly clicks Save.
- Admin can cancel before saving.
- Show last status update timestamp.
- Show last status change summary.
- Prepare attribution for future Better Auth users.

Preferred future model:

```text
OrderStatusHistory
- id
- orderId
- fromStatus
- toStatus
- note
- changedByType
- changedBy
- createdAt
```

Until Better Auth exists, `changedByType` may use `SYSTEM` or `ADMIN_ENV`. Do not pretend real admin-user attribution exists.

## 11. Storefront and Cart Source of Truth

When a product card adds the wrong variant/size to cart, treat it as a cart source-of-truth bug.

Rules:

- Product card and quick view must use the same selected variant source of truth.
- Prefer variant id as the cart source of truth.
- Label, size, price, and inventory should derive from the selected variant.
- Do not hardcode variant order such as always first or always 18 oz.
- Preserve cart drawer and checkout behavior.

Required QA:

- Select `6 oz` on product card and confirm cart shows `6 oz`.
- Select `18 oz` on product card and confirm cart shows `18 oz`.
- Repeat from quick view.
- Confirm cart price and checkout preview match selected variant.

When featured product image/title should not be clickable, remove only unintended click/navigation behavior and preserve size selection and Add to Cart.

## 12. Orders, Donation Traceability, and Post-Checkout UX

When working on admin orders, donation totals, campaign attribution, or post-checkout success page, treat it as a focused orders/traceability pass.

Admin order detail should show, when available:

- Short customer-friendly order reference.
- Internal order id for admin only if useful.
- Customer name, email, phone, and shipping address.
- Items with product, variant, quantity, unit price, line total.
- Pricing breakdown: subtotal, discount, promo, shipping, tax, donation, total.
- Campaign/donation attribution.
- Payment summary and Stripe PaymentIntent id for admin only.
- Fulfillment/order status and timeline.
- Other orders from the same customer email if implemented.

Customer order success page should show:

- Clear order confirmed message.
- Friendly order reference, not a giant raw internal id.
- Confirmation email message/status if supported.
- Item summary.
- Pricing breakdown.
- Shipping/fulfillment expectation.
- Support/contact guidance.
- Continue shopping link.

Avoid sending customers to a stale or empty cart after checkout unless there is a clear reason.

## 13. Customer Accounts and Better Auth Roadmap

Customer accounts are the preferred path for account features, order history, saved addresses, notification preferences, loyalty, and future admin roles.

Rules:

- Preserve guest checkout.
- Better Auth should support customer accounts first and later replace/absorb custom admin auth only when the dashboard is stable.
- Customer account endpoints must enforce ownership.
- A customer must not access another customer’s orders, profile, addresses, support requests, tracking, notification settings, loyalty data, or reviews.
- Admin routes must remain protected server-side.
- Password reset and verification tokens must be short-lived and never logged or returned in API responses.

Customer account pages may include:

- Sign in.
- Create account.
- Forgot password.
- Reset password.
- Account dashboard.
- Profile.
- Orders.
- Order detail.
- Addresses.
- Notification preferences.
- Loyalty/referrals later.

## 14. Customer Communications, Email, Tracking, and Security Hardening

When working on customer notifications, transactional email, shipping/tracking, customer account preferences, order updates, or security hardening, treat it as a staged production-readiness system.

Important: Twilio/SMS is intentionally excluded from the next implementation phases. Do not implement Twilio, SMS workflows, SMS preferences, SMS env vars, or SMS provider files unless the user explicitly re-adds SMS later.

Primary goals:

- Add secure transactional email through Resend.
- Add shipping/tracking readiness through Shippo.
- Keep providers server-side behind abstractions.
- Protect customer, order, auth/session, and provider secret data.
- Preserve guest checkout, customer accounts, checkout flow, admin dashboard, and existing order creation.

### Phase 1: Resend Email

Resend is the preferred transactional email provider.

Supported email types to prepare for:

- Account verification email.
- Resend verification email.
- Password reset email.
- Welcome email.
- Order confirmation email.
- Order status update email.
- Tracking/shipping update email.
- Delivered email.
- Review request email.
- Support/order-help email.

Architecture rules:

- Keep Resend server-side only.
- Do not call Resend from Vue/client code.
- Do not expose Resend API keys to the client.
- Put provider-specific logic behind a mail provider abstraction.
- Keep email payload builders/templates separate from provider sender.
- Support disabled/dry-run behavior when real email env vars are missing.
- Do not pretend emails were sent if the provider is disabled.
- Use safe structured payloads: recipient email, customer name, order reference, totals, status, tracking URL if available, and action URLs.
- Never log reset tokens, verification tokens, auth sessions, customer passwords, Stripe secrets, or provider API keys.

Suggested server organization:

```text
server/src/domains/notifications/
server/src/domains/notifications/constants/notificationEvents.constants.js
server/src/domains/notifications/services/notificationDispatcher.service.js
server/src/domains/notifications/repositories/notificationEvents.repository.js
server/src/domains/emails/providers/resendEmail.provider.js
server/src/domains/emails/services/emailTemplate.service.js
server/src/domains/emails/mappers/emailPayloads.mapper.js
```

Suggested env variable names to document only:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO_EMAIL`
- `FRONTEND_URL`

### Phase 2: Shippo Tracking

Shippo is the preferred shipping/tracking provider unless the user chooses another provider later.

Supported tracking concepts:

- Carrier.
- Tracking number.
- Tracking URL.
- Tracking status.
- Tracking event history.
- Estimated delivery date.
- Shipped timestamp.
- Delivered timestamp.
- Provider webhook payload snapshot if safe.
- Admin tracking entry/update readiness.
- Customer order-detail tracking timeline.

Architecture rules:

- Keep Shippo server-side only.
- Do not call Shippo from Vue/client code.
- Do not expose Shippo API keys to the client.
- Put provider-specific logic behind a tracking provider abstraction.
- Store tracking data so customer order pages, admin order pages, and notifications can consume it safely.
- Preserve historical order records and address snapshots.
- Do not blindly overwrite order status from provider webhooks.
- Use idempotent webhook handling when webhooks are implemented.
- Do not implement label purchasing or fulfillment automation unless explicitly requested.

Suggested data models or extension points:

```text
OrderTracking
- id
- orderId
- provider
- carrier
- trackingNumber
- trackingUrl
- status
- estimatedDeliveryAt
- shippedAt
- deliveredAt
- lastProviderEventAt
- createdAt
- updatedAt

OrderTrackingEvent
- id
- orderTrackingId
- providerEventId
- status
- message
- location
- occurredAt
- rawPayload only if safe and not overly sensitive
- createdAt
```

Suggested env variable names to document only:

- `SHIPPO_API_TOKEN`
- `SHIPPO_WEBHOOK_SECRET`

### Notification Preferences

Customer profile/account settings should prepare for communication preferences.

Future preferences may include:

- Transactional email enabled.
- Marketing email opt-in.
- Order status email updates.
- Tracking email updates.
- Review request email opt-in.

Rules:

- Transactional order/account emails may be handled separately from marketing opt-in, but document that clearly.
- Marketing messages require explicit opt-in.
- Preference changes should be auditable or timestamped when implemented.
- Extend existing `CustomerNotificationPreference` if present instead of creating duplicate sources of truth.
- Consider `NotificationEvent` and `NotificationDeliveryAttempt` for outbound messages, provider status, errors, and retries.

Potential notification event fields:

```text
id
customerId
orderId
channel: EMAIL or IN_APP
eventType
provider
recipient
status
providerMessageId
errorCode
errorMessage
sentAt
createdAt
updatedAt
```

### Security Hardening for Communications and Tracking

Security audit scope when adding email/tracking/account/admin customer features:

1. Authentication and session handling.
2. Better Auth customer endpoints.
3. Custom admin auth endpoints if still present.
4. Account/customer profile endpoints.
5. Checkout and order creation endpoints.
6. Admin customer/order endpoints.
7. Notification/email/tracking endpoints.
8. Webhook endpoints.
9. Provider secret handling.
10. CORS and allowed origins.
11. Cookie attributes.
12. Rate limiting.
13. Input validation and output sanitization.
14. Authorization and ownership checks.
15. Logging and error handling.
16. Dependency/package risk.

Required checks:

- Customer-owned resources enforce ownership.
- Admin APIs require admin auth server-side.
- Checkout remains server-owned for totals.
- Provider secrets are server env only.
- Provider secrets and sensitive tokens are never logged.
- Password reset and verification tokens are not exposed in responses.
- Webhook endpoints validate provider signatures/secrets when implemented.
- Notification send/resend endpoints cannot be abused to spam customers.
- Rate limiting exists or missing coverage is documented.
- CORS and credential settings match deployment needs.
- Cookies use secure production settings.
- Error messages are useful but do not leak internals.
- No `.env.example` files or docs contain real secrets.

Security measures to consider if missing:

- Rate limiting for auth, password reset, resend verification, support messages, manual notification send/resend, and webhook endpoints.
- Request validation for notification/tracking inputs.
- Centralized safe error responses for provider failures.
- Webhook signature verification for Shippo/Resend if webhooks are implemented.
- Admin-only guards for manual notification resend or tracking update tools.
- Customer ownership guards for all account/order/tracking/notification endpoints.
- Audit logging for sensitive admin actions if supported by current architecture.

Rules:

- Do not implement all provider work in one risky pass unless explicitly asked.
- Preferred order: Resend first, Shippo second, security audit/hardening across each phase.
- Do not install provider packages unless the phase requires real integration.
- Do not send real customer messages during tests unless explicitly requested.
- Use disabled/dry-run behavior for verification when env vars are missing.
- Do not add Apple Messages for Business in this phase.
- Do not add Twilio/SMS in this phase.

Required verification for communications/tracking phases:

- Run client build if client files change.
- Run server build/syntax checks if server files change.
- Run tests if available.
- Run Prisma generate if schema changes.
- Run local migration checks if Prisma models are added.
- Verify no real secrets are added to source/docs/logs.
- Verify env variable names are documented only as names/placeholders.
- Verify guest checkout still works if checkout code is touched.
- Verify customer account routes still protect customer data if account code is touched.
- Verify admin routes still require admin auth if admin code is touched.
- Verify notification/tracking provider code has disabled/dry-run behavior when env vars are missing.

Final report must include:

1. Which phase was implemented: Resend, Shippo, architecture-only readiness, or security hardening.
2. Files created and modified.
3. Database models/migrations added if any.
4. Environment variable names required by Railway/Vercel.
5. Security audit findings.
6. Security measures added.
7. Commands run and results.
8. Remaining risks.
9. Next safest provider phase.

## 15. Automated Testing Strategy

When asked for automated tests, test infrastructure, one-command testing, or broader QA coverage, prioritize tests by business risk.

Testing philosophy:

- Do not create hundreds of low-value tests that only verify imports, snapshots, or trivial rendering.
- Prioritize logic that affects money, discounts, donations, orders, inventory, payment amounts, customer-facing totals, auth, provider notifications, tracking, and admin operations.
- Tests should be organized by domain and tier.
- Start by reproducing the current highest-risk bug before expanding coverage.
- Do not use real Stripe calls, real Resend sends, real Shippo calls, real Railway DB, or real customer messages in unit tests.

Suggested tier structure:

```text
client/
  tests/
    tier1/
      checkout/
      cart/
      promos/
    tier2/
      admin/
      campaigns/
      orders/
    tier3/
      ui/
      components/

server/
  tests/
    tier1/
      checkout/
      promos/
      campaigns/
      orders/
    tier2/
      admin/
      notifications/
      tracking/
      auth/
    tier3/
      integration/
```

Recommended high-value tests:

1. Promo validation requires email when usage is email-limited.
2. Email is normalized before promo usage lookup.
3. Percent promo gives expected discount for known subtotal.
4. Fixed promo gives expected discount for known subtotal.
5. Promo minimum subtotal rejects below threshold and accepts above threshold.
6. Promo + campaign together returns correct subtotal, discount, donation, tax, shipping, and total.
7. Promo usage records actual discount amount.
8. Order creation is idempotent for reused successful PaymentIntent.
9. Inventory decrements only once.
10. Product card selected variant maps to correct cart item.
11. Order status history records status changes only after explicit save.
12. Notification dispatch uses dry-run/disabled behavior without provider env vars.
13. Tracking webhook handler is idempotent when implemented.

Add one documented command to run important tests when practical, and update `PROJECT_HANDOFF.md` with test setup, commands, and coverage gaps.

## 16. Architecture Docs and Mermaid Verification

When creating or modifying architecture docs under `docs/` or `docs/architecture/`, verify that documentation renders correctly.

Recommended docs:

- `docs/architecture/README.md`
- `docs/architecture/data-flow.md`
- `docs/architecture/file-map.md`
- `docs/architecture/database.md`
- `docs/architecture/admin.md`
- `docs/architecture/auth-roadmap.md`

Architecture docs should include:

- Client architecture.
- Server architecture.
- Database architecture.
- End-to-end flow maps.
- Mermaid diagrams for system, checkout/payment, admin Railway DB mode, customer accounts, notifications, and tracking when useful.
- File accounting.
- Source-of-truth notes.

Mermaid rules:

- Every diagram must start with a valid fence: ` ```mermaid `.
- Do not put Markdown inside Mermaid blocks.
- Verify opening and closing fences.
- Verify diagrams are compatible with standard Mermaid.
- Fix any VS Code Markdown Preview errors such as `No diagram type detected matching given configuration`.

Docs-only changes do not require builds unless code also changed, but the final report must say docs were the only changes.

## 17. Manual QA Expectations

Manual QA must be specific to the touched area. Common checks include:

- Storefront product browsing.
- Product quick view.
- Product card add to cart.
- Featured product add to cart.
- Cart drawer updates.
- Checkout preview.
- Promo validation.
- Campaign donation preview.
- Stripe payment intent flow.
- Order creation.
- Order success page.
- Admin product create/edit/delete.
- Admin promo create/edit/test/analytics.
- Admin campaign create/edit/status display.
- Admin order dashboard and order detail.
- Customer account sign-in/create/reset/profile/orders.
- Notification preference updates.
- Resend email dry-run or real send when explicitly requested.
- Shippo tracking dry-run/provider-disabled behavior and admin/customer display when implemented.

Always document what was manually verified, what was only code-reviewed, and what remains unverified.

## 18. Next Phase Implementation Map

When implementing the next production-readiness phases, the goal is end-to-end working behavior, not isolated backend provider files. Every provider phase must connect server logic, database state, admin tools, customer pages, email/tracking payloads, docs, security checks, and QA.

Current next-phase order:

1. Resend email.
2. Shippo tracking.
3. Security hardening pass across auth, accounts, checkout, notifications, tracking, and admin tools.
4. Better Auth/customer account cleanup if needed after communications/tracking are stable.
5. Loyalty, reviews, referrals, and marketing automation later.

Twilio/SMS remains intentionally excluded unless the user explicitly re-adds SMS later.

### Resend End-to-End Map

Resend work must connect to the right product pages and flows, not only the provider API.

Server responsibilities:

- Add or verify a server-side email provider abstraction.
- Add Resend provider implementation behind that abstraction.
- Add email template/payload builders separated from provider sending.
- Add notification dispatch service that decides what email should be sent and when.
- Add disabled/dry-run behavior when Resend env vars are missing.
- Add delivery event/attempt persistence if the current schema supports it or add a safe Prisma migration if needed.
- Never call Resend from client/Vue code.
- Never expose Resend API keys to the client.

Customer-facing flows to connect:

- Account verification email.
- Resend verification email.
- Forgot password email.
- Password reset email.
- Welcome email after successful account creation if appropriate.
- Order confirmation email after successful paid order creation.
- Order status update email when admin saves a status change.
- Tracking/shipped email when tracking is added or marked shipped.
- Delivered email when tracking/order status reaches delivered.
- Review request email after delivered if the business wants it enabled.
- Support/order-help email if support request flow exists.

Customer pages/functions to update or verify:

- Account create page shows verification/welcome email state if applicable.
- Account sign-in page supports verification resend if applicable.
- Forgot/reset password pages use the real email flow.
- Account profile includes notification preferences if present.
- Account order detail can show email/tracking status when useful.
- Checkout/order success page explains that confirmation will be sent by email when email delivery is enabled.

Admin pages/functions to update or verify:

- Admin order detail should show notification history or delivery attempts when available.
- Admin order detail should allow safe resend of order confirmation only behind admin auth.
- Admin order detail should allow safe resend of tracking/status email only behind admin auth when data exists.
- Admin customer detail, if present, should show customer notification preferences and recent notification activity.
- Admin resend actions must not allow arbitrary recipient spam.
- Admin resend actions must use the stored order/customer recipient unless there is a carefully validated admin-only override.

Database/audit expectations:

- Audit existing Prisma models before adding new ones.
- Prefer extending existing `CustomerNotificationPreference`, `CustomerAccountEvent`, or notification-related models if they already exist.
- Add `NotificationEvent` and/or `NotificationDeliveryAttempt` only if the current schema cannot track outbound messages cleanly.
- Store provider message id, status, event type, recipient, related order/customer ids, sent timestamp, and safe error metadata.
- Do not store reset tokens, verification tokens, API keys, session tokens, or sensitive provider secrets in notification logs.

QA expectations:

- Verify disabled/dry-run mode does not claim real delivery.
- Verify missing env vars produce safe, understandable behavior.
- Verify account verification and password reset do not expose tokens in responses/logs.
- Verify successful paid order triggers order confirmation only once under normal retries.
- Verify admin resend requires admin auth.
- Verify customer-owned endpoints do not reveal another customer’s email history.
- Verify email payload totals match server-owned order totals.
- Verify no real emails are sent during automated tests.

### Shippo End-to-End Map

Shippo work must connect tracking data to admin operations, customer order visibility, email payloads, and order timeline behavior.

Server responsibilities:

- Add or verify a server-side tracking provider abstraction.
- Add Shippo provider implementation behind that abstraction.
- Add tracking service/repository using the existing orders domain pattern or a focused tracking domain.
- Add safe tracking webhook endpoint only if webhooks are part of the phase.
- Verify webhook signatures/secrets before processing provider events.
- Make webhook/event processing idempotent.
- Avoid automatic label purchasing or fulfillment automation unless the user explicitly asks.
- Never call Shippo from client/Vue code.
- Never expose Shippo API keys to the client.

Admin pages/functions to update or verify:

- Admin order detail should allow adding/editing tracking number, carrier, tracking URL, and status behind admin auth.
- Admin order detail should show tracking timeline/events when available.
- Admin order detail should show shipped/delivered timestamps when available.
- Admin order detail should show whether a tracking email was sent if notification events exist.
- Admin order status workflow should work with tracking updates without blindly overwriting status.
- Admin order list may show a compact tracking/shipping status when useful.

Customer pages/functions to update or verify:

- Customer account order detail should show tracking number, carrier, tracking URL, current status, estimated delivery, and tracking events when available.
- Guest order success page should not promise tracking until tracking exists, but should use copy that supports future tracking emails.
- Order success/customer order detail should use friendly order reference, not raw internal ids.
- Customer-facing tracking data must be limited to that customer’s own order.

Email/notification connections:

- When tracking is added or status becomes shipped, dispatch tracking/shipped email if email notifications are enabled.
- When tracking reaches delivered, dispatch delivered email if enabled.
- Tracking email payloads should include order reference, carrier, tracking number, tracking URL, current status, and support/contact copy.
- Email dispatch should not happen repeatedly for the same tracking event unless intentionally resent by admin.

Database/audit expectations:

- Audit existing Prisma order/tracking/status models before adding new ones.
- Add `OrderTracking` and `OrderTrackingEvent` only if missing and needed.
- Preserve historical tracking events instead of overwriting all tracking history.
- Store raw provider payloads only if safe and not overly sensitive.
- Add uniqueness/idempotency constraints where needed, such as provider event id per tracking record.

QA expectations:

- Verify admin can add tracking to an order.
- Verify customer order detail shows the tracking info for the right customer only.
- Verify guest/customer pages do not expose tracking for other orders.
- Verify shipped/delivered emails trigger at the correct time or dry-run safely.
- Verify duplicate webhook events do not duplicate tracking events or emails.
- Verify manual admin tracking edits require admin auth.
- Verify Shippo env vars are documented by name only.

### Security Hardening Map

Security work must be proportional and focused on real launch risk.

Required endpoint areas to audit:

- Custom admin auth endpoints.
- Better Auth/customer auth endpoints.
- Account profile endpoints.
- Customer order endpoints.
- Admin customer endpoints.
- Admin order endpoints.
- Checkout preview/payment/order endpoints.
- Promo/campaign endpoints.
- Notification send/resend endpoints.
- Tracking update endpoints.
- Webhook endpoints.
- Support request endpoints if present.

Required protections:

- Admin-only actions require server-side admin auth.
- Customer-owned resources require ownership checks.
- Manual resend email actions cannot be abused for spam.
- Tracking edits require admin auth.
- Provider webhook endpoints validate signature/secrets when implemented.
- Auth, password reset, resend verification, support, notification resend, and webhook endpoints should be rate-limited or documented if still missing.
- Error responses should not leak stack traces, SQL details, provider secrets, token values, or internal ids unnecessarily.
- Logs must never include provider API keys, auth session secrets, reset tokens, verification tokens, Stripe secrets, database URLs, or raw sensitive payloads.
- CORS and cookie settings must match Vercel/Railway/local workflows.
- Production cookies must use secure settings where applicable.

Security final report must include:

- Confirmed vulnerabilities fixed.
- Risks reviewed and found acceptable.
- Missing protections still recommended.
- Files changed.
- Commands run.
- Manual QA/security QA checklist.

### UI and Function Integration Checklist

For every Resend or Shippo implementation pass, verify the feature appears where a real operator or customer expects it:

Customer-facing:

- Checkout email field and order confirmation behavior.
- Order success page.
- Account sign-in/create/verify/reset pages.
- Account profile notification preferences.
- Account orders list.
- Account order detail.
- Customer-facing support/help copy.

Admin-facing:

- Admin orders list.
- Admin order detail.
- Admin customer detail if present.
- Admin notification history/resend controls.
- Admin tracking add/edit controls.
- Admin order status timeline.
- Admin data target badge must remain intact.

Server/API:

- Auth routes.
- Account routes.
- Checkout routes.
- Orders routes.
- Admin orders/customers routes.
- Notification routes if added.
- Tracking routes if added.
- Webhook routes if added.

Docs:

- `PROJECT_HANDOFF.md`.
- `docs/architecture/data-flow.md` if flows change.
- `docs/architecture/database.md` if Prisma models change.
- `docs/architecture/file-map.md` if files are added or moved.
- `docs/architecture/auth-roadmap.md` if auth/security behavior changes.
- `docs/architecture/admin.md` if admin pages/tools change.

### Provider Phase Completion Definition

A provider phase is not complete until all of these are true:

1. Server provider abstraction exists and is connected to real application events.
2. Provider secrets are server-side only and documented by variable name only.
3. Database state exists or has been deliberately avoided with a documented reason.
4. Admin UI can operate or observe the feature where appropriate.
5. Customer UI can see the feature where appropriate.
6. Security checks are applied to all new endpoints/actions.
7. Dry-run/disabled mode works safely when env vars are missing.
8. Automated tests or targeted unit tests cover the highest-risk logic when practical.
9. Manual QA checklist is documented and specific.
10. `PROJECT_HANDOFF.md` is updated with files changed, commands run, risks, env names, and next phase.

### Recommended First Codex Prompt for This Phase

When starting the next Codex run, use a focused prompt similar to this:

```text
Read AGENTS.md and PROJECT_HANDOFF.md first. Consolidate the current state, then implement Phase 1 Resend email end-to-end without Twilio/SMS.

Goals:
- Add server-side Resend email provider abstraction with disabled/dry-run behavior.
- Connect email dispatch to account verification/password reset if those flows exist, order confirmation after successful paid order creation, and admin order status update emails where current code supports it.
- Add notification event/delivery attempt persistence only after auditing existing Prisma models; do not duplicate existing sources of truth.
- Add admin order detail notification history/resend controls only if safe and protected by admin auth.
- Ensure no provider keys are exposed to client code or docs.
- Add or update tests for email dispatch dry-run and duplicate-send prevention where practical.
- Run required verification commands.
- Update PROJECT_HANDOFF.md and architecture docs with files, env variable names only, flows, QA, and remaining risks.

Rules:
- Do not add Twilio/SMS.
- Do not send real emails during tests.
- Do not commit or push.
- Preserve checkout, admin, and account UX unless a focused UI change is needed.
```