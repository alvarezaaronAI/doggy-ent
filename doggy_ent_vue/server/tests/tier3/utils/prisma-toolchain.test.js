import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const packageJson = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'))
const lockfile = JSON.parse(readFileSync(new URL('../../../package-lock.json', import.meta.url), 'utf8'))
const prismaVersion = packageJson.dependencies.prisma

describe('Prisma toolchain compatibility', () => {
  it('pins the CLI and runtime client to the same exact version', () => {
    expect(prismaVersion).toMatch(/^\d+\.\d+\.\d+$/)
    expect(packageJson.dependencies['@prisma/client']).toBe(prismaVersion)
  })

  it('keeps installed and locked Prisma packages aligned with the manifest', () => {
    for (const name of ['prisma', '@prisma/client']) {
      expect(lockfile.packages[''].dependencies[name]).toBe(prismaVersion)
      expect(lockfile.packages[`node_modules/${name}`].version).toBe(prismaVersion)
      expect(require(`${name}/package.json`).version).toBe(prismaVersion)
    }
  })

  it('loads the matching generated client and server singleton without querying a database', async () => {
    const { Prisma } = await import('@prisma/client')
    expect(Prisma.prismaVersion.client).toBe(prismaVersion)
    const { prisma } = await import('../../../src/db/prisma.js')
    await prisma.$disconnect()
  })
})
