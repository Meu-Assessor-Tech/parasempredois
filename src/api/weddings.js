import { api } from './client'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function storedMedia(media) {
  return media && typeof media === 'object' && media.source === 'object-storage' ? media : null
}

function storedMediaList(mediaList) {
  return (mediaList ?? []).filter(media => media && typeof media === 'object' && media.source === 'object-storage')
}

function giftsForSave(gifts) {
  return (gifts ?? []).filter(gift => gift?.source !== 'sample').map(gift => {
    if (!gift?.image || typeof gift.image === 'string' || gift.image.source === 'object-storage') {
      return gift
    }
    return { ...gift, image: '' }
  })
}

export function canSaveWedding(weddingId) {
  return UUID_RE.test(String(weddingId || ''))
}

export function getCurrentWedding() {
  return api('/weddings')
}

export function createWedding(wedding) {
  return api('/weddings', {
    method: 'POST',
    body: JSON.stringify(payloadForWedding(wedding)),
  })
}

export function saveWeddingMedia(wedding) {
  if (!canSaveWedding(wedding?.id)) return createWedding(wedding)

  return api(`/weddings/${wedding.id}`, {
    method: 'PUT',
    body: JSON.stringify(payloadForWedding(wedding)),
  })
}

function payloadForWedding(wedding) {
  return {
    coverImage: storedMedia(wedding?.coverImage),
    galleryImages: storedMediaList(wedding?.galleryImages),
    giftPixQrCode: storedMedia(wedding?.giftPixQrCode),
    gifts: giftsForSave(wedding?.gifts),
  }
}
