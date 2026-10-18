# Approved Layout Deployment

## Scope And Recovery

Owner explicitly approved deployment of the accepted Modern Boutique Home follow-up, Storybook Brand and Impact First Campaign layouts. Deploy matching backend presentation contracts before the frontend to the existing Railway doggy-ent production service and Vercel doggy-ent project. No commit/push, fixture replay, content publication, provider send, payment or new migration is authorized in this release.

## Preflight Complete

- Existing Railway project/service/environment and Vercel project/team/root verified. Previous live Railway `7714b914-cd87-4e7c-ab84-264abdd3637b`; Vercel `dpl_2E6UaeyT6QHFq589zMts7WWzygvN`. Keep these as rollback references.
- Existing dirty tree preserved, base HEAD `92ad29f`. This is a filtered local-source release, not a Git commit release.
- Client build passes: Vite 8.3.4, 2,305 modules. Client tests: 145 across 28 files (11/128/6). Server build passes, Prisma Client 6.16.2; tests: 139 across 34 files (28/105/6).
- Read-only database transaction: 22 complete/checksum-matching migrations; zero pending/failed/unknown entries. Startup migration command therefore has nothing to apply. Product 15, variants 30, users 3, orders 4, order items 7, promo/usage 1 each, campaigns 2, campaign usages 0, media 41. Publication revision 5, draft equals published. Private fingerprints recorded for postdeployment preservation comparison.
- Catalog guard: seven archived legacy records, seven historical order references, eight flagged test products and all sixteen variants rejected without provider calls.
- A temporary audit helper first used an incorrect Prisma delegate name; its read-only transaction failed without writes. Corrected to the schema's OrderCampaignUsage delegate; the full preflight passes. This was not an application failure.
- Vercel connector returns scope permission 403; the existing authenticated CLI successfully inspects the exact authorized project. Use that same scoped CLI, not a new project or a changed default team.

## Next Steps

1. Finish filtered manifest/syntax/generated-copy/security checks. Exclude env/credentials/dependencies/cache/build/private backups. Include untracked runtime files/assets.
2. Deploy Railway, wait for SUCCESS and validate health/public projection/CORS/auth protection.
3. Stage Vercel production without domain assignment; validate build and protected app response, then promote the tested deployment.
4. Verify live Home/Brand/Campaign/pop-outs, routes/assets and test protection. Repeat read-only DB baseline comparison.
5. Record exact IDs, commands/results/screenshots and remaining manual device/editor/payment QA here and in the handoff. Never describe a pending upload as complete.
