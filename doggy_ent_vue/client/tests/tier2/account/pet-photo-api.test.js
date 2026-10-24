import { afterEach, describe, expect, it, vi } from 'vitest'
import { archiveAccountPet, deleteAccountPetPhoto, fetchAccountPetPhoto, uploadAccountPetPhoto } from '../../../src/domains/account/api/accountPets.api.js'
afterEach(() => vi.unstubAllGlobals())
const id = 'c123456789012345678901234'
describe('owner-private pet photo transport', () => {
  it('uses credentialed, uncached reads and accepts only the private WebP response', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('fixture', { headers: { 'content-type': 'image/webp' } }))
    vi.stubGlobal('fetch', fetch)
    const controller = new AbortController()
    const blob = await fetchAccountPetPhoto(id, controller.signal)
    expect(blob.type).toBe('image/webp')
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/api/account/pets/${id}/photo`), { credentials: 'include', cache: 'no-store', signal: controller.signal })
    fetch.mockResolvedValue(new Response('<html>deployment error</html>', { headers: { 'content-type': 'text/html' } }))
    await expect(fetchAccountPetPhoto(id)).rejects.toThrow('Photo unavailable')
    fetch.mockResolvedValue(new Response('private', { status: 403 }))
    await expect(fetchAccountPetPhoto(id)).rejects.toThrow('Photo unavailable')
  })
  it('uploads raw raster bytes rather than exposing a public image URL or JSON/base64', async () => {
    const fetch = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ success: true, result: { id, hasPhoto: true } }), { headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetch)
    const photo = new Blob(['fixture'], { type: 'image/webp' })
    expect(await uploadAccountPetPhoto(id, photo)).toEqual({ id, hasPhoto: true })
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/pets/${id}/photo`), { credentials: 'include', method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: photo })
    await deleteAccountPetPhoto(id)
    expect(fetch).toHaveBeenLastCalledWith(expect.stringContaining(`/pets/${id}/photo`), { credentials: 'include', method: 'DELETE' })
  })
  it('keeps archive a separate explicit mutation without accepting a client timestamp', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"result":{}}', { headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetch)
    await archiveAccountPet(id, true)
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/pets/${id}/archive`), { credentials: 'include', method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{"archived":true}' })
  })
  it('handles an invalid JSON deployment response without exposing a TypeError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not-json', { headers: { 'content-type': 'application/json' } })))
    await expect(archiveAccountPet(id, true)).rejects.toThrow('Unable to update your pets right now')
  })
})
