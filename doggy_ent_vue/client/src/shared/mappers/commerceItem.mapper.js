export function mapCommerceItem(item = {}) {
  const quantity = Number(item.quantity ?? 1)
  const unitPrice = Number(item.unitPrice ?? item.price ?? 0)
  return {
    name: item.productName || item.name || 'Treat',
    image: item.productImage || item.image || '',
    size: item.size || item.variant?.size || '',
    sku: item.sku || item.variant?.sku || '',
    quantity, unitPrice,
    lineTotal: Number(item.lineTotal ?? unitPrice * quantity),
  }
}

export function itemCampaigns(item, campaigns = [], historical = false) {
  const id = String(item.productId || item.id)
  return campaigns.filter(campaign => (historical ? campaign.matchedProductIds : campaign.productIds)?.map(String).includes(id))
}

export function mapGivingCampaigns(attributions = [], publicCampaigns = []) {
  return attributions.map(attribution => {
    const campaign = publicCampaigns.find(candidate => candidate.id === attribution.campaignId)
    return { ...attribution, slug: campaign?.slug || '', pageAvailable: campaign?.pageAvailable === true }
  })
}
