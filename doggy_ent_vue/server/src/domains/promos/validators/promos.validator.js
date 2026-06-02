import {
  PROMO_TYPE,
} from '../constants/promos.constants.js'

export function validatePromoTypeRules(promo) {
  const promoType = String(promo.type || '').toUpperCase()

  if (
    promoType === PROMO_TYPE.UNIQUE
    && !promo.assignedCustomerEmail
  ) {
    const error = new Error(
      'Unique promos require assignedCustomerEmail.',
    )

    error.statusCode = 400

    throw error
  }

  if (
    promoType === PROMO_TYPE.REFERRAL
    && !promo.referralOwnerName
  ) {
    const error = new Error(
      'Referral promos require referralOwnerName.',
    )

    error.statusCode = 400

    throw error
  }
}
