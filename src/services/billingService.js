/**
 * billingService.js
 *
 * Contratos reales del backend Spring Boot:
 *
 * GET    /facturas           → InvoiceResponse[]
 * GET    /facturas/:id       → InvoiceResponse
 * POST   /facturas           → InvoiceResponse  (requiere JWT)
 * PUT    /facturas/:id       → InvoiceResponse  (requiere JWT)
 * DELETE /facturas/:id       → 204 No Content   (requiere JWT)
 *
 * InvoiceRequest:  { fechaEmision: LocalDate, fechaVencimiento: LocalDate, estado: string, descripcion: string }
 * InvoiceResponse: { id, fechaEmision, fechaVencimiento, estado, descripcion, fechaCreacion, fechaActualizacion }
 *
 * GET    /pagos              → PaymentResponse[]
 * POST   /pagos              → PaymentResponse  (requiere JWT)
 * PUT    /pagos/:id          → PaymentResponse  (requiere JWT)
 * DELETE /pagos/:id          → 204 No Content
 *
 * PaymentRequest:  { idFactura, fechaPago, metodoPago, valor, estado }
 * PaymentResponse: { id, idFactura, fechaPago, metodoPago, valor, estado, fechaCreacion }
 *
 * NOTA: El modelo del backend es minimalista — una factura no tiene
 * directamente nombre de paciente, servicio ni odontólogo. El SecretaryDashboard
 * del frontend usa esos campos. normalizeInvoice() los preserva con fallbacks.
 */
import apiClient from './apiClient'

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// ── Datos mock (solo VITE_USE_MOCK_API=true) ─────────────────────────────────
const mockInvoices = [
  { id: 1, fechaEmision: '2024-06-01', fechaVencimiento: '2024-06-15', estado: 'PAGADA',    descripcion: 'Limpieza dental - Juan Pérez',   fechaCreacion: '2024-06-01T08:00:00', patientName: 'Juan Pérez',    patientEmail: 'juan@example.com',   amount: 150000 },
  { id: 2, fechaEmision: '2024-06-02', fechaVencimiento: '2024-06-20', estado: 'PENDIENTE', descripcion: 'Ortodoncia - María García',      fechaCreacion: '2024-06-02T09:00:00', patientName: 'María García',   patientEmail: 'maria@example.com',  amount: 500000 },
  { id: 3, fechaEmision: '2024-06-03', fechaVencimiento: '2024-05-30', estado: 'VENCIDA',   descripcion: 'Blanqueamiento - Carlos López',  fechaCreacion: '2024-06-03T10:00:00', patientName: 'Carlos López',   patientEmail: 'carlos@example.com', amount: 300000 },
]

// ── Normalización respuesta backend → shape del frontend ────────────────────
/**
 * Mapea los estados del backend a los del frontend y vice versa.
 * Backend: PENDIENTE, PAGADA, VENCIDA, CANCELADA
 * Frontend (SecretaryDashboard): 'pending', 'paid', 'overdue'
 */
const STATUS_BE_TO_FE = { PENDIENTE: 'pending', PAGADA: 'paid', VENCIDA: 'overdue', CANCELADA: 'cancelled' }
const STATUS_FE_TO_BE = { pending: 'PENDIENTE', paid: 'PAGADA', overdue: 'VENCIDA', cancelled: 'CANCELADA' }

export const normalizeInvoice = (raw) => ({
  // Campos del backend
  id:                raw.id || '',
  fechaEmision:      raw.fechaEmision      || raw.serviceDate || '',
  fechaVencimiento:  raw.fechaVencimiento  || raw.dueDate     || '',
  estado:            raw.estado || STATUS_FE_TO_BE[raw.status] || 'PENDIENTE',
  descripcion:       raw.descripcion || raw.notes || '',
  fechaCreacion:     raw.fechaCreacion  || raw.createdAt || '',
  fechaActualizacion:raw.fechaActualizacion || raw.updatedAt || '',

  // Campos del frontend (algunos no vienen del backend — se preservan si ya existen)
  patientName:   raw.patientName  || raw.descripcion?.split(' - ')[1] || '',
  patientEmail:  raw.patientEmail || '',
  patientPhone:  raw.patientPhone || '',
  service:       raw.service      || raw.descripcion?.split(' - ')[0] || raw.descripcion || '',
  dentist:       raw.dentist      || '',
  amount:        Number(raw.amount || raw.valor || 0),
  status:        STATUS_BE_TO_FE[raw.estado] || raw.status || 'pending',
  paymentMethod: raw.paymentMethod || raw.metodoPago || null,
  dueDate:       raw.fechaVencimiento || raw.dueDate || '',
  notes:         raw.descripcion || raw.notes || '',
  serviceDate:   raw.fechaEmision || raw.serviceDate || '',
})

const normalizeList = (data) => {
  if (!data) return []
  const list = Array.isArray(data) ? data : []
  return list.map(normalizeInvoice)
}

// ── Servicios públicos ────────────────────────────────────────────────────────

export const getInvoices = async () => {
  if (useMockApi) { await wait(300); return mockInvoices.map(normalizeInvoice) }
  const raw = await apiClient.get('/facturas')
  return normalizeList(raw)
}

export const getInvoiceById = async (id) => {
  if (useMockApi) { await wait(200); const inv = mockInvoices.find((i) => i.id === id); return inv ? normalizeInvoice(inv) : null }
  const raw = await apiClient.get(`/facturas/${id}`)
  return normalizeInvoice(raw)
}

export const createInvoice = async (invoice) => {
  if (useMockApi) {
    await wait(300)
    const ni = { ...invoice, id: mockInvoices.length + 1, estado: 'PENDIENTE', fechaCreacion: new Date().toISOString() }
    mockInvoices.push(ni)
    return normalizeInvoice(ni)
  }

  // Construir el body que acepta el backend
  const body = {
    fechaEmision:     invoice.fechaEmision     || invoice.serviceDate || new Date().toISOString().split('T')[0],
    fechaVencimiento: invoice.fechaVencimiento || invoice.dueDate     || null,
    estado:           STATUS_FE_TO_BE[invoice.status] || invoice.estado || 'PENDIENTE',
    descripcion:      invoice.descripcion || `${invoice.service || ''} - ${invoice.patientName || ''}`.trim() || invoice.notes || '',
  }
  const raw = await apiClient.post('/facturas', body)
  return normalizeInvoice(raw)
}

export const updateInvoice = async (id, updates) => {
  if (useMockApi) {
    await wait(200)
    const idx = mockInvoices.findIndex((i) => i.id === id)
    if (idx === -1) return null
    mockInvoices[idx] = { ...mockInvoices[idx], ...updates }
    return normalizeInvoice(mockInvoices[idx])
  }

  const current = await apiClient.get(`/facturas/${id}`)
  const body = {
    fechaEmision:     current.fechaEmision,
    fechaVencimiento: current.fechaVencimiento,
    estado:           STATUS_FE_TO_BE[updates.status] || updates.estado || current.estado,
    descripcion:      updates.descripcion || current.descripcion,
  }
  const raw = await apiClient.put(`/facturas/${id}`, body)
  return normalizeInvoice(raw)
}

export const markInvoiceAsPaid = async (id, paymentMethod) => {
  if (useMockApi) return updateInvoice(id, { status: 'paid', paymentMethod })

  // 1. Actualizar estado de la factura a PAGADA
  const updatedInvoice = await updateInvoice(id, { status: 'paid' })

  // 2. Registrar el pago en /pagos
  try {
    await apiClient.post('/pagos', {
      idFactura:  id,
      fechaPago:  new Date().toISOString().split('T')[0],
      metodoPago: paymentMethod || 'EFECTIVO',
      valor:      updatedInvoice.amount || 1,
      estado:     'COMPLETADO',
    })
  } catch (err) {
    console.warn('Factura marcada como pagada pero no se pudo registrar el pago:', err.message)
  }

  return updatedInvoice
}

export const deleteInvoice = async (id) => {
  if (useMockApi) {
    await wait(200)
    const idx = mockInvoices.findIndex((i) => i.id === id)
    if (idx !== -1) mockInvoices.splice(idx, 1)
    return true
  }
  await apiClient.delete(`/facturas/${id}`)
  return true
}

export const getInvoiceStats = async () => {
  const invoices = await getInvoices()
  return {
    totalInvoices:  invoices.length,
    totalAmount:    invoices.reduce((s, i) => s + i.amount, 0),
    paidAmount:     invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
    pendingAmount:  invoices.filter((i) => i.status === 'pending').reduce((s, i) => s + i.amount, 0),
    overdueAmount:  invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
    paidCount:      invoices.filter((i) => i.status === 'paid').length,
    pendingCount:   invoices.filter((i) => i.status === 'pending').length,
    overdueCount:   invoices.filter((i) => i.status === 'overdue').length,
  }
}

// Estas funciones no tienen equivalente en el backend actual → mock siempre
export const generateInvoicePDF = async (invoiceId) => {
  await wait(300)
  return { success: true, filename: `factura-${invoiceId}.pdf` }
}

export const sendInvoiceEmail = async (invoiceId, email) => {
  await wait(300)
  return { success: true, message: `Recordatorio enviado a ${email}` }
}
