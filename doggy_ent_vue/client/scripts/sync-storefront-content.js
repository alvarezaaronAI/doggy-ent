import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const source = fileURLToPath(new URL('../../shared/storefront/', import.meta.url))
const destination = fileURLToPath(new URL('../src/domains/storefront/content/', import.meta.url))
const files = ['sectionCatalog.js', 'contentValidation.js', 'contentProjection.js', 'socialLinks.js', 'mediaRules.js', 'commercePresentation.js', 'pagePresentation.js']
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

for (const file of ['petCatalog', 'petWeight']) {
  const petSource = fileURLToPath(new URL(`../../shared/pets/${file}.js`, import.meta.url))
  const petTarget = fileURLToPath(new URL(`../src/domains/account/constants/${file}.generated.js`, import.meta.url))
  if (fs.existsSync(petSource)) {
    const contents = `// Generated from shared/pets/${file}.js. Do not edit directly.\n` + fs.readFileSync(petSource, 'utf8')
    fs.mkdirSync(path.dirname(petTarget), { recursive: true })
    if (!fs.existsSync(petTarget) || fs.readFileSync(petTarget, 'utf8') !== contents) fs.writeFileSync(petTarget, contents)
  } else if (!fs.existsSync(petTarget)) {
    throw new Error('Missing bundled pet rules. Build from the complete repository before isolated deployment.')
  }
}
