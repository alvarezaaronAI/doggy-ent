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
- Pending: scoped commit/PR/hosted CI, integration merge, final full release diff, main release PR, deployment verification and final branch sync. Update below at each milestone; do not claim a merge/deployment before it occurs.

## Current Hosting Evidence

- Vercel connector deployment access is denied for the required team; existing authenticated CLI succeeds with explicit scope. Filtered project/production metadata confirms alvarezaaronAI/doggy-ent, production branch main, root doggy_ent_vue/client, current production source b583b1f and READY artifact dpl_6PWdqpNq8Fs5nY5puX8P3uAKQ6ar. No settings are changed.
- Railway service preflight confirms artistic-gentleness / production / doggy-ent, source alvarezaaronAI/doggy-ent main, root /doggy_ent_vue/server, public domain doggy-ent-production.up.railway.app, no staged changes and prior SUCCESS artifact b1a0c849-9d17-4de6-bac2-fedf68122d1f. Cached CLI works without relinking this checkout.
- Read-only transaction against the existing Railway DB override confirms 22 local/completed migrations, no pending/failed migration and matching SQL checksums. No migration or write ran. This is not a new backup/restore drill; no schema/server/env change is included in the release.
- No application/server/schema/lock/env changes in this follow-up. Foundation policy pages remain explicitly drafts on the testing website. Real-device, payment recovery/concurrency, legal approval and other launch gates remain open.

## Resume Next

Read current Git/PR/provider state first. Continue the pending verification/release only for the reviewed source and existing targets. On any failed gate, preserve work and record exact blocker/next step; do not issue duplicate manual deployments or modify migrations to bypass it.
