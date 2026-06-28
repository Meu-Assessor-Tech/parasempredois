import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Edit3, Eye, HandHeart, Home, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWedding } from '../../context/WeddingContext'
import { canSaveWedding } from '../../api/weddings'

export default function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { wedding } = useWedding()
  const hasWedding = canSaveWedding(wedding?.id)
  const currentPath = `${location.pathname}${location.search}`

  const items = [
    { icon: Home, label: 'Principal', path: '/principal' },
    hasWedding
      ? { icon: Edit3, label: 'Editar', path: '/editor' }
      : { icon: Edit3, label: 'Criar', path: '/criar-site' },
    { icon: HandHeart, label: 'Colaborar', path: '/principal?tab=colaborar' },
  ]
  const columns = hasWedding ? 'grid-cols-5' : 'grid-cols-4'

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-8px_30px_rgba(28,25,23,0.08)] backdrop-blur md:hidden">
      <div className={`mx-auto grid max-w-md ${columns} gap-1`}>
        {items.map(item => {
          const isActive = item.path.includes('?')
            ? currentPath === item.path
            : location.pathname === item.path && !location.search
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-medium transition-colors ${
                isActive ? 'bg-stone-900 text-white' : 'text-stone-500 active:bg-stone-100'
              }`}
            >
              <item.icon size={18} />
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
        {hasWedding && (
          <button
            type="button"
            onClick={() => window.open(`/site/${wedding.slug}`, '_blank', 'noopener,noreferrer')}
            className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-medium text-stone-500 transition-colors active:bg-stone-100"
          >
            <Eye size={18} />
            <span className="leading-none">Ver site</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => { logout(); navigate('/') }}
          className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-medium text-stone-500 transition-colors active:bg-stone-100"
        >
          <LogOut size={18} />
          <span className="leading-none">Sair</span>
        </button>
      </div>
    </nav>
  )
}
