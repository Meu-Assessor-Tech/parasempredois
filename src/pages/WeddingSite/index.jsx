import { useLocation } from 'react-router-dom'
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

export default function WeddingSite() {
  const location = useLocation()
  const { wedding, publishedWedding, loadingWedding } = useWedding()
  const params = new URLSearchParams(location.search)
  const isExample = location.pathname === '/site/ana-e-pedro'
    && params.get('example') === '1'
  const isPreview = params.get('preview') === '1'
  if (!isExample && !isPreview && loadingWedding) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
      </div>
    )
  }
  const renderedWedding = isExample ? mockWedding : isPreview ? wedding : publishedWedding
  const Template = TEMPLATE_MAP[renderedWedding.template] ?? FallbackTemplate
  return <Template wedding={renderedWedding} />
}
