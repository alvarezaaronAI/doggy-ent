import { describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { normalizeImage } from '../../../src/domains/media/utils/normalizeImage.js'
import { validateUpload, validateMediaDetails, validateMediaQuery } from '../../../src/domains/media/validators/media.validator.js'
import { mapMediaAsset } from '../../../src/domains/media/mappers/media.mapper.js'
import { getMediaAssetId } from '../../../src/domains/storefront/content/mediaRules.js'
import { isSafeContentUrl } from '../../../src/domains/storefront/content/contentValidation.js'
const id = '11111111-1111-4111-8111-111111111111'
describe('safe raster image uploads', () => {
  it('reencodes, strips metadata, makes thumbnails, and deduplicates deterministic pixels', async () => {
    const input = await sharp({ create: { width: 2500, height: 1000, channels: 3, background: '#edf6f0' } }).png().withMetadata({ orientation: 1 }).toBuffer()
    const first = await normalizeImage(input, 'image/png')
    const second = await normalizeImage(input, 'image/png')
    expect(first.width).toBe(2400); expect(first.height).toBe(960)
    expect(first.checksum).toBe(second.checksum)
    expect(first.byteSize).toBe(first.bytes.length)
    const metadata = await sharp(first.bytes).metadata()
    expect(metadata.format).toBe('webp'); expect(metadata.exif).toBeUndefined()
    const thumbnail = await sharp(first.thumbnailBytes).metadata()
    expect(thumbnail.width).toBeLessThanOrEqual(360); expect(thumbnail.height).toBeLessThanOrEqual(240)
  })
  it('rejects invalid signatures, MIME mismatches, and oversized decoded images', async () => {
    await expect(normalizeImage(Buffer.from('<svg></svg>'), 'image/png')).rejects.toMatchObject({ statusCode: 400 })
    const png = await sharp({ create: { width: 1, height: 1, channels: 3, background: '#fff' } }).png().toBuffer()
    await expect(normalizeImage(png, 'image/jpeg')).rejects.toMatchObject({ statusCode: 400 })
    const large = await sharp({ create: { width: 5000, height: 5000, channels: 3, background: '#fff' } }).png().toBuffer()
    await expect(normalizeImage(large, 'image/png')).rejects.toMatchObject({ statusCode: 400 })
  })
  it('validates byte limits, types, folder, filename, metadata and query boundaries', () => {
    expect(validateUpload(Buffer.from('x'), 'image/png', encodeURIComponent('../photo.png'), 'website')).toEqual({ originalFilename: 'photo.png', folder: 'website' })
    for (const [bytes, type, folder] of [[Buffer.alloc(0), 'image/png', 'website'], [Buffer.alloc(8 * 1024 * 1024 + 1), 'image/png', 'website'], [Buffer.from('x'), 'image/svg+xml', 'website'], [Buffer.from('x'), 'image/png', 'private']]) expect(() => validateUpload(bytes, type, 'photo', folder)).toThrow()
    expect(validateMediaDetails({ name: ' Photo ', altText: ' Pumpkins ', folder: 'website', secret: 'canary' })).toEqual({ name: 'Photo', altText: 'Pumpkins', folder: 'website' })
    expect(() => validateMediaDetails({ name: '', altText: '', folder: 'general' })).toThrow()
    expect(validateMediaQuery({ search: ' photo ', page: '2' })).toEqual({ search: 'photo', folder: '', page: 2 })
    for (const query of [{ page: '0' }, { page: '1.5' }, { folder: 'private' }, { search: ['bad'] }]) expect(() => validateMediaQuery(query)).toThrow()
  })
  it('allows canonical media paths only as images, never as action links', () => {
    expect(getMediaAssetId(`/api/media/${id}`)).toBe(id)
    expect(isSafeContentUrl(`/api/media/${id}`, { image: true })).toBe(true)
    for (const path of ['/api/auth/me', `/api/media/${id}/thumbnail`, `/api/media/${id}?token=canary`, '/api/media/invalid', `/api/media/${id}/../admin`]) expect(isSafeContentUrl(path, { image: true })).toBe(false)
    expect(isSafeContentUrl(`/api/media/${id}`)).toBe(false)
  })
  it('returns only public-safe image metadata, not bytes, checksums, or actor data', () => {
    const output = mapMediaAsset({ id, name: 'Photo', data: { bytes: 'private-canary' }, checksum: 'checksum-canary', createdByType: 'actor-canary' })
    expect(output.url).toBe(`/api/media/${id}`)
    expect(JSON.stringify(output)).not.toContain('canary')
  })
})
