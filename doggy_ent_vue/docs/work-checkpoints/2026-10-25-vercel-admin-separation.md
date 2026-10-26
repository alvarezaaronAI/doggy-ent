# 2026-10-25 Vercel Admin Separation

## Current Live Status

Public cutover verified at dpl_3utkzP53KrcUniy3ArN2KAvEMViA READY, exact mainaaa8923;
public artifact is storefront with zero admin modules. One final bounded source repair
is underway on fix/admin-gateway-origin (renamed only the unpublished local evidence
branch, preserving all notes). Reproduction confirms the proxy admitted an authenticated
cross-origin request from a shared-backend-trusted shop origin; add same-origin/Fetch
Metadata rejection before credential injection. This does not bypass Vercel or app
authorization, but the staff proxy should not be a cross-site deputy. No exploit or
credential leak was observed. New regression cases cover shop/sibling/null origins,
cross-site metadata, same-origin and existing CLI access. Review/test/publish this
small follow-up before final close-out; both existing gates remain enabled meanwhile.

Gateway ENFORCEMENT VERIFIED: Railway aa2c4aaa-ef13-42ad-96b8-b8fb1bfec31c SUCCESS,
exact reviewed mainaaa8923, ADMIN_GATEWAY_REQUIRED=true. Protected CLI proxy session
probe401 (not403), no credential/internal-header leak; actual signed-in browser reload
still reads9-product library with no error. Fifteen direct native/compat/legacy/admin
API family probes with forged origin, synthetic cookie and wrong gateway return403;
public products/campaigns/content/health retain200/exact public CORS. No DB mutation.
Production-only VITE_APP_SURFACE=storefront is now configured on existing public Vercel;
one exact-main public rebuild is starting. Verify its ID/status/manifest/oldadmin404
before claiming full cutover. Earlier flagfalse/owner-pending notes below are history.

Cutover now authorized to advance: owner completed Vercel MFA; actual app sign-in,
dashboard, protected9-product library (eight public plus existing draft), Website UI
read, sign-out, denied guarded return and successful re-login pass through the stable
new host. No product/content/provider mutation. Existing same admin identity/data target
and View store link remain. Next operation enables only Railway ADMIN_GATEWAY_REQUIRED
on the confirmed API, then verifies the resulting artifact/direct-versus-proxy boundary
before public storefront-only redeploy. Earlier staged paragraphs below are superseded
by this acceptance milestone; do not infer the flag deployed until verification follows.

- Safe staged release is deployed, not final cutover: mainaaa8923d9876c9782c4da4a63dc3235c28e1858e,
  public Vercel dpl_26gyF6N8Sa4MXF56dLP9LRNuQhhh READY (combined), protected admin
  dpl_G8vzxvYFGJAXqzcAEybmnZtk3G2c READY (admin-only), Railway
  4b08a19d-d9b1-41fa-814e-a16fc7116db3 SUCCESS. All three confirm the exact source SHA.
  Backend startup26migrations/no pending; four severity-error stderr entries classify
  as npm warning/Prisma notices/blank, no application failure. Public health/products8/
  content/campaigns200, anonymous account/profile401, exact public-origin CORS pass.
- Stable staff address: https://doggy-ent-admin.vercel.app/admin/login. All four
  current stable/team/deployment/commit aliases reject anonymous HTML and API probes
  with302toVercel (eight checks). Provider All Deployments protection remains enabled.
- Authenticated CLI GET /api/health200 and /api/auth/me401 JSON authenticatedfalse;
  actual protected /application-surface.json200 confirms admin133modules and no public
  route catalogue. Wire responses contain neither gateway material nor internal
  middleware override headers. No share link/protection bypass/Trusted Sources rule
  was created; CLI uses the existing authorized account. Earlier failed curl attempts
  forwarded the CLI's --non-interactive flag to curl; omitting that flag fixed probing,
  not a service/proxy failure. Full URL targeting uses --deployment plus path.
- New admin Git connection tracks main; root/build/protection verified. CLI linked
  only ignored admin/.vercel and automatically generated admin/.env.local for its
  short-lived OIDC token; chmod0600, ignored. Removed only CLI-generated redundant
  admin/.gitignore; no environment values or extra ignore churn committed.
- Owner handoff is pending: async question requests Vercel owner login then existing
  shop admin login at the new address, and dashboard confirmation. IAB tab6 is handed
  off on Vercel's sign-in page. Do not extract auth cookies/tokens, bypass protection,
  reuse chat passwords in shell arguments, or claim this browser step passed.
- IMPORTANT: ADMIN_GATEWAY_REQUIRED=false and shop stillcombined. Direct Railway
  /api/auth/me401 is expected while staged, not evidence of an enforced gateway.
  Existing public admin remains available intentionally until protected staff login/
  read/logout acceptance. Gateway and matching production-only material are staged;
  private recovery path is recorded below. Do not rotate/regenerate it on resume.
- Next after owner acceptance: inspect actual dashboard/session through new host;
  verify read/logout/relogin and protected media/editor navigation without mutations;
  enable only ADMIN_GATEWAY_REQUIRED=true on confirmed API service, deploy current
  reviewed backend artifact and verify proxy401/direct403 plus owner session access;
  switch only public Vercel production VITE_APP_SURFACE=storefront, redeploy exact
  reviewed main source and confirm zero admin modules/oldadmin404/publiccustomer flows.
  Recheck all admin aliases, no internal credential leak, exact artifacts/status and
  startup/preflight. Preserve cookies/identity/DB and existing origins. If acceptance
  is unavailable, keep this staged state and report remaining work plainly.
- Source PR45/release46 are merged. Current local feature branch holds only this
  additional checkpoint evidence unstaged. Publish final docs through checked
  integration-only evidence PR and fast-forward clean local main/dev-main against
  their upstreams; no production deployment solely for evidence. Do not repeat source
  PR/project creation or source release. No task-owned server/test process remains;
  owner3000/5173servers are untouched. No DB/provider transaction or account change.

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
