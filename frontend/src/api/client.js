import axios from 'axios'

// In dev: Vite proxy maps /api → localhost:8080/Saarthi/api
// In production on Tomcat ROOT: override via VITE_API_BASE env var
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 6000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('saarthi_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => {
    // When deployed on SPA hosts like Vercel, requests to unhandled /api endpoints
    // return HTTP 200 with index.html. Detect this and reject so fallbacks trigger.
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype html') ||
        response.data.trim().startsWith('<html') ||
        response.data.includes('<div id="root">'))
    ) {
      const err = new Error('Backend API returned HTML instead of JSON')
      err.isHtmlRewrite = true
      return Promise.reject(err)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('saarthi_token')
      localStorage.removeItem('saarthi_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default client
