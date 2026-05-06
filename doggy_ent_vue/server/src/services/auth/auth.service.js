

import crypto from 'crypto'

const SESSION_COOKIE_NAME = 'doggy_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8 // 8 hours

const sessions = new Map()

function now() {
  return Date.now()
}

function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || 'admin@doggyent.local',
    password: process.env.ADMIN_PASSWORD || 'dev-password-change-me',
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

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/',
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

  if (normalizedEmail !== normalizedAdminEmail || password !== credentials.password) {
    const error = new Error('Invalid admin credentials.')
    error.statusCode = 401
    throw error
  }

  const sessionId = createSessionId()
  const expiresAt = now() + SESSION_TTL_MS
  const admin = buildAdminProfile(normalizedAdminEmail)

  sessions.set(sessionId, {
    id: sessionId,
    admin,
    createdAt: new Date().toISOString(),
    expiresAt,
  })

  return {
    sessionId,
    admin,
    expiresAt: new Date(expiresAt).toISOString(),
  }
}

export async function getAdminFromSession(sessionId) {
  if (!sessionId) return null

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