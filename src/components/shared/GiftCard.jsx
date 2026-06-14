import { motion } from 'framer-motion'
import { ShoppingBag, Check } from 'lucide-react'
import Button from '../ui/Button'
import { mediaUrl } from '../../utils/media'

export default function GiftCard({ gift }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-2xl overflow-hidden border shadow-sm transition-all ${
        gift.purchased ? 'border-green-100 opacity-75' : 'border-stone-100'
      }`}
    >
      <div className="aspect-square overflow-hidden">
        <img src={mediaUrl(gift.image)} alt={gift.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <span className="text-xs text-stone-400 uppercase tracking-wide">{gift.category}</span>
        <h3 className="font-medium text-stone-900 mt-1 mb-0.5 text-sm">{gift.name}</h3>
        <p className="text-xs text-stone-500 mb-3">{gift.store}</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-stone-900">
            R$ {gift.price.toLocaleString('pt-BR')}
          </span>
          {gift.purchased ? (
            <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
              <Check size={14} /> Presenteado
            </div>
          ) : (
            <Button variant="sand" size="sm" className="!px-4 !py-2 !text-xs">
              <ShoppingBag size={12} /> Presentear
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
