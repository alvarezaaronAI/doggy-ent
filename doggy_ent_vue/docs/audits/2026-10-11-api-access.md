# API Access Audit

Reviewed: 2026-10-11. Source: server/src/app.js, every mounted domain route file, controllers/services/validators/repositories, and installed Better Auth 1.7.7 / Infra 0.2.14 endpoint metadata. This is an access-control inventory, not a claim that every endpoint was exercised against production.

## Global Boundaries

CORS allows only exact configured origins with credentials; disallowed browser origins receive 403. CORS is not authentication. JSON/auth bodies are capped at 100 KB, including native chunked auth bodies. API unknown paths return JSON 404. Server never mounts a source/env directory. Protected APIs have no-store headers. Customer/user roles come from server sessions, not request bodies.

Rate limits are per-process/IP: auth 80/15 min, admin login 10/15 min shared across native and compatibility paths, payment 30/15 min, checkout and campaign preview 80/15 min, promo validation 30/15 min, support writes 20/15 min, image uploads 20/15 min, manual email send 10/15 min, Shippo webhook 200/15 min. Other catalog/admin reads and several authenticated writes have no specific limiter. Multi-instance stores and proxy/IP configuration are not load-tested.

## Mounted Application Routes

PUBLIC = no login. CUSTOMER = requireCustomerAuth with CUSTOMER/ACTIVE and ownership-scoped service/repository. ADMIN = requireAdminAuth with persisted ADMIN/ACTIVE session; all admin mutation actors are server-derived. Receipt capability = signed, purpose/reference-bound, short-lived proof or customer ownership.

| Method | Path | Access | Validation, response and abuse boundary |
| --- | --- | --- | --- |
| GET | /api/health | PUBLIC | Constant health response; no secrets |
| GET | /api/products | PUBLIC | Published statuses only; variant prices remain cents |
| GET | /api/products/:slug | PUBLIC | Draft/archived hidden; 404 if unavailable |
| GET | /api/products/admin/library | ADMIN | Full catalog including drafts; existing client normalization |
| POST | /api/products | ADMIN | Product fields/status/sizes/prices/stock; media references |
| PUT | /api/products/:id | ADMIN | Same validation; transactional variant replacement; preserve inactive sizes |
| DELETE | /api/products/:id | ADMIN | Product lookup; destructive authorized catalog deletion, not exercised |
| GET | /api/promos and /api/admin/promos | ADMIN | Full promo list; no public admin-list alias |
| GET | both promo prefixes/:promoId | ADMIN | Protected detail |
| GET | both promo prefixes/:promoId/analytics | ADMIN | Protected redemptions/analytics with customer data |
| POST | both promo prefixes | ADMIN | Normalization/type/date/discount rules; not generic mass assignment |
| PUT | both promo prefixes/:promoId | ADMIN | Same rules; explicit persistence |
| DELETE | both promo prefixes/:promoId | ADMIN | Archive, not physical delete |
| POST | both promo prefixes/validate | PUBLIC | Required normalized email; DB-resolved items/subtotal, eligibility/window/limits; 30/15 min |
| GET | /api/campaigns/public and /api/admin/campaigns/public | PUBLIC | Public allowlist only; active published commerce summary |
| GET | both campaign prefixes/public/:slug | PUBLIC | Reviewed publication/status allowlist; no draft/internal analytics |
| GET | /api/campaigns and /api/admin/campaigns | ADMIN | Full campaign management; aliases retain guard |
| GET | both campaign prefixes/:campaignId | ADMIN | Protected detail |
| POST | both campaign prefixes | ADMIN | Rule/date/content/link/product validation |
| PUT | both campaign prefixes/:campaignId | ADMIN | Same validation; editor saves |
| DELETE | both campaign prefixes/:campaignId | ADMIN | Protected mutation; not exercised |
| POST | both campaign prefixes/preview | PUBLIC | DB-resolved items/prices; limiter; cannot persist usage |
| POST | both campaign prefixes/record-usage | ADMIN | Legacy protected attribution mutation; validates array, but no paid-order binding; unused by current client, retain pending approved retirement |
| GET | /api/checkout/shipping-options | PUBLIC | Constant configured fallback options |
| POST | /api/checkout/shipping-rates | PUBLIC | Trusted catalog/rate service; checkout limiter; live provider not called in audit |
| POST | /api/checkout/preview | PUBLIC | DB catalog/prices, normalized promo email, campaigns, shipping/tax; server totals; checkout limiter |
| POST | /api/checkout/create-payment-intent | PUBLIC | Required contact/address, trusted preview/invalid promo rejection; payment limiter; returns intended Stripe client secret and signed payment proof |
| POST | /api/checkout | PUBLIC with payment proof | Email/PI-bound signed proof, verified Stripe amount/currency/status, idempotent unique PI order; customer-safe projection; checkout limiter |
| GET | /api/checkout/orders/:reference | Receipt capability or owner | No reference-only PII; no admin notes/actors/raw Stripe record |
| GET | /api/admin/orders | ADMIN | Protected order list; currently unpaginated |
| GET | /api/admin/orders/stats | ADMIN | Protected all-time aggregates; financial semantics require review |
| GET | /api/admin/orders/:orderId | ADMIN | Allowlisted internal record and protected history |
| PATCH | /api/admin/orders/:orderId/status | ADMIN | Status enum validation; compare-and-set/history transaction; actual actor; no automatic email/refund |
| POST | /api/admin/orders/:orderId/emails/resend | ADMIN | Retired path returns 410; use preview/send |
| GET | /api/admin/customers | ADMIN | CUSTOMER rows only; no credentials/sessions; unpaginated |
| GET | /api/admin/customers/:customerId | ADMIN | CUSTOMER record only; verified-email guest matches and allowlisted internal detail |
| POST | /api/admin/customers/:customerId/deactivate | ADMIN | CUSTOMER-only update/audit; existing sessions rejected by status guard |
| POST | /api/admin/customers/:customerId/reactivate | ADMIN | CUSTOMER-only update/audit |
| POST | /api/admin/customers/:customerId/resend-verification | ADMIN | Existing customer lookup; Better Auth email provider; not live-tested |
| POST | /api/admin/customers/:customerId/password-reset | ADMIN | Existing customer lookup; Better Auth reset provider; not live-tested |
| GET | /api/admin/notifications | ADMIN | Protected delivery history/stats |
| GET | /api/admin/email-templates | ADMIN | Protected saved templates/suggestions |
| POST | /api/admin/email-templates | ADMIN | Validated text placeholders/event/fields, escaped renderer |
| PUT | /api/admin/email-templates/:id | ADMIN | Validated revision-matched save/archive |
| POST | /api/admin/email-templates/:id/preview | ADMIN | Real saved order, eligibility/status/tracking/recipient, actor-bound proof; no send |
| POST | /api/admin/email-templates/:id/send | ADMIN | Confirmed non-stale actor-bound proof, preferences, unique/provider dedupe, default dry run; 10/15 min |
| GET | /api/account | CUSTOMER | Authenticated dashboard/order scope; customer-safe projection |
| GET | /api/account/profile | CUSTOMER | Authenticated user only; no credential/profile internal notes |
| PUT | /api/account/profile | CUSTOMER | Typed/bounded allowlist; own ID from session; profile/preferences writes not yet one transaction |
| GET | /api/account/notifications | CUSTOMER | Own or verified-email-scoped deliveries; no token/action URL |
| GET | /api/account/orders | CUSTOMER | Owner ID or verified matching guest email; unpaginated response |
| GET | /api/account/orders/:reference | CUSTOMER | Same ownership inside DB query; 404 for non-owner |
| GET | /api/account/issues | CUSTOMER | Own case/message list; internal notes/events filtered |
| GET | /api/account/issues/:caseNumber | CUSTOMER | Own case lookup; no arbitrary private metadata |
| POST | /api/account/orders/:reference/issues | CUSTOMER | Owned order, category/text/eligibility window; 20/15 min |
| GET | /api/admin/order-issues | ADMIN | Protected support list/internal projection |
| PATCH | /api/admin/order-issues/:caseNumber | ADMIN | Valid status/priority/bounded resolution; authenticated actor |
| POST | /api/admin/order-issues/:caseNumber/messages | ADMIN | Bounded body/internal versus customer visibility; actual actor; no automatic email; 20/15 min |
| GET | /api/admin/internal-issues | ADMIN | Protected safe operational context |
| PATCH | /api/admin/internal-issues/:caseNumber | ADMIN | Status/severity/bounded notes; actual actor |
| POST | /api/webhooks/shippo | Shared secret | 503 if unset, 401 if mismatched, timing-safe comparison; rate-limited acknowledgement only, NO fulfillment mutation/signature-event ledger |
| PUT | /api/admin/orders/:orderId/tracking | ADMIN | Carrier/number/HTTPS link; provider abstraction; terminal-state guards; no label/email |
| POST | /api/admin/orders/:orderId/tracking/refresh | ADMIN | Existing protected shipment; bounded provider timeout; no automatic email |
| GET | /api/admin/shipments | ADMIN | Bounded protected shipment overview |
| GET | /api/storefront/content | PUBLIC | Published content allowlist only |
| GET | /api/admin/storefront | ADMIN | Draft/publication/revision read |
| PUT | /api/admin/storefront/draft | ADMIN | Content/link/color/section validation; existing media; revision conflict |
| PUT | /api/admin/storefront/publish | ADMIN | Same validation; explicit publication; revision conflict |
| GET | /api/media/:id | PUBLIC | Valid ID; inert public WebP, nosniff, immutable checksum cache; not private storage |
| GET | /api/media/:id/thumbnail | PUBLIC | Same public-media boundary |
| GET | /api/admin/media | ADMIN | Validated search/folder/page; metadata only, bounded paging |
| POST | /api/admin/media | ADMIN | 8 MB raw raster only, no inflation, 20 MP, content MIME/single-page validation, WebP normalization, capacity/processing limits |
| PATCH | /api/admin/media/:id | ADMIN | Bounded name/alt/folder; no bytes replacement/delete |
| POST | /api/auth/login | PUBLIC credentials | Better Auth admin credential/session gate; bounded typed inputs; shared login limiter |
| POST | /api/auth/logout | Signed admin cookie | Persistent deletion verification; failure is not success |
| GET | /api/auth/me | ADMIN | Fresh DB session/role/status; sanitized identity |
| GET | /api/auth/data-target | ADMIN | Backend-confirmed mode, no connection string |
| POST | /api/admin-auth/sign-in/email | PUBLIC credentials | Native admin engine; ADMIN/ACTIVE, no signup; shared limiter |
| POST | /api/admin-auth/sign-out | Signed admin cookie | Native revocation verified; no-store |
| GET/POST | /api/admin-auth/get-session | Optional admin cookie | Native sanitized session response; business APIs independently enforce ADMIN |
| Any | other /api/admin-auth/* | Unavailable | Explicit 404; native customer management/recovery paths not mounted |
| Any | unknown /api/* | Unavailable | JSON 404; no static source/env exposure |

The old server/src/domains/admin route files only re-export domain routers and are not independently mounted. No Stripe webhook endpoint exists. No refund/label/customer-upload endpoint exists.

## Installed Customer Auth Endpoint Inventory

All paths below are under /api/customer-auth, share CORS/auth body limit and the account limiter. This list is generated from the installed engine's actual path/method metadata, not invented routes. Provider JWT/invitation management is a separate privileged surface: valid provider access could manage users/roles, so BETTER_AUTH_API_KEY and Infrastructure permissions require owner review. Missing-token dashboard requests reject before business mutation; valid Infrastructure credentials were not used.

| Method | Native path | Access and scope |
| --- | --- | --- |
| POST | /sign-in/social | No social providers configured; not a working social-login feature. |
| GET/POST | /callback/:id | No social providers configured; native OAuth callback controls apply. |
| GET/POST | /get-session | Optional signed cookie; null without session; sanitized response. |
| POST | /sign-out | Current signed cookie; persistent revocation verified before success. |
| POST | /sign-up/email | Public; role/status input disabled; schema/password validation; signup emails may be configured. |
| POST | /sign-in/email | Public credentials; native password validation and database session; invalid credentials rejected. |
| POST | /reset-password | Single-use, unexpired reset proof; password validation; revoke old sessions. |
| POST | /verify-password | Authenticated native password verification. |
| GET | /verify-email | Verification token; native expiry/signature; live email workflow not exercised. |
| POST | /send-verification-email | Public account/security request; generic native response; provider sends not tested. |
| POST | /change-email | Disabled by current configuration; no unsafe email-change UI added. |
| POST | /change-password | Authenticated native current-password/freshness checks; token JSON redacted. |
| POST | /update-session | Authenticated owner; native core session fields cannot be edited. |
| POST | /update-user | Authenticated owner; role/status fields input:false. |
| POST | /delete-user | Disabled by current configuration; no deletion workflow enabled. |
| POST | /request-password-reset | Public account/security request; generic native response; live sends not tested. |
| GET | /reset-password/:token | Reset proof plus trusted redirect; never log request URL. |
| GET | /list-sessions | Authenticated owner; session token JSON redacted. |
| POST | /revoke-session | Authenticated owner; native owned-token validation. No individual-device UI exists. |
| POST | /revoke-sessions | Authenticated owner; revokes own sessions. |
| POST | /revoke-other-sessions | Authenticated owner; revokes other own sessions. |
| POST | /link-social | Authenticated native account linking; no social providers configured. |
| GET | /list-accounts | Authenticated owner; credential/provider token fields redacted. |
| GET | /delete-user/callback | Deletion is not enabled in this application. |
| POST | /unlink-account | Authenticated owner; native account safeguards. |
| POST | /refresh-token | Native account ownership/provider checks; no OAuth providers configured; secret fields redacted. |
| POST | /get-access-token | Native ownership/provider checks; no OAuth providers configured; token JSON redacted. |
| GET | /account-info | Native authenticated/provider account checks; no social providers configured. |
| GET | /dash/config | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/validate | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/list-users | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/export-users | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/create-user | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/delete-user | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/delete-many-users | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/list-organizations | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/export-organizations | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/organization/:id | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/organization/:id/members | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/organization/:id/invitations | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/organization/:id/teams | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/organization/:id/sso-providers | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/:id/sso-provider/create | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/:id/sso-provider/update | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/:id/sso-provider/request-verification-token | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/:id/sso-provider/verify-domain | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/:id/sso-provider/delete | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/:id/sso-provider/mark-domain-verified | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/organization/:orgId/teams/:teamId/members | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/create | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/delete | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/delete-many | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/organization/options | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/user | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/user-organizations | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/update-user | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/set-password | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/unlink-account | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/sessions/revoke | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/sessions/revoke-all | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/sessions/revoke-many | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/impersonate-user | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/update | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/create-team | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/update-team | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/delete-team | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/add-team-member | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/remove-team-member | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/add-member | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/remove-member | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/update-member-role | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/invite-member | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/cancel-invitation | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/resend-invitation | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/check-user-by-email | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/user-stats | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/user-graph-data | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/user-retention-data | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/ban-user | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/ban-many-users | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/unban-user | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/send-verification-email | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/send-many-verification-emails | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/send-reset-password-email | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/enable-two-factor | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/complete-two-factor-setup | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/view-two-factor-totp-uri | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/view-backup-codes | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/disable-two-factor | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/generate-backup-codes | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /events/list | Native session/user scope; package ownership/organization checks; live Infra not tested. |
| GET | /events/audit-logs | Native session/user scope; package ownership/organization checks; live Infra not tested. |
| GET | /events/all-audit-logs | Native session plus elevated organization permissions; organizational feature not enabled/tested. |
| GET | /events/types | Native session/user scope; package ownership/organization checks; live Infra not tested. |
| GET | /dash/accept-invitation | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/complete-invitation | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/complete-invitation-social | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/check-user-exists | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /dash/organization/:id/directories | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/directory/create | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/directory/delete | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/organization/directory/regenerate-token | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| POST | /dash/execute-adapter | Infra-defined provider JWT/API-key binding or invitation proof; not authorized by a CUSTOMER cookie. Valid provider operations not tested. |
| GET | /ok | Public health-style native response. |
| GET | /error | Public native error redirect/response; not customer data. |

The native setPassword API has no HTTP path in the installed endpoint metadata. No endpoint route was invented for it. Password/reset/verification material belongs in HttpOnly/native transport and email links, never docs or logs.

## Verification Limits

A guarded local Prisma/HTTP smoke test rejected 20 anonymous read groups, verified a real persisted ADMIN session and protected library access, deleted it on logout, then rejected a copied cookie. Native-engine fixtures verify role/status rejection, origin/expiry/legacy-cookie rejection, reset expiry/reuse, token sanitization and DB-failure logout. Existing route tests cover admin records, campaign publication, media byte limits and website auth. Ownership tests inspect real repository query contracts.

This is not complete runtime coverage of every path, live Infra JWT validation, cross-site Safari QA, provider transactions, webhook retry handling or a production penetration test. See [production audit](2026-10-11-production-audit.md).
