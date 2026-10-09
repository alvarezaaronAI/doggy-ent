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

## Calm Workspace Admin QA

The 2026-10-08 connected admin UI was checked with fixture-intercepted browser APIs at 1440, 1024, 768, 390, and 320 px. This is not a live DB/provider or Safari verification.

- Check all eleven sidebar tabs, active route, one shared header, signed-in identity, read-only target badge, mobile open/close, and direct order/customer routes.
- Products: search by SKU/category/status, create/edit/cancel/save, separate 6 oz/18 oz prices/stock, all content/analysis fields, selling modes, and real threshold alerts.
- Promos: required tester email, lowercase/trim, input-change invalidation, create/edit/type/limits/schedule, cancel, analytics/redemptions/order links.
- Campaigns: beneficiary, product selection, donation rule, schedule, cancel/save, generated-impact/order links. Do not call attribution a payout.
- Orders: refunded status visibility, reference/customer search, next status staged without writes, Save/Cancel/history, tracking save/refresh, and separate explicit email action.
- Customers: linked and verified-email guest orders, account status, deactivate/reactivate confirmation, verification/reset requests and provider history.
- Order issues: selected case after filtering, explicit status/priority/resolution saves, retained draft on failure, internal notes versus account replies, no automatic email, real event history.
- Internal issues: safe context, severity/status/notes, Save/Cancel, retained draft on failure, event history.
- Shipments/Notifications/Reports: filters, failure/empty/loading states, mock-versus-real deliveries, provider status, truthful all-time totals, disabled/unconnected future tools.
- Verify temporary modes with the existing commands: fully local backend or Railway DB backend, paired with local client. Confirm the backend badge and network target before any real write.
- Recheck real guest/signed-in checkout, variant cart prices, promos/campaigns, order success, and customer ownership before deployment.

No automated check may send a real customer email, buy a label, or mutate Railway. Use approved test data and explicit provider approval for live QA. Full command results, known failures fixed, dependency audit findings, and migration caveats are in [PROJECT_HANDOFF.md](../PROJECT_HANDOFF.md).

## Calm Workspace Investigation QA

- Confirm actionable account/admin controls have resting gray borders/backgrounds, visible hover/focus, working disabled states, and no horizontal overflow at 320/390/768/1024/1440 px. Static stats/placeholders must not imply click behavior.
- Orders: verify Standard/Gold/Platinum/Diamond/Gem boundaries, labels, row accents, amount/badge colors; these are order-value tiers, not customer loyalty.
- Order detail: inspect saved timestamps/IDs/items/usage/shipment/history/delivery/support data. Save a permitted test status/tracking change and ensure the protected read refreshes the inspector. If GET fails after Save, do not retry the completed write blindly.
- Configure a Stripe payments base using an approved account; verify dynamic `pi_` IDs, test/live labeling, Save/Cancel/reload persistence, invalid-host rejection, missing ID behavior, and the correct Stripe account after opening the link. Do not use API keys/client secrets as link settings.
- Customers: same-name records must remain distinguishable by full email/ID. Search by ID, click a non-name cell, Tab/Enter the real link, and confirm the correct customer. Selecting email/ID text should not navigate.
- Confirm customer account pages never show internal record inspectors or Stripe IDs. Confirm unauthenticated/customer-only sessions receive 401 on admin detail endpoints. No credentials/token/raw provider metadata may be returned.
- Real database persistence, Safari/private-storage behavior, and authenticated Stripe dashboard navigation remain manual checks; browser fixtures do not establish those results.

## Calm Giving QA

Automated tests cover deterministic active variant ordering, zero-price handling, selected-size cart payloads, campaign payload/ISO precision, public field allowlisting, active windows/featured priority, stable slugs, invalid publication content/URLs/dates/rules, and unauthenticated public versus admin routes.

Fixture browser checks exercise home/campaign/editor at 1440/1280/1024/768/390/320 widths, all homepage areas, 6 oz/18 oz add-to-cart and quick view, stable featured content, non-clickable featured image/title, retained cart into a stubbed checkout preview, mobile navigation, account hover buffer, same public/editor typography/colors, explicit Save/Cancel, failed-save draft retention, unavailable/paused campaigns, and campaign hero images. Existing eleven-tab admin, seven-tab account, and internal-record regression harnesses also run with intercepted APIs. These are not live session/payment/provider tests.

Manual next checks:

1. Restart the chosen local backend mode, confirm the data-target badge and network origin, then use approved test data. Never switch DB target in the running UI.
2. Enable a reviewed campaign page with introduction, beneficiary, optional story/image/HTTPS link, and required image description. Save/reload every field and inspect the public route on actual desktop/mobile/Safari.
3. Check Draft/Archived privacy, disabled page with continued eligible giving, Active schedule boundaries, Paused/Ended wording, stable link after rename, and multiple matched campaigns. Confirm generated contribution is not described as paid out.
4. Check real product imagery/ingredients/storage, 6 oz/18 oz price/availability/cart/checkout, product filter choices, featured behavior, Next Drops, every retained section, keyboard focus and reduced motion. Approve actual brand/product assets and verified review content separately.
5. Run one approved Stripe test checkout as guest and signed-in, including promo plus eligible campaign. Verify server totals, a single order, once-only inventory/usage, success page, and account ownership. No live payment is required.
6. Deploy reviewed server then matching frontend, check direct `/campaigns/:slug` route on Vercel and public API on deployed Railway. Migration completion alone does not deploy application code.

Campaign schema migration was explicitly approved and applied to Railway in this phase, after preflight; automated browser/tests did not write Railway business records. No real emails, labels, or payments were performed. See the latest [handoff](../PROJECT_HANDOFF.md) section for commands and precise results.

## Homepage And Brand Follow-Up QA

Automated checks use the actual Vue section components in SSR tests plus isolated browser fixture APIs. They verify hero escaping/actions and actual featured-product content, upcoming loading/error/empty/product branches, safe social destinations, both cart variants, persisted cart/search across the brand route, stubbed checkout preview, all nine home anchors, footer links/placeholders, image-error fallbacks, mobile navigation, and header auth state. Existing campaign/editor/variant regression checks are rerun. No real email/payment/subscription/customer/DB mutation occurs.

Manual next checks:

1. Compare the approved photo-led hero with its neutral gray tint, footer, generous seasonal cards, and all retained home sections on actual desktop/mobile/Safari. The baseline preview was approved; real-device visual/content QA remains separate.
2. Click hero shopping/ingredient/story links, desktop/mobile Meet the Brand, footer story link, and upcoming Preview. Confirm targets match the actual featured product and notices do not offer purchase/subscription before launch.
3. Add 6 oz/18 oz, navigate home -> story -> shop -> checkout, and confirm selected prices/cart/preview remain correct. Recheck signed-in header and the actual Safari session separately.
4. Review the preserved short brand narrative; replace illustrative portraits with real approved photos and test image-failure states. Do not present template photos as actual Chase/Evie or customer proof.
5. Confirm approved Instagram destination/new-tab behavior. TikTok/YouTube placeholders must not jump to `#` or pretend to have real profiles. Optional public social variables need a new Vite build after changes.
6. After reviewed deployment, load `/meet-chase-evie` directly on Vercel and run one approved guest/signed-in Stripe test checkout with promo plus campaign. This UI follow-up requires no new migration or backend variables.

Exact commands/results and remaining deployment risks are in the latest [handoff](../PROJECT_HANDOFF.md). Standard Stripe local-HTTP development warnings are recorded separately from actual Vue/runtime errors.

### Approved Baseline And Cart Regression Checks

- Client SSR tests verify actual selected-size/unit/line prices, SKU and unique action labels, disabled inventory-limit increase, the separate `/checkout` link, labelled open dialog/inert closed drawer, and honestly identified gallery templates.
- Isolated dialog tests cover scroll locking/restoration, initial/opener focus, Tab in both directions, hidden-control exclusion, outside focus containment, Escape, removal focus recovery, and unmount cleanup. These are not full browser accessibility certification.
- Local browser QA should check all nine home anchors and actual 6 oz/18 oz prices/availability, featured Add to Cart, Quick View handoff, quantity/removal, close/backdrop/Continue Shopping, desktop 420 px and mobile full-width drawer, short-height landscape footer scrolling, retained bag across story/account routes, and short-screen hero content. Never clear a user's saved bag for QA; restore only temporary items/quantities added by the check.
- Recheck campaign-green cards with an eligible campaign, signed-in customer headers, Safari touch/keyboard behavior, screen readers/reduced motion, and approved guest/signed-in Stripe test checkout after reviewed deployment. Local UI checks and unit tests do not establish those live results. No provider sends, real payments, DB writes, or migrations are required by this styling pass.

## Provider Verification Rules

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
