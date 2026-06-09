/**
 * apiClient.js — Cliente HTTP central de DentVision
 *
 * CORRECCIÓN: el request() original llamaba isSessionExpired() en TODAS
 * las peticiones, incluyendo /auth/register y /auth/login.
 * En esas rutas no hay sesión todavía → isSessionExpired() devuelve false
 * (Date.now() > 0 cuando expiresAt es null/0), pero si por alguna razón
 * hay un token expirado en storage de una sesión anterior, la función
 * lanzaba "Tu sesión expiró" y nunca llegaba al fetch().
 *
 * La corrección es saltarse la verificación de sesión para las rutas públicas
 * de autenticación (/auth/*).
 *
 * Rutas del backend (sin prefijo /api):
 *   POST /auth/login     POST /auth/register
 *   POST /auth/refresh   POST /auth/logout
 *   GET  /citas          POST /citas   PUT /citas/:id   DELETE /citas/:id
 *   GET  /pacientes      POST /pacientes   PUT /pacientes/:id
 *   GET  /empleados      POST /empleados   PUT /empleados/:id
 *   GET  /facturas       POST /facturas    PUT /facturas/:id   DELETE /facturas/:id
 *   GET  /pagos          POST /pagos       PUT /pagos/:id
 *   GET  /servicios      POST /servicios   PUT /servicios/:id
 *   GET  /procedimientos POST /procedimientos
 *   GET  /usuarios       POST /usuarios
 *   GET  /servicios-cita POST /servicios-cita
 */
import { clearSession, getSessionToken, isSessionExpired } from './sessionStorage'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

let unauthorizedHandler = null

const handleUnauthorized = () => {
  clearSession()
  unauthorizedHandler?.()
}

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']

const request = async (path, options = {}) => {
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p))

  if (!isPublic && isSessionExpired()) {
    handleUnauthorized()
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  }

  const token = isPublic ? null : getSessionToken()

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },

  })

  if (response.status === 204) return null

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) handleUnauthorized()
    const msg =
        data?.message ||
        data?.error ||
        (Array.isArray(data?.errors) ? data.errors.map((e) => e.defaultMessage).join(', ') : null) ||
        'La solicitud no pudo completarse'
    throw new Error(msg)
  }

  return data
}

const apiClient = {
  get:    (path)       => request(path),
  post:   (path, body) => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body) => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)       => request(path, { method: 'DELETE' }),
  setUnauthorizedHandler: (handler) => { unauthorizedHandler = handler },
}

export default apiClient