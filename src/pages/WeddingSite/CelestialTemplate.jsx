import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Heart, MapPin, X } from 'lucide-react'
import { giftImageUrl, mediaKey, mediaUrl } from '../../utils/media'
import { giftImagePresetById } from '../../data/giftImagePresets'
import { formatWeddingDate, parseWeddingDate, weddingDisplayMessage, weddingDisplayNames, weddingDisplayRsvpMessage, weddingDisplayStory, weddingDisplayTitle, weddingDisplayVenue } from '../../utils/weddingDisplay'
import { submitRsvp } from '../../api/rsvps'
import RsvpFlow from '../../components/shared/RsvpFlow'
import ClickableQrCode from '../../components/shared/ClickableQrCode'

const ease = [0.22, 1, 0.36, 1]
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }
const stagger = { visible: { transition: { staggerChildren: 0.12 } } }

function SectionLabel({ children }) {
  return <p className="text-[10px] uppercase tracking-[0.46em] text-[var(--accent)] mb-5">{children}</p>
}

function CountUnit({ value, label }) {
  return (
    <div className="border border-white/10 bg-white/[0.035] px-4 py-6 text-center">
      <p className="font-serif text-4xl text-white leading-none">{String(value).padStart(2, '0')}</p>
      <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-white/40">{label}</p>
    </div>
  )
}

function galleryGridClass(count) {
  if (count === 1) return 'grid grid-cols-1 gap-3'
  if (count === 2) return 'grid grid-cols-2 gap-3'
  if (count === 3) return 'grid grid-cols-2 gap-3'
  if (count === 4) return 'grid grid-cols-2 gap-3'
  if (count === 5) return 'grid grid-cols-6 gap-3'
  return 'grid grid-cols-2 md:grid-cols-3 gap-3'
}

function galleryItemClass(count, index) {
  if (count === 1) return 'aspect-[16/10]'
  if (count === 3 && index === 0) return 'col-span-2 aspect-[16/10]'
  if (count === 5) return index < 2 ? 'col-span-3 aspect-[4/5]' : 'col-span-2 aspect-[4/5]'
  return 'aspect-[4/5]'
}

export default function CelestialTemplate({ wedding }) {
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpGuests, setRsvpGuests] = useState('0')
  const [rsvpSent, setRsvpSent] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [rsvpError, setRsvpError] = useState('')
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [pixCopied, setPixCopied] = useState(false)

  const accent = wedding.primaryColor || '#D8B76A'
  const galleryImages = (wedding.galleryImages ?? []).slice(0, 6)
  const giftPixKey = (wedding.giftPixKey ?? '').trim()
  const giftPixQrCode = wedding.giftPixQrCode ?? ''
  const canGiftWithPix = Boolean(giftPixKey)
  const { brideName, groomName } = weddingDisplayNames(wedding)
  const displayTitle = weddingDisplayTitle(wedding)
  const displayVenue = weddingDisplayVenue(wedding)
  const displayMessage = weddingDisplayMessage(wedding)
  const displayStory = weddingDisplayStory(wedding)

  useEffect(() => {
    if (!wedding.date) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      return
    }
    const tick = () => {
      const diff = parseWeddingDate(wedding.date) - new Date()
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [wedding.date])

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxIndex(null)
      if (event.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + galleryImages.length) % galleryImages.length)
      if (event.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % galleryImages.length)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [lightboxIndex, galleryImages.length])

  const copyPix = async () => {
    if (!giftPixKey) return
    try {
      await navigator.clipboard.writeText(giftPixKey)
      setPixCopied(true)
      window.setTimeout(() => setPixCopied(false), 1800)
    } catch {
      setPixCopied(false)
    }
  }

  const handleRsvp = async (event) => {
    event.preventDefault()
    setRsvpLoading(true)
    setRsvpError('')
    try {
      await submitRsvp(wedding.slug, { name: rsvpName, companions: rsvpGuests })
      setRsvpSent(true)
    } catch (err) {
      setRsvpError(err.message || 'Não foi possível confirmar presença.')
    } finally {
      setRsvpLoading(false)
    }
  }

  const dateShort = formatWeddingDate(wedding.date, { day: '2-digit', month: 'long', year: 'numeric' })
  const dateLong = formatWeddingDate(wedding.date, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#080713] text-white" style={{ '--accent': accent }}>
      <section id="preview-cover" className="relative min-h-screen overflow-hidden flex items-center justify-center text-center px-6">
        <img src={mediaUrl(wedding.coverImage)} alt={displayTitle} className="absolute inset-0 w-full h-full object-cover opacity-42" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,7,19,0.45),rgba(8,7,19,0.88)_70%,#080713)]" />
        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-5xl mx-auto">
          <motion.p variants={fadeUp} className="text-[10px] uppercase tracking-[0.55em] text-[var(--accent)] mb-8">Save the date</motion.p>
          <motion.h1 variants={fadeUp} className="font-serif text-6xl sm:text-8xl md:text-9xl leading-[0.9]">
            {brideName}
            <span className="block text-[var(--accent)] text-4xl sm:text-6xl my-5">&</span>
            {groomName}
          </motion.h1>
          <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-white/65">
            <span className="capitalize">{dateShort}</span>
            <span className="hidden sm:block h-px w-10 bg-white/20" />
            <span>{displayVenue}</span>
          </motion.div>
        </motion.div>
      </section>

      <section id="preview-details" className="px-6 py-16 border-y border-white/10 bg-[#0D0B1A]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{ icon: Calendar, label: 'Data', value: dateLong }, { icon: MapPin, label: 'Local', value: displayVenue }].map(({ icon: Icon, label, value }) => (
            <div key={label} className="border border-white/10 bg-white/[0.035] p-6 text-center">
              <Icon size={18} className="mx-auto mb-4 text-[var(--accent)]" />
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 mb-3">{label}</p>
              <p className="text-sm text-white/70 leading-relaxed capitalize [overflow-wrap:anywhere]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="preview-message" className="px-6 py-24 bg-[#13101F]">
        <div className="max-w-3xl mx-auto text-center">
          <SectionLabel>Mensagem especial</SectionLabel>
          <p className="font-serif text-2xl leading-loose text-white/62 italic [overflow-wrap:anywhere]">{displayMessage}</p>
        </div>
      </section>

      <section id="preview-story" className="px-6 py-28">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-14 items-start">
          <div>
            <SectionLabel>Nossa história</SectionLabel>
            <h2 className="font-serif text-5xl sm:text-6xl leading-tight">Como tudo começou</h2>
          </div>
          <p className="font-serif text-2xl leading-loose text-white/62 italic [overflow-wrap:anywhere]">{displayStory}</p>
        </div>
      </section>

      <section id="preview-countdown" className="px-6 py-20 bg-[#13101F] border-y border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <SectionLabel>Contagem regressiva</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border border-white/10">
            <CountUnit value={timeLeft.days} label="dias" />
            <CountUnit value={timeLeft.hours} label="horas" />
            <CountUnit value={timeLeft.minutes} label="min" />
            <CountUnit value={timeLeft.seconds} label="seg" />
          </div>
        </div>
      </section>

      {(wedding.sections ?? []).map(section => (
        <section key={section.id} id={`preview-section-${section.id}`} className="px-6 py-20 border-b border-white/10">
          <div className="max-w-3xl mx-auto">
            <SectionLabel>{section.title}</SectionLabel>
            <p className="text-white/65 leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        </section>
      ))}

      {galleryImages.length > 0 && (
        <section id="preview-gallery" className="px-4 sm:px-6 py-28 bg-[#0D0B1A]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-12">
              <div>
                <SectionLabel>Galeria</SectionLabel>
                <h2 className="font-serif text-5xl">Noite e memória</h2>
              </div>
              <p className="text-sm text-white/45 max-w-sm">Clique nas fotos para ampliar.</p>
            </div>
            <div className={galleryGridClass(galleryImages.length)}>
              {galleryImages.map((img, i) => (
                <button key={mediaKey(img, i)} type="button" onClick={() => setLightboxIndex(i)} className={`overflow-hidden bg-white/5 cursor-zoom-in border border-white/10 ${galleryItemClass(galleryImages.length, i)}`}>
                  <img src={mediaUrl(img)} alt={`Momento ${i + 1}`} className="w-full h-full object-cover opacity-90 transition duration-700 hover:scale-105 hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {((wedding.gifts ?? []).length > 0 || canGiftWithPix) && (
        <section id="preview-gifts" className="px-4 sm:px-6 py-28">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <SectionLabel>Presentes</SectionLabel>
              <h2 className="font-serif text-5xl mb-4">Um gesto para celebrar</h2>
              <p className="text-sm text-white/50">Os presentes abaixo são sugestões simbólicas.</p>
            </div>
            {canGiftWithPix && (
              <div className={`max-w-3xl mx-auto mb-12 border border-white/10 bg-white/[0.035] p-5 ${giftPixQrCode ? 'grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-5' : ''}`}>
                {giftPixQrCode && (
                  <ClickableQrCode src={giftPixQrCode} className="aspect-square border border-white/10 bg-[#080713] overflow-hidden focus:ring-[var(--accent)]" imageClassName="w-full h-full object-cover" />
                )}
                <div className="min-w-0 self-center">
                  <p className="text-xs uppercase tracking-[0.35em] text-[var(--accent)] mb-3">Pix dos noivos</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <code className="flex-1 border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75 break-all">{giftPixKey}</code>
                    <button type="button" onClick={copyPix} className="px-5 py-3 text-sm font-medium text-[#080713] flex items-center justify-center gap-2" style={{ backgroundColor: accent }}>
                      {pixCopied ? <Check size={14} /> : <Copy size={14} />}
                      {pixCopied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
              {(wedding.gifts ?? []).map(gift => {
                const imageUrl = giftImageUrl(gift, giftImagePresetById)
                return (
                  <div key={gift.id} className="bg-[#0D0B1A] p-4 grid grid-cols-[96px_1fr] gap-4">
                    <div className="w-24 h-24 bg-white/5">
                      {imageUrl && <img src={imageUrl} alt={gift.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-white truncate">{gift.name}</h3>
                      <p className="mt-1 text-sm text-white/45">R$ {gift.price.toLocaleString('pt-BR')}</p>
                      {canGiftWithPix && (
                        <button type="button" onClick={copyPix} className="mt-3 px-4 py-2 text-xs font-medium text-[#080713]" style={{ backgroundColor: accent }}>{pixCopied ? 'Copiado' : 'Pix'}</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {wedding.rsvpEnabled !== false && <section id="preview-rsvp" className="px-6 py-28 bg-[#13101F] border-t border-white/10">
        <div className="max-w-md mx-auto text-center">
          <SectionLabel>Confirmação de presença</SectionLabel>
          <h2 className="mb-4 font-serif text-5xl">Você virá?</h2>
          {weddingDisplayRsvpMessage(wedding) && <p className="mb-6 text-sm leading-relaxed text-white/60 whitespace-pre-line [overflow-wrap:anywhere]">{weddingDisplayRsvpMessage(wedding)}</p>}
          <RsvpFlow wedding={wedding} accent={accent} />
          {false && <AnimatePresence mode="wait">
            {rsvpSent ? (
              <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-10">
                <Heart size={28} className="mx-auto mb-4" style={{ color: accent, fill: accent }} />
                <p className="font-serif text-3xl">Presença confirmada!</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleRsvp} className="space-y-4">
                <input value={rsvpName} onChange={e => setRsvpName(e.target.value)} placeholder="Nome completo" required className="w-full border border-white/10 bg-black/20 px-5 py-4 text-white placeholder-white/30 outline-none focus:border-[var(--accent)]" />
                <div className="relative">
                  <select value={rsvpGuests} onChange={e => setRsvpGuests(e.target.value)} className="w-full border border-white/10 bg-black/20 px-5 py-4 text-white outline-none appearance-none focus:border-[var(--accent)]">
                    <option value="0">Apenas eu</option>
                    <option value="1">Eu + 1 pessoa</option>
                    <option value="2">Eu + 2 pessoas</option>
                    <option value="3">Eu + 3 pessoas</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40" />
                </div>
                {rsvpError && <p className="text-center text-xs text-red-300">{rsvpError}</p>}
                <button type="submit" disabled={rsvpLoading} className="w-full px-5 py-4 font-medium text-[#080713] disabled:opacity-60" style={{ backgroundColor: accent }}>
                  {rsvpLoading ? 'Confirmando...' : 'Confirmar presença'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>}
        </div>
      </section>}

      <footer className="px-6 py-16 text-center border-t border-white/10">
        <p className="font-serif text-4xl mb-3">{displayTitle}</p>
        <p className="text-xs uppercase tracking-[0.34em] text-white/35 capitalize">{dateShort} · {displayVenue}</p>
      </footer>

      <AnimatePresence>
        {lightboxIndex !== null && galleryImages[lightboxIndex] && (
          <motion.div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxIndex(null)}>
            <button type="button" onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"><X size={20} /></button>
            {galleryImages.length > 1 && (
              <>
                <button type="button" onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + galleryImages.length) % galleryImages.length) }} className="absolute left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"><ChevronLeft size={22} /></button>
                <button type="button" onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % galleryImages.length) }} className="absolute right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"><ChevronRight size={22} /></button>
              </>
            )}
            <img src={mediaUrl(galleryImages[lightboxIndex])} alt={`Momento ${lightboxIndex + 1} ampliado`} onClick={e => e.stopPropagation()} className="max-w-[92vw] max-h-[86vh] object-contain shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
