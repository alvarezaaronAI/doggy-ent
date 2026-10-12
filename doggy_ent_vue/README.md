# Chase And Evie Co Commerce

Vue/Vite storefront, customer accounts and admin workspace backed by Express, Better Auth, Prisma/PostgreSQL and Stripe. Guest checkout remains supported. Operational emails require an explicit admin preview/send. This repository is not yet cleared for real-customer launch; see the [production audit](docs/audits/2026-10-11-production-audit.md).

Read [AGENTS.md](AGENTS.md) and [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) before changes. See [architecture](docs/architecture/README.md), [auth and provisioning](docs/architecture/auth-roadmap.md), and [verification](docs/verification-and-qa.md).

For fully local development, run `npm run dev:local` separately in server and client. Railway DB admin uses server `npm run dev:railway` plus client `npm run dev:local`; it is a real shared-data target, not a sandbox. Ignored local env files are required; variable names and deployment precautions are documented, never secret values.

Run `npm run build` and `npm test` in both applications. Server build generates Prisma rather than bundling JavaScript. Server `npm start` applies migrations; do not use it as an unapproved shared-database verification command. Admin provisioning is deliberate and separate from startup.
