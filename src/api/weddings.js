import { ApiError, api } from './client'

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

  const payload = payloadForWedding(wedding)
  return saveWeddingPayload(wedding, '', payload)
}

export function saveWeddingContent(wedding) {
  return saveWeddingSection(wedding, 'content', contentPayload(wedding))
}

export function saveWeddingDesign(wedding) {
  return saveWeddingSection(wedding, 'design', designPayload(wedding))
}

export function saveWeddingGifts(wedding) {
  return saveWeddingSection(wedding, 'gifts', giftsPayload(wedding))
}

function saveWeddingSection(wedding, section, payload) {
  if (!canSaveWedding(wedding?.id)) return createWedding(wedding)
  return saveWeddingPayload(wedding, section, payload)
}

function saveWeddingPayload(wedding, section, payload) {
  const suffix = section ? `/${section}` : ''
  return api(`/weddings/${wedding.id}${suffix}`, {
    method: section ? 'PATCH' : 'PUT',
    body: JSON.stringify(payload),
  }).catch(async (err) => {
    if (!(err instanceof ApiError) || err.status !== 403) {
      throw err
    }
    const currentWedding = await getCurrentWedding()
    if (!currentWedding?.id || currentWedding.id === wedding.id) {
      throw err
    }
    return api(`/weddings/${currentWedding.id}${suffix}`, {
      method: section ? 'PATCH' : 'PUT',
      body: JSON.stringify(payload),
    })
  })
}

export function deleteWedding(weddingId) {
  return api(`/weddings/${weddingId}`, {
    method: 'DELETE',
  })
}

function payloadForWedding(wedding) {
  return {
    ...contentPayload(wedding),
    ...designPayload(wedding),
    ...giftsPayload(wedding),
  }
}

function contentPayload(wedding) {
  return {
    brideName: wedding?.brideName ?? '',
    groomName: wedding?.groomName ?? '',
    weddingDate: wedding?.date || null,
    venue: wedding?.venue ?? '',
    message: wedding?.message ?? '',
    story: wedding?.story ?? '',
    sections: wedding?.sections ?? [],
  }
}

function designPayload(wedding) {
  return {
    template: wedding?.template ?? '',
    primaryColor: wedding?.primaryColor ?? '',
    coverImage: storedMedia(wedding?.coverImage),
    galleryImages: storedMediaList(wedding?.galleryImages),
  }
}

function giftsPayload(wedding) {
  return {
    giftPixKey: wedding?.giftPixKey ?? '',
    giftPixQrCode: storedMedia(wedding?.giftPixQrCode),
    gifts: giftsForSave(wedding?.gifts),
  }
}
