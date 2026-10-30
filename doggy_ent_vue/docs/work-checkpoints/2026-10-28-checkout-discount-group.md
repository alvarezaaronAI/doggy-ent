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
