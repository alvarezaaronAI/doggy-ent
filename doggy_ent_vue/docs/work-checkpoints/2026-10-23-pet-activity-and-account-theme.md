# 2026-10-23 Pet Activity And Account Theme

## Scope And Baseline

- Owner asks for pet-added time, removal/re-add history and profile duration to support later abuse review, plus the existing customer-account palette in the final disconnected card concept. No Git commit, release, Railway migration, shared-data fixture or automatic fraud decision is requested.
- Read AGENTS.md/handoff/relevant product, customer, admin, operations, architecture, privacy and verification guidance. Fresh git-preflight --fetch confirms active feat/customer-auth-experience at the integration baseline with preserved prior dirty work; both primary branches match their own upstreams. The task has no upstream. No branch/history mutation.
- Pet already stores server-owned createdAt/updatedAt and exposes them through the owned DTO. Removal currently deletes the active row and loses its timeline. Reuse existing CustomerAccountEvent, not a duplicate model: transactional PET_CREATED/PET_UPDATED/PET_DELETED records with owner/actor, event date, pet ID, original profile dates, age at event and changed field names only. No copied names, photos, breed/birthday/preference values, IP, fingerprint or credentials.
- Recorded facts can later derive remove-then-add intervals/counts and account profile tenure. A new pet ID is not proof of the same animal or fraud. No risk score, blocking, reward or discount is activated. Existing account-deletion cascade remains; audit retention/disposal and historical data limits must be documented before rollout.
- Match preview ink/muted/line/emerald/soft-gray surfaces to actual account.css while keeping the accepted layout, monogram, simple birthday row, direct Edit, Lucide resources and optional multi-purpose concept. The rich card remains disconnected; this does not integrate photo/breed/birthday/archive/multi-purpose schema.

## Progress

- Local implementation complete: versioned activity mapping, atomic owner-scoped mutations/history, no-op suppression, bounded conflict retries and draft privacy disclosure. Existing timestamps are reused, and removal/re-add can be analyzed later from event chronology rather than invented counters or a fraud flag.
- Preview now matches account.css ink #24332d, muted #64736c, emerald #17664e, soft green #edf6f0, gray action surfaces and page #f6f8f7. Existing brand accents, photos, monogram, shadowed Edit action, supplied Lucide icons and quiet cake/date birthday row are retained. No connected rich-field schema/UI integration.
- Targeted independent read-only review found no runtime defect but identified a transaction-test weakness. Distinct root/transaction delegates and post-callback update/delete conflict tests now close that gap; the final full suite includes these cases. The reviewer did not re-review the final test changes.
- No DB migration is needed for this activity slice. Do not run server npm start as a check (startup migrates). Do not submit fixture operations through the local server, whose DB target may be shared.

## Files Changed In This Follow-Up

| Files | Change |
| --- | --- |
| [petsActivity.mapper.js](../../server/src/domains/pets/mappers/petsActivity.mapper.js) | New allowlisted actor/time/type/metadata mapping and material changed-field detection |
| [pets.repository.js](../../server/src/domains/pets/repositories/pets.repository.js) | Mutation and minimal history in one owned Serializable transaction; no-op and missing-row behavior; bounded retries |
| [pets-activity.test.js](../../server/tests/tier2/account/pets-activity.test.js), [pets-repository.test.js](../../server/tests/tier2/account/pets-repository.test.js), [pets-routes.test.js](../../server/tests/tier2/account/pets-routes.test.js) | Privacy, ownership, server timestamps, transaction delegates/retries, removal/re-add and simulated rollback regressions |
| [policyPages.js](../../client/src/domains/policies/content/policyPages.js) | Draft privacy purpose/lifecycle disclosure, not effective legal terms |
| [database](../architecture/database.md), [data flow](../architecture/data-flow.md), [file map](../architecture/file-map.md) | Runtime facts, boundaries and file responsibilities |
| [customer experience](../customer-experience.md), [operations](../operations-and-issues.md), [data strategy](../prelaunch/customer-data-strategy.md), [policy inventory](../prelaunch/policy-and-storage-inventory.md) | Internal fact-review purpose, account palette and privacy/lifecycle limits |
| [roadmap](../implementation-roadmap.md), [verification](../verification-and-qa.md), [handoff](../../PROJECT_HANDOFF.md), this checkpoint | Evidence, remaining gates and exact resume instructions |

Outside Git, the task-owned photo-led-pet-profiles.html fragment, rendered inspection wrapper, photo-led-pets-qa.mjs and desktop/mobile inspection PNGs were updated in the existing thread visualization directory. Earlier auth/Pet/agent/schema edits remain preserved and are not newly completed features of this follow-up.

## Verification Evidence

- Server npm run build: pass, including shared-content synchronization and Prisma Client 6.16.2 generation. No migration or database query.
- Server npm test: pass, 248 tests (tier1 28, tier2 214, tier3 6). Focused activity/Pet tests first exposed an outdated HTTP fixture; adding transaction findUnique/event delegates fixed it. The final full run includes the subsequent transaction-scope/conflict regression tests.
- Node syntax checks for petsActivity.mapper.js and pets.repository.js: pass.
- Client npm run build: pass, 2330 modules. Client npm test: pass, 212 tests (tier1 11, tier2 195, tier3 6).
- photo-led-pets-qa.mjs: pass at 1024/736/390/320 px. Checks account palette, complete cards/direct Edit, birthday placement/locking, resource icons, optional multiple purposes, breed search/mix, visual stage/size controls, photo preview, archive/restore, safe restored state, keyboard interactions and long-content fit. No overflow, page/console errors or application requests; allowed read-only runtime resource requests only. Updated desktop/mobile screenshots were inspected.
- Final checks pass: 11 touched Markdown documents, 210 local links/anchors, balanced fences, one parsed preview script, 434257-byte fragment (below 1 MB), no application-request API in the fragment, and git diff --check. Final status preserves prior dirty work; no generated snapshot/dependency churn was introduced. This slice is ready for local diff review, not an automatically approved release of the combined tree.

## Remaining Gates

- Verify actual database rollback/concurrency and full-account deletion behavior in an approved isolated target before rollout; unit transaction tests alone are not deployed persistence proof.
- Approve retention/disposal/access rules and effective privacy notice; review fairness before any future incentive/risk workflow. Do not backfill invented historical deletions or claim permanent/personal identity detection.
- Earlier combined auth/Pet source release, real Safari/touch/screen-reader/provider gates remain open. No publication or deployment from this final-preview request.

## Exact Next Steps

1. Owner reviews the account-colored preview. Do not replace the connected Pet UI or add photo/breed/birthday/archive/multiple-purpose columns merely from this checkpoint.
2. Agree on retention/disposal/access and privacy-request handling for minimal account activity; decide the richer connected profile scope separately. Full account deletion still removes the events, so this is not a perpetual reward-eligibility ledger.
3. On an approved isolated database, verify real mutation/audit rollback, conflict retries and User cascade. Tests in this follow-up simulate these database contracts; no shared target was used.
4. Review the combined existing dirty source, run matching CI/device acceptance and follow the managed-publication policy only when the owner moves from preview to release. No commit, push, merge, provider operation or deployment was performed here.
