export const WEBSITE_FIELD_LABELS = {
  title: 'Section heading', eyebrow: 'Label above the heading', lead: 'Supporting headline', text: 'Introduction below the heading',
  image: 'Section photo', imageAlt: 'Photo description for accessibility', caption: 'Caption beneath the photos',
  buttonLabel: 'Main action button wording', buttonUrl: 'Main action destination', secondaryLabel: 'Supporting action wording', secondaryUrl: 'Supporting action destination',
  storyLabel: 'Meet the brand link wording', storyUrl: 'Meet the brand destination',
}
const CONTEXT_LABELS = {
  hero: { title: 'Homepage hero headline', text: 'Hero introduction', image: 'Hero background photo', buttonLabel: 'Shop button wording', buttonUrl: 'Shop button destination', secondaryLabel: 'Ingredients button wording', secondaryUrl: 'Ingredients button destination' },
  brand: { title: 'Meet the brand heading', lead: 'Brand story headline', text: 'Brand story introduction', image: 'Meet the brand photo', buttonLabel: 'Read our story button wording' },
  banner: { title: 'Sale banner headline', text: 'Sale details', buttonLabel: 'Sale action wording' },
  story: { title: 'Story section heading', text: 'Story paragraphs', image: 'Story section photo' },
  gallery: { caption: 'Template / photo disclosure', text: 'Gallery introduction' },
  help: { text: 'Introduction above the questions' },
}
export const websiteFieldLabel = (type, key) => CONTEXT_LABELS[type]?.[key] || WEBSITE_FIELD_LABELS[key]
export const websiteFieldHelp = (type, key) => {
  if (key === 'imageAlt') return 'Describe the photo, not its filename. This is not a visible caption.'
  if (key.endsWith('Url')) return 'Where this action opens: a site path such as /#shop, or an HTTPS destination.'
  if (type === 'hero' && key === 'image') return 'Replaces the hero photograph. Seasonal page artwork does not replace this photo.'
  if (type === 'banner' && key === 'text') return 'Presentation only. Actual discounts must be configured in Promos.'
  return ''
}
export const WEBSITE_BACKGROUNDS = [
  { value: 'default', label: 'Original section', color: '#f3f4f2' },
  { value: 'white', label: 'White', color: '#ffffff' },
  { value: 'oat', label: 'Warm oat', color: '#fcf7ea' },
  { value: 'giving', label: 'Calm giving', color: '#edf6f0' },
]
