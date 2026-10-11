import { describe, expect, it, vi } from 'vitest'
import { validateImageFile } from '../../../src/domains/admin/validators/adminImage.validator.js'
import { mediaImageSource } from '../../../src/shared/utils/mediaImage.js'
import { websiteFieldLabel } from '../../../src/domains/admin/constants/adminWebsite.constants.js'
import { sectionBackground } from '../../../src/domains/storefront/utils/homeContent.js'
const id = '11111111-1111-4111-8111-111111111111'
describe('image editor boundaries and explanatory labels', () => {
  it('resolves stored media against configured API origin and preserves legacy images', () => {
    expect(mediaImageSource(`/api/media/${id}`)).toContain(`/api/media/${id}`)
    expect(mediaImageSource(`/api/media/${id}/thumbnail`)).toContain('/thumbnail')
    expect(mediaImageSource('https://example.test/photo.jpg')).toBe('https://example.test/photo.jpg')
    expect(mediaImageSource('/assets/photo.png')).toBe('/assets/photo.png')
    expect(mediaImageSource(null)).toBe('')
  })
  it('validates client file type, empty files and upload size', () => {
    expect(validateImageFile({ type: 'image/png', size: 100 })).toBe('')
    for (const file of [{ type: 'image/svg+xml', size: 100 }, { type: 'image/png', size: 0 }, { type: 'image/jpeg', size: 8 * 1024 * 1024 + 1 }]) expect(validateImageFile(file)).not.toBe('')
  })
  it('names the actual place being edited instead of generic text', () => {
    expect(websiteFieldLabel('hero', 'text')).toBe('Hero introduction')
    expect(websiteFieldLabel('brand', 'text')).toBe('Brand story introduction')
    expect(websiteFieldLabel('story', 'text')).toBe('Story paragraphs')
    expect(websiteFieldLabel('hero', 'imageAlt')).toContain('accessibility')
  })
  it('applies selected palette and resolves uploaded section artwork', () => {
    const style = sectionBackground({ background: 'giving', backgroundImage: `/api/media/${id}` })
    expect(style.backgroundColor).toBe('#edf6f0')
    expect(style.backgroundImage).toContain(`/api/media/${id}`)
    expect(sectionBackground({ background: 'default', backgroundImage: '' })).toEqual({})
  })
  it('uses deployed backend configuration for media rather than the frontend origin', async () => {
    vi.resetModules(); vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test'); vi.stubEnv('VITE_API_URL', '')
    try {
      const resolver = await import('../../../src/shared/utils/mediaImage.js')
      expect(resolver.mediaImageSource(`/api/media/${id}`)).toBe(`https://api.example.test/api/media/${id}`)
      expect(resolver.mediaImageSource(`/api/media/${id}/thumbnail`)).toBe(`https://api.example.test/api/media/${id}/thumbnail`)
    } finally { vi.unstubAllEnvs(); vi.resetModules() }
  })
})
