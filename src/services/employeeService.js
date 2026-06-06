/**
 * employeeService.js — NUEVO archivo
 *
 * Contratos reales del backend:
 *
 * GET    /empleados           → EmployeeResponse[]
 * GET    /empleados/:id       → EmployeeResponse
 * POST   /empleados           → EmployeeResponse (requiere JWT)
 * PUT    /empleados/:id       → EmployeeResponse (requiere JWT)
 * DELETE /empleados/:id       → 204              (requiere JWT)
 *
 * EmployeeResponse:
 *   { id, nombres, apellidos, documento, telefono, estado }
 *
 * Los empleados con rol ODONTOLOGO son los odontólogos del sistema.
 * El rol se gestiona mediante /empleado-roles.
 */
import apiClient from './apiClient'

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const mockEmployees = [
  { id: 1, nombres: 'Laura',  apellidos: 'Medina',    documento: '11122233', telefono: '3001111111', estado: 'ACTIVO', specialty: 'Odontologia general' },
  { id: 2, nombres: 'Carlos', apellidos: 'Rojas',     documento: '44455566', telefono: '3002222222', estado: 'ACTIVO', specialty: 'Ortodoncia' },
  { id: 3, nombres: 'Andres', apellidos: 'Quintero',  documento: '77788899', telefono: '3003333333', estado: 'ACTIVO', specialty: 'Estetica dental' },
]

export const normalizeEmployee = (raw) => ({
  id:        raw.id        || '',
  nombres:   raw.nombres   || '',
  apellidos: raw.apellidos || '',
  fullName:  `${raw.nombres || ''} ${raw.apellidos || ''}`.trim(),
  documento: raw.documento || '',
  telefono:  raw.telefono  || '',
  estado:    raw.estado    || 'ACTIVO',
  specialty: raw.specialty || '',
  // Campo `specialist` usado por DentistDashboard para filtrar sus citas
  specialist: raw.specialist || `${raw.nombres || ''} ${raw.apellidos || ''}`.trim(),
})

export const getEmployees = async () => {
  if (useMockApi) { await wait(300); return mockEmployees.map(normalizeEmployee) }
  const raw = await apiClient.get('/empleados')
  return (Array.isArray(raw) ? raw : []).map(normalizeEmployee)
}

export const getEmployeeById = async (id) => {
  if (useMockApi) { await wait(200); const e = mockEmployees.find((x) => x.id === id); return e ? normalizeEmployee(e) : null }
  const raw = await apiClient.get(`/empleados/${id}`)
  return normalizeEmployee(raw)
}
