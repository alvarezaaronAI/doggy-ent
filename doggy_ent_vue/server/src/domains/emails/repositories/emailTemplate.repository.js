import { prisma } from '../../../db/prisma.js'
export const listEmailTemplates = () => prisma.emailTemplate.findMany({ orderBy: { updatedAt: 'desc' }, take: 100 })
export const findEmailTemplate = id => prisma.emailTemplate.findUnique({ where: { id } })
export const createEmailTemplate = data => prisma.emailTemplate.create({ data })
export const starterCopyId = suggestionId => `starter-copy-${suggestionId}`
export async function findStarterEmailTemplate(suggestion) {
  return await findEmailTemplate(starterCopyId(suggestion.id))
    || prisma.emailTemplate.findFirst({
      where: { event: suggestion.event },
      orderBy: [{ archived: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    })
}
export async function useStarterEmailTemplate(suggestion, data) {
  const existing = await findStarterEmailTemplate(suggestion)
  if (existing) return { ...existing, copyReused: true }
  // The existing primary-key constraint reserves one copy across retries/tabs.
  try { return { ...await createEmailTemplate({ ...data, id: starterCopyId(suggestion.id) }), copyReused: false } }
  catch (error) {
    if (error.code !== 'P2002') throw error
    const saved = await findEmailTemplate(starterCopyId(suggestion.id))
    if (!saved) throw error
    return { ...saved, copyReused: true }
  }
}
export async function updateEmailTemplate(id, revision, data) {
  return prisma.$transaction(async tx => {
    const result = await tx.emailTemplate.updateMany({ where: { id, revision }, data: { ...data, revision: { increment: 1 } } })
    return result.count ? tx.emailTemplate.findUnique({ where: { id } }) : null
  })
}
