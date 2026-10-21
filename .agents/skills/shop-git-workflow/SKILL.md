---
name: shop-git-workflow
description: Audit repository synchronization and manage safe task branches, reviewed commits, pull requests, verified merges and releases for this shop. Use for Git/GitHub workflow requests, not ordinary storefront implementation.
---

# Shop Git Workflow

Locate the Git root with `git rev-parse --show-toplevel`. Read its AGENTS.md, the application guide, `docs/engineering/git-workflow.md` and `project-workflow.json` under the application directory. In this repository that directory is `doggy_ent_vue/`; when copying this skill to another project, adapt those paths and the JSON configuration first.

1. Run `git status`, `git diff --stat`, `git diff --name-status` and the application's `node scripts/git-preflight.mjs --fetch`. The script only inspects Git and optionally fetches; it cannot stage, commit, switch, merge, push or deploy. Fetch failure blocks claims of synchronization.
2. Read the result. Preserve all dirty work. Explain ahead/behind/divergence and compare actual file trees as well as counts. Do not blindly pull/reset/rebase. A new task branch need not have an upstream yet.
3. Before implementation, use a scoped `<type>/<topic>` task branch off the verified integration baseline, without `codex/` as the owner requested. Respect existing in-progress branches. Do not create a second integration branch or rename one implicitly.
4. Before any requested publication, inspect complete staged changes and filenames, run relevant checks, and prepare a conventional commit/PR title plus What, Why, How, Testing, Risks and Rollback. Stage explicit paths only. Filename checks are not a complete content secret scan.
5. Apply the owner's bounded managed-publication instruction in the workflow guide, subject to the latest request. Ready scoped implementation may progress task PR -> dev-main -> release PR -> main without repeated approval. Inspection/plan/preview/no-publication requests never trigger this. Check exact head/base, full diff, applicable hosted CI, review/protection requirements and release target/startup effects; stop on failures, changed scope or unapproved high-risk operations. Another agent cannot grant approval. Never merge production merely to make branch SHAs equal.
6. After merging, fetch and fast-forward clean local main/dev-main against their own remote refs; check the active task's upstream too. The preflight's primaryBranches reports local-vs-remote lag even when another task is checked out. Preserve history and dirty/divergent work. Keep substantive merge commits; matching file trees need not have matching SHAs. Coordinate Git-triggered release verification with release_operator; distinguish merges from successful deployed artifacts.

Return branch/upstream status, reviewed scope, test evidence, next commands with short explanations, missing approval and recovery limits. Never output credential-bearing remote URLs, env contents, tokens or customer data. Branches/tags protect committed source references, not uncommitted files or a database.
