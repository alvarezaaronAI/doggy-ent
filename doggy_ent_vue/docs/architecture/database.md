# Database Architecture

Last updated: 2026-06-12

## Source Of Truth

The Prisma schema at `server/prisma/schema.prisma` is the database source of truth. Runtime database access goes through the Prisma singleton at `server/src/db/prisma.js`.

## Data Source Modes

| Mode | Env Source | Database |
| --- | --- | --- |
| Local server/local DB | `server/.env` | Local PostgreSQL database from `DATABASE_URL` |
| Local server/Railway DB | `server/.env` plus local-only `server/.env.railway.local` overrides | Railway PostgreSQL database from override `DATABASE_URL` |
| Deployed Railway server | Railway dashboard variables | Railway PostgreSQL database |

No real `DATABASE_URL` values should be documented or committed.

## Models

### Product

Catalog item with name, slug, descriptions, image, product metadata, status, selling mode, timestamps, and variants. Status and selling mode are Prisma enums. Product rows own many `ProductVariant` rows.

Key relationships:

- `Product.variants` to `ProductVariant[]`

Primary flow participation:

- Storefront product listing and quick view.
- Admin product CRUD.
- Checkout trusted pricing and inventory validation.
- Campaign product matching.

### ProductVariant

Variant row for a product size/SKU/price/inventory status. `price` is stored in cents in Prisma and mapped to currency units in response mappers.

Primary flow participation:

- Product-card selected size.
- Quick-view selected size and price.
- Cart item selected variant.
- Checkout line item validation and inventory decrement.

### Order

Customer/order record with pricing fields, currency, Stripe PaymentIntent ID, and status. The unique Stripe PaymentIntent migration supports idempotent order creation.

Key relationships:

- `Order.items` to `OrderItem[]`
- `Order.statusHistory` to `OrderStatusHistory[]`
- `Order.user` to nullable `User`

Primary flow participation:

- Checkout order creation.
- Order success page.
- Admin orders dashboard/detail.
- Promo/campaign usage ownership by order ID.
- Status history ownership by order ID.
- Customer account order history when `userId` is present.
- Verified-email guest order matching through normalized `customerEmail`.

### User

Better Auth customer/admin account row. Fields include email, email verification state, role, account status, timestamps, and relations to sessions, credential accounts, profile, orders, events, support requests, reviews, loyalty ledger rows, and notification preferences.

Current role/status values:

- `UserRole`: `CUSTOMER`, `ADMIN`
- `AccountStatus`: `ACTIVE`, `DEACTIVATED`

Future roles such as `OWNER`, `STAFF`, `SUPPORT`, and `MARKETING` are intentionally documented but not implemented in the enum yet.

### Session

Better Auth session row. Stores session token, expiry, user agent/IP metadata, and user relation. Session tokens must never be exposed in docs or client responses outside Better Auth internals.

### Account

Better Auth account/credential row. For email/password auth, the credential provider stores password hash data here. Password hashes must never be exposed through API responses.

### Verification

Better Auth verification/reset token row. Used for email verification and password reset readiness. Verification token values must never be exposed in docs or custom admin responses.

### CustomerProfile

Customer-editable profile extension. Stores first/last name, phone, marketing opt-in, future default address JSON, and internal notes readiness.

### CustomerAccountEvent

Account lifecycle/audit foundation. Records account creation, status changes, and future internal notes/audit events. Current admin account status actions use `changedByType = ADMIN_ENV` until Better Auth admin users replace custom admin auth.

### CustomerSupportRequest

Future support-request foundation. Not yet exposed as a live support workflow.

### ProductReview

Future product review foundation tied to a user and order item. Review submission/moderation is not live yet.

### LoyaltyLedger

Future points/rewards/referrals foundation. No live loyalty balance UI or earning rules are implemented yet.

### CustomerNotificationPreference

Notification preference foundation for order updates, tracking, review requests, loyalty, referral, and marketing email categories.

### OrderItem

Snapshot of purchased product data, including product ID/name/image, size, SKU, quantity, unit price, and line total.

Primary flow participation:

- Admin order detail.
- Order success display.
- Historical order accuracy even if product data later changes.

### OrderStatusHistory

Future-proof audit record for admin order status transitions. Each row stores the order ID, previous status, next status, optional note, actor type, actor value, and creation timestamp.

Current actor behavior:

- Admin status changes use `changedByType = ADMIN_ENV`.
- `changedBy` is currently the non-secret label `ADMIN_ENV`.
- Future Better Auth work should replace this with a real admin user ID or email owned by an accounts/users table.

Primary flow participation:

- Admin order detail status history.
- Last status change display.
- Future fulfillment and admin audit trail.

### Promo

Promo code rule and aggregate usage stats. Fields include type, status, discount type/value, minimum subtotal, usage limits, assigned/referral metadata, start/end dates, and aggregate revenue/discount counts.

Key relationships:

- `Promo.usages` to `PromoUsage[]`

Primary flow participation:

- Checkout promo validation.
- Checkout discount calculation.
- Promo usage aggregation.
- Admin promo CRUD/analytics.

Important schema note:

- `Promo` has `createdAt` and `updatedAt`, but does not have `redeemedAt`.
- `PromoUsage` has `redeemedAt`.
- Promo list sorting must use a `Promo` field such as `updatedAt`; usage history sorting may use `PromoUsage.redeemedAt`.

### PromoUsage

Promo redemption record keyed to customer email and order ID. `orderId` is unique, which prevents a normal retry from double-counting promo usage for the same order.

Primary flow participation:

- Promo analytics.
- Usage limit checks.
- Checkout usage recording.

### Campaign

Donation campaign with product ID links stored as JSON, status, donation type/value, goal, schedule dates, and generated usage stats.

Primary flow participation:

- Storefront/checkout campaign preview.
- Checkout campaign usage recording.
- Admin campaign CRUD/status display.

### OrderCampaignUsage

Order-level campaign attribution row. It records which checkout order contributed to which campaign, the donation amount, eligible subtotal, and matched product IDs.

Primary flow participation:

- Admin order donation totals.
- Admin order detail campaign attribution.
- Admin campaign recent attributed orders.
- Campaign usage idempotency through `@@unique([orderId, campaignId])`.

Historical limitation:

- Orders created before this table existed may have aggregate campaign stats but no order-level attribution rows.

## Migration Notes

Migrations are under `server/prisma/migrations/`.

Important migrations:

- `20260515064232_init_products`: Initial product tables.
- `20260515074553_expand_product_model`: Expanded product model.
- `20260516055823_add_orders`: Orders.
- `20260519024742_add_promos`: Promos.
- `20260519060129_promo_redemption_integrity`: Promo usage integrity.
- `20260520192114_add_campaigns`: Campaigns.
- `20260605000000_unique_order_payment_intent`: Unique Stripe PaymentIntent ID for order idempotency.
- `20260606000000_add_order_campaign_usage`: Order-level campaign attribution for donation traceability.
- `20260607000000_add_order_status_history`: Order status transition history for admin fulfillment auditability.
- `20260612000000_better_auth_customer_accounts`: Better Auth user/session/account/verification tables, customer profile/support/review/loyalty/notification foundations, and nullable `Order.userId`.

Deployment rule:

- Run `prisma migrate deploy` in production deployment contexts. Do not run destructive seed/reset operations against production.

## Data Ownership

| Data | Owner |
| --- | --- |
| Product catalog and variants | Admin product UI and server products domain |
| Cart state | Browser local storage through `useCart` until checkout |
| Checkout totals | Server checkout pricing utility and service |
| Payment status | Stripe, verified by server before order creation |
| Order records | Server checkout/orders domains |
| Order status history | Server orders domain and `OrderStatusHistory` |
| Customer account auth/session | Better Auth tables through `server/src/domains/auth/services/customerAuth.service.js` |
| Customer account profile/orders | Server account domain and nullable `Order.userId` |
| Admin customer management | Server customers domain and existing custom admin auth |
| Email readiness payloads | Server emails domain; no real provider unless configured |
| Promo rules and usage | Server promos domain |
| Campaign rules and usage | Server campaigns domain and `OrderCampaignUsage` |
| Admin sessions | Server auth domain, custom temporary implementation |

Railway deployment note:

- The Better Auth customer account migration must be applied on Railway with `cd server && npx prisma migrate deploy` after confirming the target database is correct.
- Do not run destructive reset commands on Railway.
