import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import { clearToken, getToken, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    authApi.getMe()
      .then((data) => setUser(mapUser(data)))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const handleAuthSuccess = (data) => {
    setToken(data.token)
    setUser(mapUser(data.user))
    return data
  }

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    return handleAuthSuccess(data)
  }

  const loginWithGoogle = async (idToken) => {
    const data = await authApi.loginWithGoogle(idToken)
    return handleAuthSuccess(data)
  }

  const register = async (name, email, password) => {
    const data = await authApi.register(name, email, password)
    return handleAuthSuccess(data)
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function mapUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatarUrl,
  }
}

export const useAuth = () => useContext(AuthContext)
