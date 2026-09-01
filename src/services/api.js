import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Public API instance ───────────────────────────────────────────────────────
const api = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
})

// ── Admin API instance ────────────────────────────────────────────────────────
export const adminApi = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every admin request
adminApi.interceptors.request.use((config) => {
      const token = localStorage.getItem('admin_token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
})

// On 401 → clear token + redirect to admin login
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

// ── Category ↔ Type mapping ───────────────────────────────────────────────────
// Frontend uses GOVERNMENT_JOB etc.; backend uses GOVERNMENT etc.
export const CATEGORY_TO_TYPE = {
      GOVERNMENT_JOB: 'GOVERNMENT',
      PRIVATE_JOB: 'PRIVATE',
      INTERNSHIP: 'INTERNSHIP',
      TIME_TABLE: 'TIME_TABLE',
      RESULT: 'RESULT',
      ADMIT_CARD: 'ADMIT_CARD',
}

export const TYPE_TO_CATEGORY = Object.fromEntries(
      Object.entries(CATEGORY_TO_TYPE).map(([k, v]) => [v, k])
)

// ── Status mapping ────────────────────────────────────────────────────────────
// Frontend: DRAFT | PUBLISHED | ARCHIVED
// Backend:  DRAFT | PUBLISHED | UNPUBLISHED | EXPIRED
export const statusToBackend = (s) => {
      if (s === 'ARCHIVED') return 'UNPUBLISHED'
      return s || 'DRAFT'
}
export const statusToFrontend = (s) => {
      if (s === 'UNPUBLISHED' || s === 'EXPIRED') return 'ARCHIVED'
      return s || 'DRAFT'
}

// ── Normalise a backend job to the shape the frontend expects ─────────────────
export const normaliseJob = (job) => {
      if (!job) return null
      return {
            // Identity
            id: job.id,
            slug: job.id,   // use id as slug since backend has no slug field
            // Display fields
            title: job.title,
            category: TYPE_TO_CATEGORY[job.type] || job.type,
            organization: job.organization,
            department: job.department || '',
            location: job.location || '',
            qualification: job.qualification || '',
            ageLimit: job.ageLimit || '',
            salary: job.salary || '',
            vacancies: job.vacancies || '',
            description: job.description || '',
            selectionProcess: job.selectionProcess || '',
            officialWebsite: job.officialWebsite || '',
            applyLink: job.applyLink || '',
            // Dates
            applicationStartDate: job.applicationStart || '',
            lastDate: job.lastDate ? job.lastDate.slice(0, 10) : '',
            examDate: job.examDate ? job.examDate.slice(0, 10) : '',
            // Status
            status: statusToFrontend(job.status),
            // Meta
            isFeatured: job.isFeatured || false,
            views: job.views || 0,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            publishedAt: job.publishedAt,
      }
}

// ── Build backend payload from frontend form data ────────────────────────────
export const buildJobPayload = (formData, category, status) => {
      const type = CATEGORY_TO_TYPE[category] || category
      // Merge extra fields not in schema into description
      const extraFields = []
      if (formData.skills) extraFields.push(`Skills: ${formData.skills}`)
      if (formData.jobType) extraFields.push(`Job Type: ${formData.jobType}`)
      if (formData.workMode) extraFields.push(`Work Mode: ${formData.workMode}`)
      if (formData.experience) extraFields.push(`Experience: ${formData.experience}`)
      if (formData.stipend) extraFields.push(`Stipend: ${formData.stipend}`)
      if (formData.duration) extraFields.push(`Duration: ${formData.duration}`)
      if (formData.eligibility) extraFields.push(`Eligibility: ${formData.eligibility}`)
      if (formData.course) extraFields.push(`Course: ${formData.course}`)
      if (formData.semester) extraFields.push(`Semester: ${formData.semester}`)
      if (formData.subject) extraFields.push(`Subject: ${formData.subject}`)
      if (formData.examName) extraFields.push(`Exam Name: ${formData.examName}`)
      if (formData.startTime) extraFields.push(`Start Time: ${formData.startTime}`)
      if (formData.endTime) extraFields.push(`End Time: ${formData.endTime}`)
      if (formData.resultDate) extraFields.push(`Result Date: ${formData.resultDate}`)
      if (formData.releaseDate) extraFields.push(`Release Date: ${formData.releaseDate}`)
      if (formData.resultLink) extraFields.push(`Result Link: ${formData.resultLink}`)
      if (formData.downloadLink) extraFields.push(`Download Link: ${formData.downloadLink}`)
      if (formData.notificationUrl) extraFields.push(`Notification URL: ${formData.notificationUrl}`)
      if (formData.logoUrl) extraFields.push(`Logo URL: ${formData.logoUrl}`)

      const baseDescription = formData.description || ''
      const fullDescription = extraFields.length > 0
            ? baseDescription
                  ? `${baseDescription}\n\n--- Additional Info ---\n${extraFields.join('\n')}`
                  : `--- Additional Info ---\n${extraFields.join('\n')}`
            : baseDescription

      return {
            title: formData.title,
            type,
            organization: formData.organization,
            department: formData.department || undefined,
            location: formData.location || '',
            qualification: formData.qualification || '',
            ageLimit: formData.ageLimit || undefined,
            salary: formData.salary || undefined,
            vacancies: formData.vacancies || undefined,
            selectionProcess: formData.selectionProcess || undefined,
            applicationStart: formData.applicationStartDate || undefined,
            lastDate: formData.lastDate || undefined,
            examDate: formData.examDate || undefined,
            description: fullDescription || undefined,
            officialWebsite: formData.officialWebsite || undefined,
            notificationPdf: formData.notificationUrl || undefined,
            applyLink: formData.applyLink || undefined,
            status: statusToBackend(status),
            isFeatured: formData.isFeatured || false,
      }
}

// ── Parse extra fields stored in description back to form fields ──────────────
export const parseJobToForm = (job) => {
      const base = normaliseJob(job)
      // Try to extract extra fields from description
      const extra = {}
      const desc = job.description || ''
      const marker = '--- Additional Info ---'
      const markerIdx = desc.indexOf(marker)

      let cleanDesc = desc
      if (markerIdx !== -1) {
            cleanDesc = desc.slice(0, markerIdx).trim()
            const extraSection = desc.slice(markerIdx + marker.length).trim()
            extraSection.split('\n').forEach((line) => {
                  const colonIdx = line.indexOf(':')
                  if (colonIdx === -1) return
                  const key = line.slice(0, colonIdx).trim()
                  const val = line.slice(colonIdx + 1).trim()
                  const fieldMap = {
                        'Skills': 'skills',
                        'Job Type': 'jobType',
                        'Work Mode': 'workMode',
                        'Experience': 'experience',
                        'Stipend': 'stipend',
                        'Duration': 'duration',
                        'Eligibility': 'eligibility',
                        'Course': 'course',
                        'Semester': 'semester',
                        'Subject': 'subject',
                        'Exam Name': 'examName',
                        'Start Time': 'startTime',
                        'End Time': 'endTime',
                        'Result Date': 'resultDate',
                        'Release Date': 'releaseDate',
                        'Result Link': 'resultLink',
                        'Download Link': 'downloadLink',
                        'Notification URL': 'notificationUrl',
                        'Logo URL': 'logoUrl',
                  }
                  if (fieldMap[key]) extra[fieldMap[key]] = val
            })
      }

      return {
            ...base,
            description: cleanDesc,
            applicationStartDate: job.applicationStart ? job.applicationStart.slice(0, 10) : '',
            lastDate: job.lastDate ? job.lastDate.slice(0, 10) : '',
            examDate: job.examDate ? job.examDate.slice(0, 10) : '',
            ...extra,
      }
}

// ── Public helpers ────────────────────────────────────────────────────────────
export const fetchPosts = (params = {}) =>
      api.get('/api/jobs', { params }).then((r) => r.data)

export const fetchPost = (id) =>
      api.get(`/api/jobs/${id}`).then((r) => r.data)

export const fetchPostsByType = (type, params = {}) =>
      api.get('/api/jobs', { params: { type, status: 'PUBLISHED', ...params } }).then((r) => r.data)

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
