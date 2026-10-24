import fs from 'node:fs'
import path from 'node:path'
import { parseEnv } from 'node:util'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

export const envPaths = Object.freeze([
  'server/.env', 'server/.env.railway.local',
  'client/.env', 'client/.env.local', 'client/.env.production', 'client/.env.production.local',
])
const publicNames = new Set([
  'VITE_STRIPE_PUBLISHABLE_KEY', 'VITE_API_BASE_URL', 'VITE_API_URL',
  'VITE_ADMIN_DATA_TARGET', 'VITE_INSTAGRAM_URL', 'VITE_TIKTOK_URL',
  'VITE_YOUTUBE_URL', 'VITE_STRIPE_DASHBOARD_PAYMENTS_URL',
])
const privateNames = new Set([
  'DATABASE_URL', 'DATABASE_PUBLIC_URL', 'PGPASSWORD', 'POSTGRES_PASSWORD',
  'BETTER_AUTH_SECRET', 'ADMIN_SESSION_SECRET', 'ADMIN_PASSWORD_HASH',
  'BETTER_AUTH_API_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY', 'SHIPPO_API_KEY', 'SHIPPO_API_TOKEN', 'SHIPPO_WEBHOOK_SECRET',
  'RAILWAY_TOKEN', 'RAILWAY_API_TOKEN', 'VERCEL_TOKEN', 'GITHUB_TOKEN', 'GH_TOKEN',
])
const privateValue = value => /^(?:sk|rk)_(?:test|live)_|^whsec_|^gh[pousr]_|^postgres(?:ql)?:\/\/[^/]*:[^/]*@|-----BEGIN .*PRIVATE KEY-----/.test(value)
const privateName = name => privateNames.has(name) || /(?:SECRET|PASSWORD|TOKEN|PRIVATE_KEY|API_KEY)$/.test(name)
const present = value => typeof value === 'string' && value.trim().length > 0
const category = name => publicNames.has(name) ? 'public-configuration' : privateName(name) ? 'credential' : name.startsWith('VITE_') ? 'public-configuration-review' : 'configuration'

function gitFacts(root) {
  const run = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim().split('\n').filter(Boolean)
  try {
    const tracked = new Set(run(['ls-files', '--', ...envPaths]))
    let ignored
    try { ignored = new Set(run(['check-ignore', '--no-index', '--', ...envPaths])) }
    catch (error) { if (error.status !== 1) throw error; ignored = new Set() }
    return { available: true, tracked, ignored }
  } catch { return { available: false, tracked: new Set(), ignored: new Set() } }
}

function sourceNames(root) {
  const names = new Set()
  const walk = directory => {
    if (!fs.existsSync(directory)) return
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(file)
      else if (entry.isFile() && /\.(js|mjs|ts|vue)$/.test(file)) {
        const text = fs.readFileSync(file, 'utf8')
        for (const match of text.matchAll(/(?:process\.env|import\.meta\.env)\.([A-Z][A-Z0-9_]{0,79})\b/g)) names.add(match[1])
      }
    }
  }
  for (const directory of ['server/src', 'server/scripts', 'client/src']) walk(path.join(root, directory))
  return [...names].sort()
}

export function inspectLocalSecrets({ root, git = gitFacts(root) }) {
  const findings = [], files = [], environments = new Map(), sameValue = new Map()
  const add = (severity, code, details = {}) => findings.push({ severity, code, ...details })
  if (!git.available) add('review', 'GIT_FILE_PROTECTION_UNVERIFIED')
  for (const relative of envPaths) {
    const file = path.join(root, relative), exists = fs.existsSync(file)
    const item = { path: relative, exists, tracked: git.tracked.has(relative), ignored: git.ignored.has(relative), variables: [] }
    files.push(item)
    if (!exists) continue
    if (item.tracked) add('high', 'ENV_FILE_TRACKED', { path: relative })
    if (git.available && !item.ignored) add('high', 'ENV_FILE_NOT_IGNORED', { path: relative })
    let values
    try { values = parseEnv(fs.readFileSync(file, 'utf8')) }
    catch { add('high', 'ENV_FILE_UNREADABLE', { path: relative }); continue }
    environments.set(relative, values)
    for (const name of Object.keys(values).sort()) {
      if (!/^[A-Z][A-Z0-9_]{0,79}$/.test(name)) { add('review', 'UNSUPPORTED_VARIABLE_NAME', { path: relative }); continue }
      const value = values[name], configured = present(value)
      item.variables.push({ name, category: category(name), configured })
      if (relative.startsWith('client/') && configured && (privateName(name) && !publicNames.has(name) || privateValue(value))) {
        add('high', 'CLIENT_CREDENTIAL_REVIEW', { path: relative, name })
      }
      if (configured && name.startsWith('VITE_') && /URL$/.test(name)) {
        try { const url = new URL(value); if (url.username || url.password) add('high', 'PUBLIC_URL_CONTAINS_CREDENTIALS', { path: relative, name }) } catch { /* URL validity is checked by the application. */ }
      }
      if (value && (name === 'BETTER_AUTH_SECRET' || name === 'ADMIN_SESSION_SECRET') && (!configured || value.length < 32)) add('high', 'AUTH_SECRET_TOO_SHORT_OR_BLANK', { path: relative, name })
      if (configured && category(name) === 'credential') {
        const locations = sameValue.get(value) || []
        locations.push(`${relative}:${name}`); sameValue.set(value, locations)
      }
    }
  }
  const base = environments.get('server/.env') || {}, overlay = environments.get('server/.env.railway.local')
  const targets = [
    { target: 'local-server', values: base },
    ...(overlay ? [{ target: 'local-server-with-railway-db', values: { ...base, ...overlay } }] : []),
  ].map(({ target, values }) => {
    const selected = ['BETTER_AUTH_SECRET', 'ADMIN_SESSION_SECRET', 'ADMIN_PASSWORD_HASH'].find(name => Boolean(values[name])) || null
    if (selected !== 'BETTER_AUTH_SECRET') add('review', 'AUTH_USES_LEGACY_FALLBACK', { target, selectedVariable: selected })
    if (selected === 'ADMIN_PASSWORD_HASH') add('high', 'AUTH_USES_PROVISIONING_HASH', { target })
    const capabilitySelected = ['BETTER_AUTH_SECRET', 'ADMIN_SESSION_SECRET'].find(name => Boolean(values[name])) || null
    return { target, authVariable: selected, capabilityVariable: capabilitySelected, sameAuthAndCapabilityKey: Boolean(selected && selected === capabilitySelected), bootstrapHashChangesPersistedAdminPassword: false }
  })
  for (const locations of sameValue.values()) if (locations.length > 1) add('review', 'COUPLED_ROTATION_LOCATIONS', { locations })
  return {
    mode: 'READ_ONLY_PLAN', scope: 'Local files and source references only. Railway/Vercel dashboards, key validity, compromise and completed rotation are NOT verified.',
    files, targets, sourceReferencedVariables: sourceNames(root), findings,
    rotationExecuted: false, networkRequests: 0, secretValuesPrinted: false,
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  if (args.some(arg => arg !== '--check')) {
    console.error('Read-only tool: only --check is supported. No apply/rotate operation exists.')
    process.exitCode = 2
  } else {
    try {
      const report = inspectLocalSecrets({ root: fileURLToPath(new URL('../', import.meta.url)) })
      console.log(JSON.stringify(report, null, 2))
      if (args.includes('--check') && report.findings.some(finding => finding.severity === 'high')) process.exitCode = 1
    } catch {
      console.error('Read-only security inventory failed. No secret values or raw errors are printed; no rotation was attempted.')
      process.exitCode = 1
    }
  }
}
