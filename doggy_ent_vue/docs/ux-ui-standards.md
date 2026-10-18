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

### Storybook And Impact First Approval (2026-10-17)

The owner's subsequent approval extends Modern Boutique to the full Brand and Campaign pages, superseding the earlier instruction to leave those two pages unchanged. Storybook uses photograph/story splits, local portrait selection, horizontal numbered chapters and a pale-yellow icon-led values band. Impact First places the emerald configured-contribution band immediately after its hero, then a photo/story split, testing programme photo items, pale-yellow partner rationale and real eligible ProductCards. Keep monogram, existing palette, 8 px item corners and restrained item shadows; no enclosing nested section cards. Preserve accepted Home, shared shell and commerce behavior. Details and remaining acceptance: [checkpoint](work-checkpoints/2026-10-17-storybook-impact-first.md).

### Selected Home Composition (2026-10-16)

The owner selected Modern Boutique only for Made With Care, Ingredient Promise and the homepage pair teaser. Use a photograph beside numbered care steps, a pale brand-yellow promise band with concise icon-led information, and a full-width photograph/story teaser. Keep managed copy, real product facts, illustrative labels and safe existing actions. Use 32 px/700 headings (28 px narrow) only in these selected sections; do not restyle other section headings, shared header/footer, product cards or Campaign/Brand pages. The ingredient/brand outer blocks are no longer half-width peers.

Review cards keep their detailed content but become two wide cards/one narrow card in a native scroll-snap track, with 44 px icon controls. Rotate slowly only if entries overflow and the section is in view. Hover, focus, hidden tabs, reduced motion and editor mode stop autoplay; manual navigation/dragging pauses until explicit restart. Keep explicit sample labels and the future-review notice outside rotation. Existing item corners/shadows, palette and monogram remain unchanged. See the [local acceptance checkpoint](work-checkpoints/2026-10-16-boutique-home-sections.md); older dated composition notes below are historical where these three sections differ.

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

The approved 2026-10-15 integration retains these brand fundamentals while adding compact bounded product grids, a five-view product pop-out, a photo-led care section, clearly fictional compact review examples, distinct Brand/Campaign compositions, subtle Labrador monogram, and a smaller shared footer. Website UI uses categorized page/section selectors in the main workspace rather than a long duplicated button strip. Announcements have manual navigation/Pause and disable automatic rotation for hidden/reduced-motion states. These are shared renderers, not independent editor mockups. Full narrow-device/Safari/accessibility acceptance is still manual; see [QA](verification-and-qa.md).

Keep section boundaries recognizable: constrained content inside alternating full-width bands, clear headings, and restrained blue rules. Homepage-only rules live in `home.css`; they must not recolor the campaign canvas. Restore richer individual upcoming product cards without making the whole card a nested button. The Coming Soon notice is a reading band within the product item, not another floating card. Only image/Preview actions open Quick View; unavailable notifications explain the future phase.

`StorefrontHero.vue` provides one content-safe photo/heading/action layout for home and the story page. The approved baseline replaces the earlier frosted variant with unframed white text over photography and a neutral gray tint for readability. Avoid fixed/max heights plus hidden overflow that crop hero controls. Keep brown/yellow/blue accents and actual product/anchor actions; do not restore unsupported product/shipping promises. Retain a hint of following content at standard desktop/mobile/short-screen viewports.

Use restrained shadows on individual product items and media, not on section containers. Next Drops uses the full content width rather than a narrow sidebar layout. The right-side cart uses static, separated item rows instead of nested floating/lifting cards. Controls use Lucide icons, visible focus, and 44 px touch targets. Drawer motion respects reduced-motion preferences; its immutable storefront color aliases also work when opened from account pages.

Footer restores warm oat, a yellow/blue brand mark, centered wrapping navigation/social controls on mobile, and a separated copyright area. It uses immutable storefront colors even in account pages. Missing social destinations are disabled placeholders rather than `href="#"` links.

Checkout cost rows remain a conventional receipt. Giving uses a separate emerald impact card below the financial summary, not another charge. The secure action uses immutable storefront yellow/brown, clear disabled/processing states and the same inert renderer in admin. Shipping review uses a postal-address block with Edit, not a verification badge or additional nested floating card.

## Animation And Motion

### Authoritative Polished Composition (2026-10-15)

The full approved polished mock supersedes the earlier flat-band and partial-integration layouts above. Public Home uses a short photo hero, framed featured item, eight compact curated testing products, giving photo/copy, compact Next Drops, photo-led care with individual step items, seven labelled fictional reviews and paired ingredient/brand closing columns. Legacy promise/help sections are hidden, not added back on loading. Campaign uses partner/programmes/why plus giving sidebar; Brand uses origin/pair/journey/moments/values/closing. Keep the shared compact header/footer, quiet sign-in/bag controls and real right-side cart drawer. Search remains functional through its compact toggle/mobile menu. Preserve the established six brand/giving colors, subtle monogram and restrained item shadows.

Business records, selected variants and permanent test purchase protection take precedence over a mock's sample price/actions. Never copy a disconnected mock's disabled authentication, fake successful purchase or fabricated real charity/review claims. The [reconciliation checkpoint](work-checkpoints/2026-10-15-approved-ui-reconciliation.md) tracks proof and remaining acceptance.

### Density And Heading Readability Follow-Up

The local 2026-10-15 follow-up gives product cards a responsive 300 px minimum where space allows, capped by the configured maximum column count. Photos use a 3:2 contain frame so packaging is not cropped. Tighten gaps instead of hiding descriptions, tags, sizes, prices or actions. Keep the existing border, shadow, yellow selected size and emerald campaign surface. The owner accepted these card proportions. See the [density checkpoint](work-checkpoints/2026-10-15-storefront-density.md).

The subsequent local typography iteration replaces the trial blue-edged white heading bars with unframed section introductions aligned to their content. Shared `storefront.css` owns 26 px/650-weight section titles, 16 px introductory copy with a bounded reading measure, consistent eyebrow spacing and the softer monogram. Story items use 18 px titles/14 px copy; compact metadata stays distinct. Omit empty eyebrows. Keep existing 8 px item corners and restrained shadows; collection filters use a separate 8 px rounded functional toolbar. Product card dimensions, hero, header/footer, account/checkout and operational admin layouts are unchanged. Home/Campaign/Brand and Website UI reuse the same renderers. This is a local visual proposal, not a live release; see the [typography checkpoint](work-checkpoints/2026-10-15-storefront-type-polish.md).

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
