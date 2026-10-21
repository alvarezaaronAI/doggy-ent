# Customer Data Strategy

Updated: 2026-10-20. This is a plan, not a migration or authorization to collect new data. Objective: useful recommendations, better service and repeat purchases with less typing, not the largest possible customer dossier.

## Existing Data

Evidence: `server/prisma/schema.prisma`, customerAuth.service.js, account service/validator/mapper, checkout identity/page composables and account signup API/validators.

| Data | Existing authority | Current use and limits |
| --- | --- | --- |
| Identity | User: name, normalized email, verified flag, role/status/timestamps | Better Auth identity and owned account access. Signup requires name/email/password; client minimum password length eight. Public role/status are not accepted inputs. |
| Security | Account, Session, Verification | Password hash, provider-token-ready fields, session expiry/IP/browser and verification/reset data. Security only, never customer analytics or detail exports. Schema provider fields do not mean social login is configured. |
| Profile | CustomerProfile: first/last name, phone, marketingOptIn, defaultAddress JSON | Editing and safe checkout prefilling. preferredContactMethod is a legacy column, not current customer controls; notes remain internal. One default address is not a full address book. |
| Preferences | CustomerNotificationPreference | Category flags and marketingEmails default false. Flags alone do not prove timestamped, purpose-specific consent or authorize automatic sends. |
| Purchases | Order, OrderItem, shipment/status histories, PromoUsage, OrderCampaignUsage | Contact/address snapshots, actual variant/quantity/money, promo/campaign attribution. Server is authority. Nullable userId preserves guest orders; verified-email matching only. |
| Support/audit | CustomerSupportRequest/Message/Event, CustomerAccountEvent | Customer issues and separate internal notes, lifecycle audit. Not a complete privacy-request/export system. |
| Reviews/rewards | ProductReview, LoyaltyLedger | Schema foundations; storefront sample reviews are fictional. Full submission/moderation/reward workflows are not implemented. |
| Browser convenience | Bag, optional saved guest details, receipt session storage | Device-local convenience, not a marketing dataset. Saved guest details have no TTL; see inventory. |

No Pet model, purpose-specific consent-event ledger, production analytics pipeline, automated segmentation or complete erasure/export workflow was found in the audited domains. Reuse identity and order ownership rather than creating duplicate customer tables.

## Required Versus Optional

1. **Browse/bag:** no account, phone, address or questionnaire required.
2. **Create account:** retain current display name/email/password and reviewed confirmation. Consider postponing display name in a later UX review, not a silent contract change now. Explain order history/faster checkout, not unavailable rewards as a current benefit.
3. **Checkout:** only transaction/delivery information. Phone is currently required; review carrier/support necessity before making it optional. Guest checkout stays accessible. Checkout edits never silently overwrite a profile. Marketing remains separate and unselected.
4. **After purchase/account:** one optional question at a useful moment, with Skip, purpose, Edit and Remove. Never block receipt/tracking/history on profile completion. Do not re-ask answered questions.
5. **Review:** purchased product/size experience, not a mandatory unrelated survey. Identify incentivized reviews, never require positive ratings or reward removing criticism.

## Useful Future Fields

| Priority / field | Benefit and low-friction collection | Storage proposal | Avoid |
| --- | --- | --- | --- |
| P1 pet nickname | Optional friendly account experience | Pet.userId/name | Mandatory human personal details |
| P1 life stage/size band | Relevant treat-size/feeding content | Pet.lifeStage/sizeBand, bounded optional values | Exact birthday, diagnoses, fabricated nutrition advice |
| P1 protein/flavour choices | Relevant discovery instead of generic promos | CustomerPreference; per-pet preference only if needed | Treating purchases as declared allergies/dislikes |
| P1 avoid-ingredients choice | Customer-controlled discovery filters | Validated optional ingredient IDs/codes | Allergy-safety guarantees or human health inference |
| P1 first/last order, count, spend, repeat interval | Reorder suggestions and service context | Derived trusted order/refund read model | Browser totals, raw card data, failed attempts as revenue |
| P2 treat purpose | Training/reward/general discovery | Optional preference enum/source | Mandatory lifestyle profiling |
| P2 dog count | Relevant multi-pet/bundle suggestions | Derive from voluntarily added Pet rows | Repeated checkout questions |
| P2 product feedback | Product improvement/support/reviews | Existing ProductReview + eligibility/moderation | Private support notes as public reviews |
| P2 channel/frequency | Fewer irrelevant messages | Existing flags + purpose-specific ConsentEvent | Unsupported SMS promises |
| P3 voluntary referral | Understand referral effectiveness | Existing promo/referral foundations | Friends' contact uploads or fingerprinting |

Do not collect human DOB, income, gender, government IDs, precise location, unrelated social profiles or medical details to sell treats. Avoid broad household/health free text: it can accidentally collect sensitive information. Use bounded options and short explanations rather than a long profile form.

## Proposed Storage And Flow

Keep User as identity and CustomerProfile as customer-owned basics. Add only when approved:

- **Pet:** id, userId FK, nickname, optional lifeStage/sizeBand, createdAt/updatedAt; index userId. Decide removal/cascade policy and ownership tests before migration.
- **CustomerPreference:** userId, preferenceKey, bounded validated value, source (`DECLARED`/`DERIVED`), updatedAt; unique user/key. Do not overload profile.notes/defaultAddress with arbitrary behavioral JSON. Add PetPreference only if truly per-pet.
- **ConsentEvent:** id, userId (or deliberately verified guest subject where necessary), purpose, action GRANT/WITHDRAW, noticeVersion, source, occurredAt and authenticated actor. Minimal append-only evidence, not raw tracking payloads. Index subject/purpose/time. Do not store IP/UA merely for marketing without a documented necessity, or equate an arbitrary email with proof of ownership.
- **Consent projection:** derive current purpose state from events or transactionally update existing marketing flags with the event. Reconcile profile.marketingOptIn and notificationPreference.marketingEmails rather than introducing a third unexplained flag. Order snapshots are not a consent ledger.
- **Order aggregates:** start with indexed owned-order queries; define eligible payment/status/refund treatment and currency. No mixed-currency totals. Partial refunds need reliable ledger evidence before 'net lifetime value'. Cache/materialize only when measured query costs justify it, with update/rebuild rules.

Flow: declared input -> client validator -> API -> server auth/ownership/allowlist validation -> account/pet service -> repository -> Prisma transaction -> safe mapper -> account UI. Purchase-derived data begins only from trusted saved payment/order state. Do not gather abandoned email fields or keystrokes.

Post-order automation may update safe aggregates after verified persistence, idempotently by order/event identity. It must not automatically send marketing, review or operational emails; manual-first policy remains. Anonymous-to-account linking needs proof and purpose decisions, not fingerprinting/email guessing. Preserve verified-email guest-order matching.

## Consent And Incentives

Each optional field should earn its place through a customer benefit. Collect only needed information and approve retention/disposal, following [FTC information-security guidance](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business). The design above does not claim the current code already implements personalization or retention.

Marketing must be distinct from terms, checkout and security mail. Record notice version/purpose/time/withdrawal. Cookie acknowledgment is not consent. Future optional-tracker loaders must fail closed before scripts/requests when permission is absent; toggles alone are insufficient. Review applicable regions; [ICO cookie guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/) is relevant if those jurisdictions are served, not assumed universal.

Possible incentives: a small approved profile-completion code, early-access preference or useful recommendation. Review margins, caps, clear participation/withdrawal and a fair alternative for people declining optional data; never require marketing to resolve an order. Incentives tied to personal information may need specific notices/valuation where applicable. California applicability depends on business/region; consult [CCPA guidance](https://oag.ca.gov/privacy/ccpa) and [loyalty-program guidance](https://oag.ca.gov/node/550478) before launching one. No loyalty/incentive scheme is enabled here.

## Retention And Access Decisions

| Category | Proposed control needing approval |
| --- | --- |
| Auth/session/reset | Engine expiry/revocation, short-lived action tokens, deliberate expired-row purge, no token logs. |
| Optional pet/profile | Edit/remove, deletion handling, inactive-account review, backup expiry. |
| Orders/refunds/tax | Jurisdiction-specific accounting retention; minimize/anonymize beyond necessary records, not blindly cascade-delete paid orders. |
| Consent | Evidence sufficient for current sends/withdrawal, approved retention and limited access. |
| Support/audit/provider logs | Role scope, redaction, retention, verified incident/request handling. |
| Browser convenience | Expiry and explicit remove-saved-details controls; scoped/short-lived receipt proofs, never exported as insights. |

ADMIN access is currently broad; fine-grained staff roles remain future work. New APIs need ownership, malformed-input/bounds, rate-limit and safe-mapper tests. Export/deletion requires verified requester identity, abuse protection, audit and legal-hold/accounting decisions; a contact email alone does not implement it.

## Measuring Value

Start with aggregate checkout completion, checkout-return success, repeat purchase, optional-question skip/completion, support contacts per order and recommendation usefulness. Define purpose/events/retention before instrumentation. Do not claim conversion improvement without measurements. Avoid session replay, external enrichment and pixels now. The next profile implementation slice should be one optional panel plus consent history, after privacy decisions and commerce reliability gates.
