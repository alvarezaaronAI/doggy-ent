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
  buildAccountCreatedEmail,
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

import { getAuthBaseURL, getAuthSecret, getTrustedAuthOrigins } from '../../../config/env.js'
import { sanitizeReturnedAuthResponse, verifySessionRevocation } from '../utils/authResponse.js'
import { logOperationalFailure } from '../../../shared/utils/operationalLog.js'
import { sessionCookieOptions } from '../utils/sessionCookies.js'

export const customerAuth = betterAuth({
  appName: 'Doggy Ent',
  logger: { disabled: true },
  onAPIError: { onError: error => logOperationalFailure('CUSTOMER_AUTH_FAILED', error) },
  basePath: '/api/customer-auth',
  secret: getAuthSecret(),
  baseURL: getAuthBaseURL(),
  trustedOrigins: getTrustedAuthOrigins(),
  advanced: sessionCookieOptions(process.env.NODE_ENV === 'production'),
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
      await verifySessionRevocation(ctx)
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
    revokeSessionsOnPasswordReset: true,
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
    session: { create: { before: async session => {
      const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { status: true } })
      return user?.status === ACCOUNT_STATUS.ACTIVE ? { data: session } : false
    } } },
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
          await queueEmail(buildAccountCreatedEmail(user))
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

  return session?.user?.status === ACCOUNT_STATUS.ACTIVE ? session.user : null
}

export function isCustomerRole(user) {
  return user?.role === AUTH_ROLES.CUSTOMER
}

export function isAdminRole(user) {
  return user?.role === AUTH_ROLES.ADMIN
}
