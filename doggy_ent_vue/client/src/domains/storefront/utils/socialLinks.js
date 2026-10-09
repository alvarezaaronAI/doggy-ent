const platforms = [
  {
    key: 'instagram',
    label: 'Instagram',
    icon: 'fa-instagram',
    hosts: ['instagram.com', 'www.instagram.com'],
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    icon: 'fa-tiktok',
    hosts: ['tiktok.com', 'www.tiktok.com'],
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: 'fa-youtube',
    hosts: ['youtube.com', 'www.youtube.com'],
  },
]
const defaults = { instagram: 'https://www.instagram.com/chaseevieco/' }

export function createSocialLinks(urls = {}) {
  return platforms.flatMap(({ key, label, icon, hosts }) => {
    const placeholder = { label, icon, href: '' }
    try {
      const url = new URL(urls[key] ?? defaults[key])
      if (
        url.protocol !== 'https:' ||
        !hosts.includes(url.hostname) ||
        url.username ||
        url.password ||
        url.port ||
        url.pathname === '/'
      )
        return [placeholder]
      return [{ label, icon, href: url.href }]
    } catch {
      return [placeholder]
    }
  })
}
