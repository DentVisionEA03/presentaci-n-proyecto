/**
 * Servicio de facturación para gestionar facturas y pagos
 */

const mockInvoices = [
  {
    id: 'INV-001',
    patientName: 'Juan Pérez',
    patientEmail: 'juan@example.com',
    patientPhone: '3001234567',
    serviceDate: '2024-06-01',
    service: 'Odontologia general',
    dentist: 'Dra. Laura Medina',
    amount: 150000,
    status: 'paid',
    paymentMethod: 'credit_card',
    dueDate: '2024-06-05',
    notes: 'Limpieza y revisión general',
  },
  {
    id: 'INV-002',
    patientName: 'María García',
    patientEmail: 'maria@example.com',
    patientPhone: '3009876543',
    serviceDate: '2024-06-02',
    service: 'Ortodoncia',
    dentist: 'Dr. Carlos Rojas',
    amount: 500000,
    status: 'pending',
    paymentMethod: null,
    dueDate: '2024-06-10',
    notes: 'Primera consulta y moldeado',
  },
  {
    id: 'INV-003',
    patientName: 'Carlos López',
    patientEmail: 'carlos@example.com',
    patientPhone: '3005551234',
    serviceDate: '2024-06-03',
    service: 'Estetica dental',
    dentist: 'Dr. Andres Quintero',
    amount: 300000,
    status: 'overdue',
    paymentMethod: null,
    dueDate: '2024-05-30',
    notes: 'Blanqueamiento dental',
  },
  {
    id: 'INV-004',
    patientName: 'Laura Martínez',
    patientEmail: 'laura@example.com',
    patientPhone: '3002223333',
    serviceDate: '2024-06-04',
    service: 'Optometría',
    dentist: 'Dra. Sofia Vargas',
    amount: 100000,
    status: 'paid',
    paymentMethod: 'transfer',
    dueDate: '2024-06-08',
    notes: 'Examen visual completo',
  },
]

export const getInvoices = async () => {
  // Simular delay de API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockInvoices)
    }, 300)
  })
}

export const getInvoiceById = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const invoice = mockInvoices.find((inv) => inv.id === id)
      resolve(invoice)
    }, 200)
  })
}

export const createInvoice = async (invoice) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newInvoice = {
        ...invoice,
        id: `INV-${String(mockInvoices.length + 1).padStart(3, '0')}`,
        status: 'pending',
        createdAt: new Date(),
      }
      mockInvoices.push(newInvoice)
      resolve(newInvoice)
    }, 300)
  })
}

export const updateInvoice = async (id, updates) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockInvoices.findIndex((inv) => inv.id === id)
      if (index !== -1) {
        mockInvoices[index] = { ...mockInvoices[index], ...updates }
        resolve(mockInvoices[index])
      } else {
        resolve(null)
      }
    }, 200)
  })
}

export const markInvoiceAsPaid = async (id, paymentMethod) => {
  return updateInvoice(id, {
    status: 'paid',
    paymentMethod,
    paidAt: new Date().toISOString(),
  })
}

export const deleteInvoice = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockInvoices.findIndex((inv) => inv.id === id)
      if (index !== -1) {
        mockInvoices.splice(index, 1)
        resolve(true)
      } else {
        resolve(false)
      }
    }, 200)
  })
}

export const getInvoiceStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stats = {
        totalInvoices: mockInvoices.length,
        totalAmount: mockInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        paidAmount: mockInvoices
          .filter((inv) => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.amount, 0),
        pendingAmount: mockInvoices
          .filter((inv) => inv.status === 'pending')
          .reduce((sum, inv) => sum + inv.amount, 0),
        overdueAmount: mockInvoices
          .filter((inv) => inv.status === 'overdue')
          .reduce((sum, inv) => sum + inv.amount, 0),
        paidCount: mockInvoices.filter((inv) => inv.status === 'paid').length,
        pendingCount: mockInvoices.filter((inv) => inv.status === 'pending').length,
        overdueCount: mockInvoices.filter((inv) => inv.status === 'overdue').length,
      }
      resolve(stats)
    }, 200)
  })
}

export const generateInvoicePDF = async (invoiceId) => {
  // Simular descarga de PDF
  return new Promise((resolve) => {
    setTimeout(() => {
      const invoice = mockInvoices.find((inv) => inv.id === invoiceId)
      if (invoice) {
        // En un caso real, aquí se llamaría a un servicio para generar PDF
        resolve({
          success: true,
          filename: `${invoice.id}-${invoice.patientName}.pdf`,
        })
      } else {
        resolve({ success: false })
      }
    }, 500)
  })
}

export const sendInvoiceEmail = async (invoiceId, email) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const invoice = mockInvoices.find((inv) => inv.id === invoiceId)
      if (invoice) {
        resolve({
          success: true,
          message: `Factura enviada a ${email}`,
        })
      } else {
        resolve({ success: false })
      }
    }, 300)
  })
}
