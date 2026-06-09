/**
 * employeeService.js — Servicio de Gestión de Empleados
 *
 * Contratos del backend:
 *
 * GET    /empleados           → EmployeeResponse[]
 * GET    /empleados/:id       → EmployeeResponse
 * POST   /empleados           → EmployeeResponse (requiere JWT)
 * PUT    /empleados/:id       → EmployeeResponse (requiere JWT)
 * DELETE /empleados/:id       → 204              (requiere JWT)
 *
 * EmployeeResponse:
 *   { id, nombres, apellidos, documento, telefono, estado, especialidad, tipo }
 *
 * Tipos de empleado: ODONTOLOGO, TECNICO_DENTAL, AUXILIAR_ADMINISTRATIVA
 */
import apiClient from './apiClient'
export const normalizeEmployee = (raw) => ({
  id:           raw.id          || '',
  nombres:      raw.nombres     || '',
  apellidos:    raw.apellidos   || '',
  fullName:     `${raw.nombres || ''} ${raw.apellidos || ''}`.trim(),
  documento:    raw.documento   || '',
  telefono:     raw.telefono    || '',
  estado:       raw.estado      || 'ACTIVO',
  especialidad: raw.especialidad || '',
  tipo:         raw.tipo        || 'AUXILIAR_ADMINISTRATIVA',
  specialist:   `${raw.nombres || ''} ${raw.apellidos || ''}`.trim(),
})

// ── READ (Obtener Empleados) ─────────────────────────────────────────────────
export const getEmployees = async () => {

  const raw = await apiClient.get('/empleados')
  return (Array.isArray(raw) ? raw : []).map(normalizeEmployee)
}

export const getEmployeeById = async (id) => {

  const raw = await apiClient.get(`/empleados/${id}`)
  return normalizeEmployee(raw)
}

// ── CREATE (Crear Empleado) ──────────────────────────────────────────────────
export const createEmployee = async (employeeData) => {
  const payload = {
    nombres: employeeData.nombres,
    apellidos: employeeData.apellidos,
    documento: employeeData.documento,
    telefono: employeeData.telefono,
    especialidad: employeeData.especialidad,
    tipo: employeeData.tipo,
    estado: 'ACTIVO',
  }


  const raw = await apiClient.post('/empleados', payload)
  return normalizeEmployee(raw)
}

// ── UPDATE (Actualizar Empleado) ─────────────────────────────────────────────
export const updateEmployee = async (id, employeeData) => {
  const payload = {
    nombres: employeeData.nombres,
    apellidos: employeeData.apellidos,
    documento: employeeData.documento,
    telefono: employeeData.telefono,
    especialidad: employeeData.especialidad,
    tipo: employeeData.tipo,
    estado: employeeData.estado || 'ACTIVO',
  }


  const raw = await apiClient.put(`/empleados/${id}`, payload)
  return normalizeEmployee(raw)
}

// ── DELETE (Eliminar Empleado) ───────────────────────────────────────────────
export const deleteEmployee = async (id) => {

  await apiClient.delete(`/empleados/${id}`)
  return { success: true }
}
