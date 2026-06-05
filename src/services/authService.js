import apiClient from './apiClient'

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

const wait = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })

const dentistAccounts = {
  'laura@dentvision.com': {
    name: 'Dra. Laura Medina',
    specialist: 'Dra. Laura Medina - Odontologia general',
    specialty: 'Odontologia general',
  },
  'carlos@dentvision.com': {
    name: 'Dr. Carlos Rojas',
    specialist: 'Dr. Carlos Rojas - Ortodoncia',
    specialty: 'Ortodoncia',
  },
  'andres@dentvision.com': {
    name: 'Dr. Andres Quintero',
    specialist: 'Dr. Andres Quintero - Estetica dental',
    specialty: 'Estetica dental',
  },
  'odontologo@dentvision.com': {
    name: 'Dra. Laura Medina',
    specialist: 'Dra. Laura Medina - Odontologia general',
    specialty: 'Odontologia general',
  },
}

const secretaryAccounts = {
  'secretaria@dentvision.com': {
    name: 'María García',
  },
}

export const loginUser = async ({ email, password }) => {
  if (useMockApi) {
    await wait(600)

    const normalizedEmail = email.trim().toLowerCase()
    const isAdmin = normalizedEmail === 'admin@dentvision.com'
    const dentistAccount = dentistAccounts[normalizedEmail]
    const secretaryAccount = secretaryAccounts[normalizedEmail]

    return {
      token: `fake-jwt-${Date.now()}`,
      expiresIn: 60 * 60 * 4,
      user: {
        id: normalizedEmail,
        name: dentistAccount?.name || secretaryAccount?.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: isAdmin ? 'admin' : dentistAccount ? 'dentist' : secretaryAccount ? 'secretary' : 'user',
        specialist: dentistAccount?.specialist,
        specialty: dentistAccount?.specialty,
      },
    }
  }

  return apiClient.post('/auth/login', { email, password })
}

export const registerUser = async ({ name, email, password }) => {
  if (useMockApi) {
    await wait(600)

    return {
      id: crypto.randomUUID(),
      name,
      email,
    }
  }

  return apiClient.post('/auth/register', { name, email, password })
}

export const recoverPassword = async ({ email }) => {
  if (useMockApi) {
    await wait(600)

    return {
      message: `Enviamos instrucciones a ${email}.`,
    }
  }

  return apiClient.post('/auth/recover-password', { email })
}
