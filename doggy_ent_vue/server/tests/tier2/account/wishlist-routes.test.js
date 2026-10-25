import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import express from 'express'

const wishlistItem = vi.hoisted(() => ({ findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn(), create: vi.fn(), deleteMany: vi.fn() }))
const product = vi.hoisted(() => ({ findFirst: vi.fn() }))
const transaction = vi.hoisted(() => vi.fn())
const session = vi.hoisted(() => vi.fn())
vi.mock('../../../src/db/prisma.js', () => ({ prisma: { wishlistItem, product, $transaction: transaction } }))
vi.mock('../../../src/domains/auth/services/customerAuth.service.js', () => ({ getCustomerSessionFromRequest: session }))
vi.mock('../../../src/domains/pets/routes/pets.routes.js', () => ({ default: express.Router() }))
vi.mock('../../../src/domains/account/controllers/account.controller.js', () => ({
  getAccountDashboardController: vi.fn(), getAccountNotificationsController: vi.fn(),
  getAccountOrderController: vi.fn(), getAccountOrdersController: vi.fn(),
  getAccountProfileController: vi.fn(), updateAccountProfileController: vi.fn(),
}))

const id = 'c' + 'a'.repeat(24), otherId = 'c' + 'b'.repeat(24), missingId = 'c' + 'z'.repeat(24)
const timestamp = new Date('2026-10-24T00:00:00Z')
const record = (userId, productId = id, createdAt = timestamp) => ({ userId, productId, createdAt, product: { name: 'not an API product snapshot' }, privateNotes: 'not for clients' })
let server, origin, rows, catalog

beforeEach(async () => {
  vi.resetAllMocks()
  vi.resetModules()
  rows = [record('owner-one'), record('owner-two')]
  catalog = [
    { id, status: 'ACTIVE', isTestProduct: true },
    { id: otherId, status: 'OUT_OF_STOCK', isTestProduct: false },
  ]
  session.mockImplementation(async req => {
    const owner = req.get('X-Fixture-Customer')
    return owner ? { user: { id: owner, status: owner === 'inactive' ? 'DEACTIVATED' : 'ACTIVE' }, session: {} } : null
  })
  wishlistItem.findMany.mockImplementation(async ({ where, take }) => rows
    .filter(row => row.userId === where.userId)
    .sort((a, b) => b.createdAt - a.createdAt || a.productId.localeCompare(b.productId))
    .slice(0, take))
  wishlistItem.findUnique.mockImplementation(async ({ where: { userId_productId: key } }) => rows.find(row => row.userId === key.userId && row.productId === key.productId) || null)
  wishlistItem.count.mockImplementation(async ({ where }) => rows.filter(row => row.userId === where.userId).length)
  wishlistItem.create.mockImplementation(async ({ data }) => {
    const saved = record(data.userId, data.productId)
    rows.push(saved)
    return saved
  })
  wishlistItem.deleteMany.mockImplementation(async ({ where }) => {
    const before = rows.length
    rows = rows.filter(row => row.userId !== where.userId || row.productId !== where.productId)
    return { count: before - rows.length }
  })
  product.findFirst.mockImplementation(async ({ where }) => catalog.find(row => row.id === where.id && where.status.in.includes(row.status)) || null)
  transaction.mockImplementation(async action => {
    const before = structuredClone(rows)
    try { return await action({ wishlistItem, product }) }
    catch (error) { rows = before; throw error }
  })
  const { default: accountRoutes } = await import('../../../src/domains/account/routes/account.routes.js')
  const app = express()
  app.use(express.json({ limit: '100kb' }))
  app.use('/api/account', accountRoutes)
  server = app.listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  origin = `http://127.0.0.1:${server.address().port}/api/account/wishlist`
})

afterEach(async () => {
  if (server) await new Promise(resolve => server.close(resolve))
  server = null
})

function request(method = 'GET', path = '', body, owner = 'owner-one', headers = {}) {
  return fetch(origin + path, {
    method,
    headers: {
      ...(owner ? { 'X-Fixture-Customer': owner } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
  })
}

function expectNoWrites() {
  expect(wishlistItem.create).not.toHaveBeenCalled()
  expect(wishlistItem.deleteMany).not.toHaveBeenCalled()
}

describe('authenticated owned wishlist HTTP contract', () => {
  it('uses the existing account session guard for every method before persistence', async () => {
    for (const owner of [null, 'inactive']) {
      for (const [method, path] of [['GET', ''], ['PUT', '/' + id], ['DELETE', '/' + id]]) {
        const response = await request(method, path, undefined, owner)
        expect(response.status).toBe(owner ? 403 : 401)
        expect(response.headers.get('cache-control')).toBe('no-store')
        expect(await response.json()).toEqual({ success: false, message: owner ? 'This account is inactive.' : 'Customer authentication required.' })
      }
    }
    expect(wishlistItem.findMany).not.toHaveBeenCalled()
    expect(transaction).not.toHaveBeenCalled()
    expectNoWrites()
  })

  it('does not leak session lookup failures or do wishlist work without confirmation', async () => {
    session.mockRejectedValue(new Error('private lookup failure'))
    const response = await request()
    expect(response.status).toBe(500)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ success: false, message: 'Unable to validate customer session.' })
    expect(wishlistItem.findMany).not.toHaveBeenCalled()
    expectNoWrites()
  })

  it('returns only owned product IDs/save dates newest-first, including stale IDs but no product facts', async () => {
    const newer = new Date('2026-10-24T01:00:00Z')
    rows.push(record('owner-one', otherId, newer), record('owner-one', missingId))
    const response = await request()
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(await response.json()).toEqual({ success: true, result: [
      { productId: otherId, createdAt: newer.toISOString() },
      { productId: id, createdAt: timestamp.toISOString() },
      { productId: missingId, createdAt: timestamp.toISOString() },
    ] })
    expect(product.findFirst).not.toHaveBeenCalled()
    expect(await (await request('GET', '', undefined, 'owner-two')).json()).toEqual({ success: true, result: [{ productId: id, createdAt: timestamp.toISOString() }] })
    expect(await (await request('GET', '', undefined, 'empty-owner')).json()).toEqual({ success: true, result: [] })
    expectNoWrites()
  })

  it('bounds list output to 100 even if existing storage exceeds the cap', async () => {
    rows = Array.from({ length: 105 }, (_, index) => record('owner-one', 'c' + String(index).padStart(24, '0')))
    expect((await (await request()).json()).result).toHaveLength(100)
    expect(wishlistItem.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'owner-one' }, take: 100 }))
  })

  it('idempotently saves from the session owner and preserves the original date on duplicates', async () => {
    const response = await request('PUT', '/' + otherId)
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    const saved = await response.json()
    expect(saved).toEqual({ success: true, result: { productId: otherId, createdAt: timestamp.toISOString() } })
    expect(await (await request('PUT', '/' + otherId, {})).json()).toEqual(saved)
    expect(wishlistItem.create).toHaveBeenCalledTimes(1)
    expect(rows.filter(row => row.userId === 'owner-one' && row.productId === otherId)).toHaveLength(1)
    expect(rows.find(row => row.userId === 'owner-two')).toEqual(record('owner-two'))
  })

  it.each(['ACTIVE', 'OUT_OF_STOCK', 'COMING_SOON'])('allows public %s test products without any product or purchase mutation', async status => {
    catalog = [{ id: otherId, status, isTestProduct: true }]
    expect((await request('PUT', '/' + otherId)).status).toBe(200)
    expect(catalog).toEqual([{ id: otherId, status, isTestProduct: true }])
    expect(wishlistItem.create).toHaveBeenCalledWith({ data: { userId: 'owner-one', productId: otherId }, select: { productId: true, createdAt: true } })
  })

  it('responds with the same safe 404 for hidden and nonexistent products, even previously saved ones', async () => {
    for (const status of ['DRAFT', 'ARCHIVED', 'UNKNOWN']) {
      catalog[0].status = status
      const response = await request('PUT', '/' + id)
      expect(response.status).toBe(404)
      expect(response.headers.get('cache-control')).toBe('private, no-store')
      expect(await response.json()).toEqual({ success: false, message: 'Product not available.' })
    }
    const response = await request('PUT', '/' + missingId)
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ success: false, message: 'Product not available.' })
    expectNoWrites()
  })

  it('idempotently removes only this owner, without public visibility or existence checks', async () => {
    catalog = []
    for (let repeat = 0; repeat < 2; repeat++) {
      const response = await request('DELETE', '/' + id)
      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toBe('private, no-store')
      expect(await response.json()).toEqual({ success: true, result: { removed: true } })
    }
    expect(rows).toEqual([record('owner-two')])
    expect((await request('DELETE', '/' + missingId)).status).toBe(200)
    expect(product.findFirst).not.toHaveBeenCalled()
    expect(wishlistItem.create).not.toHaveBeenCalled()
  })

  it('rejects body/query owner spoofing, product facts and extra data on every action', async () => {
    const before = structuredClone(rows)
    for (const [method, path] of [['GET', ''], ['PUT', '/' + id], ['DELETE', '/' + id]]) {
      const response = await request(method, path + '?userId=owner-two')
      expect(response.status).toBe(400)
      expect(response.headers.get('cache-control')).toBe('private, no-store')
    }
    for (const method of ['PUT', 'DELETE']) {
      for (const body of [{ userId: 'owner-two' }, { productId: otherId }, { createdAt: timestamp }, { name: 'spoofed', price: 1 }, []]) {
        const response = await request(method, '/' + id, body)
        expect(response.status).toBe(400)
        expect(response.headers.get('cache-control')).toBe('private, no-store')
      }
      const plain = await request(method, '/' + id, 'userId=owner-two', 'owner-one', { 'Content-Type': 'text/plain' })
      expect(plain.status).toBe(400)
    }
    expect(rows).toEqual(before)
    expect(transaction).not.toHaveBeenCalled()
    expectNoWrites()
  })

  it('also rejects nonobject JSON at the existing shared parser before any wishlist work', async () => {
    for (const method of ['PUT', 'DELETE']) expect((await request(method, '/' + id, null)).status).toBe(400)
    expect(session).not.toHaveBeenCalled()
    expect(transaction).not.toHaveBeenCalled()
    expectNoWrites()
  })

  it.each(['malformed', 'c' + 'A'.repeat(24), '%20' + id, 'c' + 'a'.repeat(200), encodeURIComponent('../' + id)])('returns safe 400 for malformed product selection %s', async value => {
    for (const method of ['PUT', 'DELETE']) {
      const response = await request(method, '/' + value)
      expect(response.status).toBe(400)
      expect(response.headers.get('cache-control')).toBe('private, no-store')
      expect(await response.json()).toEqual({ success: false, message: 'Check the product selection.' })
    }
    expect(transaction).not.toHaveBeenCalled()
    expectNoWrites()
  })

  it('enforces the per-owner 100 cap but allows duplicate success and another owner to save', async () => {
    rows = Array.from({ length: 100 }, (_, index) => record('owner-one', index ? 'c' + String(index).padStart(24, '0') : id))
    const response = await request('PUT', '/' + otherId)
    expect(response.status).toBe(409)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(await response.json()).toEqual({ success: false, message: 'You can save up to 100 wishlist items.' })
    expect((await request('PUT', '/' + id)).status).toBe(200)
    expect((await request('PUT', '/' + otherId, undefined, 'owner-two')).status).toBe(200)
    expect(rows.filter(row => row.userId === 'owner-one')).toHaveLength(100)
    expect(rows.filter(row => row.userId === 'owner-two')).toHaveLength(1)
    expect(wishlistItem.create).toHaveBeenCalledTimes(1)
  })

  it('sanitizes unexpected read/save/delete failures, with private no-store even on errors', async () => {
    const failure = new Error('private database details')
    wishlistItem.findMany.mockRejectedValueOnce(failure)
    transaction.mockRejectedValueOnce(failure)
    wishlistItem.deleteMany.mockRejectedValueOnce(failure)
    for (const [method, path, message] of [
      ['GET', '', 'Unable to load wishlist.'],
      ['PUT', '/' + otherId, 'Unable to save wishlist item.'],
      ['DELETE', '/' + id, 'Unable to remove wishlist item.'],
    ]) {
      const response = await request(method, path)
      expect(response.status).toBe(500)
      expect(response.headers.get('cache-control')).toBe('private, no-store')
      expect(await response.json()).toEqual({ success: false, message })
    }
  })

  it('rolls back simulated commit failure without publishing success or keeping the new row', async () => {
    const before = structuredClone(rows)
    transaction.mockImplementationOnce(async action => {
      try { await action({ wishlistItem, product }); throw new Error('private commit failure') }
      catch (error) { rows = before; throw error }
    })
    const response = await request('PUT', '/' + otherId)
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ success: false, message: 'Unable to save wishlist item.' })
    expect(rows).toEqual(before)
    expect(wishlistItem.create).toHaveBeenCalledTimes(1)
  })

  it('returns a safe conflict after three losing saves, without leaking database details', async () => {
    transaction.mockRejectedValue({ code: 'P2034', message: 'private details' })
    const response = await request('PUT', '/' + otherId)
    expect(response.status).toBe(409)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(await response.json()).toEqual({ success: false, message: 'Wishlist changed. Please try again.' })
    expect(transaction).toHaveBeenCalledTimes(3)
    expectNoWrites()
  })

  it('shares a 30-per-15-minute mutation limiter for PUT/DELETE, including invalid requests, but not reads', async () => {
    for (let index = 0; index < 30; index++) {
      expect((await request(index % 2 ? 'DELETE' : 'PUT', '/invalid')).status).toBe(400)
    }
    for (const method of ['PUT', 'DELETE']) {
      const response = await request(method, '/' + id)
      expect(response.status).toBe(429)
      expect(response.headers.get('cache-control')).toBe('private, no-store')
      expect(await response.json()).toEqual({ message: 'Too many wishlist changes. Please try again shortly.' })
    }
    expect((await request()).status).toBe(200)
    expectNoWrites()
  })
})
