import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

export const ADMIN_GATEWAY_MAX_BYTES = 1024

export function getAdminGatewayConfig(env = process.env) {
  const flag = env.ADMIN_GATEWAY_REQUIRED
  if (flag !== undefined && flag !== 'true' && flag !== 'false') {
    throw new Error('ADMIN_GATEWAY_REQUIRED must be true or false.')
  }
  if (flag !== 'true') return { required: false }

  const secret = env.ADMIN_GATEWAY_SECRET
  if (typeof secret !== 'string' || secret.length < 32 || /\s/.test(secret)
    || Buffer.byteLength(secret, 'utf8') > ADMIN_GATEWAY_MAX_BYTES) {
    throw new Error('ADMIN_GATEWAY_SECRET must contain at least 32 characters, no whitespace and at most 1024 bytes when the admin gateway is required.')
  }
  return { required: true, secret }
}

export function getAuthSecret() {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.ADMIN_SESSION_SECRET
  if (!secret && process.env.NODE_ENV === 'production') throw new Error('A dedicated Better Auth signing secret is required in production.')
  if (process.env.NODE_ENV === 'production' && secret.length < 32) throw new Error('The production auth signing secret must contain at least 32 characters.')
  return secret || process.env.ADMIN_PASSWORD_HASH
}

export function getAuthBaseURL() {
  const url = process.env.BETTER_AUTH_URL || process.env.API_BASE_URL
  if (!url && process.env.NODE_ENV === 'production') throw new Error('BETTER_AUTH_URL is required in production.')
  const value = url || `http://localhost:${process.env.PORT || 3000}`
  let parsed
  try { parsed = new URL(value) } catch { throw new Error('BETTER_AUTH_URL must be a valid backend URL.') }
  if (parsed.username || parsed.password || !['http:', 'https:'].includes(parsed.protocol)
    || process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') throw new Error('Production auth requires an HTTPS backend URL without credentials.')
  if (parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('BETTER_AUTH_URL must be the backend origin, without an auth path, query or fragment.')
  return parsed.origin
}

export function getTrustedAuthOrigins() {
  const configured = [process.env.FRONTEND_URL, process.env.CLIENT_URL]
    .flatMap(value => String(value || '').split(','))
    .map(value => value.trim().replace(/\/$/, '')).filter(Boolean)
  return [...new Set([...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173']), ...configured])]
}

export function getFrontendOrigin() {
  const configured = [process.env.FRONTEND_URL, process.env.CLIENT_URL]
    .flatMap(value => String(value || '').split(',')).map(value => value.trim()).find(Boolean)
  if (!configured && process.env.NODE_ENV === 'production') throw new Error('A frontend origin is required for account email return links.')
  let url
  try { url = new URL(configured || 'http://localhost:5173') } catch { throw new Error('The frontend origin must be a valid URL.') }
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash || !['http:', 'https:'].includes(url.protocol)
    || process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('Account email links require a valid frontend origin; production requires HTTPS.')
  return url.origin
}

function normalizeDataTarget(value) {
  const target = String(value || '')
    .trim()
    .toUpperCase()

  if (
    target === 'RAILWAY'
    || target === 'RAILWAY_DB'
  ) {
    return 'RAILWAY_DB'
  }
  if (target === 'DEPLOYED') return 'DEPLOYED'

  return 'LOCAL'
}

export function validateDatabaseTarget({ databaseUrl, dataTarget, hasRailwayOverride = false }) {
  let host
  try { host = new URL(databaseUrl).hostname } catch { throw new Error('DATABASE_URL must identify the selected database.') }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(host)
  if (dataTarget === 'LOCAL' && !local) throw new Error('LOCAL mode requires a loopback database. Use the deliberate Railway DB startup mode for a remote database.')
  if (dataTarget === 'RAILWAY_DB' && (local || !hasRailwayOverride)) throw new Error('Railway DB mode requires a remote DATABASE_URL override in .env.railway.local.')
}

export function loadServerEnv({
  rootDir,
} = {}) {
  const serverRoot = rootDir || process.cwd()
  const baseEnvPath = path.resolve(serverRoot, '.env')

  dotenv.config({
    path: baseEnvPath,
    quiet: true,
  })

  const overrideEnvFile = String(
    process.env.DOGGY_SERVER_ENV_FILE || '',
  ).trim()

  let overrideEnv = {}

  if (overrideEnvFile) {
    const overrideEnvPath = path.resolve(serverRoot, overrideEnvFile)

    if (!fs.existsSync(overrideEnvPath)) {
      throw new Error(
        `Server env override file was not found: ${overrideEnvFile}`,
      )
    }

    overrideEnv = dotenv.parse(
      fs.readFileSync(overrideEnvPath),
    )

    dotenv.config({
      path: overrideEnvPath,
      override: true,
      quiet: true,
    })
  }

  getAdminGatewayConfig()

  process.env.ADMIN_DATA_TARGET = process.env.NODE_ENV === 'production' ? 'DEPLOYED' : normalizeDataTarget(
    process.env.DOGGY_SERVER_ENV_TARGET || process.env.ADMIN_DATA_TARGET,
  )

  if (
    process.env.ADMIN_DATA_TARGET === 'RAILWAY_DB'
    && !overrideEnv.DATABASE_URL
  ) {
    throw new Error(
      'Railway DB mode requires DATABASE_URL in .env.railway.local so it cannot accidentally use the local database.',
    )
  }
  validateDatabaseTarget({ databaseUrl: process.env.DATABASE_URL, dataTarget: process.env.ADMIN_DATA_TARGET, hasRailwayOverride: Boolean(overrideEnv.DATABASE_URL) })
  if (process.env.NODE_ENV === 'production') getFrontendOrigin()

  return {
    dataTarget: process.env.ADMIN_DATA_TARGET,
    envFile: overrideEnvFile || '.env',
  }
}

export function getAdminDataTarget() {
  const dataTarget = process.env.NODE_ENV === 'production' ? 'DEPLOYED' : normalizeDataTarget(
    process.env.ADMIN_DATA_TARGET,
  )
  if (dataTarget === 'DEPLOYED') return { code: 'DEPLOYED', label: 'DEPLOYED DATA TARGET', description: 'Deployed server uses its configured database.' }

  if (dataTarget === 'RAILWAY_DB') {
    return {
      code: 'RAILWAY_DB',
      label: 'RAILWAY DB TARGET',
      description: 'Local server writes to Railway DB.',
    }
  }

  return {
    code: 'LOCAL',
    label: 'LOCAL DATA TARGET',
    description: 'Local server writes to local DB.',
  }
}
