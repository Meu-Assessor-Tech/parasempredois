import { Navigate, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { WeddingProvider } from './context/WeddingContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import CreateWedding from './pages/CreateWedding'
import Templates from './pages/Templates'
import Editor from './pages/Editor'
import WeddingSite from './pages/WeddingSite'
import SeoManager from './components/seo/SeoManager'

export default function App() {
  return (
    <AuthProvider>
      <WeddingProvider>
        <SeoManager />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/principal" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={<Navigate to="/principal" replace />} />
          <Route path="/criar-site" element={
            <ProtectedRoute><CreateWedding /></ProtectedRoute>
          } />
          <Route path="/templates" element={<Templates />} />
          <Route path="/editor" element={
            <ProtectedRoute><Editor /></ProtectedRoute>
          } />
          <Route path="/site/:slug" element={<WeddingSite />} />
          <Route path="/:slug" element={<WeddingSite />} />
        </Routes>
      </WeddingProvider>
    </AuthProvider>
  )
}
