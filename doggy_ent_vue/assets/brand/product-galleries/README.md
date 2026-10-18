# Illustrative Product Galleries

Generated on 2026-10-14 for design review, then approved for testing integration on 2026-10-15. These are templates, not approved product photography, actual packaging, customer photographs or evidence of manufacturing practices. All 32 optional images were uploaded to the approved Railway testing catalog using protected media normalization and linked to the eight existing non-purchasable test products.

Each of eight sample products has four optional detail images, separate from its existing main photograph. The proposed pop-out displays the main image with a left thumbnail rail on desktop and a wrapping horizontal rail on mobile. Empty optional slots are omitted. Image records belong in Products, not the appearance-only Website UI workspace.

## Placement Map

| Sample Product | Texture | Packaging Angle | Preparation / Travel | Lifestyle |
| --- | --- | --- | --- | --- |
| Chicken Breast Jerky | [Close-up](chicken-texture-v1.webp) | [Pouch](chicken-pack-angle-v1.webp) | [Preparation](chicken-preparation-v1.webp) | [Labrador](chicken-lifestyle-v1.webp) |
| Beef Jerky | [Close-up](beef-texture-v1.webp) | [Pouch](beef-pack-angle-v1.webp) | [Preparation](beef-preparation-v1.webp) | [Labrador](beef-lifestyle-v1.webp) |
| Turkey Jerky | [Close-up](turkey-texture-v1.webp) | [Pouch](turkey-pack-angle-v1.webp) | [Preparation](turkey-preparation-v1.webp) | [Labrador](turkey-lifestyle-v1.webp) |
| Salmon Bites | [Close-up](salmon-texture-v1.webp) | [Pouch](salmon-pack-angle-v1.webp) | [Preparation](salmon-preparation-v1.webp) | [Labrador](salmon-lifestyle-v1.webp) |
| Lamb Jerky | [Close-up](lamb-texture-v1.webp) | [Pouch](lamb-pack-angle-v1.webp) | [Preparation](lamb-preparation-v1.webp) | [Labrador](lamb-lifestyle-v1.webp) |
| Training Bites | [Close-up](training-texture-v1.webp) | [Pouch](training-pack-angle-v1.webp) | [Preparation](training-preparation-v1.webp) | [Labrador](training-lifestyle-v1.webp) |
| Pumpkin Bites | [Close-up](pumpkin-texture-v1.webp) | [Pouch](pumpkin-pack-angle-v1.webp) | [Preparation](pumpkin-preparation-v1.webp) | [Labrador](pumpkin-lifestyle-v1.webp) |
| Weekend Bundle | [Close-up](bundle-texture-v1.webp) | [Pouches](bundle-pack-angle-v1.webp) | [Travel](bundle-preparation-v1.webp) | [Labradors](bundle-lifestyle-v1.webp) |

`texture` shows the intended treat shape for the product pop-out's first optional image. `pack-angle` provides another packaging view. `preparation` is an illustrative process detail, except the bundle's travel scene. `lifestyle` is an everyday Labrador scene; it is not a customer testimonial. The Chicken preparation image is also used in the mock Made with Care composition. Replace it with truthful process photography before publication.

[manifest.json](manifest.json) records product, role, relative filename and illustrative status. Its upload status now reflects the approved integration, not the original preview-only round. Filenames provide placement context; Product.galleryImages stores ordered media references and descriptions. Existing main images were preserved.

## Generation Prompt Set

Used the built-in image-generation tool, not a CLI/API-key workflow. One four-view contact sheet per product, cropped and optimized with the repository's existing Sharp dependency. Originals are preserved outside Git; selected WebP crops are in this directory.

Shared prompt: square 2-by-2 contact sheet with four equal independent edge-to-edge photos, no gutters, text, borders or watermark; existing sample packshot as packaging/style reference; macro texture on a neutral plate, matching white resealable clear-window paw pouch from another view, clean preparation/travel detail, and a full-headed Labrador beside a closed pouch in daylight. Preserve blue/yellow/kraft/oat/white brand accents. No certification, ingredient, nutrition, rescue or actual-customer claims.

Product-specific prompts:

- Chicken: golden thin dehydrated strips, blue-paw pouch, preparation board/tongs and black Labrador garden scene.
- Beef: dark reddish-brown strips, yellow-paw pouch, preparation board/tongs and black Labrador.
- Turkey: light golden-orange strips, blue-paw pouch, preparation board/tongs and short-coated yellow Labrador.
- Salmon: orange cubes with dark skin detail, yellow-paw pouch, soft emerald backdrop and black Labrador.
- Lamb: dark strips with golden edges, yellow-paw pouch, neutral backdrop and chocolate Labrador.
- Training: small brown rounded cubes, blue-paw pouch, pale blue backdrop and black Labrador.
- Pumpkin: orange-gold bone-shaped biscuits, yellow-paw pouch, seasonal preparation detail and chocolate Labrador.
- Bundle: separate cube/jerky dishes, two blue/yellow-paw pouches, blue/yellow travel bag and black/chocolate Labradors.

Chicken and Bundle lifestyle images received targeted breed corrections; all other quadrants and product concepts were preserved. Generated scenes remain subject to business/photography review. Source crops are approximately 619 pixels square; inline review copies are 360 pixels square to keep the complete preview below 1 MB. Production use should select appropriate responsive images from the retained larger files.

## Connected Implementation

Product now retains its main image plus up to four optional images. Products -> image workspace supports protected upload/library/HTTPS selection, descriptions, reorder/remove and explicit Save/Cancel. Public Quick View uses the same stored gallery. The original HTML design example remains disconnected sample memory; use the actual Vue app for persistence.

The protected media library and server/database max-four constraints are reused. Image-only PATCH saves validate references and updatedAt without recreating variants. Existing order snapshots and checkout ownership/pricing remain unchanged. Gallery migration/backups and verification are documented in the latest handoff. Business approval and replacement of generated photography remain required before a real-customer launch.
