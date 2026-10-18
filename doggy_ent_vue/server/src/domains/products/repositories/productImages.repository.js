import { prisma } from '../../../db/prisma.js'

export const findImageProduct = id => prisma.product.findUnique({ where: { id }, include: { variants: true } })
export const writeProductImages = (id, { updatedAt, ...data }) => prisma.product.updateMany({ where: { id, updatedAt }, data })
