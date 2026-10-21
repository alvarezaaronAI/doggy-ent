# 2026-10-20 Prelaunch Foundation

## Request And Safety

Set up reusable project agents/Git workflow, plan low-friction customer data collection and add missing static policy pages. No auth rebuild, analytics rollout, database/provider mutation, commit, push, merge or deployment in this task.

## Starting Evidence

- Clean `dev-main` at `ee26b6b`; fresh origin fetch succeeded.
- HEAD and origin/dev-main were equal. Origin/main at `b583b1f` has 20 extra merge-history commits but an identical file tree. No missing content was found by that comparison; deployment state was not inspected.
- Created task branch `codex/chore/prelaunch-foundation` before edits. Existing `dev`, `dev-main` and `main` were not renamed/deleted/merged.
- Actual Git root is the parent of the application folder. Agent discovery and `.github` belong at that root.
- Owner supplied business display name Chase and Evie Co and temporary public contact info.chasenevie@gmail.com. Operating jurisdiction, selling destinations and shipping/refund terms are unconfirmed. Owner explicitly requested drafts pending approval.

## Implementation Milestone

- Added six narrow project-scoped agent definitions and a portable Git workflow skill, without changing global configuration, models, permissions or providers.
- Established an unreleased 0.1.0 tracking baseline. No tag created; server package version 1.0.0 is not launch acceptance.
- Completed source: deterministic Git audit/seven fixtures, PR template and non-deploying client/server CI with pinned action SHAs/read-only token; policy routes/shared shell/notice; phased customer-data/storage/policy/launch documentation. Existing auth, commerce, admin, schema and env files are unchanged.

## Files Changed

Git-root additions (the parent of this application):

- `AGENTS.md` forwarding entry point.
- `.codex/agents/git_steward.toml`, `qa_engineer.toml`, `commerce_guardian.toml`, `customer_data_steward.toml`, `docs_curator.toml`, `release_operator.toml`.
- `.agents/skills/shop-git-workflow/SKILL.md`.
- `.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/quality.yml`.

Application additions:

- `project-workflow.json`, `VERSION`, `CHANGELOG.md`.
- `scripts/git-preflight.mjs`, `scripts/git-preflight.test.mjs`.
- Policies domain: `content/policyPages.js`; `views/PolicyView.vue`; `components/PolicyShell.vue`, `PolicyContent.vue`, `StorageNotice.vue`; `composables/usePolicyMetadata.js`, `useStorageNotice.js`; `utils/storageNotice.js`.
- `client/tests/tier2/storefront/policy-pages.test.js`.
- `docs/engineering/agents-and-workflow.md`, `docs/engineering/git-workflow.md`.
- `docs/prelaunch/README.md`, `customer-data-strategy.md`, `policy-and-storage-inventory.md`; this checkpoint.

Application modifications:

- `AGENTS.md`, `PROJECT_HANDOFF.md`.
- `client/src/App.vue`, `client/src/app/router/index.js`, `client/src/app/layouts/SiteFooter.vue`.
- `docs/customer-experience.md`, `docs/implementation-roadmap.md`, `docs/verification-and-qa.md`.
- `docs/architecture/README.md`, `database.md`, `data-flow.md`, `file-map.md`.

File responsibilities/dependencies are mapped in [architecture file map](../architecture/file-map.md#prelaunch-foundation-2026-10-20).

## Verification And Next Steps

Completed checks:

- Initial status/diff-stat/name-status, fresh `git fetch origin --prune`, HEAD/upstream counts and `git diff --stat origin/main origin/dev-main`: clean/synchronized integration and matching production file tree. Created task branch before edits.
- `node --test scripts/git-preflight.test.mjs`: 7/7, isolated temporary repos removed by fixtures. No application Git mutations from the helper tests.
- `node scripts/git-preflight.mjs`: report passes and labels cached refs. `node scripts/git-preflight.mjs --fetch --check`: fresh fetch succeeds; intentionally exits 1 only for this task's dirty files. No tracked/staged sensitive filenames. This is the correct guard, not a clean commit certificate.
- `npm exec vitest run tests/tier2/storefront/policy-pages.test.js` in client: 12/12.
- Client `npm run build`: Vite 8.3.4, 2,314 modules, success. Client `npm test`: 170 tests/32 files, all tiers pass (11/153/6).
- Server `npm run build`: generated Prisma Client 6.16.2, success; no schema/migration change. Server `npm test`: 143 tests/35 files, all tiers pass (28/109/6). No `npm start` or migration command.
- Node syntax checks on new JS/MJS files pass.
- Bundled Python 3.12 TOML parser: all six agent files have the documented required fields and unique matching names; no permission/model/provider overrides. CI YAML parses, two expected jobs, read-only permission, immutable action SHAs, no secret references. Official action v4 refs were resolved read-only before pinning.
- Skill creator `quick_validate.py`: passes. System Python lacked YAML/TOML; validation was rerun with bundled Python and PyYAML installed into task-only `/tmp/doggy-agent-validation-deps`, not into application/global dependencies. No package/lockfile changes.
- Markdown fence/relative-file-link check passes: 19 Markdown files, 192 relative file links. Changed docs contain no new Mermaid, so no diagram-render claim. `git diff --check` passes. All 42 changed/new text files were checked for token/private-key/credential-URL candidates with none found; limited pattern scan, not a complete historical secret audit. No `.env.example` found/created.

Browser evidence:

- All six local policy pages render/navigate with draft banner, supplied contact and appropriate title/noindex. No overflow at actual 1,024 px. Existing signed-in header and two-item bag stay intact, without changing cart contents or signing in/out.
- Returning to Home restores prior title and removes draft robots; footer navigation returns to Privacy.
- A temporary production-bundle preview on port 5182 shows no development routing panel. Storage notice appears, dismisses, and stays dismissed after reload. No optional tracker consent or marketing flag is changed.
- No captured application errors in the local policy tab; existing Stripe HTTP warning remains. Eager imports currently initialize Stripe beyond checkout; inventory flags this for a future provider-loading/privacy review.
- Requested 390x844 viewport override still reported actual 1,024 px even after reload. Override reset. Real mobile/Safari/keyboard/screen-reader checks remain unverified; do not claim a narrow screenshot passed.
- Screenshot proof at `/tmp/doggy-prelaunch-policy-preview.png`. Local `/privacy` tab left for owner review; temporary preview tab closed and task-owned preview process stopped. Existing user dev server on 5173 left running.

## Remaining Work And Exact Next Steps

1. Owner reviews this branch/source and agent invocation in a fresh Codex session. Custom TOML schema/skill were validated, but named custom-agent dispatch in this running session was not tested. Saved roles are not scheduled background workers.
2. GitHub connection is now confirmed: owner installed/connected during the turn; read-only authenticated-login/repository checks succeeded for `alvarezaaronAI/doggy-ent`, default main, merge commits allowed. `gh` is absent, but connector PR/CI tools and Git fetch are available. No remote settings changed; connection does not authorize publishing.
3. Only on explicit publication request, review all 42 changed/new paths, commit/push scoped changes, open a dev-main PR, run hosted Quality CI, then configure required checks/protection deliberately. No remote workflow run is claimed.
4. Owner confirms registered business identity/location/markets and shipping/food-return/refund terms, production provider/storage/retention/request handling, then legal review. All six pages remain drafts. Dedicated support inbox can replace the supplied temporary public email later.
5. Prioritize durable checkout/payment recovery and atomic inventory/promo/campaign attribution launch gates, then minimal auth UX and optional profile/consent storage. OAuth Google/Apple comes last, with business-owned providers and exact callback/linking tests. No model change is preauthorized.
6. Manual QA: real phone/Safari, keyboard/zoom/screen-reader, fresh/blocked browser storage, no notice over primary checkout actions, footer links, shared bag/auth and final production network/cookie inventory. Use approved test workflows, never real provider sends/payments by default.

## Operations

Only Git fetch/task-branch creation, source edits, provider-free tests and local browser reads occurred. No deliberate shared DB query/write, migration, environment change, account provisioning, email, payment, shipment, commit, push, merge or deployment. Existing application read requests run normally in the browser. Task-owned production preview stopped; no needed command session remains. Tree is ready for source/commit review, not certified for launch or policy publication.
