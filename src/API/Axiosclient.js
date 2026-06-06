import axios from 'axios'
import { API_URL } from '../services/apiClient'

const axiosClient = axios.create({
  baseURL: API_URL,
})
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosClient