import heroTemplate from '../../../assets/images/storefront-hero-template.jpg'
import seasonalTemplate from '../../../assets/images/storefront-seasonal-template.jpg'

export const BRAND_STORY_PATH = '/meet-chase-evie'

export const BRAND_STORY = {
  name: 'Chase & Evie Co.',
  title: 'Meet Chase & Evie',
  introduction:
    'The dogs behind the name. The everyday moments behind our treats.',
  paragraphs: [
    "Two labs, big appetites, and a search for treats that felt simple and trustworthy. That's where our story began.",
    'We keep things thoughtful: straightforward ingredients, small batches, and something to feel good about sharing.',
  ],
  heroImage: heroTemplate,
  teaserImage: heroTemplate,
  portraits: [
    {
      name: 'Chase',
      image:
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop',
      alt: 'Illustrative dog portrait for Chase',
    },
    {
      name: 'Evie',
      image:
        'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1000&auto=format&fit=crop',
      alt: 'Illustrative dog portrait for Evie',
    },
  ],
}

export const BRAND_GALLERY = [
  {
    image: heroTemplate,
    alt: 'Illustrative white dog enjoying the outdoors',
    caption: 'For everyday adventures.',
  },
  {
    image: seasonalTemplate,
    alt: 'Illustrative corgi portrait against an orange backdrop',
    caption: 'For the little moments.',
  },
]

export const BRAND_VALUES = [
  {
    id: 'ingredients',
    icon: 'leaf',
    title: 'Simple ingredients',
    text: 'Straightforward ingredients, with the details kept alongside each treat.',
  },
  {
    id: 'process',
    icon: 'flame',
    title: 'Small-batch care',
    text: 'Thoughtful preparation, from protein cuts to the finished treat bag.',
  },
  {
    id: 'about',
    icon: 'heart',
    title: 'Good company',
    text: 'Something to feel good about sharing in the everyday moments with your pup.',
  },
]
