/**
 * IvoryTemplate — "Ivory"
 * Elegant, timeless. Serif names stacked, warm stone tones, editorial feel.
 *
 * Contract: receives { wedding } object with the standard fields.
 * To add a new template: copy this file, rename, restyle, then register in:
 *   - src/data/mockTemplates.js  (metadata + preview)
 *   - src/pages/WeddingSite/index.jsx  (import + TEMPLATE_MAP)
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MapPin, Calendar, ChevronDown, ShoppingBag } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1]
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease } } }
const stagger = { visible: { transition: { staggerChildren: 0.13 } } }

function CountUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-[68px] sm:w-[88px] h-[68px] sm:h-[88px] flex items-center justify-center bg-white border border-stone-100 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <span className="font-serif text-[1.75rem] sm:text-[2.25rem] font-light text-stone-900 leading-none tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-stone-400 font-sans">{label}</span>
    </div>
  )
}

function Ornament({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px bg-stone-100" />
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full bg-stone-200" />
        <div className="w-[5px] h-[5px] rounded-full bg-sand-300" />
        <div className="w-1 h-1 rounded-full bg-stone-200" />
      </div>
      <div className="flex-1 h-px bg-stone-100" />
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-sand-500 mb-5 font-sans font-medium">
      {children}
    </p>
  )
}

export default function IvoryTemplate({ wedding }) {
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpGuests, setRsvpGuests] = useState('0')
  const [rsvpSent, setRsvpSent] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = new Date(wedding.date) - new Date()
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [wedding.date])

  const handleRsvp = (e) => { e.preventDefault(); setRsvpSent(true) }

  const weddingDate = new Date(wedding.date)
  const dateShort = weddingDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const dateLong  = weddingDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-900">

      {/* HERO */}
      <section className="relative h-screen min-h-[640px] flex flex-col items-center justify-center overflow-hidden">
        <motion.div initial={{ scale: 1.07 }} animate={{ scale: 1 }} transition={{ duration: 4, ease: [0.25, 0.46, 0.45, 0.94] }} className="absolute inset-0">
          <img src={wedding.coverImage} alt={`${wedding.brideName} & ${wedding.groomName}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(14,11,8,0.46) 0%, rgba(14,11,8,0.06) 38%, rgba(14,11,8,0.52) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 50%, rgba(14,11,8,0.18) 100%)' }} />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 flex flex-col items-center text-center px-8 select-none">
          <motion.p variants={fadeUp} className="text-xs sm:text-sm uppercase tracking-[0.28em] text-white/70 mb-10 sm:mb-12 font-sans font-light">Save the Date</motion.p>
          <motion.h1 variants={fadeUp} className="font-serif font-normal leading-[0.95] text-white" style={{ fontSize: 'clamp(3.75rem, 9.5vw, 8rem)' }}>{wedding.brideName}</motion.h1>
          <motion.div variants={fadeUp} className="flex items-center gap-5 my-6">
            <div className="w-14 h-px bg-white/15" />
            <Heart size={9} className="fill-white/20 text-white/20" strokeWidth={0} />
            <div className="w-14 h-px bg-white/15" />
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-serif font-normal leading-[0.95] text-white" style={{ fontSize: 'clamp(3.75rem, 9.5vw, 8rem)' }}>{wedding.groomName}</motion.h1>
          <motion.p variants={fadeUp} className="mt-10 sm:mt-12 text-sm sm:text-base uppercase tracking-[0.2em] text-white/80 capitalize">{dateShort}</motion.p>
          <motion.p variants={fadeUp} className="mt-2.5 text-xs sm:text-sm uppercase tracking-[0.14em] text-white/75">{wedding.venue}</motion.p>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
          <motion.div animate={{ scaleY: [0, 1, 0], opacity: [0, 0.4, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut', repeatDelay: 0.4 }} className="w-px h-12 bg-white origin-top" />
        </div>
      </section>

      {/* INFO STRIP */}
      <section className="bg-white border-y border-stone-100">
        <div className="max-w-3xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0">
          {[
            { icon: Calendar, label: 'Data',   value: dateLong },
            { icon: MapPin,   label: 'Local',  value: wedding.venue },
            { icon: Heart,    label: 'Recado', value: wedding.message.length > 58 ? wedding.message.slice(0, 58) + '…' : wedding.message },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={i} className={`flex flex-col items-center text-center gap-3.5 px-6 ${i < 2 ? 'sm:border-r border-stone-100' : ''}`}>
              <Icon size={15} strokeWidth={1.7} className="text-sand-400" />
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.24em] text-stone-500">{label}</p>
              <p className="text-[15px] sm:text-base text-stone-700 font-light leading-relaxed capitalize max-w-[220px]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COUNTDOWN */}
      <section className="py-28 px-6 bg-[#FAFAF8]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="max-w-2xl mx-auto text-center">
          <motion.div variants={fadeUp}><SectionLabel>Contagem regressiva</SectionLabel></motion.div>
          <motion.h2 variants={fadeUp} className="font-serif text-[2.2rem] sm:text-[2.6rem] font-normal text-stone-900 mb-14 leading-tight">O grande dia se aproxima</motion.h2>
          <motion.div variants={fadeUp} className="flex items-end justify-center gap-3 sm:gap-5">
            <CountUnit value={timeLeft.days} label="dias" />
            <div className="w-px h-10 bg-stone-200 mb-11" />
            <CountUnit value={timeLeft.hours} label="horas" />
            <div className="w-px h-10 bg-stone-200 mb-11" />
            <CountUnit value={timeLeft.minutes} label="min" />
            <div className="w-px h-10 bg-stone-200 mb-11" />
            <CountUnit value={timeLeft.seconds} label="seg" />
          </motion.div>
          <motion.div variants={fadeUp} className="mt-12 flex items-center justify-center gap-2 text-stone-400">
            <MapPin size={11} strokeWidth={1.5} />
            <span className="text-xs font-light capitalize">{wedding.venue}</span>
          </motion.div>
        </motion.div>
      </section>

      <Ornament className="max-w-64 mx-auto" />

      {/* NOSSA HISTÓRIA */}
      <section className="py-28 px-6 bg-[#FAFAF8]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="max-w-xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <SectionLabel>Nossa história</SectionLabel>
            <h2 className="font-serif text-[2.2rem] sm:text-[2.6rem] font-normal text-stone-900 leading-tight">Como tudo começou</h2>
          </motion.div>
          <motion.div variants={fadeUp} className="relative px-4 sm:px-10">
            <span className="absolute -top-4 left-0 sm:left-4 font-serif text-[5.5rem] leading-none text-sand-100 select-none pointer-events-none" aria-hidden>"</span>
            <p className="relative font-serif italic text-[1.2rem] sm:text-[1.35rem] text-stone-500 leading-[1.8] text-center pt-10 pb-4">{wedding.story}</p>
            <span className="absolute -bottom-8 right-0 sm:right-4 font-serif text-[5.5rem] leading-none text-sand-100 select-none pointer-events-none" aria-hidden>"</span>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-20 flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-stone-200" />
            <p className="font-serif italic text-sm text-stone-400">{wedding.brideName} & {wedding.groomName}</p>
            <div className="w-8 h-px bg-stone-200" />
          </motion.div>
        </motion.div>
      </section>

      {/* SEÇÕES PERSONALIZADAS */}
      {(wedding.sections ?? []).length > 0 && (wedding.sections ?? []).map(section => (
        <section key={section.id} className="py-20 px-6 bg-white border-t border-stone-100">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="max-w-xl mx-auto text-center"
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>{section.title}</SectionLabel>
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="text-stone-500 text-[1rem] font-light leading-relaxed whitespace-pre-line"
            >
              {section.content}
            </motion.p>
          </motion.div>
        </section>
      ))}

      {/* GALERIA */}
      {wedding.galleryImages.length > 0 && (
        <section className="py-24 px-4 sm:px-6 bg-white">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-14">
              <SectionLabel>Galeria</SectionLabel>
              <h2 className="font-serif text-[2.2rem] sm:text-[2.6rem] font-normal text-stone-900 leading-tight">Nossos momentos</h2>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 sm:auto-rows-[210px]">
              {wedding.galleryImages.slice(0, 7).map((img, i) => (
                <motion.div key={i} whileHover={{ scale: 1.018 }} transition={{ duration: 0.4, ease }}
                  className={`group overflow-hidden rounded-2xl bg-stone-100 cursor-pointer ${i === 0 && wedding.galleryImages.length > 2 ? 'sm:col-span-2 sm:row-span-2 aspect-square sm:aspect-auto' : 'aspect-square'}`}>
                  <img src={img} alt={`Momento ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                </motion.div>
              ))}
            </motion.div>
            {wedding.galleryImages.length > 7 && (
              <motion.p variants={fadeUp} className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-stone-400 font-light">
                + {wedding.galleryImages.length - 7} fotos
              </motion.p>
            )}
          </motion.div>
        </section>
      )}

      <Ornament className="max-w-64 mx-auto" />

      {/* LISTA DE PRESENTES */}
      {(wedding.gifts ?? []).length > 0 && (
        <section className="py-28 px-4 sm:px-6 bg-[#FAFAF8]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-14">
              <SectionLabel>Lista de presentes</SectionLabel>
              <h2 className="font-serif text-[2.2rem] sm:text-[2.6rem] font-normal text-stone-900 mb-4 leading-tight">Presenteie com amor</h2>
              <p className="text-stone-400 text-sm font-light max-w-[280px] mx-auto leading-relaxed">Cada gesto carinhoso torna este dia ainda mais especial.</p>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {(wedding.gifts ?? []).map((gift, i) => (
                <motion.div key={gift.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.7, ease }} whileHover={{ y: -5 }}
                  className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-stone-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
                  <div className="aspect-square overflow-hidden bg-stone-50">
                    <img src={gift.image} alt={gift.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-stone-400 mb-1.5">{gift.category}</p>
                    <h3 className="font-medium text-stone-900 text-sm leading-snug mb-0.5">{gift.name}</h3>
                    <p className="text-xs text-stone-400 font-light mb-4">{gift.store}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-stone-800">R$ {gift.price.toLocaleString('pt-BR')}</span>
                      <button
                        className="flex items-center gap-1 text-[11px] font-medium text-white px-3 py-1.5 rounded-full active:scale-95 transition-all duration-150"
                        style={{ backgroundColor: wedding.primaryColor }}
                      >
                        <ShoppingBag size={9} /> Presentear
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* RSVP */}
      <section className="py-28 px-6 bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="max-w-[400px] mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <SectionLabel>Confirmação de presença</SectionLabel>
            <h2 className="font-serif text-[2.2rem] sm:text-[2.6rem] font-normal text-stone-900 mb-4 leading-tight">Você virá?</h2>
            <p className="text-stone-400 text-sm font-light leading-relaxed">
              Sua presença é o maior presente.{' '}
              <span className="text-stone-500">Confirme até 30 de agosto.</span>
            </p>
          </motion.div>
          <AnimatePresence mode="wait">
            {rsvpSent ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.55, ease }} className="text-center py-14">
                <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 20 }} className="w-16 h-16 rounded-full bg-sand-50 border border-sand-100 flex items-center justify-center mx-auto mb-7">
                  <Heart size={20} className="fill-sand-400 text-sand-400" strokeWidth={0} />
                </motion.div>
                <h3 className="font-serif text-3xl text-stone-900 mb-3">Presença confirmada!</h3>
                <p className="text-stone-400 text-sm font-light">Mal podemos esperar para celebrar com você.</p>
              </motion.div>
            ) : (
              <motion.form key="form" variants={stagger} onSubmit={handleRsvp} className="space-y-5">
                <motion.div variants={fadeUp}>
                  <label className="block text-[10px] uppercase tracking-[0.4em] text-stone-400 mb-2.5">Seu nome</label>
                  <input type="text" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="Nome completo" required className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-300 text-sm font-light outline-none focus:border-sand-300 focus:ring-4 focus:ring-sand-50/60 transition-all duration-200" />
                </motion.div>
                <motion.div variants={fadeUp} className="relative">
                  <label className="block text-[10px] uppercase tracking-[0.4em] text-stone-400 mb-2.5">Acompanhantes</label>
                  <select value={rsvpGuests} onChange={(e) => setRsvpGuests(e.target.value)} className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 text-sm font-light outline-none focus:border-sand-300 focus:ring-4 focus:ring-sand-50/60 transition-all duration-200 appearance-none cursor-pointer">
                    <option value="0">Apenas eu</option>
                    <option value="1">Eu + 1 pessoa</option>
                    <option value="2">Eu + 2 pessoas</option>
                    <option value="3">Eu + 3 pessoas</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-4 bottom-4 text-stone-400 pointer-events-none" />
                </motion.div>
                <motion.div variants={fadeUp} className="pt-1">
                  <button type="submit" className="w-full py-4 text-white text-sm font-medium tracking-[0.08em] rounded-xl active:scale-[0.98] transition-all duration-200" style={{ backgroundColor: wedding.primaryColor }}>Confirmar presença</button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative py-20 px-6 bg-[#FAFAF8] border-t border-stone-100 text-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
          <span className="font-serif text-[22rem] leading-none text-stone-900" style={{ opacity: 0.018 }}>&</span>
        </div>
        <div className="relative">
          <Heart size={13} className="mx-auto mb-8" style={{ fill: wedding.primaryColor, color: wedding.primaryColor }} strokeWidth={0} />
          <p className="font-serif text-[1.85rem] sm:text-[2.2rem] font-normal text-stone-900 leading-snug mb-3">
            {wedding.brideName}{' '}
            <span className="font-serif italic text-stone-400 text-[1.4rem] sm:text-[1.6rem]">&</span>{' '}
            {wedding.groomName}
          </p>
          <p className="text-[10px] uppercase tracking-[0.5em] text-stone-400 mb-10 capitalize">{dateShort} · {wedding.venue}</p>
          <div className="flex items-center gap-3 max-w-[120px] mx-auto mb-10">
            <div className="flex-1 h-px bg-stone-100" />
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-stone-200" />
              <div className="w-[5px] h-[5px] rounded-full bg-sand-300" />
              <div className="w-1 h-1 rounded-full bg-stone-200" />
            </div>
            <div className="flex-1 h-px bg-stone-100" />
          </div>
          <p className="text-xs text-stone-300 font-light">
            Site criado com{' '}
            <a href="/" className="text-stone-400 hover:text-sand-500 transition-colors duration-200">Nosso Dia</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
