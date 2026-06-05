import { useEffect, useMemo, useState } from 'react'
import { services, specialists } from '../data/clinicData'
import { createAppointment, getAppointments } from '../services/appointmentService'
import { getTodayInputValue } from '../utils/dateFormatters'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[0-9\s()+-]{7,20}$/
const documentRegex = /^[0-9]{6,12}$/
const availableTimes = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00']

const initialForm = {
  fullName: '',
  documentId: '',
  phone: '',
  email: '',
  service: '',
  specialist: '',
  date: '',
  time: '',
  notes: '',
}

const getSpecialistValue = (specialist) => `${specialist.name} - ${specialist.specialty}`

const getServiceByTitle = (serviceTitle) =>
  services.find((service) => service.title === serviceTitle)

const isSunday = (date) => new Date(`${date}T00:00:00`).getDay() === 0

const getSpecialistsForService = (serviceTitle) => {
  const selectedService = getServiceByTitle(serviceTitle)

  if (!selectedService) return specialists
  if (selectedService.category === 'Integral') return specialists

  return specialists.filter(
    (specialist) =>
      specialist.specialty === selectedService.title ||
      (selectedService.category === 'Dental' && specialist.specialty !== 'Optometria') ||
      (selectedService.category === 'Visual' && specialist.specialty === 'Optometria'),
  )
}

function AppointmentForm({ onAppointmentCreated, userEmail, userId }) {
  const initialUserForm = useMemo(
    () => ({ ...initialForm, email: userEmail || '' }),
    [userEmail],
  )
  const [form, setForm] = useState(initialUserForm)
  const [errors, setErrors] = useState({})
  const [appointment, setAppointment] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [existingAppointments, setExistingAppointments] = useState([])
  const minDate = getTodayInputValue()
  const filteredSpecialists = useMemo(
    () => getSpecialistsForService(form.service),
    [form.service],
  )
  const occupiedTimes = useMemo(() => {
    if (!form.date || !form.specialist) return []

    return existingAppointments
      .filter(
        (savedAppointment) =>
          savedAppointment.status !== 'cancelled' &&
          savedAppointment.appointment.date === form.date &&
          savedAppointment.appointment.specialist === form.specialist,
      )
      .map((savedAppointment) => savedAppointment.appointment.time)
  }, [existingAppointments, form.date, form.specialist])
  const availableTimesForSelection = availableTimes.filter(
    (time) => !occupiedTimes.includes(time),
  )
  const selectedService = getServiceByTitle(form.service)

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const savedAppointments = await getAppointments(userId)
        setExistingAppointments(savedAppointments)
      } catch {
        setExistingAppointments([])
      }
    }

    loadAppointments()
  }, [userId])

  const updateField = (field, value) => {
    setForm((current) => {
      if (field === 'service') {
        return { ...current, service: value, specialist: '', time: '' }
      }

      if (field === 'specialist' || field === 'date') {
        return { ...current, [field]: value, time: '' }
      }

      return { ...current, [field]: value }
    })
    setErrors((current) => ({ ...current, [field]: '' }))
    setSubmitError('')
  }

  const validate = () => {
    const nextErrors = {}
    const cleanPhone = form.phone.trim()
    const cleanEmail = form.email.trim()
    const cleanDocument = form.documentId.trim()

    if (form.fullName.trim().length < 3) nextErrors.fullName = 'Ingresa nombre y apellido'
    if (!cleanDocument) nextErrors.documentId = 'Ingresa el documento'
    else if (!documentRegex.test(cleanDocument)) nextErrors.documentId = 'Usa entre 6 y 12 numeros'
    if (!cleanPhone) nextErrors.phone = 'Ingresa un telefono'
    else if (!phoneRegex.test(cleanPhone)) nextErrors.phone = 'Ingresa un telefono valido'
    if (!cleanEmail) nextErrors.email = 'Ingresa un correo'
    else if (!emailRegex.test(cleanEmail)) nextErrors.email = 'Ingresa un correo valido'
    if (!form.service) nextErrors.service = 'Selecciona un servicio'
    if (!form.specialist) nextErrors.specialist = 'Selecciona un especialista'
    if (!form.date) nextErrors.date = 'Selecciona una fecha'
    else if (form.date < minDate) nextErrors.date = 'Selecciona una fecha desde hoy'
    else if (isSunday(form.date)) nextErrors.date = 'Selecciona una fecha de lunes a sabado'
    if (!form.time) nextErrors.time = 'Selecciona una hora'
    else if (occupiedTimes.includes(form.time)) nextErrors.time = 'Esa hora ya esta ocupada'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError('')
    setAppointment(null)

    const payload = {
      patient: {
        fullName: form.fullName.trim(),
        documentId: form.documentId.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      },
      appointment: {
        service: form.service,
        specialist: form.specialist,
        date: form.date,
        time: form.time,
        notes: form.notes.trim(),
      },
    }

    try {
      const createdAppointment = await createAppointment(payload, userId)
      setAppointment(createdAppointment)
      setExistingAppointments((currentAppointments) => [
        createdAppointment,
        ...currentAppointments,
      ])
      onAppointmentCreated?.(createdAppointment)
      setForm(initialUserForm)
    } catch (error) {
      const message =
        error.message ||
        'No pudimos agendar la cita. Intenta nuevamente.'

      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="appointment-section appointment-hero" id="agenda">
      <div className="appointment-copy">
        <span className="section-kicker">Agenda de citas</span>
        <h2>Reserva tu atención dental o visual</h2>
        <p>
          Completa los datos del paciente, elige el servicio y selecciona la fecha que mejor se ajuste a tu disponibilidad.
        </p>
      </div>

      <form className="appointment-form" onSubmit={handleSubmit}>
        <div className="appointment-form-header">
          <h3>Datos de la reserva</h3>
          <p>Los campos marcados son necesarios para confirmar tu solicitud.</p>
        </div>

        <div className="appointment-grid">
          <label className="appointment-field">
            Nombre completo
            <input
              className={errors.fullName ? 'field-error' : ''}
              value={form.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              placeholder="Ej: Maria Gomez"
              autoComplete="name"
            />
            {errors.fullName && <span>{errors.fullName}</span>}
          </label>

          <label className="appointment-field">
            Documento
            <input
              className={errors.documentId ? 'field-error' : ''}
              inputMode="numeric"
              value={form.documentId}
              onChange={(event) => updateField('documentId', event.target.value)}
              placeholder="Ej: 1012345678"
            />
            {errors.documentId && <span>{errors.documentId}</span>}
          </label>

          <label className="appointment-field">
            Telefono
            <input
              className={errors.phone ? 'field-error' : ''}
              inputMode="tel"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="Ej: 300 123 4567"
              autoComplete="tel"
            />
            {errors.phone && <span>{errors.phone}</span>}
          </label>

          <label className="appointment-field">
            Correo
            <input
              className={errors.email ? 'field-error' : ''}
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
            {errors.email && <span>{errors.email}</span>}
          </label>

          <label className="appointment-field">
            Servicio
            <select
              className={errors.service ? 'field-error' : ''}
              value={form.service}
              onChange={(event) => updateField('service', event.target.value)}
            >
              <option value="">Selecciona un servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.title}>
                  {service.title}
                </option>
              ))}
            </select>
            {errors.service && <span>{errors.service}</span>}
          </label>

          <label className="appointment-field">
            Especialista
            <select
              className={errors.specialist ? 'field-error' : ''}
              value={form.specialist}
              disabled={!form.service}
              onChange={(event) => updateField('specialist', event.target.value)}
            >
              <option value="">
                {form.service ? 'Selecciona un especialista' : 'Elige primero un servicio'}
              </option>
              {filteredSpecialists.map((specialist) => (
                <option key={specialist.id} value={getSpecialistValue(specialist)}>
                  {specialist.name} - {specialist.specialty}
                </option>
              ))}
            </select>
            {errors.specialist && <span>{errors.specialist}</span>}
          </label>

          <label className="appointment-field">
            Fecha
            <input
              className={errors.date ? 'field-error' : ''}
              type="date"
              min={minDate}
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
            />
            {errors.date && <span>{errors.date}</span>}
          </label>

          <label className="appointment-field">
            Hora
            <select
              className={errors.time ? 'field-error' : ''}
              value={form.time}
              disabled={!form.specialist || !form.date}
              onChange={(event) => updateField('time', event.target.value)}
            >
              <option value="">
                {form.specialist && form.date ? 'Selecciona una hora' : 'Elige fecha y especialista'}
              </option>
              {availableTimesForSelection.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.time && <span>{errors.time}</span>}
            {!errors.time && form.specialist && form.date && availableTimesForSelection.length === 0 && (
              <span>No hay horarios disponibles para esta fecha</span>
            )}
          </label>
        </div>

        <label className="appointment-field appointment-notes">
          Observaciones
          <textarea
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Cuéntanos si tienes alguna recomendación o condición especial"
            maxLength={180}
          />
          <small>{form.notes.length}/180 caracteres</small>
        </label>

        {form.service && form.specialist && form.date && form.time && (
          <div className="appointment-summary" aria-live="polite">
            <strong>Resumen:</strong> {form.service} con {form.specialist}, el {form.date} a las{' '}
            {form.time}
            {selectedService?.duration ? ` (${selectedService.duration}).` : '.'}
          </div>
        )}

        <button className="appointment-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Agendando...' : 'Confirmar cita'}
        </button>

        {appointment && (
          <div className="appointment-success" role="status">
            Cita solicitada para {appointment.patient.fullName} el {appointment.appointment.date} a las {appointment.appointment.time}. Te contactaremos para confirmar.
          </div>
        )}

        {submitError && (
          <div className="appointment-error" role="alert">
            {submitError}
          </div>
        )}
      </form>
    </section>
  )
}

export default AppointmentForm
