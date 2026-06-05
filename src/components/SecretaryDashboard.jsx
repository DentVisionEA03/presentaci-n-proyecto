import { useEffect, useMemo, useState } from 'react'
import AppLayout from './AppLayout'
import {
  getInvoices,
  getInvoiceStats,
  markInvoiceAsPaid,
  deleteInvoice,
  createInvoice,
  sendInvoiceEmail,
  generateInvoicePDF,
} from '../services/billingService'
import { specialists, services } from '../data/clinicData'
import { laboratoryData } from '../data/laboratoryData'
import '../styles/secretary.css'

const statusLabels = {
  paid: 'Pagada',
  pending: 'Pendiente',
  overdue: 'Vencida',
}

const statusColors = {
  paid: '#28a745',
  pending: '#ffc107',
  overdue: '#dc3545',
}

const paymentMethods = {
  credit_card: 'Tarjeta de crédito',
  transfer: 'Transferencia',
  cash: 'Efectivo',
  check: 'Cheque',
}

function SecretaryDashboard() {
  const [invoices, setInvoices] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [activeTab, setActiveTab] = useState('invoices')
  const [showNewInvoiceForm, setShowNewInvoiceForm] = useState(false)
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [selectedLaboratoryWork, setSelectedLaboratoryWork] = useState(null)
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    service: '',
    dentist: '',
    amount: '',
    serviceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  })
  const [newAppointmentForm, setNewAppointmentForm] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    service: '',
    specialist: '',
    date: '',
    time: '',
  })

  useEffect(() => {
    loadData()
    loadAppointments()
  }, [])

  const loadAppointments = () => {
    try {
      const stored = localStorage.getItem('secretary_appointments')
      if (stored) {
        setAppointments(JSON.parse(stored))
      } else {
        setAppointments([
          {
            id: 'CIT-001',
            patientName: 'Juan Pérez',
            patientEmail: 'juan@example.com',
            service: 'Odontologia general',
            specialist: 'Laura Medina',
            date: '2026-06-15',
            time: '10:00',
            status: 'confirmed',
          },
          {
            id: 'CIT-002',
            patientName: 'María González',
            patientEmail: 'maria@example.com',
            service: 'Ortodoncia',
            specialist: 'Carlos Rojas',
            date: '2026-06-16',
            time: '14:30',
            status: 'pending',
          },
        ])
      }
    } catch (err) {
      console.error('Error loading appointments:', err)
    }
  }

  const saveAppointments = (newAppointments) => {
    localStorage.setItem('secretary_appointments', JSON.stringify(newAppointments))
    setAppointments(newAppointments)
  }

  const handleCreateAppointment = async (e) => {
    e.preventDefault()
    try {
      const newId = `CIT-${String(appointments.length + 1).padStart(3, '0')}`
      const newAppointment = {
        id: newId,
        ...newAppointmentForm,
        status: 'pending',
      }
      const updated = [...appointments, newAppointment]
      saveAppointments(updated)
      setNewAppointmentForm({
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        service: '',
        specialist: '',
        date: '',
        time: '',
      })
      setShowNewAppointmentForm(false)
      alert('¡Cita agendada correctamente!')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      const updated = appointments.map((apt) =>
        apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt,
      )
      saveAppointments(updated)
      alert('Cita cancelada correctamente')
    }
  }

  const handleConfirmAppointment = (appointmentId) => {
    const updated = appointments.map((apt) =>
      apt.id === appointmentId ? { ...apt, status: 'confirmed' } : apt,
    )
    saveAppointments(updated)
    alert('Cita confirmada')
  }

  const loadData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [invoicesData, statsData] = await Promise.all([
        getInvoices(),
        getInvoiceStats(),
      ])
      setInvoices(invoicesData)
      setStats(statsData)
    } catch (err) {
      setError(err.message || 'Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredInvoices = useMemo(() => {
    let filtered = invoices

    if (statusFilter !== 'all') {
      filtered = filtered.filter((inv) => inv.status === statusFilter)
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (inv) =>
          inv.patientName.toLowerCase().includes(term) ||
          inv.id.toLowerCase().includes(term) ||
          inv.patientEmail.toLowerCase().includes(term),
      )
    }

    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate))
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.serviceDate) - new Date(b.serviceDate))
    } else if (sortBy === 'amount-high') {
      filtered.sort((a, b) => b.amount - a.amount)
    } else if (sortBy === 'amount-low') {
      filtered.sort((a, b) => a.amount - b.amount)
    }

    return filtered
  }, [invoices, statusFilter, searchTerm, sortBy])

  const handleCreateInvoice = async (e) => {
    e.preventDefault()
    try {
      const newInvoice = await createInvoice(newInvoiceForm)
      setInvoices([newInvoice, ...invoices])
      setNewInvoiceForm({
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        service: '',
        dentist: '',
        amount: '',
        serviceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
      })
      setShowNewInvoiceForm(false)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleMarkAsPaid = async (invoiceId, method) => {
    try {
      const updated = await markInvoiceAsPaid(invoiceId, method)
      setInvoices(invoices.map((inv) => (inv.id === invoiceId ? updated : inv)))
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
      try {
        await deleteInvoice(invoiceId)
        setInvoices(invoices.filter((inv) => inv.id !== invoiceId))
        await loadData()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleSendEmail = async (invoiceId, email) => {
    try {
      const result = await sendInvoiceEmail(invoiceId, email)
      if (result.success) {
        alert(result.message)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const result = await generateInvoicePDF(invoiceId)
      if (result.success) {
        alert(`PDF generado: ${result.filename}`)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <main className="secretary-page">
          <div className="loading">Cargando...</div>
        </main>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <main className="secretary-page">
        <section className="secretary-hero">
          <div>
            <span className="section-kicker">Panel de Control</span>
            <h1>Facturación y Gestión</h1>
            <p>Administra facturas, pagos y documentos de la clínica</p>
          </div>
        </section>

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* Estadísticas */}
        {stats && (
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">${(stats.totalAmount / 1000).toFixed(0)}K</div>
              <div className="stat-label">Monto Total</div>
              <div className="stat-subtitle">{stats.totalInvoices} facturas</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">${(stats.paidAmount / 1000).toFixed(0)}K</div>
              <div className="stat-label">Pagado</div>
              <div className="stat-subtitle">{stats.paidCount} facturas</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-value">${(stats.pendingAmount / 1000).toFixed(0)}K</div>
              <div className="stat-label">Pendiente</div>
              <div className="stat-subtitle">{stats.pendingCount} facturas</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-value">${(stats.overdueAmount / 1000).toFixed(0)}K</div>
              <div className="stat-label">Vencido</div>
              <div className="stat-subtitle">{stats.overdueCount} facturas</div>
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            📋 Facturas
          </button>
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Pagos Pendientes
          </button>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📊 Reportes
          </button>
          <button
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Agendar Citas
          </button>
          <button
            className={`tab-btn ${activeTab === 'laboratory' ? 'active' : ''}`}
            onClick={() => setActiveTab('laboratory')}
          >
            🔬 Laboratorio
          </button>
        </div>

        {activeTab === 'invoices' && (
          <section className="invoices-section">
            <div className="section-header">
              <h2>Gestión de Facturas</h2>
              <button className="btn-primary" onClick={() => setShowNewInvoiceForm(!showNewInvoiceForm)}>
                + Nueva Factura
              </button>
            </div>

            {showNewInvoiceForm && (
              <div className="new-invoice-form">
                <h3>Crear Nueva Factura</h3>
                <form onSubmit={handleCreateInvoice}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre del Paciente</label>
                      <input
                        type="text"
                        required
                        value={newInvoiceForm.patientName}
                        onChange={(e) =>
                          setNewInvoiceForm({
                            ...newInvoiceForm,
                            patientName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        required
                        value={newInvoiceForm.patientEmail}
                        onChange={(e) =>
                          setNewInvoiceForm({
                            ...newInvoiceForm,
                            patientEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        required
                        value={newInvoiceForm.patientPhone}
                        onChange={(e) =>
                          setNewInvoiceForm({
                            ...newInvoiceForm,
                            patientPhone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Servicio</label>
                      <input
                        type="text"
                        required
                        value={newInvoiceForm.service}
                        onChange={(e) =>
                          setNewInvoiceForm({
                            ...newInvoiceForm,
                            service: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Odontólogo/a</label>
                      <input
                        type="text"
                        required
                        value={newInvoiceForm.dentist}
                        onChange={(e) =>
                          setNewInvoiceForm({
                            ...newInvoiceForm,
                            dentist: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Monto ($)</label>
                      <input
                        type="number"
                        required
                        value={newInvoiceForm.amount}
                        onChange={(e) =>
                          setNewInvoiceForm({
                            ...newInvoiceForm,
                            amount: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha de Servicio</label>
                      <input
                        type="date"
                        required
                        value={newInvoiceForm.serviceDate}
                        onChange={(e) =>
                          setNewInvoiceForm({
                            ...newInvoiceForm,
                            serviceDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Fecha de Vencimiento</label>
                      <input
                        type="date"
                        required
                        value={newInvoiceForm.dueDate}
                        onChange={(e) =>
                          setNewInvoiceForm({
                            ...newInvoiceForm,
                            dueDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notas</label>
                    <textarea
                      value={newInvoiceForm.notes}
                      onChange={(e) =>
                        setNewInvoiceForm({
                          ...newInvoiceForm,
                          notes: e.target.value,
                        })
                      }
                      rows="3"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      Crear Factura
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowNewInvoiceForm(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="filters">
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="Buscar por paciente, ID o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Todos los estados</option>
                  <option value="paid">Pagada</option>
                  <option value="pending">Pendiente</option>
                  <option value="overdue">Vencida</option>
                </select>
              </div>
              <div className="filter-group">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="recent">Más recientes</option>
                  <option value="oldest">Más antiguas</option>
                  <option value="amount-high">Mayor monto</option>
                  <option value="amount-low">Menor monto</option>
                </select>
              </div>
            </div>

            <div className="invoices-table">
              <div className="table-header">
                <div className="col-id">ID</div>
                <div className="col-patient">Paciente</div>
                <div className="col-service">Servicio</div>
                <div className="col-amount">Monto</div>
                <div className="col-status">Estado</div>
                <div className="col-date">Fecha Vencimiento</div>
                <div className="col-actions">Acciones</div>
              </div>

              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="table-row">
                  <div className="col-id">
                    <strong>{invoice.id}</strong>
                  </div>
                  <div className="col-patient">
                    <div>{invoice.patientName}</div>
                    <small>{invoice.patientEmail}</small>
                  </div>
                  <div className="col-service">{invoice.service}</div>
                  <div className="col-amount">${invoice.amount.toLocaleString()}</div>
                  <div className="col-status">
                    <span
                      className={`badge badge-${invoice.status}`}
                      style={{ backgroundColor: statusColors[invoice.status] }}
                    >
                      {statusLabels[invoice.status]}
                    </span>
                  </div>
                  <div className="col-date">{invoice.dueDate}</div>
                  <div className="col-actions">
                    {invoice.status !== 'paid' && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleMarkAsPaid(invoice.id, e.target.value)
                            e.target.value = ''
                          }
                        }}
                        defaultValue=""
                        className="action-select"
                      >
                        <option value="">Marcar pagada</option>
                        <option value="credit_card">Tarjeta</option>
                        <option value="transfer">Transferencia</option>
                        <option value="cash">Efectivo</option>
                        <option value="check">Cheque</option>
                      </select>
                    )}
                    <button
                      className="action-btn"
                      onClick={() => handleDownloadPDF(invoice.id)}
                      title="Descargar PDF"
                    >
                      📄
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleSendEmail(invoice.id, invoice.patientEmail)}
                      title="Enviar por email"
                    >
                      ✉️
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {filteredInvoices.length === 0 && (
                <div className="no-results">No hay facturas que coincidan con tu búsqueda</div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'pending' && (
          <section className="pending-section">
            <h2>Pagos Pendientes por Cobrar</h2>
            {stats && (
              <div className="pending-summary">
                <p>Total pendiente: <strong>${(stats.pendingAmount + stats.overdueAmount).toLocaleString()}</strong></p>
                <p>{stats.pendingCount + stats.overdueCount} facturas por cobrar</p>
              </div>
            )}
            <div className="pending-list">
              {invoices
                .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
                .map((invoice) => (
                  <div key={invoice.id} className={`pending-card pending-${invoice.status}`}>
                    <div className="pending-header">
                      <h3>{invoice.id}</h3>
                      <span className={`badge badge-${invoice.status}`}>
                        {statusLabels[invoice.status]}
                      </span>
                    </div>
                    <div className="pending-details">
                      <p><strong>{invoice.patientName}</strong></p>
                      <p>{invoice.service} - {invoice.dentist}</p>
                      <p className="pending-amount">${invoice.amount.toLocaleString()}</p>
                      <p className="pending-date">Vence: {invoice.dueDate}</p>
                    </div>
                    <button
                      className="btn-small"
                      onClick={() => handleSendEmail(invoice.id, invoice.patientEmail)}
                    >
                      Enviar recordatorio
                    </button>
                  </div>
                ))}
            </div>
          </section>
        )}

        {activeTab === 'reports' && (
          <section className="reports-section">
            <h2>Reportes Financieros</h2>
            <div className="reports-grid">
              <div className="report-card">
                <h3>Resumen Mensual</h3>
                <p>Ingreso total estimado</p>
                {stats && <p className="report-value">${(stats.totalAmount / 1000).toFixed(0)}K</p>}
                <button className="btn-secondary">Generar reporte</button>
              </div>
              <div className="report-card">
                <h3>Flujo de Caja</h3>
                <p>Proyección de ingresos vs. pagos</p>
                {stats && (
                  <p className="report-value">
                    {stats.paidCount}/{stats.totalInvoices} cobradas
                  </p>
                )}
                <button className="btn-secondary">Generar reporte</button>
              </div>
              <div className="report-card">
                <h3>Clientes Morosos</h3>
                <p>Deuda vencida pendiente de cobro</p>
                {stats && <p className="report-value">${(stats.overdueAmount / 1000).toFixed(0)}K</p>}
                <button className="btn-secondary">Generar reporte</button>
              </div>
              <div className="report-card">
                <h3>Servicios Más Facturados</h3>
                <p>Análisis de servicios por monto</p>
                <p className="report-value">Ver detalles</p>
                <button className="btn-secondary">Generar reporte</button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'appointments' && (
          <section className="appointments-section">
            <div className="section-header">
              <h2>Gestión de Citas</h2>
              <button className="btn-primary" onClick={() => setShowNewAppointmentForm(!showNewAppointmentForm)}>
                + Agendar Nueva Cita
              </button>
            </div>

            {showNewAppointmentForm && (
              <div className="new-appointment-form">
                <h3>Agendar Nueva Cita</h3>
                <form onSubmit={handleCreateAppointment}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre del Paciente</label>
                      <input
                        type="text"
                        required
                        value={newAppointmentForm.patientName}
                        onChange={(e) =>
                          setNewAppointmentForm({
                            ...newAppointmentForm,
                            patientName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        required
                        value={newAppointmentForm.patientEmail}
                        onChange={(e) =>
                          setNewAppointmentForm({
                            ...newAppointmentForm,
                            patientEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        required
                        value={newAppointmentForm.patientPhone}
                        onChange={(e) =>
                          setNewAppointmentForm({
                            ...newAppointmentForm,
                            patientPhone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Servicio</label>
                      <select
                        required
                        value={newAppointmentForm.service}
                        onChange={(e) =>
                          setNewAppointmentForm({
                            ...newAppointmentForm,
                            service: e.target.value,
                          })
                        }
                      >
                        <option value="">Selecciona un servicio</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.title}>
                            {service.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Odontólogo/a</label>
                      <select
                        required
                        value={newAppointmentForm.specialist}
                        onChange={(e) =>
                          setNewAppointmentForm({
                            ...newAppointmentForm,
                            specialist: e.target.value,
                          })
                        }
                      >
                        <option value="">Selecciona un odontólogo</option>
                        {specialists.map((specialist) => (
                          <option key={specialist.id} value={specialist.name}>
                            {specialist.name} - {specialist.specialty}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha</label>
                      <input
                        type="date"
                        required
                        value={newAppointmentForm.date}
                        onChange={(e) =>
                          setNewAppointmentForm({
                            ...newAppointmentForm,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Hora</label>
                      <input
                        type="time"
                        required
                        value={newAppointmentForm.time}
                        onChange={(e) =>
                          setNewAppointmentForm({
                            ...newAppointmentForm,
                            time: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      Agendar Cita
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowNewAppointmentForm(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="appointments-list">
              <h3>Citas Agendadas</h3>
              {appointments.length === 0 ? (
                <p className="no-results">No hay citas agendadas</p>
              ) : (
                <div className="appointments-grid">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className={`appointment-card apt-${appointment.status}`}>
                      <div className="apt-header">
                        <h4>{appointment.id}</h4>
                        <span className={`apt-badge apt-${appointment.status}`}>
                          {appointment.status === 'confirmed' ? '✓ Confirmada' : appointment.status === 'pending' ? '⏳ Pendiente' : '✕ Cancelada'}
                        </span>
                      </div>
                      <div className="apt-details">
                        <p><strong>{appointment.patientName}</strong></p>
                        <p>📧 {appointment.patientEmail}</p>
                        <p>📱 {appointment.patientPhone}</p>
                        <p>🏥 {appointment.service}</p>
                        <p>👨‍⚕️ {appointment.specialist}</p>
                        <p>📅 {appointment.date} - {appointment.time}</p>
                      </div>
                      <div className="apt-actions">
                        {appointment.status !== 'confirmed' && appointment.status !== 'cancelled' && (
                          <button
                            className="btn-small btn-success"
                            onClick={() => handleConfirmAppointment(appointment.id)}
                          >
                            ✓ Confirmar
                          </button>
                        )}
                        {appointment.status !== 'cancelled' && (
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            ✕ Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="available-dentists">
              <h3>Odontólogos Disponibles</h3>
              <div className="dentists-grid">
                {specialists.map((specialist) => (
                  <div key={specialist.id} className="dentist-card">
                    <div className="dentist-header">
                      <h4>{specialist.name}</h4>
                      <span className="specialty-badge">{specialist.specialty}</span>
                    </div>
                    <div className="dentist-info">
                      <p>📍 {specialist.location}</p>
                      <p>⏱️ {specialist.experience}</p>
                      <p>🗓️ {specialist.availability}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'laboratory' && (
          <section className="laboratory-section">
            <div className="section-header">
              <h2>Procesos del Laboratorio Odontológico</h2>
            </div>

            <div className="laboratory-grid">
              {laboratoryData.map((process) => (
                <div
                  key={process.id}
                  className={`lab-process-card ${selectedLaboratoryWork?.id === process.id ? 'expanded' : ''}`}
                  onClick={() =>
                    setSelectedLaboratoryWork(
                      selectedLaboratoryWork?.id === process.id ? null : process,
                    )
                  }
                >
                  <div className="lab-header">
                    <h3>{process.title}</h3>
                    <span className="lab-time">⏱️ {process.duration}</span>
                  </div>
                  <p className="lab-description">{process.description}</p>
                  <button className="expand-btn">
                    {selectedLaboratoryWork?.id === process.id ? '▲ Menos' : '▼ Ver pasos'}
                  </button>

                  {selectedLaboratoryWork?.id === process.id && (
                    <div className="lab-steps">
                      <h4>Pasos del proceso:</h4>
                      <ol className="steps-list">
                        {process.steps.map((step, index) => (
                          <li key={index} className="step-item">
                            <div className="step-number">{index + 1}</div>
                            <div className="step-content">
                              <strong>{step.title}</strong>
                              <p>{step.description}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </AppLayout>
  )
}

export default SecretaryDashboard
