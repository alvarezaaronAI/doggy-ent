import { randomUUID } from 'node:crypto'
import { prisma } from '../../db/prisma.js'
import { getAdminDataTarget } from '../../config/env.js'

const instanceId = randomUUID().slice(0, 8)

export async function getDevelopmentContext() {
  if (process.env.NODE_ENV === 'production') return null

  let databaseConnected = false
  try {
    await prisma.$queryRaw`SELECT 1`
    databaseConnected = true
  } catch {
    // Diagnostics must not return database connection strings or provider errors.
  }

  return { target: getAdminDataTarget(), databaseConnected, instanceId }
}
