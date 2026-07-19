import { useState } from 'react'
import { Check, Search } from 'lucide-react'
import { respondToInvitation, searchInvitations, verifyInvitation } from '../../api/rsvps'

export default function RsvpFlow({ wedding, accent = wedding.primaryColor }) {
  const [step, setStep] = useState('search')
  const [name, setName] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [code, setCode] = useState('')
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async (event) => {
    event.preventDefault()
    setLoading(true); setError('')
    try {
      const found = await searchInvitations(wedding.slug, name)
      setResults(found ?? [])
      if (!found?.length) setError('Não encontramos um convite com esse nome.')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const verify = async (event) => {
    event.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await verifyInvitation(wedding.slug, selected.id, code)
      setInvitation(data); setStep('respond')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const setGuest = (id, updates) => setInvitation(current => ({
    ...current,
    guests: current.guests.map(guest => guest.id === id ? { ...guest, ...updates } : guest),
  }))

  const save = async () => {
    setLoading(true); setError('')
    try {
      await respondToInvitation(wedding.slug, invitation.id, code, invitation.guests)
      setStep('done')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const fieldClass = 'w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-400'
  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-white p-5 text-left text-stone-900 shadow-sm sm:p-7">
      {step === 'search' && (
        <form onSubmit={search} className="space-y-4">
          <label htmlFor="rsvp-guest-name" className="sr-only">Nome usado na lista de convidados</label>
          <input id="rsvp-guest-name" className={fieldClass} value={name} onChange={e => setName(e.target.value)} placeholder="Digite seu nome como está no convite" minLength={2} required />
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white disabled:opacity-60" style={{ backgroundColor: accent }}><Search size={16} /> {loading ? 'Buscando...' : 'Buscar convite'}</button>
          {results.map(result => <button type="button" key={result.id} onClick={() => { setSelected(result); setStep('code'); setError('') }} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-left text-sm font-medium hover:border-stone-400">{result.displayName}</button>)}
        </form>
      )}
      {step === 'code' && (
        <form onSubmit={verify} className="space-y-4">
          <button type="button" className="text-xs text-stone-400" onClick={() => setStep('search')}>Voltar</button>
          <div><h3 className="font-serif text-2xl">Digite seu código</h3><p className="mt-1 text-sm text-stone-500">Use o código de quatro dígitos enviado pelos noivos para {selected?.displayName}.</p></div>
          <input className={`${fieldClass} text-center text-xl tracking-[0.35em]`} inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" required />
          <button disabled={loading || code.length !== 6} className="w-full rounded-xl px-4 py-3 text-sm font-medium text-white disabled:opacity-60" style={{ backgroundColor: accent }}>{loading ? 'Validando...' : 'Acessar convite'}</button>
        </form>
      )}
      {step === 'respond' && invitation && (
        <div className="space-y-5">
          <div><h3 className="font-serif text-2xl">Quem estará presente?</h3><p className="mt-1 text-sm text-stone-500">Marque uma opção para cada pessoa do convite.</p></div>
          <div className="space-y-3">{invitation.guests.map(guest => <div key={guest.id} className="rounded-xl border border-stone-200 p-3">
            {guest.name.startsWith('Acompanhante') ? <input className={`${fieldClass} mb-3`} value={guest.name} onChange={e => setGuest(guest.id, { name: e.target.value })} /> : <p className="mb-3 text-sm font-medium">{guest.name}</p>}
            <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setGuest(guest.id, { status: 'CONFIRMED' })} className={`rounded-lg border px-3 py-2 text-xs font-medium ${guest.status === 'CONFIRMED' ? 'text-white' : 'border-stone-200 text-stone-600'}`} style={guest.status === 'CONFIRMED' ? { backgroundColor: accent, borderColor: accent } : {}}>Irá</button><button type="button" onClick={() => setGuest(guest.id, { status: 'DECLINED' })} className={`rounded-lg border px-3 py-2 text-xs font-medium ${guest.status === 'DECLINED' ? 'border-stone-700 bg-stone-700 text-white' : 'border-stone-200 text-stone-600'}`}>Não irá</button></div>
          </div>)}</div>
          <button onClick={save} disabled={loading || invitation.guests.some(g => g.status === 'PENDING')} className="w-full rounded-xl px-4 py-3 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: accent }}>{loading ? 'Salvando...' : 'Salvar confirmação'}</button>
        </div>
      )}
      {step === 'done' && <div className="py-6 text-center"><Check className="mx-auto mb-3" size={32} style={{ color: accent }} /><h3 className="font-serif text-2xl">Resposta registrada</h3><p className="mt-2 text-sm text-stone-500">Obrigado por responder. Você pode usar o mesmo nome e código para alterar a resposta depois.</p></div>}
      {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  )
}
