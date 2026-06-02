# Doggy ENT Agent Instructions

## Project mission
Continue the Doggy ENT architecture refactor across both the client and server. The main goal is to clean up folder structure, reduce duplicate code, simplify large files, and create one clear source of truth for repeated logic, constants, formatting, API calls, validation, and business rules.

This is a refactor and simplification mission, not a redesign mission.

## Current priority
Focus on structure, readability, and single-source-of-truth cleanup across both apps:

```text
client/src/
server/src/
```

Start with the biggest and most duplicated areas first.

Client priority files:

```text
client/src/domains/admin/views/AdminProductsView.vue
client/src/domains/admin/views/AdminPromosView.vue
client/src/domains/admin/views/AdminCampaignsView.vue
client/src/domains/admin/views/AdminOrdersView.vue
client/src/domains/checkout/views/CheckoutView.vue
```

Server priority areas:

```text
server/src/domains/checkout/
server/src/domains/orders/
server/src/domains/products/
server/src/domains/promos/
server/src/domains/campaigns/
```

## Refactor rules
- Preserve the existing UI and behavior.
- Do not redesign layouts, colors, spacing, copy, or user flows unless explicitly asked.
- Do not change database schema unless explicitly required.
- Do not restart deployment planning.
- Do not replace working business logic just for style.
- Remove duplicate code when a clear shared helper, mapper, constant, validator, or service can replace it safely.
- Prefer one source of truth for repeated values, business rules, API response shapes, price formatting, status labels, validation rules, and calculations.
- Keep folder and file names readable enough that their purpose is obvious without opening the file.
- Do not move files randomly. Keep the folder structure feature/domain based.
- Prefer small, safe extractions over giant rewrites.
- Keep Vue views as orchestration layers.
- Move reusable UI into components.
- Move business logic into composables.
- Move API calls into domain API files.
- Move repeated values/options into constants.
- Move formatting/calculation helpers into utils.
- Use shared only when something is reused across multiple domains.

## Preferred folder pattern
Use folder names that clearly describe what lives inside them. Avoid vague folders when a more specific name makes the structure easier to read.

Preferred client domain structure:

```text
client/src/domains/<domain>/
  views/              route-level screens only
  components/         domain UI components
  composables/        Vue state/business logic
  api/                client API calls for this domain
  constants/          repeated domain values/options
  utils/              pure formatting/calculation helpers
  mappers/            response-to-view-model transformations
  validators/         form and payload validation helpers
```

Preferred server domain structure:

```text
server/src/domains/<domain>/
  routes/             Express route definitions
  controllers/        request/response handlers
  services/           business logic and orchestration
  repositories/       database reads/writes
  mappers/            database-to-response transformations
  validators/         request payload validation
  constants/          repeated domain values/statuses
  utils/              pure helpers used only by this domain
```

Shared code rules:

```text
client/src/shared/    only client code reused by multiple client domains
server/src/shared/    only server code reused by multiple server domains
```

Do not move something into `shared` unless at least two domains actually use it.

## First client refactor goal
Turn `AdminProductsView.vue` into a smaller orchestration view.

Suggested extractions:

```text
AdminProductsHeader.vue
AdminProductsToolbar.vue
AdminProductsStats.vue
AdminProductsTable.vue
AdminProductsEmptyState.vue
AdminProductFormModal.vue
AdminProductVariantEditor.vue
AdminProductStatusBadge.vue
useAdminProducts.js
```

Only create the files that make sense based on the current code.

## Checkout status
Checkout has already been partially broken down into components, composables, and API helpers. Continue cleaning it only after the admin files are reduced.

Existing checkout direction:

```text
client/src/domains/checkout/views/CheckoutView.vue
client/src/domains/checkout/components/
client/src/domains/checkout/composables/
client/src/domains/checkout/api/
```

## Server cleanup direction
Server cleanup is allowed when it supports the same architecture goal: less duplication, clearer folders, and one source of truth.

Good server cleanup examples:

```text
- Move repeated response formatting into mappers.
- Move repeated validation into validators.
- Move repeated status values into constants.
- Keep controllers thin.
- Keep services responsible for business logic.
- Keep repositories focused on database access.
- Normalize money/status/date fields in one place instead of repeatedly inside controllers.
```

Avoid server rewrites that are not connected to simplification, duplication removal, or structure cleanup.

## Commands to run
After meaningful changes, run:

```bash
npm run lint
npm run build
```

If server code is touched, also run the relevant server/dev command used by this repo.

## Working style
- Inspect the existing code before editing.
- Make changes that are easy to review.
- Keep imports clean.
- Remove dead code created by extraction.
- Before creating a new helper or component, search for an existing one that can be reused or improved.
- If two files solve the same problem differently, consolidate toward one clear pattern.
- Prefer renaming folders/files when it makes the structure more understandable, but keep moves small and easy to review.
- Keep names clear and domain-specific.
- Summarize changed files after each task.
- Report any lint/build failures honestly and fix them when possible.

## Autonomous Phase Execution

The agent should operate in phases rather than waiting for approval after every small extraction.

### Current active phase
Admin Domain Cleanup

Scope:
- AdminProductsView.vue
- AdminPromosView.vue
- AdminCampaignsView.vue
- AdminOrdersView.vue
- Supporting admin components, composables, APIs, constants, mappers, validators, and utilities.

Objectives:
- Reduce oversized files.
- Remove duplication.
- Create single sources of truth.
- Improve folder readability.
- Preserve UI and behavior.

Workflow:
1. Analyze.
2. Refactor.
3. Build.
4. Fix build issues.
5. Continue to the next item within the same phase.

The agent does NOT need approval between files inside the same phase.

Stop only when:
- The entire phase is complete.
- A major architectural decision is required.
- A build failure cannot be resolved safely.
- The requested work would violate the rules in this file.

### Reporting format
After each completed target, report:
- Files created.
- Files modified.
- Duplicate code removed.
- Single-source-of-truth improvements.
- Build result.
- Remaining work.

### Phase roadmap
1. Admin Domain Cleanup
2. Checkout Domain Cleanup
3. Products Domain Cleanup
4. Server Structure Cleanup
5. Observability / Debugging Pass
6. QA and Launch Readiness Review

Complete the current phase before moving to the next one unless explicitly instructed otherwise.