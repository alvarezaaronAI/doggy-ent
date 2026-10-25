import { apiError } from '../../../shared/utils/apiError.js'
import {
  getCustomerWishlist,
  removeCustomerWishlistItem,
  saveCustomerWishlistItem,
} from '../services/wishlist.service.js'
import { validateEmptyWishlistInput } from '../validators/wishlist.validator.js'

function validateRequest(req) {
  validateEmptyWishlistInput(req.query)
  validateEmptyWishlistInput(req.body)
  if (req.body === undefined && (Number(req.get('Content-Length')) > 0 || req.get('Transfer-Encoding'))) {
    validateEmptyWishlistInput(null)
  }
}

function handleError(res, error, message) {
  const failure = apiError(error, message)
  return res.status(failure.statusCode).json({ success: false, message: failure.message })
}

export async function listWishlistController(req, res) {
  try {
    validateRequest(req)
    return res.json({ success: true, result: await getCustomerWishlist(req.customerUser?.id) })
  }
  catch (error) { return handleError(res, error, 'Unable to load wishlist.') }
}

export async function saveWishlistController(req, res) {
  try {
    validateRequest(req)
    const result = await saveCustomerWishlistItem(req.customerUser?.id, req.params.productId)
    return res.json({ success: true, result })
  }
  catch (error) { return handleError(res, error, 'Unable to save wishlist item.') }
}

export async function removeWishlistController(req, res) {
  try {
    validateRequest(req)
    const result = await removeCustomerWishlistItem(req.customerUser?.id, req.params.productId)
    return res.json({ success: true, result })
  }
  catch (error) { return handleError(res, error, 'Unable to remove wishlist item.') }
}
