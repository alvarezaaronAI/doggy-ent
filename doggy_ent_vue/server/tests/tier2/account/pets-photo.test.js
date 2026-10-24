import { describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { normalizePetPhoto } from '../../../src/domains/pets/services/petPhoto.service.js'
import { MAX_PET_PHOTO_BYTES, MAX_PET_PHOTO_UPLOAD_BYTES } from '../../../src/domains/pets/constants/pets.constants.js'

const image = (width = 20, height = 10) => sharp({ create: { width, height, channels: 3, background: '#17664e' } })

describe('private pet photo normalization', () => {
  it.each(['jpeg', 'png', 'webp'])('reencodes %s to bounded metadata-free WebP', async format => {
    const input = await image(1800, 900).toFormat(format).withMetadata().toBuffer()
    const output = await normalizePetPhoto(input, `image/${format}`)
    expect(Object.keys(output).sort()).toEqual(['bytes', 'contentType'])
    expect(output.contentType).toBe('image/webp')
    expect(output.bytes.length).toBeLessThanOrEqual(MAX_PET_PHOTO_BYTES)
    const metadata = await sharp(output.bytes).metadata()
    expect(metadata).toMatchObject({ format: 'webp', width: 1200, height: 600 })
    for (const field of ['exif', 'xmp', 'icc', 'iptc', 'orientation']) expect(metadata[field]).toBeUndefined()
  })

  it('auto-orients EXIF pixels and does not enlarge small photos', async () => {
    const input = await image().jpeg().withMetadata({ orientation: 6 }).toBuffer()
    const output = await normalizePetPhoto(input, 'image/jpeg')
    expect(await sharp(output.bytes).metadata()).toMatchObject({ width: 10, height: 20 })
  })

  it('rejects empty, malformed, truncated, SVG, type-mismatched and oversized raw bytes', async () => {
    const png = await image().png().toBuffer()
    for (const input of [undefined, {}, Buffer.alloc(0), Buffer.from('not an image'), Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"></svg>'), png.subarray(0, 40)]) {
      await expect(normalizePetPhoto(input, 'image/png')).rejects.toMatchObject({ statusCode: 400 })
    }
    await expect(normalizePetPhoto(png, 'image/jpeg')).rejects.toMatchObject({ statusCode: 400 })
    for (const type of ['image/svg+xml', 'image/gif', 'application/octet-stream', undefined]) {
      await expect(normalizePetPhoto(png, type)).rejects.toMatchObject({ statusCode: 415 })
    }
    await expect(normalizePetPhoto(Buffer.alloc(MAX_PET_PHOTO_UPLOAD_BYTES + 1), 'image/png')).rejects.toMatchObject({ statusCode: 413 })
  })

  it('rejects images above 40 megapixels before raster transformation', async () => {
    const input = await image(6400, 6400).png().toBuffer()
    await expect(normalizePetPhoto(input, 'image/png')).rejects.toMatchObject({ statusCode: 400 })
  })

  it('rejects animated WebP and APNG rather than silently taking the first frame', async () => {
    const input = await sharp({ create: { width: 10, height: 20, channels: 3, background: '#fff' } })
      .raw().toBuffer()
    input.fill(0, 10 * 10 * 3)
    const animated = await sharp(input, { raw: { width: 10, height: 20, channels: 3, pageHeight: 10 } })
      .webp({ loop: 0, delay: [100, 100] }).toBuffer()
    expect((await sharp(animated).metadata()).pages).toBe(2)
    await expect(normalizePetPhoto(animated, 'image/webp')).rejects.toMatchObject({ statusCode: 400 })
    const png = await image().png().toBuffer()
    // An APNG acTL chunk is enough to reject animation before decoding (CRC is immaterial here).
    const chunk = Buffer.alloc(20)
    chunk.writeUInt32BE(8); chunk.write('acTL', 4); chunk.writeUInt32BE(2, 8)
    const apng = Buffer.concat([png.subarray(0, 33), chunk, png.subarray(33)])
    await expect(normalizePetPhoto(apng, 'image/png')).rejects.toMatchObject({ statusCode: 400 })
  })
})
