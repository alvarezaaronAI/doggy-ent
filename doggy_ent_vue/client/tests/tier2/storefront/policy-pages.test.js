import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, createRenderer, createSSRApp, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import PolicyContent from '../../../src/domains/policies/components/PolicyContent.vue'
import { POLICY_BUSINESS, POLICY_PAGES } from '../../../src/domains/policies/content/policyPages.js'
import { acknowledgeStorageNotice, hasSeenStorageNotice, STORAGE_NOTICE_KEY, STORAGE_NOTICE_REVISION } from '../../../src/domains/policies/utils/storageNotice.js'
import { usePolicyMetadata } from '../../../src/domains/policies/composables/usePolicyMetadata.js'

async function render(pageKey, page = POLICY_PAGES[pageKey]) {
  const router = createRouter({ history: createMemoryHistory(), routes: Object.values(POLICY_PAGES).map(value => ({ path: value.path, component: { render: () => null } })) })
  await router.push(page.path || '/privacy')
  return renderToString(createSSRApp(PolicyContent, { pageKey, page }).use(router))
}

describe('draft public information pages', () => {
  it.each(Object.keys(POLICY_PAGES))('%s renders a draft, contact and navigable peer pages without a customer form', async key => {
    const html = await render(key)
    expect(html).toContain('Draft for review.')
    expect(html).toContain('Not yet an effective policy.')
    expect(html).toContain(`mailto:${POLICY_BUSINESS.email}`)
    expect(html).toContain('aria-current="page"')
    for (const page of Object.values(POLICY_PAGES)) expect(html).toContain(`href="${page.path}"`)
    expect(html).not.toContain('<form')
    expect(html).not.toContain('<input')
  })
  it('escapes content rather than injecting policy markup', async () => {
    const html = await render('privacy', { title: '<script>unsafe</script>', introduction: '', sections: [{ id: 'safe', title: 'Safe', paragraphs: ['<img src=x onerror=unsafe()>'] }] })
    expect(html).toContain('&lt;script&gt;unsafe&lt;/script&gt;')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img src=x')
  })
  it('does not collect fake optional tracking consent or promise a refund deadline', async () => {
    const cookies = await render('cookies')
    expect(cookies).toContain('No optional tracking choice is being collected.')
    expect(cookies).not.toContain('Accept all')
    const shipping = await render('shipping')
    expect(shipping).toContain('are awaiting approval')
    expect(shipping).not.toContain('30-day')
  })
})

describe('storage acknowledgment is not consent', () => {
  it('stores only the current notice revision and preserves the bag and customer fields', () => {
    const data = new Map([['doggy-ent-cart', 'existing bag'], ['doggy-ent-checkout-customer', 'existing fields']])
    const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) }
    expect(hasSeenStorageNotice(storage)).toBe(false)
    expect(acknowledgeStorageNotice(storage)).toBe(true)
    expect(hasSeenStorageNotice(storage)).toBe(true)
    expect(data.size).toBe(3)
    expect(data.get(STORAGE_NOTICE_KEY)).toBe(STORAGE_NOTICE_REVISION)
    expect(data.get('doggy-ent-cart')).toBe('existing bag')
    expect(data.get('doggy-ent-checkout-customer')).toBe('existing fields')
  })
  it('shows revised notices and tolerates blocked browser storage', () => {
    expect(hasSeenStorageNotice({ getItem: () => 'old' })).toBe(false)
    const storage = { getItem() { throw Error('blocked') }, setItem() { throw Error('blocked') } }
    expect(hasSeenStorageNotice(storage)).toBe(false)
    expect(acknowledgeStorageNotice(storage)).toBe(false)
  })
})

afterEach(() => vi.unstubAllGlobals())
it.each([true, false])('draft metadata restores previous title and robots on exit (existing=%s)', async existing => {
  let node = existing ? { content: 'index, follow' } : null
  function element() {
    return {
      content: 'index, follow',
      getAttribute() { return this.content },
      setAttribute(key, value) { this[key] = value },
      removeAttribute(key) { delete this[key] },
      remove() { node = null },
    }
  }
  if (existing) node = element()
  const document = { title: 'Shop', querySelector: () => node, createElement: element, head: { append(value) { node = value } } }
  vi.stubGlobal('document', document)
  const page = ref(POLICY_PAGES.privacy)
  const renderer = createRenderer({ createElement: () => ({}), insert() {}, remove() {}, setElementText() {}, patchProp() {} })
  const app = renderer.createApp({ setup() { usePolicyMetadata(computed(() => page.value)); return () => h('div') } })
  app.mount({})
  expect(node.content).toBe('noindex, nofollow')
  expect(document.title).toContain('Privacy')
  page.value = POLICY_PAGES.terms
  await nextTick()
  expect(document.title).toContain('Terms')
  app.unmount()
  expect(document.title).toBe('Shop')
  expect(node?.content || null).toBe(existing ? 'index, follow' : null)
})
