# Development Data Routing

## Two-Site Staff Context And Isolated Previews (2026-10-27)

The protected staff site uses same-origin `/api/auth/data-target` through its
existing Vercel gateway. After gateway and persisted ACTIVE ADMIN checks, the
backend returns a read-only routing projection: configured public API origin,
direct/protected transport, development/production environment, coarse database
provider, connection probe and check time. Known Railway private/proxy host
suffixes identify Railway PostgreSQL without returning the database host, name,
username or connection URL. Unknown hosted providers remain Deployed database.
The legacy top-level target field is retained. Public production health remains
generic and does not probe the DB or expose these staff details.

Admin displays Staff website -> protected gateway -> backend -> database in its
existing shared context. Checks use no-store, expire after60seconds and can be
refreshed; returning to a visible stale tab rechecks. Errors, old target-only
responses and expired checks never claim Connected. This is connection/route
evidence, not schema parity or a runtime database-switch control.

A deliberately isolated local design fixture may report `PREVIEW` with
`databaseConnected:false`. The development strip then says Preview / No database,
not Railway and not a connection failure. Ordinary APIs cannot become verified
from a frontend mode hint. The private fixture is not shipped in production.

## Source Of Truth

The running backend chooses the database at startup. A Vite mode, browser URL, logged-in state, frontend label or choice of Chrome versus Safari does not select a database. Local and Railway customer/catalog/content records are independent; an account in one is not automatically copied to the other.

| Workflow | Client command | Server command | Request path |
| --- | --- | --- | --- |
| Fully local | `npm run dev:local` in client | `npm run dev:local` in server | Local browser -> local server -> local DB |
| Railway DB administration/testing | `npm run dev:local` in client | `npm run dev:railway` in server | Local browser -> local server -> Railway DB |
| Vercel storefront | Existing deployed build | Existing Railway service | Vercel browser -> Railway API -> Railway DB |

Frontend `npm run dev:railway` is a compatibility alias for `dev:local`. It cannot change the server's database. Normal `server/.env` stays local; `server/.env.railway.local` overrides are loaded only by the deliberate Railway DB server startup. Stop the current server before changing startup modes, then restart the client after changing Vite configuration. Refresh existing storefront tabs to load changed catalog data; storefront reads are not a realtime subscription.

The backend loader refuses a remote target in LOCAL mode and requires a remote DATABASE_URL override in RAILWAY_DB mode. A loopback tunnel cannot be distinguished from a local DB solely by hostname; independently verify any unusual tunnel configuration. No runtime database switch, customer/account copy, bearer-token fallback or startup seed is added.

## Visible Development Routing

`client/src/App.vue` lazily loads `DevelopmentRoutingPanel.vue` only for Vite development. It appears above every local route, including storefront, sign-in, checkout and admin. It shows frontend origin, configured API origin, Vite mode and the backend-confirmed target. Expand Routing details to see the connection probe, a non-secret server-instance reference and last check. Recheck is read-only. Visible tabs refresh this check every thirty seconds.

The panel calls existing `GET /api/health` through the same API helper as products/auth. Non-production health includes only startup target, successful/failed `SELECT 1` probe and an ephemeral instance reference. No connection URL, credentials, database host/name, user/session/token or environment content is exposed. Failed connection returns HTTP 503 without exception details. Production health stays generic and performs no diagnostic query; the panel is absent from production bundles.

Unknown, unreachable, older or deployed APIs remain DATA TARGET UNVERIFIED instead of assuming LOCAL from a frontend flag. Existing authenticated admin target badges remain available on deployed admin pages; the public site does not expose database diagnostics.

Files: `client/src/shared/api/development.api.js`, `client/src/shared/composables/useDevelopmentRouting.js`, `client/src/shared/components/DevelopmentRoutingPanel.vue`, `server/src/shared/services/developmentContext.service.js`, existing API helper and environment loader.

## Catalog Visibility

The main `shop` section means the complete eligible catalog. Saved productIds rank Featured sorting, not an exclusion list. Newly published products follow those selections; explicit price/alphabetical ordering and search/category/protein filters still apply. Extra collection sections retain selected-only curation, with empty selection meaning all eligible products. Public/editor rendering uses the same helper/status predicate.

Draft/archived records remain private. Ordinary coming-soon products remain in Next Drops, not the main collection; explicitly labelled upcoming test fixtures remain a deliberate exception. Permanent test-product purchase rejection is unchanged. Visibility is not proof that checkout is launch-certified.

The 2026-10-18 incident was a catalog/presentation race: public catalog returned the active product before a later published-content request applied an old eight-ID exclusion. It was not missing Railway data. No catalog record, publication or schema needed mutation.

## Customer Sessions

The investigated customer identity exists in local and Railway as active with a credential account. This does not certify matching passwords. Deployed logs showed accepted customer login, followed by profile 401. Installed Better Auth defaulted to Lax for customer cookies while admin already used production None/Secure. Shared `sessionCookies.js` now defines host-only HttpOnly/root-path cookies: local HTTP uses Lax, current deployed split-site requests use None with Secure. Exact CORS/trusted origins, persisted sessions, roles and ownership remain enforced; no Domain sharing or bearer fallback.

Client sign-in requires a confirmed session and user; older reads cannot replace a newer sign-in/sign-out result. Missing session gives a clear error and leaves bag/checkout data intact instead of redirecting into a protected-route loop. Standalone signup explains account-created/session-unconfirmed without encouraging another signup; the existing reviewed checkout retry remains unchanged.

None/Secure permits cross-site cookie use where the browser allows it; it does not bypass Safari or other third-party-cookie restrictions. An owned storefront domain and same-site API subdomain remains recommended. See [Better Auth cookie guidance](https://better-auth.com/docs/concepts/cookies) and [auth architecture](auth-roadmap.md). Sign-in/create-account visual redesign is a separate future phase.

## Environment Names

- Client: VITE_API_BASE_URL (API origin); VITE_API_URL (compatibility alias); VITE_ADMIN_DATA_TARGET (legacy public hint, not authoritative); VITE_STRIPE_PUBLISHABLE_KEY (existing public payment key).
- Server: DATABASE_URL (selected connection); DOGGY_SERVER_ENV_TARGET (startup target); DOGGY_SERVER_ENV_FILE (ignored override filename); NODE_ENV (production boundary); PORT (listener); FRONTEND_URL and CLIENT_URL (permitted origins); BETTER_AUTH_URL (auth origin); BETTER_AUTH_SECRET or ADMIN_SESSION_SECRET (existing server signing configuration).

Keep values in ignored env files/provider dashboards. No new variable, env example, migration or secret is required. No local env file is modified or deployed.
