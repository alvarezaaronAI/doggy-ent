# UX and UI Standards

Use these standards for storefront, account, checkout, and admin UI work. Preserve the current brand feel and existing components unless the task requires focused changes.

## Tailwind-First Styling

- Tailwind should be the main styling system across the application.
- Prefer reusable Tailwind patterns, shared components, tokens, utilities, and consistent class conventions.
- Reuse existing design tokens and components before creating new ones.
- Avoid large amounts of ad hoc CSS.
- Keep custom CSS limited to cases Tailwind cannot express cleanly.
- Do not introduce another major styling framework.
- Do not hardcode an entirely new design system without first auditing the current one.

## Visual System

Keep the interface calm, premium, and practical.

- Typography: use clear hierarchy, compact headings inside tools, and hero-scale type only for true hero contexts.
- Spacing: use consistent section, card, and form spacing; avoid cramped controls and avoid empty decorative space.
- Cards: use cards for grouped tools, repeated items, and modals; avoid cards nested inside cards.
- Borders: use subtle borders to separate operational areas and form groups.
- Shadows: keep shadows restrained and functional.
- Radius: keep card radius moderate; avoid bubbly controls unless already established locally.
- Buttons: use clear primary, secondary, destructive, and disabled states.
- Inputs: provide labels, help text when needed, validation messages, focus states, and mobile-friendly sizing.
- Badges: use for concise status, target, role, provider, or fulfillment state.
- Icons: use familiar icons for actions where available; do not replace obvious icons with verbose labels.
- Tables: use for dense admin comparison only; support responsive overflow and readable row actions.
- Drawers and modals: use for focused decisions, quick forms, and previews; preserve keyboard and focus behavior.
- Accordions: use for older history, optional detail, and progressive disclosure.
- Empty states: explain what is missing and provide the next useful action.
- Skeletons: use when data is loading and layout should remain stable.
- Alerts: distinguish error, warning, info, and success states clearly.
- Toasts: use sparingly for transient confirmations; durable state should live in the page.
- Responsive layouts: design mobile, tablet, and desktop behavior deliberately.
- Admin colors: use restrained identifying colors by operational group.
- Gradients: keep minimal and purposeful.

## Calm Workspace Action Visibility

As of 2026-10-09, customer account and admin workspaces use subtle gray translucent backgrounds and defined borders for actionable links, buttons, sidebar entries, editable fields, record choices, and disclosure summaries. Preserve green primary/selected states, keyboard focus, disabled states, and readable text. Do not apply button-like surfaces to read-only metrics or future placeholders; visual affordances must match actual interactions. Scope these styles to the account/admin workspace rather than changing storefront/checkout globally.

## Calm Giving Storefront And Campaign Canvas

As of 2026-10-09, storefront sections use full-width bands rather than stacked floating section cards. Preserve the original blue/yellow/brown/oat palette, white/neutral reading surfaces, gray secondary controls, and subtle emerald giving accents. Product media and size/action controls have stable dimensions; long text wraps without overlap. No viewport-scaled typography or negative tracking was added.

The immutable `--storefront-brand-*` aliases in `client/src/assets/styles/main.css` preserve the storefront palette inside the admin editor, where ordinary `--brand-*` variables otherwise inherit admin overrides. `CampaignPageContent.vue` and its scoped styles are the same renderer for public pages and the editable canvas; do not create a second visual implementation. Editor handles appear only in edit mode, and product actions are inert there. Existing Tailwind utilities remain in use; no styling framework was added.

## Homepage Reference-Style Follow-Up

Keep section boundaries recognizable: constrained content inside alternating full-width bands, clear headings, and restrained blue rules. Homepage-only rules live in `home.css`; they must not recolor the campaign canvas. Restore richer individual upcoming product cards without making the whole card a nested button. The Coming Soon notice is a reading band within the product item, not another floating card. Only image/Preview actions open Quick View; unavailable notifications explain the future phase.

`StorefrontHero.vue` provides one content-safe photo/heading/action layout for home and the story page. The approved baseline replaces the earlier frosted variant with unframed white text over photography and a neutral gray tint for readability. Avoid fixed/max heights plus hidden overflow that crop hero controls. Keep brown/yellow/blue accents and actual product/anchor actions; do not restore unsupported product/shipping promises. Retain a hint of following content at standard desktop/mobile/short-screen viewports.

Use restrained shadows on individual product items and media, not on section containers. Next Drops uses the full content width rather than a narrow sidebar layout. The right-side cart uses static, separated item rows instead of nested floating/lifting cards. Controls use Lucide icons, visible focus, and 44 px touch targets. Drawer motion respects reduced-motion preferences; its immutable storefront color aliases also work when opened from account pages.

Footer restores warm oat, a yellow/blue brand mark, centered wrapping navigation/social controls on mobile, and a separated copyright area. It uses immutable storefront colors even in account pages. Missing social destinations are disabled placeholders rather than `href="#"` links.

## Animation And Motion

Use subtle motion where it improves feedback or comprehension:

- Page and section entrance.
- Card hover.
- Button press.
- Loading skeletons.
- Drawers.
- Modals.
- Accordions.
- Expand/collapse lists.
- Success feedback.
- Error feedback.
- Status changes.
- List updates.
- Route transitions where practical.

Rules:

- Motion must be purposeful.
- Avoid excessive bouncing, spinning, zooming, or decorative animation.
- Respect `prefers-reduced-motion`.
- Do not delay important actions for animation.
- Keep animations fast and subtle.
- Use animation to show state, hierarchy, continuity, and confirmation.
- Avoid adding large animation libraries unless clearly necessary.
- Prefer Tailwind transitions and existing lightweight utilities.

## Implementation Completeness

Every new page or tool should include:

- Mobile layout.
- Tablet layout where needed.
- Desktop layout.
- Loading state.
- Empty state.
- Error state.
- Success state.
- Disabled state.
- Form validation.
- Keyboard navigation.
- Focus states.
- Accessible labels.
- Helpful microcopy.
- Responsive overflow handling.
- Relevant animation.
- Real data integration or clearly labeled mock/dry-run behavior.

Do not mark a UI feature complete if it has only backend plumbing or only a static mock.
