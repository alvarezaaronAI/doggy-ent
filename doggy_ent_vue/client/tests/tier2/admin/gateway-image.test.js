import { afterEach, describe, expect, it, vi } from 'vitest'
import { GATEWAY_IMAGE_BYTES, prepareGatewayImage } from '../../../src/domains/admin/utils/prepareGatewayImage.js'
afterEach(() => vi.unstubAllGlobals())
const file = (size, type = 'image/png') => ({ size, type })
describe('standalone admin image transport', () => {
  it('preserves small supported originals without decoding or recompressing', async () => {
    const original = file(1024)
    expect(await prepareGatewayImage(original)).toBe(original)
  })
  it('rejects unsupported, empty or oversized originals before decoding', async () => {
    for (const image of [file(0), file(9 * 1024 * 1024), file(100, 'image/svg+xml')]) await expect(prepareGatewayImage(image)).rejects.toThrow('8 MB')
  })
  it('optimizes large images at the existing stored dimensions and releases the bitmap', async () => {
    const bitmap = { width: 4000, height: 3000, close: vi.fn() }
    const output = new Blob(['optimized'], { type: 'image/webp' })
    const canvas = { getContext: () => ({ drawImage: vi.fn() }), toBlob: vi.fn(resolve => resolve(output)) }
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap))
    vi.stubGlobal('document', { createElement: () => canvas })
    expect(await prepareGatewayImage(file(GATEWAY_IMAGE_BYTES + 1))).toBe(output)
    expect([canvas.width, canvas.height]).toEqual([2400, 1800])
    expect(bitmap.close).toHaveBeenCalledOnce()
  })
  it('reports decode failures and prevents excessive pixel allocation', async () => {
    const bitmap = { width: 20000, height: 20000, close: vi.fn() }
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap))
    await expect(prepareGatewayImage(file(GATEWAY_IMAGE_BYTES + 1))).rejects.toThrow('could not be optimized')
    expect(bitmap.close).toHaveBeenCalledOnce()
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('private implementation detail')))
    await expect(prepareGatewayImage(file(GATEWAY_IMAGE_BYTES + 1))).rejects.toThrow('Try a smaller')
  })
})
