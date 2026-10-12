# Database Architecture

Last updated: 2026-10-11

## Source Of Truth

The Prisma schema at `server/prisma/schema.prisma` is the database source of truth. Runtime database access goes through the Prisma singleton at `server/src/db/prisma.js`.

## Data Source Modes

| Mode | Env Source | Database |
| --- | --- | --- |
| Local server/local DB | `server/.env` | Local PostgreSQL database from `DATABASE_URL` |
| Local server/Railway DB | `server/.env` plus local-only `server/.env.railway.local` overrides | Railway PostgreSQL database from override `DATABASE_URL` |
| Deployed Railway server | Railway dashboard variables | Railway PostgreSQL database |

No real `DATABASE_URL` values should be documented or committed.

## Media Library Follow-Up

`MediaAsset` owns indexed, searchable public-safe metadata, UUID, normalized-byte SHA-256 uniqueness, dimensions/sizes, folder, accessibility description, actor type and timestamps. `MediaAssetData` has a one-to-one cascading foreign key and two PostgreSQL `BYTEA`/Prisma `Bytes` fields for optimized WebP and thumbnail. Metadata lists do not select blobs. Atomic nested creation plus serializable capacity checking limits stored images/thumbnails to 256 MiB; duplicate normalized images reuse one record. No delete/replace API is exposed, protecting historical product/order image snapshots.

Existing product/campaign image strings and storefront JSON save stable `/api/media/<uuid>` references; no commerce column is removed or retyped. Services validate these IDs against the selected database before writes. Migration `20261009020000_media_library` creates two tables/indexes/checks/FK only. Local preflight/deploy/generate/status succeeded: **20 migrations, up to date**. Earlier Railway 18-migration results below are historical; content/media migrations have not been approved/applied/verified there in this phase. No reset/reseed or Railway business write occurred.

Images now persist in DB backups, increasing backup/storage/serving cost. This bounded initial backend is not unlimited object storage; future CDN/storage/usage/cleanup can be added behind stable IDs. See [media-library.md](media-library.md) for constraints, public-asset security and deployment steps.

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

Variant row for a product size/SKU/price/inventory status. `price` is stored in cents in Prisma and returned as cents in the product API variant array. The client product mapper converts it to display currency once; trusted checkout separately reads database cents.

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

Account lifecycle/audit foundation. Records account creation, status changes and deliberate admin provisioning. New authenticated admin status actions use `changedByType = ADMIN` and the real admin user ID; historical ADMIN_ENV entries are retained.

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

- New admin status changes use `changedByType = ADMIN` and `changedBy` is the authenticated admin ID.
- Historical ADMIN_ENV records are not rewritten. Customer projections omit internal status history, notes and actor IDs entirely.
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

Donation campaign with product ID links stored as JSON, status, donation type/value, schedule dates, image, featured flag, description, beneficiary, and generated usage stats. There is no campaign goal or payout ledger field in the current schema.

Public content added on 2026-10-09:

- `story`: optional plain-text story, rendered as escaped paragraphs.
- `beneficiaryUrl`: optional validated HTTPS partner link, without embedded credentials.
- `imageAlt`: optional image description, required when publishing with an image.
- `publicPageEnabled`: Boolean default false. Existing campaigns are not automatically published; this does not disable their existing giving rule.

Existing slugs remain stable after rename. Public queries require page visibility and Active/Paused/Ended status; giving still requires active status and its schedule. Internal revenue/order/attribution information is not exposed by the public mapper.

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

### StorefrontContent

Added 2026-10-09 for homepage visual editing, separate from catalog/commerce records. Singleton `id = home`; JSON `draft`; nullable JSON `published`; integer `revision` default 1; nullable `publishedAt`; `createdAt` and Prisma-managed `updatedAt`. Draft and published snapshots share the schema versioned public-content document. Atomic revision-matched writes prevent stale overwrites; publication saves both snapshots together. Public reads never seed data and only return the published projection.

Additive `20261009010000_storefront_content` creates this table without altering existing product/customer/order schemas. Local-only preflight confirmed loopback DB target and no unfinished migration; local `prisma migrate deploy` applied this pending migration, and `prisma migrate status` reported all 19 migrations applied/schema up to date. Railway was not queried or migrated in this phase. Existing backend startup runs migration deploy; obtain explicit approval and confirm target/backup/pending migrations before deploying that change. No reset/reseed occurred. See [storefront-editor.md](./storefront-editor.md).

## Migration Notes

### 2026-10-10 Manual Email Update

New `EmailTemplate`: cuid ID, internal name, supported event, subject/heading/body/footer plain text, archived flag, optimistic revision and created/updated timestamps; index on event/archive. Delivery/audit rows remain in existing `EmailDelivery`, not mixed into templates or orders. Additive `20261010000000_manual_email_templates/migration.sql` creates only this table/index.

Guarded LOCAL loopback preflight and apply succeeded; final `prisma migrate status` reports **21 migrations/schema up to date**. No Railway query/migration/deployment occurred here; content/media/manual-email migrations require explicit target/backup/preflight/deploy approval. Old 18/19/20 migration counts below describe their historical phases. See [checkout/order email](checkout-and-order-email.md).

Wallet/confirmation editor settings use existing `StorefrontContent` JSON; no new product, order or campaign presentation columns were needed. Existing item/promo/campaign snapshots drive shared cards. Order insertion and conditional inventory decrement now share a Prisma transaction after verified payment. Usage recording remains separate after that transaction; concurrency/failure reconciliation remains a launch risk.

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
- `20260615000000_add_order_shipping_method`: Nullable `Order.shippingMethod` for preserving the selected checkout delivery method.
- `20260615001000_add_order_shipping_rate_fields`: Nullable `Order.shippingCarrier`, `shippingService`, `shippingRateId`, and `shippingRateProvider` fields for Shippo/static shipping rate traceability.
- `20260617000000_add_order_and_internal_issues`: Extends `CustomerSupportRequest`, adds support messages/events, adds internal issue tracking, and relates support requests to orders.
- `20261009000000_campaign_public_page`: Additive Campaign story, partner URL, image description, and public-page visibility columns. No table resets, seed operations, or destructive changes.

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
| Order issue cases | Server support domain and `CustomerSupportRequest` |
| Order issue messages/events | Server support domain and `CustomerSupportMessage`/`CustomerSupportEvent` |
| Internal operational issues | Server support domain and `InternalIssue`/`InternalIssueEvent` |
| Admin customer management | Server customers domain and Better Auth ADMIN/ACTIVE guard; lifecycle tools cannot target ADMIN rows |
| Email readiness payloads | Server emails domain; no real provider unless configured |
| Promo rules and usage | Server promos domain |
| Campaign rules and usage | Server campaigns domain and `OrderCampaignUsage` |
| Admin sessions | Existing User/Account/Session tables, separate Better Auth admin configuration and cookie prefix |

Migration status verified 2026-10-09:

- Normal local env was confirmed as LOCAL with a loopback database and no Railway override; the new campaign migration was applied, and `prisma migrate status` reports up to date.
- The user explicitly asked to apply the update to Railway. A secret-safe preflight loaded the existing ignored Railway DB override, confirmed the target, compared migration checksums, checked for failed migrations/partial columns, and found only the reviewed campaign migration pending.
- `prisma migrate deploy` succeeded; all four columns and the migration record were verified. All eighteen repository migrations now match Railway, with no remaining pending migration, failed migration, or checksum mismatch. Campaign record count was unchanged. No business records were updated, and no provider action occurred.
- This updates schema only, not deployed server/frontend code. Rebuild/redeploy reviewed code normally; do not run reset/seed commands. Future shared-database migrations still require explicit approval and preflight.

## Admin Session Migration And Audit Safety (2026-10-11)

The approved admin migration reuses User, Account, Session and CustomerAccountEvent; no new schema/migration. Local provisioning creates a new ADMIN credential/event only after preflight and refuses CUSTOMER conflicts/overwrites. Local 21 migrations are up to date. Railway schema status/provisioning/deployment were not checked or changed in this audit.

Public product reads now exclude DRAFT/ARCHIVED; protected library preserves admin access. Product variant deletion/replacement is transactional and inactive sizes remain inactive. Order status/history uses compare-and-set, but promo/campaign usage remains outside the order transaction. Full payment recovery/reservation/atomic attribution requires a separately approved database design. Profile and notification preference writes remain separate; unsupported product editor fields still lack persisted schema columns. See [audit](../audits/2026-10-11-production-audit.md).
