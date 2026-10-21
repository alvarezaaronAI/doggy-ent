export function sessionCookieOptions(production) {
  return {
    useSecureCookies: production,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: production ? 'none' : 'lax',
      secure: production,
      path: '/',
    },
  }
}
