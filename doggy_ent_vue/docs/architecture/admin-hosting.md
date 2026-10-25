# Separate Vercel Admin

## Design

One repository and Railway API/database serve two independently built frontends:

| Surface | Vercel project | Build root | API transport |
| --- | --- | --- | --- |
| Customer shop | doggy-ent | doggy_ent_vue/client | Existing configured Railway origin |
| Staff workspace | doggy-ent-admin | doggy_ent_vue/admin | Same-origin /api through server-only Routing Middleware |

The owner chose Vercel-only hosting on 2026-10-25. No Cloudflare setup, domain purchase,
second database or paid password-protection add-on is required for this configuration.
Actual activation/source/deployment evidence is in the
[checkpoint](../work-checkpoints/2026-10-25-vercel-admin-separation.md).

## Trust Boundary

1. Vercel Authentication must protect **All Deployments** of the admin project,
   including production and generated/default URLs. Standard Protection that excludes
   production is insufficient. No bypass secret/share/OPTIONS exception is created.
2. Staff must also sign in to the existing Better Auth application. A Vercel session
   is not an application admin role. Persisted ADMIN/ACTIVE and revocation checks remain.
3. The admin proxy allowlists reviewed API families/methods, rewrites only to its
   configured HTTPS API origin and injects dedicated server-only gateway material.
   Incoming spoofed gateway/forwarding/authorization headers and Vercel cookies are
   not relayed. Only doggy-admin session cookies and necessary request headers pass.
   The proxy does not consume/rebuild bodies, binary images or Set-Cookie responses.
4. With ADMIN_GATEWAY_REQUIRED enabled, Railway rejects missing/wrong material before
   session lookup on native/compatibility admin auth and every requireAdminAuth route,
   including legacy product/promo/campaign aliases. Gateway-only access is not admin.
5. The storefront artifact contains no admin UI modules. Noindex and build isolation
   are **not** authorization. Historical immutable shop deployments may still contain
   old UI, but cannot bypass the active API gate.

Customers still use authorized account, checkout and order APIs; no browser has direct
database credentials. Vercel account MFA is recommended, not proven by deployment
protection. No account security settings are changed here.

## Configuration Names

Never expose the gateway credential in VITE variables, static rewrites, JSON, logs or Git.

| Target | Variable | Purpose |
| --- | --- | --- |
| Admin Vercel production | ADMIN_GATEWAY_SECRET | Secret, dedicated Vercel-to-Railway gate material |
| Admin Vercel production | ADMIN_API_ORIGIN | Config, exact HTTPS API origin without path/credentials/query |
| Admin Vercel build | VITE_STOREFRONT_ORIGIN | Config, public shop origin for View store |
| Shop Vercel build | VITE_APP_SURFACE | Config, storefront only after cutover acceptance |
| Railway API | ADMIN_GATEWAY_SECRET | Same private material, no signing-key alias/fallback |
| Railway API | ADMIN_GATEWAY_REQUIRED | Literal true/false; unset defaults false for staged compatibility |
| Railway API | FRONTEND_URL / CLIENT_URL | Existing exact trusted origins plus stable protected admin origin |

Admin always uses relative /api, even with an inherited VITE_API_BASE_URL. Customer
transport is unchanged. Preserve the first public frontend origin for customer email
return links. Do not add wildcard preview origins. Admin previews have no production
gateway secret: they remain protected and their unconfigured API fails closed. An
authorized isolated test backend/credential is needed before connecting preview edits.

## Builds And Uploads

Shared client catalogues are combined, storefront and admin. Combined remains the
default until explicit provider cutover. Artifact manifests identify the surface and
module boundary, not access protection. Existing local development stays combined.
Client dev:admin/dev:storefront use the local server selected at startup. Builds
build:admin/build:storefront emit isolated artifacts; admin builds require
VITE_STOREFRONT_ORIGIN. No environment file template is created.

In admin, npm ci and npm test verify the proxy; npm run build invokes the shared client
and emits admin/dist. Vercel installs both admin/client and requires outside-root
source access. Node 22 and official @vercel/functions rewrite are used. A scoped Zod
override repairs its CLI-config transitive advisory; review a fresh audit before removal.

Vercel's request-body limit is lower than the existing 8 MB image input limit.
Standalone admin optimizes originals above 3 MB to WebP using the existing 2,400-pixel
edge and 20-million-pixel input budget. Failed optimization has an actionable error.
Smaller originals and combined local uploads are unchanged. Server raster validation
and normalization remain authoritative.

## Ordered Cutover

1. Confirm exact targets, branch, origin consumers, all-URL protection and fresh
   read-only migration preflight. Server start runs migrate deploy; unexpected pending
   migrations block rollout. No migration is introduced by this task.
2. Finish tests/review and managed publication. Deploy backend with gate off first;
   keep shop admin available while replacement access is unverified.
3. Privately stage dedicated material in both confirmed consumers. Deploy reviewed
   admin source to the already-protected project. Verify anonymous platform rejection
   and real staff login/read/logout through the proxy.
4. Only after replacement access passes, enable Railway's gate and rebuild the shop
   with storefront selection. Staff may need sign-in again on the new host; never
   copy sessions between domains.
5. Verify direct native/compatibility/admin/legacy API bypass denial even with an admin
   session; gateway-only requests still require that session. Verify public products,
   content, campaigns and customer/guest APIs are unaffected. Check private images,
   absence of credentials in artifacts/responses and protection on all current admin
   URLs. Actual Safari cookies are separate device evidence, not inferred from CI.

## Recovery

Never disable Vercel protection to debug. Use approved authenticated tooling or the
owner's secure sign-in. Record source/deployment IDs, config names and results, never
credentials. Before cutover, retain old access on failure. Afterwards prefer a protected
known-good admin artifact and forward repair. Turning the backend flag off deliberately
reopens direct admin access and needs an operator decision; it is not secure rollback.
Rotate dedicated gateway material across both consumers together and verify old material
fails. Do not repurpose existing DB/provider/auth signing keys. New API tools require
allowlist/test updates. Provider sends remain explicit admin actions.

References: [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication),
[protection levels](https://vercel.com/docs/deployment-protection),
[Routing Middleware](https://vercel.com/docs/routing-middleware),
[rewrite API](https://vercel.com/docs/routing-middleware/js-reference).
