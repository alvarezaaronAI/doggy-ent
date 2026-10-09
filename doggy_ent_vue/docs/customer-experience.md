# Customer Experience Requirements

This document governs customer account, profile, order, checkout, shipping, and support experiences. Preserve guest checkout and the storefront’s existing brand feel.

## Calm Giving Storefront

Implemented 2026-10-09. Home retains the hero, featured product, collection, Next Drops, Happy Pups/social proof area, Made With Care, Ingredient Promise, Meet the Brand, and shopping help. Sections are fluid full-width bands with a constrained inner layout; yellow, blue, brown, and oat brand accents remain. Emerald tints identify products in currently eligible campaigns, not every product.

- Header, cart, search, and customer auth are shared with account and campaign routes. Desktop account hover has a buffered path and delayed close; clicking pins the menu. Mobile navigation supports Escape and closes after navigation.
- Product sizes use deterministic 6 oz then 18 oz ordering. Product cards and featured content share per-product selection; quick view starts from that selection. Price and cart payload come from the selected variant, while final totals remain server-owned. Featured content is independent of catalog search/sort and its image/title are not click targets.
- Campaign badges link to `/campaigns/:slug` only when the public page is enabled. Legacy giving can remain active without a public page. Campaign data failure is separate from catalog failure and does not prevent shopping.
- Campaign pages lead with an introduction, beneficiary, story, contribution explanation, and eligible treats. Generated contributions are not confirmed payouts. Business-funded giving is not an extra donation charged to the customer. Paused/ended pages explain that ordinary purchases do not currently contribute.
- Ingredients/storage copy uses stored product content. No invented nutrition analysis, free-shipping threshold, verified reviews, notification subscription, or social destinations are presented as working features. Happy Pups retains the gallery and explicitly labels verified reviews as future work; business-approved product/brand photos are still a content QA requirement.

See [data flow](architecture/data-flow.md) and [verification](verification-and-qa.md) for source-of-truth boundaries and real-data QA.

### Homepage And Brand Follow-Up

The approved 2026-10-09 baseline implementation retains recognizable section boundaries, larger headings, blue rules, warm/white reading bands, and the original seven-link footer navigation. All nine homepage anchors remain. The photo-led hero uses unframed white text, a neutral gray readability tint, stored product tags, a yellow shopping action, outlined ingredient action, and supporting shopping links. This supersedes the earlier frosted treatment after approval of the interactive preview. Its layout grows with content rather than cropping controls inside a fixed-height container.

- `/meet-chase-evie` is a public story page, not an FAQ or account page. Home teaser/hero, desktop/mobile header, and footer link there. Origin copy and the two names reuse existing repository content; template photography is identified, without invented dog biographies or verified-customer claims.
- The page reuses SiteHeader, SiteFooter, shared search/auth state, cart persistence, and catalog-aware cart helpers. Shopping links return to the real collection/ingredient section. No backend endpoint or customer identity flow was added.
- Hero product copy/tags/primary destination read the same featured product as the featured section. It does not hardcode Chicken Jerky when another product is featured. Loading/empty catalog fallback remains ordinary shopping.
- Next Drops distinguishes loading, failure/retry, and an actually empty list. Upcoming cards again show stored category, tags, description, protein/cut, a Coming Soon notice, and functional Preview. Notify Me is disabled with future-phase copy; it does not open Preview or claim to subscribe a customer.
- Footer uses the user-approved Instagram profile. TikTok/YouTube are disabled, labeled placeholders until real destinations are supplied. Optional public `VITE_INSTAGRAM_URL`, `VITE_TIKTOK_URL`, and `VITE_YOUTUBE_URL` can override destinations; only valid HTTPS links on the intended platforms are enabled.
- No unsupported human-grade certification, free-shipping threshold, delivery guarantee, return promise, or nutrition analysis was restored from reference images. Campaign green accents, selected variant/cart behavior, checkout totals, auth, and admin remain unchanged.

Next Drops now has a full-width introduction followed by two generous product columns on larger screens and one column on mobile. Soft shadows distinguish individual product items, featured media, gallery images, and care steps; entire page sections are not floating cards. Hero/gallery template JPEGs are bundled locally through `brandContent.js`; product images, variants, prices, stock, and campaign eligibility remain API-owned. Template photos are not actual portraits or customer reviews.

Add to Cart continues to open a right-side drawer over the current page, not a cart or checkout route. It is 420 px wide on desktop and fits the viewport on mobile. Quantity/removal/selected price remain driven by the existing cart composable. The drawer has a labelled dialog, Escape/backdrop close, contained keyboard focus, opener restoration, background scroll locking, and focus recovery after removing a row. On short landscape screens, the entire drawer content scrolls under a sticky close/header so footer actions cannot be clipped. Secure Checkout alone navigates to the existing `/checkout` page; the drawer never calculates finalized tax/shipping/discount/payment totals.

Real Chase/Evie portraits and business-approved expanded story content remain a manual content phase. These UI edits are not deployed automatically. The user approved the unframed baseline preview; final real-device/Safari and business imagery review still remain.

## Customer Account Overview

Redesign the account home as a clear navigation hub when customer account work is in scope.

Requirements:

- Create an easy-to-scan account menu page.
- Make all major account sections easy to reach.
- Move tracking, reviews, messages, support, and similar secondary items into the account menu instead of cluttering the overview.
- Show a maximum of two recent orders on overview.
- Remove vanity or unnecessary metrics such as lifetime spend unless they provide a real customer benefit.
- Prefer useful content such as recent order status, saved/default address state, account verification state, open order issue state, and next actions.
- Use featured products in empty or low-content areas when appropriate, keeping them simple and readable.
- Empty states should include useful actions such as continue shopping, browse featured products, or complete profile.

## Customer Profile

Profile should let customers manage useful account data while preserving Better Auth ownership.

Requirements:

- Show name and verified account email.
- Email cannot be changed until a safe verification flow exists.
- Provide a polished email verification card or popover.
- Clearly show verified or unverified state.
- Allow resend verification with rate limiting and safe UX.
- Allow editing and saving name, phone if supported, default shipping address, and additional saved addresses when supported or appropriate.
- Show a stored-information card summarizing what the account currently has.
- If nothing is stored, show a polished empty state.
- Show saved changes immediately after successful save.
- Remove customer-facing email activity history.
- Remove preferred communication method controls.
- Do not imply SMS or other unavailable channels exist.
- Customer communication channels are email and in-account messages or issue replies.

## Customer Orders

Redesign orders as one responsive page split into two primary sections when order UX work is in scope:

1. Orders list/navigation.
2. Selected order details.

Requirements:

- Select the most recent order by default.
- Clicking another order should update details without requiring separate full-page navigation when practical.
- On mobile, adapt the split view into a clear stacked or drill-in pattern.
- Group orders by month.
- Current month remains expanded.
- Older months are collapsed by default.
- Each order list item should show only useful summary data.

Order details should include:

- Friendly order reference.
- Placed date.
- Order status.
- Fulfillment/shipping state.
- Product images.
- Product name.
- Selected variant.
- Quantity.
- Unit price.
- Line total.
- Subtotal.
- Shipping amount.
- Selected shipping carrier/service/method.
- Tax.
- Discount only when present.
- Promo only when present.
- Donation only when present.
- Total.
- Tracking only when available.
- Customer-visible issue messages and resolution when available.

Exclude empty, null, zero-value, or irrelevant sections. Remove customer-facing internal order timelines. Do not expose raw Stripe IDs, internal database IDs, internal status history, or admin notes.

## Need Help And Order Issues

Add a clear `Need help?` action under each eligible order when support work is in scope.

The action should:

- Open a polished quick menu or modal.
- Prefill order reference, customer, order items, delivery state, and other useful context.
- Let the customer select an issue category.
- Allow a short description.
- Allow optional item selection when the issue concerns a specific item.
- Create a customer-facing case number.
- Show confirmation and case status.
- Make replies and resolution visible from the related order page.
- Avoid forcing the customer to re-enter data already known to the system.

Eligibility:

- Customers may create an order issue only within seven calendar days after confirmed delivery.
- If the order is not delivered, allow only appropriate pre-delivery issue categories when useful.
- After the dispute window closes, disable the action and explain why.
- Admin override may be supported, but customer rules must remain clear.

Suggested statuses:

- `OPEN`
- `REVIEWING`
- `WAITING_FOR_CUSTOMER`
- `ACTION_REQUIRED`
- `RESOLVED`
- `CLOSED`

Future support may include refunds, replacements, store credit, apology promo codes, internal notes, customer-visible replies, and attachments.

## Checkout

Requirements:

- Signed-in customers should have known information prefilled.
- Prefill name, email, phone, and default shipping address when available.
- Guests must still be able to checkout.
- Preserve guest checkout.
- Allow customers to edit checkout values without silently overwriting saved profile data unless they explicitly save changes.
- Clearly distinguish checkout-only edits from saved-address changes.

## Apple Pay And Google Pay

For now:

- Disable Apple Pay and Google Pay checkout.
- Do not show active payment buttons.
- Present them only as a polished future feature if shown at all.
- Use clear copy such as `Coming Fall 2026`.
- Do not imply they currently work.
- Do not build incomplete payment-sheet flows in this phase.

## Shipping Rates

Treat `Carrier rates are unavailable. Store shipping rates are shown.` as a verified root-cause task, not a cosmetic message change.

Investigate:

- Shippo environment variable names.
- Token selection.
- From-address configuration.
- Destination address normalization.
- Parcel dimensions/weight.
- Provider request payload.
- Provider response.
- Timeout/error handling.
- Test-mode restrictions.
- Unsupported carrier/service behavior.
- Fallback behavior.
- Server logs.
- Customer-safe errors.

Customer-facing behavior:

- Explain when live carrier rates are unavailable without exposing provider internals.
- Continue with store-configured fallback rates when safe.
- Never trust client-submitted shipping prices.
- Checkout preview, PaymentIntent, and order creation must use the same server-verified shipping amount.
- Persist selected shipping carrier, service, rate metadata, and cost.
- Show selected shipping method in checkout, order success, customer order detail, and admin order detail.

## Implemented Run 1 Notes

As of the 2026-06-17 product experience pass:

- Account overview removes lifetime spend and shows useful state such as recent order status, email verification, and open order issue count.
- Account overview recent orders are capped at two.
- Profile editing supports name, phone, marketing opt-in, and default shipping address.
- Profile email is fixed account identity; customer-facing email activity and preferred contact method controls were removed.
- Checkout signed-in prefilling now includes default shipping address when available and only fills empty checkout fields.
- Orders use a responsive split view with month grouping and selected-order detail.
- Customer order detail hides internal status history and zero-value promo/donation sections.
- Need Help creates protected order issue cases from order detail pages and shows case status in account order detail.
- Delivered-order customer disputes use a seven-calendar-day server-side eligibility check.

Remaining customer work:

- Full in-account support message center.
- Template-backed optional email send flow for support replies.
- Browser/manual QA across mobile and desktop.

## Approved Calm Essentials Account UI

Implemented on 2026-10-08 after approval of the complete seven-tab preview.

- Protected account routes share one AccountLayout/AccountShell, the existing storefront header/footer, cart drawer and cart storage, search composable, and Better Auth state.
- Keep Overview, Orders, Profile, Addresses, Order help, Rewards, Wishlist. Rewards/Wishlist remain under Coming later.
- Mobile/tablet uses collapsible account navigation. The storefront header switches to its existing compact layout below the desktop breakpoint to avoid tablet overflow.
- Overview is bounded to two recent orders with order count/latest status/open case count, profile/address summaries, and useful links. No lifetime spend or invented rewards balances.
- Orders keeps the approved month-grouped master/detail layout, search, status filter, initially eight loaded rows, Load more, selected-order accent, and mobile drill-in/back.
- Orders retains search/selection/expanded months/loaded count when switching account tabs. Refresh retrieves the list and selected detail again. Leaving the account layout destroys this cache.
- Load more is display pagination of the existing full-history response, not server-side pagination.
- Profile/Addresses use Summary & Edit dialogs with explicit Save/Cancel, focus trapping/restoration, Escape/backdrop dismissal when idle, and errors that keep the editor open.
- Personal details, marketing/notification preferences, and one default address use existing APIs. Full replacement payloads preserve unedited fields. Address changes affect future checkout prefilling, not existing order snapshots.
- Email stays read-only account identity. Preferred contact controls and email activity are not reintroduced.
- Order help lists real cases, customer-visible messages, and resolutions through existing ownership-protected endpoints. New cases start from an eligible order; categories/deadlines remain server-owned.
- General messaging, customer case replies, multiple addresses, billing address, reviews, reorder, rewards, referrals, and wishlist remain explicitly future-phase work. No simulated customer balances/favorites/transactions.
- Order details display server-returned totals only; donation impact is not an extra charge. Internal status history remains hidden.
- Header/sidebar sign-out leaves protected account content and destroys the cached order view.

Browser fixture QA passed at 1440, 1280, 1024, 768, and 390 pixel widths. Real-account persistence, Safari sessions, production deployment, and end-to-end checkout still require manual QA; fixtures do not verify those external systems.

### 2026-10-09 Action Visibility Refinement

Account navigation, links, edit buttons, order/month selections, recent-order links, and dialog controls now have restrained gray surfaces/borders even before hover. Green selected/primary states and focus outlines remain. The approved layout, shared storefront cart/auth/search, customer-safe order details, and Save/Cancel flows are unchanged. Internal record inspectors and Stripe links exist only in admin, never in customer account pages.
