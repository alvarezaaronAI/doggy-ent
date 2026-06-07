# File Map

Last updated: 2026-06-07

This file maps important files and folders. It is not a complete line-by-line inventory of every Vue component, but it accounts for the source files that own major behavior and data flow.

## Root And Config

| File | Purpose | Dependencies | Flow Participation |
| --- | --- | --- | --- |
| `AGENTS.md` | Project-specific Codex instructions, active cleanup phases, launch-readiness rules, env policy, storefront bug requirements, and documentation requirements. | None. | Governs refactor/repair workflow. |
| `PROJECT_HANDOFF.md` | Long-form project continuity document. | Repository evidence. | Tracks completed work, risks, verification, launch notes. |
| `package.json` | Root workspace metadata/scripts if present. | npm. | Not the primary client/server command source. |
| `client/package.json` | Client scripts and dependencies. | Vite, Vue, Stripe.js. | Defines `dev`, `dev:local`, `dev:railway`, `build`, `preview`. |
| `client/vite.config.js` | Vite config and path aliases. | Vue plugin, Tailwind plugin. | Resolves `@app`, `@shared`, `@products`, and other aliases. |
| `client/vercel.json` | Vercel SPA fallback config. | Vercel. | Ensures direct Vue routes such as `/admin` load `index.html` while API routes are not swallowed by the SPA. |
| `server/package.json` | Server scripts and dependencies. | Express, Prisma, Stripe, bcrypt, dotenv. | Defines `dev:local`, `dev:railway`, `build`, `start`, Prisma commands. |
| `server/prisma.config.ts` | Prisma config. | Prisma. | Supports Prisma CLI behavior. |

## Client App Shell

| File | Purpose | Dependencies | Flow Participation |
| --- | --- | --- | --- |
| `client/src/main.js` | Vue application entry. | Vue, router, global CSS. | Mounts the SPA. |
| `client/src/App.vue` | Root app shell. | Router view. | Hosts routed pages. |
| `client/src/app/router/index.js` | Route table and admin guard. | Vue Router, `fetchApi`, `parseJsonResponse`. | Protects admin pages by calling `/api/auth/me`. |
| `client/src/shared/api/http.js` | API base URL builder, credentialed fetch helper, JSON error parser, admin data target helper. | Vite env. | All client API calls should route through this helper or matching domain wrappers. |
| `client/src/shared/utils/currency.js` | Currency formatting. | None. | Used by storefront, product, checkout, and admin displays. |
| `client/src/shared/constants/sellingMode.js` | Selling mode and inventory helpers. | None. | Used by product cards, quick view, cart, and admin product state. |

## Storefront And Products

| File | Purpose | Dependencies | Flow Participation |
| --- | --- | --- | --- |
| `client/src/domains/storefront/Home/HomeView.vue` | Storefront route orchestration. | Product, cart, filters, quick view, spotlight components. | Loads products, owns quick view state, passes selected card size into cart add. |
| `client/src/domains/storefront/Home/sections/ProductSpotlightSection.vue` | Featured product section. | `useProductVariants`, selling mode helpers. | Owns featured selected size, price, stock label, and Add to Cart. Image/title are intentionally non-clickable. |
| `client/src/domains/products/api/products.api.js` | Client product API calls. | `fetchApi`. | Calls `/api/products`. |
| `client/src/domains/products/composables/useProducts.js` | Product loading state. | Product API. | Supplies storefront product lists. |
| `client/src/domains/products/composables/useProductVariants.js` | Product card variant selection state and variant helpers. | Selling mode constants. | Source of truth for selected product-card size and selected variant. |
| `client/src/domains/products/composables/useProductFilters.js` | Search/category/protein/sort state. | Vue computed state. | Filters active storefront products. |
| `client/src/domains/products/ProductCard/ProductCard.vue` | Product card composition. | Card child components, variant helpers passed from Home. | Displays product, size buttons, price/status, actions. |
| `client/src/domains/products/ProductCard/ProductCardVariantSelector.vue` | Size buttons for cards. | Parent callbacks. | Emits selected size. |
| `client/src/domains/products/ProductCard/ProductCardActions.vue` | Quick View and Add to Cart buttons. | Parent events. | Emits direct add/quick-view events without owning variant state. |
| `client/src/domains/products/ProductQuickView/ProductQuickView.vue` | Product quick view modal. | Variant composable, quick-view child components. | Owns selected size/quantity and emits a shaped selected-variant cart payload. |
| `client/src/domains/products/ProductFilters/ProductFilters.vue` | Storefront filters. | Parent state. | Controls active product list display. |

## Cart And Checkout

| File | Purpose | Dependencies | Flow Participation |
| --- | --- | --- | --- |
| `client/src/domains/cart/composables/useCart.js` | Local cart state, persistence, quantity changes, add-to-cart logic. | Product/selling-mode helpers injected by Home. | Source of truth for cart items before checkout. Explicit selected size wins over product defaults. |
| `client/src/domains/cart/CartDrawer/CartDrawer.vue` | Cart drawer composition. | Cart item/summary components. | Displays cart and quantity actions. |
| `client/src/domains/checkout/views/CheckoutView.vue` | Checkout route orchestration. | Checkout composables, order summary, Stripe element. | Coordinates form state, preview, payment, and order creation. |
| `client/src/domains/checkout/composables/useCheckout.js` | Checkout form state and submission orchestration. | Checkout API, promo/preview composables. | Owns customer/shipping/payment submit flow. |
| `client/src/domains/checkout/composables/useCheckoutPreview.js` | Server preview state. | Checkout API. | Keeps checkout totals in sync with server pricing. |
| `client/src/domains/checkout/composables/useCheckoutPromos.js` | Promo entry/validation state. | Promo API and checkout preview. | Requires normalized customer email before promo validation and clears applied promos if email changes. |
| `client/src/domains/checkout/api/checkout.api.js` | Checkout API calls. | `fetchApi`. | Calls preview/order endpoints. |
| `client/src/domains/payments/components/StripeElementsForm.vue` | Stripe card element and confirmation. | Stripe.js, payment service. | Creates PaymentIntent, confirms card payment, returns PaymentIntent ID to checkout. |
| `client/src/domains/payments/services/payment.service.js` | Client payment API wrapper. | `fetchApi`. | Calls `/api/checkout/create-payment-intent`. |
| `client/src/domains/checkout/views/OrderSuccessView.vue` | Success route. | Order success components. | Displays completed order details. |

## Client Admin

| File | Purpose | Dependencies | Flow Participation |
| --- | --- | --- | --- |
| `client/src/domains/admin/views/AdminLoginView.vue` | Admin login screen. | Auth API helper. | Posts credentials and redirects after successful session. |
| `client/src/domains/admin/views/AdminDashboardView.vue` | Admin dashboard route. | Admin layout/components. | Landing page after admin auth. |
| `client/src/domains/admin/components/AdminDataTargetBadge.vue` | Visible data target badge. | `/api/auth/data-target`. | Shows local vs Railway DB admin target. |
| `client/src/domains/admin/views/AdminProductsView.vue` | Admin product route orchestration. | `useAdminProducts`, product components/constants/mappers/validators. | Product CRUD. |
| `client/src/domains/admin/composables/useAdminProducts.js` | Product admin state/actions. | Admin product API. | Loads/saves/deletes products. |
| `client/src/domains/admin/api/adminProducts.api.js` | Admin product API calls. | `fetchApi`. | Calls `/api/products` admin endpoints. |
| `client/src/domains/admin/components/AdminProductFormPanel.vue` | Product form UI. | Product constants/mappers/validators. | Large product edit/create panel. |
| `client/src/domains/admin/views/AdminPromosView.vue` | Admin promo route orchestration. | `useAdminPromos`, promo components. | Promo CRUD, testing, analytics. |
| `client/src/domains/admin/composables/useAdminPromos.js` | Promo admin state/actions. | Promo API, form mapper/validator. | Loads/saves/deletes/tests promos. |
| `client/src/domains/admin/mappers/adminPromoForm.mapper.js` | Promo form to payload and payload to form. | Client promo rules/constants. | Combines date/time fields and normalizes optional values. |
| `client/src/domains/admin/views/AdminCampaignsView.vue` | Campaign admin route orchestration. | Campaign composable/components. | Campaign CRUD. |
| `client/src/domains/admin/views/AdminOrdersView.vue` | Admin orders route orchestration. | `useAdminOrders`, order components. | Order list by status. |
| `client/src/domains/admin/views/AdminOrderDetailView.vue` | Admin order detail route. | Admin orders API/utils. | Order detail, status update flow. |
| `client/src/domains/admin/components/AdminOrderStatusPanel.vue` | Staged order status update panel. | Admin order constants and order detail state. | Displays current status, stages next status, saves/cancels, and renders status history. |
| `client/src/domains/admin/api/adminOrders.api.js` | Admin order API calls. | `fetchApi`. | Calls `/api/admin/orders`. |

## Server App And Shared

| File | Purpose | Dependencies | Flow Participation |
| --- | --- | --- | --- |
| `server/src/server.js` | Server process entry. | `loadServerEnv`, `app.js`. | Loads env and starts Express. |
| `server/src/config/env.js` | Environment file loading. | `dotenv`, `path`, `fs`. | Loads `server/.env` and optional local-only override for Railway DB admin mode. |
| `server/src/app.js` | Express app composition. | Routes, CORS, cookies, error middleware. | Mounts all `/api/*` routes and allows configured origins. |
| `server/src/db/prisma.js` | Prisma singleton. | `@prisma/client`. | Shared database client. |
| `server/src/app/middleware/error.middleware.js` | Error response handler. | Express. | Converts thrown errors to JSON responses. |
| `server/src/app/middleware/auth/requireAdminAuth.js` | Admin API guard. | Auth service. | Protects admin routes. |
| `server/src/shared/utils/money.js` | Currency normalization. | None. | Used in checkout, promos, campaigns. |
| `server/src/shared/utils/string.js` | String/email/number normalization. | None. | Used across product/promo/campaign services. |
| `server/src/shared/services/tax.service.js` | Tax estimate hook. | None. | Used in checkout pricing. |

## Server Domains

| File | Purpose | Dependencies | Flow Participation |
| --- | --- | --- | --- |
| `server/src/domains/auth/routes/auth.routes.js` | Login/logout/me/data-target routes. | Auth service. | Owns custom admin session endpoints. |
| `server/src/domains/auth/services/auth.service.js` | Admin credential/session/cookie logic. | bcrypt, crypto, env. | Current custom admin auth source of truth. |
| `server/src/domains/products/routes/products.routes.js` | Product API routes. | Controller/auth where needed. | Storefront and admin product endpoints. |
| `server/src/domains/products/controllers/products.controller.js` | Product request handlers. | Product service. | Thin controller layer. |
| `server/src/domains/products/services/products.service.js` | Product business logic. | Prisma, mapper, validators. | Product CRUD and list orchestration. |
| `server/src/domains/products/mappers/products.mapper.js` | Product database-to-response mapping. | Product constants/utils. | Normalizes product and variant response shapes. |
| `server/src/domains/checkout/routes/checkout.routes.js` | Checkout preview/order routes. | Checkout controller. | `POST /api/checkout/preview` and order creation. |
| `server/src/domains/checkout/services/checkout.service.js` | Checkout orchestration. | Orders, promos, campaigns, Stripe, pricing. | Trusted totals, idempotency, inventory, usage recording. |
| `server/src/domains/checkout/utils/checkoutPricing.js` | Pricing calculations. | Money/tax helpers. | Source of truth for subtotal, discounts, shipping, tax, total. |
| `server/src/domains/payments/routes/payment.routes.js` | PaymentIntent route mounted under checkout. | Payment controller. | `POST /api/checkout/create-payment-intent`. |
| `server/src/domains/payments/services/stripe.payment.js` | Stripe SDK wrapper. | Stripe secret key. | Creates/retrieves PaymentIntents. |
| `server/src/domains/orders/routes/orders.routes.js` | Admin order routes. | Orders controller, admin auth. | Lists/details/status updates for admin orders. |
| `server/src/domains/orders/services/orders.service.js` | Order business logic. | Repository/mapper/constants. | Admin order reads, status validation, and status history actor metadata. |
| `server/src/domains/orders/repositories/orders.repository.js` | Order Prisma access. | Prisma. | Order queries, unique Stripe PaymentIntent lookup, transactional status updates, and status history creation. |
| `server/src/domains/promos/routes/promos.routes.js` | Promo routes. | Promo service, admin auth. | Admin promo CRUD and public validation. |
| `server/src/domains/promos/services/promos.service.js` | Promo business logic. | Repository, mapper, validator, money/string utils. | Promo normalization, lifecycle, email-required validation, discount calculation, usage recording. |
| `server/src/domains/promos/repositories/promos.repository.js` | Promo Prisma access. | Prisma. | Promo list/read/write and usage queries. |
| `server/src/domains/campaigns/routes/campaigns.routes.js` | Campaign routes. | Campaign controller/admin auth. | Public campaign reads and admin CRUD. |
| `server/src/domains/campaigns/services/campaigns.service.js` | Campaign business logic. | Repository/mapper/validator. | Donation rules, lifecycle, aggregate stats, order attribution usage. |
| `server/src/domains/campaigns/repositories/campaigns.repository.js` | Campaign Prisma access. | Prisma. | Campaign CRUD, aggregate increments, and `OrderCampaignUsage` recording. |

## Prisma

| File | Purpose | Dependencies | Flow Participation |
| --- | --- | --- | --- |
| `server/prisma/schema.prisma` | Database schema and enums. | Prisma/PostgreSQL. | Source of truth for Product, ProductVariant, Order, OrderItem, OrderStatusHistory, Promo, PromoUsage, Campaign. |
| `server/prisma/migrations/20260605000000_unique_order_payment_intent/migration.sql` | Adds unique PaymentIntent constraint. | Prisma migrate. | Supports order idempotency. |
| `server/prisma/migrations/20260606000000_add_order_campaign_usage/migration.sql` | Adds order/campaign attribution table. | Prisma migrate. | Supports admin donation traceability and campaign order attribution. |
| `server/prisma/migrations/20260607000000_add_order_status_history/migration.sql` | Adds order status history table. | Prisma migrate. | Supports admin fulfillment status audit trail and future admin-user attribution. |
| `server/prisma/migrations/*/migration.sql` | Historical schema changes. | Prisma migrate. | Defines production DB migration history. |
| `server/src/db/seeds/products.seed.js` | Product seed script. | Prisma. | Local/manual seed only; production startup should not seed destructively. |

## Coverage Still Worth Deepening

- Some smaller presentational Vue components are documented at folder level rather than file-by-file because they do not own business rules.
- Mermaid diagrams in this directory rendered successfully to SVG during the 2026-06-07 verification pass. Older `diagram.md` and `mockdiagram.md` are kept as architecture references, but the primary source docs are `README.md`, `data-flow.md`, `database.md`, `admin.md`, `file-map.md`, and `auth-roadmap.md`.
- Generated Prisma files under `server/src/generated/prisma/` are generated output and are not individually documented.
