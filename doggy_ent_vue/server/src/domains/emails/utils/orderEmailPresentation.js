export function getOrderEmailPresentation() {
  try {
    const url = new URL(process.env.FRONTEND_URL || process.env.CLIENT_URL || '')
    if (url.protocol !== 'https:' || url.username || url.password) return {}
    return { assetBaseUrl: `${url.origin}/email-assets` }
  } catch {
    return {}
  }
}
