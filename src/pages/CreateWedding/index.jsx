import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Calendar, Heart } from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { ApiError } from '../../api/client'
import { useWedding } from '../../context/WeddingContext'

export default function CreateWedding() {
  const [form, setForm] = useState({ brideName: '', groomName: '', date: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { createWeddingSite } = useWedding()
  const navigate = useNavigate()

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await createWeddingSite(form)
      navigate('/editor')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar o site')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
          <div className="mb-8">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Criar site</p>
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-2">Vamos começar pelo essencial</h1>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xl">
              Essas informações criam o registro do casamento. Depois você escolhe fotos, presentes, cores e textos no editor.
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome da noiva"
                  placeholder="Ex: Ana"
                  value={form.brideName}
                  onChange={event => updateForm('brideName', event.target.value)}
                  required
                />
                <Input
                  label="Nome do noivo"
                  placeholder="Ex: Pedro"
                  value={form.groomName}
                  onChange={event => updateForm('groomName', event.target.value)}
                  required
                />
              </div>

              <Input
                label="Data do casamento"
                type="date"
                value={form.date}
                onChange={event => updateForm('date', event.target.value)}
                required
              />

              <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4 flex gap-3 text-sm text-stone-500 leading-relaxed">
                <Calendar size={18} className="text-stone-400 flex-shrink-0 mt-0.5" />
                <p>
                  O link do site será criado automaticamente com o primeiro nome de cada um e a data, por exemplo: ana-e-pedro-20-09-2026.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => navigate('/principal')}>
                  Voltar
                </Button>
                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Criando...
                    </span>
                  ) : (
                    <>
                      <Heart size={16} />
                      Criar e editar
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
