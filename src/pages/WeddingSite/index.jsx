import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useWedding } from '../../context/WeddingContext'
import { mockWedding } from '../../data/mockWedding'
import IvoryTemplate from './IvoryTemplate'
import BaliTemplate from './BaliTemplate'
import CelestialTemplate from './CelestialTemplate'
import { getPublicWedding } from '../../api/weddings'

const TEMPLATE_MAP = {
  ivory: IvoryTemplate,
  bali: BaliTemplate,
  celestial: CelestialTemplate,
  classic: IvoryTemplate,
  minimal: BaliTemplate,
  floral: CelestialTemplate,
}

const FallbackTemplate = IvoryTemplate

function editorTabForSection(sectionId) {
  if (sectionId === 'preview-cover' || sectionId === 'preview-gallery') return 'design'
  if (sectionId === 'preview-gifts') return 'gifts'
  if (sectionId === 'preview-rsvp') return 'rsvp'
  return 'content'
}

export default function WeddingSite() {
  const location = useLocation()
  const { slug } = useParams()
  const navigate = useNavigate()
  const { wedding, publishedWedding, loadingWedding } = useWedding()
  const [publicWedding, setPublicWedding] = useState(null)
  const [publicError, setPublicError] = useState('')
  const [loadingPublicWedding, setLoadingPublicWedding] = useState(false)
  const params = new URLSearchParams(location.search)
  const requestedEditorTab = params.get('editorTab') || 'design'
  const [activeReturnTab, setActiveReturnTab] = useState(requestedEditorTab)
  const isExample = slug === 'ana-e-pedro' && params.get('example') === '1'
  const isPreview = params.get('preview') === '1'
  useEffect(() => {
    if (isExample || isPreview || !slug) return
    let cancelled = false
    setLoadingPublicWedding(true)
    setPublicError('')
    getPublicWedding(slug)
      .then(data => {
        if (!cancelled) setPublicWedding(mapPublicWedding(data))
      })
      .catch(err => {
        if (!cancelled) setPublicError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingPublicWedding(false)
      })
    return () => { cancelled = true }
  }, [slug, isExample, isPreview])
  useEffect(() => {
    if (!location.hash || loadingWedding || loadingPublicWedding) return
    const sectionId = decodeURIComponent(location.hash.slice(1))
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.hash, loadingWedding, loadingPublicWedding, publicWedding])
  useEffect(() => {
    if (loadingWedding || loadingPublicWedding) return
    setActiveReturnTab(requestedEditorTab)
    const frame = window.requestAnimationFrame(() => {
      const sections = Array.from(document.querySelectorAll('[id^="preview-"]'))
      const observer = new IntersectionObserver(entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveReturnTab(editorTabForSection(visible.target.id))
      }, { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.1, 0.5] })
      sections.forEach(section => observer.observe(section))
      window.__weddingSectionObserver = observer
    })
    return () => {
      window.cancelAnimationFrame(frame)
      window.__weddingSectionObserver?.disconnect()
      delete window.__weddingSectionObserver
    }
  }, [loadingWedding, loadingPublicWedding, publicWedding, requestedEditorTab, location.pathname])
  if (!isExample && !isPreview && (loadingWedding || loadingPublicWedding || !publicWedding) && !publicError) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
      </div>
    )
  }
  if (!isExample && !isPreview && publicError) {
    return <div className="flex min-h-screen items-center justify-center bg-stone-100 p-6"><div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-sm"><h1 className="font-serif text-2xl text-stone-900">Site não encontrado</h1><p className="mt-2 text-sm text-stone-500">Confira se o endereço recebido está completo e tente novamente.</p></div></div>
  }
  const renderedWedding = isExample ? mockWedding : isPreview ? wedding : publicWedding ?? publishedWedding
  const Template = TEMPLATE_MAP[renderedWedding.template] ?? FallbackTemplate
  const returnSource = params.get('from')
  const editorTarget = activeReturnTab !== 'design' ? `/editor?tab=${encodeURIComponent(activeReturnTab)}` : '/editor'
  const backTarget = returnSource === 'editor' ? editorTarget : returnSource === 'dashboard' ? '/principal' : ''
  const backLabel = returnSource === 'editor' ? 'Voltar para edição' : 'Voltar para principal'

  return (
    <>
      {backTarget && !isPreview && !isExample && (
        <button
          type="button"
          onClick={() => navigate(backTarget)}
          className="fixed left-3 top-3 z-[60] inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-stone-800 shadow-lg ring-1 ring-stone-200 backdrop-blur transition-colors hover:bg-white"
        >
          <ArrowLeft size={16} />
          {backLabel}
        </button>
      )}
      <Template wedding={renderedWedding} />
    </>
  )
}

function mapPublicWedding(remoteWedding) {
  return {
    id: remoteWedding.id,
    brideName: remoteWedding.brideName ?? '',
    groomName: remoteWedding.groomName ?? '',
    date: remoteWedding.weddingDate ?? '',
    slug: remoteWedding.slug ?? '',
    venue: remoteWedding.venue ?? '',
    message: remoteWedding.message ?? '',
    story: remoteWedding.story ?? '',
    rsvpMessage: remoteWedding.rsvpMessage ?? '',
    invitationMessage: remoteWedding.invitationMessage ?? '',
    rsvpEnabled: remoteWedding.rsvpEnabled !== false,
    template: remoteWedding.template ?? 'ivory',
    primaryColor: remoteWedding.primaryColor ?? '',
    sections: remoteWedding.sections ?? [],
    giftPixKey: remoteWedding.giftPixKey ?? '',
    coverImage: remoteWedding.coverImage,
    galleryImages: remoteWedding.galleryImages ?? [],
    giftPixQrCode: remoteWedding.giftPixQrCode,
    gifts: remoteWedding.gifts ?? [],
  }
}
