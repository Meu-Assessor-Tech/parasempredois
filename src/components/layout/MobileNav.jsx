import { Link, useLocation } from 'react-router-dom'
import { Edit3, Eye, HandHeart, Home, Users } from 'lucide-react'
import { useWedding } from '../../context/WeddingContext'
import { canSaveWedding } from '../../api/weddings'

export default function MobileNav({ onViewSite }) {
  const location = useLocation()
  const { wedding } = useWedding()
  const hasWedding = canSaveWedding(wedding?.id)
  const currentPath = `${location.pathname}${location.search}`
  const siteReturnSource = location.pathname === '/editor' ? 'editor' : 'dashboard'
  const editorTab = new URLSearchParams(location.search).get('tab') || 'design'

  const items = [
    { icon: Home, label: 'Principal', path: '/principal' },
    hasWedding
      ? { icon: Edit3, label: 'Editar', path: '/editor' }
      : { icon: Edit3, label: 'Criar', path: '/criar-site' },
    ...(hasWedding ? [{ icon: Eye, label: 'Ver site', path: `/${wedding.slug}?from=${siteReturnSource}${siteReturnSource === 'editor' ? `&editorTab=${editorTab}` : ''}`, onClick: siteReturnSource === 'editor' ? onViewSite : undefined }] : []),
    ...(hasWedding ? [{ icon: Users, label: 'Convidados', path: '/principal?tab=convidados' }] : []),
    { icon: HandHeart, label: 'Colaborar', path: '/principal?tab=colaborar' },
  ]
  const columns = hasWedding ? 'grid-cols-5' : 'grid-cols-3'

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-8px_30px_rgba(28,25,23,0.08)] backdrop-blur md:hidden">
      <div className={`mx-auto grid max-w-md ${columns} gap-1`}>
        {items.map(item => {
          const isActive = item.path.includes('?')
            ? currentPath === item.path
            : location.pathname === item.path && !location.search
          const itemClassName = `flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-medium transition-colors ${
            isActive ? 'bg-stone-900 text-white' : 'text-stone-500 active:bg-stone-100'
          }`
          const content = <><item.icon size={18} /><span className="leading-none">{item.label}</span></>
          return item.onClick ? (
            <button key={item.path} type="button" onClick={item.onClick} className={itemClassName}>
              {content}
            </button>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={itemClassName}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
