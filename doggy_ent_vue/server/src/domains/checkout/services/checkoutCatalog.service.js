import { findCheckoutProducts } from '../repositories/checkout.repository.js'
const invalid = message => Object.assign(new Error(message), { statusCode: 400 })
export async function resolveCheckoutItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100) throw invalid('Choose between 1 and 100 items for checkout.')
  const products = await findCheckoutProducts([...new Set(items.map(item => String(item?.productId || item?.id || '')))])
  const quantities = new Map()
  return items.map(item => {
    const product = products.find(row => row.id === String(item?.productId || item?.id || ''))
    const variant = product?.variants.find(row => row.size === item?.size && row.isActive)
    const quantity = Number(item?.quantity)
    if (!product || product.isTestProduct || product.status !== 'ACTIVE' || !variant || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999) throw invalid('A product, size or quantity is no longer available. Review your bag.')
    const requested = (quantities.get(variant.sku) || 0) + quantity
    quantities.set(variant.sku, requested)
    if ((!product.sellingMode || product.sellingMode === 'INVENTORY_LIMITED') && variant.inventory < requested) throw invalid('There is not enough stock for ' + product.name + ', ' + variant.size + '.')
    return { id: product.id, productId: product.id, name: product.name, image: product.image, size: variant.size, price: variant.price / 100, quantity, variant: { sku: variant.sku }, sku: variant.sku }
  })
}
