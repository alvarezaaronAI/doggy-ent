# Operations And Issues

Use this guide for order issue workflows, customer support cases, internal issue capture, safe error handling, audit trails, and operations tooling.

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
