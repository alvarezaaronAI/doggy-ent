## Knowledge Handoff Requirement

The agent must maintain project knowledge transfer documentation.

Whenever a major phase is completed (Admin Cleanup, Server Cleanup, Checkout Cleanup, Products Cleanup, Debugging Pass, QA Pass, etc.), generate or update:

```text
PROJECT_HANDOFF.md
```

Purpose:
- Allow ChatGPT or a future Codex session to understand the project without re-auditing the repository.
- Preserve architectural decisions.
- Preserve domain knowledge.
- Preserve refactor history.
- Document what exists and why.

The handoff document should include:

1. Business overview
2. Client architecture
3. Server architecture
4. Database overview
5. Stripe/payment flow
6. Admin system overview
7. Completed refactors
8. Remaining work
9. Launch readiness assessment
10. Important file index
11. End-to-end flow maps
12. API endpoint inventory
13. Environment variables and deployment notes
14. Build/test/verification commands
15. Known risks and manual QA checklist
16. Current git state and recent commits
17. Dependency and integration map
18. Data ownership / source-of-truth map

For major domains and important files, explain:
- Purpose
- Responsibilities
- Inputs and outputs
- Dependencies
- How the file participates in the overall application flow

For every major user or admin flow, document the full path from UI to server to database and back:
- Storefront product browsing
- Product quick view
- Add to cart
- Cart drawer updates
- Checkout preview
- Promo validation
- Stripe/payment intent flow
- Order creation
- Order success page
- Admin product create/edit/delete
- Admin promo create/edit/test/analytics
- Admin campaign create/edit/status display
- Admin order dashboard and order detail

For API routes, include:
- HTTP method
- Route path
- Controller/handler file
- Service file
- Repository/database file if applicable
- Request payload shape
- Response shape
- Error behavior
- Client files that call the endpoint

For source-of-truth documentation, identify where these live:
- Product statuses
- Selling modes
- Variant sizes
- Price/currency formatting
- Promo statuses and discount rules
- Campaign statuses and donation rules
- Order statuses and timeline rules
- Checkout pricing rules
- Tax/shipping calculations
- Stripe payment intent handling
- Validation rules

For environment and deployment documentation, include:
- Required environment variables by client/server
- Which variables are public vs private
- Stripe-related variables
- Database/Prisma variables
- Railway/Vercel/Cloudflare deployment notes if present in the repo
- Commands used locally versus deployment commands

For verification documentation, include:
- Build commands that pass
- Missing lint/test scripts
- Any `node --check`, import checks, or smoke checks performed
- Manual QA steps required before launch
- Known flows that do not have automated tests

For git/context documentation, include:
- Current branch if available
- Working tree status at the time of handoff
- Recent relevant commits if available
- Files changed in the latest phase
- Any uncommitted files that must be reviewed before continuing

For file index documentation, include every important created or modified file from the recent Admin Cleanup and Server Cleanup phases, grouped by domain, with one clear sentence explaining what each file does.

The handoff should call out uncertainty clearly. If the agent cannot verify something from code, it must say so instead of guessing.

Before starting a new major phase, check whether PROJECT_HANDOFF.md should be updated.



## Repair / Launch-Blocker Pass Requirement

When asked to "fix anything broken," "repair the project," "make sure everything works," "audit issues," or perform a launch-readiness cleanup, the agent must treat the task as a verified repair pass, not a cosmetic refactor.

Primary goal:
- Find, fix, verify, and document real issues that could break the application, payment flow, admin tools, database flow, deployment, or launch readiness.

Before editing code, the agent must:
1. Read `AGENTS.md`.
2. Read `PROJECT_HANDOFF.md` if it exists.
3. Inspect the current repository state instead of trusting old assumptions.
4. Create a prioritized launch-blocker list.
5. Separate confirmed issues from uncertain risks.

The agent must prioritize fixes in this order:
1. Production data safety
2. Payment and checkout correctness
3. Order creation correctness
4. Admin authorization and protected routes
5. Client/server/API mismatches
6. Database/schema/repository mismatches
7. Broken imports or build failures
8. Environment/deployment mismatches
9. Dead duplicate checkout/payment code
10. Documentation accuracy

The agent must specifically audit these launch-critical risks:
- Stripe PaymentIntent amount must be based on trusted server-side pricing, not client-supplied totals.
- Order creation must be idempotent and must not create duplicate orders for the same successful payment.
- Inventory must only be reduced after a successful verified payment.
- Promo usage must not be double-counted or client-spoofed.
- Campaign donation totals and usage must not be client-spoofed.
- Admin-only endpoints must require admin authentication.
- Production startup must never delete, reset, or reseed live data.
- `.env.example` and deployment notes must match the variables actually used by code.
- Client API calls must match server routes, payloads, and response shapes.
- Prisma schema fields must match repository/service code.
- Checkout, payment, and order success flows must not rely on stale mock data.

Rules for the repair pass:
- Preserve current storefront and admin UX unless a UI change is required to fix a real bug.
- Do not rewrite the app from scratch.
- Do not perform broad speculative refactors.
- Do not remove working features.
- Follow existing project architecture and naming conventions.
- Use the existing server pattern: route → controller → service → repository → Prisma.
- Use existing client domain patterns: view → composable/service/api → mapper/validator/utils/components.
- Fix in small, understandable groups.
- Keep changes focused on verified issues.
- If something cannot be verified from code, document it clearly as unverified instead of guessing.

Required verification after fixes:
- Run the client build command if available.
- Run the server build/start/syntax checks that are available.
- Run `prisma generate` if Prisma is used.
- Run available lint scripts.
- Run available test scripts.
- If lint or test scripts are missing, document that clearly.
- Check for broken imports.
- Check for client/server endpoint mismatches.
- Check checkout flow from cart → pricing preview → promo validation → Stripe payment intent → order creation → order success page.
- Check admin flows for products, promos, campaigns, orders, and order detail.
- If a command fails, either fix the cause and rerun it, or document why it could not be fixed.

Required final output from the agent:
1. Issues found, grouped by severity.
2. Issues fixed.
3. Files changed.
4. Commands run and results.
5. Remaining risks or unverified areas.
6. Manual QA checklist.
7. Next safest phase after the repair pass.

Required documentation update:
- Update `PROJECT_HANDOFF.md` after the repair pass.
- The update must include fixes made, remaining risks, verification results, current git state, changed files, and the next recommended phase.
- The handoff must clearly say what was verified from code and what remains uncertain.

The repair pass is not complete until code changes are verified and `PROJECT_HANDOFF.md` is updated.