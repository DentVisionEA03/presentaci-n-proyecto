/**
 * patientService.js  — NUEVO archivo
 *
 * Contratos reales del backend:
 *
 * GET    /pacientes           → PatientResponse[]
 * GET    /pacientes/:id       → PatientResponse
 * POST   /pacientes           → PatientResponse (requiere JWT)
 * PUT    /pacientes/:id       → PatientResponse (requiere JWT)
 * DELETE /pacientes/:id       → 204             (requiere JWT)
 *
 * PatientResponse:
 *   { id, idUsuario, nombres, apellidos, documento, telefono, direccion,
 *     fechaNacimiento, estado, fechaCreacion, fechaActualizacion, fechaEliminacion }
 *
 * PatientRequest:
 *   { idUsuario, nombres, apellidos, documento, telefono, direccion, fechaNacimiento }
 */
import apiClient from './apiClient'

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const mockPatients = [
  { id: 1, idUsuario: 2, nombres: 'Juan', apellidos: 'Pérez',   documento: '123456789', telefono: '3001234567', direccion: 'Calle 1 #2-3', fechaNacimiento: '1990-05-10', estado: 'ACTIVO' },
  { id: 2, idUsuario: 3, nombres: 'María', apellidos: 'García', documento: '987654321', telefono: '3009876543', direccion: 'Carrera 4 #5-6', fechaNacimiento: '1985-03-22', estado: 'ACTIVO' },
]

export const normalizePatient = (raw) => ({
  id:              raw.id             || '',
  idUsuario:       raw.idUsuario      || null,
  nombres:         raw.nombres        || '',
  apellidos:       raw.apellidos      || '',
  fullName:        `${raw.nombres || ''} ${raw.apellidos || ''}`.trim(),
  documento:       raw.documento      || '',
  telefono:        raw.telefono       || '',
  direccion:       raw.direccion      || '',
  fechaNacimiento: raw.fechaNacimiento || '',
  estado:          raw.estado         || 'ACTIVO',
})

export const getPatients = async () => {
  if (useMockApi) { await wait(300); return mockPatients.map(normalizePatient) }
  const raw = await apiClient.get('/pacientes')
  return (Array.isArray(raw) ? raw : []).map(normalizePatient)
}

export const getPatientById = async (id) => {
  if (useMockApi) { await wait(200); const p = mockPatients.find((x) => x.id === id); return p ? normalizePatient(p) : null }
  const raw = await apiClient.get(`/pacientes/${id}`)
  return normalizePatient(raw)
}

export const createPatient = async (patientData) => {
  if (useMockApi) {
    await wait(400)
    const np = { ...patientData, id: mockPatients.length + 1, estado: 'ACTIVO' }
    mockPatients.push(np)
    return normalizePatient(np)
  }
  const raw = await apiClient.post('/pacientes', patientData)
  return normalizePatient(raw)
}

export const updatePatient = async (id, patientData) => {
  if (useMockApi) {
    await wait(300)
    const idx = mockPatients.findIndex((p) => p.id === id)
    if (idx !== -1) mockPatients[idx] = { ...mockPatients[idx], ...patientData }
    return normalizePatient(mockPatients[idx])
  }
  const raw = await apiClient.put(`/pacientes/${id}`, patientData)
  return normalizePatient(raw)
}
