import { prisma } from '../../../db/prisma.js'
import { MEDIA_METADATA_SELECT } from '../mappers/media.mapper.js'
const PAGE_SIZE = 24
const LIBRARY_CAPACITY = 256 * 1024 * 1024

export async function listMediaAssets({ search, folder, page }) {
  const where = { ...(folder ? { folder } : {}), ...(search ? { OR: ['name', 'originalFilename', 'altText'].map(field => ({ [field]: { contains: search, mode: 'insensitive' } })) } : {}) }
  const [assets, count, storage] = await prisma.$transaction([
    prisma.mediaAsset.findMany({ where, select: MEDIA_METADATA_SELECT, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    prisma.mediaAsset.count({ where }),
    prisma.mediaAsset.aggregate({ _sum: { byteSize: true, thumbnailByteSize: true } }),
  ])
  return { assets, count, page, hasMore: page * PAGE_SIZE < count, storageBytes: (storage._sum.byteSize || 0) + (storage._sum.thumbnailByteSize || 0), capacityBytes: LIBRARY_CAPACITY }
}

export async function storeMediaAsset(image, details) {
  const existing = await prisma.mediaAsset.findUnique({ where: { checksum: image.checksum }, select: MEDIA_METADATA_SELECT })
  if (existing) return { asset: existing, reused: true }
  const { bytes, thumbnailBytes, ...metadata } = image
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(async tx => {
        const usage = await tx.mediaAsset.aggregate({ _sum: { byteSize: true, thumbnailByteSize: true } })
        const used = (usage._sum.byteSize || 0) + (usage._sum.thumbnailByteSize || 0)
        if (used + bytes.length + thumbnailBytes.length > LIBRARY_CAPACITY) return { capacityExceeded: true }
        const asset = await tx.mediaAsset.create({ data: { ...metadata, ...details, data: { create: { bytes, thumbnailBytes } } }, select: MEDIA_METADATA_SELECT })
        return { asset, reused: false }
      }, { isolationLevel: 'Serializable' })
    } catch (error) {
      if (error.code === 'P2002') {
        const asset = await prisma.mediaAsset.findUnique({ where: { checksum: image.checksum }, select: MEDIA_METADATA_SELECT })
        if (asset) return { asset, reused: true }
      }
      if (error.code !== 'P2034' || attempt === 2) throw error
    }
  }
}

export const findMediaBytes = (id, thumbnail) => prisma.mediaAsset.findUnique({ where: { id }, select: { checksum: true, mimeType: true, data: { select: thumbnail ? { thumbnailBytes: true } : { bytes: true } } } })
export const updateMediaDetails = (id, data) => prisma.mediaAsset.update({ where: { id }, data, select: MEDIA_METADATA_SELECT })
export const countMediaIds = ids => prisma.mediaAsset.count({ where: { id: { in: ids } } })
