# Policy Pages And Storage Inventory

Updated: 2026-10-23. **Drafts, not legal advice or a compliance guarantee.** Owner approved drafts and supplied Chase and Evie Co and temporary public contact info.chasenevie@gmail.com. Registered entity, operating location and markets remain unconfirmed. No mailing address, refund deadline or delivery promise was invented.

Local 2026-10-25 follow-up retires the floating information-only StorageNotice in favour of the existing footer link and draft page. Its revision utility/composable are removed; no new notice preference is stored and old revision values are inert. This was acknowledgment, not accept/reject consent. Stripe initialization is now deferred through its pure loader until real payment controls mount; ordinary browsing/editor imports no longer initialize it. This supersedes the eager-init and popup descriptions below, not the outstanding production/provider/jurisdiction review. [Current scope and evidence](../work-checkpoints/2026-10-25-error-pages-storage.md).

## Created Pages

| Route | Content | Needs approval before effective publication |
| --- | --- | --- |
| `/privacy` | Actual data categories, purposes, providers and choices | Entity/markets, applicable bases/rights, sharing/transfers, retention and request procedure |
| `/terms` | Shopping/account/giving facts, pending terms | Order acceptance, cancellations, payment/refund treatment, governing law/consumer protection |
| `/cookies` | Storage, optional saved details, tracker findings and settings | Production network/cookie inventory, purposes/durations, regional consent decisions |
| `/shipping-returns` | Delivery flow/tracking/help, clearly pending terms | Destinations, dispatch/transit, rates, food returns, loss/damage/refund timing |
| `/contact` | Supplied public email, guest/account help, safe instructions | Dedicated channel, entity/address, response/request process |
| `/accessibility` | Work-in-progress approach, barrier contact, unverified scope | Actual keyboard/screen-reader/contrast findings and approved statement |

PolicyView is thin; structured plain-text content and a focused renderer reuse the existing header/footer/cart/search/auth UI. No raw HTML injection, customer submission or DB write. Every page has a persistent draft banner and client-side noindex/nofollow restored on exit. Metadata is a crawler hint, not access control or a substitute for approved publication. Do not deploy these drafts as effective legal terms.

Footer placeholders are now working information links. Regulatory/help copy is source-controlled for review, not arbitrary Website UI marketing text. No new admin editor/publication was added. The temporary public email is centralized in policyPages.js; replace it after a business inbox works, without requesting credentials.

## Pet Activity Notice And Lifecycle

Owner-approved connected follow-up adds declared breed/mix, multiple purposes, optional birthday month/day (no year, locked after first save), archive and private raster photos. Draft /privacy categories and purpose copy now describe these fields and archive-versus-removal. Photo metadata is stripped and bytes stay behind owner-authenticated private/no-store routes; no public MediaAsset or browser persistence of uploaded bytes. Pet/account removal cascades photos; archives preserve them. Retention/backup disposal and verified privacy handling still need approval before effective policy/launch. See [connected checkpoint](../work-checkpoints/2026-10-23-connected-photo-led-pets.md) for actual rollout status.

The 2026-10-23 Pet repository adds minimal, account-linked lifecycle events to CustomerAccountEvent: server actor/time, pet identifier, original profile dates, age at the event and changed field names. It copies no pet names, photo, breed, birthday or preference values and adds no IP/device fingerprint, automated fraud score or discount. Existing active Pet createdAt/updatedAt are reused. The earlier history-only slice needed no migration; the later approved connected-fields/private-photo migration is tracked in the connected checkpoint above.

The draft `/privacy` purpose text now distinguishes active-profile deletion from the minimal event history that remains for later account/security review. User deletion still cascades these account events. There is no automatic event expiry/disposal implementation; approve a purpose-specific retention period, access controls, backup disposal and verified privacy-request handling before rollout. Account-linked events are not anonymous or proof of fraud. Earlier deletions cannot be backfilled accurately. See [data strategy](customer-data-strategy.md#implemented-activity-facts-2026-10-23-not-deployed) and [evidence](../work-checkpoints/2026-10-23-pet-activity-and-account-theme.md).

## Source-Audited Storage

| Item | Source/use | Lifetime/control observed |
| --- | --- | --- |
| Customer auth cookies | Better Auth customer config/sessionCookies helper | Engine expiry; HttpOnly, production Secure/None, local Lax, no Domain. Inspect actual production names/lifetimes and companion cookies, never values. |
| Admin auth cookies | Separate doggy-admin config | Eight-hour absolute session, refresh/cache off, server revocation; not shopper marketing. |
| `doggy-ent-cart` | useCart/checkout bag snapshots | localStorage, no TTL; updated/cleared by bag/checkout. Not payment authority. |
| `doggy-ent-checkout-customer` | useCheckoutIdentity, optional guest fields | localStorage when saveInfo chosen, no TTL. Removal currently happens after a successful checkout with saveInfo off or signed-in flow, or via browser clearing. Dedicated removal/expiry remains open. |
| `order-receipt:<reference>` | receiptAccess guest proof | sessionStorage/in-memory; server proof validation/expiry. Never expose values. |
| `doggy-admin-stripe-payments-url` | Admin dashboard-link preference | Admin localStorage; not a payment secret. |
| `doggy-ent-storage-notice` (retired) | Former informational notice | An existing revision string may remain inert. Current source does not read/write it; no bulk browser-data clearing is performed. It was never tracking/marketing consent. |

No Google Analytics, Meta pixel, session replay or advertising SDK initialization was found in searched application source. Promo/campaign 'analytics' endpoints aggregate business records, not browser tracking. This is not a certification that providers/CDNs/hosting are tracking-free.

`client/index.html` loads Font Awesome CSS from cdnjs. Images may use external HTTPS sources. Stripe.js/Elements makes provider requests during payment initialization. Better Auth Infrastructure has server/client plugins. Railway/Vercel, Resend and Shippo handle operational data depending on configuration. Audit actual production requests, cookie purposes/lifetimes, logs, provider contracts and transfers. Do not label every provider request advertising or every storage use consent-exempt.

Earlier browser verification observed Stripe on information routes. The 2026-10-25 local follow-up replaces module-level initialization with a shared deferred getStripe call using the SDK's pure entry. It is invoked only by actual mounted payment controls; previews return before initialization. No trusted pricing/payment submission behavior or SDK provider configuration changes. Production/provider purpose, cookie duration and legal classification still need review; no live payment was attempted.

## Notice And Future Consent

The footer Cookies & storage link keeps information available without an overlay, entry gate or timer. The former notice/revision write is retired. There is no 'Accept all' button because no optional shop tracker is enabled in application source; that finding is not a certification of every provider/deployment cookie. Fake tracking toggles would misrepresent control. The draft page states that browsing, dismissal and elapsed time do not provide marketing/optional-tracking consent. Bag/auth/optional saved-checkout behavior is unchanged; legal jurisdiction and purpose-specific exceptions require review.

If analytics/advertising is approved later, add purpose/version/expiry-aware state and an actual loader gate before scripts/requests. Provide accessible refusal/reopening where required, revoke without blocking checkout, review GPC/regional requirements and verify providers. localStorage is also storage, not only cookies. Review jurisdiction-specific obligations with counsel; see [ICO guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/) and [FTC privacy guidance](https://www.ftc.gov/business-guidance/privacy-security).

## Other Pages And Decisions

- Notice at collection and any applicable privacy-rights/opt-out page: real purpose, verified requester and request handling, not a dead form.
- Financial-incentive notice: conditional on approved data/loyalty incentives and applicable law; none exists yet.
- Review guidelines: before customer submissions, publish eligibility/moderation, incentive disclosure, photo permission and reporting.
- Campaign transparency: real partner approval, schedule/rule and generated-versus-paid clarity before claims.
- Ingredient/feeding/storage/food-safety disclosures: approved product and label facts. Review pet-food business/label requirements for intended markets separately.
- Subscription/cancellation terms: only if introduced; none claimed now.
- Business contact/address and statutory disclosures: confirm entity/markets; never extract a personal address from account records.

## Owner Approval Checklist

Confirm entity/markets, approve shipping/returns/food handling and consumer-rights wording, verify public inbox, finalize retention/deletion/request procedures, inventory production providers, review optional-data/incentive decisions, complete accessibility/device QA and obtain qualified legal review. Then set a real effective date, intentionally remove draft language, update notices/records and approve deployment. Documents cannot substitute for implementing their promises.
