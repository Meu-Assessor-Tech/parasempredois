import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Heart, MapPin, QrCode, X } from 'lucide-react'
import { mediaKey, mediaUrl } from '../../utils/media'

const ease = [0.22, 1, 0.36, 1]
const fadeUp = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } } }
const stagger = { visible: { transition: { staggerChildren: 0.11 } } }

function SectionLabel({ children }) {
  return <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent)] mb-4 font-medium">{children}</p>
}

function CountUnit({ value, label }) {
  return (
    <div className="rounded-3xl bg-white/70 border border-[#E8D8C8] px-4 py-5 text-center shadow-sm">
      <p className="font-serif text-3xl text-[#6C3F2B] leading-none">{String(value).padStart(2, '0')}</p>
      <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-[#A6785B]">{label}</p>
    </div>
  )
}

function galleryGridClass(count) {
  if (count === 1) return 'grid grid-cols-1 gap-4'
  if (count === 2) return 'grid grid-cols-2 gap-4'
  if (count === 3) return 'grid grid-cols-2 gap-4'
  if (count === 4) return 'grid grid-cols-2 gap-4'
  if (count === 5) return 'grid grid-cols-6 gap-4'
  return 'grid grid-cols-2 md:grid-cols-3 gap-4'
}

function galleryItemClass(count, index) {
  if (count === 1) return 'aspect-[16/10]'
  if (count === 3 && index === 0) return 'col-span-2 aspect-[16/10]'
  if (count === 5) return index < 2 ? 'col-span-3 aspect-[4/5]' : 'col-span-2 aspect-[4/5]'
  return 'aspect-[4/5]'
}

export default function BaliTemplate({ wedding }) {
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpGuests, setRsvpGuests] = useState('0')
  const [rsvpSent, setRsvpSent] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [pixCopied, setPixCopied] = useState(false)

  const galleryImages = (wedding.galleryImages ?? []).slice(0, 6)
  const accent = wedding.primaryColor || '#B46432'
  const giftPixKey = (wedding.giftPixKey ?? '').trim()
  const giftPixQrCode = wedding.giftPixQrCode ?? ''
  const canGiftWithPix = Boolean(giftPixKey)

  useEffect(() => {
    const tick = () => {
      const diff = new Date(wedding.date) - new Date()
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

  const dateShort = new Date(wedding.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const dateLong = new Date(wedding.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#FBF6EF] text-[#4B3328]" style={{ '--accent': accent }}>
      <section className="relative min-h-screen overflow-hidden flex items-center">
        <img src={mediaUrl(wedding.coverImage)} alt={`${wedding.brideName} & ${wedding.groomName}`} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5E2F1E]/80 via-[#8F4E2B]/35 to-transparent" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-xl text-white">
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.34em] text-[#F7D8BF] mb-7">Celebração de amor</motion.p>
            <motion.h1 variants={fadeUp} className="font-serif italic text-6xl sm:text-8xl leading-[0.95]">
              {wedding.brideName}
              <span className="block text-[#F7D8BF] text-4xl sm:text-5xl my-4">&</span>
              {wedding.groomName}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 text-[#F7EDE4] capitalize">{dateShort}</motion.p>
            <motion.p variants={fadeUp} className="mt-2 text-sm text-[#F7EDE4]/80">{wedding.venue}</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[#E8D8C8] bg-[#FFF9F2]">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[{ icon: Calendar, label: 'Data', value: dateLong }, { icon: MapPin, label: 'Local', value: wedding.venue }, { icon: Heart, label: 'Recado', value: wedding.message }].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center px-4">
              <Icon size={17} className="mx-auto text-[var(--accent)] mb-3" />
              <p className="text-[10px] uppercase tracking-[0.26em] text-[#A6785B] mb-2">{label}</p>
              <p className="text-sm leading-relaxed text-[#6C3F2B] capitalize">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp}><SectionLabel>Nossa história</SectionLabel></motion.div>
          <motion.h2 variants={fadeUp} className="font-serif italic text-5xl text-[#6C3F2B] mb-8">Como tudo começou</motion.h2>
          <motion.p variants={fadeUp} className="font-serif italic text-xl leading-loose text-[#7D5A49]">{wedding.story}</motion.p>
        </motion.div>
      </section>

      <section className="py-20 px-6 bg-[#F2E8DC]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp}><SectionLabel>Contagem regressiva</SectionLabel></motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CountUnit value={timeLeft.days} label="dias" />
            <CountUnit value={timeLeft.hours} label="horas" />
            <CountUnit value={timeLeft.minutes} label="min" />
            <CountUnit value={timeLeft.seconds} label="seg" />
          </motion.div>
        </motion.div>
      </section>

      {(wedding.sections ?? []).map(section => (
        <section key={section.id} className="py-18 px-6 border-t border-[#E8D8C8] bg-[#FFF9F2]">
          <div className="max-w-2xl mx-auto text-center">
            <SectionLabel>{section.title}</SectionLabel>
            <p className="text-[#7D5A49] leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        </section>
      ))}

      {galleryImages.length > 0 && (
        <section className="py-24 px-4 sm:px-6 bg-[#FBF6EF]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <SectionLabel>Galeria</SectionLabel>
              <h2 className="font-serif italic text-5xl text-[#6C3F2B]">Nossos momentos</h2>
            </div>
            <div className={galleryGridClass(galleryImages.length)}>
              {galleryImages.map((img, i) => (
                <button key={mediaKey(img, i)} type="button" onClick={() => setLightboxIndex(i)} className={`block w-full overflow-hidden rounded-[2rem] bg-[#E8D8C8] cursor-zoom-in focus:outline-none focus:ring-4 focus:ring-[#E8D8C8] ${galleryItemClass(galleryImages.length, i)}`}>
                  <img src={mediaUrl(img)} alt={`Momento ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {((wedding.gifts ?? []).length > 0 || canGiftWithPix || giftPixQrCode) && (
        <section className="py-24 px-4 sm:px-6 bg-[#FFF9F2]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <SectionLabel>Presentes</SectionLabel>
              <h2 className="font-serif italic text-5xl text-[#6C3F2B] mb-4">Um gesto de carinho</h2>
              <p className="text-sm text-[#7D5A49]">Copie a chave Pix e conclua a contribuição no app do seu banco.</p>
            </div>
            {(canGiftWithPix || giftPixQrCode) && (
              <div className="max-w-2xl mx-auto mb-10 rounded-[2rem] bg-[#FBF6EF] border border-[#E8D8C8] p-5 grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-5">
                <div className="aspect-square rounded-3xl bg-white border border-[#E8D8C8] flex items-center justify-center overflow-hidden">
                  {giftPixQrCode ? <img src={mediaUrl(giftPixQrCode)} alt="QR Code Pix" className="w-full h-full object-cover" /> : <QrCode size={34} className="text-[#D9BCA5]" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)] mb-3">Pix dos noivos</p>
                  <p className="text-xs text-[#8B6B5A] mb-4">A plataforma não processa pagamentos.</p>
                  {canGiftWithPix && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <code className="flex-1 rounded-2xl bg-white border border-[#E8D8C8] px-4 py-3 text-sm break-all">{giftPixKey}</code>
                      <button type="button" onClick={copyPix} className="rounded-2xl text-white px-4 py-3 text-sm font-medium flex items-center justify-center gap-2" style={{ backgroundColor: accent }}>
                        {pixCopied ? <Check size={14} /> : <Copy size={14} />}
                        {pixCopied ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(wedding.gifts ?? []).map(gift => (
                <div key={gift.id} className="rounded-[1.5rem] overflow-hidden bg-[#FBF6EF] border border-[#E8D8C8]">
                  <img src={mediaUrl(gift.image)} alt={gift.name} className="aspect-square w-full object-cover" />
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#A6785B] mb-1">{gift.category}</p>
                    <h3 className="text-sm font-medium text-[#4B3328]">{gift.name}</h3>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">R$ {gift.price.toLocaleString('pt-BR')}</span>
                      <button type="button" onClick={copyPix} disabled={!canGiftWithPix} className="rounded-full px-3 py-1.5 text-xs text-white disabled:bg-stone-300" style={{ backgroundColor: canGiftWithPix ? accent : '#D4D4D4' }}>{pixCopied ? 'Copiado' : 'Pix'}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 px-6 bg-[#FBF6EF]">
        <div className="max-w-md mx-auto text-center">
          <SectionLabel>Confirmação de presença</SectionLabel>
          <h2 className="font-serif italic text-5xl text-[#6C3F2B] mb-8">Você virá?</h2>
          <AnimatePresence mode="wait">
            {rsvpSent ? (
              <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-10">
                <Heart size={28} className="mx-auto text-[var(--accent)] fill-[var(--accent)] mb-4" />
                <p className="font-serif text-3xl text-[#6C3F2B]">Presença confirmada!</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={(e) => { e.preventDefault(); setRsvpSent(true) }} className="space-y-4">
                <input value={rsvpName} onChange={e => setRsvpName(e.target.value)} placeholder="Nome completo" required className="w-full rounded-2xl border border-[#E8D8C8] bg-white px-5 py-4 outline-none focus:border-[#B46432]" />
                <div className="relative">
                  <select value={rsvpGuests} onChange={e => setRsvpGuests(e.target.value)} className="w-full rounded-2xl border border-[#E8D8C8] bg-white px-5 py-4 appearance-none outline-none focus:border-[#B46432]">
                    <option value="0">Apenas eu</option>
                    <option value="1">Eu + 1 pessoa</option>
                    <option value="2">Eu + 2 pessoas</option>
                    <option value="3">Eu + 3 pessoas</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A6785B]" />
                </div>
                <button type="submit" className="w-full rounded-2xl px-5 py-4 text-white font-medium" style={{ backgroundColor: accent }}>Confirmar presença</button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      <footer className="py-16 px-6 text-center bg-[#4B3328] text-[#F7EDE4]">
        <p className="font-serif italic text-4xl mb-3">{wedding.brideName} & {wedding.groomName}</p>
        <p className="text-xs uppercase tracking-[0.3em] text-[#F7D8BF]/70 capitalize">{dateShort} · {wedding.venue}</p>
      </footer>

      <AnimatePresence>
        {lightboxIndex !== null && galleryImages[lightboxIndex] && (
          <motion.div className="fixed inset-0 z-50 bg-[#2E1D16]/95 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxIndex(null)}>
            <button type="button" onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"><X size={20} /></button>
            {galleryImages.length > 1 && (
              <>
                <button type="button" onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + galleryImages.length) % galleryImages.length) }} className="absolute left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"><ChevronLeft size={22} /></button>
                <button type="button" onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % galleryImages.length) }} className="absolute right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"><ChevronRight size={22} /></button>
              </>
            )}
            <img src={mediaUrl(galleryImages[lightboxIndex])} alt={`Momento ${lightboxIndex + 1} ampliado`} onClick={e => e.stopPropagation()} className="max-w-[92vw] max-h-[86vh] object-contain rounded-[2rem] shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
