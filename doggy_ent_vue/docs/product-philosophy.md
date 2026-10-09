# Product Philosophy

Doggy Ent should feel modern, premium, trustworthy, clear, and alive. Codex must think like both a product designer and an engineer: every implementation should solve the real user workflow, not merely expose database fields or backend plumbing.

## Product Principles

- Every page must have a clear primary user goal.
- Build user experiences, not database viewers.
- Customer and admin experiences should be understandable without separate documentation.
- Never expose raw database structures, internal IDs, developer terminology, stack traces, provider jargon, or irrelevant operational data to customers.
- Prefer progressive disclosure: show the right information at the right time, then reveal detail when useful.
- Remove unnecessary information, clicks, decisions, and typing.
- Prefer useful context and clear next steps over vanity metrics.
- Empty states, loading states, error states, success states, disabled states, and edge cases are part of the feature.
- New pages and tools must be designed end-to-end, not as isolated backend work.
- Preserve accessibility, keyboard navigation, responsive behavior, reduced-motion support, and clear focus states.
- Avoid flashy or excessive UI.
- Prefer calm polish similar to modern premium commerce and productivity products.
- Every new feature must include appropriate UI, API, server, database, security, validation, loading, empty, error, responsive, animation, documentation, and QA work.

## Experience Standard

Before adding a field, panel, route, model, endpoint, or admin control, decide whether it helps the customer or operator complete a real job.

Customer-facing information should be:

- Friendly.
- Actionable.
- Minimal.
- Safe.
- Relevant to the customer’s next step.

Admin-facing information should be:

- Operational.
- Scan-friendly.
- Prioritized by urgency.
- Clear about what changed and what action is available.
- Safe for production operations.

## Feature Design Checklist

For every feature or meaningful UI change, ask:

- Does this reduce clicks?
- Does this reduce typing?
- Can the system infer or prefill this?
- Is this information useful to the customer or admin?
- Is there a clearer hierarchy?
- Can this be hidden until needed?
- Does it work on mobile?
- Does it have loading, empty, success, error, and disabled states?
- Does it need subtle motion?
- Is it accessible?
- Is it connected end-to-end?

If the answer is unclear, inspect the current flow and make the smallest improvement that clarifies the user goal without creating a broad redesign.
