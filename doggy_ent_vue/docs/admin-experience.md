# Admin Experience Requirements

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
