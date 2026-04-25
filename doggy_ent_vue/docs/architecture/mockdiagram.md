

# Doggy Ent Official Mock Architecture

This mock architecture shows how the project should eventually work once the current Vue + Express foundation grows into the full Chase & Evie Co. storefront, cart, checkout, admin CMS, and future database/payment flow.

```mermaid
flowchart LR
  Customer([Customer])
  AdminUser([Admin User])

  subgraph VueApp["Vue Frontend : localhost:5173"]
    Storefront["Storefront Views\nHome, Shop, Product Sections"]
    CartDrawer["Cart Drawer\nAdd, update quantity, remove items"]
    CheckoutView["Checkout View\nContact, shipping, delivery, payment, promo"]
    AdminCMS["Admin CMS Views\nProducts, Orders, Promos"]
    FrontendServices["Frontend API Services\nproducts.api.js, cart.api.js, checkout.api.js"]
  end

  subgraph ViteLayer["Development Proxy Layer"]
    ViteProxy["Vite Proxy\n/api → localhost:3000"]
  end

  subgraph ExpressApp["Express Backend : localhost:3000"]
    App["app.js\nMounts API route groups"]

    PublicRoutes["Public Routes\nGET /api/products\nPOST /api/checkout\nPOST /api/promos/validate"]
    AdminRoutes["Admin Routes\nPOST /api/admin/products\nPUT /api/admin/products/:id\nDELETE /api/admin/products/:id\nGET /api/admin/orders"]
    AuthMiddleware["Auth / Admin Middleware\nProtect admin-only actions"]

    ProductController["Product Controller\nValidate product requests"]
    CartCheckoutController["Checkout Controller\nValidate customer, shipping, cart, promo"]
    AdminController["Admin Controller\nCreate, edit, delete, review"]

    ProductService["Product Service\nCatalog logic"]
    PromoService["Promo Service\nPromo validation + discount rules"]
    OrderService["Order Service\nOrder creation + totals"]
    PaymentService["Payment Service\nStripe / PayPal / wallet provider"]
  end

  subgraph Storage["Future Persistent Storage"]
    ProductDB[("Products Table / Collection")]
    CustomerDB[("Customers Table / Collection")]
    OrderDB[("Orders Table / Collection")]
    PromoDB[("Promos Table / Collection")]
  end

  subgraph External["External Services"]
    PaymentProvider["Payment Provider\nStripe / PayPal / Apple Pay / Google Pay"]
    EmailService["Email Service\nOrder confirmation + shipping updates"]
  end

  Customer --> Storefront
  Storefront --> CartDrawer
  CartDrawer --> CheckoutView
  CheckoutView --> FrontendServices

  AdminUser --> AdminCMS
  AdminCMS --> FrontendServices

  FrontendServices --> ViteProxy
  ViteProxy --> App

  App --> PublicRoutes
  App --> AdminRoutes

  AdminRoutes --> AuthMiddleware
  AuthMiddleware --> AdminController

  PublicRoutes --> ProductController
  PublicRoutes --> CartCheckoutController

  ProductController --> ProductService
  CartCheckoutController --> ProductService
  CartCheckoutController --> PromoService
  CartCheckoutController --> OrderService
  CartCheckoutController --> PaymentService
  AdminController --> ProductService
  AdminController --> PromoService
  AdminController --> OrderService

  ProductService --> ProductDB
  PromoService --> PromoDB
  OrderService --> OrderDB
  OrderService --> CustomerDB

  PaymentService --> PaymentProvider
  PaymentProvider --> PaymentService
  PaymentService --> OrderService

  OrderService --> EmailService
  EmailService --> Customer

  ProductDB --> ProductService
  PromoDB --> PromoService
  OrderDB --> OrderService
  CustomerDB --> OrderService

  ProductService --> ProductController
  ProductService --> AdminController
  PromoService --> CartCheckoutController
  OrderService --> CartCheckoutController

  ProductController --> PublicRoutes
  CartCheckoutController --> PublicRoutes
  AdminController --> AdminRoutes

  PublicRoutes --> App
  AdminRoutes --> App
  App --> ViteProxy
  ViteProxy --> FrontendServices

  FrontendServices --> Storefront
  FrontendServices --> CartDrawer
  FrontendServices --> CheckoutView
  FrontendServices --> AdminCMS
```

## How this should behave officially

### Storefront browsing

```mermaid
sequenceDiagram
  participant Customer
  participant Storefront as Vue Storefront
  participant API as Express API
  participant Products as Product Service
  participant DB as Product Database

  Customer->>Storefront: Opens shop page
  Storefront->>API: GET /api/products
  API->>Products: fetch public products
  Products->>DB: read active products
  DB-->>Products: product list
  Products-->>API: public product data
  API-->>Storefront: JSON response
  Storefront-->>Customer: Render product cards
```

### Cart and checkout

```mermaid
sequenceDiagram
  participant Customer
  participant Cart as Cart Drawer
  participant Checkout as Checkout View
  participant API as Express API
  participant Promo as Promo Service
  participant Order as Order Service
  participant Pay as Payment Provider
  participant DB as Orders Database

  Customer->>Cart: Adds product to cart
  Cart-->>Customer: Slide-in cart opens
  Customer->>Checkout: Proceeds to checkout
  Checkout->>API: POST /api/promos/validate
  API->>Promo: Validate promo code + cart rules
  Promo-->>API: Discount result
  API-->>Checkout: Updated totals
  Customer->>Checkout: Places order
  Checkout->>API: POST /api/checkout
  API->>Order: Build order payload
  Order->>Pay: Create payment intent / charge
  Pay-->>Order: Payment status
  Order->>DB: Save customer + order record
  DB-->>Order: Saved order
  Order-->>API: Order confirmation
  API-->>Checkout: Success response
  Checkout-->>Customer: Show order success
```

### Admin CMS product management

```mermaid
sequenceDiagram
  participant Admin
  participant CMS as Vue Admin CMS
  participant API as Express API
  participant Auth as Admin Middleware
  participant Service as Product Service
  participant DB as Product Database

  Admin->>CMS: Opens Products CMS
  CMS->>API: GET /api/admin/products
  API->>Auth: Verify admin session
  Auth-->>API: Authorized
  API->>Service: Fetch admin product data
  Service->>DB: Read products with admin fields
  DB-->>Service: Product records
  Service-->>API: Product list
  API-->>CMS: JSON response
  CMS-->>Admin: Render product table

  Admin->>CMS: Creates / edits / deletes product
  CMS->>API: POST / PUT / DELETE /api/admin/products
  API->>Auth: Verify admin session
  Auth-->>API: Authorized
  API->>Service: Apply product mutation
  Service->>DB: Save change
  DB-->>Service: Updated records
  Service-->>API: Success response
  API-->>CMS: Updated product data
  CMS-->>Admin: Refresh table
```