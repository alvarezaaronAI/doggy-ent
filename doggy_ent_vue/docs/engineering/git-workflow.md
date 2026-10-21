# Git, GitHub And Releases

## Current Baseline

Git root contains `doggy_ent_vue/`, which contains the application and this guide. Current integration is **dev-main**, not the older `dev` branch. Production source is **main**. Do not rename/delete branches to make a graph look cleaner. A future switch to `dev` needs an explicit coordinated decision covering default branch, CI, open PRs and deployment settings.

Fresh audit on 2026-10-20: dev-main and origin/dev-main at `ee26b6b`; origin/main at `b583b1f`. Main has 20 extra merge-history commits but identical content. Local main is older; no checkout/reset/merge of it was performed. A source comparison does not prove what is deployed.

## Branches

| Purpose | Default agent branch | Owner-requested alternative |
| --- | --- | --- |
| Feature | `codex/feat/pet-preferences` | `feat/pet-preferences` |
| Fix | `codex/fix/cart-variant` | `fix/cart-variant` |
| Urgent repair | `codex/hotfix/login-regression` | `hotfix/login-regression` |
| Docs | `codex/docs/privacy-inventory` | `docs/privacy-inventory` |
| Refactor | `codex/refactor/order-mapper` | `refactor/order-mapper` |
| Tests/maintenance | `codex/test/checkout-recovery`, `codex/chore/dependencies` | Equivalent type/topic |

Normal path: task branch -> PR -> dev-main -> reviewed release PR -> main. Use meaningful merge commits for integration/release PRs to preserve the visible branch graph the owner prefers. Squash is an alternative for noisy task history only when deliberately agreed; never manufacture empty branches/commits. Avoid long-lived release branches until needed. An approved hotfix can start from production, then must be reconciled into integration. Do not force-push shared branches.

## Before Editing

From the application directory:

```bash
git status
git diff --stat
git diff --name-status
node scripts/git-preflight.mjs --fetch
```

Status reveals staged/unstaged/untracked work. Diff commands describe local changes; fetch updates remote-tracking references without merging files. Preflight reports ahead/behind/divergence and matching production content without displaying remote URLs or env contents. Default inspection without `--fetch` clearly labels refs cached. Fetch failures stop a fresh audit. `--check` exits nonzero for a dirty/protected/detached/stale task baseline or tracked sensitive filenames; normal report mode is useful while a task is intentionally dirty. Missing upstream on a new task branch is expected.

If clean and the verified integration baseline is correct, a **new** task may use:

```bash
git switch dev-main
git merge --ff-only origin/dev-main
git switch -c codex/feat/pet-preferences
```

These are teaching examples, not commands to run inside an unfinished task. Stop on dirty state/divergence; understand file ownership first. Do not auto-stash (it can hide work), blindly pull or reset. A branch points to commits: it does not save uncommitted work, provider state, env files or the database. Worktrees isolate simultaneous tasks, not production data.

## Commit And PR Review

Use `<type>(optional-scope): short imperative summary`: feat, fix, hotfix, docs, refactor, chore, test, style. Prefer `fix:` for a hotfix commit even if its branch uses hotfix/. Formatting is style; visual/behavior changes are feat/fix. Explain outcome and why, not just 'updated files'.

After human authorization for the reviewed scope:

```bash
git add path/to/reviewed-file
git diff --cached --stat
git diff --cached
git commit -m "fix(cart): preserve selected product variant"
git push -u origin codex/fix/cart-variant
```

Review content privately for secrets before publication; never paste a sensitive diff into chat/logs. Avoid `git add .` for mixed trees. Never commit env files or DB dumps. Filename preflight is not a complete secret scanner. Use the PR template; state What, Why, How, exact tests, screenshots without PII, risks, migrations and rollback. Open the PR against dev-main, not main, for ordinary work.

Commit, push, PR creation, merge and production deployment are distinct actions. A request to inspect/prepare is not permission to publish or merge. Do not store a personal access token in scripts. Use an already-authorized GitHub connector/CLI; ask for login through its secure flow if missing.

After an approved merge, fetch again, compare local/remote refs, fast-forward the clean integration checkout when appropriate and retain the task branch until review/recovery needs finish. Synchronize main after an approved production release separately. If conflicts/divergence occur, report exact affected paths and agree on a plan; no hard reset or force push.

## Versioning

Application `VERSION` establishes an **unreleased 0.1.0 baseline**, not a claim that a historical release existed. Client/server package versions remain unchanged to avoid unrelated lockfile churn. This is a coordinated storefront/API product release version, not a branch number.

- `0.1.1`: a small reviewed prelaunch repair.
- `0.2.0`: a meaningful prelaunch capability such as accepted progressive profiling.
- `1.0.0-rc.1`: optional candidate for launch acceptance, not ready merely by tagging.
- `1.0.0`: accepted real-customer release, after [launch gates](../prelaunch/README.md).
- Later patch/minor/major bumps follow compatible fixes/features/breaking changes to published contracts; document breaking migration/API effects explicitly.

Use annotated `vX.Y.Z` tags on accepted release commits, never move an existing release tag. Release branches such as `codex/release/0.2.0` are optional stabilization tools. Do not put version numbers on every feature branch. Tags, changelog and deployment record identify source, tests, migration/backup, artifact IDs, manual acceptance and rollback limits. See [SemVer](https://semver.org/).

Initial setup created no tag or push. A subsequent explicit publication request may authorize a scoped commit/push/PR, as recorded in the [first publication checkpoint](../work-checkpoints/2026-10-20-first-agent-publication.md); it does not turn an unreleased baseline into an accepted release. Main-triggered hosting may deploy after a future merge; inspect branch/environment/provider settings before that action. GitHub preview deployments must not silently inherit production database access. `npm start` in server runs Prisma migration deploy, so it is not a status check.
