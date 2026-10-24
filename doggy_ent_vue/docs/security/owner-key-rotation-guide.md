# Shop Key Rotation Guide

Prepared: 2026-10-24. This guide gives the owner and Codex an execution order for the existing Railway shop. It does not record completed rotations. Keep progress in the [incident checkpoint](../work-checkpoints/2026-10-24-railway-security-response.md); technical safeguards are in the [response runbook](incident-response.md).

## Choose How To Work

Recommended: assisted rotation. Codex performs approved backup/preflight, reference/configuration work, deployment checks and verification. You control provider sign-in, password/MFA entry, key creation/revocation confirmations and secure pasting where required. Do not send credentials in chat or screenshots.

The connected Railway tools support variable updates, redeploying an identified existing build and removing a TCP proxy. They do not currently expose a supported Postgres password-regeneration action or manage your Stripe/Better Auth Infrastructure accounts. Those issuer steps need their dashboard or another separately authenticated supported path. Reading variable names is not access to their secret values.

Do one stage at a time. Stop when a screen, target or outcome differs from the plan. If there is evidence of ongoing unauthorized use, preserve the available evidence and prioritize immediate approved containment rather than waiting for a convenient maintenance window.

## Confirm The Target First

Open the [Railway dashboard](https://railway.com/dashboard), then select:

- Project: artistic-gentleness.
- Environment: production.
- Backend service: doggy-ent.
- Database service: Postgres.

Do not use the empty truthful-truth project. Check the project/environment again before every write. The live source last verified was main at 64ae486; Codex must recheck it before a restart. Do not upload the current fix/railway-security-rotation branch: it inherits unfinished customer-feature release work.

Make sure you can sign in to Railway, the correct Stripe account and the existing Better Auth Infrastructure project. Use unique provider account passwords and MFA where available. Keep fresh secrets in a private password manager; keep only action dates and nonsecret credential/deployment IDs in the incident record.

## What Each Variable Needs

| Item | Where its replacement comes from | What changes |
| --- | --- | --- |
| PostgreSQL password | Railway's Postgres regeneration action | Actual DB credential and managed password aliases. Do not invent a URL/password pair. |
| Backend DATABASE_URL | Reference to the confirmed Postgres service | Prefer `${{Postgres.DATABASE_URL}}`; do not put the public developer URL into the deployed backend by default. |
| Local Railway DATABASE_URL | New external connection details, kept privately | Update server/.env.railway.local only while external developer access remains approved. |
| BETTER_AUTH_SECRET | High-entropy random value generated privately | New dedicated production signing/encryption material; inspect encrypted-data consumers first. |
| ADMIN_SESSION_SECRET | Reviewed retirement or rotation | Currently production's active auth fallback. Do not leave an exposed fallback available. |
| STRIPE_SECRET_KEY | Existing Stripe account, same sandbox/live mode | Rotate the affected server credential and revoke the old one. |
| BETTER_AUTH_API_KEY | Existing Better Auth Infrastructure project | Rotate its provider-issued key; this is not the signing secret above. |
| Existing administrator password | Secure account-maintenance process | Persisted Better Auth credential and relevant sessions; changing ADMIN_PASSWORD_HASH alone does not do this. |
| Resend/Shippo/other tokens | Their issuing providers, if in exposure scope | Replace or revoke affected/reused copies; do not enable an unused integration. |

Keep FRONTEND_URL, BETTER_AUTH_URL, ports, public email addresses and social/display URLs unchanged unless they are independently wrong. Keep the current Stripe account and sandbox/live mode. A secret rotation is not a domain migration, a CORS repair or permission to start taking real payments.

## Stage 1 Backup And Recovery

**Codex can handle this after approval.**

Before a mutation, confirm the actual DB identity, migration state, deployed source/startup effects and all credential consumers. Take a fresh full private backup outside Git with restricted access and validate archive decode. Record its private location/time and restore limitations, not data or credentials. Do not restore it over the live database as a test.

Preserve relevant access/audit evidence. Record which services, local files and tools must be updated. The running local server may target Railway even though its URL is localhost; do not run fixtures or customer-data writes through it.

**Ready to continue:** usable recovery evidence, confirmed target/source and a written list of affected consumers. No reset, reseed, migration or provider send.

## Stage 2 Database Credential

**Owner dashboard action, with Codex coordinating the consumers and checks.**

1. After preflight, open Postgres -> Database -> Config -> Connection -> Regenerate. This is Railway's supported synchronized password change; it restarts Postgres and drops existing connections.
2. Redeploy dependent services. A pasted backend URL must be replaced securely or converted to the correct service reference. Update approved external consumers with the new external connection details.
3. Verify a fresh connection works and the old password is rejected. Do not hand-edit POSTGRES_PASSWORD/PGPASSWORD or substitute manual ALTER USER.

Source: [Railway PostgreSQL rotation](https://blog.railway.com/p/security-disclosure-recommendation-rotate-postgresql-database-credentials).

For this shop, Codex should preserve the approved backend build, check startup migration effects, and verify a DB-backed operation without changing customer/product data. Do not click Deploy Latest Commit indiscriminately. The frontend does not need a source release merely because the backend DB password changed.

When developer access remains enabled, privately update DATABASE_URL in the ignored server/.env.railway.local file and restart only the local server using that target. Never paste the URL here. Normal local DB configuration should not be overwritten with the Railway URL.

**Done when:** new backend and approved local connections work, old DB access fails, the intended build is active and no forgotten consumer still depends on the old credential. Keep the outage short, but never restore a suspected compromised password to recover service.

## Stage 3 Sign In Keys And Sessions

**Codex should coordinate this stage; it is not only a dashboard copy/paste task.**

1. Inspect encrypted auth/account data and all signing consumers before removing a key. Decide the exact session, recovery and preview-proof invalidation scope. Do not manually delete auth tables.
2. In your password manager, generate a new high-entropy random secret, at least 32 characters; 64 random ASCII characters is a practical choice. Save it privately as the production signing secret. Do not reuse your password, provisioning hash or another provider key. Better Auth's [installation guidance](https://better-auth.com/docs/installation) requires high-entropy secret material.
3. In Railway -> doggy-ent -> Variables, add BETTER_AUTH_SECRET with that new value through the secure editor. Retire the old ADMIN_SESSION_SECRET only after its consumers are accounted for, so it cannot silently become active again. Apply only the reviewed configuration changes and approved build.
4. Codex executes the approved session/outstanding-proof invalidation through a reviewed maintenance path, then checks fresh admin/customer login, protected reads and rejection of old sessions/proofs. Expect users to sign in again and active checkout/preview flows to restart. No customer password hash is overwritten by a signing-key rotation.
5. Review affected local signing keys separately; do not copy the production key into local development simply to make environments match. Update local copies only when that environment's own key needs replacing.

Current source passes one secret to both auth engines and to custom signed capabilities. Merely adding BETTER_AUTH_SECRETS does not implement a coordinated rotation for this app. If encrypted data depends on an old key, stop and plan recovery/migration before destroying access to it; retaining a compromised key as trusted material is not the final remedy.

**Done when:** the fresh key is active, exposed fallbacks are gone, approved sessions/proofs are invalidated and both owned-account and guest-navigation checks pass without a real purchase.

## Stage 4 Stripe

**Owner creates the provider replacement; Codex helps update approved consumers and verify.**

1. Open [Stripe API keys](https://dashboard.stripe.com/apikeys) in the existing account and current sandbox/live mode.
2. For the affected secret key, use the overflow menu -> Rotate key. Choose Now for immediate cutoff; this can interrupt payment access until the replacement is deployed. For an explicitly precautionary overlap, use the shortest approved window and finish revocation promptly.
3. Save the replacement privately. Put it in Railway's STRIPE_SECRET_KEY and any approved local copies, then deploy the reviewed configuration.
4. Confirm the replacement is used, expire any remaining old-key access, and review old-key requests and unexpected account activity. Do not place a real order or refund as a test.

Source: [Stripe key rotation](https://docs.stripe.com/keys#rolling-keys). Webhook secrets are separate: include them only if an actual configured endpoint/consumer needs rotation. Do not add a webhook implementation during this maintenance task or rotate the public key just to match a new secret key.

**Done when:** correct account/mode, new-key acceptance and old-key rejection/revocation are recorded; unexplained activity is investigated rather than hidden by a successful deployment.

## Stage 5 Better Auth Infrastructure

1. Sign in to the [existing Infrastructure dashboard](https://dash.better-auth.com). Select the project's current integration; do not create a second project as a workaround.
2. Open its key-management settings. Confirm the provider's actual replacement/revocation controls before acting; their exact UI has not been verified for your account.
3. Obtain the replacement securely, update BETTER_AUTH_API_KEY on Railway and each approved affected copy, then verify the intended project's integration and revoke the old key. If replacement/revocation is unclear, stop for provider guidance instead of guessing.

The [official setup guide](https://better-auth.com/docs/infrastructure/getting-started) identifies BETTER_AUTH_API_KEY as the Infrastructure key. It is separate from BETTER_AUTH_SECRET. Your separately configured admin engine does not have the same dashboard plugin, so a working customer dashboard is not proof that admin auth was tested.

**Done when:** the correct provider project accepts the replacement and the old provider credential no longer works.

## Stage 6 Administrator Password

Your administrator password is already stored in Better Auth. Provisioning skips an existing administrator, so updating ADMIN_PASSWORD_HASH or running provisioning again will not rotate it.

There is not yet an implemented admin password-change/recovery UI for this purpose. Codex can prepare a narrowly reviewed maintenance path using Better Auth-compatible hashing, secure human password entry, exact ADMIN/ACTIVE account checks, session revocation and verification. That work needs implementation/tests and scoped approval before touching the persisted credential. Do not change Account.password manually or recreate/promote accounts.

Choose a fresh unique password in your password manager, not in chat. After the persisted change is verified, retire/replace obsolete provisioning material through the reviewed process so an old bootstrap credential cannot be reused later. Customer password resets are a separate decision based on evidence; do not mass-reset customers automatically.

**Done when:** the new administrator password signs in, the old one fails, prior relevant sessions fail and role/status/ownership checks remain intact.

## Stage 7 Conditional Providers And Deployment Access

The last live name inventory did not contain Resend or Shippo credentials, while the local server configuration did. Review whether these values were stored on Railway, reused or otherwise exposed. Revoke an unused affected key instead of enabling a new live service.

- Resend: use its [API key management](https://resend.com/docs/dashboard/api-keys/introduction), issue only the necessary scope, securely update approved copies and delete the old key. No live email test without its own approved inbox/budget; a send-only key cannot be certified with an admin-only listing.
- Shippo: begin at the provider's API settings linked by its [authentication documentation](https://docs.goshippo.com/api-reference/overview#authentication). Confirm current issuance/revocation controls and preserve mode. Keep SHIPPO_API_KEY/SHIPPO_API_TOKEN aliases coherent. Coordinate any shared webhook secret with both sender and receiver. No label or shipment purchase.
- Railway/GitHub/CI: verify the repository connection, Railway GitHub App access, production source/autodeploy and any CLI/CI credentials actually in use. Codex's plugin connection is separate. Follow [Railway's deployment recovery guidance](https://blog.railway.com/p/security-disclosure-recommendation-recover-failing-deploys); do not push a release solely to test connectivity.
- Buckets/private registries: inventory actual usage. Follow the [Railway reset guide](https://blog.railway.com/p/security-disclosure-recommendation-redeploy-buckets-and-reconnect-github-after-the-credential-reset) for affected consumers and issuer-side revocation. No bucket/registry is assumed used or cleared by this guide.
- Vercel: do not randomize public VITE_API_BASE_URL or the Stripe publishable key. Replace Vercel/GitHub/other management tokens if actually exposed, stored in the affected environment or reused. A backend-only rotation does not by itself require publishing frontend source.

## Stage 8 Remove Unneeded Public DB Access

One ACTIVE Postgres TCP proxy was configured at the last read-only check. Before removal, confirm the backend works through the private service connection and stop relying on public local-to-Railway DB access. Use a local development DB or a separately reviewed controlled access arrangement. The existing local dev:railway mode will not work through a removed public endpoint.

Only then, after approval, open Postgres -> Settings -> Networking and remove the database's public TCP proxy. Do not remove the doggy-ent web/API domain. Codex can remove the identified database proxy and verify the resulting configuration, but must not do so before the consumer/access check.

Railway documents [TCP proxies](https://docs.railway.com/networking/tcp-proxy) as public endpoints for database protocols. Endpoint removal does not replace password rotation; complete both applicable protections.

**Done when:** the deployed backend still reaches Postgres privately, the public proxy is absent, old external access fails and the owner understands the new development workflow.

## Final Checklist

- Fresh backup/recovery evidence exists outside Git.
- Every affected credential has an issuer/consumer record, replacement acceptance and old-credential revocation/rejection.
- No exposed fallback or forgotten local/CI copy remains in service.
- Approved sessions/proofs and the actual administrator credential have been handled independently.
- Public DB access is removed or has an explicitly documented temporary exception and next action.
- Owned admin/customer sign-in, guest bag, protected data reads and relevant provider access work; no real payment/email/label was used as a test.
- Railway, GitHub, DB and affected-provider audit activity is reviewed privately. Preserve suspicious evidence and investigate; rotation does not prove that past data access never happened.
- Incident ledger says exactly which stages are complete, blocked or unverified. Resume from it instead of creating replacement keys again after an interrupted request.

## Suggested First Approval

For assisted execution, authorize only Stage 1 and Stage 2 first: fresh private backup/preflight for artistic-gentleness production Postgres; supported password regeneration with required human confirmation; secure updates to confirmed DB consumers; redeployment of the reviewed existing doggy-ent build; and fresh/old-credential checks. Accept a brief database/backend interruption. No migration, reset, new source release, auth/session changes, network removal, provider send or payment is included.

Approve the auth, provider, administrator and network stages separately once their consumer and recovery gates are clear. This avoids bundling an unknown password or encryption migration into a general permission to rotate keys.
