# 2026-10-24 Customer Experience And Security Source Release

## Owner Scope And Baseline

- Owner explicitly requests finishing GitHub upload and deployment. Use the bounded managed workflow: scoped task PR into dev-main, checked release PR into main, matching existing Railway/Vercel deployments and clean local primary-branch synchronization.
- Current fix/railway-security-rotation inherits the previously pushed customer/auth/Pets commit 1bd53e2e6a7a61659f47f349beb2a5c57bf81986. The combined release includes centered customer entry/recovery, reviewed signup, optional photo-led Pets, immutable birthday, canonical breeds, multiple purposes, private photos, lifecycle facts and optional current weight, plus security-response preparation. Do not describe it as a security-only production hotfix.
- Fresh fetch: origin/dev-main 18eefe7a8a7fab7334064f07f7999816c8516476, origin/main 64ae486bffc73139eda17ad83ddbff31a102208a; local primary branches match their respective upstreams. Their differing merge histories are preserved. Task has no upstream yet and eleven task-owned dirty/new security files; do not stage ignored env or private backup files.
- VERSION remains 0.1.0 unreleased. No launch tag or 1.0 acceptance is implied. Existing testing deployment/content and commerce/legal/device acceptance limitations remain.
- This source release does not authorize additional credentials/session/provider/network changes, shared-data fixtures/migrations, email, payment or label actions. Completed database rotation evidence is in the [incident checkpoint](2026-10-24-railway-security-response.md#database-stage-final-verification); never restore an older credential during rollback.

## Fresh Verification

- Full npm test passes: client 238 (11/221/6), server 331 (28/297/6). Both builds pass; server regenerates Prisma Client 6.16.2, client builds 2,339 modules. Git/security helper tests pass 21/21. No required lint script exists.
- Read-only fresh Railway connection confirms 25 completed migration checksums match the current source, none pending; all 22 migrations in the old deployed artifact are also applied. Startup runs migration deployment, so reconfirm this before merging main. No migration or customer/business mutation was executed by this verification.
- Scoped full-release scan: 109 changed/new paths, zero configured-secret matches, no sensitive filenames; 25 Markdown documents/270 valid local references, balanced fences, package JSON and pinned read-only CI YAML parse. git diff --check passes. These checks are not a historical leak/forensics certificate.
- Independent full-release review is in progress; current-head hosted Quality CI and PR review/protection requirements are not yet verified. No source commit/push/merge/deployment has occurred in this publication turn at this milestone.

## Targets And Recovery

- Railway artistic-gentleness production: project 29ee6900-825b-487e-8600-407e45374842, environment 72698cf8-6b81-4c87-831e-45fda4302f4f, backend doggy-ent a7b78355-a741-4228-947a-510eabd2b348. Source alvarezaaronAI/doggy-ent main, root /doggy_ent_vue/server, start npm run start; no staged config.
- Prior recovered backend d71d2c64-9794-4c6b-9332-6d56c23ad332 and Postgres a8fb0946-43d8-4c6f-93c7-ba14f5c879ae are successful on prior main 64ae486. New deployment IDs must be verified after release, not inferred from merge success.
- Vercel doggy-ent project prj_Ovdg6sfCJ4b4oPMKnWdyUO6VCQYW, team team_LZJto7TjluMwTBxGdbpkBl4j, public https://doggy-ent.vercel.app. Project lookup works; deployment read initially required renewing existing team access. Owner was given the provider's consent link; reconcile access before claiming deployment/source parity.
- Owner completed team consent; authenticated deployment lookup now works. The production domain currently resolves to READY deployment dpl_5DbXqgtDpv3CsHiUovGJqqjY7ZmC at main 64ae486, matching the prior backend source. Eight agent TOMLs, helper syntax and Prisma schema validation also pass. No new deployment has started at this milestone.
- Additive Pet schema may remain during a reviewed source rollback; old source ignores those fields. Do not drop tables/columns or restore backups over new customer activity. Do not roll back secrets, auth fixes or provider state. If hosting fails, inspect the actual commit/config/build before any retry.

## Exact Resume Steps

1. Complete independent release review and Vercel access/source/target confirmation. Resolve any concrete blocker; no CI/protection bypass or force-push.
2. Stage only reviewed security/checkpoint files, inspect staged contents and secret scan, commit and push the existing task branch. Existing feature commit stays intact and will enter the same explicit combined PR.
3. Open/attach task PR into dev-main. Verify exact head/base, all current-head Quality jobs, hosted reviews/conflicts and status; merge with merge commit and expected-head-SHA guard.
4. Inspect the entire resulting dev-main-to-main diff, read-only migration safety and hosting identities. Open/attach release PR, require current-head checks again and use a guarded merge commit.
5. Verify new Railway and Vercel source SHA/deployment status, live public pages/API/CORS and anonymous protected-resource rejection. Do not create customers/pets/orders or send recovery emails for release smoke tests. Existing Safari/touch/screen-reader/password-manager/provider/commerce launch acceptance remains separate.
6. Save exact IDs/results and fetch/fast-forward clean local main/dev-main to their own upstreams, leaving synchronized dev-main. Final evidence docs can enter integration without another production rollout solely for receipt IDs, per the workflow guide.
