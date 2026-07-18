import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, CircleHelp, Copy, Edit3, Eye, HandHeart, LogOut, MoreVertical, Plus, Trash2, Users } from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { useWedding } from '../../context/WeddingContext'
import { canSaveWedding } from '../../api/weddings'
import { saveWeddingContent } from '../../api/weddings'
import { createInvitation, deleteInvitation, getInvitations, updateInvitationGuestStatus } from '../../api/rsvps'
import { ApiError } from '../../api/client'
import { mediaUrl } from '../../utils/media'
import { formatWeddingDate, weddingDisplayTitle, weddingDisplayVenue } from '../../utils/weddingDisplay'
import { copyTextToClipboard } from '../../utils/clipboard'
import MobileNav from '../../components/layout/MobileNav'
import { CONTRIBUTION_PIX_KEY } from '../../data/contribution'
import { useAuth } from '../../context/AuthContext'

const CONTRIBUTION_PROMPT_KEY_PREFIX = 'baitacasamento_contribution_prompt_seen'
const DEFAULT_INVITATION_MESSAGE = 'Olá! Nosso grande dia está chegando, e preparamos um site com todos os detalhes do nosso casamento.'

function invitationText(wedding, invitation, customMessage = wedding.invitationMessage, includeLink = true) {
  const url = `${window.location.origin}/${wedding.slug}`
  const couple = weddingDisplayTitle(wedding)
  const intro = customMessage?.trim() || DEFAULT_INVITATION_MESSAGE
  const requiredText = `${intro}\n\nCasamento de ${couple}\n\nNo site, procure pelo convite:\n${invitation.displayName}\n\nDepois, informe o código de confirmação:\n${invitation.accessCode}`
  return includeLink ? `${requiredText}\n\nAcesse:\n${url}` : requiredText
}

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

function GuestsTab({ wedding, updateWedding, publishWedding }) {
  const navigate = useNavigate()
  const [invitations, setInvitations] = useState([])
  const [draft, setDraft] = useState('')
  const [showAddInvitations, setShowAddInvitations] = useState(false)
  const [showInvitationHelp, setShowInvitationHelp] = useState(false)
  const [showConfirmationHelp, setShowConfirmationHelp] = useState(false)
  const [showMessageEditor, setShowMessageEditor] = useState(false)
  const [messageDraft, setMessageDraft] = useState(wedding.invitationMessage || DEFAULT_INVITATION_MESSAGE)
  const [savingMessage, setSavingMessage] = useState(false)
  const [updatingGuestId, setUpdatingGuestId] = useState(null)
  const [openGuestMenuId, setOpenGuestMenuId] = useState(null)
  const [openInvitationMenuId, setOpenInvitationMenuId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copiedInvitationId, setCopiedInvitationId] = useState(null)
  const [copiedCodeId, setCopiedCodeId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const load = () => {
    setLoading(true); setError('')
    getInvitations(wedding.id).then(data => setInvitations(data ?? [])).catch(err => setError(err.message)).finally(() => setLoading(false))
  }

  useEffect(load, [wedding.id])

  useEffect(() => {
    setMessageDraft(wedding.invitationMessage || DEFAULT_INVITATION_MESSAGE)
  }, [wedding.invitationMessage])

  useEffect(() => {
    if (!openGuestMenuId) return
    const closeMenu = () => setOpenGuestMenuId(null)
    document.addEventListener('pointerdown', closeMenu)
    return () => document.removeEventListener('pointerdown', closeMenu)
  }, [openGuestMenuId])
  useEffect(() => {
    if (!openInvitationMenuId) return
    const closeMenu = () => setOpenInvitationMenuId(null)
    document.addEventListener('pointerdown', closeMenu)
    return () => document.removeEventListener('pointerdown', closeMenu)
  }, [openInvitationMenuId])

  const addInvitations = async () => {
    const parsed = draft.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(parseInvitationLine)
    if (!parsed.length) return
    setSaving(true); setError('')
    try {
      for (const invitation of parsed) await createInvitation(wedding.id, invitation)
      setDraft(''); setShowAddInvitations(false); load()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const remove = async (id) => {
    setOpenInvitationMenuId(null)
    if (!confirm('Remover este convite e suas respostas?')) return
    try { await deleteInvitation(wedding.id, id); setInvitations(current => current.filter(item => item.id !== id)) } catch (err) { setError(err.message) }
  }

  const copyInvite = async (invitation) => {
    const copied = await copyTextToClipboard(invitationText(wedding, invitation))
    if (copied) {
      setOpenInvitationMenuId(null)
      setCopiedCodeId(null)
      setCopiedInvitationId(invitation.id)
      window.setTimeout(() => setCopiedInvitationId(current => current === invitation.id ? null : current), 2000)
    }
  }

  const saveInvitationMessage = async () => {
    const invitationMessage = messageDraft.trim()
    if (!invitationMessage) return
    setSavingMessage(true); setError('')
    try {
      const nextWedding = { ...wedding, invitationMessage }
      const savedWedding = await saveWeddingContent(nextWedding)
      const updates = { invitationMessage: savedWedding?.invitationMessage ?? invitationMessage }
      updateWedding(updates)
      publishWedding(updates)
      setShowMessageEditor(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingMessage(false)
    }
  }

  const copyConfirmationCode = async (invitation) => {
    const copied = await copyTextToClipboard(invitation.accessCode)
    if (copied) {
      setOpenInvitationMenuId(null)
      setCopiedInvitationId(null)
      setCopiedCodeId(invitation.id)
      window.setTimeout(() => setCopiedCodeId(current => current === invitation.id ? null : current), 2000)
    }
  }

  const updateGuestStatus = async (invitationId, guestId, status) => {
    if (updatingGuestId) return
    setUpdatingGuestId(guestId); setError('')
    try {
      const updatedInvitation = await updateInvitationGuestStatus(wedding.id, invitationId, guestId, status)
      setInvitations(current => current.map(item => item.id === invitationId ? updatedInvitation : item))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingGuestId(null)
      setOpenGuestMenuId(null)
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
    <div className="mb-7 flex items-center justify-between gap-3">
      <h1 className="font-serif text-3xl text-stone-900 sm:text-4xl">Convidados</h1>
      <button type="button" onClick={() => setShowConfirmationHelp(true)} className="inline-flex min-h-10 flex-shrink-0 items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"><CircleHelp size={16} /><span className="hidden sm:inline">Como funciona?</span></button>
    </div>
    {wedding.rsvpEnabled === false && (
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-medium text-amber-900">A confirmação de presença não está visível no site</p><p className="mt-1 text-xs leading-relaxed text-amber-700">Você pode continuar organizando os convites, mas seus convidados não conseguirão confirmar a presença enquanto essa seção estiver desativada.</p></div>
        <Button variant="primary" size="sm" onClick={() => navigate('/editor?tab=rsvp')} className="flex-shrink-0">Ir para Presença</Button>
      </div>
    )}
    <div className="mb-6 flex flex-col gap-2 sm:flex-row">
      <Button variant="outline" onClick={() => setShowMessageEditor(true)} className="justify-center sm:justify-start"><Edit3 size={15} /> Editar mensagem de convite</Button>
      <Button variant="primary" onClick={() => setShowAddInvitations(true)} className="justify-center sm:justify-start"><Plus size={16} /> Adicionar convidados</Button>
    </div>
    <Modal isOpen={showAddInvitations} onClose={() => setShowAddInvitations(false)} title="Adicionar convidados">
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed text-stone-600">Adicione uma pessoa, um casal ou uma família inteira. Digite um convite por linha.</p>
        <button type="button" onClick={() => { setShowAddInvitations(false); setShowInvitationHelp(true) }} className="inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 text-xs font-medium text-stone-600 hover:bg-stone-50"><CircleHelp size={14} /> Ajuda</button>
      </div>
      <label htmlFor="guest-invitations" className="mb-2 block text-sm font-medium text-stone-800">Adicione seus convidados aqui</label>
      <textarea id="guest-invitations" value={draft} onChange={e => setDraft(e.target.value)} rows={6} placeholder={'Ana Paula\nClaudia Pires; José Carlos\nFamília Souza +3'} className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-300 focus:border-stone-500 focus:ring-2 focus:ring-stone-100" />
      <Button className="mt-4" fullWidth onClick={addInvitations} disabled={saving || !draft.trim()}><Plus size={15} /> {saving ? 'Adicionando...' : 'Adicionar à lista'}</Button>
    </Modal>
    <Modal isOpen={showConfirmationHelp} onClose={() => setShowConfirmationHelp(false)} title="Como funciona a confirmação?">
      <p className="mb-5 text-sm leading-relaxed text-stone-600">Aqui você organiza todos os convidados da festa. Depois de cadastrados, eles poderão confirmar a presença diretamente no site do casamento.</p>
      <div className="space-y-3">
        <div className="flex gap-3 rounded-xl bg-stone-50 p-4"><span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">1</span><div><p className="text-sm font-medium text-stone-800">Adicione os convidados</p><p className="mt-1 text-xs leading-relaxed text-stone-500">Cadastre uma pessoa, um casal ou um grupo no mesmo convite.</p></div></div>
        <div className="flex gap-3 rounded-xl bg-stone-50 p-4"><span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">2</span><div><p className="text-sm font-medium text-stone-800">Envie a mensagem do convite</p><p className="mt-1 text-xs leading-relaxed text-stone-500">Cada convite recebe um código exclusivo, incluído automaticamente na mensagem copiada.</p></div></div>
        <div className="flex gap-3 rounded-xl bg-stone-50 p-4"><span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">3</span><div><p className="text-sm font-medium text-stone-800">O convidado confirma pelo site</p><p className="mt-1 text-xs leading-relaxed text-stone-500">No site, ele procura o nome do convite, informa o código e confirma quem estará presente.</p></div></div>
      </div>
      <Button variant="primary" fullWidth className="mt-5" onClick={() => setShowConfirmationHelp(false)}>Entendi</Button>
    </Modal>
    <Modal isOpen={showInvitationHelp} onClose={() => { setShowInvitationHelp(false); setShowAddInvitations(true) }} title="Como adicionar convidados">
      <p className="mb-4 text-sm leading-relaxed text-stone-600">Você pode criar um convite individual, para um casal ou para uma família inteira. Digite um convite por linha.</p>
      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4"><p className="text-xs font-medium uppercase tracking-wider text-stone-500">Uma pessoa</p><p className="mt-2 text-sm font-medium text-stone-900">Maria Miranda</p><p className="mt-1 text-xs leading-relaxed text-stone-500">Para um convite nominal individual, digite somente o nome da pessoa.</p></div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4"><p className="text-xs font-medium uppercase tracking-wider text-stone-500">Casal no mesmo convite</p><p className="mt-2 text-sm font-medium text-stone-900">Claudia Pires; José Carlos</p><p className="mt-1 text-xs leading-relaxed text-stone-500">Para incluir o casal em um único convite, informe os dois nomes separados por ponto e vírgula.</p></div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4"><p className="text-xs font-medium uppercase tracking-wider text-stone-500">Pessoa com acompanhantes</p><p className="mt-2 text-sm font-medium text-stone-900">Carlos Souza +3</p><p className="mt-1 text-xs leading-relaxed text-stone-500">Não precisa informar o nome de todos. Este exemplo cria um convite para Carlos e mais três acompanhantes.</p></div>
      </div>
      <Button variant="primary" fullWidth className="mt-5" onClick={() => { setShowInvitationHelp(false); setShowAddInvitations(true) }}>Entendi</Button>
    </Modal>
    <Modal isOpen={showMessageEditor} onClose={() => setShowMessageEditor(false)} title="Mensagem padrão do convite">
      <p className="mb-4 text-sm leading-relaxed text-stone-500">Escreva uma mensagem com o jeitinho de vocês. Ela será usada como base sempre que um convite for compartilhado.</p>
      <label htmlFor="invitation-message" className="mb-2 block text-sm font-medium text-stone-800">Texto personalizado</label>
      <textarea id="invitation-message" value={messageDraft} onChange={e => setMessageDraft(e.target.value)} rows={4} maxLength={500} className="w-full resize-none rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-100" />
      <p className="mt-1 text-right text-[11px] text-stone-400">{messageDraft.length}/500</p>
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">Prévia completa</p>
        <div className="max-h-[32vh] overflow-y-auto whitespace-pre-line rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed text-stone-600">{invitationText(wedding, invitations[0] ?? { displayName: 'Família Souza', accessCode: 'ABC123' }, messageDraft, false)}</div>
      </div>
      <div className="mt-5 flex gap-2">
        <Button variant="outline" fullWidth onClick={() => setShowMessageEditor(false)}>Cancelar</Button>
        <Button variant="primary" fullWidth disabled={savingMessage || !messageDraft.trim()} onClick={saveInvitationMessage}>{savingMessage ? 'Salvando...' : 'Salvar mensagem'}</Button>
      </div>
    </Modal>
    {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="font-serif text-2xl text-stone-900">Convites cadastrados</h2>
      <div className="flex min-w-0 items-center gap-2">
        <div className="-mx-1 flex min-w-0 gap-1 overflow-x-auto px-1 pb-2">
          {summaryFilters.map(filter => <button key={filter.status} type="button" onClick={() => setStatusFilter(filter.status)} className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === filter.status ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>{filter.label} <span className={statusFilter === filter.status ? 'text-white/70' : 'text-stone-400'}>{filter.value}</span></button>)}
        </div>
      </div>
    </div>
    {(copiedInvitationId || copiedCodeId) && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-x-4 bottom-24 z-[80] mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-xl md:bottom-6"><Check size={15} className="text-emerald-300" />{copiedInvitationId ? 'Mensagem de convite copiada' : 'Código copiado'}</motion.div>}
    {loading ? <p className="py-8 text-center text-sm text-stone-400">Carregando convidados...</p> : invitations.length === 0 ? <Card className="p-8 text-center"><Users className="mx-auto mb-3 text-stone-300" /><p className="text-sm text-stone-500">Nenhum convite criado ainda.</p></Card> : visibleInvitations.length === 0 ? <Card className="p-8 text-center"><p className="text-sm text-stone-500">Nenhum convidado neste filtro.</p></Card> : <div className="space-y-2">{visibleInvitations.map(invitation => <Card key={invitation.id} className="p-3 sm:p-4">
      <div className="relative flex min-w-0 items-center justify-between gap-2">
        <div className="min-w-0"><h3 className="truncate font-medium text-stone-900" title={invitation.displayName}>{invitation.displayName}</h3><p className="text-[11px] text-stone-400">{invitation.guests.length} pessoa(s) {statusFilter !== 'ALL' ? 'neste filtro' : ''}</p></div>
        <div className="flex flex-shrink-0 items-center gap-1"><span className="rounded-lg bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-500">Código: <strong className="font-mono font-semibold tracking-wider text-stone-700">{invitation.accessCode}</strong></span><button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => setOpenInvitationMenuId(current => current === invitation.id ? null : invitation.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100" aria-label={`Ações do convite ${invitation.displayName}`} aria-expanded={openInvitationMenuId === invitation.id}><MoreVertical size={17} /></button></div>
        {openInvitationMenuId === invitation.id && <div onPointerDown={event => event.stopPropagation()} className="absolute right-0 top-10 z-30 min-w-52 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg"><button type="button" onClick={() => copyInvite(invitation)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-stone-700 hover:bg-stone-50">{copiedInvitationId === invitation.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />} {copiedInvitationId === invitation.id ? 'Mensagem copiada' : 'Copiar mensagem de convite'}</button><button type="button" onClick={() => copyConfirmationCode(invitation)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-stone-700 hover:bg-stone-50">{copiedCodeId === invitation.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />} {copiedCodeId === invitation.id ? 'Código copiado' : 'Copiar apenas código'}</button><button type="button" onClick={() => remove(invitation.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-red-500 hover:bg-red-50"><Trash2 size={14} /> Remover convite</button></div>}
      </div>
      <div className="mt-2 divide-y divide-stone-100 rounded-lg border border-stone-100">{invitation.guests.map(guest => <div key={guest.id} className="relative flex items-center justify-between gap-2 px-3 py-2"><span className="min-w-0 truncate text-sm text-stone-700" title={guest.name}>{guest.name}</span><div className="flex flex-shrink-0 items-center gap-1"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${guest.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : guest.status === 'DECLINED' ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-500'}`}>{guest.status === 'CONFIRMED' ? 'Confirmado' : guest.status === 'DECLINED' ? 'Não irá' : 'Aguardando'}</span><button type="button" disabled={updatingGuestId === guest.id} onPointerDown={e => e.stopPropagation()} onClick={() => setOpenGuestMenuId(current => current === guest.id ? null : guest.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-50" aria-label={`Opções para ${guest.name}`} aria-expanded={openGuestMenuId === guest.id}><MoreVertical size={16} /></button></div>{openGuestMenuId === guest.id && <div onPointerDown={e => e.stopPropagation()} className="absolute right-2 top-10 z-20 min-w-48 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg"><button type="button" onClick={() => updateGuestStatus(invitation.id, guest.id, 'CONFIRMED')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-700"><Check size={14} /> Confirmar presença</button><button type="button" onClick={() => updateGuestStatus(invitation.id, guest.id, 'DECLINED')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-red-50 hover:text-red-600"><span className="inline-flex h-3.5 w-3.5 items-center justify-center text-base leading-none">×</span> Desconfirmar presença</button><button type="button" onClick={() => updateGuestStatus(invitation.id, guest.id, 'PENDING')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-100"><span className="inline-flex h-3.5 w-3.5 items-center justify-center text-sm leading-none">○</span> Marcar como aguardando</button></div>}</div>)}</div>
    </Card>)}</div>}
  </div></DashboardShell>
}

export default function Dashboard() {
  const { logout } = useAuth()
  const { wedding, loadingWedding, updateWedding, publishWedding, deleteWeddingSite } = useWedding()
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [copiedSiteLink, setCopiedSiteLink] = useState(false)
  const [copySiteLinkError, setCopySiteLinkError] = useState(false)
  const [showContributionPrompt, setShowContributionPrompt] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab')
  const hasWedding = canSaveWedding(wedding?.id)

  if (currentTab === 'colaborar') {
    return <CollaborationTab />
  }

  if (currentTab === 'convidados' && hasWedding) {
    return <GuestsTab wedding={wedding} updateWedding={updateWedding} publishWedding={publishWedding} />
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
          <button type="button" onClick={() => { logout(); navigate('/') }} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 md:hidden"><LogOut size={15} /> Sair da conta</button>
        </div>
      </DashboardShell>
    )
  }

  const formattedDate = formatWeddingDate(wedding.date, { day: '2-digit', month: 'long', year: 'numeric' })
  const weddingTitle = weddingDisplayTitle(wedding)
  const weddingVenue = weddingDisplayVenue(wedding)
  const siteUrl = `${window.location.origin}/${wedding.slug}`
  const contributionPromptStorageKey = `${CONTRIBUTION_PROMPT_KEY_PREFIX}:${wedding.id ?? wedding.slug}`

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
      navigate(`/${wedding.slug}?from=dashboard`)
    } else {
      setShowContributionPrompt(true)
    }
  }

  const continueToSite = () => {
    markContributionPromptAsSeen()
    navigate(`/${wedding.slug}?from=dashboard`)
  }

  const copyPixAndContinue = async () => {
    await copyTextToClipboard(CONTRIBUTION_PIX_KEY)
    markContributionPromptAsSeen()
    navigate(`/${wedding.slug}?from=dashboard`)
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
    window.setTimeout(() => {
      setCopiedSiteLink(false)
      setCopySiteLinkError(false)
    }, 1800)
  }

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div><p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Seu site</p><h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-2">{weddingTitle}</h1><p className="text-stone-500 text-sm">{formattedDate} · {weddingVenue}</p></div>
          <button type="button" onClick={() => { logout(); navigate('/') }} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 md:hidden"><LogOut size={14} /> Sair</button>
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
                onClick={handleCopySiteLink}
                fullWidth
                className="sm:w-auto"
              >
                {copiedSiteLink ? <Check size={14} /> : <Copy size={14} />}
                {copiedSiteLink ? 'Link copiado' : copySiteLinkError ? 'Tentar novamente' : 'Copiar link do site'}
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
          </div>
        </Card>

        <button type="button" onClick={() => { logout(); navigate('/') }} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 md:hidden"><LogOut size={15} /> Sair da conta</button>
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
