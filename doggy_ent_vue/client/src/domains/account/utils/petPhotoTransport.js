const MAX_TRANSFER_BYTES = 3 * 1024 * 1024

export async function preparePetPhotoUpload(file) {
  if (file.size <= MAX_TRANSFER_BYTES) return file
  let image
  try {
    image = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const prepared = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.86))
    if (!prepared || prepared.size > MAX_TRANSFER_BYTES) throw new Error('Photo preparation failed.')
    return prepared
  } catch {
    throw new Error('We could not prepare this photo. Try a smaller image or another photo.')
  } finally {
    image?.close()
  }
}
