import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { canSaveWedding, createWedding, deleteWedding, getCurrentWedding } from '../api/weddings'
import { useAuth } from './AuthContext'
import { mockWedding } from '../data/mockWedding'
import { sampleMedia } from '../utils/media'

const STORAGE_KEY = 'baitacasamento_wedding'
const PUBLISHED_STORAGE_KEY = 'baitacasamento_published_wedding'
const PREVIEW_STORAGE_KEY = 'baitacasamento_preview_wedding'

const WeddingContext = createContext(null)

export function WeddingProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const isExampleRoute = typeof window !== 'undefined'
    && window.location.pathname === '/site/ana-e-pedro'
    && new URLSearchParams(window.location.search).get('example') === '1'
  const isPreviewRoute = typeof window !== 'undefined'
    && window.location.pathname.startsWith('/site/')
    && new URLSearchParams(window.location.search).get('preview') === '1'
  const previewStorageKey = (() => {
    if (typeof window === 'undefined') return PREVIEW_STORAGE_KEY
    const params = new URLSearchParams(window.location.search)
    const previewKey = params.get('previewKey')
    return previewKey ? `${PREVIEW_STORAGE_KEY}:${previewKey}` : PREVIEW_STORAGE_KEY
  })()
  const ensureWeddingRef = useRef(null)
  const [loadingWedding, setLoadingWedding] = useState(false)
  const [wedding, setWedding] = useState(() => {
    try {
      if (isExampleRoute) {
        return draftWedding()
      }
      if (isPreviewRoute) {
        const preview = sessionStorage.getItem(previewStorageKey) ?? sessionStorage.getItem(PREVIEW_STORAGE_KEY)
        if (preview) return normalizeWedding(JSON.parse(preview))
      }
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return draftWedding()
      const parsed = JSON.parse(saved)
      return normalizeWedding(parsed)
    } catch {
      return draftWedding()
    }
  })
  const [publishedWedding, setPublishedWedding] = useState(() => {
    try {
      const saved = localStorage.getItem(PUBLISHED_STORAGE_KEY)
      if (!saved) return draftWedding()
      return normalizeWedding(JSON.parse(saved))
    } catch {
      return draftWedding()
    }
  })

  useEffect(() => {
    let cancelled = false

    if (authLoading) {
      setLoadingWedding(true)
      return
    }

    if (isExampleRoute) {
      setLoadingWedding(false)
      setWedding(draftWedding())
      setPublishedWedding(draftWedding())
      return
    }

    if (!user) {
      setLoadingWedding(false)
      setWedding(prev => normalizeWedding({ ...prev, id: mockWedding.id }))
      return
    }

    if (isPreviewRoute) {
      setLoadingWedding(false)
      return
    }

    setLoadingWedding(true)
    getCurrentWedding()
      .then(remoteWedding => {
        if (cancelled) return
        if (!remoteWedding) {
          setWedding(prev => {
            const next = newDraftWedding(prev)
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            } catch {
              // localStorage quota exceeded (e.g. large base64 images)
            }
            return next
          })
          return
        }
        setWedding(prev => {
          const next = mergeRemoteWedding(prev, remoteWedding)
          setPublishedWedding(next)
          savePublishedWedding(next)
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          } catch {
            // localStorage quota exceeded (e.g. large base64 images)
          }
          return next
        })
      })
      .catch(() => {
        // Keep the local editor state available if the API is offline.
      })
      .finally(() => {
        if (!cancelled) setLoadingWedding(false)
      })

    return () => {
      cancelled = true
    }
  }, [user, authLoading, isPreviewRoute, isExampleRoute])

  const updateWedding = (updates) => {
    setWedding(prev => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // localStorage quota exceeded (e.g. large base64 images)
      }
      return next
    })
  }

  const publishWedding = (updates) => {
    setPublishedWedding(prev => {
      const next = preserveOrGenerateSlug({ ...prev, ...updates })
      savePublishedWedding(next)
      return next
    })
  }

  const resetWedding = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PUBLISHED_STORAGE_KEY)
    setWedding(draftWedding())
    setPublishedWedding(draftWedding())
  }

  const createWeddingSite = async (identity) => {
    const requestWedding = withGeneratedSlug({ ...draftWedding(), ...identity })
    const remoteWedding = await createWedding(requestWedding)
    let nextWedding = null
    setWedding(prev => {
      const next = mergeRemoteWedding({ ...prev, ...requestWedding }, remoteWedding)
      nextWedding = next
      setPublishedWedding(next)
      savePublishedWedding(next)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // localStorage quota exceeded (e.g. large base64 images)
      }
      return next
    })
    return nextWedding ?? mergeRemoteWedding(requestWedding, remoteWedding)
  }

  const deleteWeddingSite = async () => {
    if (canSaveWedding(wedding.id)) {
      await deleteWedding(wedding.id)
    }
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PUBLISHED_STORAGE_KEY)
    const next = draftWedding()
    setWedding(next)
    setPublishedWedding(next)
    return next
  }

  const ensureWedding = async () => {
    if (canSaveWedding(wedding.id)) return wedding
    if (!user) return wedding
    if (ensureWeddingRef.current) return ensureWeddingRef.current

    ensureWeddingRef.current = createWedding(wedding)
      .then(remoteWedding => {
        let nextWedding = null
        setWedding(prev => {
          const next = mergeRemoteWedding(prev, remoteWedding)
          nextWedding = next
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          } catch {
            // localStorage quota exceeded (e.g. large base64 images)
          }
          return next
        })
        return nextWedding ?? mergeRemoteWedding(wedding, remoteWedding)
      })
      .finally(() => {
        ensureWeddingRef.current = null
      })

    return ensureWeddingRef.current
  }

  return (
    <WeddingContext.Provider value={{ wedding, publishedWedding, loadingWedding, updateWedding, publishWedding, ensureWedding, resetWedding, createWeddingSite, deleteWeddingSite }}>
      {children}
    </WeddingContext.Provider>
  )
}

export const useWedding = () => useContext(WeddingContext)

function normalizeWedding(wedding) {
  const normalized = stripLegacyExampleDefaults(wedding)
  const sampleFields = sampleWeddingFields()
  return preserveOrGenerateSlug({
    ...draftWedding(),
    ...normalized,
    template: normalizeTemplateId(normalized.template),
    galleryCustomized: normalized.galleryCustomized ?? false,
    coverImage: normalized.coverImage || sampleFields.coverImage,
    galleryImages: realMediaItems(normalized.galleryImages ?? []),
    gifts: normalized.gifts ?? [],
    giftsCustomized: normalized.giftsCustomized ?? false,
    sections: normalized.sections ?? [],
  })
}

function normalizeTemplateId(template) {
  if (template === 'classic') return 'ivory'
  if (template === 'minimal') return 'bali'
  if (template === 'floral') return 'celestial'
  return template || mockWedding.template
}

function draftWedding() {
  const sampleFields = sampleWeddingFields()
  return withGeneratedSlug({
    id: mockWedding.id,
    slug: 'meu-casamento',
    groomName: '',
    brideName: '',
    date: '',
    venue: '',
    message: '',
    story: '',
    template: mockWedding.template,
    primaryColor: mockWedding.primaryColor,
    guestCount: 0,
    rsvpEnabled: true,
    sections: [],
    giftPixKey: '',
    giftPixQrCode: '',
    gifts: sampleFields.gifts,
    giftsCustomized: false,
    coverImage: sampleFields.coverImage,
    galleryImages: [],
    galleryCustomized: false,
  })
}

function mergeRemoteWedding(localWedding, remoteWedding) {
  const sampleFields = sampleWeddingFields()
  const remoteGalleryImages = realMediaItems(remoteWedding.galleryImages ?? [])
  const localGalleryImages = realMediaItems(localWedding.galleryImages ?? [])
  const hasRemoteGallery = Boolean(remoteGalleryImages.length)
  const galleryCustomized = Boolean(localWedding.galleryCustomized || hasRemoteGallery)
  const hasRemoteGifts = Boolean(remoteWedding.gifts?.length)
  const giftsCustomized = Boolean(localWedding.giftsCustomized || hasRemoteGifts)
  return preserveOrGenerateSlug({
    ...draftWedding(),
    ...localWedding,
    id: remoteWedding.id,
    brideName: remoteWedding.brideName ?? localWedding.brideName ?? '',
    groomName: remoteWedding.groomName ?? localWedding.groomName ?? '',
    date: remoteWedding.weddingDate ?? localWedding.date ?? '',
    slug: remoteWedding.slug ?? localWedding.slug,
    venue: remoteWedding.venue ?? '',
    message: remoteWedding.message ?? '',
    story: remoteWedding.story ?? '',
    template: normalizeTemplateId(remoteWedding.template ?? localWedding.template),
    primaryColor: remoteWedding.primaryColor ?? localWedding.primaryColor,
    sections: remoteWedding.sections ?? [],
    giftPixKey: remoteWedding.giftPixKey ?? '',
    coverImage: remoteWedding.coverImage ?? sampleFields.coverImage,
    galleryCustomized,
    galleryImages: hasRemoteGallery ? remoteGalleryImages : localGalleryImages,
    giftPixQrCode: remoteWedding.giftPixQrCode ?? '',
    gifts: hasRemoteGifts
      ? remoteWedding.gifts
      : giftsCustomized
      ? (localWedding.gifts ?? [])
      : sampleFields.gifts,
    giftsCustomized,
  })
}

function newDraftWedding(localWedding) {
  const sampleFields = sampleWeddingFields()
  const galleryCustomized = Boolean(localWedding.galleryCustomized)
  return preserveOrGenerateSlug({
    ...draftWedding(),
    ...localWedding,
    id: mockWedding.id,
    template: normalizeTemplateId(localWedding.template),
    coverImage: sampleFields.coverImage,
    galleryCustomized,
    galleryImages: realMediaItems(localWedding.galleryImages ?? []),
    giftPixQrCode: '',
    gifts: localWedding.giftsCustomized ? (localWedding.gifts ?? []) : sampleFields.gifts,
    giftsCustomized: Boolean(localWedding.giftsCustomized),
    guestCount: 0,
  })
}

function sampleWeddingFields() {
  return {
    coverImage: sampleMedia(mockWedding.coverImage, 'cover'),
    galleryImages: [],
    gifts: mockWedding.gifts.slice(0, 4).map(({ source, ...gift }) => ({ ...gift })),
  }
}

function realMediaItems(items = []) {
  return items.filter(item => item && item.source !== 'sample' && typeof item !== 'string')
}

function stripLegacyExampleDefaults(wedding) {
  if (
    wedding?.slug === mockWedding.slug
    && wedding?.brideName === mockWedding.brideName
    && wedding?.groomName === mockWedding.groomName
    && wedding?.date === mockWedding.date
  ) {
    return {
      ...wedding,
      slug: 'meu-casamento',
      groomName: '',
      brideName: '',
      date: '',
      venue: '',
      message: '',
      story: '',
      sections: [],
      gifts: [],
      giftsCustomized: true,
      giftPixKey: '',
      giftPixQrCode: '',
    }
  }
  return wedding
}

function withGeneratedSlug(wedding) {
  return {
    ...wedding,
    slug: buildWeddingSlug(wedding),
  }
}

function preserveOrGenerateSlug(wedding) {
  return {
    ...wedding,
    slug: wedding.slug || buildWeddingSlug(wedding),
  }
}

function savePublishedWedding(wedding) {
  setLocalStorageJson(PUBLISHED_STORAGE_KEY, wedding)
}

function setLocalStorageJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage quota exceeded (e.g. large base64 images)
  }
}

function buildWeddingSlug(wedding) {
  const bride = slugify(firstName(wedding?.brideName))
  const groom = slugify(firstName(wedding?.groomName))
  const names = [bride, groom].filter(Boolean)
  const namePart = names.length === 2 ? `${names[0]}-e-${names[1]}` : (names[0] ?? 'meu-casamento')
  const datePart = slugDate(wedding?.date)
  return `${namePart}${datePart}`
}

function slugDate(date) {
  const match = String(date ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return match ? `-${match[3]}-${match[2]}-${match[1]}` : ''
}

function firstName(value) {
  return String(value ?? '').trim().split(/\s+/)[0] || ''
}

function slugify(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
