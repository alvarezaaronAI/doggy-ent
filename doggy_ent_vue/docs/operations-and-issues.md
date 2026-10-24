# Operations And Issues

Use this guide for order issue workflows, customer support cases, internal issue capture, safe error handling, audit trails, and operations tooling.

Connected Pets follow-up (2026-10-23) adds generic PET_ARCHIVED/PET_RESTORED/PET_PHOTO_CHANGED/PET_PHOTO_REMOVED events to existing transactional add/edit/remove facts. Metadata retains field names, dates, profile identity/tenure only, not image or declared profile values. Archive retains details and counts toward ten; privacy removal deletes profile/photo without deleting limited account history. New pet IDs or profile churn alone are not proof of fraud. No customer block, active reward, provider send or new admin history UI. See [rollout/evidence](work-checkpoints/2026-10-23-connected-photo-led-pets.md).

## Architecture Rules

- Audit existing Prisma models first.
- Extend existing support/account/error models when appropriate.
- Do not create duplicate sources of truth.
- Use route -> controller -> service -> repository -> Prisma.
- Add migrations safely.
- Add indexes and uniqueness constraints where useful.
- Do not automatically apply Railway migrations.
- Keep customer-visible and internal-only content separate.
- Enforce customer ownership.
- Enforce admin authorization.
- Generate friendly case numbers safely.
- Avoid predictable authorization based solely on public case numbers.

## OrderIssue Model Direction

Suggested fields:

- `id`
- `caseNumber`
- `orderId`
- `userId`
- `category`
- `priority`
- `status`
- `summary`
- `customerDescription`
- `resolutionSummary`
- `createdAt`
- `updatedAt`
- `resolvedAt`
- `closedAt`

## OrderIssueMessage Model Direction

Suggested fields:

- `id`
- `orderIssueId`
- `authorType`
- `authorUserId`
- `body`
- `visibility`
- `emailRequested`
- `emailDeliveryId`
- `createdAt`

Separate internal notes from customer-visible replies. Do not send email merely because a message is saved; email requires explicit admin action through an approved template.

## OrderIssueEvent Model Direction

Suggested fields:

- `id`
- `orderIssueId`
- `eventType`
- `fromStatus`
- `toStatus`
- `metadata`
- `actorType`
- `actorId`
- `createdAt`

## InternalIssue Model Direction

Suggested fields:

- `id`
- `caseNumber`
- `fingerprint`
- `category`
- `severity`
- `source`
- `summary`
- `safeDetails`
- `route`
- `customerId`
- `orderId`
- `occurrenceCount`
- `firstSeenAt`
- `lastSeenAt`
- `status`
- `resolutionNotes`
- `resolvedAt`
- `createdAt`
- `updatedAt`

## InternalIssueEvent Model Direction

Suggested fields:

- `id`
- `internalIssueId`
- `eventType`
- `metadata`
- `actorType`
- `actorId`
- `createdAt`

## Internal Issue Rules

- Do not expose secrets or sensitive values.
- Do not expose raw stack traces to customers.
- Group or deduplicate repeated identical issues where practical.
- Customer-visible errors should be safe and explain the likely next step.
- Internal technical context should remain in the admin tool and logs.
- Logging must not replace proper error handling.
- Provider failures should create safe operational context without leaking provider payload secrets.

## Customer Ownership And Visibility

- Customers may see only their own cases, messages, resolutions, and related order context.
- Admins may see internal context only after server-side admin auth.
- Case numbers are friendly references, not authorization credentials.
- Customer-visible resolution messages must not include admin notes, raw provider errors, stack traces, SQL details, or internal IDs.

## Implemented Source Of Truth

The 2026-06-17 product experience pass implemented the first production support foundation using existing support concepts instead of a parallel system.

Prisma source of truth:

- `CustomerSupportRequest`
- `CustomerSupportMessage`
- `CustomerSupportEvent`
- `InternalIssue`
- `InternalIssueEvent`

Server source of truth:

- `server/src/domains/support/routes/support.routes.js`
- `server/src/domains/support/controllers/support.controller.js`
- `server/src/domains/support/services/support.service.js`
- `server/src/domains/support/repositories/support.repository.js`
- `server/src/domains/support/mappers/support.mapper.js`
- `server/src/domains/support/constants/support.constants.js`

Client source of truth:

- Customer issue creation: `client/src/domains/account/views/AccountOrderDetailView.vue`
- Admin order issues: `client/src/domains/admin/views/AdminOrderIssuesView.vue`
- Admin internal issues: `client/src/domains/admin/views/AdminInternalIssuesView.vue`
- Admin support API: `client/src/domains/admin/api/adminSupport.api.js`

Current limitations:

- Internal issue capture is connected to unexpected Express 500 responses only.
- Support reply email sending is not implemented; email remains a separate explicit future action.
- No attachment, compensation, refund, replacement, or assignment workflow exists yet.

## Audit And Privacy Follow-Up (2026-10-11)

New protected admin writes record authenticated actor IDs in order/customer/support histories and safe structured route/status logs. Historical ADMIN_ENV records remain intact. Customer support projections exclude internal messages, INTERNAL_NOTE_ADDED events and private metadata; internal issue context remains admin-only.

Unexpected Express error capture uses a generic summary and safe error category plus templated route, not raw exception/SQL, request URL/query, body, cookie or provider action URL. Prisma runtime query/error logging is disabled. This does not provide centralized monitoring or automatic alerts: controller-caught failures/provider reconciliation and real deployed log retention still need owner verification. See [production audit](audits/2026-10-11-production-audit.md).

## Pet Lifecycle Facts (2026-10-23, Local Code)

Pet mutations now write minimal PET_CREATED/PET_UPDATED/PET_DELETED facts to existing CustomerAccountEvent atomically. Dates, owner/actor and profile duration are server-owned; only changed field names are retained, never removed-pet snapshots. No-op updates do not generate events or reset updatedAt. See [database contract](architecture/database.md#pet-activity-facts-2026-10-23-local-code).

Deleting a recent profile and adding another is review context, not proof of fraud or permission to block checkout, deny support or prevent privacy removal. A future offer must use its own unique account/programme grant; archive/delete cannot reset eligibility. No fraud classifier, background monitor, automated restriction or provider send exists here. Routine archive/restore remains preview-only and therefore has no connected archive event yet.

Before activation, decide retention/disposal and access, verify actual rollback/concurrency on an isolated database, and approve privacy notices. Events remain account-linked data, not anonymous evidence; User deletion cascades them. Do not copy historical private pet data into events or infer past removals from missing rows. Minimized fields/when/actor logging follows [OWASP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html); approve necessity and retention under the business's applicable requirements, consistent with [FTC data-minimization guidance](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business).
