import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE_NAME = 'doggy_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8 // 8 hours
const SESSION_TOKEN_VERSION = 'v1'

const sessions = new Map()

function now() {
  return Date.now()
}

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL
  const passwordHash = process.env.ADMIN_PASSWORD_HASH

  if (!email || !passwordHash) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD_HASH environment variables.')
  }

  return {
    email,
    passwordHash,
  }
}

function createSessionId() {
  return crypto.randomBytes(32).toString('hex')
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function buildAdminProfile(email) {
  return {
    id: 'admin-main',
    email,
    role: 'admin',
    name: 'Doggy Ent Admin',
  }
}

function normalizeOrigin(value) {
  return String(value || '')
    .trim()
    .replace(/\/$/, '')
}

function isLocalOrigin(value) {
  const origin = normalizeOrigin(value)

  return (
    !origin
    || origin.includes('localhost')
    || origin.includes('127.0.0.1')
    || origin.includes('::1')
  )
}

function hasDeployedFrontendOrigin() {
  return [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
  ].some((origin) => !isLocalOrigin(origin))
}

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production'
  const useCrossSiteCookie =
    isProduction || hasDeployedFrontendOrigin()

  return {
    httpOnly: true,
    secure: useCrossSiteCookie,
    sameSite: useCrossSiteCookie ? 'none' : 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/',
  }
}

function getSessionSigningSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET
    || process.env.ADMIN_PASSWORD_HASH

  if (!secret) {
    throw new Error(
      'Missing ADMIN_PASSWORD_HASH environment variable.',
    )
  }

  return secret
}

function base64UrlEncode(value) {
  return Buffer
    .from(JSON.stringify(value))
    .toString('base64url')
}

function base64UrlDecode(value) {
  return JSON.parse(
    Buffer.from(value, 'base64url').toString('utf8'),
  )
}

function signSessionPayload(encodedPayload) {
  return crypto
    .createHmac('sha256', getSessionSigningSecret())
    .update(encodedPayload)
    .digest('base64url')
}

function createSessionToken({ admin, expiresAt }) {
  const encodedPayload = base64UrlEncode({
    admin,
    expiresAt,
  })

  const signature = signSessionPayload(encodedPayload)

  return `${SESSION_TOKEN_VERSION}.${encodedPayload}.${signature}`
}

function verifySessionToken(sessionToken) {
  const [version, encodedPayload, signature] =
    String(sessionToken || '').split('.')

  if (
    version !== SESSION_TOKEN_VERSION
    || !encodedPayload
    || !signature
  ) {
    return null
  }

  const expectedSignature = signSessionPayload(encodedPayload)

  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length
    || !crypto.timingSafeEqual(
      signatureBuffer,
      expectedSignatureBuffer,
    )
  ) {
    return null
  }

  try {
    const payload = base64UrlDecode(encodedPayload)

    if (
      !payload?.admin?.email
      || !payload?.expiresAt
      || Number(payload.expiresAt) <= now()
    ) {
      return null
    }

    return payload.admin
  }
  catch {
    return null
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}

export function getSessionCookieOptions() {
  return getCookieOptions()
}

export async function loginAdmin({ email, password }) {
  const credentials = getAdminCredentials()
  const normalizedEmail = normalizeEmail(email)
  const normalizedAdminEmail = normalizeEmail(credentials.email)

  if (!normalizedEmail || !password) {
    const error = new Error('Email and password are required.')
    error.statusCode = 400
    throw error
  }

  const passwordMatches = await bcrypt.compare(password, credentials.passwordHash)

  if (normalizedEmail !== normalizedAdminEmail || !passwordMatches) {
    const error = new Error('Invalid admin credentials.')
    error.statusCode = 401
    throw error
  }

  const sessionId = createSessionId()
  const expiresAt = now() + SESSION_TTL_MS
  const admin = buildAdminProfile(normalizedAdminEmail)
  const sessionToken = createSessionToken({
    admin,
    expiresAt,
  })

  sessions.set(sessionId, {
    id: sessionId,
    admin,
    createdAt: new Date().toISOString(),
    expiresAt,
  })

  return {
    sessionId: sessionToken,
    admin,
    expiresAt: new Date(expiresAt).toISOString(),
  }
}

export async function getAdminFromSession(sessionId) {
  if (!sessionId) return null

  const tokenAdmin = verifySessionToken(sessionId)

  if (tokenAdmin) {
    return tokenAdmin
  }

  const session = sessions.get(sessionId)
  if (!session) return null

  if (session.expiresAt <= now()) {
    sessions.delete(sessionId)
    return null
  }

  return session.admin
}

export async function logoutAdmin(sessionId) {
  if (sessionId) {
    sessions.delete(sessionId)
  }

  return { success: true }
}

export function clearExpiredSessions() {
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt <= now()) {
      sessions.delete(sessionId)
    }
  }
}
