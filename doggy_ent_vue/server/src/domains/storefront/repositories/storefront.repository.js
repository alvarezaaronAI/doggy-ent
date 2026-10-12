import { prisma } from '../../../db/prisma.js'

export const findStorefrontContent = () => prisma.storefrontContent.findUnique({ where: { id: 'home' } })

export async function writeStorefrontContent(expectedRevision, data) {
  if (expectedRevision === 0) {
    try {
      return await prisma.storefrontContent.create({ data: { id: 'home', revision: 1, ...data } })
    } catch (error) {
      if (error.code === 'P2002') return null
      throw error
    }
  }
  // Returning the write itself avoids a subsequent read racing a second editor.
  const rows = await prisma.storefrontContent.updateManyAndReturn({
    where: { id: 'home', revision: expectedRevision },
    data: { ...data, revision: { increment: 1 } },
  })
  return rows[0] || null
}
