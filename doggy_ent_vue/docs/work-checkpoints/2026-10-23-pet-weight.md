# 2026-10-23 Optional Pet Weight

## Scope And Baseline

- Owner requests weight guidance below Size choices and actual weight in the DB. Keep size customer-selected, add optional editable current weight, lb/kg conversion, card display and server-owned last-weight-update time. No feeding/health inference or automatic size selection.
- Continue dirty feat/customer-auth-experience without moving/reverting prior auth/Pet work. Fresh fetch confirms local main/dev-main each match their own origin and task matches integration baseline. No upstream/publication created.
- Owner explicitly approves the new additive weight migration on the same Railway DB after backup/checks. Prior photo-led migration is already applied: do not alter/reapply it. New nullable fields preserve existing pets and old clients that omit weight.
- Store canonical integer grams + preferred display unit + server weightUpdatedAt; no guessed weight from size/breed, mandatory question, measurement history table, raw numbers in account activity, incentive or provider action.

## Progress

- Shared/generated weight rules, optional Size hints/input/unit conversion/card display, strict API pair/DTO, server-owned measurement date and field-name-only activity are implemented. Legacy updates omit weight without clearing it; unchanged rendered measurements retain exact canonical grams.
- Both builds pass, with Prisma 6.16.2 regenerated. Full client suites: 238 tests (11/221/6); server: 331 (28/297/6). Focused contract, bounds, clearing, DTO/allowlist, no-drift and repository date tests pass.
- Fresh full custom backups decoded successfully: local 361737 bytes, Railway 2799238 bytes; private 0700 directory/0600 archives and SHA/freshness/SQL/history checks. Approved additive weight migration applied to both: 25 completed matching migrations, none pending, validated check, original Product/Order/User/Pet/PetPhoto/CustomerAccountEvent projections preserved, all new fields initially null. No old migration changed or reset/reseed run.
- Real loopback fixture checks pass canonical persistence, old-client omission, unit-only measurement-date and no-op preservation, changed measurement date, owner rejection, clearing/optional values, six native database check failures, real audit-write-failure rollback and User cascade. All temporary users/rows cleaned. Initial harness expectations were corrected for Prisma Date mapping and PostgreSQL check-error shape; application checks needed no bypass.
- Final isolated Chrome QA passes eighteen scenarios at 1440/768/390/320: four new weight scenarios plus fourteen prior photo/birthday/archive regressions. Exact grams persist after rounded lb/kg switches/reopens; invalid fields tint/focus and send no request; clearing removes the weight; selected Size stays unchanged. Found/fixed the weight-error summary lingering after correction and reran. Forty screenshots captured, desktop/mobile editor/card/error views inspected. No page errors/unmocked APIs/unexpected writes/network failures; 22 intentionally blocked CDN integrity errors and six deliberate failed fixture responses are classified separately.
- Actual signed-in local Railway-target account read-only checks pass: existing pet loads, direct Edit exposes empty optional weight/lb/kg/hints, All pets closes without save and reload retains the account. The running watcher initially held pre-generation Prisma metadata and could not list pets; reloading it after regeneration/migration resolved the error. No real pet measurement/profile changed.
- Draft privacy copy and focused customer/data/architecture/QA/roadmap docs updated. No provider, reward/fraud decision, source commit/push/merge or website deployment.

## Files In This Follow-Up

- shared/pets/petWeight.js; client/server scripts/sync-storefront-content.js and their local petWeight.generated.js outputs.
- client/src/domains/account/components/AccountPetChoices.vue, AccountPetEditor.vue, AccountPetCard.vue; constants/petProfile.constants.js, mappers/petProfile.mapper.js, validators/petProfile.validator.js.
- server/prisma/schema.prisma and migrations/20261023010000_optional_pet_weight/migration.sql; pets validators/pets.validator.js, mappers/pets.mapper.js, mappers/petsActivity.mapper.js, repositories/pets.repository.js.
- client/tests/tier2/account/pet-weight.test.js, account-pets.test.js; server/tests/tier2/account/pets-weight.test.js, pets-validation.test.js, pets-service.test.js, pets-repository.test.js.
- client policyPages.js draft notice; PROJECT_HANDOFF.md; this checkpoint; customer-experience, architecture/database, architecture/file-map, implementation-roadmap, verification-and-qa, prelaunch/customer-data-strategy docs.

## Commands And Private Evidence

- Client/server npm run build pass; full npm test pass (238/331); npm exec prisma validate passes; scoped node --check (nine JS files), generated parity, Markdown/local references and git diff --check pass.
- Task-owned private rollout.mjs local/railway preflight, backup and migrate commands pass. Backup receipts/postflight record checks stay under /Users/nazxylix/.codex/backups/doggy-ent/2026-10-23-pet-weight. Archives were fully decoded, not restored to a live target; a recovery drill remains a separate release gate. Do not print credentials/connection strings or commit the backups.
- Real guarded local evidence: node /Users/nazxylix/.codex/backups/doggy-ent/2026-10-23-pet-weight/fixture-check.mjs. It refuses non-loopback targets and cleans its users in finally; never point it at Railway.
- Browser evidence: weight-pets-qa.mjs, weight-pets-qa-results.json and weight-pets-qa-*.png under /Users/nazxylix/.codex/visualizations/2026/06/01/019e859b-b6f3-78e0-b7ab-540ffb37b24b. Every API is intercepted; no shared write/provider reaches the network.

## Remaining And Exact Next Steps

1. Owner review at http://localhost:5173/account/pets; optionally add a real weight themselves. No automated real customer weight save was performed. Real Safari/touch/screen-reader acceptance still pending.
2. Approve effective privacy purpose/retention/disposal/access and review the complete dirty auth/Pet diff, not only these incremental files. Existing history/rights/provider/launch gates remain. Weight is not a reward/fraud input, health claim or measurement history.
3. Source is safe for scoped commit review, not a clean/auto-release certificate. No new branch/upstream/publication was created in this follow-up. Once the combined release is accepted, use the bounded managed Git workflow and deploy matching server/client source. Do not rerun/reset already-applied migrations or redeploy old unrelated code.
4. Additive schema can remain during source rollback; old source can ignore the nullable columns. Do not drop weight/photos or restore a full backup over current shared data as a casual rollback. A real restore requires separate target, scope and approval.
