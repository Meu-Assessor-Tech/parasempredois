import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Button from '../../components/ui/Button'
import { mockTemplates } from '../../data/mockTemplates'
import { useAuth } from '../../context/AuthContext'
import { useWedding } from '../../context/WeddingContext'

const stagger = { visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }

export default function Templates() {
  const { wedding, updateWedding } = useWedding()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSelect = (template) => {
    if (template.comingSoon) return
    updateWedding({ template: template.id })
    navigate(user ? '/editor' : `/login?next=${encodeURIComponent('/editor')}`)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <p className="text-[9px] uppercase tracking-[0.5em] text-sand-500 mb-3">Templates</p>
            <h1 className="font-serif text-4xl text-stone-900 mb-3">Escolha seu estilo</h1>
            <p className="text-stone-500 text-sm max-w-md leading-relaxed">
              Selecione o template que melhor representa vocês. Todos usam as mesmas informações que você já preencheu.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {mockTemplates.map((template) => {
              const isActive = wedding.template === template.id
              return (
                <motion.div key={template.id} variants={fadeUp}>
                  <button
                    onClick={() => handleSelect(template)}
                    disabled={template.comingSoon}
                    className={`w-full text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 group ${
                      isActive
                        ? 'border-stone-900 shadow-lg'
                        : template.comingSoon
                        ? 'border-stone-100 opacity-60 cursor-not-allowed'
                        : 'border-stone-100 hover:border-stone-300 hover:shadow-md'
                    }`}
                  >
                    {/* Preview image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <img
                        src={template.preview}
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Tag */}
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium ${
                          isActive ? 'bg-stone-900 text-white' : 'bg-white/90 text-stone-700'
                        }`}>
                          {template.tag}
                        </span>
                      </div>

                      {/* Active check */}
                      {isActive && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-stone-900 rounded-full flex items-center justify-center">
                          <Check size={13} className="text-white" />
                        </div>
                      )}

                      {/* Coming soon lock */}
                      {template.comingSoon && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/90 rounded-full p-3">
                            <Lock size={18} className="text-stone-500" />
                          </div>
                        </div>
                      )}

                      {/* Name over image */}
                      <div className="absolute bottom-3 left-4">
                        <p className="font-serif text-xl text-white">{template.name}</p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-white">
                      <p className="text-xs text-stone-500 leading-relaxed mb-3">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                          {template.colors.map((c, i) => (
                            <div key={i} className="w-4 h-4 rounded-full border border-stone-200 flex-shrink-0" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        {!template.comingSoon && (
                          <span className="text-xs font-medium text-stone-500">
                            {isActive ? 'Ativo' : 'Selecionar →'}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

