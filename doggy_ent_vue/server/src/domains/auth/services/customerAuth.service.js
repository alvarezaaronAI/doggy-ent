import { betterAuth } from 'better-auth'
import {
  createAuthMiddleware,
} from 'better-auth/api'
import {
  dash,
} from '@better-auth/infra'
import {
  prismaAdapter,
} from 'better-auth/adapters/prisma'
import {
  fromNodeHeaders,
} from 'better-auth/node'

import { prisma } from '../../../db/prisma.js'
import {
  AUTH_ROLES,
  ACCOUNT_STATUS,
} from '../constants/authRoles.constants.js'
import {
  buildAccountVerificationEmail,
  buildPasswordResetEmail,
  buildWelcomeEmail,
} from '../../emails/mappers/emailPayloads.mapper.js'
import {
  EMAIL_EVENTS,
} from '../../emails/constants/emailEvents.constants.js'
import {
  queueEmail,
} from '../../emails/services/emailProvider.service.js'

function normalizeOrigin(origin) {
  return String(origin || '')
    .trim()
    .replace(/\/$/, '')
}

function splitOrigins(value) {
  return String(value || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)
}

function getTrustedOrigins() {
  return [
    'http://localhost:5173',
    ...splitOrigins(process.env.FRONTEND_URL),
    ...splitOrigins(process.env.CLIENT_URL),
  ]
}

function getBetterAuthSecret() {
  return (
    process.env.BETTER_AUTH_SECRET
    || process.env.ADMIN_SESSION_SECRET
    || process.env.ADMIN_PASSWORD_HASH
  )
}

function sanitizeAuthPayload(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeAuthPayload)
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== 'token')
      .map(([key, childValue]) => [
        key,
        sanitizeAuthPayload(childValue),
      ]),
  )
}

async function sanitizeReturnedAuthResponse(returned) {
  if (!returned) {
    return returned
  }

  if (returned instanceof Response) {
    const data = await returned.clone().json().catch(() => null)

    return data ? sanitizeAuthPayload(data) : returned
  }

  return sanitizeAuthPayload(returned)
}

export const customerAuth = betterAuth({
  appName: 'Doggy Ent',
  basePath: '/api/customer-auth',
  secret: getBetterAuthSecret(),
  baseURL:
    process.env.BETTER_AUTH_URL
    || process.env.API_BASE_URL
    || 'http://localhost:3000',
  trustedOrigins: getTrustedOrigins(),
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY,
    }),
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (![
        '/sign-up/email',
        '/sign-in/email',
        '/get-session',
      ].includes(ctx.path)) {
        return
      }

      const sanitizedPayload =
        await sanitizeReturnedAuthResponse(
          ctx.context.returned,
        )

      if (!sanitizedPayload || sanitizedPayload instanceof Response) {
        return
      }

      return ctx.json(sanitizedPayload)
    }),
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({
      user,
      url,
    }) => {
      await queueEmail(
        buildPasswordResetEmail({
          user,
          url,
        }),
      )
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({
      user,
      url,
    }) => {
      await queueEmail(
        buildAccountVerificationEmail({
          user,
          url,
          event: EMAIL_EVENTS.ACCOUNT_VERIFICATION,
        }),
      )
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: AUTH_ROLES.CUSTOMER,
        input: false,
      },
      status: {
        type: 'string',
        required: false,
        defaultValue: ACCOUNT_STATUS.ACTIVE,
        input: false,
      },
    },
  },
  session: {
    additionalFields: {
      token: {
        type: 'string',
        required: false,
        returned: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.customerProfile.upsert({
            where: {
              userId: user.id,
            },
            create: {
              userId: user.id,
            },
            update: {},
          })

          await prisma.customerNotificationPreference.upsert({
            where: {
              userId: user.id,
            },
            create: {
              userId: user.id,
            },
            update: {},
          })

          await prisma.customerAccountEvent.create({
            data: {
              userId: user.id,
              type: 'ACCOUNT_CREATED',
              message: 'Customer account created.',
              changedByType: 'SYSTEM',
            },
          })

          await queueEmail(buildWelcomeEmail(user))
        },
      },
    },
  },
})

export async function getCustomerSessionFromRequest(req) {
  return customerAuth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })
}

export async function getCustomerUserFromRequest(req) {
  const session = await getCustomerSessionFromRequest(req)

  return session?.user || null
}

export function isCustomerRole(user) {
  return user?.role === AUTH_ROLES.CUSTOMER
}

export function isAdminRole(user) {
  return user?.role === AUTH_ROLES.ADMIN
}
