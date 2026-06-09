import { useEffect, useMemo, useState } from 'react'
import { services, specialists } from '../data/clinicData'
import { createAppointment, getAppointments } from '../services/appointmentService'
import { getTodayInputValue } from '../utils/dateFormatters'
import {useAuth} from "./context/AuthContext.jsx";


const getSpecialistValue = (specialist) => `${specialist.name} - ${specialist.specialty}`

const getServiceByTitle = (serviceTitle) =>
  services.find((service) => service.title === serviceTitle)
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

// Generate time slots similar to Salud Total
const generateTimeSlots = () => {
  const slots = []
  for (let h = 6; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      slots.push(`${hh}:${mm}`)
    }
  }
  return slots
}
const ALL_TIMES = generateTimeSlots()

// Simulate available slots for a date/specialist
const getAvailableSlots = (date, specialist, existingAppointments) => {
  if (!date || !specialist) return []
  const occupied = existingAppointments
      .filter(
          (a) =>
              a.status !== 'cancelled' &&
              a.appointment.date === date &&
              a.appointment.specialist === specialist,
      )
      .map((a) => a.appointment.time)
  // Simulate ~70% availability
  return ALL_TIMES.filter((t, i) => !occupied.includes(t) && i % 3 !== 2).slice(0, 8)
}

// Calendar helpers
const DAYS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO']
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday = 0
}

// Fake family group from user
const buildFamilyMembers = (user) => [
  { id: user?.id || '1', name: user?.name || 'Mi nombre', role: 'PACIENTE', active: true },
]

function AppointmentForm({ onAppointmentCreated, userId }) {
  const { user } = useAuth()
  const familyMembers = useMemo(() => buildFamilyMembers(user), [user])
  const [selectedMember, setSelectedMember] = useState(familyMembers[0])

  // Calendar state
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

  // Appointment type
  const [service, setService] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [existingAppointments, setExistingAppointments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appointment, setAppointment] = useState(null)
  const [submitError, setSubmitError] = useState('')

  // Derived
  getTodayInputValue();
  const filteredSpecialists = useMemo(() => getSpecialistsForService(service), [service])

  useEffect(() => {
    getAppointments(userId).then(setExistingAppointments).catch(() => {})
  }, [userId])

  useEffect(() => {
    if (selectedDate) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvailableSlots(getAvailableSlots(dateStr, service, existingAppointments))
    }
  }, [selectedDate, calMonth, calYear, service, existingAppointments])

  const selectedDateStr = selectedDate
      ? `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
      : null

  // Calendar navigation
  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
    setSelectedDate(null)
  }
  const goToday = () => {
    setCalYear(today.getFullYear())
    setCalMonth(today.getMonth())
    setSelectedDate(today.getDate())
  }

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)
  const isToday = (d) => d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()
  const isPast = (d) => {
    const dt = new Date(calYear, calMonth, d)
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return dt < t
  }
  const isSundayDay = (d) => new Date(calYear, calMonth, d).getDay() === 0

  const handleBookSlot = async (time) => {
    if (!service || !selectedDateStr) return
    setIsSubmitting(true)
    setSubmitError('')
    const payload = {
      patient: {
        fullName: selectedMember.name,
        documentId: selectedMember.id,
        phone: user?.phone || '',
        email: user?.email || '',
      },
      appointment: {
        service,
        specialist: filteredSpecialists[0] ? getSpecialistValue(filteredSpecialists[0]) : 'MEDICINA GENERAL',
        date: selectedDateStr,
        time,
        notes: '',
      },
    }
    try {
      const created = await createAppointment(payload, userId)
      setAppointment({ ...created, time })
      onAppointmentCreated?.(created)
    } catch (e) {
      setSubmitError(e.message || 'No se pudo agendar. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Day of week label
  const getDayName = (dateStr) => {
    const days = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO']
    return days[new Date(`${dateStr}T00:00:00`).getDay()]
  }

  const selectedDayNum = selectedDate
  const selectedDayName = selectedDateStr ? getDayName(selectedDateStr) : null

  return (
      <section style={s.page}>

        {/* Family group */}
        <div style={s.familySection}>
          <div style={s.familyHeader}>
            <span style={s.familyTitle}>Grupo Familiar</span>
            <span style={s.familyCount}>( {familyMembers.length} INTEGRANTES )</span>
          </div>
          <div style={s.familyGrid}>
            {familyMembers.map((m) => (
                <div
                    key={m.id}
                    style={{
                      ...s.memberCard,
                      ...(selectedMember.id === m.id ? s.memberCardActive : {}),
                    }}
                    onClick={() => setSelectedMember(m)}
                >
                  <div style={{ ...s.memberDot, background: m.active ? '#22c55e' : '#ef4444' }} />
                  <div style={s.memberName}>{m.name}</div>
                  <div style={s.memberDoc}>CEDULA DE CIUDADANIA {m.id}</div>
                  <div style={s.memberRole}>{m.role}</div>
                </div>
            ))}
          </div>
        </div>


        {/* Title */}
        <h2 style={s.pageTitle}>Asignar cita</h2>
        {/* Service selector */}
        <div style={s.serviceRow}>
          <label style={s.label}>
            Tipo de especialidad
            <select style={s.select} value={service} onChange={(e) => { setService(e.target.value); setSelectedDate(null) }}>
              <option value="">ESPECIALIDAD</option>
              {services.map((sv) => (
                  <option key={sv.id} value={sv.title}>{sv.title.toUpperCase()}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Calendar + day card */}
        <div style={s.calRow}>
          {/* Day card */}
          <div style={s.dayCard}>
            {selectedDayNum ? (
                <>
                  <div style={s.dayNum}>{selectedDayNum}</div>
                  <div style={s.dayName}>{selectedDayName}</div>
                  <div style={s.dayInfo}>
                    IPS asignada es VSPEDROHER.<br />
                    Por favor elija una de las siguientes citas disponibles.
                  </div>
                </>
            ) : (
                <>
                  <div style={s.dayNum}>—</div>
                  <div style={s.dayName}>Selecciona</div>
                  <div style={s.dayInfo}>Elige una fecha en el calendario</div>
                </>
            )}
          </div>

          {/* Calendar */}
          <div style={s.calendar}>
            {/* Year nav */}
            <div style={s.yearNav}>
              {[calYear - 1, calYear].map((y) => (
                  <button key={y} style={{ ...s.yearBtn, ...(y === calYear ? s.yearBtnActive : {}) }}
                          onClick={() => { setCalYear(y); setSelectedDate(null) }}>{y}</button>
              ))}
            </div>
            {/* Month rows */}
            <div style={s.monthNav}>
              {MONTHS.slice(0, 12).map((m, i) => (
                  <button key={m} style={{
                    ...s.monthBtn,
                    ...(i === calMonth && calYear === today.getFullYear() + (calYear > today.getFullYear() ? 1 : 0) ? {} : {}),
                    ...(i === calMonth ? s.monthBtnSelected : {}),
                  }}
                          onClick={() => { setCalMonth(i); setSelectedDate(null) }}>
                    {m.substring(0, 3)}.
                  </button>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={s.calGrid}>
              {/* Header row */}
              <div style={s.calHeader}>
                <button style={s.navArrow} onClick={prevMonth}>‹</button>
                <span style={s.calMonthLabel}>{MONTHS[calMonth]} {calYear}</span>
                <button style={s.navArrow} onClick={nextMonth}>›</button>
                <button style={s.todayBtn} onClick={goToday}>Hoy</button>
              </div>
              {/* Day names */}
              <div style={s.dayNamesRow}>
                {DAYS.map((d) => <span key={d} style={s.dayLabel}>{d}</span>)}
              </div>
              {/* Days */}
              <div style={s.daysGrid}>
                {Array.from({ length: firstDay }).map((_, i) => (
                    <span key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                  const disabled = isPast(d) || isSundayDay(d)
                  const active = d === selectedDate
                  const todayDay = isToday(d)
                  return (
                      <button
                          key={d}
                          disabled={disabled}
                          style={{
                            ...s.dayBtn,
                            ...(disabled ? s.dayBtnDisabled : {}),
                            ...(active ? s.dayBtnActive : {}),
                            ...(todayDay && !active ? s.dayBtnToday : {}),
                          }}
                          onClick={() => !disabled && setSelectedDate(d)}
                      >
                        {d}
                      </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Available appointments table */}
        {selectedDateStr && (
            <div style={s.slotsSection}>
              <button style={s.consultBtn}>CONSULTAR</button>
              {availableSlots.length === 0 ? (
                  <p style={s.noSlots}>No hay citas disponibles para esta fecha. Por favor selecciona otro día.</p>
              ) : (
                  <>
                    <p style={s.slotsTitle}>
                      Te mostramos las citas que están disponibles, selecciona la mejor opción y da clic en el botón "Agendar"
                    </p>
                    <div style={s.tableWrap}>
                      <table style={s.table}>
                        <thead>
                        <tr>
                          <th style={s.th}></th>
                          <th style={s.th}>MÉDICO</th>
                          <th style={s.th}>FECHA</th>
                          <th style={s.th}>HORA</th>
                          <th style={s.th}>IPS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {availableSlots.map((time) => {
                          const dateObj = new Date(`${selectedDateStr}T00:00:00`)
                          const dayNames = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
                          const dayName = dayNames[dateObj.getDay()]
                          const dateFormatted = `${dayName}, ${dateObj.getDate()} de ${MONTHS[dateObj.getMonth()]} de ${dateObj.getFullYear()}`
                          const [h, m] = time.split(':').map(Number)
                          const ampm = h < 12 ? 'am' : 'pm'
                          const displayH = h % 12 || 12
                          const timeFormatted = `${displayH}:${String(m).padStart(2,'0')} ${ampm}`

                          return (
                              <tr key={time} style={s.tr}>
                                <td style={s.td}>
                                  <button
                                      style={s.agendarBtn}
                                      onClick={() => handleBookSlot(time)}
                                      disabled={isSubmitting}
                                  >
                                    {isSubmitting ? '...' : 'Agendar'}
                                  </button>
                                </td>
                                <td style={s.td}>
                            <span style={s.specialtyLabel}>
                              {service || 'MEDICINA GENERAL'}
                            </span>
                                </td>
                                <td style={s.td}>{dateFormatted}</td>
                                <td style={s.td}>{timeFormatted}</td>
                                <td style={s.tdIps}>
                                  <strong>VS PEDRO DE HEREDIA</strong><br />
                                  <small>AV PEDRO DE HEREDIA LOS ALPES 3 # 54 - 183</small>
                                </td>
                              </tr>
                          )
                        })}
                        </tbody>
                      </table>
                    </div>
                  </>
              )}
            </div>
        )}

        {/* Success message */}
        {appointment && (
            <div style={s.successBox}>
              ✅ Cita agendada exitosamente para <strong>{selectedMember.name}</strong> el{' '}
              <strong>{appointment.appointment?.date}</strong> a las <strong>{appointment.time}</strong>.
              Te contactaremos para confirmar.
            </div>
        )}
        {submitError && (
            <div style={s.errorBox}>{submitError}</div>
        )}
      </section>
  )
}

const BLUE = '#003f7f'
const TEAL = '#00a8b5'

const s = {
  page: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 20px 80px',
    fontFamily: 'system-ui, sans-serif',
  },
  pageTitle: {
    textAlign: 'center',
    color: TEAL,
    fontStyle: 'italic',
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: 32,
  },
  familySection: { marginBottom: 32 },
  familyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  familyTitle: { fontWeight: 700, color: BLUE, fontSize: '1rem' },
  familyCount: { color: '#555', fontSize: '0.9rem' },
  familyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
  memberCard: {
    border: '1.5px solid #dde3ed',
    borderRadius: 12,
    padding: '18px 20px',
    cursor: 'pointer',
    position: 'relative',
    background: '#fff',
    transition: 'border-color 0.15s',
  },
  memberCardActive: {
    background: BLUE,
    borderColor: BLUE,
    color: '#fff',
  },
  memberDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    marginBottom: 10,
  },
  memberName: { fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 },
  memberDoc: { fontSize: '0.75rem', opacity: 0.75, marginBottom: 6 },
  memberRole: { fontSize: '0.78rem', fontWeight: 700, color: TEAL, letterSpacing: 0.4 },
  serviceRow: { marginBottom: 32 },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontWeight: 600,
    color: '#333',
    fontSize: '0.9rem',
  },
  select: {
    padding: '12px 16px',
    border: '1.5px solid #ccd6e0',
    borderRadius: 8,
    fontSize: '0.95rem',
    color: '#333',
    maxWidth: 500,
    background: '#fff',
    cursor: 'pointer',
  },
  calRow: {
    display: 'flex',
    gap: 24,
    alignItems: 'flex-start',
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  dayCard: {
    width: 200,
    minWidth: 180,
    background: BLUE,
    color: '#fff',
    borderRadius: 12,
    padding: '28px 20px',
    textAlign: 'center',
    flexShrink: 0,
  },
  dayNum: {
    fontSize: '5rem',
    fontWeight: 900,
    lineHeight: 1,
    marginBottom: 4,
  },
  dayName: {
    color: TEAL,
    fontWeight: 700,
    fontSize: '1.1rem',
    letterSpacing: 1,
    marginBottom: 16,
  },
  dayInfo: { fontSize: '0.78rem', opacity: 0.85, lineHeight: 1.5, fontStyle: 'italic' },
  calendar: {
    flex: 1,
    minWidth: 320,
    background: '#fff',
    borderRadius: 12,
    border: '1.5px solid #dde3ed',
    padding: '20px',
    display: 'flex',
    gap: 16,
  },
  yearNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    paddingRight: 12,
    borderRight: '1px solid #e5e7eb',
  },
  yearBtn: {
    padding: '4px 8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: '#9ca3af',
    borderRadius: 6,
    fontWeight: 600,
  },
  yearBtnActive: { color: '#333' },
  monthNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    paddingRight: 12,
    borderRight: '1px solid #e5e7eb',
  },
  monthBtn: {
    padding: '3px 8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.82rem',
    color: '#9ca3af',
    borderRadius: 6,
    fontWeight: 500,
    textAlign: 'left',
  },
  monthBtnSelected: { color: '#374151', fontWeight: 700 },
  calGrid: { flex: 1 },
  calHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  calMonthLabel: { flex: 1, fontWeight: 700, color: '#374151', fontSize: '0.9rem' },
  navArrow: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '1.2rem',
    color: '#6b7280',
    padding: '2px 6px',
  },
  todayBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: TEAL,
    fontWeight: 700,
    fontSize: '0.82rem',
  },
  dayNamesRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 2,
    marginBottom: 6,
  },
  dayLabel: {
    textAlign: 'center',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#9ca3af',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 2,
  },
  dayBtn: {
    aspectRatio: '1',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: '50%',
    fontSize: '0.82rem',
    color: '#374151',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  dayBtnDisabled: { color: '#d1d5db', cursor: 'not-allowed' },
  dayBtnActive: {
    background: BLUE,
    color: '#fff',
    fontWeight: 700,
    borderRadius: '50%',
  },
  dayBtnToday: {
    border: `2px solid ${TEAL}`,
    color: TEAL,
    fontWeight: 700,
  },
  slotsSection: { marginTop: 8 },
  consultBtn: {
    display: 'block',
    margin: '0 auto 24px',
    padding: '13px 48px',
    background: BLUE,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    letterSpacing: 1,
  },
  slotsTitle: {
    textAlign: 'center',
    color: '#555',
    fontSize: '0.9rem',
    marginBottom: 16,
  },
  noSlots: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '24px 0',
  },
  tableWrap: { overflowX: 'auto' },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
  },
  th: {
    background: BLUE,
    color: '#fff',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 700,
    fontSize: '0.85rem',
    letterSpacing: 0.5,
  },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: {
    padding: '14px 16px',
    color: '#374151',
    fontSize: '0.88rem',
    verticalAlign: 'middle',
  },
  tdIps: {
    padding: '14px 16px',
    color: '#374151',
    fontSize: '0.82rem',
    verticalAlign: 'middle',
    lineHeight: 1.5,
  },
  agendarBtn: {
    padding: '9px 20px',
    background: BLUE,
    color: '#fff',
    border: 'none',
    borderRadius: 20,
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  specialtyLabel: {
    color: '#6b7280',
    fontSize: '0.85rem',
  },
  successBox: {
    marginTop: 24,
    padding: '16px 20px',
    background: '#d1fae5',
    border: '1px solid #6ee7b7',
    borderRadius: 10,
    color: '#065f46',
    fontSize: '0.95rem',
  },
  errorBox: {
    marginTop: 16,
    padding: '14px 20px',
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: 10,
    color: '#991b1b',
    fontSize: '0.92rem',
  },
}

export default AppointmentForm

