import { editMediaDetails, getMediaLibrary, getPublicImage, uploadImage } from '../services/media.service.js'
export async function upload(req, res, next) {
  try {
    const result = await uploadImage(req.body, { type: req.get('Content-Type')?.split(';')[0], filename: req.get('X-File-Name'), folder: req.get('X-Media-Folder') || 'general' })
    res.set('Cache-Control', 'no-store')
    return res.status(result.reused ? 200 : 201).json(result)
  } catch (error) { next(error) }
}
export async function library(req, res, next) {
  try { res.set('Cache-Control', 'no-store'); return res.json(await getMediaLibrary(req.query)) }
  catch (error) { next(error) }
}
export async function details(req, res, next) {
  try { res.set('Cache-Control', 'no-store'); return res.json(await editMediaDetails(req.params.id, req.body)) }
  catch (error) { next(error) }
}
export async function image(req, res, next) {
  try {
    const asset = await getPublicImage(req.params.id, req.path.endsWith('/thumbnail'))
    res.set({ 'Content-Type': asset.mimeType, 'Cache-Control': 'public, max-age=31536000, immutable', ETag: asset.etag, 'X-Content-Type-Options': 'nosniff' })
    if (req.fresh) return res.status(304).end()
    return res.send(asset.bytes)
  } catch (error) { next(error) }
}
