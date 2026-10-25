# 2026-10-25 Vercel Admin Separation

## Current Owner Direction

- Supersedes the original Cloudflare plan below: owner explicitly changes to Vercel-only frontend hosting with a separate admin address and confirms creation of doggy-ent-admin in the existing team, Vercel Authentication on ALL URLs and server-only Vercel/Railway gateway credential after tests. No domain purchase or Cloudflare setup. Same Railway API/database. No paid protection add-on, data mutation, migration, provider send/payment or account/password change.
- Source preparation complete so far: shared router factory, public/admin catalogues, combined compatibility default, build-time Vite aliases, safe View store origin, standalone admin404/noindex and module-boundary artifact checks. Local builds pass: storefront2,209 modules/zero admin UI modules; admin2,253 modules/no public route catalogue; combined2,350 modules. Full client suites pass348 (11/331/6), including34 new boundary/guard/config cases. Initial scoped client review finds no blocker. No commit/push/deployment/live configuration change yet. Existing normal servers are preserved.
- Approved next: create protected empty Vercel admin project, add Vercel-only server runtime API gateway and optional backend gateway gate; keep default/live combined until new protected admin login works. API forwarding must be server-only/secret-bound, preserve Better Auth role/status and protect direct Railway/legacy admin entrypoints; no auth based only on Origin/CORS. Vercel Authentication All Deployments is documented as available on all plans with no paid add-on. No bypass secret/share-link exception will be created.
- Read-only provider check: existing team team_LZJto7TjluMwTBxGdbpkBl4j, storefront project prj_Ovdg6sfCJ4b4oPMKnWdyUO6VCQYW (doggy-ent), current standard protection excludes production domains, only one matching project. No admin project existed at inspection. Actual new project identity/protection and source/deployment evidence must be recorded before cutover. Team API did not expose billing plan; do not invent it.
- Security responder owns ONLY optional server gate/config/tests; main owns client, admin Vercel workspace/middleware, documentation, Git and providers. New gate defaults off until tested deploy/credential stages. No secret value belongs in this checkpoint.

## Implementation Milestone

- Created only the approved empty admin project prj_pTwNfe2o74fTR4YEsSAhORhBCv8W
  in team_LZJto7TjluMwTBxGdbpkBl4j; re-read/configuration confirms Vercel Authentication
  deploymentType all. Root doggy_ent_vue/admin, Node22, outside-root source enabled,
  admin/client install, admin/dist output. No Git connection/deployment yet. Existing
  storefront/provider settings remain unchanged. No secret has been staged yet.
- Admin-only Vercel workspace now uses official rewrite Routing Middleware, fixed
  operator-configured HTTPS backend, reviewed API method/path allowlist, app-only
  session cookies and necessary headers; incoming spoofed gateway/forwarding/team
  cookies are dropped. Credential is server-only. Admin browser transport is relative
  /api regardless of inherited public API config. API errors fail closed/no-store.
- Standalone accepted8MB image originals above3MB are WebP-optimized before transfer
  to fit Vercel's smaller body limit, using existing2400edge/20Mpixel bounds. Combined
  local/small-image paths retain original transport. Server remains authoritative.
- Latest full client354 (11/337/6), combined2351modules, storefront2211modules pass;
  admin workspace build2254modules passes. Public artifact contains zero admin UI
  modules; admin omits public route catalogue. Admin runtime5tests pass. Fresh package
  audit found a transitive Zod advisory; scoped4.6.7override yields audit0. Re-run
  affected tests/build after final refinements before publication.
- Server worker reports full413tests (28/379/6), build/generate and20new synthetic
  gateway cases pass. Source adds strict default-off config and header gate before
  native/compat/session auth; existing ADMIN/ACTIVE/session revocation is preserved.
  [Server receipt](../../server/ADMIN_GATEWAY_CHECKPOINT.md) records exact scope.
- Read-only Railway preflight confirms26complete matching migrations, none pending.
  No DB mutation/migration/session revocation/provider send/key update/Git publication.
- Independent combined boundary review is running. Main next: finish docs/scoped
  checks, local browser/transport smoke, private matching gateway staging, managed
  source publication and protected admin deployment. Verify real staff access before
  enabling backend gate or switching public build. Preserve owner3000/5173servers.

## Prepublication Verification

- Main reran server413tests/build and21Git/security helpers: pass. Independent source
  review reports no remaining blocker after public promo-validation proxy support was
  added. No shared-data/provider writes were used by tests. Client354/runtime5 remain
  passing; admin audit0. All build surface manifests are checked, not auth claims.
- Actual local browser verifies standalone admin login, guarded products return path,
  customer paths use admin404; storefront /admin/login uses public404 and shop/account
  shell remains. No business edit, login, session mutation, email or payment performed.
- CLI confirms existing team is Hobby and the admin project root/build settings. API
  confirms stable default domain doggy-ent-admin.vercel.app verified and All Deployments
  protection. Existing Railway API/DB deployments remain previous successful artifacts,
  no staged changes, no gateway variables. Existing FRONTEND_URL is preserved; CLIENT_URL
  was absent, so adding only the new exact admin origin there will retain old origins.
- Fresh Git fetch confirms both main and dev-main match their own upstreams; current
  scoped branch is unpublished and only task-owned edits are present. Scoped secret,
  Markdown/link/fence and whitespace checks precede staging. Full provider/browser
  cutover evidence, real-device Safari and MFA settings are not claimed.

## Earlier Preparation History

## Scope And Baseline

- Owner approves preparing Cloudflare + Vercel separation now, but explicitly has no domain and is not buying one yet. This is preparation, not a live cutover or permission to create paid resources, change DNS/provider permissions, revoke sessions, mutate a DB or replace current hosting.
- Fresh fetch confirms clean feat/separate-admin-application from synchronized dev-main a6bd8bd5f3b91ba93c33743167cd7c462d48055f. main4930ee4 remains the previously verified recovery release. Main/integration differ only by final evidence docs. No current source changes or target migrations.
- Current combined Vue application serves public and /admin routes. Better Auth admin session/role/status checks remain server-side. One Railway API/database is retained. No new database, password/auth engine or public admin signup.

## Plan And Boundaries

1. Split route catalogues behind shared unchanged router guards. Add explicit storefront/admin build targets and retain combined as the default while current live access must work.
2. Assert storefront artifacts contain no admin UI modules; admin artifacts omit customer-facing route catalogue and receive noindex. Build-time surface is not an authorization boundary.
3. Prepare Vercel project settings, public-origin validation and local smoke checks without changing live provider configuration. Preserve normal localhost3000/5173 servers/session.
4. Write Cloudflare domain/identity/MFA/origin/API protection and rollback gates. Domain/DNS, Access policy/audience and staff allowlist remain unset. No live protection claim until default Vercel aliases and direct Railway admin endpoints cannot bypass the gate.
5. Run relevant build/tests/browser/source-secret/docs checks; update this checkpoint at milestones. Do not publish/cut over merely because two builds compile. This phase remains scoped preparation until the owner has a domain and protected access is verified.

## Earlier Status And Resume

- Implementation has not started at this checkpoint. Next: client configuration and route split, then artifact/guard/browser tests and setup guide. No task-owned process, shared write, migration, provider send, key/DNS change, source commit/push or deployment.
- Official research: [Cloudflare pricing](https://www.cloudflare.com/plans/) lists Zero Trust Free with a50-user limit (staff seats, not shop customers). [Registrar](https://www.cloudflare.com/domains/) registration/renewal is separate; no purchase is made. [Public-hostname requirements](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/) require an active Cloudflare zone and origin token validation; [JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/) is a future activation requirement, not provided by hiding a URL or CORS. [Vite aliases](https://vite.dev/config/shared-options.html#resolve-alias) provide build-time entry selection; no runtime switch is planned.
