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

Client admin cleanup is complete for the main target views. Remaining client cleanup should be based on fresh audits, not assumptions.

Recently completed admin view reductions:

```text
AdminProductsView.vue    1049 lines -> 176 lines
AdminPromosView.vue       704 lines -> 113 lines
AdminCampaignsView.vue    673 lines -> 76 lines
AdminOrdersView.vue       513 lines -> 65 lines
```

Server priority areas:

```text
server/src/
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

## Completed client refactor milestone
The first major client milestone is complete: the large admin route views were reduced into orchestration views with supporting admin components, composables, APIs, constants, mappers, validators, and utils.

Do not redo the admin cleanup unless a specific regression or duplication issue is found.

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
Server Structure Cleanup

Scope:
- All of `server/src/`.
- This includes app setup, middleware, providers, routes, db helpers, seeds, all domains, generated Prisma usage, models, server entry files, and shared server utilities.
- Clean the entire server structure, not just selected domains.
- `server/src/shared/` should still be used only when code is reused by multiple server domains or app-level server layers.

Objectives:
- Make server domains consistent, readable, and maintainable.
- Reduce oversized service files.
- Remove duplicated helpers and business rules.
- Create one source of truth for repeated validation, constants, response mapping, status values, money normalization, and request normalization.
- Keep controllers thin.
- Keep services focused on business orchestration.
- Keep repositories focused on Prisma/database access.
- Preserve existing endpoints, API behavior, and database schema.

Server structure notes from current tree:
- Audit all of `server/src/`, not just the commerce domains.
- `orders/` is closest to the preferred server domain structure and should be used as the reference pattern where appropriate.
- `products/` currently has controllers, routes, services, and utils, but may need repositories, mappers, validators, and constants if those extractions are justified.
- `promos/` currently uses singular `repository/`; rename or move to `repositories/` if safe.
- `campaigns/` currently uses singular `validation/`; rename or move to `validators/` if safe.
- `checkout/` currently has controllers, routes, and a large service; extract validators, mappers, constants, or utils only when they reduce duplication or clarify business logic.
- `payments/` must be included because it is part of the checkout/payment flow and may need constants, validators, mappers, or Stripe-specific helpers.
- `auth/`, `admin/`, app middleware, app routes, shared services, seeds, and models must be audited too. Refactor them only when there is clear duplication, unclear structure, or large-file complexity.
- Do not put code into `server/src/shared/` unless at least two server domains or app-level server layers actually use it.

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
1. Admin Domain Cleanup — complete
2. Server Structure Cleanup — active
3. Fresh Client Audit
4. Checkout Domain Cleanup, only if the fresh audit shows it is still needed
5. Products Domain Cleanup, only if the fresh audit shows it is still needed
6. Observability / Debugging Pass
7. QA and Launch Readiness Review

Complete the current phase before moving to the next one unless explicitly instructed otherwise.

## Current server phase work order
For the active Server Structure Cleanup phase, use this order:

1. Audit all of `server/src` and identify the largest files, duplicated helpers, unclear folders, inconsistent folder names, and missing single-source-of-truth opportunities.
2. Clean app-level server structure only where useful: `server/src/app/`, middleware, providers, root routes, `app.js`, and `server.js`.
3. Clean shared repeated server utilities first only when clearly reused by multiple domains or app-level layers.
4. Clean `products` domain.
5. Clean `promos` domain.
6. Clean `campaigns` domain.
7. Clean `payments` domain.
8. Clean `checkout` domain.
9. Clean `orders` domain only for remaining consistency issues.
10. Audit and clean `auth`, `admin`, `customers`, `models`, `db`, and seeds only when there is clear duplication, unclear structure, large-file complexity, or naming inconsistency.
11. Run final server verification.
12. Report the final server cleanup summary.

The active phase is considered incomplete until the agent has audited every folder and top-level file under `server/src/`, even if some folders require no changes.

Do not stop between domains unless blocked by a major architectural decision, unresolved verification failure, or a rule in this file.