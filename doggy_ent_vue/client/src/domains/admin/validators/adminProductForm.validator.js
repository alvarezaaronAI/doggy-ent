import {
  ADMIN_PRODUCT_REQUIRED_MESSAGE,
} from '../constants/adminProducts.constants'

export function validateAdminProductForm(form) {
  const isValid = Boolean(
    form.name
    && form.shortDescription
    && form.category
    && form.status
    && form.image
    && form.sixOzPrice
    && form.eighteenOzPrice,
  )

  return {
    isValid,
    message: isValid ? '' : ADMIN_PRODUCT_REQUIRED_MESSAGE,
  }
}
