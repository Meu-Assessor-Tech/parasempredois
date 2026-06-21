import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Badge from '../ui/Badge'
import { templateConfigs } from '../../data/templateConfigs'

const PREVIEW_BG = {
  ivory: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
  bali: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600',
  celestial: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
  classic: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
  minimal: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600',
  floral: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
}

export default function TemplateCard({ template, selected, onSelect }) {
  const cfg = templateConfigs[template.id] || templateConfigs.ivory
  const bg = PREVIEW_BG[template.id] || template.preview

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(template.id)}
      className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
        selected ? 'border-stone-900 shadow-xl' : 'border-stone-100 hover:border-stone-300 shadow-sm'
      }`}
    >
      {/* Rendered mini-preview */}
      <div className="aspect-[4/3] relative overflow-hidden">
        <img src={bg} alt={template.name} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: cfg.heroBg }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-white text-center">
          <p className={cfg.labelClass.replace('mb-6', 'mb-2').replace('mb-8', 'mb-2')}>
            Save the Date
          </p>
          <p
            className={`${cfg.nameClass} leading-tight text-white`}
            style={{ fontSize: template.id === 'bali' || template.id === 'minimal' ? '1.1rem' : '1.25rem', ...cfg.nameStyle }}
          >
            Sofia <span className={cfg.ampersandClass} style={{ fontSize: '0.9rem' }}>&</span> Lucas
          </p>
          <p className={cfg.dateClass.replace('mb-10', 'mt-2 mb-0').replace('mb-8', 'mt-2 mb-0')}
            style={{ fontSize: '0.65rem' }}>
            20 de setembro de 2025
          </p>
        </div>
      </div>

      {selected && (
        <div className="absolute top-3 right-3 w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center shadow-lg">
          <Check size={14} className="text-white" />
        </div>
      )}

      {template.tag && (
        <div className="absolute top-3 left-3">
          <Badge color="sand">{template.tag}</Badge>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 mb-1">
          {template.colors.map((color, i) => (
            <div key={i} className="w-4 h-4 rounded-full border border-stone-200" style={{ backgroundColor: color }} />
          ))}
        </div>
        <h3 className="font-serif text-base font-medium text-stone-900 mt-2 mb-1">{template.name}</h3>
        <p className="text-xs text-stone-500 leading-relaxed">{template.description}</p>
      </div>
    </motion.div>
  )
}
