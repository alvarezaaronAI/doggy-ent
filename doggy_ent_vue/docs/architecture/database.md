# Database Architecture

## Customer Wishlist (2026-10-25)

WishlistItem stores only userId, productId and the original server-created date. Composite primary key prevents duplicate saves; owner/date index supports the bounded newest-first list. User and Product foreign keys cascade on actual record deletion. No copied product name/price/stock, browser fingerprint, remove-history ledger, reward or marketing-consent record is added.

The existing authenticated account router exposes GET /wishlist, idempotent PUT /wishlist/:productId and owner-scoped idempotent DELETE. Responses contain productId/createdAt only; the client joins current public products and shows generic unavailable entries when absent. Public product statuses alone are eligible for new saves. Serializable count/insert with three attempts enforces 100 per owner, including concurrent saves; duplicate save preserves the original date. Payload/query ownership fields are rejected. Handler responses are private/no-store; inherited auth guards are no-store. Global parser failures occur before this router and contain no wishlist data.

Owner-approved migration 20261024000000_customer_wishlist is applied locally/Railway after fresh full decoded private backups: 26 complete matching checksums, no pending, existing business/pet/account records unchanged and new table initially empty. Real loopback fixtures verified persistence/idempotence/ownership/concurrent cap/user+product cascades and were cleaned; no shared fixtures. Source rollout is separate. [Exact evidence/next steps](../work-checkpoints/2026-10-24-account-wishlist.md).

Last updated: 2026-10-23

## Optional Pet Weight

Migration `20261023010000_optional_pet_weight` adds nullable `Pet.weightGrams` (integer), `weightUnit` (LB/KG preference) and `weightUpdatedAt`. A validated check permits all-null or a complete 100..250000 gram/unit/date tuple. These are technical input bounds, not medical or size-eligibility rules. No prior field, timestamp, row, photo or relation is backfilled/changed. This migration is applied locally and on the approved Railway target after fresh decoded full backups: 25 matching complete histories, none pending; prior Product/Order/User/Pet/PetPhoto/CustomerAccountEvent projections preserved.

One canonical shared unit/conversion module is copied into isolated client/server deployment roots by existing build sync scripts. The strict API accepts only paired grams/unit or omission; timestamps remain server-owned. Create/changed measurement sets the date in the existing Serializable transaction, clearing removes all three, unit-only change preserves measurement time, no-op preserves profile time/history, and old clients omitting weight preserve it. Account events record only field names, never measurements. UI can edit/delete current weight; this is not a historical weighing ledger, inferred size, feeding calculator or reward/fraud signal. [Backup/persistence/constraint evidence and release limits](../work-checkpoints/2026-10-23-pet-weight.md).

## Connected Pet Fields And Private Photos

Additive migration 20261023000000_photo_led_pet_profiles extends existing Pet with nullable canonical breedId, independent isMixed, optional birthdayMonth/day + server birthdaySetAt, server archivedAt and a multi-purpose enum array. Legacy scalar treatPurpose/old values remain; migration backfills the new array without changing prior fields/timestamps. BONDING is an additional supported purpose; legacy EVERYDAY is preserved. New fields omitted by an old update are not cleared. A paired-calendar check includes February 29 without collecting a birth year. API birthdays cannot change/clear after their first save; checks occur inside each Serializable retry.

PetPhoto is a private one-to-one cascading row containing optimized WebP bytes, fixed content type and update time, not a public MediaAsset. Uploads accept only bounded non-animated JPEG/PNG/WebP, verify decoded format/pixels, strip metadata, orient/resize and cap output at 1 MiB. Ten profiles per owner includes archives; photographs are replaced, explicitly removable and cascaded by pet/account removal. No image URL, source EXIF/location, original file or duplicate ownership column is stored. Access requires a fresh owned customer session; reads are private/no-store/nosniff. Current limits are not a global storage/CDN system.

Existing CustomerAccountEvent also records archive/restore/photo-change/removal facts with generic messages, timestamps/tenure and field names only. Photo bytes, breed/date/preference values never enter history. No permanent risk score, reward ledger, provider action or admin raw metadata export. Retention/disposal/privacy handling remain prelaunch decisions. The approved migration is applied locally and on Railway after fresh decoded backups: 24 complete matching migrations, none pending, prior records preserved. Real loopback persistence/ownership/calendar/archive/private-photo HTTP/rollback/concurrency/cascade checks pass; no shared fixtures. [Current checkpoint](../work-checkpoints/2026-10-23-connected-photo-led-pets.md) has exact evidence; the older no-migration/preview statements below describe the earlier history-only slice. Source/UI deployment remains separate.

## Pet Activity Facts (2026-10-23, Local Code)

Pet.createdAt already records when a pet was added; updatedAt records its most recent material profile edit. The existing CustomerAccountEvent table now receives PET_CREATED, PET_UPDATED and PET_DELETED from the Pet repository in the same Serializable transaction as the mutation, with up to three P2034 conflict attempts. A failed audit write fails the mutation; missing/foreign-owned rows and unchanged values create no event. Reordering the protein set is not a material edit and does not refresh updatedAt.

Event createdAt/actor come from the server/session. Versioned metadata contains only petId, original petCreatedAt, petUpdatedAt, profileAgeSeconds at the event and allowlisted changed field names. No nickname, image, breed/birthday/preferences values, credentials, IP or fingerprint snapshot. Pet removal deletes its row while keeping that account's minimal history; User deletion still cascades account events. Full verified account-erasure flows, audit/backup retention and disposal are not implemented by this change.

This enables future account-scoped add/remove counts and elapsed remove-to-add analysis without storing duplicate counters or subjective fraud flags. No historical removal backfill, cross-account identity matching, automated risk decision, incentive or discount is enabled. Existing events before rollout are incomplete; updatedAt alone cannot reconstruct old edits/removals. Admin activity projection still strips metadata; no new customer history endpoint or generic metadata export was added.

No schema/new model/migration is required; the earlier Pet schema migration remains separate from this local implementation. Shared DB was not written or rechecked in this pass. See [current checkpoint](../work-checkpoints/2026-10-23-pet-activity-and-account-theme.md) for tests and rollout limits.

## Optional Pet Profiles

Migration `20261020000000_optional_pet_profiles` adds only Pet, four preference enums, the owner/date index, nonempty nickname/protein-count checks and a cascading User foreign key. There are no changes to products, orders, money, credentials or existing customer rows. Pet has CUID identity, userId, nickname (60 maximum), optional lifeStage/sizeBand/treatPurpose, proteinPreferences (six allowed choices), and timestamps. Public responses exclude userId and auth relations. Ten pets per owner are enforced by serializable service creation with conflict retry, not by a database row-count constraint.

Local and approved Railway application/status/backup evidence lives in the [current checkpoint](../work-checkpoints/2026-10-20-customer-auth-experience.md); historical 22-migration counts below predate this slice. Local real-data fixture tests verify ownership, CRUD, concurrent cap and delete cascade. No remote fixture customers/pets are created. Explicit pet removal and User deletion remove active rows; deactivation, backup expiry and complete account erasure remain separate lifecycle decisions.

## Approved Gallery Integration Checkpoint

Local and approved Railway databases both have 22 completed migrations after `20261014000000_product_galleries`. Older migration counts below describe their dated phases, not the current state. Full private custom-format backups preceded each database operation and decoded successfully; recovery by restore has not been rehearsed.

Product now owns `galleryImages` JSON (ordered `{ image, alt }`, default empty) and `isTestProduct` Boolean (default false). A database check requires an array of at most four additional images. The protected image-only endpoint additionally validates fields, safe references, required descriptions, media existence and updatedAt conflicts. Existing product/variant identity, pricing, inventory, order snapshots and relationships are unchanged.

The eight existing test fixtures were flagged and received 32 additional media records, rather than adding duplicate products. Original record preservation was checked. Separate approved StorefrontContent publication and a fictional campaign use the existing schema; no partner/programme table or review records are introduced. Final exact counts and deployment evidence live in [handoff](../../PROJECT_HANDOFF.md#2026-10-15-approved-design-integration-and-deployment).

## Source Of Truth

Initial prelaunch planning on 2026-10-20 added no model. The subsequent approved Pet slice above is implemented; CustomerPreference/ConsentEvent remain proposals in the [customer-data strategy](../prelaunch/customer-data-strategy.md). Review consent/retention/ownership and approval before implementing further tables.

The Prisma schema at `server/prisma/schema.prisma` is the database source of truth. Runtime database access goes through the Prisma singleton at `server/src/db/prisma.js`.

## Prisma Toolchain Compatibility

The current CLI (`prisma`) and runtime package (`@prisma/client`) are both pinned to exact 6.16.2 in server/package.json and its lockfile. The schema uses prisma-client-js and the existing singleton constructor. Update both packages together only as a reviewed compatibility/major-upgrade change, then regenerate the client and verify server imports/build/tests. Do not use a newer runtime package with an older generator.

On 2026-10-13, updating only @prisma/client to 7.10.0 caused generation to fail on a missing PostgreSQL WASM runtime file and server import to fail on runtime/library.js. Restoring the matching runtime repaired those failures without changing schema or data. A regression test checks manifest/lock/installed/generated versions and the actual singleton import. [Exact repair evidence](../../PROJECT_HANDOFF.md#2026-10-13-partial-prisma-upgrade-compatibility-repair).

Local migration status remains 21 applied/up to date. No migration was applied in this repair; Railway's deployed schema was not re-queried. Its prior approved 2026-10-13 checksum verification is recorded in the handoff. Four high-severity CLI/configuration dependency audit entries remain; version alignment is not security remediation. A full Prisma 7 upgrade must review adapters, configuration, generation/import paths, pooling/TLS and auth/database integration before deployment.

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

## Current Testing Catalog Reconciliation (2026-10-15)

Railway has 22 completed migrations, no pending/failed migration or checksum mismatch. No schema change was needed in the design correction. Product galleries/test protection were applied in the prior approved additive gallery migration. Final counts: Product 15, ProductVariant 30, User 3, Order 4, Promo 1, Campaign 2, MediaAsset 41.

Seven legacy products were soft-archived, not deleted; seven saved order-item references remain. Eight existing test products were reused with four optional photos/two zero-stock variants each. All sixteen variants fail the real checkout resolver. The fictional test campaign uses fixed $2 per eligible order on Chicken/Salmon/Bundle, with zero attributed usage/payout; the original campaign is untouched. Presentation revision 5 has equal draft/published snapshots and hides old promise/help sections. Private full backups before both guarded publication changes decoded successfully (2,706,857 and 2,707,158 bytes); no restore drill occurred. See [archive report](../../assets/brand/test-products/design-reconciliation-report.json) and [checkpoint](../work-checkpoints/2026-10-15-approved-ui-reconciliation.md). Do not replay apply scripts or delete historical media/records merely to remove them from storefront display.

## Payment Receipt Queue And Settings (2026-10-25)

Owner-approved additive `20261026000000_checkout_payment_receipts` reuses
EmailDelivery: `automatic` defaults false; private nullable `renderedEmail` holds
the frozen `{subject, html, text}` until dispatch completes. Existing status and
dedupe fields implement QUEUED/PENDING/SENT/MOCKED/FAILED and permanent uniqueness;
index `(automatic, status, createdAt)` supports bounded claims. No existing order,
item, price, stock, customer, pet, template or delivery was rewritten.

`CheckoutReceiptSettings` has a single known key, mode (DISABLED/DRY_RUN/LIVE checked
in SQL), nullable saved EmailTemplate FK with Restrict deletion, revision, actual
admin updater and timestamps. No seeded row means disabled. Saved active
ORDER_CONFIRMATION eligibility is checked in the settings transaction; suggestions
cannot be assigned. Edits use optimistic compare-and-set. Archiving/changing a
selected template prevents future preparation; frozen queued copy is unchanged.

Delivery intent is nested inside the paid order/stock transaction. Worker claims
QUEUED only, never automatically retries ambiguous PENDING/FAILED and never turns
a test record into a live send. Processed bodies are minimized; uncertain pending
payloads and email audit retention still need business-approved disposal policy.
All API projections allowlist fields and omit the private body. No tracking,
marketing consent change or live provider transaction accompanies this migration.

Local/Railway both verify 27 complete matching migrations, no pending, validated
new constraints and unchanged prior-record projections after fresh full private
decoded backups. Automatic settings remain absent/off. Isolated disposable
Postgres verifies guest/member persistence, concurrent claim, permanent dedupe,
atomic receipt failure rollback, one stock decrement, dry dispatch and cleanup.
See [checkpoint](../work-checkpoints/2026-10-25-checkout-receipt-email.md) for source/
deployment status; database readiness is not mail delivery or payment certification.
