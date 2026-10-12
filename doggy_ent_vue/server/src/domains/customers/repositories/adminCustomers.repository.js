import { prisma } from '../../../db/prisma.js'

const customerDetailInclude = {
  profile: true,
  notificationPreference: true,
  orders: {
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
  },
  events: {
    orderBy: {
      createdAt: 'desc',
    },
  },
  supportRequests: {
    orderBy: {
      createdAt: 'desc',
    },
  },
  reviews: {
    orderBy: {
      createdAt: 'desc',
    },
  },
  loyaltyLedger: {
    orderBy: {
      createdAt: 'desc',
    },
  },
}

export async function findAdminCustomers() {
  return prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      orders: {
        select: {
          id: true,
          total: true,
          createdAt: true,
        },
      },
    },
  })
}

export async function findAdminCustomerById(customerId) {
  return prisma.user.findFirst({
    where: {
      id: customerId,
      role: 'CUSTOMER',
    },
    include: customerDetailInclude,
  })
}

export async function findGuestOrdersByCustomerEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!normalizedEmail) {
    return []
  }

  return prisma.order.findMany({
    where: {
      userId: null,
      customerEmail: normalizedEmail,
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

export async function updateCustomerAccountStatus({
  customerId,
  status,
  actor = null,
}) {
  return prisma.user.update({
    where: {
      id: customerId,
      role: 'CUSTOMER',
    },
    data: {
      status,
      events: {
        create: {
          type: `ACCOUNT_${status}`,
          message: `Account status changed to ${status}.`,
          changedByType: actor?.id ? 'ADMIN' : 'SYSTEM',
          changedBy: actor?.id || null,
        },
      },
    },
    include: customerDetailInclude,
  })
}
