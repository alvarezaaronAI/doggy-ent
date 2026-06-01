export function mapOrderItem(orderItem) {
  return {
    id: orderItem.id,
    productId: orderItem.productId,
    productName: orderItem.productName,
    productImage: orderItem.productImage,
    size: orderItem.size,
    sku: orderItem.sku,
    quantity: Number(orderItem.quantity || 0),
    unitPrice: Number(orderItem.unitPrice || 0),
    lineTotal: Number(orderItem.lineTotal || 0),
  }
}

export function mapOrder(order) {
  if (!order) {
    return null
  }

  return {
    ...order,
    total: Number(order.total || 0),
    subtotal: Number(order.subtotal || 0),
    shippingAmount: Number(order.shippingAmount || 0),
    discountAmount: Number(order.discountAmount || 0),
    taxAmount: Number(order.taxAmount || 0),
    items: Array.isArray(order.items)
      ? order.items.map(mapOrderItem)
      : [],
  }
}
