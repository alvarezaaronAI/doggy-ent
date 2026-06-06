# Doggy Ent Project Handoff

Generated: 2026-06-05
Workspace: `/Users/nazxylix/Developer/vue-projects/doggy_ent/doggy_ent_vue`
Current branch observed: `dev-main`

This handoff is evidence-based from the repository. Anything not verified from code is called out as uncertainty.

## 1. Business Overview

Doggy Ent is a Vue storefront and Express/Prisma API for selling small-batch dog treats under the storefront brand text "Chase & Evie Co." The product catalog includes jerky, training, bundle, and seasonal products. Customers can browse products, open quick views, add variants to a cart, enter checkout details, apply promo codes, pay through Stripe, and land on an order success page.

The admin area supports:

- Product catalog management.
- Promo code management, testing, and analytics.
- Donation campaign management for product-linked shelter campaigns.
- Order dashboard and order detail viewing.

The business logic currently centers on:

- Product statuses and inventory-aware selling modes.
- Two default product variants: `6 oz` and `18 oz`.
- Stripe card payment collection and server-side payment intent validation.
- Promo validation and usage tracking.
- Campaign donation preview and usage stats.
- Order creation with inventory decrement and rollback on create failure.

## 2. Client Architecture

Client root: `client/src/`

Framework and tooling:

- Vue 3 with `<script setup>`.
- Vue Router.
- Vite.
- Tailwind CSS through `@tailwindcss/vite`.
- Stripe.js through `@stripe/stripe-js`.

Path aliases are defined in `client/vite.config.js` and mirrored in `client/jsconfig.json`:

- `@app`
- `@shared`
- `@domains`
- `@storefront`
- `@products`
- `@cart`
- `@checkout`
- `@payments`
- `@admin`
- `@promos`
- `@campaigns`

The router lives at `client/src/app/router/index.js`.

Route inventory:

- `/`: storefront home, `HomeView.vue`.
- `/checkout`: checkout, `CheckoutView.vue`.
- `/order-success/:orderId`: success page, `OrderSuccessView.vue`.
- `/admin/login`: admin login.
- `/admin`: admin dashboard, protected by `router.beforeEach`.
- `/admin/products`: admin products, protected.
- `/admin/orders`: admin orders, protected.
- `/admin/orders/:orderId`: admin order detail, protected.
- `/admin/promos`: admin promos, protected.
- `/admin/campaigns`: admin campaigns, protected.

Admin route protection is client-side through `/api/auth/me` and server-side only where the API route applies `requireAdminAuth`. Important risk: the current server admin orders API does not apply `requireAdminAuth` in `server/src/domains/orders/routes/orders.routes.js`.

## 3. Server Architecture

Server root: `server/src/`

Framework and tooling:

- Express 5.
- Prisma Client with PostgreSQL.
- Stripe Node SDK.
- Cookie parser.
- CORS.
- `express-rate-limit`.
- `bcryptjs` for admin password hash verification.

Server entry:

- `server/src/server.js` loads `server/.env`, imports `app.js`, and listens on `process.env.PORT || 3000`.
- `server/src/app.js` configures CORS, JSON parsing, cookies, trust proxy, API mounts, and `errorMiddleware`.

API mounts in `server/src/app.js`:

- `/api/health`
- `/api/products`
- `/api/checkout`
- `/api/promos`
- `/api/admin/promos`
- `/api/admin/campaigns`
- `/api/campaigns`
- `/api/admin/orders`
- `/api/auth`

Server domain pattern after cleanup:

- `routes/`: Express route definitions.
- `controllers/`: request/response handlers where present.
- `services/`: business orchestration.
- `repositories/`: Prisma database access.
- `mappers/`: response or payload shaping.
- `validators/`: validation helpers.
- `constants/`: status and option values.
- `utils/`: pure domain helpers.

Shared server code:

- `server/src/shared/utils/money.js`: `normalizeCurrencyAmount`.
- `server/src/shared/utils/string.js`: slug, optional string, nullable number, email normalization.
- `server/src/shared/services/tax.service.js`: local tax estimate and future Stripe Tax hook.

## 4. Database Overview

Database provider: PostgreSQL through Prisma.

Schema file: `server/prisma/schema.prisma`

Prisma client:

- Runtime client: `@prisma/client`.
- Server Prisma singleton: `server/src/db/prisma.js`.
- Generated client output exists under `server/src/generated/prisma/`, but the schema generator currently uses default Prisma Client generation to `node_modules/@prisma/client`.

Models:

- `Product`
  - Catalog item.
  - Unique `slug`.
  - Product metadata fields: protein, cut, category, image, ingredients, texture, bestFor, freshness, storageFeeding, tags.
  - `status` enum: `DRAFT`, `ACTIVE`, `OUT_OF_STOCK`, `COMING_SOON`, `ARCHIVED`.
  - `sellingMode` enum: `MADE_TO_ORDER`, `INVENTORY_LIMITED`, `PREORDER`.
  - Relation: many `ProductVariant`.

- `ProductVariant`
  - Product size/price/inventory/SKU.
  - `price` is stored as integer cents.
  - `sku` is unique.
  - Cascade delete when product is deleted.

- `Order`
  - Customer, address, pricing, currency, Stripe payment intent ID, status.
  - `status` enum: `PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`.
  - Relation: many `OrderItem`.

- `OrderItem`
  - Snapshot of purchased product data.
  - Stores product name, image, size, SKU, quantity, unit price, and line total.

- `Promo`
  - Promo code and rules.
  - Unique `code`.
  - `type`: `GLOBAL`, `UNIQUE`, `REFERRAL`.
  - `status`: `DRAFT`, `ACTIVE`, `EXPIRED`, `DISABLED`, `ARCHIVED`.
  - `discountType`: `FIXED`, `PERCENT`.
  - Tracks usage count, generated revenue, and discount given.

- `PromoUsage`
  - Promo redemption record.
  - Unique `orderId`.
  - Tracks customer email, discount amount, subtotal amount, and `redeemedAt`.
  - Risk: `server/src/domains/promos/repositories/promos.repository.js` orders usage history by `createdAt`, but the Prisma model has `redeemedAt`, not `createdAt`.

- `Campaign`
  - Donation campaign linked to product IDs stored as JSON.
  - `status`: `DRAFT`, `ACTIVE`, `PAUSED`, `ENDED`, `ARCHIVED`.
  - `donationType`: `FIXED`, `PERCENT`.
  - Tracks generated donation, generated revenue, and order count.

Migrations are present under `server/prisma/migrations/`.

## 5. Stripe and Payment Flow

Client files:

- `client/src/domains/payments/services/stripe.js`
  - Loads Stripe using `VITE_STRIPE_PUBLISHABLE_KEY`.
- `client/src/domains/payments/services/payment.service.js`
  - Calls `POST /api/checkout/create-payment-intent`.
- `client/src/domains/payments/components/StripeElementsForm.vue`
  - Mounts Stripe card element.
  - Creates a PaymentIntent.
  - Calls `stripe.confirmCardPayment(clientSecret, ...)`.
  - Exposes `submitPayment()`.
- `client/src/domains/payments/components/StripeCheckoutForm.vue`
  - Currently appears to be a stub component with an empty `<div>`.

Server files:

- `server/src/domains/payments/routes/payment.routes.js`
- `server/src/domains/payments/controllers/payment.controller.js`
- `server/src/domains/payments/services/stripe.payment.js`

Flow:

1. Checkout form validates local UI requirements.
2. `StripeElementsForm.vue` calls `createPaymentIntent({ items, amount })`.
3. Server creates Stripe PaymentIntent with the submitted amount.
4. Client confirms card payment with Stripe.
5. Client calls `POST /api/checkout` with `stripePaymentIntentId`.
6. Server recomputes checkout preview totals.
7. Server checks `stripePaymentIntentAlreadyUsed`.
8. Server retrieves Stripe PaymentIntent and verifies:
   - status is `succeeded`
   - amount received equals trusted server total converted to cents
   - currency matches expected currency
9. Server creates order and decrements inventory.

Important payment risk:

- The PaymentIntent is created from the client-submitted amount before final server validation. If the client amount differs from server trusted pricing, the payment can succeed and then checkout can reject order creation with "Stripe payment amount mismatch detected." This needs a launch decision, likely creating PaymentIntents from server trusted preview totals instead of client totals, or using a server-owned checkout session/payment-intent flow.

## 6. Admin System Overview

Admin UI:

- `client/src/domains/admin/views/AdminLoginView.vue`
- `client/src/domains/admin/views/AdminDashboardView.vue`
- `client/src/domains/admin/views/AdminProductsView.vue`
- `client/src/domains/admin/views/AdminPromosView.vue`
- `client/src/domains/admin/views/AdminCampaignsView.vue`
- `client/src/domains/admin/views/AdminOrdersView.vue`
- `client/src/domains/admin/views/AdminOrderDetailView.vue`

Admin auth server:

- `server/src/domains/auth/routes/auth.routes.js`
- `server/src/domains/auth/services/auth.service.js`
- `server/src/app/middleware/auth/requireAdminAuth.js`

Auth behavior:

- Login endpoint compares submitted email/password to `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`.
- Password hash is checked with `bcrypt.compare`.
- Session ID is generated with `crypto.randomBytes(32)`.
- Session is stored in an in-memory `Map`.
- Cookie name: `doggy_admin_session`.
- Session TTL: 8 hours.
- Cookie is `httpOnly`; `secure` and `sameSite: strict` in production; `sameSite: lax` in development.

Admin auth uncertainty/risk:

- Sessions are not persisted in the database or Redis. They reset on server restart and will not work across multiple server instances.
- The UI protects admin routes, but API-level protection is inconsistent. Products, promos, and campaigns use `requireAdminAuth`; orders currently do not.

## 7. Completed Refactors

### Admin Cleanup

Recent committed evidence includes:

- Commit `4e5f648 Complete admin orders refactor`
- Commit `646a2b0 fixed admin, broken down to each component`
- Commit `d1432d4 refactoring, lego building each component`

Admin Products:

- `AdminProductsView.vue` is now an orchestration view.
- State/business logic moved into `client/src/domains/admin/composables/useAdminProducts.js`.
- API calls moved into `client/src/domains/admin/api/adminProducts.api.js`.
- Constants moved into `client/src/domains/admin/constants/adminProducts.constants.js`.
- Payload mapping moved into `client/src/domains/admin/mappers/adminProductForm.mapper.js`.
- Form validation moved into `client/src/domains/admin/validators/adminProductForm.validator.js`.
- Reusable UI moved into:
  - `AdminProductFormPanel.vue`
  - `AdminProductGuaranteedAnalysisFields.vue`
  - `AdminProductVariantEditor.vue`
  - `AdminProductStatusBadge.vue`
  - `AdminProductVariantCell.vue`
  - `AdminProductsTable.vue`

Admin Promos:

- `AdminPromosView.vue` is now an orchestration view.
- State/business logic moved into `client/src/domains/admin/composables/useAdminPromos.js`.
- Generic promo CRUD state remains in `client/src/domains/promos/composables/usePromos.js`.
- Promo API calls live in `client/src/domains/promos/api/promos.api.js`.
- Promo constants live in `client/src/domains/promos/constants/promo.constants.js` and admin grouping defaults live in `client/src/domains/admin/constants/adminPromos.constants.js`.
- Admin promo payload mapping lives in `client/src/domains/admin/mappers/adminPromoForm.mapper.js`.
- Reusable UI includes:
  - `AdminPromosHeader.vue`
  - `AdminPromosStats.vue`
  - `AdminPromosLibrary.vue`
  - `AdminPromoFormExtraFields.vue`
  - `PromoForm.vue`
  - `PromoCodeTester.vue`
  - `PromoAnalyticsModal.vue`

Admin Campaigns:

- `AdminCampaignsView.vue` is now an orchestration view.
- State/business logic moved into `client/src/domains/admin/composables/useAdminCampaigns.js`.
- API wrapper lives in `client/src/domains/admin/api/adminCampaigns.api.js`, delegating campaign CRUD to `client/src/domains/campaigns/api/campaigns.api.js`.
- Constants live in `client/src/domains/admin/constants/adminCampaigns.constants.js`.
- Payload mapping lives in `client/src/domains/admin/mappers/adminCampaignForm.mapper.js`.
- Reusable UI includes:
  - `AdminCampaignForm.vue`
  - `AdminCampaignScheduleFields.vue`
  - `AdminCampaignStatusBadge.vue`
  - `AdminCampaignsHeader.vue`
  - `AdminCampaignsStats.vue`
  - `AdminCampaignsLibrary.vue`
  - `AdminCampaignsTable.vue`

Admin Orders:

- `AdminOrdersView.vue` is now an orchestration view.
- State/business logic moved into `client/src/domains/admin/composables/useAdminOrders.js`.
- API calls moved into `client/src/domains/admin/api/adminOrders.api.js`.
- Constants and grouping rules moved into `client/src/domains/admin/constants/adminOrders.constants.js`.
- Formatting and timeline utility rules live in `client/src/domains/admin/utils/adminOrders.utils.js`.
- Reusable UI includes:
  - `AdminOrdersHeader.vue`
  - `AdminOrdersStats.vue`
  - `AdminOrdersFilters.vue`
  - `AdminOrdersQuickNav.vue`
  - `AdminOrdersGroup.vue`
  - `AdminOrderCard.vue`
  - `AdminOrderTimeline.vue`

Known admin cleanup leftovers:

- `client/src/domains/admin/components/AdminProductFormPanel.vue` is still large at 356 lines.
- `client/src/domains/admin/components/AdminHeader.vue` is an empty file.
- `AdminOrderDetailView.vue` still contains inline API calls and attempts `PATCH /api/admin/orders/:orderId/status`, but the server currently exposes only `GET /`, `GET /stats`, and `GET /:orderId` under admin orders.
- `client/src/domains/admin/api/adminOrders.api.js` only fetches list and stats; no fetch-by-id helper or status update helper exists.

### Server Structure Cleanup

Recent commit: `a7251ff Refactor server domain structure and shared helpers`

Completed:

- Added shared utilities:
  - `server/src/shared/utils/money.js`
  - `server/src/shared/utils/string.js`
- Wired generic JSON error middleware:
  - `server/src/app/middleware/error.middleware.js`
  - `server/src/app.js`
- Removed empty placeholder files and `.DS_Store` files from `server/src`.
- Consolidated old admin route implementations into compatibility re-exports:
  - `server/src/domains/admin/routes/promos.routes.js`
  - `server/src/domains/admin/routes/campaigns.routes.js`
  - `server/src/domains/admin/routes/orders.routes.js`
  - `server/src/domains/admin/services/campaigns.service.js`
  - `server/src/domains/admin/services/promos.service.js`
- Renamed promos repository folder from singular `repository` to plural `repositories`.
- Removed stale Fastify-style promo controller.

Products:

- Added server product constants, mappers, utils, validators.
- Product service now orchestrates Prisma and uses mapper helpers for mutation data and display price.
- Product controller now delegates payload validation to `products.validator.js`.

Checkout:

- Extracted checkout pricing utilities.
- Extracted checkout response mapper.
- Extracted checkout validators.
- Checkout service now coordinates promos, campaigns, tax, Stripe validation, and order creation.

Promos:

- Added promo constants, mappers, validators, repositories.
- Promo analytics mapping and mutation payload shaping are centralized.
- Promo lifecycle resolution activates scheduled promos and expires ended promos on promo reads/validation.

Campaigns:

- Added campaign constants, mappers, repositories, validators.
- Campaign service now orchestrates repository calls and mapper/utils.
- Campaign controller was converted to Express-style handlers.

Orders:

- Orders service now uses shared money normalization.
- Order mapper remains the source of response normalization for detailed order reads.

## 8. Data Ownership and Source-of-Truth Map

Product statuses:

- Database enum: `server/prisma/schema.prisma`, `ProductStatus`.
- Server constants: `server/src/domains/products/constants/products.constants.js`.
- Client admin constants: `client/src/domains/admin/constants/adminProducts.constants.js`.
- Client API normalization: `client/src/domains/products/api/products.api.js` converts Prisma enum values to lowercase hyphen values.

Selling modes:

- Database enum: `server/prisma/schema.prisma`, `SellingMode`.
- Client shared constants and behavior: `client/src/shared/constants/sellingMode.js`.
- Admin product options: `client/src/domains/admin/constants/adminProducts.constants.js`.
- Server mutation enum conversion: `server/src/domains/products/utils/products.utils.js`.

Variant sizes:

- Server constants: `server/src/domains/products/constants/products.constants.js`.
- Client admin constants: `client/src/domains/admin/constants/adminProducts.constants.js`.
- Product variant UI assumptions: `useProductVariants.js`, `ProductQuickView.vue`, `ProductSpotlightSection.vue`.

Price/currency formatting:

- Client display: `client/src/shared/utils/currency.js`.
- Server money rounding: `server/src/shared/utils/money.js`.
- Product prices in DB: integer cents in `ProductVariant.price`.
- Order/promo/campaign monetary totals in DB: floats.

Promo statuses and discount rules:

- Database enums: `PromoStatus`, `DiscountType`, `PromoType`.
- Server constants: `server/src/domains/promos/constants/promos.constants.js`.
- Server validation and discount calculation: `server/src/domains/promos/services/promos.service.js`.
- Client promo constants and client-side rules: `client/src/domains/promos/constants/promo.constants.js`, `client/src/domains/promos/utils/promo.rules.js`.

Campaign statuses and donation rules:

- Database enums: `CampaignStatus`, `CampaignDonationType`.
- Server constants and donation rules: `server/src/domains/campaigns/constants/campaigns.constants.js`, `server/src/domains/campaigns/utils/campaigns.utils.js`.
- Client admin constants: `client/src/domains/admin/constants/adminCampaigns.constants.js`.

Order statuses and timeline rules:

- Database enum: `OrderStatus`.
- Client admin constants/timeline: `client/src/domains/admin/constants/adminOrders.constants.js`.
- Client timeline utility styling: `client/src/domains/admin/utils/adminOrders.utils.js`.
- Server creates orders with status `PENDING` in `server/src/domains/orders/services/orders.service.js`.

Checkout pricing rules:

- Server authoritative pricing: `server/src/domains/checkout/utils/checkoutPricing.js`, `checkout.service.js`, and `shared/services/tax.service.js`.
- Client fallback/display calculation: `client/src/domains/checkout/utils/checkout.utils.js` and constants inside `CheckoutView.vue`.
- Risk: client fallback tax rate is `0.075`, while server tax service uses state-specific rates with default `0.08`.

Tax/shipping calculations:

- Shipping options live in `client/src/domains/checkout/views/CheckoutView.vue`.
- Server trusts submitted shipping price as part of `calculateShipping(shipping)`.
- Tax source is `server/src/shared/services/tax.service.js`; local estimates are hardcoded by state.

Stripe payment intent handling:

- Client publishable key: `client/src/domains/payments/services/stripe.js`.
- Payment intent creation call: `client/src/domains/payments/services/payment.service.js`.
- Server creation/retrieval/validation: `server/src/domains/payments/services/stripe.payment.js`.

Validation rules:

- Client admin product form: `client/src/domains/admin/validators/adminProductForm.validator.js`.
- Client promo form: `client/src/domains/promos/utils/promo.rules.js`.
- Server product payload: `server/src/domains/products/validators/products.validator.js`.
- Server promo type rules: `server/src/domains/promos/validators/promos.validator.js`.
- Server campaign name: `server/src/domains/campaigns/validators/campaigns.validator.js`.
- Server checkout required fields/payment preview: `server/src/domains/checkout/validators/checkout.validator.js`.

## 9. End-to-End Flow Maps

### Storefront Product Browsing

1. `HomeView.vue` calls `useProducts().loadProducts()` on mount.
2. `useProducts.js` calls `fetchProducts()` from `products.api.js`.
3. Client calls `GET /api/products`.
4. `server/src/domains/products/routes/products.routes.js` routes to `getAllProducts`.
5. `products.controller.js` calls `fetchAllProducts`.
6. `products.service.js` reads Prisma `Product` with variants.
7. `products.mapper.js` adds display `price` from first variant cents.
8. Client normalizes product status and selling mode to lowercase/hyphen values.
9. `HomeView.vue` filters products into storefront and coming-soon groups.

### Product Quick View

1. Product card emits `quick-view`.
2. `HomeView.vue` sets `selectedProduct` and opens `ProductQuickView.vue`.
3. `ProductQuickView.vue` uses `useProductVariants.js` and `shared/constants/sellingMode.js`.
4. User selects size and quantity.
5. `addProductToCart()` emits normalized product/variant/cart payload.

### Add to Cart

1. Product card, product spotlight, or quick view emits `add-to-cart`.
2. `HomeView.vue` calls `useCart().addToCart`.
3. `useCart.js` checks selected variant, selling mode, inventory availability, and quantity limits.
4. Cart is stored in `localStorage` under `doggy-ent-cart`.
5. `CartDrawer.vue` displays cart items and emits increase/decrease/remove actions back to `useCart`.

### Cart Drawer Updates

1. `CartDrawer.vue` receives cart state from `HomeView.vue`.
2. `CartItemCard.vue` emits quantity/remove actions.
3. `useCart.js` mutates cart and persists updates to `localStorage`.
4. `subtotal` and `itemCount` are computed in `useCart.js`.

### Checkout Preview

1. `CheckoutView.vue` loads cart from `localStorage`.
2. `useCheckoutPreview.js` schedules debounced previews when customer/cart/shipping/promo changes.
3. Client calls `POST /api/checkout/preview` through `checkout.api.js`.
4. Server `checkout.controller.js` calls `previewCheckout`.
5. `checkout.service.js` calculates subtotal and shipping, validates promo if present, previews campaign donations, calculates tax, and returns `pricing`, `promo`, and `campaigns`.
6. Checkout UI uses trusted server pricing when `checkoutPreviewResult.pricing` exists.

### Promo Validation

1. Checkout promo box calls `useCheckoutPromos().applyPromoCode()`.
2. Client calls `POST /api/promos/validate`.
3. `promos.routes.js` applies a rate limiter and calls `validatePromoCode`.
4. Promo service resolves lifecycle statuses, finds promo, checks active window/status/usage/customer/minimum subtotal, calculates discount, and returns valid/invalid result.

### Stripe and Payment Intent Flow

1. `CheckoutPaymentSection.vue` hosts `StripeElementsForm.vue`.
2. Stripe Elements form creates a payment intent with `POST /api/checkout/create-payment-intent`.
3. Server creates a Stripe PaymentIntent using `STRIPE_SECRET_KEY`.
4. Client confirms card payment.
5. Checkout composable sends completed `stripePaymentIntentId` to `POST /api/checkout`.
6. Server revalidates Stripe amount/currency/status before order creation.

### Order Creation

1. `POST /api/checkout` calls `createCheckout`.
2. Server recomputes preview.
3. Server validates required checkout fields and payment intent.
4. Server rejects reused Stripe payment intents.
5. Server calls `createNewOrder`.
6. Orders service normalizes line items and prices.
7. Products service decrements inventory by SKU.
8. Orders repository creates `Order` and nested `OrderItem` records.
9. If order create fails after decrement, orders service attempts inventory rollback.
10. If a promo was applied, checkout records promo usage after order creation.

### Order Success Page

1. Checkout success handler clears cart and promo state.
2. It navigates to `/order-success/:orderId`.
3. `OrderSuccessView.vue` displays the route param only.
4. Uncertainty: no code fetches full order details on the public success page.

### Admin Product Create/Edit/Delete

1. `AdminProductsView.vue` uses `useAdminProducts`.
2. Form state maps through `adminProductForm.mapper.js`.
3. Validation runs in `adminProductForm.validator.js`.
4. API calls go through `adminProducts.api.js` to `/api/products`.
5. Server product routes protect create/update/delete with `requireAdminAuth`.
6. Server validates payload, normalizes product, converts status/selling mode to Prisma enum style, writes product and variants.

### Admin Promo Create/Edit/Test/Analytics

1. `AdminPromosView.vue` uses `useAdminPromos`.
2. Promo form payload maps through `adminPromoForm.mapper.js` and promo rules normalize unique/referral/global constraints.
3. Create/update/delete/list/analytics call `client/src/domains/promos/api/promos.api.js`.
4. Server routes under `/api/admin/promos` require admin auth for CRUD and analytics.
5. Test promo calls public `/api/promos/validate`.
6. Analytics reads promo usage history and aggregate summary.
7. Risk: promo analytics repository currently orders by `createdAt` on `PromoUsage`, but schema field is `redeemedAt`.

### Admin Campaign Create/Edit/Status Display

1. `AdminCampaignsView.vue` uses `useAdminCampaigns`.
2. Campaign payload maps through `adminCampaignForm.mapper.js`.
3. Client calls `/api/admin/campaigns`.
4. Server campaigns routes require admin auth for list/get/create/update/delete.
5. Service normalizes input, generates slug, checks duplicate slug, and writes through repository.
6. Campaign status display uses `AdminCampaignStatusBadge.vue` and `adminCampaigns.utils.js`.

### Admin Order Dashboard and Order Detail

1. `AdminOrdersView.vue` uses `useAdminOrders`.
2. Client calls:
   - `GET /api/admin/orders`
   - `GET /api/admin/orders/stats`
3. Server orders controller reads orders/stats from repository.
4. Order cards link to `/admin/orders/:orderId`.
5. `AdminOrderDetailView.vue` fetches `GET /api/admin/orders/:orderId`.
6. Risk: detail view attempts `PATCH /api/admin/orders/:orderId/status`, but no server route exists for this patch endpoint.

## 10. API Endpoint Inventory

### Health

- Method/path: `GET /api/health`
- Handler: inline in `server/src/app.js`
- Response: `{ status: 'OK', message: 'Server is running' }`

### Products

- `GET /api/products`
  - Controller: `products.controller.js#getAllProducts`
  - Service: `products.service.js#fetchAllProducts`
  - DB: Prisma `Product.findMany({ include: { variants: true } })`
  - Response: array of products with variants and display `price`.
  - Client callers: `products.api.js`, `adminProducts.api.js`, `adminCampaigns.api.js`.

- `GET /api/products/:slug`
  - Controller: `getProductBySlug`
  - Service: `fetchProductBySlug`
  - DB: Prisma `Product.findUnique({ slug })`
  - Response: product object or 404 `{ message: 'Product not found.' }`
  - Client caller found: `products.api.js#fetchProductBySlug`; no route for product detail was found in router.

- `POST /api/products`
  - Auth: `requireAdminAuth`
  - Payload: product admin payload with name, shortDescription, category, status, image, variants.
  - Validator: `products.validator.js`
  - Response: created product.
  - Errors: 400 missing fields/variant prices; generic middleware for thrown errors.
  - Client caller: `adminProducts.api.js#createProduct`.

- `PUT /api/products/:id`
  - Auth: `requireAdminAuth`
  - Payload: same product payload.
  - Behavior: deletes existing variants and recreates variants.
  - Response: updated product or 404.
  - Client caller: `adminProducts.api.js#updateProduct`.

- `DELETE /api/products/:id`
  - Auth: `requireAdminAuth`
  - Behavior: deletes product; variants cascade.
  - Response: `{ message, deletedProduct }` or 404.
  - Client caller: `adminProducts.api.js#deleteProduct`.

### Checkout and Payments

- `POST /api/checkout/preview`
  - Controller: `checkout.controller.js#previewCheckoutController`
  - Service: `checkout.service.js#previewCheckout`
  - Payload: `{ cartItems, promoCode, customerEmail, customer, shipping }`
  - Response: `{ success: true, result: { pricing, promo, campaigns } }`
  - Errors: `{ success: false, message }`
  - Client caller: `checkout.api.js#submitCheckoutPreview`.

- `POST /api/checkout`
  - Controller: `createCheckoutController`
  - Service: `checkout.service.js#createCheckout`
  - Payload: `{ cartItems, promoCode, customerEmail, customer, shipping, stripePaymentIntentId }`
  - Response: `{ success: true, result: { pricing, promo, campaigns, order } }`
  - Errors: checkout validation, reused payment intent, Stripe mismatch, invalid promo, order/inventory errors.
  - Client caller: `checkout.api.js#submitCheckout`.

- `POST /api/checkout/create-payment-intent`
  - Controller: `payment.controller.js#createPaymentIntent`
  - Service: `stripe.payment.js#createStripePaymentIntent`
  - Payload: `{ items, amount }`
  - Response: `{ success: true, clientSecret, paymentIntentId }`
  - Errors: `{ success: false, message: 'Failed to create payment intent.' }`
  - Client caller: `payment.service.js#createPaymentIntent`.

### Promos

Mounted at both `/api/promos` and `/api/admin/promos`.

- `GET /api/admin/promos`
  - Auth: `requireAdminAuth`
  - Service: `getAllPromos`
  - DB: `Promo.findMany` excluding archived.
  - Response: array of promos.
  - Client caller: `promos.api.js#fetchPromos`.

- `GET /api/admin/promos/:promoId/analytics`
  - Auth: `requireAdminAuth`
  - Service: `getPromoAnalytics`
  - DB: promo usage history and aggregate summary.
  - Response: `{ promo, summary, usages }`
  - Client caller: `promos.api.js#fetchPromoAnalytics`.

- `GET /api/admin/promos/:promoId`
  - Auth: `requireAdminAuth`
  - Response: promo or 404.
  - Client caller: no direct client caller observed.

- `POST /api/admin/promos`
  - Auth: `requireAdminAuth`
  - Payload: promo fields: code, name, type, status, discountType, discountValue, minimumSubtotal, usage limits, assignment/referral fields, startsAt, endsAt.
  - Response: created promo.
  - Errors: duplicate promo 409; unique/referral validation 400.
  - Client caller: `promos.api.js#createPromo`.

- `PUT /api/admin/promos/:promoId`
  - Auth: `requireAdminAuth`
  - Response: updated promo.
  - Client caller: `promos.api.js#updatePromo`.

- `DELETE /api/admin/promos/:promoId`
  - Auth: `requireAdminAuth`
  - Behavior: soft archives promo.
  - Response: updated promo.
  - Client caller: `promos.api.js#deletePromo`.

- `POST /api/promos/validate`
  - Auth: public.
  - Rate limit: 30 per 15 minutes.
  - Payload: `{ code, customerEmail, cart: { items, subtotal } }`
  - Response valid: `{ valid: true, code, discountAmount, referralOwnerName, assignedCustomerEmail, message }`
  - Response invalid: route returns HTTP 400 with `{ valid: false, message, discountAmount: 0 }`
  - Client callers: `useCheckoutPromos.js`, `useAdminPromos.js` promo tester.

### Campaigns

Mounted at both `/api/campaigns` and `/api/admin/campaigns`.

- `GET /api/admin/campaigns`
  - Auth: `requireAdminAuth`
  - Response: `{ campaigns }`
  - Client caller: `campaigns.api.js#getCampaigns`.

- `POST /api/campaigns/preview`
  - Auth: public.
  - Payload: `{ cartItems }`
  - Response: `{ campaigns: preview[] }`
  - Client callers: `campaigns.api.js#previewCampaigns`, checkout preview flow.

- `GET /api/admin/campaigns/:campaignId`
  - Auth: `requireAdminAuth`
  - Response: `{ campaign }` or 404.
  - Client caller: no direct client caller observed.

- `POST /api/admin/campaigns`
  - Auth: `requireAdminAuth`
  - Payload: name, description, status, donationTarget, donationType, donationValue, productIds, startsAt, endsAt.
  - Response: `{ campaign }`
  - Client caller: `campaigns.api.js#createCampaign`.

- `PUT /api/admin/campaigns/:campaignId`
  - Auth: `requireAdminAuth`
  - Response: `{ campaign }`
  - Client caller: `campaigns.api.js#updateCampaign`.

- `DELETE /api/admin/campaigns/:campaignId`
  - Auth: `requireAdminAuth`
  - Response: 204 with empty body.
  - Client caller: `campaigns.api.js#deleteCampaign`.

- `POST /api/campaigns/record-usage`
  - Auth: public.
  - Payload: `{ campaigns: [{ campaignId, matchedSubtotal, ... }] }`
  - Response: `{ success: true, updatedCampaigns }`
  - Client caller: `CheckoutView.vue` success handler through `campaigns.api.js#recordCampaignUsage`.
  - Risk: this is client-triggered after order success and is not part of the checkout transaction.

### Orders

- `GET /api/admin/orders`
  - Auth: currently none in `orders.routes.js`.
  - Controller: `orders.controller.js#getAdminOrders`
  - Response: array of orders.
  - Client caller: `adminOrders.api.js#fetchAdminOrders`.

- `GET /api/admin/orders/stats`
  - Auth: currently none.
  - Controller: `getAdminOrderStats`
  - Response: `{ totalOrders, pendingOrders, shippedOrders, deliveredOrders, totalRevenue }`
  - Client caller: `adminOrders.api.js#fetchAdminOrderStats`.
  - Mismatch: client default stats expects `paidOrders`, `fulfilledOrders`, `totalDonationGenerated`, but server returns `shippedOrders`, `deliveredOrders`, and no donation total.

- `GET /api/admin/orders/:orderId`
  - Auth: currently none.
  - Controller: `getAdminOrderById`
  - Response: mapped order with items or 404.
  - Client caller: `AdminOrderDetailView.vue`.

Missing but client attempts:

- `PATCH /api/admin/orders/:orderId/status`
  - Client attempts in `AdminOrderDetailView.vue#updateStatus`.
  - No server route found.

### Auth

- `POST /api/auth/login`
  - Rate limit: 10 per 15 minutes.
  - Payload: `{ email, password }`
  - Response: `{ success: true, admin, expiresAt }`, plus cookie.
  - Errors: 400 missing fields, 401 invalid credentials, 500 missing env/other.
  - Client caller: `AdminLoginView.vue`.

- `POST /api/auth/logout`
  - Clears in-memory session and cookie.
  - Response: `{ success: true }`
  - Client caller: `AdminDashboardView.vue`.

- `GET /api/auth/me`
  - Reads session cookie.
  - Response authenticated: `{ success: true, authenticated: true, admin }`
  - Response unauthenticated: 401 `{ success: false, authenticated: false }`
  - Client callers: router guard, `AdminDashboardView.vue`.

## 11. Environment Variables and Deployment Notes

Client env variables observed:

- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL` is the preferred deployed backend origin variable after the 2026-06-05 post-repair verification pass. It should be set in Vercel to the live backend origin only, without a trailing `/api`.
- `VITE_API_URL` is still accepted as a backwards-compatible fallback by `client/src/shared/api/http.js`, but new deployment setup should use `VITE_API_BASE_URL`.

Server env variables referenced in code:

- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `FRONTEND_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `STRIPE_SECRET_KEY`
- `TAX_PROVIDER`

Server `.env` keys observed by name:

- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `STRIPE_SECRET_KEY`
- `DATABASE_URL`

Important env notes:

- `server/src/app.js` accepts both `CLIENT_URL` and `FRONTEND_URL` for CORS. Deployment should set at least one of those to the Vercel frontend origin.
- Local `.env` files are used only for local development. Do not commit `.env`, `.env.local`, `.env.production`, or files containing real secret values.

Public vs private:

- Public client: `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_API_BASE_URL`.
- Private server: `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `STRIPE_SECRET_KEY`.
- Operational/server: `PORT`, `NODE_ENV`, `CLIENT_URL`, `FRONTEND_URL`, `TAX_PROVIDER`.

Deployment evidence:

- `client/vercel.json` now exists for the Vite frontend project root and rewrites non-API paths to `/index.html` for SPA fallback.
- No Railway config, Cloudflare config, Dockerfile, or Procfile was found in the audited repo.
- `server/package.json` start script now runs: `prisma migrate deploy && node src/server.js`.
- Product seeding is explicit through `npm run seed:products`; production startup does not run product seed scripts.

## 12. Build, Test, and Verification Commands

Client scripts:

- `npm run dev`
- `npm run build`
- `npm run preview`

Server scripts:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run seed:products`
- `npm run prisma:studio`
- `npm run prisma:migrate`
- `npm run prisma:generate`

Root `package.json` is empty and has no scripts.

Verification performed during this handoff:

- `cd client && npm run build`: passed.
- `cd server && npm run build`: passed; Prisma Client generated.
- `node --check server/src/app.js`: passed.
- Runtime import check `import('./server/src/app.js')`: passed.

Missing scripts:

- No client lint script found.
- No server lint script found.
- No automated test scripts found.

## 13. Launch Readiness Assessment

Not launch-ready yet.

High-priority blockers or risks:

1. Admin orders API lacks server-side auth.
2. Admin order detail tries to PATCH order status, but server does not expose the route.
3. Stripe PaymentIntent is created from client-provided amount before server trusted validation.
4. Promo analytics likely breaks due `createdAt` vs `redeemedAt` mismatch on `PromoUsage`.
5. Campaign usage is recorded by a separate client-side call after checkout success, not transactionally with order creation.
6. Server start script reseeds and deletes products on every production start if used as-is.
7. CORS env mismatch: code uses `FRONTEND_URL`, `.env` has `CLIENT_URL`.
8. Admin auth sessions are in-memory only.
9. Order stats response does not match all client stat fields.
10. No automated tests are present for checkout, payment, inventory, promo, or admin flows.

Medium-priority risks:

- Checkout client fallback tax rate differs from server tax rates.
- `/api/campaigns` and `/api/admin/campaigns` mount the same router, so public/admin routes are mixed under both prefixes.
- `/api/promos` and `/api/admin/promos` mount the same router, so public validate exists under both prefixes.
- Product mutations delete/recreate all variants on update.
- Product quick-view/product spotlight includes navigation to `/products/:slug`, but no product route was found in `client/src/app/router/index.js`.
- `OrderSuccessView.vue` displays only route param and does not fetch order details.
- `AdminHeader.vue` and `StripeCheckoutForm.vue` appear unused/empty.
- Server Prisma logs include `query`, `error`, and `warn`, which may be noisy in production.

## 14. Known Risks and Manual QA Checklist

Manual QA required before launch:

- Storefront:
  - Load home page with API reachable.
  - Verify product feed, filters, sorting, featured product, coming soon products.
  - Open product quick view for active and coming soon products.
  - Add active inventory-limited product to cart.
  - Add made-to-order/preorder product and verify quantity behavior.
  - Verify out-of-stock variant cannot be purchased.
  - Verify cart persists after reload and can remove/update items.

- Checkout:
  - Empty cart redirect/error behavior.
  - Required field validation.
  - Shipping option changes update server preview.
  - Server trusted preview appears in summary.
  - Client fallback totals match or gracefully update to server totals.
  - Stripe success path creates order.
  - Stripe mismatch path is handled safely.
  - Duplicate payment intent cannot create duplicate order.
  - Inventory decrements after successful order.
  - Inventory rollback happens if order creation fails after decrement.
  - Order success route displays expected reference.

- Promos:
  - Create global promo.
  - Create unique promo with assigned email.
  - Create referral promo with owner name.
  - Validate active promo in checkout.
  - Validate expired/draft/minimum subtotal/usage limit failures.
  - Verify promo usage recorded once per order.
  - Verify analytics modal loads usage history and summary.

- Campaigns:
  - Create active campaign tied to product IDs.
  - Preview campaign donation in checkout.
  - Complete order with campaign product.
  - Verify campaign usage stats update.
  - Verify failed client-side record usage behavior is acceptable.

- Admin:
  - Login/logout.
  - Route guard redirects unauthenticated users.
  - API rejects unauthenticated product/promo/campaign writes.
  - Add/edit/delete product.
  - Add/edit/delete campaign.
  - Add/edit/delete promo.
  - Load orders dashboard.
  - Load order detail.
  - Update order status after server endpoint is implemented.

- Deployment:
  - Verify production CORS with correct frontend URL env.
  - Verify `server/package.json` start script does not reseed/destructively reset products in production.
  - Verify secure cookies over HTTPS.
  - Verify Stripe live/test keys match environment.
  - Verify Prisma migrations apply against production database.

## 15. Current Git State and Recent Commits

Observed before creating this handoff:

- Branch: `dev-main`
- Working tree status: `AGENTS.md` was modified before this handoff task. This handoff adds `PROJECT_HANDOFF.md`.
- Recent commits:
  - `a7251ff Refactor server domain structure and shared helpers`
  - `4e5f648 Complete admin orders refactor`
  - `646a2b0 fixed admin, broken down to each component`
  - `8db911d udpated files`
  - `d1432d4 refactoring, lego building each component`
  - `24eb852 adding seeds`
  - `9dccda1 Track Prisma migrations`
  - `7c22b30 updated products url`

Files changed in latest completed server cleanup phase are represented in commit `a7251ff`, including:

- `server/src/app.js`
- `server/src/app/middleware/error.middleware.js`
- `server/src/domains/products/*`
- `server/src/domains/checkout/*`
- `server/src/domains/promos/*`
- `server/src/domains/campaigns/*`
- `server/src/domains/orders/services/orders.service.js`
- `server/src/shared/utils/money.js`
- `server/src/shared/utils/string.js`
- `server/src/shared/services/tax.service.js`

Uncertainty:

- The content and reason for the current `AGENTS.md` modification were not changed by this handoff and should be reviewed separately.

## 16. Dependency and Integration Map

Client dependencies:

- Vue renders UI and state.
- Vue Router handles routes and admin guard.
- Stripe.js handles card collection and confirmation.
- Vite proxies `/api` to `http://localhost:3000` in dev.
- Tailwind plugin provides styling.

Server dependencies:

- Express serves REST endpoints.
- Prisma Client reads/writes PostgreSQL.
- Stripe Node SDK creates/retrieves/validates PaymentIntents.
- bcryptjs verifies admin password.
- cookie-parser reads admin session cookie.
- express-rate-limit protects auth login and promo validation.

Core integration path:

Client `fetch` -> Vite proxy or deployed API -> Express route -> controller -> service -> repository/Prisma -> PostgreSQL -> mapper -> JSON response -> client composable/view.

Stripe integration path:

Client Stripe Elements -> server PaymentIntent creation -> Stripe confirmation -> server Stripe retrieval/validation -> order creation.

## 17. Important File Index

### Root and Config

- `AGENTS.md`: project instructions for handoff/refactor documentation.
- `PROJECT_HANDOFF.md`: this document.
- `README.md`: default Vue/Vite starter README, not project-specific.
- `client/vite.config.js`: aliases and dev proxy.
- `client/jsconfig.json`: editor alias paths.
- `client/package.json`: client scripts and deps.
- `server/package.json`: server scripts and deps.
- `server/prisma/schema.prisma`: database schema.
- `server/prisma/migrations/`: migration history.

### Client Storefront

- `client/src/domains/storefront/Home/HomeView.vue`: storefront orchestrator for product load, filtering, quick view, cart.
- `client/src/domains/storefront/Home/sections/ProductSpotlightSection.vue`: featured product display and add-to-cart.
- `client/src/domains/products/api/products.api.js`: product fetch and client normalization.
- `client/src/domains/products/composables/useProducts.js`: product loading and product grouping.
- `client/src/domains/products/composables/useProductFilters.js`: storefront filters/sort.
- `client/src/domains/products/composables/useProductVariants.js`: selected size and variant helpers.
- `client/src/domains/products/ProductCard/ProductCard.vue`: product card shell.
- `client/src/domains/products/ProductQuickView/ProductQuickView.vue`: modal product details and add-to-cart.
- `client/src/shared/constants/sellingMode.js`: client selling mode/inventory purchase rules.
- `client/src/shared/utils/currency.js`: client currency formatter.

### Client Cart and Checkout

- `client/src/domains/cart/composables/useCart.js`: cart state, localStorage persistence, quantity changes.
- `client/src/domains/cart/CartDrawer/CartDrawer.vue`: cart drawer UI.
- `client/src/domains/checkout/views/CheckoutView.vue`: checkout page orchestration.
- `client/src/domains/checkout/api/checkout.api.js`: preview/final checkout requests.
- `client/src/domains/checkout/composables/useCheckout.js`: payment/order submission state machine.
- `client/src/domains/checkout/composables/useCheckoutPreview.js`: debounced server preview.
- `client/src/domains/checkout/composables/useCheckoutPromos.js`: checkout promo application state.
- `client/src/domains/checkout/utils/checkout.utils.js`: client fallback pricing calculations.
- `client/src/domains/checkout/views/OrderSuccessView.vue`: post-checkout success UI.
- `client/src/domains/payments/components/StripeElementsForm.vue`: active Stripe card form.
- `client/src/domains/payments/services/payment.service.js`: creates PaymentIntent.
- `client/src/domains/payments/services/stripe.js`: loads Stripe publishable key.

### Client Admin

- `client/src/domains/admin/views/AdminDashboardView.vue`: admin landing/navigation.
- `client/src/domains/admin/views/AdminLoginView.vue`: admin sign-in.
- `client/src/domains/admin/views/AdminProductsView.vue`: product admin orchestration.
- `client/src/domains/admin/views/AdminPromosView.vue`: promo admin orchestration.
- `client/src/domains/admin/views/AdminCampaignsView.vue`: campaign admin orchestration.
- `client/src/domains/admin/views/AdminOrdersView.vue`: orders dashboard orchestration.
- `client/src/domains/admin/views/AdminOrderDetailView.vue`: order detail view; still has inline fetch and missing server patch dependency.
- `client/src/domains/admin/composables/useAdminProducts.js`: admin product state/business logic.
- `client/src/domains/admin/composables/useAdminPromos.js`: admin promo state/business logic.
- `client/src/domains/admin/composables/useAdminCampaigns.js`: admin campaign state/business logic.
- `client/src/domains/admin/composables/useAdminOrders.js`: admin orders grouping/filtering.
- `client/src/domains/admin/constants/*.constants.js`: admin UI statuses/options/groups.
- `client/src/domains/admin/mappers/*.mapper.js`: admin form payload mapping.
- `client/src/domains/admin/validators/adminProductForm.validator.js`: admin product validation.
- `client/src/domains/promos/api/promos.api.js`: promo CRUD, analytics, validation.
- `client/src/domains/campaigns/api/campaigns.api.js`: campaign CRUD, preview, record usage.

### Server Core

- `server/src/server.js`: loads env and starts HTTP server.
- `server/src/app.js`: Express app, CORS, route mounts, error middleware.
- `server/src/db/prisma.js`: Prisma singleton.
- `server/src/app/middleware/auth/requireAdminAuth.js`: admin API guard.
- `server/src/app/middleware/error.middleware.js`: generic JSON error response.
- `server/src/shared/utils/money.js`: server money rounding.
- `server/src/shared/utils/string.js`: shared string normalization.
- `server/src/shared/services/tax.service.js`: tax calculation.

### Server Domains

- `server/src/domains/products/routes/products.routes.js`: product endpoints.
- `server/src/domains/products/controllers/products.controller.js`: product request handlers.
- `server/src/domains/products/services/products.service.js`: product DB orchestration and inventory decrement.
- `server/src/domains/products/mappers/products.mapper.js`: product normalization/mutation data.
- `server/src/domains/products/constants/products.constants.js`: product sizes/defaults/status labels.
- `server/src/domains/products/validators/products.validator.js`: product payload validation.

- `server/src/domains/checkout/routes/checkout.routes.js`: checkout preview/final endpoints.
- `server/src/domains/checkout/controllers/checkout.controller.js`: checkout response envelope.
- `server/src/domains/checkout/services/checkout.service.js`: trusted checkout orchestration.
- `server/src/domains/checkout/utils/checkoutPricing.js`: subtotal/shipping/discount/donation calculations.
- `server/src/domains/checkout/validators/checkout.validator.js`: checkout required fields and payment preview rules.

- `server/src/domains/payments/routes/payment.routes.js`: create PaymentIntent endpoint.
- `server/src/domains/payments/controllers/payment.controller.js`: PaymentIntent request handler.
- `server/src/domains/payments/services/stripe.payment.js`: Stripe SDK integration and validation.

- `server/src/domains/orders/routes/orders.routes.js`: admin order list/stats/detail routes.
- `server/src/domains/orders/controllers/orders.controller.js`: order response handlers.
- `server/src/domains/orders/services/orders.service.js`: order creation and inventory rollback.
- `server/src/domains/orders/repositories/orders.repository.js`: Prisma order queries and creation.
- `server/src/domains/orders/mappers/orders.mapper.js`: order response normalization.

- `server/src/domains/promos/routes/promos.routes.js`: promo CRUD/analytics/validation routes.
- `server/src/domains/promos/services/promos.service.js`: promo lifecycle, validation, discount, usage.
- `server/src/domains/promos/repositories/promos.repository.js`: Prisma promo and usage queries.
- `server/src/domains/promos/constants/promos.constants.js`: promo statuses/types/discount constants.
- `server/src/domains/promos/mappers/promos.mapper.js`: promo analytics and mutation payloads.
- `server/src/domains/promos/validators/promos.validator.js`: unique/referral rules.

- `server/src/domains/campaigns/routes/campaigns.routes.js`: campaign CRUD/preview/record routes.
- `server/src/domains/campaigns/controllers/campaigns.controller.js`: campaign response handlers.
- `server/src/domains/campaigns/services/campaigns.service.js`: campaign orchestration.
- `server/src/domains/campaigns/repositories/campaigns.repository.js`: Prisma campaign queries/mutations.
- `server/src/domains/campaigns/constants/campaigns.constants.js`: campaign status/donation constants.
- `server/src/domains/campaigns/mappers/campaigns.mapper.js`: campaign input and preview mapping.
- `server/src/domains/campaigns/utils/campaigns.utils.js`: campaign active/donation rules.
- `server/src/domains/campaigns/validators/campaigns.validator.js`: campaign name validation.

- `server/src/domains/auth/routes/auth.routes.js`: login/logout/me endpoints.
- `server/src/domains/auth/services/auth.service.js`: env credentials, bcrypt, in-memory sessions.

## 18. Remaining Work Before Launch

Recommended order:

1. Secure admin orders API with `requireAdminAuth`.
2. Decide and implement order status update endpoints or remove the status update UI.
3. Fix promo usage analytics `createdAt` vs `redeemedAt`.
4. Move Stripe PaymentIntent amount creation to server-trusted pricing.
5. Make campaign usage recording part of checkout/order transaction or add server-side retry/idempotency.
6. Replace production `start` script seeding behavior with a safe deploy command.
7. Resolve `CLIENT_URL` vs `FRONTEND_URL`.
8. Persist admin sessions outside memory or document single-instance limitation.
9. Align order stats response with admin UI expectations.
10. Add automated tests for checkout, promos, campaigns, products, orders, and auth.
11. Continue cleanup of oversized files:
    - `client/src/domains/admin/components/AdminProductFormPanel.vue`
    - `server/src/domains/promos/services/promos.service.js`
    - `client/src/domains/checkout/views/CheckoutView.vue`
12. Remove or implement empty/stub files:
    - `client/src/domains/admin/components/AdminHeader.vue`
    - `client/src/domains/payments/components/StripeCheckoutForm.vue`
13. Add a product detail route or remove `router.push('/products/:slug')` behavior.
14. Decide whether campaign/admin public route sharing should be split into separate public and admin routers.
15. Add project-specific README/deployment docs.

## 19. Uncertainty Log

- No `.vscode/AGENTS.md` file exists on disk, even though the IDE tab list referenced it.
- No deployment platform config was found. Deployment target is unknown from code.
- No automated tests were found, so behavior is inferred from source and build checks only.
- No product detail route exists in `client/src/app/router/index.js`; product APIs include fetch-by-slug and UI has navigation calls, but the route is not present.
- Email confirmation is described in `OrderSuccessView.vue`, but no email sending integration was found.
- Donation amount per order is not stored on `Order`; campaign stats are separate aggregate counters.
- `server/src/generated/prisma/` exists, but current Prisma generator config does not point there. Its lifecycle is unclear.

## 20. Repair and Launch-Readiness Pass - 2026-06-05

This section documents the full repair pass requested after the Admin Cleanup and Server Structure Cleanup phases. It supersedes earlier launch-readiness notes where the same issue is listed as fixed below.

### Scope Audited

Evidence checked from code:

- Root instructions: `AGENTS.md`.
- Current project knowledge: `PROJECT_HANDOFF.md`.
- Client checkout, payments, admin orders, campaigns, and promos domains.
- Server checkout, payments, orders, products inventory, promos, campaigns, auth, app startup, Prisma schema, and package scripts.
- Environment examples and deployment-sensitive startup behavior.

No cosmetic refactors were performed in this pass. Changes were limited to verified launch blockers or direct support for those fixes.

### Confirmed Launch Blockers Fixed

1. Client-supplied Stripe amount was trusted during PaymentIntent creation.
   - Previous behavior: `StripeElementsForm.vue` sent a client-calculated `amount` to `payment.service.js`, and `payment.controller.js` used that amount to create the PaymentIntent.
   - Fix: `payment.controller.js` now recomputes trusted checkout pricing through `previewCheckout()` and creates the PaymentIntent from the server total. `stripe.payment.js` converts trusted dollar totals to cents internally.

2. Checkout payment form exposed the wrong method name.
   - Previous behavior: `CheckoutPaymentSection.vue` exposed `confirmPayment`, while `useCheckout.js` calls `submitPayment()`.
   - Fix: `CheckoutPaymentSection.vue` now exposes `submitPayment()` and delegates to `StripeElementsForm.vue`.

3. Checkout shipping price was client-trusted.
   - Previous behavior: `checkoutPricing.js` accepted `shipping.price` from the request.
   - Fix: shipping is now derived from server constants in `server/src/domains/checkout/constants/checkout.constants.js`; client price input is ignored for pricing.

4. Admin orders endpoints were not server-protected.
   - Previous behavior: `/api/admin/orders` mounted order routes without `requireAdminAuth`.
   - Fix: `server/src/domains/orders/routes/orders.routes.js` now applies `router.use(requireAdminAuth)`.

5. Admin order detail status updates called a missing endpoint.
   - Previous behavior: `AdminOrderDetailView.vue` patched `/api/admin/orders/:id/status`, but no server route existed.
   - Fix: added order status constants, validator, repository update, service update, controller handler, and route. Client order detail now uses `adminOrders.api.js` helpers.

6. Order creation idempotency was incomplete.
   - Previous behavior: duplicate Stripe PaymentIntent IDs were checked in application code only, with no database uniqueness guarantee.
   - Fix: `Order.stripePaymentIntentId` is now `@unique`; a Prisma migration creates the unique index. Checkout and order creation now return the existing order for the same payment intent when the customer email matches, and order creation handles unique constraint races.

7. Campaign usage could be client-spoofed.
   - Previous behavior: checkout success called public campaign usage recording from the client.
   - Fix: campaign usage is recorded server-side from trusted checkout preview after order creation. The old `/api/campaigns/record-usage` route now requires admin authentication.

8. Promo analytics queried a Prisma field that does not exist.
   - Previous behavior: promo usage history ordered by `createdAt`, but `PromoUsage` has `redeemedAt`.
   - Fix: repository ordering now uses `redeemedAt`; mapper exposes both `redeemedAt` and compatibility `createdAt` values from `redeemedAt`.

9. Production startup could reseed and delete product data.
   - Previous behavior: `server/package.json` `start` ran the product seed script, and the seed deletes/recreates products.
   - Fix: production start now runs `prisma migrate deploy && node src/server.js`. Product seeding remains available only through the explicit `seed:products` script.

10. Environment documentation and CORS variable names were inconsistent.
    - Previous behavior: server code used `FRONTEND_URL`; existing env usage also referenced `CLIENT_URL`; no `.env.example` files existed.
    - Fix: CORS accepts both `FRONTEND_URL` and `CLIENT_URL`. A later post-repair pass removed the temporary `.env.example` files because this project documents deployment variable names in `PROJECT_HANDOFF.md` instead.

11. Admin order stats and filters did not match server data.
    - Previous behavior: client expected `paidOrders`, `fulfilledOrders`, `totalDonationGenerated`, and payment/fulfillment status fields that were not returned on order objects.
    - Fix: server stats now include client-compatible stat fields. Client order filters now use actual order statuses and no longer filter on nonexistent `paymentStatus` or `fulfillmentStatus`.

12. Dead duplicate checkout/payment component existed.
    - Previous behavior: `StripeCheckoutForm.vue` was an unused stub.
    - Fix: removed the unused stub component.

### Files Changed in This Repair Pass

Client:

- `client/src/domains/admin/api/adminOrders.api.js`: added order detail and order status update API helpers.
- `client/src/domains/admin/composables/useAdminOrders.js`: removed filtering against nonexistent order fields.
- `client/src/domains/admin/constants/adminOrders.constants.js`: aligned filter statuses with server order statuses.
- `client/src/domains/admin/views/AdminOrderDetailView.vue`: uses admin orders API helpers.
- `client/src/domains/campaigns/api/campaigns.api.js`: removed public campaign usage recording helper.
- `client/src/domains/checkout/Checkout/CheckoutPaymentSection.vue`: passes trusted pricing inputs to Stripe form and exposes `submitPayment()`.
- `client/src/domains/checkout/views/CheckoutView.vue`: passes customer, promo, and shipping method data into the payment form; removed client-side campaign usage recording.
- `client/src/domains/payments/components/StripeElementsForm.vue`: requests PaymentIntents with checkout inputs instead of a client-calculated amount.
- `client/src/domains/payments/components/StripeCheckoutForm.vue`: removed unused stub.
- `client/src/domains/payments/services/payment.service.js`: sends cart, promo, customer, and shipping data to PaymentIntent creation endpoint.

Server:

- `server/package.json`: removed destructive product seeding from production `start`.
- `server/prisma/schema.prisma`: made `Order.stripePaymentIntentId` unique.
- `server/prisma/migrations/20260605000000_unique_order_payment_intent/migration.sql`: adds the unique index for Stripe payment intent idempotency.
- `server/src/app.js`: accepts both `FRONTEND_URL` and `CLIENT_URL` for CORS.
- `server/src/domains/campaigns/routes/campaigns.routes.js`: protects campaign usage recording with admin auth.
- `server/src/domains/checkout/constants/checkout.constants.js`: new server-owned shipping options.
- `server/src/domains/checkout/services/checkout.service.js`: idempotent checkout handling, trusted campaign usage recording, and existing-order return for repeated payment intents.
- `server/src/domains/checkout/utils/checkoutPricing.js`: derives shipping price from server constants.
- `server/src/domains/orders/constants/orders.constants.js`: new source of truth for order statuses.
- `server/src/domains/orders/validators/orders.validator.js`: validates order status updates.
- `server/src/domains/orders/controllers/orders.controller.js`: added order status update controller.
- `server/src/domains/orders/repositories/orders.repository.js`: added status update and payment-intent lookup helpers; aligned order stats.
- `server/src/domains/orders/routes/orders.routes.js`: applies admin auth and exposes `PATCH /:orderId/status`.
- `server/src/domains/orders/services/orders.service.js`: idempotent order creation and status update orchestration.
- `server/src/domains/payments/controllers/payment.controller.js`: creates PaymentIntents from trusted server checkout preview totals.
- `server/src/domains/payments/services/stripe.payment.js`: normalizes trusted totals to Stripe cent amounts.
- `server/src/domains/promos/mappers/promos.mapper.js`: maps promo usage timestamps from `redeemedAt`.
- `server/src/domains/promos/repositories/promos.repository.js`: queries promo usage history by `redeemedAt`.

### Verification Performed

Passed:

- `cd server && npm run build`
  - Runs `prisma generate`.
- `cd client && npm run build`
  - Vite production build completed successfully.
- Server syntax checks:
  - `node --check server/src/app.js`
  - `node --check server/src/domains/checkout/services/checkout.service.js`
  - `node --check server/src/domains/payments/controllers/payment.controller.js`
  - `node --check server/src/domains/payments/services/stripe.payment.js`
  - `node --check server/src/domains/orders/controllers/orders.controller.js`
  - `node --check server/src/domains/orders/services/orders.service.js`
  - `node --check server/src/domains/orders/repositories/orders.repository.js`
  - `node --check server/src/domains/promos/repositories/promos.repository.js`
- Server import smoke check:
  - `node -e "import('./server/src/app.js').then(() => console.log('app import ok'))"`

Not available:

- No client lint script exists in `client/package.json`.
- No server lint script exists in `server/package.json`.
- No client or server test script exists in the package files inspected during this repair pass.

### Remaining Risks and Unverified Areas

- Promo usage is still recorded after order creation because the current schema requires `orderId` for the `PromoUsage` unique record. If promo usage persistence fails after a successful order, checkout avoids showing the customer a failure after payment/order creation, but promo counters can underreport. A full fix likely needs a transaction/reservation design.
- Promo usage limit checks can still race under concurrent checkout attempts because usage count validation and usage creation are not locked together before payment. Database uniqueness prevents duplicate usage for one order, but not all concurrent max-usage edge cases.
- Campaign usage is now server-side and no longer client-spoofable, but there is no per-order campaign usage table or unique campaign/order record. Aggregate campaign stats can underreport if the post-order campaign update fails.
- The new Stripe PaymentIntent unique migration can fail on a production database that already contains duplicate non-null `stripePaymentIntentId` values. Run a duplicate preflight query before production migration.
- Admin sessions are still in memory. This is a launch risk for multi-instance deployments, server restarts, and horizontal scaling.
- Most client API calls use relative `/api` paths and rely on same-origin deployment or Vite dev proxy. `VITE_API_URL` is documented but not consistently used across all domains.
- Product detail navigation appears to push `/products/:slug`, but no matching route was found in the router during handoff generation.
- Order success still uses the route order id display and does not fetch a full order confirmation from the server.
- No automated tests exist for checkout, Stripe, promos, campaigns, admin auth, or inventory rollback. Verification is build/syntax/import based plus source audit.
- Email confirmation copy exists in the UI, but no email provider integration was found.

### Manual QA Checklist Before Launch

- Admin auth:
  - Verify unauthenticated requests to `/api/admin/orders`, `/api/admin/promos`, and `/api/admin/campaigns` return unauthorized.
  - Verify admin login, `/api/auth/me`, logout, and protected route reload behavior.

- Checkout and Stripe:
  - Complete a successful Stripe test card checkout from cart to `/order-success/:orderId`.
  - Tamper with client subtotal/shipping/amount in dev tools and confirm the PaymentIntent still uses server pricing.
  - Re-submit the same succeeded `stripePaymentIntentId` and confirm the existing order is returned instead of creating a duplicate.
  - Attempt same payment intent with a different customer email and confirm it is rejected.
  - Verify failed, canceled, or unpaid PaymentIntents do not create orders or decrement inventory.

- Inventory:
  - Buy an inventory-limited product and confirm variant stock decreases once.
  - Attempt a checkout quantity above stock and confirm checkout fails before payment/order.
  - Confirm duplicate/retry submissions do not decrement inventory twice.

- Promos:
  - Apply valid fixed and percent promos and confirm discount totals match admin promo rules.
  - Try expired, disabled, archived, usage-exhausted, and minimum-order promos.
  - Confirm promo analytics show redemption timestamps and usage counts after checkout.
  - Repeat/retry a payment intent with a promo and confirm usage is not double-counted.

- Campaigns:
  - Checkout with a product in an active campaign and confirm donation/revenue/order counters update from the server.
  - Confirm public clients cannot call `/api/campaigns/record-usage` without auth.
  - Verify paused, draft, ended, and archived campaigns do not contribute donation totals.

- Admin orders:
  - Load the orders dashboard and verify stats/cards match real orders.
  - Filter by each status option.
  - Open order detail and update order status through every allowed status.

- Deployment:
  - Run Prisma duplicate preflight for `stripePaymentIntentId` before migration.
  - Verify `server/.env` has `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `STRIPE_SECRET_KEY`, and the correct frontend origin.
  - Verify `client/.env` has the intended `VITE_STRIPE_PUBLISHABLE_KEY`.
  - Confirm production `npm start` does not run seed scripts.

Suggested duplicate preflight query before applying the new production migration:

```sql
SELECT "stripePaymentIntentId", COUNT(*)
FROM "Order"
WHERE "stripePaymentIntentId" IS NOT NULL
GROUP BY "stripePaymentIntentId"
HAVING COUNT(*) > 1;
```

### Current Git State at Repair Handoff

Observed before the final handoff update:

- Branch: `dev-main`.
- `AGENTS.md` was already modified before this repair pass and was not intentionally changed by the repair pass.
- `PROJECT_HANDOFF.md` exists as an untracked handoff document and was updated by this repair pass.
- Repair pass application files listed above are modified or newly added and need review.

### Recommended Next Phase

The next safest phase is a focused QA and production hardening pass:

1. Run the manual QA checklist against a real local database and Stripe test keys.
2. Add automated tests for checkout pricing, PaymentIntent creation, idempotent order creation, promo validation/usage, campaign usage, and admin auth.
3. Decide whether to add persistent admin sessions before launch.
4. Decide whether promo and campaign usage should move into a stronger transactional or per-order usage model.

## 21. Post-Repair Verification and Deployment 404 Fix - 2026-06-05

This section reconciles the interrupted repair run and documents the follow-up deployment fixes.

### Interrupted Run Reconciliation

Observed at the start of this pass:

- `git status` showed only `AGENTS.md` modified.
- `git diff --stat` showed only `AGENTS.md`.
- `git diff --name-status` showed only `M doggy_ent_vue/AGENTS.md`.
- Despite that clean working tree, the high-risk repair code described in the previous report was present in `HEAD` and verified from source.

Conclusion:

- The previous UI checklist was incomplete, but the actual repository already contained the core repair-pass code in the high-risk server/client files.
- The old final report was partially stale because it described `client/.env.example` and `server/.env.example` as desired outputs. Current project policy says those files should not exist, so they were removed in this pass.

### Verified From Current Code

Already correct in the current repository:

- Stripe PaymentIntent creation no longer trusts a client-submitted amount. `server/src/domains/payments/controllers/payment.controller.js` calls `previewCheckout()` and uses trusted server pricing.
- Checkout preview, PaymentIntent creation, and order creation use the same server checkout pricing path.
- Shipping price cannot be spoofed by the client. `server/src/domains/checkout/utils/checkoutPricing.js` derives shipping from server-owned constants.
- `Order.stripePaymentIntentId` is unique in `server/prisma/schema.prisma`, and the local migration exists at `server/prisma/migrations/20260605000000_unique_order_payment_intent/migration.sql`.
- Local Prisma status reported the local database schema is up to date.
- Local `prisma generate` completed through `npm run build` in `server/`.
- Admin order routes apply `requireAdminAuth`.
- Admin order status update client and server endpoints match.
- Production server `npm start` does not run product seed scripts.
- Promo analytics uses `redeemedAt` rather than nonexistent `createdAt`.
- Campaign usage recording is server-side and the old public record usage route is auth-protected.

### Incomplete or Broken Before This Pass

Confirmed deployment blockers:

- Deployed checkout failed because the Vercel frontend called relative `/api/...` paths on `doggy-ent.vercel.app`. Locally this worked only because `client/vite.config.js` proxies `/api` to `http://localhost:3000`.
- Deployed direct `/admin` returned Vercel `404: NOT_FOUND` because the static Vite SPA did not have a Vercel fallback to `/index.html`.
- Production admin auth cookies used `SameSite=strict`, which blocks cross-site Vercel frontend to Railway backend cookie sessions even when the browser request uses `credentials: include`.
- API response parsing assumed JSON in several places, so Vercel HTML 404 pages could surface as confusing checkout/payment errors.
- `client/.env.example` and `server/.env.example` existed, but project policy says this repo should not keep `.env.example` files.

### Fixes Made in This Pass

Client deployment/API routing:

- Added `client/src/shared/api/http.js`.
  - `buildApiUrl(path)` uses `VITE_API_BASE_URL` when provided, falling back to `VITE_API_URL` for compatibility and then to relative `/api` paths for local Vite proxy development.
  - `fetchApi(path, options)` sends credentialed requests so admin auth can work across the deployed frontend/backend boundary.
  - `parseJsonResponse(response, fallbackMessage)` detects non-JSON responses, including Vercel HTML 404 pages, and raises a clear deployment/API routing error.

- Updated these client API/auth callers to use the shared helper:
  - `client/src/domains/products/api/products.api.js`
  - `client/src/domains/admin/api/adminProducts.api.js`
  - `client/src/domains/admin/api/adminCampaigns.api.js`
  - `client/src/domains/admin/api/adminOrders.api.js`
  - `client/src/domains/checkout/api/checkout.api.js`
  - `client/src/domains/payments/services/payment.service.js`
  - `client/src/domains/promos/api/promos.api.js`
  - `client/src/domains/campaigns/api/campaigns.api.js`
  - `client/src/domains/admin/views/AdminLoginView.vue`
  - `client/src/domains/admin/views/AdminDashboardView.vue`
  - `client/src/app/router/index.js`

Vercel SPA fallback:

- Added `client/vercel.json` at the Vite frontend project root:

```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

- The rewrite intentionally excludes `/api/...` so API mistakes are not silently routed to `index.html`.
- Based on the local repo, `client/` is the actual frontend/Vite project root. No root-level Vercel config or `.vercel/project.json` was found.

Server auth deployment:

- Updated `server/src/domains/auth/services/auth.service.js` so production admin session cookies use `SameSite=None` with `secure: true`. This supports a Vercel frontend calling a Railway backend with `credentials: include`.

Environment files:

- Removed `client/.env.example`.
- Removed `server/.env.example`.
- Required variables are documented here by name only; no secret values were copied from local `.env` files.

### Required Deployment Variables

Set in Vercel for the client:

- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for the intended Stripe environment.
- `VITE_API_BASE_URL`: live backend origin, for example the Railway service origin. Do not include a trailing `/api`; the client code appends `/api/...`.

Set in Railway for the server:

- `PORT`: server port, usually provided by Railway.
- `NODE_ENV`: use `production` for deployed production.
- `DATABASE_URL`: Railway Postgres connection string.
- `CLIENT_URL`: Vercel frontend origin for CORS.
- `FRONTEND_URL`: also accepted by server CORS; set this to the same frontend origin if using that naming convention.
- `ADMIN_EMAIL`: admin login email.
- `ADMIN_PASSWORD_HASH`: bcrypt hash for the admin password.
- `STRIPE_SECRET_KEY`: Stripe secret key for the intended Stripe environment.
- `TAX_PROVIDER`: optional; defaults to local tax calculation if unset.

No values should be committed to the repository.

### Railway Migration Status and Required Steps

Verified locally:

- `server/prisma/migrations/20260605000000_unique_order_payment_intent/migration.sql` exists.
- `server/prisma/schema.prisma` has `stripePaymentIntentId String? @unique`.
- Local `npx prisma migrate status` reported: `Database schema is up to date!`
- Local `npm run build` in `server/` completed `prisma generate`.

Not verified:

- Railway migration status is still unknown from this local pass.
- No Railway migration was applied automatically.

Required Railway preflight before deploying the unique constraint migration:

```sql
SELECT "stripePaymentIntentId", COUNT(*)
FROM "Order"
WHERE "stripePaymentIntentId" IS NOT NULL
GROUP BY "stripePaymentIntentId"
HAVING COUNT(*) > 1;
```

If the preflight returns no rows and the target database is confirmed to be the intended Railway database, deploy migrations from the server project:

```bash
cd server
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
```

Do not run `prisma migrate reset` on Railway or any shared database.

### Manual Redeploy Steps

1. Set Vercel `VITE_API_BASE_URL` to the live backend origin, without `/api`.
2. Set Vercel `VITE_STRIPE_PUBLISHABLE_KEY`.
3. Set Railway `CLIENT_URL` or `FRONTEND_URL` to the Vercel frontend origin.
4. Confirm Railway has `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `STRIPE_SECRET_KEY`, `NODE_ENV`, and `PORT`.
5. Verify Railway migration status and run the duplicate preflight before `npx prisma migrate deploy`.
6. Redeploy Railway after any server env or migration changes.
7. Redeploy Vercel after setting `VITE_API_BASE_URL`, because Vite bakes public env variables at build time.
8. Manually test:
   - `/`
   - `/checkout`
   - `/admin`
   - `/admin/login?redirect=/admin`
   - `/order-success/test-route-check`
   - checkout preview, promo validation, campaign preview, PaymentIntent creation, and final checkout.

### Verification Commands and Results

Passed:

```bash
git status
```

Result at start: only `AGENTS.md` was modified.

```bash
git diff --stat
```

Result at start: only `AGENTS.md`.

```bash
git diff --name-status
```

Result at start: only `M doggy_ent_vue/AGENTS.md`.

```bash
cd server
npx prisma migrate status
```

Result: `Database schema is up to date!` for the local `localhost:5432` database.

```bash
cd client
npm run build
```

Result: passed.

```bash
cd server
npm run build
```

Result: passed and generated Prisma Client.

```bash
cd server
node --check src/app.js
node --check src/domains/auth/services/auth.service.js
```

Result: passed.

```bash
node -e "import('./server/src/app.js').then(() => console.log('app import ok'))"
```

Result: `app import ok`.

```bash
cd client
VITE_API_BASE_URL=https://api.example.test npm run build
rg -o "https://api\\.example\\.test|localhost:3000|doggy-ent\\.vercel\\.app" dist
```

Result: build passed and the dist bundle contained the placeholder API origin. No `localhost:3000` or `doggy-ent.vercel.app` API origin was found.

Not available:

- No client lint script exists.
- No server lint script exists.
- No client or server test script exists.

### Remaining Risks

- Railway migration status must still be verified against the actual Railway database before production deploy.
- Cross-site admin cookies now use `SameSite=None; Secure`, but admin sessions are still stored in memory and will reset on server restart or fail across multiple server instances.
- Promo usage and campaign usage still have the aggregate/idempotency limitations described in section 20.
- Deployed checkout needs manual QA with real Vercel and Railway env variables after redeploy.
- The client still supports `VITE_API_URL` as a fallback for compatibility, but deployment docs should prefer `VITE_API_BASE_URL`.

### Current Working Tree Safety

The local edits from this pass are focused and safe for commit review after human inspection:

- They fix verified Vercel API 404 behavior, SPA direct-route 404 behavior, cross-origin admin cookie behavior, and stale env example files.
- They do not redesign UX.
- They do not apply Railway migrations.
- They do not expose local `.env` secret values.
- `AGENTS.md` remains modified from before this pass and should be reviewed as a separate instruction-file change.
