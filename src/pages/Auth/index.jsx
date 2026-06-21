import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../api/client'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { mockTemplates } from '../../data/mockTemplates'
import { useWedding } from '../../context/WeddingContext'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { login, loginWithGoogle, register } = useAuth()
  const { updateWedding } = useWedding()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedNextPath = searchParams.get('next') || '/dashboard'
  const nextPath = requestedNextPath.startsWith('/') ? requestedNextPath : '/dashboard'
  const templateFromUrl = searchParams.get('template')

  useEffect(() => {
    if (mockTemplates.some(template => template.id === templateFromUrl && !template.comingSoon)) {
      updateWedding({ template: templateFromUrl })
    }
  }, [templateFromUrl])

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const handleGoogleSuccess = async (response) => {
    setLoading(true)
    setError('')
    try {
      await loginWithGoogle(response.credential)
      navigate(nextPath)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao entrar com Google')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password)
      }
      navigate(nextPath)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sand-200/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-stone-200/50 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <Heart size={20} className="text-sand-600 fill-sand-600" />
            <span className="font-serif text-xl text-stone-900">Para sempre dois</span>
          </a>
          <h1 className="font-serif text-3xl text-stone-900 mb-2">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-stone-500 text-sm">
            {mode === 'login'
              ? 'Entre para continuar criando seu site'
              : 'Comece a criar o site do seu casamento'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {googleClientId ? (
            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Não foi possível conectar com o Google')}
                useOneTap={false}
                theme="outline"
                size="large"
                width="360"
                text="continue_with"
                locale="pt-BR"
              />
            </div>
          ) : (
            <p className="mb-6 text-center text-xs text-stone-400">
              Login com Google indisponível (configure VITE_GOOGLE_CLIENT_ID)
            </p>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-stone-100" />
            <span className="text-xs text-stone-400">ou</span>
            <div className="flex-1 h-px bg-stone-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    label="Nome do casal"
                    placeholder="Ex: Ana & Pedro"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-3 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              className="mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Entrando...' : 'Criando conta...'}
                </span>
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Criar conta'}
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          {mode === 'login' ? (
            <>
              Ainda não tem conta?{' '}
              <button onClick={() => { setMode('register'); setError('') }} className="text-stone-900 font-medium hover:underline">
                Criar conta grátis
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button onClick={() => { setMode('login'); setError('') }} className="text-stone-900 font-medium hover:underline">
                Entrar
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  )
}
