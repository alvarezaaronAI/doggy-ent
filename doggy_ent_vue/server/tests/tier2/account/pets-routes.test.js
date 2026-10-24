import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import express from 'express'
import sharp from 'sharp'

const pet = vi.hoisted(() => ({
  findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(),
}))
const customerAccountEvent = vi.hoisted(() => ({ create: vi.fn() }))
const transaction = vi.hoisted(() => vi.fn())
const session = vi.hoisted(() => vi.fn())
vi.mock('../../../src/db/prisma.js', () => ({ prisma: { pet, customerAccountEvent, $transaction: transaction } }))
vi.mock('../../../src/domains/auth/services/customerAuth.service.js', () => ({
  getCustomerSessionFromRequest: session,
}))
// Keep unrelated account/auth/provider domains out of this isolated HTTP fixture.
vi.mock('../../../src/domains/account/controllers/account.controller.js', () => ({
  getAccountDashboardController: vi.fn(), getAccountNotificationsController: vi.fn(),
  getAccountOrderController: vi.fn(), getAccountOrdersController: vi.fn(),
  getAccountProfileController: vi.fn(), updateAccountProfileController: vi.fn(),
}))

const id = 'c' + 'a'.repeat(24)
const otherId = 'c' + 'b'.repeat(24)
const missingId = 'c' + 'z'.repeat(24)
const timestamp = new Date('2026-10-20T00:00:00Z')
const record = (owner, petId = id) => ({
  id: petId, userId: owner, nickname: 'Chase', lifeStage: 'ADULT', sizeBand: 'LARGE',
  proteinPreferences: ['BEEF'], treatPurpose: 'REWARD', createdAt: timestamp, updatedAt: timestamp,
  user: { accounts: [{ password: 'private-fixture' }] }, privateNotes: 'not for clients',
})
let server, origin, rows, sequence, events

beforeEach(async () => {
  vi.resetAllMocks()
  vi.resetModules()
  rows = [record('customer-one'), record('customer-two', otherId)]
  events = []
  sequence = 0
  session.mockImplementation(async req => {
    const owner = req.get('X-Fixture-Customer')
    return owner ? {
      user: { id: owner, status: owner === 'inactive' ? 'DEACTIVATED' : 'ACTIVE' },
      session: { id: 'fixture-session' },
    } : null
  })
  pet.findMany.mockImplementation(async ({ where, take }) => rows.filter(row => row.userId === where.userId).slice(0, take))
  pet.findUnique.mockImplementation(async ({ where }) => rows.find(row => row.id === where.id && row.userId === where.userId) || null)
  pet.count.mockImplementation(async ({ where }) => rows.filter(row => row.userId === where.userId).length)
  pet.create.mockImplementation(async ({ data }) => {
    const created = { ...record(data.userId, 'c' + String(++sequence).padStart(24, '0')), ...data }
    rows.push(created)
    return created
  })
  pet.update.mockImplementation(async ({ where, data }) => {
    const target = rows.find(row => row.id === where.id && row.userId === where.userId)
    if (!target) throw { code: 'P2025' }
    const { photo, ...fields } = data
    Object.assign(target, fields, { updatedAt: new Date() })
    if (photo?.upsert) target.photo = { ...photo.upsert.create, updatedAt: new Date() }
    if (photo?.delete) target.photo = null
    return target
  })
  pet.delete.mockImplementation(async ({ where }) => {
    const index = rows.findIndex(row => row.id === where.id && row.userId === where.userId)
    if (index < 0) throw { code: 'P2025' }
    return rows.splice(index, 1)[0]
  })
  customerAccountEvent.create.mockImplementation(async ({ data }) => {
    events.push(structuredClone(data))
    return data
  })
  transaction.mockImplementation(async action => {
    const beforeRows = structuredClone(rows), beforeEvents = structuredClone(events)
    try { return await action({ pet, customerAccountEvent }) }
    catch (error) { rows = beforeRows; events = beforeEvents; throw error }
  })
  const { default: accountRoutes } = await import('../../../src/domains/account/routes/account.routes.js')
  const app = express()
  app.use(express.json({ limit: '100kb' }))
  app.use('/api/account', accountRoutes)
  server = app.listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  origin = `http://127.0.0.1:${server.address().port}/api/account/pets`
})

afterEach(async () => {
  if (server) await new Promise(resolve => server.close(resolve))
  server = null
})

function request(method = 'GET', path = '', body, owner = 'customer-one') {
  return fetch(origin + path, {
    method,
    headers: {
      ...(owner ? { 'X-Fixture-Customer': owner } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

function expectNoWrites() {
  expect(pet.create).not.toHaveBeenCalled()
  expect(pet.update).not.toHaveBeenCalled()
  expect(pet.delete).not.toHaveBeenCalled()
  expect(customerAccountEvent.create).not.toHaveBeenCalled()
}

async function photoRequest(method, petId = id, bytes, type = 'image/png', owner = 'customer-one', extraHeaders = {}) {
  return fetch(`${origin}/${petId}/photo`, {
    method,
    headers: { ...(owner ? { 'X-Fixture-Customer': owner } : {}), 'Content-Type': type, ...extraHeaders },
    ...(bytes === undefined ? {} : { body: bytes }),
  })
}

const pngPhoto = () => sharp({ create: { width: 300, height: 150, channels: 3, background: '#17664e' } }).png().toBuffer()

describe('photo-led account pet routes', () => {
  it('round-trips richer fields, preserves them on legacy updates, and locks saved birthdays', async () => {
    const details = { nickname: 'Evie', breedId: 'chihuahua', isMixed: true, birthdayMonth: 2, birthdayDay: 29, treatPurposes: ['BONDING', 'EVERYDAY'] }
    const createdResponse = await request('POST', '', details)
    expect(createdResponse.status).toBe(201)
    const created = (await createdResponse.json()).result
    expect(created).toMatchObject({ ...details, birthdaySetAt: expect.any(String), archivedAt: null, hasPhoto: false, photoUpdatedAt: null })
    const legacy = await request('PUT', '/' + created.id, { nickname: 'Renamed', treatPurpose: 'REWARD' })
    expect((await legacy.json()).result).toMatchObject({ ...details, nickname: 'Renamed', treatPurpose: 'REWARD', birthdaySetAt: created.birthdaySetAt })
    const noOpEvents = events.length
    expect((await request('PUT', '/' + created.id, { nickname: 'Renamed', treatPurpose: 'REWARD' })).status).toBe(200)
    expect(events).toHaveLength(noOpEvents)
    const reordered = await request('PUT', '/' + created.id, { nickname: 'Renamed', treatPurposes: ['EVERYDAY', 'BONDING'] })
    expect(reordered.status).toBe(200)
    expect((await reordered.json()).result.treatPurpose).toBe('REWARD')
    expect(events).toHaveLength(noOpEvents)
    for (const pair of [{ birthdayMonth: null, birthdayDay: null }, { birthdayMonth: 3, birthdayDay: 1 }]) {
      const response = await request('PUT', '/' + created.id, { nickname: 'Renamed', ...pair })
      expect(response.status).toBe(409)
      expect(await response.json()).toEqual({ success: false, message: 'A saved birthday cannot be changed.' })
    }
    expect(events).toHaveLength(noOpEvents)
    expect(JSON.stringify(events)).not.toMatch(/chihuahua|BONDING|EVERYDAY|Evie|Renamed/)
  })

  it('archives/restores without losing data or cap capacity, and DELETE remains true removal', async () => {
    rows = Array.from({ length: 10 }, (_, index) => record('customer-one', index ? 'c' + String(index).padStart(24, '0') : id))
    expect((await request('PATCH', `/${id}/archive`, { archived: true })).status).toBe(200)
    const listed = (await (await request()).json()).result
    expect(listed).toHaveLength(10)
    expect(listed[0].archivedAt).toEqual(expect.any(String))
    expect((await request('POST', '', { nickname: 'Eleventh' })).status).toBe(409)
    expect((await request('PATCH', `/${id}/archive`, { archived: true })).status).toBe(200)
    expect(events.map(event => event.type)).toEqual(['PET_ARCHIVED'])
    const restored = await request('PATCH', `/${id}/archive`, { archived: false })
    expect((await restored.json()).result.archivedAt).toBeNull()
    expect((await request('DELETE', '/' + id)).status).toBe(200)
    expect(rows.some(row => row.id === id)).toBe(false)
    expect(events.map(event => event.type)).toEqual(['PET_ARCHIVED', 'PET_RESTORED', 'PET_DELETED'])
  })

  it('uploads, privately fetches and removes optimized photos with safe DTOs and audit', async () => {
    const input = await sharp({ create: { width: 1800, height: 900, channels: 3, background: '#17664e' } }).png().withMetadata().toBuffer()
    const uploaded = await photoRequest('PUT', id, input)
    expect(uploaded.status).toBe(200)
    const result = (await uploaded.json()).result
    expect(result).toMatchObject({ id, hasPhoto: true, photoUpdatedAt: expect.any(String) })
    expect(JSON.stringify(result)).not.toMatch(/bytes|contentType|userId|metadata|private-fixture/)
    const response = await photoRequest('GET')
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(response.headers.get('content-type')).toBe('image/webp')
    const bytes = Buffer.from(await response.arrayBuffer())
    const metadata = await sharp(bytes).metadata()
    expect(metadata).toMatchObject({ width: 1200, height: 600, format: 'webp' })
    expect(metadata.exif).toBeUndefined()
    expect((await (await request()).json()).result[0]).toMatchObject({ hasPhoto: true, photoUpdatedAt: result.photoUpdatedAt })
    const removed = await photoRequest('DELETE')
    expect((await removed.json()).result).toMatchObject({ hasPhoto: false, photoUpdatedAt: null })
    expect((await photoRequest('GET')).status).toBe(404)
    expect((await photoRequest('DELETE')).status).toBe(200)
    expect(events.map(event => event.type)).toEqual(['PET_PHOTO_CHANGED', 'PET_PHOTO_REMOVED'])
    expect(events.every(event => JSON.stringify(event.metadata.changedFields) === '["photo"]')).toBe(true)
  })

  it('accepts raw images larger than the global 100kb JSON limit without raising that limit', async () => {
    const pixels = Buffer.alloc(240 * 240 * 3)
    let state = 1
    for (let index = 0; index < pixels.length; index++) { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; pixels[index] = state >>> 24 }
    const input = await sharp(pixels, { raw: { width: 240, height: 240, channels: 3 } }).png().toBuffer()
    expect(input.length).toBeGreaterThan(100 * 1024)
    expect((await photoRequest('PUT', id, input)).status).toBe(200)
  })

  it('requires active sessions for every photo/archive action before parsing or persistence', async () => {
    const input = await pngPhoto()
    for (const owner of [null, 'inactive']) {
      for (const method of ['PUT', 'GET', 'DELETE']) {
        expect((await photoRequest(method, id, method === 'PUT' ? input : undefined, 'image/png', owner)).status).toBe(owner ? 403 : 401)
      }
      expect((await request('PATCH', `/${id}/archive`, { archived: true }, owner)).status).toBe(owner ? 403 : 401)
    }
    expect(pet.findUnique).not.toHaveBeenCalled()
    expectNoWrites()
  })

  it('protects photo/archive ownership and rejects supplied server dates, query or metadata', async () => {
    const before = structuredClone(rows), input = await pngPhoto()
    for (const petId of [otherId, missingId, 'malformed']) {
      for (const method of ['PUT', 'GET', 'DELETE']) {
        const response = await photoRequest(method, petId, method === 'PUT' ? input : undefined)
        expect(response.status).toBe(404)
        expect(await response.json()).toEqual({ success: false, message: 'Pet not found.' })
      }
      expect((await request('PATCH', `/${petId}/archive`, { archived: true })).status).toBe(404)
    }
    for (const input of [{ archived: 'true' }, { archived: true, archivedAt: timestamp }, { archivedAt: timestamp }]) {
      expect((await request('PATCH', `/${id}/archive`, input)).status).toBe(400)
    }
    for (const field of ['birthdaySetAt', 'archivedAt', 'hasPhoto', 'photoUpdatedAt', 'photo', 'petId']) {
      expect((await request('PUT', '/' + id, { nickname: 'Chase', [field]: null })).status).toBe(400)
    }
    for (const method of ['GET', 'PUT', 'DELETE']) {
      expect((await request(method, `/${id}/photo?userId=other`, method === 'PUT' ? {} : undefined)).status).toBe(400)
    }
    expect((await request('DELETE', `/${id}/photo`, { bytes: 'not-raw' })).status).toBe(400)
    expect(rows).toEqual(before)
    expectNoWrites()
  })

  it('bounds uploads and rejects compressed requests, SVG, unknown types and mismatched bytes without writes', async () => {
    const png = await pngPhoto()
    for (const [bytes, type, status, headers] of [
      [Buffer.alloc(5 * 1024 * 1024 + 1), 'image/png', 413],
      [png, 'image/png', 415, { 'Content-Encoding': 'gzip' }],
      [png, 'image/svg+xml', 415], [png, 'application/octet-stream', 415],
      [png, 'image/jpeg', 400], [Buffer.from('<svg></svg>'), 'image/png', 400],
      [Buffer.alloc(0), 'image/png', 400],
    ]) expect((await photoRequest('PUT', id, bytes, type, 'customer-one', headers)).status).toBe(status)
    expectNoWrites()
  })

  it.each(['archive', 'upload', 'remove'])('rolls back %s when its audit write fails, including photo state', async action => {
    rows[0].photo = { bytes: await pngPhoto(), contentType: 'image/webp', updatedAt: timestamp }
    const before = structuredClone(rows)
    customerAccountEvent.create.mockRejectedValueOnce(new Error('private audit failure'))
    const response = action === 'archive'
      ? await request('PATCH', `/${id}/archive`, { archived: true })
      : await photoRequest(action === 'upload' ? 'PUT' : 'DELETE', id, action === 'upload' ? await pngPhoto() : undefined)
    expect(response.status).toBe(500)
    expect(JSON.stringify(await response.json())).not.toContain('private audit failure')
    expect(rows).toEqual(before)
    expect(events).toEqual([])
  })

  it('shares the existing mutation limiter for archive, photo upload and photo removal but not reads', async () => {
    for (let index = 0; index < 30; index++) {
      const response = index % 3 === 0 ? await request('PATCH', `/${id}/archive`, {})
        : index % 3 === 1 ? await photoRequest('PUT', id, Buffer.from('invalid'))
          : await request('DELETE', `/${id}/photo`, { invalid: true })
      expect(response.status).toBe(400)
    }
    for (const method of ['PUT', 'DELETE']) expect((await photoRequest(method)).status).toBe(429)
    expect((await request('PATCH', `/${id}/archive`, { archived: true })).status).toBe(429)
    expect((await photoRequest('GET')).status).toBe(404)
    expect((await request()).status).toBe(200)
    expectNoWrites()
  })
})

describe('authenticated account pet routes', () => {
  it('requires a current active customer session before any pet work', async () => {
    for (const [method, path, body] of [
      ['GET', ''], ['POST', '', { nickname: 'Evie' }],
      ['PUT', '/' + id, { nickname: 'Evie' }], ['DELETE', '/' + id],
    ]) {
      const response = await request(method, path, body, null)
      expect(response.status).toBe(401)
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(await response.json()).toEqual({ success: false, message: 'Customer authentication required.' })
    }
    expect((await request('GET', '', undefined, 'inactive')).status).toBe(403)
    expect(pet.findMany).not.toHaveBeenCalled()
    expect(transaction).not.toHaveBeenCalled()
    expectNoWrites()
  })

  it('returns only safe bounded owned rows, with real empty state support', async () => {
    rows.push(...Array.from({ length: 12 }, (_, index) => record('customer-one', 'c' + String(index).padStart(24, '0'))))
    const response = await request()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.result).toHaveLength(10)
    expect(body.result.every(result => !('userId' in result) && !('user' in result) && !('privateNotes' in result))).toBe(true)
    expect(body.result[0]).toMatchObject({ id, nickname: 'Chase', createdAt: timestamp.toISOString() })
    const other = await request('GET', '', undefined, 'customer-two')
    expect((await other.json()).result.map(result => result.id)).toEqual([otherId])
    const empty = await request('GET', '', undefined, 'customer-with-no-pets')
    expect(await empty.json()).toEqual({ success: true, result: [] })
    expectNoWrites()
  })

  it('creates from the session owner, replaces optional data on PUT, and deletes with only an ID result', async () => {
    const response = await request('POST', '', { nickname: '  Evie  ', proteinPreferences: ['CHICKEN', 'SALMON'] })
    expect(response.status).toBe(201)
    const created = (await response.json()).result
    expect(created).toMatchObject({ nickname: 'Evie', lifeStage: null, sizeBand: null, proteinPreferences: ['CHICKEN', 'SALMON'], treatPurpose: null })
    expect(created).not.toHaveProperty('userId')
    expect(rows.find(row => row.id === created.id).userId).toBe('customer-one')
    const updated = await request('PUT', '/' + id, { nickname: 'New nickname' })
    expect(updated.status).toBe(200)
    expect(await updated.json()).toMatchObject({ success: true, result: {
      id, nickname: 'New nickname', lifeStage: null, sizeBand: null, proteinPreferences: [], treatPurpose: null,
    } })
    const deleted = await request('DELETE', '/' + created.id)
    expect(deleted.status).toBe(200)
    expect(await deleted.json()).toEqual({ success: true, result: { id: created.id } })
    expect(rows.some(row => row.id === created.id)).toBe(false)
    expect(rows.find(row => row.id === otherId)).toEqual(record('customer-two', otherId))
    expect(events.map(event => event.type)).toEqual(['PET_CREATED', 'PET_UPDATED', 'PET_DELETED'])
    expect(events.every(event => event.userId === 'customer-one' && event.changedBy === 'customer-one')).toBe(true)
    expect(created).not.toHaveProperty('metadata')
  })

  it.each([
    {}, [], { nickname: ' ' }, { nickname: 5 }, { nickname: 'x'.repeat(61) },
    { nickname: 'Evie', id }, { nickname: 'Evie', userId: 'customer-two' },
    { nickname: 'Evie', user: { connect: { id: 'customer-two' } } },
    { nickname: 'Evie', lifeStage: 'ADULTISH' }, { nickname: 'Evie', sizeBand: {} },
    { nickname: 'Evie', proteinPreferences: ['BEEF', 'BEEF'] },
    { nickname: 'Evie', proteinPreferences: null },
    { nickname: 'Evie', treatPurpose: 'MEDICAL' }, { nickname: 'Evie', unknown: true },
    { nickname: 'Evie', createdAt: '2020-01-01T00:00:00Z' },
    { nickname: 'Evie', updatedAt: '2020-01-01T00:00:00Z' },
  ])('rejects malformed create and update bodies without writes: %j', async input => {
    const before = structuredClone(rows)
    for (const [method, path] of [['POST', ''], ['PUT', '/' + id]]) {
      const response = await request(method, path, input)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ success: false, message: 'Check your pet profile fields.' })
    }
    expect(rows).toEqual(before)
    expectNoWrites()
  })

  it('rejects absent mutation bodies, owner/query injection and nonempty delete bodies before persistence', async () => {
    expect((await request('POST')).status).toBe(400)
    expect((await request('PUT', '/' + id)).status).toBe(400)
    for (const query of ['?userId=customer-two', '?id=' + otherId, '?unknown=true']) {
      expect((await request('GET', query)).status).toBe(400)
      expect((await request('POST', query, { nickname: 'Evie' })).status).toBe(400)
      expect((await request('PUT', '/' + id + query, { nickname: 'Evie' })).status).toBe(400)
      expect((await request('DELETE', '/' + id + query)).status).toBe(400)
    }
    expect((await request('DELETE', '/' + id, { userId: 'customer-two' })).status).toBe(400)
    expect(pet.findMany).not.toHaveBeenCalled()
    expectNoWrites()
  })

  it('makes foreign-owned, absent and malformed IDs indistinguishable and leaves all rows unchanged', async () => {
    const before = structuredClone(rows)
    for (const petId of [otherId, missingId, 'malformed']) {
      for (const [method, body] of [['PUT', { nickname: 'Attempted change' }], ['DELETE', undefined]]) {
        const response = await request(method, '/' + petId, body)
        expect(response.status).toBe(404)
        expect(await response.json()).toEqual({ success: false, message: 'Pet not found.' })
      }
    }
    expect(rows).toEqual(before)
    expect(pet.update).not.toHaveBeenCalled()
    expect(pet.delete).toHaveBeenCalledTimes(2)
    expect(events).toEqual([])
  })

  it('keeps removed-profile chronology after adding another pet, without storing personal snapshots', async () => {
    const first = await (await request('POST', '', { nickname: 'Private nickname' })).json()
    expect((await request('DELETE', '/' + first.result.id)).status).toBe(200)
    const second = await (await request('POST', '', { nickname: 'Another private nickname' })).json()
    expect(second.result.id).not.toBe(first.result.id)
    expect(rows.some(row => row.id === first.result.id)).toBe(false)
    expect(events.map(event => event.type)).toEqual(['PET_CREATED', 'PET_DELETED', 'PET_CREATED'])
    expect(events[1].metadata).toMatchObject({ petId: first.result.id, petCreatedAt: first.result.createdAt, profileAgeSeconds: expect.any(Number) })
    expect(events[2].metadata.petId).toBe(second.result.id)
    expect(JSON.stringify(events)).not.toContain('Private nickname')
    expect(JSON.stringify(events)).not.toContain('Another private nickname')
    const response = await request()
    expect(JSON.stringify(await response.json())).not.toContain('profileAgeSeconds')
  })

  it.each([
    ['POST', '', { nickname: 'Evie' }, 'Unable to save pet.'],
    ['PUT', '/' + id, { nickname: 'Changed' }, 'Unable to update pet.'],
    ['DELETE', '/' + id, undefined, 'Unable to remove pet.'],
  ])('does not acknowledge %s or retain mock state when the audit write fails', async (method, path, input, message) => {
    const before = structuredClone(rows)
    customerAccountEvent.create.mockRejectedValueOnce(new Error('private audit connection failure'))
    const response = await request(method, path, input)
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ success: false, message })
    expect(rows).toEqual(before)
    expect(events).toEqual([])
  })

  it('allows the tenth pet but refuses an eleventh before an insert, without counting other owners', async () => {
    rows = Array.from({ length: 9 }, (_, index) => record('customer-one', 'c' + String(index + 50).padStart(24, '0')))
    rows.push(...Array.from({ length: 10 }, (_, index) => record('customer-two', 'c' + String(index + 100).padStart(24, '0'))))
    expect((await request('POST', '', { nickname: 'Tenth' })).status).toBe(201)
    const response = await request('POST', '', { nickname: 'Eleventh' })
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ success: false, message: 'You can save up to 10 pets.' })
    expect(pet.create).toHaveBeenCalledTimes(1)
    expect(rows.filter(row => row.userId === 'customer-one')).toHaveLength(10)
  })

  it('hides database details and leaves state unchanged when each operation fails', async () => {
    const before = structuredClone(rows)
    const failure = { name: 'PrismaClientKnownRequestError', statusCode: 400, message: 'private database connection and query', code: 'P1001' }
    for (const [method, path, body, boundary, message] of [
      ['GET', '', undefined, pet.findMany, 'Unable to load pets.'],
      ['POST', '', { nickname: 'Evie' }, transaction, 'Unable to save pet.'],
      ['PUT', '/' + id, { nickname: 'Evie' }, pet.update, 'Unable to update pet.'],
      ['DELETE', '/' + id, undefined, pet.delete, 'Unable to remove pet.'],
    ]) {
      boundary.mockRejectedValueOnce(failure)
      const response = await request(method, path, body)
      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({ success: false, message })
    }
    expect(rows).toEqual(before)
    session.mockRejectedValueOnce(new Error('private session failure'))
    const response = await request()
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ success: false, message: 'Unable to validate customer session.' })
  })

  it('rate limits mutations together, without blocking reads or running persistence for rejected attempts', async () => {
    for (let index = 0; index < 30; index++) {
      const [method, path] = [['POST', ''], ['PUT', '/' + id], ['DELETE', '/' + id]][index % 3]
      expect((await request(method, path, { unknown: true })).status).toBe(400)
    }
    const response = await request('POST', '', { nickname: 'Evie' })
    expect(response.status).toBe(429)
    expect(response.headers.get('ratelimit-remaining')).toBe('0')
    expect(await response.json()).toEqual({ message: 'Too many pet profile changes. Please try again shortly.' })
    expect((await request()).status).toBe(200)
    expectNoWrites()
  })
})
