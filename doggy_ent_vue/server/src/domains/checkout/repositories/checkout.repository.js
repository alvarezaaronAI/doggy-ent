import { prisma } from '../../../db/prisma.js'
export const findCheckoutProducts = ids => prisma.product.findMany({ where: { id: { in: ids } }, include: { variants: true } })
