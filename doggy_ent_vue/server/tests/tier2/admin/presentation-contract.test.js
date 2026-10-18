import { describe, expect, it } from 'vitest'
import { createDefaultStorefrontContent } from '../../../src/domains/storefront/content/sectionCatalog.js'
import { validateStorefrontContent } from '../../../src/domains/storefront/content/contentValidation.js'
import { projectStorefrontContent } from '../../../src/domains/storefront/content/contentProjection.js'
describe('allowlisted presentation and legacy compatibility', () => {
  it('normalizes old documents without requiring commerce or new page fields', () => {
    const doc = createDefaultStorefrontContent(); delete doc.presentation; delete doc.theme.monogram; delete doc.theme.columns
    doc.announcement.text = ''
    const process = doc.sections.find(block => block.type === 'process'); delete process.settings.image; delete process.settings.imageAlt
    expect(validateStorefrontContent(doc)).toBe('')
    const normalized = projectStorefrontContent(doc)
    expect(normalized.presentation.brand.journey).toHaveLength(3)
    expect(normalized.theme.columns).toBe('4')
    expect(validateStorefrontContent(normalized)).toBe('')
  })
  it('accepts three public messages but rejects scripts, unbounded messages and business fields', () => {
    const doc = createDefaultStorefrontContent(); doc.announcement.rotate = true
    doc.announcement.messages = Array.from({length:3}, (_,i) => ({ text: 'Message '+i, href: '/#shop' }))
    expect(validateStorefrontContent(doc)).toBe('')
    doc.announcement.messages.push({text:'Fourth',href:''}); expect(validateStorefrontContent(doc)).not.toBe('')
    doc.announcement.messages.pop(); doc.presentation.cards.price = 1; expect(validateStorefrontContent(doc)).not.toBe('')
    delete doc.presentation.cards.price; doc.announcement.messages[0].href = 'javascript:alert(1)'; expect(validateStorefrontContent(doc)).not.toBe('')
  })
  it('defaults older brand pages and only projects public portrait fields', () => {
    const doc = createDefaultStorefrontContent(); delete doc.presentation.brand.portraits
    expect(validateStorefrontContent(doc)).toBe('')
    const result = projectStorefrontContent(doc)
    expect(result.presentation.brand.portraits.map(item => item.name)).toEqual(['Chase', 'Evie'])
    result.presentation.brand.portraits[0].privateCanary = 'must-not-leak'
    expect(JSON.stringify(projectStorefrontContent(result))).not.toContain('must-not-leak')
  })
  it('validates two bounded portrait records and safe described images', () => {
    const id = '11111111-1111-4111-8111-111111111111'
    const doc = createDefaultStorefrontContent()
    doc.presentation.brand.portraits[0].image = '/api/media/' + id
    expect(validateStorefrontContent(doc)).toBe('')
    for (const mutate of [
      value => value.presentation.brand.portraits.pop(),
      value => { value.presentation.brand.portraits = 'invalid' },
      value => { value.presentation.brand.portraits[0] = [] },
      value => { value.presentation.brand.portraits[0].image = 'javascript:alert(1)' },
      value => { value.presentation.brand.portraits[0].image = '/api/auth/me' },
      value => { value.presentation.brand.portraits[0].alt = '' },
      value => { value.presentation.brand.portraits[0].text = 'x'.repeat(2001) },
      value => { value.presentation.brand.portraits[0].role = 'ADMIN' },
    ]) {
      const invalid = structuredClone(doc); mutate(invalid)
      expect(validateStorefrontContent(invalid)).not.toBe('')
    }
  })
})
