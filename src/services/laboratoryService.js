/**
 * laboratoryService.js
 *
 * Contratos reales del backend Spring Boot:
 *
 * GET    /procedimientos       → ProcedureResponse[]
 * GET    /procedimientos/:id   → ProcedureResponse
 * POST   /procedimientos       → ProcedureResponse (requiere JWT)
 * PUT    /procedimientos/:id   → ProcedureResponse (requiere JWT)
 * DELETE /procedimientos/:id   → 204 No Content    (requiere JWT)
 *
 * ProcedureRequest:
 *   { fechaInicio: LocalDate, fechaFin: LocalDate, observaciones: string,
 *     estado: string, idCita: Long, idTecnico: Long }
 *
 * ProcedureResponse:
 *   { id, fechaInicio, fechaFin, observaciones, estado, idCita, idTecnico,
 *     fechaCreacion, fechaActualizacion }
 *
 * El frontend usa un shape diferente para "casos de laboratorio".
 * normalizeProcedure() adapta la respuesta a ese shape.
 */
import apiClient from './apiClient'

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'
const STORAGE_KEY = 'dentvision-laboratory-cases'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const readStore = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] } }
const saveStore = (d) => localStorage.setItem(STORAGE_KEY, JSON.stringify(d))

// ── Normalización ─────────────────────────────────────────────────────────────
const normalizeProcedure = (raw) => {
  if (raw.workType !== undefined || raw.shade !== undefined) return raw  // ya en shape del frontend

  return {
    id:                raw.id                || '',
    status:            raw.estado            || 'received',
    createdAt:         raw.fechaCreacion     || new Date().toISOString(),
    updatedAt:         raw.fechaActualizacion || '',
    // Campos del shape del backend
    idCita:            raw.idCita            || null,
    idTecnico:         raw.idTecnico         || null,
    fechaInicio:       raw.fechaInicio       || '',
    fechaFin:          raw.fechaFin          || '',
    observaciones:     raw.observaciones     || '',
    estado:            raw.estado            || 'received',
    // Campos del shape del frontend (conservados si vienen de localStorage)
    patientName:       raw.patientName       || '',
    patientDocument:   raw.patientDocument   || '',
    doctor:            raw.doctor            || '',
    workType:          raw.workType          || raw.observaciones || '',
    tooth:             raw.tooth             || '',
    shade:             raw.shade             || '',
    material:          raw.material          || '',
    requestedAt:       raw.requestedAt       || raw.fechaInicio   || '',
    estimatedDelivery: raw.estimatedDelivery || raw.fechaFin      || '',
    notes:             raw.notes             || raw.observaciones || '',
    appointmentId:     raw.appointmentId     || raw.idCita        || '',
  }
}

const normalizeList = (data) => (Array.isArray(data) ? data : []).map(normalizeProcedure)

// ── Servicios públicos ────────────────────────────────────────────────────────

export const getLaboratoryCases = async () => {
  if (useMockApi) { await wait(300); return readStore() }
  const raw = await apiClient.get('/procedimientos')
  return normalizeList(raw)
}

export const createLaboratoryCase = async (caseData) => {
  if (useMockApi) {
    await wait(500)
    const created = { id: crypto.randomUUID(), status: 'received', createdAt: new Date().toISOString(), ...caseData }
    saveStore([created, ...readStore()])
    return created
  }

  // Construir el body que acepta el backend
  const body = {
    fechaInicio:   caseData.requestedAt   || caseData.fechaInicio || new Date().toISOString().split('T')[0],
    fechaFin:      caseData.estimatedDelivery || caseData.fechaFin || null,
    observaciones: [caseData.notes, caseData.workType, caseData.tooth, caseData.shade, caseData.material]
                    .filter(Boolean).join(' | ') || '',
    estado:        'EN_PROCESO',
    idCita:        caseData.appointmentId  || caseData.idCita     || null,
    idTecnico:     caseData.technicianId   || caseData.idTecnico  || null,
  }
  const raw = await apiClient.post('/procedimientos', body)
  return normalizeProcedure({ ...raw, ...caseData })  // merge para conservar campos del frontend
}

export const updateLaboratoryCaseStatus = async (caseId, status) => {
  if (useMockApi) {
    await wait(300)
    const updated = readStore().map((c) =>
      c.id === caseId ? { ...c, status, updatedAt: new Date().toISOString() } : c,
    )
    saveStore(updated)
    return updated.find((c) => c.id === caseId)
  }

  const current = await apiClient.get(`/procedimientos/${caseId}`)
  const body = { ...current, estado: status }
  const raw = await apiClient.put(`/procedimientos/${caseId}`, body)
  return normalizeProcedure(raw)
}

export const deleteLaboratoryCase = async (caseId) => {
  if (useMockApi) {
    await wait(300)
    saveStore(readStore().filter((c) => c.id !== caseId))
    return { id: caseId }
  }
  await apiClient.delete(`/procedimientos/${caseId}`)
  return { id: caseId }
}
