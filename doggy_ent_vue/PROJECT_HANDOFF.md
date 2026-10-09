# Doggy Ent Project Handoff

Generated: 2026-06-05
Latest update: 2026-10-08 - Approved Calm Essentials account UI implementation.
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
- Session is stored as a signed, expiring admin cookie token after the 2026-06-05 stabilization pass. The old in-memory `Map` remains only as a fallback for older local session ids.
- Cookie name: `doggy_admin_session`.
- Session TTL: 8 hours.
- Cookie is `httpOnly`. After the 2026-06-05 admin auth stabilization pass, deployed cross-site admin cookies use `secure: true` and `sameSite: none`; local same-origin/proxy development uses `sameSite: lax`.

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

## 22. Admin Auth Session Stabilization - 2026-06-05

This section documents the follow-up admin auth repair after checkout, Vercel routing, Stripe payments, order creation, and Railway persistence were verified working.

### Verified Deployed Symptom

Reported verified state:

- Vercel storefront loads.
- Vercel SPA routing works.
- Checkout works on Vercel.
- Stripe test payments succeed.
- Orders are created in Railway and appear in the Railway database.
- Order success page works.
- The unique Stripe payment intent migration is applied on Railway.
- `/admin` loads on Vercel.
- Admin login accepts the correct credentials.
- Local admin login works.

Broken deployed behavior:

- Vercel admin login showed a success message but did not reach a usable dashboard session.
- Browser/network showed `401` from Railway `/api/auth/me`.

### Root Cause

The credentials path was working, but the session validation path was fragile for Vercel to Railway deployment.

From source:

- `POST /api/auth/login` created a session id and stored it in a process-local `Map` in `server/src/domains/auth/services/auth.service.js`.
- `GET /api/auth/me` only authenticated if the browser sent `doggy_admin_session` and that id still existed in the same process-local `Map`.
- In Railway/deployed environments, a process restart or a different instance can lose that in-memory session even though login returned success.
- Cross-site cookie behavior was also tied to `NODE_ENV === 'production'`, so a deployed frontend origin with a mis-set or unexpected `NODE_ENV` could produce local-style cookies that are not usable for Vercel to Railway requests.
- The login view redirected to `/admin` after login success before proving `/api/auth/me` recognized the new session.

The observable result is exactly the reported pattern: credentials are accepted, then the next `/api/auth/me` request returns `401`.

### Fix

Server session stability:

- `server/src/domains/auth/services/auth.service.js` now issues a signed, expiring admin session token in the existing `doggy_admin_session` cookie.
- `/api/auth/me` can validate that signed token without relying on the process-local `Map`, so the session survives Railway process restarts and multi-instance routing for the token lifetime.
- The old in-memory lookup remains as a fallback for older local session ids during the transition.
- The signing key uses `ADMIN_SESSION_SECRET` when present, otherwise `ADMIN_PASSWORD_HASH`. `ADMIN_SESSION_SECRET` is recommended for Railway but not required for this fix to work.

Cookie attributes:

- Deployed cross-site cookies now use `SameSite=None` and `Secure` when either `NODE_ENV=production` or a non-local `FRONTEND_URL` / `CLIENT_URL` is configured.
- Local development with localhost frontend origins continues to use `SameSite=Lax` and non-secure cookies.
- Cookies remain `HttpOnly`, use path `/`, and keep the existing 8-hour TTL.

CORS:

- `server/src/app.js` now normalizes `FRONTEND_URL` and `CLIENT_URL` origins by trimming whitespace and trailing slashes.
- It also supports comma-separated origins for safer deployment configuration.
- CORS still uses explicit allowed origins and `credentials: true`; it does not use a wildcard origin.

Client login flow:

- `client/src/domains/admin/views/AdminLoginView.vue` now calls `/api/auth/me` immediately after successful login.
- The app redirects only after the server confirms the admin session is authenticated.
- The login page now respects the existing `redirect` query parameter, defaulting to `/admin`.

### Auth Flow Verification From Code

Expected deployed flow after redeploy:

1. Vercel login form posts to Railway `POST /api/auth/login` through the shared API helper.
2. Request includes credentials mode.
3. Railway validates `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`.
4. Railway returns `Set-Cookie: doggy_admin_session=...; HttpOnly; Secure; SameSite=None; Path=/`.
5. The login page immediately calls Railway `GET /api/auth/me`.
6. Browser sends the Railway cookie back to the Railway origin.
7. Server verifies the signed token and returns `{ authenticated: true }`.
8. Login page redirects to the query `redirect` path or `/admin`.
9. Router guard also calls `/api/auth/me`; the signed token validates again.
10. Admin dashboard loads.

### Required Environment Variables

Vercel:

- `VITE_API_URL`: currently present and supported by `client/src/shared/api/http.js`.
- `VITE_API_BASE_URL`: preferred long-term name for the Railway backend origin. If both are present, `VITE_API_BASE_URL` wins.
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key.

Railway:

- `NODE_ENV`: should be `production` for deployed production.
- `FRONTEND_URL`: currently present; must exactly represent the Vercel frontend origin. Trailing slash is now tolerated.
- `CLIENT_URL`: optional alias also supported by CORS and cookie deployment detection.
- `DATABASE_URL`: Railway Postgres connection string.
- `ADMIN_EMAIL`: admin credential email.
- `ADMIN_PASSWORD_HASH`: bcrypt hash for admin password and fallback session signing key.
- `ADMIN_SESSION_SECRET`: optional but recommended dedicated admin session signing secret.
- `STRIPE_SECRET_KEY`: Stripe secret key.
- `PORT`: usually provided by Railway.

No secret values should be committed or copied into docs.

### Verification Commands and Results

Passed:

```bash
cd server
node --input-type=module <deployed-style auth smoke script>
```

Result:

```json
{
  "loginStatus": 200,
  "loginSuccess": true,
  "hasHttpOnly": true,
  "hasSecure": true,
  "hasSameSiteNone": true,
  "hasPathRoot": true,
  "meStatus": 200,
  "meAuthenticated": true,
  "corsOrigin": "https://frontend.example.test",
  "corsCredentials": "true"
}
```

Passed:

```bash
cd server
node --input-type=module <local auth service smoke script>
```

Result:

```json
{
  "hasSessionToken": true,
  "tokenAuthenticates": true,
  "localSameSite": "lax",
  "localSecure": false
}
```

Passed:

```bash
cd client
npm run build
```

Result: Vite production build completed.

Passed:

```bash
cd server
npm run build
```

Result: Prisma Client generated.

Passed:

```bash
cd server
node --check src/app.js
node --check src/domains/auth/services/auth.service.js
node --check src/domains/auth/routes/auth.routes.js
node -e "import('./src/app.js').then(() => console.log('app import ok'))"
```

Result: syntax checks passed and app import printed `app import ok`.

Passed:

```bash
cd client
VITE_API_URL=https://api.example.test npm run build
rg -o "https://api\\.example\\.test|localhost:3000|localhost:5173|doggy-ent\\.vercel\\.app" dist
```

Result: build passed and the placeholder API origin was baked in when `VITE_API_URL` was supplied. The final normal build did not contain the placeholder origin, `localhost:3000`, or `doggy-ent.vercel.app`.

Not available:

- No client lint script exists.
- No server lint script exists.
- No client or server test script exists.

### Manual Redeploy Steps

1. Redeploy Railway with the updated server auth code.
2. Ensure Railway has `FRONTEND_URL` set to the Vercel frontend origin. `CLIENT_URL` may also be set but is not required if `FRONTEND_URL` is correct.
3. Optionally add Railway `ADMIN_SESSION_SECRET` as a dedicated signing secret.
4. Redeploy Vercel if the admin login client change or API env variables changed.
5. Confirm Vercel still has either `VITE_API_URL` or `VITE_API_BASE_URL` pointing to the Railway backend origin without a trailing `/api`.

### Manual QA Checklist

- Visit `/admin` directly on Vercel while logged out.
- Confirm redirect to `/admin/login?redirect=/admin`.
- Log in with admin credentials.
- Confirm the login request returns `Set-Cookie` for `doggy_admin_session` with `HttpOnly`, `Secure`, and `SameSite=None`.
- Confirm the immediate `/api/auth/me` request returns `200` and `{ authenticated: true }`.
- Confirm the app redirects to `/admin`.
- Refresh `/admin` and confirm the session remains valid.
- Open admin products, promos, campaigns, orders, and order detail pages.
- Log out and confirm `/api/auth/me` returns unauthenticated.
- Confirm checkout, Stripe payment, order creation, product browsing, promo validation, and campaign preview still work after redeploy.

### Remaining Risks

- This is still the custom admin auth system. Better Auth is the future Accounts + Loyalty phase, not part of this fix.
- Signed cookie sessions cannot be force-revoked globally without rotating `ADMIN_SESSION_SECRET` or `ADMIN_PASSWORD_HASH`; logout clears the browser cookie.
- Admin role modeling is still minimal and should be replaced by role/permission-aware auth during the future Better Auth migration.
- Deployed manual QA is still required because browser cookie policies and Railway/Vercel env values must be verified in the real deployment.

### Recommended Next Phase

After deployed admin auth is stable, run a narrow admin CRUD QA pass across products, promos, campaigns, orders, and order detail. Better Auth should wait until the later customer accounts and loyalty phase.

## 23. Superseded Temporary Local Admin Data Target Workflow - 2026-06-05

This section was intentionally replaced. It previously described a local frontend calling the Railway backend directly, which still causes cross-site admin cookie problems in Safari. Use section 24 instead: local client -> local backend -> selected database.

## 24. Corrected Temporary Local Backend Data Target Workflow - 2026-06-06

This section replaces the superseded section 23 workflow.

### Root Cause

The prior temporary Railway admin workflow used:

```text
local client/admin -> Railway backend -> Railway DB
```

That still makes the browser send admin auth cookies across sites from localhost to the Railway backend, which can fail in Safari. The corrected workflow keeps browser admin auth same-site/local by always sending admin CRUD requests to the local backend.

Correct temporary Railway DB workflow:

```text
local client/admin -> local backend -> Railway DB -> Vercel storefront sees changes
```

### Corrected Mode Table

| Mode | Client command | Server command | Browser API target | Server DB target | Badge |
| --- | --- | --- | --- | --- | --- |
| Fully local | `cd client && npm run dev:local` | `cd server && npm run dev:local` | local backend | local DB from `server/.env` | `LOCAL DATA TARGET` |
| Railway DB admin | `cd client && npm run dev:local` | `cd server && npm run dev:railway` | local backend | Railway DB from `server/.env.railway.local` | `RAILWAY DB TARGET` |

`client npm run dev:railway` remains a safe local-backend alias for compatibility, but the expected Railway DB admin workflow uses `client npm run dev:local` plus `server npm run dev:railway`.

### Scripts

Client scripts:

```json
{
  "dev:local": "VITE_ADMIN_DATA_TARGET=LOCAL VITE_API_BASE_URL=http://localhost:3000 VITE_API_URL=http://localhost:3000 vite --mode admin-local",
  "dev:railway": "VITE_ADMIN_DATA_TARGET=RAILWAY_DB VITE_API_BASE_URL=http://localhost:3000 VITE_API_URL=http://localhost:3000 vite --mode railway"
}
```

Both client scripts point browser requests to the local backend at `http://localhost:3000`.

Server scripts:

```json
{
  "dev:local": "DOGGY_SERVER_ENV_TARGET=LOCAL node --watch src/server.js",
  "dev:railway": "DOGGY_SERVER_ENV_TARGET=RAILWAY_DB DOGGY_SERVER_ENV_FILE=.env.railway.local node --watch src/server.js"
}
```

### Env Loading

Server env loading source of truth:

- `server/src/config/env.js`
- `server/src/server.js`

Behavior:

- Base env always loads from `server/.env`.
- Railway DB mode then loads `server/.env.railway.local` with override enabled.
- `server/.env` remains the normal local server -> local DB env and should not be overwritten or repurposed for Railway mode.
- `server/.env.railway.local` must contain `DATABASE_URL`; otherwise `npm run dev:railway` fails closed so it cannot accidentally use the local DB.

Required local-only server variable names for `server/.env.railway.local`:

```text
DATABASE_URL
FRONTEND_URL
ADMIN_EMAIL
ADMIN_PASSWORD_HASH
STRIPE_SECRET_KEY
ADMIN_SESSION_SECRET
```

`ADMIN_SESSION_SECRET` is optional but recommended.

Required client variable names are set by `npm run dev:local`; no Railway URL is needed in the browser for this corrected workflow.

### Gitignore / Secret Safety

`.gitignore` covers local-only env files:

```text
.env.local
.env.*.local
client/.env.railway.local
server/.env.railway.local
```

No `.env.example` files were created.

No real `DATABASE_URL`, admin hash, Stripe secret, Railway URL, or session secret should be documented or committed.

### Admin Badge

The dashboard badge is now server-informed:

- `client/src/domains/admin/components/AdminDataTargetBadge.vue` starts from the client startup fallback.
- It then calls local backend `GET /api/auth/data-target`.
- `server/src/domains/auth/routes/auth.routes.js` returns the authenticated server data target.
- `server/src/config/env.js` reports either `LOCAL DATA TARGET` or `RAILWAY DB TARGET`.

This means the badge reflects the local backend database target, not a browser-to-Railway API target.

### Verification Results

Initial required commands were run:

```bash
git status
git diff --stat
git diff --name-status
```

At the start of this pass, only `AGENTS.md` was modified.

Client script verification:

```bash
cd client
npm run dev:local -- --host 127.0.0.1 --port 5177 --strictPort
```

Result:

- Vite started in `admin-local` mode.
- Transformed client helper contained `VITE_ADMIN_DATA_TARGET=LOCAL`.
- Transformed client helper contained `http://localhost:3000`.
- It did not contain a placeholder Railway/backend origin.

```bash
cd client
npm run dev:railway -- --host 127.0.0.1 --port 5178 --strictPort
```

Result:

- Vite started in `railway` mode.
- Transformed client helper contained `VITE_ADMIN_DATA_TARGET=RAILWAY_DB`.
- Transformed client helper contained `http://localhost:3000`.
- It did not contain a placeholder Railway/backend origin.

Server env verification:

```bash
cd server
node --input-type=module <local env loader check>
```

Result:

```json
{
  "loadedTarget": "LOCAL",
  "reportedTarget": "LOCAL",
  "hasDatabaseUrl": true
}
```

```bash
cd server
node --input-type=module <railway env loader check>
```

Current result:

```json
{
  "railwayModeAccepted": false,
  "reason": "Railway DB mode requires DATABASE_URL in .env.railway.local so it cannot accidentally use the local database."
}
```

This is expected until `server/.env.railway.local` is populated with a Railway `DATABASE_URL`.

Placeholder override verification:

```bash
cd server
DOGGY_SERVER_ENV_TARGET=RAILWAY_DB DOGGY_SERVER_ENV_FILE=<temporary-placeholder-env> node --input-type=module <env loader check>
```

Result:

```json
{
  "loadedTarget": "RAILWAY_DB",
  "reportedTarget": "RAILWAY_DB",
  "hasDatabaseUrl": true,
  "isPlaceholderDatabase": true
}
```

Protected badge endpoint verification:

```bash
cd server
node --input-type=module <auth data-target smoke script>
```

Result:

```json
{
  "loginStatus": 200,
  "dataTargetStatus": 200,
  "dataTargetCode": "RAILWAY_DB",
  "dataTargetLabel": "RAILWAY DB TARGET"
}
```

Server script verification:

```bash
cd server
npm run dev:local
```

Result:

- Server started on port `3000`.

```bash
cd server
npm run dev:railway
```

Current result:

- Failed closed because `server/.env.railway.local` does not currently provide `DATABASE_URL`.
- This prevents accidental local DB writes while the server is labeled as Railway DB mode.

Build and syntax verification:

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
node --check src/config/env.js
node --check src/server.js
node --check src/domains/auth/routes/auth.routes.js
node --check src/domains/auth/services/auth.service.js
node -e "import('./src/app.js').then(() => console.log('app import ok'))"
```

Result: passed.

### Manual Setup

Fully local:

```bash
cd server
npm run dev:local
```

```bash
cd client
npm run dev:local
```

Railway DB admin:

1. Populate local-only `server/.env.railway.local` with the required variable names listed above.
2. Start local backend in Railway DB mode:

```bash
cd server
npm run dev:railway
```

3. Start local client in local-backend mode:

```bash
cd client
npm run dev:local
```

### Manual QA Checklist

Fully local:

- Log in at local `/admin`.
- Confirm badge shows `LOCAL DATA TARGET`.
- Create or edit a harmless product/promo/campaign.
- Confirm it affects local DB only.

Railway DB admin:

- Log in at local `/admin`.
- Confirm browser network requests go to `http://localhost:3000/api/...`, not Railway backend.
- Confirm badge shows `RAILWAY DB TARGET`.
- Create or edit a small test product/promo/campaign.
- Confirm Railway DB changes are visible to the Vercel storefront.
- Confirm admin products, promos, campaigns, orders, and order detail still load.

### Remaining Risks

- `server/.env.railway.local` currently must be populated before Railway DB mode can start.
- This temporary workflow can modify Railway data from local admin; verify the badge before saving.
- This is still custom admin auth. Better Auth remains future Accounts + Loyalty work.
- Long-term preferred setup remains an owned domain plus API subdomain, then Better Auth for accounts, loyalty, roles, and permissions.

## 22. Storefront Interaction Repair And Architecture Docs Pass - 2026-06-06

### Scope

This pass focused on verified storefront interaction bugs, a narrow promo Railway DB admin repair, and full architecture/data-flow documentation. It did not redesign the storefront or admin UI, did not migrate auth to Better Auth, and did not commit or push.

### Initial Repository State Commands

Required commands were run before editing:

```bash
git status
git diff --stat
git diff --name-status
```

Observed state:

- Branch: `dev-main`.
- Existing uncommitted edits from prior local admin workflow work were present in `AGENTS.md`, `PROJECT_HANDOFF.md`, `client/package.json`, admin badge/API helper files, server auth/env files, and `server/src/config/`.
- This pass preserved those existing edits and added only focused storefront, promo, docs, and handoff changes.

### Bugs Fixed

Product card variant add-to-cart:

- Root cause: `client/src/domains/cart/composables/useCart.js` preferred `product.size` over the explicit `selectedSize` argument. Product card add-to-cart passes the selected card size separately, so a product object with a default/root size such as `18 oz` could override the user's selected `6 oz`.
- Fix: `useCart.addToCart(product, selectedSize)` now treats `selectedSize` as the source of truth before falling back to `product.size`.
- Fix: cart item price resolution now prefers the matched selected variant price before falling back to product-level price.
- Expected result: product-card `6 oz` adds `6 oz`; product-card `18 oz` adds `18 oz`; quick view remains correct because it already emits selected size.

Featured product click targets:

- Root cause: `client/src/domains/storefront/Home/sections/ProductSpotlightSection.vue` imported `useRouter`, defined `navigateToProduct()`, and attached click handlers/cursor styling to the featured image container and title.
- Fix: removed the router dependency, navigation function, click handlers, and clickable cursor/hover affordances from the featured image and title.
- Expected result: featured image/title are no longer clickable; size buttons and Add to Cart still work.

Promo Railway DB admin repair:

- Root cause: `server/src/domains/promos/repositories/promos.repository.js` sorted `Promo` rows by `redeemedAt`, but `redeemedAt` exists on `PromoUsage`, not `Promo`.
- Fix: promo list sorting now uses `Promo.updatedAt`.
- Root cause: promo admin date/time values could arrive as datetime-local strings such as `2026-06-05T11:00`; Prisma DateTime writes are safer when normalized.
- Fix: `server/src/domains/promos/services/promos.service.js` now normalizes optional `startsAt` and `endsAt` values to ISO strings and throws a `400` error for invalid date/time values.

### Architecture Docs Created

Created:

- `docs/architecture/README.md`: high-level system overview, mode table, source-of-truth locations, and doc index.
- `docs/architecture/data-flow.md`: end-to-end flows for product load, product card add-to-cart, quick view, featured product, checkout/payment, promos, campaigns, orders, Railway DB admin mode, and future Better Auth.
- `docs/architecture/file-map.md`: important file and folder inventory covering `client/src`, `server/src`, `server/prisma`, and root config/docs.
- `docs/architecture/database.md`: Prisma model ownership, relationships, migration notes, and data source modes.
- `docs/architecture/admin.md`: admin route architecture, auth, badge, temporary local/Railway DB workflow, env variable names, and QA checklist.
- `docs/architecture/auth-roadmap.md`: current custom admin auth, temporary local admin modes, same-site domain direction, and future Better Auth/customer accounts plan.

Mermaid diagrams included:

- Overall system architecture.
- Checkout/payment sequence.
- Local admin to local server to Railway DB.
- Future Better Auth/customer/admin account flow.

Existing older docs under `docs/architecture/diagram.md` and `docs/architecture/mockdiagram.md` were not removed or deeply audited during this pass.

### Verification Results

Client build:

```bash
cd client
npm run build
```

Result: passed. Vite built 152 modules and produced `dist/` assets.

Server build / Prisma generate:

```bash
cd server
npm run build
```

Result: passed. Prisma Client v6.16.2 generated successfully.

Server syntax checks:

```bash
cd server
node --check src/domains/promos/services/promos.service.js
node --check src/domains/promos/repositories/promos.repository.js
```

Result: passed.

Cart variant source-of-truth smoke:

```bash
cd client
node --input-type=module <cart variant source-of-truth smoke script>
```

Result: passed. The script verified:

- A product object with root `size: "18 oz"` plus selected card size `6 oz` adds `6 oz`.
- Product-card selected `18 oz` adds `18 oz`.
- Quick-view-style selected `6 oz` payload still adds `6 oz`.
- Cart price comes from the selected variant.

Docs Markdown/Mermaid checks:

```bash
node --input-type=module <architecture markdown fence check>
rg -n mermaid docs/architecture/README.md docs/architecture/data-flow.md docs/architecture/admin.md docs/architecture/auth-roadmap.md
```

Result: passed. All new architecture doc code fences are balanced, and Mermaid fences are present in the required docs.

Environment/secret hygiene:

```bash
find . -name '.env.example' -print
rg -n <secret-value-patterns> docs PROJECT_HANDOFF.md client/src server/src --glob '!server/src/generated/**'
```

Result:

- No `.env.example` files found.
- No secret-looking values found in deliverable docs/source. Only variable names and placeholder descriptions are documented.

Featured product source check:

```bash
rg -n "useRouter|navigateToProduct|@click=\"navigateToProduct\"|cursor-pointer.*featuredProduct|featuredProduct.*cursor-pointer" client/src/domains/storefront/Home/sections/ProductSpotlightSection.vue
```

Result: no matches, confirming the image/title navigation hook was removed.

Whitespace diff check:

```bash
git diff --check
```

Result: passed.

Lint scripts:

- No `lint` script is present in `client/package.json` or `server/package.json`; no lint command was invented.

### Remaining Risks And Unverified Areas

- Full browser manual QA is still required for product card `6 oz` and `18 oz`, quick view, featured Add to Cart, cart drawer display, and checkout preview because this pass used build plus a targeted source-of-truth smoke test rather than a live browser session.
- Promo create/edit against an actual Railway DB in local server Railway DB mode still needs manual QA with `server/.env.railway.local` populated; the repository fix addresses the verified schema/code mismatch and DateTime normalization.
- Checkout/payment flows built successfully but were not re-run end-to-end in Stripe during this pass.
- Better Auth remains future work. Current admin auth is still the custom session system.

### Manual QA Checklist

Storefront:

- Open storefront product grid.
- Select `6 oz` on a product card and click Add to Cart; confirm cart drawer shows `6 oz` and selected-variant price.
- Remove item.
- Select `18 oz` on the same product card and click Add to Cart; confirm cart drawer shows `18 oz` and selected-variant price.
- Repeat both checks from quick view.
- Confirm featured product image and title do not navigate or behave as clickable elements.
- Confirm featured size buttons still update price/stock label.
- Confirm featured Add to Cart still adds the selected variant.
- Continue to checkout and confirm preview totals match selected variants.

Railway DB admin promos:

- Start `cd server && npm run dev:railway` after configuring local-only `server/.env.railway.local`.
- Start `cd client && npm run dev:local`.
- Confirm admin badge says `RAILWAY DB TARGET`.
- Open admin promos.
- Create a promo with start/end date/time values.
- Edit the promo.
- Confirm no Prisma `redeemedAt` or invalid DateTime errors appear.
- Test promo validation through checkout preview if applicable.

### Next Recommended Step

Run the manual storefront and Railway DB admin QA checklist, then perform a final launch-readiness pass on checkout/payment in a real browser with Stripe test mode.

## 23. Order Completeness, Donation Traceability, Campaign Attribution, Success UX - 2026-06-06

### Scope

This pass fixed verified order/donation data gaps and improved the post-checkout success page. It did not rebuild checkout, redesign admin, migrate auth to Better Auth, commit, push, or expose secrets.

### Initial Commands

Required state checks were run before editing:

```bash
git status
git diff --stat
git diff --name-status
```

The working tree already contained uncommitted accepted work from prior admin/local workflow/storefront/docs passes. This pass preserved those edits.

### Root Causes Found

Admin order list donation showed `$0.00` because `AdminOrderCard.vue` hardcoded the donation display to `0`, and the server order response did not include an order-level donation amount.

Campaign/order attribution could not be answered from the old schema. `Campaign` only stored aggregate counters: `donationGenerated`, `revenueGenerated`, and `orderCount`. `Order` had no donation field, and there was no join/usage table between orders and campaigns. Existing aggregate counters were insufficient for “which orders contributed to which campaign,” especially after campaign product links change.

Admin order detail was too thin because it only rendered a small subset of the order response: raw id, status, items, subtotal, total, and basic customer fields.

The success page used the route parameter directly as the displayed reference and did not fetch order details. Checkout cleared the cart after success, so the `View Cart` button led to an empty or inappropriate post-checkout path.

### Schema Decision

A schema change was needed. The current schema could not safely persist order-to-campaign attribution.

Added model:

- `OrderCampaignUsage`

Fields:

- `orderId`
- `campaignId`
- `donationAmount`
- `eligibleSubtotal`
- `matchedProductIds`
- timestamps

Safety:

- `@@unique([orderId, campaignId])` prevents normal checkout retries from recording the same order/campaign contribution twice.
- Foreign keys cascade when an order or campaign is deleted.

Migration:

- `server/prisma/migrations/20260606000000_add_order_campaign_usage/migration.sql`

Local status:

- Applied locally with `npx prisma migrate dev`.
- `npx prisma migrate status` reported the local schema is up to date.

Railway status:

- Not applied automatically.
- Required Railway step: `cd server && npx prisma migrate deploy` after confirming the intended Railway database target.

Historical limitation:

- Existing orders created before this migration do not automatically gain attribution rows. They may have aggregate campaign stats without order-level traceability.

### Fixes Made

Server:

- `server/prisma/schema.prisma` now includes `OrderCampaignUsage` and relations from `Order` and `Campaign`.
- `server/src/domains/checkout/services/checkout.service.js` records campaign attribution after order creation using trusted checkout preview campaign rows.
- `server/src/domains/campaigns/repositories/campaigns.repository.js` records attribution and aggregate campaign stat increments in one transaction.
- `server/src/domains/campaigns/services/campaigns.service.js` supports order-aware campaign usage while preserving old aggregate-only fallback behavior.
- `server/src/domains/campaigns/mappers/campaigns.mapper.js` maps recent attributed orders for admin campaign responses.
- `server/src/domains/orders/repositories/orders.repository.js` includes campaign usages in order reads, computes order donation stats, reads promo usage for order detail/customer confirmation, and supports customer-safe lookup by reference.
- `server/src/domains/orders/mappers/orders.mapper.js` maps `donationAmount`, campaign attributions, promo usage, friendly customer reference, and customer-safe order responses.
- `server/src/domains/orders/services/orders.service.js` adds same-customer order summaries and customer-safe order lookup.
- `server/src/domains/checkout/controllers/checkout.controller.js` and `routes/checkout.routes.js` add `GET /api/checkout/orders/:reference`.

Client:

- `client/src/domains/admin/components/AdminOrderCard.vue` now shows friendly order reference and server-provided donation amount.
- `client/src/domains/admin/views/AdminOrderDetailView.vue` now shows full order detail: reference, internal id, items/variants/SKUs, customer, shipping, pricing, promo usage, donation/campaign attribution, Stripe PaymentIntent id for admin, status controls, timestamps, and same-customer orders.
- `client/src/domains/admin/components/AdminCampaignsTable.vue` shows recent attributed orders when campaign attribution data exists.
- `client/src/domains/checkout/api/checkout.api.js` adds `fetchCheckoutOrder(reference)`.
- `client/src/domains/checkout/views/CheckoutView.vue` redirects to the friendly order number when available.
- `client/src/domains/checkout/views/OrderSuccessView.vue` fetches customer-safe order details, shows items/pricing/donation/fulfillment/confirmation copy, and removes the stale `View Cart` button.

Docs:

- `docs/architecture/database.md` documents `OrderCampaignUsage`.
- `docs/architecture/data-flow.md` documents campaign attribution and order success flows.
- `docs/architecture/file-map.md` includes the new migration and repository responsibility.
- `docs/architecture/admin.md` documents enhanced order detail and campaign attribution behavior.

### Verification

Server build / Prisma generate:

```bash
cd server
npm run build
```

Result: passed. Prisma Client v6.16.2 generated successfully.

Server syntax checks:

```bash
cd server
node --check src/domains/campaigns/services/campaigns.service.js
node --check src/domains/campaigns/repositories/campaigns.repository.js
node --check src/domains/campaigns/mappers/campaigns.mapper.js
node --check src/domains/orders/repositories/orders.repository.js
node --check src/domains/orders/services/orders.service.js
node --check src/domains/orders/mappers/orders.mapper.js
node --check src/domains/checkout/controllers/checkout.controller.js
node --check src/domains/checkout/routes/checkout.routes.js
node --check src/domains/checkout/services/checkout.service.js
```

Result: passed.

Client build:

```bash
cd client
npm run build
```

Result: passed.

Order mapper smoke:

```bash
cd server
node --input-type=module <order mapper smoke script>
```

Result: passed. Verified admin mapping includes donation/campaign attribution and customer-safe mapping omits internal id and Stripe PaymentIntent id.

Migration verification:

```bash
cd server
npx prisma migrate status
```

Initial result: new migration pending locally.

```bash
cd server
npx prisma migrate dev
```

Result: applied `20260606000000_add_order_campaign_usage` locally and regenerated Prisma Client.

```bash
cd server
npx prisma migrate status
```

Final result: local database schema is up to date.

### Manual QA Still Required

- In Railway DB admin mode, run `npx prisma migrate deploy` on Railway after confirming the intended DB target.
- Complete a checkout that has a campaign donation.
- Confirm the new order redirects to `/order-success/<friendly order number>`.
- Confirm success page shows items, selected variants, subtotal, discount, shipping, tax, donation, and total.
- Confirm success page does not show raw internal order id or Stripe PaymentIntent id.
- Confirm `View Cart` is gone and Continue Shopping works.
- Confirm admin orders list shows the donation amount for the new order.
- Confirm admin order detail shows pricing, promo usage if applicable, campaign attribution, customer/shipping/payment/admin details, and similar customer orders.
- Confirm admin campaigns show recent attributed orders for the campaign.
- Confirm products, promos, campaigns, and orders still load in local client to local server to Railway DB mode after Railway migration deploy.

### Remaining Risks

- Historical orders before `OrderCampaignUsage` will not have order-level campaign attribution unless backfilled manually.
- Campaign aggregate counters may include old donations that cannot be tied to specific historical orders.
- Stripe end-to-end checkout was not rerun during this pass; builds and mapper checks passed, but browser payment QA remains required.
- Railway migration was intentionally not applied automatically.

### Safe For Commit Review

The local changes are build-verified and locally migration-verified, but the working tree contains multiple accepted uncommitted phases. Review should consider all existing local edits together before committing.

## 2026-06-07 Focused Checkout, Orders, And Documentation Verification Pass

This pass focused only on promo validation, promo/campaign calculation edge cases, admin order status workflow, future-proof order status history, touched-domain maintainability, and architecture documentation rendering. It did not redesign the storefront or admin UI, did not migrate to Better Auth, did not commit, and did not push.

### Starting Repository State

The pass began by reading `AGENTS.md` and this handoff, then running:

```bash
git status --short
git diff --stat
git diff --name-status
```

Observed state: the working tree already contained local edits from the active repair/refactor work, including `AGENTS.md` changes and drafted checkout/orders/promo/status-history edits. The `AGENTS.md` changes were pre-existing in this pass and were not reverted.

### Promo Validation Fixes

Root causes:

- The checkout promo composable allowed promo validation before a customer email existed.
- Client promo validation and checkout submission did not consistently lowercase email before sending it to the server.
- Server promo validation skipped per-customer usage enforcement when `customerEmail` was absent, which could bypass one-per-email style rules during validation.
- Changing the checkout email after applying a promo could leave the promo attached to a different email than the one that was validated.

Fixes:

- `client/src/domains/checkout/composables/useCheckoutPromos.js` now requires email before promo validation, normalizes customer email with trim/lowercase, sends the normalized email to `/api/promos/validate`, and clears the applied promo if email changes after validation.
- `client/src/domains/promos/api/promos.api.js` normalizes validation emails before sending API payloads.
- `client/src/domains/checkout/api/checkout.api.js` normalizes checkout customer email before checkout preview/final submission.
- `server/src/domains/promos/services/promos.service.js` now requires normalized email for promo validation, uses normalized email for assigned-email and per-customer usage checks, stores normalized email for usage records, and rechecks per-customer limits inside the promo usage transaction.
- `server/src/domains/checkout/services/checkout.service.js` passes normalized email into preview/final promo validation and promo usage recording.

Verified from code:

- Promo discounts and campaign donations remain separate server-owned checkout calculations.
- Checkout totals remain server-owned in `server/src/domains/checkout/services/checkout.service.js` and `server/src/domains/checkout/utils/checkoutPricing.js`.
- Promo usage is still recorded after the order is created, so customer-facing checkout does not fail after payment/order creation if promo usage persistence fails. This is intentional existing behavior but remains a future robustness risk.

### Admin Order Status Workflow And History

Root causes:

- Admin order detail previously used an instant-persist dropdown, so selecting a status immediately saved.
- There was no status history table or API response shape for future admin auditability.

Fixes:

- `client/src/domains/admin/components/AdminOrderStatusPanel.vue` was added. It shows current status, last updated timestamp, last status change, a staged next-status select, optional note, Save, Cancel, and status history.
- `client/src/domains/admin/views/AdminOrderDetailView.vue` now delegates status editing to `AdminOrderStatusPanel.vue`.
- `client/src/domains/admin/api/adminOrders.api.js` now sends `{ status, note }` for status updates.
- `server/prisma/schema.prisma` adds `OrderStatusHistory`.
- `server/prisma/migrations/20260607000000_add_order_status_history/migration.sql` adds the status history table and indexes.
- `server/src/domains/orders/repositories/orders.repository.js` includes status history on order reads and creates a history row transactionally when status changes.
- `server/src/domains/orders/services/orders.service.js` validates status, normalizes notes, and records temporary actor metadata as `changedByType: ADMIN_ENV` and `changedBy: ADMIN_ENV`.
- `server/src/domains/orders/controllers/orders.controller.js` accepts the note field.
- `server/src/domains/orders/mappers/orders.mapper.js` maps `statusHistory` and `lastStatusChange`.

Migration status:

- Local migration `20260607000000_add_order_status_history` was applied with `npx prisma migrate dev`.
- Local `npx prisma migrate status` reports the schema is up to date.
- Railway was not migrated automatically. Required Railway step after review: `cd server && npx prisma migrate deploy`.

### Documentation Fixes

Docs updated:

- `docs/architecture/README.md`
- `docs/architecture/data-flow.md`
- `docs/architecture/database.md`
- `docs/architecture/admin.md`
- `docs/architecture/file-map.md`
- `docs/architecture/diagram.md`

Rendering root cause:

- Mermaid CLI rendering did not find syntax-invalid Mermaid in the architecture docs. All blocks rendered successfully.
- The verified documentation problem was stale architecture content, especially `docs/architecture/diagram.md` referring to temporary in-memory product data. That file now reflects the current Prisma-backed architecture.

Mermaid verification command shape:

```bash
rm -rf /tmp/doggy-mermaid-check
mkdir -p /tmp/doggy-mermaid-check
node --input-type=module <extract mermaid blocks from docs/architecture/*.md>
npx -y @mermaid-js/mermaid-cli -i <each extracted .mmd> -o <svg> -b transparent
```

Result: passed. Fourteen Mermaid blocks rendered to non-empty SVG files in `/tmp/doggy-mermaid-check`.

### File Organization Audit

Domains audited in this pass:

- Products
- Promos
- Campaigns
- Checkout
- Orders

Findings:

- Client APIs remain separated from UI.
- Checkout promo behavior lives in a composable and API wrapper, not the view.
- Admin order status UI is now a component, while `AdminOrderDetailView.vue` remains the route orchestration layer.
- Server orders code still follows route -> controller -> service -> repository -> mapper.
- Server promos code remains the largest touched file at roughly 532 lines. It is still a domain service with cohesive promo lifecycle/validation/usage responsibilities, so no broad refactor was done in this focused pass.
- `server/src/domains/orders/repositories/orders.repository.js` is roughly 337 lines and now owns status-history database access in addition to order reads/writes. It remains repository-specific but should get automated tests before further extraction.

### Verification Commands And Results

Client build:

```bash
cd client
npm run build
```

Result: passed. Vite built 153 modules and generated production assets.

Server build / Prisma generate:

```bash
cd server
npm run build
```

Result: passed. Prisma Client v6.16.2 generated successfully.

Server syntax/import checks:

```bash
cd server
node --check src/domains/orders/repositories/orders.repository.js
node --check src/domains/orders/services/orders.service.js
node --check src/domains/orders/controllers/orders.controller.js
node --check src/domains/orders/mappers/orders.mapper.js
node --check src/domains/promos/services/promos.service.js
node --check src/domains/checkout/services/checkout.service.js
```

Result: passed.

Prisma migration status:

```bash
cd server
npx prisma migrate status
```

Result after local migration: database schema is up to date.

Whitespace/diff check:

```bash
git diff --check
```

Result: passed.

Environment/secrets policy checks:

```bash
find . -name '.env.example' -print
rg -n 'sk_live|rk_live|whsec_|postgres://|postgresql://|DATABASE_URL=|STRIPE_SECRET_KEY=|ADMIN_PASSWORD_HASH=' --glob '!node_modules/**' --glob '!client/dist/**' .
```

Result: no `.env.example` files found. Secret scan found only placeholder variable-name examples in `AGENTS.md`, not real secret values.

Lint/test script status:

- Client package has no `lint` or `test` scripts.
- Server package has no `lint` or `test` scripts.
- No scripts were invented.

### Remaining Risks

- Railway still needs `npx prisma migrate deploy` for `20260607000000_add_order_status_history` before deployed admin order status history can persist.
- Promo usage recording still happens after order creation; if usage persistence fails after a paid order, counters can underreport. A stronger future design would reserve/record promo usage within a more explicit checkout transaction model.
- Per-customer promo usage checks are now normalized and rechecked during usage recording, but high-concurrency max-usage edge cases still need automated tests.
- No automated tests exist for promo validation, promo + campaign coexistence, Stripe checkout, inventory decrement, or status history.
- Browser/manual QA is still required to confirm the visible admin Save/Cancel workflow and checkout promo behavior.

### Manual QA Checklist

Promo/checkout:

- Start local client/server.
- Enter a promo code before email and confirm validation refuses with an email-required message.
- Enter an email with uppercase/extra spaces, apply a one-per-email promo, and confirm validation succeeds/fails according to normalized email usage.
- Change the email after a promo is applied and confirm the promo clears and totals update.
- Apply a valid promo with a campaign-eligible cart item and confirm discount and donation both display.
- Complete Stripe test checkout and confirm server-owned totals, promo usage, campaign attribution, inventory, and order success page.

Admin orders:

- Open admin order detail.
- Select a different status and click Cancel; confirm no status change persists.
- Select a different status and click Save; confirm current status updates and status history gains a row.
- Add a note and confirm it appears in history only after a status change.
- Confirm last updated and last status change timestamps are visible.

Docs:

- Open `docs/architecture/README.md`, `data-flow.md`, `database.md`, `admin.md`, `file-map.md`, and `auth-roadmap.md` in a Markdown renderer that supports Mermaid.

Deployment:

- Apply Railway migrations with `cd server && npx prisma migrate deploy` after confirming target DB.
- Redeploy Railway and Vercel if needed.
- Confirm Vercel checkout, Stripe test payment, order creation, and admin order detail after migration.

### Current Git State Notes

Changed files from this focused pass include client checkout/promo/admin-order files, server checkout/promo/order files, Prisma schema/migration, and architecture docs. `AGENTS.md` is also modified in the working tree from prior accepted edits and should be reviewed with the full local diff.

### Next Recommended Phase

After manual QA and Railway migration review, add focused automated tests for checkout pricing, promo validation/usage limits, promo + campaign coexistence, order status history, and idempotent Stripe order creation. Better Auth remains future customer accounts/loyalty/admin-user work and was intentionally not started here.

## 2026-06-07 Promo Discount Repair, Campaign Analytics, And Tiered Tests

This pass followed the tiered automated testing requirement already present in `AGENTS.md`. No commit or push was performed. The pass did not redesign checkout or admin, did not call real Stripe/Railway/Vercel from tests, and did not expose secret values.

### Starting Git State

Commands run before application-code edits:

```bash
git status
git diff --stat
git diff --name-status
```

Observed state: only `AGENTS.md` was modified at the start of this pass. Earlier handoff sections described prior local edits, but the actual working tree at the start of this pass did not contain those app-code edits.

### Root Cause Investigation

Local database check for `CHASE20` showed:

- `code`: `CHASE20`
- `status`: `ACTIVE`
- `discountType`: `FIXED`
- `discountValue`: `20`
- `minimumSubtotal`: `30`

Local validation smoke for `CHASE20` with a `$100` subtotal returned a `$20` discount, so the current local DB row did not reproduce the reported `$0.00` bug.

The verified code-level failure class was percent promo value interpretation:

- Server promo math treated percent promos as `discountValue / 100`.
- That is correct when the stored value is `20`.
- If an existing/deployed promo stores `0.20` to mean 20%, the old calculation became `0.20 / 100 = 0.002`, or 0.2%.
- On small subtotals, that tiny discount can round/display as `$0.00` across checkout, promo tester, promo analytics, order detail, order success, and usage history because every downstream flow uses the calculated `discountAmount`.

### Fixes Made

Promo discount repair:

- `server/src/domains/promos/services/promos.service.js`
  - Added `normalizePromoDiscountValue`.
  - Percent promos now accept both canonical values such as `20` and legacy fractional values such as `0.20`.
  - Fixed-dollar promos still use dollar amounts and still cap at subtotal.

Shared money safety:

- `server/src/shared/utils/money.js`
  - `normalizeCurrencyAmount` now returns `0` for non-finite values instead of `NaN`.

Campaign analytics:

- No new schema was needed because `OrderCampaignUsage` already supports attribution and campaign responses already expose `orderAttributions`.
- Added `client/src/domains/admin/components/AdminCampaignAnalyticsModal.vue`.
- Wired an Analytics action through:
  - `client/src/domains/admin/components/AdminCampaignsTable.vue`
  - `client/src/domains/admin/components/AdminCampaignsLibrary.vue`
  - `client/src/domains/admin/composables/useAdminCampaigns.js`
  - `client/src/domains/admin/views/AdminCampaignsView.vue`

Campaign Analytics Modal displays:

- Campaign name.
- Orders count.
- Revenue generated.
- Donation generated.
- Average order value.
- Products included.
- Donation rule.
- Date range.
- Recent campaign orders / attribution table with order reference, customer email, subtotal, donation amount, order total, and created date.

### Tiered Test Infrastructure Added

Vitest was added to both client and server.

Root commands:

```bash
npm run test
npm run tiertest1
npm run tiertest2
npm run tiertest3
```

Client commands:

```bash
cd client
npm run test
npm run tiertest1
npm run tiertest2
npm run tiertest3
```

Server commands:

```bash
cd server
npm run test
npm run tiertest1
npm run tiertest2
npm run tiertest3
```

New test folders:

- `server/tests/tier1/promos`
- `server/tests/tier1/checkout`
- `server/tests/tier1/campaigns`
- `server/tests/tier1/payments`
- `server/tests/tier1/orders`
- `server/tests/tier2/admin`
- `server/tests/tier2/orders`
- `server/tests/tier3/utils`
- `client/tests/tier1/cart`
- `client/tests/tier1/checkout`
- `client/tests/tier1/promos`
- `client/tests/tier2/admin`
- `client/tests/tier3/utils`

Tier 1 coverage added:

- Promo percent discounts, including `20` and legacy `0.20`.
- Fixed promo discounts and subtotal caps.
- Minimum subtotal validation.
- Email-required promo validation.
- Normalized email usage limit checks.
- Promo + campaign coexistence at checkout pricing helper level.
- Campaign donation calculations and campaign-linked product matching.
- Stripe PaymentIntent amount uses server preview total.
- Selected variant cart pricing for 6 oz and 18 oz.
- Order status history creation/no-op behavior.

Tier 2 coverage added:

- Campaign analytics attribution mapping.
- Promo analytics discount total mapping.
- Customer-safe order lookup mapping.
- Admin promo payload mapping.
- Admin campaign payload mapping.

Tier 3 coverage added:

- Shared money/string helpers.
- Client campaign/promo formatting helpers.
- Client promo rule normalization.

### Verification Results

Tier 1:

```bash
npm run tiertest1
```

Result: passed.

- Server: 6 files, 20 tests.
- Client: 3 files, 7 tests.

Tier 2:

```bash
npm run tiertest2
```

Result: passed.

- Server: 2 files, 3 tests.
- Client: 1 file, 4 tests.

Tier 3:

```bash
npm run tiertest3
```

Initial result: failed because `normalizeCurrencyAmount('bad')` returned `NaN`. This was fixed in `server/src/shared/utils/money.js`.

Final result: passed.

- Server: 1 file, 3 tests.
- Client: 1 file, 3 tests.

Full suite:

```bash
npm run test
```

Result: passed. Total coverage from this pass: 12 test files and 33 tests.

Builds:

```bash
cd client
npm run build
```

Result: passed. Vite built 154 modules.

```bash
cd server
npm run build
```

Result: passed. Prisma Client v6.16.2 generated.

Syntax checks:

```bash
cd server
node --check src/domains/promos/services/promos.service.js
node --check src/domains/payments/controllers/payment.controller.js
node --check src/shared/utils/money.js
node --check tests/tier1/promos/promo-discounts.test.js
node --check tests/tier1/payments/payment-intent-total.test.js
```

Result: passed.

Promo smoke:

```bash
node --input-type=module <validate CHASE20 and legacy percent smoke>
```

Result:

- Local `CHASE20` with `$100` subtotal: valid, `$20` discount.
- Legacy percent value `0.20` with `$100` subtotal: `$20` discount after fix.

Environment/secrets check:

```bash
find . -name '.env.example' -print
rg -n 'sk_live|rk_live|whsec_|postgres://|postgresql://|DATABASE_URL=|STRIPE_SECRET_KEY=|ADMIN_PASSWORD_HASH=' --glob '!node_modules/**' --glob '!client/dist/**' .
```

Result:

- No `.env.example` files found.
- Matches were placeholder variable-name examples in `AGENTS.md` and this handoff command text, not real secret values.

### Remaining Risks And Coverage Gaps

- The exact deployed/Railway `CHASE20` row was not queried in this pass. The local row is fixed-dollar `$20`; the repaired code protects the likely deployed percent/fraction failure class.
- Automated tests do not perform real Stripe calls, real Railway DB calls, or real browser checkout.
- Promo usage recording still occurs after order creation in the current architecture; tests cover calculation and validation but not concurrent production race conditions.
- Campaign analytics uses the existing `orderAttributions` returned with campaign list data. It does not yet have pagination or a separate detail endpoint.
- No Playwright/browser tests were added.

### Manual QA Checklist

- In admin promos, verify `CHASE20` configuration on the target DB and confirm whether it is `FIXED 20`, `PERCENT 20`, or legacy `PERCENT 0.20`.
- Run the admin promo tester for `CHASE20` with subtotal above minimum and confirm non-zero discount.
- Apply `CHASE20` in checkout after entering email and confirm the checkout summary discount is non-zero.
- Complete Stripe test checkout with promo only and confirm order success, admin order detail, promo usage history, and promo analytics all show the same discount amount.
- Complete Stripe test checkout with LAIKA SHELTER campaign products plus promo and confirm discount and donation both remain visible.
- Open admin campaigns, click Analytics, and confirm attribution table displays recent campaign orders.

### Next Recommended Phase

Run manual browser QA against the actual Railway DB admin workflow and Vercel storefront. Then add narrower integration tests around repository/service transactions using a local test database or an explicit Prisma test database, still avoiding Railway and real Stripe.

---

## 2026-06-12 Better Auth And Customer Accounts Infrastructure Phase

### Objective

Implemented the first Better Auth customer account foundation while preserving:

- Guest checkout.
- Existing storefront UX.
- Existing custom admin dashboard auth and admin pages.
- Existing checkout, Stripe, order, promo, campaign, and admin CRUD behavior.

This phase intentionally did not migrate the admin dashboard from custom admin auth to Better Auth. Customer accounts now use Better Auth on `/api/customer-auth`; admin auth remains on `/api/auth`.

### Dependencies Added

- `better-auth` in `server/package.json`
- `better-auth` in `client/package.json`

No `.env.example` files were created. No secret values were documented.

### Database Models Added

Migration: `server/prisma/migrations/20260612000000_better_auth_customer_accounts/migration.sql`

Schema source of truth: `server/prisma/schema.prisma`

Added:

- `User`
- `Session`
- `Account`
- `Verification`
- `CustomerProfile`
- `CustomerAccountEvent`
- `CustomerSupportRequest`
- `ProductReview`
- `LoyaltyLedger`
- `CustomerNotificationPreference`
- `UserRole`
- `AccountStatus`

Modified:

- `Order.userId String?`
- `Order.user User?`
- indexes for `Order.userId` and `Order.customerEmail`

Local database status:

- `npx prisma migrate dev` applied `20260612000000_better_auth_customer_accounts` locally.
- `npx prisma generate` completed successfully.

Deployment status:

- Railway migration deployment was not performed in this phase.
- Before deploying the app with accounts enabled, run `cd server && npx prisma migrate deploy` against the intended Railway database after confirming the target environment.

### Better Auth Server Configuration

Important files:

- `server/src/domains/auth/services/customerAuth.service.js`
- `server/src/app/middleware/auth/requireCustomerAuth.js`
- `server/src/domains/auth/constants/authRoles.constants.js`
- `server/src/app.js`

Behavior:

- Better Auth is mounted at `/api/customer-auth/*splat` before `express.json()`, matching Better Auth Express requirements.
- Prisma adapter uses the shared Prisma client.
- Email/password auth is enabled.
- Customer sessions persist in the Better Auth `Session` table.
- Public signup role/status fields are configured with `input: false`; public signup should create `CUSTOMER` users only.
- Better Auth creates customer profile, notification preference, and account-created event records after signup.
- Email verification and password reset hooks build payloads through the email abstraction, but no real email provider is active by default.

Environment variable names introduced or used:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `API_BASE_URL`
- `EMAIL_PROVIDER`
- Existing origin allowlist variables: `FRONTEND_URL`, `CLIENT_URL`

### Customer Account API

Protected server routes:

- `GET /api/account`
- `GET /api/account/profile`
- `PUT /api/account/profile`
- `GET /api/account/orders`
- `GET /api/account/orders/:reference`

Important files:

- `server/src/domains/account/routes/account.routes.js`
- `server/src/domains/account/controllers/account.controller.js`
- `server/src/domains/account/services/account.service.js`
- `server/src/domains/account/repositories/account.repository.js`
- `server/src/domains/account/mappers/account.mapper.js`

Behavior:

- Routes require a valid Better Auth customer session.
- Profile updates write `CustomerProfile`.
- Account orders include direct `Order.userId` links.
- Verified-email guest-order matching is prepared and only enabled when `User.emailVerified` is true.
- Customer order detail returns customer-safe order information and placeholders for tracking, support, and reviews.

### Customer Account Client

Routes added:

- `/account/sign-in`
- `/account/create`
- `/account`
- `/account/profile`
- `/account/orders`
- `/account/orders/:reference`
- `/account/forgot-password`
- `/account/reset-password`

Important files:

- `client/src/domains/account/api/authClient.js`
- `client/src/domains/account/api/accountAuth.api.js`
- `client/src/domains/account/api/account.api.js`
- `client/src/domains/account/composables/useAccountAuth.js`
- `client/src/domains/account/composables/useAccountProfile.js`
- `client/src/domains/account/composables/useAccountOrders.js`
- `client/src/domains/account/validators/account.validators.js`
- `client/src/domains/account/components/AccountShell.vue`
- `client/src/domains/account/components/AccountNav.vue`
- `client/src/domains/account/components/AccountOrderCard.vue`
- `client/src/domains/account/components/AccountPlaceholderPanel.vue`
- `client/src/domains/account/views/AccountSignInView.vue`
- `client/src/domains/account/views/AccountCreateView.vue`
- `client/src/domains/account/views/AccountDashboardView.vue`
- `client/src/domains/account/views/AccountProfileView.vue`
- `client/src/domains/account/views/AccountOrdersView.vue`
- `client/src/domains/account/views/AccountOrderDetailView.vue`
- `client/src/domains/account/views/AccountForgotPasswordView.vue`
- `client/src/domains/account/views/AccountResetPasswordView.vue`

Other client changes:

- `client/src/app/router/index.js` now protects customer routes through `/api/account/profile`.
- `client/src/app/layouts/SiteHeader.vue` now links the account icon to `/account` or `/account/sign-in`.

### Order Linking

Important files:

- `server/src/domains/checkout/controllers/checkout.controller.js`
- `server/src/domains/checkout/services/checkout.service.js`
- `server/src/domains/orders/services/orders.service.js`
- `server/src/domains/orders/repositories/orders.repository.js`

Behavior:

- Guest checkout remains available and creates orders with `userId = null`.
- Logged-in checkout looks up the Better Auth customer session on the server and passes `customerUser.id` into order creation.
- The client never submits `userId`; checkout order linking remains server-owned.
- Existing guest orders remain valid.

### Admin Customer Dashboard

Routes added:

- `/admin/customers`
- `/admin/customers/:customerId`

Server API added:

- `GET /api/admin/customers`
- `GET /api/admin/customers/:customerId`
- `POST /api/admin/customers/:customerId/deactivate`
- `POST /api/admin/customers/:customerId/reactivate`
- `POST /api/admin/customers/:customerId/resend-verification`
- `POST /api/admin/customers/:customerId/password-reset`

Important files:

- `server/src/domains/customers/routes/adminCustomers.routes.js`
- `server/src/domains/customers/controllers/adminCustomers.controller.js`
- `server/src/domains/customers/services/adminCustomers.service.js`
- `server/src/domains/customers/repositories/adminCustomers.repository.js`
- `server/src/domains/customers/mappers/adminCustomers.mapper.js`
- `client/src/domains/admin/api/adminCustomers.api.js`
- `client/src/domains/admin/composables/useAdminCustomers.js`
- `client/src/domains/admin/components/AdminCustomerStatusBadge.vue`
- `client/src/domains/admin/components/AdminCustomersTable.vue`
- `client/src/domains/admin/components/AdminCustomerOrdersPanel.vue`
- `client/src/domains/admin/views/AdminCustomersView.vue`
- `client/src/domains/admin/views/AdminCustomerDetailView.vue`

Behavior:

- Customer list shows name, email, verified status, role, status, created date, order count, lifetime spend, and latest order date.
- Customer detail shows profile summary, linked orders, verified-email guest matches, and readiness sections for support, reviews, loyalty, referrals, and internal notes.
- Deactivate/reactivate updates `User.status` and records a `CustomerAccountEvent`.
- Verification/password reset actions call email readiness payload flow. They do not send real email unless a provider is configured.
- Admin customer routes are protected by existing `requireAdminAuth`.
- Password hashes, session tokens, and verification token values are not exposed in admin customer responses.

### Email, Lifecycle, Loyalty, Support, Review, Notification Readiness

Important files:

- `server/src/domains/emails/constants/emailEvents.constants.js`
- `server/src/domains/emails/mappers/emailPayloads.mapper.js`
- `server/src/domains/emails/services/emailProvider.service.js`
- `server/prisma/schema.prisma`

Prepared:

- Verification email payloads.
- Resend verification payloads.
- Password reset payloads.
- Welcome email payloads.
- Order confirmation/update/tracking/review request payload foundations.
- Account lifecycle event table.
- Account deactivation/reactivation readiness.
- Support request model.
- Product review model.
- Loyalty ledger model.
- Notification preference model.

Not implemented yet:

- Real email provider delivery.
- Customer-facing support tickets.
- Review submission/moderation UI.
- Loyalty earning/redemption rules.
- Referrals.
- Full account deletion workflow.
- Better Auth migration for admin users/permissions.

### Documentation Updated

Updated architecture docs:

- `docs/architecture/README.md`
- `docs/architecture/data-flow.md`
- `docs/architecture/file-map.md`
- `docs/architecture/database.md`
- `docs/architecture/admin.md`
- `docs/architecture/auth-roadmap.md`

Key documentation changes:

- Customer Better Auth is now documented as implemented, not merely future work.
- Custom admin auth remains documented as current.
- Customer account flow, admin customer management flow, and order linking flow are documented.
- New account/customer/email files and DB models are indexed.
- Railway migration requirements are documented without secret values.

### Verification Results

Commands run:

```bash
cd server
npx prisma generate
```

Result: passed.

```bash
cd server
find src/domains/account src/domains/customers src/domains/auth src/domains/emails src/app/middleware/auth -name '*.js' -print | xargs -n1 node --check
```

Result: passed.

```bash
cd client
npm run build
```

Result: passed. Vite built 221 modules.

```bash
cd server
npm run build
```

Result: passed. Prisma Client v6.16.2 generated.

```bash
cd server
npx prisma migrate status
```

Result before local migration: one pending migration, `20260612000000_better_auth_customer_accounts`.

```bash
cd server
npx prisma migrate dev
```

Result: applied `20260612000000_better_auth_customer_accounts` locally and regenerated Prisma Client.

```bash
cd server
node -e "import('./src/app.js').then(() => console.log('server app import ok'))"
```

Result: passed.

```bash
cd server
npm test
```

Result: passed. 9 test files, 26 tests.

```bash
cd client
npm test
```

Result: passed. 5 test files, 14 tests.

Local Better Auth smoke:

- Started local server on port `3099`.
- Created a temporary customer account through `/api/customer-auth/sign-up/email`.
- Verified `/api/customer-auth/get-session` returned an authenticated customer session.
- Verified `/api/account/profile` accepted the session cookie and returned a protected account profile.
- Added and verified a Better Auth after-hook sanitizer so sign-up, sign-in, and get-session JSON responses do not expose `token` fields while cookie sessions still work.
- Verified sign-in response sanitization and protected account profile access after sign-in.
- Removed the temporary smoke-test customer from the local database.
- Stopped the local smoke-test server.

Important note: an earlier local smoke command printed Better Auth response bodies before the sanitizer was added. Do not copy session token values from terminal history into documentation, commits, or issue trackers.

### Security Verification

Verified from code:

- Admin routes still use existing custom admin auth guard.
- Customer account routes use `requireCustomerAuth`.
- Public signup cannot provide `role` or `status` because Better Auth additional fields use `input: false`.
- Admin customer API responses are mapped and do not intentionally include `Account.password`, `Session.token`, or `Verification.value`.
- Better Auth customer sign-up, sign-in, and get-session JSON responses are sanitized by an after hook to remove `token` fields.
- Checkout does not trust a client-submitted `userId`; logged-in order linking uses server session lookup.

Unverified without deployed/browser QA:

- Same-site cookie behavior after deploying Better Auth customer auth to Railway/Vercel/custom domain.
- Email delivery provider behavior because no provider is configured.
- Full browser sign-up/sign-in/sign-out flows in Safari/Chrome.
- Logged-in real Stripe checkout on Vercel after Railway migration.

### Required Deployment Steps

Before deploying this phase:

1. Confirm Railway target database.
2. Deploy/apply migration:

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

3. Configure server/Railway variable names with real values in the dashboard:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `FRONTEND_URL`
- `CLIENT_URL` if used for origin allowlist
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `STRIPE_SECRET_KEY`
- `EMAIL_PROVIDER` only when a real email provider is implemented/configured

4. Configure client/Vercel variable names:

- `VITE_API_BASE_URL`
- `VITE_API_URL` if keeping the backwards-compatible alias
- `VITE_STRIPE_PUBLISHABLE_KEY`

5. Redeploy server, then redeploy client.

### Manual QA Checklist

Customer accounts:

- Visit `/account/sign-in`.
- Create a test customer account at `/account/create`.
- Confirm redirect to `/account`.
- Refresh `/account` and remain authenticated.
- Edit `/account/profile`.
- Sign out and confirm protected `/account` redirects to `/account/sign-in`.
- Request password reset and verify user-facing readiness messaging.

Checkout/order linking:

- Complete guest checkout and confirm order has no `userId`.
- Complete logged-in checkout and confirm order has `userId`.
- Confirm order success still loads.
- Confirm admin order list/detail still loads linked orders.

Admin customers:

- Log into existing admin.
- Open `/admin/customers`.
- Open a customer detail page.
- Confirm linked orders appear.
- Confirm verified-email guest matches appear only for verified customer emails.
- Test deactivate/reactivate on a safe local customer.
- Test verification/password reset readiness buttons without expecting real email delivery.

Regression checks:

- Product create/edit/delete.
- Promo create/edit/test/analytics.
- Campaign create/edit/status display.
- Admin order status save/cancel/history.
- Guest checkout with promo and campaign donation.
- Vercel storefront product browsing and add-to-cart.

### Remaining Risks

- Railway migration for Better Auth/customer tables is not applied by this handoff.
- Custom admin auth is still separate from Better Auth. Future Better Auth admin migration must preserve the current admin dashboard and add roles/permissions carefully.
- No automated browser/E2E tests exist for account flows.
- No real email provider is wired.
- Account deletion/export/audit workflows are foundation-only.
- Loyalty, referrals, support requests, review submission, and notification delivery are foundation-only.
- `AGENTS.md` had pre-existing local edits in the working tree before this phase; review separately before committing.

### Current Git State At Handoff

Current branch observed earlier in this handoff: `dev-main`.

Working tree includes modified and untracked files from this Better Auth phase plus the existing `AGENTS.md` local edit. Review before commit.

Latest `git diff --name-status` at documentation update time included:

- `M client/package.json`
- `M client/package-lock.json`
- `M client/src/app/layouts/SiteHeader.vue`
- `M client/src/app/router/index.js`
- `M client/src/domains/admin/views/AdminDashboardView.vue`
- `M docs/architecture/README.md`
- `M docs/architecture/admin.md`
- `M docs/architecture/auth-roadmap.md`
- `M docs/architecture/data-flow.md`
- `M docs/architecture/database.md`
- `M docs/architecture/file-map.md`
- `M server/package.json`
- `M server/package-lock.json`
- `M server/prisma/schema.prisma`
- `M server/src/app.js`
- `M server/src/domains/checkout/controllers/checkout.controller.js`
- `M server/src/domains/checkout/services/checkout.service.js`
- `M server/src/domains/orders/repositories/orders.repository.js`
- `M server/src/domains/orders/services/orders.service.js`
- new `client/src/domains/account/`
- new admin customer client files
- new `server/prisma/migrations/20260612000000_better_auth_customer_accounts/`
- new `server/src/domains/account/`
- new `server/src/domains/customers/`
- new `server/src/domains/emails/`
- new `server/src/domains/auth/services/customerAuth.service.js`
- new `server/src/app/middleware/auth/requireCustomerAuth.js`

### Next Recommended Phase

Deploy the migration to the intended Railway environment, redeploy server/client, and perform browser manual QA for customer accounts plus one guest checkout and one logged-in checkout. After that, add focused integration/E2E coverage for sign-up/sign-in/session persistence and logged-in order linking before starting the larger Better Auth admin-permissions migration.

---

## 2026-06-13 Customer Experience Refinement And Better Auth Infrastructure Pass

### Objective

Refined the customer account, header, checkout identity, order history/detail, and admin customer UX without rebuilding auth, checkout, or admin. Existing custom admin auth remains intact. Better Auth customer auth remains on `/api/customer-auth`.

### Better Auth Infrastructure Changes

Official docs used:

- Better Auth Infrastructure Getting Started.
- Better Auth Infrastructure Dashboard/dash plugin docs.

Packages added:

- `@better-auth/infra` in `server/package.json`
- `@better-auth/infra` in `client/package.json`

Server plugin:

- File: `server/src/domains/auth/services/customerAuth.service.js`
- Import: `dash` from `@better-auth/infra`
- Plugin: `dash({ apiKey: process.env.BETTER_AUTH_API_KEY })`

Client plugin:

- File: `client/src/domains/account/api/authClient.js`
- Import: `dashClient` from `@better-auth/infra/client`
- Plugin: `dashClient()`

Not enabled:

- Sentinel/security challenge plugins.
- Activity tracking schema field/migration.
- Any client-side API key exposure.

Required env variable names:

- Railway/server: `BETTER_AUTH_API_KEY`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, `FRONTEND_URL`, `CLIENT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `STRIPE_SECRET_KEY`
- Vercel/client: `VITE_API_BASE_URL`, `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`

The real `BETTER_AUTH_API_KEY` value must be created in the Better Auth Infrastructure dashboard and configured only in Railway/server environment variables. It must not be committed or exposed to Vercel.

### Customer Account UX Changes

Files changed:

- `client/src/domains/account/components/AccountShell.vue`
- `client/src/domains/account/views/AccountSignInView.vue`
- `client/src/domains/account/views/AccountCreateView.vue`
- `client/src/domains/account/views/AccountProfileView.vue`
- `client/src/domains/account/components/AccountOrderCard.vue`
- `client/src/domains/account/views/AccountOrderDetailView.vue`
- `client/src/app/layouts/SiteHeader.vue`
- `client/src/app/layouts/SiteFooter.vue`

Improvements:

- Account pages now reuse the storefront header and footer.
- Account shell uses Chase & Evie Co. storefront styling instead of a generic portal feel.
- Sign-in/create-account pages now explain ecommerce benefits: faster checkout, order history, future tracking, and future rewards.
- Sign-in/create-account forms keep using Better Auth APIs.
- Profile page now shows editable first name, last name, phone, marketing preference, account email display, email verification status, and future address readiness.
- Email change remains disabled because verification/security flow is not fully implemented.
- Footer links now point back to storefront anchors from account pages.

### Header And Account State

File changed:

- `client/src/app/layouts/SiteHeader.vue`

Behavior:

- Logged-out desktop/mobile header shows a visible Sign in entry.
- Logged-in desktop header shows initials and first name with a menu for Account overview, Orders, Checkout, and Sign out.
- Logged-in mobile header shows initials and Account.
- Header state is driven by the existing Better Auth customer session composable.

### Checkout Identity Changes

Files changed:

- `client/src/domains/checkout/views/CheckoutView.vue`
- `client/src/domains/checkout/Checkout/CheckoutContactSection.vue`

Behavior:

- Guest checkout now shows a clear “Checking out as guest” card with Sign in/Create account links.
- Guest checkout remains available and obvious.
- Signed-in checkout loads `/api/account/profile`, shows “Signed in as...”, and pre-fills safe blank fields from the account profile.
- Signed-in checkout hides the redundant save-info/marketing checkboxes and directs marketing preference management to the profile page.
- Checkout order linking remains server-owned; the client still does not send `userId`.

### Order History And Detail UX

Files changed:

- `server/src/domains/orders/mappers/orders.mapper.js`
- `server/src/domains/account/repositories/account.repository.js`
- `client/src/domains/account/components/AccountOrderCard.vue`
- `client/src/domains/account/views/AccountOrderDetailView.vue`

Behavior:

- Customer-safe order responses now include customer-owned contact and shipping snapshot fields, payment status derived from order status, promo usage, and status history.
- Account order cards show product preview, order reference, status, date, total, item count, and a detail cue.
- Order detail now shows order reference, status, payment status, placed date, customer contact, shipping info, items with variant/quantity/unit/line totals, subtotal, discount, promo code when present, shipping, tax, donation impact, total, tracking placeholder, support entry point, and review readiness.
- Account order routes still enforce ownership through `requireCustomerAuth` and repository filters before returning data.

### Admin Customer UX

No broad admin rebuild was performed.

The existing admin customer dashboard remains in place and benefits from the richer customer/order mapping where safe. Admin customer routes remain protected by `requireAdminAuth`; unauthenticated `/api/admin/customers` was verified to return `401`.

Sensitive data remains excluded from mapped admin customer responses:

- Password hashes.
- Session tokens.
- Verification token values.
- Stripe secrets or private payment data.

### Customer Journey Review

Reviewed journey:

- Guest browse.
- Add to cart.
- Checkout as guest or signed-in customer.
- Order confirmation.
- Account creation/sign-in.
- Order history/detail.
- Repeat purchase path back to shop/checkout.

Small fixes made:

- Header account state is now clear.
- Account pages reuse store header/footer and visual language.
- Guest/signed-in checkout identity is explicit.
- Checkout mobile summary prop wiring now passes `itemCount`, `mobileSummaryOpen`, and the toggle event explicitly after browser testing exposed Vue missing-prop warnings.
- Order history and detail are easier to scan.
- Account footer links no longer dead-end on account-local hash anchors.

Remaining larger recommendations:

- Add saved address management after email verification/security flow is complete.
- Add a reorder action after inventory/variant availability rules are designed.
- Add real support ticket submission.
- Add real review request/submission flow.
- Add loyalty/referral UX once earning/redemption rules are defined.
- Add E2E tests for signup, signin, signed-in checkout, and order history.

### Verification Results

Commands run:

```bash
cd client
npm run build
npm test
```

Result: passed. Vite built 225 modules. Client tests passed: 5 files, 14 tests.

```bash
cd server
node --check src/domains/auth/services/customerAuth.service.js
node --check src/domains/account/repositories/account.repository.js
node --check src/domains/orders/mappers/orders.mapper.js
npm run build
npm test
```

Result: passed. Prisma Client generated. Server tests passed: 9 files, 26 tests.

Local auth smoke:

- Started local server on `localhost:3000`.
- Created a temporary customer through Better Auth sign-up.
- Verified sign-up success.
- Verified sign-up and session responses do not expose JSON `token` fields.
- Verified `/api/account/profile` works while signed in.
- Verified sign-out succeeds.
- Verified `/api/account/profile` returns `401` after sign-out.
- Removed the temporary customer from local DB.

Browser/rendered UI checks:

- Guest homepage desktop header shows Sign in.
- Guest homepage mobile header shows Sign in and cart.
- Sign-in page includes storefront brand, benefits, guest checkout copy, and footer.
- Guest checkout shows “Checking out as guest” with Sign in/Create account.
- Created a temporary customer through the actual `/account/create` page.
- Verified redirect to `/account`.
- Verified logged-in desktop header shows initials/name.
- Verified logged-in mobile header shows Account state.
- Verified signed-in checkout shows signed-in card and does not show guest card.
- Verified from source and passing client build that `CheckoutMobileSummaryBar` receives the required summary props; earlier browser log buffers contained the pre-fix warnings.
- Removed the temporary UI smoke customer from local DB.

Admin protection check:

```bash
curl http://localhost:3000/api/admin/customers
```

Result: `401` with `Authentication required.`

No `.env.example` files were created.

### Remaining Risks

- The real Better Auth Infrastructure dashboard connection cannot be fully verified until `BETTER_AUTH_API_KEY` is configured in Railway and the server is redeployed.
- Railway migration for the Better Auth/customer tables still must be applied before deployed account flows are enabled.
- Browser checks were local only, not Vercel/Railway.
- Guest checkout and logged-in checkout were verified at the identity/UI/API level, but not through a real Stripe payment during this pass.
- No automated E2E coverage exists for account/header/checkout identity states.
- The client dev server and local server were used for verification and should not be left running after the pass.

### Next Recommended Phase

Configure `BETTER_AUTH_API_KEY` in Railway, deploy the server, deploy the client, then run deployed browser QA for customer signup/signin/session persistence, Better Auth Infrastructure dashboard visibility, guest checkout, logged-in Stripe checkout, account order history, and admin customers. After deployed QA passes, add Playwright E2E tests for the customer journey.

## 2026-06-13 Customer Accounts UX Refinement Pass

### Objective

Focused UX repair pass for customer accounts after Better Auth infrastructure work. This pass did not rebuild auth, checkout, admin, or storefront. It preserved the existing Vue domain structure and server route/controller/service/repository/Prisma pattern.

### Previous Phase Verification

Verified from repository state:

- Better Auth customer account files exist under `client/src/domains/account`, `server/src/domains/account`, and `server/src/domains/auth/services/customerAuth.service.js`.
- `@better-auth/infra` remains installed in both client and server packages.
- Server Better Auth uses `dash({ apiKey: process.env.BETTER_AUTH_API_KEY })`.
- Client Better Auth uses `dashClient()`.
- Customer auth remains mounted at `/api/customer-auth`.
- Custom admin auth remains mounted at `/api/auth`.

Incomplete or rough items confirmed from the previous pass:

- `AccountShell` rendered `SiteHeader` without binding cart/search state, causing account pages to show a detached cart count.
- Desktop account dropdown was hover-based and could close across the button/menu gap.
- Account dropdown still included redundant `Checkout`.
- Checkout guest sign-in/create-account links left checkout instead of preserving in-progress form state.
- Profile had basic editable fields but no preferred contact method or clear saved address/default shipping/default billing placeholders.
- Orders page displayed all fetched orders without search/filter/load-more scalability.

### Files Changed

Client:

- `client/src/app/layouts/SiteHeader.vue`
  - Replaced hover-only account menu with click/outside-click/Escape behavior.
  - Removed redundant Checkout menu item.
  - Added Profile menu item.
  - Updated main nav links to storefront-root anchors such as `/#shop` so account pages do not dead-end on local hashes.
- `client/src/domains/account/components/AccountShell.vue`
  - Binds `SiteHeader` to shared cart count/search state.
  - Adds the real `CartDrawer` on account pages using the same local cart storage.
- `client/src/domains/storefront/composables/useStorefrontSearch.js`
  - New tiny shared search-state composable for storefront/account header continuity.
- `client/src/domains/products/composables/useProductFilters.js`
  - Uses the shared storefront search ref.
- `client/src/domains/cart/composables/useCart.js`
  - Adds safe defaults so account shell can use stored cart/drawer behavior without product catalog context.
- `client/src/domains/checkout/Checkout/CheckoutContactSection.vue`
  - Guest Sign in/Create account actions now emit quick-auth events instead of navigating away.
- `client/src/domains/checkout/Checkout/CheckoutAuthModal.vue`
  - New lightweight checkout sign-in/create-account modal using existing Better Auth composable and validators.
- `client/src/domains/checkout/views/CheckoutView.vue`
  - Opens checkout auth modal and reloads signed-in profile after modal auth success without losing checkout progress.
- `client/src/domains/account/views/AccountSignInView.vue`
  - Preserves safe internal `redirect` query when linking to create account and after sign-in.
- `client/src/domains/account/views/AccountCreateView.vue`
  - Preserves safe internal `redirect` query when linking to sign-in and after account creation.
- `client/src/domains/account/views/AccountProfileView.vue`
  - Adds explicit marketing opt-in/opt-out controls, preferred contact method, and saved-address/default-shipping/default-billing future placeholders.
- `client/src/domains/account/validators/account.validators.js`
  - Validates preferred contact method values.
- `client/src/domains/account/views/AccountDashboardView.vue`
  - Adds welcome section, compact recent orders, View All Orders link, and future-phase loyalty/wishlist/review/tracking placeholders.
- `client/src/domains/account/views/AccountOrdersView.vue`
  - Adds order search, status filter, and Load More pagination.
- `client/src/domains/account/components/AccountOrderCard.vue`
  - Adds friendlier status labels/classes and clearer order metadata.
- `client/src/domains/account/views/AccountOrderDetailView.vue`
  - Adds a status timeline section using existing `statusHistory`.

Server/database:

- `server/prisma/schema.prisma`
  - Adds nullable `CustomerProfile.preferredContactMethod`.
- `server/prisma/migrations/20260613000000_add_customer_preferred_contact/migration.sql`
  - Adds the local/production migration for the preferred contact field.
- `server/src/domains/account/services/account.service.js`
  - Normalizes and saves preferred contact method through the existing account service.
- `server/src/domains/account/mappers/account.mapper.js`
  - Returns preferred contact method in customer-safe profile responses.

Docs:

- `docs/architecture/auth-roadmap.md`
  - Adds verified Better Auth Dashboard Base URL/Base Path guidance.

### UX Issues Fixed

- Account pages now share live storefront cart count and cart drawer behavior through the same `SiteHeader` and local cart storage.
- Account header search state uses a shared storefront search ref rather than a detached account-only ref.
- Desktop account dropdown no longer depends on fragile hover; it opens by click, closes on outside click/Escape/menu selection, and can be used without a hover gap.
- Checkout was removed from the account dropdown because the cart/checkout path already exists elsewhere.
- Profile now has real editable controls for first name, last name, phone, marketing opt-in/out, and preferred contact method.
- Saved addresses, default shipping address, default billing address, and preferred shipping profile are presented as intentional future-phase placeholders.
- Checkout guest auth now has an inline sign-in/create-account modal that preserves cart and entered checkout form state.
- Standalone sign-in/create-account pages preserve safe internal redirect targets such as `redirect=/checkout`.
- Account overview stays compact and shows only recent orders with a View All Orders path.
- Orders page now supports search, status filter, and load more.
- Order detail now has a timeline/status-history section.

### Better Auth Dashboard Configuration

Verified from code:

- Server Better Auth config: `server/src/domains/auth/services/customerAuth.service.js`
- Server base path: `basePath: '/api/customer-auth'`
- Express mount: `app.all('/api/customer-auth/*splat', toNodeHandler(customerAuth))`
- Client Better Auth config: `client/src/domains/account/api/authClient.js`
- Client base path: `/api/customer-auth`
- Custom admin auth remains separate at `/api/auth`.

Dashboard values:

- Project Name: use `Chase & Evie Co.` or `Doggy Ent`.
- Base URL: the public backend/server origin where Better Auth runs. For production, copy the Railway backend public domain from Railway service networking. Do not use the Vercel storefront URL unless the auth server is actually hosted there.
- Base Path: `/api/customer-auth`
- Required Railway/server variable: `BETTER_AUTH_API_KEY`
- Vercel/client env change: none for the API key.
- Verification endpoint: `<BackendBaseUrl>/api/customer-auth/get-session`

Local endpoint verification:

```bash
curl -i http://localhost:3000/api/customer-auth/get-session
```

Result: `200 OK` with unauthenticated `null`, proving the route exists locally.

Official docs referenced:

- Better Auth Infrastructure Getting Started.
- Better Auth Infrastructure Dashboard plugin docs.

### Migration Notes

Local:

- `npx prisma migrate status` initially reported pending `20260613000000_add_customer_preferred_contact`.
- `npx prisma migrate dev` applied it locally and regenerated Prisma Client.
- Final `npx prisma migrate status` reported the local database schema is up to date.

Railway:

- Do not apply automatically from Codex.
- Required after review/deploy planning: run Railway-safe `npx prisma migrate deploy` for the new migration.

### Verification Results

Commands run:

```bash
cd client
npm run build
npm test
```

Result: passed. Vite built 227 modules. Client tests passed: 5 files, 14 tests.

```bash
cd server
npm run build
npm test
npx prisma migrate status
npx prisma migrate dev
npx prisma migrate status
```

Result: server build passed and generated Prisma Client. Server tests passed: 9 files, 26 tests. Local migration applied. Final local migration status: database schema is up to date.

Targeted syntax checks:

```bash
node --check src/domains/account/services/account.service.js
node --check src/domains/account/mappers/account.mapper.js
node --check src/domains/account/repositories/account.repository.js
node --check src/domains/auth/services/customerAuth.service.js
```

Result: passed.

Browser/manual checks:

- Homepage rendered with header/cart/account controls.
- Added a real product to cart through storefront UI; header cart count updated to `1`.
- Account sign-in page showed the same cart count and account shell cart drawer opened with the same stored item.
- Checkout guest auth card opened inline Sign in/Create account modal without leaving `/checkout`.
- Created a temporary local customer through the checkout modal; checkout remained on `/checkout`, modal closed, guest card disappeared, and signed-in card appeared.
- Desktop signed-in account dropdown opened by click, contained Account overview, Orders, Profile, Sign out, and did not contain Checkout.
- Orders page rendered search, status filter, empty/list state, and Load More-ready structure.
- Profile page rendered marketing opt-in/out, preferred contact method, saved-address placeholders, and future-phase copy.
- Profile save persisted preferred contact method after killing stale local server watcher processes and restarting a single fresh server.
- Mobile viewport check verified account header state, cart count, account overview, and orders controls.
- Browser logs showed only the expected local Stripe warning about testing Stripe.js over HTTP; no new Vue/runtime errors were observed.
- Temporary local browser test customer was removed from the local DB.
- No `.env.example` files were created.

### Important Verification Note

During profile-save verification, an old `node --watch src/server.js` process was still serving port `3000` with a stale Prisma Client. Killing all old local server watcher/child processes and starting one fresh server fixed the false stale-client error. Reviewers should restart the local server after applying the migration and regenerating Prisma Client.

### Remaining Risks

- Railway still needs `20260613000000_add_customer_preferred_contact` applied with `npx prisma migrate deploy` after review.
- Deployed Vercel/Railway customer account QA was not run in this local pass.
- Checkout quick-auth was verified through local UI state and account session, but not through a full Stripe payment after sign-in.
- Search state is shared in-memory across storefront/account routes during the same SPA session; it is not yet URL-backed or persisted across reloads.
- No automated E2E tests cover the account dropdown, checkout quick-auth modal, or profile save.

### Next Recommended Phase

After code review, apply the new Prisma migration on Railway, redeploy server and client, then run deployed QA for account dropdown, checkout quick-auth, profile save, order history, and Better Auth Dashboard connection. After deployed QA passes, add Playwright E2E coverage for the customer account and checkout identity journey.

## 2026-06-14 Communication, Fulfillment, and Security Pass

### Objective

Focused infrastructure pass for transactional email, tracking/fulfillment visibility, and security hardening. This pass did not implement Twilio/SMS, did not replace Better Auth, did not rebuild checkout/admin/account UX, and did not commit or push.

### Communication Infrastructure

Resend email support was implemented behind the existing email domain:

- `server/src/domains/emails/services/emailProvider.service.js`
  - Sends through Resend when server env provides `RESEND_API_KEY` and `EMAIL_FROM` or `RESEND_FROM_EMAIL`.
  - Falls back to mock mode in tests, explicit mock/test modes, or when required provider env is missing.
  - Records delivery attempts in `EmailDelivery`.
  - Uses dedupe keys so normal retries do not resend one-time lifecycle/order emails.
  - Does not throw provider failures back into checkout/status workflows.
- `server/src/domains/emails/repositories/emailDelivery.repository.js`
  - Prisma access for email delivery records.
- `server/src/domains/emails/mappers/emailTemplates.mapper.js`
  - Builds HTML/text transactional templates from structured payloads.
- `server/src/domains/emails/mappers/emailPayloads.mapper.js`
  - Builds account, order, admin alert, support, password reset, verification, and profile-update payloads.
- `server/src/domains/emails/constants/emailEvents.constants.js`
  - Source of truth for email event names/status labels.

Email lifecycle hooks now verified from code:

- Account verification email: Better Auth `emailVerification.sendVerificationEmail`.
- Password reset email: Better Auth `emailAndPassword.sendResetPassword`.
- Welcome/account-created emails: Better Auth user create database hook.
- Profile updated email: account profile update service.
- Order confirmation email: checkout service after order creation and promo/campaign persistence.
- Admin new-order email: checkout service after order creation.
- Order shipped/delivered/cancelled/status update/refund emails: admin order status service.
- Admin refund/support notification: admin order status service for cancelled/refunded orders.
- Admin failed-payment notification: payment intent creation controller catch path.

Uncertainty:

- Password-changed email template/event is prepared, but a concrete Better Auth password-changed lifecycle hook was not verified from source in this pass.
- Client-side Stripe declines after PaymentIntent creation still require future Stripe webhook coverage if the business wants complete failed-payment notifications.

### Fulfillment and Shippo Tracking

Shipping/tracking support was added through a new server shipping domain:

- `server/src/domains/shipping/routes/shipping.routes.js`
  - `PUT /api/admin/orders/:orderId/tracking`
  - `POST /api/admin/orders/:orderId/tracking/refresh`
  - `POST /api/webhooks/shippo`
- `server/src/domains/shipping/controllers/shipping.controller.js`
  - Admin tracking update/refresh handlers and Shippo webhook receipt handler.
- `server/src/domains/shipping/services/shipping.service.js`
  - Validates tracking payloads.
  - Syncs current tracking status with Shippo when configured.
  - Stores tracking snapshots/events.
  - Updates order status to shipped/delivered when tracking status proves it.
  - Queues tracking/order lifecycle emails.
- `server/src/domains/shipping/services/shippo.service.js`
  - Calls Shippo tracking API when `SHIPPO_API_KEY` or `SHIPPO_API_TOKEN` is configured.
- `server/src/domains/shipping/repositories/shipping.repository.js`
  - Prisma access for shipment upserts and carrier events.
- `server/src/domains/shipping/mappers/shipping.mapper.js`
  - Maps Shippo tracking responses to app shipment shape.
- `server/src/domains/shipping/validators/shipping.validator.js`
  - Normalizes carrier/tracking/status fields and rejects invalid tracking payloads.

Order repository/mapping updates:

- `server/src/domains/orders/repositories/orders.repository.js`
  - Includes shipments/events on admin order lists, detail, customer order lookup, Stripe idempotency lookup, and status updates.
- `server/src/domains/account/repositories/account.repository.js`
  - Includes shipments/events on customer account order history/detail.
- `server/src/domains/orders/mappers/orders.mapper.js`
  - Admin order responses include shipment ids/source/internal fields.
  - Customer-safe order responses expose carrier, tracking number, URL, shipment status, dates, and event status/message/location/timestamps, but omit internal shipment/event ids and Stripe PaymentIntent ids.

Admin UI:

- `client/src/domains/admin/api/adminOrders.api.js`
  - Adds tracking update and refresh API calls.
- `client/src/domains/admin/components/AdminOrderTrackingPanel.vue`
  - Adds a focused tracking panel to admin order detail.
  - Allows carrier, tracking number, optional tracking URL, shipment status, and mark-shipped behavior.
- `client/src/domains/admin/views/AdminOrderDetailView.vue`
  - Renders the tracking panel and updates the local order after save/refresh.

Customer UI:

- `client/src/domains/account/components/AccountOrderCard.vue`
  - Shows concise tracking status when present.
- `client/src/domains/account/views/AccountOrderDetailView.vue`
  - Shows customer-safe tracking details and carrier events.
- `client/src/domains/checkout/views/OrderSuccessView.vue`
  - Shows tracking details if already attached to the order; otherwise keeps the existing fulfillment expectation.

Webhook note:

- `POST /api/webhooks/shippo` verifies optional `SHIPPO_WEBHOOK_SECRET` header values and acknowledges receipt.
- Automatic webhook payload matching/update is intentionally not enabled yet because this pass did not verify the exact deployed Shippo webhook payload shape against live data.

### Database Changes

New Prisma migration:

- `server/prisma/migrations/20260614000000_email_and_shipping_tracking/migration.sql`

New Prisma models:

- `OrderShipment`
  - Tracks order-level carrier/tracking number/status/URLs/dates/source/raw status.
  - Unique by `(orderId, trackingNumber)`.
- `OrderShipmentEvent`
  - Tracks carrier timeline events.
  - Unique by `(shipmentId, status, occurredAt)` to prevent duplicate events on refresh.
- `EmailDelivery`
  - Tracks transactional email event, recipient, subject, provider/status, dedupe key, order/user ids, metadata, and delivery error/provider id.

Local migration status:

```bash
cd server
npx prisma migrate dev --name email_and_shipping_tracking
npx prisma migrate status
```

Result: local migration applied and local database schema is up to date.

Railway migration status:

- Not applied automatically by Codex.
- Required after code review: run Railway-safe `npx prisma migrate deploy` on the Railway/server environment.

### Security Hardening

Files:

- `server/src/app/middleware/security/securityHeaders.middleware.js`
  - Adds `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and production HSTS.
- `server/src/app/middleware/security/rateLimit.middleware.js`
  - Adds checkout, payment, customer-auth, webhook rate limiters.
- `server/src/app.js`
  - Applies security headers globally.
  - Limits JSON payload size to `100kb`.
  - Applies customer-auth limiter before Better Auth handler.
  - Mounts shipping routes at `/api`.
- `server/src/domains/checkout/routes/checkout.routes.js`
  - Applies checkout limiter to preview and create checkout.
- `server/src/domains/payments/routes/payment.routes.js`
  - Applies payment limiter to PaymentIntent creation.
- `server/src/domains/shipping/routes/shipping.routes.js`
  - Applies webhook limiter.
- `server/src/app/middleware/error.middleware.js`
  - Keeps expected 4xx messages but returns a generic message for unexpected 5xx errors.

### Environment Variables

Server/Railway variables to configure by name only:

- `RESEND_API_KEY`: Resend API key for transactional email.
- `EMAIL_FROM`: preferred from address for Resend transactional email.
- `EMAIL_REPLY_TO`: optional reply-to address.
- `RESEND_FROM_EMAIL`: backward-compatible from-address alias supported by code.
- `RESEND_REPLY_TO_EMAIL`: backward-compatible reply-to alias supported by code.
- `ADMIN_NOTIFICATION_EMAIL`: optional admin alert recipient; falls back to `ADMIN_EMAIL`.
- `SUPPORT_EMAIL`: optional support recipient; falls back to `ADMIN_EMAIL`.
- `SHIPPO_API_KEY`: Shippo API key for tracking sync.
- `SHIPPO_API_TOKEN`: backward-compatible Shippo token alias supported by code.
- `SHIPPO_WEBHOOK_SECRET`: optional shared secret checked on Shippo webhook requests.
- Existing required server vars remain required: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_API_KEY`, `CLIENT_URL`, `FRONTEND_URL`, `NODE_ENV`, `PORT`.

Client/Vercel:

- No Resend or Shippo variables belong in client/Vercel public env.
- Existing public vars remain: `VITE_API_BASE_URL`, `VITE_API_URL` if still supported as alias, and Stripe publishable key.

No secret values were copied into this handoff.

### Verification Results

Commands run:

```bash
cd client
npm run build
npm run test
```

Result: client build passed. Client tests passed: 5 files, 14 tests.

```bash
cd server
node --check src/app.js
node --check src/domains/shipping/services/shipping.service.js
node --check src/domains/emails/services/emailProvider.service.js
node --check src/domains/orders/repositories/orders.repository.js
npm run build
npm run test
npx prisma migrate dev --name email_and_shipping_tracking
npx prisma migrate status
node -e "import('./src/app.js').then(() => console.log('app import ok'))"
npm run dev:local
curl -s -o /tmp/tracking_status.txt -w '%{http_code}' -X PUT http://localhost:3000/api/admin/orders/test-order/tracking -H 'Content-Type: application/json' -d '{"carrier":"usps","trackingNumber":"TRACK123"}'
curl -s -o /tmp/shippo_webhook_status.txt -w '%{http_code}' -X POST http://localhost:3000/api/webhooks/shippo -H 'Content-Type: application/json' -d '{}'
```

Results:

- Syntax checks passed.
- Server build passed and generated Prisma Client.
- Server tests passed: 10 files, 28 tests.
- Local migration applied successfully.
- Final local migration status: database schema is up to date.
- App import smoke check printed `app import ok`.
- Local unauthenticated admin tracking update returned `401`, proving the new admin tracking endpoint is not public.
- Local Shippo webhook receipt endpoint returned `200` when no `SHIPPO_WEBHOOK_SECRET` is configured.

One command mistake:

```bash
cd server
npm run tiertest1 -- --runInBand
```

Result: failed because Vitest does not support Jest's `--runInBand` option. The real project script `npm run tiertest1` was rerun and passed.

Secret/env checks:

```bash
find . -name '.env.example' -o -name '*.env.example'
rg -n "RESEND_API_KEY|SHIPPO_API_KEY|SHIPPO_API_TOKEN|EMAIL_FROM|RESEND_FROM_EMAIL|sk_|shippo_|re_[A-Za-z0-9]" --glob '!node_modules/**' --glob '!client/dist/**' .
```

Result: no `.env.example` files found. Search found only variable names/documentation/source references, not real provider secrets.

### Tests Added/Updated

- `server/tests/tier1/shipping/shipping-tracking.test.js`
  - Verifies tracking payload normalization.
  - Verifies Shippo response mapping.
- `server/tests/tier2/orders/customer-safe-order.test.js`
  - Verifies customer-safe order mapping exposes tracking data but omits internal shipment/event ids and Stripe PaymentIntent id.

### Manual QA Checklist

After code review and Railway migration/deploy:

- Configure server env names above in Railway, without putting keys in Vercel public env.
- Run Railway `npx prisma migrate deploy`.
- Redeploy server and client.
- Place a guest checkout order and confirm:
  - Order confirmation email is sent or mocked according to env.
  - Admin new-order email is sent.
  - Checkout still creates one order for one Stripe PaymentIntent.
- Place/log in as a customer and confirm:
  - Welcome/account-created emails queue on sign-up.
  - Password reset email queues from forgot-password flow.
  - Profile update email queues after profile save.
- In admin order detail:
  - Add valid carrier/tracking number.
  - Confirm the order status moves to shipped when requested.
  - Confirm tracking appears on admin order detail.
  - Confirm tracking appears on customer account order card/detail.
  - Confirm refresh uses Shippo when `SHIPPO_API_KEY` or `SHIPPO_API_TOKEN` is configured.
- Verify `/api/webhooks/shippo` rejects/accepts according to `SHIPPO_WEBHOOK_SECRET` configuration.
- Confirm no Resend/Shippo secrets appear in browser bundles or API responses.
- Confirm admin products/promos/campaigns/orders/customer pages still require auth.

### Remaining Risks

- Railway migration for `20260614000000_email_and_shipping_tracking` must be deployed before live email/tracking persistence can work.
- Shippo webhook automatic tracking updates are not enabled until a real deployed webhook payload is verified.
- Password-changed email is template-ready but not confirmed as a live Better Auth lifecycle trigger.
- Failed-payment admin notification currently covers server PaymentIntent creation failures; full Stripe failure/refund automation still needs Stripe webhooks.
- No browser E2E automation was added for admin tracking save/refresh or customer tracking display.
- Resend deliverability/domain verification must be completed outside the repo in Resend/DNS.

### Next Recommended Phase

After review, apply the Railway migration, configure Resend/Shippo env vars, redeploy, and run deployed QA for email delivery, tracking save/refresh, customer tracking visibility, and checkout/order idempotency. Then add Stripe webhooks for payment failure/refund events and Shippo webhook auto-processing once live webhook payloads are captured and verified.

## 2026-06-15 Reality Verification And Completion Pass

### Objective

The previous handoff claimed Resend, Shippo, notification persistence, admin tracking endpoints, security hardening, shipment models, `EmailDelivery`, and customer tracking UI. This pass verified those claims against source, classified incomplete areas, then built missing end-to-end links without committing or pushing.

### Reality Matrix

| Area | Status before this pass | Evidence before this pass | Work completed now |
| --- | --- | --- | --- |
| Welcome email | Partial | Better Auth user create hook queued welcome/account-created emails through `emailProvider.service.js`; `EmailDelivery` model existed. | Added customer/admin delivery history surfaces so sent/mocked/skipped state is visible. |
| Verification email | Partial | Better Auth `sendVerificationEmail` hook existed; admin customer action previously built a null-url payload. | Admin resend verification now calls Better Auth `sendVerificationEmail`, which generates a real verification URL. |
| Resend verification email | Falsely complete | Admin UI button existed, but server passed `url: null`. | Rewired to Better Auth API. |
| Forgot/password reset email | Partial | Customer forgot-password UI called Better Auth request reset; admin reset used null-url payload. | Admin reset now calls Better Auth `requestPasswordReset`, producing a real reset URL. |
| Profile update email | Partial | Account service queued profile update email. | Added customer notification history and preference controls. |
| Order confirmation email | Partial | Checkout service queued email after order creation. | Added admin order resend confirmation control and email delivery history. |
| Order status email | Partial | Status service queued status emails. | Added admin notification history visibility. |
| Tracking shipped email | Partial | Shipping service queued tracking/shipped email. | Added order resend tracking controls and visible delivery history. |
| Delivered email | Partial | Status/tracking service queued delivered email. | Added delivered resend control. |
| Review request email | Missing | Event/template existed, but no trigger/API/UI. | Added admin order review request send control, gated to delivered orders server-side. |
| Shippo provider integration | Complete backend, unverified live | `shippo.service.js` called Shippo Tracking API; tests covered mapper. | Verified env presence only, no label purchase; documented test-mode limitation. |
| Shipment persistence | Complete | `OrderShipment`, repository, service, mapper existed. | Preserved and surfaced in dashboard/order/customer docs. |
| Shipment event persistence | Complete | `OrderShipmentEvent` unique event rows existed. | Included in docs and dashboard tracking summary. |
| Tracking refresh | Complete | `POST /api/admin/orders/:id/tracking/refresh` existed. | Verified protected endpoint shape. |
| Tracking timeline | Partial | Admin/customer order detail showed events; dashboard did not summarize. | Added dashboard shipment activity summary. |
| Customer tracking visibility | Complete for order detail/card | Account order card/detail and success page displayed tracking. | Added shipping method visibility. |
| Admin tracking visibility | Complete for order detail | Admin tracking panel existed. | Added dashboard shipment summary. |
| Admin dashboard visibility | Partial | Only navigation cards existed. | Added metrics for orders, customers, revenue, notifications, shipments, delivered orders, and recent notification activity. |
| Admin notification visibility | Missing | `EmailDelivery` persisted but no admin route/UI. | Added `GET /api/admin/notifications`, dashboard panel, order panel, customer panel. |
| Notification resend controls | Partial | Customer verification/reset buttons existed; order resends missing. | Added order confirmation/tracking/delivered/review resend controls. |
| Customer notification preferences | Partial | Prisma model existed and profile had marketing opt-in only. | Added profile controls for order, tracking, review, loyalty/referral, marketing categories; provider records `SKIPPED` when preferences block eligible events. |
| Email status feedback | Missing | Email rows existed but were not surfaced. | Added customer profile recent email activity. |
| Checkout shipping methods | Partial | Client had fixed options and server recalculated price by method; order did not store method. | Added `GET /api/checkout/shipping-options`, server-provided labels/descriptions, and nullable `Order.shippingMethod`. |

### Files Created

- `client/src/domains/admin/api/adminNotifications.api.js`
- `client/src/domains/admin/components/AdminCustomerNotificationsPanel.vue`
- `client/src/domains/admin/components/AdminOrderNotificationsPanel.vue`
- `server/prisma/migrations/20260615000000_add_order_shipping_method/migration.sql`
- `server/src/domains/emails/controllers/emailDelivery.controller.js`
- `server/src/domains/emails/mappers/emailDelivery.mapper.js`
- `server/src/domains/emails/routes/adminEmailDelivery.routes.js`
- `server/src/domains/emails/services/emailDelivery.service.js`

### Files Modified

- `client/src/domains/account/api/account.api.js`
- `client/src/domains/account/views/AccountProfileView.vue`
- `client/src/domains/account/views/AccountOrderDetailView.vue`
- `client/src/domains/admin/views/AdminDashboardView.vue`
- `client/src/domains/admin/views/AdminCustomerDetailView.vue`
- `client/src/domains/admin/views/AdminOrderDetailView.vue`
- `client/src/domains/admin/api/adminOrders.api.js`
- `client/src/domains/checkout/api/checkout.api.js`
- `client/src/domains/checkout/views/CheckoutView.vue`
- `client/src/domains/checkout/views/OrderSuccessView.vue`
- `docs/architecture/admin.md`
- `docs/architecture/data-flow.md`
- `docs/architecture/diagram.md`
- `docs/architecture/mockdiagram.md`
- `server/prisma/schema.prisma`
- `server/src/app.js`
- `server/src/domains/account/controllers/account.controller.js`
- `server/src/domains/account/mappers/account.mapper.js`
- `server/src/domains/account/repositories/account.repository.js`
- `server/src/domains/account/routes/account.routes.js`
- `server/src/domains/account/services/account.service.js`
- `server/src/domains/checkout/constants/checkout.constants.js`
- `server/src/domains/checkout/controllers/checkout.controller.js`
- `server/src/domains/checkout/routes/checkout.routes.js`
- `server/src/domains/checkout/services/checkout.service.js`
- `server/src/domains/customers/mappers/adminCustomers.mapper.js`
- `server/src/domains/customers/services/adminCustomers.service.js`
- `server/src/domains/emails/repositories/emailDelivery.repository.js`
- `server/src/domains/emails/services/emailProvider.service.js`
- `server/src/domains/orders/controllers/orders.controller.js`
- `server/src/domains/orders/mappers/orders.mapper.js`
- `server/src/domains/orders/repositories/orders.repository.js`
- `server/src/domains/orders/routes/orders.routes.js`
- `server/src/domains/orders/services/orders.service.js`

### API Routes Added

- `GET /api/admin/notifications`
- `GET /api/account/notifications`
- `POST /api/admin/orders/:orderId/emails/resend`
- `GET /api/checkout/shipping-options`

Existing tracking routes verified/preserved:

- `PUT /api/admin/orders/:orderId/tracking`
- `POST /api/admin/orders/:orderId/tracking/refresh`
- `POST /api/webhooks/shippo`

### Prisma Changes

- Added nullable `Order.shippingMethod`.
- Added migration `20260615000000_add_order_shipping_method`.
- Local migration applied with `npx prisma migrate dev`.
- Final local `npx prisma migrate status`: database schema is up to date with 15 migrations.

### Provider Checks

Local env presence was checked without printing values:

- `RESEND_API_KEY`: present
- `EMAIL_FROM`: missing
- `EMAIL_REPLY_TO`: present
- `RESEND_FROM_EMAIL`: missing
- `RESEND_REPLY_TO_EMAIL`: missing
- `SHIPPO_API_KEY`: present
- `SHIPPO_API_TOKEN`: missing

Resend live email verification:

- Blocked. The app requires `EMAIL_FROM` or `RESEND_FROM_EMAIL` in addition to `RESEND_API_KEY`; neither from-address variable was present locally.
- Emails sent count: `0`.
- Apple Mail verification was not performed because no real emails were sent.

Shippo verification:

- Env presence confirmed for `SHIPPO_API_KEY`.
- No labels were purchased.
- No production shipment was created.
- Shippo documentation notes test mode does not create usable shipped labels and test tracking has limitations, so verification stayed to provider wiring, endpoint protection, normalization tests, and mapper tests.

### Verification Commands

```bash
git status --short
git diff --stat
git diff --name-status
node --check src/app.js
node --check src/domains/account/services/account.service.js
node --check src/domains/customers/services/adminCustomers.service.js
node --check src/domains/emails/services/emailProvider.service.js
node --check src/domains/orders/services/orders.service.js
node --check src/domains/checkout/controllers/checkout.controller.js
cd client && npm run build
cd server && npm run build
cd server && npx prisma migrate dev
cd client && npm run test
cd server && npm run test
cd server && npx prisma migrate status
node -e "import('./src/app.js').then(() => console.log('app import ok'))"
find . -name '.env.example' -o -name '*.env.example'
rg -n "sk_live|rk_live|whsec_|postgres://|postgresql://|RESEND_API_KEY=|SHIPPO_API_KEY=|SHIPPO_API_TOKEN=|EMAIL_FROM=|STRIPE_SECRET_KEY=|ADMIN_PASSWORD_HASH=" --glob '!node_modules/**' --glob '!client/dist/**' .
```

Results:

- Client build passed.
- Server build passed and generated Prisma Client.
- Client tests passed: 5 files, 14 tests.
- Server tests passed: 10 files, 28 tests.
- Server syntax checks passed.
- App import smoke check printed `app import ok`.
- No `.env.example` files found.
- Secret scan found only command text in this handoff, not committed secret values.

Local endpoint smoke checks:

- `GET /api/admin/notifications` unauthenticated: `401`.
- `PUT /api/admin/orders/test-order/tracking` unauthenticated: `401`.
- `GET /api/account/notifications` unauthenticated: `401`.
- `GET /api/checkout/shipping-options`: `200` with standard/priority server-owned methods.

Mermaid/doc checks:

- `mmdc` was not installed locally.
- Markdown fence balance check passed for `diagram.md`, `mockdiagram.md`, `data-flow.md`, and `admin.md`.

### Remaining Blockers

- Configure `EMAIL_FROM` or `RESEND_FROM_EMAIL` locally before live Resend testing.
- After setting the from address, perform the approved Resend tests to `alvarez.a.aaron@gmail.com`, max 10 emails, starting with forgot password.
- Railway must run `npx prisma migrate deploy` after review for `20260615000000_add_order_shipping_method` and any unapplied prior migrations.
- Shippo live tracking refresh still needs a real or predefined valid tracking test strategy; no label purchase should happen in Codex.
- Shippo webhook auto-processing remains intentionally receipt-only until real deployed payloads are verified.
- No browser E2E automation was added for admin notification panels or customer notification preferences.

### Safe-To-Review Status

Local code builds and tests pass. The implementation is safe for code review, but not ready for deployed launch until the Resend from-address env is configured, the Railway migration is deployed, and manual QA confirms live email delivery and admin/customer notification visibility.

## 2026-06-15 Admin Pages, Shippo Rate Shopping, And Email Verification Pass

This section supersedes the earlier same-day provider note that said `EMAIL_FROM` was missing. The current local `server/.env` variable-name audit found `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_FROM_EMAIL`, `EMAIL_REPLY_TO`, and `RESEND_REPLY_TO_EMAIL` present. Values were not printed or copied.

### Completed Code Changes

- Added dedicated admin pages:
  - `/admin/notifications` via `client/src/domains/admin/views/AdminNotificationsView.vue`.
  - `/admin/shipments` via `client/src/domains/admin/views/AdminShipmentsView.vue`.
  - `/admin/reports` via `client/src/domains/admin/views/AdminReportsView.vue`.
- Kept `/admin` compact by moving large notification/shipment blocks into the dedicated pages.
- Added client API `client/src/domains/admin/api/adminShipments.api.js`.
- Expanded notification API filtering in `client/src/domains/admin/api/adminNotifications.api.js`, `server/src/domains/emails/controllers/emailDelivery.controller.js`, `server/src/domains/emails/services/emailDelivery.service.js`, and `server/src/domains/emails/repositories/emailDelivery.repository.js`.
- Added protected `GET /api/admin/shipments` backed by the shipping route/controller/service/repository stack.
- Added checkout rate shopping endpoint `POST /api/checkout/shipping-rates`.
- Added Shippo rate mapping and rate-only shipment creation for checkout rate shopping. Checkout never buys labels.
- Preserved static Standard/Priority shipping fallback when Shippo config, sender address env, address data, or provider calls are unavailable.
- Updated checkout UI to request shipping rates after the address is present, display loading/fallback messages, and submit selected shipping `rateId`, carrier, service, provider, and method.
- Server checkout re-resolves the selected rate before PaymentIntent creation and order creation, so shipping price remains server-owned.
- Added nullable order fields:
  - `shippingCarrier`
  - `shippingService`
  - `shippingRateId`
  - `shippingRateProvider`
- Added migration `20260615001000_add_order_shipping_rate_fields`.
- Admin order detail, customer order detail, and order success now display carrier/service/rate source when present.
- Added tests for Shippo rate mapping, static shipping fallback metadata, and customer-safe shipping-rate fields.

### API Routes Added Or Updated

- `GET /api/admin/notifications?event=&status=&limit=`
- `GET /api/admin/shipments?status=&limit=`
- `POST /api/checkout/shipping-rates`

Protected route checks performed locally:

- `GET /api/admin/notifications` without admin session returned `401 Authentication required`.
- `GET /api/admin/shipments` without admin session returned `401 Authentication required`.
- `POST /api/webhooks/shippo` without the configured webhook secret returned `401 Invalid webhook secret`.

### Shippo Verification

Local env-name audit found `SHIPPO_API_KEY` present, but `SHIPPO_FROM_STREET1`, `SHIPPO_FROM_CITY`, `SHIPPO_FROM_STATE`, and `SHIPPO_FROM_ZIP` missing. Because sender address variables are required for rate shopping, `POST /api/checkout/shipping-rates` returned the static fallback with message `Carrier rates are unavailable. Store shipping rates are shown.`

No labels were purchased. No production shipment was created.

Required server variable names for live/test Shippo rate shopping:

- `SHIPPO_API_KEY` or `SHIPPO_API_TOKEN`
- `SHIPPO_FROM_NAME`
- `SHIPPO_FROM_STREET1`
- `SHIPPO_FROM_CITY`
- `SHIPPO_FROM_STATE`
- `SHIPPO_FROM_ZIP`
- `SHIPPO_FROM_COUNTRY`
- Optional: `SHIPPO_FROM_STREET2`, `SHIPPO_FROM_PHONE`, `SHIPPO_FROM_EMAIL`
- Optional parcel defaults: `SHIPPO_PARCEL_LENGTH`, `SHIPPO_PARCEL_WIDTH`, `SHIPPO_PARCEL_HEIGHT`, `SHIPPO_PARCEL_DISTANCE_UNIT`, `SHIPPO_PARCEL_WEIGHT`, `SHIPPO_PARCEL_MASS_UNIT`

### Resend Verification

Approved inbox used: `alvarez.a.aaron@gmail.com`.

Live emails sent in this pass: `6`, below the requested budget of `10`.

Recorded live `EmailDelivery` rows with provider `RESEND` and status `SENT`:

- `PASSWORD_RESET`: `Reset your Chase & Evie Co. password`.
- `ACCOUNT_VERIFICATION`: `Verify your Chase & Evie Co. email`.
- `ORDER_CONFIRMATION`: `Order DGE-1781505157834 confirmation`.
- `ORDER_SHIPPED`: `Order DGE-1781501526357 has shipped`.
- `TRACKING_UPDATE`: `Tracking update for order DGE-1781501526357`.
- `PROFILE_UPDATED`: `Your Chase & Evie Co. profile was updated`.

What was not fully end-to-end verified:

- Profile update was verified through the account service and email provider path, not browser/customer session API, because the test account password was not available.
- Order resend emails were verified through the order service/email provider path, not admin UI/API, because no plaintext admin password was available in code and secrets were not exposed.
- Review request was not sent because no approved-inbox local order was already `DELIVERED`; the service correctly gates review requests to delivered orders.
- Apple Mail inbox search was not automated from this workspace. The database and Resend provider acknowledgements show sent delivery records; inbox receipt still requires user confirmation.

### Shipping Spoofing Verification

Local smoke request sent `shipping.price: 999` with method `priority` to `POST /api/checkout/preview`. Server response used trusted `shippingAmount: 11.99`, proving client-submitted shipping price was ignored for totals.

### Verification Commands

```bash
git status --short --branch
git diff --stat
git diff --name-status
node --check src/domains/checkout/services/checkout.service.js
node --check src/domains/checkout/controllers/checkout.controller.js
node --check src/domains/shipping/services/shippo.service.js
node --check src/domains/shipping/services/shipping.service.js
node --check src/domains/shipping/controllers/shipping.controller.js
node --check src/domains/emails/services/emailDelivery.service.js
cd server && npx prisma generate
cd server && npx prisma migrate dev --name add_order_shipping_rate_fields
cd client && npm run build
cd client && npm run test
cd server && npm run build
cd server && npm run test
cd server && npx prisma migrate status
cd server && node -e "import('./src/app.js').then(()=>console.log('app import ok'))"
curl http://localhost:3000/api/checkout/shipping-rates
curl http://localhost:3000/api/checkout/preview
curl http://localhost:3000/api/admin/notifications
curl http://localhost:3000/api/admin/shipments
curl http://localhost:3000/api/webhooks/shippo
```

Results:

- Client build passed.
- Client tests passed: 5 files, 14 tests.
- Server build passed and generated Prisma Client.
- Server tests passed: 10 files, 30 tests.
- Prisma migrate status passed with 16 local migrations and database schema up to date.
- Server app import passed with `app import ok`; Better Auth emitted a warning that `BETTER_AUTH_SECRET` should be at least 32 characters.

### Remaining Risks

- Railway must run `npx prisma migrate deploy` for `20260615001000_add_order_shipping_rate_fields` after review.
- Shippo rate shopping needs sender address env variables before live/test carrier rates can be returned.
- Admin pages need browser manual QA after deploying/restarting because terminal smoke checks only verified route protection and API responses.
- Review request email remains unverified for the approved inbox until a delivered order exists.
- Better Auth secret length warning should be resolved in environment configuration with a stronger secret value.

## 2026-06-17 Documentation Operating Model Restructure

This docs-only pass reorganized the oversized project instructions into a concise operating hub plus focused durable documents. No application code was intentionally changed in this pass.

### New Documentation Structure

- `AGENTS.md`: concise permanent entry point, required reading order, core architecture/security/deployment/database/verification rules, and links to focused docs.
- `docs/product-philosophy.md`: premium product philosophy, progressive disclosure, customer/admin usefulness, and feature-design checklist.
- `docs/ux-ui-standards.md`: Tailwind-first styling, visual-system expectations, motion rules, and UI completeness requirements.
- `docs/customer-experience.md`: customer account, profile, orders, order-help, checkout, Apple Pay/Google Pay disabled-state, and shipping-rate UX requirements.
- `docs/admin-experience.md`: admin workspace philosophy, dashboard rules, Order Issues, Internal Issues, Email Template Center, promo email tooling, and save/send separation for order updates.
- `docs/communications.md`: manual-first email policy, account-first communications, send controls, template/provider rules, Resend/Shippo rules, and excluded SMS/Apple Messages channels.
- `docs/operations-and-issues.md`: suggested OrderIssue, OrderIssueMessage, OrderIssueEvent, InternalIssue, and InternalIssueEvent architecture and ownership/audit rules.
- `docs/implementation-roadmap.md`: three-run implementation roadmap and the exact recommended Run 1 prompt.
- `docs/verification-and-qa.md`: repair/launch-readiness priorities, interrupted-work verification, provider verification, docs checks, and final-report requirements.
- `docs/architecture/*`: remains the current architecture/file-flow/database/admin/auth reference set.

### Rules Moved

- Product and feature philosophy moved out of `AGENTS.md` into `docs/product-philosophy.md`.
- Tailwind, visual system, animation, responsive, state, and accessibility standards moved into `docs/ux-ui-standards.md`.
- Customer account/profile/order/checkout/order-help requirements moved into `docs/customer-experience.md`.
- Admin dashboard/tooling/email-template/order-update requirements moved into `docs/admin-experience.md`.
- Resend, Shippo, manual-send, provider, template, dry-run, approved-inbox, no-bulk, no-secret, no-SMS rules moved into `docs/communications.md`.
- Order issue and internal issue model direction moved into `docs/operations-and-issues.md`.
- Repair, verification, provider retry, docs validation, and final-report rules moved into `docs/verification-and-qa.md`.
- Three-run product/admin/final-integration plan moved into `docs/implementation-roadmap.md`.

### Important Policy Changes

- Manual-first email policy is now explicit: automatic emails are limited to essential account/security messages and intentionally retained order confirmation. Order updates, tracking, delivered, support replies, issue resolutions, review requests, apology, promo, and marketing emails require explicit admin action unless the user changes this policy later.
- In-account communication is the default direction for customer issues and order updates.
- Customer-facing email activity history and preferred communication method controls should be removed in the next customer UX implementation pass.
- Twilio/SMS and Apple Messages for Business remain excluded unless the user explicitly requests them.
- Apple Pay and Google Pay should remain disabled/future-only, with copy such as `Coming Fall 2026`, until a complete payment-sheet flow is intentionally built.
- Admin tracking/order status save flows should be separated from customer-send flows.

### Current Three-Run Roadmap

Run 1: Product philosophy, customer account redesign, checkout UX, and supporting database changes.

Run 2: Admin redesign, Order Issues, Internal Issues, and Email Template Center.

Run 3: Final integration, Shippo/email workflows, polish, animations, QA, docs, and launch-readiness report.

### Validation Notes

This pass should be validated with docs-only checks:

- Internal Markdown links for new docs.
- Markdown fence balance.
- Mermaid fence checks if Mermaid blocks are touched.
- Search for outdated automatic-email guidance.
- Search for old Twilio/SMS requirements.
- Search for duplicated product philosophy.
- Search for references to deleted/moved sections.
- Confirm no secret values were copied.
- `git diff --check`.

Client/server builds are not required for this docs-only phase.

### Recommended Run 1 Prompt

```text
Read AGENTS.md, PROJECT_HANDOFF.md, docs/product-philosophy.md, docs/ux-ui-standards.md, docs/customer-experience.md, docs/communications.md, docs/operations-and-issues.md, docs/implementation-roadmap.md, docs/verification-and-qa.md, and relevant docs/architecture files first.

Start Run 1 from docs/implementation-roadmap.md.

Do not start a broad refactor. Do not commit or push. Preserve guest checkout, Better Auth customer accounts, existing admin dashboard behavior, checkout payment correctness, server-owned totals, and current architecture patterns.

First run git status, git diff --stat, and git diff --name-status. Audit current account, profile, orders, checkout, shipping, and support-related files. Preserve existing uncommitted work.

Implement the customer-facing Run 1 scope end-to-end:
- account navigation hub
- account overview cleanup with max two recent orders
- useful empty states with featured products where appropriate
- profile redesign with stored-information card, verified email state, resend verification UX, no customer email activity, and no preferred communication controls
- default shipping address foundation/editing when supported safely
- orders split-view or mobile-friendly drill-in pattern with month grouping
- conditional order detail sections with product images and selected shipping method visibility
- removal of customer-facing internal timeline
- Need Help/order issue foundation with seven-day delivery eligibility and customer-safe case direction
- signed-in checkout prefilling without silently overwriting saved profile data
- Apple Pay/Google Pay disabled or future-only messaging such as Coming Fall 2026
- Shippo carrier-rate root-cause investigation and customer-safe fallback rate UX
- server-owned shipping verification preserved across preview, PaymentIntent, and order creation
- Tailwind-first polish, subtle motion, responsive states, accessibility, and tests

Do not send automatic order/tracking/support/review/promo emails. Keep manual-first communication policy intact.

Run required verification, update PROJECT_HANDOFF.md and relevant docs, and provide files changed, commands/results, remaining risks, manual QA, and whether the tree is safe for commit review.
```

## 2026-06-17 Product Experience Run 1 / Order Issues Foundation

This pass implemented the first customer-facing product experience slice plus support-case foundations. It preserved guest checkout, Better Auth customer accounts, custom admin auth, checkout totals, Stripe behavior, and manual-first email policy.

### Implemented

- Customer account dashboard now caps recent orders at two and removes customer-facing lifetime spend.
- Dashboard now emphasizes useful state: order count, latest order status, email verification, and open order issue count.
- Profile page removes customer-facing email activity and preferred contact method controls.
- Profile page adds editable default shipping address using `CustomerProfile.defaultAddress`.
- Signed-in checkout prefills name, fixed account email, phone, marketing opt-in, and default shipping address only where checkout fields are empty.
- Customer orders page now uses a responsive split-view/order-list pattern with month grouping and in-page selected order detail.
- Customer order detail hides internal status history, hides zero discount/donation rows, shows product images when stored snapshots exist, and adds a protected Need Help flow.
- Need Help flow creates customer-visible order issue cases with category, affected-item context, description, friendly case number, and confirmation.
- Customer order issues enforce ownership through Better Auth customer account routes.
- Delivered-order issue eligibility uses server-side delivery data. If an order has a shipment `deliveredAt`, that timestamp is trusted. If no shipment timestamp exists but the order status is `DELIVERED`, the code falls back to the order `updatedAt`; this fallback is documented as a remaining precision limitation.
- Pre-delivery orders only expose delivery, tracking, billing, and general help categories.
- Admin dashboard links to new Order Issues and Internal Issues tools.
- Admin Order Issues supports search/filter, status/priority updates, resolution summary, internal notes, and customer-visible account replies.
- Saving an issue or note does not send email. A checkbox can mark email follow-up requested, but sending remains a separate future template action.
- Internal Issues model/API/admin page added for safe operational issue review. Unexpected Express 500s are recorded with sanitized route/source/summary context and a fingerprint.
- Support and internal issue endpoints follow route -> controller -> service -> repository -> Prisma.

### Prisma Models And Migration

Migration added locally and applied to the local database:

- `server/prisma/migrations/20260617000000_add_order_and_internal_issues/migration.sql`

Schema additions/changes:

- Extended `CustomerSupportRequest` with `caseNumber`, `category`, `priority`, `resolutionSummary`, `deliveryEligibilityEndsAt`, `resolvedAt`, and `closedAt`.
- Added `CustomerSupportMessage`.
- Added `CustomerSupportEvent`.
- Added `InternalIssue`.
- Added `InternalIssueEvent`.
- Added `Order.supportRequests` relation.

Railway/deployed database step remaining:

```bash
cd server
npx prisma migrate deploy
```

Run only after confirming the Railway `DATABASE_URL` target is correct. Do not use `prisma migrate reset`.

### API Endpoints Added

Customer, Better Auth protected:

- `GET /api/account/issues`
- `GET /api/account/issues/:caseNumber`
- `POST /api/account/orders/:reference/issues`

Admin, custom admin-auth protected:

- `GET /api/admin/order-issues`
- `PATCH /api/admin/order-issues/:caseNumber`
- `POST /api/admin/order-issues/:caseNumber/messages`
- `GET /api/admin/internal-issues`
- `PATCH /api/admin/internal-issues/:caseNumber`

### Automatic Email Events

No new automatic order, tracking, support, issue-resolution, apology, promo, review, or marketing emails were added.

Removed automatic profile-update email queueing from account profile saves. Essential account/security emails remain governed by Better Auth/email provider behavior.

### Verification Results

Commands run:

```bash
cd server && npx prisma format
cd server && npx prisma generate
cd client && npm run build
cd server && npm run test
cd client && npm run test
cd server && npm run build
cd server && npx prisma migrate status
cd server && npx prisma migrate dev --name add_order_and_internal_issues
cd server && npx prisma migrate status
git diff --check
```

Results:

- `npx prisma format`: passed.
- `npx prisma generate`: passed.
- Client build: passed.
- Server tests: passed, 11 files and 34 tests after adding order issue tests.
- Client tests: passed, 5 files and 14 tests.
- Server build: passed and regenerated Prisma Client.
- Initial `npx prisma migrate status`: failed only because the new migration was unapplied locally.
- `npx prisma migrate dev --name add_order_and_internal_issues`: applied the migration locally and regenerated Prisma Client.
- Final `npx prisma migrate status`: passed, local database schema is up to date.
- `git diff --check`: passed.

### Remaining Risks And Partial Work

- Browser manual QA is still required for the new customer order issue modal, profile address editor, orders split-view, admin Order Issues page, and admin Internal Issues page.
- Railway migration is not applied by this pass.
- Internal issue capture currently covers unexpected Express error middleware paths only; provider-specific dedupe capture for Shippo/Resend/checkout failures should be expanded in the next run.
- Email Template Center, promo email workflow, and explicit Send customer update actions remain future work.
- Admin dashboard was extended with issue links and metrics but not fully reorganized into the suggested operational sections.
- Order issue admin email follow-up is marked only; no template preview/send flow exists yet.
- Delivered eligibility precision depends on `OrderShipment.deliveredAt` when available. Older delivered orders without shipment timestamps fall back to `Order.updatedAt`.

### Manual QA Checklist

- Sign in as a customer and open `/account`.
- Confirm dashboard shows no lifetime spend and only two recent orders.
- Edit profile name, phone, marketing opt-in, and default shipping address.
- Confirm checkout prefills saved address only into empty fields and does not overwrite saved profile on checkout-only edits.
- Open `/account/orders`, use search/filter, expand older month groups, and select orders without a full page reload.
- Open an order detail, confirm product images/pricing rows render correctly and internal status history is absent.
- Submit a Need Help issue on an eligible order and confirm the case number appears.
- Confirm expired delivered-order issues are rejected after the seven-day window.
- Open `/admin/order-issues`, filter/search, update status/priority, add an internal note, and add a customer-visible reply.
- Confirm no email is sent automatically when saving issue changes.
- Open `/admin/internal-issues` and review filters/status/resolution notes.

### Safe For Commit Review

Yes, with the caveat that the new Prisma migration must be reviewed and deployed to Railway separately before deployed code requiring these tables is released.

## 2026-10-08 Approved Calm Essentials Account UI

### Scope And Repository State

Applied the user-approved complete account preview. All seven tabs are retained. The original month-grouped split Orders design is preserved rather than the later simplified draft.

Started with a dirty tree containing prior accepted customer/support/admin/server/schema edits; inspected status, diff statistics, and changed paths before editing. Preserved those unrelated edits. This pass changes client UI and documentation only: no auth replacement, checkout rebuild, admin rebuild, server changes, schema/migrations, provider sends, env files, commits, or pushes.

### Connected Features

- One protected parent AccountLayout with the existing storefront header/footer/search/cart and shared Better Auth state.
- Overview: two recent orders maximum, real order/latest status/open case stats, profile/address summary, shopping/account links.
- Orders: reference/product search, status filter, month groups, eight-row display window, Load more, persistent selection/filter/expanded-month state between tabs, explicit refresh, responsive selected-order details.
- Inline and standalone order details share one component: server totals, items/variant/quantity/unit and line price, shipping snapshots/method, safe carrier link, tracking updates, support eligibility/cases. Zero discount/donation rows remain hidden; donation impact is not an extra charge.
- Profile: focused personal-details and preference editors, marketing opt-in/out, read-only email/verification state, existing password reset entry.
- Addresses: current default shipping address editor using the existing profile API. Additional addresses/billing are future-phase sections.
- Order help: real case list, selected case, customer-visible replies/resolutions; eligible order requests use the existing protected API with server-owned categories/deadlines.
- Rewards and Wishlist: dedicated sidebar routes with clearly labeled future-phase content; no fake balances, favorites, review/reorder actions, or transactions.
- Dialogs: Save/Cancel, input focus, focus trap/restore, scroll lock, idle Escape/backdrop close, retained form/error on failed save.
- Sign-out from either header or sidebar leaves protected content and destroys the Orders cache.
- Verified tablet header overflow fixed by changing existing desktop/compact breakpoints only.

### Files Created

Under `client/src/domains/account/`:

- Components: `AccountLayout.vue`, `AccountDialog.vue`, `AccountStatusBadge.vue`, `AccountOrderDetails.vue`, `AccountOrderIssueDialog.vue`, `AccountProfileEditor.vue`, `AccountCaseDetail.vue`.
- Composables: `useAccountDashboard.js`, `useAccountOrderHistory.js`, `useAccountOrderIssue.js`, `useAccountProfileEditor.js`, `useAccountHelp.js`.
- Views: `AccountAddressesView.vue`, `AccountHelpView.vue`, `AccountFutureView.vue`.
- `constants/account.constants.js`, `mappers/accountProfile.mapper.js`, `utils/accountFormatting.js`, `utils/orderHistory.js`, `styles/account.css`.
- Tests: `client/tests/tier2/account/account-profile-mapper.test.js`, `client/tests/tier3/account/account-history.test.js`.

### Files Modified In This Pass

- `client/src/app/router/index.js`: protected nested account routes, including addresses/help/rewards/wishlist; existing route names and standalone order detail preserved.
- `client/src/app/layouts/SiteHeader.vue`: tablet-safe breakpoints only.
- Account `api/account.api.js`: existing single-case endpoint wrapper.
- Account components `AccountShell.vue`, `AccountNav.vue`, `AccountOrderCard.vue`.
- Account `composables/useAccountOrders.js`: isolated sequenced detail loading; removed unused duplicate list/submission logic.
- Account `validators/account.validators.js`: default address completeness check.
- Account views `AccountDashboardView.vue`, `AccountOrdersView.vue`, `AccountOrderDetailView.vue`, `AccountProfileView.vue`.
- This handoff and [customer experience](docs/customer-experience.md), [data flow](docs/architecture/data-flow.md), [file map](docs/architecture/file-map.md).

### Safety And Sources Of Truth

The existing profile PUT replaces fields, so each focused save sends the complete mapped profile/preferences/address and preserves untouched values. Fresh profile data is loaded when opening an editor. Concurrent editing in another browser can still conflict because the API has no version/patch contract.

The new view does not calculate checkout/order totals. APIs remain credentialed through the existing helper. Server ownership, verified-email matching, support category/eligibility/rate limits, and manual-first communications remain unchanged. Customer replies, a general message center, multiple addresses, separate billing address, rewards, referrals, wishlist, reviews, and reorder are not implemented by this UI pass.

Orders uses client display pagination; the server still returns the entire history. Cached state lasts only within the account layout and is keyed to shared customer identity. Refresh orders retrieves current list/detail snapshots. Existing server payment-status mapping is displayed as provided; this pass does not improve refund/payment reconciliation.

### Verification Commands And Results

- Initial `git status --short --branch`, `git diff --stat`, `git diff --name-status`: prior local changes identified and preserved.
- `cd client && npm run build`: initial default Node 22.15.0 attempt stalled before compilation and was stopped (exit 143). Rerun with the bundled Node 24.19.0 on PATH passed; final Vite 8.0.9 build transformed 257 modules with no build warnings.
- `cd client && npm test`: passed, 7 files / 21 tests (tier 1: 7, tier 2: 8, tier 3: 6). Seven new assertions/tests cover preservation, marketing opt-out, address validation, search/groups, quantity counting, invalid dates, and safe tracking URLs.
- `cd server && npm test`: regression suite passed, 11 files / 34 tests (28 + 3 + 3). No server build/generate/migration needed because this pass does not change server or Prisma files.
- Temporary Playwright harness `node /tmp/doggy-account-ui-qa.cjs` with bundled Playwright and headless Chrome: passed using intercepted fixture APIs, not real customer/database/provider writes. Browser screenshots inspected at 1440, 1280, 1024, 768, and 390 widths.
- `npm run dev -- --port 5174 --strictPort` with the bundled runtime provided a temporary QA server, stopped after verification. The user's existing frontend on port 5173 and backend were not stopped or reconfigured.
- Browser verified: all seven tabs; one header; 20-order load-more/search/status/empty states; selection persistence; slow-response protection; mobile list/detail/back; profile/address save/cancel/error retry; marketing opt-out; focus trap/Escape; support submission/case replies/internal-message exclusion; ineligible order support; direct detail route; sidebar/header sign-out/cache clearing; unauthenticated redirect/sign-in return; cart retained; no Vue/runtime errors or horizontal overflow. Expected fixture 500/401/404 responses exercised error handling.
- A formatting-induced Vue template error was caught and fixed before final checks. Verification harness selector/route-matching issues were corrected and the complete harness rerun successfully.
- Existing lint script: none; none added. No application dependency or lockfile changes. Prettier was used as a temporary formatter only.
- Documentation fence/relative-link check: passed for all four touched Markdown files with zero issues. Final `git diff --check`: passed.
- Targeted secret-pattern scan returned no matches; no `.env.example` files found. No env values were read, changed, or documented.

### Remaining Risks And Manual QA

1. Sign in with a real account; navigate every tab on desktop/mobile/Safari; verify cookies and refresh persistence.
2. Edit name/phone, cancel, save, reload; confirm header identity and that address/preferences remain unchanged.
3. Edit default address; verify only empty checkout fields are prefilled and existing orders retain their snapshots.
4. Opt out/in of marketing, reload, verify preferences. Saving must not send an email.
5. Use real order history (including more than eight orders), search/filter/load/refresh/select older orders; verify product images and monetary snapshots.
6. Submit one approved test support request on an eligible order; verify admin receives it, customer-visible reply/resolution appears, internal notes do not appear, and expired/foreign orders are rejected. No automatic provider email.
7. Verify guest and signed-in checkout, promo/campaign combinations, success page, and existing admin pages in the real environment. This pass did not rerun live Stripe payments or deploy.
8. Rewards/Wishlist and other future sections must remain honest placeholders without accidental writes.
9. Review the earlier support migration `20260617000000_add_order_and_internal_issues` and Railway status before deploying the combined dirty tree. This pass did not apply or inspect Railway migrations.

Safe for focused commit review after the documented checks, but not a claim that the combined prior server/migration edits are deployed or launch-verified. No commit/push performed. Next phase: real-account/Safari/checkout/support QA before expanding the address book or customer messaging.

## 2026-10-08 Approved Calm Workspace Admin UI

### Scope And Repository State

Applied the approved Calm Workspace across all eleven existing admin tabs, with connected existing APIs rather than demo records. Preserved custom admin auth, customer Better Auth, server authorization, startup data-target configuration, existing API contracts/mappers/validators, storefront/account/checkout, and all prior local edits.

Before editing, inspected AGENTS.md, this handoff, product/UX/admin/communications/operations/roadmap/architecture/QA docs and ran git status, diff statistics, and changed-path inventory. The tree already contained accepted account/support/server/schema work. This phase changes client UI, one icon dependency, focused tests, and documentation only. No server/schema/env changes, migrations, deployments, real provider actions, commits, or pushes.

### Connected Experience

- Shared AdminLayout: one header and grouped sidebar, eleven route links, mobile navigation, active-route state, skip link, View store/sign-out, signed-in identity, read-only Data routing with the existing backend-derived badge.
- Overview: three concise metrics, priority links for pending orders/issues/email/internal failures, three recent orders. Sources load independently; failures are unavailable, not invented zeroes.
- Products: status/category/SKU search, one responsive table, real variant prices/stock, create/edit/cancel/save/delete. Editor has Details, Variants & Stock, Storefront Content, and Publishing. Inventory attention is restricted to inventory-limited products and stored low-stock thresholds.
- Promos: searchable/type/status library, focused rules/limits/schedule editor, explicit Save/Cancel, code generation, tester, in-page analytics/redemptions and order links. Tester requires normalized customer email, clears stale results after changes, and displays the server-returned discount.
- Campaigns: searchable/status library, beneficiary/rule/product/schedule editor, explicit Save/Cancel/delete, and in-page impact/attributed-order links. Generated donations are not described as payouts.
- Orders: reference/customer/email/phone/city search and status table including refunded orders; focused detail with items, server-owned totals, contact/shipping, promo/campaign snapshots, staged status Save/Cancel/history, tracking save/refresh, and separate existing manual email actions.
- Customers: account/verification/role/order metrics, linked and verified-email matched guest orders, provider history, deliberate confirmed deactivate/reactivate/security-email requests with busy/error feedback. No passwords/sessions/tokens or new account permissions are exposed.
- Shipments: provider configuration state, status filters, tracking/carrier/history/order links, and failure/empty/loading states.
- Notifications: event/status delivery history, explicit mocked/sent/failure distinctions, future Template center tab. No editable templates or bulk sends are implemented.
- Reports: truthful all-time operational summaries. The existing totalRevenue API sums all stored orders, so the UI calls it Order value, not reconciled paid revenue. Date ranges/charts/exports remain future work.
- Order/Internal Issues: focused list/detail, staged Save/Cancel, busy/error feedback, failed-write draft retention, filtered-selection repair, and real event history. Internal notes are separate from customer-visible replies. Marking email follow-up does not send email.
- Future template/promo email/reconciled reports/customer notes/activity/reviews/loyalty sections are visibly unconnected. Existing working resend/tracking/customer actions remain available.

### Verified Issues Fixed

- Promo rule watcher previously returned a fresh watched array then replaced its own form object, causing recursive Vue updates. It now watches individual primitive sources. The new test suite exposed this; the complete suite was rerun cleanly.
- Admin promo tester previously described email as optional despite server email eligibility rules. It now requires/normalizes email and discards stale test/analytics responses.
- Older grouped Orders UI omitted REFUNDED records from every group. The new single filtered table includes all returned statuses.
- Several operational views failed silently or lacked error/busy states; their new composables preserve the last loaded data or unsaved draft and surface failures.
- Issue selection could remain pointed at a case excluded by new filters. Selection now matches the loaded list, and Cancel restores server values.
- Shared nested detail routes are keyed by path to prevent stale order/customer data when navigating between IDs.
- CSS initially lacked a Tailwind reference for @apply; build failure was fixed with @reference.
- Responsive button utilities were overridden by the shared unlayered button style; desktop/mobile navigation display is now explicit.
- Select fields now have explicit accessible names matching visible labels.
- A formatter removed semicolons from a multi-statement Vue schedule handler; compile failure was fixed by extracting the named clearPeriod handler, then rebuilding and rerunning the browser checks.

### Files Created

- `client/src/domains/admin/api/adminSession.api.js`
- `client/src/domains/admin/components/AdminCampaignImpact.vue`
- `client/src/domains/admin/components/AdminIcon.vue`
- `client/src/domains/admin/components/AdminIssueHistory.vue`
- `client/src/domains/admin/components/AdminLayout.vue`
- `client/src/domains/admin/components/AdminMetrics.vue`
- `client/src/domains/admin/components/AdminPageHeader.vue`
- `client/src/domains/admin/components/AdminProductContentFields.vue`
- `client/src/domains/admin/components/AdminProductVariantsEditor.vue`
- `client/src/domains/admin/components/AdminPromoAnalytics.vue`
- `client/src/domains/admin/components/AdminScheduleFields.vue`
- `client/src/domains/admin/composables/useAdminActivity.js`
- `client/src/domains/admin/composables/useAdminIssueWorkspace.js`
- `client/src/domains/admin/composables/useAdminOrderDetail.js`
- `client/src/domains/admin/composables/useAdminOrderIssues.js`
- `client/src/domains/admin/composables/useAdminOverview.js`
- `client/src/domains/admin/constants/adminNavigation.constants.js`
- `client/src/domains/admin/constants/adminSupport.constants.js`
- `client/src/domains/admin/utils/adminWorkspace.formatters.js`
- `client/tests/tier2/admin/admin-workspace.test.js`

### Files Modified In This Phase

The two issue views existed in the starting tree as untracked earlier work; they are modified here, not claimed as newly created by this phase.

- `client/src/assets/styles/admin.css`
- `client/src/domains/admin/components/AdminCampaignForm.vue`
- `client/src/domains/admin/components/AdminCampaignsLibrary.vue`
- `client/src/domains/admin/components/AdminCampaignsTable.vue`
- `client/src/domains/admin/components/AdminCustomerNotificationsPanel.vue`
- `client/src/domains/admin/components/AdminCustomerOrdersPanel.vue`
- `client/src/domains/admin/components/AdminCustomersTable.vue`
- `client/src/domains/admin/components/AdminHeader.vue`
- `client/src/domains/admin/components/AdminOrderNotificationsPanel.vue`
- `client/src/domains/admin/components/AdminOrderStatusPanel.vue`
- `client/src/domains/admin/components/AdminOrderTrackingPanel.vue`
- `client/src/domains/admin/components/AdminProductFormPanel.vue`
- `client/src/domains/admin/components/AdminProductVariantEditor.vue`
- `client/src/domains/admin/components/AdminProductsTable.vue`
- `client/src/domains/admin/components/AdminPromoFormExtraFields.vue`
- `client/src/domains/admin/components/AdminPromosLibrary.vue`
- `client/src/domains/admin/components/AdminSidebar.vue`
- `client/src/domains/admin/composables/useAdminCampaigns.js`
- `client/src/domains/admin/composables/useAdminOrders.js`
- `client/src/domains/admin/composables/useAdminProducts.js`
- `client/src/domains/admin/composables/useAdminPromos.js`
- `client/src/domains/admin/views/AdminCampaignsView.vue`
- `client/src/domains/admin/views/AdminCustomerDetailView.vue`
- `client/src/domains/admin/views/AdminCustomersView.vue`
- `client/src/domains/admin/views/AdminDashboardView.vue`
- `client/src/domains/admin/views/AdminNotificationsView.vue`
- `client/src/domains/admin/views/AdminOrderDetailView.vue`
- `client/src/domains/admin/views/AdminOrdersView.vue`
- `client/src/domains/admin/views/AdminProductsView.vue`
- `client/src/domains/admin/views/AdminPromosView.vue`
- `client/src/domains/admin/views/AdminReportsView.vue`
- `client/src/domains/admin/views/AdminShipmentsView.vue`
- `client/src/domains/promos/components/PromoCodeTester.vue`
- `client/src/domains/promos/components/PromoForm.vue`
- `client/src/domains/admin/views/AdminInternalIssuesView.vue`
- `client/src/domains/admin/views/AdminOrderIssuesView.vue`
- `client/src/app/router/index.js`
- `client/package.json`
- `client/package-lock.json`
- `PROJECT_HANDOFF.md`
- `docs/admin-experience.md`
- `docs/architecture/admin.md`
- `docs/architecture/file-map.md`
- `docs/verification-and-qa.md`
- `docs/implementation-roadmap.md`

### Architecture And Sources Of Truth

Admin navigation is centralized in adminNavigation.constants.js. AdminLayout owns shared identity/data routing, and adminSession.api.js wraps the existing credentialed auth endpoints. The login page and existing route guard remain unchanged; server-side requireAdminAuth remains the security boundary.

Existing product/promo/campaign APIs, mappers, and validators still serialize/validate saves. AdminScheduleFields only edits paired date/time fields; existing datetime/timezone behavior is preserved, not redesigned. Product variant fields use the original size keys and mapper contract.

State additions are focused: useAdminOverview aggregates existing protected reads; useAdminActivity handles delivery/shipment loading; useAdminOrderDetail owns record actions; useAdminIssueWorkspace shares issue selection/staging; useAdminOrderIssues owns reply drafts. Icons are centralized through @lucide/vue. Tailwind remains primary, and admin styling is scoped in admin.css.

No new endpoints, role changes, auth bearer fallback, schema models, migrations, runtime data-target switches, checkout pricing, or provider automation were introduced. The temporary workflow remains local client -> local server -> selected local/Railway database. Badge fallback behavior is unchanged: when its API fails, it falls back to startup client configuration; confirm the backend before a real write.

Some obsolete list/header/stat/group/modal components remain unused by the new route views. Remove those only after a dedicated import audit. Existing list endpoints still return broad/full data sets; client-side filtering is not server pagination.

See [admin experience](docs/admin-experience.md), [admin architecture](docs/architecture/admin.md), [file map](docs/architecture/file-map.md), [verification](docs/verification-and-qa.md), and [roadmap](docs/implementation-roadmap.md).

### Verification Commands And Results

- Initial git status --short --branch, git diff --stat, git diff --name-status: inspected and preserved prior edits; branch dev-main remains ahead by two pre-existing commits.
- npm install @lucide/vue: succeeded; package/lockfile add the icon dependency only. Deprecated lucide-vue-next was tried and removed; it is not in the final dependency list.
- cd client && npm run build: final Vite 8.0.9 production build passed, 2142 modules transformed, no build warnings. Initial Tailwind reference and post-format schedule expression errors were repaired before the final pass.
- cd client && npm test: final pass 8 files / 30 tests (tier 1: 7, tier 2: 17, tier 3: 6). Nine new tests cover navigation boundaries, SKU/category filtering, cancel without writes, email normalization, stale responses, activity failures, selection repair, and failed-save retry. Initial new-test run detected recursive watcher updates; fixed and rerun.
- cd server && npm test: unchanged-server regression suite passed, 11 files / 34 tests (28 + 3 + 3). No server build/generate/migration required by this client-only phase.
- npm exec --yes --package=prettier -- prettier --write --single-quote --no-semi [focused changed client files]: passed as temporary tooling only; no formatter or lint dependency/script added.
- npm audit --omit=dev --json in client: exit 1, 10 existing advisories (2 moderate, 8 high), also reported before the icon dependency. No automatic dependency upgrades/audit fix were attempted.
- npm run dev:local -- --port 5174 --strictPort: temporary QA server started successfully; stopped at completion. Existing frontend 5173/backend were not stopped or reconfigured.
- node /tmp/doggy-admin-workspace-qa.cjs using bundled Playwright/headless Chrome: passed. All eleven tabs at 1440/1024/768/390/320 widths; 16 intercepted fixture requests exercising saves/auth/validation, zero real database/provider writes.
- Browser checked product cancel/update with distinct prices and preserved fields, promo edit/schedule/email requirement/invalidation/analytics link, campaign selection/save/impact link, refunded orders, staged status cancel/save/history, detail ID navigation, tracking save, an explicitly clicked mocked email resend, customer deactivate/reactivate, support failed-save retry/internal note/account reply/filter selection, internal notes, load errors/retry, future sections, both backend target badge labels, mobile navigation, direct-route guard/login return/logout, reduced-motion/dark mode, and return to storefront without admin shell.
- Final browser run had zero Vue/runtime/console errors and zero horizontal overflow in the tested screens. Earlier harness selector issues and an intentionally blocked eager Stripe loader were corrected in the harness; Stripe.js is stubbed for this admin-only fixture QA, not changed in app code.
- Screenshots inspected for overview/products/promos/campaigns/issues/editor/order detail and mobile layouts. Product image in screenshots is a local fixture asset, not a claim about live catalog photography.
- Existing http://localhost:5173/admin returned HTTP 200. This confirms the development page is reachable, not a real authenticated DB verification.
- Documentation relative-link/fence checks, secret-pattern/environment-example checks, and final git diff --check: see final verification note below.

### Remaining Risks And Manual QA

1. Real admin login/session persistence/logout on Safari and the deployed environment remain unverified. Existing cross-site cookie limitations are unchanged; use local admin -> local server -> Railway DB for the temporary workflow.
2. Start fully local server/client, verify LOCAL DATA TARGET, and use an approved local test record for product/promo/campaign CRUD; confirm values persist after reload.
3. Start Railway DB server with the normal local client, verify RAILWAY DB TARGET and network origin before an explicitly approved test write; confirm Vercel storefront receives only intended changes.
4. Verify product content/analysis, size prices/stock/SKUs/thresholds, selling modes, promo unique/referral limits/date boundaries, campaign eligibility and combined checkout calculations with real test data.
5. Test order status Cancel/Save/history, tracking save/refresh/provider-disabled behavior, separate email action, issue resolution/account reply/internal note privacy, and customer account actions. Real emails require explicit approval and an approved inbox.
6. Recheck guest and signed-in checkout, cart variants, Stripe test payment, success page, promo/campaign coexistence, and customer ownership after deployment. No live payment was performed in this phase.
7. Review earlier support migration 20260617000000_add_order_and_internal_issues and confirm Railway migration status before deploying the combined dirty tree; no Railway migrations were inspected or applied here.
8. Schedule a focused dependency advisory remediation pass. Large catalog/order/customer histories still need server pagination; reporting still needs payment reconciliation and date-range endpoints.
9. Existing schedule timezone interpretation, badge fallback on API failure, data-refresh snapshots, and older unused UI components remain follow-up items.

Safe for focused commit review after the documented checks, not a claim that all prior server/schema changes are launch-ready or deployed. No commit or push performed. Recommended next phase: controlled real-admin/Safari and data-target QA, then approved email template/manual-send workflows and dependency security remediation.
