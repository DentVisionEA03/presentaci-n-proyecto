import { useEffect, useMemo, useState } from 'react'
import AppLayout from './AppLayout'
import { useAuth } from './context/AuthContext'
import { getAllAppointments } from '../services/appointmentService'
import {
  formatDate,
  getAppointmentTimestamp,
  getTodayInputValue,
} from '../utils/dateFormatters'

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

function DentistDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue())
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true)
      setError('')

      try {
        const savedAppointments = await getAllAppointments()
        setAppointments(savedAppointments)
      } catch (loadError) {
        setError(loadError.message || 'No pudimos cargar tu agenda.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAppointments()
  }, [])

  const dentistAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.appointment.specialist === user?.specialist)
        .sort((first, second) => getAppointmentTimestamp(first) - getAppointmentTimestamp(second)),
    [appointments, user?.specialist],
  )

  const dayAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return dentistAppointments.filter((appointment) => {
      if (appointment.appointment.date !== selectedDate) return false
      if (!normalizedSearch) return true

      const searchableText = [
        appointment.patient.fullName,
        appointment.patient.documentId,
        appointment.patient.phone,
        appointment.patient.email,
        appointment.appointment.service,
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedSearch)
    })
  }, [dentistAppointments, searchTerm, selectedDate])

  const stats = useMemo(() => {
    const appointmentsForDay = dentistAppointments.filter(
      (appointment) => appointment.appointment.date === selectedDate,
    )

    return {
      totalPatients: new Set(dentistAppointments.map((appointment) => appointment.patient.documentId)).size,
      dayTotal: appointmentsForDay.length,
      pending: appointmentsForDay.filter((appointment) => appointment.status === 'pending').length,
      confirmed: appointmentsForDay.filter((appointment) => appointment.status === 'confirmed').length,
    }
  }, [dentistAppointments, selectedDate])

  return (
    <AppLayout>
      <main className="admin-page">
        <section className="admin-hero">
          <div>
            <span className="section-kicker">Odontologo</span>
            <h1>Agenda diaria</h1>
            <p>
              Consulta solamente los pacientes y citas asignadas a {user?.name}
              {user?.specialty ? `, ${user.specialty}.` : '.'}
            </p>
          </div>
        </section>

        <section className="admin-stats" aria-label="Resumen de agenda">
          <article>
            <span>Mis pacientes</span>
            <strong>{stats.totalPatients}</strong>
          </article>
          <article>
            <span>Citas del dia</span>
            <strong>{stats.dayTotal}</strong>
          </article>
          <article>
            <span>Pendientes</span>
            <strong>{stats.pending}</strong>
          </article>
          <article>
            <span>Confirmadas</span>
            <strong>{stats.confirmed}</strong>
          </article>
        </section>

        {isLoading && <p className="appointments-state">Cargando agenda...</p>}

        {!isLoading && error && (
          <div className="appointment-error" role="alert">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <section className="admin-workspace" aria-label="Agenda del odontologo">
            <div className="admin-controls dentist-controls">
              <label>
                Dia
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                />
              </label>

              <label>
                Buscar paciente
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Nombre, documento, telefono..."
                />
              </label>
            </div>

            {dayAppointments.length === 0 && (
              <div className="appointments-empty">
                <h3>No hay citas para {formatDate(selectedDate)}</h3>
                <p>Cuando tengas pacientes asignados en este dia, apareceran aqui.</p>
              </div>
            )}

            {dayAppointments.length > 0 && (
              <div className="admin-table dentist-table" aria-label="Citas del dia">
                <div className="admin-table-row admin-table-head">
                  <span>Hora</span>
                  <span>Paciente</span>
                  <span>Contacto</span>
                  <span>Servicio</span>
                  <span>Estado</span>
                </div>

                {dayAppointments.map((appointment) => (
                  <article className="admin-table-row" key={appointment.id}>
                    <div>
                      <strong>{appointment.appointment.time}</strong>
                      <small>{formatDate(appointment.appointment.date)}</small>
                    </div>
                    <div>
                      <strong>{appointment.patient.fullName}</strong>
                      <small>Documento: {appointment.patient.documentId}</small>
                    </div>
                    <div>
                      <strong>{appointment.patient.phone}</strong>
                      <small>{appointment.patient.email}</small>
                    </div>
                    <div>
                      <strong>{appointment.appointment.service}</strong>
                      <small>{appointment.appointment.notes || 'Sin observaciones'}</small>
                    </div>
                    <span className={`appointment-status status-${appointment.status}`}>
                      {statusLabels[appointment.status] || appointment.status}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </AppLayout>
  )
}

export default DentistDashboard
