import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { envPaths, inspectLocalSecrets } from './security-preflight.mjs'

function fixture(files, run, git = { available: true, tracked: new Set(), ignored: new Set(envPaths) }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shop-security-fixture-'))
  try {
    for (const [name, value] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
      fs.writeFileSync(path.join(root, name), value)
    }
    run(inspectLocalSecrets({ root, git }), root)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}
const canary = 'fixture-sensitive-value-never-render-0123456789'

test('prints names/presence only, never credential values, URLs or hashes', () => fixture({
  'server/.env': `BETTER_AUTH_SECRET=${canary}\nDATABASE_URL=postgresql://fixture:${canary}@fixture.invalid/db\nADMIN_PASSWORD_HASH=${canary}-hash`,
  'server/src/example.js': 'const value = process.env.RESEND_API_KEY',
}, report => {
  assert.equal(report.mode, 'READ_ONLY_PLAN')
  assert.equal(report.rotationExecuted, false)
  assert.equal(report.networkRequests, 0)
  const text = JSON.stringify(report)
  assert(!text.includes(canary)); assert(!text.includes('postgresql://'))
  assert(report.sourceReferencedVariables.includes('RESEND_API_KEY'))
  assert(report.files[0].variables.some(item => item.name === 'DATABASE_URL' && item.configured && item.category === 'credential'))
}))

test('does not load env into the process or modify any file', () => fixture({
  'server/.env': `BETTER_AUTH_SECRET=${canary}\nSECURITY_FIXTURE_NOT_LOADED=${canary}`,
}, (report, root) => {
  const before = fs.readFileSync(path.join(root, 'server/.env'), 'utf8')
  const old = process.env.SECURITY_FIXTURE_NOT_LOADED
  inspectLocalSecrets({ root, git: { available: true, tracked: new Set(), ignored: new Set(envPaths) } })
  assert.equal(process.env.SECURITY_FIXTURE_NOT_LOADED, old)
  assert.equal(fs.readFileSync(path.join(root, 'server/.env'), 'utf8'), before)
  assert.deepEqual(fs.readdirSync(root), ['server'])
}))

test('models Railway overlay inheritance and exact auth fallback precedence', () => fixture({
  'server/.env': `ADMIN_SESSION_SECRET=${canary}\nADMIN_PASSWORD_HASH=${canary}-bootstrap`,
  'server/.env.railway.local': `BETTER_AUTH_SECRET=${canary}-dedicated`,
}, report => {
  assert.equal(report.targets[0].authVariable, 'ADMIN_SESSION_SECRET')
  assert.equal(report.targets[1].authVariable, 'BETTER_AUTH_SECRET')
  assert(report.targets.every(target => target.sameAuthAndCapabilityKey))
  assert(report.targets.every(target => target.bootstrapHashChangesPersistedAdminPassword === false))
}))

test('flags provisioning-hash fallback without falsely using it for capabilities', () => fixture({
  'server/.env': `ADMIN_PASSWORD_HASH=${canary}`,
}, report => {
  assert(report.findings.some(finding => finding.code === 'AUTH_USES_PROVISIONING_HASH' && finding.severity === 'high'))
  assert.equal(report.targets[0].capabilityVariable, null)
  assert.equal(report.targets[0].sameAuthAndCapabilityKey, false)
}))

test('flags short and whitespace signing keys, including a truthy whitespace override', () => fixture({
  'server/.env': `BETTER_AUTH_SECRET="   "\nADMIN_SESSION_SECRET=short`,
}, report => {
  assert.equal(report.targets[0].authVariable, 'BETTER_AUTH_SECRET')
  assert.equal(report.findings.filter(item => item.code === 'AUTH_SECRET_TOO_SHORT_OR_BLANK').length, 2)
}))

test('distinguishes public Stripe key/origins from private frontend credentials', () => fixture({
  'client/.env.local': `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_fixture\nVITE_API_BASE_URL=https://api.example.invalid\nVITE_PRIVATE_TOKEN=${canary}\nVITE_DATABASE_URL=postgresql://fixture:${canary}@fixture.invalid/db`,
}, report => {
  const hits = report.findings.filter(finding => finding.code === 'CLIENT_CREDENTIAL_REVIEW')
  assert.deepEqual(hits.map(item => item.name).sort(), ['VITE_DATABASE_URL', 'VITE_PRIVATE_TOKEN'])
  assert(report.findings.some(finding => finding.code === 'PUBLIC_URL_CONTAINS_CREDENTIALS'))
  assert(!JSON.stringify(report).includes(canary))
}))

test('coupled locations are reported by name, not secret or fingerprint', () => fixture({
  'server/.env': `BETTER_AUTH_SECRET=${canary}\nADMIN_SESSION_SECRET=${canary}`,
  'server/.env.railway.local': `BETTER_AUTH_SECRET=${canary}`,
}, report => {
  const coupled = report.findings.find(finding => finding.code === 'COUPLED_ROTATION_LOCATIONS')
  assert.equal(coupled.locations.length, 3)
  assert(!Object.hasOwn(coupled, 'value')); assert(!Object.hasOwn(coupled, 'hash'))
  assert(!JSON.stringify(report).includes(canary))
}))

test('tracked or unignored env files require review; missing files stay unknown, not missing live secrets', () => fixture({
  'server/.env': `BETTER_AUTH_SECRET=${canary}`,
}, report => {
  assert(report.findings.some(finding => finding.code === 'ENV_FILE_TRACKED'))
  assert(report.findings.some(finding => finding.code === 'ENV_FILE_NOT_IGNORED'))
  assert(report.files.some(file => !file.exists))
  assert.match(report.scope, /NOT verified/)
}, { available: true, tracked: new Set(['server/.env']), ignored: new Set() }))

test('unavailable Git protection is explicit rather than a clean certificate', () => fixture({}, report => {
  assert(report.findings.some(finding => finding.code === 'GIT_FILE_PROTECTION_UNVERIFIED'))
}, { available: false, tracked: new Set(), ignored: new Set() }))

test('the CLI refuses --apply before reading local credentials', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./security-preflight.mjs', import.meta.url)), '--apply'], { encoding: 'utf8' })
  assert.equal(result.status, 2)
  assert.equal(result.stdout, '')
  assert.match(result.stderr, /Read-only tool/)
})
