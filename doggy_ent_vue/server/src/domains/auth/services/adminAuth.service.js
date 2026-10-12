import { betterAuth } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { hashPassword, verifyPassword } from 'better-auth/crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../db/prisma.js'
import { getAuthBaseURL, getAuthSecret, getTrustedAuthOrigins } from '../../../config/env.js'
import { sanitizeReturnedAuthResponse, verifySessionRevocation } from '../utils/authResponse.js'
import { logOperationalFailure } from '../../../shared/utils/operationalLog.js'

export function createAdminAuth({ database, findUser, secret, baseURL, trustedOrigins, production = false }) {
  return betterAuth({
    appName: 'Doggy Ent Admin',
    logger: { disabled: true },
    onAPIError: { onError: error => logOperationalFailure('ADMIN_AUTH_FAILED', error) },
    basePath: '/api/admin-auth',
    baseURL, secret, trustedOrigins, database,
    advanced: {
      cookiePrefix: 'doggy-admin',
      useSecureCookies: production,
      defaultCookieAttributes: { httpOnly: true, sameSite: production ? 'none' : 'lax', secure: production, path: '/' },
    },
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      password: {
        hash: hashPassword,
        // Only deliberate provisioning imports the existing bcrypt credential.
        verify: ({ hash, password }) => /^\$2[aby]\$/.test(hash)
          ? bcrypt.compare(password, hash) : verifyPassword({ hash, password }),
      },
    },
    user: { additionalFields: {
      role: { type: 'string', defaultValue: 'CUSTOMER', input: false },
      status: { type: 'string', defaultValue: 'ACTIVE', input: false },
    } },
    session: { expiresIn: 8 * 60 * 60, disableSessionRefresh: true, cookieCache: { enabled: false } },
    databaseHooks: { session: { create: { before: async session => {
      const user = await findUser(session.userId)
      if (user?.role !== 'ADMIN' || user.status !== 'ACTIVE') throw new APIError('UNAUTHORIZED', { message: 'Invalid admin credentials.' })
      return { data: session }
    } } } },
    hooks: { before: createAuthMiddleware(async ctx => {
      const origin = ctx.headers?.get('origin')?.replace(/\/$/, '')
      if (origin && !trustedOrigins.includes(origin)) throw new APIError('FORBIDDEN', { message: 'Invalid request origin.' })
    }), after: createAuthMiddleware(async ctx => {
      await verifySessionRevocation(ctx)
      const data = await sanitizeReturnedAuthResponse(ctx.context.returned)
      if (data && !(data instanceof Response)) return ctx.json(data)
    }) },
  })
}

export const adminAuth = createAdminAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  findUser: id => prisma.user.findUnique({ where: { id }, select: { role: true, status: true } }),
  secret: getAuthSecret(), baseURL: getAuthBaseURL(), trustedOrigins: getTrustedAuthOrigins(),
  production: process.env.NODE_ENV === 'production',
})
