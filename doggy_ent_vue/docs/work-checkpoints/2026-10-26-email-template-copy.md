# Email Template Copy Repair

## Scope And Starting Point

Owner requests fixing repeated editable-copy creation, not sending email. Started
from clean synchronized dev-main19bb592 on fix/email-template-duplicates after a
fresh fetch/preflight. mainb1fc199 is the current live source. The previous live
diagnostic copy was archived; the owner's saved payment template was preserved.

Confirmed: every starter POST currently creates a new row. Save then awaits a full
list reload; a reload failure can leave the starter selected after a successful
write, inviting a duplicate retry. The Save button becoming disabled when clean is
intentional, not a demonstrated full-page freeze.

## Plan And Guardrails

- Make starter adoption reuse an existing saved template; deterministic primary-key
  reservation prevents concurrent/retried creation without a schema migration.
- Preserve existing copies, custom wording, revisions and archived state. Do not
  delete or merge rows. Reuse a legacy same-event template without overwriting it.
- Separate saved templates, starters and archives; show Open saved template when
  available and distinguish clean Saved state from disabled/error state.
- Apply a successful save response immediately. A list-refresh failure must not
  turn success into a second create or lose the saved identity.
- Test repeat/concurrent saves, legacy reuse, conflict/error recovery and editor
  transitions. No provider send, receipt-setting change, credential change or
  shared migration. Sending remains off.
- Follow managed task/integration/main publication only after checks/review and
  read-only startup/migration preflight. Record actual deployment evidence here.

## Current Status

Implementation complete locally. Files: email template repository/service,
admin composable/view, receipt-settings wording, three template-copy test files,
receipt-settings test and focused docs. No schema/dependency/provider change.

Commands: final client npm test passes364 (11/347/6), server npm test passes507
(28/473/6), including canonical-origin create/update regression. Focused prior
server23/client10 pass. Client npm run build2354modules,
VITE_STOREFRONT_ORIGIN public shop npm run build:admin2257modules and server
npm run build/Prisma6.16.2 pass. Independent review found stale legacy starter
links after changing a saved template's event. Fixed by deriving reserved origin
on the server, reconciling all links locally after save, and two no-refetch
regressions. Independent scoped re-review reports no remaining blockers; its
nonblocking canonical-origin service coverage gap is now covered explicitly.

Scope scan passes15paths/7JS syntax/6Markdown/3added local links/balanced fences,
zero configured-secret/pattern matches and git diff --check. VercelCLI read-only
confirms same team, main, shop root/client Node24 and admin root/admin Node22 with
All Deployments protection; Railway same repo/main/root/server, no staged changes.
No new env/dependency/version/schema or startup side effects.

Private copy-fixture.mjs uses an asserted loopback-only disposable database,
all27migrations, ten concurrent actual service requests/one row/one winner,
renamed content/revision persistence, archived no-restore and legacy same-event
reuse; no settings/delivery rows/provider HTTP. Temporary database removed.
Memory-only browser fixture5192 uses the actual Vue editor/renderer: Add creates
one copy, Already added opens it, edits/save/reload preserve one copy and new
wording. No shared database/provider involved. Fixture process21879 is task-owned;
stop it before final. Existing user servers are not task-owned.

Read-only Railway verify:27matching/nonepending, settings0/automatic deliveries0.
Old migration postflight business-record projection no longer matches because
legitimate template saves/diagnostic archive occurred since that snapshot; do
not claim unchanged historical counts or rerun migrations to address it. No
repair shared-data migration/cleanup is authorized. Existing hosting identity:
main auto-deploys the same Vercel shop/admin and RailwayAPI; admin All Deployments
protection remains, Railway no staged patch/current SUCCESS sourceb1fc199.

Next: independent scoped review, final tests/builds/scoped secret/docs checks,
guarded task PR/dev-main/release PR/main, exact-source hosting and live read-only
Already added/edit/Cancel checks. Existing templates must not be deleted or
overwritten. No real mail, provider setup, payment or receipt activation.

## Final Publication And Live Evidence

Earlier pending steps above are chronological. Completed source:

- Task3ae81dfa9d077abb647cceeac8576c18cc9e8b5c, PR55 -> dev-main
  d53ae719387c2e8c8e7d4ba503c7b34b8ca77c09. Quality40306544615 client/server,
  every step and both Vercel statuses pass; exact head/base/scope/reviews guarded.
- ReleasePR56 -> main2066f6b45287722bac0e40b233e38b130531643e.
  Quality40306803092 client/server/every step and both Vercel statuses pass;
  fresh clean16file scope (repair plus prior receipt evidence), no review threads.
- Shop dpl_EvG6vEoym8t5zGJnJp6EJj6TPJ26 READY and admin
  dpl_4h7A6qhBLGnVm35G85zgBBXJjGPn READY. Stable alias lookups confirm exact2066,
  not merely a successful preview. Staff protection remains All Deployments.
- Railway7dae0e36-f7c9-414e-aeb1-0b28f6cdbf9d SUCCESS/exact2066.
  Runtime17entries:27migrations/no pending/zero error patterns.
- Public health/products/campaigns200/exact-origin CORS, anonymous customer401,
  direct admin403 and public manifest0admin modules pass.
- Existing live staff session: new groups/Already added, repeated reopening same
  saved payment copy, temporary heading edit enables Save changes, Cancel restores
  original, no captured browser errors. No new saved template/settings/provider send.
  Private screenshot template-copy-live-fixed.png shows final actual UI.

## Owner-Requested Duplicate Cleanup

During rollout the owner explicitly adds: delete duplicates. Applied only a
recoverable archive, not hard deletes. Fresh private full backup2806546bytes,
full pg_restore decode/checksum/0600 and read-only inventory: six active templates,
four exact duplicates of payment confirmation. All six authorable fields must
match; selected receipt/reserved copy protected, otherwise oldest original kept.

Guarded SERIALIZABLE transaction locks/rechecks templates/settings, archives only
those four rows with revision increments, preserves their content and verifies all
other template rows/receipt settings/delivery count unchanged. No row deletion,
schema/credential/provider change. Two active templates remain: original payment
confirmation and preparation. Final UI Archived5 includes four duplicates plus
the earlier diagnostic copy. Original/customer messages remain recoverable.

Sending stays OFF, settings0/automatic deliveries0; no email/payment/shipment.
Fixture5192/tab10 closed and process21879 completed exit143; user servers untouched.
Final evidence is documentation-only on docs/email-template-copy-evidence for
integration, not a redundant production rollout. No source work remains; future
sender/domain/approved inbox and prelaunch device/payment gates remain separate.
