import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Public API instance ───────────────────────────────────────────────────────
const api = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
})

// ── Admin API instance (sends auth cookie automatically) ─────────────────────
export const adminApi = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
})

// Attach access token from localStorage to every admin request
adminApi.interceptors.request.use((config) => {
      const token = localStorage.getItem('admin_token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
})

// On 401 from admin API → redirect to /admin login
adminApi.interceptors.response.use(
      (res) => res,
      (err) => {
            if (err.response?.status === 401) {
                  localStorage.removeItem('admin_token')
                  window.location.href = '/admin'
            }
            return Promise.reject(err)
      }
)

// ── Public helpers ────────────────────────────────────────────────────────────

export const fetchPosts = (params = {}) =>
      api.get('/api/jobs', { params }).then((r) => r.data)

export const fetchPost = (id) =>
      api.get(`/api/jobs/${id}`).then((r) => r.data)

export const fetchPostsByType = (type, params = {}) =>
      api.get('/api/jobs', { params: { type, status: 'PUBLISHED', ...params } }).then((r) => r.data)

export const fetchResults = (params = {}) =>
      api.get('/api/results', { params }).then((r) => r.data)

export const fetchTimeTables = (params = {}) =>
      api.get('/api/timetable', { params }).then((r) => r.data)

export const fetchInternships = (params = {}) =>
      api.get('/api/internships', { params }).then((r) => r.data)

// ── Admin auth helpers ────────────────────────────────────────────────────────

export const adminLogin = (email, password) =>
      api.post('/api/auth/admin/login', { email, password }).then((r) => r.data)

export const adminLogout = () =>
      api.post('/api/auth/logout').then((r) => r.data)

export const getMe = () =>
      adminApi.get('/api/auth/me').then((r) => r.data)

// ── Admin CRUD helpers ────────────────────────────────────────────────────────

export const adminGetPosts = (params = {}) =>
      adminApi.get('/api/jobs', { params }).then((r) => r.data)

export const adminGetPost = (id) =>
      adminApi.get(`/api/jobs/${id}`).then((r) => r.data)

export const adminCreatePost = (data) =>
      adminApi.post('/api/jobs', data).then((r) => r.data)

export const adminUpdatePost = (id, data) =>
      adminApi.put(`/api/jobs/${id}`, data).then((r) => r.data)

export const adminDeletePost = (id) =>
      adminApi.delete(`/api/jobs/${id}`).then((r) => r.data)

export const adminGetStats = () =>
      adminApi.get('/api/admin/stats').then((r) => r.data)

export default api
