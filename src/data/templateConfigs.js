/**
 * Visual config for each template ID.
 * Used by TemplateCard (preview), Editor (preview) and WeddingSite (rendered site).
 *
 * Templates:
 *  - ivory     → "Ivory"
 *  - bali      → "Bali"
 *  - celestial → "Celestial"
 */
export const templateConfigs = {

  // ─────────────────────────────────────────────────────────────────
  // COUTURE — editorial fashion magazine
  // ─────────────────────────────────────────────────────────────────
  ivory: {
    id: 'ivory',
    label: 'Ivory',

    // Hero
    heroBg: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.7) 100%)',
    labelClass: 'text-[9px] uppercase tracking-[0.7em] text-white/50 mb-10',
    nameClass: 'font-sans font-black text-5xl sm:text-7xl uppercase leading-none',
    nameStyle: { letterSpacing: '0.1em' },
    ampersandClass: 'block text-white/20 text-2xl font-thin tracking-[0.5em] my-3',
    dateClass: 'text-white/50 text-[10px] tracking-[0.5em] uppercase mt-6',
    messageClass: 'hidden',   // no quote in couture

    // Section backgrounds & text
    sectionBg: 'bg-white',
    sectionText: 'text-stone-900',
    altSectionBg: 'bg-stone-950',
    altSectionText: 'text-white',

    // Typography in sections
    sectionLabelClass: 'text-[9px] uppercase tracking-[0.6em] text-stone-400 mb-4',
    sectionLabelDarkClass: 'text-[9px] uppercase tracking-[0.6em] text-white/30 mb-4',
    sectionHeadingClass: 'font-sans font-extrabold text-3xl uppercase tracking-widest',
    sectionHeadingDarkClass: 'font-sans font-extrabold text-3xl uppercase tracking-widest text-white',
    storyClass: 'text-stone-500 text-base leading-loose text-center font-light max-w-2xl mx-auto',

    // Gallery
    galleryRadius: 'rounded-none',

    // Divider style
    divider: 'border-t border-stone-200',
    dividerDark: 'border-t border-white/10',

    // CTA button
    btnRadius: 'rounded-none',
    btnBgClass: 'bg-white text-stone-900',
  },

  // ─────────────────────────────────────────────────────────────────
  // BALI — warm boho modern, terracota & creme
  // ─────────────────────────────────────────────────────────────────
  bali: {
    id: 'bali',
    label: 'Bali',

    // Hero
    heroBg: 'linear-gradient(to bottom, rgba(180,100,50,0.2) 0%, rgba(0,0,0,0.1) 40%, rgba(100,50,20,0.7) 100%)',
    labelClass: 'text-xs uppercase tracking-[0.3em] text-amber-100/70 mb-6',
    nameClass: 'font-serif italic text-5xl sm:text-7xl leading-tight',
    nameStyle: {},
    ampersandClass: 'text-amber-200/50 text-3xl font-light not-italic',
    dateClass: 'text-amber-100/70 text-sm capitalize mt-4 mb-2',
    messageClass: 'text-amber-100/50 text-sm italic max-w-sm mx-auto mt-4',

    // Section backgrounds & text
    sectionBg: 'bg-[#FBF6EF]',
    sectionText: 'text-stone-800',
    altSectionBg: 'bg-[#F2E8DC]',
    altSectionText: 'text-stone-700',

    // Typography
    sectionLabelClass: 'text-[10px] uppercase tracking-[0.4em] text-amber-700/60 mb-3',
    sectionLabelDarkClass: 'text-[10px] uppercase tracking-[0.4em] text-amber-700/60 mb-3',
    sectionHeadingClass: 'font-serif italic text-4xl text-stone-800',
    sectionHeadingDarkClass: 'font-serif italic text-4xl text-stone-800',
    storyClass: 'text-stone-600 text-lg leading-relaxed text-center font-light italic max-w-2xl mx-auto',

    galleryRadius: 'rounded-3xl',
    divider: 'border-t border-amber-200',
    dividerDark: 'border-t border-amber-200',
    btnRadius: 'rounded-full',
    btnBgClass: 'bg-amber-700 text-white',
  },

  // ─────────────────────────────────────────────────────────────────
  // CELESTIAL — dark luxury, indigo/charcoal + dourado
  // ─────────────────────────────────────────────────────────────────
  celestial: {
    id: 'celestial',
    label: 'Celestial',

    // Hero
    heroBg: 'linear-gradient(to bottom, rgba(10,8,30,0.7) 0%, rgba(10,8,30,0.4) 40%, rgba(10,8,30,0.85) 100%)',
    labelClass: 'text-[9px] uppercase tracking-[0.6em] text-yellow-300/50 mb-8',
    nameClass: 'font-serif text-5xl sm:text-7xl leading-tight',
    nameStyle: { textShadow: '0 0 60px rgba(200,160,60,0.3)' },
    ampersandClass: 'text-yellow-400/30 text-3xl font-light',
    dateClass: 'text-yellow-200/50 text-xs tracking-widest uppercase mt-5',
    messageClass: 'text-yellow-100/40 text-sm italic max-w-sm mx-auto mt-4',

    // Section backgrounds & text
    sectionBg: 'bg-[#0D0B1A]',
    sectionText: 'text-white',
    altSectionBg: 'bg-[#13101F]',
    altSectionText: 'text-white',

    // Typography
    sectionLabelClass: 'text-[9px] uppercase tracking-[0.6em] text-yellow-400/50 mb-4',
    sectionLabelDarkClass: 'text-[9px] uppercase tracking-[0.6em] text-yellow-400/50 mb-4',
    sectionHeadingClass: 'font-serif text-4xl text-white',
    sectionHeadingDarkClass: 'font-serif text-4xl text-white',
    storyClass: 'text-white/60 text-lg leading-relaxed text-center font-light italic max-w-2xl mx-auto',

    galleryRadius: 'rounded-xl',
    divider: 'border-t border-white/10',
    dividerDark: 'border-t border-white/10',
    btnRadius: 'rounded-full',
    btnBgClass: 'bg-yellow-400 text-stone-900',
  },
}

templateConfigs.classic = templateConfigs.ivory
templateConfigs.minimal = templateConfigs.bali
templateConfigs.floral = templateConfigs.celestial

