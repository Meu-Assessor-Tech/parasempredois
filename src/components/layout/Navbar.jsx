import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

export default function Navbar({ transparent = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const startFreePath = `/login?next=${encodeURIComponent('/editor')}&template=classic`

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const linkClass = transparent
    ? 'text-sm text-white/85 hover:text-white transition-colors'
    : 'text-sm text-stone-500 hover:text-stone-900 transition-colors'

  const brandTextClass = transparent
    ? 'font-serif text-lg font-medium text-white drop-shadow-sm'
    : 'font-serif text-lg font-medium text-stone-900'

  const mobileButtonClass = transparent ? 'md:hidden p-2 text-white' : 'md:hidden p-2 text-stone-900'

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        transparent ? 'bg-transparent' : 'bg-white/90 backdrop-blur-md border-b border-stone-100'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart size={18} className={transparent ? 'text-white fill-white drop-shadow-sm' : 'text-sand-600 fill-sand-600'} />
          <span className={brandTextClass}>Para sempre dois</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/templates" className={linkClass}>Templates</Link>
          <Link to="/site/ana-e-pedro" className={linkClass}>Exemplo</Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Sair</Button>
            </div>
          ) : (
            <Link to={startFreePath}>
              <Button variant="primary" size="sm">Comece grátis</Button>
            </Link>
          )}
        </div>

        <button className={mobileButtonClass} onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-3"
        >
          <Link to="/templates" className="block text-sm text-stone-600 py-2">Templates</Link>
          <Link to="/site/ana-e-pedro" className="block text-sm text-stone-600 py-2">Exemplo</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block"><Button variant="primary" size="sm" fullWidth>Dashboard</Button></Link>
              <Button variant="ghost" size="sm" fullWidth onClick={handleLogout}>Sair</Button>
            </>
          ) : (
            <Link to={startFreePath} className="block"><Button variant="primary" size="sm" fullWidth>Comece grátis</Button></Link>
          )}
        </motion.div>
      )}
    </motion.nav>
  )
}

