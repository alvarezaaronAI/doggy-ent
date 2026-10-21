# Git, GitHub And Releases

## Current Baseline

Git root contains `doggy_ent_vue/`, which contains the application and this guide. Current integration is **dev-main**, not the older `dev` branch. Production source is **main**. Do not rename/delete branches to make a graph look cleaner. A future switch to `dev` needs an explicit coordinated decision covering default branch, CI, open PRs and deployment settings.

Initial audit on 2026-10-20: dev-main was at `ee26b6b`, origin/main at `b583b1f`, with identical content despite extra main merge history. The subsequent managed-release pass integrated PR #31 and fast-forwarded the stale local main. Current evidence, source SHAs and deployment state live in the [managed-release checkpoint](../work-checkpoints/2026-10-20-managed-releases.md), not these historical baseline numbers. A source comparison does not prove what is deployed.

## Owner-Authorized Managed Publication

On 2026-10-20 the owner explicitly asked the agents to complete merges when work is ready, keep primary local/GitHub branches synchronized, and acknowledged that main drives the existing Railway and Vercel website. For **this repository and those existing targets only**, the Git steward may commit/push scoped completed implementation, create/update its PR, merge into dev-main, create the release PR into main, and merge it after the gates below pass. The release operator verifies the resulting deployments. Do not ask for the same routine approval at every step.

This is a bounded standing instruction, not an unattended scheduler or permission to ship arbitrary changes. A newer request to inspect, explain, plan, preview, wait, or not commit/push/deploy overrides managed publication. Do not publish unrelated edits, open-ended experiments or incomplete work. Another agent cannot broaden the owner's scope.

Before either merge:

- Inspect the exact PR head, current base and complete target diff. Use merge commits and an expected-head-SHA guard; stop and re-evaluate if the source/base changes.
- Require applicable client/server Quality jobs to pass on the current PR revision, resolve blocking reviews/conflicts, and honor all required checks/reviews/protection. Never use an admin bypass or merge while checks are pending/failed.
- For main, inspect the entire dev-main-to-main release, existing hosting identities/branch configuration, startup effects and rollback. Missing high-risk device/provider/payment evidence blocks changes that depend on it; do not pretend generic CI proves it. Existing documented prelaunch limitations do not become a 1.0 launch acceptance.
- Shared DB migrations/data mutation, secrets/provider configuration, new paid resources, live emails/payments/shipments, legal-policy approval and the first 1.0.0 launch remain separate decisions. Stop for explicit approval where needed. Server startup currently runs migration deploy: verify no unexpected pending migration before a backend rollout.
- No force-push, hard reset, automatic stash, history rewrite, unreviewed branch cleanup or settings/protection changes. Preserve dirty/divergent work and report the blocker.

Git steward owns the single Git mutation stream, even when QA/release agents supply evidence. After integration/release, fetch and fast-forward clean local main and dev-main against their own upstreams, verify the active task branch against its remote, and record checks/deployment results in the handoff/checkpoint. Main and dev-main may have different merge commit SHAs while their file trees match. A release failure must be reported; never say a successful merge proves a healthy deployment.

## Branches

| Purpose | Agent branch |
| --- | --- |
| Feature | `feat/pet-preferences` |
| Fix | `fix/cart-variant` |
| Urgent repair | `hotfix/login-regression` |
| Docs | `docs/privacy-inventory` |
| Refactor | `refactor/order-mapper` |
| Tests/maintenance | `test/checkout-recovery`, `chore/dependencies` |

The owner removed the codex/ prefix on 2026-10-20. `project-workflow.json` uses an empty default prefix. Historical commit/PR text is not rewritten; legacy names remain inspectable by preflight. Rename an existing published task only after checking its open PRs, merge/recovery references and hosting triggers. Do not create new copies of old work just for cosmetic graph changes.

Normal path: task branch -> PR -> dev-main -> reviewed release PR -> main. Use meaningful merge commits for integration/release PRs to preserve the visible branch graph the owner prefers. Squash is an alternative for noisy task history only when deliberately agreed; never manufacture empty branches/commits. Avoid long-lived release branches until needed. An approved hotfix can start from production, then must be reconciled into integration. Do not force-push shared branches.

## Before Editing

From the application directory:

```bash
git status
git diff --stat
git diff --name-status
node scripts/git-preflight.mjs --fetch
```

Status reveals staged/unstaged/untracked work. Diff commands describe local changes; fetch updates remote-tracking references without merging files. Preflight reports current-task comparisons and a `primaryBranches` entry for local main/dev-main versus each branch's remote, including missing/ahead/behind/diverged states. It never fixes branches. Default inspection without `--fetch` labels refs cached. Fetch failures stop a fresh audit. `--check` exits nonzero for a dirty/protected/detached/stale task baseline or tracked sensitive filenames; primary-branch lag is reported separately and must be reconciled before publication close-out. Missing upstream on a new task branch is expected.

If clean and the verified integration baseline is correct, a **new** task may use:

```bash
git switch dev-main
git merge --ff-only origin/dev-main
git switch -c feat/pet-preferences
```

These are teaching examples, not commands to run inside an unfinished task. Stop on dirty state/divergence; understand file ownership first. Do not auto-stash (it can hide work), blindly pull or reset. A branch points to commits: it does not save uncommitted work, provider state, env files or the database. Worktrees isolate simultaneous tasks, not production data.

## Commit And PR Review

Use `<type>(optional-scope): short imperative summary`: feat, fix, hotfix, docs, refactor, chore, test, style. Prefer `fix:` for a hotfix commit even if its branch uses hotfix/. Formatting is style; visual/behavior changes are feat/fix. Explain outcome and why, not just 'updated files'.

For reviewed implementation covered by managed publication (or a separately authorized publication):

```bash
git add path/to/reviewed-file
git diff --cached --stat
git diff --cached
git commit -m "fix(cart): preserve selected product variant"
git push -u origin fix/cart-variant
```

Review content privately for secrets before publication; never paste a sensitive diff into chat/logs. Avoid `git add .` for mixed trees. Never commit env files or DB dumps. Filename preflight is not a complete secret scanner. Use the PR template; state What, Why, How, exact tests, screenshots without PII, risks, migrations and rollback. Open the PR against dev-main, not main, for ordinary work.

Commit, push, PR creation, merge and production deployment are distinct actions covered only within the scope above. A request to inspect/prepare is not permission to publish or merge. Do not store a personal access token in scripts. Use an already-authorized GitHub connector/CLI; ask for login through its secure flow if missing.

After a verified merge, fetch again, compare local/remote refs and fast-forward clean relevant checkouts. Leave the workspace on synchronized dev-main when a task is finished; create a new task branch before the next edit. Retain the task branch until review/recovery needs finish; do not advance it to unrelated main commits. If conflicts/divergence occur, report exact affected paths and agree on a plan; no hard reset or force push.

## Versioning

Application `VERSION` establishes an **unreleased 0.1.0 baseline**, not a claim that a historical release existed. Client/server package versions remain unchanged to avoid unrelated lockfile churn. This is a coordinated storefront/API product release version, not a branch number.

- `0.1.1`: a small reviewed prelaunch repair.
- `0.2.0`: a meaningful prelaunch capability such as accepted progressive profiling.
- `1.0.0-rc.1`: optional candidate for launch acceptance, not ready merely by tagging.
- `1.0.0`: accepted real-customer release, after [launch gates](../prelaunch/README.md).
- Later patch/minor/major bumps follow compatible fixes/features/breaking changes to published contracts; document breaking migration/API effects explicitly.

Use annotated `vX.Y.Z` tags on accepted versioned release commits, never move an existing release tag. Release branches such as `release/0.2.0` are optional stabilization tools. Do not put version numbers on every feature branch or invent a version/tag for every website update. Tags, changelog and deployment record identify source, tests, migration/backup, artifact IDs, manual acceptance and rollback limits. See [SemVer](https://semver.org/).

Initial setup created no tag or push. The [first publication checkpoint](../work-checkpoints/2026-10-20-first-agent-publication.md) records the later push; the managed-release checkpoint records the subsequent authority and merges. Neither turns an unreleased baseline into accepted 1.0 readiness. Main-triggered hosting can deploy after a merge; inspect branch/environment/provider settings first. GitHub preview deployments must not silently inherit production database access. `npm start` in server runs Prisma migration deploy, so it is not a status check.
