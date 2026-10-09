import { prisma } from '../../../db/prisma.js'

const orderIssueInclude = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      customerEmail: true,
      customerName: true,
      createdAt: true,
      shipments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  },
  messages: {
    orderBy: {
      createdAt: 'asc',
    },
  },
  events: {
    orderBy: {
      createdAt: 'desc',
    },
  },
}

export async function findOrderIssueByCaseNumber(caseNumber) {
  return prisma.customerSupportRequest.findUnique({
    where: {
      caseNumber,
    },
    include: orderIssueInclude,
  })
}

export async function findCustomerOrderIssues(userId) {
  return prisma.customerSupportRequest.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: orderIssueInclude,
  })
}

export async function findCustomerOrderIssueByCaseNumber({
  userId,
  caseNumber,
}) {
  return prisma.customerSupportRequest.findFirst({
    where: {
      userId,
      caseNumber,
    },
    include: orderIssueInclude,
  })
}

export async function createCustomerOrderIssue({
  caseNumber,
  user,
  order,
  category,
  priority,
  subject,
  message,
  deliveryEligibilityEndsAt,
}) {
  return prisma.customerSupportRequest.create({
    data: {
      caseNumber,
      userId: user.id,
      orderId: order.id,
      orderReference: order.orderNumber,
      customerEmail: user.email,
      customerName: user.name,
      category,
      priority,
      subject,
      message,
      deliveryEligibilityEndsAt,
      messages: {
        create: {
          authorType: 'CUSTOMER',
          authorUserId: user.id,
          body: message,
          visibility: 'CUSTOMER',
        },
      },
      events: {
        create: {
          eventType: 'CREATED',
          toStatus: 'OPEN',
          actorType: 'CUSTOMER',
          actorId: user.id,
          metadata: {
            category,
            orderReference: order.orderNumber,
          },
        },
      },
    },
    include: orderIssueInclude,
  })
}

export async function listAdminOrderIssues({
  search,
  status,
  category,
  priority,
} = {}) {
  const trimmedSearch = String(search || '').trim()

  return prisma.customerSupportRequest.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(priority ? { priority } : {}),
      ...(trimmedSearch
        ? {
            OR: [
              {
                caseNumber: {
                  contains: trimmedSearch,
                  mode: 'insensitive',
                },
              },
              {
                orderReference: {
                  contains: trimmedSearch,
                  mode: 'insensitive',
                },
              },
              {
                customerEmail: {
                  contains: trimmedSearch,
                  mode: 'insensitive',
                },
              },
              {
                customerName: {
                  contains: trimmedSearch,
                  mode: 'insensitive',
                },
              },
              {
                subject: {
                  contains: trimmedSearch,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [
      {
        updatedAt: 'desc',
      },
    ],
    include: orderIssueInclude,
  })
}

export async function updateAdminOrderIssue({
  caseNumber,
  data,
  event,
}) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.customerSupportRequest.findUnique({
      where: {
        caseNumber,
      },
    })

    if (!current) {
      return null
    }

    const updated = await tx.customerSupportRequest.update({
      where: {
        caseNumber,
      },
      data,
      include: orderIssueInclude,
    })

    if (event) {
      await tx.customerSupportEvent.create({
        data: {
          supportRequestId: updated.id,
          ...event,
        },
      })
    }

    return updated
  })
}

export async function addOrderIssueMessage({
  caseNumber,
  body,
  visibility,
  authorType,
  authorUserId,
  emailRequested = false,
}) {
  return prisma.$transaction(async (tx) => {
    const issue = await tx.customerSupportRequest.findUnique({
      where: {
        caseNumber,
      },
    })

    if (!issue) {
      return null
    }

    await tx.customerSupportMessage.create({
      data: {
        supportRequestId: issue.id,
        authorType,
        authorUserId,
        body,
        visibility,
        emailRequested,
      },
    })

    await tx.customerSupportEvent.create({
      data: {
        supportRequestId: issue.id,
        eventType:
          visibility === 'INTERNAL'
            ? 'INTERNAL_NOTE_ADDED'
            : 'CUSTOMER_REPLY_ADDED',
        actorType: authorType,
        actorId: authorUserId,
        metadata: {
          emailRequested,
        },
      },
    })

    return tx.customerSupportRequest.update({
      where: {
        caseNumber,
      },
      data: {
        updatedAt: new Date(),
      },
      include: orderIssueInclude,
    })
  })
}

export async function listInternalIssues({
  search,
  status,
  category,
  severity,
} = {}) {
  const trimmedSearch = String(search || '').trim()

  return prisma.internalIssue.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(severity ? { severity } : {}),
      ...(trimmedSearch
        ? {
            OR: [
              {
                caseNumber: {
                  contains: trimmedSearch,
                  mode: 'insensitive',
                },
              },
              {
                fingerprint: {
                  contains: trimmedSearch,
                  mode: 'insensitive',
                },
              },
              {
                summary: {
                  contains: trimmedSearch,
                  mode: 'insensitive',
                },
              },
              {
                source: {
                  contains: trimmedSearch,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    },
    orderBy: {
      lastSeenAt: 'desc',
    },
    include: {
      events: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
}

export async function upsertInternalIssue({
  caseNumber,
  fingerprint,
  category,
  severity,
  source,
  summary,
  safeDetails,
  route,
  customerId,
  orderId,
}) {
  return prisma.internalIssue.upsert({
    where: {
      fingerprint,
    },
    create: {
      caseNumber,
      fingerprint,
      category,
      severity,
      source,
      summary,
      safeDetails,
      route,
      customerId,
      orderId,
      events: {
        create: {
          eventType: 'CREATED',
          actorType: 'SYSTEM',
          metadata: {
            source,
            route,
          },
        },
      },
    },
    update: {
      occurrenceCount: {
        increment: 1,
      },
      lastSeenAt: new Date(),
      events: {
        create: {
          eventType: 'SEEN_AGAIN',
          actorType: 'SYSTEM',
          metadata: {
            source,
            route,
          },
        },
      },
    },
    include: {
      events: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
}

export async function updateInternalIssue({
  caseNumber,
  data,
  event,
}) {
  return prisma.$transaction(async (tx) => {
    const issue = await tx.internalIssue.findUnique({
      where: {
        caseNumber,
      },
    })

    if (!issue) {
      return null
    }

    const updated = await tx.internalIssue.update({
      where: {
        caseNumber,
      },
      data,
      include: {
        events: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (event) {
      await tx.internalIssueEvent.create({
        data: {
          internalIssueId: updated.id,
          ...event,
        },
      })
    }

    return updated
  })
}
