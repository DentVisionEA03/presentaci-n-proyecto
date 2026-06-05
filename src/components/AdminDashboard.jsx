import { useEffect, useMemo, useState } from 'react'
import AppLayout from './AppLayout'
import {
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} from '../services/appointmentService'
import {
  dentalMaterials,
  toothShades,
  laboratoryWorkTypes,
} from '../data/laboratoryData'
import {
  createLaboratoryCase,
  getLaboratoryCases,
} from '../services/laboratoryService'
import {
  formatDate,
  getAppointmentTimestamp,
  getTodayInputValue,
  getDefaultDeliveryDate,
  getDoctorFromAppointment,
} from '../utils/dateFormatters'

const statusLabels = {
  all: 'Todos',
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

const sortOptions = {
  newest: 'Más recientes',
  oldest: 'Más antiguas',
  dateAsc: 'Fecha próxima',
  dateDesc: 'Fecha lejana',
}

const getInitialLabForm = (appointment) => ({
  workType: '',
  tooth: '',
  shade: '',
  material: '',
  requestedAt: getTodayInputValue(),
  estimatedDelivery: getDefaultDeliveryDate(),
  notes: appointment
    ? `Solicitud asociada a cita de ${appointment.appointment.service} del ${appointment.appointment.date}.`
    : '',
})

function AdminDashboard() {
  const [appointments, setAppointments] = useState([])
  const [laboratoryCases, setLaboratoryCases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeId, setActiveId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [labCandidate, setLabCandidate] = useState(null)
  const [labForm, setLabForm] = useState(getInitialLabForm())
  const [labErrors, setLabErrors] = useState({})
  const [isCreatingLabCase, setIsCreatingLabCase] = useState(false)

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [savedAppointments, savedLaboratoryCases] = await Promise.all([
          getAllAppointments(),
          getLaboratoryCases(),
        ])
        setAppointments(savedAppointments)
        setLaboratoryCases(savedLaboratoryCases)
      } catch (loadError) {
        setError(loadError.message || 'No pudimos cargar las citas.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAppointments()
  }, [])

  const stats = useMemo(() => {
    const pending = appointments.filter((appointment) => appointment.status === 'pending').length
    const confirmed = appointments.filter((appointment) => appointment.status === 'confirmed').length
    const cancelled = appointments.filter((appointment) => appointment.status === 'cancelled').length

    return {
      total: appointments.length,
      pending,
      confirmed,
      cancelled,
    }
  }, [appointments])

  const visibleAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return appointments
      .filter((appointment) => {
        const matchesStatus =
          statusFilter === 'all' || appointment.status === statusFilter

        if (!matchesStatus) return false
        if (!normalizedSearch) return true

        const searchableText = [
          appointment.patient.fullName,
          appointment.patient.phone,
          appointment.patient.email,
          appointment.appointment.service,
          appointment.appointment.specialist,
          appointment.ownerLabel,
        ]
          .join(' ')
          .toLowerCase()

        return searchableText.includes(normalizedSearch)
      })
      .sort((firstAppointment, secondAppointment) => {
        if (sortBy === 'oldest') {
          return (
            new Date(firstAppointment.createdAt || 0) -
            new Date(secondAppointment.createdAt || 0)
          )
        }

        if (sortBy === 'dateAsc') {
          return getAppointmentTimestamp(firstAppointment) - getAppointmentTimestamp(secondAppointment)
        }

        if (sortBy === 'dateDesc') {
          return getAppointmentTimestamp(secondAppointment) - getAppointmentTimestamp(firstAppointment)
        }

        return (
          new Date(secondAppointment.createdAt || 0) -
          new Date(firstAppointment.createdAt || 0)
        )
      })
  }, [appointments, searchTerm, sortBy, statusFilter])

  const confirmAppointment = async (appointment) => {
    setActiveId(appointment.id)
    setError('')

    try {
      const updatedAppointment = await updateAppointmentStatus(
        appointment.id,
        'confirmed',
        appointment.ownerId,
      )

      setAppointments((currentAppointments) =>
        currentAppointments.map((currentAppointment) =>
          currentAppointment.id === appointment.id
            ? {
                ...currentAppointment,
                ...updatedAppointment,
                ownerId: currentAppointment.ownerId,
                ownerLabel: currentAppointment.ownerLabel,
              }
            : currentAppointment,
        ),
      )
    } catch (confirmError) {
      setError(confirmError.message || 'No pudimos confirmar la cita.')
    } finally {
      setActiveId('')
    }
  }

  const deleteAppointment = async () => {
    if (!deleteCandidate) return

    const appointment = deleteCandidate
    setActiveId(appointment.id)
    setError('')

    try {
      await cancelAppointment(appointment.id, appointment.ownerId)
      setAppointments((currentAppointments) =>
        currentAppointments.filter((currentAppointment) => currentAppointment.id !== appointment.id),
      )
    } catch (deleteError) {
      setError(deleteError.message || 'No pudimos eliminar la cita.')
    } finally {
      setActiveId('')
      setDeleteCandidate(null)
    }
  }

  const updateLabField = (field, value) => {
    setLabForm((currentForm) => ({ ...currentForm, [field]: value }))
    setLabErrors((currentErrors) => ({ ...currentErrors, [field]: '' }))
  }

  const openLabCaseModal = (appointment) => {
    setLabCandidate(appointment)
    setLabForm(getInitialLabForm(appointment))
    setLabErrors({})
    setError('')
  }

  const validateLabCase = () => {
    const nextErrors = {}

    if (!labForm.workType) nextErrors.workType = 'Selecciona el trabajo'
    if (!labForm.tooth.trim()) nextErrors.tooth = 'Indica la pieza o zona'
    if (!labForm.shade) nextErrors.shade = 'Selecciona el color'
    if (!labForm.material) nextErrors.material = 'Selecciona el material'
    if (!labForm.estimatedDelivery) nextErrors.estimatedDelivery = 'Selecciona fecha de entrega'
    else if (labForm.estimatedDelivery < labForm.requestedAt) {
      nextErrors.estimatedDelivery = 'La entrega debe ser posterior a la solicitud'
    }

    setLabErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const createCaseFromAppointment = async (event) => {
    event.preventDefault()

    if (!labCandidate || !validateLabCase()) return

    setIsCreatingLabCase(true)
    setError('')

    try {
      const createdCase = await createLaboratoryCase({
        patientName: labCandidate.patient.fullName,
        patientDocument: labCandidate.patient.documentId,
        doctor: getDoctorFromAppointment(labCandidate),
        workType: labForm.workType,
        tooth: labForm.tooth.trim(),
        shade: labForm.shade,
        material: labForm.material,
        requestedAt: labForm.requestedAt,
        estimatedDelivery: labForm.estimatedDelivery,
        notes: labForm.notes.trim(),
        appointmentId: labCandidate.id,
        appointmentOwnerId: labCandidate.ownerId,
        appointmentService: labCandidate.appointment.service,
        appointmentDate: labCandidate.appointment.date,
        appointmentTime: labCandidate.appointment.time,
      })

      setLaboratoryCases((currentCases) => [createdCase, ...currentCases])
      setLabCandidate(null)
    } catch (labError) {
      setError(labError.message || 'No pudimos crear el caso de laboratorio.')
    } finally {
      setIsCreatingLabCase(false)
    }
  }

  return (
    <AppLayout>
      <main className="admin-page">
        <section className="admin-hero">
          <div>
            <span className="section-kicker">Administrador</span>
            <h1>Panel de citas</h1>
            <p>Revisa las solicitudes de los usuarios y confirma las reservas pendientes.</p>
          </div>
        </section>

        <section className="admin-stats" aria-label="Resumen de citas">
          <article>
            <span>Total</span>
            <strong>{stats.total}</strong>
          </article>
          <article>
            <span>Pendientes</span>
            <strong>{stats.pending}</strong>
          </article>
          <article>
            <span>Confirmadas</span>
            <strong>{stats.confirmed}</strong>
          </article>
          <article>
            <span>Canceladas</span>
            <strong>{stats.cancelled}</strong>
          </article>
        </section>

        {isLoading && <p className="appointments-state">Cargando citas...</p>}

        {!isLoading && error && (
          <div className="appointment-error" role="alert">
            {error}
          </div>
        )}

        {!isLoading && appointments.length === 0 && !error && (
          <div className="appointments-empty">
            <h3>No hay citas registradas</h3>
            <p>Cuando los usuarios agenden citas, apareceran en este panel.</p>
          </div>
        )}

        {!isLoading && appointments.length > 0 && (
          <section className="admin-workspace" aria-label="Gestion de citas">
            <div className="admin-controls">
              <label>
                Buscar
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Paciente, servicio, telefono..."
                />
              </label>

              <label>
                Estado
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <option key={status} value={status}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Orden
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  {Object.entries(sortOptions).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {visibleAppointments.length === 0 && (
              <div className="appointments-empty">
                <h3>No hay resultados</h3>
                <p>Ajusta la busqueda o cambia el filtro para ver mas citas.</p>
              </div>
            )}

            {visibleAppointments.length > 0 && (
              <div className="admin-table" aria-label="Listado de citas">
            <div className="admin-table-row admin-table-head">
              <span>Paciente</span>
              <span>Servicio</span>
              <span>Fecha</span>
              <span>Usuario</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            {visibleAppointments.map((appointment) => {
              const linkedLabCase = laboratoryCases.find(
                (laboratoryCase) => laboratoryCase.appointmentId === appointment.id,
              )

              return (
              <article className="admin-table-row" key={appointment.id}>
                <div>
                  <strong>{appointment.patient.fullName}</strong>
                  <small>{appointment.patient.phone}</small>
                </div>
                <div>
                  <strong>{appointment.appointment.service}</strong>
                  <small>{appointment.appointment.specialist}</small>
                </div>
                <div>
                  <strong>{formatDate(appointment.appointment.date)}</strong>
                  <small>{appointment.appointment.time}</small>
                </div>
                <span>{appointment.ownerLabel}</span>
                <span className={`appointment-status status-${appointment.status}`}>
                  {statusLabels[appointment.status] || appointment.status}
                </span>
                <div className="admin-actions">
                  {appointment.status === 'pending' && (
                    <button
                      className="admin-confirm"
                      disabled={activeId === appointment.id}
                      onClick={() => confirmAppointment(appointment)}
                      type="button"
                    >
                      Confirmar
                    </button>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      className="admin-lab"
                      disabled={Boolean(linkedLabCase)}
                      onClick={() => openLabCaseModal(appointment)}
                      type="button"
                    >
                      {linkedLabCase ? 'Con laboratorio' : 'Crear lab'}
                    </button>
                  )}
                  <button
                    className="admin-delete"
                    disabled={activeId === appointment.id}
                    onClick={() => setDeleteCandidate(appointment)}
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
              )
            })}
              </div>
            )}
          </section>
        )}

        {deleteCandidate && (
          <div className="admin-modal-backdrop" role="presentation">
            <div
              className="admin-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-appointment-title"
            >
              <h2 id="delete-appointment-title">Eliminar cita</h2>
              <p>
                Esta accion eliminara la cita de {deleteCandidate.patient.fullName} para{' '}
                {deleteCandidate.appointment.service}.
              </p>
              <div className="admin-modal-actions">
                <button
                  className="admin-confirm"
                  onClick={() => setDeleteCandidate(null)}
                  type="button"
                >
                  Conservar
                </button>
                <button
                  className="admin-delete"
                  disabled={activeId === deleteCandidate.id}
                  onClick={deleteAppointment}
                  type="button"
                >
                  {activeId === deleteCandidate.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {labCandidate && (
          <div className="admin-modal-backdrop" role="presentation">
            <form
              className="admin-modal admin-lab-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-lab-case-title"
              onSubmit={createCaseFromAppointment}
            >
              <h2 id="create-lab-case-title">Crear caso de laboratorio</h2>
              <p>
                {labCandidate.patient.fullName} - {labCandidate.appointment.service} del{' '}
                {formatDate(labCandidate.appointment.date)}.
              </p>

              <div className="admin-lab-grid">
                <label className="appointment-field">
                  Tipo de trabajo
                  <select
                    className={labErrors.workType ? 'field-error' : ''}
                    value={labForm.workType}
                    onChange={(event) => updateLabField('workType', event.target.value)}
                  >
                    <option value="">Selecciona trabajo</option>
                    {laboratoryWorkTypes.map((workType) => (
                      <option key={workType} value={workType}>
                        {workType}
                      </option>
                    ))}
                  </select>
                  {labErrors.workType && <span>{labErrors.workType}</span>}
                </label>

                <label className="appointment-field">
                  Pieza o zona
                  <input
                    className={labErrors.tooth ? 'field-error' : ''}
                    value={labForm.tooth}
                    onChange={(event) => updateLabField('tooth', event.target.value)}
                    placeholder="Ej: 11, 21 o superior"
                  />
                  {labErrors.tooth && <span>{labErrors.tooth}</span>}
                </label>

                <label className="appointment-field">
                  Color
                  <select
                    className={labErrors.shade ? 'field-error' : ''}
                    value={labForm.shade}
                    onChange={(event) => updateLabField('shade', event.target.value)}
                  >
                    <option value="">Selecciona color</option>
                    {toothShades.map((shade) => (
                      <option key={shade} value={shade}>
                        {shade}
                      </option>
                    ))}
                  </select>
                  {labErrors.shade && <span>{labErrors.shade}</span>}
                </label>

                <label className="appointment-field">
                  Material
                  <select
                    className={labErrors.material ? 'field-error' : ''}
                    value={labForm.material}
                    onChange={(event) => updateLabField('material', event.target.value)}
                  >
                    <option value="">Selecciona material</option>
                    {dentalMaterials.map((material) => (
                      <option key={material} value={material}>
                        {material}
                      </option>
                    ))}
                  </select>
                  {labErrors.material && <span>{labErrors.material}</span>}
                </label>

                <label className="appointment-field">
                  Entrega estimada
                  <input
                    className={labErrors.estimatedDelivery ? 'field-error' : ''}
                    type="date"
                    value={labForm.estimatedDelivery}
                    onChange={(event) => updateLabField('estimatedDelivery', event.target.value)}
                  />
                  {labErrors.estimatedDelivery && <span>{labErrors.estimatedDelivery}</span>}
                </label>
              </div>

              <label className="appointment-field appointment-notes">
                Observaciones
                <textarea
                  value={labForm.notes}
                  onChange={(event) => updateLabField('notes', event.target.value)}
                  maxLength={220}
                />
                <small>{labForm.notes.length}/220 caracteres</small>
              </label>

              <div className="admin-modal-actions">
                <button
                  className="admin-confirm"
                  onClick={() => setLabCandidate(null)}
                  type="button"
                >
                  Cancelar
                </button>
                <button className="admin-lab" disabled={isCreatingLabCase} type="submit">
                  {isCreatingLabCase ? 'Creando...' : 'Crear caso'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </AppLayout>
  )
}

export default AdminDashboard
