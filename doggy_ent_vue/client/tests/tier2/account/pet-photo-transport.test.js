import { afterEach, describe, expect, it, vi } from 'vitest'
import { preparePetPhotoUpload } from '../../../src/domains/account/utils/petPhotoTransport.js'
afterEach(() => vi.unstubAllGlobals())

describe('private photo transport within the first-party gateway body limit', () => {
  it('preserves already-small images without reading or re-encoding them', async () => {
    const file = new Blob(['fixture'], { type: 'image/png' })
    vi.stubGlobal('createImageBitmap', vi.fn())
    expect(await preparePetPhotoUpload(file)).toBe(file)
    expect(createImageBitmap).not.toHaveBeenCalled()
  })
  it('keeps the existing 5 MB input allowance by preparing a bounded large photo before upload', async () => {
    const image = { width: 4000, height: 3000, close: vi.fn() }
    const body = new Blob(['prepared'], { type: 'image/jpeg' })
    const context = { fillRect: vi.fn(), drawImage: vi.fn() }
    const canvas = { getContext: () => context, toBlob: vi.fn(done => done(body)) }
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(image))
    vi.stubGlobal('document', { createElement: vi.fn(() => canvas) })
    const file = new Blob([new Uint8Array(5 * 1024 * 1024)], { type: 'image/png' })
    expect(await preparePetPhotoUpload(file)).toBe(body)
    expect(canvas.width).toBe(1600); expect(canvas.height).toBe(1200)
    expect(context.drawImage).toHaveBeenCalledWith(image, 0, 0, 1600, 1200)
    expect(canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.86)
    expect(image.close).toHaveBeenCalledOnce()
  })
  it.each([null, new Blob([new Uint8Array(4 * 1024 * 1024)])])('reports preparation failure without sending an oversized body', async body => {
    const image = { width: 1000, height: 1000, close: vi.fn() }
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(image))
    vi.stubGlobal('document', { createElement: () => ({ getContext: () => ({ fillRect() {}, drawImage() {} }), toBlob: done => done(body) }) })
    await expect(preparePetPhotoUpload({ size: 5 * 1024 * 1024 })).rejects.toThrow('Try a smaller image')
    expect(image.close).toHaveBeenCalledOnce()
  })
})
