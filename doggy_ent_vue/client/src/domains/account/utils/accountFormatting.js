export function formatAccountLabel(value) {
  return String(value || 'Pending')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatAccountDate(value, { short = false, time = false } = {}) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(!short ? { year: 'numeric' } : {}),
    ...(time ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(date)
}

export function orderReference(order) {
  return order?.customerReference || order?.orderNumber || ''
}

export function orderItemCount(order) {
  return (order?.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0)
}

export function addressLines(address) {
  if (!address) return []
  return [
    address.address1,
    address.address2,
    [address.city, address.state, address.zip].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean)
}

export function safeTrackingUrl(value) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}
