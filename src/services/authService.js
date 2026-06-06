/**
 * authService.js
 *
 * Contratos reales del backend Spring Boot:
 *
 * POST /auth/login
 *   Request:  { email: string, password: string }
 *   Response: { token: string, user: { username: string } }
 *   ⚠️  El JWT lleva el claim "role" = "ROLE_ADMIN" | "ROLE_USER"
 *
 * POST /auth/register
 *   Request:  { username: string, email: string, password: string }
 *   Response: { token: string, user: { username: string } }
 *
 * DIFERENCIAS clave con el mock anterior:
 *  - El backend devuelve `user.username`, NO `user.name`
 *  - Los roles del backend son ROLE_ADMIN y ROLE_USER (solo 2 roles)
 *  - No existe /auth/recover-password en el backend → se mantiene mock
 *  - El register usa `username` (no `name`)
 *
 * normalizeAuthResponse() adapta la respuesta real al shape que usa el frontend:
 *   { token, expiresIn, user: { id, name, email, role, specialist, specialty } }
 */

import apiClient from './apiClient'

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ── Cuentas de prueba (solo modo VITE_USE_MOCK_API=true) ─────────────────────
const mockDentistAccounts = {
  'laura@dentvision.com':      { name: 'Dra. Laura Medina',   specialist: 'Dra. Laura Medina - Odontologia general', specialty: 'Odontologia general' },
  'carlos@dentvision.com':     { name: 'Dr. Carlos Rojas',    specialist: 'Dr. Carlos Rojas - Ortodoncia',           specialty: 'Ortodoncia' },
  'andres@dentvision.com':     { name: 'Dr. Andres Quintero', specialist: 'Dr. Andres Quintero - Estetica dental',   specialty: 'Estetica dental' },
  'odontologo@dentvision.com': { name: 'Dra. Laura Medina',   specialist: 'Dra. Laura Medina - Odontologia general', specialty: 'Odontologia general' },
}
const mockSecretaryAccounts = { 'secretaria@dentvision.com': { name: 'María García' } }

// ── Normalización de la respuesta real del backend ───────────────────────────
/**
 * El backend devuelve: { token: "...", user: { username: "admin" } }
 * El JWT contiene: sub=username, role="ROLE_ADMIN" | "ROLE_USER"
 *
 * El frontend necesita: { token, expiresIn, user: { id, name, email, role, specialist, specialty } }
 *
 * Como el backend solo retorna `username` en el body (el email y rol están
 * en el JWT), deducimos el rol del claim del token sin decodificar
 * (confiamos en que el backend ya lo validó) pasando email como referencia.
 *
 * Para distinguir ROLE_ADMIN → 'admin', ROLE_USER → 'user'.
 * Los roles 'dentist' y 'secretary' son solo del mock; en producción
 * dependerán de la tabla de empleados/roles del backend.
 */
const normalizeAuthResponse = (raw, emailUsed = '') => {
  const token    = raw.token || raw.accessToken || ''
  const username = raw.user?.username || raw.username || emailUsed

  // Decodificar el payload del JWT para leer el claim `role`
  let backendRole = 'ROLE_USER'
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    backendRole = payload.role || payload.authorities?.[0] || 'ROLE_USER'
  } catch { /* token inválido o formato inesperado */ }

  const role = backendRole === 'ROLE_ADMIN' ? 'admin' : 'user'

  // expiresIn: el JWT por defecto dura 24h (86400000 ms = 86400 s)
  const expiresIn = 86400

  return {
    token,
    expiresIn,
    user: {
      id:         username,           // el backend no devuelve id en /auth, usamos username
      name:       username,
      email:      emailUsed,
      role,
      specialist: '',                 // en producción se carga de /empleados
      specialty:  '',
    },
  }
}

// ── Servicios públicos ────────────────────────────────────────────────────────

export const loginUser = async ({ email, password }) => {
  if (useMockApi) {
    await wait(600)
    const normalizedEmail   = email.trim().toLowerCase()
    const isAdmin           = normalizedEmail === 'admin@dentvision.com'
    const dentistAccount    = mockDentistAccounts[normalizedEmail]
    const secretaryAccount  = mockSecretaryAccounts[normalizedEmail]

    return {
      token:     `fake-jwt-${Date.now()}`,
      expiresIn: 60 * 60 * 4,
      user: {
        id:         normalizedEmail,
        name:       dentistAccount?.name || secretaryAccount?.name || normalizedEmail.split('@')[0],
        email:      normalizedEmail,
        role:       isAdmin ? 'admin' : dentistAccount ? 'dentist' : secretaryAccount ? 'secretary' : 'user',
        specialist: dentistAccount?.specialist || '',
        specialty:  dentistAccount?.specialty  || '',
      },
    }
  }

  // ── API real ────────────────────────────────────────────────────────────────
  // Backend: POST /auth/login  →  { token, user: { username } }
  const raw = await apiClient.post('/auth/login', { email, password })
  return normalizeAuthResponse(raw, email)
}

export const registerUser = async ({ name, email, password }) => {
  if (useMockApi) {
    await wait(600)
    return { id: crypto.randomUUID(), name, email }
  }

  // Backend: POST /auth/register  → { username, email, password }
  // Nota: el backend usa `username`, no `name`
  const raw = await apiClient.post('/auth/register', {
    username: name,   // el frontend llama al campo `name`, el backend espera `username`
    email,
    password,
  })
  return normalizeAuthResponse(raw, email)
}

export const recoverPassword = async ({ email }) => {
  // El backend NO tiene este endpoint aún — siempre mock
  await wait(600)
  return { message: `Si existe una cuenta con ${email}, recibirás instrucciones pronto.` }
}
