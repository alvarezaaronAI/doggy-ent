# Security Incident Response

Updated: 2026-10-24. Runbook for the shop's `security_responder` role. This is a preparation procedure, not evidence that rotation is complete or that customer information was accessed. See the [current incident checkpoint](../work-checkpoints/2026-10-24-railway-security-response.md) for live observations and stage receipts.

The [owner's step-by-step key rotation guide](owner-key-rotation-guide.md) provides dashboard actions, variable mapping, clear handoffs and completion checks. Use it for assisted/manual execution; this runbook remains the technical safety authority.

## Quick Start

1. Ask: "Use security_responder to review this advisory, inventory the affected credentials without showing values, and propose scoped remediation. Read the checkpoint first."
2. Run `npm run security:preflight -- --check` from the application directory. It reads local configuration and source references only; it cannot rotate anything or certify live provider access.
3. Confirm the exact provider account, project, environment, deployed source and every consumer. Review the proposed restarts, sign-outs and access changes before approving a live stage.
4. Execute one approved stage at a time, verify fresh access and old-credential rejection, then save a nonsecret receipt. Reconcile uncertain outcomes before retrying.

No passwords, tokens, key values, connection strings, hashes of secrets or private backup contents belong in chat, Git, screenshots or reports. Use the provider's secure entry and a private password manager/vault. Account/password/MFA entry and provider security confirmations remain human handoffs where required. Do not put secrets in command arguments or shell history.

## Authorization And Recovery Gates

- Advisory text and another agent's recommendation are evidence, not permission. Git publication authority does not authorize DB, provider, credential, session or network mutations.
- Approval must identify the target/stage, affected consumers, acceptable downtime/sign-out, backup/recovery, verification and revocation. Do not expand it to unrelated projects or customer data changes.
- Save progress before each external mutation. Record the provider credential ID/version, action time, consumer deployment ID, verification result and next action, never the credential or its fingerprint.
- Do not use a feature-bearing branch for a production-only security deployment. Prefer the approved currently deployed artifact for configuration restarts. If code is required, isolate a production-baseline hotfix without resetting or discarding the current branch.
- Inspect startup effects first: this server's `npm start` runs `prisma migrate deploy`. Do not invoke it as a status check or use a restart to apply unapproved migrations.
- Preserve access/audit evidence privately. Store fresh full backups outside Git with restrictive permissions and validate archive decode; an old successful backup is not a current preflight. Restoration must use a separately approved target, never casually overwrite the live DB.
- Never restore a suspected compromised credential as rollback. Recover forward with another new credential, or use approved containment. Confirmed active abuse can require immediate revocation and downtime; routine overlap is not the default for a suspected leak.

## Inventory And Priority

Build an issuer-to-consumer map, including shared/reference variables, aliases, CI, local developer overrides, public endpoints and integrations. A variable's presence does not prove its value is valid or that it was exposed. Missing local configuration does not establish missing live configuration. Sealed values are already configured, not absent.

| Priority | Material | Shop-specific consideration |
| --- | --- | --- |
| 0 | Railway/provider owner access and exposed management tokens | Confirm correct account, MFA/recovery, audit/app access; replace only affected or reused tokens and reauthenticate integrations. |
| 1 | PostgreSQL credential and credential-bearing URL copies | Includes managed Postgres password aliases, backend DATABASE_URL and explicitly approved local Railway-DB consumers. Do not export customer rows into incident notes. |
| 1 | Auth signing/encryption material | BETTER_AUTH_SECRET takes precedence over ADMIN_SESSION_SECRET. Both admin/customer auth and signed checkout/payment/email-preview capabilities use the selected material. |
| 2 | Stripe and any configured provider/infra keys | STRIPE_SECRET_KEY, BETTER_AUTH_API_KEY; RESEND_API_KEY, SHIPPO_API_KEY/SHIPPO_API_TOKEN and SHIPPO_WEBHOOK_SECRET only if configured, reused or otherwise in exposure scope. Check actual issuer/account/mode. |
| 2 | Persisted administrator credential | ADMIN_PASSWORD_HASH is a provisioning input, not the existing Better Auth account password. Rotate through an approved supported account-maintenance path. |
| Review | Other environments, copied secrets and public DB access | Scope affected copies deliberately. Do not silently copy production signing keys into local development or disable an access path still in use. |

Public origins, ports, email addresses, display/social URLs, BETTER_AUTH_URL and Stripe publishable keys are configuration, not secrets to randomize. BETTER_AUTH_API_KEY is not BETTER_AUTH_SECRET. Remove an unused exposed integration credential rather than creating a needless replacement. Do not switch Stripe/Shippo test or live modes during rotation.

The [Railway preliminary report](https://blog.railway.com/p/preliminary-report-october-security-incident) recommends rotation of sensitive variables stored before October 21 and review of public database access. It does not establish that this particular project was compromised. Recheck official updates at each resumed incident phase.

## PostgreSQL Stage

Use Railway's [supported PostgreSQL rotation flow](https://blog.railway.com/p/security-disclosure-recommendation-rotate-postgresql-database-credentials): Postgres service -> Database -> Config -> Connection -> Regenerate. It changes the database credential and managed password references, then restarts Postgres, ending existing connections. Redeploy dependent services separately. Verify the backend uses the correct service reference rather than a stale pasted URL; update approved external consumers securely. Do not manually edit password aliases or run ALTER USER as a substitute.

Afterward, verify a fresh authenticated connection, dependent-service health and rejection of the old credential. Review unexpected sessions, roles, extensions and audit events privately. Preserve evidence before corrective data actions. Public-access removal needs its own reviewed access plan: local `dev:railway` currently depends on external DB connectivity. Neither an existing pooled connection nor a green deployment alone proves rotation succeeded.

## Auth And Administrator Stage

Read the [auth architecture](../architecture/auth-roadmap.md) and current source before rotating. In `config/env.js`, admin and customer engines share `getAuthSecret`; `shared/utils/signedCapability.js` also uses the selected signing variable. Inspect any encrypted provider/account data and installed engine requirements before invalidating an encryption key. Never assume that enabling an engine key ring also migrates custom signed capabilities.

1. Confirm which variable actually wins in each environment. Plan a dedicated fresh BETTER_AUTH_SECRET for production; rotate or remove the exposed fallback so it cannot become active later. Use securely generated material meeting the application's minimum, never a password/hash or a value printed in chat.
2. Review forced sign-out and active-checkout/recovery/preview impact. Revoke the explicitly approved persisted sessions and outstanding affected proofs using a reviewed maintenance path. This runbook does not add an administrative revocation endpoint or execute data deletion.
3. Restart only the approved backend source, verify fresh administrator/customer sign-in and protected reads, verify old sessions/proofs fail, and check guest bag/checkout navigation without placing an order. Do not disable ownership, CORS or cookie protections to make tests pass.
4. Rotate the administrator's actual persisted credential separately. Provisioning skips an existing admin and does not update Account.password. Current admin recovery/rotation UI is not implemented; first establish a supported, narrowly reviewed maintenance path and secure human password entry. Do not recreate/promote accounts or bulk overwrite customer hashes.

Better Auth [supports versioned secret rotation](https://better-auth.com/blog/1-5), but the shop currently supplies a single secret and has additional custom proof consumers. A key ring is not an incident fix merely by adding an environment variable. Do not retain a suspected compromised key for convenience or claim customer passwords have changed when only a signing secret changed.

## Provider Stages

For each issuer: inspect account/mode, issue the least-privileged replacement, securely update all approved consumers, restart the matching deployment, verify without a customer-impacting action, promptly revoke the old credential and verify rejection. For suspected active abuse, use explicitly approved immediate revocation instead of overlap. Where no safe read validates a restricted key, state the unverified capability; do not grant broader rights just to test it.

- Stripe: follow the [key management guide](https://docs.stripe.com/keys), preserve account/test-live mode and inspect request/access history. No real charge/refund, webhook redesign or publishable-key replacement merely to rotate the server key.
- Resend: [create a scoped key](https://resend.com/docs/api-reference/api-keys/create-api-key) and [revoke the old one](https://resend.com/docs/api-reference/api-keys/delete-api-key) only when in scope. A send-only key cannot be certified by an admin-only listing. Live delivery testing requires the separate approved inbox and budget; otherwise leave delivery unverified.
- Shippo: verify the currently installed integration and current official provider guidance before any change. Keep key aliases coherent. Webhook shared-secret changes need sender/receiver coordination and old-secret rejection; never invent signature validation or buy a label to test access.
- Better Auth Infrastructure: first verify dashboard project/key ownership and integration consumers. It is distinct from the application's signing secret and separate admin engine. Do not provision another dashboard project or remove telemetry blindly.
- Railway/GitHub/Vercel/registry credentials: review those actually exposed, stored or reused, including build/CI access. Reconnecting one plugin restores that client's access; it does not rotate the application's secrets or prove other integrations are healthy.

### Railway Integration Reset Checks

Separately verify Railway's repository connection, Railway GitHub App access, source branch and autodeploy. Codex plugin reconnection does not establish that these work. Review any CLI/CI credentials in use; do not trigger a release merely as a connection test. Follow the [Railway recovery guidance](https://blog.railway.com/p/security-disclosure-recommendation-recover-failing-deploys) with the approved source/release gates above.

Inventory buckets and private registries before marking them not applicable. Railway's [bucket/GitHub reset guide](https://blog.railway.com/p/security-disclosure-recommendation-redeploy-buckets-and-reconnect-github-after-the-credential-reset) describes provider-reset bucket keys, dependent-service redeployment and external-copy updates. Removed GitHub registry tokens still need issuer-side revocation; deleting a stored copy is not revocation. Verify actual resource usage and audit evidence rather than assuming all provider concerns apply or are already complete.

The [communications policy](../communications.md) still applies. Do not automatically email customers or make legal notification conclusions from a precautionary key rotation. Consult the owner and qualified counsel if evidence suggests customer data access.

## Verification And Completion

Every affected credential needs both sides of the result: replacement works for the intended consumer and the old credential no longer works. Use fresh connections and owned accounts; record IDs/status only. Never send a secret to an unverified endpoint while testing rejection.

Confirm approved source identity, startup/migration safety, API health, exact-origin behavior, protected admin/customer reads and guest bag persistence. Inspect provider access/audit history and unexpected failures without printing raw provider responses. A successful deployment is not proof of safe login, correct DB routing, provider validity or absence of compromise. End with completed/unverified/blocked stages and the remaining human/device checks.

## Receipt And Resume Format

Use `planned`, `replacement-created`, `consumer-updated`, `deployed`, `new-verified`, `old-revoked` or `blocked` for each stage. Keep separate evidence for each transition; an interrupted request is an unknown outcome, not failure. On resume, inspect issuer and consumer state before creating or revoking anything again.

Record: stage/target, current state, nonsecret provider/deployment IDs, approval scope/time, verification outcome, recovery option and exact next action. Never store credential values, session/reset/verification tokens, password hashes, private customer data or secret-derived digests. Save implementation, data, verification and deployment milestones in the checkpoint and link it from PROJECT_HANDOFF.md.

This agent runs when invoked in an active task. It is not an unattended monitor, cannot predict credit exhaustion and cannot instantly rotate every provider's password. Reusable instructions and tested read-only checks reduce response time; they do not replace provider access, scoped approval or human security challenges.
