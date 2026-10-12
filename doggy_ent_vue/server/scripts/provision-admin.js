import { fileURLToPath } from 'node:url'
import { loadServerEnv } from '../src/config/env.js'

loadServerEnv({ rootDir: fileURLToPath(new URL('../', import.meta.url)) })
const apply = process.argv.includes('--apply')
const { prisma } = await import('../src/db/prisma.js')
try {
  const host = new URL(process.env.DATABASE_URL).hostname
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(host)
  if (!local && !process.argv.includes('--allow-remote')) throw new Error('Remote database provisioning requires a deliberate --allow-remote flag and approved target preflight.')
  const { provisionAdmin } = await import('../src/domains/auth/services/adminProvision.service.js')
  const result = await provisionAdmin({ email: process.env.ADMIN_EMAIL, passwordHash: process.env.ADMIN_PASSWORD_HASH, apply })
  console.log(result.alreadyProvisioned ? 'Admin is already provisioned; no changes.' : result.created ? 'Admin provisioned; no customer account or password was changed.' : 'Preflight passed; no writes. Use --apply only after confirming the target.')
} catch (error) {
  console.error(error.code === 'P2002' ? 'Account changed during provisioning; no credentials were overwritten.' : 'Admin provisioning failed. Check required variable names, target connectivity and account conflicts; no secret values are printed.')
  process.exitCode = 1
} finally { await prisma.$disconnect() }
