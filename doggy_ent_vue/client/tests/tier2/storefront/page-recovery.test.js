import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRenderer, createSSRApp, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import PageRecovery from '../../../src/shared/components/PageRecovery.vue'
import { useRecoveryMetadata } from '../../../src/shared/composables/useRecoveryMetadata.js'
import { PAGE_RECOVERY } from '../../../src/shared/content/pageRecovery.js'

async function render(kind, extra = {}) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
  await router.push('/missing?token=private-proof')
  return renderToString(createSSRApp(PageRecovery, { kind, ...extra }).use(router))
}
describe('branded recovery without private diagnostics', () => {
  it.each(Object.keys(PAGE_RECOVERY))('renders %s with useful recovery actions and a real image', async kind => {
    const html = await render(kind)
    expect(html).toContain(PAGE_RECOVERY[kind].title)
    expect(html).toContain('href="/#shop"')
    expect(html).toContain('href="/contact"')
    expect(html).toContain('Illustrative photograph')
    expect(html).toContain('alt="Illustrative black and chocolate Labradors beside a blank trail sign"')
    expect(html).toContain('tabindex="-1"')
    expect(html).not.toContain('private-proof')
    expect(html).not.toContain('/missing')
  })
  it('offers retry only for a temporary failure, not a missing page', async () => {
    expect(await render('unavailable')).toContain('Try again')
    expect(await render('not-found')).not.toContain('Try again')
    expect(await render('campaign-not-found')).not.toContain('Try again')
    expect(await render('unavailable', { retrying: true })).toContain('Trying again...')
    expect(await render('unavailable', { retrying: true })).toContain('disabled')
  })
  it('falls back to a safe missing-page state for an unknown kind', async () => {
    const html = await render('private-database-stack')
    expect(html).toContain('This page wandered off.')
    expect(html).not.toContain('private-database-stack')
  })
})

afterEach(() => vi.unstubAllGlobals())
it.each([true, false])('restores temporary recovery metadata without overwriting existing robots (existing=%s)', async existing => {
  const original = { name: 'robots', content: 'index, follow' }
  const nodes = existing ? [original] : []
  const document = { title: 'Shop', head: { append(node) { nodes.push(node) } }, createElement() { return { remove() { nodes.splice(nodes.indexOf(this), 1) } } } }
  vi.stubGlobal('document', document)
  const title = ref(null)
  const renderer = createRenderer({ createElement: () => ({}), insert() {}, remove() {}, setElementText() {}, patchProp() {} })
  const app = renderer.createApp({ setup() { useRecoveryMetadata(title); return () => h('div') } })
  app.mount({})
  expect(nodes).toHaveLength(existing ? 1 : 0)
  title.value = 'Page not found'; await nextTick()
  expect(nodes.at(-1).content).toBe('noindex, nofollow')
  expect(document.title).toBe('Page not found | Chase & Evie Co.')
  expect(original.content).toBe('index, follow')
  title.value = 'Campaign unavailable'; await nextTick()
  expect(nodes).toHaveLength(existing ? 2 : 1)
  title.value = null; await nextTick()
  expect(document.title).toBe('Shop')
  expect(nodes).toHaveLength(existing ? 1 : 0)
  title.value = 'Page not found'; await nextTick()
  document.title = 'Another page owns this title'
  app.unmount()
  expect(document.title).toBe('Another page owns this title')
  expect(nodes).toHaveLength(existing ? 1 : 0)
})
