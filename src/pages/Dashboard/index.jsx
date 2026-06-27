import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Copy, Edit3, Eye, HandHeart, Plus, Share2, Trash2 } from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useWedding } from '../../context/WeddingContext'
import { canSaveWedding } from '../../api/weddings'
import { getGuestConfirmations } from '../../api/rsvps'
import { ApiError } from '../../api/client'
import { mediaUrl } from '../../utils/media'
import { formatWeddingDate, weddingDisplayTitle, weddingDisplayVenue } from '../../utils/weddingDisplay'

const PIX_KEY = 'parasempredois@gmail.com'

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

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
    <DashboardShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Colaboração opcional</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-3">Ajude o Para sempre dois a continuar</h1>
        <p className="text-stone-500 text-sm leading-relaxed max-w-2xl mb-6">
          O projeto é gratuito. Se quiser colaborar para manter a plataforma no ar, a contribuição por Pix é opcional.
        </p>

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-sand-100 text-sand-700 flex items-center justify-center">
                <HandHeart size={20} />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-stone-900 mb-2">Contribuição por Pix</h2>
                <p className="text-sm text-stone-500 leading-relaxed">
                  A contribuição não muda o acesso. O site segue gratuito para criar e compartilhar.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400 mb-2">Chave Pix</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <code className="flex-1 rounded-xl bg-white border border-stone-200 px-4 py-3 text-sm text-stone-800 break-all">
                  {PIX_KEY}
                </code>
                <Button variant="primary" size="sm" onClick={handleCopyPix}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copiado' : 'Copiar chave'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

export default function Dashboard() {
  const { wedding, loadingWedding, deleteWeddingSite } = useWedding()
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [confirmations, setConfirmations] = useState([])
  const [confirmationsLoading, setConfirmationsLoading] = useState(false)
  const [confirmationsError, setConfirmationsError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab')
  const hasWedding = canSaveWedding(wedding?.id)

  useEffect(() => {
    if (!hasWedding) return
    let cancelled = false
    setConfirmationsLoading(true)
    setConfirmationsError('')
    getGuestConfirmations(wedding.id)
      .then(data => {
        if (!cancelled) setConfirmations(data ?? [])
      })
      .catch(err => {
        if (!cancelled) setConfirmationsError(err.message)
      })
      .finally(() => {
        if (!cancelled) setConfirmationsLoading(false)
      })
    return () => { cancelled = true }
  }, [hasWedding, wedding.id])

  if (currentTab === 'colaborar') {
    return <CollaborationTab />
  }

  if (loadingWedding) {
    return (
      <DashboardShell>
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
          <Card className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-stone-500">Carregando seu painel...</p>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  if (!hasWedding) {
    return (
      <DashboardShell>
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Card className="p-8 sm:p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-stone-900 text-white flex items-center justify-center mx-auto mb-6">
                <Plus size={24} />
              </div>
              <p className="text-xs uppercase tracking-[0.26em] text-stone-400 mb-3">Primeiro passo</p>
              <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-3">Crie o site do seu casamento</h1>
              <p className="text-sm text-stone-500 leading-relaxed max-w-xl mx-auto mb-7">
                Para começar, informe apenas o nome dos noivos e a data do casamento. Depois disso você personaliza fotos, presentes e detalhes no editor.
              </p>
              <Button variant="primary" size="lg" onClick={() => navigate('/criar-site')}>
                <Plus size={16} /> Criar site
              </Button>
            </Card>
          </motion.div>
        </div>
      </DashboardShell>
    )
  }

  const formattedDate = formatWeddingDate(wedding.date, { day: '2-digit', month: 'long', year: 'numeric' })
  const weddingTitle = weddingDisplayTitle(wedding)
  const weddingVenue = weddingDisplayVenue(wedding)
  const totalConfirmedGuests = confirmations.reduce((sum, confirmation) => sum + (confirmation.totalGuests ?? 1), 0)

  const handleDeleteSite = async () => {
    const confirmed = confirm('Tem certeza que deseja excluir este site? Isso apaga textos, presentes e imagens enviadas.')
    if (!confirmed) return

    setDeleting(true)
    setDeleteError('')
    try {
      await deleteWeddingSite()
      navigate('/principal')
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Não foi possível excluir o site')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-8">
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Seu site</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-2">{weddingTitle}</h1>
          <p className="text-stone-500 text-sm">{formattedDate} · {weddingVenue}</p>
        </div>

        {deleteError && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {deleteError}
          </div>
        )}

        <Card className="overflow-hidden">
          <div className="relative aspect-video">
            <img src={mediaUrl(wedding.coverImage)} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="font-serif text-xl text-white mb-1">{weddingTitle}</p>
              <p className="text-white/75 text-sm">{formattedDate}</p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm" onClick={() => navigate('/editor')}>
                <Edit3 size={14} /> Editar site
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(`/site/${wedding.slug}`, '_blank', 'noopener,noreferrer')}>
                <Eye size={14} /> Visualizar
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/site/${wedding.slug}`)}>
                <Share2 size={14} /> Copiar link
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteSite}
                disabled={deleting}
                className="!text-red-600 hover:!bg-red-50"
              >
                <Trash2 size={14} />
                {deleting ? 'Excluindo...' : 'Excluir site'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="mt-6 p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400 mb-1">Confirmações</p>
              <h2 className="font-serif text-2xl text-stone-900">Convidados confirmados</h2>
            </div>
            <p className="text-sm text-stone-500">
              {confirmations.length} confirmação(ões) · {totalConfirmedGuests} pessoa(s)
            </p>
          </div>

          {confirmationsLoading && (
            <p className="rounded-xl bg-stone-50 px-4 py-5 text-center text-sm text-stone-400">Carregando confirmações...</p>
          )}

          {confirmationsError && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{confirmationsError}</p>
          )}

          {!confirmationsLoading && !confirmationsError && confirmations.length === 0 && (
            <p className="rounded-xl bg-stone-50 px-4 py-5 text-center text-sm text-stone-400">
              Nenhuma presença confirmada ainda.
            </p>
          )}

          {!confirmationsLoading && !confirmationsError && confirmations.length > 0 && (
            <div className="divide-y divide-stone-100 rounded-xl border border-stone-100">
              {confirmations.map(confirmation => (
                <div key={confirmation.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900">{confirmation.name}</p>
                    <p className="text-xs text-stone-400">
                      {confirmation.companions > 0
                        ? `${confirmation.companions} acompanhante(s)`
                        : 'Sem acompanhantes'}
                    </p>
                  </div>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                    {confirmation.totalGuests} pessoa(s)
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  )
}

function DashboardShell({ children }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
