# Customer Payment Configuration Handshake

Date: 2026-10-26. Bounded customer worker, direct edits in the assigned workspace.
Parent owns backend/default-off/live-lock policy and shared handoff documentation;
the admin worker owns admin changes. Prior edits and uncommitted tests are retained.

## Completed

- Pure publishable-key format/mode detection accepts alphanumeric `pk_test_` and
  `pk_live_` values only. No trimming or alternate environment mode is trusted.
- Public configuration GET uses the existing credentialed API transport and
  `cache: no-store`. It validates success, known mode, Boolean enabled and string
  message, and returns only an allowlisted projection with generic customer copy.
- Missing public key keeps the existing null/no-network loader behavior. Invalid
  keys fail locally without API/SDK calls or diagnostic/key logging.
- SDK import/load follows a valid configuration with `enabled === true` and a
  matching mode. Concurrent mounts share one promise. Configuration/SDK failures
  and null SDK results clear the promise so a later mount can retry.
- Intent POST derives and adds `paymentMode` automatically, never the key or a
  caller-supplied mode. It remains server-authoritative despite cached mount
  readiness. API/SDK errors expose only generic customer wording.
- No card/wallet component, auth/cart/draft state, payment confirmation or order
  finalization change. Existing inert-preview and card/wallet regressions pass.

## Owned Paths

- `client/src/domains/payments/services/payment.service.js`
- `client/src/domains/payments/services/stripe.js`
- `client/src/domains/payments/services/publishableKeyMode.js` (new)
- `client/tests/tier2/checkout/payment-service.test.js` (new, 52 cases)
- `client/tests/tier2/storefront/stripe-loading.test.js` (23 cases, formerly 3)
- This checkpoint only; shared project documents are left to the parent integrator.

## Verification

All executions use a clean `env -i` process, fixture values, existing dependencies,
and programmatic Vite/Vitest configuration with `configFile: false, envDir: false`.
No normal Vite config or environment file is loaded. Test forks import the existing
`scripts/payment-test-network-guard.mjs`; API fetch and Stripe SDK are mocked.

1. Programmatic `startVitest` for payment-service/stripe-loading: 2 files/75 pass.
2. Programmatic `startVitest` for tier1 checkout/promos, tier2 checkout and
   stripe-loading: 10 files/142 pass, including prior card/wallet/coordinator tests.
3. After strengthening exact error-message assertions, programmatic `startVitest`
   for `tests/tier1`, `tests/tier2`, `tests/tier3`: 64 files/551 pass, exit 0.
   Unrelated Vue fixture warnings appear in approved-design, website-editor,
   product-galleries and receipt-settings tests; none fail.
4. Programmatic Vite `build` with existing Vue/Tailwind/application-surface plugins,
   aliases, a synthetic public key and `write: false`: combined 2,358 modules and
   storefront 2,213 modules pass. Bundles are in memory, not deploy artifacts.
5. Source inspection confirms the parent's new public GET projection and required
   POST mode contract align. No server module was executed by this worker.
6. `node --check` passes all five owned JS files. ASCII, trailing-whitespace,
   final-newline and Markdown-fence checks pass all six owned paths; the checkpoint
   contains no Markdown links requiring resolution.

An initial clean-process invocation could not locate Node on a guessed PATH;
rerunning with the installed Node v22.15.0 binary path succeeded. The first focused
run also supplied deprecated `envFile: false`; later runs use `envDir: false` only.

## Parent Integration And Remaining Gates

1. Change the runner's synthetic public key from `pk_test_offline_fixture` to
   `pk_test_offlineFixture` (the former suffix is intentionally rejected), if it
   has not already been updated. This worker did not edit the shared runner.
2. Link this checkpoint from the parent-owned `PROJECT_HANDOFF.md` and reconcile
   related architecture/QA documentation with backend and admin changes.
3. Review the combined concurrent diff and rerun the integrated offline runner.
   This customer slice is ready for scoped review, not publication authorization.
4. Real Stripe account/key matching, enabled sandbox/device/card/wallet acceptance,
   durable recovery and signed webhooks remain separate gates. The parent's hard
   live lock/default-off behavior is not bypassed by this handshake.

No environment-file read/write, DB operation, Git mutation, provider request,
email/account/payment creation, development server or deployment was performed.
No browser/manual payment acceptance is claimed.
