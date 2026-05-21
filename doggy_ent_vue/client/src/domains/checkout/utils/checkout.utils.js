export function calculateSubtotal(cartItems) {
  return normalizeCurrencyAmount(
    cartItems.reduce(
      (total, item) => (
        total
        + Number(item.price || 0)
        * Number(item.quantity || 0)
      ),
      0,
    ),
  )
}

function normalizeCurrencyAmount(value) {
  return Number(
    Number(value || 0).toFixed(2),
  )
}

export function calculateItemCount(cartItems) {
  return cartItems.reduce(
    (total, item) => (
      total
      + Number(item.quantity || 0)
    ),
    0,
  )
}

export function calculateDiscount({
  subtotal,
  discountAmount,
}) {
  return normalizeCurrencyAmount(
    Math.min(
      Number(discountAmount || 0),
      Number(subtotal || 0),
    ),
  )
}

export function calculateTaxableTotal({
  subtotal,
  discount,
  shipping,
}) {
  return normalizeCurrencyAmount(
    Math.max(
      Number(subtotal || 0)
      - Number(discount || 0)
      + Number(shipping || 0),
      0,
    ),
  )
}

export function calculateTax({
  taxableTotal,
  taxRate,
}) {
  return normalizeCurrencyAmount(
    Number(taxableTotal || 0)
    * Number(taxRate || 0),
  )
}

export function calculateOrderTotal({
  taxableTotal,
  tax,
}) {
  return normalizeCurrencyAmount(
    Number(taxableTotal || 0)
    + Number(tax || 0),
  )
}