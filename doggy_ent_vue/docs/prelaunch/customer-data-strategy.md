# Customer Data Strategy

Updated: 2026-10-23. This separates implemented storage from future proposals; it is not blanket authorization to collect new data. Objective: useful recommendations, better service and repeat purchases with less typing, not the largest possible customer dossier. The owner delegated the first optional Pet slice after backup/preflight; see [evidence](../work-checkpoints/2026-10-20-customer-auth-experience.md).

## Existing Data

Optional current pet weight is now implemented as canonical grams, preferred lb/kg and a server-owned last-measurement-change date, separate from customer-selected size. It is declared/approximate, editable and clearable; no inferred health/feeding guidance, individual weighing history, signup requirement, reward eligibility or automated fraud flag. Size-button ranges are approximate UI guidance, not database classification rules. Minimal lifecycle history retains only changed field names, not weight values. See [weight implementation/approved migration evidence](../work-checkpoints/2026-10-23-pet-weight.md).

The approved 2026-10-23 connected photo-led follow-up extends the optional Pet row with canonical breed/mix, multiple treat purposes, optional immutable month/day + first-save timestamp, and archive time. Private normalized photos use the cascading PetPhoto table; no public library, original metadata, fingerprint or free-text breed reporting. Existing created/updated dates and transactional lifecycle/photo events support future account-scoped chronology, not automatic fraud proof. [Implementation and migration evidence](../work-checkpoints/2026-10-23-connected-photo-led-pets.md) supersedes older photo-led proposal-only notes below; reward/consent/reporting/retention work remains future.

Evidence: `server/prisma/schema.prisma`, customerAuth.service.js, account service/validator/mapper, checkout identity/page composables and account signup API/validators.

| Data | Existing authority | Current use and limits |
| --- | --- | --- |
| Identity | User: name, normalized email, verified flag, role/status/timestamps | Better Auth identity and owned account access. Signup requires name/email/password; client minimum password length eight. Public role/status are not accepted inputs. |
| Security | Account, Session, Verification | Password hash, provider-token-ready fields, session expiry/IP/browser and verification/reset data. Security only, never customer analytics or detail exports. Schema provider fields do not mean social login is configured. |
| Profile | CustomerProfile: first/last name, phone, marketingOptIn, defaultAddress JSON | Editing and safe checkout prefilling. preferredContactMethod is a legacy column, not current customer controls; notes remain internal. One default address is not a full address book. |
| Optional pets | Pet: nickname, bounded lifeStage/sizeBand/proteinPreferences/treatPurpose, ownership FK/timestamps | Voluntary Pets tab Add/Edit/Remove, ten per customer. No signup/checkout requirement, feeding/allergy assurance, marketing consent or automatic recommendation engine. |
| Preferences | CustomerNotificationPreference | Category flags and marketingEmails default false. Flags alone do not prove timestamped, purpose-specific consent or authorize automatic sends. |
| Purchases | Order, OrderItem, shipment/status histories, PromoUsage, OrderCampaignUsage | Contact/address snapshots, actual variant/quantity/money, promo/campaign attribution. Server is authority. Nullable userId preserves guest orders; verified-email matching only. |
| Support/audit | CustomerSupportRequest/Message/Event, CustomerAccountEvent | Customer issues and separate internal notes, lifecycle audit. Not a complete privacy-request/export system. |
| Reviews/rewards | ProductReview, LoyaltyLedger | Schema foundations; storefront sample reviews are fictional. Full submission/moderation/reward workflows are not implemented. |
| Browser convenience | Bag, optional saved guest details, receipt session storage | Device-local convenience, not a marketing dataset. Saved guest details have no TTL; see inventory. |

A Pet model is now implemented. Purpose-specific consent-event ledger, production analytics pipeline, automated segmentation and complete erasure/export workflow remain unimplemented. Reuse identity and order ownership rather than creating duplicate customer tables.

## Required Versus Optional

1. **Browse/bag:** no account, phone, address or questionnaire required.
2. **Create account:** retain current display name/email/password and reviewed confirmation. Consider postponing display name in a later UX review, not a silent contract change now. Explain order history/faster checkout, not unavailable rewards as a current benefit.
3. **Checkout:** only transaction/delivery information. Phone is currently required; review carrier/support necessity before making it optional. Guest checkout stays accessible. Checkout edits never silently overwrite a profile. Marketing remains separate and unselected.
4. **After purchase/account:** one optional question at a useful moment, with Skip, purpose, Edit and Remove. Never block receipt/tracking/history on profile completion. Do not re-ask answered questions.
5. **Review:** purchased product/size experience, not a mandatory unrelated survey. Identify incentivized reviews, never require positive ratings or reward removing criticism.

## Useful Future Fields

| Priority / field | Benefit and low-friction collection | Storage proposal | Avoid |
| --- | --- | --- | --- |
| Implemented pet nickname | Optional friendly account experience | Pet.userId/nickname | Mandatory human personal details |
| Implemented life stage/size band | Foundation for relevant discovery | Pet.lifeStage/sizeBand, bounded optional values | Exact birthday, diagnoses, fabricated nutrition advice |
| Implemented protein choices | Foundation for more relevant discovery | Pet.proteinPreferences enum array; only voluntarily declared | Treating purchases as declared allergies/dislikes |
| P1 avoid-ingredients choice | Customer-controlled discovery filters | Validated optional ingredient IDs/codes | Allergy-safety guarantees or human health inference |
| P1 first/last order, count, spend, repeat interval | Reorder suggestions and service context | Derived trusted order/refund read model | Browser totals, raw card data, failed attempts as revenue |
| Implemented treat purpose | Training/reward/enrichment/everyday discovery foundation | Pet.treatPurpose optional enum | Mandatory lifestyle profiling |
| P2 dog count | Relevant multi-pet/bundle suggestions | Derive from voluntarily added Pet rows | Repeated checkout questions |
| P2 product feedback | Product improvement/support/reviews | Existing ProductReview + eligibility/moderation | Private support notes as public reviews |
| P2 channel/frequency | Fewer irrelevant messages | Existing flags + purpose-specific ConsentEvent | Unsupported SMS promises |
| P3 voluntary referral | Understand referral effectiveness | Existing promo/referral foundations | Friends' contact uploads or fingerprinting |

Do not collect human DOB, income, gender, government IDs, precise location, unrelated social profiles or medical details to sell treats. Avoid broad household/health free text: it can accidentally collect sensitive information. Use bounded options and short explanations rather than a long profile form.

## Proposed Storage And Flow

Keep User as identity and CustomerProfile as customer-owned basics. Implemented slice and later proposals:

- **Pet (implemented):** id, userId FK, nickname, optional lifeStage/sizeBand/treatPurpose, bounded proteinPreferences, createdAt/updatedAt; index userId/createdAt. Explicit removal deletes the owned record; User deletion cascades. Deactivation preserves data. Serializable count/insert enforces ten per owner, with strict server allowlist and owner-safe DTO. Whole-account deletion, retention and expired-backup disposal are not completed by this model.
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

## Photo-Led Pets And Reward Safeguards (Proposal Only)

Owner requested a photo-led Pets preview and a plan to prevent repeated profile creation/removal from farming future discounts. This is not approval to activate a reward programme or collect extra pet fields. The disconnected concept uses fictional profiles and existing illustrative Labrador assets; typed names and selected photos stay in memory, never in the conversation-state snapshot or application database. Existing app Pet CRUD still uses five optional fields, allows explicit removal and has no photo, breed, birthday or archive columns.

### Implemented Activity Facts (2026-10-23, Not Deployed)

The owner explicitly requested time-added, removal/re-add chronology and tenure for future abuse review. Pet.createdAt/updatedAt already exist. Local code now writes PET_CREATED/PET_UPDATED/PET_DELETED to the existing CustomerAccountEvent within the same owned Serializable mutation. Each event stores server actor/time and minimal versioned metadata: petId, petCreatedAt, petUpdatedAt, profileAgeSeconds and changed field names only. No additional model/migration, pet snapshot, IP/device fingerprint or reward record is added. No-op/reordered-protein saves do not inflate history.

Later reporting can derive per-account adds/removals over a defined interval, latest removal/add dates, elapsed removal-to-add time and each profile's tenure from these facts. Do not persist a mutable years-on-account column, duplicate event counters or an unvalidated isFraud flag. Events start only after this code is active; prior deletions cannot be reconstructed. A repeated name, date or similar breed does not identify the same animal. Current admin event projection excludes metadata; a protected purpose-specific read model is future work, not an exposed raw history API.

Pet deletion does not erase the event, but User deletion still cascades account events. This is account-linked data, not anonymized or perpetual retention; determine retention/disposal/backups and privacy-request handling before rollout. Removing a profile must remain possible and must not restart future incentive eligibility. A one-time reward needs its own idempotent account/programme grant even if pet history is missing or removed. No risk scoring, restrictions, multiple-account detection, real discount or automatic message is enabled. [Database/evidence](../architecture/database.md#pet-activity-facts-2026-10-23-local-code) and [checkpoint](../work-checkpoints/2026-10-23-pet-activity-and-account-theme.md).

Latest navigation refinement: no separate View profile screen. Each preview card shows photo/name, breed/mix, life stage, size, favourite proteins and multiple treat purposes, with an Edit pet button opening the form directly. The owner's screenshot correction restores a quiet cake-icon/date birthday row below Edit, not a yellow birthday panel. Save, Cancel and All pets return to those cards. Archive is a secondary option inside a pet-options disclosure, with Restore and a separate Data & privacy entry retained. Showing fields in this concept does not mean the connected app collects them yet.

### Card Refinement And Reusable Data Backlog

Owner accepted the focused birthday/multiple-purpose direction on 2026-10-21, then clarified the visual reference: a simple cake-icon/date birthday row beneath the polished Edit action, not a pale-yellow block. Saved month/day stays read-only with no birthday-adjustment action; explanatory lock text remains in the edit form rather than cluttering the card. Optional treat-purpose checkboxes are Training, Everyday rewards, Enrichment and Bonding and play. Select any combination or none; no contradictory All of the above choice. The card displays the selected values, and Edit/Save preserves them in preview memory only. Archive is not reward-abuse protection: the separate account/programme grant must remain authoritative regardless of profile changes.

Connected scope is unchanged: Pet currently stores nickname, optional lifeStage/sizeBand/proteinPreferences and a SINGLE treatPurpose. No new schema/API/collection/analytics/reward deployment is approved or performed by this card refinement. Before connecting multi-select, choose stable canonical purpose codes, add a bounded array or mapped selection relation, explicitly map/backfill existing scalar values without losing historical meaning, and test empty/duplicate/unknown values, ownership and round trips before retiring the scalar. Do not treat the preview's display labels as a production reporting key.

Keep the following reference reusable for this shop and later projects. These are prioritized proposals, not a new questionnaire or implemented collection pipeline:

| Priority / data | Where to collect or derive | Decision it should support | Storage and guardrails |
| --- | --- | --- | --- |
| Current optional life stage/size/proteins | Customer Pets; only nickname required to save a voluntary pet | Relevant discovery and aggregate assortment planning | Existing bounded Pet values; declared, never medical or pedigree assurance |
| Next multi-purpose selection | Optional Pets checkboxes | Product positioning and training/enrichment discovery | Approved canonical codes, migration/backfill, bounded distinct values; keep old answers |
| Next purchased-product enjoyment | One optional in-account question after a real purchase: Enjoyed it / Not a favourite / Not tried yet | Identify liked products and improvement opportunities | Future owned order-item feedback with optional pet association, timestamp and eligibility; not a public review or silent reward condition |
| Next purchase/repeat patterns | Derive from trusted paid orders and reconciled refunds | Stock, size/pack demand and repeat intervals | Product/variant IDs, actual quantities, currency-aware aggregates; do not treat purchases as declared pet preferences |
| Later ingredient avoidance | Optional controlled preferences when catalog ingredient IDs support it | Discovery filters and unmet product needs | Stable ingredient references and source/time; no allergy-safety guarantee or medical free text |
| Later texture/piece-size preference | Optional question after a relevant product experience | Product format and packaging decisions | Only bounded options meaningful for the actual catalog; preferences, not feeding recommendations |
| Later acquisition source | One optional post-order question or separately approved campaign attribution | Compare acquisition channels | Bounded channel/Unknown; no mandatory checkout survey or invasive identity matching |
| Later service/returns themes | Existing issue/refund workflows; derived aggregates | Identify packaging/delivery/product problems | Controlled reason codes and necessary access; never publish private support notes |
| Later communication interests/frequency | Separate account preference controls | Reduce unwanted messages | Reconcile existing flags with purpose-specific consent evidence and withdrawal; no automatic marketing/provider sends |
| Experience-only photo/birthday/breed | Optional profile, only after schema/privacy/source decisions | Friendly account experience and broad declared segmentation | Preview-only today; optional month/day, curated breed IDs/mix status, scoped image ownership; not the core commercial insight source |

Data should be marked DECLARED, OBSERVED or DERIVED with an appropriate source and timestamp. Keep missing/unknown distinct from a negative answer. An account purchase may be for another pet or a gift; only an explicit optional association makes it per-pet evidence. Example: a declared training purpose, repeated small-bag purchases and feedback that pieces were too large can inform a product decision without inferring an allergy or claiming a measured conversion improvement.

Collection stays progressive: short signup, unobstructed guest checkout, optional Pets details, then a useful post-purchase question. Any incentive needs separate approved terms and a server-owned one-time grant, never marketing consent bundled with pet details or a positive-only review condition. No tracker, abandoned-field capture, reward activation or automated email is introduced. Retention, customer correction/removal and internal access decisions remain prerequisites to connected expansion.

Latest owner refinement: remove birthday-adjustment requests from the pet UI and offer a one-time reward per account, not an annually renewable birthday reward. The same notice beneath the pet content must state that adding/editing/removing pets does not unlock another offer. The illustrative 10% amount remains a future example, not an active discount. This supersedes the earlier rolling-365-day/correction-request design in historical checkpoints. Recommended implementation controls remain subject to margin, privacy, business and rollout approval:

| Concern | Proposed control |
| --- | --- |
| Profile-completion incentive | One lifetime grant per verified account for this offer/programme, not one per pet, edit, completion cycle or year. An illustrative 10% offer is not active. Specify qualifying optional fields, maximum discount, minimum spend, expiry and stacking rules; marketing signup is separate. |
| Birthday incentive | No separate annual birthday offer, 20% reward or 365-day renewal in the current direction. A future distinct programme would need separate approval and terms. |
| Birthday changes | Optional month/day, checked before first save; read-only afterward in the preview, with no adjustment-request button, support-request action or correction promise. This UI decision does not remove any separately applicable privacy correction/removal handling. Life stage already covers the initial age-related discovery need; do not collect exact human DOB. |
| Eligibility | Final qualifying fields and activation terms remain unapproved. Birthday windows and advance birthday lead-time rules are unnecessary for the current one-time account offer. |
| Pet removal | Prefer Archive/Restore for routine account organization, with separate verified removal/privacy handling. New pets remain allowed. Neither adding, editing, archive, restore nor deletion restarts the account's offer limit. Do not prevent removal indefinitely to protect a coupon. |
| Duplicate grants/redemption | Separate server-owned RewardProgram/CustomerRewardGrant design with a unique account/programme identity, no annual-reset period, auditable state and idempotent reservation/redemption tied to trusted payment/order persistence. Existing per-email PromoUsage and point-oriented LoyaltyLedger are not this complete workflow. |
| Record lifecycle | A grant must not cascade-delete with the optional Pet row; use a nullable reference or minimized independent evidence. Approve lawful purpose, retention, access and expiry for minimal anti-abuse evidence, including account deletion/recreation handling. A hash is not automatically anonymous; never silently retain entire deleted profiles forever. |
| Multiple accounts | Verified email, bounded offer value, rate/velocity limits and proportionate manual review reduce abuse but cannot establish one person/one pet. Consider a previous paid-order eligibility rule if abuse warrants it. Do not promise fraud-proof pet identity or add intrusive fingerprinting/ID collection. |

Birthday is declared, not independently verified; locking it cannot prove its truth. The primary protection is the server-enforced one-time account/programme grant and independent reward evidence, not the number or birthdays of saved pets. Eligibility checks, consumption and failed/abandoned-payment release need concurrency/idempotency tests before any real code is offered. Keep guest checkout and account use independent of pet completion, and do not reward positive-only reviews.

Before launch, review privacy/correction/deletion rights and whether a financial-incentive notice and affirmative participation are required for the business/regions. See [California AG CCPA guidance](https://oag.ca.gov/privacy/ccpa), [California AG loyalty-program notice guidance](https://oag.ca.gov/news/press-releases/data-privacy-day-attorney-general-bonta-puts-businesses-operating-loyalty) and [FTC data-minimization/retention guidance](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business). This proposal is not a legal-compliance determination. No automatic marketing or operational emails are enabled.

### Breed Data Quality (Preview Only)

Free-form breed labels are not a suitable reporting key: Lab, Labrador Retriever and misspelled variants fragment one declared category. Use an optional searchable choice rather than requiring customers to spell full names. The latest preview replaces browser-native suggestions with a styled disclosure/search/explicit-choice picker. It contains 58 illustrative named breeds with aliases, initially shows six suggestions, and filters by labels/aliases. Search text never becomes saved profile data. Not sure, Breed not listed and an optional blank remain distinct; Mixed breed is now a separate checkbox, not an alternative breed entry. The production app still has no breed field or catalogue, and this is not a complete worldwide or formally ranked popularity list.

Proposed connected storage and behavior:

- **Breed catalogue:** a separate curated/versioned Breed reference table with stable id, unique slug, canonical display name, active flag and search aliases. This can hold hundreds of entries without displaying them all at once. Prefer reference data over an ever-growing Prisma enum. Choose a maintained/licensed source, regional scope and update policy before implementation; the preview's names are examples, not an imported full registry. [AKC breed directory](https://www.akc.org/dog-breeds/) is one reference, not a complete worldwide authority or proof of a pet's pedigree. Retire an entry without breaking existing selections; never reseed or replace customer rows on startup.
- **Pet selection:** nullable breedId FK plus bounded knowledge status such as KNOWN, UNKNOWN or NOT_LISTED, and independent nullable isMixed. Chihuahua with isMixed=true is a valid declared combination, displayed as Chihuahua mix; a second component is not required. A mix with no identified breed stays valid. An unchecked checkbox is absence of a mix declaration, not certified purebred status; do not turn it into pedigree data. The preview uses two fallback selection codes in memory; these would map to status/null FK, never invented Breed reference rows. If multiple known components become useful later, use deliberate PetBreed selections rather than parsing an unbounded description.
- **Search:** let Lab/Labrador find Labrador Retriever and GSD find German Shepherd Dog, but save only an explicitly selected reference ID. Suggestions can tolerate spelling errors later; ambiguous guesses must not silently become declared facts. The current preview uses a native details/search/button-choice pattern with Escape/focus return and Enter selection only for a single result; it is not a custom ARIA combobox. For a production combobox, follow the [W3C pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) with an established accessible component and cross-browser/assistive-technology testing. A missing search result must offer Not sure/Not listed, not collect arbitrary spelling into reporting keys.
- **Validation and reporting:** server-owned catalogue IDs and allowlist/status validation, not only client restrictions; count/filter by ID and distinguish not supplied from explicitly unknown. User-declared data is not a veterinary/genetic verification or permission to infer allergies, diagnoses or safe feeding amounts. Life stage, size and explicit treat/protein preferences remain more directly actionable for discovery.
- **Other fields:** retain existing bounded size/life-stage/protein/treat-purpose values. The latest preview presents Puppy/Adult/Senior as labeled icon radio tiles and Small/Medium/Large/Giant with stable-size frames and progressively sized dog icons. Native radio keyboard behavior, clear selection and optional skip remain; icons never replace labels. These are presentation choices, not weight/age thresholds or automatic feeding recommendations. Use controlled choices for categories, real date validation for dates and free text only where appropriate, such as a pet nickname. Changes need approved schema/API/UI/ownership tests before rollout; no new field or reward is collected/enabled in this refinement.

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

Start with aggregate checkout completion, checkout-return success, repeat purchase, optional-question skip/completion, support contacts per order and recommendation usefulness. Define purpose/events/retention before instrumentation. Do not claim conversion improvement without measurements. Avoid session replay, external enrichment and pixels now. After the optional Pet panel, prioritize consent history/retention and reliable order aggregates before incentives, automated marketing or additional profiling.
