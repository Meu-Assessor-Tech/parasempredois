import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Smartphone, Save, Upload, Plus, Check, Trash2, Eye, Pencil, X, QrCode, GripVertical } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { canUploadMedia, deleteWeddingDesignImages, deleteWeddingImage, uploadWeddingImage } from '../../api/media'
import { saveWeddingMedia } from '../../api/weddings'
import { useWedding } from '../../context/WeddingContext'
import { mockTemplates } from '../../data/mockTemplates'
import { mockWedding } from '../../data/mockWedding'
import { giftImageUrl, IMAGE_MIME_TYPES, isSampleMedia, isStoredMedia, mediaKey, mediaUrl, processImageFile, sampleMedia } from '../../utils/media'
import { giftImagePresetById, giftImagePresetCategories } from '../../data/giftImagePresets'

const TABS = [
  { id: 'content', label: 'Conteúdo' },
  { id: 'design', label: 'Design' },
  { id: 'gifts', label: 'Presentes' },
  { id: 'share', label: 'Compartilhar' },
]

const COLORS = [
  // Neutros & clássicos
  { label: 'Areia',      value: '#8B6F5E' },
  { label: 'Dourado',    value: '#B8922A' },
  { label: 'Champagne',  value: '#C9A96E' },
  { label: 'Marfim',     value: '#D4C5A9' },
  { label: 'Cobre',      value: '#AD6F3B' },
  { label: 'Preto',      value: '#1A1A1A' },
  // Rosas & vermelhos
  { label: 'Rosa Antigo',value: '#C4858E' },
  { label: 'Rosé',       value: '#E8A598' },
  { label: 'Blush',      value: '#F2C4CE' },
  { label: 'Borgonha',   value: '#722F37' },
  { label: 'Marsala',    value: '#964F4C' },
  { label: 'Vermelho',   value: '#C0392B' },
  // Verdes
  { label: 'Sage',       value: '#7A9A7A' },
  { label: 'Eucalipto',  value: '#44786A' },
  { label: 'Oliva',      value: '#708238' },
  { label: 'Verde Escuro',value: '#2D5A27' },
  // Azuis & roxos
  { label: 'Azul Serenity',value: '#92A8D1' },
  { label: 'Azul Petróleo',value: '#2C5F6E' },
  { label: 'Navy',       value: '#1B2A4A' },
  { label: 'Lavanda',    value: '#967BB6' },
  { label: 'Lilás',      value: '#B39BC8' },
  { label: 'Ametista',   value: '#7B4EA6' },
  // Terrosos
  { label: 'Terracota',  value: '#C0714A' },
  { label: 'Caramelo',   value: '#C17F4A' },
]

const MAX_GALLERY_IMAGES = 6
const PREVIEW_STORAGE_KEY = 'baitacasamento_preview_wedding'

function realMediaItems(items = []) {
  return items.filter(item => !isSampleMedia(item) && typeof item !== 'string')
}

function PreviewJumpButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-stone-200 px-2.5 py-1 text-[10px] font-medium text-stone-500 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800"
    >
      Ir para
    </button>
  )
}

export default function Editor() {
  const { wedding, updateWedding, ensureWedding } = useWedding()
  const [previewMode, setPreviewMode] = useState('desktop')
  const [saved, setSaved] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [draggedGalleryIndex, setDraggedGalleryIndex] = useState(null)
  const coverInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const previewIframeRef = useRef(null)
  const previewScrollRef = useRef({ top: 0, left: 0 })
  const previewSessionKeyRef = useRef(`${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const debounceRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const VALID_TABS = TABS.map(t => t.id)
  const tabFromUrl = new URLSearchParams(location.search).get('tab')
  const activeTab = VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'content'

  const setActiveTab = (id) => {
    const params = id === 'content' ? '' : `?tab=${id}`
    navigate(`/editor${params}`, { replace: true })
  }

  // Debounced preview reload — fires 800ms after last change
  const capturePreviewScroll = useCallback(() => {
    try {
      const win = previewIframeRef.current?.contentWindow
      if (!win) return
      previewScrollRef.current = {
        top: win.scrollY || win.document?.documentElement?.scrollTop || 0,
        left: win.scrollX || win.document?.documentElement?.scrollLeft || 0,
      }
    } catch {
      previewScrollRef.current = { top: 0, left: 0 }
    }
  }, [])

  const restorePreviewScroll = useCallback(() => {
    const { top, left } = previewScrollRef.current
    window.setTimeout(() => {
      try {
        previewIframeRef.current?.contentWindow?.scrollTo(left, top)
      } catch {
        // Same-origin preview should be accessible; ignore browser restrictions.
      }
    }, 80)
  }, [])

  const scrollPreviewTo = useCallback((sectionId) => {
    try {
      const doc = previewIframeRef.current?.contentDocument
      const target = doc?.getElementById(sectionId)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {
      // Same-origin preview should be accessible; ignore browser restrictions.
    }
  }, [])

  const schedulePreviewReload = useCallback(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      capturePreviewScroll()
      setPreviewKey(k => k + 1)
    }, 800)
  }, [capturePreviewScroll])

  const wrappedUpdate = useCallback((updates) => {
    updateWedding(updates)
    schedulePreviewReload()
  }, [updateWedding, schedulePreviewReload])

  useEffect(() => {
    try {
      const previewJson = JSON.stringify(wedding)
      sessionStorage.setItem(PREVIEW_STORAGE_KEY, previewJson)
      sessionStorage.setItem(`${PREVIEW_STORAGE_KEY}:${previewSessionKeyRef.current}`, previewJson)
    } catch {
      // Preview falls back to local storage if the current draft is too large.
    }
  }, [wedding])

  const uploadOrPreview = useCallback((file, kind) => {
    if (canUploadMedia(wedding.id)) {
      return uploadWeddingImage(wedding.id, file, kind)
    }
    return ensureWedding().then(currentWedding => {
      if (canUploadMedia(currentWedding.id)) {
        return uploadWeddingImage(currentWedding.id, file, kind)
      }
      return processImageFile(file, kind)
    })
  }, [wedding.id, ensureWedding])

  const deleteStoredMedia = useCallback(async (media) => {
    if (!canUploadMedia(wedding.id) || !isStoredMedia(media)) return
    await deleteWeddingImage(wedding.id, media.storageKey)
  }, [wedding.id])

  const handleSave = async () => {
    try {
      const savedWedding = await saveWeddingMedia(wedding)
      if (savedWedding?.id) {
        updateWedding({ id: savedWedding.id })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const image = await uploadOrPreview(file, 'cover')
      wrappedUpdate({ coverImage: image })
    } catch (err) {
      alert(err.message)
    } finally {
      e.target.value = ''
    }
  }

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const currentImages = realMediaItems(wedding.galleryImages ?? [])
    const remainingSlots = MAX_GALLERY_IMAGES - currentImages.length
    if (remainingSlots <= 0) {
      alert(`A galeria aceita até ${MAX_GALLERY_IMAGES} fotos para manter o layout bonito.`)
      e.target.value = ''
      return
    }
    const selectedFiles = files.slice(0, remainingSlots)
    const images = []
    for (const file of selectedFiles) {
      try {
        images.push(await uploadOrPreview(file, 'gallery'))
      } catch (err) {
        if (images.length) {
          wrappedUpdate({ galleryImages: [...currentImages, ...images], galleryCustomized: true })
        }
        alert(err.message)
        e.target.value = ''
        return
      }
    }
    wrappedUpdate({ galleryImages: [...currentImages, ...images], galleryCustomized: true })
    if (files.length > remainingSlots) {
      alert(`Foram adicionadas ${remainingSlots} foto(s). O limite da galeria é ${MAX_GALLERY_IMAGES}.`)
    }
    e.target.value = ''
  }

  const removeGalleryImage = async (index) => {
    const image = wedding.galleryImages?.[index]
    try {
      await deleteStoredMedia(image)
      wrappedUpdate({ galleryImages: wedding.galleryImages.filter((_, i) => i !== index), galleryCustomized: true })
    } catch (err) {
      alert(err.message)
    }
  }

  const reorderGalleryImage = (fromIndex, toIndex) => {
    if (fromIndex === null || fromIndex === toIndex) return
    const nextImages = [...(wedding.galleryImages ?? [])]
    const [movedImage] = nextImages.splice(fromIndex, 1)
    nextImages.splice(toIndex, 0, movedImage)
    wrappedUpdate({ galleryImages: nextImages, galleryCustomized: true })
  }

  const handleTemplateSelect = (template) => {
    if (template.comingSoon || wedding.template === template.id) return
    wrappedUpdate({ template: template.id, primaryColor: template.colors[1] })
  }

  const resetDesignData = async () => {
    if (!confirm('Resetar apenas template, cor de destaque, foto de capa e galeria?')) return
    if (canUploadMedia(wedding.id)) {
      try {
        await deleteWeddingDesignImages(wedding.id)
      } catch (err) {
        alert(err.message)
        return
      }
    }
    wrappedUpdate({
      template: mockWedding.template,
      primaryColor: mockWedding.primaryColor,
      coverImage: sampleMedia(mockWedding.coverImage, 'cover'),
      galleryImages: mockWedding.galleryImages.map((url, index) => sampleMedia(url, 'gallery', index)),
      galleryCustomized: false,
    })
  }

  const activeTemplate = mockTemplates.find(template => template.id === wedding.template) ?? mockTemplates[0]
  const defaultTemplateAccent = activeTemplate?.colors?.[1] ?? '#8B6F5E'
  const usesTemplateAccent = wedding.primaryColor?.toLowerCase() === defaultTemplateAccent.toLowerCase()
  const visibleGalleryCount = Math.min((wedding.galleryImages ?? []).length, MAX_GALLERY_IMAGES)
  const realGalleryCount = realMediaItems(wedding.galleryImages ?? []).length
  const uploadGalleryCount = wedding.galleryCustomized ? visibleGalleryCount : realGalleryCount
  const galleryOpenSlots = Math.max(0, MAX_GALLERY_IMAGES - uploadGalleryCount)
  const showGalleryEmptySlots = Boolean(wedding.galleryCustomized && galleryOpenSlots > 0)

  return (
    <div className="flex min-h-screen bg-stone-100">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden min-h-screen">
        <div className="bg-white border-b border-stone-100 px-4 sm:px-6 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/site/${wedding.slug}`)}
              title="Ver site publicado"
            >
              <Eye size={14} /> Ver site
            </Button>
            <div className="hidden sm:flex items-center gap-1 bg-stone-100 rounded-full p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded-full transition-colors ${previewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
              >
                <Monitor size={14} className="text-stone-600" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded-full transition-colors ${previewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
              >
                <Smartphone size={14} className="text-stone-600" />
              </button>
            </div>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {saved ? <><Check size={14} /> Salvo!</> : <><Save size={14} /> Salvar</>}
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex overflow-hidden">
          <div className="w-[440px] bg-white border-r border-stone-100 overflow-y-auto overscroll-contain flex-shrink-0 h-[calc(100vh-3.5rem)]">
            <div className="p-5">
              {activeTab === 'content' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-medium text-stone-900 text-sm">Informações do casal</h2>
                    <PreviewJumpButton onClick={() => scrollPreviewTo('preview-details')} />
                  </div>
                  <Input
                    label="Nome da noiva"
                    value={wedding.brideName}
                    onChange={e => wrappedUpdate({ brideName: e.target.value })}
                  />
                  <Input
                    label="Nome do noivo"
                    value={wedding.groomName}
                    onChange={e => wrappedUpdate({ groomName: e.target.value })}
                  />
                  <Input
                    label="Data do casamento"
                    type="date"
                    value={wedding.date}
                    onChange={e => wrappedUpdate({ date: e.target.value })}
                  />
                  <Input
                    label="Local da cerimônia"
                    value={wedding.venue}
                    onChange={e => wrappedUpdate({ venue: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Mensagem especial</label>
                    <textarea
                      value={wedding.message}
                      onChange={e => wrappedUpdate({ message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none text-sm text-stone-900 placeholder-stone-400 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <label className="block text-sm font-medium text-stone-700">Nossa história</label>
                      <PreviewJumpButton onClick={() => scrollPreviewTo('preview-story')} />
                    </div>
                    <textarea
                      value={wedding.story}
                      onChange={e => wrappedUpdate({ story: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none text-sm text-stone-900 placeholder-stone-400 transition-all resize-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <SectionsEditor wedding={wedding} updateWedding={wrappedUpdate} scrollPreviewTo={scrollPreviewTo} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'design' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <h2 className="font-medium text-stone-900 text-sm mb-1">Template</h2>
                    <p className="text-xs text-stone-400 mb-3">Escolha um estilo visual. As fotos e textos continuam os mesmos.</p>
                    <div className="space-y-2">
                      {mockTemplates.map((template) => {
                        const isActive = wedding.template === template.id
                        const [baseColor, accentColor, darkColor] = template.colors
                        return (
                          <button
                            key={template.id}
                            type="button"
                            disabled={template.comingSoon}
                            onClick={() => handleTemplateSelect(template)}
                            className={`w-full overflow-hidden rounded-xl border text-left transition-all ${
                              isActive
                                ? 'border-stone-900 bg-stone-50 shadow-sm'
                                : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                            } ${template.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex gap-3 p-3">
                              <div className="w-16 h-16 rounded-lg border border-stone-200 bg-white overflow-hidden flex-shrink-0 p-2" aria-hidden>
                                <div className="h-full rounded-md overflow-hidden" style={{ backgroundColor: baseColor }}>
                                  <div className="h-4" style={{ backgroundColor: darkColor }} />
                                  <div className="px-2 py-2 space-y-1.5">
                                    <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: accentColor }} />
                                    <div className="h-1 w-10 rounded-full bg-stone-300/60" />
                                    <div className="h-1 w-6 rounded-full bg-stone-300/60" />
                                  </div>
                                </div>
                              </div>
                              <div className="min-w-0 flex-1 py-0.5">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium text-stone-900 truncate">{template.name}</p>
                                  {isActive && <Check size={14} className="text-stone-900 flex-shrink-0" />}
                                </div>
                                <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2 mt-1">{template.description}</p>
                                <div className="flex items-center gap-1.5 mt-2">
                                  {template.colors.map((color) => (
                                    <span key={color} className="w-3 h-3 rounded-full border border-stone-200" style={{ backgroundColor: color }} />
                                  ))}
                                  <span className="text-[10px] text-stone-400 ml-1">base do template</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-medium text-stone-900 text-sm mb-1">Cor de destaque</h2>
                    <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
                      Personaliza detalhes do template, como botões, ícones, labels e destaques.
                    </p>
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {COLORS.map(color => (
                        <button
                          key={color.value}
                          title={color.label}
                          onClick={() => wrappedUpdate({ primaryColor: color.value })}
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                            wedding.primaryColor === color.value ? 'border-stone-900 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-[11px] text-stone-500 flex-1">Cor personalizada</label>
                      <input
                        type="color"
                        value={wedding.primaryColor}
                        onChange={e => wrappedUpdate({ primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-full border border-stone-200 cursor-pointer p-0.5 bg-white"
                        title="Escolher cor"
                      />
                      <span className="text-[11px] font-mono text-stone-400">{wedding.primaryColor}</span>
                    </div>
                    <button
                      type="button"
                      disabled={usesTemplateAccent}
                      onClick={() => wrappedUpdate({ primaryColor: defaultTemplateAccent })}
                      className="mt-3 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Restaurar cor padrão do {activeTemplate.name}
                    </button>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="font-medium text-stone-900 text-sm">Foto de capa</h2>
                      <PreviewJumpButton onClick={() => scrollPreviewTo('preview-cover')} />
                    </div>
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-stone-100">
                      <img src={mediaUrl(wedding.coverImage)} alt="Cover" className="w-full h-full object-cover" />
                      {isSampleMedia(wedding.coverImage) && (
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-stone-600 shadow-sm">
                          Imagem de exemplo
                        </span>
                      )}
                    </div>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept={IMAGE_MIME_TYPES.join(',')}
                      className="hidden"
                      onChange={handleCoverUpload}
                    />
                    <Button variant="outline" size="sm" fullWidth onClick={() => coverInputRef.current?.click()}>
                      <Upload size={14} /> Alterar foto de capa
                    </Button>
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h2 className="font-medium text-stone-900 text-sm">Galeria de fotos</h2>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Envie até {MAX_GALLERY_IMAGES} fotos. Você pode escolher várias de uma vez e arrastar para definir a ordem.
                        </p>
                      </div>
                      <span className="text-[11px] text-stone-400 flex-shrink-0">
                        {visibleGalleryCount}/{MAX_GALLERY_IMAGES}
                      </span>
                      <PreviewJumpButton onClick={() => scrollPreviewTo('preview-gallery')} />
                    </div>
                    {(wedding.galleryImages ?? []).length > MAX_GALLERY_IMAGES && (
                      <p className="mb-3 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-[11px] leading-relaxed text-amber-700">
                        O site exibe apenas as primeiras {MAX_GALLERY_IMAGES} fotos. Arraste as imagens para escolher quais aparecem.
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      {(wedding.galleryImages ?? []).map((img, i) => (
                        <div
                          key={`${mediaKey(img, i)}-${i}`}
                          draggable
                          onDragStart={() => setDraggedGalleryIndex(i)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            reorderGalleryImage(draggedGalleryIndex, i)
                            setDraggedGalleryIndex(null)
                          }}
                          onDragEnd={() => setDraggedGalleryIndex(null)}
                          className={`relative group aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 border-2 transition-all ${
                            draggedGalleryIndex === i ? 'border-stone-900 opacity-60 scale-95' : 'border-stone-100'
                          }`}
                        >
                          <img src={mediaUrl(img)} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                          {isSampleMedia(img) && (
                            <span className="absolute left-1 bottom-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-stone-600">
                              Exemplo
                            </span>
                          )}
                          <div className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-grab">
                            <GripVertical size={13} />
                          </div>
                          <button
                            onClick={() => removeGalleryImage(i)}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remover foto ${i + 1}`}
                          >
                            <Trash2 size={14} className="text-white" />
                          </button>
                          <span className={`absolute bottom-1 rounded-full bg-black/45 px-1.5 py-0.5 text-[10px] text-white ${isSampleMedia(img) ? 'right-1' : 'left-1'}`}>
                            {i + 1}
                          </span>
                        </div>
                      ))}
                      {showGalleryEmptySlots && Array.from({ length: galleryOpenSlots }).map((_, i) => (
                        <button
                          key={`empty-gallery-slot-${i}`}
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="aspect-[4/5] rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 text-stone-400 transition-colors hover:border-stone-300 hover:bg-stone-100"
                          aria-label={`Adicionar foto ${visibleGalleryCount + i + 1}`}
                        >
                          <div className="flex h-full flex-col items-center justify-center gap-1.5 px-3 text-center">
                            <Plus size={16} />
                            <span className="text-[10px] font-medium">Adicionar foto</span>
                            <span className="text-[9px] text-stone-400">{visibleGalleryCount + i + 1}/{MAX_GALLERY_IMAGES}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept={IMAGE_MIME_TYPES.join(',')}
                      multiple
                      className="hidden"
                      onChange={handleGalleryUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      disabled={uploadGalleryCount >= MAX_GALLERY_IMAGES}
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <Plus size={14} /> Adicionar fotos à galeria
                    </Button>
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      onClick={resetDesignData}
                      className="!text-red-400 hover:!text-red-600 hover:!bg-red-50"
                    >
                      Resetar dados de design
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'gifts' && (
                <GiftsTab wedding={wedding} updateWedding={wrappedUpdate} scrollPreviewTo={scrollPreviewTo} />
              )}

              {activeTab === 'share' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-medium text-stone-900 text-sm">Compartilhar site</h2>
                    <PreviewJumpButton onClick={() => scrollPreviewTo('preview-rsvp')} />
                  </div>
                  <div className="bg-stone-50 rounded-xl p-4">
                    <p className="text-xs text-stone-500 mb-2">Seu link exclusivo</p>
                    <p className="font-mono text-sm text-stone-900 break-all">nossodia.com/{wedding.slug}</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/site/${wedding.slug}`)}
                  >
                    Copiar link
                  </Button>
                  <div className="pt-2">
                    <p className="text-xs text-stone-500 mb-3">Compartilhar via</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['WhatsApp', 'Instagram', 'E-mail', 'QR Code'].map(method => (
                        <button key={method} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-stone-200 text-xs text-stone-700 hover:bg-stone-50 transition-colors">
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Preview — iframe rendering the real site */}
          <div className="flex-1 bg-stone-100 overflow-hidden flex items-start justify-center p-6 h-[calc(100vh-3.5rem)]">
            <div className={`bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-300 ${
              previewMode === 'mobile' ? 'w-[390px]' : 'w-full max-w-4xl'
            }`} style={{ height: previewMode === 'mobile' ? '780px' : '700px' }}>
              <iframe
                ref={previewIframeRef}
                key={previewKey}
                src={`/site/${wedding.slug}?preview=1&previewKey=${encodeURIComponent(previewSessionKeyRef.current)}&rev=${previewKey}`}
                title="Preview do site"
                className="w-full h-full border-0"
                onLoad={restorePreviewScroll}
                style={previewMode === 'mobile' ? { transform: 'scale(1)', transformOrigin: 'top left' } : {}}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Sections Editor ────────────────────────────────────────────────────────

const SECTION_PRESETS = [
  { title: 'Dress Code',        content: 'Traje sugerido: passeio completo.' },
  { title: 'Hospedagem',        content: 'Recomendamos o Hotel X, a 5 min do local.' },
  { title: 'Transporte',        content: 'Haverá van saindo do hotel às 18h.' },
  { title: 'Crianças',          content: 'O evento é para adultos. Agradecemos a compreensão.' },
  { title: 'Cerimônia & Recepção', content: 'Cerimônia às 18h. Recepção a seguir no mesmo local.' },
  { title: 'Menu',              content: 'Jantar completo com opções vegetarianas.' },
]

const EMPTY_SECTION = { title: '', content: '' }
const EMPTY_GIFT = { name: '', price: '', category: '', image: '', imagePreset: '' }
const DEFAULT_GIFT_PRESET_CATEGORY = giftImagePresetCategories[0]?.id ?? 'cozinha'

function giftPresetCategoryId(presetId, fallback = DEFAULT_GIFT_PRESET_CATEGORY) {
  return giftImagePresetCategories.find(category =>
    category.presets.some(preset => preset.id === presetId)
  )?.id ?? fallback
}

function SectionsEditor({ wedding, updateWedding, scrollPreviewTo }) {
  const sections = wedding.sections ?? []
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})

  const openNew = (preset = EMPTY_SECTION) => { setForm({ ...preset }); setErrors({}) }
  const openEdit = (s) => { setForm({ ...s }); setErrors({}) }
  const closeForm = () => { setForm(null); setErrors({}) }

  const saveSection = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Obrigatório'
    if (!form.content.trim()) e.content = 'Obrigatório'
    if (Object.keys(e).length) { setErrors(e); return }
    if (form.id) {
      updateWedding({ sections: sections.map(s => s.id === form.id ? form : s) })
    } else {
      updateWedding({ sections: [...sections, { ...form, id: String(Date.now()) }] })
    }
    closeForm()
  }

  const deleteSection = (id) => {
    if (!confirm('Remover esta seção?')) return
    updateWedding({ sections: sections.filter(s => s.id !== id) })
  }

  const moveSection = (id, dir) => {
    const idx = sections.findIndex(s => s.id === id)
    const next = [...sections]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    updateWedding({ sections: next })
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium text-stone-900 text-sm">Seções extras</h2>
          <p className="text-[11px] text-stone-400 mt-0.5">Dress code, hospedagem, transporte…</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => openNew()}>
          <Plus size={14} /> Adicionar
        </Button>
      </div>

      {/* Quick presets */}
      {form === null && sections.length === 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-stone-400">Sugestões rápidas:</p>
          <div className="flex flex-wrap gap-1.5">
            {SECTION_PRESETS.map(p => (
              <button
                key={p.title}
                onClick={() => openNew(p)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50 transition-colors"
              >
                + {p.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      {form !== null && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-stone-700">{form.id ? 'Editar seção' : 'Nova seção'}</p>
            <button onClick={closeForm} className="text-stone-400 hover:text-stone-600"><X size={14} /></button>
          </div>
          <div>
            <input
              placeholder="Título (ex: Dress Code) *"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.title ? 'border-red-400' : 'border-stone-200'} focus:outline-none focus:border-stone-400`}
            />
            {errors.title && <p className="text-[11px] text-red-400 mt-0.5">{errors.title}</p>}
          </div>
          <div>
            <textarea
              placeholder="Conteúdo da seção *"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 text-sm rounded-lg border resize-none ${errors.content ? 'border-red-400' : 'border-stone-200'} focus:outline-none focus:border-stone-400`}
            />
            {errors.content && <p className="text-[11px] text-red-400 mt-0.5">{errors.content}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="primary" size="sm" fullWidth onClick={saveSection}>
              <Check size={14} /> Salvar
            </Button>
            <Button variant="ghost" size="sm" onClick={closeForm}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* List */}
      {sections.map((s, i) => (
        <div key={s.id} className="flex items-start gap-2 p-3 rounded-xl border border-stone-100 bg-stone-50">
          <div className="flex flex-col gap-0.5 pt-0.5">
            <button onClick={() => moveSection(s.id, -1)} disabled={i === 0} className="text-stone-300 hover:text-stone-600 disabled:opacity-20 transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 2L11 8H1L6 2Z" fill="currentColor"/></svg>
            </button>
            <button onClick={() => moveSection(s.id, 1)} disabled={i === sections.length - 1} className="text-stone-300 hover:text-stone-600 disabled:opacity-20 transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 10L1 4H11L6 10Z" fill="currentColor"/></svg>
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate">{s.title}</p>
            <p className="text-xs text-stone-400 line-clamp-2 mt-0.5">{s.content}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <PreviewJumpButton onClick={() => scrollPreviewTo(`preview-section-${s.id}`)} />
            <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors">
              <Pencil size={13} />
            </button>
            <button onClick={() => deleteSection(s.id)} className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}

      {/* Add more presets when list not empty */}
      {sections.length > 0 && form === null && (
        <div className="flex flex-wrap gap-1.5">
          {SECTION_PRESETS.filter(p => !sections.some(s => s.title === p.title)).map(p => (
            <button
              key={p.title}
              onClick={() => openNew(p)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-stone-200 text-stone-500 hover:border-stone-400 hover:bg-stone-50 transition-colors"
            >
              + {p.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function GiftsTab({ wedding, updateWedding, scrollPreviewTo }) {
  const { ensureWedding } = useWedding()
  const gifts = wedding.gifts ?? []
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [selectedPresetCategory, setSelectedPresetCategory] = useState(DEFAULT_GIFT_PRESET_CATEGORY)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState('')
  const qrInputRef = useRef(null)
  const formImageUrl = form ? giftImageUrl(form, giftImagePresetById) : ''
  const selectedGiftPreset = form?.imagePreset ? giftImagePresetById(form.imagePreset) : null

  const uploadOrPreview = useCallback((file, kind) => {
    if (canUploadMedia(wedding.id)) {
      return uploadWeddingImage(wedding.id, file, kind)
    }
    return ensureWedding().then(currentWedding => {
      if (canUploadMedia(currentWedding.id)) {
        return uploadWeddingImage(currentWedding.id, file, kind)
      }
      return processImageFile(file, kind)
    })
  }, [wedding.id, ensureWedding])

  const deleteStoredMedia = useCallback(async (media) => {
    if (!canUploadMedia(wedding.id) || !isStoredMedia(media)) return
    await deleteWeddingImage(wedding.id, media.storageKey)
  }, [wedding.id])

  const updatePixKey = (value) => {
    const safeValue = value.replace(/[\u0000-\u001F\u007F<>]/g, '').slice(0, 140)
    updateWedding({ giftPixKey: safeValue })
  }

  const handleQrUpload = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setQrLoading(true)
    setQrError('')
    try {
      const image = await uploadOrPreview(file, 'qrCode')
      updateWedding({ giftPixQrCode: image })
    } catch (err) {
      setQrError(err.message)
    } finally {
      setQrLoading(false)
    }
  }

  const removeQrCode = async () => {
    setQrLoading(true)
    setQrError('')
    try {
      await deleteStoredMedia(wedding.giftPixQrCode)
      updateWedding({ giftPixQrCode: '' })
    } catch (err) {
      setQrError(err.message)
    } finally {
      setQrLoading(false)
    }
  }

  const openNew = () => {
    setSelectedPresetCategory(DEFAULT_GIFT_PRESET_CATEGORY)
    setForm({ ...EMPTY_GIFT })
    setErrors({})
  }
  const openEdit = (gift) => {
    setSelectedPresetCategory(giftPresetCategoryId(gift.imagePreset))
    setForm({ ...gift, image: '' })
    setErrors({})
  }
  const closeForm = () => { setForm(null); setErrors({}) }

  const validate = (f) => {
    const e = {}
    if (!f.name.trim()) e.name = 'Obrigatório'
    if (!f.price || isNaN(Number(f.price)) || Number(f.price) < 0) e.price = 'Valor inválido'
    return e
  }

  const saveGift = () => {
    const e = validate(form)
    if (Object.keys(e).length) { setErrors(e); return }
    const { source, store, ...giftFields } = form
    const gift = { ...giftFields, image: '', price: Number(form.price) }
    if (gift.id) {
      updateWedding({ gifts: gifts.map(g => g.id === gift.id ? gift : g) })
    } else {
      updateWedding({ gifts: [...gifts, { ...gift, id: String(Date.now()) }] })
    }
    closeForm()
  }

  const deleteGift = (id) => {
    if (!confirm('Remover este presente?')) return
    updateWedding({ gifts: gifts.filter(g => g.id !== id) })
  }

  const selectedPresetCategoryData = giftImagePresetCategories.find(category => category.id === selectedPresetCategory) ?? giftImagePresetCategories[0]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-medium text-stone-900 text-sm">Pix dos presentes</h2>
            <PreviewJumpButton onClick={() => scrollPreviewTo('preview-gifts')} />
          </div>
          <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
            A chave fica pública no site dos noivos. O pagamento acontece fora da plataforma, no app do banco do convidado.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1.5">Chave Pix</label>
          <input
            placeholder="CPF, e-mail, telefone ou chave aleatória"
            value={wedding.giftPixKey ?? ''}
            onChange={e => updatePixKey(e.target.value)}
            maxLength={140}
            autoComplete="off"
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400"
          />
        </div>

        <div>
          <input
            ref={qrInputRef}
            type="file"
            accept={IMAGE_MIME_TYPES.join(',')}
            className="hidden"
            onChange={handleQrUpload}
          />
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl border border-dashed border-stone-300 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
              {wedding.giftPixQrCode ? (
                <img src={mediaUrl(wedding.giftPixQrCode)} alt="QR Code Pix" className="w-full h-full object-cover" />
              ) : (
                <QrCode size={24} className="text-stone-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-700">QR Code opcional</p>
              <p className="text-[11px] text-stone-400 mb-2">Use apenas uma imagem confiável do QR Code Pix do casal.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={qrLoading}
                  onClick={() => qrInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs text-stone-600 border border-stone-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
                  {qrLoading ? 'Processando...' : 'Enviar QR Code'}
                </button>
                {wedding.giftPixQrCode && (
                  <button
                    type="button"
                    onClick={removeQrCode}
                    className="px-3 py-1.5 text-xs text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>
          {qrError && <p className="text-[11px] text-red-400 mt-2">{qrError}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium text-stone-900 text-sm">Presentes simbólicos</h2>
          <p className="text-[11px] text-stone-400 mt-0.5">Os botões do site copiam a chave Pix configurada acima.</p>
        </div>
        <Button variant="outline" size="sm" onClick={openNew}>
          <Plus size={14} /> Adicionar
        </Button>
      </div>

      {form !== null && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-stone-700">{form.id ? 'Editar presente' : 'Novo presente'}</p>
            <button onClick={closeForm} className="text-stone-400 hover:text-stone-600"><X size={14} /></button>
          </div>
          <div>
            <input
              placeholder="Nome do presente *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.name ? 'border-red-400' : 'border-stone-200'} focus:outline-none focus:border-stone-400`}
            />
            {errors.name && <p className="text-[11px] text-red-400 mt-0.5">{errors.name}</p>}
          </div>
          <div>
            <input
              placeholder="Valor (R$) *"
              type="number"
              min="0"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.price ? 'border-red-400' : 'border-stone-200'} focus:outline-none focus:border-stone-400`}
            />
            {errors.price && <p className="text-[11px] text-red-400 mt-0.5">{errors.price}</p>}
          </div>
          <input
            placeholder="Categoria (ex: Cozinha)"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400"
          />
          <div className="space-y-2">
            <p className="text-[11px] text-stone-500 font-medium">Foto do presente</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {giftImagePresetCategories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedPresetCategory(category.id)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                    selectedPresetCategory === category.id
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-800'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5 lg:grid-cols-8">
              {(selectedPresetCategoryData?.presets ?? []).map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setForm(f => ({
                      ...f,
                      image: '',
                      imagePreset: preset.id,
                      category: f.category?.trim() ? f.category : selectedPresetCategoryData.label,
                    }))
                  }}
                  className={`relative rounded-lg overflow-hidden aspect-square border-2 transition-all ${
                    form.imagePreset === preset.id ? 'border-stone-900 scale-[0.97]' : 'border-transparent hover:border-stone-300'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 py-0.5">
                    <span className="text-[8px] text-white font-medium leading-none block text-center px-0.5 truncate">{preset.label}</span>
                  </div>
                  {form.imagePreset === preset.id && (
                    <div className="absolute inset-0 bg-stone-900/20 flex items-center justify-center">
                      <Check size={16} className="text-white drop-shadow" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {formImageUrl && (
              <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                <div className="relative aspect-square bg-stone-100">
                <img
                  src={formImageUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, image: '', imagePreset: '' }))}
                  className="absolute top-2 right-2 bg-black/55 text-white rounded-full p-1.5 hover:bg-black/75"
                  aria-label="Remover foto do presente"
                >
                  <X size={13} />
                </button>
                </div>
                <div className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-stone-700 truncate">{selectedGiftPreset?.label ?? 'Imagem selecionada'}</p>
                    <p className="text-[10px] text-stone-400">Prévia da foto do presente</p>
                  </div>
                  <span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-medium text-stone-500">
                    Selecionada
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="primary" size="sm" fullWidth onClick={saveGift}>
              <Check size={14} /> Salvar
            </Button>
            <Button variant="ghost" size="sm" onClick={closeForm}>Cancelar</Button>
          </div>
        </div>
      )}

      {gifts.length === 0 && form === null && (
        <p className="text-xs text-stone-400 text-center py-6">Nenhum presente ainda. Clique em "Adicionar".</p>
      )}

      {gifts.map(gift => {
        const imageUrl = giftImageUrl(gift, giftImagePresetById)
        return (
          <div key={gift.id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50">
            {imageUrl ? (
              <img src={imageUrl} alt={gift.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-stone-200 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{gift.name}</p>
              <p className="text-xs text-stone-400">R$ {Number(gift.price).toLocaleString('pt-BR')}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                title="Editar"
                onClick={() => openEdit(gift)}
                className="p-1.5 rounded-lg text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <Pencil size={13} />
              </button>
              <button
                title="Remover"
                onClick={() => deleteGift(gift.id)}
                className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}
