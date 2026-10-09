# Implementation Roadmap

## 2026-10-09 Calm Giving Status

The approved fluid storefront, deterministic variant display/selection, emerald giving cards, public campaign page, and shared visual campaign editor are connected. All original homepage content areas remain; unsupported reviews, nutrition values, notification actions, social links, and free-shipping claims were removed or labeled honestly.

Campaign migration `20261009000000_campaign_public_page` is applied on local and Railway databases. Railway application was explicitly authorized by the user; preflight verified it was the only pending migration, with no failed migrations or checksum drift. All eighteen repository migrations now match Railway. Older notes saying support/Better Auth migrations are unconfirmed are historical, superseded by this check.

Next gate: review the combined dirty tree, deploy server/client code through the normal approved process, enable only reviewed campaign pages, then run real-admin/Safari and guest/signed-in checkout QA with approved test data. Database migration does not deploy code. No commit/push, email, label, or payment was performed. Dependency security remediation, business-approved imagery/reviews, provider QA, pagination, reconciled reports, and manual email-template work remain separate phases.

## 2026-10-08 Calm Workspace UI Status

The approved admin workspace UI is connected across all eleven existing tools. Shared navigation/identity/data routing, focused catalog/promo/campaign editors, order/customer detail, issue histories, delivery/shipment views, and truthful operational reports are in place. Existing custom admin auth and server contracts are preserved.

Next gate: controlled real-admin/Safari and local-versus-Railway DB QA, plus review/deployment of any earlier pending support migration. Email Template Center, approved template previews/manual sends, promo audiences, reconciled reporting, and customer support/activity expansion remain separate future phases. A dependency advisory remediation pass is also recommended before launch.

Each run must continue existing work, inspect uncommitted changes, preserve prior completed phases, and avoid undoing unrelated edits. Do not commit or push unless explicitly asked.

## Run 1: Product Philosophy, Customer Account Redesign, Checkout UX, Supporting Database Changes

Goals:

- Install the product philosophy into the actual customer UI.
- Account navigation hub.
- Account overview cleanup.
- Featured-product empty states.
- Maximum two recent orders.
- Profile redesign.
- Stored-information cards.
- Default shipping address editing.
- Email verification UX.
- Remove customer email activity.
- Remove preferred communication controls.
- Orders split-view redesign.
- Month grouping and older-month accordions.
- Conditional order detail sections.
- Product images.
- Selected shipping method visibility.
- Remove customer timeline.
- Need Help flow.
- Seven-day delivery dispute eligibility.
- OrderIssue schema/API foundations.
- Signed-in checkout prefilling.
- Apple Pay/Google Pay disabled with Fall 2026 messaging.
- Shippo carrier-rate root-cause investigation.
- Fallback rate UX.
- Server-owned shipping verification.
- Tailwind-first UI.
- Subtle animations.
- Responsive states.
- Tests.
- Documentation.

Status after 2026-06-17 pass:

- Completed: account overview cleanup, max two recent orders, profile stored-information cleanup, default shipping address foundation, orders split-view/month grouping, customer-safe order detail cleanup, Need Help/order issue foundation, seven-day eligibility, signed-in checkout address prefilling, support/internal issue Prisma foundations, admin issue routes/pages, tests, and documentation updates.
- Partial: Shippo carrier-rate root-cause investigation was not expanded beyond preserving existing fallback behavior; provider-specific internal issue capture remains future work.
- Partial: Admin dashboard was extended with Order Issues/Internal Issues links and metrics but not fully reorganized into all suggested operational sections.
- Not implemented: Email Template Center, promo email workflow, and explicit template-backed Send customer update actions. These remain Run 2/Run 3 work.

## Run 2: Admin Redesign, Order Issues, Internal Issues, Email Template Center

Goals:

- Admin information architecture.
- Grouped navigation.
- Minimal color coding.
- Dashboard cleanup.
- Urgent metrics.
- Order Issues tool.
- Customer-visible and internal replies.
- Status, priority, assignment, resolution.
- Internal Issues tool.
- Safe internal error capture.
- Deduplication/fingerprinting.
- Email Template Center.
- Template CRUD.
- Preview.
- Archive.
- Delivery activity separation.
- Promo email action.
- Recipient preview.
- Explicit send confirmation.
- Manual-first communication controls.
- Admin order update save/send separation.
- Tests.
- Animations.
- Security.
- Documentation.

## Run 3: Final Integration, Shippo/Email Workflows, Polish, QA, Docs

Goals:

- Complete missing end-to-end connections.
- Shippo rate troubleshooting and verification.
- Shippo tracking refresh.
- Manual tracking fallback.
- Order/customer/admin shipping visibility.
- Email template integration.
- Admin-triggered order emails.
- In-account issue communication.
- Delivery logging.
- Duplicate-send protection.
- Error handling.
- Rate limiting.
- Security audit.
- Ownership audit.
- Admin auth audit.
- Mobile polish.
- Animation polish.
- Accessibility.
- Automated tests.
- Full manual QA.
- Architecture docs.
- `PROJECT_HANDOFF.md`.
- Final launch-readiness report.

## Recommended Prompt For Run 1

```text
Read AGENTS.md, PROJECT_HANDOFF.md, docs/product-philosophy.md, docs/ux-ui-standards.md, docs/customer-experience.md, docs/communications.md, docs/operations-and-issues.md, docs/implementation-roadmap.md, docs/verification-and-qa.md, and relevant docs/architecture files first.

Start Run 1 from docs/implementation-roadmap.md.

Do not start a broad refactor. Do not commit or push. Preserve guest checkout, Better Auth customer accounts, existing admin dashboard behavior, checkout payment correctness, server-owned totals, and current architecture patterns.

First run git status, git diff --stat, and git diff --name-status. Audit current account, profile, orders, checkout, shipping, and support-related files. Preserve existing uncommitted work.

Implement the customer-facing Run 1 scope end-to-end:
- account navigation hub
- account overview cleanup with max two recent orders
- useful empty states with featured products where appropriate
- profile redesign with stored-information card, verified email state, resend verification UX, no customer email activity, and no preferred communication controls
- default shipping address foundation/editing when supported safely
- orders split-view or mobile-friendly drill-in pattern with month grouping
- conditional order detail sections with product images and selected shipping method visibility
- removal of customer-facing internal timeline
- Need Help/order issue foundation with seven-day delivery eligibility and customer-safe case direction
- signed-in checkout prefilling without silently overwriting saved profile data
- Apple Pay/Google Pay disabled or future-only messaging such as Coming Fall 2026
- Shippo carrier-rate root-cause investigation and customer-safe fallback rate UX
- server-owned shipping verification preserved across preview, PaymentIntent, and order creation
- Tailwind-first polish, subtle motion, responsive states, accessibility, and tests

Do not send automatic order/tracking/support/review/promo emails. Keep manual-first communication policy intact.

Run required verification, update PROJECT_HANDOFF.md and relevant docs, and provide files changed, commands/results, remaining risks, manual QA, and whether the tree is safe for commit review.
```
