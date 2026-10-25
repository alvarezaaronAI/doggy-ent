export const POLICY_BUSINESS = Object.freeze({
  name: 'Chase and Evie Co',
  email: 'info.chasenevie@gmail.com',
  reviewedOn: 'October 20, 2026',
})

export const POLICY_PAGES = Object.freeze({
  privacy: {
    path: '/privacy', label: 'Privacy', title: 'Your information, explained',
    introduction: 'A draft overview of the information used to run your account, purchases and support.',
    sections: [
      { id: 'information', title: 'Information used by the shop', paragraphs: ['The current application stores account name, email and verification state, optional profile details, delivery/contact details, order items and totals, promo use, and customer support messages. You may also choose to save a pet nickname, breed and mixed-breed selection, life stage, size, optional current weight and its last-update date, protein preferences, treat purposes, birthday month/day and a private pet photo in your account. Weight can be edited or cleared. Pet birthdays do not include a year and cannot be changed once saved. Sign-in records can include IP address and browser information for session security.'], bullets: ['Passwords are handled by the authentication system as hashes, not readable profile fields.', 'Stripe handles payment entry. Shop order records retain payment references and order totals, not a card-number form response.', 'Optional marketing preferences are separate from account access and essential security messages.'] },
      { id: 'purpose', title: 'Why information is used', paragraphs: ['Account information supports sign-in and owned order history. Checkout information supports pricing, delivery and order records. Support messages help investigate an order. Optional preferences should be used only for a clearly explained purpose. Creating an account or buying a product is not marketing permission.', 'Limited account activity records when a pet profile is added, changed, archived, restored or removed, including how long the profile was present, and when a private pet photo is changed or removed. This supports account security and later review of possible misuse, not automatic fraud decisions. Archive keeps the details for later; removing pet details deletes the active pet record and its photo. Dated activity can remain without keeping a copy of the removed name, photo or preferences. Retention periods and verified privacy-request handling still need approval.'] },
      { id: 'providers', title: 'Services involved', paragraphs: ['The application integrates Better Auth for accounts, Stripe for payments, Railway for the API/database and Vercel for the storefront. Resend email and Shippo shipping integrations exist behind server-side controls. Provider settings, hosting logs, international transfers, contractual roles and actual production data flows still need business review.'] },
      { id: 'choices', title: 'Your choices and questions', paragraphs: ['Signed-in customers can review their profile, stored address and marketing preference in their account, and edit or remove optional pet details. You can also choose to save treats to your wishlist; the shop stores the product and saved date with your account, and you can remove them at any time. Saving does not reserve stock, lock a price or sign you up for marketing. Pet details and wishlists are not required to shop or check out. Contact the shop for an access, correction or deletion question. A verified request-handling process, retention schedule and applicable regional rights must be finalized before this notice becomes effective. No automatic data-export or complete account-deletion service is promised here.'] },
      { id: 'approval', title: 'Still awaiting approval', bullets: ['Registered legal entity, operating address and selling regions.', 'Retention periods, backup deletion and required accounting records.', 'Actual provider disclosures, privacy-request procedure and any regional opt-out requirements.', 'Whether a loyalty/data incentive programme will exist and its separate notice.'] },
    ],
  },
  terms: {
    path: '/terms', label: 'Terms', title: 'Shopping with Chase and Evie',
    introduction: 'Draft shopping terms for review, not an effective contract.',
    sections: [
      { id: 'shop', title: 'Products and checkout', paragraphs: ['Product pages show sizes, availability and product information. Checkout calculates the order total on the server. Products marked as testing are not for sale. Guest checkout remains available; an account is optional.'] },
      { id: 'account', title: 'Your account', paragraphs: ['Use an email you control and keep sign-in details private. Your account gives access to your own linked orders. Older guest-order matching requires verified email ownership. Rewards, wishlist and customer review submission are not fully available services yet.'] },
      { id: 'giving', title: 'Campaign contributions', paragraphs: ['Eligible purchases may generate a contribution funded by the business, at no additional charge to the customer. The active campaign rule determines eligibility. Generated contributions are not proof of funds already paid to a partner.'] },
      { id: 'approval', title: 'Terms still to be agreed', bullets: ['Business identity, supported markets and governing jurisdiction.', 'Order acceptance, cancellation, pricing errors and payment/refund treatment.', 'Delivery, returns, damaged goods and consumer-rights wording.', 'Appropriate limitations, dispute process and policy-change procedure reviewed by qualified counsel.'] },
    ],
  },
  cookies: {
    path: '/cookies', label: 'Cookies & storage', title: 'Cookies and your choices',
    introduction: 'Know what keeps your bag, sign-in and checkout working.',
    sections: [
      { id: 'necessary', title: 'Storage for the service you use', paragraphs: ['The shop uses browser storage for your bag and authentication cookies for signed-in features. A guest receipt uses a short-lived access proof in session storage. These are not advertising profiles. Some values persist until cleared or until their application-managed expiry.'] },
      { id: 'remember', title: 'Remembering checkout details is optional', paragraphs: ['Guest checkout has an optional save-details choice. When used, contact and delivery fields are saved in this browser for a later checkout. This is separate from marketing permission. On a shared device, leave that choice off and clear saved site data when appropriate. The existing saved-details implementation has no automatic expiry; a dedicated removal control and retention limit are planned.'] },
      { id: 'optional', title: 'Analytics and advertising', paragraphs: ['No analytics or advertising tracker was found in the audited application source. This is not a certification of deployment/provider behavior: Stripe, hosting, authentication infrastructure, external images and the Font Awesome CDN need a production network/cookie review. Any future non-essential tracking must be reviewed and gated before it loads. There is nothing to opt into on this page today.'] },
      { id: 'choices', title: 'Managing stored information', paragraphs: ['Browser settings let you inspect or clear site storage. Clearing sign-in cookies signs you out; clearing bag storage removes this browser\'s bag. It does not delete an account or past orders. Acknowledging the shop storage notice only remembers that you saw it; it does not consent to marketing or optional tracking.'] },
    ],
  },
  shipping: {
    path: '/shipping-returns', label: 'Shipping & returns', title: 'Delivery, returns and a little help',
    introduction: 'The place for clear delivery and return information. Business terms are still being finalized.',
    sections: [
      { id: 'delivery', title: 'Delivery at checkout', paragraphs: ['Checkout shows delivery options and server-calculated shipping for the entered address. Available carrier or store-configured rates depend on configuration. The supported destinations, dispatch schedule and delivery estimates still need approval; this draft does not promise delivery times or free shipping.'] },
      { id: 'tracking', title: 'Following your order', paragraphs: ['A signed-in customer can see their linked orders. When tracking has been added to an order, available tracking information appears with its details. Order emails are sent through an explicit admin workflow, not automatically by every status change.'] },
      { id: 'returns', title: 'Returns, refunds and damaged orders', paragraphs: ['Return eligibility for pet treats, reporting deadlines, return postage, damaged-item evidence and refund timing are awaiting approval. Contact the shop with the order reference and a short explanation. Do not include payment credentials. This draft does not restrict applicable consumer rights.'] },
      { id: 'approval', title: 'Before this policy is published', bullets: ['Confirm supported destinations, handling times and carrier/fallback rates.', 'Approve food-safety return handling, cancellations, damaged/lost order remedies and refund times.', 'Review the in-account issue window against the final policy and regional rights; a software window must not be presented as the full legal remedy.'] },
    ],
  },
  contact: {
    path: '/contact', label: 'Contact', title: 'Here to help',
    introduction: 'Questions about an order, your account or your information? Get in touch.',
    sections: [
      { id: 'order-help', title: 'Help with an order', paragraphs: ['Include the order reference and a short description so we can find the right context. Signed-in customers can also open eligible order issues from their order details. Email remains available for guest orders and issues outside that in-account flow.'] },
      { id: 'safe', title: 'Keep your details safe', paragraphs: ['Never email a password, full card number, security code or sign-in/reset link. We can discuss a safe way to confirm ownership when needed.'] },
      { id: 'privacy', title: 'Privacy and accessibility questions', paragraphs: ['Use the same contact for a privacy request or an accessibility problem. Tell us which page or action needs help without sending sensitive account details. Response hours, a dedicated support address and formal request procedures are still being finalized.'] },
    ],
  },
  accessibility: {
    path: '/accessibility', label: 'Accessibility', title: 'A shop that is easier to use',
    introduction: 'An accessibility contact and a statement of work in progress, not a certification.',
    sections: [
      { id: 'approach', title: 'Our direction', paragraphs: ['The project uses keyboard focus styles, labelled controls, responsive layouts and reduced-motion behavior. A complete assistive-technology and accessibility audit has not been certified.'] },
      { id: 'feedback', title: 'Tell us about a barrier', paragraphs: ['Contact the shop with the page, what you were trying to do and the issue you encountered. Device or assistive-technology details may help, but are optional. Do not send passwords or private payment details.'] },
      { id: 'review', title: 'Still to verify', bullets: ['Keyboard navigation and focus through dialogs, bag and checkout.', 'Screen-reader labels, validation and announcements.', 'Contrast, text resizing, mobile layouts and payment-provider accessibility.'] },
    ],
  },
})
