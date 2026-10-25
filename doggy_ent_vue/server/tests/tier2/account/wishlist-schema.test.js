import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { WISHLIST_PUBLIC_PRODUCT_STATUSES } from '../../../src/domains/wishlist/constants/wishlist.constants.js'

const schema = readFileSync(new URL('../../../prisma/schema.prisma', import.meta.url), 'utf8')
const sql = readFileSync(new URL('../../../prisma/migrations/20261024000000_customer_wishlist/migration.sql', import.meta.url), 'utf8')

describe('additive owned wishlist schema contract', () => {
  it('stores only owner, product and server save date with a unique composite key and owner/date index', () => {
    const model = schema.match(/model WishlistItem \{([\s\S]*?)\n\}/)?.[1]
    expect(model).toBeTruthy()
    expect(model.trim().split('\n').map(line => line.trim()).filter(Boolean)).toEqual([
      'userId    String', 'productId String', 'createdAt DateTime @default(now())',
      'user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)',
      'product Product @relation(fields: [productId], references: [id], onDelete: Cascade)',
      '@@id([userId, productId])', '@@index([userId, createdAt])',
    ])
    for (const name of ['User', 'Product']) {
      expect(schema.match(new RegExp(`model ${name} \\{([\\s\\S]*?)\\n\\}`))?.[1]).toMatch(/wishlistItems\s+WishlistItem\[\]/)
    }
  })

  it('only creates the new table/index/constraints and cascades User and Product deletion', () => {
    expect(sql).not.toMatch(/\b(DROP|DELETE|UPDATE|INSERT|TRUNCATE)\b(?! CASCADE)/)
    expect(sql).toContain('CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("userId", "productId")')
    expect(sql).toContain('"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP')
    expect(sql).toContain('CREATE INDEX "WishlistItem_userId_createdAt_idx" ON "public"."WishlistItem"("userId", "createdAt")')
    for (const name of ['User', 'Product']) expect(sql).toContain(`REFERENCES "public"."${name}"("id") ON DELETE CASCADE ON UPDATE CASCADE`)
    expect(sql.match(/CREATE TABLE/g)).toHaveLength(1)
    expect(sql.match(/ALTER TABLE "public"\."WishlistItem"/g)).toHaveLength(2)
  })

  it('matches the current public catalog statuses without a test-product purchase bypass', () => {
    const products = readFileSync(new URL('../../../src/domains/products/services/products.service.js', import.meta.url), 'utf8')
    expect(WISHLIST_PUBLIC_PRODUCT_STATUSES).toEqual(['ACTIVE', 'OUT_OF_STOCK', 'COMING_SOON'])
    expect(products).toContain("status: { in: ['ACTIVE', 'OUT_OF_STOCK', 'COMING_SOON'] }")
  })
})
