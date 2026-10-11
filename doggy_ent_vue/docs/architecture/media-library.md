# Database-Backed Image Library

Implemented locally: 2026-10-09. Deployment and Railway migration are separate approved steps. This module stores reusable public raster assets, not private documents or customer uploads.

## Editor Workflow

Image-source fields in Website, Products and Campaigns retain URL entry and add **Upload image**, **Choose library**, image thumbnail and Clear. Navigation, button, partner and social destination URLs remain links. Uploads immediately create/reuse a library asset in the backend's selected database; choosing it changes only the current form. Website Save Draft remains private until explicit Publish. Product/Campaign Save follows their existing immediate persistence rules.

The native modal library supports name/description search, logical folders (`general`, `website`, `products`, `campaigns`), 24-item pagination, dimensions/size, storage usage, and metadata editing. Save image details explicitly before Use this image. Descriptions can prefill the selected page's accessibility field; later library metadata edits do not silently overwrite saved page captions/alt text. Folder changes organize records, not URLs or byte locations. Closing/reselecting discards unsaved library metadata; failed saves retain the selected edit.

## Storage Design

| Model | Fields / Responsibility |
| --- | --- |
| `MediaAsset` | UUID, name, original filename, alt text, folder, MIME type, dimensions, optimized/thumbnail byte sizes, unique SHA-256 checksum, actor type, created/updated times. Indexed folder/date and date/ID. |
| `MediaAssetData` | One-to-one asset key, optimized WebP bytes and thumbnail bytes (`BYTEA` via Prisma `Bytes`). Separates blob reads from metadata queries; cascading FK only, no deletion API. |

Additive migration: `server/prisma/migrations/20261009020000_media_library/migration.sql`. Metadata/blob creation is atomic. SHA-256 deduplicates normalized bytes, including concurrent uploads. A serializable transaction protects a **256 MiB** total optimized-plus-thumbnail library capacity with bounded conflict retries. This is a code-defined capacity, not an env setting or retention policy.

PostgreSQL persistence avoids ephemeral local/Railway filesystem storage and works in either data-target mode. It increases database/backup size and API traffic. This is a bounded initial implementation, not unlimited digital-asset management. Future object storage/CDN can replace the repository's binary read/write boundary behind stable asset IDs/URLs; it is not connected now. Formal asset usage relations, safe unused-asset cleanup, replacement/version history, external storage, import/export and retention tools remain future work. No delete/overwrite action is exposed because product/order snapshots can still refer to old URLs.

## Request And Rendering Flow

```text
Authenticated admin -> AdminImageField -> useAdminImageUpload -> adminMedia API
 -> admin auth + rate limit + bounded raw body
 -> controller -> service -> validator + Sharp normalization
 -> repository -> Prisma transaction -> MediaAsset + MediaAssetData
 -> safe metadata + stable /api/media/<uuid> -> selected form
 -> explicit draft/publish or product/campaign Save
 -> shared mediaImageSource -> configured backend origin -> public WebP response
```

Saved image values are backend-relative `/api/media/<uuid>`, never a local/Railway/Vercel host. `client/src/shared/utils/mediaImage.js` resolves only canonical image/thumbnail paths with `buildApiUrl`. Existing HTTPS photos and bundled `/assets/` paths remain unchanged. The same resolver is used by home/footer/hero, campaign pages/canvas, product cards/Quick View/admin table, cart, checkout, order success and customer/admin order items. This preserves server-owned price/variant/order calculations.

Website/Product/Campaign services check uploaded references exist in the chosen database before writes. A local asset is not automatically a Railway asset; reupload to the intended database only after schema deployment is approved.

## Endpoints And Security

| Endpoint | Access | Behavior |
| --- | --- | --- |
| `GET /api/admin/media` | Admin | Metadata-only search/folder/page list, capacity info; `no-store`. |
| `POST /api/admin/media` | Admin | Raw JPEG/PNG/WebP body, `X-File-Name` and `X-Media-Folder`; new asset 201 or reused asset 200. |
| `PATCH /api/admin/media/:id` | Admin | Name/alt/folder allowlist only; no binary replacement. |
| `GET /api/media/:id` | Public | Optimized WebP bytes, not JSON metadata. |
| `GET /api/media/:id/thumbnail` | Public | Small WebP thumbnail. |

- Admin authentication precedes raw body processing. Upload rate limit is 20 per 15 minutes and two active image transforms per process; these are not cluster-wide quotas.
- Input must be nonempty, <=8 MiB and <=20 megapixels, with decoded JPEG/PNG/WebP matching its declared type. No SVG, HTML, animated uploads or compressed request bodies. Sharp rotates EXIF orientation, resizes within 2400 px without enlargement and reencodes to WebP; original metadata is removed. Optimized assets must be <=2 MiB. See official [Sharp constructor](https://sharp.pixelplumbing.com/api-constructor/), [input metadata](https://sharp.pixelplumbing.com/api-input/), and [WebP output](https://sharp.pixelplumbing.com/api-output/) documentation.
- Public responses use `image/webp`, `nosniff`, checksum ETag and one-year immutable cache headers. There is no credential requirement to view an uploaded image: UUID obscurity is not privacy. The UI explicitly warns not to upload private/customer files.
- Library JSON never returns bytes, hashes, session data, credentials, or internal actor fields. Filename paths/control characters are stripped; metadata is escaped by Vue.
- Existing JSON body limit is unchanged. The media route uses a separate 8 MiB raw parser; errors return safe JSON. Action URLs still reject `/api`/`admin`; only exact canonical media paths qualify as images.

## Deployment And Environment

No new variable or external storage credential is required. Keep existing `DATABASE_URL`, `NODE_ENV`, `PORT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `FRONTEND_URL`/`CLIENT_URL` server-side. Existing customer/provider variables remain unchanged. Frontend uses public `VITE_API_BASE_URL` or compatibility `VITE_API_URL` and the existing Stripe publishable key variable. Do not expose values or create env examples.

Fully local: server `npm run dev:local`, client `npm run dev:local`. Railway DB admin: server `npm run dev:railway` loading `.env` plus `.env.railway.local`, paired with client `npm run dev:local`. The browser still calls the local backend. Normal `server/.env` was not edited.

For Railway: obtain explicit approval, confirm intended DB/backup, review both pending content/media migrations and status, then use the approved migrate-deploy process. Never reset/reseed. Server `npm run start` already runs `prisma migrate deploy`, so deployment can apply these migrations. Build/generate the matching server with Sharp's Linux optional native binaries installed, restart it after Prisma generation, verify protected uploads/public images/CORS, then deploy the matching Vercel build. Install optional dependencies normally; do not disable Sharp platform packages. Test immutable image URLs from the deployed frontend, not only Vite's proxy. Upload/publish approved real assets separately in that target database.

### Interrupted Startup Repair (2026-10-10)

The resumed local server had Prisma CLI/generated client 6.16.2 with `@prisma/client` runtime 7.10.0. Actual startup failed with `MODULE_NOT_FOUND` for `@prisma/client/runtime/library.js`; this was a package/runtime mismatch, not a missing table or failed migration. Both Prisma packages are now pinned to 6.16.2 in `server/package.json` and the lockfile, followed by install and explicit `npm run build` generation. Local startup with Node 22.15.0 and real catalog/content/media reads now succeeds. Do not upgrade either Prisma package alone; coordinate future upgrades with schema, adapter and runtime verification. Always regenerate and restart after dependency/client changes. Existing npm install-script warnings are not proof of generation; the explicit build and startup checks establish that result here.

## Preview And QA

Original homepage section-ID CSS previously overrode editor background selections. Scoped explicit-background rules now win; no-image/default presentation remains intact. Global artwork repeats at page width beneath 78% white reading tints; section/footer artwork uses a 70% tint. Explicit block choices override global seasonal artwork. Hero keeps its separate photograph. The shared public/editor renderer and current-artwork strip show the same saved choices, and unsaved section markers clear on Save without implying Publish.

Generated project asset: `assets/seasonal/halloween-background-template.png`, 1983 x 793 landscape. It is decorative AI-created template artwork, not a product/customer photo. Prompt: restrained premium autumn still-life; pumpkins/leaves at edges, light quiet center, emerald/orange accents compatible with existing blue/yellow, no text/logo/watermark. Its uploaded WebP is 215,042 bytes; thumbnail 8,858 bytes in local QA.

See [verification guide](../verification-and-qa.md) and [handoff](../../PROJECT_HANDOFF.md) for exact commands/UI results. Check type/signature/dimension/size/auth rejection, deduplication, search/folders/pagination, metadata Save/Cancel, Escape/focus restoration, failed requests, draft vs Publish, reload persistence, palette visibility, actual desktop/mobile rendering, image fallback, both data-target modes after authorized migration, and existing variant/cart/checkout flows. Automated tests do not certify production Safari, Linux deployment, CDN behavior, backup recovery, screen readers or real Stripe payments.
