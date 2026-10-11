import { ref } from 'vue'
const slug = ref('')
export function useCampaignQuickView() {
  return { slug, openCampaign: campaign => { if (campaign.pageAvailable && campaign.slug) slug.value = campaign.slug }, closeCampaign: () => { slug.value = '' } }
}
