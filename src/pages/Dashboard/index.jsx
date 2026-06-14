import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Copy, Eye, Edit3, Share2, Users, Gift, TrendingUp, ExternalLink, Plus, QrCode, HandHeart, Check } from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { useWedding } from '../../context/WeddingContext'
import { mediaUrl } from '../../utils/media'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const PIX_KEY = 'X'

function CollaborationTab() {
  const [copied, setCopied] = useState(false)

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mb-8"
          >
            <motion.p variants={fadeUp} className="text-xs text-stone-400 uppercase tracking-widest mb-1">
              Colaboração opcional
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-3xl sm:text-4xl text-stone-900 mb-3">
              Ajude o Para sempre dois a continuar
            </motion.h1>
            <motion.p variants={fadeUp} className="text-stone-500 text-sm leading-relaxed max-w-2xl">
              Eu não cobro nada para os casais criarem seus sites. Se algum casal quiser colaborar com o projeto, pode fazer uma contribuição voluntária por Pix.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <Card className="p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-11 h-11 rounded-2xl bg-sand-100 text-sand-700 flex items-center justify-center flex-shrink-0">
                  <HandHeart size={20} />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-stone-900 mb-2">Contribuição por Pix</h2>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    A contribuição é totalmente opcional e não muda o acesso ao site. O Para sempre dois segue gratuito para quem quiser criar uma página de casamento.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400 mb-2">Chave Pix</p>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <code className="rounded-xl bg-white border border-stone-200 px-4 py-3 text-sm text-stone-800 break-all">
                    {PIX_KEY}
                  </code>
                  <Button variant="primary" size="sm" onClick={handleCopyPix} className="flex-shrink-0">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copiado' : 'Copiar chave'}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="aspect-square rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center text-center p-6">
                <QrCode size={42} className="text-stone-300 mb-4" />
                <p className="font-medium text-stone-700 text-sm mb-1">QR Code Pix</p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Espaço reservado para inserir a imagem do QR Code.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab')

  const stats = [
    { label: 'Visualizações', value: '1.247', icon: Eye, trend: '+12%' },
    { label: 'Confirmados', value: '47', icon: Users, trend: '+5' },
    { label: 'Presentes', value: '8', icon: Gift, trend: 'de 24' },
    { label: 'Dias restantes', value: '128', icon: TrendingUp, trend: 'para o grande dia' },
  ]

  const weddingDate = new Date(wedding.date)
  const formattedDate = weddingDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  if (currentTab === 'colaborar') {
    return <CollaborationTab />
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mb-10"
          >
            <motion.p variants={fadeUp} className="text-xs text-stone-400 uppercase tracking-widest mb-1">
              Bem-vindo de volta
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-3xl sm:text-4xl text-stone-900 mb-2">
              {wedding.brideName} & {wedding.groomName}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-stone-500 text-sm flex items-center gap-2">
              <span>{formattedDate}</span>
              <span className="w-1 h-1 bg-stone-300 rounded-full" />
              <span>{wedding.venue}</span>
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp}>
                <Card className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <stat.icon size={18} className="text-stone-400" />
                    <span className="text-xs text-stone-400">{stat.trend}</span>
                  </div>
                  <p className="font-serif text-2xl text-stone-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-stone-500">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="overflow-hidden">
                <div className="relative aspect-video">
                  <img
                    src={mediaUrl(wedding.coverImage)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-serif text-xl text-white mb-1">
                      {wedding.brideName} & {wedding.groomName}
                    </p>
                    <p className="text-white/70 text-sm">{formattedDate}</p>
                  </div>
                </div>
                <div className="p-5 flex flex-wrap gap-3">
                  <Button variant="primary" size="sm" onClick={() => navigate('/editor')}>
                    <Edit3 size={14} /> Editar site
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/site/${wedding.slug}`)}>
                    <Eye size={14} /> Visualizar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 size={14} /> Compartilhar
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink size={14} />
                    nossodia.com/{wedding.slug}
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <Card className="p-5">
                <h3 className="font-medium text-stone-900 mb-4 text-sm">Ações rápidas</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Mudar template', icon: Edit3, action: () => navigate('/templates') },
                    { label: 'Adicionar fotos', icon: Plus, action: () => navigate('/editor') },
                    { label: 'Lista de presentes', icon: Gift, action: () => navigate('/editor') },
                    { label: 'Ver convidados', icon: Users, action: () => {} },
                  ].map((item) => (
                    <motion.button
                      key={item.label}
                      whileHover={{ x: 3 }}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-left"
                    >
                      <item.icon size={15} className="text-stone-400" />
                      <span className="text-sm text-stone-700">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>

              <Card className="p-5 bg-stone-900 border-0">
                <p className="text-xs text-stone-400 mb-2">Seu link exclusivo</p>
                <p className="text-white font-mono text-sm mb-4 break-all">nossodia.com/{wedding.slug}</p>
                <Button variant="secondary" size="sm" fullWidth className="!bg-stone-700 !text-white hover:!bg-stone-600">
                  <Share2 size={14} /> Copiar link
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
