/**
 * apiClient.js — Cliente HTTP central de DentVision
 *
 * El backend Spring Boot NO usa prefijo /api.
 * Rutas reales del backend:
 *   POST   /auth/login          POST   /auth/register
 *   GET    /citas               POST   /citas            PUT /citas/:id   DELETE /citas/:id
 *   GET    /pacientes           POST   /pacientes        PUT /pacientes/:id
 *   GET    /empleados           POST   /empleados        PUT /empleados/:id
 *   GET    /facturas            POST   /facturas         PUT /facturas/:id DELETE /facturas/:id
 *   GET    /pagos               POST   /pagos            PUT /pagos/:id
 *   GET    /servicios           POST   /servicios        PUT /servicios/:id
 *   GET    /procedimientos      POST   /procedimientos
 *   GET    /usuarios            POST   /usuarios
 *   GET    /servicios-cita      POST   /servicios-cita
 *
 * Configurar VITE_API_URL en .env.local
 */
import { clearSession, getSessionToken, isSessionExpired } from './sessionStorage'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

let unauthorizedHandler = null

const handleUnauthorized = () => {
  clearSession()
  unauthorizedHandler?.()
}

const request = async (path, options = {}) => {
  if (isSessionExpired()) {
    handleUnauthorized()
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  }

  const token = getSessionToken()

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // 204 No Content — sin cuerpo
  if (response.status === 204) return null

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      handleUnauthorized()
    }
    // Spring Boot puede enviar { message } o { error } o { errors: [...] }
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
  get:    (path)        => request(path),
  post:   (path, body)  => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)  => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body)  => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)        => request(path, { method: 'DELETE' }),
  setUnauthorizedHandler: (handler) => { unauthorizedHandler = handler },
}

export default apiClient
