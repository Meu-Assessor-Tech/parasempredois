/**
 * WeddingSite — template router
 *
 * To add a new template:
 *  1. Create src/pages/WeddingSite/YourTemplate.jsx  (receives { wedding })
 *  2. Import it below and add to TEMPLATE_MAP
 *  3. Add metadata entry to src/data/mockTemplates.js
 */
import { useWedding } from '../../context/WeddingContext'
import IvoryTemplate from './IvoryTemplate'

// Registry: template id → component
// All template components receive the same { wedding } prop.
const TEMPLATE_MAP = {
  classic: IvoryTemplate,
  // minimal: BaliTemplate,      ← add here when ready
  // floral: CelestialTemplate,  ← add here when ready
}

const FallbackTemplate = IvoryTemplate

export default function WeddingSite() {
  const { wedding } = useWedding()
  const Template = TEMPLATE_MAP[wedding.template] ?? FallbackTemplate
  return <Template wedding={wedding} />
}

