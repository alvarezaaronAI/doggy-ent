import { orderReference } from './accountFormatting.js'

export function filterAccountOrders(orders, query, status) {
  const search = String(query || '')
    .trim()
    .toLowerCase()
  return orders.filter(
    (order) =>
      (!status || order.status === status) &&
      (!search ||
        [
          orderReference(order),
          order.orderNumber,
          ...(order.items || []).map((item) => item.productName),
        ].some((value) =>
          String(value || '')
            .toLowerCase()
            .includes(search)
        ))
  )
}

export function groupAccountOrders(orders) {
  const groups = new Map()
  for (const order of orders) {
    const date = new Date(order.createdAt)
    const valid = !Number.isNaN(date.getTime())
    const key = valid ? `${date.getFullYear()}-${date.getMonth()}` : 'unknown'
    if (!groups.has(key))
      groups.set(key, {
        key,
        label: valid
          ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
          : 'Date unavailable',
        orders: [],
      })
    groups.get(key).orders.push(order)
  }
  return [...groups.values()]
}
