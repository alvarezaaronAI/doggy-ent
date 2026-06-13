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

When cross-site cookies make deployed Vercel admin auth unreliable, the preferred temporary workflow is to run both the admin frontend and backend locally, then choose which database the local backend uses at startup. Do not use local frontend → Railway backend as the preferred Railway admin workflow because that can still trigger cross-site cookie problems.

Primary goal:
- Allow the user to manage products, promos, campaigns, and orders from the local admin UI while choosing whether the local backend writes to the local database or the Railway database.
- Avoid weakening auth with token fallbacks unless explicitly requested.
- Avoid adding risky per-action upload buttons that can accidentally write to the wrong database.
- Preserve the existing admin dashboard and all current admin pages.

Preferred modes:

1. Fully local mode:
   - Local client/admin calls local server.
   - Local server writes to local database.
   - Intended for safe testing and development.
   - Flow: `localhost:5173 → localhost server → local DB`.

2. Railway-data local admin mode:
   - Local client/admin calls local backend.
   - Local backend connects to Railway database using a local-only server env file.
   - Intended for uploading/editing data that the deployed Vercel storefront should see.
   - Flow: `localhost:5173 → localhost server → Railway DB → Vercel storefront`.
   - This avoids deployed Vercel/Railway cross-site cookie problems because admin auth is local-to-local during the temporary workflow.

Implementation rules:
- Choose the data target through Vite modes / startup scripts, not runtime buttons.
- Add or verify client scripts such as `dev:local` for local admin frontend.
- Add or verify server scripts such as `dev:local` and `dev:railway` so the local backend can choose local DB or Railway DB at startup.
- Use Vite mode files or existing local env strategy to set the API target per mode.
- For Railway-data local admin mode, the client should still call the local backend, while the server chooses Railway database through a local-only server env file.
- Do not commit files containing real secrets.
- It is acceptable to create local-only env files if they are gitignored and contain no secrets beyond public client URLs.
- Prefer documenting variable names and local setup steps in `PROJECT_HANDOFF.md` instead of committing `.env.example` files.
- The client should continue supporting the existing deployed variable strategy, including `VITE_API_URL` and/or `VITE_API_BASE_URL` as verified from code.
- Do not hardcode Railway, localhost, Vercel, or production domains in source code outside local-only env/config files or documentation.
- Do not add admin UI buttons that switch the data target per request unless the user explicitly asks later.

Recommended script shape:

```json
{
  "client scripts": {
    "dev:local": "vite --mode admin-local"
  },
  "server scripts": {
    "dev:local": "node ... using local DB env",
    "dev:railway": "node ... using Railway DB env"
  }
}
```

Recommended local-only client variables:

```env
VITE_API_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000
VITE_ADMIN_DATA_TARGET=LOCAL
```

Recommended local-only server variables for Railway-data mode:

```env
DATABASE_URL=<Railway database URL>
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=<same admin email as Railway or local admin>
ADMIN_PASSWORD_HASH=<same admin password hash as Railway or local admin>
STRIPE_SECRET_KEY=<Stripe secret if payment/admin flows need it>
ADMIN_SESSION_SECRET=<optional but recommended>
```

No real values should be committed or documented.

Admin UI requirement:
- Show a clear, visible admin data target badge somewhere in the admin layout/dashboard.
- The badge should display whether the current admin session is targeting `LOCAL` or `RAILWAY`.
- If the local backend is connected to Railway DB, show a stronger warning style/copy such as `RAILWAY DB TARGET`, `Editing Railway data`, or `LOCAL SERVER → RAILWAY DB`.
- Preserve the existing admin UX and do not redesign the admin pages.

Server/database requirement:
- Railway-data local admin mode should not require browser calls to the Railway backend.
- The local backend should load a local-only Railway database env file and connect directly to Railway Postgres.
- The local backend should allow `http://localhost:5173` as the frontend origin for admin cookies.
- Do not expose Railway `DATABASE_URL`, Stripe secrets, admin hashes, or session secrets in docs, logs, committed files, or examples with real values.

Verification required:
- Run client build.
- Run server build or syntax checks if server/CORS code changes.
- Verify client `npm run dev:local` points to the local backend.
- Verify server local mode points to the local database.
- Verify server Railway-data mode points to Railway database.
- Verify the admin data target badge reflects whether the local backend targets local DB or Railway DB.
- Verify local DB mode does not accidentally target Railway DB.
- Verify Railway DB mode does not accidentally target local DB.
- Verify admin auth works through local client → local backend in both database modes.
- Update `PROJECT_HANDOFF.md` with exact commands, expected flows, required env variable names, and manual QA steps.

Manual QA checklist:
- Start local server in local DB mode and start local client.
- Confirm admin badge says local target.
- Create or edit a test product locally and confirm it affects local DB only.
- Start local server in Railway DB mode and start local client.
- Confirm admin badge says Railway DB target.
- Create or edit a test product/promo/campaign and confirm it appears in Railway/Vercel data.
- Confirm checkout/storefront still uses the deployed Railway data on Vercel.
- Confirm no browser request from the local admin frontend is required to hit the Railway backend directly for admin CRUD.

This is a temporary workflow until the project uses a proper same-site custom domain setup, such as frontend on the owned domain and backend on an API subdomain, or until Better Auth is introduced during the Accounts + Loyalty phase. The temporary Railway-data workflow should be local client → local server → Railway DB, not local client → Railway backend.


## Railway DB Admin QA / Promo Repair Requirement

When the user is testing Railway DB admin mode with `local client → local server → Railway DB` and reports Prisma/API failures, the agent must treat the task as a focused Railway-data QA repair pass.

Current known good state:
- Local client can call the local server.
- Local server can connect to Railway DB when `server/.env.railway.local` is correctly configured with a public Railway database URL.
- Railway orders can be read through the local admin workflow.
- Railway products can be populated/read through the local client and local server.

Known failure patterns to audit:
- Promo admin endpoints may fail against Railway DB.
- Prisma may throw `Unknown argument redeemedAt` when code orders `Promo` records by a field that does not exist on the `Promo` model.
- Promo create/update may fail when datetime-local strings such as `2026-06-05T11:00` are sent directly to Prisma instead of normalized ISO-8601 DateTime values.
- Promo form mappers, validators, API payloads, repositories, and Prisma schema may disagree on date fields, sorting fields, or model ownership.
- Railway DB mode may expose schema/data mismatches that local mock/local DB paths did not reveal.

Primary goal:
- Make admin promos work correctly in Railway DB admin mode without broad refactoring.
- Preserve the existing admin promo UX unless a small input/validation change is required to fix a verified bug.
- Keep the local client → local server → Railway DB workflow intact.

The agent must audit these promo areas before editing:
1. `server/prisma/schema.prisma` Promo and PromoUsage models.
2. Server promo routes/controllers/services/repositories.
3. Client admin promo API files.
4. Client admin promo view/composables/components.
5. Promo form mapper and validator files.
6. Any promo analytics or usage sorting logic.
7. Date/time serialization from client form fields to server payloads.
8. Date/time normalization before Prisma create/update calls.
9. Sort fields used in Prisma `orderBy` calls.
10. Railway DB admin mode behavior using the local server.

Rules:
- Do not start a broad admin refactor.
- Do not redesign the promo UI.
- Do not change unrelated checkout, product, campaign, or order code unless a verified shared utility bug requires it.
- Do not edit database schema unless the code/schema mismatch truly requires a migration; prefer fixing code that references nonexistent fields.
- Do not invent fields such as `redeemedAt` on `Promo` if the intended field is `createdAt`, `updatedAt`, `startsAt`, `endsAt`, or a related `PromoUsage` field.
- Do not commit or push unless explicitly asked.
- Do not expose real Railway database URLs or secret values in logs, docs, or final reports.

Expected fixes to consider if verified:
- Replace invalid `orderBy: { redeemedAt: ... }` on `Promo` with a real Promo field or sort through related PromoUsage data where appropriate.
- Normalize datetime-local form values into valid JavaScript Date/ISO-8601 values before Prisma create/update.
- Ensure nullable date fields are sent as `null`, not empty strings.
- Ensure promo create/edit payloads match server validators and Prisma schema.
- Improve server validation errors so admin sees useful promo errors instead of raw Prisma errors.
- Add targeted helpers for promo date parsing/normalization if that matches existing architecture.

Required verification:
- Run client build.
- Run server build or targeted server syntax/import checks for changed promo files.
- Run Prisma generate if schema or Prisma client usage requires it.
- In Railway DB admin mode, verify promo list/read does not throw Prisma errors.
- In Railway DB admin mode, verify creating a promo with start/end datetime-local values succeeds or fails with a clear validation error.
- Verify editing an existing promo succeeds.
- Verify fixed/percent promo validation still works for checkout preview if touched.
- Verify products and orders still read from Railway DB after the promo fix.
- Update `PROJECT_HANDOFF.md` with root cause, fixes, commands run, manual QA, and remaining promo risks.

Manual QA checklist:
- Start `cd server && npm run dev:railway`.
- Start `cd client && npm run dev:local`.
- Confirm admin badge indicates Railway DB target.
- Open admin promos page.
- Create a fixed promo with minimum subtotal and start/end dates.
- Create or test a percent promo if supported.
- Edit an existing promo.
- Validate a promo through checkout preview if applicable.
- Confirm no Prisma `redeemedAt` or invalid DateTime errors appear in the server logs.


## Storefront Product Card Variant / Add-to-Cart Source-of-Truth Requirement

When the user reports that a storefront product card adds the wrong variant/size to cart, the agent must treat it as a cart source-of-truth bug, not a cosmetic UI issue.

Known symptom pattern:
- On the storefront product card, selecting `6 oz` and clicking `Add to Cart` adds the `18 oz` variant instead.
- In the quick-view modal for the same product, selecting `6 oz` and clicking add to cart adds the correct `6 oz` variant.
- This suggests the product card add-to-cart path and quick-view add-to-cart path may use different state, default variant logic, mapper logic, or payload construction.

Primary goal:
- Make product card add-to-cart and quick-view add-to-cart use the same variant selection source of truth.
- Preserve existing storefront UX and visual design.
- Fix the actual variant payload/selection mismatch, not only the displayed label.

The agent must audit before editing:
1. Product card component(s) that render size/variant buttons and the direct `Add to Cart` button.
2. Quick-view component(s) that render size/variant buttons and add to cart.
3. Cart store/composable/service where add-to-cart payloads are accepted.
4. Product/variant mappers used by storefront components.
5. Any helpers that choose default variants, selected variants, or selling mode labels.
6. Product API response shape for variants from local DB and Railway DB.
7. Whether variant ids, variant sizes, selected size labels, inventory ids, prices, and cart item ids stay consistent.

Rules:
- Do not start a broad storefront refactor.
- Do not redesign product cards or quick-view UI.
- Do not change product schema unless a verified schema mismatch requires it.
- Do not hardcode variant order such as always first or always 18 oz.
- Do not rely on display text alone if variant ids exist.
- Prefer using variant id as the cart source of truth, with label/size/price derived from the selected variant.
- Ensure direct product-card add-to-cart and quick-view add-to-cart build the cart payload through the same helper or equivalent verified logic.
- Preserve existing cart drawer behavior and checkout behavior.

Expected fixes to consider if verified:
- Store selected variant per product card instead of using a product-level default during direct add-to-cart.
- Pass the selected variant object/id into the add-to-cart handler.
- Use a shared cart payload builder for product card and quick view.
- Ensure variant selection updates price, inventory status, selling mode, and cart payload consistently.
- Ensure variant ids and sizes from Railway DB are respected even if variant ordering differs from local/mock data.

Required verification:
- Run client build.
- Run server build or syntax checks only if server/product mapping files change.
- In local mode or Railway DB mode, verify selecting `6 oz` on the product card adds `6 oz` to cart.
- Verify selecting `18 oz` on the product card adds `18 oz` to cart.
- Verify quick-view still adds the selected variant correctly.
- Verify price in cart matches the selected variant.
- Verify checkout preview receives the selected variant/price correctly.
- Verify both Beef Jerky and Chicken Breast Jerky variant flows if available.
- Update `PROJECT_HANDOFF.md` with root cause, files changed, verification, and remaining cart risks.

Manual QA checklist:
- Open storefront product grid.
- Select `6 oz` on a product card and click `Add to Cart`.
- Confirm cart drawer shows `6 oz`, not `18 oz`.
- Remove item.
- Select `18 oz` on product card and click `Add to Cart`.
- Confirm cart drawer shows `18 oz`.
- Repeat the same two checks from quick view.
- Confirm checkout preview uses the selected variant total.


## Storefront Featured Product Click Target Requirement

When the user reports that the featured product image or title is clickable when it should not be, the agent must treat it as a focused storefront interaction bug.

Known symptom pattern:
- The featured product section still has a clickable image.
- The featured product section still has a clickable title.
- The user wants to preserve the existing featured product layout and add-to-cart behavior, but remove unintended click/navigation behavior from the image and title.

Primary goal:
- Remove unintended clickable behavior from featured product image and title.
- Preserve the existing visual design, selected variant behavior, price display, and add-to-cart behavior.
- Keep valid interactive controls such as size buttons and Add to Cart working.

The agent must audit before editing:
1. Featured product component(s).
2. Storefront product card component(s), only to compare intended behavior if needed.
3. Quick-view/modal trigger logic if featured product reuses product-card patterns.
4. Router links, click handlers, and accessibility attributes attached to the featured image/title.
5. Any shared product tile/card component used by the featured section.

Rules:
- Do not redesign the featured product section.
- Do not remove size selection or Add to Cart behavior.
- Do not break product card or quick-view behavior while fixing featured product click targets.
- If the featured section uses a shared component, make the smallest safe change so normal product cards are not unintentionally affected.
- Preserve keyboard accessibility for controls that should remain interactive.

Required verification:
- Run client build.
- Verify featured product image is no longer clickable.
- Verify featured product title is no longer clickable.
- Verify featured product size buttons still work.
- Verify featured product Add to Cart still adds the selected variant.
- Verify normal product cards and quick view still behave as intended.
- Update `PROJECT_HANDOFF.md` if the featured product behavior or file ownership changes.


## Full Architecture Documentation / Data Flow Maps Requirement

When the user asks for a detailed architecture overview, visual data-flow map, file behavior map, or documentation that explains how the whole application works, the agent must create or update documentation under `docs/` and keep `PROJECT_HANDOFF.md` aligned.

Primary goal:
- Produce a detailed architecture reference that explains how data flows through the project from client UI to API to service/repository to Prisma/database and back.
- Account for important files and folders, not just high-level concepts.
- Include current architecture and planned future architecture such as Better Auth/customer accounts where relevant.
- Make the docs useful for ChatGPT, Codex, and a human developer continuing the project later.

Preferred docs location:
- `docs/architecture/`

Recommended files to create or update:
- `docs/architecture/README.md` — high-level system overview and how to read the docs.
- `docs/architecture/data-flow.md` — detailed request/data flow examples for storefront, checkout, admin, promos, campaigns, orders, Stripe, and Prisma.
- `docs/architecture/file-map.md` — important file/folder inventory with purpose and responsibilities.
- `docs/architecture/database.md` — Prisma models, relationships, ownership, migration notes, and data source rules.
- `docs/architecture/admin.md` — admin dashboard, products, promos, campaigns, orders, auth, and local/Railway DB admin modes.
- `docs/architecture/auth-roadmap.md` — current custom admin auth, temporary local admin workflow, same-site domain plan, and future Better Auth/customer accounts/loyalty flow.

Documentation must include:
1. Client architecture: app/router/layouts/providers, storefront, checkout, admin, shared utilities, API wrapper.
2. Server architecture: app/server boot path, route → controller → service → repository → Prisma pattern, domains, env loading, local/Railway DB modes.
3. Database architecture: Prisma model inventory, relationships, ownership, migrations, local/Railway DB differences.
4. End-to-end flow maps: product load, product card add to cart, quick view, featured product, cart, checkout preview, promo validation, campaign usage, Stripe PaymentIntent, order creation, inventory, admin CRUD, Railway DB admin mode, future Better Auth/customer accounts.
5. Visual diagrams: use Mermaid diagrams for overall system, checkout/payment sequence, admin Railway DB mode, and future Better Auth/customer account flow.
6. File accounting: document important files in `client/src`, `server/src`, `server/prisma`, and relevant root config/docs files with purpose, responsibilities, dependencies, and flows.
7. Source-of-truth notes: variants, cart payloads, checkout totals, promos, campaigns, orders, admin auth/session, env variables.

Rules:
- Do not use generated docs as an excuse for broad refactoring.
- Do not expose secret values from `.env`, Railway, Vercel, Stripe, or database URLs.
- Do not invent architecture that is not supported by code; mark future plans clearly as future/planned.
- Do not claim a flow is verified unless it was verified from code or commands.
- Keep diagrams text-based and committed as Markdown/Mermaid, not image files, unless the user explicitly asks for rendered images.
- Preserve existing docs unless they are outdated; update or mark superseded sections clearly.

Required verification:
- Run client build if code changed.
- Run server build/syntax checks if server code changed.
- If docs only changed, no build is required unless the prompt also includes code fixes.
- Verify Mermaid code fences are reasonable Markdown.
- Update `PROJECT_HANDOFF.md` with links/summaries of the new architecture docs and note any docs that still need deeper coverage.

Final report must include:
- Docs created or updated.
- Code files changed, if any.
- Commands run and results.
- Main architecture findings.
- Any uncertainty or areas not fully documented.


## Orders / Donation Traceability / Post-Checkout UX Requirement

When the user reports issues around admin orders, donation totals, campaign attribution, or the post-checkout order success page, the agent must treat it as a focused orders and traceability repair/design pass, not a broad refactor.

Known symptom patterns:
- Admin orders list may show donation totals as `$0.00` even when checkout/order summary generated a donation.
- Admin order detail looks too basic and does not show the complete order breakdown.
- Admin order detail should expose more actionable information: items, variants, quantities, subtotal, discount, promo, shipping, tax, donation, total, payment/Stripe status, customer details, fulfillment/order status, and timestamps.
- Admin order detail should help find other orders from the same customer email without excessive clicks.
- Admin campaigns should eventually show which orders contributed to each campaign, not only aggregate campaign totals.
- Post-checkout success page uses a large raw order id/reference that is not customer-friendly.
- Post-checkout `View Cart` may be broken or inappropriate after checkout because the cart should usually be cleared.
- Customer order success page should be closer to ecommerce industry standards and ready to align with future confirmation emails.

Primary goals:
- Make admin order data trustworthy and complete.
- Ensure donation totals shown in admin reflect the actual order/campaign donation generated at checkout.
- Improve admin order detail usefulness without redesigning the whole admin system.
- Decide whether campaign/order attribution requires a new join/usage table, but audit schema first before adding migrations.
- Improve the customer-facing post-checkout success page so it shows clean, useful order information without exposing awkward raw internal ids.
- Preserve existing checkout and admin UX unless a focused UI change is required to fix the verified issue.

The agent must audit before editing:
1. Prisma `Order`, `OrderItem`, `Campaign`, and any campaign/order/promo usage models.
2. Order creation service/repository.
3. Checkout service and order payload creation.
4. Campaign usage/donation recording logic.
5. Admin orders list API, mapper, service, repository, and UI.
6. Admin order detail API, mapper, service, repository, and UI.
7. Customer order success route/view and any order lookup API.
8. Cart clearing behavior after successful checkout.
9. Existing order number/reference generation.
10. Whether Stripe payment id/status is stored and exposed safely for admin only.
11. Whether similar-customer lookup can use existing order fields such as customer email without adding schema.
12. Whether campaign-to-order attribution already exists or requires a new table.

Rules:
- Do not start a broad admin redesign.
- Do not rebuild checkout.
- Do not change Stripe payment logic unless a verified data mapping bug requires it.
- Do not add a new Prisma model/table until code and schema prove that order-to-campaign attribution cannot be represented with existing data.
- If a new campaign/order attribution model is required, propose and implement a safe Prisma migration only after documenting why existing schema is insufficient.
- Do not expose full internal database ids to customers if a shorter customer reference can be derived or stored safely.
- Do not expose Stripe secret data or sensitive payment details to customers.
- Admin may see payment intent id/status if useful, but customer-facing pages should show friendly payment/order status only.
- Preserve server-owned checkout totals; do not trust client totals.
- Update docs/architecture if schema/flow changes materially.
- Update `PROJECT_HANDOFF.md` after the pass.

Admin order detail should consider showing:
- Short customer-friendly order reference.
- Full internal order id for admin only if needed.
- Customer name, email, phone, shipping address if stored.
- Item list with product, variant size, quantity, unit price, line total, and fulfillment-relevant labels.
- Pricing breakdown: subtotal, promo/discount, shipping, tax, donation generated, total.
- Promo code and discount details if applied.
- Campaign/donation attribution: campaign name, donation amount, eligible subtotal/products, and whether it was recorded.
- Payment summary: payment status, Stripe PaymentIntent id for admin only, created/paid timestamps if available.
- Fulfillment/order status and timeline controls.
- Other orders from the same customer email, ideally with links or compact summary.

Admin campaign detail/list should consider:
- Campaign totals by revenue, donation generated, orders count, and products included.
- A way to see orders associated with the campaign.
- If no order-level campaign attribution table exists, document the limitation clearly.
- If adding attribution, prefer a table such as `OrderCampaignUsage` or equivalent with `orderId`, `campaignId`, `donationAmount`, `eligibleSubtotal`, and timestamps, plus idempotency/unique constraints where appropriate.

Post-checkout success page should consider showing:
- Clear `Order confirmed` message.
- Short customer-friendly order reference, not a giant raw internal id.
- Confirmation email status/copy.
- Item summary with selected variants and quantities.
- Pricing breakdown: subtotal, discount, shipping, tax, donation, total.
- Shipping/fulfillment expectation.
- Support/contact guidance.
- Continue shopping link.
- Remove or fix `View Cart` after checkout; if cart is cleared, do not send the customer to an empty or stale cart without clear purpose.
- Data structure should align with future order confirmation email content.

Expected fixes to consider if verified:
- Ensure donation totals from checkout are persisted on the order or can be derived reliably.
- Add or repair order response mappers to include donation, promo, tax, shipping, discount, and payment fields.
- Add similar-customer order lookup by email in the admin order detail response or a focused endpoint.
- Improve order detail UI sections without redesigning the whole admin dashboard.
- Add short order reference formatting helper if raw ids are currently exposed to customers.
- Fix post-checkout `View Cart` behavior if the cart is cleared after order success.
- Add campaign/order attribution persistence only if the current schema cannot answer which orders generated campaign donations.

Required verification:
- Run client build.
- Run server build or syntax/import checks for changed server files.
- Run Prisma generate if schema changes.
- If a Prisma migration is added, run local migration checks and document Railway deployment steps; never use destructive commands on Railway.
- Verify admin orders list donation totals match order data.
- Verify admin order detail shows complete pricing breakdown.
- Verify admin order detail shows donation/campaign data when present.
- Verify admin order detail can show or link other orders from the same customer email if implemented.
- Verify campaign admin can show associated order data or clearly document the remaining schema limitation.
- Verify post-checkout success page uses a short/friendly order reference.
- Verify post-checkout page no longer has broken `View Cart` behavior.
- Verify checkout/order creation still succeeds.
- Verify existing products, promos, campaigns, and orders still load in Railway DB admin mode if touched.
- Update `PROJECT_HANDOFF.md` and relevant docs/architecture files if data flow or schema changes.

Manual QA checklist:
- Place a checkout order with campaign donation eligible items.
- Apply a promo if available.
- Confirm order success page shows friendly reference and correct totals.
- Confirm View Cart behavior is fixed or removed.
- Open admin orders list and verify donation total/revenue/order count.
- Open the new order detail and verify subtotal, discount, shipping, tax, donation, total, item variant, and customer details.
- Verify payment/order status is understandable.
- Verify other orders from the same customer email if implemented.
- Open admin campaigns and verify donation/order attribution or documented limitation.


## Promo Email Validation / Order Status Timeline / File Organization Requirement


## Documentation Rendering / Mermaid Verification Requirement

When creating, modifying, or documenting architecture under:

- docs/
- docs/architecture/

The agent must verify that documentation actually renders correctly.

Known failure pattern:
- VS Code Markdown Preview shows:
  "No diagram type detected matching given configuration"
- Mermaid diagrams fail to render.
- Architecture docs appear completed but visual diagrams are unusable.

Before declaring architecture documentation complete, the agent must:

1. Audit every Mermaid diagram.
2. Verify opening and closing Mermaid fences.
3. Verify every diagram starts with:

```mermaid
```

4. Verify diagrams do not contain invalid Markdown inside Mermaid blocks.
5. Verify Mermaid syntax is valid.
6. Verify Mermaid Preview renders successfully.
7. Verify diagrams are compatible with standard Mermaid implementations.
8. Fix any broken diagrams discovered during the audit.

Required audit files:

- docs/architecture/README.md
- docs/architecture/data-flow.md
- docs/architecture/file-map.md
- docs/architecture/database.md
- docs/architecture/admin.md
- docs/architecture/auth-roadmap.md
- Any architecture document created by previous Codex runs

Required final report:

- Diagrams audited
- Rendering failures found
- Root cause
- Files fixed
- Verification performed

Do not mark architecture documentation complete if Mermaid rendering remains broken.


## Existing File Organization Verification Requirement

When working inside a domain that was previously refactored by Codex, the agent must audit files already created by earlier phases.

The goal is not a broad rewrite.

The goal is to verify:

- No oversized god files were introduced.
- No duplicated logic exists.
- Views remain thin.
- Components remain focused.
- APIs remain separated from UI.
- Composables remain separated from components.
- Mappers remain separated from validators.
- Shared utilities remain in shared folders.
- Route → Controller → Service → Repository → Prisma architecture is preserved.

When touching a domain, the agent must review files previously created in that same domain and make small corrective extractions if necessary.

Do not create micro-components for trivial logic.

Favor maintainability, discoverability, and future debugging.


## Promo + Campaign Pricing Verification Requirement

Known risk:

Promo codes and campaign donations may both be active on the same order.

The agent must verify:

- Promo validation uses normalized email.
- Promo usage limits are enforced server-side.
- Promo application cannot occur before email entry.
- Promo state is cleared or revalidated when email changes.
- Promo discount calculation is correct.
- Campaign donation calculation remains correct.
- Promo discounts and campaign donations can coexist.
- Order totals remain server-owned.

Required QA:

- Checkout with promo only
- Checkout with campaign only
- Checkout with promo + campaign together
- Verify subtotal
- Verify discount
- Verify donation
- Verify tax
- Verify shipping
- Verify final total


## Order Status History Requirement

The next order-management phase must implement a future-proof status history system.

Requirements:

- Status changes should not save immediately from a dropdown.
- Status updates should use a staged workflow.
- Admin selects a new status.
- Admin explicitly clicks Save.
- Admin can cancel before saving.
- Show last status update timestamp.
- Show last status change summary.
- Prepare attribution for future Better Auth users.

Preferred future schema:

- OrderStatusHistory
  - id
  - orderId
  - fromStatus
  - toStatus
  - note
  - changedByType
  - changedBy
  - createdAt

Until Better Auth exists:

- changedByType may use SYSTEM or ADMIN_ENV.
- Do not pretend real user attribution exists.

UI goals:

- Cleaner fulfillment timeline UX.
- Explicit Save action.
- Visible history.
- Better operational visibility for fulfillment management.

When the user reports checkout promo validation problems, promo usage limit bypasses, or admin order status/timeline UX issues, the agent must treat the work as a focused checkout/admin-orders repair pass with proportional file organization.

Known symptom patterns:
- Promo code can appear to apply before the customer enters an email.
- Promo usage limits such as `1 per email` can be bypassed because there is no email available to check against.
- Promo validation may register a promo code but fail to apply the discount when the order also has campaign donation logic.
- If a customer changes the checkout email after a promo is applied, promo eligibility may no longer be valid.
- Admin order status currently uses a basic dropdown and may update too immediately without a deliberate save action.
- Admin needs a record of who changed order status, when it changed, and what it changed from/to.
- Future Better Auth should be able to connect order status changes to real admin users later.

Primary goals:
- Require a customer email before validating/applying a promo code.
- Normalize customer email before promo validation and usage checks using lowercase + trim.
- Ensure promo usage limits are enforced server-side using the normalized email.
- Ensure promo discounts and campaign donations can coexist correctly when both apply.
- Recalculate or clear promo state when the customer email changes and the existing promo may no longer be valid.
- Replace immediate/basic admin status dropdown behavior with a clearer staged status update workflow and explicit Save action.
- Add or prepare order status history/audit trail with future Better Auth compatibility.
- Keep files organized according to existing Vue/domain architecture, avoiding new large god files.

The agent must audit before editing:
1. Checkout promo input UI and apply button behavior.
2. Checkout customer email state and validation timing.
3. Client checkout API payloads for promo validation and checkout preview.
4. Server promo validation route/controller/service/repository.
5. Promo usage storage and lookup logic.
6. Checkout pricing/preview logic where promo discounts and campaign donations are calculated together.
7. Order creation logic that records promo usage and campaign attribution.
8. Admin order detail view and components.
9. Admin order status update API/client/server path.
10. Prisma `Order`, `OrderItem`, `Promo`, `PromoUsage`, and any order status/history models.
11. Existing docs/architecture and PROJECT_HANDOFF sections that describe checkout, promos, and orders.

Promo rules:
- Do not allow promo validation without an email when the promo has per-email or usage tracking behavior.
- If email is missing, show a clear customer message such as `Enter your email first so we can check this promo.`
- Normalize email with trim + lowercase on both client payload construction and server validation.
- Server remains the source of truth; client checks are UX only.
- If email changes after promo application, require revalidation or clear the applied promo with a clear message.
- Do not rely only on client email checks for promo usage limits.
- Confirm promo discount does not block campaign donation unless business rules intentionally say so.
- Confirm campaign donation is calculated from eligible product subtotal according to current campaign rules, even when a promo is applied, unless code/business rules say otherwise.

Order status timeline rules:
- Do not use an instant-save dropdown as the only admin status control if the user requested an explicit save workflow.
- Prefer a staged status editor with selected next status, optional note, and Save/Cancel behavior.
- Show current status clearly.
- Show last known status update information when available.
- Add a status history/audit trail if schema/code proves it is needed.
- If adding schema, prefer a narrow model such as `OrderStatusHistory` or equivalent with:
  - `id`
  - `orderId`
  - `fromStatus`
  - `toStatus`
  - `note`
  - `changedByType`
  - `changedBy`
  - `createdAt`
- For now, `changedByType` may be `SYSTEM`, `ADMIN_ENV`, or another clearly documented placeholder until Better Auth exists.
- Do not claim real admin-user attribution until Better Auth/admin user accounts exist.
- Preserve existing order status values and fulfillment timeline behavior unless a verified bug requires a change.

File organization rules:
- Follow existing project architecture and domain boundaries.
- Do not dump new UI/logic into one large view file.
- Do not perform a broad repo-wide refactor.
- Only reorganize files directly touched by this phase if they are becoming oversized or mixed-responsibility.
- Keep changes proportional: avoid micro-components for trivial code, but avoid god files.
- If a touched Vue view is becoming hard to navigate or combines multiple responsibilities, extract logical pieces into the proper domain component/composable/API files.
- Suggested client placement:
  - Admin order status UI: `client/src/domains/admin/components/`
  - Admin order status composables/helpers if needed: `client/src/domains/admin/composables/` or existing admin utilities pattern.
  - Checkout promo UI/helpers: `client/src/domains/checkout/` under the existing checkout component/composable/API pattern.
  - Shared reusable helpers: `client/src/shared/` only when reused across domains.
  - Admin/order API client updates: `client/src/domains/admin/api/`.
  - Checkout API client updates: `client/src/domains/checkout/api/`.
- Suggested server placement:
  - Order status history routes/services/repositories: `server/src/domains/orders/` using route → controller → service → repository → Prisma pattern.
  - Promo validation logic: `server/src/domains/promos/`.
  - Checkout orchestration: `server/src/domains/checkout/`.
  - Prisma schema/migrations: `server/prisma/`.
- Update `docs/architecture/file-map.md` and `PROJECT_HANDOFF.md` whenever new files are introduced or responsibilities move.

Expected fixes to consider if verified:
- Require email before promo validation in checkout UI.
- Send normalized email to promo validation and checkout preview endpoints.
- Server-side promo validation should reject missing email for email-limited promo rules.
- Revalidate or clear applied promo when email changes.
- Repair promo + campaign combined calculations if discounts or donations are missing after promo application.
- Add order status history persistence if current schema cannot track status changes.
- Replace order detail dropdown-only status control with a cleaner staged status component and Save button.
- Add last status update display on admin order detail.
- Add optional status-change note if it fits the existing UX without overbuilding.

Required verification:
- Run client build.
- Run server build or syntax/import checks for changed server files.
- Run Prisma generate if schema changes.
- If a Prisma migration is added, run local migration checks and document Railway `prisma migrate deploy` steps; never use destructive commands on Railway.
- Verify promo cannot be applied before email is entered.
- Verify promo can apply after email is entered.
- Verify email is normalized for promo usage checks.
- Verify changing email after applying promo forces revalidation or clears the promo.
- Verify promo discount and campaign donation both display correctly when applicable.
- Verify checkout/order creation still succeeds.
- Verify admin order status does not persist until Save is clicked.
- Verify order status history/last update displays correctly if implemented.
- Verify products, promos, campaigns, and orders still load in Railway DB admin mode if touched.
- Verify no `.env.example` files are created.
- Verify no secrets are documented.
- Update `PROJECT_HANDOFF.md` and relevant docs/architecture files.

Manual QA checklist:
- Try applying promo before entering email and confirm the app asks for email first.
- Enter email and apply promo successfully.
- Change email after promo is applied and confirm promo is cleared or requires revalidation.
- Complete checkout with promo + campaign donation eligible items.
- Confirm order success totals include correct discount, shipping, tax, donation, and total.
- Confirm admin order detail shows promo, campaign donation, and correct totals.
- Change order status in admin and confirm it does not save until Save is clicked.
- Save a status change and confirm last updated/status history is visible.
- Confirm status history uses placeholder attribution only until Better Auth exists.


## Promo Discount Calculation / Automated Test Infrastructure Requirement

When the user reports that a promo code validates but produces a `$0.00` discount, the agent must treat it as a pricing correctness bug and a test coverage gap.

Known symptom pattern:
- Checkout accepts or registers promo code `CHASE20`.
- Checkout UI says the promo was applied successfully.
- Checkout order summary still shows no discount or `-$0.00`.
- Admin promo analytics shows redemptions but `Discount Given` is `$0.00`.
- Admin promo test/preview says the promo is valid but returns `$0.00` discount.
- Promo may be tested alongside active campaign donation logic, so promo and campaign calculations must be checked together.

Primary goals:
- Find the exact root cause of valid promos returning zero discount.
- Fix promo discount calculation across admin promo test, checkout preview, final order creation, promo usage analytics, and order detail.
- Ensure promo discount and campaign donation can coexist correctly.
- Add automated test infrastructure so pricing, promo, campaign, order, and admin flows can be tested with one command.

The agent must audit before editing:
1. `server/prisma/schema.prisma` Promo and PromoUsage fields.
2. Promo seed/admin-created data shape for `CHASE20` or equivalent percent/fixed promos.
3. Server promo validation route/controller/service/repository.
4. Promo calculation helpers/rules.
5. Checkout preview/pricing service.
6. Checkout final order creation and promo usage recording.
7. Campaign preview/donation calculation.
8. Order creation/order detail pricing fields.
9. Admin promo analytics mapper/service/UI.
10. Client checkout promo composable/API code.
11. Any money formatting/cents-to-dollars utilities.
12. Any mismatches between percent values stored as `20`, `0.2`, or cents.
13. Any mismatches between subtotal units stored as dollars vs cents.

Promo discount rules:
- If a percent promo is configured as `20`, it should apply as 20%, not zero and not 2000%.
- If a percent promo is configured as `0.2`, the code must either support it deliberately or normalize/reject it clearly.
- Fixed-amount promos must use consistent units across client/server/database.
- Minimum subtotal checks must use the same units as subtotal calculation.
- Promo validation, checkout preview, final checkout, order detail, and analytics must all agree on discount amount.
- Promo usage analytics must record and display the actual discount given, not just the fact that a promo was used.
- If the promo is valid but discount is zero due to configuration, the admin UI should make that obvious.
- Do not hide a zero discount behind a success message unless the business rule truly allows zero-discount promos.

Promo + campaign rules:
- Promo discount and campaign donation should both be tested together.
- Campaign donation should not erase promo discount.
- Promo discount should not erase campaign donation.
- Tax/shipping/total should remain server-owned and consistently calculated.
- If business rules define whether donation is based on pre-discount or post-discount eligible subtotal, document and enforce the rule consistently.

Automated testing requirement:
- Add a test setup only if the project does not already have one.
- Prefer standard maintainable tools:
  - Client/Vue: Vitest + Vue Test Utils if Vue component/composable testing is needed.
  - Server: Vitest or Node test runner for service/repository/unit tests.
  - End-to-end/browser tests may be documented for later unless the user explicitly asks to add Playwright now.
- Add one root-level or documented single command to run the important tests when possible.
- If root package scripts do not exist, either add a root script safely or document exact commands in `PROJECT_HANDOFF.md`.
- Tests should produce useful failure output in the terminal.
- Do not create a fake test suite that only checks trivial imports.
- Focus first automated tests on money/pricing logic and promo/campaign interactions.

Recommended tests to add if feasible:
1. Promo validation requires email when promo usage is email-limited.
2. Email is normalized before promo usage lookup.
3. Percent promo `CHASE20` gives expected discount for a known subtotal.
4. Fixed promo gives expected discount for a known subtotal.
5. Promo with minimum subtotal rejects below threshold and accepts above threshold.
6. Promo + campaign together returns correct subtotal, discount, donation, tax, shipping, and total.
7. Promo usage records actual discount amount.
8. Changing email after promo application clears or requires revalidation on the client composable if the composable is easy to unit test.
9. Order status history service records status changes only after explicit save if server-side logic is easy to test.

File organization rules:
- Test files should live near the domain they test or under a clear test folder following project conventions.
- Do not dump all tests into one huge file.
- Suggested server test locations:
  - `server/src/domains/promos/__tests__/`
  - `server/src/domains/checkout/__tests__/`
  - `server/src/domains/campaigns/__tests__/`
  - `server/src/domains/orders/__tests__/`
- Suggested client test locations:
  - `client/src/domains/checkout/__tests__/`
  - `client/src/domains/admin/__tests__/`
  - or colocated `*.spec.js` files if that matches the chosen test setup.
- If shared test fixtures are added, place them in a clear test helper folder and avoid real secrets or real Railway/Vercel URLs.

Rules:
- Do not start a broad rewrite of checkout or promos.
- Do not change database schema unless a verified schema mismatch requires it.
- Do not use real Stripe calls in unit tests.
- Do not use real Railway DB in automated tests.
- Do not commit secrets, real database URLs, or real Stripe keys.
- Do not mark the issue fixed only because the UI message says promo applied; verify numeric discount values.
- Preserve existing checkout UX except for necessary validation/error messaging.
- Keep code and tests organized by domain.

Required verification:
- Run client build.
- Run server build or syntax/import checks for changed server files.
- Run Prisma generate if schema/prisma client usage changes.
- Run the new test command(s) and confirm they pass.
- Verify admin promo test for `CHASE20` returns a non-zero discount when configured as a non-zero discount promo.
- Verify checkout with `CHASE20` shows the correct discount in preview/order summary.
- Verify final order records the promo discount correctly.
- Verify admin promo analytics shows actual `Discount Given` above `$0.00` for the new discounted test order.
- Verify promo + campaign donation totals both appear correctly when used together.
- Verify no `.env.example` files are created.
- Verify no secrets are documented.
- Update `PROJECT_HANDOFF.md` and relevant docs/architecture files with the test setup, commands, pricing source of truth, and remaining coverage gaps.

Manual QA checklist:
- Create or confirm a non-zero discount promo such as `CHASE20`.
- Test the promo in admin preview with a known subtotal and customer email.
- Confirm discount is non-zero and mathematically correct.
- Apply the promo during checkout after entering email.
- Confirm checkout summary shows discount before payment.
- Complete an order with promo only.
- Complete an order with promo + campaign eligible item.
- Confirm order success page, admin order detail, and promo analytics all show the same discount amount.
- Confirm campaign donation still appears correctly.
- Run the one-command automated test suite and confirm it reports useful pass/fail output.

## Tiered Automated Testing Strategy Requirement

When the user asks for automated tests, test infrastructure, one-command testing, or broader QA coverage, the agent must prioritize tests by business risk instead of generating shallow tests for every file.

Primary goal:
- Build a practical, maintainable test system that catches high-risk business logic failures early.
- Allow the user and future agents to run the most important tests first, then progressively run broader tests.
- Make future debugging faster by producing clear pass/fail output and documenting what each tier covers.
- Use tests to quickly identify core logic failures such as promo calculation bugs, checkout total mismatches, campaign donation issues, duplicate order risks, selected-variant pricing bugs, and status-history regressions.

Testing philosophy:
- Do not create hundreds of low-value tests that only verify imports, snapshots, or trivial rendering.
- Prioritize logic that affects money, discounts, donations, orders, inventory, payment amounts, customer-facing totals, and admin operations.
- Tests should be organized by domain and tier so they are easy to run and understand.
- The first objective is to reproduce and isolate the current highest-risk bug before expanding coverage.

Recommended folder structure:

```text
client/
  tests/
    tier1/
      checkout/
      cart/
      promos/
    tier2/
      admin/
      campaigns/
      orders/
    tier3/
      ui/
      components/
server/
  tests/
    tier1/
      checkout/
      promos/
      campaigns/
      orders/
      payments/
    tier2/
      admin/
      products/
      campaigns/
      orders/
    tier3/
      utils/
      formatting/
```

The exact structure may differ if the repo already has a test convention, but the tier concept must remain clear.

Required root commands, if feasible:

```json
{
  "scripts": {
    "test": "npm run tiertest1 && npm run tiertest2 && npm run tiertest3",
    "tiertest1": "npm run tiertest1:server && npm run tiertest1:client",
    "tiertest2": "npm run tiertest2:server && npm run tiertest2:client",
    "tiertest3": "npm run tiertest3:server && npm run tiertest3:client",
    "tiertest1:server": "cd server && npm run tiertest1",
    "tiertest1:client": "cd client && npm run tiertest1",
    "tiertest2:server": "cd server && npm run tiertest2",
    "tiertest2:client": "cd client && npm run tiertest2",
    "tiertest3:server": "cd server && npm run tiertest3",
    "tiertest3:client": "cd client && npm run tiertest3"
  }
}
```

If a root `package.json` does not exist, the agent may create one only if it is safe for the repo and does not disrupt client/server package behavior. Otherwise, document exact commands in `PROJECT_HANDOFF.md`.

Tier 1 — Critical launch and money logic:
- Checkout pricing totals.
- Promo percent/fixed discount calculations.
- Promo email validation and usage limits.
- Promo + campaign donation combined totals.
- Campaign donation calculations.
- Stripe PaymentIntent amount is based on trusted server totals.
- Order creation and duplicate payment/order protection.
- Inventory decrement rules if testable without real payment calls.
- Product variant add-to-cart and cart pricing.
- Order status history server logic if already added.

Tier 2 — Important admin and data workflows:
- Admin product create/edit/status logic.
- Admin promo create/edit/test/analytics logic.
- Admin campaign create/edit/status/reporting logic.
- Admin order list/detail/status workflow.
- Order campaign attribution reporting.
- Similar-customer order lookup.
- Customer-safe order success lookup.

Tier 3 — Lower-risk UI and utilities:
- Non-critical components.
- Formatting helpers.
- Filters/search/sorting.
- Loading/error states.
- Modal/drawer behavior.
- Pure visual or convenience interactions.

Testing tool guidance:
- Prefer Vitest for server unit tests unless the project already uses another test runner.
- Prefer Vitest + Vue Test Utils for Vue composables/components if client tests are needed.
- Do not add Playwright/E2E unless explicitly requested or clearly justified; document it as a future option if not added.
- Avoid real Stripe calls, real Railway DB calls, real Vercel calls, and real secret-dependent tests.
- Use fixtures, mocks, pure helpers, and service-level tests for business logic.
- Tests must produce useful terminal output when failures occur.

Required first test targets when a promo discount bug exists:
1. `CHASE20` or equivalent percent promo returns a non-zero expected discount for a known subtotal.
2. Fixed promo returns expected discount for a known subtotal.
3. Promo minimum subtotal rules work.
4. Promo requires normalized email when usage is email-limited.
5. Promo usage records actual discount amount.
6. Promo + campaign donation totals coexist correctly.
7. Checkout total equals subtotal - discount + shipping + tax, with donation displayed separately according to current business rules.
8. Product variant add-to-cart uses selected variant price/size.
9. Order status history records saved status changes only when status actually changes.

Reporting requirement:
- Add clear test scripts and document them in `PROJECT_HANDOFF.md`.
- If possible, include coverage scripts such as `test:coverage`, but do not block the pass on coverage if setup becomes too large.
- Test failures should identify the domain and business rule that failed.
- Update `docs/architecture/file-map.md` or relevant architecture docs with the test folder/command structure.

Rules:
- Do not overbuild test infrastructure before fixing the verified bug.
- Reproduce or isolate the current bug with a focused test before or during the fix when feasible.
- Do not create fake tests that always pass without testing meaningful behavior.
- Do not make tests dependent on local `.env`, Railway, Vercel, real Stripe keys, or real database URLs.
- Keep tests organized by tier and domain.
- Keep code and tests aligned with the existing architecture.
- Update `PROJECT_HANDOFF.md` with which tiers exist, what each covers, commands to run, and what still lacks coverage.

Required verification:
- Run `npm run tiertest1` if created.
- Run full `npm run test` if feasible after Tier 1 passes.
- Run client build and server build after code changes.
- Run Prisma generate if schema/prisma usage changes.
- Document any tests that are intentionally deferred.
## Campaign Analytics / Campaign Order Attribution UI Requirement

When the user asks to see which orders applied or contributed to campaigns, the agent must treat this as a focused admin campaign analytics feature, similar to promo analytics, not a broad campaign redesign.

Known user need:
- Admin campaigns currently show campaign performance and recent orders in the table.
- The user wants a dedicated analytics view/modal like promo analytics where they can see all orders associated with a campaign.
- Campaign analytics should show which orders contributed donations, eligible subtotal, donation amount, customer, order reference, created/redeemed time, and related products when available.
- The feature should be test-covered alongside campaign attribution and checkout donation logic.

Primary goals:
- Add or improve campaign analytics UI so admin can inspect campaign-attributed orders clearly.
- Reuse existing `OrderCampaignUsage` or equivalent attribution source of truth if available.
- Keep campaign list/table readable; detailed order attribution should live in a focused modal, panel, route, or component similar to promo analytics.
- Ensure analytics numbers match order detail, campaign table totals, and checkout-generated donation attribution.
- Add meaningful tests for campaign attribution analytics and promo + campaign coexistence.

The agent must audit before editing:
1. Prisma `Campaign`, `Order`, `OrderItem`, and `OrderCampaignUsage` models.
2. Campaign repository/service/controller response shape.
3. Campaign admin API client files.
4. Campaign admin table/component files.
5. Existing promo analytics UI and data shape for reference.
6. Order creation flow that records campaign attribution.
7. Checkout/campaign donation calculation logic.
8. Existing tests or new tiered test structure.

Campaign analytics should consider showing:
- Campaign name and status.
- Total attributed orders.
- Total donation generated.
- Total eligible subtotal or campaign revenue.
- Average donation per attributed order.
- Recent or full attribution history.
- For each attributed order:
  - customer email/name if available and safe for admin
  - friendly order reference
  - internal order id only if useful to admin
  - eligible subtotal
  - donation amount
  - matched product ids/names if available
  - order total if available
  - created/attributed timestamp
  - link/button to admin order detail if route exists

Rules:
- Do not redesign the full campaigns page.
- Do not overload the campaign table with too much detail; use a dedicated analytics action/panel/modal when appropriate.
- Do not duplicate campaign attribution calculations in the UI if server can provide the source-of-truth analytics.
- Do not infer historical attribution from mutable campaign product lists if `OrderCampaignUsage` exists; use persisted attribution rows.
- If old orders have no attribution rows, show them as missing/unattributed rather than inventing data.
- Do not expose secrets or customer-sensitive data outside admin-only views.
- Keep files organized by domain; use admin campaign components/API helpers rather than growing one large view file.

Suggested client placement:
- `client/src/domains/admin/components/AdminCampaignAnalyticsModal.vue` or equivalent focused component.
- Campaign admin API updates in `client/src/domains/admin/api/`.
- Reuse existing formatting helpers where possible.

Suggested server placement:
- Campaign analytics route/controller/service/repository updates under `server/src/domains/campaigns/`.
- Use route → controller → service → repository → Prisma pattern.

Testing requirements:
- Add Tier 1 or Tier 2 tests, depending on what is being tested:
  - Tier 1: campaign donation calculation and promo + campaign totals.
  - Tier 2: admin campaign analytics response shape and attributed order reporting.
- Do not use real Railway DB, Vercel, Stripe, or secrets in tests.
- Use fixtures/mocks or isolated service tests.
- Verify campaign analytics totals match attribution rows.
- Verify an attributed order appears in campaign analytics with correct donation amount.
- Verify old orders without attribution are not falsely counted.
- Verify promo discount and campaign donation can coexist in pricing tests if that area is touched.

Required verification:
- Run client build.
- Run server build or syntax/import checks for changed server files.
- Run Prisma generate if schema/prisma usage changes.
- Run `npm run tiertest1` if tiered tests exist or were added.
- Run campaign analytics tests added in this pass.
- Verify campaign analytics UI opens from admin campaigns and lists attributed orders.
- Verify clicking or referencing an attributed order can help admin reach order detail if implemented.
- Verify campaign table totals still match analytics modal totals.
- Verify no `.env.example` files are created.
- Verify no secrets are documented.
- Update `PROJECT_HANDOFF.md` and `docs/architecture/file-map.md` with new files, endpoints, test commands, and remaining gaps.

Manual QA checklist:
- Open admin campaigns.
- Click campaign analytics/action for an active campaign.
- Confirm modal/panel shows total orders, donation, revenue/eligible subtotal, and average donation.
- Confirm attributed orders list includes friendly order references and donation amounts.
- Open an attributed order detail and confirm donation/campaign attribution matches.
- Complete a new checkout with campaign-eligible products and confirm the analytics view updates.
- Run relevant tiered tests and confirm campaign analytics tests pass.


## Phase 6 / Customer Accounts, Better Auth, and Loyalty Requirement

When the user says Phase 5 checkout, promo, campaign, orders, and tiered tests have passed, the project may move into Phase 6 planning and implementation.

Current phase transition context:
- Phase 1 Foundation is complete.
- Phase 2 Storefront MVP is complete.
- Phase 3 Admin CMS is complete.
- Phase 4 Checkout, Stripe, orders, promos, campaigns, and deployment foundation is complete.
- Phase 5 Stabilization, Railway DB admin workflow, analytics, campaign attribution, promo repair, and tiered tests are passing by automated and manual QA.
- Phase 6 is customer accounts, auth modernization, loyalty, customer order history, and account-based promo limits.

Primary Phase 6 goal:
- Introduce a proper account/auth foundation without breaking the existing storefront, checkout, admin dashboard, custom admin workflow, orders, promos, campaigns, or tests.

Preferred auth direction:
- Better Auth is the preferred future auth direction for customer accounts and long-term admin roles.
- The first Phase 6 pass should be an audit and architecture plan before a full migration.
- Do not rip out the existing custom admin auth until a safe migration plan exists and tests cover the current behavior.
- Preserve the existing admin dashboard UI and admin feature pages.

Phase 6 work should be staged:

1. Phase 6A — Auth/account architecture audit and migration plan:
   - Audit current custom admin auth.
   - Audit current customer checkout data and order ownership fields.
   - Audit Prisma schema for user/customer/account/session needs.
   - Audit Better Auth integration requirements.
   - Decide how customers, admins, roles, sessions, and orders should relate.
   - Decide whether admin auth migrates immediately or later.
   - Update docs/architecture/auth-roadmap.md and PROJECT_HANDOFF.md.
   - No risky auth migration unless explicitly requested after the plan.

2. Phase 6B — Customer account data model foundation:
   - Add Customer/User/account schema only after the audit proves the shape.
   - Link new customer accounts to existing orders by normalized email when safe.
   - Preserve guest checkout.
   - Prepare account-based promo usage limits, but do not break email-based promo limits.
   - Add migrations safely and document Railway `prisma migrate deploy` steps.

3. Phase 6C — Customer account UI foundation:
   - Add customer sign up / login / account routes only after the server model is clear.
   - Add customer order history page.
   - Add customer profile basics if needed.
   - Keep checkout guest-friendly.
   - Do not require accounts for checkout unless the user explicitly asks later.

4. Phase 6D — Loyalty foundation:
   - Design points/rewards/referrals after account identity is stable.
   - Do not add loyalty math before account/order ownership is reliable.
   - Add tests for points accrual and redemption before production use.

5. Phase 6E — Admin role migration:
   - Move admin attribution/status history from placeholder `ADMIN_ENV`/`SYSTEM` to real admin users only after auth roles are implemented.
   - Preserve status history and audit trail compatibility.
   - Preserve admin dashboard UX.

Rules:
- Do not start Phase 6 by deleting or replacing the current admin auth system.
- Do not rebuild the admin dashboard.
- Do not break guest checkout.
- Do not require customer login for normal checkout unless explicitly requested.
- Do not expose secrets or auth tokens in docs/logs.
- Do not add Better Auth blindly; first verify dependencies, schema needs, server integration, client routes, session/cookie strategy, and deployment environment variables.
- Do not create a broad auth refactor without tests and a rollback-friendly plan.
- Preserve existing tiered test commands and add/update tests as auth/account logic is introduced.

Required Phase 6A verification:
- Run `npm run tiertest1`.
- Run `npm run test` if feasible.
- Run client build.
- Run server build.
- Document the current auth state before changing it.
- Update `PROJECT_HANDOFF.md` with the Phase 6 plan, decisions, files audited, and risks.
- Update `docs/architecture/auth-roadmap.md` with the recommended Better Auth/customer account migration path.

Phase 6A final report must include:
- Current auth/account state.
- Recommended Better Auth integration approach.
- Whether admin auth should migrate now or later.
- Proposed Prisma models and relationships.
- Proposed routes and client pages.
- Guest checkout preservation plan.
- Account-based promo/loyalty roadmap.
- Tests needed before implementation.
- Next safe implementation step.
## Better Auth / Customer Accounts Infrastructure Requirement

When the user asks to start Better Auth, accounts, customer login, order history, saved customer profiles, email verification, password reset, or future email-service readiness, the agent must treat the task as a full auth/account infrastructure phase, not a small UI-only feature.

Primary goal:
- Implement Better Auth as the foundation for customer accounts and future admin accounts while preserving the current storefront, checkout, admin dashboard, guest checkout, and existing order flows.
- Create the client UI, server auth infrastructure, database tables, route guards, order-account linking, and email-service-ready data contracts needed for a real ecommerce account system.
- Keep files organized into small, readable modules that follow the existing Vue/server architecture.

The agent must read before editing:
1. `AGENTS.md`.
2. `PROJECT_HANDOFF.md` if it exists.
3. Existing auth, checkout, orders, admin, Prisma, API helper, CORS, cookie, and deployment configuration.
4. Existing docs under `docs/architecture/` if they exist.

Required audit before implementation:
1. Current custom admin auth system.
2. Current admin route guards and admin dashboard protection.
3. Current checkout customer email, name, phone, and address flow.
4. Current order creation service/repository flow.
5. Current order success page and admin order detail flow.
6. Current Prisma schema and migrations.
7. Current client API base URL strategy, including `VITE_API_BASE_URL` and/or `VITE_API_URL`.
8. Current server CORS, cookie, session, and frontend origin env variable usage.
9. Current Vercel frontend and Railway backend deployment expectations.

Better Auth requirements:
- Use official Better Auth patterns.
- Add Better Auth server setup.
- Add the Better Auth Prisma adapter for PostgreSQL.
- Mount Better Auth under `/api/auth/*` or the official configured base path.
- Add the Better Auth client setup for Vue.
- Enable email/password authentication.
- Add session support so users remain logged in during an active session and across page refresh while the session is valid.
- Add sign out behavior that clears the session.
- Configure trusted origins for the deployed frontend/backend setup.
- Configure production cookie behavior safely for Vercel frontend + Railway backend.
- Do not expose secrets in source code, docs, logs, examples, or final reports.

Database/account requirements:
- Add Better Auth required tables/models safely through Prisma migration.
- Add a user role field or equivalent role model that supports at least:
  - `CUSTOMER`
  - `ADMIN`
- Public signup must only create customer accounts.
- Public signup must never create admin accounts.
- Admin accounts must be created later through a safe admin-only workflow, manual DB seed, protected script, or migration from the existing custom admin auth.
- Add `Order.userId` as nullable if needed so logged-in orders can be linked without breaking old guest orders.
- Existing guest orders must remain valid.
- If profile data is not stored directly on the Better Auth user model, add a focused customer profile model or document why it is deferred.
- Prepare future models or documented extension points for:
  - saved addresses
  - order reviews
  - loyalty ledger/points
  - referrals
  - email notification preferences
- Do not run destructive Prisma commands.
- Do not use `prisma migrate reset` against any shared, Railway, staging, or production-like database.

Client account UI requirements:
- Create focused Vue pages/components under the existing client structure, not one large account god file.
- Add routes for:
  - `/account/sign-in`
  - `/account/create`
  - `/account`
  - `/account/profile`
  - `/account/orders`
  - `/account/orders/:id`
  - `/account/forgot-password` if supported or safely stubbed
  - `/account/reset-password` if supported or safely stubbed
- Add a protected account route guard.
- Logged-out users should be redirected to sign in only for account pages.
- Checkout must never require sign in.
- Add account header/nav state:
  - logged out: show sign in/create account entry point
  - logged in: show account/sign out entry point
- Add session check on app load or route entry using a reusable auth composable/service.
- Add account dashboard foundation with:
  - profile summary
  - order history entry point
  - recent orders if available
  - tracking/status placeholder
  - reviews placeholder for future delivered orders
  - saved address placeholder if not fully implemented
- Preserve existing storefront UX.
- Preserve existing checkout UX except for safe prefill/account prompts.

Server account/order API requirements:
- Add server-side helpers/middleware for reading the current Better Auth session safely.
- Add customer-protected API endpoints for account data and order history if Better Auth does not provide them directly.
- Account order endpoints must only return orders owned by the authenticated customer.
- Never expose arbitrary orders by raw id to a logged-in customer without ownership verification.
- Add order history support using:
  1. `Order.userId` for logged-in orders.
  2. Verified-email matching for older guest orders only when safe.
- Do not allow unverified email ownership to claim or view old guest orders.
- Normalize customer email using trim + lowercase on client payload construction and server processing.
- Keep admin order endpoints separate from customer account endpoints.
- Preserve admin-only order visibility.

Checkout/account linking requirements:
- Guest checkout must remain fully available.
- Logged-out checkout must still create a guest order using normalized customer email.
- Logged-in checkout should prefill customer name/email when safely available.
- Logged-in checkout should link the created order to `userId` server-side.
- The server must not trust a client-submitted `userId`.
- If the client sends user/account context, the server must verify it from the active session.
- If a logged-in user changes checkout email, document and handle whether the order is linked by account session, email, or both.
- Account order history should include logged-in orders by `userId` and may include older guest orders by verified email only.
- Future order tracking/review data should be structured so customer account pages can consume it later.

Email-service readiness requirements:
- Prepare the account and order flows so a future email service can be added without reworking core data flow.
- Do not send real emails unless an email provider is already configured and the user explicitly wants it enabled.
- Add clean server-side email event/data builders or documented placeholders for:
  - account verification email
  - resend verification email
  - password reset email
  - welcome email
  - order confirmation email
  - order status update email
  - future shipping/tracking email
  - future review request email
- Email payload builders must return safe structured data such as recipient email, customer name, order reference, order totals, items, status, tracking placeholder, and action URLs.
- Email builders must not include secrets, raw session tokens in logs, or private Stripe data.
- If Better Auth email verification/password reset requires an email sender, create a provider abstraction/stub that is clearly disabled until real provider env variables are configured.
- Document required future email env variable names only, not values.
- Email-related files should be small and organized, for example:
  - server auth email adapter/sender placeholder
  - server email event constants
  - server email payload builders
  - server order confirmation payload mapper
  - server account verification/reset payload mapper if needed
- Do not create a fake email implementation that silently pretends to send real messages.
- If emails are not enabled, the app should fail safely with clear development/admin messaging.

Future email data that should be ready from account/order flows:
- Customer email and normalized email.
- Customer name.
- Customer account id when logged in.
- Customer-friendly order reference.
- Order items with product name, variant size, quantity, unit price, and line total.
- Pricing breakdown: subtotal, discount, shipping, tax, donation, and total.
- Promo code and discount amount if used.
- Campaign/donation data if used.
- Order status and last status update timestamp if available.
- Tracking placeholder or tracking fields if already present.
- Account/action URLs generated from configured frontend origin.

Security requirements:
- Configure Better Auth secret and base URL using env variables.
- Configure trusted origins using env variables, not hardcoded production URLs.
- Configure cookies for production safely.
- Configure CORS credentials/origins correctly for Vercel frontend and Railway backend.
- Rate-limit or clearly document missing rate limits for sign in, create account, password reset, and resend verification endpoints.
- Do not reveal whether an email exists during password reset or account lookup flows unless the auth provider handles it safely.
- Do not expose raw Better Auth internals, password hashes, session ids, verification tokens, or Stripe secret data.
- Do not allow public role escalation.
- Do not weaken existing admin auth to make customer auth work.

Admin auth rule:
- The current custom admin auth may remain in place during this phase unless Better Auth admin migration is fully implemented and verified.
- If custom admin auth remains, clearly document that admin auth is still custom and customer auth uses Better Auth.
- If admin auth is migrated to Better Auth, verify the existing admin dashboard, admin route guards, admin products, promos, campaigns, orders, and order detail pages still work.
- Do not rebuild the admin dashboard.
- Do not remove admin routes.

File organization requirements:
- Follow existing client domain patterns:
  - view/page files stay thin
  - composables own stateful behavior
  - API files own HTTP calls
  - mappers own shape conversion
  - validators own validation
  - components stay focused
  - shared utilities only go into shared folders when reused across domains
- Follow existing server architecture:
  - route → controller → service → repository → Prisma where applicable
  - Better Auth handler can use the official pattern, but account/order wrappers should stay organized by domain
- Do not create oversized god files.
- Do not create micro-components for trivial markup.
- Prefer Lego-like, readable modules that are easy to test and debug.
- Suggested client organization:
  - `client/src/domains/account/views/`
  - `client/src/domains/account/components/`
  - `client/src/domains/account/composables/`
  - `client/src/domains/account/api/`
  - `client/src/domains/account/mappers/`
  - `client/src/domains/account/validators/`
  - `client/src/domains/auth/` only if the project already separates auth from account UI
- Suggested server organization:
  - `server/src/domains/auth/` for Better Auth config, auth helpers, and session utilities
  - `server/src/domains/account/` for customer account APIs
  - `server/src/domains/emails/` for future email event builders/provider abstractions
  - `server/src/domains/orders/` for order linking/history updates
- Update `docs/architecture/file-map.md` and `PROJECT_HANDOFF.md` when new account/auth/email files are added.

UI/UX requirements:
- Keep account pages clean and simple.
- Use existing visual language/components when possible.
- Do not redesign the entire storefront/header.
- Account creation should make it clear checkout can still be done as guest.
- Checkout may offer a soft prompt such as creating an account after order completion, but it must not block purchase.
- Customer-facing pages should use customer-friendly order references, not giant raw internal ids when avoidable.

Testing and verification requirements:
- Run client build.
- Run server build or targeted server syntax/import checks.
- Run `npx prisma generate` if Prisma changes.
- Run available tests.
- Run new auth/account tests if added.
- Verify customer account creation locally.
- Verify sign in locally.
- Verify session persists after refresh while valid.
- Verify sign out clears the session.
- Verify protected account routes redirect when logged out.
- Verify account dashboard loads when logged in.
- Verify account order history only shows the authenticated user’s orders or safely verified-email-matched guest orders.
- Verify guest checkout still works.
- Verify logged-in checkout still works.
- Verify logged-in checkout links the order to the authenticated user server-side.
- Verify admin login/admin dashboard still works if custom admin auth remains.
- Verify no `.env.example` files are created unless explicitly requested.
- Verify no secrets are documented or committed.
- Verify deployment notes include Vercel/Railway origin and cookie expectations.

Required docs updates:
- Update `PROJECT_HANDOFF.md` with:
  - Better Auth files added
  - account pages added
  - database migrations added
  - order linking behavior
  - email-service readiness files/placeholders
  - env variable names only
  - verification results
  - remaining risks
  - next recommended phase
- Update architecture docs if they exist:
  - `docs/architecture/auth-roadmap.md`
  - `docs/architecture/database.md`
  - `docs/architecture/data-flow.md`
  - `docs/architecture/file-map.md`
  - `docs/architecture/admin.md` if admin auth behavior changes
- If docs contain Mermaid diagrams, verify Mermaid syntax/rendering according to the Documentation Rendering / Mermaid Verification Requirement.

Required final report from the agent:
1. Better Auth infrastructure added.
2. Client account UI pages/components added.
3. Server auth/account/email files added.
4. Database models/migrations added.
5. Checkout/order linking behavior implemented.
6. Email-service readiness work completed.
7. Whether admin auth is still custom or migrated.
8. Commands run and results.
9. Manual QA completed and remaining manual QA.
10. Remaining risks.
11. Next safest phase.

Do not commit or push unless explicitly asked.
## Better Auth Addendum: Account Lifecycle, Support, Reviews, Loyalty, and Notifications

When the user asks to start or continue Better Auth/customer accounts work, the agent must include these additional requirements along with the main Better Auth / Customer Accounts Infrastructure Requirement.

Account lifecycle requirements:
- Add logged-in password change support if Better Auth supports it cleanly.
- Keep logged-in password change separate from forgot/reset password.
- Prepare a safe account deactivation/deletion flow.
- Do not hard-delete customer order history.
- If deletion is requested later, preserve required order records and remove/anonymize only customer profile data where appropriate.
- Account deactivation should prevent login or mark the customer inactive without destroying order records.
- Document what is implemented now versus what is future/planned.

Admin role safety requirements:
- Public signup must never create admin accounts.
- Admin role assignment must occur through seed data, manual DB assignment, protected scripts, or future admin-only tooling.
- Do not add any public UI, route, payload field, query param, or hidden form value that lets a customer choose `ADMIN`.
- If a seed/protected script is added, document required env variable names only and do not include real secrets.

Customer support/order-help requirements:
- Add customer support/order-help readiness from account order detail pages.
- Add a `Need help with this order?` entry point or placeholder on customer order detail.
- Support-ready data should include customer email, customer name if available, customer-friendly order reference, internal order id for server/admin use, order status, and customer message.
- Do not expose private order data to another customer through support/order-help routes.
- Prepare future email/ticket payload builders without sending real support emails unless a real provider is configured and explicitly enabled.

Review readiness requirements:
- Prepare review eligibility rules for future order reviews.
- Reviews should only be allowed for delivered orders.
- Reviews should only be allowed for purchased items/order items.
- Prepare or document one-review-per-order-item enforcement for a future phase.
- Review buttons/placeholders must not appear as functional unless the backend eligibility and persistence exist.
- If shown now, review UI must be clearly marked as future/planned or disabled until implemented.

Customer address-book requirements:
- Prepare customer address-book readiness.
- Support a default shipping address if implemented now.
- Prepare for multiple saved addresses in future phases.
- Checkout may prefill address data for logged-in users only when safely available.
- Guest checkout must remain available and must not depend on saved addresses.

Failure-state requirements:
- Add clear customer-facing states for invalid credentials, duplicate account email, expired session, unverified email, empty order history, order not found, unauthorized order access, account deactivated if implemented, and email service not configured when verification/reset email is requested in development.
- Avoid leaking whether an email exists during reset/lookup flows unless Better Auth handles this safely.

Mobile account UX requirements:
- Verify account nav/header behavior works on mobile and desktop.
- Mobile header/account menu must correctly show logged-out and logged-in states.
- Mobile sign out must clear the same session as desktop sign out.

Loyalty/rewards foundation requirements:
- Do not fully build loyalty unless the user explicitly asks.
- Prepare schema/docs/extension points so the customer account system can support future loyalty without a major rewrite.
- Future-ready concepts may include loyalty ledger, points balance, rewards history, referral codes, referral rewards, and customer reward balance.
- If no loyalty models are added now, document the recommended future models and where they should live.
- Do not award real points or expose loyalty balances unless the rules are implemented and verified.

Notification-center foundation requirements:
- Do not fully build a notification center unless the user explicitly asks.
- Prepare docs/extension points for future account notifications.
- Future notification types may include order status updates, tracking updates, review reminders, loyalty/reward notices, referral notices, and marketing preference updates.
- If notification files are added, keep them small and domain-organized.
- If notification files are not added, document the planned architecture clearly.

Additional rate-limit/security requirements:
- Rate-limit or explicitly document missing rate limits for sign in, create account, password reset, resend verification, support/order-help requests, and account deletion/deactivation requests.
- Verify unauthorized users cannot access another customer's order detail by manipulating URLs.
- Verify unverified users cannot claim old guest orders through email matching alone.
- Verify support/review placeholders do not expose private order information.

Required verification additions:
- Verify account empty states render correctly.
- Verify session-expired behavior recovers or redirects cleanly.
- Verify mobile account nav/header behavior works.
- Verify deactivated/deleted account behavior is safe if implemented, or clearly documented as a placeholder if deferred.
- Verify customer support/order-help routes or placeholders do not expose another customer's order data.
- Verify review placeholders do not expose another customer's order items.

Required final report additions:
- Account lifecycle readiness status.
- Password change readiness status.
- Account deactivation/deletion readiness status.
- Customer support/order-help readiness status.
- Review eligibility readiness status.
- Address-book readiness status.
- Loyalty/rewards foundation status.
- Notification-center foundation status.
## Better Auth Addendum: Admin Customer Account Management Dashboard

When Better Auth/customer accounts are introduced, the agent must also prepare admin-side customer account management inside the existing admin dashboard. Customer accounts should not be managed through a separate disconnected tool unless the user explicitly asks for that later.

Primary goal:
- Add a new admin customer/accounts area to the existing admin dashboard so the business can view and manage customer accounts, linked orders, account status, and future loyalty/support/review data.
- Preserve the current admin dashboard UX, route protection, products, promos, campaigns, and orders pages.
- Do not rebuild the admin dashboard from scratch.
- Do not weaken admin auth to make customer management work.

Admin account management routes/pages:
- Add or prepare admin routes such as:
  - `/admin/customers`
  - `/admin/customers/:id`
  - `/admin/customers/:id/orders`
  - `/admin/customers/:id/support` if support tooling is implemented or stubbed
  - `/admin/customers/:id/reviews` if review tooling is implemented or stubbed
  - `/admin/customers/:id/rewards` if loyalty tooling is implemented or stubbed
- Add these routes to the existing admin navigation/sidebar/header in a way that matches current admin UX.
- Do not expose customer management routes to non-admin users.

Admin customer list requirements:
- Show customer/account list with useful columns such as:
  - customer name
  - email
  - email verified status
  - role
  - account status
  - created date
  - last session or last login if available
  - total orders
  - lifetime spend if safely derivable
  - latest order date if safely derivable
- Add search/filter by name, email, role, verification status, and account status where practical.
- Add empty/loading/error states.
- Keep the list performant and paginated or limit-ready if the dataset can grow.

Admin customer detail requirements:
- Show customer profile/account summary.
- Show verified email status.
- Show account status such as active, inactive, deactivated, or banned/suspended if implemented.
- Show linked order history.
- Show older guest orders matched by verified email only when safe.
- Show lifetime spend/order count if safely calculated server-side.
- Show saved addresses if implemented.
- Show marketing/email preference status if implemented.
- Show support/order-help history or placeholder.
- Show review history/eligibility or placeholder.
- Show loyalty/rewards summary or placeholder.
- Show referral summary or placeholder.
- Show account audit/activity notes if implemented.

Admin customer tools/actions:
- Allow safe admin actions only when supported by backend authorization and audit logic.
- Potential actions may include:
  - view customer orders
  - open an order detail
  - deactivate/reactivate account
  - resend verification email if email service is configured
  - trigger password reset email if email service is configured
  - update customer notes/internal notes if implemented
  - adjust role only through a protected admin-only flow, never public signup
  - view support/order-help requests
- Do not add destructive customer delete actions by default.
- Do not allow admins to see passwords, password hashes, raw sessions, verification tokens, or Better Auth internals.
- Do not allow public users to self-promote or request admin role through customer UI.

Admin customer server/API requirements:
- Add admin-only customer/account APIs under the existing server route/controller/service/repository pattern where applicable.
- Customer admin APIs must require admin auth.
- Server must enforce role checks; client route guards alone are not enough.
- Do not return password hashes, session ids, verification tokens, raw auth provider secrets, or private payment details.
- Return safe customer summaries and detail DTOs/mappers.
- Add pagination/search/filter support where practical.
- Use server-side calculations for lifetime spend/order counts when included.
- Keep admin customer endpoints separate from customer self-service account endpoints.

Customer/account ownership rules:
- Customer self-service account pages can only access the current authenticated customer.
- Admin customer pages can access all customers only through admin-protected routes.
- Guest orders should only be associated with accounts through verified-email matching rules.
- Admin views may show potential email matches, but must clearly distinguish confirmed linked orders from possible guest matches if email is not verified.

Audit and safety requirements:
- Prepare or document customer account audit logging for sensitive actions such as role change, account deactivation, account reactivation, email resend, password reset trigger, and admin notes.
- Until Better Auth admin-user attribution exists, use a clear placeholder attribution such as `ADMIN_ENV` or document why attribution is deferred.
- Do not pretend real admin-user attribution exists before admin users are migrated to Better Auth.
- Sensitive actions should require explicit button clicks, not instant changes from dropdowns.
- Add confirmation prompts for deactivate/reactivate or any destructive-looking action.

File organization suggestions:
- Client admin customer files should follow existing admin domain patterns, for example:
  - `client/src/domains/admin/views/AdminCustomersView.vue`
  - `client/src/domains/admin/views/AdminCustomerDetailView.vue`
  - `client/src/domains/admin/components/AdminCustomersTable.vue`
  - `client/src/domains/admin/components/AdminCustomerSummaryCard.vue`
  - `client/src/domains/admin/components/AdminCustomerOrdersPanel.vue`
  - `client/src/domains/admin/components/AdminCustomerStatusBadge.vue`
  - `client/src/domains/admin/api/adminCustomers.api.js`
  - `client/src/domains/admin/composables/useAdminCustomers.js`
  - `client/src/domains/admin/composables/useAdminCustomerDetail.js`
  - `client/src/domains/admin/mappers/adminCustomers.mapper.js`
  - `client/src/domains/admin/validators/adminCustomers.validator.js` if needed
- Server admin customer files should follow existing domain patterns, for example:
  - `server/src/domains/customers/routes/adminCustomers.routes.js`
  - `server/src/domains/customers/controllers/adminCustomers.controller.js`
  - `server/src/domains/customers/services/adminCustomers.service.js`
  - `server/src/domains/customers/repositories/adminCustomers.repository.js`
  - `server/src/domains/customers/mappers/adminCustomers.mapper.js`
  - `server/src/domains/customers/validators/adminCustomers.validator.js` if needed
- Use existing admin shared components and admin UI patterns where possible.
- Keep pages thin and move business logic into composables/services/mappers.
- Do not create one giant customer dashboard file.

Recommended implementation order:
1. Implement Better Auth customer account foundation.
2. Add customer self-service account pages and order linking.
3. Add admin customer list and detail read-only dashboard.
4. Add safe customer actions such as deactivate/reactivate only after backend authorization and audit behavior are clear.
5. Add email-trigger actions only after the email provider abstraction is ready and disabled/enabled safely by configuration.
6. Add loyalty/reviews/support tooling as future extensions unless the user explicitly asks to fully implement them now.

Required verification:
- Run client build.
- Run server build or syntax/import checks for changed server files.
- Run Prisma generate if schema changes.
- Verify admin customer routes are protected.
- Verify non-admin/customer users cannot access admin customer APIs.
- Verify admin customer list loads.
- Verify admin customer detail loads.
- Verify customer detail does not expose password hashes, sessions, verification tokens, or private Stripe data.
- Verify linked orders display correctly.
- Verify verified-email guest order matching rules are respected.
- Verify existing admin products, promos, campaigns, orders, and order detail still work.
- Verify customer self-service account pages still only show the logged-in customer's own data.
- Update `PROJECT_HANDOFF.md` and architecture docs with admin customer management flows.

Required final report additions:
- Admin customer management pages/routes added.
- Admin customer APIs added.
- Customer management actions implemented or deferred.
- Sensitive data excluded from admin responses.
- Account/order linking behavior visible in admin.
- Verification results for admin route/API protection.
- Remaining customer management risks and next safest phase.
## Better Auth Addendum: Future Admin Permissions and Operations

When implementing Better Auth, customer accounts, or admin customer management, the architecture must be prepared for future role-based permissions even if only CUSTOMER and ADMIN are implemented initially.

Phase 1 roles:
- CUSTOMER
- ADMIN

Future-ready roles:
- OWNER
- ADMIN
- STAFF
- SUPPORT
- MARKETING

Requirements:
- Implement only CUSTOMER and ADMIN unless explicitly asked otherwise.
- Design the role architecture so additional roles can be added later without a major refactor.
- Public signup must always create CUSTOMER only.
- Only privileged admin workflows may assign elevated roles.
- Future OWNER role should be able to manage roles and permissions.
- Future STAFF role should focus on fulfillment and order operations.
- Future SUPPORT role should focus on customer accounts, orders, and support requests.
- Future MARKETING role should focus on promos, campaigns, rewards, and notifications.
- Do not expose payment secrets, auth secrets, password hashes, verification tokens, sessions, or infrastructure settings to non-OWNER roles.

Future admin operations dashboard readiness:
- Prepare the admin customer management area to support future:
  - customer notes
  - internal account flags
  - support tickets
  - review moderation
  - loyalty adjustments
  - referral management
  - notification history
  - account activity history
- Do not fully implement these systems unless explicitly requested.
- Document extension points and recommended future architecture.

Verification:
- Verify CUSTOMER cannot access admin routes.
- Verify ADMIN-only routes require server-side authorization.
- Verify future role expansion can be added without redesigning auth architecture.
## Customer Experience Architecture Standards

When implementing storefront, checkout, customer accounts, Better Auth, loyalty, referrals, reviews, tracking, notifications, email automation, subscriptions, or any other customer-facing feature, the agent must treat the work as part of one connected customer experience platform.

Primary goal:
- Make customer accounts and customer tools feel like a natural extension of the Chase & Evie Co. storefront, not a separate portal or disconnected SaaS dashboard.
- Improve clarity, trust, retention, repeat purchases, and ease of navigation.
- Preserve the existing storefront brand, layout language, and shopping-first experience.

Customer accounts are store features:
- Reuse the storefront shell when practical.
- Reuse the storefront header.
- Reuse the storefront footer.
- Reuse storefront navigation patterns.
- Reuse storefront typography, spacing, cards, button styles, and visual language.
- Account pages should feel connected to browsing products, cart, checkout, and order history.
- Avoid generic SaaS-style dashboards, blank portal screens, or account pages that make the customer feel they left the store.

Customer identity visibility standards:
- Customers should always understand whether they are signed in, signed out, or checking out as a guest.
- The main site header should include a clear account entry point.
- Guest state should make Sign In and Create Account available without blocking shopping.
- Authenticated state should show the customer first name, initials, or another friendly account cue when available.
- Authenticated state should make Account, Orders, and Sign Out easy to find.
- Mobile and desktop account navigation must have parity.
- Account state must never be ambiguous.

Ecommerce account standards:
- Account creation should be presented as a shopping convenience, not a technical auth workflow.
- Customer-facing copy should emphasize useful benefits such as faster checkout, order history, future tracking, future rewards, future loyalty, and future referrals.
- Avoid technical auth jargon on customer-facing pages when plain ecommerce language is clearer.
- Public signup must always create CUSTOMER accounts only.
- Never expose role, status, admin, session, token, or Better Auth internal fields in customer-facing forms.

Checkout identity standards:
- Checkout must clearly communicate whether the customer is signed in or checking out as a guest.
- Guest checkout must remain available and obvious.
- If signed in, checkout should show a small signed-in indicator such as `Signed in as ...`.
- If signed in, checkout should explain when profile details were prefilled from the account.
- If signed in, checkout may hide or adjust redundant `save my information` or marketing opt-in prompts when those preferences are already managed in the account.
- If guest, checkout should offer a helpful sign-in/create-account card without blocking purchase.
- Sign-in prompts should be reusable, simple, and conversion-friendly.

Customer account UX standards:
- Account overview should provide a helpful summary, not a blank dashboard.
- Account dashboard should consider showing greeting, profile status, verified email status, recent order, order count, lifetime spend, and quick links.
- Profile pages should support useful customer details such as first name, last name, phone, marketing preferences, and future address readiness.
- Email changes should not be exposed unless verification and security flows are implemented safely.
- Account pages must include loading, empty, error, success, expired-session, unverified-email, and unauthorized states where relevant.
- Future cards such as loyalty, tracking, reviews, referrals, and notifications should look intentional and polished, not broken or unfinished.

Order history and order detail standards:
- Order lists should be easy to scan.
- Order cards should consider showing order reference, status badge, placed date, total, item count, product preview if available, and a clear detail link.
- Order detail pages should include customer-useful information:
  - order reference
  - order status
  - payment status if available
  - placed date
  - customer contact info
  - shipping details if available
  - item list with product, variant, quantity, unit price, and line total
  - pricing breakdown: subtotal, discount, shipping, tax, donation/campaign, and total
  - promo code if used
  - tracking/status timeline readiness
  - `Need help with this order?` support entry point
  - future review eligibility/readiness
- Customer order pages must never expose another customer’s order data.
- Customer-facing pages should use friendly order references when possible instead of raw internal ids.

Admin customer management UX standards:
- Admin customer management should live inside the existing admin dashboard unless the user explicitly asks for a separate tool.
- Admin customer views should remain consistent with existing admin products, promos, campaigns, and orders UX.
- Admin customer list/detail should be useful operationally, not just decorative.
- Admin customer tools should prepare for viewing customer profile, linked orders, verified-email status, account status, order count, lifetime spend, support readiness, review readiness, loyalty readiness, referral readiness, and internal notes readiness.
- Do not expose password hashes, sessions, verification tokens, Better Auth internals, Stripe secrets, private payment data, or infrastructure settings through admin customer views.
- Sensitive admin actions should use server-side authorization and should not rely on client route guards alone.

Customer journey review requirement:
- Before closing any major customer-facing phase, the agent must review the customer journey:
  - guest browse
  - add to cart
  - checkout
  - sign in or continue as guest
  - order confirmation
  - account creation/sign in
  - order history
  - repeat purchase
- Identify friction, confusing navigation, duplicate data entry, dead ends, retention opportunities, and places where account state is unclear.
- Fix small verified UX issues within scope or document them clearly as next-phase work.

Customer retention readiness:
- Customer-facing features should be evaluated for future retention and repeat-purchase value.
- Consider future support for loyalty, rewards, referrals, email automation, review requests, reorder flows, customer segmentation, and notifications.
- Do not fully build these future systems unless explicitly requested.
- Create or document clean extension points so future features do not require major rewrites.

Better Auth Infrastructure readiness:
- When Better Auth Infrastructure is introduced, document exactly where the server plugin is installed, where the client plugin is installed if used, which package was added, which environment variable names are required, and which values belong in Railway versus Vercel.
- Never expose real API keys, auth secrets, tokens, sessions, database URLs, Stripe secrets, or password hashes.
- Do not create `.env.example` files unless explicitly requested.
- Local `.env` placeholders may be added only if consistent with existing project policy and must not contain real secrets.

Customer UX review pass requirement:
- After any major customer-account, checkout, order, tracking, review, loyalty, notification, or email-related phase, the agent must perform and document:
  - UX review
  - navigation review
  - mobile review
  - retention review
  - checkout-to-account review
  - account-to-checkout review
  - customer trust/security review
- Update `PROJECT_HANDOFF.md` with what was improved, what was verified, what remains rough, and the next safest customer-experience phase.

Verification requirements for customer experience work:
- Run client build.
- Run server build/syntax checks if server files changed.
- Run tests if available.
- Verify guest checkout still works.
- Verify signed-in checkout still works if auth/account files are touched.
- Verify mobile account/header behavior if navigation/header files are touched.
- Verify account pages feel connected to the storefront through header/footer/navigation where practical.
- Verify admin customer pages remain protected if touched.
- Verify no secrets are added to source, docs, logs, or sample files.

Required final report additions:
- Customer experience changes made.
- Account/storefront continuity improvements.
- Checkout identity improvements.
- Order detail/order history improvements.
- Admin customer management UX changes, if any.
- Better Auth Infrastructure connection/documentation changes, if any.
- Commands run and results.
- Remaining UX risks.
- Next recommended customer-experience phase.
## Customer Account UX Repair Requirement

When the user reports customer account UX issues after Better Auth/customer accounts are implemented, the agent must treat the task as a focused customer-experience repair pass, not a broad auth rewrite or redesign.

Primary goal:
- Fix verified account, header, checkout identity, account menu, profile, and customer order UX issues while preserving the existing Better Auth infrastructure, guest checkout, checkout order creation, admin dashboard, and storefront design.

Known UX issues to audit and fix:
- Account pages may not fully reuse the same live storefront header state as the main page.
- Cart count/items in the main header may not carry over correctly when visiting account pages.
- Account menu/dropdown may close when the pointer moves between the account button and dropdown because of a hover gap.
- Account overview menu may include redundant actions such as Checkout when the cart button already exists elsewhere.
- Account profile may mention marketing preferences or faster checkout without providing clear editable controls.
- Checkout guest sign-in may navigate away to the sign-in page and fail to return customers to checkout after login.
- Checkout should allow a quick sign-in/create-account option without forcing customers to leave checkout when practical.
- Customer account overview may show too many recent orders and stretch the profile card/layout.
- Full order history should live under the Orders tab/page, while overview should show only recent orders.

Header/storefront continuity requirements:
- Account pages must reuse the same main site header component/state as the storefront whenever practical.
- Cart count must remain accurate on account pages, checkout pages, and storefront pages.
- Header account state must remain accurate on account pages, checkout pages, and storefront pages.
- Do not create a fake account-page-only header that drifts from the real storefront header.
- Preserve mobile and desktop header behavior.

Account menu/dropdown requirements:
- Fix hover/click usability so the account dropdown does not disappear when moving the pointer from the account trigger to the menu.
- Prefer click-to-toggle with outside-click close, or a hover-safe bridge/padding area, over fragile hover-only behavior.
- Account menu must be keyboard-accessible where practical.
- Account menu should not include redundant Checkout if the cart/checkout control already exists in the header.
- Suggested menu items for signed-in users:
  - Account overview
  - Orders
  - Profile
  - Sign out
- Suggested menu items for guests:
  - Sign in
  - Create account
- Avoid overcrowding the menu with actions duplicated elsewhere.

Profile and preference requirements:
- If the UI says marketing preferences are managed in the account profile, the profile page must actually expose the marketing preference control.
- If the UI says faster checkout is supported, the profile/account page should expose the relevant saved customer details or clearly state what is saved now versus future.
- Profile page should support clear controls for:
  - first name
  - last name
  - phone
  - marketing opt-in/out
  - email display and verification status
  - saved checkout information readiness
  - future address readiness if full addresses are not implemented yet
- Do not allow unsafe email changes unless verification flow is implemented.

Checkout quick-auth requirements:
- Guest checkout must remain available.
- If a guest clicks sign in during checkout, returning to checkout after successful sign-in must work.
- Preserve redirect query/state such as `redirect=/checkout` when using a full sign-in page.
- Prefer adding a reusable checkout quick-auth card/modal/drawer so guests can sign in or create an account without leaving checkout when practical.
- Quick-auth must use the existing Better Auth APIs and must not create a separate auth system.
- Quick-auth must support loading, error, success, and close/cancel states.
- After quick sign-in/create-account, checkout should refresh session/profile state and safely prefill blank fields.
- Do not force account creation before purchase.

Customer order overview/list requirements:
- Account overview should show only a small number of recent orders, such as the latest 2 or 3.
- Full order history belongs under `/account/orders`.
- If many orders exist, the overview layout must not stretch the profile card into a large empty column.
- Orders page should support a scalable layout for long histories, such as pagination, load more, or a scrollable list if appropriate.
- Order cards should remain easy to scan and should not break the page height/layout.

Layout requirements:
- Fix uneven account overview card heights if recent orders make the profile card look awkward or overly tall.
- Keep account dashboard responsive and balanced.
- Preserve the Chase & Evie Co. visual language.
- Do not redesign the whole storefront or checkout.

Audit before editing:
1. Main header/layout component used by storefront.
2. Account shell/layout component.
3. Cart state/store/composable used by header.
4. Account auth composable/session state.
5. Account dropdown/menu behavior on desktop and mobile.
6. Account profile view and profile API payloads.
7. Checkout guest sign-in/create-account prompt.
8. Sign-in/create-account redirect handling.
9. Recent orders account overview rendering.
10. Full account orders page rendering.

Rules:
- Do not rebuild Better Auth.
- Do not rebuild checkout.
- Do not rebuild admin.
- Do not change order ownership/security rules unless a verified bug requires it.
- Do not add new database schema unless absolutely required for saved profile/preference controls.
- Do not remove guest checkout.
- Do not commit or push unless explicitly asked.

Required verification:
- Run client build.
- Run client tests if available.
- Run server checks/tests only if server files change.
- Verify storefront header cart count and account state work on the homepage.
- Verify account pages show the same cart count/account state as the main storefront.
- Verify account dropdown can be opened and menu items clicked without disappearing from a hover gap.
- Verify Checkout is removed from account menu if redundant.
- Verify profile page exposes marketing opt-in/out and saved-checkout readiness controls/copy.
- Verify guest checkout still works.
- Verify checkout sign-in returns to checkout or quick-auth works without leaving checkout.
- Verify signed-in checkout prefill still works.
- Verify account overview shows only recent orders and full order history remains under Orders.
- Verify mobile account/header behavior.
- Update PROJECT_HANDOFF.md with fixes, verification, remaining UX risks, and next recommended customer-experience step.

Required final report additions:
- Account/header continuity fixes.
- Account dropdown/menu usability fixes.
- Profile/preference fixes.
- Checkout quick-auth or redirect fixes.
- Order overview/list scalability fixes.
- Commands run and results.
- Remaining risks.
## Customer Account UX, Retention, and Conversion Requirements

When working on customer accounts, checkout, customer authentication, loyalty, order history, or profile management, the agent must prioritize customer retention, repeat purchases, checkout completion rate, and long-term account usability.

The goal is not simply to make accounts functional.

The goal is to create an account experience that feels like a modern ecommerce platform and encourages repeat purchases.

### Verified UX Issues To Fix

- Account pages must use the same live storefront shell as the homepage.
- Cart count and cart state must remain synchronized between storefront, account pages, and checkout.
- Account dropdown must not disappear because of hover gaps.
- Remove redundant Checkout from the account dropdown.
- Profile must expose editable marketing preferences.
- Profile must expose saved-checkout readiness.
- Guest checkout sign-in must preserve checkout progress.
- Prefer inline quick-auth modal/drawer instead of redirecting away from checkout.
- Account overview should show only recent orders.
- Full order history belongs in Orders.
- Prevent order lists from stretching dashboard/profile cards.

### Storefront Shell Consistency

Requirements:

- Same SiteHeader.
- Same SiteFooter.
- Same cart state.
- Same search state.
- Same customer session state.
- Same account dropdown behavior.

Customers should never feel like they left the storefront.

### Account Dropdown Stability

Requirements:

- No hover gaps.
- No dead zones.
- Cursor can travel from trigger to menu without closing.
- Mobile uses click behavior.
- Desktop uses hover-safe or click-safe behavior.
- Close only on outside click, escape key, or menu selection.

### Checkout Authentication UX

Requirements:

- Inline sign in.
- Inline create account.
- Modal or drawer authentication preferred.
- Preserve cart state.
- Preserve checkout progress.
- Preserve entered fields.
- Preserve promo state.
- Preserve campaign state.

If redirects are used:

- Return customer to exact checkout location.
- Restore checkout state.

### Customer Dashboard Improvements

The account dashboard should evolve toward a modern ecommerce customer portal.

Future-ready requirements:

1. Welcome Back Experience
- Show customer first name when available.
- Example: Welcome back, Aaron.

2. Dashboard Quick Actions
- Continue Shopping.
- View Orders.
- Edit Profile.
- Buy Again (future-ready).

3. Dashboard Metrics
- Orders count.
- Lifetime spend.
- Loyalty status placeholder.
- Last order date (future-ready).

4. Better Empty States
- If customer has no orders, provide a storefront call-to-action.
- Example: Shop Treats.

### Order Experience Requirements

Requirements:

- Account overview shows only latest 2–3 orders.
- Full history remains under Orders.
- Orders page must scale through pagination, load-more, or equivalent.
- Order cards should remain easy to scan.
- Prevent dashboard layout stretching.

Future-ready improvements:

- Order search.
- Order filtering.
- Buy Again actions.
- Order timeline.

### Customer-Friendly Order References

Avoid exposing large raw references when possible.

Preferred customer-facing formats:

- #1024
- DGE-1024

Admin may continue using internal identifiers when required.

### Profile Requirements

Current editable fields:

- First name.
- Last name.
- Phone.
- Marketing preferences.

Display:

- Email.
- Verification status.

Future-ready:

- Saved addresses.
- Default shipping address.
- Default billing address.
- Delivery instructions.

### Saved Address Foundation

Future account architecture should support:

- Multiple saved addresses.
- Default shipping address.
- Default billing address.

Checkout should eventually prefill from saved addresses.

### Reorder Foundation

Future support:

- Buy Again.
- Rebuild Cart.
- Repeat Previous Order.

### Loyalty Foundation

Reserve dashboard space and architecture for:

- Loyalty points.
- Rewards.
- Referrals.
- VIP tiers.

### Wishlist Foundation

Future support:

- Favorites.
- Saved products.
- Wishlist-to-cart flow.

### Customer Retention Audit Requirement

Before closing any account-related phase, evaluate:

- Checkout friction.
- Authentication friction.
- Saved address readiness.
- Reorder opportunities.
- Loyalty readiness.
- Wishlist readiness.
- Repeat purchase opportunities.

Document recommendations in PROJECT_HANDOFF.md.

### Required Verification

- Verify storefront header matches account pages.
- Verify cart count remains synchronized.
- Verify account dropdown does not disappear.
- Verify profile marketing preferences are editable.
- Verify checkout quick-auth works.
- Verify checkout progress survives authentication.
- Verify account overview remains compact.
- Verify Orders page remains the source of full history.
- Verify mobile account UX.
- Update PROJECT_HANDOFF.md with fixes, risks, and next recommendations.
## Customer Accounts / Retention / Conversion Optimization Requirement

When working on Better Auth, customer accounts, profile management, checkout identity, order history, loyalty, referrals, or saved customer information, the goal is not simply account functionality.

The goal is to improve:

- Repeat purchases
- Checkout conversion
- Customer retention
- Order visibility
- Account usability
- Future loyalty readiness

### Storefront Consistency

Customer account pages must feel like part of the storefront.

Requirements:

- Same SiteHeader.
- Same SiteFooter.
- Same cart state.
- Same search state.
- Same account state.
- Same navigation patterns.

Customers should never feel like they left the store.

### Account Dropdown Requirements

Requirements:

- No hover gaps.
- No accidental dismissal.
- Desktop and mobile friendly.
- Close only on outside click, escape, or menu selection.

Preferred menu:

- Account Overview
- Orders
- Profile
- Sign Out

Do not duplicate Checkout navigation.

### Welcome Back Experience

Dashboard should feel personalized.

Requirements:

- Welcome back, {firstName}
- Friendly account summary
- Personalized experience when possible

### Dashboard Quick Actions

Dashboard should include:

- Continue Shopping
- View Orders
- Edit Profile
- Future Buy Again action

Reduce navigation friction.

### Dashboard Metrics

Preferred customer metrics:

- Orders count
- Lifetime spend
- Loyalty placeholder
- Future last order date

Avoid low-value metrics.

### Better Empty States

When no orders exist:

- Provide storefront CTA.
- Encourage browsing.
- Keep dashboard visually balanced.

Example:

No orders yet

Shop Treats →

### Orders Experience

Requirements:

- Dashboard shows recent orders only.
- Full history belongs under Orders.
- Orders page must scale.

Future-ready support:

- Search
- Filtering
- Pagination
- Infinite scroll
- Buy Again

### Customer-Friendly Order References

Avoid exposing large raw internal identifiers.

Preferred formats:

- #1024
- DGE-1024

Admin may continue using internal identifiers.

### Order Timeline Foundation

Future-ready support:

- Order Placed
- Preparing
- Shipped
- Delivered

### Saved Address Foundation

Prepare architecture for:

- Multiple saved addresses
- Default shipping address
- Default billing address
- Checkout auto-prefill

### Reorder Foundation

Future support:

- Buy Again
- Rebuild Cart
- Repeat Previous Order

Architecture should preserve order-to-cart reconstruction.

### Checkout Authentication UX

Preferred behavior:

- Inline sign in
- Inline account creation
- Modal or drawer authentication
- Preserve checkout progress
- Preserve cart state
- Preserve promo state
- Preserve entered fields

Avoid redirecting users away from checkout when possible.

### Checkout Benefits Messaging

Guest customers should understand account benefits.

Examples:

- Track orders
- Faster checkout
- Saved addresses
- Future rewards

### Loyalty Foundation

Reserve future support for:

- Points
- Rewards
- Referrals
- VIP tiers

### Wishlist Foundation

Reserve future support for:

- Favorites
- Saved products
- Wishlist-to-cart flows

### Customer Retention Audit

For every customer account phase, evaluate:

- Checkout friction
- Authentication friction
- Saved address readiness
- Reorder opportunities
- Loyalty readiness
- Wishlist readiness
- Repeat purchase opportunities

Document recommendations in PROJECT_HANDOFF.md.

### Required Verification

- Verify storefront header matches account pages.
- Verify cart state remains synchronized.
- Verify dropdown hover/click behavior.
- Verify profile editing works.
- Verify marketing preferences persist.
- Verify checkout authentication flow.
- Verify checkout state survives authentication.
- Verify dashboard remains compact.
- Verify Orders page scales correctly.
- Verify mobile account UX.
- Update PROJECT_HANDOFF.md with findings and recommendations.
## Saved Address / Autofill / Repeat Purchase Requirement

When working on customer accounts, checkout identity, profile management, order history, or customer retention, the agent must treat saved addresses and checkout autofill as high-value account features, not distant placeholders.

Primary goal:
- Reduce repeat-customer checkout friction.
- Make customer accounts more useful after sign-up.
- Prepare the app for repeat purchases, Buy Again, future subscriptions, and future loyalty flows.

### Saved Address Implementation Requirement

Do not leave saved addresses as a placeholder indefinitely.

When customer account UX reaches stabilization, implement the foundation for:

- Multiple saved addresses.
- Default shipping address.
- Default billing address.
- Address nickname support.
- Checkout address auto-fill.
- Account address management.

Architecture requirements:

- CustomerProfile remains customer-owned source of truth for profile-level identity data.
- Saved addresses should be stored separately from orders.
- Orders must continue storing a historical snapshot of the address used at purchase time.
- Editing a saved address must not mutate historical order records.
- Guest checkout must remain available and must not require saved addresses.
- Do not expose another customer’s saved address data.

Future support:

- Buy Again.
- Subscription orders.
- Gift addresses.
- Multi-address households.
- Faster checkout for repeat customers.

### Checkout Autofill Requirement

When a signed-in customer has saved profile or address data, checkout should reduce repeated typing.

Checkout should eventually:

- Auto-populate safe contact fields.
- Auto-populate default shipping fields.
- Auto-populate default billing fields when supported.
- Allow selecting another saved address.
- Allow creating a new address during checkout.
- Preserve guest checkout behavior.
- Preserve manually entered checkout fields unless the customer chooses to overwrite them.

The experience should reduce checkout friction and improve conversion.

### Address Book UI Requirement

Customer account navigation should reserve future space for:

- Overview.
- Orders.
- Profile.
- Addresses.

Addresses should eventually become a first-class account area.

Address UI should support or prepare for:

- Address list.
- Add address.
- Edit address.
- Delete/deactivate address.
- Set default shipping.
- Set default billing.
- Clear empty states.
- Mobile-friendly forms.

### Repeat Purchase Optimization Requirement

Customer accounts should actively support repeat purchases.

Future-ready requirements:

- Buy Again actions.
- Rebuild Cart from previous order.
- Quick reorder flow.
- Recommended products placeholder.
- Order-to-cart reconstruction compatibility.

Architecture must preserve enough order item data to rebuild a cart safely from historical orders while respecting current product availability, price changes, variants, and inventory.

### Future Subscription Readiness

Do not implement subscriptions unless explicitly requested.

However, customer account, address, order, and reorder architecture should avoid blocking future subscription support.

Future subscription readiness should consider:

- Default shipping address.
- Default billing address.
- Customer profile ownership.
- Repeat order cadence.
- Subscription-safe order snapshots.
- Product/variant availability checks.

### Conversion Optimization Review Requirement

Whenever customer account or checkout-account work is performed, evaluate:

- Steps required to checkout.
- Login friction.
- Account creation friction.
- Address entry friction.
- Repeat purchase friction.
- Mobile usability.
- Whether signed-in customers are rewarded with a faster checkout experience.

Document findings and recommendations in `PROJECT_HANDOFF.md`.

### Required Verification

When saved address, autofill, or repeat-purchase code is touched:

- Verify guest checkout still works.
- Verify signed-in checkout still works.
- Verify saved profile/address data never overwrites manually entered checkout fields without customer intent.
- Verify account address pages/routes are protected.
- Verify customer cannot access another customer’s addresses.
- Verify historical order address snapshots remain unchanged after editing saved addresses.
- Verify mobile address/account forms remain usable.
- Run client build.
- Run server checks/tests if server files change.
- Run Prisma generate and migration checks if schema changes.
- Update `PROJECT_HANDOFF.md` with files changed, data flow, verification, and remaining risks.