# Customer Experience Requirements

This document governs customer account, profile, order, checkout, shipping, and support experiences. Preserve guest checkout and the storefront’s existing brand feel.

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
