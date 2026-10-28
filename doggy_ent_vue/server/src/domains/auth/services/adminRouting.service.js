import { prisma } from '../../../db/prisma.js'
import { getAdminDataTarget, getAdminGatewayConfig, getAuthBaseURL } from '../../../config/env.js'

export async function getAdminRoutingContext() {
  let databaseConnected = false
  try {
    await prisma.$queryRaw`SELECT 1`
    databaseConnected = true
  } catch {
    // A connection check must never expose a database URL or driver error.
  }
  return {
    target: getAdminDataTarget(),
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    transport: getAdminGatewayConfig().required ? 'protected-gateway' : 'direct',
    apiOrigin: getAuthBaseURL(),
    databaseConnected,
    checkedAt: new Date().toISOString(),
  }
}
