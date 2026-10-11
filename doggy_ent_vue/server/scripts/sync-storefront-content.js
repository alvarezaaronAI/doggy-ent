import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const source = fileURLToPath(new URL('../../shared/storefront/', import.meta.url))
const destination = fileURLToPath(new URL('../src/domains/storefront/content/', import.meta.url))
const files = ['sectionCatalog.js', 'contentValidation.js', 'contentProjection.js', 'socialLinks.js', 'mediaRules.js', 'commercePresentation.js']
const header = '// Generated from shared/storefront. Edit the canonical file, then run client and server builds.\n'
fs.mkdirSync(destination, { recursive: true })
for (const file of files) {
  const target = path.join(destination, file)
  if (fs.existsSync(path.join(source, file))) {
    const contents = header + fs.readFileSync(path.join(source, file), 'utf8')
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== contents) fs.writeFileSync(target, contents)
  } else if (!fs.existsSync(target)) {
    throw new Error('Missing bundled storefront content rules. Build from the complete repository before isolated deployment.')
  }
}
console.log('Storefront content rules ready for this deployment root.')
