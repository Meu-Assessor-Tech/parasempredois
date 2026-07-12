import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Copy, Edit3, Eye, HandHeart, MessageCircle, Plus, Share2, Trash2, Users } from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useWedding } from '../../context/WeddingContext'
import { canSaveWedding } from '../../api/weddings'
import { createInvitation, deleteInvitation, getInvitations } from '../../api/rsvps'
import { ApiError } from '../../api/client'
import { mediaUrl } from '../../utils/media'
import { formatWeddingDate, weddingDisplayTitle, weddingDisplayVenue } from '../../utils/weddingDisplay'
import { copyTextToClipboard } from '../../utils/clipboard'
import MobileNav from '../../components/layout/MobileNav'
import { CONTRIBUTION_PIX_KEY } from '../../data/contribution'

const CONTRIBUTION_PROMPT_KEY_PREFIX = 'baitacasamento_contribution_prompt_seen'

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

function CollaborationTab() {
  const [copied, setCopied] = useState(false)

  const handleCopyPix = async () => {
    const copiedPix = await copyTextToClipboard(CONTRIBUTION_PIX_KEY)
    setCopied(copiedPix)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Colaboração opcional</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-6">Ajude a manter o Para sempre dois</h1>

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-sand-100 text-sand-700 flex items-center justify-center">
                <HandHeart size={20} />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-stone-900 mb-2">Colaborar por Pix</h2>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Se o projeto ajudou vocês, qualquer valor contribui com os custos para manter a plataforma funcionando.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="mb-3 text-sm text-stone-500">Copie a chave e escolha o valor no aplicativo do seu banco.</p>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400 mb-2">Chave Pix</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <code className="flex-1 rounded-xl bg-white border border-stone-200 px-4 py-3 text-sm text-stone-800 break-all">
                  {CONTRIBUTION_PIX_KEY}
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

function parseInvitationLine(line) {
  const parts = line.split(';').map(value => value.trim()).filter(Boolean)
  const plusMatch = parts[0]?.match(/^(.*?)\s*\+(\d+)$/)
  if (plusMatch) {
    const mainName = plusMatch[1].trim()
    const companionCount = Math.min(10, Number(plusMatch[2]))
    return {
      displayName: `${mainName} e acompanhantes`,
      guests: [mainName, ...Array.from({ length: companionCount }, (_, index) => `Acompanhante ${index + 1}`)],
    }
  }
  return {
    displayName: parts.length > 1 ? parts.join(' e ') : parts[0],
    guests: parts,
  }
}

function GuestsTab({ wedding }) {
  const [invitations, setInvitations] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copiedInvitationId, setCopiedInvitationId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const load = () => {
    setLoading(true); setError('')
    getInvitations(wedding.id).then(data => setInvitations(data ?? [])).catch(err => setError(err.message)).finally(() => setLoading(false))
  }

  useEffect(load, [wedding.id])

  const addInvitations = async () => {
    const parsed = draft.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(parseInvitationLine)
    if (!parsed.length) return
    setSaving(true); setError('')
    try {
      for (const invitation of parsed) await createInvitation(wedding.id, invitation)
      setDraft(''); load()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Remover este convite e suas respostas?')) return
    try { await deleteInvitation(wedding.id, id); setInvitations(current => current.filter(item => item.id !== id)) } catch (err) { setError(err.message) }
  }

  const copyInvite = async (invitation) => {
    const url = `${window.location.origin}/site/${wedding.slug}#preview-rsvp`
    const copied = await copyTextToClipboard(`Olá! Estamos preparando nosso grande dia com muito carinho e queremos saber se poderemos contar com a sua presença.\n\nPara confirmar, acesse:\n${url}\n\nSeu código de confirmação é: ${invitation.accessCode}\n\nEsperamos celebrar esse momento com você!`)
    if (copied) {
      setCopiedInvitationId(invitation.id)
      window.setTimeout(() => setCopiedInvitationId(current => current === invitation.id ? null : current), 2000)
    }
  }

  const guests = invitations.flatMap(invitation => invitation.guests ?? [])
  const count = status => guests.filter(guest => guest.status === status).length
  const visibleInvitations = statusFilter === 'ALL'
    ? invitations
    : invitations
        .map(invitation => ({ ...invitation, guests: invitation.guests.filter(guest => guest.status === statusFilter) }))
        .filter(invitation => invitation.guests.length > 0)
  const summaryFilters = [
    { label: 'Total', value: guests.length, status: 'ALL' },
    { label: 'Confirmados', value: count('CONFIRMED'), status: 'CONFIRMED' },
    { label: 'Não irão', value: count('DECLINED'), status: 'DECLINED' },
    { label: 'Aguardando', value: count('PENDING'), status: 'PENDING' },
  ]

  return <DashboardShell><div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
    <p className="mb-1 text-xs uppercase tracking-widest text-stone-400">Organização</p>
    <h1 className="mb-2 font-serif text-3xl text-stone-900 sm:text-4xl">Convidados</h1>
    <p className="mb-7 max-w-2xl text-sm leading-relaxed text-stone-500">Crie um convite por família ou grupo. Cada linha gera um código exclusivo para confirmação.</p>
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {summaryFilters.map(filter => <button key={filter.status} type="button" onClick={() => setStatusFilter(filter.status)} className={`rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 ${statusFilter === filter.status ? 'border-stone-900 bg-stone-900' : 'border-stone-100 bg-white'}`}><p className={`text-xs ${statusFilter === filter.status ? 'text-white/65' : 'text-stone-400'}`}>{filter.label}</p><p className={`mt-1 font-serif text-3xl ${statusFilter === filter.status ? 'text-white' : 'text-stone-900'}`}>{filter.value}</p><p className={`mt-1 text-[10px] ${statusFilter === filter.status ? 'text-white/55' : 'text-stone-300'}`}>{statusFilter === filter.status ? 'Filtro ativo' : 'Clique para filtrar'}</p></button>)}
    </div>
    <Card className="mb-6 p-5">
      <div className="mb-4">
        <h2 className="font-serif text-2xl text-stone-900">Adicionar convites</h2>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">Digite um convite por linha. Você pode cadastrar de três maneiras:</p>
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3"><p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Uma pessoa</p><p className="mt-1 text-sm font-medium text-stone-800">Maria Miranda</p><p className="mt-1 text-[11px] leading-relaxed text-stone-500">Cria um convite individual.</p></div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3"><p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Casal ou grupo</p><p className="mt-1 text-sm font-medium text-stone-800">Claudia Pires; José Carlos</p><p className="mt-1 text-[11px] leading-relaxed text-stone-500">Separe os nomes com ponto e vírgula.</p></div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3"><p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Com acompanhantes</p><p className="mt-1 text-sm font-medium text-stone-800">Clara +2</p><p className="mt-1 text-[11px] leading-relaxed text-stone-500">Cria Clara e duas vagas de acompanhante.</p></div>
      </div>
      <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={5} placeholder={'José Santos +3\nCarlos Andrade; Maria de Souza\nAna Paula'} className="w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-400" />
      <Button className="mt-3" onClick={addInvitations} disabled={saving || !draft.trim()}><Plus size={15} /> {saving ? 'Adicionando...' : 'Adicionar à lista'}</Button>
    </Card>
    {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
    {loading ? <p className="py-8 text-center text-sm text-stone-400">Carregando convidados...</p> : invitations.length === 0 ? <Card className="p-8 text-center"><Users className="mx-auto mb-3 text-stone-300" /><p className="text-sm text-stone-500">Nenhum convite criado ainda.</p></Card> : visibleInvitations.length === 0 ? <Card className="p-8 text-center"><p className="text-sm text-stone-500">Nenhum convidado neste filtro.</p></Card> : <div className="space-y-3">{visibleInvitations.map(invitation => <Card key={invitation.id} className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-medium text-stone-900">{invitation.displayName}</h3><p className="mt-1 text-xs text-stone-400">{invitation.guests.length} pessoa(s) {statusFilter !== 'ALL' ? 'neste filtro' : ''} · Código <span className="font-mono font-medium text-stone-700">{invitation.accessCode}</span></p></div><div className="flex gap-2"><Button variant={copiedInvitationId === invitation.id ? 'secondary' : 'outline'} size="sm" onClick={() => copyInvite(invitation)}>{copiedInvitationId === invitation.id ? <Check size={14} /> : <Copy size={14} />} {copiedInvitationId === invitation.id ? 'Convite copiado' : 'Copiar convite'}</Button><Button variant="ghost" size="sm" onClick={() => remove(invitation.id)} className="!text-red-500"><Trash2 size={14} /></Button></div></div>
      <div className="mt-4 divide-y divide-stone-100 rounded-xl border border-stone-100">{invitation.guests.map(guest => <div key={guest.id} className="flex items-center justify-between px-3 py-2.5"><span className="text-sm text-stone-700">{guest.name}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${guest.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : guest.status === 'DECLINED' ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-500'}`}>{guest.status === 'CONFIRMED' ? 'Confirmado' : guest.status === 'DECLINED' ? 'Não irá' : 'Aguardando'}</span></div>)}</div>
    </Card>)}</div>}
  </div></DashboardShell>
}

export default function Dashboard() {
  const { wedding, loadingWedding, deleteWeddingSite } = useWedding()
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [copiedSiteLink, setCopiedSiteLink] = useState(false)
  const [copySiteLinkError, setCopySiteLinkError] = useState(false)
  const [shareOptionsOpen, setShareOptionsOpen] = useState(false)
  const [showContributionPrompt, setShowContributionPrompt] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab')
  const hasWedding = canSaveWedding(wedding?.id)

  if (currentTab === 'colaborar') {
    return <CollaborationTab />
  }

  if (currentTab === 'convidados' && hasWedding) {
    return <GuestsTab wedding={wedding} />
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
  const siteUrl = `${window.location.origin}/site/${wedding.slug}`
  const contributionPromptStorageKey = `${CONTRIBUTION_PROMPT_KEY_PREFIX}:${wedding.id ?? wedding.slug}`
  const whatsappShareText = `Oi!\n\nNosso grande dia está chegando, e preparamos um site com todos os detalhes do nosso casamento.\n\nAcesse: ${siteUrl}\n\nEsperamos você para celebrar com a gente!`
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappShareText)}`

  const markContributionPromptAsSeen = () => {
    try {
      localStorage.setItem(contributionPromptStorageKey, '1')
    } catch {
      // Navigation remains available if local storage is unavailable.
    }
    setShowContributionPrompt(false)
  }

  const handleVisualizeSite = () => {
    let promptWasSeen = false
    try {
      promptWasSeen = localStorage.getItem(contributionPromptStorageKey) === '1'
    } catch {
      // Show the optional prompt when local storage is unavailable.
    }
    if (promptWasSeen) {
      navigate(`/site/${wedding.slug}?from=dashboard`)
    } else {
      setShowContributionPrompt(true)
    }
  }

  const continueToSite = () => {
    markContributionPromptAsSeen()
    navigate(`/site/${wedding.slug}?from=dashboard`)
  }

  const copyPixAndContinue = async () => {
    await copyTextToClipboard(CONTRIBUTION_PIX_KEY)
    markContributionPromptAsSeen()
    navigate(`/site/${wedding.slug}?from=dashboard`)
  }

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

  const handleCopySiteLink = async () => {
    const copied = await copyTextToClipboard(siteUrl)
    setCopiedSiteLink(copied)
    setCopySiteLinkError(!copied)
    if (copied) setShareOptionsOpen(false)
    window.setTimeout(() => {
      setCopiedSiteLink(false)
      setCopySiteLinkError(false)
    }, 1800)
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
            <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
              <Button variant="primary" size="sm" onClick={() => navigate('/editor')} fullWidth className="sm:w-auto">
                <Edit3 size={14} /> Editar site
              </Button>
              <Button variant="outline" size="sm" onClick={handleVisualizeSite} fullWidth className="sm:w-auto">
                <Eye size={14} /> Visualizar
              </Button>
              <Button
                variant={copiedSiteLink ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShareOptionsOpen(open => !open)}
                fullWidth
                className="sm:w-auto"
              >
                {copiedSiteLink ? <Check size={14} /> : <Share2 size={14} />}
                {copiedSiteLink ? 'Link copiado' : 'Encaminhar'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteSite}
                disabled={deleting}
                fullWidth
                className="!text-red-600 hover:!bg-red-50 sm:w-auto"
              >
                <Trash2 size={14} />
                {deleting ? 'Excluindo...' : 'Excluir site'}
              </Button>
            </div>
            {shareOptionsOpen && (
              <div className="mt-4 rounded-2xl border border-stone-100 bg-stone-50 p-3">
                <p className="mb-3 text-xs text-stone-500">Escolha como compartilhar o site:</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleCopySiteLink}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
                  >
                    <Copy size={14} />
                    {copySiteLinkError ? 'Tentar novamente' : 'Copiar link'}
                  </button>
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setShareOptionsOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>

      </div>
      <Modal
        isOpen={showContributionPrompt}
        onClose={continueToSite}
        title="Seu site está pronto!"
      >
        <div className="space-y-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sand-100 text-sand-700">
            <HandHeart size={20} />
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-stone-500">
            <p>
              O Para sempre dois é gratuito. Vocês podem editar e compartilhar o site sem nenhuma cobrança.
            </p>
            <p>
              Se quiserem, uma colaboração voluntária ajuda a manter a plataforma funcionando para outros casais. Ela é totalmente opcional e não libera recursos extras.
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-stone-400">Chave Pix</p>
            <code className="mt-1 block break-all text-sm text-stone-800">{CONTRIBUTION_PIX_KEY}</code>
          </div>
          <div className="space-y-2 pt-1">
            <Button variant="primary" fullWidth onClick={copyPixAndContinue}>
              <Copy size={16} /> Copiar Pix e visualizar site
            </Button>
            <Button variant="ghost" fullWidth onClick={continueToSite}>
              Continuar sem colaborar
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  )
}

function DashboardShell({ children }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto pb-24 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  )
}
