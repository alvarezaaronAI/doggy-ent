## Knowledge Handoff Requirement

The agent must maintain project knowledge transfer documentation.

Whenever a major phase is completed (Admin Cleanup, Server Cleanup, Checkout Cleanup, Products Cleanup, Debugging Pass, QA Pass, etc.), generate or update:

```text
PROJECT_HANDOFF.md
```

Purpose:
- Allow ChatGPT or a future Codex session to understand the project without re-auditing the repository.
- Preserve architectural decisions.
- Preserve domain knowledge.
- Preserve refactor history.
- Document what exists and why.

The handoff document should include:

1. Business overview
2. Client architecture
3. Server architecture
4. Database overview
5. Stripe/payment flow
6. Admin system overview
7. Completed refactors
8. Remaining work
9. Launch readiness assessment
10. Important file index
11. End-to-end flow maps
12. API endpoint inventory
13. Environment variables and deployment notes
14. Build/test/verification commands
15. Known risks and manual QA checklist
16. Current git state and recent commits
17. Dependency and integration map
18. Data ownership / source-of-truth map

For major domains and important files, explain:
- Purpose
- Responsibilities
- Inputs and outputs
- Dependencies
- How the file participates in the overall application flow

For every major user or admin flow, document the full path from UI to server to database and back:
- Storefront product browsing
- Product quick view
- Add to cart
- Cart drawer updates
- Checkout preview
- Promo validation
- Stripe/payment intent flow
- Order creation
- Order success page
- Admin product create/edit/delete
- Admin promo create/edit/test/analytics
- Admin campaign create/edit/status display
- Admin order dashboard and order detail

For API routes, include:
- HTTP method
- Route path
- Controller/handler file
- Service file
- Repository/database file if applicable
- Request payload shape
- Response shape
- Error behavior
- Client files that call the endpoint

For source-of-truth documentation, identify where these live:
- Product statuses
- Selling modes
- Variant sizes
- Price/currency formatting
- Promo statuses and discount rules
- Campaign statuses and donation rules
- Order statuses and timeline rules
- Checkout pricing rules
- Tax/shipping calculations
- Stripe payment intent handling
- Validation rules

For environment and deployment documentation, include:
- Required environment variables by client/server
- Which variables are public vs private
- Stripe-related variables
- Database/Prisma variables
- Railway/Vercel/Cloudflare deployment notes if present in the repo
- Commands used locally versus deployment commands

For verification documentation, include:
- Build commands that pass
- Missing lint/test scripts
- Any `node --check`, import checks, or smoke checks performed
- Manual QA steps required before launch
- Known flows that do not have automated tests

For git/context documentation, include:
- Current branch if available
- Working tree status at the time of handoff
- Recent relevant commits if available
- Files changed in the latest phase
- Any uncommitted files that must be reviewed before continuing

For file index documentation, include every important created or modified file from the recent Admin Cleanup and Server Cleanup phases, grouped by domain, with one clear sentence explaining what each file does.

The handoff should call out uncertainty clearly. If the agent cannot verify something from code, it must say so instead of guessing.

Before starting a new major phase, check whether PROJECT_HANDOFF.md should be updated.


## Repair / Launch-Blocker Pass Requirement

When asked to "fix anything broken," "repair the project," "make sure everything works," "audit issues," or perform a launch-readiness cleanup, the agent must treat the task as a verified repair pass, not a cosmetic refactor.

Primary goal:
- Find, fix, verify, and document real issues that could break the application, payment flow, admin tools, database flow, deployment, or launch readiness.

Before editing code, the agent must:
1. Read `AGENTS.md`.
2. Read `PROJECT_HANDOFF.md` if it exists.
3. Inspect the current repository state instead of trusting old assumptions.
4. Create a prioritized launch-blocker list.
5. Separate confirmed issues from uncertain risks.

The agent must prioritize fixes in this order:
1. Production data safety
2. Payment and checkout correctness
3. Order creation correctness
4. Admin authorization and protected routes
5. Client/server/API mismatches
6. Database/schema/repository mismatches
7. Broken imports or build failures
8. Environment/deployment mismatches
9. Dead duplicate checkout/payment code
10. Documentation accuracy

The agent must specifically audit these launch-critical risks:
- Stripe PaymentIntent amount must be based on trusted server-side pricing, not client-supplied totals.
- Order creation must be idempotent and must not create duplicate orders for the same successful payment.
- Inventory must only be reduced after a successful verified payment.
- Promo usage must not be double-counted or client-spoofed.
- Campaign donation totals and usage must not be client-spoofed.
- Admin-only endpoints must require admin authentication.
- Production startup must never delete, reset, or reseed live data.
- Local `.env` variable names and deployment notes must match the variables actually used by code, without exposing secret values.
- Client API calls must match server routes, payloads, and response shapes.
- Prisma schema fields must match repository/service code.
- Checkout, payment, and order success flows must not rely on stale mock data.

Rules for the repair pass:
- Preserve current storefront and admin UX unless a UI change is required to fix a real bug.
- Do not rewrite the app from scratch.
- Do not perform broad speculative refactors.
- Do not remove working features.
- Follow existing project architecture and naming conventions.
- Use the existing server pattern: route → controller → service → repository → Prisma.
- Use existing client domain patterns: view → composable/service/api → mapper/validator/utils/components.
- Fix in small, understandable groups.
- Keep changes focused on verified issues.
- If something cannot be verified from code, document it clearly as unverified instead of guessing.

Required verification after fixes:
- Run the client build command if available.
- Run the server build/start/syntax checks that are available.
- Run `prisma generate` if Prisma is used.
- Run available lint scripts.
- Run available test scripts.
- If lint or test scripts are missing, document that clearly.
- Check for broken imports.
- Check for client/server endpoint mismatches.
- Check checkout flow from cart → pricing preview → promo validation → Stripe payment intent → order creation → order success page.
- Check admin flows for products, promos, campaigns, orders, and order detail.
- If a command fails, either fix the cause and rerun it, or document why it could not be fixed.

Required final output from the agent:
1. Issues found, grouped by severity.
2. Issues fixed.
3. Files changed.
4. Commands run and results.
5. Remaining risks or unverified areas.
6. Manual QA checklist.
7. Next safest phase after the repair pass.

Required documentation update:
- Update `PROJECT_HANDOFF.md` after the repair pass.
- The update must include fixes made, remaining risks, verification results, current git state, changed files, and the next recommended phase.
- The handoff must clearly say what was verified from code and what remains uncertain.

The repair pass is not complete until code changes are verified and `PROJECT_HANDOFF.md` is updated.


## Post-Repair Verification / Interrupted Session Requirement

When a previous Codex run ended because of credits, rate limits, timeout, interruption, or an inconsistent progress checklist, the next agent must not assume the prior summary is fully correct.

If there are existing local edits from a previous repair pass, the agent must treat them as draft repair changes until verified.

Before making new changes, the agent must:
1. Read `AGENTS.md`.
2. Read `PROJECT_HANDOFF.md` if it exists.
3. Run `git status`.
4. Run `git diff --stat`.
5. Run `git diff --name-status`.
6. Identify whether the previous repair pass actually completed every claimed step.
7. Reconcile any mismatch between the Codex progress checklist, final report, and actual repository state.

The agent must specifically verify the current local edits in these high-risk files before changing anything else:
- `server/src/domains/checkout/services/checkout.service.js`
- `server/src/domains/payments/controllers/payment.controller.js`
- `server/src/domains/payments/services/stripe.payment.js`
- `server/src/domains/orders/services/orders.service.js`
- `server/src/domains/orders/repositories/orders.repository.js`
- `server/src/domains/orders/routes/orders.routes.js`
- `server/prisma/schema.prisma`
- `client/src/domains/checkout/views/CheckoutView.vue`
- `client/src/domains/payments/components/StripeElementsForm.vue`
- `client/src/domains/admin/api/adminOrders.api.js`
- `client/src/domains/admin/views/AdminOrderDetailView.vue`

The post-repair verification pass must prove or disprove these claims from the previous repair pass:
- Stripe PaymentIntent creation no longer trusts client-submitted totals.
- Checkout preview, PaymentIntent creation, and order creation use consistent server-owned totals.
- Shipping price cannot be spoofed by the client.
- Order creation is idempotent for reused Stripe PaymentIntent IDs.
- Inventory decrements only once for a successful payment.
- Duplicate order races are handled safely.
- Promo validation rejects invalid, expired, or over-limit promos before payment work continues.
- Promo usage recording cannot be double-counted under normal retries.
- Campaign usage is recorded server-side and cannot be client-spoofed.
- Admin order routes are protected by admin auth.
- Admin order status updates have matching client and server endpoints.
- Production `npm start` does not run destructive seed logic.
- Local `.env` variable names and `PROJECT_HANDOFF.md` deployment notes match the variables actually read by code, without exposing secret values.
- Prisma migration for unique `stripePaymentIntentId` is safe to apply only after duplicate preflight checks.

Required verification commands for a post-repair pass:
- Run the client build command if available.
- Run the server build command if available.
- Run `prisma generate` if Prisma is used.
- Run available lint scripts.
- Run available test scripts.
- Run targeted `node --check` or import checks for changed server files when useful.
- If scripts are missing, document that they are missing instead of inventing them.

Rules:
- Do not start another broad refactor.
- Do not redo already-correct repairs.
- Do not commit or push unless explicitly asked.
- Only edit files if a verified bug, incomplete repair, broken import, failed build, failed schema check, or unsafe edge case is found.
- If the previous repair pass is correct, leave the code as-is and document verification.
- If the previous repair pass is incomplete, finish only the incomplete parts.

Required final output:
1. What was already completed and verified.
2. What was incomplete or incorrect.
3. What was fixed in this run, if anything.
4. Commands run and exact results.
5. Remaining risks.
6. Whether the local edits are safe to commit or still need review.
7. Next recommended step.

After this pass, update `PROJECT_HANDOFF.md` with the verification results, any additional fixes, remaining risks, and whether the current local working tree is ready for commit review.


## Deployed Frontend API 404 / Backend Host Verification Requirement

When a deployed frontend fails with API 404s on Vercel or another static frontend host, the agent must treat it as a deployment/API routing issue before assuming Stripe, checkout, or browser payment code is broken.

Known symptom pattern:
- Browser console shows requests to the frontend host, for example `https://doggy-ent.vercel.app/api/...`.
- Requests such as `/api/checkout/preview`, `/api/campaigns/preview`, `/api/promos/validate`, or `/api/checkout/create-payment-intent` return 404.
- Checkout shows a confusing error such as `The string did not match the expected pattern.`
- Frontend logs mention JSON parsing or payment service errors after a failed API request.

When this happens, the agent must verify:
1. Whether the frontend is intentionally supposed to proxy `/api` through Vercel.
2. Whether the backend actually runs on Railway or another server host.
3. Whether client API helpers use the correct environment variable for the backend base URL.
4. Whether Vercel environment variables include the required public client variable, such as `VITE_API_BASE_URL`.
5. Whether local `.env` variable names and `PROJECT_HANDOFF.md` document the correct deployment setup without exposing secrets.
6. Whether API error handling safely handles non-JSON responses, such as Vercel 404 HTML pages.

Required audit areas:
- Client API base URL helper or shared fetch wrapper.
- Checkout API calls.
- Payment API calls.
- Promo API calls.
- Campaign API calls.
- Products/storefront API calls.
- Admin API calls.
- Local `.env` variable names only, without copying or exposing secret values.
- Vercel and Railway environment variable requirements documented in `PROJECT_HANDOFF.md`.
- Any `vercel.json`, Vite proxy config, or deployment docs.
- `PROJECT_HANDOFF.md` deployment notes.

Rules:
- Do not change Stripe card logic until API routing is verified.
- Do not assume `/api` works on Vercel unless there is a valid Vercel rewrite/proxy or backend deployed there.
- If the backend is on Railway, the deployed frontend should call the Railway backend URL through a public Vite env variable.
- The agent must explicitly account for the difference between local development and deployed Vercel behavior.
- Local success is not enough verification if local Vite proxying can hide deployed API routing problems.
- If local development uses `/api` through Vite proxy, the deployed Vercel app must still either use a full backend base URL from `VITE_API_BASE_URL` or have a valid Vercel rewrite to the backend.
- Do not hardcode Railway, Vercel, localhost, or any production backend URL directly in client source code.
- The preferred strategy for this project is: local development may default to `/api`, while deployed builds should use `import.meta.env.VITE_API_BASE_URL` when provided.
- The final solution must work locally and on Vercel.
- Codex can update code, examples, and docs, but the user must still set the real `VITE_API_BASE_URL` value inside Vercel project settings and redeploy.
- If the project intentionally uses a Vercel rewrite, verify the rewrite exists and points to the live backend.
- Improve fetch/API error handling so HTML 404 responses do not appear as misleading JSON or Stripe pattern errors.
- Preserve checkout UX.
- Do not commit or push unless explicitly asked.

Required verification:
- Run client build.
- Run server build or syntax/import checks if server code changes.
- Confirm the final deployed API base URL expectation is documented.
- Verify the client build does not bake in `localhost` or the Vercel frontend host as the backend API base URL unless intentionally using a documented rewrite.
- Verify `PROJECT_HANDOFF.md` explains that `VITE_API_BASE_URL` should be set in Vercel to the live backend origin, for example the Railway backend origin, without a trailing `/api` unless the code explicitly expects that shape.
- Verify `PROJECT_HANDOFF.md` includes both local development behavior and Vercel deployment behavior.
- Update `PROJECT_HANDOFF.md` with the root cause, fix, required Vercel/Railway env variables, and manual deployment steps.

This deployment API routing check can be combined with the post-repair verification pass when both are relevant. In that case, first reconcile the interrupted repair pass, then fix the deployed API host/404 issue, then run verification and update `PROJECT_HANDOFF.md` once with both sets of results.


## Prisma Migration / Railway Deployment Verification Requirement

When a Prisma migration exists locally but may not be applied on Railway or another deployed database, the agent must treat migration deployment as a verified database operation, not a blind force update.

Current known context:
- Local migration `20260605000000_unique_order_payment_intent` was applied successfully in local development.
- Local `npx prisma migrate status` reported the database schema was up to date after applying it.
- Local `npx prisma generate` completed successfully.
- Railway migration status is still unknown until explicitly checked.

The agent must verify before applying this migration to Railway or any production-like database:
1. Confirm the migration file exists in `server/prisma/migrations/20260605000000_unique_order_payment_intent/`.
2. Confirm `server/prisma/schema.prisma` matches the migration intent.
3. Confirm the target database does not contain duplicate non-null `stripePaymentIntentId` values.
4. Confirm the target database is the intended Railway/testing database, not the wrong environment.
5. Confirm the migration has not already been applied in `_prisma_migrations`.

Required duplicate preflight query before applying the unique constraint migration to any deployed database:

```sql
SELECT "stripePaymentIntentId", COUNT(*)
FROM "Order"
WHERE "stripePaymentIntentId" IS NOT NULL
GROUP BY "stripePaymentIntentId"
HAVING COUNT(*) > 1;
```

Rules:
- Do not use `prisma migrate reset` on Railway, production, staging, or any shared database.
- Do not use destructive migration commands unless the user explicitly asks and understands data loss.
- Do not apply production/Railway migrations automatically unless the user explicitly asks.
- If the user asks to verify Railway only, check status and document the required command instead of applying.
- For local development, `npx prisma migrate dev` is acceptable.
- For Railway or production-like deployment, use `npx prisma migrate deploy` only after duplicate preflight passes.
- Run `npx prisma generate` after migration deployment when appropriate.
- Update `PROJECT_HANDOFF.md` with whether the migration is applied locally, whether Railway is verified, and any deployment steps still required.

Useful verification commands:

```bash
cd server
npx prisma migrate status
npx prisma generate
```

Useful deployed migration command after preflight passes:

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```



## Vercel SPA Route Fallback / Admin Route Verification Requirement

When a Vue/Vite single-page app works locally but a deployed Vercel URL such as `/admin`, `/admin/login`, `/checkout`, `/orders/:id`, or another client-side route returns `404: NOT_FOUND`, the agent must treat it as a static hosting SPA fallback problem before assuming the Vue router or admin feature is broken.

Known symptom pattern:
- `http://localhost:5173/admin/login?redirect=/admin` works locally.
- `https://doggy-ent.vercel.app/admin` or another direct deployed route returns Vercel `404: NOT_FOUND`.
- Refreshing a nested route on Vercel fails, but navigating to the same route from inside the app may work.

The agent must verify:
1. Whether the client is a Vue/Vite SPA using client-side routing.
2. Whether Vercel is configured to rewrite all non-file routes back to `/index.html`.
3. Whether a `vercel.json` file exists at the correct deployed project root.
4. Whether the Vercel project root is the repository root or the `client` directory.
5. Whether the fallback rewrite is placed in the correct location for the actual Vercel root.
6. Whether API routes are excluded from the SPA fallback so `/api/...` is still handled by the backend strategy or documented rewrite.

Required behavior:
- Direct browser visits to `/admin` and `/admin/login?redirect=/admin` must load the Vue app instead of Vercel 404.
- Browser refresh on client-side routes must load the Vue app instead of Vercel 404.
- Static assets must still load normally.
- API calls must not be swallowed by the SPA fallback if the app expects them to go to Railway or through a proxy rewrite.

Preferred Vercel SPA fallback example when the frontend is deployed as a static Vite app:

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

If the project uses full backend API URLs through `VITE_API_BASE_URL`, the SPA fallback can safely exclude `/api` and allow API calls to go to the configured backend host from client code.

Rules:
- Do not change admin authentication logic until SPA routing fallback is verified.
- Do not assume the admin page is missing just because the deployed direct URL returns Vercel 404.
- Do not add a rewrite that accidentally sends `/api/...` requests to `index.html`.
- Verify the actual Vercel root before deciding where `vercel.json` belongs.
- Preserve existing Vue router behavior and admin UX.
- Update deployment notes or `PROJECT_HANDOFF.md` if the Vercel routing setup changes; do not create `.env.example` files unless the user explicitly asks.

Required verification:
- Run client build.
- Confirm direct deployed routes require a Vercel SPA fallback.
- Confirm `/admin`, `/admin/login?redirect=/admin`, and at least one storefront route are documented in the manual QA checklist.
- Update `PROJECT_HANDOFF.md` with the Vercel SPA fallback root cause, fix, and redeploy steps.

This SPA route fallback check can be combined with the deployed API 404 check. In that case, the agent must distinguish between:
- Page route 404s, such as `/admin`, which need an SPA fallback to `/index.html`.
- API route 404s, such as `/api/checkout/preview`, which need a backend base URL or API rewrite and must not be masked by the SPA fallback.


## Environment File Policy

This project uses local `.env` files for local development and Railway/Vercel dashboard variables for deployed environments.

Rules:
- Do not create new `.env.example` files unless the user explicitly asks for them.
- If a previous repair pass created `client/.env.example` or `server/.env.example`, remove those files unless the user explicitly says to keep them.
- Do not commit `.env`, `.env.local`, `.env.production`, or any file containing real secrets.
- Do not copy secret values from `.env` into `PROJECT_HANDOFF.md`, `AGENTS.md`, comments, logs, or example files.
- It is acceptable to document required environment variable names in `PROJECT_HANDOFF.md`, but values must be described as placeholders only.
- For local development, read variable names from the existing local `.env` files only as needed.
- For deployment, document that matching values must be configured inside Railway and Vercel dashboards.

Important deployment variables to document by name only:
- Server/Railway: `PORT`, `NODE_ENV`, `CLIENT_URL`, `FRONTEND_URL` if used by code, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `STRIPE_SECRET_KEY`, `DATABASE_URL`.
- Client/Vercel: `VITE_API_BASE_URL`, Stripe publishable key variable if used by code.



## Admin Auth Session Stabilization / Future Better Auth Requirement

When the deployed admin page loads but admin login does not persist or redirect correctly, the agent must first stabilize the current custom admin auth system before attempting a Better Auth migration.

Known current behavior:
- Vercel `/admin` and `/admin/login?redirect=/admin` can load after SPA fallback fixes.
- Login accepts the correct admin credentials.
- After login, the app does not redirect to the admin dashboard or immediately behaves as unauthenticated.
- Browser console/network shows `401` for the Railway backend request to `/api/auth/me`.
- This means credentials may be valid, but the deployed Vercel frontend is not persisting or sending the Railway admin session correctly.

Current auth system:
- The project currently uses custom admin auth, not Better Auth yet.
- Admin credentials are based on environment variables such as `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`.
- The server creates an admin session cookie.
- Admin route protection depends on the frontend calling `/api/auth/me` and the backend validating the session.
- Admin sessions may currently be in-memory and therefore temporary.

Primary goal for this phase:
- Fix the deployed custom admin login/session flow so the existing admin dashboard works on Vercel + Railway.
- Preserve the existing admin dashboard, admin routes, admin UX, products, promos, campaigns, and orders pages.
- Do not migrate to Better Auth in this phase unless the user explicitly asks for a full auth migration.

The agent must audit and fix, if needed:
1. Login response `Set-Cookie` behavior.
2. Cookie attributes for cross-site Vercel → Railway usage, including `SameSite=None` and `Secure` in production.
3. Whether cookies are `HttpOnly` and have the expected session cookie name.
4. Server CORS config and whether credentials are enabled.
5. Exact allowed frontend origins from `CLIENT_URL`, `FRONTEND_URL`, or any origin allowlist.
6. Whether Vercel and Railway origins match exactly, with no incorrect protocol, port, slash, or stale domain.
7. Whether all admin/auth client requests use the shared API helper and send credentials.
8. Whether `/api/auth/me` receives the session cookie after login in deployed environments.
9. Whether router guards correctly wait for auth verification after login before redirecting.
10. Whether server logs reveal missing cookies, invalid sessions, or CORS rejections.

Rules:
- Do not rebuild the admin dashboard.
- Do not replace admin pages.
- Do not introduce Better Auth yet unless explicitly requested.
- Do not change admin UX except as required to fix real login/session bugs.
- Do not weaken auth just to make login work.
- Do not expose admin secrets or cookie values in logs, docs, or handoffs.
- Preserve the current admin dashboard and all existing admin feature work.
- If cross-site cookies remain unreliable, document the options clearly before implementing a larger auth/session migration.

Future auth direction:
- Better Auth is the preferred future auth direction for the Accounts + Loyalty phase.
- Future Better Auth work should replace the custom auth/session layer, not rebuild the admin dashboard.
- The admin dashboard should survive the migration and later use roles/permissions such as `ADMIN` and `CUSTOMER`.
- Future customer accounts may include order history, saved addresses, loyalty points, referral rewards, and customer profile pages.
- Do not begin the Better Auth migration until checkout, deployed admin login, and admin CRUD flows are stable.

Required verification:
- Run client build.
- Run server build or server syntax/import checks if server files changed.
- Verify locally that admin login still works.
- Verify deployed expectation for Vercel → Railway auth session:
  - login request succeeds,
  - response sets a usable session cookie,
  - `/api/auth/me` returns authenticated admin after login,
  - admin dashboard redirects correctly,
  - refresh on `/admin` keeps or properly verifies the session.
- Update `PROJECT_HANDOFF.md` with the admin auth root cause, fix, required env variables, manual QA steps, and remaining limitations.

Manual QA checklist for this phase:
- Visit `/admin` directly on Vercel.
- Confirm redirect to `/admin/login?redirect=/admin` if logged out.
- Log in with admin credentials.
- Confirm redirect to admin dashboard.
- Refresh `/admin` and remain authenticated if the session is still valid.
- Open admin products, promos, campaigns, orders, and order detail pages.
- Log out if logout exists, then confirm `/api/auth/me` returns unauthenticated.


### Known Deployment Environment Context

Before changing auth, cookies, CORS, or API configuration, verify actual environment variable usage from source code.

Vercel:
- May contain `VITE_API_URL`.
- May contain `VITE_API_BASE_URL`.
- The agent must determine which variable is actually consumed by the client.
- If code expects `VITE_API_BASE_URL`, either support `VITE_API_URL` as a backward-compatible alias or clearly document the required migration.
- Do not assume both variables exist.

Railway:
- May contain `FRONTEND_URL`.
- May not contain `CLIENT_URL`.
- The agent must determine which variable(s) are actually consumed by CORS, cookie, session, and auth configuration.
- If code expects `CLIENT_URL` but only `FRONTEND_URL` exists, fix the mismatch or document the required deployment variable.
- Verify Vercel and Railway origins match exactly, including protocol, host, and trailing slash behavior.

Required deployment auth verification:
1. Inspect actual environment variable usage in source code.
2. Verify login response contains the expected Set-Cookie header.
3. Verify cookie attributes in production.
4. Verify frontend requests send credentials.
5. Verify backend CORS allows credentials.
6. Verify `/api/auth/me` receives the session cookie after login.
7. Verify router redirects only after auth verification completes.
8. Do not assume a cookie issue until environment variable mismatches are ruled out.

The correct short-term goal is a stable deployed custom admin auth flow. The correct long-term goal is Better Auth during the customer accounts/loyalty phase.


## Local Admin Data Target Modes / Temporary Railway Admin Workflow

When cross-site cookies make deployed Vercel admin auth unreliable, the preferred temporary workflow is to run the admin frontend locally and choose the API/database target at startup, not with buttons inside the admin UI.

Primary goal:
- Allow the user to manage products, promos, campaigns, and orders from the local admin UI while choosing whether changes go to the local database or the Railway database.
- Avoid weakening auth with token fallbacks unless explicitly requested.
- Avoid adding risky per-action upload buttons that can accidentally write to the wrong database.
- Preserve the existing admin dashboard and all current admin pages.

Preferred modes:

1. Fully local mode:
   - Local client/admin calls local server.
   - Local server writes to local database.
   - Intended for safe testing and development.
   - Flow: `localhost:5173 → localhost server → local DB`.

2. Railway admin mode:
   - Local client/admin calls Railway backend.
   - Railway backend writes to Railway database.
   - Intended for uploading/editing data that the deployed Vercel storefront should see.
   - Flow: `localhost:5173 → Railway backend → Railway DB → Vercel storefront`.

Implementation rules:
- Choose the data target through Vite modes / startup scripts, not runtime buttons.
- Add scripts such as `dev:local` and `dev:railway` in the client package if they do not already exist.
- Use Vite mode files or existing local env strategy to set the API target per mode.
- Do not commit files containing real secrets.
- It is acceptable to create local-only env files if they are gitignored and contain no secrets beyond public client URLs.
- Prefer documenting variable names and local setup steps in `PROJECT_HANDOFF.md` instead of committing `.env.example` files.
- The client should continue supporting the existing deployed variable strategy, including `VITE_API_URL` and/or `VITE_API_BASE_URL` as verified from code.
- Do not hardcode Railway, localhost, Vercel, or production domains in source code outside local-only env/config files or documentation.
- Do not add admin UI buttons that switch the data target per request unless the user explicitly asks later.

Recommended client mode shape:

```json
{
  "scripts": {
    "dev:local": "vite --mode local",
    "dev:railway": "vite --mode railway"
  }
}
```

Recommended local-only client variables by mode:

```env
VITE_API_URL=http://localhost:3000
VITE_ADMIN_DATA_TARGET=LOCAL
```

```env
VITE_API_URL=https://<railway-backend-origin>
VITE_ADMIN_DATA_TARGET=RAILWAY
```

Admin UI requirement:
- Show a clear, visible admin data target badge somewhere in the admin layout/dashboard.
- The badge should display whether the current admin session is targeting `LOCAL` or `RAILWAY`.
- If the target is Railway, show a stronger warning style/copy such as `RAILWAY DATA TARGET` or `Editing Railway data`.
- Preserve the existing admin UX and do not redesign the admin pages.

Server/CORS requirement:
- Railway must allow local admin origin when using Railway admin mode, such as `http://localhost:5173`.
- If the backend supports `FRONTEND_URL` or `CLIENT_URL`, document how to include both deployed Vercel origin and local admin origin.
- Do not expose secret values while documenting this.

Verification required:
- Run client build.
- Run server build or syntax checks if server/CORS code changes.
- Verify `npm run dev:local` points to local API configuration.
- Verify `npm run dev:railway` points to Railway API configuration.
- Verify the admin data target badge reflects the chosen mode.
- Verify local mode does not accidentally target Railway.
- Verify Railway mode does not accidentally target local server.
- Update `PROJECT_HANDOFF.md` with exact commands, expected flows, required env variable names, and manual QA steps.

Manual QA checklist:
- Start local server and client in local mode.
- Confirm admin badge says local target.
- Create or edit a test product locally and confirm it affects local DB only.
- Start client in Railway mode.
- Confirm admin badge says Railway target.
- Create or edit a test product/promo/campaign and confirm it appears in Railway/Vercel data.
- Confirm checkout/storefront still uses the deployed Railway data on Vercel.

This is a temporary workflow until the project uses a proper same-site custom domain setup, such as frontend on the owned domain and backend on an API subdomain, or until Better Auth is introduced during the Accounts + Loyalty phase.