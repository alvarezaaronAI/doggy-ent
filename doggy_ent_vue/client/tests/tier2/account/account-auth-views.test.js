import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import AccountSignInView from '../../../src/domains/account/views/AccountSignInView.vue'
import AccountCreateView from '../../../src/domains/account/views/AccountCreateView.vue'
import AccountForgotPasswordView from '../../../src/domains/account/views/AccountForgotPasswordView.vue'
import AccountResetPasswordView from '../../../src/domains/account/views/AccountResetPasswordView.vue'
import AccountTextField from '../../../src/domains/account/components/AccountTextField.vue'
import AccountPasswordField from '../../../src/domains/account/components/AccountPasswordField.vue'
import AccountPasswordGuidance from '../../../src/domains/account/components/AccountPasswordGuidance.vue'
import AccountFormErrors from '../../../src/domains/account/components/AccountFormErrors.vue'
import AccountNav from '../../../src/domains/account/components/AccountNav.vue'
import AccountPetsView from '../../../src/domains/account/views/AccountPetsView.vue'
import { ACCOUNT_NAV_ITEMS } from '../../../src/domains/account/constants/account.constants.js'
async function render(component, path, props = {}) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
  await router.push(path)
  return renderToString(createSSRApp(component, props).use(router))
}
describe('shared, centered customer auth presentation', () => {
  it.each([[AccountSignInView, '/account/sign-in'], [AccountCreateView, '/account/create'], [AccountForgotPasswordView, '/account/forgot-password'], [AccountResetPasswordView, '/account/reset-password']])('uses one centered card and the shared storefront shell', async (component, path) => {
    const html = await render(component, path)
    expect(html).toContain('account-auth-stage'); expect(html).toContain('account-auth-card')
    expect(html).toContain('Chase &amp; Evie'); expect(html).not.toContain('account-sidebar')
    expect(html).not.toContain('lg:grid-cols-')
  })
  it('retains checkout on all authentication entry links', async () => {
    const html = await render(AccountSignInView, '/account/sign-in?redirect=/checkout')
    expect(html).toContain('Back to checkout'); expect(html).toContain('Continue as a guest')
    expect(html).toContain('/account/create?redirect=/checkout')
    expect(html).toContain('/account/forgot-password?redirect=/checkout')
    expect(html).toContain('autocomplete="username"'); expect(html).toContain('autocomplete="current-password"')
  })
  it('does not render reset proofs or ask customers to paste them', async () => {
    const html = await render(AccountResetPasswordView, '/account/reset-password?token=synthetic-reset-proof')
    expect(html).not.toContain('synthetic-reset-proof'); expect(html).not.toContain('Reset token')
    expect(html).toContain('Confirm new password')
    const invalid = await render(AccountResetPasswordView, '/account/reset-password?error=invalid_token')
    expect(invalid).toContain('Request a new link'); expect(invalid).not.toContain('Save new password')
  })
  it('keeps signup short with confirmation and no hidden marketing/pet collection', async () => {
    const html = await render(AccountCreateView, '/account/create')
    expect(html).toContain('Review your details'); expect(html).toContain('Confirm password')
    expect(html).not.toContain('type="checkbox"'); expect(html).not.toContain('Pet nickname')
    expect(html).toContain('does not sign you up for marketing')
    expect(html).toContain('Full name'); expect(html).toContain('One name is fine')
    expect(html).toContain('placeholder="Alex Morgan"'); expect(html).toContain('placeholder="you@example.com"')
    expect(html).toContain('aria-label="Password requirements"'); expect(html).toContain('novalidate')
    expect(html).not.toContain('Middle name'); expect(html).not.toContain('first-name')
  })
  it('associates explicit errors with inputs, not just color or disappearing placeholders', async () => {
    const html = await render(AccountTextField, '/', { id: 'fixture-email', label: 'Email address', type: 'email', hint: 'Use your sign-in email.', error: 'Enter a valid email address.', placeholder: 'you@example.com' })
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('data-state="invalid"')
    expect(html).toContain('aria-describedby="fixture-email-hint fixture-email-error"')
    expect(html).toContain('id="fixture-email-error"'); expect(html).toContain('Enter a valid email address.')
    const password = await render(AccountPasswordField, '/', { id: 'fixture-password', error: 'Use at least 8 characters.', hint: 'Paste is supported.' })
    expect(password).toContain('aria-describedby="fixture-password-hint fixture-password-error"')
    expect(password).toContain('aria-invalid="true"'); expect(password).toContain('Show password')
    const valid = await render(AccountTextField, '/', { id: 'fixture-email', label: 'Email address', valid: true })
    expect(valid).toContain('data-state="valid"'); expect(valid).not.toContain('aria-invalid="true"')
    const rejected = await render(AccountTextField, '/', { id: 'fixture-email', label: 'Email address', valid: true, invalid: true })
    expect(rejected).toContain('data-state="invalid"')
  })
  it('provides a focusable linked summary and truthful password requirements', async () => {
    const html = await render(AccountFormErrors, '/', { message: 'Check details', errors: { email: 'Enter a valid email.' }, fields: { email: 'fixture-email' } })
    expect(html).toContain('tabindex="-1"'); expect(html).toContain('role="alert"')
    expect(html).toContain('href="#fixture-email"')
    const guidance = await render(AccountPasswordGuidance, '/', { password: 'synthetic fixture', confirmation: 'synthetic fixture' })
    expect(guidance.match(/Met: /g)).toHaveLength(2)
    expect(guidance).not.toContain('synthetic fixture'); expect(guidance).not.toContain('Strong')
  })
  it('keeps all account tabs and gives Pets its own active navigation destination', async () => {
    expect(ACCOUNT_NAV_ITEMS.map(x => x.label)).toEqual(['Overview', 'Orders', 'Profile', 'Pets', 'Addresses', 'Order help', 'Rewards', 'Wishlist'])
    const html = await render(AccountNav, '/account/pets')
    expect(html).toContain('href="/account/pets"'); expect(html).toContain('aria-current="page"')
    const pets = await render(AccountPetsView, '/account/pets')
    expect(pets).toContain('Your pack'); expect(pets).toContain('Add a pet')
  })
})
