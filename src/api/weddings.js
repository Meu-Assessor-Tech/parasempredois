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
    const { source, image, store, ...giftFields } = gift
    return { ...giftFields, image: '' }
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

export function saveWedding(wedding) {
  if (!canSaveWedding(wedding?.id)) return createWedding(wedding)

  return api(`/weddings/${wedding.id}`, {
    method: 'PUT',
    body: JSON.stringify(payloadForWedding(wedding)),
  })
}

export function deleteWedding(weddingId) {
  return api(`/weddings/${weddingId}`, {
    method: 'DELETE',
  })
}

function payloadForWedding(wedding) {
  return {
    brideName: wedding?.brideName ?? '',
    groomName: wedding?.groomName ?? '',
    weddingDate: wedding?.date || null,
    venue: wedding?.venue ?? '',
    message: wedding?.message ?? '',
    story: wedding?.story ?? '',
    template: wedding?.template ?? '',
    primaryColor: wedding?.primaryColor ?? '',
    sections: wedding?.sections ?? [],
    giftPixKey: wedding?.giftPixKey ?? '',
    coverImage: storedMedia(wedding?.coverImage),
    galleryImages: storedMediaList(wedding?.galleryImages),
    giftPixQrCode: storedMedia(wedding?.giftPixQrCode),
    gifts: giftsForSave(wedding?.gifts),
  }
}
