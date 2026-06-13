export function normalizeAccountEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function validateSignInForm({
  email,
  password,
}) {
  if (!normalizeAccountEmail(email)) {
    return 'Email is required.'
  }

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
  if (!String(name || '').trim()) {
    return 'Name is required.'
  }

  if (!normalizeAccountEmail(email)) {
    return 'Email is required.'
  }

  if (String(password || '').length < 8) {
    return 'Password must be at least 8 characters.'
  }

  return ''
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
