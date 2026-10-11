// Generated from shared/storefront. Edit the canonical file, then run client and server builds.
export const CHECKOUT_PRESENTATION = Object.freeze({
  title: 'Checkout',
  introduction: 'Your treats, your details, one secure checkout.',
  applePay: true,
  googlePay: true,
})
export const CONFIRMATION_PRESENTATION = Object.freeze({
  title: 'Thank you for your order',
  introduction: 'Your order is received. A little good is on its way.',
  nextTitle: 'What happens next',
  nextText: 'We will prepare and pack your treats. Tracking appears here when it is available.',
  helpTitle: 'A little help, whenever you need it',
  helpText: 'Keep your order reference handy when contacting our team.',
  helpLabel: 'Shopping help',
  helpUrl: '/#faq',
  background: 'oat',
})
export function commercePresentation(content = {}) {
  return {
    checkout: { ...CHECKOUT_PRESENTATION, ...content.checkout },
    confirmation: { ...CONFIRMATION_PRESENTATION, ...content.confirmation },
  }
}

export function givingBeneficiaries(campaigns = []) {
  const names = campaigns.map(campaign =>
    campaign.donationTarget || campaign.campaign?.donationTarget ||
    campaign.campaignName || campaign.name || campaign.campaign?.name
  ).filter(name => typeof name === 'string' && name.trim()).map(name => name.trim())
  return [...new Set(names)].join(', ') || 'our giving partners'
}
