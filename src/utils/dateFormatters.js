/**
 * Formatea una fecha al formato "DD MMM YYYY" en español colombiano
 * @param {string} date - Fecha en formato "YYYY-MM-DD"
 * @returns {string} Fecha formateada o string vacío si no hay fecha
 */
export const formatDate = (date) => {
  if (!date) return ''

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

/**
 * Obtiene el valor de hoy en formato YYYY-MM-DD para inputs date
 * @returns {string} Fecha de hoy en formato YYYY-MM-DD
 */
export const getTodayInputValue = () => new Date().toISOString().split('T')[0]

/**
 * Obtiene un timestamp Unix de una cita
 * @param {object} appointment - Objeto de cita con propiedades date y time
 * @returns {number} Timestamp en milisegundos
 */
export const getAppointmentTimestamp = (appointment) =>
  new Date(`${appointment.appointment.date}T${appointment.appointment.time || '00:00'}`).getTime()

/**
 * Obtiene la fecha de entrega estimada (7 días desde hoy)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const getDefaultDeliveryDate = () => {
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 7)
  return deliveryDate.toISOString().split('T')[0]
}

/**
 * Extrae el nombre del doctor de la cadena "nombre - especialidad"
 * @param {object} appointment - Objeto de cita
 * @returns {string} Nombre del especialista
 */
export const getDoctorFromAppointment = (appointment) =>
  appointment.appointment.specialist?.split(' - ')[0] || appointment.appointment.specialist || ''
