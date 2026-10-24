# 2026-10-23 Connected Photo-Led Pets

## Scope And Safety

- Owner approves integration of the account-colored photo-led Pets preview. Preserve direct Edit, quiet birthday row, canonical breed choice + independent mixed checkbox, visual stage/size, optional multiple purposes, archive/restore, separate privacy removal and hypothetical one-off account incentive notice. No reward, fraud score or marketing automation.
- Continue existing dirty feat/customer-auth-experience, preserving the earlier auth/Pet/history implementation. Fresh git-preflight --fetch: main and dev-main each match their own origin; active task matches integration baseline and has no upstream. Do not reset or hide dirty work.
- Backend worker owns only Pet server/schema/tests and canonical catalogue/sync; main owns connected client, documentation and integration QA. Owner separately approved Railway migration after backup/checks; this does not authorize unrelated shared-data changes or provider actions.
- New pet photographs must be account-private, bounded raster uploads, never public MediaAsset records or external URLs. Birthday is optional month/day, immutable once first saved. Existing account history records facts without personal field values; archives count toward the ten-profile cap.

## Progress

- Required source/doc and current-state inspection completed. Backend worker implementation and client integration are complete; preserved prior work remains on the same task branch.
- Owner explicitly approves applying the additive migration to the current Railway DB after backup/checks. Read-only preflight of local + Railway confirms 23 complete matching migration checksums and only 20261023000000_photo_led_pet_profiles pending. No migration/data write yet; final backend tests/SQL review precede backup/application.
- Connected cards/direct inline editor, canonical breed/mix choices, visual radio tiles, multi-purpose choices, confirmed/locked month/day, private photo transport and partial-upload retry handling are implemented locally. No fictional pet rows are substituted for actual account data; missing photos use a clearly labelled existing Labrador illustration.
- Client build passes (2338 modules); 221 client tests pass (11/204/6). Initial suite exposed purpose-order drift between client/server; aligned with canonical server order and reran successfully. Browser QA agent is verifying isolated fixtures at desktop/narrow widths, no shared writes.
- Private target-guarded rollout helper is saved under /Users/nazxylix/.codex/backups/doggy-ent/2026-10-23-photo-led-pets/rollout.mjs; it prints no credentials, verifies checksums/only-pending migration, makes a decoded 0600 custom backup, requires freshness/checksum/data-preservation evidence before migrate deploy and compares existing record hashes afterward. No env/provider change, commit/push/merge or website deployment.

## Local Data Milestone

- Backend source completed/reviewed: 314 server tests (28/280/6 across 44 files), build/Prisma Client 6.16.2 generation, schema validation and syntax checks pass. Main reran full server tests/build after local application, also passing.
- Made a full private local custom-format backup (358331 bytes), 0700 directory/0600 archive, SHA-256 receipt and full pg_restore decode to /dev/null. No actual recovery restore rehearsal.
- Applied only 20261023000000_photo_led_pet_profiles locally. Postflight: 24 complete matching checksums, no pending. Hashes/counts of existing Product/Order/User and the old Pet field projection are unchanged.
- Private fixture-check.mjs in the same backup directory ran against guarded loopback only. Real service persistence, canonical fields, immutable birthday, omitted-new-field compatibility, archive/restore, owner-only normalized photo, private HTTP headers/foreign denial/413/415, five actual PostgreSQL audit-failure rollbacks, removal/re-add history, concurrent ten-profile cap including archives and full User->Pet->Photo/events cascade pass. Temporary fixture users/rows removed in finally. No provider calls or remote fixtures.
- Railway remains at 23 complete migrations with the sole new migration pending at this milestone. Next: finish isolated browser QA, then fresh Railway backup/preflight/apply/postflight under the owner's explicit approval.

## Railway Data Milestone

- After passing local real-DB and browser checks, made a fresh full private Railway custom-format backup (2795739 bytes). Archive is 0600 in the 0700 directory above, with a private SHA-256 receipt; full pg_restore decode to /dev/null passed. Actual recovery restore is not rehearsed.
- Applied only approved 20261023000000_photo_led_pet_profiles through migrate deploy after matching target/checksums/sole pending migration and fresh-backup checks. Postflight confirms 24 complete matching migrations, none pending/failed. Prior Product/Order/User record hashes/counts and old Pet field projections are unchanged.
- No Railway fixture/customer/product/order writes, provider sends, seed/reset, credential/config change or live backend/frontend deployment. The additive schema remains compatible with older deployed source; it does not deploy the new UI.
- Actual owner browser at localhost:5173/account/pets still targets the local server -> Railway DB. Read-only retry loads the existing pet in new cards, direct Edit shows preserved existing choices, Cancel makes no write, and full refresh retains authenticated account/pet/bag state. Captured refreshed-page errors: zero. No real pet was saved, archived, photographed or removed during this acceptance check.

## Client And Browser Verification

- Final client npm test: 225 pass (tier1 11, tier2 208, tier3 6). Build passes, 2338 modules. Three private-photo API cases plus safe invalid-JSON response regression cover credentials/no-store/raw bytes/archive shape. One test fixture reused a consumed Response; corrected to construct each response separately, then reran.
- Main syntax check passes 18 runtime/catalogue/sync modules; generated client/server breed copies match canonical source exactly. Worker also ran schema validation and scoped server/test syntax checks. Git whitespace check passes.
- Independent fixture browser run initially found three real issues: long editor nickname overflow, archive keyboard focus loss, tablet monogram overflow. Fixed all three; added birthday-confirmation invalidation when date changes. The next run passed 14 scenarios at 1440/768/390/320, including isolated list/editor, long-content fit, visible error/keyboard focus, canonical/mixed data, multiple choices, birthday lock/confirmation, raw photo upload/partial-failure retry/photo deletion, archived-inclusive cap, privacy confirmation, reduced motion and retained bag/session. No page errors, unmocked API calls or unexpected writes. Deliberate 4xx/5xx fixtures and blocked external CDN integrity checks are not clean-network certification.
- Final independent rerun passes all 14 scenarios, exit 0. At every width the upload has keyboard focus with a 2 px solid emerald outline/2 px offset, breed chevron has 0 px measured center/right alignment difference, birthday icon/title stay inline, and there is no horizontal overflow. All 28 screenshots refreshed; desktop list, mobile editor and final mobile upload-focus view inspected. Focused client regressions pass 18 tests. No confirmed runtime/browser bug remains in this scope; actual-device/deployment gates remain separate.
- QA script/results/screenshots live in the existing task visualization directory under connected-pets-qa*. These are synthetic browser fixtures, not Railway records. Real local HTTP/DB evidence above is separate.
- Final documentation checks pass: 11 touched documents, balanced Markdown fences and 204 existing local links/anchors. Git diff --check passes. Final status preserves earlier dirty auth/Pet/agent work, with no dependency/version churn or generated storefront drift; ready for local code/commit review, not automatic acceptance of the combined release.

## Files And Boundaries

| Group | Files / scope |
| --- | --- |
| Connected account surface | AccountPetsView, AccountPetsSection, AccountPetCard, AccountPetEditor, AccountPetPhoto, AccountPetBreedPicker, AccountPetChoices |
| State/transport/data quality | useAccountPets, accountPets.api, petProfile constants/mapper/validator, generated pet catalogue |
| Customer-facing notice | policyPages.js draft category/lifecycle disclosure; no effective legal-policy approval |
| Canonical catalogue | shared/pets/petCatalog.js, client/server sync scripts and generated copies |
| Owned server domain | Pets routes/controllers/services/repository/validators/constants/mappers; new petPhoto.service.js |
| Database | Prisma Pet extension, PetPhoto and additive 20261023000000 migration; previous migration untouched |
| Regression tests | client account-pets/auth-views/photo-led-pets/pet-photo-api; server pets*.test.js suites |
| Documentation | customer experience, architecture database/data-flow/file-map, data strategy, policy inventory, operations, roadmap, verification, handoff and this checkpoint |

Earlier auth/agent source remains preserved. No dependency/version churn, broad storefront/admin/checkout refactor or generated storefront-content drift is part of this change.

## Exact Resume Steps

1. Implementation/build/test/docs/browser checks are complete. Both approved migrations are already applied: do not rerun migration or add sample data.
2. Owner reviews the connected local screen; current dev server is Railway-targeted. Use isolated fixtures, not real profile mutation, for additional automated tests. Actual private-photo save against Railway was not performed.
3. Before a source release, review the full combined dirty auth/Pet branch, approve retention/access/disposal/privacy request handling and complete applicable real Safari/touch/screen-reader/password-manager acceptance. Policies remain drafts and incentives remain inactive; no automatic block or grant may be inferred from history.
4. Only when the combined scoped implementation is accepted and ready, follow exact-head managed Git/CI/release and verify matching Railway/Vercel deployments. No commit/push/merge/deployment occurred in this implementation pass; local source is not the deployed website.
