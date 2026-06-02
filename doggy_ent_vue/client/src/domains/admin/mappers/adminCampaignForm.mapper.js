import {
  CAMPAIGN_STATUSES,
  DONATION_TYPES,
} from '../constants/adminCampaigns.constants'

export function createEmptyAdminCampaignForm() {
  return {
    name: '',
    description: '',
    status: CAMPAIGN_STATUSES.DRAFT,
    donationTarget: '',
    donationType: DONATION_TYPES.PERCENT,
    donationValue: 5,
    productIds: [],
    startsDate: '',
    startsTime: '',
    endsDate: '',
    endsTime: '',
  }
}

function splitDateTime(value) {
  if (!value) {
    return { date: '', time: '' }
  }

  const [date = '', timeWithSeconds = ''] = String(value).split('T')
  const time = timeWithSeconds.slice(0, 5)

  return { date, time }
}

function combineDateTime(date, time) {
  if (!date) return null
  return `${date}T${time || '00:00'}`
}

export function buildAdminCampaignPayload(form) {
  return {
    name: form.name,
    description: form.description,
    status: form.status,
    donationTarget: form.donationTarget,
    donationType: form.donationType,
    donationValue: Number(form.donationValue || 0),
    productIds: form.productIds,
    startsAt: combineDateTime(form.startsDate, form.startsTime),
    endsAt: combineDateTime(form.endsDate, form.endsTime),
  }
}

export function mapCampaignToAdminCampaignForm(campaign) {
  const starts = splitDateTime(campaign.startsAt)
  const ends = splitDateTime(campaign.endsAt)

  return {
    name: campaign.name || '',
    description: campaign.description || '',
    status: String(campaign.status || CAMPAIGN_STATUSES.DRAFT).toUpperCase(),
    donationTarget: campaign.donationTarget || '',
    donationType: String(campaign.donationType || DONATION_TYPES.PERCENT).toUpperCase(),
    donationValue: Number(campaign.donationValue || 0),
    productIds: Array.isArray(campaign.productIds)
      ? [...campaign.productIds]
      : [],
    startsDate: starts.date,
    startsTime: starts.time,
    endsDate: ends.date,
    endsTime: ends.time,
  }
}
