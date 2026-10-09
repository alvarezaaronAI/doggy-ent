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
