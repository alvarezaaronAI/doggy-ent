import { describe, expect, it } from 'vitest'
import { createSSRApp, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createDefaultStorefrontContent } from '../../../src/domains/storefront/content/sectionCatalog.js'
import { validateStorefrontContent } from '../../../src/domains/storefront/content/contentValidation.js'
import BrandPageContent from '../../../src/domains/storefront/components/BrandPageContent.vue'
import CampaignPageContent from '../../../src/domains/campaigns/components/CampaignPageContent.vue'
import ProductCollectionSection from '../../../src/domains/storefront/Home/sections/ProductCollectionSection.vue'
import HeroSection from '../../../src/domains/storefront/Home/sections/HeroSection.vue'
import ProductCampaignBadge from '../../../src/domains/products/ProductCard/ProductCampaignBadge.vue'
import SiteHeader from '../../../src/app/layouts/SiteHeader.vue'
import { useProductVariants } from '../../../src/domains/products/composables/useProductVariants.js'
import { useProductFilters } from '../../../src/domains/products/composables/useProductFilters.js'
import { isCollectionProduct } from '../../../src/domains/products/utils/productVisibility.js'

async function render(component, props) {
  const router = createRouter({ history:createMemoryHistory(), routes:[{path:'/:pathMatch(.*)*',component:{render:()=>null}}] })
  await router.push('/')
  return renderToString(createSSRApp(component,props).use(router))
}
describe('approved polished composition', () => {
  it('keeps new defaults and older spotlight records valid', () => {
    const doc=createDefaultStorefrontContent()
    expect(validateStorefrontContent(doc)).toBe('')
    expect(doc.sections.find(x=>x.type==='spotlight').settings.title).toBeTruthy()
  })
  it('renders the full brand story, pair, journey, gallery, values and closing invitation', async () => {
    const html=await render(BrandPageContent,{content:createDefaultStorefrontContent()})
    for(const heading of ['The pair behind the name','Every good story starts somewhere.','The good stuff happens together','Keep the good things simple.','Bring a little of our story home.']) expect(html).toContain(heading)
    expect(html).toContain('id="brand-pair"')
    expect(html).toContain('Suggested story prompt, not a verified milestone')
  })
  it('shows the approved fictional campaign sections with the real configured contribution', async () => {
    const campaign={id:'demo',name:'[TEST] Example',donationTarget:'Fictional partner',description:'Example only',story:'Not a real partner.',donationType:'FIXED',donationValue:2,productIds:[],isActive:true}
    const html=await render(CampaignPageContent,{campaign,content:createDefaultStorefrontContent()})
    for(const heading of ['Everyday comfort','Foster support','Thoughtful introductions','Why we chose this partner','From your bag to a little good.']) expect(html).toContain(heading)
    expect(html).toContain('$2.00 per eligible order')
    expect(html).toContain('no extra donation')
    const real=await render(CampaignPageContent,{campaign:{...campaign,name:'Real managed campaign'}})
    expect(real).not.toContain('Fictional programme example')
  })
  it('includes approved public test statuses without exposing draft/archived or allowing purchase', async () => {
    const products=['active','out-of-stock','coming-soon','draft','archived'].map((status,i)=>({id:'p'+i,name:'Test '+i,status,isTestProduct:true,variants:[{size:'6 oz',price:15,quantity:0}],tags:[]}))
    const filters=useProductFilters(ref(products))
    expect(filters.activeProducts.value.map(x=>x.status)).toEqual(['active','out-of-stock','coming-soon'])
    expect(products.filter(isCollectionProduct).map(x=>x.status)).toEqual(['active','out-of-stock','coming-soon'])
    const variants=useProductVariants()
    for(const p of products) expect(variants.isPurchasable(p,p.variants[0])).toBe(false)
    const doc=createDefaultStorefrontContent(), settings=doc.sections.find(x=>x.type==='collection').settings
    settings.productIds=['p2','p0','p1']
    const context={...variants,activeProducts:filters.activeProducts.value,campaignsForProduct:()=>[],getDisplayTags:p=>p.tags,availableCategories:[],availableProteins:[],selectedSort:'featured'}
    const html=await render(ProductCollectionSection,{settings,context})
    expect(html.indexOf('Test 2')).toBeLessThan(html.indexOf('Test 0'))
    expect(html).not.toContain('Test 3')
    expect(html).not.toContain('Test 4')
  })
  it('uses approved brand-led hero copy without pulling old product badges into it', async () => {
    const doc=createDefaultStorefrontContent(),settings=doc.sections[0].settings
    Object.assign(settings,{title:'Chase & Evie Co.',eyebrow:'Good treats. Good company.',lead:'',text:'Approved brand introduction.',buttonLabel:'Shop the treats',buttonUrl:'/#shop',secondaryLabel:'',tags:[],items:[]})
    const html=await render(HeroSection,{settings,product:{name:'Legacy item',tags:['Old badge']}})
    expect(html).toContain('Shop the treats')
    expect(html).toContain('Approved brand introduction.')
    expect(html).not.toContain('Old badge')
    expect(html).not.toContain('Shopping essentials')
  })
  it('keeps functional account and cart entries in the compact shared header', async () => {
    const html=await render(SiteHeader,{content:createDefaultStorefrontContent(),preview:true,cartCount:3})
    expect(html).toContain('Sign in to account')
    expect(html).toContain('href="/account/sign-in"')
    expect(html).toContain('aria-controls="cart-drawer"')
    expect(html).toMatch(/class="site-count"[^>]*>3<\/span>/)
    expect(html).toContain('Toggle search')
    expect(html).not.toContain('Preview bag')
  })
  it('uses a compact campaign strip on product cards without removing detailed receipt badges', async () => {
    const campaigns=[{id:'demo',name:'[TEST] Meadow Haven',pageAvailable:true,donationType:'FIXED',donationValue:2}]
    const compact=await render(ProductCampaignBadge,{campaigns,compact:true})
    expect(compact).toContain('Part of the sample campaign')
    expect(compact).toContain('product-giving-strip')
    expect(compact).toContain('$2.00 per eligible order')
    const detailed=await render(ProductCampaignBadge,{campaigns})
    expect(detailed).toContain('[TEST] Meadow Haven')
    expect(detailed).toContain('$2.00 per eligible order')
    expect(detailed).not.toContain('product-giving-strip')
  })
})
