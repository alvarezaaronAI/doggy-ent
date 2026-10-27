# Stripe Tax Readiness: 2026-10-27

## Scope And Current State

Owner requests externally calculated US tax, rate/jurisdiction transparency and
deployment. No current sales-tax registration; a private business-origin address
is supplied. Do not commit that address or infer a legal registration obligation.
Real charging remains source-locked. Current shared testing site uses the connected
Chase and Evie Sandbox, with test-card creation enabled and automatic mail off.

Fresh Git audit: clean synchronized dev-main99567e0, main1738cc7; integration has
only final evidence docs beyond production. Task feat/stripe-tax-readiness starts
from that integration. Existing source uses hardcoded state estimates, an8percent
fallback and a client7.5percent fallback; the Stripe provider is a placeholder.
Those guesses must be removed, never retained as a provider-failure fallback.

Owner explicitly approves an optional additive Order tax snapshot migration on
Railway after fresh private backup/preflight. This is not approval to rewrite old
orders, create real registrations, collect real tax, purchase a plan or send mail.
Latest owner answer explicitly selects preparation with Stripe Tax OFF. Do not
configure even sandbox address/category/registration or activate a paid plan.
No Stripe settings/registration mutation is authorized by this task.

## Implementation Plan And Ownership

- Parent owns server tax calculator/config/mapping, trusted quote binding and tax
  snapshot persistence, optional migration, provider setup only if separately
  approved, protected admin readiness, docs, data/deployment verification.
- Customer worker Anscombe (01a17eb4-c47a-7dd3-924e-9c6b2b78a6b2) owns checkout
  tax disclosure/US-only address UI, removal of client tax guesses, saved public
  confirmation details and focused client tests. It owns no server/schema/docs/
  provider/Git edits. Preserve concurrent edits.
- Before release, obtain independent commerce review and current-head Quality;
  use one Git publication stream. No publication is performed yet.

Public pricing.taxDetails and saved order.taxDetails use an explicit safe shape:
provider, status, taxAmount, ratePercent (string or null), location (country/state/
city only), breakdown (label/ratePercent/taxAmount/taxableAmount/taxabilityReason),
calculatedAt. No raw addresses/provider objects or internal references in the UI.
Internal immutable snapshot additionally stores version/calculation reference.
Legacy orders remain unknown/null, never assigned a fabricated historic rate.

Disabled setup produces zero with explicit setup-pending/not-collected wording;
it never claims exemption or an authoritative0percent rate. Stripe mode requires
verified intended account, active tax settings, product classification and active
registration readiness. Provider/address errors fail closed, not to guessed rates.
US-only rules must apply on the server, not just the country picker.

Taxed PaymentIntents must use the exact server calculation and preserve its result
through finalization, not create a second calculation for an already-paid order.
Bind the signed checkout proof to trusted cart/discount/shipping/address inputs and
the bounded server tax snapshot. Validate paid amount and calculation linkage;
changed inputs after payment must give safe support guidance, not another charge.
This scoped binding does not replace the separate durable attempt/webhook backlog.

## Implementation Milestone

Server adapter, US-only boundaries, bounded saved/public tax details, trusted
quote/address binding, PaymentIntent calculation hooks and frozen-tax finalization
are implemented. Client disclosure, stale-preview guards, saved order views and
protected read-only admin readiness are present. The optional column is not yet
applied. No source release/provider configuration change has occurred.

Earlier full offline results: server788, client608, gateway6 pass; Prisma6.16.2
generation passes. Rerun after final linkage validation and independent review.
The guarded runner already selects whole checkout/payment directories; additional
admin tax tests are now explicitly included. All genuine provider Tax calculations
remain unverified because setup is intentionally off.

Screenshot investigation: no matching site string for Front End / Back End; the
development routing panel is import.meta.env.DEV-only and has different labels.
The pill appears to be Safari native tab-group/topic UI. Verify published DOM too.

## Next Steps

Finish review and integrated tests/builds; record provider/read-only findings and
QA at each milestone. Apply only the single
approved additive migration after complete decoded backups and preservation checks.
Keep a checkpoint before deployment and verify exact artifacts, tax projection,
receipt/admin display, mode/ownership boundaries and no real provider sends.

## Data And Review Milestone

Approved sole nullable Order.taxSnapshot migration is complete locally/Railway.
Private full backups decode (local367290bytes; Railway2807050bytes); fresh receipts
and digests are under the private tax-readiness backup directory, never source.
All28migration checksums match, none pending/failed; all34business table record
fingerprints preserved, existing snapshots null. Actual local Prisma/Postgres
JSON round-trip/public projection/legacy-null/rollback fixture leaves no orders.

Independent commerce reviewer James completed the full source review and fix-only
re-review. Two findings fixed: selected carrier rate disappearance now409/exact-ID,
not static fallback; changed card/wallet totals trigger preview refresh but never
auto-retry payment. Actual adapter hooks attach/match/missing/mismatch/off cases
are covered. No remaining scoped Tax-OFF release blocker; live recovery/attribution
backlog remains. Reviewer did not independently run commands or inspect providers.

Current full tests: server795(60/729/6), client610(11/593/6). Gateway6 and runner
safety9 pass. Guarded payment selection intentionally excludes HTTP-listener tests:
the network guard correctly rejected a temporary inclusion, which is removed;
actual HTTP/session tax authorization is covered by the full server suite. Rerun
guarded selection after this correction. A mistyped local runner path and wrong
admin-build public-origin variable were corrected; focused tests/builds then pass.
All three client builds and server generation passed before final edge fixes;
rerun final client artifacts. Read-only sandbox last24h intents0, no pagination.

No Stripe settings, keys, business address, categories, registrations, paid plan,
email trigger/gate or payment flag changed. Hosted sandbox cards stay enabled;
Tax defaults none and live charging remains hard-locked. Next: final builds/scans,
UI check, scoped PR/CI/review/release and exact-artifact verification. No Git source
publication yet. Don't repeat migrations or enable Tax during deployment.

Final local milestone: full server795/client610, guarded payment418server/282client,
gateway6/runner9 pass. Server build/Prisma6.16.2 and combined2363/admin2266/
storefront2216module builds pass after edge fixes. Expanded scan64paths/39JS/10Markdown
finds no configured-secret/credential-pattern or local-reference/fence issues;
git diff --check passes. No dependency upgrade. Release path is task PR to
dev-main, checked/reviewed full release to main, then all three exact-SHA artifacts.
