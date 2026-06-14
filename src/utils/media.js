export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const MEDIA_LIMITS = {
  cover: { maxRawMb: 12, maxDimension: 1920, quality: 0.84 },
  gallery: { maxRawMb: 10, maxDimension: 1400, quality: 0.82 },
  gift: { maxRawMb: 10, maxDimension: 800, quality: 0.82 },
  qrCode: { maxRawMb: 3, maxDimension: 800, quality: 0.9 },
}

export function mediaUrl(media) {
  if (!media) return ''
  if (typeof media === 'string') return media
  return media.url || media.previewUrl || ''
}

export function mediaKey(media, fallback = '') {
  if (!media) return fallback
  if (typeof media === 'string') return media
  return media.storageKey || media.url || media.previewUrl || media.id || fallback
}

export async function checkImageMagicBytes(file) {
  const buf = await file.slice(0, 12).arrayBuffer()
  const b = new Uint8Array(buf)
  const jpeg = b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF
  const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47
  const webp = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46
    && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  return jpeg || png || webp
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Não foi possível carregar a imagem.'))
    }
    img.src = objectUrl
  })
}

function outputMimeTypeFor(mimeType) {
  return mimeType === 'image/png' ? 'image/png' : 'image/jpeg'
}

function canvasToBlob(canvas, mimeType, quality) {
  const outputType = outputMimeTypeFor(mimeType)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Nao foi possivel processar a imagem.')),
      outputType,
      outputType === 'image/jpeg' ? quality : undefined,
    )
  })
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Nao foi possivel processar a imagem.'))
    reader.readAsDataURL(blob)
  })
}

function normalizeFileName(fileName, mimeType) {
  const extension = mimeType === 'image/png' ? 'png' : 'jpg'
  const cleanName = (fileName || 'imagem')
    .replace(/[\\/]/g, '-')
    .replace(/\.[^.]+$/, '')
    .slice(0, 120) || 'imagem'
  return `${cleanName}.${extension}`
}

export async function prepareImageFile(file, kind = 'gallery') {
  const limits = MEDIA_LIMITS[kind] ?? MEDIA_LIMITS.gallery

  if (!IMAGE_MIME_TYPES.includes(file.type)) {
    throw new Error('Formato não suportado. Use JPEG, PNG ou WebP.')
  }

  if (file.size > limits.maxRawMb * 1024 * 1024) {
    throw new Error(`A imagem deve ter no máximo ${limits.maxRawMb} MB.`)
  }

  const valid = await checkImageMagicBytes(file)
  if (!valid) throw new Error('O arquivo não é uma imagem válida.')

  const img = await loadImage(file)
  let width = img.naturalWidth
  let height = img.naturalHeight

  if (width > limits.maxDimension || height > limits.maxDimension) {
    if (width >= height) {
      height = Math.round(height * limits.maxDimension / width)
      width = limits.maxDimension
    } else {
      width = Math.round(width * limits.maxDimension / height)
      height = limits.maxDimension
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)

  const blob = await canvasToBlob(canvas, file.type, limits.quality)
  const mimeType = blob.type || outputMimeTypeFor(file.type)
  const maxBytes = limits.maxRawMb * 1024 * 1024

  if (blob.size > maxBytes) {
    throw new Error(`A imagem processada deve ter no maximo ${limits.maxRawMb} MB.`)
  }

  return {
    blob,
    width,
    height,
    mimeType,
    originalName: normalizeFileName(file.name, mimeType),
    size: blob.size,
  }
}

export async function processImageFile(file, kind = 'gallery') {
  const prepared = await prepareImageFile(file, kind)
  const url = await blobToDataUrl(prepared.blob)

  return {
    id: crypto.randomUUID(),
    url,
    storageKey: null,
    width: prepared.width,
    height: prepared.height,
    mimeType: prepared.mimeType,
    originalName: prepared.originalName,
    size: prepared.size,
    source: 'local-preview',
  }
}
