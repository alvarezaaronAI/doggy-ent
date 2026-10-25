import { afterEach, describe, expect, it, vi } from 'vitest'
import * as Vue from 'vue'
import { createRenderer, nextTick, ref, ssrContextKey } from 'vue'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { readFileSync } from 'node:fs'
import AccountPetEditor from '../../../src/domains/account/components/AccountPetEditor.vue'
import AccountPetsSection from '../../../src/domains/account/components/AccountPetsSection.vue'
const fixtures = vi.hoisted(() => ({ pets: null }))
vi.mock('../../../src/domains/account/composables/useAccountPets.js', () => ({ useAccountPets: () => fixtures.pets }))
vi.mock('../../../src/domains/account/api/accountPets.api.js', () => ({ fetchAccountPetPhoto: vi.fn().mockRejectedValue(new Error('fixture unavailable')) }))
vi.mock('../../../src/domains/account/components/AccountPetPhoto.vue', () => ({ default: { render: () => Vue.h('div') } }))
vi.mock('../../../src/domains/account/components/AccountPetBreedPicker.vue', () => ({ default: { render: () => Vue.h('div') } }))
vi.mock('../../../src/domains/account/components/AccountPetChoices.vue', () => ({ default: { render: () => Vue.h('div') } }))
vi.mock('../../../src/domains/account/components/AccountPetCard.vue', () => ({ default: { render: () => Vue.h('div') } }))

function mount(component, props = {}) {
  let active
  const matches = (node, selector) => selector === 'button' ? node.type === 'button' : selector === '[aria-invalid="true"]' ? node.props['aria-invalid'] === true : selector === '[data-pet-remove]' ? Object.hasOwn(node.props, 'data-pet-remove') : false
  const find = (node, predicate) => predicate(node) ? node : node.children.map(child => find(child, predicate)).find(Boolean)
  const node = (type, text = '') => Vue.markRaw({ type, text, children: [], props: {}, parent: null, tagName: type.toUpperCase(), options: [], value: '', addEventListener() {}, removeEventListener() {}, focus() { active = this }, get isConnected() { return Boolean(this.parent) }, querySelector(selector) { if (selector === '[data-removal-confirmation] button') return find(this, n => Object.hasOwn(n.props, 'data-removal-confirmation'))?.querySelector('button'); return this.children.map(child => find(child, n => matches(n, selector))).find(Boolean) } })
  const insert = (child, parent, anchor) => { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); child.parent = parent; const index = anchor ? parent.children.indexOf(anchor) : -1; if (index < 0) parent.children.push(child); else parent.children.splice(index, 0, child) }
  const renderer = createRenderer({
    createElement: type => node(type), createText: text => node('text', text), createComment: text => node('comment', text),
    setText: (el, text) => { el.text = text }, setElementText: (el, text) => { el.text = text; el.children = [] },
    insert, remove: el => { el.parent?.children.splice(el.parent.children.indexOf(el), 1); el.parent = null },
    parentNode: el => el.parent, nextSibling: el => el.parent?.children[el.parent.children.indexOf(el) + 1],
    patchProp: (el, key, before, value) => { el.props[key] = value; if (key === 'value') el[key] = value },
    insertStaticContent: (text, parent, anchor) => { const el = node('static', text); insert(el, parent, anchor); return [el, el] },
  })
  const filename = component.__file
  const { descriptor } = parse(readFileSync(filename, 'utf8'))
  const script = compileScript(descriptor, { id: 'pet-fixture' })
  const compiled = compileTemplate({ source: descriptor.template.content, filename, id: 'pet-fixture', compilerOptions: { bindingMetadata: script.bindings } })
  if (compiled.errors.length) throw compiled.errors[0]
  const code = compiled.code.replace(/import \{([^}]+)\} from "vue"/g, (_, imports) => `const {${imports.replace(/ as /g, ': ')}} = Vue`).replace('export function render', 'return function render')
  const root = node('root'), app = renderer.createApp({ ...component, render: new Function('Vue', code)(Vue) }, props)
  app.provide(ssrContextKey, { modules: new Set() })
  app.component('RouterLink', { props: ['to'], render() { return Vue.h('a', this.$slots.default?.()) } })
  app.mount(root)
  const text = el => el.text + el.children.map(text).join('')
  return { app, find: predicate => find(root, predicate), button: label => find(root, el => el.type === 'button' && text(el).includes(label)), focused: () => active, text: () => text(root) }
}
const pet = { id: 'fixture-pet', nickname: 'Fixture', proteinPreferences: [], treatPurposes: [] }
afterEach(() => vi.restoreAllMocks())
describe('pet photo and privacy recovery controls', () => {
  it('allows saving without a rejected optional photo while preserving the pet draft', async () => {
    const saved = vi.fn(), view = mount(AccountPetEditor, { pet, onSave: saved })
    const input = view.find(el => el.type === 'input' && el.props.type === 'file')
    input.props.onChange({ target: { files: [{ type: 'image/jpeg', size: 6 * 1024 * 1024 }], value: 'fixture' } }); await nextTick()
    expect(view.text()).toContain('5 MB')
    await view.button('Continue without a photo').props.onClick(); await nextTick()
    expect(view.focused()).toBe(input); expect(input.props['aria-invalid']).toBe(false)
    await view.find(el => el.type === 'form').props.onSubmit({ preventDefault() {} })
    expect(saved).toHaveBeenCalledWith(expect.objectContaining({ values: expect.objectContaining({ nickname: 'Fixture' }), photoFile: null, removePhoto: false }))
    view.app.unmount()
  })
  it('does not remove an existing photo when dismissing an invalid replacement', async () => {
    const saved = vi.fn(), view = mount(AccountPetEditor, { pet: { ...pet, hasPhoto: true }, onSave: saved })
    view.find(el => el.type === 'input' && el.props.type === 'file').props.onChange({ target: { files: [{ type: 'image/svg+xml', size: 100 }], value: 'fixture' } }); await nextTick()
    await view.button('Keep the current photo').props.onClick()
    await view.find(el => el.type === 'form').props.onSubmit({ preventDefault() {} })
    expect(saved.mock.calls[0][0]).toMatchObject({ photoFile: null, removePhoto: false })
    view.app.unmount()
  })
  it('moves focus into removal confirmation, restores it on cancel and recovers after deletion', async () => {
    const pets = ref([pet]), removing = ref('')
    fixtures.pets = { pets, activePets: pets, archivedPets: ref([]), loading: ref(false), saving: ref(false), error: ref(''), notice: ref(''), editing: ref(null), editorOpen: ref(false), removing, load: vi.fn(), edit: vi.fn(), closeEditor: vi.fn(), save: vi.fn(), archive: vi.fn(), remove: vi.fn(async () => { pets.value = []; removing.value = '' }) }
    const view = mount(AccountPetsSection)
    const trigger = view.button('Remove details')
    await trigger.props.onClick({ currentTarget: trigger }); await nextTick()
    expect(view.focused()).toBe(view.button('Keep details'))
    await view.button('Keep details').props.onClick(); expect(view.focused()).toBe(trigger)
    await trigger.props.onClick({ currentTarget: trigger }); await nextTick()
    await view.button('Remove pet details').props.onClick(); await nextTick()
    expect(view.focused()).toBe(view.find(el => el.type === 'summary'))
    view.app.unmount()
  })
})
