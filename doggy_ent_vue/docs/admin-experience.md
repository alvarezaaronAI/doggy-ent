# Admin Experience Requirements

## Separate Staff Hosting (2026-10-25)

The owner approves a separate protected Vercel admin project, retaining the existing
workspace, signed-in identity, data routing and business tools. Build separation and
the server-only gateway preserve Better Auth authorization; neither a hidden URL nor
CORS is an access gate. See [hosting design](architecture/admin-hosting.md) and its
checkpoint for actual activation status. No second database, domain purchase or
Cloudflare setup is part of this direction.

## Routing And Main Shop Visibility (2026-10-18)

Local development has a global backend-confirmed routing panel across storefront/account/admin, independent of the authenticated admin badge. Frontend dev:railway is only a compatibility alias; server startup selects DB. Website UI main shop product choices are now labelled Featured product order: all eligible published products appear, selected ones first. Additional collections remain selected-only. This prevents newly created products silently disappearing behind the old main-shop ID selection. No product/content record is changed by these presentation rules. See [routing guide](architecture/development-data-routing.md).

## Storybook Portrait Presentation (2026-10-17, Local)

Website UI -> Chase & Evie story adds two named portrait records: selection-button name, personality introduction, story, photograph URL/upload/library and description. Defaults keep older drafts usable. Its real Storybook canvas permits local Chase/Evie selection so both records can be inspected; navigation stays inert and no selection writes data. Explicit Save/Cancel/Publish, revision gates, media authorization and business-data separation remain unchanged. Campaign presentation's surface control now names the contribution panel it changes, not the entire page. Impact First remains shared with public page/pop-out and Catalog campaign canvas. Actual authenticated persistence QA is still manual in this pass; see [checkpoint](work-checkpoints/2026-10-17-storybook-impact-first.md).

Current storefront visual authority is the approved polished three-page mock. See [reconciliation checkpoint](work-checkpoints/2026-10-15-approved-ui-reconciliation.md) for connected rollout and evidence. Website UI owns static presentation through main-workspace page/section selection, shared inert preview and contextual inspector; business navigation remains field-free. Product/campaign business edits and gallery saves stay in their owning domains. Preview and public collection use the same status predicate, including out-of-stock and clearly labelled coming-soon testing products. Hidden legacy blocks are labelled Hidden in editing, never shown as public sections.

## Website UI Integration (2026-10-15)

Website UI groups static Home, Campaign, Brand, shared header/footer, product-card/pop-out, checkout and confirmation presentation controls. Expanded grouped business navigation contains no edit fields; categorized page/section selectors, shared preview and contextual tools are inside the workspace. Existing identity and data-routing indicators remain visible. Explicit draft/save/publish/cancel and conflict protection remain mandatory.

Keep catalog/price/stock CRUD in Products and partner/story/eligibility/rules in Campaigns. Product image management lives in Products, with reusable library/upload fields and a maximum of four optional detail images. Its dedicated optimistic image-only endpoint preserves variant identity and stock. Website UI only changes template labels/colors, not Product/Campaign facts. See [editor architecture](architecture/storefront-editor.md) and the latest handoff for verified persistence/deployment and remaining manual checks.

## Checkout And Manual Email Editors (2026-10-10)

Website now includes Homepage, Checkout and Order confirmation selection, using the established left navigation/shared canvas/right inspector and explicit draft Save/Publish/Cancel. Checkout edits heading/introduction/wallet switches. Soft Essentials confirmation edits appearance/next/help copy, never financial/customer/payment/receipt state. Changed-section markers and selection scrolling reflect the actual draft. Embedded sample checkout never initializes Stripe or submits orders.

Email templates is the thirteenth tool; all previous tabs and signed-in/data-routing controls remain. Five order-message suggestions can be saved as reusable copies, edited with a live fictional sample preview, and archived/reactivated with revision protection. Actual Orders -> Customer email updates requires saved-template preview, server-owned recipient/status/tracking, review confirmation and explicit dry/live action. Default dry run sends nothing even with a configured live provider. No automatic order/tracking/payment notice is sent by Save. Legacy unpreviewed resend returns 410. Essential account/security actions remain available. Bulk marketing, promo audience, support/review email workflows and safe failed-send reconciliation remain future phases; see [manual email architecture](architecture/checkout-and-order-email.md).

The admin should feel like an organized operations workspace, not a crowded developer dashboard.

## Admin Philosophy

- Group tools by operational purpose.
- Use consistent cards, icons, labels, spacing, and color coding.
- Give each major tool a restrained identifying color.
- Minimal gradients are allowed.
- Keep motion subtle and purposeful.
- New tools must be assigned to a clear section.
- Avoid showing every metric on the main dashboard.
- Preserve server-side admin authorization for every admin action.

## Calm Giving Campaign Editor

Implemented 2026-10-09 inside the existing workspace. The left side remains normal admin navigation, signed-in identity, and startup data routing. The middle renders the actual public campaign component at the available width. A right-hand inspector edits the selected section; on narrow screens it moves above the canvas.

- Sections: Introduction & image, Who it supports, The story, Giving & schedule, Eligible treats, Publishing.
- Edit buttons on the page and the inspector section selector address the same draft. There is no separate preview renderer or preview step. Product/cart/external-navigation controls in the canvas cannot perform customer actions.
- Save is explicit. Cancel confirms discarded changes; failed saves keep the draft. A successful write followed by a failed list refresh is reported as a refresh failure, not an invitation to repeat the save.
- Donation rule labels distinguish a fixed contribution once per eligible order from a percentage of eligible product sales. Dates use the device time zone and serialize to ISO; untouched timestamps preserve their precision.
- Publishing is independent of giving. An enabled public page may be Active, Paused, or Ended; Draft/Archived pages stay private. Active status and schedule determine contribution eligibility. Featured campaigns are prioritized in public badges. A renamed campaign keeps its existing slug/link.
- Optional story, partner HTTPS URL, image description, and public-page visibility are persisted campaign fields. Existing image, featured flag, schedule, and product selection are retained. Public publishing requires an introduction/beneficiary and an image description when an image is present. The original page-editor phase used image URLs only; the media follow-up adds upload/library selection for the campaign image. Partner destinations remain links. No provider action was added.
- Public APIs use explicit field allowlists, never the internal campaign mapper. Revenue, customer data, attributed orders, and internal order IDs must stay in protected admin impact tools.

See [admin architecture](architecture/admin.md), [database](architecture/database.md), and [handoff](../PROJECT_HANDOFF.md) for migration/deployment status.

Suggested groups:

- Overview.
- Orders.
- Customers.
- Support.
- Communications.
- Marketing.
- Analytics.
- Operations.
- System.

## Website And Product Visual Editing

Implemented locally 2026-10-09: Website is the twelfth sidebar tool under Store & Marketing. Identity/data routing stay intact. Section list, actual homepage canvas, and focused inspector support explicit draft Save/Cancel/Publish, safe navigation/social links, seasonal backgrounds, hide/order controls, and banner/story/collection/gallery additions. Draft saves do not change the live site; stale revisions reject rather than overwrite another editor. No arbitrary scripts/layout engine or sale calculation is added.

Image follow-up adds URL/upload/library/clear controls beside actual image fields across Website, Products and Campaigns. The searchable, folder-organized library stores optimized public images in the selected DB, not an ephemeral backend disk. Uploads are immediate library writes; page Save/Publish is still explicit. Metadata Save is separate from selection; never upload private/customer files. Use contextual labels and selected artwork/palette plus unsaved markers to distinguish actual changes. Background choices now override original section CSS and stay visible under legible reading tints. Hero uses its separate photograph; do not show ineffective section-background controls there. See [media library](architecture/media-library.md).

Products now shows the actual active/draft or upcoming card beside focused existing fields. Edit handles select the same draft; preview sizes do not change a shopper's bag. All original product fields and explicit API Save/Cancel remain. Product Save persists to the selected database immediately, independently of website publication.

See [storefront visual editing](architecture/storefront-editor.md) for controls, ownership, local-only migration and Railway approval requirements. Auth, checkout, other admin tools, and communications policy are unchanged.

## Main Admin Dashboard

Show only high-priority, actionable information such as:

- Customer count.
- Revenue today.
- Revenue this month.
- Revenue this quarter.
- Open order issues.
- Order issues requiring action.
- Open internal issues.
- Severe internal issues.
- Orders requiring fulfillment or review.
- Failed email/provider actions when relevant.

Remove low-value clutter and vanity data. Provide clear links into each affected tool.

## Order Issues Tool

Create a dedicated Order Issues admin tool when support work is in scope.

Requirements:

- Search by case number, order reference, customer, email, and status.
- Filter by category, priority, status, age, and assigned state.
- Show linked customer and order context.
- Open the full order without losing issue context.
- Show issue history.
- Support internal notes and customer-visible replies separately.
- Support status updates.
- Support assignment if the admin-user model allows it.
- Support resolution summary.
- Support future compensation actions.
- Allow optional email communication, but prefer in-account replies.
- Show whether a reply is in-account only or also emailed.
- Do not send email automatically merely because the case status changed.
- Allow admin to save without sending.
- Allow admin to deliberately send a selected response through an approved template.
- Preserve complete audit history.

## Internal Issues Tool

Create a separate Internal Issues admin tool for operational failures. This is not customer support.

Capture internal failures such as:

- Server exceptions.
- API failures.
- Checkout failures.
- Stripe failures.
- Shippo failures.
- Resend failures.
- Database failures.
- Route/controller/service/repository errors.
- Unexpected client/server response mismatches.
- Repeated validation failures when operationally useful.

Each issue should have:

- Case number.
- Severity.
- Category.
- Source.
- Safe summary.
- Safe technical details.
- Affected route.
- Affected customer when known.
- Affected order when known.
- Occurrence count.
- First seen.
- Last seen.
- Status.
- Review notes.
- Resolution notes.
- Resolved timestamp.

Suggested statuses:

- `NEW`
- `REVIEWING`
- `IN_PROGRESS`
- `MONITORING`
- `RESOLVED`
- `CLOSED`

Rules:

- Do not expose secrets or sensitive values.
- Do not expose raw stack traces to customers.
- Group or deduplicate repeated identical issues where practical.
- Provide customer-safe error messages on the affected page.
- Customer-visible errors should explain the likely next step.
- Internal technical context should remain in the admin tool and logs.
- Logging must not replace proper error handling.

## Email Template Center

Rename the broad notification activity concept into an Email Template Center when this tool is implemented. Preserve delivery visibility in a cleaner structure.

The tool should support:

- Create, edit, duplicate, preview, archive, delete when safe, and restore archived templates.
- Manage subject, preview text if supported, body, variables/placeholders, category, and active/inactive state.
- Show usage locations and last updated.
- Show delivery history separately.

Template categories should include:

- Welcome.
- Email Verification.
- Password Reset.
- Order Confirmation if retained.
- Order Update.
- Processing.
- Shipped.
- Tracking Added.
- Delivered.
- Delay.
- Cancellation.
- Refund.
- Replacement.
- Apology.
- Promo Code.
- Customer Support Reply.
- Order Issue Resolution.
- Review Request.
- General Announcement.

Do not seed excessive or duplicate templates.

## Email Activity And Delivery History

Separate:

- Templates.
- Global/campaign sends.
- Customer-specific sends.
- Transactional sends.
- Failures.
- Delivery attempts.

Allow filtering by recipient, customer, order, promo, event type, template, status, and date. Do not expose provider secrets or sensitive tokens.

## Promo Email Tool

In the promo dashboard, add an email action under the relevant analytics or actions area when marketing email work is in scope.

Requirements:

- Open a card or modal.
- Choose an approved promo template.
- Preview final subject and body.
- Show the target audience before sending.
- If promo is global, target only approved global audience rules.
- If promo is assigned to a specific email/customer, send only to that recipient.
- Require explicit confirmation before bulk/global send.
- Show estimated recipient count before send.
- Add safeguards against duplicate sends.
- Respect email limits and provider failures.
- Support draft/save without sending.
- Log delivery attempts.
- Keep marketing consent rules separate from transactional email.

## Admin Order Updates

Updating order status, tracking, or fulfillment must not automatically email the customer.

The workflow should clearly separate:

1. Save order changes.
2. Optionally send customer update.

Requirements:

- Admin may save without sending.
- Admin may click Send update.
- The system suggests an appropriate template based on the saved change.
- Admin can preview and edit allowed content.
- Use stored order/customer data.
- Do not allow arbitrary spam.
- Show whether an email was sent.
- Show the in-account customer-visible update.
- Any saved order change should be reflected on the customer order page when appropriate.
- Tracking may be entered manually when not returned by Shippo.
- Tracking refresh should use Shippo when configured.
- Saving tracking should not automatically send email.
- Sending tracking email requires explicit admin action.
- Preserve audit history for the change and the communication.

## Implemented Run 1 Notes

As of the 2026-06-17 product experience pass:

- `/admin/order-issues` is implemented as a protected admin tool.
- Order Issues supports search/filter, status changes, priority changes, resolution summary, internal notes, and customer-visible account replies.
- Customer-visible replies and internal notes are persisted separately through `CustomerSupportMessage.visibility`.
- Saving order issue changes does not send email.
- Email follow-up can be marked as requested, but actual template preview/send remains future work.
- `/admin/internal-issues` is implemented as a protected admin tool for sanitized operational issue records.
- Unexpected Express 500s are recorded as internal issues with a fingerprint and safe route/source/summary context.
- The main admin dashboard links to Order Issues and Internal Issues and shows issue counts.

Remaining admin work:

- Admin navigation reorganization is now implemented; see the Calm Workspace section below.
- Email Template Center and template CRUD.
- Explicit Send customer update flows for order changes, support replies, tracking, and promo emails.
- Provider-specific internal issue capture for Shippo, Resend, checkout, payment, and database failures.

## Implemented Calm Workspace

The approved Calm Workspace design is implemented as of 2026-10-08. This is a connected UI pass, not an auth migration or server rewrite.

- One protected shared admin layout owns the header, grouped sidebar, signed-in identity, read-only data routing, and responsive navigation. All eleven existing tools remain accessible.
- Overview shows a few actionable server-derived metrics, attention links, and three recent orders. Failed data sources are labeled unavailable, not replaced with invented zeroes.
- Products, Promos, and Campaigns open on their searchable libraries. Create/edit opens a focused editor with explicit Save/Cancel.
- Product content is separated into Details, Variants & Stock, and Storefront Content. Publishing settings remain alongside the editor; inventory alerts respect inventory-limited mode and stored variant thresholds.
- Promo testing requires a customer email, normalizes it, and clears/discards results after input changes. Analytics and campaign impact open as in-page record panels with real order links.
- Orders uses a status-filterable table including refunded orders. Detail retains server totals, customer/shipping snapshots, explicit status Save/Cancel/history, tracking controls, and separate manual email controls.
- Customers retains account status, verification, linked/verified-email guest orders, lifetime spend, and protected account actions. Security-email requests require deliberate confirmation and never imply delivery success.
- Shipments and Notifications retain provider/history filters and now expose load errors. Notification template editing remains a clearly labeled future-phase section.
- Reports labels aggregate order value accurately: the current API includes pending and other stored orders. It is not settled-payment revenue. Donation attribution is not a payout ledger.
- Order Issues separates customer-visible account replies from internal notes; saves/replies do not automatically send email. Internal Issues shows safe context and event history. Both use staged saves, cancellation, busy/error states, and retained drafts after failed writes.
- Order templates/manual previewed sends are now connected; bulk promo email, payment-reconciled/date-range reports, customer notes/activity/reviews/loyalty remain unconnected and explicitly labeled.

Live Safari, local/Railway DB-mode, deployed cookie, and real provider QA still require the controlled manual checklist in [verification-and-qa.md](verification-and-qa.md). See [PROJECT_HANDOFF.md](../PROJECT_HANDOFF.md) for exact changed files and check results.

## 2026-10-09 Internal Investigation Refinement

- Actionable links, navigation, buttons, records, fields, and expandable sections have gray translucent surfaces/stronger borders. Static statistics/future tools are not disguised as buttons.
- Orders restores the existing order-value tiers: Standard below 100, Gold from 100, Platinum from 200, Diamond from 350, Gem from 500 (existing USD totals). Colored row accents, amount text, and labeled badges provide more than a color-only cue. These are order-value categories, not persisted customer loyalty tiers.
- Order detail keeps normal fulfillment controls and adds a read-only sidebar inspector for every Order scalar column, item snapshots/foreign IDs/timestamps, promo/campaign usage, status history, safe shipments/events, recent email records, and support case records.
- Customer rows show full email and full customer ID for same-name disambiguation, support ID search, and open from the whole row. The real anchor remains keyboard accessible and supports normal link behavior; selecting text does not navigate.
- Customer detail shows User/profile/default-address/preferences/account-event/support/review/loyalty record data when stored. Empty foundations remain empty; viewing ledger/review rows does not implement reward or review management.
- Never expose credentials, auth accounts, session/reset/verification tokens, raw provider payloads, arbitrary event metadata, or email action URLs. Inspection is allowlisted server-side and admin-only; it is not a generic DB browser or DB editing tool.
- Stripe PaymentIntent IDs are operational identifiers, not API keys. Each order's valid stored `pi_` ID is appended to a validated HTTPS Stripe payments dashboard base. Admin can save/cancel that non-secret base under Stripe dashboard settings, persisted only in the current browser. Optional build-time default: `VITE_STRIPE_DASHBOARD_PAYMENTS_URL`. No automatic account or test/live inference; see [admin architecture](architecture/admin.md).
- Explicit order saves refresh the protected full detail. If refresh fails after a successful write, retain the saved result, remove the stale internal snapshot, and explain the refresh failure without inviting a duplicate write.

## Approved Better Auth Admin Migration (2026-10-11)

The existing dashboard, thirteen tabs, signed-in identity, data routing, editor behavior and admin CRUD remain. Admin sessions now use separate Better Auth configuration and persisted ADMIN/ACTIVE users, behind the compatible /api/auth endpoints. No public admin signup or bearer fallback. Credentials must be deliberately provisioned; environment hashes no longer act as live login authority. Follow [auth rollout](architecture/auth-roadmap.md).

The target badge initially checks the backend and reports TARGET UNVERIFIED on failure. Production reports DEPLOYED DATA TARGET. LOCAL startup refuses remote DB hosts; Railway DB mode requires its remote override. Never write based only on a frontend mode label.

New order/tracking/customer lifecycle/support history records use the real authenticated admin ID; historical ADMIN_ENV remains. Customer lifecycle tools cannot target ADMIN records. Status updates compare the current row and return 409 on concurrent change; tracking cannot regress cancelled/refunded/delivered orders. REFUNDED still does not execute a Stripe refund. Protected writes emit safe structured actor/route/status logs without bodies or credentials. MFA and finer permissions remain future work.

The audit provisioned only the confirmed local DB. Railway provisioning/deployment and browser login acceptance were not performed. See [audit report](audits/2026-10-11-production-audit.md).
