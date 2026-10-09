import {
  mapRecordFields,
  pickRecordFields,
  SUPPORT_RECORD_FIELDS,
  EMAIL_RECORD_FIELDS,
} from '../../../shared/utils/recordFields.js'

export const CUSTOMER_RECORD_FIELDS = [
  'id',
  'name',
  'email',
  'emailVerified',
  'image',
  'role',
  'status',
  'createdAt',
  'updatedAt',
]

export function mapAdminCustomerRecord(user) {
  if (!user) return null
  const profile = pickRecordFields(user.profile, [
    'id',
    'userId',
    'firstName',
    'lastName',
    'phone',
    'marketingOptIn',
    'preferredContactMethod',
    'notes',
    'createdAt',
    'updatedAt',
  ])
  if (profile)
    profile.defaultAddress = pickRecordFields(user.profile.defaultAddress, [
      'address1',
      'address2',
      'city',
      'state',
      'zip',
      'country',
    ])

  return {
    user: pickRecordFields(user, CUSTOMER_RECORD_FIELDS),
    profile,
    notificationPreference: pickRecordFields(user.notificationPreference, [
      'id',
      'userId',
      'orderUpdates',
      'trackingUpdates',
      'reviewRequests',
      'loyaltyNotifications',
      'referralNotifications',
      'marketingEmails',
      'createdAt',
      'updatedAt',
    ]),
    accountEvents: mapRecordFields(user.events, [
      'id',
      'userId',
      'type',
      'message',
      'changedByType',
      'changedBy',
      'createdAt',
    ]),
    supportRequests: mapRecordFields(
      user.supportRequests,
      SUPPORT_RECORD_FIELDS,
    ),
    reviews: mapRecordFields(user.reviews, [
      'id',
      'userId',
      'orderId',
      'orderItemId',
      'productId',
      'rating',
      'title',
      'body',
      'status',
      'createdAt',
      'updatedAt',
    ]),
    loyaltyLedger: mapRecordFields(user.loyaltyLedger, [
      'id',
      'userId',
      'type',
      'points',
      'balanceAfter',
      'orderId',
      'description',
      'createdAt',
    ]),
    emailDeliveries: mapRecordFields(user.emailDeliveries, EMAIL_RECORD_FIELDS),
  }
}
