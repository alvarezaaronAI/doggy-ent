# 2026-10-20 Managed Releases And Primary Branch Sync

## Owner Request And Scope

Owner explicitly asked Git stewardship to complete merges when scoped work is ready, keep relevant local/GitHub branches aligned, and remove codex/ from readable task names. Owner confirmed main feeds the existing Railway and Vercel website. Managed publication is recorded in [workflow policy](../engineering/git-workflow.md#owner-authorized-managed-publication); this does not authorize database/provider changes, real transactions or 1.0 launch acceptance. No unattended GitHub bot or paid agent runtime is installed.

## Baseline And Integration Milestone

- Fresh status/diff/preflight: clean task at `378ad4a`, matching its upstream. Main/dev-main baseline file trees matched before foundation work. Local main was 60 commits behind origin/main, with no local divergence.
- PR #31 exact-head Quality run 2 passed both client/server jobs; no review comments/blockers. Merged with expected SHA guard into dev-main: `f5eeedeefb3f2284ce3eb01fe1eac0166008ad23`.
- Fetched, fast-forwarded local dev-main and local main against their respective upstreams, then created `chore/managed-releases`. No reset, force push, automatic stash or shared-data action.

## Implementation Milestone

- Update root/application guidance, git_steward, release_operator, shop Git skill and engineering docs with bounded managed merges/releases and stop conditions.
- Default branch prefix is empty; new branches use type/topic. Historical commit/PR text is preserved.
- Read-only preflight now reports local main/dev-main lag, missing refs and divergence even while a task branch is checked out. Added isolated regression fixtures; no automatic synchronization is implemented inside this inspection helper.
- Renamed the completed foundation branch locally/remotely to `chore/prelaunch-foundation` at the same `378ad4a` source. Verified it was integrated and had no open source PR before deleting only its old codex/ remote alias. PR #31 and committed history remain intact; other historical branches are unchanged.
- Local helper tests pass 11/11; helper syntax and whitespace checks pass. All six agent TOML definitions and workflow JSON parse. Seven changed/new Markdown documents have balanced fences and 99 valid local links. System Python lacked tomllib/PyYAML; bundled Python parses TOML, and skill validation dependency repair is isolated outside the repository.
- Independent read-only qa_engineer review found no concrete blockers in normal implementation, preview/no-publish, failed exact-head CI, dirty/divergent branches, unapproved migrations or failed deployment scenarios; it independently replayed 11/11 helper tests. This is written-policy/helper verification, not proof every future agent obeys.
- Official skill validation passed after temporary PyYAML installation outside the repository; no dependency/lockfile changed.

## Publication And Main Merge Milestone

- Source `10767f586dde0e81bf694469646801e684c3a135`, chore(git): enable verified managed merges and branch synchronization; 12 explicit reviewed paths, staged whitespace and scoped private path/token-pattern scan passed.
- [PR #32](https://github.com/alvarezaaronAI/doggy-ent/pull/32) into dev-main passed [Quality run 3](https://github.com/alvarezaaronAI/doggy-ent/actions/runs/39546716574), both clean Ubuntu install/build/app-test jobs plus 11 helper tests. No review blockers; expected-head merge produced `078e3f85886e2eba4f16a367544344a08682cf2b`.
- Reviewed complete 44-file release relative to main, including previously tested draft policy pages. No server runtime/schema/migration/package/lock/env change. Existing launch risks remain, but this release does not claim to fix them or enable real launch.
- [Release PR #33](https://github.com/alvarezaaronAI/doggy-ent/pull/33), dev-main -> main, passed its own [Quality run 4](https://github.com/alvarezaaronAI/doggy-ent/actions/runs/39546864640) on exact head 078e3f8. Client job 119046892382 and server job 119046892432 succeeded. No review/conflict/protection bypass.
- Main merge is `64ae486bffc73139eda17ad83ddbff31a102208a`. Git-triggered deployments are being observed; no duplicate CLI deployment was issued. VERSION stays 0.1.0 unreleased, no tag.
- Fresh fetch after merge: local main matches origin/main at 64ae486; local dev-main matches origin/dev-main at 078e3f8; both ahead/behind 0/0, clean, and their file trees match. Different merge-history SHAs are intentional. Historical branches are preserved.
- Follow-up evidence edits are on docs/managed-release-evidence, not direct edits to a primary branch. Finish deployment verification below before committing this evidence. Documentation-only evidence can remain on integration until the next site release; do not trigger another production rollout just to record the rollout.

## Current Hosting Evidence

- Vercel connector deployment access is denied for the required team; existing authenticated CLI succeeds with explicit scope. Filtered project/production metadata confirms alvarezaaronAI/doggy-ent, production branch main, root doggy_ent_vue/client, current production source b583b1f and READY artifact dpl_6PWdqpNq8Fs5nY5puX8P3uAKQ6ar. No settings are changed.
- Railway service preflight confirms artistic-gentleness / production / doggy-ent, source alvarezaaronAI/doggy-ent main, root /doggy_ent_vue/server, public domain doggy-ent-production.up.railway.app, no staged changes and prior SUCCESS artifact b1a0c849-9d17-4de6-bac2-fedf68122d1f. Cached CLI works without relinking this checkout.
- Read-only transaction against the existing Railway DB override confirms 22 local/completed migrations, no pending/failed migration and matching SQL checksums. No migration or write ran. This is not a new backup/restore drill; no schema/server/env change is included in the release.
- No application/server/schema/lock/env changes in this follow-up. Foundation policy pages remain explicitly drafts on the testing website. Real-device, payment recovery/concurrency, legal approval and other launch gates remain open.

## Resume Next

Read current Git/PR/provider state first; the production rollout below is complete. Finish only the documentation evidence PR/checks/primary sync if interrupted, not another website deployment. On any failed gate, preserve work and record exact blocker/next step; do not issue duplicate manual deployments or modify migrations to bypass it.

## Deployment And Public Verification Milestone

- Vercel production artifact `dpl_5DbXqgtDpv3CsHiUovGJqqjY7ZmC` is READY for main `64ae486bffc73139eda17ad83ddbff31a102208a`, with doggy-ent.vercel.app assigned. Existing scoped CLI confirms source/alias identity; no manual deployment or settings change.
- Railway artifact `674047a9-0a96-4e96-86ce-0f623041d3b5` is SUCCESS in the existing production service for the same main commit. Its startup used the unchanged migration command; read-only preflight showed no migrations to apply. No reset/reseed, migration command or business write was issued by this task.
- Live in-app browser opens /privacy with title Privacy | Chase & Evie Co. | Draft, explicit Draft for review notice, all six information links, shared header/footer, sign-in and bag controls, and essential-storage notice. This verifies actual Vue rendering, not only an index.html fallback. No login/password/payment action was performed.
- Nine HTTP routes return 200 HTML/SPA entry: /, /privacy, /terms, /cookies, /shipping-returns, /contact, /accessibility, /account/sign-in and /admin/login. Route status alone does not verify each interactive journey.
- Public backend health/products/campaigns return 200 JSON; health with the actual storefront Origin returns the exact allow-origin and credential header. This is not proof Safari persists cross-site sessions or that payment/provider flows are accepted.
- All six agent files remain; only Git Steward/Release Operator responsibilities changed. Other historical branches are preserved. No tag created; 0.1.0 remains unreleased. Main/dev-main protection is currently disabled; agent policy is not enforceable branch protection. Settings were not changed.

## Verification Commands And Results

- git status, diff --stat/name-status/check, fresh fetch and node scripts/git-preflight.mjs --fetch: scope/ref audit passed. Both primary refs synchronized at release close-out; protected/integration-branch warning is expected when inspecting dev-main, not a dirty-tree error.
- node --test scripts/git-preflight.test.mjs: 11/11 pass, independently replayed by QA. node --check on helpers and staged whitespace review pass.
- Bundled Python tomllib: all six TOMLs parse; workflow JSON parses. Official skill quick_validate.py passes using temporary PyYAML outside the repository after the default Python lacked validation modules.
- Changed-document Markdown/link/fence checks pass; initial seven documents/99 links. Final evidence-only documents are rechecked before their commit. Scoped staged path/token-pattern review passes; not an exhaustive secret certification.
- Hosted Quality runs 3 and 4: clean Ubuntu npm ci, client build/test (170 cases), server build/Prisma generation/test (143 cases) and 11 helper fixtures pass. This follow-up does not change application code or dependencies, so no redundant local app build is required.
- Read-only pg transaction with private env input (never printed): 22 local/completed migration entries, zero pending/failed/checksum mismatch; transaction rolled back. Public fetch checks and live browser result above pass.

## Remaining Risks And Next Phase

- Documentation evidence branch/PR is separate from the shipped source. Merge it into integration after its checks and fast-forward local dev-main; main must continue to match origin/main at the released commit. That leaves an intentional documentation-only file delta, not a stale local branch. Record the final evidence PR/CI outcome on its GitHub description without recursively deploying more checkpoint updates.
- Manual QA: inspect six draft pages, footer/bag/storage notice on real mobile/Safari and keyboard/screen reader; retain existing account/checkout regression acceptance. Do not send emails or run payments as an automatic Git workflow check.
- Configure enforceable main/dev-main branch protections only in a separately scoped settings task. Preserve existing payment recovery/concurrency, provider, legal-policy approval, retention/deletion, backup/restore and 1.0 launch gates.
- Next recommended implementation remains scoped commerce reliability, then approved policy/customer-account UX phases from the prelaunch plan. Managed agents can publish only completed work under the bounded policy; they are not continuously running bots.
