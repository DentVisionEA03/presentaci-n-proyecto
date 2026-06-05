import axios from 'axios'

const axiosClient = axios.create({
  baseURL: 'https://backend-dentvision-project.onrender.com',
})
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}` // TODO: Implementar template literals
  }
  return config
})

export default axiosClient