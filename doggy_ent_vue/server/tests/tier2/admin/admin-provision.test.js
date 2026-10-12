import { beforeEach, describe, expect, it, vi } from 'vitest'
const repository = vi.hoisted(() => ({ findProvisionedAdmin: vi.fn(), createProvisionedAdmin: vi.fn() }))
vi.mock('../../../src/domains/auth/repositories/adminProvision.repository.js', () => repository)
const { provisionAdmin } = await import('../../../src/domains/auth/services/adminProvision.service.js')
const input = { email: ' Admin@example.test ', passwordHash: '$2b$10$' + 'a'.repeat(53) }
beforeEach(() => vi.resetAllMocks())
describe('deliberate non-destructive admin provisioning', () => {
  it('preflights without writing and creates only when explicitly applied', async () => {
    expect(await provisionAdmin(input)).toMatchObject({ ready: true }); expect(repository.createProvisionedAdmin).not.toHaveBeenCalled()
    repository.createProvisionedAdmin.mockResolvedValue({ created: true })
    expect(await provisionAdmin({ ...input, apply: true })).toEqual({ created: true })
    expect(repository.createProvisionedAdmin).toHaveBeenCalledWith({ email: 'admin@example.test', passwordHash: input.passwordHash })
  })
  it('never promotes a pre-registered customer or overwrites an existing admin credential', async () => {
    repository.findProvisionedAdmin.mockResolvedValue({ role: 'CUSTOMER', accounts: [{ providerId: 'credential' }] })
    await expect(provisionAdmin({ ...input, apply: true })).rejects.toThrow('conflicts')
    expect(repository.createProvisionedAdmin).not.toHaveBeenCalled()
    repository.findProvisionedAdmin.mockResolvedValue({ role: 'ADMIN', accounts: [{ providerId: 'credential' }] })
    expect(await provisionAdmin({ ...input, apply: true })).toMatchObject({ alreadyProvisioned: true })
    expect(repository.createProvisionedAdmin).not.toHaveBeenCalled()
  })
})
