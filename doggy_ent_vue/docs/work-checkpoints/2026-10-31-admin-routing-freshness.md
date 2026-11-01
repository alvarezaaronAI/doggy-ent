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
freshness expiry, sleep return, failed recheck, abort, late response and deduplication.

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

## Publication Milestone

Source1ddfa7cbb25fbad80245883cb0cfb811b50d1202 is pushed on
fix/admin-routing-freshness. PR74 passes exact-head Quality41273067815 (both jobs,
all steps), no reviews/conflicts, and merges guarded to
dev-main352eca2cdda4433aacf0ec5559ab45f97eef1600. Retained task branch matches its
remote. PR75 releases that exact integration head to main2d395d5; its own Quality
must pass before merge. Release diff is only this diagnostic code/test repair and
known evidence docs from PR73. Provider/recovery settings remain unchanged.

Parent's docs/admin-routing-release branch holds final evidence only, based on
352eca2. Do not publish this documentation delta into production to finish PR75.

PR75 passes its own exact-head Quality41273178990, both jobs/all steps, with no
reviews/conflicts. Guarded merge releases maince6370c4ce33b7a66ac4e73528f76dadd9bc63b4.
Git-triggered deployments are now in progress; readiness is not yet claimed.
Read-only service inventory reconfirms main/server root/start migration command,
no staged changes, and absent recovery flag/webhook secret. Server/admin host/
dependencies have no runtime release delta. No configuration or data write.

## Verified Deployment And Remaining Work

Maince6370c4ce33b7a66ac4e73528f76dadd9bc63b4 is verified on:

- Railway30aeede4-543f-4b03-915d-040dbb7d4d9e SUCCESS, matching main source;
  startup29migrations/nonepending and zero captured exception/error patterns.
- Stable shopdpl_HUD9mX1fFnGiuWssoZRUouNQE2bD and protected
  staffdpl_ALNcqQ2UkS2iYfEZW19sfosMnyYB READY, matching source/stable aliases.
- Home/checkout/manifest/APIhealth/products/campaigns200 and exact shop CORS;
  public manifest0admin modules. Anonymous account401, direct staff routing403,
  anonymous protected admin302. Initial payment-config smoke used the wrong mount
  and returned404; the actual client route /api/checkout/payment-configuration
  returns200/no-store/Sandboxenabled with recovery off. No app route was changed.
- Actual signed-in protected staff reload/Refresh/expanded routing shows staff
  origin, protected gateway to RailwayAPI, RailwayPostgreSQL/production/Connected.
  No captured console error/warning or horizontal overflow. A pre-release read also
  connected normally this turn; fixtures prove the skew mechanism, not a measured
  persistent live offset. Real sleep/BFCache/clock-adjustment device QA is manual.
- Fresh read-only shared history/checksum postflight29matching/nonepending. No
  migration, schema/provider/configuration/credential change, actual payment,
  refund, email, shipment or business record edit. Routine form logins create normal
  sessions only. Recovery flag and signing secret remain absent; existing Sandbox
  creation stays enabled, live charging source-locked.

The bounded repair is complete. Deferred Sandbox webhook/activation/device/event
acceptance remains the next payment stage and needs the owner's provider setup;
do not infer approval from this release. No recovery activation, live Tax or real
receipt send is authorized. Broader financial/refund/reservation/privacy/business
launch gates are unchanged. QA agent is closed; no task server/PTY exists and user
development servers remain. Task-created local/staff tabs are temporary; user-owned
account tab is untouched. Final evidence is docs-only on integration, not another
production rollout. Finish its own PR checks/merge, fast-forward local main/dev-main
against their upstreams, and verify retained task/docs branches match remotes.
