# Doggy Ent Current Architecture Diagram

Last updated: 2026-06-07

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

  CheckoutDomain --> Stripe["Stripe API"]
  ProductDomain --> Prisma["Prisma client"]
  CheckoutDomain --> Prisma
  PromoDomain --> Prisma
  CampaignDomain --> Prisma
  OrderDomain --> Prisma
  AuthDomain --> SessionCookie["admin session cookie"]
  Prisma --> Postgres["PostgreSQL"]
```
