# Email Artwork

Static PNG derivatives of the existing approved Labrador monogram and the existing
Lucide icon library. Generated with `node scripts/build-email-assets.mjs` from the
application root after client/server dependencies are installed. No icon paths or
brand illustrations are hand-drawn. Lucide attribution is in `lucide-license.txt`.

Email uses public HTTPS images with text fallbacks, table layout and inline styles;
it does not depend on Tailwind, JavaScript, SVG or icon webfonts inside mail clients.
These assets contain no customer data. Do not put protected admin URLs or receipt
access proofs in artwork URLs.
