# Doggy Ent Agent Operating Guide

This file is the permanent entry point for Codex work on Doggy Ent. Keep it concise, durable, and action-oriented. Detailed product, UX, customer, admin, communications, operations, roadmap, QA, and architecture rules live under `docs/`.

## Required Reading

For major phases, read in this order:

1. `AGENTS.md`
2. `PROJECT_HANDOFF.md`
3. `docs/product-philosophy.md`
4. `docs/ux-ui-standards.md`
5. `docs/customer-experience.md` when customer, account, checkout, order, support, or storefront work is involved
6. `docs/admin-experience.md` when admin work is involved
7. `docs/communications.md` when email, notifications, Resend, Shippo, templates, support replies, or provider behavior is involved
8. `docs/operations-and-issues.md` when support cases, order issues, internal issues, error capture, audit trails, or operational tooling is involved
9. `docs/implementation-roadmap.md`
10. Relevant files under `docs/architecture/`
11. `docs/verification-and-qa.md` before verification, launch-readiness, provider, migration, or repair passes

For tiny one-line fixes, read only the files needed to avoid risk. For interrupted work, launch-readiness, checkout, auth, provider, migration, admin, or customer-account changes, read the full relevant set above.

## Starting Rules

Before editing:

- Inspect the current repository state instead of trusting old summaries.
- Run `git status`, `git diff --stat`, and `git diff --name-status` when continuing existing edits, verifying interrupted work, or starting a major phase.
- Treat local edits as user or prior-agent work. Do not revert unrelated changes.
- Separate confirmed issues from uncertain risks.
- Do not commit or push unless the user explicitly asks.
- Update `PROJECT_HANDOFF.md` and relevant docs when behavior, architecture, flows, environment requirements, or verification results change.

## Architecture Rules

Follow the existing architecture.

Server pattern:

```text
route -> controller -> service -> repository -> Prisma
```

Client pattern:

```text
view -> composable/service/api -> mapper/validator/utils/components
```

Rules:

- Do not rewrite the app from scratch.
- Do not perform broad speculative refactors.
- Do not remove working features.
- Keep views thin, components focused, APIs separated from UI, and mappers separated from validators.
- Prefer established domain patterns over new abstractions.
- Avoid oversized god files and avoid micro-components for trivial logic.
- Preserve storefront, checkout, admin, and account UX unless a focused UI change is required by the task or verified bug.

## Product And UX Rules

The product should feel modern, premium, trustworthy, clear, and alive. Build complete user experiences, not database viewers. Follow:

- `docs/product-philosophy.md`
- `docs/ux-ui-standards.md`
- `docs/customer-experience.md`
- `docs/admin-experience.md`

Tailwind is the main styling system. Do not introduce another major styling framework. Use purposeful, subtle motion and respect `prefers-reduced-motion`.

## Security And Secrets

Never expose secrets.

- Do not commit `.env`, `.env.local`, `.env.production`, local Railway env files, or files containing real secrets.
- Do not create `.env.example` files unless the user explicitly asks.
- If a prior pass created `client/.env.example` or `server/.env.example`, remove them unless the user explicitly asks to keep them.
- Document environment variable names only, with placeholder descriptions.
- Provider keys must remain server-side.
- Never expose Stripe, Resend, Shippo, database, auth, session, reset-token, verification-token, admin, webhook, or Better Auth secrets to Vue/client code, logs, docs, final reports, or screenshots.
- Password reset and verification tokens must be short-lived and never logged or returned in API responses.

Important deployment variable names to document by name only:

- Server/Railway: `PORT`, `NODE_ENV`, `CLIENT_URL`, `FRONTEND_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `STRIPE_SECRET_KEY`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO_EMAIL`, `SHIPPO_API_KEY`, `SHIPPO_API_TOKEN`, `SHIPPO_WEBHOOK_SECRET`.
- Client/Vercel: `VITE_API_BASE_URL`, `VITE_API_URL` if still supported as a compatibility alias, Stripe publishable key variable used by code, and public-only display/config variables.

## Launch-Critical Rules

Treat checkout, payments, orders, auth, customer ownership, admin authorization, provider sends, tracking, migrations, and deployment config as high-risk.

Preserve these rules:

- Server owns subtotal, discount, shipping, tax, donation, and final total.
- Stripe PaymentIntent creation must use trusted server pricing.
- Order creation must be idempotent and must not create duplicate orders for the same successful payment.
- Inventory must decrement only after successful verified payment and only once.
- Promo validation must reject invalid, expired, over-limit, or email-ineligible promos before payment work continues.
- Promo usage and campaign donation usage must be server-side and not client-spoofed.
- Admin-only endpoints require server-side admin auth.
- Customer-owned resources require ownership checks.
- Production startup must never delete, reset, or reseed live data.
- Checkout, payment, order success, admin, and account flows must not rely on stale mock data.
- API helpers must safely handle non-JSON deployment errors.

See `docs/verification-and-qa.md` for repair-pass and launch-readiness rules.

## Deployment And Environment

Vercel:

- A static Vue/Vite SPA needs fallback rewrites for client routes such as `/admin`, `/checkout`, and `/account`.
- Do not route `/api/...` to `index.html` unless the API strategy explicitly supports it.
- Deployed frontend API calls should use `VITE_API_BASE_URL` or the documented compatibility alias `VITE_API_URL` to reach the live backend origin.

Railway:

- Keep Railway/Vercel variables in their dashboards, not source files.
- Verify exact frontend origins for CORS and cookies.
- Do not apply Railway migrations automatically unless the user explicitly asks.

Temporary local admin data target modes:

- Fully local: local client/admin -> local server -> local DB.
- Railway DB admin: local client/admin -> local server -> Railway DB.
- Do not prefer local frontend -> Railway backend for admin CRUD because cross-site cookies remain unreliable.
- Choose data target at startup, not with runtime upload/switch buttons.

## Prisma And Database Safety

- Do not run `prisma migrate reset` on Railway, production, staging, or any shared database.
- Do not use destructive migration commands unless the user explicitly asks and understands data loss.
- For local development, `npx prisma migrate dev` is acceptable when appropriate.
- For Railway/production-like deployment, use `npx prisma migrate deploy` only after preflight checks pass and the target database is confirmed.
- Run `npx prisma generate` when schema/client usage changes.
- Document local migration status and Railway deployment steps in `PROJECT_HANDOFF.md`.

Required duplicate preflight before applying a unique `stripePaymentIntentId` constraint to shared databases:

```sql
SELECT "stripePaymentIntentId", COUNT(*)
FROM "Order"
WHERE "stripePaymentIntentId" IS NOT NULL
GROUP BY "stripePaymentIntentId"
HAVING COUNT(*) > 1;
```

## Auth Direction

- Customer accounts use Better Auth.
- Preserve guest checkout.
- Custom admin auth remains until an explicit admin Better Auth migration is requested.
- Stabilize existing admin auth/session issues before migrating admin auth.
- Future Better Auth admin roles should preserve the existing dashboard and use roles such as `ADMIN` and `CUSTOMER`.

## Communications And Providers

Follow `docs/communications.md`.

Permanent policy:

- Essential account/security emails may be automatic when intentionally enabled.
- Order status, processing, shipping, tracking, delivered, support, issue resolution, apology, promo, marketing, and review-request emails require explicit admin action unless the user changes this policy later.
- Prefer in-account communication for customer issues and order updates.
- Resend and Shippo stay server-side behind provider abstractions.
- Do not add Twilio/SMS or Apple Messages for Business unless the user explicitly asks.
- Do not buy labels, create production shipments, or enable fulfillment automation unless explicitly requested.
- Do not send real customer emails during automated tests. Live provider tests require explicit user approval, an approved inbox, a small email budget, and documentation.

## Verification

Run the checks that match the files changed:

- Client build/tests when client files change.
- Server build/syntax/tests when server files change.
- `npx prisma generate` and migration/status checks when Prisma changes.
- Docs-only changes do not require client/server builds.
- Run Markdown/link/fence checks for docs changes.
- Run existing lint/test scripts if present; do not invent lint scripts.
- If a command fails, fix and rerun it or document why it remains blocked.

Final reports must include files changed, commands run with results, what was verified, remaining risks, manual QA, and whether the tree is safe for commit review.

## Documentation Maintenance

`PROJECT_HANDOFF.md` is the durable project memory. Update it after major phases, repair passes, provider work, docs restructuring, migrations, architecture changes, and launch-readiness work.

Relevant focused docs must be updated when their behavior changes:

- Product/UX rules: `docs/product-philosophy.md`, `docs/ux-ui-standards.md`
- Customer/account/checkout/order/support: `docs/customer-experience.md`
- Admin: `docs/admin-experience.md`
- Email/provider/manual-send policy: `docs/communications.md`
- Order/internal issues: `docs/operations-and-issues.md`
- Phase planning: `docs/implementation-roadmap.md`
- Verification: `docs/verification-and-qa.md`
- Current architecture: `docs/architecture/`

Call out uncertainty clearly. If something was not verified from code or commands, say so.
