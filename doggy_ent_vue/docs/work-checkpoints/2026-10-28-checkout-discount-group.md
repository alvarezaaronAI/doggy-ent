# Checkout Discount Group: 2026-10-28

## Scope And Baseline

Owner requests a final focused checkout UI adjustment: visually associate promos
with the item subtotal they reduce, while explaining current tax and campaign
behavior. Preserve the approved checkout/payment cards, financial authority,
summary thumbnail/monogram and existing gold/blue/emerald/brown accents. No tax
activation, campaign-rule change, DB migration, provider send or payment test.

Fresh fetch/preflight found clean synchronized dev-main1bfe301 and main1199d5f.
New scoped branch is fix/checkout-discount-group. Parent owns all mutations and
managed publication under the existing bounded Git workflow authorization.

## Implementation And Confirmed Existing Rules

- A discounted subtotal receives a light neutral bordered reading group. Discount
  and before/after item amounts are indented under a left rule, explicitly labelled
  Discount on items. Shipping, tax and final total remain outside that group.
- No-discount checkout keeps its compact ordinary subtotal. Gray percentage pills,
  emerald savings, original server total and per-item presentation are preserved.
  Long promo codes wrap without widening the summary.
- Tax uses the Stripe Tax calculation API when explicitly configured, not a local
  tax-rate table. Discount pennies are allocated across item lines before tax;
  shipping is separate. The stored order snapshot preserves the calculation,
  not an editable rate source. Fresh hosted read-only quote on2026-10-30 confirms
  none/not_configured/zero, ratePercent null. Sandbox results are not guaranteed
  current by Stripe.
- Giving campaigns select active/scheduled matching products. Fixed giving is per
  eligible order; percentage giving currently uses eligible item subtotal BEFORE
  promo discounts, excluding shipping/tax. It is company-funded, not charged to
  the customer and does not reduce the taxable sale. This pass does not change it.

## Verification And Next Steps

Focused summary/image/tax presentation checks:61pass. Three new cases cover
grouping/indent/scope, no-discount presentation and long promo-code wrapping.
No runtime pricing/service/schema/configuration file changed.

Private DB-free fixture runs in task session22215 at localhost5197. All API
responses are in memory, payment SDK calls/writes blocked, sample8.25% not a real
tax quote. Owner development services remain untouched.

Resumed2026-10-30: fresh fetch confirms same clean upstream baselines and only the
five task-owned paths changed. Full client659(11/642/6), storefront and admin builds
pass again. Independent reviewer Russell found no issues; financial script is
byte-identical to baseline and focused61tests pass. Actual320px-wide summary at
wide viewport shows SAVE10:14.99 ->13.49,total21.09 and SAVE5:14.99 ->9.99,total17.30,
including separate5.99shipping, gray rate pills and fictional8.25%tax. No summary
cell or document overflow was observed. Safe crop checkout-discount-group.png is
saved outside Git. Browser viewport override did not reliably apply requested
mobile dimensions (observed1310/2560px); no new full-device/mobile acceptance is
claimed, and override was reset. Long-code wrapping is tested in SSR, not a claimed
real-device check. Actual screen-reader acceptance remains manual.

Fresh hosted quote returns200/none/not_configured/tax0/nullrate/16.98total for the
existing Duck example. Staff session refresh is unavailable, so the public server
quote, not a stale badge, is the current evidence. No intent/order/email created.
Read-only Railway preflight confirms28matching completed migrations,0pending,
nullable taxSnapshot and34business tables. Existing production Railway80d2fece
SUCCESS and shopdpl_JBFSQ61wf2JZxqVqtdc8tyLK6p87 READY still identify main1199d5f.

Next: review exact diff/docs and current-head CI before task PR -> dev-main ->
release PR -> main. Existing server startup runs migrate deploy; unexpected pending
migration blocks rollout, even though this task has no schema changes. Verify exact
source on Railway and both stable Vercel aliases, then live UI without ordering.
Stop task fixture, reset viewport, close task preview and sync primary branches.
Record final evidence on integration without a second docs-only main rollout.

Rollback is the prior reviewed main1199d5f source; no data/config rollback is needed.
Existing payment/device/Tax-enabled/receipt launch gates and dependency advisories
remain separate. This is not a real-payment launch acceptance.

## Publication Milestone (2026-10-30)

Implementation74cfc559f4af5f1268ba92751e31518211e39796 is pushed/synchronized on
fix/checkout-discount-group. PR68 targets unchanged dev-main1bfe301, with5files/
146additions/13deletions; no reviews or unresolved threads. Both Vercel previews
are successful, but Quality41100478631 client/server remain QUEUED at that exact
head as of17:42UTC. Do not merge/bypass queued checks. The Actions job browser page
also returned a GitHub load error; no repository cause is confirmed. Provider status
reports operational, so do not attribute the queue to an active outage without
evidence. Local full client659/server802/gateway6 and all combined/storefront/admin/
server builds pass. No workflow/configuration/dependency changes were made.

Release target preflight confirms existing Railway production API service and
main/rootserver/startnpm; staged changes null. Staff Vercel SSO remains enabled
for all deployments. Complete production-to-task diff has only the2presentation/
test files plus5current/prior evidence docs. No server/schema/startup change.

Parent is now on docs/checkout-discount-release-evidence with this task-owned
evidence only. Keep it OUT of dev-main until the checked implementation/release
head is merged. Next: verify PR68 current-head Quality success and unchanged base,
guarded merge, then release PR dev-main -> main with its own exact-head Quality.
Repeat DB preflight if stale. Verify exact-source production deployments and live
summary; finish final evidence, docs-only PR, sync clean main/dev-main/task refs.
Fixture22215 and previewtab12 are still task-owned; close/stop during final cleanup.
GitHub diagnostic tab14 is temporary; owner live tabs3/4 must remain.

Owner resumes after interruption: fresh fetch still matches both primary upstreams,
PR68 head74cfc55/base1bfe301 unchanged and mergeable. By17:48UTC both Quality jobs
are IN_PROGRESS (no failure/annotations; step summaries still empty), not passed.
Do not mistake started/preview success for merge acceptance. Fresh read-only
28migration/checksum/no-pending preflight passes again. No merge or production
deployment has been attempted while these required checks are incomplete.

At17:53UTC PR68's exact-head client/server Quality succeeds. Its only annotations
are existing action Node-runtime deprecation/Ubuntu runner notices. Fresh PR
head/base/mergeability and empty reviews/threads are checked; guarded merge
integrates d2beb1f43d343e40c069bdb81c91443f4fc3a72e. Runtime/file tree matches reviewed
74cfc55 exactly. Full7file production release diff is reviewed; PR69 dev-main ->
main1199d5f is open and attached. Its own exact-head Quality must pass before main
merge. Keep evidence branch unmerged while that release head is checked. No new
source/provider/DB operation was added to work around GitHub's queue.

PR69 Quality41102258257 checks server124221340086/client124221339836 are still
queued at17:59UTC; both Vercel statuses succeed. Production remains main1199d5f.
Publish this checkpoint branch as a source-only recovery point, not a release or
permission to bypass CI. Its final evidence PR must remain separate from PR69's
unchanged dev-main head until production verification finishes.
