# Server Admin Gateway Checkpoint

2026-10-25, feat/separate-admin-application. Server-only slice; main owns client,
Vercel middleware/workspace, project docs, publication and every provider operation.
No environment file, shared data, credential, session, network or Git write.

## Plan And State

- planned (source implemented and locally verified, not activated): pure configuration,
  reusable middleware, compatibility controllers/routes, native handler mount and
  synthetic tests. Default off preserves legacy access.
- Activation is main-owned after tests: target existing Railway API plus protected
  doggy-ent-admin Vercel server gateway, same database. Securely transfer one dedicated
  ADMIN_GATEWAY_SECRET; never expose it through VITE variables or browser headers.
- Enabling ADMIN_GATEWAY_REQUIRED requires a backend restart on an explicitly reviewed
  artifact. npm start invokes migration deploy; do not use it as a verification step.
  Confirm exact deployed source, secure provider access and backup/recovery first.
- Affected flows: all compatibility /api/auth endpoints, native /api/admin-auth, every
  requireAdminAuth consumer including legacy product/promo/campaign aliases. Existing
  persisted ADMIN/ACTIVE session authorization remains required. No session revocation
  or forced logout is performed; direct legacy admin access, including logout, becomes
  unavailable without the gateway. Public/customer/guest/webhook routes stay unchanged.
- Verification before cutover: protected Vercel aliases reject unauthenticated users;
  direct backend admin requests fail without the gateway even with a valid session;
  the gateway alone cannot read admin data; approved admin login/read/logout and old
  session rejection pass; public/customer/guest/webhook controls remain unchanged.
- Revocation/recovery: main must coordinate both consumers for future replacement,
  verify new access and old-header rejection. Recover forward with fresh material if
  compromised; never restore a known-compromised credential. A deliberate approved
  flag-off rollback reopens legacy access and is not equivalent to secure containment.
- Not deployed/new-verified/old-revoked: no live action in this slice. Provider source
  identity is not freshly inspected here; handoff records production main 4930ee4,
  Railway d720bc23-f74c-4192-ab8f-3e720616b8a2. Main must revalidate before deployment.
- Owner coordination reports new protected Vercel project
  prj_pTwNfe2o74fTR4YEsSAhORhBCv8W, All Deployments, no secrets staged/cutover yet.
  This slice has not independently inspected that provider state.

## Names-Only Inventory

Read-only security preflight passed, no high findings; ignored local env files remain
untracked. Names/presence are not provider validity or incident clearance. Existing
Railway incident checkpoint remains authoritative; no new evidence of shop compromise.
[Railway's official incident report](https://blog.railway.com/p/preliminary-report-october-security-incident)
was reread; it does not establish compromise of this shop. No rotation is performed.

- Gateway: owner-managed dedicated shared credential, Vercel server issuer/consumer
  transfer to Railway; no alias/fallback/signing use. Flag accepts only literal true
  or false (unset defaults false); enabled secret needs >=32 characters, no whitespace,
  <=1024 UTF-8 bytes. Header has the same upper bound; duplicates are rejected.
- Database: Railway PostgreSQL -> DATABASE_URL; managed POSTGRES_PASSWORD/PGPASSWORD,
  DATABASE_PUBLIC_URL aliases are provider-managed. Local base/explicit Railway-DB
  overlay and production consumers are separate; no database access in this slice.
- Signing/encryption: BETTER_AUTH_SECRET precedes ADMIN_SESSION_SECRET; admin/customer
  Better Auth plus signed checkout/payment/email-preview capabilities share selection.
  Development alone can fall back to ADMIN_PASSWORD_HASH for auth. None changed here.
- Bootstrap/persisted: ADMIN_PASSWORD_HASH only provisions an absent admin; persisted
  Better Auth Account.password and Session records are distinct and unchanged.
- Providers: Stripe STRIPE_SECRET_KEY; Better Auth Infrastructure BETTER_AUTH_API_KEY;
  Resend RESEND_API_KEY; Shippo SHIPPO_API_KEY/SHIPPO_API_TOKEN alias and
  SHIPPO_WEBHOOK_SECRET. Local configured copies do not establish production presence.
- Public configuration: origins/base URLs, ports, email addresses, display/data-target
  settings and VITE_STRIPE_PUBLISHABLE_KEY are not private credentials. No public
  configuration or existing credential is repurposed as gateway identity.

## Entrypoint Review

Protected routes use requireAdminAuth, including products library/writes; promo
reads/writes/usage; campaign reads/writes/usage; orders/customers; notifications/email
templates; media library/uploads; storefront editing; support/internal issues; and
shipping/tracking admin actions. Native admin auth retains its three-path allowlist.
Public campaign/preview, promo validation, media reads and Shippo webhook are intentionally
not admin gates even where existing router aliases expose public paths. Main must
allowlist the Vercel gateway's forwarded paths/methods; do not blanket-gate public API.
No additional unknown admin entrypoint found in the current route inventory.

## Verification

- Focused: npx --no-install vitest run tests/tier2/admin/admin-gateway.test.js
  tests/tier2/admin/admin-gateway-http.test.js: 20/20, two files.
- Full server npm test: 413/413 in 51 files (tier1 28/8, tier2 379/41,
  tier3 6/2). npm run build passed content synchronization and Prisma client
  generation 6.16.2; no database query/migration or application server startup.
- Fixtures use the actual app mounts and real Better Auth with memory persistence;
  Prisma/Stripe are rejecting stubs, public catalog/guest checkout are controller
  stubs, customer auth/session are stubs. No real email/payment/provider interaction.
- Tested: strict flag/material config and startup rejection; generic no-store 403;
  absent/wrong/oversized/array/duplicate/whitespace header rejection; fixed 32-byte
  digest comparison; no origin/identity/cookie/query bypass; all compatibility and
  native auth paths; 14 protected route families/aliases before session lookup;
  anonymous gateway-only denial; compatibility/native login/read/logout/revocation;
  fresh role/status denial; disabled legacy access; public/customer/guest/webhook
  routing unaffected. Existing tests cover the underlying provider/business behavior.
- Digest comparison follows [Node's timingSafeEqual contract](https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b);
  no raw or secret-derived material is logged or stored by the middleware.
- First focused run had two fixture-only failures (raw duplicate request lacked Host;
  webhook fixture used the wrong existing header name); corrected fixtures and reran
  focused/full checks successfully. No production behavior changed for those fixes.
- Missing coverage: live Vercel Authentication/proxy, deployed source/config identity,
  browser cookies/Safari, successful real business mutations and provider acceptance.
  No coverage percentage was generated. Existing global CORS preflight behavior is
  unchanged; preflight success never authorizes a session or controller action.
- Eight task JavaScript files pass node --check. git diff --check -- server passes.
  Checkpoint Markdown fences/link syntax pass. Scoped comparison of all nine task
  files with configured local private values finds no matches; no values printed.
  This is not an exhaustive or historical secret scan. No dependency/lockfile change.
- No task-owned process remains. Main must integrate its proxy/client changes, review
  this nine-file server slice and perform approved deployment/cutover verification.

## Exact File Manifest

- src/config/env.js
- src/app.js
- src/app/middleware/auth/requireAdminGateway.js (new)
- src/app/middleware/auth/requireAdminAuth.js
- src/domains/auth/controllers/auth.controller.js (new; extracted existing handlers)
- src/domains/auth/routes/auth.routes.js
- tests/tier2/admin/admin-gateway.test.js (new; 10 tests)
- tests/tier2/admin/admin-gateway-http.test.js (new; 10 tests)
- ADMIN_GATEWAY_CHECKPOINT.md (new; this nonsecret receipt)
