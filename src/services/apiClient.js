import { clearSession, getSessionToken, isSessionExpired } from './sessionStorage'

const DEFAULT_API_URL = 'https://backend-dentvision-project.onrender.com'
const API_URL = (import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || DEFAULT_API_URL)
).replace(/\/$/, '')

let unauthorizedHandler = null

const handleUnauthorized = () => {
  clearSession()
  unauthorizedHandler?.()
}

const request = async (path, options = {}) => {
  if (isSessionExpired()) {
    handleUnauthorized()
    throw new Error('Tu sesion expiro. Inicia sesion nuevamente.')
  }

  const token = getSessionToken()

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      handleUnauthorized()
    }

    const message = data?.message || 'La solicitud no pudo completarse'
    throw new Error(message)
  }

  return data
}

const apiClient = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  patch: (path, body) =>
    request(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: (path) =>
    request(path, {
      method: 'DELETE',
    }),
  setUnauthorizedHandler: (handler) => {
    unauthorizedHandler = handler
  },
}

export default apiClient
