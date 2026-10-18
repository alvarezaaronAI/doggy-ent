import { beforeEach, describe, expect, it, vi } from 'vitest'
import { productGallery } from '../../../src/domains/products/utils/productGallery.js'
import { isPurchasable } from '../../../src/shared/constants/sellingMode.js'
import { WEBSITE_PAGES } from '../../../src/domains/admin/constants/websiteEditor.constants.js'
const api = vi.hoisted(() => ({ saveProductImages: vi.fn() }))
vi.mock('../../../src/domains/admin/api/adminProducts.api.js', () => api)
vi.mock('vue-router', async original => ({ ...(await original()), onBeforeRouteLeave: () => {} }))
const { useAdminProductImages } = await import('../../../src/domains/admin/composables/useAdminProductImages.js')
beforeEach(() => { vi.resetAllMocks(); vi.stubGlobal('window', { confirm: () => true }) })
describe('gallery ownership and safe test products', () => {
  it('uses a main photo and at most four optional distinct details, ignoring empty entries', () => {
    expect(productGallery({})).toEqual([])
    expect(productGallery({image:'main',galleryImages:[{image:'main'},{image:'detail',alt:'Angle'},{}]})).toEqual([{image:'main',alt:'Product photograph'},{image:'detail',alt:'Angle'}])
    expect(productGallery({ image:'main', galleryImages:Array.from({length:8},(_,i)=>({image:String(i)})) })).toHaveLength(5)
  })
  it('blocks test records even with stock or made-to-order enabled', () => {
    for (const sellingMode of ['inventory-limited','made-to-order','preorder']) expect(isPurchasable({status:'active',sellingMode,isTestProduct:true},{quantity:100})).toBe(false)
  })
  it('keeps all page targets discoverable without business editors in Website UI', () => {
    expect(WEBSITE_PAGES.flatMap(g=>g.items.map(([id])=>id))).toEqual(['home','campaign','brand','shell','cards','quick','checkout','confirmation'])
  })
  it('saves only image payloads and retains draft after conflict errors', async () => {
    const emit = vi.fn(), product = { id:'p', image:'https://example.test/main', galleryImages:[], updatedAt:'2026-10-14T00:00:00Z' }
    const editor = useAdminProductImages(product,emit)
    editor.draft.value.galleryImages.push({image:'https://example.test/detail',alt:'Detail'})
    api.saveProductImages.mockRejectedValueOnce(new Error('Changed in another editor'))
    await editor.save(); expect(editor.error.value).toContain('another editor'); expect(editor.dirty.value).toBe(true)
    expect(api.saveProductImages.mock.calls[0][1]).toEqual({ image:product.image, galleryImages:[{image:'https://example.test/detail',alt:'Detail'}], updatedAt:product.updatedAt })
    editor.cancel(); expect(emit).toHaveBeenCalledWith('close')
  })
})
