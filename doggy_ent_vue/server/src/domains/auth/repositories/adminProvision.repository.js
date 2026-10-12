import { randomUUID } from 'node:crypto'
import { prisma } from '../../../db/prisma.js'

export function findProvisionedAdmin(email) {
  return prisma.user.findUnique({ where: { email }, select: { id: true, role: true, accounts: { select: { providerId: true } } } })
}

export async function createProvisionedAdmin({ email, passwordHash }) {
  return prisma.$transaction(async tx => {
    const existing = await tx.user.findUnique({ where: { email } })
    if (existing) throw new Error('This email is already registered. Review it manually; provisioning never promotes or overwrites an account.')
    const id = randomUUID()
    await tx.user.create({ data: {
      id, email, name: 'Doggy Ent Admin', role: 'ADMIN', status: 'ACTIVE', emailVerified: false,
      accounts: { create: { id: randomUUID(), accountId: id, providerId: 'credential', password: passwordHash } },
      events: { create: { type: 'ADMIN_PROVISIONED', changedByType: 'SYSTEM', message: 'Admin account deliberately provisioned from server configuration.' } },
    } })
    return { created: true }
  })
}
