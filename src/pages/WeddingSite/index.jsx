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
  const { wedding } = useWedding()
  const isExample = location.pathname === '/site/ana-e-pedro'
    && new URLSearchParams(location.search).get('example') === '1'
  const renderedWedding = isExample ? mockWedding : wedding
  const Template = TEMPLATE_MAP[renderedWedding.template] ?? FallbackTemplate
  return <Template wedding={renderedWedding} />
}
