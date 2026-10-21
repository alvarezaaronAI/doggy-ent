# Data Routing And Customer Session Repair

## Verified Findings

- New clean owner commit `8ebac7e` contains the prior UI integration. Git status/stat/name-status were clean before this pass; preserve that work. The owner subsequently deployed main: Railway `10b295a0-73c4-4efd-9ac8-d8ac30a3002b`, Vercel `dpl_3UzKU825vpZeTuvLoTTZAbtMtLUN`. The earlier staged frontend `dpl_D5qTwStakzBPfL4YLQkfwNX8sjdK` is superseded and must not be promoted over it.
- Duck Le Queze exists only in Railway, ACTIVE, non-fixture, inventory-limited, two active sizes with stock. Local server 3000, task preview 3101 and deployed Railway public products all return it. It is excluded by the published homepage's eight selected product IDs at revision 5. The catalog request and separate later presentation request explain its appearance followed by disappearance.
- Normal local DB has separate content at revision 10. The requested customer exists in both local/Railway as CUSTOMER/ACTIVE with a credential account. Presence does not establish password equality, and no credentials were read, changed or printed.
- Railway request evidence: customer login preflight 204, POST sign-in 200, GET session 200, protected profile 401. Admin sign-in/session 200 occurs separately. A get-session 200 may contain null; it is not proof of authentication. Customer configuration omitted advanced cookie attributes, leaving installed Better Auth's SameSite=Lax, unlike admin's production None/Secure. This is incompatible with the current cross-site Vercel -> Railway browser flow; Safari/other browser third-party cookie restrictions remain an additional limitation.
- Client signIn returned a null session without error and the page redirected into a protected route, creating a confusing sign-in loop. Older concurrent session reads could also replace newer state.
- Frontend dev:railway never changed the backend DB; both existing client startup scripts pointed at local port 3000. Only the server startup selects local versus Railway DB. Two local Vite/API pairs were running: user 5173/3000 and prior task preview 5174/3101. No user process/env file has been changed or stopped.

## Focused Repairs Complete Locally

1. Main shop includes all eligible published products; selected IDs define Featured ordering. Additional collection sections retain explicit curation. Shared status guards/search/sort and test purchase rejection remain.
2. Shared customer/admin cookie policy: production None/Secure/HttpOnly/path root, local Lax/HttpOnly, no Domain sharing. Trusted-origin/role/session/ownership protection unchanged. No bearer fallback or auth rebuild.
3. Confirm customer session after sign-in, discard stale session reads, and explain created-account/session failure without redirecting or encouraging duplicate signup.
4. Development-only global routing panel reads actual backend health, selected target, connection probe and non-secret API instance. Shows frontend/API origins and Vite mode; unknown/unreachable/old/deployed responses stay unverified. No runtime target switch. Production health remains generic, and the panel is eliminated from production build.
5. Frontend dev:railway becomes a compatibility alias for dev:local, not a misleading claim that it selects Railway DB. Server startup remains authoritative.

## Verification

- Both builds exit 0. Client Vite 8.3.4 transforms 2,306 modules; server generates Prisma Client 6.16.2. No schema/migration/dependency change.
- Full client suites pass 158 tests/31 files (11/141/6). Server suites pass 143 tests/35 files (28/109/6). Thirteen client and four server cases were added, without changing existing purchase/security expectations.
- Server syntax passes 176 JS files. Fourteen canonical generated copies match. Production JS scan: 44 assets, no development panel/component/API strings. The first broad probe matched the pre-existing admin CHECKING DATA TARGET label; specific new-component probes correctly confirm production elimination.
- Real isolated HTTP smoke for each server mode: LOCAL and RAILWAY_DB both health 200/connection confirmed/correct target/catalog 200; Duck absent in local and present in Railway. Ephemeral servers close after reads. No writes/providers.
- Actual local browser 5173 -> 3000: expanded routing panel reports RAILWAY DB TARGET and instance reference. Nine shop products include Duck after presentation finishes. Quick View displays actual 6 oz and 18 oz at stored $20.00 each/in stock; bag remains one existing item, no add/payment. Zero failed images, desktop overflow or captured error entries. Saved screenshot: task artifact `data-routing-panel-local.jpg`.
- Current local and deployed customer login CORS preflights both 204 with exact expected origin and credentials support. Provider logs show accepted login before protected-profile failure, not CORS rejection.
- Real engine tests use memory storage, no Infra/DB/email calls. Production cookie attributes are None/Secure/HttpOnly/no Domain and retained origin rejection. A first origin test returned duplicate-email 422 because the engine deliberately skips origin checks in NODE_ENV=test; the test now explicitly enables its ordinary production origin checks and passes. No application security check was weakened.
- No env/example file changed or created. Bounded changed-file secret scan and whitespace pass; final documentation checks/results are recorded below. Neither package has a lint script; none added.

## Files And Responsibilities

Application files: client package scripts/App, `useAccountAuth.js`, standalone `AccountCreateView.vue`, `AdminWebsiteFields.vue`, `ProductCollectionSection.vue`; new `collectionProducts.js`, shared development API/composable/panel. Server: existing app health, customer/admin auth services; new `sessionCookies.js` and `developmentContext.service.js`. Tests: new client customer-session/collection/development-routing files, new server development-context file and expanded existing customer-auth-security test. Documentation: handoff/current and previous deployment checkpoints, customer/admin/QA guides and architecture routing/auth/data-flow/file-map/index. No catalog record, publication, password or auth identity is edited.

## Operational State And Next Steps

Stopped only old task-owned preview PIDs 16587/29746 (ports 5174/3101). User Vite 5173 and watched server 3000 remain; the watcher automatically reloaded current source and reports Railway DB. A client restart will pick up the renamed compatibility alias/admin-local mode; an old running process can still display Vite mode railway, which is intentionally not the database authority.

For Railway DB work: server `npm run dev:railway`, client `npm run dev:local`. For fully local: both `npm run dev:local`. Stop an existing server before changing its mode. Never modify normal server/.env to achieve Railway routing; keep server/.env.railway.local ignored. See [routing architecture](../architecture/development-data-routing.md).

This repair is local, not deployed. The old staged release is not suitable to publish over the newer owner Git release. No live cookie-storage inspection or fresh real-account login was performed by this repair; the user was asked to try the local form. Credential existence is verified, not password equality. Cookie configuration is a confirmed defect consistent with logged symptoms; fresh Chrome/Safari login, profile, logout and reload after matching rollout remain required. Safari/third-party-cookie restrictions still need same-site owned-domain/API deployment. No bearer fallback.

Next: accept local sign-in and routing; review the focused source; deliberately deploy the matching server/client repair with a fresh migration preflight (startup migrates). Do not promote the superseded frontend. Keep auth visual redesign separate. No DB/schema/env write, provider send, payment, password reset, new account, migration, commit or push occurred. Changes are suitable for focused commit review after final checks, not launch certification.

## Final Closeout

| Command/check | Exact final result |
| --- | --- |
| Initial git status/stat/name-status | Exit 0, clean owner commit before focused edits. |
| Client npm run build / npm test | Both exit 0; 2,306 Vite modules; 158 tests/31 files. |
| Server npm run build / npm test | Both exit 0; Prisma 6.16.2 generation; 143 tests/35 files. |
| node --check over server src/scripts/tests | 176 files, zero failures. |
| Canonical snapshot comparison | 14 comparisons, zero mismatches. |
| Read-only routing audit and ephemeral health smoke | LOCAL and RAILWAY_DB correct; both health/catalog 200; no application writes. |
| Production JS diagnostics scan | 44 assets, zero new development panel strings. |
| Markdown link/fence check | 11 changed Markdown files, 260 balanced fence lines, 171 existing local links, zero errors. |
| Bounded secret/env check | 31 changed files scanned, zero pattern findings; no changed env or .env.example. Not exhaustive security certification. |
| git diff --check | Exit 0. |

Final review inventory: 31 files (19 modified, 12 new), including 11 documentation files. The real local routing screenshot is retained; product popup is closed and existing one-item bag was not edited. The new local verification tab is a deliverable; original user tabs/processes were not closed. No deployment/build/test/QA command remains running; only the user's original dev services remain. Fresh customer form submission is still unverified pending owner acceptance, not silently marked successful.

## Owner Sign-In Acceptance Follow-Up

The owner completed the local customer form. Read-only browser inspection confirms `/account`, the real account workspace and Sign out control, with no sign-in form. A full page reload remains on the protected `/account` workspace and retains Sign out; no captured browser error entries. The routing panel confirms local client 5173 -> local API 3000 -> RAILWAY_DB with a successful connection probe. This supersedes the pending local-form acceptance above. No credentials, cookies, tokens or customer contact/order data were read or recorded by this browser verification.

Only the handoff, this checkpoint and QA evidence were updated in the follow-up; no application change/build was needed. No logout, account/profile/cart mutation, database/schema/env/password change, provider action, deployment, commit or push. The user's login naturally creates its ordinary auth session. The account tab remains available. Production Chrome/Safari login/persistence/logout and other device acceptance remain pending after a matching backend/frontend rollout; local success does not certify split-site production cookies.
