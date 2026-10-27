import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadServerEnv } from '../../../src/config/env.js'
import { getPaymentConfig } from '../../../src/domains/payments/config/payment.config.js'

let directory
beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'shop-payment-startup-'))
  for (const name of ['DATABASE_URL', 'STRIPE_SECRET_KEY', 'PAYMENT_MODE', 'PAYMENTS_ENABLED', 'STRIPE_EXPECTED_ACCOUNT_ID', 'ADMIN_DATA_TARGET']) vi.stubEnv(name, undefined)
  vi.stubEnv('NODE_ENV', 'test')
  vi.stubEnv('ADMIN_GATEWAY_REQUIRED', 'false')
  vi.stubEnv('DOGGY_SERVER_ENV_TARGET', 'LOCAL')
  vi.stubEnv('DOGGY_SERVER_ENV_FILE', '.env.stripe-sandbox.local')
  fs.writeFileSync(path.join(directory, '.env'), 'DATABASE_URL=postgresql://fixture:fixture@127.0.0.1:1/unused\nSTRIPE_SECRET_KEY=sk_test_oldFixture123\n')
  fs.writeFileSync(path.join(directory, '.env.stripe-sandbox.local'), 'PAYMENT_MODE=sandbox\nPAYMENTS_ENABLED=false\nSTRIPE_EXPECTED_ACCOUNT_ID=acct_newFixture\nSTRIPE_SECRET_KEY=\n')
})
afterEach(() => { fs.rmSync(directory, { recursive: true, force: true }); vi.unstubAllEnvs() })

describe('dedicated local sandbox startup', () => {
  it('overrides the older credential with an empty key and leaves charging paused', () => {
    expect(loadServerEnv({ rootDir: directory })).toMatchObject({ dataTarget: 'LOCAL', envFile: '.env.stripe-sandbox.local' })
    expect(process.env.STRIPE_SECRET_KEY).toBe('')
    expect(getPaymentConfig()).toMatchObject({ mode: 'sandbox', enabled: false, keyMode: 'unconfigured', expectedAccountId: 'acct_newFixture' })
  })

  it('rejects a missing override instead of using the older base credential', () => {
    fs.unlinkSync(path.join(directory, '.env.stripe-sandbox.local'))
    expect(() => loadServerEnv({ rootDir: directory })).toThrow('override file was not found')
  })

  it('rejects a remote database even when one was inherited from a parent process', () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://fixture:fixture@remote.example.test/unused')
    expect(() => loadServerEnv({ rootDir: directory })).toThrow('LOCAL mode requires a loopback database')
  })

  it('keeps sandbox startup scripts pinned to a local API/database target', () => {
    const server = JSON.parse(fs.readFileSync(new URL('../../../package.json', import.meta.url)))
    const client = JSON.parse(fs.readFileSync(new URL('../../../../client/package.json', import.meta.url)))
    expect(server.scripts['dev:stripe-sandbox']).toContain('DOGGY_SERVER_ENV_TARGET=LOCAL')
    expect(server.scripts['dev:stripe-sandbox']).toContain('DOGGY_SERVER_ENV_FILE=.env.stripe-sandbox.local')
    expect(server.scripts['dev:stripe-sandbox']).toContain('NODE_ENV=development PORT=3010')
    expect(server.scripts['dev:stripe-sandbox']).toContain('BETTER_AUTH_URL=http://127.0.0.1:3010')
    expect(server.scripts['dev:stripe-sandbox']).toContain('FRONTEND_URL=http://127.0.0.1:5175')
    expect(server.scripts['dev:stripe-sandbox']).toContain('EMAIL_MODE=mock EMAIL_PROVIDER=mock CHECKOUT_RECEIPT_SEND_ENABLED=false')
    expect(client.scripts['dev:stripe-sandbox']).toContain('VITE_API_BASE_URL=http://127.0.0.1:3010')
    expect(client.scripts['dev:stripe-sandbox']).toContain('VITE_API_URL=http://127.0.0.1:3010')
    expect(client.scripts['dev:stripe-sandbox']).toContain('--host 127.0.0.1 --port 5175 --strictPort')
    expect(client.scripts['dev:stripe-sandbox']).toContain('--mode stripe-sandbox')
  })
})
