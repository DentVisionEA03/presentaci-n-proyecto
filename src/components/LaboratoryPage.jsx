import { useEffect, useMemo, useState } from 'react'
import AppLayout from './AppLayout'
import { specialists } from '../data/clinicData'
import {
  dentalMaterials,
  laboratoryStatusLabels,
  laboratoryWorkTypes,
  toothShades,
} from '../data/laboratoryData'
import {
  createLaboratoryCase,
  deleteLaboratoryCase,
  getLaboratoryCases,
  updateLaboratoryCaseStatus,
} from '../services/laboratoryService'

const initialCaseForm = {
  patientName: '',
  patientDocument: '',
  doctor: '',
  workType: '',
  tooth: '',
  shade: '',
  material: '',
  requestedAt: new Date().toISOString().split('T')[0],
  estimatedDelivery: '',
  notes: '',
}

const statusOptions = {
  all: 'Todos',
  ...laboratoryStatusLabels,
}

const formatDate = (date) => {
  if (!date) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function LaboratoryPage() {
  const [cases, setCases] = useState([])
  const [form, setForm] = useState(initialCaseForm)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const loadCases = async () => {
      setIsLoading(true)
      setError('')

      try {
        const savedCases = await getLaboratoryCases()
        setCases(savedCases)
      } catch (loadError) {
        setError(loadError.message || 'No pudimos cargar los casos de laboratorio.')
      } finally {
        setIsLoading(false)
      }
    }

    loadCases()
  }, [])

  const stats = useMemo(() => {
    const ready = cases.filter((laboratoryCase) => laboratoryCase.status === 'ready').length
    const inProgress = cases.filter((laboratoryCase) =>
      ['design', 'manufacturing', 'quality'].includes(laboratoryCase.status),
    ).length
    const delayed = cases.filter(
      (laboratoryCase) =>
        laboratoryCase.status !== 'delivered' &&
        laboratoryCase.estimatedDelivery &&
        laboratoryCase.estimatedDelivery < new Date().toISOString().split('T')[0],
    ).length

    return {
      total: cases.length,
      inProgress,
      ready,
      delayed,
    }
  }, [cases])

  const visibleCases = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return cases
      .filter((laboratoryCase) => {
        const matchesStatus =
          statusFilter === 'all' || laboratoryCase.status === statusFilter

        if (!matchesStatus) return false
        if (!normalizedSearch) return true

        const searchableText = [
          laboratoryCase.patientName,
          laboratoryCase.patientDocument,
          laboratoryCase.doctor,
          laboratoryCase.workType,
          laboratoryCase.material,
          laboratoryCase.tooth,
          laboratoryCase.appointmentService,
        ]
          .join(' ')
          .toLowerCase()

        return searchableText.includes(normalizedSearch)
      })
      .sort((firstCase, secondCase) => {
        const firstDate = new Date(firstCase.estimatedDelivery || firstCase.createdAt || 0)
        const secondDate = new Date(secondCase.estimatedDelivery || secondCase.createdAt || 0)

        return firstDate - secondDate
      })
  }, [cases, searchTerm, statusFilter])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setSuccessMessage('')
  }

  const validate = () => {
    const nextErrors = {}

    if (form.patientName.trim().length < 3) nextErrors.patientName = 'Ingresa el paciente'
    if (!form.patientDocument.trim()) nextErrors.patientDocument = 'Ingresa el documento'
    if (!form.doctor) nextErrors.doctor = 'Selecciona el odontologo'
    if (!form.workType) nextErrors.workType = 'Selecciona el trabajo'
    if (!form.tooth.trim()) nextErrors.tooth = 'Indica la pieza o zona'
    if (!form.shade) nextErrors.shade = 'Selecciona el color'
    if (!form.material) nextErrors.material = 'Selecciona el material'
    if (!form.requestedAt) nextErrors.requestedAt = 'Selecciona fecha de solicitud'
    if (!form.estimatedDelivery) nextErrors.estimatedDelivery = 'Selecciona fecha de entrega'
    else if (form.requestedAt && form.estimatedDelivery < form.requestedAt) {
      nextErrors.estimatedDelivery = 'La entrega debe ser posterior a la solicitud'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    setError('')

    try {
      const createdCase = await createLaboratoryCase({
        patientName: form.patientName.trim(),
        patientDocument: form.patientDocument.trim(),
        doctor: form.doctor,
        workType: form.workType,
        tooth: form.tooth.trim(),
        shade: form.shade,
        material: form.material,
        requestedAt: form.requestedAt,
        estimatedDelivery: form.estimatedDelivery,
        notes: form.notes.trim(),
      })

      setCases((currentCases) => [createdCase, ...currentCases])
      setForm(initialCaseForm)
      setSuccessMessage('Caso de laboratorio registrado correctamente.')
    } catch (submitError) {
      setError(submitError.message || 'No pudimos registrar el caso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (laboratoryCase, status) => {
    setActiveId(laboratoryCase.id)
    setError('')

    try {
      const updatedCase = await updateLaboratoryCaseStatus(laboratoryCase.id, status)
      setCases((currentCases) =>
        currentCases.map((currentCase) =>
          currentCase.id === laboratoryCase.id ? { ...currentCase, ...updatedCase } : currentCase,
        ),
      )
    } catch (statusError) {
      setError(statusError.message || 'No pudimos actualizar el estado.')
    } finally {
      setActiveId('')
    }
  }

  const handleDelete = async (caseId) => {
    setActiveId(caseId)
    setError('')

    try {
      await deleteLaboratoryCase(caseId)
      setCases((currentCases) =>
        currentCases.filter((laboratoryCase) => laboratoryCase.id !== caseId),
      )
    } catch (deleteError) {
      setError(deleteError.message || 'No pudimos eliminar el caso.')
    } finally {
      setActiveId('')
    }
  }

  return (
    <AppLayout>
      <main className="laboratory-page">
        <section className="laboratory-hero">
          <div>
            <span className="section-kicker">Laboratorio odontologico</span>
            <h1>Gestion de trabajos dentales</h1>
            <p>
              Registra coronas, protesis, placas y otros casos; controla estados, materiales y
              fechas de entrega desde un solo panel.
            </p>
          </div>
        </section>

        <section className="admin-stats" aria-label="Resumen de laboratorio">
          <article>
            <span>Total</span>
            <strong>{stats.total}</strong>
          </article>
          <article>
            <span>En proceso</span>
            <strong>{stats.inProgress}</strong>
          </article>
          <article>
            <span>Listos</span>
            <strong>{stats.ready}</strong>
          </article>
          <article>
            <span>Retrasados</span>
            <strong>{stats.delayed}</strong>
          </article>
        </section>

        <section className="laboratory-layout">
          <form className="laboratory-form" onSubmit={handleSubmit} noValidate>
            <div className="appointment-form-header">
              <h3>Nuevo caso</h3>
              <p>Completa los datos clinicos y tecnicos del trabajo solicitado.</p>
            </div>

            <div className="appointment-grid">
              <label className="appointment-field">
                Paciente
                <input
                  className={errors.patientName ? 'field-error' : ''}
                  value={form.patientName}
                  onChange={(event) => updateField('patientName', event.target.value)}
                  placeholder="Ej: Maria Gomez"
                />
                {errors.patientName && <span>{errors.patientName}</span>}
              </label>

              <label className="appointment-field">
                Documento
                <input
                  className={errors.patientDocument ? 'field-error' : ''}
                  value={form.patientDocument}
                  onChange={(event) => updateField('patientDocument', event.target.value)}
                  placeholder="Ej: 1012345678"
                />
                {errors.patientDocument && <span>{errors.patientDocument}</span>}
              </label>

              <label className="appointment-field">
                Odontologo solicitante
                <select
                  className={errors.doctor ? 'field-error' : ''}
                  value={form.doctor}
                  onChange={(event) => updateField('doctor', event.target.value)}
                >
                  <option value="">Selecciona odontologo</option>
                  {specialists
                    .filter((specialist) => specialist.specialty !== 'Optometria')
                    .map((specialist) => (
                      <option key={specialist.id} value={specialist.name}>
                        {specialist.name}
                      </option>
                    ))}
                </select>
                {errors.doctor && <span>{errors.doctor}</span>}
              </label>

              <label className="appointment-field">
                Tipo de trabajo
                <select
                  className={errors.workType ? 'field-error' : ''}
                  value={form.workType}
                  onChange={(event) => updateField('workType', event.target.value)}
                >
                  <option value="">Selecciona trabajo</option>
                  {laboratoryWorkTypes.map((workType) => (
                    <option key={workType} value={workType}>
                      {workType}
                    </option>
                  ))}
                </select>
                {errors.workType && <span>{errors.workType}</span>}
              </label>

              <label className="appointment-field">
                Pieza o zona
                <input
                  className={errors.tooth ? 'field-error' : ''}
                  value={form.tooth}
                  onChange={(event) => updateField('tooth', event.target.value)}
                  placeholder="Ej: 11, 21 o superior"
                />
                {errors.tooth && <span>{errors.tooth}</span>}
              </label>

              <label className="appointment-field">
                Color
                <select
                  className={errors.shade ? 'field-error' : ''}
                  value={form.shade}
                  onChange={(event) => updateField('shade', event.target.value)}
                >
                  <option value="">Selecciona color</option>
                  {toothShades.map((shade) => (
                    <option key={shade} value={shade}>
                      {shade}
                    </option>
                  ))}
                </select>
                {errors.shade && <span>{errors.shade}</span>}
              </label>

              <label className="appointment-field">
                Material
                <select
                  className={errors.material ? 'field-error' : ''}
                  value={form.material}
                  onChange={(event) => updateField('material', event.target.value)}
                >
                  <option value="">Selecciona material</option>
                  {dentalMaterials.map((material) => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
                {errors.material && <span>{errors.material}</span>}
              </label>

              <label className="appointment-field">
                Solicitud
                <input
                  className={errors.requestedAt ? 'field-error' : ''}
                  type="date"
                  value={form.requestedAt}
                  onChange={(event) => updateField('requestedAt', event.target.value)}
                />
                {errors.requestedAt && <span>{errors.requestedAt}</span>}
              </label>

              <label className="appointment-field">
                Entrega estimada
                <input
                  className={errors.estimatedDelivery ? 'field-error' : ''}
                  type="date"
                  value={form.estimatedDelivery}
                  onChange={(event) => updateField('estimatedDelivery', event.target.value)}
                />
                {errors.estimatedDelivery && <span>{errors.estimatedDelivery}</span>}
              </label>
            </div>

            <label className="appointment-field appointment-notes">
              Observaciones tecnicas
              <textarea
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                placeholder="Ajustes, indicaciones de color, mordida, pruebas o notas del laboratorio"
                maxLength={220}
              />
              <small>{form.notes.length}/220 caracteres</small>
            </label>

            <button className="appointment-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar caso'}
            </button>

            {successMessage && (
              <div className="appointment-success" role="status">
                {successMessage}
              </div>
            )}
          </form>

          <section className="laboratory-board" aria-label="Listado de casos de laboratorio">
            <div className="admin-controls">
              <label>
                Buscar
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Paciente, trabajo, material..."
                />
              </label>

              <label>
                Estado
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  {Object.entries(statusOptions).map(([status, label]) => (
                    <option key={status} value={status}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {isLoading && <p className="appointments-state">Cargando casos...</p>}

            {!isLoading && error && (
              <div className="appointment-error" role="alert">
                {error}
              </div>
            )}

            {!isLoading && !error && visibleCases.length === 0 && (
              <div className="appointments-empty">
                <h3>No hay casos</h3>
                <p>Registra un caso o ajusta los filtros para ver resultados.</p>
              </div>
            )}

            {!isLoading && visibleCases.length > 0 && (
              <div className="laboratory-cases">
                {visibleCases.map((laboratoryCase) => {
                  const isDelayed =
                    laboratoryCase.status !== 'delivered' &&
                    laboratoryCase.estimatedDelivery &&
                    laboratoryCase.estimatedDelivery < new Date().toISOString().split('T')[0]

                  return (
                    <article className="laboratory-card" key={laboratoryCase.id}>
                      <div>
                        <span
                          className={`appointment-status lab-status-${laboratoryCase.status}`}
                        >
                          {laboratoryStatusLabels[laboratoryCase.status]}
                        </span>
                        <h3>{laboratoryCase.workType}</h3>
                        <p>{laboratoryCase.patientName}</p>
                      </div>

                      <dl className="laboratory-details">
                        <div>
                          <dt>Doctor</dt>
                          <dd>{laboratoryCase.doctor}</dd>
                        </div>
                        <div>
                          <dt>Pieza</dt>
                          <dd>{laboratoryCase.tooth}</dd>
                        </div>
                        <div>
                          <dt>Color / material</dt>
                          <dd>
                            {laboratoryCase.shade} - {laboratoryCase.material}
                          </dd>
                        </div>
                        <div>
                          <dt>Entrega</dt>
                          <dd className={isDelayed ? 'lab-delayed' : ''}>
                            {formatDate(laboratoryCase.estimatedDelivery)}
                          </dd>
                        </div>
                        {laboratoryCase.appointmentId && (
                          <div>
                            <dt>Cita asociada</dt>
                            <dd>
                              {laboratoryCase.appointmentService} -{' '}
                              {formatDate(laboratoryCase.appointmentDate)}{' '}
                              {laboratoryCase.appointmentTime}
                            </dd>
                          </div>
                        )}
                      </dl>

                      {laboratoryCase.notes && (
                        <p className="laboratory-notes">{laboratoryCase.notes}</p>
                      )}

                      <div className="laboratory-actions">
                        <select
                          value={laboratoryCase.status}
                          disabled={activeId === laboratoryCase.id}
                          onChange={(event) =>
                            handleStatusChange(laboratoryCase, event.target.value)
                          }
                        >
                          {Object.entries(laboratoryStatusLabels).map(([status, label]) => (
                            <option key={status} value={status}>
                              {label}
                            </option>
                          ))}
                        </select>

                        <button
                          className="admin-delete"
                          disabled={activeId === laboratoryCase.id}
                          onClick={() => handleDelete(laboratoryCase.id)}
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
        </section>
      </main>
    </AppLayout>
  )
}

export default LaboratoryPage
