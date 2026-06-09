/**
 * authService.js
 *
 * Contrato del backend (AuthResponse.java):
 *
 *   {
 *     accessToken:  string,   ← JWT de acceso
 *     refreshToken: string,   ← token de renovación
 *     tokenType:    "Bearer",
 *     expiresIn:    number    ← segundos
 *   }
 *
 * POST /auth/register  { username, email, password }
 * POST /auth/login     { email, password }
 */

import apiClient from './apiClient'

// ── Normalización de la respuesta del backend ─────────────────────────────────
/**
 * Convierte AuthResponse del backend al shape que usa el frontend:
 *   { token, expiresIn, user: { id, name, email, role, specialist, specialty } }
 */
const normalizeAuthResponse = (raw, emailUsed = '') => {
  const token    = raw.accessToken || raw.token || ''
  const username = raw.user?.username || raw.username || emailUsed

  // Decodificar el payload del JWT para leer el claim `role`
  let backendRole = 'USER'
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    backendRole   = payload.role || payload.authorities?.[0] || 'USER'
  } catch { /* token inválido o vacío */ }

  // Mapear el enum del backend al role que usa el frontend
  const role = backendRole === 'ADMIN' ? 'admin' : 'user'

  return {
    token,
    expiresIn: raw.expiresIn || 86400,
    user: {
      id:         username,
      name:       username,
      email:      emailUsed,
      role,
      specialist: '',
      specialty:  '',
    },
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  const raw = await apiClient.post('/auth/login', { email, password })
  return normalizeAuthResponse(raw, email)
}

// ── Registro ──────────────────────────────────────────────────────────────────
export const registerUser = async ({ documentType,documento, nombres,apellidos, email, password }) => {
  // El campo del formulario se llama `name`, el backend espera `username`
  const raw = await apiClient.post('/auth/register', {
    tipoIdentificacion: documentType,
    identificacion: documento,
    nombres,
    apellidos,
    email,
    password,
  })
  return normalizeAuthResponse(raw, email)
}

// ── Recuperar contraseña ──────────────────────────────────────────────────────
export const recoverPassword = async ({ email }) => {
  return { message: `Si existe una cuenta con ${email}, recibirás instrucciones pronto.` }
}