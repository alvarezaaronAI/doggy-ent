# Image Placement Guide

These are generated illustrative templates, not photographs of the real Chase/Evie, customer reviews, approved packaging, or evidence of a partner's work. As of 2026-10-15, the approved redesign is integrated and deployed. The eight Railway test products retain their main images and now have four optional gallery images each. A separate fictional campaign uses an uploaded Labrador template. All test products are permanently excluded from checkout by `isTestProduct`; generated review/partner content remains explicitly fictional. See the [integration handoff](../../PROJECT_HANDOFF.md#2026-10-15-approved-design-integration-and-deployment).

## Website Templates

| File | Page / Section | Intended Use | Replacement Guidance |
| --- | --- | --- | --- |
| [labrador-pair-template.webp](labrador-pair-template.webp) | Home hero; Meet the Brand teaser | Wide garden photograph of a Labrador pair | Replace with a real wide Chase/Evie photo. Leave room for copy and keep both faces within the crop. |
| [campaign-black-lab-template.webp](campaign-black-lab-template.webp) | Campaign hero; Home giving spotlight | Black Labrador on a bright walking trail | Replace with a partner-approved campaign image. Do not imply the template dog is an actual beneficiary. |
| [partner-yellow-lab-template.webp](partner-yellow-lab-template.webp) | Campaign partner introduction; gallery | Yellow Labrador in a comfortable care room | Replace with approved partner/environment photography and a truthful caption. |
| [brand-labs-adventure-template.webp](brand-labs-adventure-template.webp) | Brand hero; origin story; everyday gallery | Labrador pair on a woodland path | Replace with real shared adventures. Suggested story caption: what the moment means to the brand. |
| [labrador-portrait-template.webp](labrador-portrait-template.webp) | Additional portrait/gallery slot | Chocolate Labrador portrait | Use only as a labelled template; replace with real Chase/Evie portraits before identifying them publicly. |
| [labrador-monogram-v1.webp](labrador-monogram-v1.webp) | Decorative page background | Original Labrador-head/paw pattern using the brand palette | Applied in the approved storefront at subtle opacity. Keep reading surfaces legible; exact seamless tiling is not certified. |
| [sample-product-packshots.webp](sample-product-packshots.webp) | Design reference contact sheet | Eight packaging concepts | Not an approved real-product photograph or production packaging design. Individual test images below are cropped from this sheet. |

The placement captions identify the content slot and the recommended real replacement. Portrait identities and partner programmes remain illustrative. Static Website UI appearance controls must not replace Product/Campaign-owned image/content records. Application derivatives live in `client/src/assets/images/brand/`; database-owned product/campaign images use stable media references rather than machine-local paths.

## Railway Test Product Images

| Asset | Test Product | Status | Public Visibility |
| --- | --- | --- | --- |
| [chicken.webp](test-products/chicken.webp) | [TEST] Chicken Breast Jerky | ACTIVE, zero inventory | Visible; checkout rejected |
| [beef.webp](test-products/beef.webp) | [TEST] Beef Jerky | OUT_OF_STOCK | Visible; checkout rejected |
| [turkey.webp](test-products/turkey.webp) | [TEST] Turkey Jerky | COMING_SOON | Visible as upcoming; checkout rejected |
| [salmon.webp](test-products/salmon.webp) | [TEST] Salmon Bites | ACTIVE, zero inventory | Visible; checkout rejected |
| [lamb.webp](test-products/lamb.webp) | [TEST] Lamb Jerky | DRAFT | Hidden from public API |
| [training.webp](test-products/training.webp) | [TEST] Training Bites | COMING_SOON | Visible as upcoming; checkout rejected |
| [pumpkin.webp](test-products/pumpkin.webp) | [TEST] Pumpkin Bites | DRAFT | Hidden from public API |
| [bundle.webp](test-products/bundle.webp) | [TEST] Weekend Bundle | ARCHIVED | Hidden from public API |

Every test record uses `INVENTORY_LIMITED`, zero stock for both sizes, `featured: false`, `[TEST]` in its name and `TEST PRODUCT` / `NOT FOR SALE` tags. Database images use existing MediaAsset/MediaAssetData storage, public host-independent `/api/media/<uuid>` references, `products` folder, descriptive test names and alt text. Placement context is local documentation, not a new schema field.

[catalog-plan.json](test-products/catalog-plan.json) records the non-secret fixture plan. [railway-fixture-report.json](test-products/railway-fixture-report.json) records the exact new product/media IDs, statuses, variants and verified results. Neither file contains credentials, customer identities, order contents or tokens.

Do not add stock or change these records to made-to-order/preorder. The integration adds a permanent `isTestProduct` flag with server checkout rejection independent of stock/status/selling mode, in addition to existing zero-inventory gates. Retire/archive the public test records and review image usage before a real-customer launch. Never delete referenced media blindly.

## Generation Provenance

Built-in image generation, begun 2026-10-13 and verified 2026-10-14. Final selected assets saved in this folder; original generated files remain outside Git.

- Campaign hero prompt: natural editorial black Labrador on a bright meadow trail, wide right-side subject, morning light, blue sky/yellow collar, no text/logos/humans or implied actual rescue case.
- Partner image prompt: relaxed yellow Labrador on a clean blanket in a welcoming care room, window light, oat/kraft surfaces and subtle blue/yellow toys, no text/logos/humans/distress or actual partner claim.
- Brand adventure prompt: black/yellow Labrador pair walking together on a sunny woodland path, full heads/paws, natural textures and blue/yellow collars, no text/logos/humans or real Chase/Evie identity claim.

Optimized WebP derivatives and contact-sheet crops were produced with the existing Sharp dependency. No additional image service, API key, or environment file was added.

## Optional Product Gallery Templates (2026-10-14)

The follow-up adds 32 generated detail images: four for each of eight sample products. See [gallery placement and generation prompts](product-galleries/README.md) and [manifest](product-galleries/manifest.json). All 32 were uploaded to Railway during the approved 2026-10-15 integration; the earlier eight Railway main images remain unchanged. Texture, pouch angle, preparation/travel and Labrador lifestyle roles help the owner replace each image appropriately later; preparation scenes are not evidence of the actual kitchen, and lifestyle scenes are not customer reviews.
