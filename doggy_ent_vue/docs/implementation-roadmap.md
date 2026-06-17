# Implementation Roadmap

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
