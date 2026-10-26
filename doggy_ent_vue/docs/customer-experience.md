# Customer Experience Requirements

## Payment Receipt Follow-Up (2026-10-25)

One automatic payment confirmation is now owner-approved, narrowly superseding
older manual-only receipt wording below. Confirmation truthfully distinguishes
queued, pending, provider-accepted, failed, test-only and not-sent email states.
It keeps the saved recipient/reference/on-page receipt; a failed email never asks
the customer to pay again. Shipping and fulfillment updates remain separately
reviewed/manual. Live sending stays disabled until verified provider/domain setup
and an approved-inbox test. See [receipt architecture](architecture/checkout-and-order-email.md)
and [checkpoint](work-checkpoints/2026-10-25-checkout-receipt-email.md).

Recovery follow-up (2026-10-25): missing pages and campaigns show a prominent blue 404 with centered explanation/actions. Temporary campaign failures and browser-reported offline network failures have distinct safe, retryable wording. Unavailable order details use the same illustrative family but never imply payment failure, reveal diagnostics or invite another payment; read-only retry, owned history and contact remain. Shared monogram fills open public/account/checkout space; cards, forms and configured reading surfaces stay readable. Copy is stable by error type, not randomly rotated. [Current evidence](work-checkpoints/2026-10-25-error-pages-storage.md).

## Recovery And Storage Information (2026-10-25, Local Preview)

Owner's next follow-up explicitly authorizes deployment after verification and replaces the recovery photo with a newly generated, labelled illustrative black/chocolate Labrador trail image. App now owns one minimum dynamic-viewport frame including the local development strip. Flexible public/account shells let short-page content grow and place the existing footer at the viewport bottom, while long pages grow naturally; footer is never fixed over content. Account width is retained without old fixed-height floors; checkout/confirmation backgrounds stretch but their intentionally condensed layouts do not gain a new shop footer. Existing footer visibility controls remain. [Release evidence](work-checkpoints/2026-10-25-error-pages-storage.md) supersedes earlier local-only notes when verified.

Unknown routes use a branded missing-page screen with a short explanation, clearly illustrative Labrador photograph, monogram and real shop/home/contact actions. No raw path/query, stack, SQL/provider response or invented diagnostic ID is shown. A missing campaign is distinct from a temporary load failure, which offers a safe read-only retry. Existing form, account, checkout/payment and order errors stay in their contextual flows; they are not relabelled 404 or automatically retried. Error states add temporary noindex/title metadata and clean it up on recovery/navigation. The static SPA response remains HTTP 200, not a claimed server-side 404.

Storage information now stays in the existing footer Cookies & storage link and draft page, without a floating informational popup or an accept-to-enter gate. The retired popup acknowledged a revision only; its dismissal never enabled/disabled cookies, marketing or tracking. No optional tracker/consent toggle, timed acceptance, new browser-storage write or clearing of bag/auth data is added. Guest remembered-checkout details remain an explicit existing optional choice. Stripe's pure loader initializes only when actual payment controls mount, not from ordinary route imports or editor previews. SDK timing is not a determination of consent exemption or a complete provider audit.

Local preview, verification and outstanding legal/provider/device decisions: [checkpoint](work-checkpoints/2026-10-25-error-pages-storage.md). Before optional tracking, implement a real default-off loader gate with accessible accept/reject/customize and later withdrawal, review target-market requirements and update truthful disclosures. Do not infer consent from browsing, closing, waiting or inactivity.

## Saved Treats And Account Organization (2026-10-25)

Account navigation now groups Shopping (Overview, Orders, Wishlist), Your details (Profile, Pets, Addresses), Support and Coming later (Rewards only). Desktop/mobile reuse the same groups. The shell supplies the quiet account-colored monogram to every authenticated destination, rather than repeating it only on Pets. Overview includes a compact Your pack card beside essentials on desktop, up to three active pets, owned private photos or illustrative fallbacks, and separate loading/error/empty states.

Wishlist is implemented, not a future placeholder. A heart on an actual product card or Quick View explicitly saves/removes the product for the signed-in customer; guests use normal sign-in and must deliberately save afterward. Editor/browse-only samples do not enable this action. Saved entries persist across devices, join the current public catalog, retain variant/price/Quick View and campaign styling, and use the account shell's real bag. Hidden/deleted catalog details are never disclosed. Saving reserves no inventory, freezes no price and is not marketing permission. Test products remain unpurchasable. Errors retain prior state; account changes clear private cached entries and stale responses cannot restore them.

Rejected optional pet photos now offer Continue without a photo or Keep the current photo, without discarding draft data or deleting a valid existing photo. Focus returns to the chooser. Privacy confirmation focuses Keep details; cancelling restores its opener and successful removal selects the next removal action or privacy summary. The optional birthday/card layout is unchanged. Account bag quantity increases retain the selected variant while the catalog loads and never set quantity to zero on an unavailable variant.

Storage, migration and verification: [account wishlist checkpoint](work-checkpoints/2026-10-24-account-wishlist.md). Retention/privacy decisions, real-device acceptance and commerce/security launch gates remain separate.

## Optional Current Weight (2026-10-23)

Size tiles now include approximate lb/kg guidance, not automatic classification or feeding/health advice. Add/Edit offers optional Current weight beside a labelled unit selector with a decimal keyboard, example, explanation, linked soft-red validation and first-invalid-field focus. Changing units converts the current measurement; unchanged rendered values preserve exact stored grams across repeated conversions/reopens. Size stays independently selected. A saved weight appears beneath Size on the existing card; leaving it empty saves no weight and explicitly clearing it removes the measurement/date. Weight can change as the pet grows, unlike the immutable birthday.

Storage uses canonical integer grams, preferred display unit and a server-owned date for the last material measurement change. Unit-only/no-op saves do not refresh that measurement date; omitted weight in an older update preserves it. No weight value enters account activity snapshots. Existing palette, monogram, photo/birthday/archive/navigation and optional signup/checkout behavior remain. [Verification/approved migration checkpoint](work-checkpoints/2026-10-23-pet-weight.md); website deployment is separate.

## Connected Photo-Led Pets (2026-10-23)

Owner-approved rich Pets design is now connected application source, superseding the earlier preview-only notes below for this surface. Your pack shows real owned pet cards, private photo or clearly identified Labrador illustration, canonical breed/mix, life stage, size, favourite proteins, multiple treat purposes and the quiet cake/date row below direct Edit. No intermediate View profile. Existing account navigation, emerald/gray tokens, monogram, guest checkout and bag remain.

The inline Add/Edit form uses labelled searchable breed choices (58 common named breeds plus Not sure/Not listed, not a complete registry), an independent Mixed breed checkbox, visual native radio tiles, optional multiple purposes and bounded private raster upload. Only nickname is required when saving voluntarily. Birthday is optional month/day with explicit first-save confirmation and server-enforced immutability; no correction-request UI or birth year. Existing saved purposes/omitted richer fields remain compatible with old clients.

Archive/Restore sits in pet options and preserves the original profile identity/dates; archives still count toward ten. Separate Pet data & privacy offers explicit confirmed removal of profile/photo, while minimal account activity survives. No active discount, automated fraud decision or marketing consent. The future-offer notice explains one per account without implementing eligibility or redemption. New photos never enter the public image library and are fetched using owned authenticated endpoints, not external URLs. See [storage/rollout evidence](work-checkpoints/2026-10-23-connected-photo-led-pets.md); retention/rights and real-device gates remain.

## Pet Activity And Account Palette (2026-10-23)

The photo-led concept keeps the approved cards/direct Edit/simple birthday row and now matches account.css: emerald #17664e actions, #edf6f0 selections/notices, #f6f8f7 page background, #24332d ink, #64736c muted text and #dce5df borders. Shared brand mark/footer colors and subtle monogram remain. This is still a disconnected rich-card design, not integration of photo/breed/birthday/archive/multi-purpose fields.

The connected Pet repository adds minimal transactional add/edit/remove activity using existing timestamps and CustomerAccountEvent. Customers do not see internal abuse-review labels or audit metadata. Removal still deletes active pet details; limited dated account activity survives pet removal without retaining names/preference snapshots. Draft privacy copy explains this distinction. No automatic fraud decision, reward, marketing, checkout restriction, new identity tracking or new migration. See [activity contract and limits](architecture/database.md#pet-activity-facts-2026-10-23-local-code) and [current checkpoint](work-checkpoints/2026-10-23-pet-activity-and-account-theme.md).

## Centered Auth And Optional Pet Profiles (2026-10-21)

Follow-up: labelled Full name/email/password inputs have examples and helper text, subtle input/card shadows, password visibility/Caps Lock guidance and two-step signup progress. Validate on blur or submit, not before interaction. Reserve helper/error space so blur feedback cannot move a button between pointer-down and click. Invalid inputs use soft red; corrected valid format/length/confirmation uses soft green with a status icon. Green never claims account existence, email verification or password strength. Sign-in passwords stay neutral until the server responds; rejected credentials mark both fields red with one account-independent message. Inline text/ARIA and linked feedback remain; submit focuses the first invalid input without hiding it under the sticky header.

Keep a single inclusive Full name at signup, stored as Better Auth User.name without guessing name parts. Do not require middle names; existing personal-details first/last fields remain separate Profile edits. Better Auth is the password/security authority (explicit existing limits 8..128, default scrypt hashing/verification). Local checks and match indicators are convenience, not a replacement for server validation or breached-password/strength screening.

Standalone sign-in, create, forgot and reset share one centered, bounded white card, existing yellow/brown/blue tokens, subtle Labrador monogram and the real storefront header/footer/bag. Password controls support visibility and password-manager autocomplete. Signup remains name/email/password plus confirmation, then a review step before account creation. Customer role is server-owned; no pet question, marketing requirement or OAuth button is added to signup.

Safe same-origin return paths survive sign-in/create/recovery, including checkout. Confirm the actual session before redirecting; an account created without a usable session must not be created again on retry. Keep guest checkout and bag/draft storage unchanged.

Recovery checks public provider readiness before requesting a link. Unconfigured/mock delivery offers honest contact guidance. Generic request acceptance is not delivery confirmation or proof an account exists. Reset consumes the email-link proof privately and removes it from the URL; refreshing afterward needs a fresh link. Successful reset clears local cached identity and revokes engine sessions. Real inbox/link acceptance still needs approved provider QA.

The separate Pets account navigation destination (`/account/pets`) offers nickname, life stage, size band, favourite proteins and treat purpose, with Add/Edit/Remove and a ten-pet maximum. It reuses the existing panel rather than duplicating it inside Profile. Desktop and mobile share the same nav catalog and protected account layout; all earlier tabs remain. Only a nickname is required when voluntarily saving a pet. Ownership comes from the session; no public pet lookup. Explain purpose and future recommendations without claiming feeding/allergy safety or automated personalization. Pet changes do not alter orders, identity, profile marketing flags or notification preferences. Account deletion cascades Pet rows; account deactivation preserves them. Backup retention remains an owner decision. See [implementation evidence](work-checkpoints/2026-10-20-customer-auth-experience.md).

## 2026-10-20 Prelaunch Data And Policy Direction

The initial planning phase kept signup short and guest checkout available, without enabling trackers, incentives or OAuth. The later pet slice above implements only optional editable/removable preferences, not signup requirements. Orders and marketing consent remain separate. Existing versus proposed storage is described in the [data strategy](prelaunch/customer-data-strategy.md).

Public information pages share the storefront shell and explicit draft status until approved. Storage acknowledgment is not marketing consent and does not clear the bag or change auth. See [policy inventory](prelaunch/policy-and-storage-inventory.md) for provider/retention gaps and owner decisions.

## Data/Session Clarification (2026-10-18)

The main All treats collection includes newly published eligible products after saved Featured ordering loads; extra curated collections keep their selection. Draft/archived/test-purchase protections remain. Local development alone has a backend-confirmed routing panel on every route; customers on production do not see database diagnostics.

Sign-in must confirm an actual session and user before redirecting. Accepted credentials without a retained browser session show an actionable error without losing the bag; standalone account creation explains session failure without inviting duplicate signup. Stale anonymous reads cannot overwrite a newer sign-in/sign-out. Customer cookie settings now match existing split-site admin requirements, without bypassing browser third-party-cookie restrictions. Sign-in/create UI redesign remains separate. See [repair evidence](work-checkpoints/2026-10-18-data-routing-and-customer-session.md).

## Approved Storybook And Impact First (2026-10-17, Local)

The owner approved the new full Brand/Campaign examples after the focused Modern Boutique Home pass. Brand now uses a single origin introduction, selectable Chase/Evie portraits, numbered story chapters, a photograph/story moment, pale-yellow values and the existing shopping invitation. Campaign leads with its actual configured contribution directly below the hero, then partner story, clearly fictional testing programmes, giving steps and unchanged eligible products. Fixed/percentage, inactive schedule/status and generated-not-paid distinctions remain truthful. Same campaign renderer in pop-out and admin; shared header/footer/cart/auth/checkout and accepted Home are unchanged.

Portraits are editable static presentation with upload/library/URL images and safe defaults for older publications. Template photography/personality/chapter text remains labelled. This is local integration only; authenticated editor persistence, real device/Safari/keyboard/screen-reader and post-deployment checkout acceptance remain manual. See [current evidence](work-checkpoints/2026-10-17-storybook-impact-first.md).

This document governs customer account, profile, order, checkout, shipping, and support experiences. Preserve guest checkout and the storefront’s existing brand feel.

## Selected Modern Boutique Sections (2026-10-16, Local)

Only Made With Care, Ingredient Promise and the homepage pair teaser adopt the selected Modern Boutique composition: photo/ordered process, pale yellow icon-led promise, and full-width photo/story. Existing managed wording/images/links and product ingredients/storage remain authoritative. The separate Brand/Campaign pages, products, giving, Next Drops, header/footer and commerce flows are unchanged.

Detailed reviews retain rating, title, body, author/date, product/size/photo and fictional labels in larger two-across desktop/one-across narrow cards. Native horizontal scrolling contains extra entries. Previous/Next and Pause/Play accompany eight-second overflow-only autoplay, which stops offscreen, in hidden tabs, for hover/focus, reduced motion and Website UI preview. Manual navigation/drag pauses until explicitly restarted. The future-review notice remains outside rotation. These are still sample reviews, not customer submissions/verified purchases.

This is local source, not a new publication/deployment. See the [checkpoint](work-checkpoints/2026-10-16-boutique-home-sections.md) for verification and real-device/editor acceptance limits.

## Calm Giving Storefront

### Approved Design Integration (2026-10-15)

The approved compact-card/polished preview is now implemented in the Vue app, with all original Home content areas retained. The grid caps desktop card width rather than stretching a few products. Product pop-out has a prominent selected-size price, main photograph plus up to four optional detail images, desktop vertical/mobile wrapping thumbnail navigation, information/care sections and the existing cart actions. Changing photographs does not reset selected size. Test items are clearly labeled and cannot be purchased.

Home adds a real-campaign giving spotlight, photo-led care, optional explicitly fictional sample reviews, paired closing content and subtle Labrador monogram. Brand uses an introduction, origin/pair section and story chapters; Campaign uses its actual managed introduction/partner/story/rules beside a giving explanation. Shared header/footer/cart/auth remain single sources of truth. Announcement rotation supports manual navigation/Pause and respects reduced motion. Template photos are identified and need business approval before a real-customer launch.

Static appearance/copy is managed in Website UI; Products owns catalog facts/gallery and Campaigns owns partner/story/eligibility/rules. The owner explicitly approved using separate StorefrontContent presentation storage. This does not let previews mutate business records or change server-owned totals. Historical dated baseline descriptions below remain useful context; exact rollout/verification is in the latest handoff.

Implemented 2026-10-09. Home retains the hero, featured product, collection, Next Drops, Happy Pups/social proof area, Made With Care, Ingredient Promise, Meet the Brand, and shopping help. Sections are fluid full-width bands with a constrained inner layout; yellow, blue, brown, and oat brand accents remain. Emerald tints identify products in currently eligible campaigns, not every product.

- Header, cart, search, and customer auth are shared with account and campaign routes. Desktop account hover has a buffered path and delayed close; clicking pins the menu. Mobile navigation supports Escape and closes after navigation.
- Product sizes use deterministic 6 oz then 18 oz ordering. Product cards and featured content share per-product selection; quick view starts from that selection. Price and cart payload come from the selected variant, while final totals remain server-owned. Featured content is independent of catalog search/sort and its image/title are not click targets.
- Campaign badges link to `/campaigns/:slug` only when the public page is enabled. Legacy giving can remain active without a public page. Campaign data failure is separate from catalog failure and does not prevent shopping.
- Campaign pages lead with an introduction, beneficiary, story, contribution explanation, and eligible treats. Generated contributions are not confirmed payouts. Business-funded giving is not an extra donation charged to the customer. Paused/ended pages explain that ordinary purchases do not currently contribute.
- Ingredients/storage copy uses stored product content. No invented nutrition analysis, free-shipping threshold, verified reviews, notification subscription, or social destinations are presented as working features. Happy Pups retains the gallery and explicitly labels verified reviews as future work; business-approved product/brand photos are still a content QA requirement.

See [data flow](architecture/data-flow.md) and [verification](verification-and-qa.md) for source-of-truth boundaries and real-data QA.

### Homepage And Brand Follow-Up

The approved 2026-10-09 baseline implementation retains recognizable section boundaries, larger headings, blue rules, warm/white reading bands, and the original seven-link footer navigation. All nine homepage anchors remain. The photo-led hero uses unframed white text, a neutral gray readability tint, stored product tags, a yellow shopping action, outlined ingredient action, and supporting shopping links. This supersedes the earlier frosted treatment after approval of the interactive preview. Its layout grows with content rather than cropping controls inside a fixed-height container.

- `/meet-chase-evie` is a public story page, not an FAQ or account page. Home teaser/hero, desktop/mobile header, and footer link there. Origin copy and the two names reuse existing repository content; template photography is identified, without invented dog biographies or verified-customer claims.
- The page reuses SiteHeader, SiteFooter, shared search/auth state, cart persistence, and catalog-aware cart helpers. Shopping links return to the real collection/ingredient section. No backend endpoint or customer identity flow was added.
- Hero product copy/tags/primary destination read the same featured product as the featured section. It does not hardcode Chicken Jerky when another product is featured. Loading/empty catalog fallback remains ordinary shopping.
- Next Drops distinguishes loading, failure/retry, and an actually empty list. Upcoming cards again show stored category, tags, description, protein/cut, a Coming Soon notice, and functional Preview. Notify Me is disabled with future-phase copy; it does not open Preview or claim to subscribe a customer.
- Footer uses the user-approved Instagram profile. TikTok/YouTube are disabled, labeled placeholders until real destinations are supplied. Optional public `VITE_INSTAGRAM_URL`, `VITE_TIKTOK_URL`, and `VITE_YOUTUBE_URL` can override destinations; only valid HTTPS links on the intended platforms are enabled.
- No unsupported human-grade certification, free-shipping threshold, delivery guarantee, return promise, or nutrition analysis was restored from reference images. Campaign green accents, selected variant/cart behavior, checkout totals, auth, and admin remain unchanged.

Next Drops now has a full-width introduction followed by two generous product columns on larger screens and one column on mobile. Soft shadows distinguish individual product items, featured media, gallery images, and care steps; entire page sections are not floating cards. Hero/gallery template JPEGs are bundled locally through `brandContent.js`; product images, variants, prices, stock, and campaign eligibility remain API-owned. Template photos are not actual portraits or customer reviews.

Add to Cart continues to open a right-side drawer over the current page, not a cart or checkout route. It is 420 px wide on desktop and fits the viewport on mobile. Quantity/removal/selected price remain driven by the existing cart composable. The drawer has a labelled dialog, Escape/backdrop close, contained keyboard focus, opener restoration, background scroll locking, and focus recovery after removing a row. On short landscape screens, the entire drawer content scrolls under a sticky close/header so footer actions cannot be clipped. Secure Checkout alone navigates to the existing `/checkout` page; the drawer never calculates finalized tax/shipping/discount/payment totals.

Real Chase/Evie portraits and business-approved expanded story content remain a manual content phase. These UI edits are not deployed automatically. The user approved the unframed baseline preview; final real-device/Safari and business imagery review still remain.

## Admin-Controlled Storefront Presentation

The 2026-10-09 editor preserves the accepted homepage by default: gray-tinted hero, featured treat, collection, generous upcoming cards, gallery, care/ingredients/brand/help, warm footer and right-side bag. Public pages use only published content. Drafts remain private; header/footer stay shared across home, brand, campaigns and account pages.

Hidden-section anchor actions are omitted. Search follows a visible collection and disappears when none is published. Curated collections still respect catalog availability and search/filter/sort. Seasonal/background images require approved hosted HTTPS artwork and readable foregrounds. Product prices/variants/inventory/ingredients, promo eligibility, campaign calculations, auth, and checkout totals stay domain-owned.

Failed content reads retain last known good/default presentation rather than blocking shopping; this is not successful-delivery or real-time-update proof. The full brand-story page is outside homepage teaser editing. See [storefront-editor.md](architecture/storefront-editor.md).

## Customer Account Overview

Redesign the account home as a clear navigation hub when customer account work is in scope.

Requirements:

- Create an easy-to-scan account menu page.
- Make all major account sections easy to reach.
- Move tracking, reviews, messages, support, and similar secondary items into the account menu instead of cluttering the overview.
- Show a maximum of two recent orders on overview.
- Remove vanity or unnecessary metrics such as lifetime spend unless they provide a real customer benefit.
- Prefer useful content such as recent order status, saved/default address state, account verification state, open order issue state, and next actions.
- Use featured products in empty or low-content areas when appropriate, keeping them simple and readable.
- Empty states should include useful actions such as continue shopping, browse featured products, or complete profile.

## Customer Profile

Profile should let customers manage useful account data while preserving Better Auth ownership.

Requirements:

- Show name and verified account email.
- Email cannot be changed until a safe verification flow exists.
- Provide a polished email verification card or popover.
- Clearly show verified or unverified state.
- Allow resend verification with rate limiting and safe UX.
- Allow editing and saving name, phone if supported, default shipping address, and additional saved addresses when supported or appropriate.
- Show a stored-information card summarizing what the account currently has.
- If nothing is stored, show a polished empty state.
- Show saved changes immediately after successful save.
- Remove customer-facing email activity history.
- Remove preferred communication method controls.
- Do not imply SMS or other unavailable channels exist.
- Customer communication channels are email and in-account messages or issue replies.

## Customer Orders

Redesign orders as one responsive page split into two primary sections when order UX work is in scope:

1. Orders list/navigation.
2. Selected order details.

Requirements:

- Select the most recent order by default.
- Clicking another order should update details without requiring separate full-page navigation when practical.
- On mobile, adapt the split view into a clear stacked or drill-in pattern.
- Group orders by month.
- Current month remains expanded.
- Older months are collapsed by default.
- Each order list item should show only useful summary data.

Order details should include:

- Friendly order reference.
- Placed date.
- Order status.
- Fulfillment/shipping state.
- Product images.
- Product name.
- Selected variant.
- Quantity.
- Unit price.
- Line total.
- Subtotal.
- Shipping amount.
- Selected shipping carrier/service/method.
- Tax.
- Discount only when present.
- Promo only when present.
- Business-funded giving only when present, in a separate thank-you below the total, never as a charge row.
- Total.
- Tracking only when available.
- Customer-visible issue messages and resolution when available.

Exclude empty, null, zero-value, or irrelevant sections. Remove customer-facing internal order timelines. Do not expose raw Stripe IDs, internal database IDs, internal status history, or admin notes.

## Need Help And Order Issues

Add a clear `Need help?` action under each eligible order when support work is in scope.

The action should:

- Open a polished quick menu or modal.
- Prefill order reference, customer, order items, delivery state, and other useful context.
- Let the customer select an issue category.
- Allow a short description.
- Allow optional item selection when the issue concerns a specific item.
- Create a customer-facing case number.
- Show confirmation and case status.
- Make replies and resolution visible from the related order page.
- Avoid forcing the customer to re-enter data already known to the system.

Eligibility:

- Customers may create an order issue only within seven calendar days after confirmed delivery.
- If the order is not delivered, allow only appropriate pre-delivery issue categories when useful.
- After the dispute window closes, disable the action and explain why.
- Admin override may be supported, but customer rules must remain clear.

Suggested statuses:

- `OPEN`
- `REVIEWING`
- `WAITING_FOR_CUSTOMER`
- `ACTION_REQUIRED`
- `RESOLVED`
- `CLOSED`

Future support may include refunds, replacements, store credit, apology promo codes, internal notes, customer-visible replies, and attachments.

## Checkout

The approved 2026-10-10 presentation is Receipt First: the open bag precedes the form on narrow screens, with bordered/shadowed contact/shipping/delivery/payment cards and a mobile-visible secure submit. Sign in/Create account opens in place. Signup requires password confirmation and a review of name/email before account creation, confirms a Better Auth session, then returns to the retained cart/form. It never places an order or saves a shipping address merely by signing in. Safe account prefilling only fills blank fields.

Cart, checkout, account orders and Soft Essentials confirmation share one `CommerceItemCard`, with actual size/quantity/unit/line price, campaign emerald and an applied-order-promo marker. Published campaign badges open the same public campaign page renderer in a dialog. Private campaigns may contribute without exposing a page.

Confirmation is actual saved order data. Receipt copy names the order email and truthfully distinguishes not sent from provider accepted; order emails are manual-only. Guest receipt access requires the short-lived checkout proof or customer ownership, not merely an order reference. See [checkout/order email architecture](architecture/checkout-and-order-email.md) for privacy/deployment limitations.

Requirements:

- Signed-in customers should have known information prefilled.
- Prefill name, email, phone, and default shipping address when available.
- Guests must still be able to checkout.
- Preserve guest checkout.
- Allow customers to edit checkout values without silently overwriting saved profile data unless they explicitly save changes.
- Clearly distinguish checkout-only edits from saved-address changes.

## Apple Pay And Google Pay

The user explicitly requested active wallet support on 2026-10-10, superseding the earlier Fall 2026 placeholder rule. Use Stripe Express Checkout Element with device availability and honest card fallback. Admin Website -> Checkout has independent Apple Pay/Google Pay switches, published with the existing draft workflow. Card remains available. Wallet/domain/HTTPS configuration and an approved real-device Stripe test transaction remain required; local unavailable-wallet fallback is not payment certification.

## Shipping Rates

### Shipping Address Review (2026-10-10)

The checkout shipping card has persistent field labels and postal autofill attributes. Apartment/unit is progressively revealed without losing an existing value. Complete recipient/address fields enable **Use this address**, which shows a compact postal-address review; **Edit** retains values and returns focus to the street field. This changes checkout presentation only, not saved account addresses or shipping pricing. The review action is optional; normal checkout validation still requires recipient/address details.

Canada uses a province/territory input and postal-code label rather than the US state list. The existing four US state options remain; supported business destinations, postal format rules, and carrier coverage need separate review. Do not label the address verified. Stripe Address Element is not installed; its autocomplete/completeness features are a possible later integration, not proof of carrier deliverability.

The secure-order action uses immutable storefront yellow/brown tokens, a full-width lock action and distinct disabled/processing states. Its readiness is explicitly Boolean: an empty required field must not become a truthy Boolean component prop. Neither address review nor pressing Edit initiates payment.

Treat `Carrier rates are unavailable. Store shipping rates are shown.` as a verified root-cause task, not a cosmetic message change.

Investigate:

- Shippo environment variable names.
- Token selection.
- From-address configuration.
- Destination address normalization.
- Parcel dimensions/weight.
- Provider request payload.
- Provider response.
- Timeout/error handling.
- Test-mode restrictions.
- Unsupported carrier/service behavior.
- Fallback behavior.
- Server logs.
- Customer-safe errors.

Customer-facing behavior:

- Explain when live carrier rates are unavailable without exposing provider internals.
- Continue with store-configured fallback rates when safe.
- Never trust client-submitted shipping prices.
- Checkout preview, PaymentIntent, and order creation must use the same server-verified shipping amount.
- Persist selected shipping carrier, service, rate metadata, and cost.
- Show selected shipping method in checkout, order success, customer order detail, and admin order detail.

## Implemented Run 1 Notes

As of the 2026-06-17 product experience pass:

- Account overview removes lifetime spend and shows useful state such as recent order status, email verification, and open order issue count.
- Account overview recent orders are capped at two.
- Profile editing supports name, phone, marketing opt-in, and default shipping address.
- Profile email is fixed account identity; customer-facing email activity and preferred contact method controls were removed.
- Checkout signed-in prefilling now includes default shipping address when available and only fills empty checkout fields.
- Orders use a responsive split view with month grouping and selected-order detail.
- Customer order detail hides internal status history and zero-value promo/donation sections.
- Need Help creates protected order issue cases from order detail pages and shows case status in account order detail.
- Delivered-order customer disputes use a seven-calendar-day server-side eligibility check.

Remaining customer work:

- Full in-account support message center.
- Template-backed optional email send flow for support replies.
- Browser/manual QA across mobile and desktop.

## Approved Calm Essentials Account UI

Implemented on 2026-10-08 after approval of the complete seven-tab preview.

- Protected account routes share one AccountLayout/AccountShell, the existing storefront header/footer, cart drawer and cart storage, search composable, and Better Auth state.
- Keep Overview, Orders, Profile, Pets, Addresses, Order help, Rewards and Wishlist. The 2026-10-25 grouping moves working Wishlist into Shopping; only Rewards remains under Coming later.
- Mobile/tablet uses collapsible account navigation. The storefront header switches to its existing compact layout below the desktop breakpoint to avoid tablet overflow.
- Overview is bounded to two recent orders with order count/latest status/open case count, profile/address summaries, and useful links. No lifetime spend or invented rewards balances.
- Orders keeps the approved month-grouped master/detail layout, search, status filter, initially eight loaded rows, Load more, selected-order accent, and mobile drill-in/back.
- Orders retains search/selection/expanded months/loaded count when switching account tabs. Refresh retrieves the list and selected detail again. Leaving the account layout destroys this cache.
- Load more is display pagination of the existing full-history response, not server-side pagination.
- Profile/Addresses use Summary & Edit dialogs with explicit Save/Cancel, focus trapping/restoration, Escape/backdrop dismissal when idle, and errors that keep the editor open.
- Personal details, marketing/notification preferences, and one default address use existing APIs. Full replacement payloads preserve unedited fields. Address changes affect future checkout prefilling, not existing order snapshots.
- Email stays read-only account identity. Preferred contact controls and email activity are not reintroduced.
- Order help lists real cases, customer-visible messages, and resolutions through existing ownership-protected endpoints. New cases start from an eligible order; categories/deadlines remain server-owned.
- General messaging, customer case replies, multiple addresses, billing address, reviews, reorder, rewards and referrals remain explicitly future-phase work. Wishlist is connected in the 2026-10-25 follow-up; no simulated customer balances/favorites/transactions.
- Order details display server-returned totals only; donation impact is not an extra charge. Internal status history remains hidden.
- Header/sidebar sign-out leaves protected account content and destroys the cached order view.

Browser fixture QA passed at 1440, 1280, 1024, 768, and 390 pixel widths. Real-account persistence, Safari sessions, production deployment, and end-to-end checkout still require manual QA; fixtures do not verify those external systems.

### 2026-10-09 Action Visibility Refinement

Account navigation, links, edit buttons, order/month selections, recent-order links, and dialog controls now have restrained gray surfaces/borders even before hover. Green selected/primary states and focus outlines remain. The approved layout, shared storefront cart/auth/search, customer-safe order details, and Save/Cancel flows are unchanged. Internal record inspectors and Stripe links exist only in admin, never in customer account pages.

### Public Image And Seasonal Content Follow-Up

Uploaded product/campaign/home/footer imagery now uses stable DB-backed public asset paths resolved against the configured API origin, including product snapshots in cart/checkout/customer order details. Customers gain no upload or library access. Existing image URLs/templates remain supported. Homepage seasonal artwork appears beneath readable tinted bands, with explicit section backgrounds taking priority and hero photography independently controlled. Preserve real product/variant prices and customer order ownership; decorative generated Halloween artwork is not product photography or customer proof. See [media library](architecture/media-library.md).

### Receipt First Cost Summary And Giving (2026-10-10)

Checkout keeps bordered item cards and the existing form/payment cards. Use a conventional receipt breakdown: Items subtotal with item count, Discount/code only when applicable, Shipping, Estimated tax, then a separated prominent Order total. Amounts are right-aligned with tabular numerals; no arithmetic plus/equal symbols. Those symbols were briefly trialed at the user's request, then removed after the user preferred a standard commerce receipt layout. The server total is not recomputed in the UI.

Giving is not a billing row. A separate soft-emerald card sits below the entire checkout summary, outside the collapsible bag; the confirmation has the same card outside its financial panel. It emphasizes the contribution amount and actual beneficiary/campaign with concise business-funded/no-extra-cost wording. Checkout contributions are estimated; confirmation/account detail use saved attribution. Only published campaign pages offer **About campaign**, opening the shared campaign renderer in a pop-out without leaving checkout. Public metadata is joined by campaign ID without replacing server amounts or saved beneficiary names. Private/disabled pages have no action. Editor sample actions are inert. Order email HTML/text keep giving after totals too. Zero giving is omitted. This reflects attributed contributions, not proof of beneficiary payout.

## Production Audit Privacy Follow-Up (2026-10-11)

Customer auth remains Better Auth and guest checkout remains available. All native JSON auth responses are stripped of password/session/provider tokens, logout verifies persistent revocation, and password reset revokes old sessions. Typed profile validation rejects unexpected objects, boolean coercion and oversized fields without changing the profile UI.

Checkout finalization/replay now uses the same customer-safe order projection as receipt/account lookups. Internal status history, admin notes/actors and internal support-note events/metadata are not exposed. Existing customer pages do not consume internal timelines, so presentation is preserved. Guest opt-in saved details remain in localStorage and receipt capability in same-tab sessionStorage; neither is a substitute for authenticated ownership. Shared-device privacy and expiring guest-link recovery remain follow-up work.

See [production audit](audits/2026-10-11-production-audit.md) for payment recovery and promotion concurrency blockers. No new UI redesign or provider transaction was performed; actual desktop/mobile/Safari acceptance is pending.

## Approved Storefront Reconciliation (2026-10-15)

The approved polished Home/Campaign/Brand compositions now replace the partial legacy layout. Home has nine visible configured sections; header/footer/account/search/cart are shared. The public catalog consists of eight approved labelled test products; seven legacy records are archived with historical order references retained. Test items remain unavailable in UI and rejected by server checkout, including made-to-order override attempts covered by existing tests. No real customer review or partner claim is implied.

Quick View retains selected size/price while browsing main plus four optional images. Compact product giving strips open the existing campaign pop-out; receipt/checkout badges retain detailed contribution text. Upcoming test items also appear in the approved collection; regular upcoming products remain separate/unpurchasable. Website UI and storefront share product visibility rules rather than hiding out-of-stock/upcoming test records in the editor. Default/loading presentation uses the new brand-led layout, not the old hero/nav. See [checkpoint](work-checkpoints/2026-10-15-approved-ui-reconciliation.md) for release evidence and manual Safari/device/payment acceptance.

### Local Density And Readability Follow-Up

Product cards are wider/shorter without removing content or changing size, price or purchase behavior. Complete product photographs fit within a shallower frame. Section titles and introductions have opaque white reading surfaces; collection controls share that surface rather than sitting on the monogram. Established colors, item shadows and giving accents remain. This local-only iteration still needs owner and real-device visual acceptance; no Railway catalog/content was changed. See [verification and recovery](work-checkpoints/2026-10-15-storefront-density.md).

The owner accepted the product cards but requested a more cohesive title/copy treatment. The next local iteration removes the hard heading bars, aligns section introductions with the items below, standardizes typography and softens the monogram rather than adding nested section cards. The collection toolbar has a white rounded reading surface; existing item shadows/radii remain. Home, Campaign and Brand share this treatment, including their editor renderers. No customer/auth/checkout/business behavior or content was changed; review the [new typography preview](work-checkpoints/2026-10-15-storefront-type-polish.md) before deployment.
