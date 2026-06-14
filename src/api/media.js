import { api } from './client'
import { prepareImageFile } from '../utils/media'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function canUploadMedia(weddingId) {
  return UUID_RE.test(String(weddingId || ''))
}

export async function uploadWeddingImage(weddingId, file, kind) {
  const prepared = await prepareImageFile(file, kind)

  const upload = await api('/media/uploads', {
    method: 'POST',
    body: JSON.stringify({
      weddingId,
      kind,
      fileName: prepared.originalName,
      mimeType: prepared.mimeType,
      size: prepared.size,
    }),
  })

  const putResponse = await fetch(upload.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': prepared.mimeType,
    },
    body: prepared.blob,
  })

  if (!putResponse.ok) {
    throw new Error('Nao foi possivel enviar a imagem para o storage.')
  }

  return api('/media/confirm', {
    method: 'POST',
    body: JSON.stringify({
      weddingId,
      kind,
      storageKey: upload.storageKey,
      width: prepared.width,
      height: prepared.height,
      mimeType: prepared.mimeType,
      size: prepared.size,
      originalName: prepared.originalName,
    }),
  })
}
