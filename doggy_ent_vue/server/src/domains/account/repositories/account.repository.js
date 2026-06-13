import { prisma } from '../../../db/prisma.js'

export async function findAccountUserById(userId) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: true,
      notificationPreference: true,
    },
  })
}

export async function findCustomerOrdersForAccount({
  userId,
  email,
  includeVerifiedEmailMatches = false,
}) {
  const normalizedEmail = String(email || '').trim().toLowerCase()

  return prisma.order.findMany({
    where: {
      OR: [
        {
          userId,
        },
        ...(includeVerifiedEmailMatches && normalizedEmail
          ? [
              {
                userId: null,
                customerEmail: normalizedEmail,
              },
            ]
          : []),
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      items: true,
      campaignUsages: {
        include: {
          campaign: true,
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
}

export async function findCustomerOrderForAccount({
  userId,
  email,
  reference,
  includeVerifiedEmailMatches = false,
}) {
  const normalizedReference = String(reference || '').trim()
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!normalizedReference) {
    return null
  }

  const order = await prisma.order.findFirst({
    where: {
      AND: [
        {
          OR: [
            {
              id: normalizedReference,
            },
            {
              orderNumber: normalizedReference,
            },
          ],
        },
        {
          OR: [
            {
              userId,
            },
            ...(includeVerifiedEmailMatches && normalizedEmail
              ? [
                  {
                    userId: null,
                    customerEmail: normalizedEmail,
                  },
                ]
              : []),
          ],
        },
      ],
    },
    include: {
      items: true,
      campaignUsages: {
        include: {
          campaign: true,
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  const promoUsage = order
    ? await prisma.promoUsage.findFirst({
        where: {
          orderId: order.id,
        },
        include: {
          promo: true,
        },
      })
    : null

  return order ? { ...order, promoUsage } : null
}

export async function updateCustomerProfileByUserId(userId, data) {
  return prisma.customerProfile.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      ...data,
    },
    update: data,
  })
}
