export function isEmailProviderConfigured() {
  return String(process.env.EMAIL_PROVIDER || '')
    .trim()
    .toUpperCase() === 'ENABLED'
}

export async function queueEmail(payload) {
  if (!isEmailProviderConfigured()) {
    return {
      queued: false,
      reason: 'EMAIL_PROVIDER is not configured.',
      payload,
    }
  }

  return {
    queued: false,
    reason: 'No concrete email provider adapter has been implemented.',
    payload,
  }
}
