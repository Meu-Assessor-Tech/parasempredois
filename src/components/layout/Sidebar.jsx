import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, LayoutDashboard, Edit3, HandHeart, LogOut, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWedding } from '../../context/WeddingContext'
import { canSaveWedding } from '../../api/weddings'

export default function Sidebar() {
  const location = useLocation()
  const { logout } = useAuth()
  const { wedding } = useWedding()
  const navigate = useNavigate()
  const hasWedding = canSaveWedding(wedding?.id)
  const navItems = [
    { icon: LayoutDashboard, label: 'Principal', path: '/principal' },
    hasWedding
      ? { icon: Edit3, label: 'Editar', path: '/editor' }
      : { icon: Edit3, label: 'Criar site', path: '/criar-site' },
    ...(hasWedding ? [{ icon: Users, label: 'Convidados', path: '/principal?tab=convidados' }] : []),
    { icon: HandHeart, label: 'Colaborar', path: '/principal?tab=colaborar' },
  ]

  const currentPath = `${location.pathname}${location.search}`

  return (
    <div className="sticky top-0 h-screen w-60 bg-white border-r border-stone-100 flex flex-col py-6">
      <div className="px-6 mb-8">
        <Link to="/" className="flex items-center gap-2">
          <Heart size={16} className="text-sand-600 fill-sand-600" />
          <span className="font-serif text-base font-medium text-stone-900">Para sempre dois</span>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = item.path.includes('?')
            ? currentPath === item.path
            : location.pathname === item.path && !location.search

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors ${
                  isActive
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                }`}
              >
                <item.icon size={16} />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-3">
        <motion.button
          whileHover={{ x: 2 }}
          onClick={() => { logout(); navigate('/') }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Sair</span>
        </motion.button>
      </div>
    </div>
  )
}
