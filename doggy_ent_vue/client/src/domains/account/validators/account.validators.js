export function normalizeAccountEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function validateAccountEmail(email) {
  const normalized = normalizeAccountEmail(email)
  if (!normalized) return 'Email is required.'
  return normalized.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? '' : 'Enter a valid email address.'
}

export function validateSignInForm({
  email,
  password,
}) {
  const emailError = validateAccountEmail(email)
  if (emailError) return emailError

  if (!password) {
    return 'Password is required.'
  }

  return ''
}

export function validateCreateAccountForm({
  name,
  email,
  password,
}) {
  if (!String(name || '').trim() || String(name).trim().length > 100) {
    return validateAccountName(name)
  }

  const emailError = validateAccountEmail(email)
  if (emailError) return emailError

  if (String(password || '').length < 8) {
    return 'Password must be at least 8 characters.'
  }

  if (String(password || '').length > 128) return 'Password must be no more than 128 characters.'

  return ''
}

export function validateAccountName(name) {
  if (!String(name || '').trim()) return 'Enter your full name. One name is fine.'
  return String(name).trim().length > 100 ? 'Use no more than 100 characters for your name.' : ''
}

export function validateNewAccountPassword(password) {
  if (!password) return 'Create a password for your account.'
  if (password.length < 8) return 'Use at least 8 characters for your password.'
  return password.length > 128 ? 'Use no more than 128 characters for your password.' : ''
}

export function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation) return 'Enter your password again to confirm it.'
  return password !== confirmation ? 'Passwords do not match. Enter the same password again.' : ''
}

export function validateAccountEntryFields(form, creating = false) {
  return {
    ...(creating ? { name: validateAccountName(form.name) } : {}),
    email: validateAccountEmail(form.email),
    password: creating ? validateNewAccountPassword(form.password) : form.password ? '' : 'Enter your password.',
    ...(creating ? { confirmPassword: validatePasswordConfirmation(form.password, form.confirmPassword) } : {}),
  }
}

export function validateProfileForm(profile) {
  if (!String(profile.firstName || '').trim()) {
    return 'First name is required.'
  }

  if (!String(profile.lastName || '').trim()) {
    return 'Last name is required.'
  }

  return ''
}

export function validateAccountAddress(address) {
  for (const [field, label] of [['address1', 'Street address'], ['city', 'City'], ['state', 'State / region'], ['zip', 'Postal code'], ['country', 'Country']]) {
    if (!String(address?.[field] || '').trim()) return `${label} is required.`
  }
  return ''
}
