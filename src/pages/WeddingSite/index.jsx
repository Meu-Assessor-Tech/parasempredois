import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useWedding } from '../../context/WeddingContext'
import { mockWedding } from '../../data/mockWedding'
import IvoryTemplate from './IvoryTemplate'
import BaliTemplate from './BaliTemplate'
import CelestialTemplate from './CelestialTemplate'

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
  const params = new URLSearchParams(location.search)
  const requestedEditorTab = params.get('editorTab') || 'design'
  const [activeReturnTab, setActiveReturnTab] = useState(requestedEditorTab)
  const isExample = slug === 'ana-e-pedro' && params.get('example') === '1'
  const isPreview = params.get('preview') === '1'
  useEffect(() => {
    if (!location.hash || loadingWedding) return
    const sectionId = decodeURIComponent(location.hash.slice(1))
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.hash, loadingWedding])
  useEffect(() => {
    if (loadingWedding) return
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
  }, [loadingWedding, requestedEditorTab, location.pathname])
  if (!isExample && !isPreview && loadingWedding) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
      </div>
    )
  }
  const renderedWedding = isExample ? mockWedding : isPreview ? wedding : publishedWedding
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
