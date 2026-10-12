import { getAdminStorefrontContent, getPublicStorefrontContent, saveStorefrontContent } from '../services/storefront.service.js'

export async function publicContent(_req, res, next) {
  try {
    res.set('Cache-Control', 'no-store')
    return res.json(await getPublicStorefrontContent())
  } catch (error) { next(error) }
}
export async function adminContent(_req, res, next) {
  try { return res.json(await getAdminStorefrontContent()) }
  catch (error) { next(error) }
}
export async function saveDraft(req, res, next) {
  try { return res.json(await saveStorefrontContent(req.body)) }
  catch (error) { next(error) }
}
export async function publishContent(req, res, next) {
  try { return res.json(await saveStorefrontContent(req.body, true)) }
  catch (error) { next(error) }
}
