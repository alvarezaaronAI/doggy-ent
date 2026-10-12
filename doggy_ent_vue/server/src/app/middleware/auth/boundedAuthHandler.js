import { getRequest, setResponse } from 'better-call/node'
import { getAuthBaseURL } from '../../../config/env.js'
const BODY_LIMIT = 100 * 1024

export function boundedAuthHandler(auth) {
  return async (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    try {
      const request = getRequest({ request: req, base: getAuthBaseURL(), bodySizeLimit: BODY_LIMIT })
      return await setResponse(res, await auth.handler(request))
    } catch (error) {
      if (res.headersSent) return next(error)
      if (/content-length|body size exceeded/.test(error.message || '')) return res.status(413).json({ message: 'Account request is too large.' })
      return next(error)
    }
  }
}
