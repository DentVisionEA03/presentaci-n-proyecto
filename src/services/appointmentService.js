import apiClient from './apiClient'

const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true'
const appointmentsStorageKey = 'dentvision-appointments'

const wait = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })

const getAppointmentsStorageKey = (userId) => {
  if (!userId) return appointmentsStorageKey

  return `${appointmentsStorageKey}-${userId}`
}

const readStoredAppointments = (userId) => {
  const savedAppointments = localStorage.getItem(getAppointmentsStorageKey(userId))

  if (!savedAppointments) return []

  try {
    return JSON.parse(savedAppointments)
  } catch {
    return []
  }
}

const saveStoredAppointments = (appointments, userId) => {
  localStorage.setItem(getAppointmentsStorageKey(userId), JSON.stringify(appointments))
}

const getAllAppointmentStorageKeys = () =>
  Object.keys(localStorage).filter((key) => key.startsWith(appointmentsStorageKey))

export const createAppointment = async (appointmentData, userId) => {
  if (useMockApi) {
    await wait(700)

    const createdAppointment = {
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...appointmentData,
    }

    const appointments = readStoredAppointments(userId)
    saveStoredAppointments([createdAppointment, ...appointments], userId)

    return createdAppointment
  }

  return apiClient.post('/appointments', appointmentData)
}

export const getAppointments = async (userId) => {
  if (useMockApi) {
    await wait(300)

    return readStoredAppointments(userId)
  }

  return apiClient.get('/appointments')
}

export const cancelAppointment = async (appointmentId, userId) => {
  if (useMockApi) {
    await wait(300)

    const appointments = readStoredAppointments(userId)
    const updatedAppointments = appointments.filter(
      (appointment) => appointment.id !== appointmentId,
    )

    saveStoredAppointments(updatedAppointments, userId)

    return { id: appointmentId }
  }

  return apiClient.delete(`/appointments/${appointmentId}`)
}

export const getAllAppointments = async () => {
  if (useMockApi) {
    await wait(300)

    return getAllAppointmentStorageKeys()
      .flatMap((storageKey) => {
        const userId =
          storageKey === appointmentsStorageKey
            ? undefined
            : storageKey.replace(`${appointmentsStorageKey}-`, '')

        try {
          const appointments = JSON.parse(localStorage.getItem(storageKey)) || []

          return appointments.map((appointment) => ({
            ...appointment,
            ownerId: userId,
            ownerLabel: userId || 'general',
          }))
        } catch {
          return []
        }
      })
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
  }

  return apiClient.get('/appointments/admin')
}

export const updateAppointmentStatus = async (appointmentId, status, userId) => {
  if (useMockApi) {
    await wait(300)

    const appointments = readStoredAppointments(userId)
    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === appointmentId ? { ...appointment, status } : appointment,
    )

    saveStoredAppointments(updatedAppointments, userId)

    return updatedAppointments.find((appointment) => appointment.id === appointmentId)
  }

  return apiClient.patch(`/appointments/${appointmentId}`, { status })
}
