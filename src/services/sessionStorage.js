const sessionKeys = ['token', 'user', 'remember', 'expiresAt']

const getPersistentValue = (key) => localStorage.getItem(key)
const getTemporaryValue = (key) => sessionStorage.getItem(key)

export const readSessionValue = (key) => getPersistentValue(key) || getTemporaryValue(key)

export const clearSession = () => {
  sessionKeys.forEach((key) => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
}

export const getSessionToken = () => readSessionValue('token')

export const isSessionExpired = () => {
  const expiresAt = Number(readSessionValue('expiresAt'))

  return Boolean(expiresAt && Date.now() > expiresAt)
}

export const saveSession = ({ token, user, expiresIn }, remember) => {
  clearSession()

  const storage = remember ? localStorage : sessionStorage
  const fallbackDuration = remember ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 4
  const duration = Number(expiresIn) ? Number(expiresIn) * 1000 : fallbackDuration

  storage.setItem('token', token)
  storage.setItem('user', JSON.stringify(user))
  storage.setItem('expiresAt', String(Date.now() + duration))

  if (remember) {
    localStorage.setItem('remember', 'true')
  }
}
