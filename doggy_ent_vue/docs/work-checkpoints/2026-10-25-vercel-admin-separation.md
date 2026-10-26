# 2026-10-25 Vercel Admin Separation

## Current Live Status

**Completed and verified on 2026-10-25, America/Los_Angeles.** Use the stable staff
address https://doggy-ent-admin.vercel.app/admin/login; shop remains
https://doggy-ent.vercel.app. No Cloudflare, purchased domain, paid protection add-on
or second database. All previous pending/staged milestones below are chronological.

| Target | Current source | Verified artifact |
| --- | --- | --- |
| Public Vercel doggy-ent | main30bc5bae4612285f2aa006e7ab28c0822ac62922 | dpl_BNVUafQpqto7aLUGMpkUM4xMqu3f READY |
| Protected Vercel doggy-ent-admin | Same main30bc5ba | dpl_9mCS3NBLFRAEa3PbHC58X2GJZ7Wi READY |
| Existing Railway API | Same main30bc5ba | 29dbd136-9856-4c61-9d09-cd5b6377c961 SUCCESS |
| Existing Railway Postgres | Unchanged service | a8fb0946-43d8-4c6f-93c7-ba14f5c879ae SUCCESS |

- Initial source PR45/release46 passed current-head Quality and guarded merges.
  Same-origin follow-up PR47/release48 passed Quality40248452936/40248638492,
  both Vercel checks, independent review and clean head/base/review guards.
  VERSION stays unreleased0.1.0; this is not payment/provider/legal launch acceptance.
- Admin Vercel project prj_pTwNfe2o74fTR4YEsSAhORhBCv8W in existing team tracks
  GitHub main, root doggy_ent_vue/admin, outside-root sources, Node22 and correct
  install/build/output. Vercel Authentication protects All Deployments. Twelve fresh
  anonymous probes across current stable/team/git-main/deployment and known historical
  aliases redirect HTML/API to Vercel. Historical artifacts were not rewritten/deleted.
- Railway ADMIN_GATEWAY_REQUIRED is enabled, dedicated material is server-only in
  both confirmed consumers, existing origins/DB/signing/provider keys are preserved.
  Stable admin origin was added via previously absent CLIENT_URL. Public Vercel
  production uses storefront selection; its real manifest reports zero admin modules.
  Admin manifest reports133admin modules and no public route catalogue.
- Actual browser acceptance: owner completes Vercel MFA; existing shop admin signs
  in, reads dashboard/catalog9 (eight public plus existing draft) and Website UI,
  signs out, is denied guarded re-entry and signs back in. Final same-origin login/
  logout/relogin after the new proxy deployment passes; identity, deployed routing,
  View store, catalog and editors remain. No business form save/upload/publish is done.
- Authenticated CLI confirms protected proxy health200, anonymous app session401,
  same-origin session401, foreign-origin write404, same-site metadata404 and admin
  manifest200. Responses contain no gateway value/internal override headers. Proxy
  forwards public WebP bytes through protected host. No share/bypass/Trusted Sources
  exception, account credential change or cookie extraction was used.
- Direct native/compatibility/legacy/admin API probes return403 without valid gateway
  material, including forged Origin, synthetic cookie and incorrect header. Fifteen
  families passed on activation; key families retested at final source. Protected
  gateway alone still requires an admin session; persisted ADMIN/ACTIVE rules remain.
- Public health/catalog8/content/campaigns200 and exact shop-origin CORS remain;
  anonymous customer profile401 and native get-session200/null are expected. Browser
  old shop /admin/login renders public404 without an admin form; customer sign-in
  remains Welcome back. Static SPA fallback still returns HTTP200 for client-side404,
  an existing documented limitation, not an exposed admin route.
- Protected canary verifies previews have no production gateway credential (503 for
  otherwise allowed API, 404 for foreign-origin write). Backend startup and repeated
  read-only preflight show26matching migrations, none pending. Final runtime has zero
  application-error patterns; npm warning/Prisma stderr notices are not crashes.
- Automated evidence: client354, server413, gateway6, helpers21 pass (794 unique tests).
  Combined/storefront/admin builds, actual Vercel runtime build, dependency audit0,
  scoped syntax/secret/Markdown/link/fence/whitespace checks and hosted Quality pass.
  Secret scans are scoped checks, not a whole-history or external compromise audit.
- No product/order/customer business-data or schema change, reseed, provider payment/
  email/shipment, extra database or account provisioning. Ordinary Better Auth session
  creation/revocation from the approved login tests is expected; do not claim zero DB
  writes literally. Existing unrelated incident/launch gates remain separate.
- Dedicated private recovery material remains at the0600path recorded below; never
  print/regenerate it on resume. Ignored admin/.env.local holds short-lived CLI OIDC,
  mode0600; admin/.vercel is ignored. Neither is in Git or the browser artifact.
- Residual/manual checks: real Safari/mobile devices, production image-save/large-file
  QA, future staff/team MFA policies and unrelated checkout/provider/legal launch
  acceptance. MFA was observed for the owner, not configured as a new team policy.
  Local normal3000/5173servers remain untouched; no task-owned process remains.
- Documentation-only close-out is on docs/admin-hosting-final-evidence from integration
  f60a147: publish these evidence documents to dev-main after checks, without another
  main deployment just for IDs. Fast-forward clean local main/dev-main to their own
  upstreams and retain task branches for recovery. No further implementation, migration
  or credential operation is needed for this request.

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

## Credential Staging Milestone

- Source commit e56e8a2c54b6090482cd614828255ed655fd0bdd is pushed on the scoped task
  branch; PR45 targets dev-main, current-head hosted Quality is running. No merge yet.
- Dedicated random gateway material generated once into private0600 recovery file
  outside Git: /Users/nazxylix/.codex/backups/doggy-ent/2026-10-25-admin-separation/gateway.secret.
  Its value was never emitted to chat/docs/Git. Do not regenerate on resume or reveal it.
- Matching ADMIN_GATEWAY_SECRET is confirmed as a Vercel production Secret only.
  ADMIN_API_ORIGIN is production config; public VITE_STOREFRONT_ORIGIN covers builds.
  No preview secret/backend access is configured. New project remains All Deployments
  protected. There is still no admin deployment or Git project connection.
- Railway setter confirmed only ADMIN_GATEWAY_SECRET, ADMIN_GATEWAY_REQUIRED=false
  and CLIENT_URL set on confirmed API service with skipDeploys=true. Existing
  FRONTEND_URL and all other keys/DB remain unchanged. No restart or gate activation.
  Production still runs the previous successful source; old admin access is retained.
- Continue: wait/review current-head Quality and PR status; merge task/release using
  expected-head guards after all checks, reverify26migration preflight, deploy protected
  new admin from exact released source, then real staff acceptance. Do not enable gate
  or public storefront-only selection before acceptance. Source builds/tests alone
  cannot certify platform/internal-header containment or Safari cookies.

## Source Release And Initial Deployment

- PR45 passed current-head Quality40221300548, both jobs/all steps and Vercel, with
  no reviews/threads/blockers; guarded merge produced dev-main641534907b7d286782c7a0c68e88762a7d22b5a9.
  Complete release diff47paths includes only this46-path task plus prior recovery
  evidence documentation. PR46 passed fresh current-head Quality40221488208/all steps,
  Vercel, clean base/head/review guards and fresh26migration/no-pending preflight.
- Guarded PR46 merge produced mainaaa8923d9876c9782c4da4a63dc3235c28e1858e.
  Existing public Vercel deployment dpl_26gyF6N8Sa4MXF56dLP9LRNuQhhh is READY at this
  exact SHA, still combined. Railway deployment4b08a19d-d9b1-41fa-814e-a16fc7116db3
  is building this same SHA; verify startup/status before acceptance. Gate remainsfalse.
- Connected only doggy-ent-admin to existing GitHub repository using explicit project
  and team; provider confirms productionBranchmain, correct admin root, outside-root
  sources and All Deployments protection. No provider permissions or protection bypass
  were broadened. New admin production deploy dpl_G8vzxvYFGJAXqzcAEybmnZtk3G2c targets
  exact released commit, generated address doggy-ent-admin-jykuzbpe3-alvarezaaronais-projects.vercel.app.
  Building/verification is not yet accepted access. Stable address remains
  doggy-ent-admin.vercel.app. Next: inspect build/status, anonymous all-alias protection,
  authenticated proxy response headers, real staff login/read/logout and API bypass
  checks before activation. Do not repeat deployment/project/credential creation.
- Local temporary5177/5178preview servers and test tabs are stopped/closed. Owner's
  normal3000/5173remain untouched. Evidence checkpoint is intentionally uncommitted
  pending final deployment acceptance; preserve it on resume and publish documentation
  through a separate checked integration PR, not another production deployment just
  to record IDs. Primary branches still need local fast-forward after final evidence.

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
