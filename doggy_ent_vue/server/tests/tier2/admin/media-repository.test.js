import { beforeEach, describe, expect, it, vi } from 'vitest'
const asset = vi.hoisted(() => ({ findUnique: vi.fn(), aggregate: vi.fn(), create: vi.fn(), count: vi.fn() }))
const transaction = vi.hoisted(() => vi.fn())
vi.mock('../../../src/db/prisma.js', () => ({ prisma: { mediaAsset: asset, $transaction: transaction } }))
const { storeMediaAsset } = await import('../../../src/domains/media/repositories/media.repository.js')
const { assertMediaImagesExist } = await import('../../../src/domains/media/services/mediaReferences.service.js')
const image = { bytes: Buffer.from('image'), thumbnailBytes: Buffer.from('thumb'), checksum: 'hash', byteSize: 5, thumbnailByteSize: 5, width: 10, height: 10, mimeType: 'image/webp' }
beforeEach(() => {
  vi.resetAllMocks()
  asset.findUnique.mockResolvedValue(null)
  asset.aggregate.mockResolvedValue({ _sum: { byteSize: 0, thumbnailByteSize: 0 } })
  asset.create.mockResolvedValue({ id: 'created' })
  transaction.mockImplementation(action => action({ mediaAsset: asset }))
})
describe('bounded reusable database media', () => {
  it('reuses an existing image without another write', async () => {
    asset.findUnique.mockResolvedValue({ id: 'existing' })
    expect(await storeMediaAsset(image, { name: 'Photo' })).toEqual({ asset: { id: 'existing' }, reused: true })
    expect(transaction).not.toHaveBeenCalled()
  })
  it('stores metadata and binary content atomically with serializable capacity protection', async () => {
    expect(await storeMediaAsset(image, { name: 'Photo', folder: 'website' })).toEqual({ asset: { id: 'created' }, reused: false })
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: 'Serializable' })
    expect(asset.create.mock.calls[0][0].data.data.create).toEqual({ bytes: image.bytes, thumbnailBytes: image.thumbnailBytes })
    expect(asset.create.mock.calls[0][0].select.data).toBeUndefined()
  })
  it('rejects library overflow before writing and retries transaction conflicts', async () => {
    asset.aggregate.mockResolvedValueOnce({ _sum: { byteSize: 256 * 1024 * 1024, thumbnailByteSize: 0 } })
    expect(await storeMediaAsset(image, {})).toEqual({ capacityExceeded: true })
    expect(asset.create).not.toHaveBeenCalled()
    transaction.mockRejectedValueOnce({ code: 'P2034' })
    expect((await storeMediaAsset(image, {})).reused).toBe(false)
  })
  it('resolves a concurrent checksum conflict to the winning image', async () => {
    asset.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'winner' })
    transaction.mockRejectedValueOnce({ code: 'P2002' })
    expect(await storeMediaAsset(image, {})).toEqual({ asset: { id: 'winner' }, reused: true })
  })
  it('validates uploaded references in the selected DB, deduplicating repeated references', async () => {
    const id = '11111111-1111-4111-8111-111111111111'
    asset.count.mockResolvedValue(1)
    await assertMediaImagesExist([`/api/media/${id}`, `/api/media/${id}`, 'https://example.test/photo'])
    expect(asset.count).toHaveBeenCalledWith({ where: { id: { in: [id] } } })
    asset.count.mockResolvedValue(0)
    await expect(assertMediaImagesExist([`/api/media/${id}`])).rejects.toMatchObject({ statusCode: 400 })
  })
})
