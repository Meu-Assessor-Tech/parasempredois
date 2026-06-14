import { useWedding } from '../../context/WeddingContext'
import IvoryTemplate from './IvoryTemplate'
import BaliTemplate from './BaliTemplate'
import CelestialTemplate from './CelestialTemplate'

const TEMPLATE_MAP = {
  classic: IvoryTemplate,
  minimal: BaliTemplate,
  floral: CelestialTemplate,
}

const FallbackTemplate = IvoryTemplate

export default function WeddingSite() {
  const { wedding } = useWedding()
  const Template = TEMPLATE_MAP[wedding.template] ?? FallbackTemplate
  return <Template wedding={wedding} />
}
