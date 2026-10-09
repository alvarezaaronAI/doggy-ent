# File Map

Last updated: 2026-06-13

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
| `client/src/app/router/index.js` | Route table and admin/customer guards. | Vue Router, `fetchApi`, `parseJsonResponse`. | Protects admin pages by calling `/api/auth/me` and customer pages by calling `/api/account/profile`. |
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
| `client/src/domains/admin/components/AdminProductFormPanel.vue` | Focused product editor shell. | Variant/content/analysis field components and supplied options. | Three editor sections plus publishing; unchanged mapper/validator owns the payload. |
| `client/src/domains/admin/views/AdminPromosView.vue` | Admin promo route orchestration. | `useAdminPromos`, promo components. | Promo CRUD, testing, analytics. |
| `client/src/domains/admin/composables/useAdminPromos.js` | Promo admin state/actions. | Promo API, form mapper/validator. | Loads/saves/deletes/tests promos. |
| `client/src/domains/admin/mappers/adminPromoForm.mapper.js` | Promo form to payload and payload to form. | Client promo rules/constants. | Combines date/time fields and normalizes optional values. |
| `client/src/domains/admin/views/AdminCampaignsView.vue` | Campaign admin route orchestration. | Campaign composable/components. | Campaign CRUD. |
| `client/src/domains/admin/views/AdminOrdersView.vue` | Admin orders route orchestration. | `useAdminOrders`, order components. | Order list by status. |
| `client/src/domains/admin/views/AdminOrderDetailView.vue` | Admin order detail route. | `useAdminOrderDetail`, status/tracking/notification components. | Record display and explicit update flows, separate from emails. |
| `client/src/domains/admin/components/AdminOrderStatusPanel.vue` | Staged order status update panel. | Admin order constants and order detail state. | Displays current status, stages next status, saves/cancels, and renders status history. |
| `client/src/domains/admin/api/adminOrders.api.js` | Admin order API calls. | `fetchApi`. | Calls `/api/admin/orders`. |
| `client/src/domains/admin/views/AdminCustomersView.vue` | Admin customer list route. | `useAdminCustomers`, customer table. | Displays Better Auth customer accounts and aggregate order stats. |
| `client/src/domains/admin/views/AdminCustomerDetailView.vue` | Admin customer detail route. | `useAdminCustomers`, orders panel/status badge. | Displays customer profile, linked orders, guest matches, and readiness actions. |
| `client/src/domains/admin/api/adminCustomers.api.js` | Admin customer API calls. | `fetchApi`. | Calls `/api/admin/customers`. |
| `client/src/domains/admin/composables/useAdminCustomers.js` | Customer admin state/actions. | Admin customer API. | Loads customer lists/details and status/readiness actions. |
| `client/src/domains/admin/views/AdminNotificationsView.vue` | Dedicated admin notification history route. | Admin notification API. | Filters and displays `EmailDelivery` rows by event/status, plus provider/delivery totals. |
| `client/src/domains/admin/api/adminNotifications.api.js` | Admin notification API calls. | `fetchApi`. | Calls `/api/admin/notifications` with optional filters. |
| `client/src/domains/admin/views/AdminShipmentsView.vue` | Dedicated shipment overview route. | Admin shipment API. | Displays tracking records, provider configured state, shipment status filters, and order links. |
| `client/src/domains/admin/api/adminShipments.api.js` | Admin shipment API calls. | `fetchApi`. | Calls `/api/admin/shipments` with optional filters. |
| `client/src/domains/admin/views/AdminReportsView.vue` | Compact operations reporting route. | Orders, customers, notifications, shipments APIs. | Aggregates protected admin API data into overview cards without separate report persistence. |
| `client/src/domains/admin/views/AdminOrderIssuesView.vue` | Protected admin order issue tool. | Admin support API. | Searches/filters customer order issues, updates status/priority, and separates internal notes from customer-visible replies. |
| `client/src/domains/admin/views/AdminInternalIssuesView.vue` | Protected admin internal issue tool. | Admin support API. | Searches/filters sanitized operational issues and records review/resolution notes. |
| `client/src/domains/admin/api/adminSupport.api.js` | Admin support/internal issue API calls. | `fetchApi`. | Calls `/api/admin/order-issues` and `/api/admin/internal-issues`. |

## Customer Accounts

| File | Purpose | Dependencies | Flow Participation |
| --- | --- | --- | --- |
| `client/src/domains/account/api/authClient.js` | Better Auth Vue client setup. | `better-auth/vue`, `@better-auth/infra/client`, API base URL helper. | Central Better Auth customer client configuration and Infrastructure dashboard client plugin. |
| `client/src/domains/account/api/accountAuth.api.js` | Customer auth endpoint wrappers. | `fetchApi`, Better Auth client setup. | Sign up, sign in, sign out, session, verification, password reset readiness. |
| `client/src/domains/account/api/account.api.js` | Protected account API calls. | `fetchApi`. | Calls `/api/account` profile/orders/dashboard endpoints and order issue creation endpoints. |
| `client/src/domains/account/composables/useAccountAuth.js` | Shared customer auth state. | Account auth API. | Session-aware navigation and auth forms. |
| `client/src/domains/account/composables/useAccountProfile.js` | Profile state/actions. | Account API. | Loads and saves customer profile data. |
| `client/src/domains/account/composables/useAccountOrders.js` | Customer order state/actions. | Account API. | Loads account order history/detail and submits protected order issues. |
| `client/src/domains/account/validators/account.validators.js` | Account form validation and email normalization. | None. | Sign-in/create/profile validation. |
| `client/src/domains/account/views/AccountSignInView.vue` | Customer sign-in page. | Auth composable/validators. | Calls Better Auth sign-in endpoint. |
| `client/src/domains/account/views/AccountCreateView.vue` | Customer create-account page. | Auth composable/validators. | Calls Better Auth sign-up endpoint. |
| `client/src/domains/account/views/AccountDashboardView.vue` | Protected account overview. | Account API, auth composable. | Shows profile summary, order stats, readiness placeholders. |
| `client/src/domains/account/views/AccountProfileView.vue` | Protected profile editor. | Profile composable/validator. | Edits `CustomerProfile`. |
| `client/src/domains/account/views/AccountOrdersView.vue` | Protected account order split view. | Account orders composable. | Shows linked and verified-email matched orders grouped by month, with selected-order detail. |
| `client/src/domains/account/views/AccountOrderDetailView.vue` | Protected account order detail. | Account orders composable. | Shows customer-safe order detail, tracking when available, and Need Help order issue creation. |
| `client/src/domains/account/views/AccountForgotPasswordView.vue` | Password reset request page. | Auth composable. | Queues Better Auth reset email through provider abstraction. |
| `client/src/domains/account/views/AccountResetPasswordView.vue` | Password reset completion page. | Auth API. | Posts reset token/new password to Better Auth. |

## Server App And Shared

| File | Purpose | Dependencies | Flow Participation |
| --- | --- | --- | --- |
| `server/src/server.js` | Server process entry. | `loadServerEnv`, `app.js`. | Loads env and starts Express. |
| `server/src/config/env.js` | Environment file loading. | `dotenv`, `path`, `fs`. | Loads `server/.env` and optional local-only override for Railway DB admin mode. |
| `server/src/app.js` | Express app composition. | Routes, CORS, cookies, error middleware. | Mounts all `/api/*` routes and allows configured origins. |
| `server/src/db/prisma.js` | Prisma singleton. | `@prisma/client`. | Shared database client. |
| `server/src/app/middleware/error.middleware.js` | Error response handler. | Express. | Converts thrown errors to JSON responses. |
| `server/src/app/middleware/auth/requireAdminAuth.js` | Admin API guard. | Auth service. | Protects admin routes. |
| `server/src/app/middleware/auth/requireCustomerAuth.js` | Customer account API guard. | Better Auth customer service. | Protects `/api/account/*` routes. |
| `server/src/shared/utils/money.js` | Currency normalization. | None. | Used in checkout, promos, campaigns. |
| `server/src/shared/utils/string.js` | String/email/number normalization. | None. | Used across product/promo/campaign services. |
| `server/src/shared/services/tax.service.js` | Tax estimate hook. | None. | Used in checkout pricing. |

## Server Domains

| File | Purpose | Dependencies | Flow Participation |
| --- | --- | --- | --- |
| `server/src/domains/auth/routes/auth.routes.js` | Login/logout/me/data-target routes. | Auth service. | Owns custom admin session endpoints. |
| `server/src/domains/auth/services/auth.service.js` | Admin credential/session/cookie logic. | bcrypt, crypto, env. | Current custom admin auth source of truth. |
| `server/src/domains/auth/services/customerAuth.service.js` | Better Auth customer configuration. | Better Auth, Prisma adapter, `@better-auth/infra`, email payload builders. | Owns customer auth, Infrastructure dashboard plugin, role/status fields, session lookup, signup profile hooks, and response token sanitization. |
| `server/src/domains/auth/constants/authRoles.constants.js` | Current and future role/status constants. | None. | Source of truth for CUSTOMER/ADMIN and account active/deactivated labels. |
| `server/src/domains/account/routes/account.routes.js` | Protected customer account routes. | `requireCustomerAuth`, account controller. | Customer dashboard/profile/orders API. |
| `server/src/domains/account/controllers/account.controller.js` | Account request handlers. | Account service. | Thin JSON handlers for `/api/account`. |
| `server/src/domains/account/services/account.service.js` | Customer account business logic. | Account repository, order mapper. | Profile, order history, verified-email guest matching. |
| `server/src/domains/account/repositories/account.repository.js` | Account Prisma access. | Prisma. | Reads users/profiles/orders and writes profile updates. |
| `server/src/domains/support/routes/support.routes.js` | Customer/admin issue route definitions. | Customer/admin auth guards, issue rate limiter, support controller. | Adds customer order issue endpoints and admin issue tools. |
| `server/src/domains/support/controllers/support.controller.js` | Support request handlers. | Support service. | Thin JSON handlers for order issues and internal issues. |
| `server/src/domains/support/services/support.service.js` | Support and internal issue business logic. | Support repository, account repository, constants, mappers. | Enforces customer ownership, seven-day delivered eligibility, case numbers, admin status changes, and internal issue fingerprints. |
| `server/src/domains/support/repositories/support.repository.js` | Support Prisma access. | Prisma. | Creates/reads support requests, messages, events, internal issues, and internal issue events. |
| `server/src/domains/support/mappers/support.mapper.js` | Support response mapping. | Support constants. | Hides internal notes from customer responses and exposes admin-only context to admin routes. |
| `server/src/domains/support/constants/support.constants.js` | Support statuses/categories/visibility constants. | None. | Shared server source of truth for support workflow codes. |
| `server/src/domains/customers/routes/adminCustomers.routes.js` | Admin customer routes. | `requireAdminAuth`, customer controller. | Protected `/api/admin/customers` endpoints. |
| `server/src/domains/customers/controllers/adminCustomers.controller.js` | Admin customer request handlers. | Customer service. | List/detail/status/readiness JSON responses. |
| `server/src/domains/customers/services/adminCustomers.service.js` | Admin customer business logic. | Customer repository, email payload builders. | Customer stats, detail, deactivate/reactivate, email readiness actions. |
| `server/src/domains/customers/repositories/adminCustomers.repository.js` | Admin customer Prisma access. | Prisma. | Reads users/orders/events/readiness relations and updates account status. |
| `server/src/domains/emails/mappers/emailPayloads.mapper.js` | Email payload builders. | Email event constants. | Verification, password reset, welcome, order/support/review readiness payloads. |
| `server/src/domains/emails/services/emailProvider.service.js` | Email provider abstraction. | Env flag. | Queues/logs email payloads without sending real email by default. |
| `server/src/domains/emails/routes/adminEmailDelivery.routes.js` | Admin notification route. | Admin auth, email delivery controller. | Protects `GET /api/admin/notifications`. |
| `server/src/domains/emails/controllers/emailDelivery.controller.js` | Email delivery admin handler. | Email delivery service. | Reads notification history and stats with filters. |
| `server/src/domains/emails/services/emailDelivery.service.js` | Email delivery read logic. | Email delivery repository, mapper. | Provides admin and customer email history responses. |
| `server/src/domains/emails/repositories/emailDelivery.repository.js` | Email delivery Prisma access. | Prisma. | Creates, updates, filters, and summarizes `EmailDelivery` records. |
| `server/src/domains/products/routes/products.routes.js` | Product API routes. | Controller/auth where needed. | Storefront and admin product endpoints. |
| `server/src/domains/products/controllers/products.controller.js` | Product request handlers. | Product service. | Thin controller layer. |
| `server/src/domains/products/services/products.service.js` | Product business logic. | Prisma, mapper, validators. | Product CRUD and list orchestration. |
| `server/src/domains/products/mappers/products.mapper.js` | Product database-to-response mapping. | Product constants/utils. | Normalizes product and variant response shapes. |
| `server/src/domains/checkout/routes/checkout.routes.js` | Checkout preview/order routes. | Checkout controller. | `POST /api/checkout/preview` and order creation. |
| `server/src/domains/checkout/services/checkout.service.js` | Checkout orchestration. | Orders, promos, campaigns, Stripe, pricing, shipping. | Trusted totals, idempotency, inventory, usage recording, and server-side selected shipping rate resolution. |
| `server/src/domains/checkout/utils/checkoutPricing.js` | Pricing calculations. | Money/tax helpers. | Source of truth for subtotal, discounts, static shipping fallback, tax, total. |
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
| `server/src/domains/shipping/routes/shipping.routes.js` | Shipping/tracking/admin shipment routes. | Admin auth, rate limits, shipping controller. | Protects admin tracking and shipment overview routes; receives Shippo webhook pings. |
| `server/src/domains/shipping/controllers/shipping.controller.js` | Shipping request handlers. | Shipping service. | Handles admin tracking updates, refreshes, shipment overview, and webhook receipt. |
| `server/src/domains/shipping/services/shipping.service.js` | Shipping business logic. | Shippo service, order repository, email service. | Upserts tracking, refreshes tracking, maps status to orders, and lists admin shipments. Future work should separate tracking saves from explicit admin-triggered customer email sends. |
| `server/src/domains/shipping/services/shippo.service.js` | Shippo provider wrapper. | Shippo env, mapper. | Fetches tracking and rate-only shipment quotes; never buys labels. |
| `server/src/domains/shipping/repositories/shipping.repository.js` | Shipping Prisma access. | Prisma. | Upserts `OrderShipment`, stores events, and lists admin shipment records. |
| `server/src/domains/shipping/mappers/shipping.mapper.js` | Shipping response/provider mapping. | None. | Maps Shippo tracking/rates and database shipments into API-safe objects. |

## Prisma

| File | Purpose | Dependencies | Flow Participation |
| --- | --- | --- | --- |
| `server/prisma/schema.prisma` | Database schema and enums. | Prisma/PostgreSQL. | Source of truth for Product, ProductVariant, Order, account models, OrderItem, OrderStatusHistory, Promo, PromoUsage, Campaign. |
| `server/prisma/migrations/20260612000000_better_auth_customer_accounts/migration.sql` | Adds Better Auth/customer account tables and nullable `Order.userId`. | Prisma migrate. | Supports customer accounts, session persistence, customer order history, and future lifecycle/loyalty/support/review features. |
| `server/prisma/migrations/20260615000000_add_order_shipping_method/migration.sql` | Adds nullable `Order.shippingMethod`. | Prisma migrate. | Preserves selected checkout delivery method. |
| `server/prisma/migrations/20260615001000_add_order_shipping_rate_fields/migration.sql` | Adds nullable shipping carrier/service/rate/provider fields. | Prisma migrate. | Preserves Shippo/static shipping-rate traceability. |
| `server/prisma/migrations/20260605000000_unique_order_payment_intent/migration.sql` | Adds unique PaymentIntent constraint. | Prisma migrate. | Supports order idempotency. |
| `server/prisma/migrations/20260606000000_add_order_campaign_usage/migration.sql` | Adds order/campaign attribution table. | Prisma migrate. | Supports admin donation traceability and campaign order attribution. |
| `server/prisma/migrations/20260607000000_add_order_status_history/migration.sql` | Adds order status history table. | Prisma migrate. | Supports admin fulfillment status audit trail and future admin-user attribution. |
| `server/prisma/migrations/*/migration.sql` | Historical schema changes. | Prisma migrate. | Defines production DB migration history. |
| `server/src/db/seeds/products.seed.js` | Product seed script. | Prisma. | Local/manual seed only; production startup should not seed destructively. |

## Coverage Still Worth Deepening

- Some smaller presentational Vue components are documented at folder level rather than file-by-file because they do not own business rules.
- Mermaid diagrams in this directory rendered successfully to SVG during the 2026-06-07 verification pass. Older `diagram.md` and `mockdiagram.md` are kept as architecture references, but the primary source docs are `README.md`, `data-flow.md`, `database.md`, `admin.md`, `file-map.md`, and `auth-roadmap.md`.
- Generated Prisma files under `server/src/generated/prisma/` are generated output and are not individually documented.

## Calm Essentials Account UI Files

Focused 2026-10-08 implementation; paths below are relative to `client/src/domains/account/`.

| File | Responsibility | Dependencies / Flow |
| --- | --- | --- |
| `components/AccountLayout.vue` | Protected parent, cached Orders child, sign-out redirect | Router, shared auth, AccountShell |
| `components/AccountShell.vue`, `components/AccountNav.vue` | One storefront header/footer/cart; seven-tab desktop/mobile navigation | Existing cart/search/auth; nav constants |
| `constants/account.constants.js` | Sidebar paths/labels/icons, order status display, page size, notification fields | Navigation, badges, history, profile mapper/editor |
| `styles/account.css` | Scoped Calm Essentials tokens/responsive styles | Existing Tailwind utilities; no new styling framework |
| `views/AccountDashboardView.vue`, `composables/useAccountDashboard.js` | Bounded overview/loading/error state | Existing dashboard API |
| `views/AccountOrdersView.vue`, `composables/useAccountOrderHistory.js` | Group/search/filter/selection/Load more/refresh/mobile state | Existing order APIs; sequenced requests |
| `utils/orderHistory.js`, `utils/accountFormatting.js` | Pure search/groups/references/quantity/date/address/tracking-URL helpers | Intl/URL, no requests or pricing calculations |
| `components/AccountOrderCard.vue`, `components/AccountStatusBadge.vue` | Recent-order links and centralized status presentation | Formatting/constants |
| `views/AccountOrderDetailView.vue`, `composables/useAccountOrders.js` | Existing standalone order detail URL/loading/retry | Ownership-protected order API |
| `components/AccountOrderDetails.vue` | Shared items/shipping/tracking/totals/support presentation | Server snapshots, currency helper, status badge, issue dialog |
| `components/AccountDialog.vue` | Modal focus trap/restore, scroll lock, idle close | Teleport; profile/issue editors |
| `views/AccountProfileView.vue`, `views/AccountAddressesView.vue` | Profile/preferences/default-address summaries | Same existing profile endpoint |
| `components/AccountProfileEditor.vue`, `composables/useAccountProfileEditor.js` | Save/Cancel/error feedback, session display refresh | Existing profile/auth, payload mapper, validators |
| `mappers/accountProfile.mapper.js`, `validators/account.validators.js` | Preserve full replacement payload; focused validation | Notification constants; validation separated from transforms |
| `views/AccountHelpView.vue`, `composables/useAccountHelp.js`, `components/AccountCaseDetail.vue` | Case list/detail/customer-visible replies/resolution | Existing support APIs, no general message or reply-write endpoint |
| `components/AccountOrderIssueDialog.vue`, `composables/useAccountOrderIssue.js` | Eligible-order request/success link | Existing POST API and server-provided categories |
| `views/AccountFutureView.vue` | Dedicated Rewards/Wishlist routes and honest future content | Storefront navigation only |

Related changes: `client/src/app/router/index.js` groups protected account routes under the layout; `client/src/app/layouts/SiteHeader.vue` changes only responsive breakpoints to fix tablet overflow. Tests: `client/tests/tier2/account/account-profile-mapper.test.js` and `client/tests/tier3/account/account-history.test.js`.
## Calm Workspace Admin Files

Added or focused during the approved 2026-10-08 admin UI pass. Existing API/payload/validator contracts and custom admin cookies remain the sources of truth.

| File(s), relative to client/src/domains/admin | Responsibility | Dependencies / flow |
| --- | --- | --- |
| `components/AdminLayout.vue` | Shared protected workspace, identity/logout, data routing, keyed nested detail view. | Session API, router, existing data-target badge, header/sidebar. |
| `components/AdminHeader.vue`, `components/AdminSidebar.vue` | Brand/store/logout controls and responsive grouped navigation. | Layout events, router, navigation constants, icons. |
| `constants/adminNavigation.constants.js` | Eleven tabs, grouping, active path-family rules. | Sidebar; no API or auth decisions. |
| `api/adminSession.api.js` | Credentialed session read/logout. | Shared fetch/parser; existing /api/auth endpoints. |
| `components/AdminPageHeader.vue`, `components/AdminMetrics.vue`, `components/AdminIcon.vue` | Shared compact headings, read-only metrics, semantic Lucide icons. | @lucide/vue; supplied state only. |
| `components/AdminProductVariantsEditor.vue`, `components/AdminProductContentFields.vue` | Focused existing product fields. | Product form object; existing variant field component. |
| `components/AdminScheduleFields.vue` | Reusable paired date/time fields and clear actions. | Promo/campaign forms; no serialization or timezone conversion. |
| `components/AdminPromoAnalytics.vue`, `components/AdminCampaignImpact.vue` | In-page analytics/attribution views and real order links. | Existing promo analytics/campaign data and formatters. |
| `composables/useAdminOverview.js` | Overview/report aggregation with independent source errors. | Existing order/stats/customer/notification/shipment/support APIs. |
| `composables/useAdminActivity.js` | Filtered loading, busy/error state, last successful activity snapshot. | Existing notification/shipment APIs supplied by views. |
| `composables/useAdminOrderDetail.js` | Order record reads, status/tracking/email actions and busy state. | Existing adminOrders API; no recalculation of business totals. |
| `composables/useAdminIssueWorkspace.js` | Issue list/selection, edit draft, Save/Cancel, write errors. | Injected existing support/internal API functions. |
| `composables/useAdminOrderIssues.js` | Internal-note/account-reply draft and explicit save. | Shared issue workspace, existing message endpoint. |
| `constants/adminSupport.constants.js` | Current support/internal status, category, priority, severity options. | Support views; server still validates all submitted values. |
| `components/AdminIssueHistory.vue` | Read-only server event timeline, actor/date/status context. | Existing sanitized event fields and workspace formatters. |
| `utils/adminWorkspace.formatters.js` | Safe date display and enum labels. | Operational views/history; no payload shaping. |

Other touched sources: `client/src/assets/styles/admin.css`, `client/src/app/router/index.js`, `client/package.json` / lockfile, existing admin CRUD/list/detail views and components, `client/src/domains/promos/components/PromoForm.vue` / `PromoCodeTester.vue`, and `client/tests/tier2/admin/admin-workspace.test.js`.

Some older header/stat/group/modal components remain in the repository but are no longer composed by these new route views. They are not new sources of truth; remove them only after a dedicated usage audit, not by deleting unrelated accepted work.
