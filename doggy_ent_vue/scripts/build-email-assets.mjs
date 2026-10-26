import { createRequire } from 'node:module'
import { mkdir, copyFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const clientRequire = createRequire(new URL('../client/package.json', import.meta.url))
const serverRequire = createRequire(new URL('../server/package.json', import.meta.url))
const { createSSRApp, h } = clientRequire('vue')
const { renderToString } = clientRequire('vue/server-renderer')
const { ReceiptText, Package, Heart, PawPrint } = clientRequire('@lucide/vue')
const sharp = serverRequire('sharp')
const output = new URL('../client/public/email-assets/', import.meta.url)
await mkdir(output, { recursive: true })

await sharp(fileURLToPath(new URL('../client/src/assets/images/brand/labrador-monogram-v1.webp', import.meta.url)))
  .resize(600, 600, { fit: 'cover', withoutEnlargement: true }).png({ palette: true }).toFile(fileURLToPath(new URL('monogram.png', output)))
for (const [name, icon] of Object.entries({ receipt: ReceiptText, package: Package, heart: Heart, paw: PawPrint })) {
  const svg = await renderToString(createSSRApp({ render: () => h(icon, { size: 64, color: '#315bc5', strokeWidth: 1.75 }) }))
  await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(new URL(`${name}.png`, output)))
}
await copyFile(clientRequire.resolve('@lucide/vue/LICENSE'), new URL('lucide-license.txt', output))
console.log('Built the monogram and four Lucide PNG email assets.')
