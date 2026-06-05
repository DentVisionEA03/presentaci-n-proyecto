import { useEffect, useState } from 'react'
import { getAppointments, updateAppointmentStatus } from '../services/appointmentService'

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

const formatDate = (date) => {
  if (!date) return ''

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function UserAppointmentsPanel({ refreshKey = 0, userId }) {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState('')

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true)
      setError('')

      try {
        const savedAppointments = await getAppointments(userId)
        setAppointments(savedAppointments)
      } catch (loadError) {
        setError(loadError.message || 'No pudimos cargar tus citas.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAppointments()
  }, [refreshKey, userId])

  const handleCancel = async (appointmentId) => {
    setCancellingId(appointmentId)
    setError('')

    try {
      const updatedAppointment = await updateAppointmentStatus(appointmentId, 'cancelled', userId)
      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, ...updatedAppointment }
            : appointment,
        ),
      )
    } catch (cancelError) {
      setError(cancelError.message || 'No pudimos cancelar la cita.')
    } finally {
      setCancellingId('')
    }
  }

  return (
    <section className="appointments-panel" aria-labelledby="appointments-panel-title">
      <div className="appointments-panel-header">
        <div>
          <span className="section-kicker">Mi panel</span>
          <h2 id="appointments-panel-title">Tus citas agendadas</h2>
        </div>
        <span className="appointments-count">{appointments.length} citas</span>
      </div>

      {isLoading && <p className="appointments-state">Cargando citas...</p>}

      {!isLoading && error && (
        <div className="appointment-error" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && appointments.length === 0 && (
        <div className="appointments-empty">
          <h3>Aun no tienes citas</h3>
          <p>Cuando reserves una cita, aparecera aqui con su fecha, hora y estado.</p>
        </div>
      )}

      {!isLoading && appointments.length > 0 && (
        <div className="appointments-list">
          {appointments.map((appointment) => {
            return (
              <article className="appointment-card" key={appointment.id}>
                <div className="appointment-card-main">
                  <span className={`appointment-status status-${appointment.status}`}>
                    {statusLabels[appointment.status] || appointment.status}
                  </span>
                  <h3>{appointment.appointment.service}</h3>
                  <p>{appointment.appointment.specialist}</p>
                </div>

                <div className="appointment-card-details">
                  <span>{formatDate(appointment.appointment.date)}</span>
                  <strong>{appointment.appointment.time}</strong>
                </div>

                <div className="appointment-card-patient">
                  <span>{appointment.patient.fullName}</span>
                  <small>{appointment.patient.phone}</small>
                </div>

                <button
                  className="appointment-cancel"
                  disabled={cancellingId === appointment.id || appointment.status === 'cancelled'}
                  onClick={() => handleCancel(appointment.id)}
                  type="button"
                >
                  {appointment.status === 'cancelled'
                    ? 'Cancelada'
                    : cancellingId === appointment.id
                      ? 'Cancelando...'
                      : 'Cancelar'}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default UserAppointmentsPanel
