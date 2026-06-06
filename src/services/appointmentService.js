/**
 * appointmentService.js
 *
 * Contratos reales del backend Spring Boot:
 *
 * GET    /citas              → AppointmentResponse[]
 * GET    /citas/:id          → AppointmentResponse
 * POST   /citas              → AppointmentResponse  (requiere JWT)
 * PUT    /citas/:id          → AppointmentResponse  (requiere JWT)
 * DELETE /citas/:id          → 204 No Content       (requiere JWT)
 *
 * AppointmentRequest (lo que enviamos):
 *   { idPaciente: Long, idOdontologo: Long, fechaHora: LocalDateTime, motivo: string }
 *
 * AppointmentResponse (lo que recibimos):
 *   { id, idPaciente, idOdontologo, fechaHora, motivo, estado,
 *     fechaCreacion, fechaActualizacion, fechaEliminacion }
 *
 * NOTA: El backend usa IDs numéricos para paciente y odontólogo.
 * El frontend actual usa un modelo anidado { patient: {...}, appointment: {...} }.
 * normalizeAppointment() adapta la respuesta del backend al shape del frontend.
 *
 * Para crear una cita, el frontend necesita primero obtener los IDs de
 * paciente y odontólogo desde /pacientes y /empleados respectivamente.
 */
import apiClient from './apiClient'

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'
const STORAGE_KEY = 'dentvision-appointments'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// ── Helpers localStorage (solo modo mock) ────────────────────────────────────
const getKey    = (uid) => uid ? `${STORAGE_KEY}-${uid}` : STORAGE_KEY
const readStore = (uid) => { try { return JSON.parse(localStorage.getItem(getKey(uid))) || [] } catch { return [] } }
const saveStore = (data, uid) => localStorage.setItem(getKey(uid), JSON.stringify(data))
const allKeys   = () => Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_KEY))

// ── Normalización respuesta backend → shape del frontend ────────────────────
/**
 * Convierte AppointmentResponse del backend al shape que usan los dashboards:
 *   { id, status, createdAt, ownerId, ownerLabel,
 *     patient:     { fullName, documentId, phone, email },
 *     appointment: { service, specialist, date, time, notes } }
 *
 * Como el backend devuelve solo IDs (idPaciente, idOdontologo), muchos campos
 * estarán vacíos hasta que el backend expanda las relaciones en el DTO.
 * Por eso conservamos los campos originales del backend para referencia.
 */
export const normalizeAppointment = (raw) => {
  // Si ya viene con el shape del frontend (mock o datos guardados), lo devuelve
  if (raw.patient && raw.appointment) return raw

  // Extraer fecha y hora del ISO string del backend
  const fechaHora = raw.fechaHora ? new Date(raw.fechaHora) : null
  const dateStr   = fechaHora ? fechaHora.toISOString().split('T')[0] : ''
  const timeStr   = fechaHora ? fechaHora.toTimeString().slice(0, 5) : ''

  return {
    // Campos del backend (originales — útiles para PUT/DELETE)
    id:              raw.id || '',
    idPaciente:      raw.idPaciente || null,
    idOdontologo:    raw.idOdontologo || null,
    status:          raw.estado || 'PENDIENTE',
    createdAt:       raw.fechaCreacion || new Date().toISOString(),
    ownerId:         raw.idPaciente ? String(raw.idPaciente) : undefined,
    ownerLabel:      raw.idPaciente ? `Paciente #${raw.idPaciente}` : 'general',

    // Shape anidado que consumen los dashboards
    patient: {
      fullName:   raw.paciente?.nombres
                    ? `${raw.paciente.nombres} ${raw.paciente.apellidos || ''}`
                    : `Paciente #${raw.idPaciente || '?'}`,
      documentId: raw.paciente?.documento  || '',
      phone:      raw.paciente?.telefono   || '',
      email:      raw.paciente?.email      || '',
    },
    appointment: {
      service:    raw.servicio?.nombre || raw.motivo || '',
      specialist: raw.odontologo
                    ? `${raw.odontologo.nombres || ''} ${raw.odontologo.apellidos || ''}`.trim()
                    : `Odontólogo #${raw.idOdontologo || '?'}`,
      date:       dateStr,
      time:       timeStr,
      notes:      raw.motivo || '',
    },
  }
}

const normalizeList = (data) => {
  if (!data) return []
  const list = Array.isArray(data) ? data : []
  return list.map(normalizeAppointment)
}

// ── Servicios públicos ────────────────────────────────────────────────────────

/**
 * Obtiene citas del usuario actual.
 * En la API real devuelve TODAS las citas (el backend no filtra por usuario aún).
 */
export const getAppointments = async (userId) => {
  if (useMockApi) { await wait(300); return readStore(userId) }
  const raw = await apiClient.get('/citas')
  return normalizeList(raw)
}

/**
 * Obtiene todas las citas para el panel de administrador/odontólogo.
 */
export const getAllAppointments = async () => {
  if (useMockApi) {
    await wait(300)
    return allKeys()
      .flatMap((k) => {
        const uid = k === STORAGE_KEY ? undefined : k.replace(`${STORAGE_KEY}-`, '')
        try { return (JSON.parse(localStorage.getItem(k)) || []).map((a) => ({ ...a, ownerId: uid, ownerLabel: uid || 'general' })) }
        catch { return [] }
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }

  const raw = await apiClient.get('/citas')
  return normalizeList(raw)
}

/**
 * Crea una cita.
 *
 * El backend espera: { idPaciente, idOdontologo, fechaHora, motivo }
 * El formulario del frontend envía: { patient: {...}, appointment: {...} }
 *
 * Si appointmentData ya tiene el shape del backend (idPaciente + idOdontologo),
 * lo pasa directamente. Si viene del formulario del frontend, construye el body.
 */
export const createAppointment = async (appointmentData, userId) => {
  if (useMockApi) {
    await wait(700)
    const created = { id: crypto.randomUUID(), status: 'PENDIENTE', createdAt: new Date().toISOString(), ...appointmentData }
    saveStore([created, ...readStore(userId)], userId)
    return created
  }

  // Construir el body para el backend
  const body = appointmentData.idPaciente
    ? appointmentData   // ya viene en formato backend
    : {
        idPaciente:   appointmentData.patient?.id    || appointmentData.idPaciente,
        idOdontologo: appointmentData.employee?.id   || appointmentData.idOdontologo,
        fechaHora:    appointmentData.appointment?.date && appointmentData.appointment?.time
                        ? `${appointmentData.appointment.date}T${appointmentData.appointment.time}:00`
                        : appointmentData.fechaHora,
        motivo:       appointmentData.appointment?.notes || appointmentData.motivo || '',
      }

  const raw = await apiClient.post('/citas', body)
  return normalizeAppointment(raw)
}

/**
 * Actualiza el estado de una cita.
 * El backend usa PUT /citas/:id con el body completo (AppointmentRequest).
 * Para solo cambiar el estado construimos el body mínimo válido.
 */
export const updateAppointmentStatus = async (appointmentId, status, userId, originalData = {}) => {
  if (useMockApi) {
    await wait(300)
    const updated = readStore(userId).map((a) => a.id === appointmentId ? { ...a, status } : a)
    saveStore(updated, userId)
    return updated.find((a) => a.id === appointmentId)
  }

  // PUT requiere el body completo — usamos los datos originales si están disponibles
  const body = {
    idPaciente:   originalData.idPaciente   || null,
    idOdontologo: originalData.idOdontologo || null,
    fechaHora:    originalData.fechaHora    || new Date().toISOString().slice(0, 19),
    motivo:       originalData.motivo       || '',
    estado:       status,
  }
  const raw = await apiClient.put(`/citas/${appointmentId}`, body)
  return normalizeAppointment(raw)
}

/**
 * Cancela/elimina una cita.
 * El backend usa DELETE /citas/:id → 204 No Content.
 */
export const cancelAppointment = async (appointmentId, userId) => {
  if (useMockApi) {
    await wait(300)
    saveStore(readStore(userId).filter((a) => a.id !== appointmentId), userId)
    return { id: appointmentId }
  }
  await apiClient.delete(`/citas/${appointmentId}`)
  return { id: appointmentId }
}
