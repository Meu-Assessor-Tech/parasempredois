import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { canSaveWedding, createWedding, getCurrentWedding } from '../api/weddings'
import { useAuth } from './AuthContext'
import { mockWedding } from '../data/mockWedding'
import { sampleMedia } from '../utils/media'

const STORAGE_KEY = 'baitacasamento_wedding'

const WeddingContext = createContext(null)

export function WeddingProvider({ children }) {
  const { user } = useAuth()
  const ensureWeddingRef = useRef(null)
  const [wedding, setWedding] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return mockWedding
      const parsed = JSON.parse(saved)
      // Prefer saved gifts array; fall back to mockWedding gifts if absent
      return {
        ...mockWedding,
        ...parsed,
        gifts:    parsed.gifts    ?? mockWedding.gifts,
        sections: parsed.sections ?? mockWedding.sections,
      }
    } catch {
      return mockWedding
    }
  })

  useEffect(() => {
    let cancelled = false

    if (!user) {
      setWedding(prev => ({ ...mockWedding, ...prev, id: mockWedding.id }))
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
  }, [user])

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
    setWedding(mockWedding)
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

function mergeRemoteWedding(localWedding, remoteWedding) {
  const sampleFields = sampleWeddingFields()
  return {
    ...mockWedding,
    ...localWedding,
    id: remoteWedding.id,
    coverImage: remoteWedding.coverImage ?? sampleFields.coverImage,
    galleryImages: remoteWedding.galleryImages?.length ? remoteWedding.galleryImages : sampleFields.galleryImages,
    giftPixQrCode: remoteWedding.giftPixQrCode ?? '',
    gifts: remoteWedding.gifts?.length ? remoteWedding.gifts : sampleFields.gifts,
  }
}

function newDraftWedding(localWedding) {
  const sampleFields = sampleWeddingFields()
  return {
    ...mockWedding,
    ...localWedding,
    id: mockWedding.id,
    coverImage: sampleFields.coverImage,
    galleryImages: sampleFields.galleryImages,
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
