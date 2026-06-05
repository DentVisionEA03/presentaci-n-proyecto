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
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(readSessionValue('token')) && !isSessionExpired(),
  )
  const [user, setUser] = useState(() => {
    if (isSessionExpired()) {
      clearSession()
      return null
    }

    const savedUser = readSessionValue('user')

    if (!savedUser) return null

    try {
      return JSON.parse(savedUser)
    } catch {
      clearSession()
      return null
    }
  })

  const login = async ({ email, password, remember = false } = {}) => {
    const session = await loginUser({ email, password })

    saveSession(session, remember)
    setUser(session.user)
    setIsAuthenticated(true)

    return session
  }

  const logout = () => {
    clearSession()
    setUser(null)
    setIsAuthenticated(false)
  }

  useEffect(() => {
    apiClient.setUnauthorizedHandler(logout)

    return () => apiClient.setUnauthorizedHandler(null)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return undefined

    const sessionGuard = window.setInterval(() => {
      if (isSessionExpired()) {
        logout()
      }
    }, 60_000)

    return () => window.clearInterval(sessionGuard)
  }, [isAuthenticated])

  const value = useMemo(
    () => ({ isAuthenticated, user, login, logout }),
    [isAuthenticated, user],
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
