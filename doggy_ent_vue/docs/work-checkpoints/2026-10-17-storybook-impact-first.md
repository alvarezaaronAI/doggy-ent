# Storybook And Impact First Integration

## Scope And Safety

The owner approved the Storybook Brand page and Impact First Campaign page from the two disconnected boutique comparisons. Integrate those compositions into the existing shared Vue renderers. Keep the accepted Home layouts, header/footer, actual product cards, cart, auth, checkout, campaign rules and test-product purchase protection unchanged.

Local implementation and verification only. No deployment, database publication/write, migration, environment edit, provider request, payment, commit or push is planned. Existing dirty work was inventoried with git status/diff stat/name-status and must remain intact.

## Plan And Recovery

1. Add a bounded, allowlisted Brand portrait presentation field to the existing static content contract, with compatibility defaults. Connect Website UI and existing media validation; no schema change.
2. Implement Storybook: managed hero/origin, selectable portraits, numbered journey, everyday photograph/story, pale-yellow values and closing invitation. Remove repeated origin copy.
3. Implement Impact First: managed hero, immediately visible real contribution rule, partner story, test-only programmes/why-partner, concise giving steps and unchanged eligible ProductCard controls. Keep paused/ended states, percentage/fixed semantics and fictional disclosures.
4. Add focused component/contract/media regressions; run both builds and existing test suites, syntax and generated-copy checks. Inspect actual local pages, pop-out and editor boundaries. Update this checkpoint and handoff with exact results and remaining manual acceptance.

## Completed Implementation

- Storybook replaces the old repeated origin cards with one managed origin introduction, local Chase/Evie portrait selection, numbered chapters, one everyday photograph/story composition, a pale-yellow icon-led values band and the existing real shopping invitation. All previously editable headings, origin paragraphs, hero and chapters remain connected. The duplicate origin photo/paragraph rendering is intentionally consolidated to match the approved composition; no media records/assets are deleted.
- Brand portraits are two plain-text/static image records inside existing StorefrontContent presentation JSON, not customer/pet business records or a new table. Defaults merge into older publications/drafts. Website UI exposes name, tagline, story, URL/upload/library image and alt description. Nested public projection strips unsupported fields; validation bounds records/text, enforces descriptions/safe image URLs and checks uploaded media existence before writes.
- The Brand canvas allows its local portrait selector, while its navigation links remain inert. Other preview modes retain their original inert wrappers. Selection does not save, upload, publish or modify business records. Existing explicit Save/Cancel/Publish and revision behavior remain.
- Impact First uses the actual campaign hero, then the configured fixed/percentage contribution immediately below it, partner narrative/photo, test-only programme cards/why-partner band, clear giving steps and unchanged real eligible ProductCards. Inactive/paused messaging, dates, generated-not-paid disclosure, eligibility order, selected variant/price and test purchasing protection remain. The amount is not copied from the mock. Real campaigns never receive the fictional programme/photos/partner claims.
- Public campaign pages, campaign pop-outs, Catalog campaign canvas and Website UI still reuse CampaignPageContent. Website UI's campaign color control now accurately names the contribution-panel surface. The generic fallback story title no longer names the fictional Meadow Haven partner for real campaigns; existing managed headings are preserved.
- StorefrontPhoto provides bounded aspect ratio, URL/media resolution, caption and image-failure fallback for both pages. Focused portrait/giving/example components keep composition separate from local state and rule presentation. No app dependency, route, DB schema or environment change.

## Files In This Pass

New application/test files:

- `client/src/domains/storefront/components/BrandPortraitPanel.vue`
- `client/src/domains/storefront/components/StorefrontPhoto.vue`
- `client/src/domains/storefront/styles/brandPage.css`
- `client/src/domains/campaigns/components/CampaignGivingSummary.vue`
- `client/src/domains/campaigns/components/CampaignExampleSections.vue`
- `client/tests/tier2/storefront/boutique-pages.test.js`

Modified application/test files:

- `client/src/domains/storefront/components/BrandPageContent.vue` (already untracked from the earlier phase, not newly created in this pass).
- `client/src/domains/campaigns/components/CampaignPageContent.vue`
- `client/src/domains/campaigns/styles/campaignPage.css`
- `client/src/domains/admin/components/AdminWebsiteCanvas.vue`
- `client/src/domains/admin/components/AdminPresentationFields.vue`
- Canonical `shared/storefront/pagePresentation.js`, `contentValidation.js`, `contentProjection.js`, plus their six generated client/server snapshots.
- `server/src/domains/storefront/services/storefront.service.js`
- `server/tests/tier2/admin/presentation-contract.test.js`
- `server/tests/tier2/admin/storefront-content.test.js`

Docs: this new checkpoint; PROJECT_HANDOFF.md; product UX/customer/admin/roadmap/QA and architecture editor/file-map notes listed in the handoff. Prior dirty files are retained, not claimed as new work.

## Verification Results

| Command / Check | Result |
| --- | --- |
| Initial git status/stat/name-status | Exit 0; 79 prior tracked modifications plus existing untracked work preserved. |
| Client `npm run build` | Exit 0; Vite 8.3.4, 2,305 modules. |
| Client `npm test` | Exit 0; 145 tests / 28 files, tiers 11/128/6. |
| Server `npm run build` | Exit 0; canonical sync and Prisma Client 6.16.2 generation. No schema/migration change. |
| Server `npm test` | Exit 0; 139 tests / 34 files, tiers 28/105/6. |
| Browser desktop | Actual configured $2 per eligible order precedes partner; three real eligible cards loaded. Portrait selection changes photo/name/story. Card 18 oz/$39.99 opens Quick View with the same size/price. Home retains nine sections/eight products/seven reviews; real campaign pop-out renders Impact First and closes. No failed selected page images or captured app error entries. |
| Narrow browser DOM | Actual CSS width 388 px on both pages: no horizontal overflow or out-of-bounds headings; portraits and partner sections stack. Overrides are not exact device emulation; real phone painting/Safari/accessibility remain manual. |
| Editor/security boundary | SSR covers managed/escaped portrait content, inert preview links with an enabled local selector, existing campaign edit handles and actual inspector fields. Contract tests cover legacy defaults, nested allowlisting, safe/bounded portraits, missing media rejection and valid media save. Actual authenticated editor Save/Publish was not performed: the browser had no active admin session. |

The first focused client test expected an incorrect existing browse-only label (`View treats`); the assertion now checks the actual unchanged `Shop this treat` action. Complete suites pass. A first snapshot-verification probe assumed a wrong generated header; it did not indicate source drift. The corrected header-plus-source check and syntax/doc/whitespace closeout results are recorded below.

## Operations, Deployment And Remaining QA

Reused existing Vite 5174 and restarted only the task-owned integration API at 3101 (old PID 16586, new PID 29746) to load current generated contracts. The known integration runner uses local frontend -> local backend -> Railway DB, with no fixture/startup writes. Original user 5173/3000 services and normal server/.env are untouched. No admin signup/login, DB write/publication, provider send, payment, commit or push was performed.

This integration is local, not a live release. Future approved rollout should deploy matching server presentation validation/projection first, then the client; an older backend rejects the new portrait fields rather than silently storing them. No migration or new env variable is required. Existing publications keep their wording: deliberate Website UI edits/publication are separate from shipping layout code. The mock's decorative text/sample product snippets do not replace actual managed content, prices, variants or business rules.

Manual QA: review both local pages against the selected examples; click/keyboard each portrait, edit both portrait records/photos in Website UI, Cancel, then deliberately test draft save/reload/publication only against the approved target. Inspect Catalog campaign canvas, full campaign and pop-out at narrow/desktop widths with long text, missing images and active/paused/ended fixed/percentage campaigns. Confirm eligible cards/Quick View, real bag, header/account/search and guest/signed-in checkout after the separately approved deployment. No real payment/auth/provider certification is claimed.

Keep generated portraits/personality/chapter text and fictional partner/reviews labelled until reviewed real content replaces them. Existing Safari cross-site auth, test-only unpurchasable catalog and payment recovery/concurrency/provider/backup launch gates are unchanged. The tree is suitable for focused commit review after the final closeout, not launch certification.

Approved references and screenshots live under `/Users/nazxylix/.codex/visualizations/2026/06/01/019e859b-b6f3-78e0-b7ab-540ffb37b24b`: `chase-evie-boutique-directions.html`, `campaign-boutique-directions.html`, `storybook-integrated.jpg`, `impact-first-integrated.jpg`. No reference server is required to view the actual application routes.

## Closeout

All required build/test commands completed. `node --check` passed for 173 server JavaScript files; all six changed generated snapshots match the actual build header plus canonical source. The read-only local public-content endpoint returns HTTP 200 and exactly the five allowed fields for each of two portrait records. Final documentation checks passed for nine Markdown files, 230 balanced fence lines and 162 existing local links. The bounded 32-file secret-pattern scan found zero matches; no changed environment file or client/server .env.example exists. `git diff --check` passes. No lint script exists in either package; none was added.

Browser viewport restored and temporary product/campaign dialogs closed. Actual Brand/Campaign review tabs and the existing 5174/3101 preview services are intentionally available. The unauthenticated admin QA tab and temporary Home QA tab are closed. Existing user services/tabs are not removed. No verification command is still running. Focused changes are ready for commit review within the retained dirty tree, not deployed or launch-certified. Next: owner visual/editor/device acceptance, then an explicitly approved matching server/client rollout, followed by the existing launch-critical payment/reliability gates.
