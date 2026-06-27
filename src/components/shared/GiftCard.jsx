import { motion } from 'framer-motion'
import { ShoppingBag, Check } from 'lucide-react'
import Button from '../ui/Button'
import { giftImageUrl } from '../../utils/media'
import { giftImagePresetById } from '../../data/giftImagePresets'

export default function GiftCard({ gift }) {
  const imageUrl = giftImageUrl(gift, giftImagePresetById)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-2xl overflow-hidden border shadow-sm transition-all ${
        gift.purchased ? 'border-green-100 opacity-75' : 'border-stone-100'
      }`}
    >
      <div className="aspect-square overflow-hidden bg-stone-100">
        {imageUrl && <img src={imageUrl} alt={gift.name} className="w-full h-full object-cover" />}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-stone-900 mb-0.5 text-sm">{gift.name}</h3>
        <div className="mt-3 flex items-center justify-between">
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
