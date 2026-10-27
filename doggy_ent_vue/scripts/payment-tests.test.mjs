import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { paymentSuites, paymentTestEnvironment, runPaymentTests } from './payment-tests.mjs'

test('drops inherited credentials, provider hosts and Node preload overrides', () => {
  const env = paymentTestEnvironment({ PATH: '/fixture/bin', HOME: '/fixture/home',
    DATABASE_URL: 'private-fixture', STRIPE_SECRET_KEY: 'private-fixture', RESEND_API_KEY: 'private-fixture',
    ADMIN_SESSION_SECRET: 'private-fixture', BETTER_AUTH_SECRET: 'private-fixture',
    SHIPPO_API_KEY: 'private-fixture', RAILWAY_TOKEN: 'private-fixture', VERCEL_TOKEN: 'private-fixture',
    NODE_OPTIONS: '--require private-fixture', VITE_API_BASE_URL: 'https://private-fixture',
  })
  assert.equal(env.PATH, '/fixture/bin')
  assert.equal(env.NODE_ENV, 'test')
  assert.equal(env.EMAIL_MODE, 'mock')
  assert.equal(env.VITE_API_BASE_URL, 'http://127.0.0.1:1')
  assert(!JSON.stringify(env).includes('private-fixture'))
  for (const name of ['DATABASE_URL', 'STRIPE_SECRET_KEY', 'RESEND_API_KEY', 'ADMIN_SESSION_SECRET', 'NODE_OPTIONS', 'RAILWAY_TOKEN', 'VERCEL_TOKEN']) assert(!Object.hasOwn(env, name))
})

test('does not modify its caller environment', () => {
  const source = { PATH: '/fixture/bin', STRIPE_SECRET_KEY: 'private-fixture' }
  const before = { ...source }
  paymentTestEnvironment(source)
  assert.deepEqual(source, before)
})

test('rejects live or arbitrary arguments before starting a test process', () => {
  let runs = 0
  assert.equal(runPaymentTests({ args: ['--live'], run() { runs++ } }), 2)
  assert.equal(runs, 0)
})

test('uses only local test binaries, fixed suites and a worker network guard', () => {
  const runs = []
  assert.equal(runPaymentTests({ args: [], fileExists: () => true, run(command, args, options) { runs.push({ command, args, options }); return { status: 0 } } }), 0)
  assert.equal(runs.length, 2)
  for (const [index, run] of runs.entries()) {
    assert.equal(run.command, process.execPath)
    assert(run.args[0].endsWith('node_modules/vitest/vitest.mjs'))
    assert(run.args.includes('--allowOnly=false'))
    assert(run.args.some(arg => arg.startsWith('--execArgv=--import=file:') && arg.endsWith('payment-test-network-guard.mjs')))
    assert(run.options.cwd.endsWith(paymentSuites[index].directory))
    assert.equal(run.options.env.EMAIL_MODE, 'mock')
    assert.equal(run.options.timeout, 120000)
  }
})

test('stops at the first failed test process', () => {
  let runs = 0
  assert.equal(runPaymentTests({ args: [], fileExists: () => true, run() { runs++; return { status: 1 } } }), 1)
  assert.equal(runs, 1)
})

test('a terminated or unstartable test process cannot look like a pass', () => {
  for (const result of [{ status: null, signal: 'SIGTERM' }, { error: new Error('fixture failure') }]) {
    assert.equal(runPaymentTests({ args: [], fileExists: () => true, run: () => result }), 1)
  }
})

test('missing dependencies or selected tests cannot produce a partial green report', () => {
  for (const fileExists of [() => false, file => file.includes('node_modules')]) {
    let runs = 0
    assert.equal(runPaymentTests({ args: [], fileExists, run() { runs++ } }), 2)
    assert.equal(runs, 0)
  }
})

test('blocks actual standard network entry points before a connection is attempted', () => {
  const guard = new URL('./payment-test-network-guard.mjs', import.meta.url).href
  const result = spawnSync(process.execPath, ['--import', guard, '--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import { request } from 'node:https';
    import http from 'node:http';
    import net from 'node:net';
    import tls from 'node:tls';
    import dns from 'node:dns';
    const blocked = { code: 'OFFLINE_PAYMENT_NETWORK_BLOCKED' };
    await assert.rejects(fetch('https://provider.example.invalid'), blocked);
    assert.throws(() => request('https://provider.example.invalid'), blocked);
    assert.throws(() => http.get('http://127.0.0.1:1'), blocked);
    assert.throws(() => net.connect(1, '127.0.0.1'), blocked);
    assert.throws(() => new net.Socket().connect(1, '127.0.0.1'), blocked);
    assert.throws(() => tls.connect(443, 'provider.example.invalid'), blocked);
    assert.throws(() => dns.lookup('provider.example.invalid', () => {}), blocked);
    await assert.rejects(dns.promises.resolve('provider.example.invalid'), blocked);
  `], { env: paymentTestEnvironment({}), encoding: 'utf8', timeout: 5000 })
  assert.equal(result.status, 0, result.stderr)
})

test('CLI does not accept a live mode', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./payment-tests.mjs', import.meta.url)), '--live'], { env: paymentTestEnvironment({}), encoding: 'utf8', timeout: 5000 })
  assert.equal(result.status, 2)
  assert.equal(result.stdout, '')
  assert.match(result.stderr, /cannot run live transactions/)
})
