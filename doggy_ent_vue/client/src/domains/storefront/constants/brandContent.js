import heroTemplate from '../../../assets/images/brand/labrador-pair-template.webp'
import adventureTemplate from '../../../assets/images/brand/brand-labs-adventure-template.webp'
import blackLabTemplate from '../../../assets/images/brand/campaign-black-lab-template.webp'
import yellowLabTemplate from '../../../assets/images/brand/partner-yellow-lab-template.webp'
import preparationTemplate from '../../../assets/images/brand/galleries/chicken-preparation-v1.webp'

export const BRAND_IMAGES = { home: heroTemplate, adventure: adventureTemplate, partner: yellowLabTemplate, campaign: blackLabTemplate, preparation: preparationTemplate }

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
      image: blackLabTemplate,
      alt: 'Illustrative dog portrait for Chase',
    },
    {
      name: 'Evie',
      image: yellowLabTemplate,
      alt: 'Illustrative dog portrait for Evie',
    },
  ],
}

export const BRAND_GALLERY = [
  {
    image: heroTemplate,
    alt: 'Illustrative Labrador pair in a garden',
    caption: 'For everyday adventures.',
  },
  {
    image: adventureTemplate,
    alt: 'Illustrative Labrador pair on a woodland walk',
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
