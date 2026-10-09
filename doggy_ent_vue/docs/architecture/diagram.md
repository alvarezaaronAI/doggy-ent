# Doggy Ent Current Architecture Diagram

Last updated: 2026-06-15

This compact diagram reflects the current Prisma-backed application. The older version of this file referred to temporary in-memory product data, which no longer matches the codebase.

```mermaid
flowchart LR
  Customer["Customer browser"] --> Storefront["Vue storefront"]
  Admin["Admin browser"] --> AdminApp["Vue admin routes"]

  Storefront --> SharedHttp["client shared api helper"]
  AdminApp --> SharedHttp
  SharedHttp --> Api["Express API"]

  Api --> ProductDomain["products domain"]
  Api --> CheckoutDomain["checkout and payments domains"]
  Api --> PromoDomain["promos domain"]
  Api --> CampaignDomain["campaigns domain"]
  Api --> OrderDomain["orders domain"]
  Api --> AuthDomain["auth domain"]
  Api --> AccountDomain["account and customers domains"]
  Api --> EmailDomain["emails domain"]
  Api --> ShippingDomain["shipping domain"]

  CheckoutDomain --> Stripe["Stripe API"]
  EmailDomain --> Resend["Resend API"]
  ShippingDomain --> Shippo["Shippo tracking API"]
  ProductDomain --> Prisma["Prisma client"]
  CheckoutDomain --> Prisma
  PromoDomain --> Prisma
  CampaignDomain --> Prisma
  OrderDomain --> Prisma
  AccountDomain --> Prisma
  EmailDomain --> Prisma
  ShippingDomain --> Prisma
  AuthDomain --> SessionCookie["admin session cookie"]
  AuthDomain --> BetterAuth["Better Auth customer sessions"]
  Prisma --> Postgres["PostgreSQL"]
```
