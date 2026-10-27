import { existsSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const guard = new URL('./payment-test-network-guard.mjs', import.meta.url).href

export const paymentSuites = [
  { directory: 'server', paths: [
    'tests/tier1/payments', 'tests/tier1/checkout', 'tests/tier1/promos',
    'tests/tier1/campaigns', 'tests/tier2/payments', 'tests/tier2/checkout',
    'tests/tier2/orders', 'tests/tier2/emails',
    'tests/tier2/admin/manual-order-email.test.js',
  ] },
  { directory: 'client', paths: [
    'tests/tier1/checkout', 'tests/tier1/promos', 'tests/tier2/checkout',
    'tests/tier2/storefront/stripe-loading.test.js',
    'tests/tier2/admin/payment-receipt-activity.test.js',
    'tests/tier2/admin/payment-navigation.test.js',
    'tests/tier2/admin/payment-environment-api.test.js',
    'tests/tier2/admin/payment-environment-composable.test.js',
    'tests/tier2/admin/payment-environment-ui.test.js',
    'tests/tier2/admin/tax-readiness-api.test.js',
    'tests/tier2/admin/order-tax-display.test.js',
  ] },
]

export function paymentTestEnvironment(source = process.env) {
  const env = {}
  for (const key of ['PATH', 'HOME', 'USERPROFILE', 'SYSTEMROOT', 'TMPDIR', 'TEMP', 'TMP', 'LANG', 'TZ', 'TERM', 'NO_COLOR']) {
    if (typeof source[key] === 'string') env[key] = source[key]
  }
  // Trusted fixtures must never inherit production credentials or host overrides.
  return {
    ...env,
    NODE_ENV: 'test',
    CI: 'true',
    BETTER_AUTH_SECRET: 'offline-payment-test-signing-key-not-a-deployment-secret',
    EMAIL_MODE: 'mock',
    EMAIL_PROVIDER: 'mock',
    VITE_APP_SURFACE: 'combined',
    VITE_API_BASE_URL: 'http://127.0.0.1:1',
    VITE_API_URL: 'http://127.0.0.1:1',
    VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_offlineFixture',
  }
}

export function runPaymentTests({ args = process.argv.slice(2), run = spawnSync, fileExists = existsSync } = {}) {
  if (args.length) {
    process.stderr.write('Offline payment checks accept no arguments and cannot run live transactions.\n')
    return 2
  }
  for (const suite of paymentSuites) {
    if (!fileExists(path.join(root, suite.directory, 'node_modules/vitest/vitest.mjs'))) {
      process.stderr.write(`Install the existing ${suite.directory} dependencies before running payment checks.\n`)
      return 2
    }
    if (suite.paths.some(file => !fileExists(path.join(root, suite.directory, file)))) {
      process.stderr.write(`${suite.directory} payment test selection is incomplete. Restore the expected test files before continuing.\n`)
      return 2
    }
  }
  process.stdout.write('Offline payment regression checks: fixture credentials; network blocked in test workers.\nNot Stripe sandbox, database-concurrency, browser or live-payment certification.\n')
  for (const suite of paymentSuites) {
    const cwd = path.join(root, suite.directory)
    const result = run(process.execPath, [
      path.join(cwd, 'node_modules/vitest/vitest.mjs'), 'run', ...suite.paths,
      `--execArgv=--import=${guard}`, '--pool=forks', '--isolate', '--allowOnly=false',
    ], { cwd, env: paymentTestEnvironment(), stdio: 'inherit', timeout: 120000 })
    if (result.error || result.signal || result.status !== 0) {
      process.stderr.write(`${suite.directory} payment checks did not complete successfully.\n`)
      return Number.isInteger(result.status) && result.status > 0 ? result.status : 1
    }
  }
  return 0
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  process.exitCode = runPaymentTests()
}
