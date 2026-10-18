import { createDefaultStorefrontContent } from '../content/sectionCatalog.js'
import { validateStorefrontContent } from '../content/contentValidation.js'
import { projectStorefrontContent } from '../content/contentProjection.js'
import { findStorefrontContent, writeStorefrontContent } from '../repositories/storefront.repository.js'
import { assertMediaImagesExist } from '../../media/services/mediaReferences.service.js'

function fail(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode })
}
function mapAdmin(row) {
  const published = row?.published ? projectStorefrontContent(row.published) : null
  return {
    draft: row?.draft ? projectStorefrontContent(row.draft) : published || createDefaultStorefrontContent(),
    published, revision: row?.revision || 0,
    updatedAt: row?.updatedAt || null, publishedAt: row?.publishedAt || null,
  }
}
export async function getPublicStorefrontContent() {
  const row = await findStorefrontContent()
  return { content: row?.published ? projectStorefrontContent(row.published) : null }
}
export async function getAdminStorefrontContent() {
  return mapAdmin(await findStorefrontContent())
}
export async function saveStorefrontContent(input, publish = false) {
  if (!Number.isSafeInteger(input?.revision) || input.revision < 0) throw fail('Reload the editor before saving.')
  const validation = validateStorefrontContent(input.content)
  if (validation) throw fail(validation)
  const content = projectStorefrontContent(input.content)
  await assertMediaImagesExist([content.theme.backgroundImage, content.footer.backgroundImage, content.presentation.brand.heroImage, ...content.presentation.brand.portraits.map(item => item.image), ...content.sections.flatMap(block => [block.settings.image, block.settings.backgroundImage, ...(block.settings.items || []).map(item => item.image)])])
  const row = await writeStorefrontContent(input.revision, {
    draft: content,
    ...(publish ? { published: content, publishedAt: new Date() } : {}),
  })
  if (!row) throw fail('This website was changed in another editor. Reload before saving; your current draft has not been overwritten.', 409)
  return mapAdmin(row)
}
