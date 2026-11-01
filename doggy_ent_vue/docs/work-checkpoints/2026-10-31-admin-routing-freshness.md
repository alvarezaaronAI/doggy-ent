# Admin Routing Freshness: 2026-10-31

## Scope And Resume

Owner asks to continue after the recovery preparation release. That release and
its evidence PR73 are complete: main2d395d5 and dev-main3b442c0 each match their
GitHub upstream, with only final evidence documents on integration. Recovery stays
off; no Stripe endpoint, secret, flag, payment, email or shared-data operation is
authorized by this follow-up.

This bounded repair addresses the routing badge's documented immediate-expiry
observation. Fresh read-only Git audit is clean and synchronized; task branch is
fix/admin-routing-freshness from dev-main3b442c0. No unrelated edits exist.

## Diagnosis And Plan

The routing composable subtracts the backend's checkedAt from browser Date.now.
Ahead/behind browser/server clocks can mark a newly received successful check
expired immediately. This mechanism is reproducible in fixtures; the exact live
clock offset has not been measured. The protected no-store endpoint performs a
new read-only probe per request. Use local request-start elapsed time for its
60-second freshness bound; retain server checkedAt only as display evidence.
Include request latency, expire long-running responses, and recheck expired or
locally clock-regressed evidence on visible-tab return. Preserve authorization,
private projections, abort/deduplication, UI layout and failure states.

Next: add skew/latency/clock-regression tests, confirm reproduction, implement the
narrow composable fix, run client tests/builds and docs checks, then review and
publish through the bounded managed workflow if ready. No migration or provider
configuration is needed. Record actual verification/deployment separately.

## Source Verification

The five added regression cases fail on the prior implementation (15 pass/5 fail),
then all20pass after the local request-start change. Full client739(11/722/6) and
combined/storefront/admin builds pass. Initial admin build used the wrong public
origin variable; corrected VITE_STOREFRONT_ORIGIN build passes. No environment file
or build configuration changed. Existing tests retain no-store/privacy validation,
timeout, sleep return, failed recheck, abort, late response and deduplication.

Actual local ordinary5173->3000->Railway DB sign-in succeeds and the shared badge
reports Railway database / Connected. No catalog/order edit or payment was made;
routine sign-in creates only its normal session. A task-created protected staff
tab reaches the existing login form; hosted post-release acceptance is pending.
Fresh read-only Railway history/checksum preflight remains29matching/nonepending;
existing production service is main-linked with no staged changes. Both known
Vercel projects are confirmed, staff all-URL SSO remains enabled. No migration or
provider configuration has occurred. Parent owns all Git/deployment changes; the
QA sidecar reviews only these two code/test files without editing.

Next: complete independent review/docs/secret checks, scoped task commit/PR and
exact-head Quality; guarded integration/release after full diff inspection. Verify
resulting hosted artifacts and the protected badge, record evidence, sync branches
and close temporary tabs/agent. Recovery must remain off throughout.

Review follow-up: QA identifies partial local-clock rollback during a slow request
as extending wall-only elapsed time. Parent adds independent performance.now
elapsed time and rejects either negative clock age; maximum wall/monotonic age
retains suspend protection without requiring synchronized API clocks. Two new
regressions cover in-flight and tab-return partial rollback. Final22routing and
741client(11/724/6), all three client builds pass. No server file changed.

QA follow-up closes the clock-rollback finding with no remaining scoped findings;
actual suspend/BFCache/device acceptance remains manual. Seven changed paths pass
configured-secret and private-key-pattern scanning; five Markdown files/207local
links/fences and staged diff checks pass. Parent now owns scoped publication.
