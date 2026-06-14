import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentWedding } from '../api/weddings'
import { useAuth } from './AuthContext'
import { mockWedding } from '../data/mockWedding'

const STORAGE_KEY = 'baitacasamento_wedding'

const WeddingContext = createContext(null)

export function WeddingProvider({ children }) {
  const { user } = useAuth()
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

  return (
    <WeddingContext.Provider value={{ wedding, updateWedding, resetWedding }}>
      {children}
    </WeddingContext.Provider>
  )
}

export const useWedding = () => useContext(WeddingContext)

function mergeRemoteWedding(localWedding, remoteWedding) {
  return {
    ...mockWedding,
    ...localWedding,
    id: remoteWedding.id,
    coverImage: remoteWedding.coverImage ?? localWedding.coverImage ?? mockWedding.coverImage,
    galleryImages: remoteWedding.galleryImages?.length
      ? remoteWedding.galleryImages
      : localWedding.galleryImages ?? mockWedding.galleryImages,
    giftPixQrCode: remoteWedding.giftPixQrCode ?? localWedding.giftPixQrCode ?? mockWedding.giftPixQrCode,
    gifts: remoteWedding.gifts?.length ? remoteWedding.gifts : localWedding.gifts ?? mockWedding.gifts,
  }
}
