# Verification And QA

Use this guide for repair passes, launch-readiness work, provider verification, docs verification, migrations, and final reporting.

## Repair And Launch-Readiness Passes

When asked to fix anything broken, repair the project, audit issues, make sure everything works, or perform launch readiness cleanup, treat the task as a verified repair pass, not a cosmetic refactor.

Prioritize:

1. Production data safety.
2. Payment and checkout correctness.
3. Order creation correctness.
4. Admin authorization and protected routes.
5. Customer ownership checks.
6. Client/server/API mismatches.
7. Database/schema/repository mismatches.
8. Broken imports or build failures.
9. Environment/deployment mismatches.
10. Dead duplicate checkout/payment code.
11. Documentation accuracy.

Launch-critical risks:

- Stripe PaymentIntent amount must be based on trusted server-side pricing.
- Checkout preview, PaymentIntent creation, and order creation must use consistent server-owned totals.
- Shipping, tax, discount, donation, and final total cannot be client-spoofed.
- Order creation must be idempotent.
- Inventory must only be reduced after successful verified payment and only once.
- Promo and campaign usage must not be double-counted or client-spoofed.
- Admin endpoints must require admin auth.
- Customer-owned endpoints must enforce ownership.
- Production startup must never delete, reset, or reseed live data.
- Prisma schema fields must match repository/service code.

## Interrupted Work

If a previous run ended because of credits, rate limits, timeout, interruption, or an inconsistent checklist:

- Do not assume the prior summary is correct.
- Treat local edits as draft repair changes until verified.
- Run `git status`, `git diff --stat`, and `git diff --name-status`.
- Identify whether the prior pass completed every claimed step.
- Reconcile mismatches between checklist, final report, handoff, and actual files.

## Required Verification By Change Type

Client changes:

- Run `npm run build` in `client/`.
- Run available client tests.
- Run available lint only if a script exists.

Server changes:

- Run `npm run build` or targeted syntax/import checks in `server/`.
- Run available server tests.
- Run available lint only if a script exists.

Prisma changes:

- Run `npx prisma generate`.
- Run local migration/status checks appropriate to the change.
- Do not apply Railway/production migrations unless explicitly asked.

Docs-only changes:

- Do not run client/server builds unless code files changed.
- Verify Markdown links where practical.
- Verify code fences.
- Verify Mermaid fences if touched.
- Run Markdown lint only if the repository already has a configured command.
- Run `git diff --check`.

## Manual QA Checklist Areas

Choose checks specific to the touched area:

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
- Admin customers, notifications, shipments, and reports when touched.
- Customer account sign-in/create/reset/profile/orders.
- Notification preference updates.
- Resend email dry-run or real send when explicitly requested.
- Shippo rate/tracking dry-run/provider-disabled behavior and admin/customer display when implemented.

Always document what was manually verified, what was only code-reviewed, and what remains unverified.

## Provider Verification

Do not stop after the first failed provider test.

For failed Resend, Shippo, Better Auth, checkout, notification, tracking, admin, customer account, or deployment verification:

1. Capture the exact error.
2. Identify root cause from code, logs, network responses, database state, provider response, env configuration, or deployment configuration.
3. Fix repository issues when possible.
4. Re-run verification.
5. Repeat until the feature works, an external provider limitation is confirmed, a deployment-only step is required, or user action is required.

Live provider testing rules:

- Requires explicit user approval.
- Do not print, copy, log, or document API key values.
- Check only whether env variable names are present/non-empty.
- Do not send bulk emails or repeated provider requests.
- Use only approved test inboxes.
- Keep Resend tests under the approved email budget.
- Do not purchase labels or create production shipments.

## Documentation Verification

For docs and architecture changes:

- Check every internal Markdown link added or changed.
- Check code fence balance.
- Check Mermaid fence syntax when Mermaid was touched.
- Search for outdated automatic-email language when communications policy changes.
- Search for old Twilio/SMS requirements.
- Search for duplicated product philosophy.
- Search for references to deleted or moved sections.
- Confirm no secret values were copied.

## Final Report Requirements

Final reports should include:

- Files created.
- Files modified.
- Major rules preserved or behavior changed.
- Commands run and exact results.
- What was verified.
- What remains uncertain or externally blocked.
- Manual QA checklist.
- Whether edits are safe for commit review.
- Next recommended phase or prompt when useful.
