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

## Publication In Progress

Task a09add35aedb3e38a9e68173efa1462baaf92dac is published on
feat/stripe-tax-readiness; PR62 integrates at
bdbc233699bb5aba71676d4392a241da2c93ca68. Current-head Quality40600762534 and both
client/server jobs pass; no reviews/threads block. Parent reviewed complete65-file
release including prior sandbox-evidence-only docs. PR63 targets main1738cc7 with
head bdbc233; require its own successful current-head Quality before guarded merge.
Existing hosting targets/protections/source branches confirmed. No Tax/provider/
payment flag changed. All implementation agents closed; parent is sole Git stream.

Docs-only final evidence branch docs/tax-release-evidence starts at bdbc233 while
PR63 runs; do not merge it into dev-main until the release head is settled. Record
exact Railway/storefront/admin artifact IDs and live tax/UI/privacy checks, then
integrate evidence without another production rollout. Main/dev-main locals need
fast-forward against their own remotes after final merges. No task server remains.

Release PR63 passed exact-head Quality40600984794 both jobs/all steps and no
blocking reviews/threads; guarded merge main is
8df5883153d8f8a89d64efbb0d04fd8043eba8ff. Automatic existing-target rollouts:
Railway a51c7d27-1294-459b-83fc-afea51623243 BUILDING; storefront
dpl_9DiJJmtB8JdLAttnG4XLgLVrGCLE READY; staff
dpl_GAVrMmHgyxoC19ygT6yKK4Hmaktu BUILDING. All identify the exact main SHA.
Do not call rollout complete yet: verify final API/staff states, stable aliases,
tax-off preview/access boundaries and actual UI before final evidence publication.

Both stable Vercel aliases now READY at8df5883: storefront dpl_9DiJJmtB8JdLAttnG4XLgLVrGCLE,
staff dpl_GAVrMmHgyxoC19ygT6yKK4Hmaktu. Public19referenced JS assets respond200;
no long server-key pattern, staff module or development-routing code, sandbox
public key present. Actual published shop DOM has no Front End / Back End text or
development-routing element and no horizontal overflow at2560px. Screenshot pill
is therefore not shop UI (appears to be Safari native tab-group/topic label).
Railway still BUILDING at last check; no premature API/checkout success claim.

## Final Hosted Verification

Railway a51c7d27-1294-459b-83fc-afea51623243 is SUCCESS at main8df5883. All three
artifacts now match that exact source. Startup17entries confirms28migrations/no
pending/listening; four severity-error entries are npm/Prisma stderr notices,
not runtime exceptions. No actual exception/crash/error pattern found. Health
probe initially used wrong /health(404), corrected to actual /api/health(200).

Live API checks23:20:22UTC: health200, sandbox/enabled/no-store with exact storefront
CORS; preview tax0/provider none/status not_configured/rate null/breakdown empty,
total16.98 for10.99subtotal plus5.99shipping. No internal snapshot/hash/calculation
or street address in public preview. Non-US400, missing/live-mode payment starts
409 with no intent/proof, direct staff tax403, anonymous customer401, protected
admin302. No valid-mode payment start or payment submission performed.

Actual live checkout DOM: original bag/account retained; secure card iframe loaded,
one countryUS,52state options(placeholder plus50states/DC), total16.98 and explicit
not-collected/setup-pending wording. Tax disclosure opens in place and shows only
destination city/state, no invented rate. DOM1310px has no horizontal overflow.
Actual staff panel reports Configured Sandbox/Account verified/Allowed(sandbox),
Tax Not collecting; expand shows US-only/no-local-rates, setup pending and no
confirmed registrations, live charging locked. Existing order detail says no rate/
jurisdiction breakdown saved. No editor save, refund, email or order action used.

Public19asset scan and shop DOM prove no development-routing component or
Front End / Back End label; this appears to be Safari native tab-group/topic UI,
not a site/backend switch. No source change is needed for that native label.
Actual browser screenshot cropping did not frame the intended summary reliably;
the temporary capture was removed, not published as evidence. DOM/earlier isolated
1440/390/320client fixture checks support this UI pass; real iPhone/Safari/wallet/
Tax-enabled acceptance is still manual, not claimed from a screenshot.

Fresh shared post-release preflight28matching/no pending; new orders0 and new-or-
sent email deliveries0 since23:14:35UTC, receipt settings absent/off. No provider
settings/keys/address/category/registration/paid plan/payment flags changed. Sandbox
fake-card testing remains enabled; Tax stays OFF and live charging code-locked.
Docs-only final evidence is next into dev-main, then FF local main/dev-main against
their own remotes; don't redeploy production solely for these final artifact IDs.

## Remaining Before Tax Or Real-Payment Launch

- Confirm business tax registrations/obligations with a qualified adviser. Setting
  aside money is not a substitute for required registration/collection/remittance.
- Separately approve provider business origin/product classification/registration,
  fee/readiness review and actual isolated sandbox Tax/hook/refund acceptance before
  enabling TAX_PROVIDER=stripe. No automatic toggle/permit/filing is supplied here.
- Durable attempts, signed webhook/replay recovery, atomic promo/campaign attribution,
  paid-unfulfillable handling and truthful financial/refund reconciliation remain.
- Actual supported-device card/wallet/3DS/failure/reload acceptance, approved receipt
  sender/inbox/budget, operational monitoring/restore and launch approval remain.
- Existing carrier integration needs independently accepted quote lifecycle/package
  coverage before live use; exact stale-rate rejection is not shipping certification.
- Task agents/processes closed. Preserve ignored private backups/env files; source
  rollback leaves the compatible column in place. No destructive down migration.
