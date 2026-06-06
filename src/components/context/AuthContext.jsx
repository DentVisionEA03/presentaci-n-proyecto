/**
 * AuthContext.jsx
 *
 * Cambios respecto al original:
 * - login() recibe la respuesta ya normalizada de authService.loginUser()
 *   que adapta { token, user: { username } } del backend al shape del frontend
 * - saveSession() ya no recibe expiresIn en segundos sino que authService
 *   fija 86400 (24h) igual que la configuración del backend
 * - El handler de sesión expirada sigue funcionando igual
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginUser } from '../../services/authService'
import apiClient from '../../services/apiClient'
import {
  clearSession,
  isSessionExpired,
  readSessionValue,
  saveSession,
} from '../../services/sessionStorage'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(readSessionValue('token')) && !isSessionExpired(),
  )

  const [user, setUser] = useState(() => {
    if (isSessionExpired()) { clearSession(); return null }
    const saved = readSessionValue('user')
    if (!saved) return null
    try { return JSON.parse(saved) }
    catch { clearSession(); return null }
  })

  const logout = () => {
    clearSession()
    setUser(null)
    setIsAuthenticated(false)
  }

  const login = async ({ email, password, remember = false } = {}) => {
    // authService.loginUser devuelve { token, expiresIn, user: { id, name, email, role, ... } }
    const session = await loginUser({ email, password })
    saveSession(session, remember)
    setUser(session.user)
    setIsAuthenticated(true)
    return session
  }

  useEffect(() => {
    apiClient.setUnauthorizedHandler(logout)
    return () => apiClient.setUnauthorizedHandler(null)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return undefined
    const guard = window.setInterval(() => { if (isSessionExpired()) logout() }, 60_000)
    return () => window.clearInterval(guard)
  }, [isAuthenticated])

  const value = useMemo(
    () => ({ isAuthenticated, user, login, logout }),
    [isAuthenticated, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
