import { prisma } from '../../../db/prisma.js'
export const listEmailTemplates = () => prisma.emailTemplate.findMany({ orderBy: { updatedAt: 'desc' }, take: 100 })
export const findEmailTemplate = id => prisma.emailTemplate.findUnique({ where: { id } })
export const createEmailTemplate = data => prisma.emailTemplate.create({ data })
export async function updateEmailTemplate(id, revision, data) {
  return prisma.$transaction(async tx => {
    const result = await tx.emailTemplate.updateMany({ where: { id, revision }, data: { ...data, revision: { increment: 1 } } })
    return result.count ? tx.emailTemplate.findUnique({ where: { id } }) : null
  })
}
