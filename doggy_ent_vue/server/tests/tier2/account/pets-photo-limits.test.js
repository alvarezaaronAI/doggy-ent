import { beforeEach, describe, expect, it, vi } from 'vitest'
const sharp = vi.hoisted(() => vi.fn())
const metadata = vi.hoisted(() => vi.fn())
const toBuffer = vi.hoisted(() => vi.fn())
vi.mock('sharp', () => ({ default: sharp }))
const { normalizePetPhoto } = await import('../../../src/domains/pets/services/petPhoto.service.js')
const { MAX_PET_PHOTO_BYTES } = await import('../../../src/domains/pets/constants/pets.constants.js')

beforeEach(() => {
  vi.resetAllMocks()
  metadata.mockResolvedValue({ format: 'png', width: 20, height: 10 })
  toBuffer.mockResolvedValue(Buffer.from('optimized-fixture'))
  sharp.mockImplementation(() => {
    const pipeline = { metadata, toBuffer }
    for (const method of ['rotate', 'resize', 'webp']) pipeline[method] = vi.fn(() => pipeline)
    return pipeline
  })
})

describe('pet photo processing resource limits', () => {
  it('rejects output above 1 MiB rather than persisting oversized bytes', async () => {
    toBuffer.mockResolvedValueOnce(Buffer.alloc(MAX_PET_PHOTO_BYTES + 1))
    await expect(normalizePetPhoto(Buffer.from('fixture'), 'image/png')).rejects.toMatchObject({ statusCode: 413 })
    expect(sharp).toHaveBeenCalledWith(expect.any(Buffer), { limitInputPixels: 40_000_000, failOn: 'warning' })
    const pipeline = sharp.mock.results[0].value
    expect(pipeline.resize).toHaveBeenCalledWith({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    expect(pipeline.rotate).toHaveBeenCalledOnce()
  })

  it('bounds concurrent transforms and releases capacity after success and failure', async () => {
    const releases = []
    toBuffer.mockImplementation(() => new Promise(resolve => releases.push(resolve)))
    const first = normalizePetPhoto(Buffer.from('one'), 'image/png')
    const second = normalizePetPhoto(Buffer.from('two'), 'image/png')
    await expect(normalizePetPhoto(Buffer.from('three'), 'image/png')).rejects.toMatchObject({ statusCode: 429 })
    expect(releases).toHaveLength(2)
    releases.forEach(resolve => resolve(Buffer.from('pixels')))
    await Promise.all([first, second])
    metadata.mockRejectedValueOnce(new Error('private decoder details'))
    await expect(normalizePetPhoto(Buffer.from('bad'), 'image/png')).rejects.toMatchObject({ statusCode: 400, message: 'This photo cannot be read safely. Use a JPEG, PNG, or WebP under 40 megapixels.' })
    toBuffer.mockResolvedValue(Buffer.from('pixels'))
    await expect(normalizePetPhoto(Buffer.from('next'), 'image/png')).resolves.toMatchObject({ contentType: 'image/webp' })
  })
})
