/**
 * Axiosclient.js — Cliente Axios (disponible para componentes existentes)
 * La URL base se lee de VITE_API_URL en .env.local
 * Para nuevos servicios usa preferiblemente src/services/apiClient.js
 */
import axios from 'axios'
import { clearSession } from '../services/sessionStorage'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Adjunta el JWT en cada petición
axiosClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Maneja 401/403 globalmente
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearSession()
      window.location.href = '/'
    }
    return Promise.reject(error)
  },
)

export default axiosClient
