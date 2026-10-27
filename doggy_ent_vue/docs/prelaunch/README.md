# Prelaunch Plan

Updated: 2026-10-20. 'Halfway' is a planning description, not a measured readiness percentage. The UI can be polished while payment recovery, privacy and operational gates remain open.

## This Pass

- Set up [project agents](../engineering/agents-and-workflow.md), [Git/PR/release conventions](../engineering/git-workflow.md), local preflight/tests and PR CI.
- Add six clearly marked draft public information pages and an essential-storage acknowledgment, with no new tracking or data model.
- Write an [evidence-based customer-data strategy](customer-data-strategy.md) and [policy inventory](policy-and-storage-inventory.md).
- No auth redesign/OAuth, production deployment, DB migration, email/payment test, commit or push.

## Recommended Phases

Payment implementation/admin gaps, the repeatable offline checks and the connected
sandbox/device acceptance matrix now live in [Payment readiness](payment-readiness.md).
Passed unit checks are not payment-launch acceptance.

| Order | Phase | Acceptance before proceeding |
| --- | --- | --- |
| 1 | Source and release discipline | Review/publish this scoped branch when requested; verify hosted CI; protect main/dev-main; map source SHA to actual deployments. |
| 2 | Commerce reliability | Durable checkout attempt/idempotency, verified Stripe webhook recovery, concurrent stock and atomic promo/campaign usage, reconciliation/refund procedure; isolated regression and approved sandbox tests. |
| 3 | Privacy and policy decisions | Confirm entity/location/markets; approve provider/storage inventory, retention/deletion and request handling; finalize real policies, contact and food-specific terms. |
| 4 | Customer sign-in/create UX | Keep current Better Auth and guest checkout; clear sign-in/session errors, reviewed signup, checkout return and retained bag; desktop/mobile/Safari on same-site domain arrangement. |
| 5 | Optional progressive profile | Purpose-based pet/preferences fields, server-owned order aggregates, versioned consent history, skip/edit/remove controls, ownership and deletion tests. No hidden tracking. |
| 6 | Reviews and appropriate incentives | Verified purchase/eligibility, moderation and abuse handling; incentive disclosure and no reward for positive ratings; manual review-email policy. |
| 7 | Google then Apple sign-in | Business-owned OAuth setup, exact verified callbacks, safe linking and verified-email rules, minimal scopes, rollback and existing credential-account regressions. No provider button until configured. |
| 8 | 1.0.0 acceptance | Owner approval, payment/provider evidence, policies, accessibility/device QA, monitoring/on-call response and exercised backup/restore. |

OAuth is convenience, not a fix for session/cookie architecture. Adding Google/Apple does not eliminate Safari cross-site cookie restrictions. Do not rebuild auth or loosen verified-email guest-order matching. Provider accounts/secrets, callback domain choices and Apple developer requirements need current official documentation when that phase starts.

## Release Blockers Still Requiring Evidence

Use the [production audit](../audits/2026-10-11-production-audit.md), [QA guide](../verification-and-qa.md) and latest handoff, not old optimistic completion notes. Explicitly review payment success with interrupted browser finalization, duplicate/webhook retry, inventory/promo races, live tax/destination/shipping configuration, dependency advisories, hosted auth, backup restore, monitoring and provider/manual-send behavior. Do not declare those fixed in this documentation phase.

The generated testing catalog, fictional reviews/partner examples and illustrative brand images need final business approval or removal before launch. Keep test-product purchase guards. Cookie notice and draft documents do not make the site legally ready.
