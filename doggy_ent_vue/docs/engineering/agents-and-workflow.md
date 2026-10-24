# Project Agents And Workflow

Updated: 2026-10-21. These seven local, reusable Codex role definitions are not hosted bots, scheduled jobs or new services running in the storefront. They inherit the parent session's access; instructions are not a security sandbox. No global settings, paid agent runtime or provider credentials are installed.

## Roles

| Agent | Job and benefit | Boundaries | Example request |
| --- | --- | --- | --- |
| `git_steward` | Check remote/local history, select a readable task branch, commit/push/create PRs, merge verified work and synchronize main/dev-main | Bounded owner-managed publication; no destructive sync or check/protection bypass | Use git_steward to finish this verified change through integration and main, then sync my primary branches. |
| `qa_engineer` | Run proportionate builds/tests and reproduce customer journeys on desktop/narrow layouts | No real users, payments, email, shipments or shared writes without approval | Use qa_engineer to test signup return-to-checkout and bag persistence with isolated fixtures. |
| `commerce_guardian` | Find pricing, idempotency, inventory, promo/campaign, ownership and authorization risks | Review first, no live transactions or migrations | Use commerce_guardian to review this checkout change and return blockers with tests. |
| `customer_data_steward` | Map existing data, optional profiling, consent, minimization, retention and deletion gaps | No customer exports, new trackers or legal certification | Use customer_data_steward to design an optional pet questionnaire using existing profile/order data. |
| `customer_experience` | Implement repeatable sign-in/create/recovery/profile UX, safe checkout return and shared bag/session behavior | Preserve Better Auth/guest checkout; coordinate privacy with data steward; no independent shared-data/provider/release authority | Use customer_experience to improve a customer journey and verify it with isolated fixtures. |
| `docs_curator` | Reconcile architecture, handoff, command evidence and resumable checkpoints | No invented verification/deployment claims | Use docs_curator to update the handoff and checkpoint from the verified changes. |
| `release_operator` | Verify source/deployment parity, existing targets, startup effects, rollback and post-release health | Managed existing-site releases; migrations/provider changes and 1.0 acceptance stay separate | Use release_operator to verify the main-triggered Railway/Vercel rollout for this ready change. |

Definitions: Git-root `.codex/agents/*.toml`. A repository-level AGENTS.md points into this application's operating guide. Agent files inherit the model instead of pinning a paid/possibly unavailable one. Ask explicitly to use named agents or delegate; simply saving definitions does not launch them. A new session/reload may be needed for discovery. This pass validates files against the documented schema, not a running custom-agent dispatch in this already-open session.

The [official custom-agent guide](https://learn.chatgpt.com/docs/agent-configuration/subagents) documents project-scoped TOML and inherited permissions. The [skill guide](https://learn.chatgpt.com/docs/build-skills) documents repository `.agents/skills` discovery. The `shop-git-workflow` skill provides the Git steward's repeatable procedure and is callable as `$shop-git-workflow` where skills are supported.

## How To Work Together

1. Human describes a bounded change. Git steward audits the baseline and creates a task branch before edits.
2. Main implementation agent makes focused changes following existing Vue/server domains. Separate concurrent write tasks use isolated worktrees and disjoint file ownership, not simultaneous edits to the same files.
3. QA verifies relevant journeys. Commerce guardian reviews high-risk flows. Data steward reviews new fields, tracking, consent and privacy implications when relevant.
4. Docs curator records verified evidence and pending work. Human reviews scope and results.
5. Under the owner's 2026-10-20 [managed-publication instruction](git-workflow.md#owner-authorized-managed-publication), Git steward completes the scoped commit/push/task PR, checks current-head CI/reviews, merges into dev-main and releases through a checked dev-main-to-main PR. Release operator verifies the existing Git-triggered Railway/Vercel rollout. Fetch and fast-forward clean local primary branches afterward. A request to inspect/plan/preview/wait/not publish overrides this flow.

The main agent coordinates these roles during an active task; saved definitions are not a bot watching GitHub when Codex is closed. Git steward owns mutations so two agents never race merges. Failed checks, dirty/divergent work, unexpected changes, unresolved review blockers or unapproved shared-data/provider effects stop the release. Capability or another agent's confidence is not approval. Do not ask repeatedly for actions already covered by the owner's bounded instruction. Follow the workflow's full gates and exceptions.

Do not run all seven for a typo. Start with one or two relevant roles; subagents consume extra tokens and coordination time. The original six remain; customer_experience is a focused implementation partner, not a replacement for customer_data_steward. Save checkpoints during long work because credit/time limits cannot reliably be predicted. Agent outputs are proposals/evidence, not approval from the human. CI is deterministic verification, not an AI agent.

## Installed Supporting Pieces

- [Git workflow](git-workflow.md): branch, Conventional Commit/PR and version conventions, educational command examples.
- Application `scripts/git-preflight.mjs`: read-only inspection plus optional fetch; tested against isolated Git fixtures.
- Git-root `.github/PULL_REQUEST_TEMPLATE.md`: What/Why/How/Testing/Risks/Rollback/Release.
- Git-root `.github/workflows/quality.yml`: client/server builds and tiers, helper tests, Node 22.15.0, read-only repository token, pinned action SHAs. PRs into dev-main/main or manual trigger. No deployment, migration, customer DB, provider key or external send. First hosted Ubuntu execution passed on PR #31; see [publication evidence](../work-checkpoints/2026-10-20-first-agent-publication.md).
- [Launch and data roadmap](../prelaunch/README.md): gates before real sales; policies remain drafts.

CI is not branch protection. After the first hosted run, the owner should require its successful client/server checks and PR review on main/dev-main, disable force pushes/deletion, and consider protecting workflow changes. Those remote settings were not changed. CI uses the pull-request event, never a privileged pull-request-target checkout. See [GitHub secure workflow guidance](https://docs.github.com/en/actions/reference/security/secure-use).

Initial connection check: Git fetch works and local `gh` is absent. The owner connected GitHub; PR #31 and hosted checks subsequently succeeded. The [managed-release checkpoint](../work-checkpoints/2026-10-20-managed-releases.md) records later merges, naming/sync changes and hosting verification. Never paste tokens into chat/source. Connector permission is capability, not independent authority beyond the owner's bounded instruction.

## Reuse On Another Website

Copy the Git-root `.codex/agents`, `.agents/skills/shop-git-workflow`, PR template and relevant engineering docs. Adapt the root guide, application path, integration/production branches, commands and provider safety rules. Copy the preflight script with `project-workflow.json`; run its fixture tests. Update CI working directories/Node/toolchain/lockfiles, and inspect the new project's tests before enabling CI. Never copy env files, tokens, customer data, remote project IDs or blindly reuse deployment approval. A new GitHub connector/CLI session needs that repository's authorization; these files cannot grant it.

Optional later additions: accessibility specialist after core flows stabilize; dependency/security triage on request; fulfillment/provider operator after manual shipping/email acceptance. Avoid autonomous customer-service or marketing send agents until permissions, audit, recipient review and manual-send policy are ready.
