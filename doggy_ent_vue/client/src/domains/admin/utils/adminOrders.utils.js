import {
  ORDER_STATUSES,
} from '../constants/adminOrders.constants'

export function formatAdminOrderPrice(value) {
  const normalized = Number(value || 0)
  return normalized.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  })
}

export function formatAdminOrderDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}

export function getOrderAgeLabel(value) {
  if (!value) return 'Age unknown'

  const createdAt = new Date(value).getTime()
  const diffMs = Date.now() - createdAt
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Placed just now'
  if (diffMinutes < 60) return `Placed ${diffMinutes}m ago`
  if (diffHours < 24) return `Placed ${diffHours}h ago`
  return `Placed ${diffDays}d ago`
}

export function getTimelineStepClass(order, step) {
  const isPaid = [
    ORDER_STATUSES.PAID,
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.DELIVERED,
  ].includes(order.status)

  const isPacked = [
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.DELIVERED,
  ].includes(order.status)

  const isShipped = [
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.DELIVERED,
  ].includes(order.status)

  const isFulfilled = order.status === ORDER_STATUSES.DELIVERED

  const activeSteps = {
    paid: isPaid,
    packed: isPacked,
    shipped: isShipped,
    fulfilled: isFulfilled,
  }

  return activeSteps[step]
    ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
    : 'border-stone-200 bg-white/70 text-stone-400'
}

export function getOrderCardClass(order) {
  if (order.status === ORDER_STATUSES.CANCELLED) {
    return 'border-stone-300 bg-stone-100/80 opacity-80'
  }

  if (order.status === ORDER_STATUSES.PENDING) {
    return 'border-red-200 bg-red-50'
  }

  if ([
    ORDER_STATUSES.PAID,
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.SHIPPED,
  ].includes(order.status)) {
    return 'border-emerald-200 bg-emerald-50'
  }

  if (order.status === ORDER_STATUSES.DELIVERED) {
    return 'border-blue-100 bg-white'
  }

  return 'border-stone-200 bg-white'
}

export function getPriorityLabels(order) {
  const labels = []

  if (order.status === ORDER_STATUSES.CANCELLED) {
    labels.push({
      text: 'Cancelled',
      className: 'bg-stone-200 text-stone-700',
    })
    return labels
  }

  if (order.status === ORDER_STATUSES.PENDING) {
    labels.push({
      text: 'Payment pending',
      className: 'bg-red-100 text-red-700',
    })
  }

  if ([
    ORDER_STATUSES.PAID,
    ORDER_STATUSES.PROCESSING,
  ].includes(order.status)) {
    labels.push({
      text: 'Ready to fulfill',
      className: 'bg-emerald-100 text-emerald-700',
    })
  }

  if (order.status === ORDER_STATUSES.SHIPPED) {
    labels.push({
      text: 'Shipped',
      className: 'bg-sky-100 text-sky-700',
    })
  }

  if (order.status === ORDER_STATUSES.DELIVERED) {
    labels.push({
      text: 'Completed',
      className: 'bg-blue-100 text-blue-700',
    })
  }

  return labels
}

export function getOrderValueTier(order) {
  const total = Number(order.total || 0)

  if (total >= 500) {
    return {
      label: '💎 Gem order',
      className: 'bg-fuchsia-100 text-fuchsia-700',
      amountClassName: 'text-fuchsia-700',
    }
  }

  if (total >= 350) {
    return {
      label: '♦ Diamond order',
      className: 'bg-cyan-100 text-cyan-700',
      amountClassName: 'text-cyan-700',
    }
  }

  if (total >= 200) {
    return {
      label: '✦ Platinum order',
      className: 'bg-slate-200 text-slate-700',
      amountClassName: 'text-slate-700',
    }
  }

  if (total >= 100) {
    return {
      label: '★ Gold order',
      className: 'bg-yellow-100 text-yellow-700',
      amountClassName: 'text-yellow-700',
    }
  }

  return {
    label: 'Standard order',
    className: 'bg-stone-100 text-stone-600',
    amountClassName: 'text-[var(--brand-4)]',
  }
}
