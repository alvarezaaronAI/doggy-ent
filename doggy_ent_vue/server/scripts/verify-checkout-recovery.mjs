import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import { fileURLToPath } from 'node:url'
import { parse } from 'dotenv'
import pg from 'pg'

const root = fileURLToPath(new URL('../', import.meta.url))
const fixtureName = `checkout_recovery_fixture_${Date.now()}_${randomBytes(4).toString('hex')}`
const fixturePattern = /^checkout_recovery_fixture_\d{13}_[a-f0-9]{8}$/
const loopback = host => ['localhost', '127.0.0.1', '::1', '[::1]'].includes(host)
let stage = 'preflight', created = false, success = false, prisma, admin, deniedCalls = 0
const report = (name, passed) => process.stdout.write(`${JSON.stringify({ stage: name, passed })}\n`)
function denyProvider() {
  deniedCalls++
  throw Object.assign(new Error('Provider calls are forbidden in this fixture.'), { code: 'FIXTURE_NETWORK_BLOCKED' })
}

try {
  assert.equal(process.argv.length, 2)
  const env = parse(readFileSync(new URL('../.env', import.meta.url)))
  const source = new URL(env.DATABASE_URL)
  assert(['postgres:', 'postgresql:'].includes(source.protocol))
  assert(loopback(source.hostname))
  assert(fixturePattern.test(fixtureName))
  const sourceDatabase = decodeURIComponent(source.pathname.slice(1))
  assert(sourceDatabase && sourceDatabase !== fixtureName)
  const port = Number(source.port || 5432)
  assert(Number.isSafeInteger(port) && port > 0 && port < 65536)

  globalThis.fetch = async () => denyProvider()
  for (const transport of [http, https]) { transport.request = denyProvider; transport.get = denyProvider }
  const connect = net.Socket.prototype.connect
  net.Socket.prototype.connect = function (...args) {
    const first = Array.isArray(args[0]) ? args[0][0] : args[0]
    const host = typeof first === 'object' ? first.host || 'localhost' : typeof args[1] === 'string' ? args[1] : 'localhost'
    const targetPort = typeof first === 'object' ? first.port : first
    assert(loopback(host) && Number(targetPort) === port && !first?.path)
    return connect.apply(this, args)
  }
  await assert.rejects(fetch('https://provider.invalid'), error => error.code === 'FIXTURE_NETWORK_BLOCKED')
  deniedCalls = 0

  // Explicit fields prevent connection-string query parameters or PGHOST from changing the target.
  admin = new pg.Client({
    host: source.hostname.replace(/^\[|\]$/g, ''), port, database: sourceDatabase,
    user: decodeURIComponent(source.username), password: decodeURIComponent(source.password),
    ssl: false, connectionTimeoutMillis: 5000,
  })
  await admin.connect()
  assert.equal((await admin.query('SELECT current_database() AS name')).rows[0].name, sourceDatabase)
  stage = 'create-disposable-database'
  await admin.query(`CREATE DATABASE "${fixtureName}"`)
  created = true
  const fixture = new URL(source)
  fixture.pathname = `/${fixtureName}`; fixture.search = ''; fixture.hash = ''
  assert(loopback(fixture.hostname) && fixture.pathname === `/${fixtureName}`)

  stage = 'migrate-disposable-database'
  const childEnv = {}
  for (const key of ['PATH', 'HOME', 'TMPDIR', 'TEMP', 'TMP', 'LANG']) if (process.env[key]) childEnv[key] = process.env[key]
  execFileSync(process.execPath, [
    fileURLToPath(new URL('../node_modules/prisma/build/index.js', import.meta.url)),
    'migrate', 'deploy', '--schema', fileURLToPath(new URL('../prisma/schema.prisma', import.meta.url)),
  ], { cwd: root, env: { ...childEnv, DATABASE_URL: fixture.href, NODE_ENV: 'test', CHECKPOINT_DISABLE: '1', PRISMA_HIDE_UPDATE_MESSAGE: 'true' }, stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 })
  Object.assign(process.env, {
    DATABASE_URL: fixture.href, NODE_ENV: 'test', EMAIL_MODE: 'mock', EMAIL_PROVIDER: 'mock',
    CHECKOUT_RECEIPT_SEND_ENABLED: 'false', FRONTEND_URL: 'https://fixture.example.test', CLIENT_URL: 'https://fixture.example.test',
    STRIPE_SECRET_KEY: '', RESEND_API_KEY: '', SHIPPO_API_KEY: '', SHIPPO_API_TOKEN: '',
  })
  ;({ prisma } = await import('../src/db/prisma.js'))
  assert(prisma.checkoutAttempt)
  assert.equal((await prisma.$queryRawUnsafe('SELECT current_database() AS name'))[0].name, fixtureName)
  const { finalizeCheckoutAttempt } = await import('../src/domains/checkout/repositories/checkoutFinalization.repository.js')
  const { claimAttempt, updateClaimedAttempt, releaseAttempt, saveVerifiedEvent } = await import('../src/domains/checkout/repositories/checkoutAttempt.repository.js')
  const { mapCustomerOrder } = await import('../src/domains/orders/mappers/orders.mapper.js')
  const template = await prisma.emailTemplate.create({ data: {
    name: 'Recovery fixture receipt', event: 'ORDER_CONFIRMATION', subject: 'Payment {{orderReference}}',
    heading: 'Payment received', body: 'Fixture receipt only.', footer: 'No provider is used.',
  } })
  await prisma.checkoutReceiptSettings.create({ data: { id: 'checkout-payment-receipt', mode: 'DRY_RUN', templateId: template.id } })
  report(stage, true)

  let sequence = 0
  async function scenario({ stock = 1, totalLimit = null, customerLimit = null } = {}) {
    const key = `fixture-${++sequence}`
    const product = await prisma.product.create({ data: {
      name: 'Frozen fixture treat', slug: key, status: 'ACTIVE', sellingMode: 'INVENTORY_LIMITED',
      variants: { create: { sku: `${key}-6`, size: '6 oz', price: 1000, inventory: stock } },
    }, include: { variants: true } })
    const promo = await prisma.promo.create({ data: {
      code: key.toUpperCase(), name: 'Frozen fixture promo', status: 'ACTIVE', discountType: 'PERCENT', discountValue: 10,
      usageLimitTotal: totalLimit, usageLimitPerCustomer: customerLimit,
    } })
    const campaign = await prisma.campaign.create({ data: {
      name: 'Frozen fixture campaign', slug: key, status: 'ACTIVE', donationTarget: 'Frozen fixture beneficiary',
      donationType: 'PERCENT', donationValue: 10, productIds: [product.id],
    } })
    const attempts = []
    const addAttempt = async (email = 'fixture@example.test') => {
      const id = randomUUID(), leaseToken = randomUUID(), now = new Date()
      const variant = product.variants[0]
      const attempt = await prisma.checkoutAttempt.create({ data: {
        id, recoveryHash: randomBytes(32).toString('hex'), inputHash: randomBytes(32).toString('hex'),
        amountCents: 1100, currency: 'usd', paymentMode: 'sandbox', stripeAccountId: 'acct_fixture',
        paymentIntentId: `pi_fixture_${id}`, status: 'PAID_PENDING_ORDER', paidAt: now,
        leaseToken, leaseUntil: new Date(now.getTime() + 60000),
        expiresAt: new Date(now.getTime() + 900000), recoveryExpiresAt: new Date(now.getTime() + 86400000),
        snapshot: {
          version: 1, userId: null,
          items: [{ id: product.id, productId: product.id, variantId: variant.id, name: product.name, image: null, price: 10, quantity: 1, size: variant.size, sku: variant.sku, variant: { sku: variant.sku } }],
          customer: { firstName: 'Fixture', lastName: 'Customer', email, address1: '1 Fixture Lane', city: 'Fixture City', state: 'CA', zip: '90001', country: 'US' },
          preview: {
            pricing: { subtotal: 10, discountAmount: 1, shippingAmount: 2, taxAmount: 0, total: 11 },
            shipping: { method: 'standard', carrier: 'Fixture carrier', service: 'Ground', provider: 'STATIC' },
            taxSnapshot: null, promo: { valid: true, code: promo.code, discountAmount: 1 },
            campaigns: [{ campaignId: campaign.id, campaignName: campaign.name, donationTarget: campaign.donationTarget, donationType: 'PERCENT', donationValue: 10, matchedSubtotal: 10, donationAmount: 1, matchedProductIds: [product.id] }],
          },
          promoAgreement: { promoId: promo.id, code: promo.code, name: promo.name, usageLimitTotal: totalLimit, usageLimitPerCustomer: customerLimit },
        },
      } })
      attempts.push(attempt)
      return attempt
    }
    return { product, promo, campaign, attempts, addAttempt }
  }
  const finalize = row => finalizeCheckoutAttempt(row.id, { paymentIntentId: row.paymentIntentId, leaseToken: row.leaseToken })
  async function assertEffects(test, count, stock) {
    const orders = await prisma.order.findMany({ where: { stripePaymentIntentId: { in: test.attempts.map(row => row.paymentIntentId) } } })
    assert.equal(orders.length, count)
    assert.equal(await prisma.emailDelivery.count({ where: { orderId: { in: orders.map(row => row.id) } } }), count)
    assert.equal(await prisma.promoUsage.count({ where: { promoId: test.promo.id } }), count)
    assert.equal(await prisma.orderCampaignUsage.count({ where: { campaignId: test.campaign.id } }), count)
    const promo = await prisma.promo.findUnique({ where: { id: test.promo.id } })
    const campaign = await prisma.campaign.findUnique({ where: { id: test.campaign.id } })
    assert.equal(promo.usedCount, count); assert.equal(promo.discountGiven, count); assert.equal(promo.revenueGenerated, 10 * count)
    assert.equal(campaign.orderCount, count); assert.equal(campaign.donationGenerated, count); assert.equal(campaign.revenueGenerated, 10 * count)
    assert.equal((await prisma.productVariant.findUnique({ where: { id: test.product.variants[0].id } })).inventory, stock)
  }

  stage = 'repository-lease-cas'
  const leaseTest = await scenario(), leaseAttempt = await leaseTest.addAttempt()
  await prisma.checkoutAttempt.update({ where: { id: leaseAttempt.id }, data: { leaseToken: null, leaseUntil: null } })
  const claims = await Promise.all([claimAttempt(leaseAttempt.id), claimAttempt(leaseAttempt.id), claimAttempt(leaseAttempt.id)])
  assert.equal(claims.filter(Boolean).length, 1)
  const firstLease = claims.find(Boolean)
  assert.equal((await updateClaimedAttempt(leaseAttempt.id, 'stale-fixture-token', { lastErrorCode: 'STALE' })).count, 0)
  assert.equal((await releaseAttempt(leaseAttempt.id, 'stale-fixture-token')).count, 0)
  assert.equal((await updateClaimedAttempt(leaseAttempt.id, firstLease, { status: 'PROCESSING' })).count, 1)
  let leased = await prisma.checkoutAttempt.findUnique({ where: { id: leaseAttempt.id } })
  assert.equal(leased.leaseToken, firstLease); assert.equal(leased.status, 'PROCESSING'); assert.equal(leased.lastErrorCode, null)
  await prisma.checkoutAttempt.update({ where: { id: leaseAttempt.id }, data: { leaseUntil: new Date(Date.now() - 1000) } })
  assert.equal((await updateClaimedAttempt(leaseAttempt.id, firstLease, { lastErrorCode: 'EXPIRED' })).count, 0)
  const replacementLease = await claimAttempt(leaseAttempt.id)
  assert(replacementLease && replacementLease !== firstLease)
  assert.equal((await releaseAttempt(leaseAttempt.id, firstLease)).count, 0)
  assert.equal((await updateClaimedAttempt(leaseAttempt.id, firstLease, { status: 'PAID_REVIEW' })).count, 0)
  assert.equal((await updateClaimedAttempt(leaseAttempt.id, replacementLease, { status: 'PAID_PENDING_ORDER' })).count, 1)
  assert.equal((await releaseAttempt(leaseAttempt.id, replacementLease)).count, 1)
  leased = await prisma.checkoutAttempt.findUnique({ where: { id: leaseAttempt.id } })
  assert.equal(leased.leaseToken, null); assert.equal(leased.leaseUntil, null); assert.equal(leased.lastErrorCode, null)
  await assertEffects(leaseTest, 0, 1)
  report(stage, true)

  stage = 'repository-event-permanent-deduplication'
  const event = { id: `evt_fixture${randomBytes(8).toString('hex')}`, type: 'payment_intent.succeeded',
    paymentIntentId: leaseAttempt.paymentIntentId, stripeAccountId: 'acct_fixture', paymentMode: 'sandbox',
    attemptId: leaseAttempt.id, status: 'PENDING' }
  await Promise.all([saveVerifiedEvent(event), saveVerifiedEvent(event), saveVerifiedEvent(event)])
  assert.equal(await prisma.stripePaymentEvent.count({ where: { id: event.id } }), 1)
  const firstEvent = await prisma.stripePaymentEvent.findUnique({ where: { id: event.id } })
  assert.deepEqual(Object.keys(firstEvent).sort(), ['id', 'type', 'paymentIntentId', 'stripeAccountId', 'paymentMode', 'attemptId', 'status', 'receivedAt', 'processedAt'].sort())
  assert.equal(firstEvent.processedAt, null)
  const processedEvent = await prisma.stripePaymentEvent.update({ where: { id: event.id }, data: { status: 'PROCESSED', processedAt: new Date() } })
  await saveVerifiedEvent({ ...event, paymentIntentId: 'pi_fixtureUnrelated', status: 'PENDING' })
  assert.deepEqual(await prisma.stripePaymentEvent.findUnique({ where: { id: event.id } }), processedEvent)
  assert.equal(await prisma.stripePaymentEvent.count({ where: { id: event.id } }), 1)
  report(stage, true)

  stage = 'same-attempt-last-stock'
  const same = await scenario({ totalLimit: 1, customerLimit: 1 })
  const sameAttempt = await same.addAttempt()
  const duplicates = await Promise.all([finalize(sameAttempt), finalize(sameAttempt), finalize(sameAttempt)])
  assert(duplicates.every(order => order.id === duplicates[0].id))
  await assertEffects(same, 1, 0)
  const receipt = await prisma.emailDelivery.findFirst({ where: { orderId: duplicates[0].id } })
  assert.equal(receipt.status, 'QUEUED'); assert.equal(receipt.provider, 'MOCK'); assert.equal(receipt.automatic, true)
  assert(receipt.renderedEmail.html.includes('Frozen fixture beneficiary'))
  report(stage, true)

  for (const contention of ['stock', 'per-email', 'total']) {
    stage = `different-attempt-${contention}`
    const test = await scenario({ stock: contention === 'stock' ? 1 : 2, totalLimit: contention === 'total' ? 1 : null, customerLimit: contention === 'per-email' ? 1 : null })
    const first = await test.addAttempt()
    const second = await test.addAttempt(contention === 'total' ? 'other@example.test' : 'fixture@example.test')
    const results = await Promise.allSettled([finalize(first), finalize(second)])
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1)
    const loserIndex = results.findIndex(result => result.status === 'rejected')
    const error = results[loserIndex].reason
    assert.equal(error.code, contention === 'stock' ? 'CHECKOUT_STOCK_UNAVAILABLE' : 'CHECKOUT_PROMO_LIMIT')
    const loser = test.attempts[loserIndex]
    const savedLoser = await prisma.checkoutAttempt.findUnique({ where: { id: loser.id } })
    assert.equal(savedLoser.orderId, null); assert.equal(savedLoser.status, 'PAID_PENDING_ORDER')
    // Simulate only the parent's lease-scoped review write, never its provider orchestration.
    const reviewed = await prisma.checkoutAttempt.updateMany({ where: { id: loser.id, leaseToken: loser.leaseToken, status: 'PAID_PENDING_ORDER' }, data: { status: 'PAID_REVIEW', lastErrorCode: error.code, leaseToken: null, leaseUntil: null } })
    assert.equal(reviewed.count, 1)
    assert.equal((await prisma.checkoutAttempt.findUnique({ where: { id: loser.id } })).status, 'PAID_REVIEW')
    await assertEffects(test, 1, contention === 'stock' ? 0 : 1)
    report(stage, true)
  }

  for (const table of ['EmailDelivery', 'PromoUsage', 'OrderCampaignUsage']) {
    stage = `rollback-${table}`
    const test = await scenario(), row = await test.addAttempt()
    await prisma.$executeRawUnsafe('CREATE FUNCTION checkout_recovery_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION \'Fixture write failure\'; END; $$')
    await prisma.$executeRawUnsafe(`CREATE TRIGGER checkout_recovery_fail BEFORE INSERT ON "${table}" FOR EACH ROW EXECUTE FUNCTION checkout_recovery_fail()`)
    try {
      await assert.rejects(finalize(row))
      await assertEffects(test, 0, 1)
      assert.equal((await prisma.checkoutAttempt.findUnique({ where: { id: row.id } })).status, 'PAID_PENDING_ORDER')
    } finally {
      await prisma.$executeRawUnsafe(`DROP TRIGGER checkout_recovery_fail ON "${table}"`)
      await prisma.$executeRawUnsafe('DROP FUNCTION checkout_recovery_fail()')
    }
    await finalize(row); await assertEffects(test, 1, 0)
    report(stage, true)
  }

  stage = 'immutable-attribution-after-rule-mutation-and-deletion'
  await prisma.campaign.update({ where: { id: same.campaign.id }, data: { name: 'Changed fixture campaign', donationTarget: 'Changed fixture beneficiary', donationType: 'FIXED', donationValue: 99 } })
  await prisma.promo.update({ where: { id: same.promo.id }, data: { name: 'Changed fixture promo', code: 'CHANGED-FIXTURE', discountValue: 99 } })
  const readCustomer = async () => {
    const raw = await prisma.order.findUnique({ where: { id: duplicates[0].id }, include: { items: true, campaignUsages: { include: { campaign: true } } } })
    return mapCustomerOrder(raw)
  }
  const mutated = await readCustomer()
  assert.equal(mutated.donationAmount, 1)
  assert.equal(mutated.campaignAttributions[0].donationTarget, 'Frozen fixture beneficiary')
  assert.equal(mutated.promoUsage.promoCode, same.promo.code)
  await prisma.campaign.delete({ where: { id: same.campaign.id } })
  const deleted = await readCustomer()
  assert.equal(deleted.donationAmount, 1)
  assert.equal(deleted.campaignAttributions[0].campaignName, 'Frozen fixture campaign')
  assert.equal(deleted.campaignAttributions[0].pageAvailable, false)
  assert(!Object.hasOwn(deleted, 'attributionSnapshot') && !Object.hasOwn(deleted, 'stripePaymentIntentId'))
  report(stage, true)

  stage = 'unknown-commit-replay'
  const unknown = await scenario(), unknownAttempt = await unknown.addAttempt()
  const realTransaction = prisma.$transaction.bind(prisma)
  let loseResponse = true
  prisma.$transaction = async (...args) => {
    const result = await realTransaction(...args)
    if (loseResponse) { loseResponse = false; throw new Error('Fixture lost commit response') }
    return result
  }
  try { await assert.rejects(finalize(unknownAttempt), error => error.message === 'Fixture lost commit response') }
  finally { prisma.$transaction = realTransaction }
  const replay = await finalize(unknownAttempt)
  assert.equal(replay.id, (await prisma.checkoutAttempt.findUnique({ where: { id: unknownAttempt.id } })).orderId)
  await assertEffects(unknown, 1, 0)
  assert.equal(deniedCalls, 0)
  report(stage, true)
  success = true
} catch {
  process.stderr.write(`${JSON.stringify({ stage, passed: false, rawErrorWithheld: true })}\n`)
  process.exitCode = 1
} finally {
  await prisma?.$disconnect().catch(() => {})
  if (created) {
    try {
      assert(fixturePattern.test(fixtureName))
      await admin.query(`DROP DATABASE "${fixtureName}" WITH (FORCE)`)
      report('fixture-database-removed', true)
    } catch {
      report('fixture-database-removed', false)
      process.exitCode = 1; success = false
    }
  }
  await admin?.end().catch(() => {})
  report('checkout-recovery-acceptance', success)
}
