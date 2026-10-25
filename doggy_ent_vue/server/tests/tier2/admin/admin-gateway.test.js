import crypto from 'node:crypto'
import dotenv from 'dotenv'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAdminGatewayConfig, loadServerEnv, ADMIN_GATEWAY_MAX_BYTES } from '../../../src/config/env.js'
import { requireAdminGateway } from '../../../src/app/middleware/auth/requireAdminGateway.js'

const synthetic = 'gateway-fixture-only-never-deploy-123456'
const header = 'x-shop-admin-gateway'
const denied = { success: false, message: 'Forbidden.' }

function response() {
  const res = { set: vi.fn(), status: vi.fn(), json: vi.fn() }
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  return res
}

function enabled() {
  vi.stubEnv('ADMIN_GATEWAY_REQUIRED', 'true')
  vi.stubEnv('ADMIN_GATEWAY_SECRET', synthetic)
}

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks() })

describe('pure admin gateway configuration', () => {
  it('defaults off and ignores unused material only when disabled', () => {
    expect(getAdminGatewayConfig({})).toEqual({ required: false })
    expect(getAdminGatewayConfig({ ADMIN_GATEWAY_REQUIRED: 'false', ADMIN_GATEWAY_SECRET: 'unused' })).toEqual({ required: false })
    expect(getAdminGatewayConfig({ ADMIN_GATEWAY_REQUIRED: 'true', ADMIN_GATEWAY_SECRET: synthetic }).required).toBe(true)
  })

  it('accepts only literal true or false, never truthy or normalized values', () => {
    for (const flag of ['', 'TRUE', 'False', '1', '0', ' true', 'false ', true, false, null]) {
      expect(() => getAdminGatewayConfig({ ADMIN_GATEWAY_REQUIRED: flag, ADMIN_GATEWAY_SECRET: synthetic })).toThrow('ADMIN_GATEWAY_REQUIRED must be true or false.')
    }
  })

  it('requires bounded material with at least 32 characters and no whitespace', () => {
    for (const secret of [undefined, null, 123, '', 'x'.repeat(31), 'x'.repeat(32) + ' ', 'x'.repeat(32) + '\n', 'x'.repeat(32) + '\t', 'x'.repeat(32) + '\u00a0', 'x'.repeat(ADMIN_GATEWAY_MAX_BYTES + 1), '\u00e9'.repeat(ADMIN_GATEWAY_MAX_BYTES)]) {
      expect(() => getAdminGatewayConfig({ ADMIN_GATEWAY_REQUIRED: 'true', ADMIN_GATEWAY_SECRET: secret })).toThrow('ADMIN_GATEWAY_SECRET must contain')
    }
    for (const length of [32, ADMIN_GATEWAY_MAX_BYTES]) {
      expect(getAdminGatewayConfig({ ADMIN_GATEWAY_REQUIRED: 'true', ADMIN_GATEWAY_SECRET: 'x'.repeat(length) }).required).toBe(true)
    }
  })

  it('fails startup validation before any database target validation or app import', () => {
    vi.spyOn(dotenv, 'config').mockReturnValue({ parsed: {} })
    vi.stubEnv('DOGGY_SERVER_ENV_FILE', '')
    vi.stubEnv('ADMIN_GATEWAY_REQUIRED', 'true')
    vi.stubEnv('ADMIN_GATEWAY_SECRET', 'short')
    vi.stubEnv('DATABASE_URL', '')
    expect(() => loadServerEnv({ rootDir: '/unused-synthetic-root' })).toThrow('ADMIN_GATEWAY_SECRET must contain')
    vi.stubEnv('ADMIN_GATEWAY_REQUIRED', 'yes')
    expect(() => loadServerEnv({ rootDir: '/unused-synthetic-root' })).toThrow('ADMIN_GATEWAY_REQUIRED must be true or false.')
  })
})

describe('admin gateway middleware', () => {
  it('preserves legacy behavior when unset or explicitly off', () => {
    for (const flag of [undefined, 'false']) {
      vi.stubEnv('ADMIN_GATEWAY_REQUIRED', flag)
      const next = vi.fn(), res = response()
      requireAdminGateway({ headers: {} }, res, next)
      expect(next).toHaveBeenCalledOnce()
      expect(res.status).not.toHaveBeenCalled()
    }
  })

  it('returns one generic uncached 403 for absent, malformed, wrong and oversized headers', () => {
    enabled()
    for (const value of [undefined, '', ['x'], {}, 'short', synthetic + ' ', synthetic + '\t', synthetic + ',other', 'x'.repeat(ADMIN_GATEWAY_MAX_BYTES + 1), '\u00e9'.repeat(ADMIN_GATEWAY_MAX_BYTES), 'y'.repeat(synthetic.length)]) {
      const next = vi.fn(), res = response()
      requireAdminGateway({ headers: { [header]: value } }, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith(denied)
      expect(res.set).toHaveBeenCalledWith('Cache-Control', 'no-store')
    }
  })

  it('compares only fixed-size SHA-256 digests even for different credential lengths', () => {
    enabled()
    const compare = vi.spyOn(crypto, 'timingSafeEqual')
    for (const value of [synthetic, 'x'.repeat(32), 'x'.repeat(ADMIN_GATEWAY_MAX_BYTES)]) {
      const next = vi.fn()
      requireAdminGateway({ headers: { [header]: value } }, response(), next)
      expect(next.mock.calls.length).toBe(value === synthetic ? 1 : 0)
    }
    expect(compare).toHaveBeenCalledTimes(3)
    for (const args of compare.mock.calls) expect(args.map(value => value.byteLength)).toEqual([32, 32])
  })

  it('rejects duplicate raw header fields irrespective of casing', () => {
    enabled()
    const next = vi.fn(), res = response()
    requireAdminGateway({ headers: { [header]: synthetic }, rawHeaders: [header, synthetic, 'X-Shop-Admin-Gateway', synthetic] }, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('does not trust origins, identity headers, cookies or query parameters', () => {
    enabled()
    const next = vi.fn(), res = response()
    requireAdminGateway({ headers: { origin: 'https://admin.example.test', 'x-vercel-id': 'fixture', 'x-user-role': 'ADMIN', 'x-shop-admin-gateway-required': 'false', cookie: `${header}=${synthetic}` }, query: { [header]: synthetic }, cookies: { [header]: synthetic }, admin: { role: 'ADMIN' } }, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith(denied)
  })

  it('fails closed without echoing invalid runtime configuration', () => {
    enabled()
    for (const [name, value] of [['ADMIN_GATEWAY_REQUIRED', 'invalid'], ['ADMIN_GATEWAY_SECRET', 'short']]) {
      enabled(); vi.stubEnv(name, value)
      const res = response(), next = vi.fn()
      requireAdminGateway({ headers: { [header]: synthetic } }, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith(denied)
    }
  })
})
