import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { mediaUrl } from '../../utils/media'

export default function ClickableQrCode({ src, alt = 'QR Code Pix', className = '', imageClassName = '' }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = event => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  if (!src) return null

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Ampliar QR Code Pix" className={`w-full cursor-zoom-in transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}>
        <img src={mediaUrl(src)} alt={alt} className={imageClassName} />
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div role="dialog" aria-modal="true" aria-label="QR Code Pix ampliado" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-5 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar QR Code" className="absolute right-4 top-4 rounded-full bg-white/15 p-3 text-white transition hover:bg-white/25"><X size={22} /></button>
              <motion.img src={mediaUrl(src)} alt={`${alt} ampliado`} className="max-h-[82vh] max-w-[90vw] rounded-2xl bg-white p-3 object-contain shadow-2xl" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={event => event.stopPropagation()} />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
