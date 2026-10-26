# Checkout, Receipts And Manual Order Email

## Automatic Payment Receipt (2026-10-25)

Owner-approved exception to older manual-only receipt notes: exactly one payment
confirmation may be automatic; fulfillment/shipping and all other operational email
stay manual. The separate protected admin, Better Auth, guest checkout, trusted
Stripe verification and current saved-order receipt privacy are preserved.

After Stripe verifies amount/currency/status, checkout passes a private service
context to `createNewOrder`. That service reads active saved receipt configuration
and renders from the same normalized order/item snapshots that will be stored, not
browser-supplied receipt/recipient/HTML fields. Receipt preparation failure prevents
order commit so the existing completed-payment retry can finalize the same payment;
it must not invite another charge or silently lose the receipt intent. Once prepared,
the receipt's nested EmailDelivery write is atomic with Order/items/stock. Duplicate
PaymentIntent/order or receipt-key conflicts cannot decrement stock twice. Generic
order creation and status/tracking saves do not enable automatic receipts.

The payment receipt is financial confirmation only. Campaign usage still commits
later, so predicted giving is deliberately not frozen into this email. The on-page
receipt and later manual emails use persisted giving attribution as before. This
does not repair browser-only payment finalization/webhook recovery or separate
promo/campaign commits; those launch gates remain open.

`CheckoutReceiptSettings` is disabled with no row by default. It stores the selected
saved active ORDER_CONFIRMATION template, DISABLED/DRY_RUN/LIVE mode, optimistic
revision and admin actor. Existing templates/copy are never rewritten by startup or
new suggestions. Template archive/event changes make it ineligible for future
receipts; admin shows an unavailable-selection warning. Queued copy is frozen.

`EmailDelivery.automatic` plus private `renderedEmail` extend the existing delivery
store. A SHA-256 payment-derived key permanently deduplicates the one automatic
receipt without exposing the PaymentIntent ID. Worker starts with the long-running
Railway server, scans up to five eligible jobs every 15 seconds, avoids overlapping
local runs and uses a database QUEUED -> PENDING compare-and-set across instances.
It never scans old orders to backfill mail. Off pauses the queue; Live may release
already queued live jobs. Dry jobs remain MOCKED and cannot later become live.

Live requires saved LIVE mode, `CHECKOUT_RECEIPT_SEND_ENABLED=true` and existing
non-mock Resend configuration. The flag does not verify DNS or provider eligibility.
No keys/sender/config change or live send is part of this implementation. Missing
configuration cannot become SENT. Each claimed row has at most one HTTP attempt;
FAILED and uncertain PENDING are never automatically retried. Resend's own
[idempotency retention](https://resend.com/docs/dashboard/emails/idempotency-keys)
is only 24 hours, so database state remains the long-term guard. An ambiguous crash
after claim/acceptance needs deliberate provider reconciliation, not a new key.

SENT means provider acceptance, not delivered/read. Customer receipt state is a
safe enum-like value, never the private rendered body/metadata/provider ID. Extra
body JSON is discarded after SENT/MOCKED/FAILED; uncertain PENDING retains it for
review. Audit retention/disposal still needs business decisions. The new payment
template explicitly separates payment received from manual review and later shipping.
All five suggestions share the monogram/PNG-Lucide/table/text rendering; arbitrary
HTML, JavaScript, SVG/webfont dependence and private receipt URLs remain prohibited.

Admin template GET includes safe receipt settings; protected
`PUT /api/admin/email-templates/checkout-receipt` validates saved template/mode/revision
and records the real ADMIN actor. Settings Save sends nothing itself, preserves
unsaved-template separation and has Cancel/leave protection. Manual real-order
preview/proof/send and other provider guards remain intact.

Additive migration `20261026000000_checkout_payment_receipts` adds only the settings
table/FK/mode check and delivery Boolean/nullable JSON/index. Local and Railway now
have 27 matching complete migrations after owner-approved fresh decoded backups;
old business/account/email records were preserved and settings remain absent/off.
See [checkpoint](../work-checkpoints/2026-10-25-checkout-receipt-email.md) for exact
checks, rollout state and live approved-inbox/domain gates. Do not infer activation
or successful customer delivery from a migration or dry run.

Implemented locally: 2026-10-10. This is source and local QA evidence, not proof of deployed payments or delivery.

## Customer Presentation

- Receipt First checkout keeps contact, shipping, delivery, payment and order-summary cards with restrained borders/shadows. The bag opens above the form on narrow containers and sits beside it on wide containers. It can be collapsed on narrow screens. The secure submit button is available on mobile as well as desktop.
- Guest Sign in/Create account opens a native dialog without leaving checkout. Create requires first/last name, normalized email, password confirmation, then a review step. Confirm creates through existing Better Auth, verifies a session and returns to the unchanged checkout. If signup creates the account but session confirmation fails, retry signs in instead of creating a duplicate account. Guest checkout remains available.
- Signed-in checkout prefills only blank safe fields from the existing account/profile. It does not replace customer-entered delivery details. Profile marketing preferences remain account-owned. No order/payment is submitted by authentication.
- Soft Essentials confirmation uses actual saved item snapshots, totals, campaign/promo attribution, shipping and tracking. Cancellation/refund wording does not promise preparation. A loading/error page never pretends that an unavailable order succeeded.
- Email reassurance names the saved order email. `NOT_SENT` explains that the on-page receipt is available and admin reviews before email. `SENT` means provider acceptance, not delivery. Account-history reassurance appears only when the current customer owns the linked order.
- Cost summary uses conventional receipt rows: items subtotal/count, optional negative discount/code, shipping, estimated tax and a prominent order total. Amounts are aligned; arithmetic plus/equal signs were removed after user feedback. No giving amount is part of the bill. `CommerceGivingNote.vue` is a separate emerald card below the entire checkout summary and outside the confirmation financial panel, with a prominent contribution and concise business-funded/no-extra-cost wording. Checkout estimates hide during refresh; saved receipts use persisted attribution. The canonical `givingBeneficiaries` helper in `commercePresentation.js` also supplies manual email rendering, with no separate client/server beneficiary rule.

### Postal Address And Submit Readiness

`CheckoutShippingSection.vue` renders labeled autofill fields, optional apartment expansion, then a compact postal review after explicit **Use this address**. `useCheckoutAddressReview.js` owns only presentation completeness/review/focus and keeps the existing customer object intact. Edit focuses the street field; it never saves an address, verifies deliverability or triggers payment. Canada receives a province text field rather than US choices. Existing four US state choices remain unchanged; full destination/provider coverage is not certified.

The submit component now uses storefront yellow/brown instead of the erroneous blue background/brown text. `useCheckoutPage` returns Boolean readiness, correcting a subtle Vue Boolean-prop cast where an empty required string was interpreted as true. The existing submit validator still blocked missing fields before this UI repair. The same submit component appears inert in the admin sample canvas. Stripe Address Element was reviewed but not introduced; autocomplete/completeness is not carrier deliverability verification.

## Shared Cards And Campaign Pop-Out

`CommerceCardSurface.vue` owns the bordered surface and giving/promo accents. `CommerceItemCard.vue` owns image/fallback, name, selected size, quantity, SKU, unit price, line total and attribution. `commerceItem.mapper.js` adapts cart and saved-order shapes without changing domain prices. Cart, checkout, confirmation and account order details use that item card. Catalog `ProductCard.vue` uses the same surface while retaining its variant controls.

Campaign attribution gives a soft emerald background. An actually applied promo gives a promo marker; emerald wins the background when both apply. Private/admin promo eligibility is not guessed or exposed on catalog cards. Item-level eligibility for general order discounts is not represented in the current schema, so an applied order promo is labeled as order-level attribution rather than a new product discount rule.

Published campaign badges open `CampaignQuickView.vue` through the shared `useCampaignQuickView` state. The dialog loads the actual public campaign API and renders **the same `CampaignPageContent.vue`** as the standalone page and campaign editor. Private/disabled pages remain plain giving badges. Product actions inside the campaign pop-out browse back to the shop instead of pretending to add to cart. Closing does not clear the cart, checkout or account state. The cart focus trap defers to an open native dialog. Full device/screen-reader/nested-dialog QA remains required.

The impact card's **About campaign** actions use this same pop-out. `mapGivingCampaigns` joins trusted preview attribution with the public summary by campaign ID only for slug/publication metadata; it preserves financial amount/beneficiary data. Unknown/private summaries cannot create an action. Historical receipts use the server's allowlisted publication metadata. Editor cards do not open campaign dialogs. No content is published merely to make QA buttons appear.

## Wallets

`StripeWalletButtons.vue` uses Stripe Express Checkout Element with Apple Pay/Google Pay availability. Unsupported/unavailable devices see an honest card fallback. Wallet confirmation uses `elements.submit`, the existing trusted server PaymentIntent API, a displayed-versus-server amount check, then `confirmPayment`. Card checkout retains Stripe Card Element and `confirmCardPayment`, with the same amount check and checkout proof. Wallet success reuses the ordinary order finalization path; an order-network failure after payment can retry without charging again.

Admin Website -> Page to edit -> Checkout owns public `applePay` and `googlePay` Boolean settings in existing `StorefrontContent` JSON. Save draft does not affect shoppers; explicit Publish does. Card checkout cannot be disabled through these presentation switches. Default settings preserve old published documents. Stripe account/domain configuration, HTTPS, device/wallet setup and approved test payment QA are still required. Local HTTP availability is not proof of an Apple Pay/Google Pay transaction. See [Stripe's official integration requirements](https://docs.stripe.com/elements/express-checkout-element/accept-a-payment).

## Pricing, Payment And Inventory Trust

The code audit found browser item prices/SKUs still entering the purported server-owned calculation. `checkoutCatalog.service.js` now resolves product ID plus selected size against actual ACTIVE products/active variants, converts database cents once, validates bounded positive integer quantities and aggregate inventory, and returns real names/images/SKUs/prices. Preview, PaymentIntent creation, finalization, public promo validation and campaign preview use this boundary. Browser subtotals, line totals, prices, SKU, donation and shipping prices cannot override pricing.

Promo validation requires normalized email and recalculates the DB subtotal. Client email changes clear applied promos and invalidate in-flight responses. Invalid/expired/email-ineligible promos are rejected before PaymentIntent creation. Campaign giving and discounts coexist; giving is business-funded and not added to the customer total. Tax is the existing jurisdiction estimate, not a tax compliance certification.

After Stripe status/amount/currency verification, inventory-limited stock and Order/OrderItems are written in one Prisma transaction. Stock uses a conditional `inventory >= quantity` decrement. Made-to-order/preorder items do not decrement tracked stock. Unique PaymentIntent insertion failure rolls back decrements. An already-created payment returns the persisted order before spent promo/stock is revalidated. Promo/campaign usage has existing unique constraints, but is still recorded after order insertion in separate operations: concurrency, failed usage persistence and post-payment catalog/stock/rate changes remain launch risks.

## Guest Receipt Privacy

Reference-only order reads formerly returned customer contact/shipping data publicly. They now require either the owning Better Auth customer or a short-lived receipt capability from verified checkout. Capabilities are scoped resource proofs, **not an admin/customer bearer-auth fallback**.

1. PaymentIntent creation returns an email/PaymentIntent-bound `checkoutProof` valid for 24 hours.
2. Order POST requires that proof, then still retrieves/verifies Stripe. A bare PaymentIntent ID cannot mint a guest receipt.
3. Successful order finalization returns a reference-scoped `receiptAccess` valid for 24 hours.
4. Client stores it in memory/sessionStorage, not the URL or localStorage; receipt GET sends `X-Order-Receipt`. Read/write responses use no-store.
5. Signed-in readers without receipt proof are restricted by server-owned `userId`. A proof cannot read another reference. Unavailable/unauthorized reads return generic failure, not customer data.

`signedCapability.js` signs with existing server `BETTER_AUTH_SECRET`, falling back to `ADMIN_SESSION_SECRET`. Production without either cannot sign; development without either uses a process-local key that is invalidated by restart. Keep stable server secrets across instances. Proofs are never logged/documented or treated as authentication sessions. Guest saved-reference links alone are intentionally insufficient; clearing storage, expiry or secret rotation requires a supported account/order-help route. Existing legacy reference-only guest bookmarks stop exposing PII, but a verified guest receipt-recovery flow remains future work.

**Deploy server and frontend together:** older frontend order POSTs lack `checkoutProof`. Do not roll out this backend contract while older checkout clients are still taking payments. Schedule coordinated rollout/in-flight checkout handling and approved Stripe test QA.

## Consistent Website Editors

`AdminWebsiteView.vue` selects Homepage, Checkout or Order confirmation in the existing workspace. Navigation left, shared renderer middle, contextual fields right, explicit Save draft/Publish/Cancel. Small screens stack inspector/canvas. `AdminCommerceCanvas.vue` uses actual contact/shipping/delivery/payment/summary components and actual `OrderConfirmationContent.vue`, with fictional `COMMERCE_SAMPLE`. Stripe fields are inert presentation in editor mode; no provider/payment/email is initialized by sample actions.

Editable checkout: heading/introduction and wallet switches. Editable confirmation: heading/introduction, oat/white/emerald background, next-steps and help wording/safe destination. Customer identity, prices, payment status, receipt delivery and order details are protected live data, never editable presentation. Canonical defaults/validation/projection remain in `shared/storefront`, including `commercePresentation.js`; both isolated deployment roots receive generated snapshots. Section-specific changed markers and selection scrolling follow the existing editor convention.

## Manual Email Template Center

`/admin/email-templates` uses the same editor convention: template list, safe sample email canvas with wide/phone controls, contextual fields and explicit Save/Cancel. Five starters: payment confirmation, preparing, shipped, delivered, cancelled. Adoption reuses a saved copy, with a deterministic server-owned primary key reserving one new copy across retry/concurrency. A pre-existing same-event template is reused active-first/oldest-first; a reserved copy wins even after renaming, type changes or archival. Reuse never overwrites fields or restores archives. Suggestions expose only their linked editableCopyId; copies outside the bounded ordinary list are included so selection cannot recreate them. No schema migration/startup seed/deduplication delete. Successful save response becomes the editor's saved identity/baseline immediately, without a post-save reload that could fail or lock the fields. Saved templates retain archive/revision protection; no save sends mail.

`EmailTemplate` stores id, internal name, supported event, subject, heading, body, footer, archived state, revision and timestamps. This is plain-text authoring within a server-controlled rich responsive email, not arbitrary HTML/CSS/script. Only `customerName`, `orderReference` and `orderStatus` placeholders are supported now; unknown/malformed placeholders are rejected. Saved order items/totals/contact/shipping/giving/tracking are rendered server-side, HTML-escaped, with safe HTTPS tracking. No Stripe identifiers/secrets, auth/session/reset/verification data or private provider payload is placed in order emails.

Protected API endpoints:

| Endpoint | Responsibility |
| --- | --- |
| `GET /api/admin/email-templates` | Saved templates, suggestions and non-secret provider status. |
| `POST /api/admin/email-templates` | Adopt a known starter idempotently; reuse an existing copy without overwrite. |
| `PUT /api/admin/email-templates/:id` | Revision-matched update/archive. |
| `POST /api/admin/email-templates/:id/preview` | Sample/unsaved preview, or actual saved order/recipient preview. |
| `POST /api/admin/email-templates/:id/send` | Confirmed dry/live action; 10 requests/15 minutes and admin auth. |

Order detail -> Customer email updates -> choose template -> Preview -> review recipient/message -> explicit confirmation -> Record dry run or deliberately enable Send real email. Default is dry run even when Resend is configured. The server never accepts an arbitrary recipient override. Status-specific templates require matching saved status; shipped requires saved carrier tracking. A sample/unsaved preview cannot send.

Actual-order preview includes a 15-minute actor/order/template-revision/render-fingerprint proof. Send rechecks current saved data, eligibility and proof; stale/expired/wrong-actor previews fail before provider calls. Provider status must permit live sends. Order updates/preferences still apply. Unique delivery reservation and Resend idempotency prevent duplicate identical sends; dry/live keys are distinct. Audit metadata records ADMIN_ENV actor/template/revision. Provider fetch has a 15-second timeout. Exact FAILED/pending sends are not blindly retried: review provider/activity first; a safe explicit retry/reconciliation workflow remains future work.

`EmailDelivery` remains the delivery/audit store: MOCKED means none sent; SKIPPED means no send; SENT means provider accepted; FAILED needs investigation; DUPLICATE prevents repeat. No inbox-delivery guarantee or new delivery webhook is implemented.

Automatic checkout confirmations, new-order admin notices, failed-payment notices, order status and shipping/tracking sends were removed from their triggers. Provider additionally rejects operational/order events without the trusted internal manual-approval flag. Legacy unpreviewed resend endpoint returns 410. Better Auth verification/reset and intentionally enabled welcome/security messages remain intact. No bulk marketing/support/review automation was introduced.

## Configuration And Deployment Gate

No new env files or values. Required existing names, never copy real values into docs:

- Client: `VITE_API_BASE_URL` (or supported `VITE_API_URL`), `VITE_STRIPE_PUBLISHABLE_KEY`.
- Server: `DATABASE_URL`, `NODE_ENV`, `PORT`, `CLIENT_URL`/`FRONTEND_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, optional `BETTER_AUTH_API_KEY`, `STRIPE_SECRET_KEY`.
- Email: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, optional `RESEND_REPLY_TO_EMAIL`; existing `EMAIL_FROM`/`EMAIL_REPLY_TO` aliases and `EMAIL_PROVIDER`/`EMAIL_MODE` dry-run switches remain supported. Provider values stay server-side.
- Shipping: existing `SHIPPO_API_KEY`/`SHIPPO_API_TOKEN` and `SHIPPO_WEBHOOK_SECRET` where configured.

Additive migration `20261010000000_manual_email_templates` was applied only to guarded LOCAL loopback PostgreSQL. Local status: 21 migrations, schema up to date. Content/media/manual-email migrations and matching application deployment need explicit Railway approval/preflight. Existing server startup runs migration deploy: do not deploy/restart on Railway casually. Wallet toggles reuse existing content JSON and require no separate schema columns. Preserve normal local env and existing local-client -> local-backend -> selected DB modes.

See [communications](../communications.md), [QA](../verification-and-qa.md), [handoff](../../PROJECT_HANDOFF.md) for actual checks, no-send evidence and remaining rollout/device/payment risks.
