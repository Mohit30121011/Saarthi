import { createContext, useContext, useState, useCallback } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem('saarthi_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem('saarthi_token'))

  const persist = useCallback((data) => {
    const { token: newToken, ...userData } = data
    localStorage.setItem('saarthi_token', newToken)
    localStorage.setItem('saarthi_user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials)
    persist(data)
    return data
  }, [persist])

  const register = useCallback(async (details) => {
    const data = await authApi.register(details)
    persist(data)
    return data
  }, [persist])

  const logout = useCallback(() => {
    localStorage.removeItem('saarthi_token')
    localStorage.removeItem('saarthi_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
