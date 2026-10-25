import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../../../src/App.vue'
import PolicyShell from '../../../src/domains/policies/components/PolicyShell.vue'
import AccountShell from '../../../src/domains/account/components/AccountShell.vue'
import HomeView from '../../../src/domains/storefront/Home/HomeView.vue'
import BrandView from '../../../src/domains/storefront/views/BrandView.vue'
import CampaignView from '../../../src/domains/campaigns/views/CampaignView.vue'
vi.mock('../../../src/domains/campaigns/api/publicCampaigns.api.js', () => ({ fetchPublicCampaign: vi.fn().mockResolvedValue(null), fetchStorefrontCampaigns: vi.fn().mockResolvedValue([]) }))
vi.mock('../../../src/shared/components/DevelopmentRoutingPanel.vue', () => ({ __esModule: true, default: { render: () => h('aside', { 'data-development-routing': '' }, 'Routing strip') } }))

async function render(component, props = {}, appFrame = false) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { render: () => h(component, props, { default: () => h('p', 'Short page content') }) } }, { path: '/:pathMatch(.*)*', component: { render: () => null } }] })
  await router.push('/')
  return renderToString(createSSRApp(appFrame ? App : { render: () => h(component, props) }).use(router))
}
describe('viewport-aware page and footer contracts', () => {
  it('keeps the monogram behind open route space while public shells stay transparent', () => {
    const css = readFileSync(new URL('../../../src/domains/storefront/styles/storefront.css', import.meta.url), 'utf8')
    expect(css).toContain('.site-page { background: transparent; }')
    expect(css).toContain('labrador-monogram-v1.webp')
    expect(css).toContain('pointer-events:none')
  })
  it('keeps the development strip and route content inside a single minimum-viewport frame', async () => {
    const html = await render(PolicyShell, {}, true)
    expect(html).toContain('data-app-frame class="store-pattern flex min-h-dvh flex-col"')
    expect(html).toContain('data-page-frame class="flex min-w-0 flex-1 flex-col"')
    expect(html.indexOf('data-development-routing')).toBeLessThan(html.indexOf('data-page-frame'))
    expect(html).toContain('Short page content')
  })
  it.each([PolicyShell, HomeView, BrandView, CampaignView])('uses flexible public shells without a second viewport minimum', async component => {
    const html = await render(component)
    expect(html).toContain('site-page flex flex-1 flex-col')
    expect(html).toContain('site-footer mt-auto shrink-0')
    expect(html).not.toContain('min-h-screen')
    expect(html).toMatch(/<main[^>]*class="[^"]*flex-1/)
  })
  it.each([true, false])('stretches the account main region without changing navigation/authorization (nav=%s)', async showNav => {
    const html = await render(AccountShell, { showNav })
    expect(html).toContain('site-page flex flex-1 flex-col')
    expect(html).toContain(showNav ? 'account-workspace flex-1' : 'account-auth-stage flex-1')
    expect(html).toContain('site-footer mt-auto shrink-0')
  })
})
