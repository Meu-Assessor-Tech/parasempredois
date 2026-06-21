import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { canSaveWedding, createWedding, getCurrentWedding } from '../api/weddings'
import { useAuth } from './AuthContext'
import { mockWedding } from '../data/mockWedding'
import { sampleMedia } from '../utils/media'

const STORAGE_KEY = 'baitacasamento_wedding'
const PREVIEW_STORAGE_KEY = 'baitacasamento_preview_wedding'

const WeddingContext = createContext(null)

export function WeddingProvider({ children }) {
  const { user } = useAuth()
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

  useEffect(() => {
    let cancelled = false

    if (isExampleRoute) {
      setWedding(draftWedding())
      return
    }

    if (!user) {
      setWedding(prev => ({ ...draftWedding(), ...prev, id: mockWedding.id }))
      return
    }

    if (isPreviewRoute) {
      return
    }

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

    return () => {
      cancelled = true
    }
  }, [user, isPreviewRoute, isExampleRoute])

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

  const resetWedding = () => {
    localStorage.removeItem(STORAGE_KEY)
    setWedding(draftWedding())
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
    <WeddingContext.Provider value={{ wedding, updateWedding, ensureWedding, resetWedding }}>
      {children}
    </WeddingContext.Provider>
  )
}

export const useWedding = () => useContext(WeddingContext)

function normalizeWedding(wedding) {
  return {
    ...draftWedding(),
    ...wedding,
    template: normalizeTemplateId(wedding.template),
    galleryCustomized: wedding.galleryCustomized ?? false,
    gifts: wedding.gifts ?? sampleWeddingFields().gifts,
    sections: wedding.sections ?? mockWedding.sections,
  }
}

function normalizeTemplateId(template) {
  if (template === 'classic') return 'ivory'
  if (template === 'minimal') return 'bali'
  if (template === 'floral') return 'celestial'
  return template || mockWedding.template
}

function draftWedding() {
  const sampleFields = sampleWeddingFields()
  return {
    ...mockWedding,
    coverImage: sampleFields.coverImage,
    galleryImages: sampleFields.galleryImages,
    galleryCustomized: false,
    gifts: sampleFields.gifts,
  }
}

function mergeRemoteWedding(localWedding, remoteWedding) {
  const sampleFields = sampleWeddingFields()
  const hasRemoteGallery = Boolean(remoteWedding.galleryImages?.length)
  const galleryCustomized = Boolean(localWedding.galleryCustomized || hasRemoteGallery)
  return {
    ...mockWedding,
    ...localWedding,
    id: remoteWedding.id,
    template: normalizeTemplateId(localWedding.template),
    coverImage: remoteWedding.coverImage ?? sampleFields.coverImage,
    galleryCustomized,
    galleryImages: hasRemoteGallery
      ? remoteWedding.galleryImages
      : galleryCustomized
      ? (localWedding.galleryImages ?? [])
      : sampleFields.galleryImages,
    giftPixQrCode: remoteWedding.giftPixQrCode ?? '',
    gifts: remoteWedding.gifts?.length ? remoteWedding.gifts : sampleFields.gifts,
  }
}

function newDraftWedding(localWedding) {
  const sampleFields = sampleWeddingFields()
  const galleryCustomized = Boolean(localWedding.galleryCustomized)
  return {
    ...mockWedding,
    ...localWedding,
    id: mockWedding.id,
    template: normalizeTemplateId(localWedding.template),
    coverImage: sampleFields.coverImage,
    galleryCustomized,
    galleryImages: galleryCustomized ? (localWedding.galleryImages ?? []) : sampleFields.galleryImages,
    giftPixQrCode: '',
    gifts: sampleFields.gifts,
    guestCount: 0,
  }
}

function sampleWeddingFields() {
  return {
    coverImage: sampleMedia(mockWedding.coverImage, 'cover'),
    galleryImages: mockWedding.galleryImages.map((url, index) => sampleMedia(url, 'gallery', index)),
    gifts: mockWedding.gifts.map(gift => ({
      ...gift,
      source: 'sample',
      image: typeof gift.image === 'string' ? sampleMedia(gift.image, 'gift', gift.id) : gift.image,
    })),
  }
}
