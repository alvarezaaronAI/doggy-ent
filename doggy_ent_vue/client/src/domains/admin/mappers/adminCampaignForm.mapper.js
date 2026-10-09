import {
  CAMPAIGN_STATUSES,
  DONATION_TYPES,
} from '../constants/adminCampaigns.constants'

export function createEmptyAdminCampaignForm() {
  return {
    name: '',
    slug: '',
    description: '',
    story: '',
    image: '',
    imageAlt: '',
    beneficiaryUrl: '',
    publicPageEnabled: false,
    featured: false,
    status: CAMPAIGN_STATUSES.DRAFT,
    donationTarget: '',
    donationType: DONATION_TYPES.PERCENT,
    donationValue: 5,
    productIds: [],
    startsDate: '',
    startsTime: '',
    endsDate: '',
    endsTime: '',
    startsOriginal: null,
    endsOriginal: null,
    donationGenerated: 0,
  }
}

function splitDateTime(value) {
  if (!value || !Number.isFinite(Date.parse(value)))
    return { date: '', time: '' }
  const date = new Date(value)
  const pad = (number) => String(number).padStart(2, '0')
  return {
    date:
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()),
    time: pad(date.getHours()) + ':' + pad(date.getMinutes()),
  }
}

function combineDateTime(date, time, original) {
  if (!date) return null
  const originalParts = splitDateTime(original)
  if (original && date === originalParts.date && time === originalParts.time)
    return new Date(original).toISOString()
  const value = new Date(date + 'T' + (time || '00:00'))
  if (!Number.isFinite(value.getTime()))
    throw new Error('Enter a valid campaign date and time.')
  return value.toISOString()
}

export function buildAdminCampaignPayload(form) {
  const text = (value) => String(value || '').trim()
  return {
    name: text(form.name),
    description: text(form.description),
    story: text(form.story),
    image: text(form.image),
    imageAlt: text(form.imageAlt),
    beneficiaryUrl: text(form.beneficiaryUrl),
    publicPageEnabled: form.publicPageEnabled === true,
    featured: form.featured === true,
    status: form.status,
    donationTarget: text(form.donationTarget),
    donationType: form.donationType,
    donationValue: Number(form.donationValue),
    productIds: [...form.productIds],
    startsAt: combineDateTime(
      form.startsDate,
      form.startsTime,
      form.startsOriginal,
    ),
    endsAt: combineDateTime(form.endsDate, form.endsTime, form.endsOriginal),
  }
}

export function mapCampaignToAdminCampaignForm(campaign) {
  const starts = splitDateTime(campaign.startsAt)
  const ends = splitDateTime(campaign.endsAt)
  return {
    ...createEmptyAdminCampaignForm(),
    name: campaign.name || '',
    slug: campaign.slug || '',
    description: campaign.description || '',
    story: campaign.story || '',
    image: campaign.image || '',
    imageAlt: campaign.imageAlt || '',
    beneficiaryUrl: campaign.beneficiaryUrl || '',
    publicPageEnabled: campaign.publicPageEnabled === true,
    featured: campaign.featured === true,
    status: String(campaign.status || CAMPAIGN_STATUSES.DRAFT).toUpperCase(),
    donationTarget: campaign.donationTarget || '',
    donationType: String(
      campaign.donationType || DONATION_TYPES.PERCENT,
    ).toUpperCase(),
    donationValue: Number(campaign.donationValue || 0),
    productIds: Array.isArray(campaign.productIds)
      ? campaign.productIds.map(String)
      : [],
    startsDate: starts.date,
    startsTime: starts.time,
    endsDate: ends.date,
    endsTime: ends.time,
    startsOriginal: campaign.startsAt || null,
    endsOriginal: campaign.endsAt || null,
    donationGenerated: Number(campaign.donationGenerated || 0),
  }
}

export function mapAdminCampaignCanvas(form) {
  const payload = buildAdminCampaignPayload(form)
  const now = Date.now()
  const isActive =
    form.status === 'ACTIVE' &&
    (!payload.startsAt || Date.parse(payload.startsAt) <= now) &&
    (!payload.endsAt || Date.parse(payload.endsAt) >= now)
  return {
    ...payload,
    slug: form.slug,
    isActive,
    donationGenerated: form.donationGenerated,
  }
}
