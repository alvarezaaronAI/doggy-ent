import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

function normalizeDataTarget(value) {
  const target = String(value || '')
    .trim()
    .toUpperCase()

  if (
    target === 'RAILWAY'
    || target === 'RAILWAY_DB'
  ) {
    return 'RAILWAY_DB'
  }

  return 'LOCAL'
}

export function loadServerEnv({
  rootDir,
} = {}) {
  const serverRoot = rootDir || process.cwd()
  const baseEnvPath = path.resolve(serverRoot, '.env')

  dotenv.config({
    path: baseEnvPath,
    quiet: true,
  })

  const overrideEnvFile = String(
    process.env.DOGGY_SERVER_ENV_FILE || '',
  ).trim()

  let overrideEnv = {}

  if (overrideEnvFile) {
    const overrideEnvPath = path.resolve(serverRoot, overrideEnvFile)

    if (!fs.existsSync(overrideEnvPath)) {
      throw new Error(
        `Server env override file was not found: ${overrideEnvFile}`,
      )
    }

    overrideEnv = dotenv.parse(
      fs.readFileSync(overrideEnvPath),
    )

    dotenv.config({
      path: overrideEnvPath,
      override: true,
      quiet: true,
    })
  }

  process.env.ADMIN_DATA_TARGET = normalizeDataTarget(
    process.env.ADMIN_DATA_TARGET
    || process.env.DOGGY_SERVER_ENV_TARGET,
  )

  if (
    process.env.ADMIN_DATA_TARGET === 'RAILWAY_DB'
    && !overrideEnv.DATABASE_URL
  ) {
    throw new Error(
      'Railway DB mode requires DATABASE_URL in .env.railway.local so it cannot accidentally use the local database.',
    )
  }

  return {
    dataTarget: process.env.ADMIN_DATA_TARGET,
    envFile: overrideEnvFile || '.env',
  }
}

export function getAdminDataTarget() {
  const dataTarget = normalizeDataTarget(
    process.env.ADMIN_DATA_TARGET,
  )

  if (dataTarget === 'RAILWAY_DB') {
    return {
      code: 'RAILWAY_DB',
      label: 'RAILWAY DB TARGET',
      description: 'Local server writes to Railway DB.',
    }
  }

  return {
    code: 'LOCAL',
    label: 'LOCAL DATA TARGET',
    description: 'Local server writes to local DB.',
  }
}
