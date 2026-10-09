import { describe, expect, it } from 'vitest'
import { createSocialLinks } from '../../../src/domains/storefront/utils/socialLinks.js'

describe('storefront footer social destinations', () => {
  it('uses the approved Instagram profile and honest placeholders for missing destinations', () => {
    const links = createSocialLinks()
    expect(links.find((link) => link.label === 'Instagram').href).toBe(
      'https://www.instagram.com/chaseevieco/',
    )
    expect(
      links.filter((link) => !link.href).map((link) => link.label),
    ).toEqual(['TikTok', 'YouTube'])
  })

  it('enables supplied HTTPS profile destinations without changing unrelated platforms', () => {
    const links = createSocialLinks({
      tiktok: 'https://www.tiktok.com/@example',
      youtube: 'https://www.youtube.com/@example',
    })
    expect(links.every((link) => link.href.startsWith('https://'))).toBe(true)
    expect(links.find((link) => link.label === 'Instagram').href).toBe(
      'https://www.instagram.com/chaseevieco/',
    )
  })

  it('never creates active dummy, unsafe, credentialed, or unrelated-platform links', () => {
    for (const instagram of [
      '#',
      'javascript:alert(1)',
      'http://instagram.com/example',
      'https://instagram.com.evil.test/example',
      'https://user:password@instagram.com/example',
      'https://instagram.com:1234/example',
      'https://instagram.com/',
    ]) {
      expect(createSocialLinks({ instagram })[0].href).toBe('')
    }
  })
})
